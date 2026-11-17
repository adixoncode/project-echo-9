import {clamp,lookAngles,viewMatrix,perspective,multiply,VIEWS,sampleFlight,constrainPosition,WORLD_SEED} from './math.js';
import {buildScene} from './scene.js';
import {buildCorridor,CORRIDOR_HERO} from './corridor.js';
import {CorridorRenderer} from './corridor-renderer.js';
import {SKY_SHADER,MESH_SHADER,DUST_SHADER} from './shaders.js';

const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search),testMode=params.has('test'),debug=params.get('debug'),readbackMode=params.has('readback');
const PRESETS={High:{scale:1,samples:4,dust:850,effects:1},Medium:{scale:1,samples:1,dust:500,effects:1},Low:{scale:.7,samples:1,dust:180,effects:0}};
let quality=Object.keys(PRESETS).find(x=>x.toLowerCase()===(params.get('quality')||'high').toLowerCase())||'High';
const canvas=$('world'),errorBox=$('error'),menu=$('menu'),keys=new Set();
const camera={position:new Float32Array(VIEWS[0].position),yaw:0,pitch:0};
const projection=new Float32Array(16),view=new Float32Array(16),vp=new Float32Array(16),uniform=new Float32Array(40);
const flightPosition=new Float32Array(3),flightTarget=new Float32Array(3),previousPosition=new Float32Array(3);
const frameSamples=new Float64Array(18000),gpuSamples=new Float64Array(2048);
let frameCount=0,gpuCount=0,lastFrame=0,sceneTime=0,fixedTime=testMode?12:null,flight=null,activeView=1,menuOpen=!testMode&&!params.has('clean');
document.body.classList.toggle('clean',params.has('clean'));
const gpuInstance=navigator.gpu;
let corridorScene,corridorRenderer,navigationObstacles;
let adapterReference,device,context,format,uniformBuffer,scene,meshBuffer,particleBuffer,bindGroup,skyPipeline,meshPipeline,dustPipeline;
let depthTexture,colorTexture,renderWidth=0,renderHeight=0,deviceInfo={},timestampSet,timestampResolve,timestampRead,timestampBusy=false,timingError=null;
let startupVerificationStarted=false,startupSubmissionVerified=false,routeCaption=false;
let animationFrame=0,ready=false,flightReport=null,showStats=false,lastHud=0,crashed=false;
let readbackContext,readbackTexture,readbackBuffer,readbackImage,readbackStride=0,readbackBusy=false,pendingResize=false,presentedFrames=0,presentedView=0;
const startedAt=performance.now();

function setMenu(open){menuOpen=open;menu.hidden=!open;document.body.classList.toggle('menu-open',open);if(open&&document.pointerLockElement)document.exitPointerLock();}
function setView(n){
  const index=clamp(Math.floor(Number(n)||1),1,6)-1,record=VIEWS[index];
  flight=null;routeCaption=false;activeView=index+1;camera.position.set(record.position);const angles=lookAngles(record.position,record.target);camera.yaw=angles[0];camera.pitch=angles[1];
  $('view-title').textContent=record.name;$('view-note').textContent=record.description;$('sector').textContent=record.sector;
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.view)===index+1);b.setAttribute('aria-pressed',String(Number(b.dataset.view)===index+1));});
  return getState();
}
function currentSector(){return camera.position[2]<23?'OBSERVATORY':camera.position[2]<72?'SERVICE SPINE':'HANGAR';}
function currentSectorCaption(){return camera.position[2]<23?'01 / KEPLER DECK':camera.position[2]<72?'02 / MAINTENANCE':'03 / DOCKING BAY';}
function setQuality(name){
  const key=Object.keys(PRESETS).find(x=>x.toLowerCase()===String(name).toLowerCase());if(!key)throw Error('Unknown quality preset');
  if(flight&&quality!==key)flight.configurationChanged=true;
  quality=key;document.querySelectorAll('[data-quality]').forEach(b=>{b.classList.toggle('selected',b.dataset.quality===quality);b.setAttribute('aria-pressed',String(b.dataset.quality===quality));});
  if(ready){createPipelines();corridorRenderer?.setSamples(PRESETS[quality].samples);resize();}return quality;
}
function getState(){return {ready:ready&&startupSubmissionVerified&&(!readbackMode||presentedFrames>0),position:Array.from(camera.position),yaw:camera.yaw,pitch:camera.pitch,sector:currentSector(),quality,renderSize:[renderWidth,renderHeight],hero:CORRIDOR_HERO,clean:params.has('clean'),view:activeView,presentedView,presentedFrames,presentationMode:readbackMode?'readback':'swapchain',menuOpen,audio:audio.enabled,pointerLocked:document.pointerLockElement===canvas,time:sceneTime,flight:flight?{elapsed:Math.min(60,(performance.now()-flight.start)/1000),duration:60}:null};}
function summarize(samples,count){
  if(!count)return {count:0,meanMs:null,p99Ms:null,maxMs:null};
  const sorted=Array.from(samples.subarray(0,count)).sort((a,b)=>a-b);let sum=0;for(const n of sorted)sum+=n;
  return {count,meanMs:sum/count,p99Ms:sorted[Math.max(0,Math.ceil(count*.99)-1)],maxMs:sorted[count-1]};
}
function getReport(){
  const cpu=flightReport?.frame||summarize(frameSamples,frameCount),gpu=flightReport?.gpu||summarize(gpuSamples,gpuCount);
  return {project:'PROJECT ECHO-9',seed:WORLD_SEED,status:'BLOCKED',reason:readbackMode?'CPU readback presentation is diagnostic only; hardware swapchain measurement is required.':deviceInfo.isFallbackAdapter?'Software adapter; a reference hardware GPU is required for the 60 FPS gate.':'Reference GPU has not been agreed; measurements are diagnostic until hardware is selected.',measurementStatus:flightReport?flightReport.status:frameCount?'IN_PROGRESS':'NOT_RUN',adapter:deviceInfo,browser:navigator.userAgent,resolution:[renderWidth,renderHeight],cssResolution:[innerWidth,innerHeight],devicePixelRatio:devicePixelRatio,quality,presentationMode:readbackMode?'readback':'swapchain',readbackOverhead:readbackMode?'GPU copy, async map, BGRA→RGBA conversion and 2D upload included in frame times':null,renderScale:PRESETS[quality].scale,msaa:PRESETS[quality].samples,triangles:scene?scene.triangles-scene.corridorDrawRange.vertexCount/3+(corridorScene?.triangles||0):0,vertices:scene?scene.vertices.length/12-scene.corridorDrawRange.vertexCount+(corridorScene?.vertices.length/12||0):0,legacyVertices:scene?.vertices.length/12||0,corridor:corridorRenderer?.report()||null,estimatedGpuBytes:scene?scene.vertices.byteLength+scene.dust.byteLength+160+(corridorRenderer?.report().estimatedGpuBytes||0)+renderWidth*renderHeight*4*(PRESETS[quality].samples+(PRESETS[quality].samples>1?PRESETS[quality].samples:0)+1)+(readbackMode?readbackStride*renderHeight:0):0,diagnosticCpuPixelBytes:readbackMode?renderWidth*renderHeight*4:0,frame:cpu,gpu:{...gpu,samplingEveryNthFrame:30,status:timingError?'BLOCKED':timestampSet?(gpuCount?'PASS':'PENDING'):'BLOCKED',reason:timestampSet?timingError:'timestamp-query not supported by the current adapter'},flythrough:flightReport||{durationSeconds:60,status:flight?'RUNNING':'NOT_RUN'},runtimeErrors:crashed?['Rendering stopped; see on-screen error']:[],elapsedSeconds:(performance.now()-startedAt)/1000};
}
function startFlythrough(){
  if(document.pointerLockElement)document.exitPointerLock();setMenu(false);frameCount=0;gpuCount=0;flightReport=null;fixedTime=null;sceneTime=0;flight={start:performance.now(),startQuality:quality,startWidth:renderWidth,startHeight:renderHeight,configurationChanged:false};lastFrame=0;activeView=0;routeCaption=true;
  sampleFlight(0,flightPosition,flightTarget);camera.position.set(flightPosition);const angles=lookAngles(flightPosition,flightTarget);camera.yaw=angles[0];camera.pitch=angles[1];
  document.querySelectorAll('[data-view]').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
  $('sector').textContent=currentSectorCaption();
  $('view-title').textContent='THE LONG WAY HOME';$('view-note').textContent='A deterministic sixty-second passage through ECHO-9.';return {durationSeconds:60,status:'RUNNING'};
}
function stopFlythrough(){flight=null;return getState();}
function finishFlight(){flightReport={status:flight.configurationChanged?'BLOCKED':'PASS',reason:flight.configurationChanged?'Quality or resolution changed during the route; rerun with a fixed configuration.':null,durationSeconds:60,wallClockSeconds:(performance.now()-flight.start)/1000,completedAt:new Date().toISOString(),quality:flight.startQuality,frame:summarize(frameSamples,frameCount),gpu:summarize(gpuSamples,gpuCount)};flight=null;fixedTime=60;$('view-title').textContent='TRANSMISSION COMPLETE';$('view-note').textContent='Sixty seconds in a station that has forgotten time.';}
function setTime(seconds){fixedTime=Number(seconds);sceneTime=fixedTime;return sceneTime;}
function fail(message){crashed=true;ready=false;errorBox.hidden=false;errorBox.querySelector('p').textContent=message;$('loading').hidden=true;console.error(message);}

const audio={enabled:false,context:null,gain:null,async toggle(){
  if(!this.context){
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return false;
    const ctx=this.context=new AudioContext();const gain=this.gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);
    for(const hz of [32.7,65.4,98.1]){const oscillator=ctx.createOscillator(),volume=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=hz;volume.gain.value=hz===32.7?.11:.025;oscillator.connect(volume).connect(gain);oscillator.start();}
    const buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);let state=17;for(let i=0;i<data.length;i++){state=(Math.imul(state,1664525)+1013904223)|0;data[i]=(state/2147483648)*.06;}
    const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=140;noise.connect(filter).connect(gain);noise.start();
  }
  await this.context.resume();this.enabled=!this.enabled;this.gain.gain.setTargetAtTime(this.enabled?.55:0,this.context.currentTime,.6);$('audio-toggle').textContent=this.enabled?'SOUND ON':'SOUND OFF';$('audio-toggle').setAttribute('aria-pressed',String(this.enabled));return this.enabled;
}};

let bindGroupLayout,passDescriptor,compilationChecks;
function createPipelines(){
  const samples=PRESETS[quality].samples;
  if(!bindGroupLayout)bindGroupLayout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:'read-only-storage'}}]});
  const layout=device.createPipelineLayout({bindGroupLayouts:[bindGroupLayout]});
  bindGroup=device.createBindGroup({layout:bindGroupLayout,entries:[{binding:0,resource:{buffer:uniformBuffer}},{binding:1,resource:{buffer:particleBuffer}}]});
  const sky=device.createShaderModule({label:'Procedural planetary atmosphere and rings',code:SKY_SHADER});
  const mesh=device.createShaderModule({label:'Station alloy and procedural lighting',code:MESH_SHADER});
  const dust=device.createShaderModule({label:'Seeded drifting dust',code:DUST_SHADER});
  compilationChecks=Promise.all([sky,mesh,dust].map(async module=>{
    const info=await module.getCompilationInfo();const errors=info.messages.filter(message=>message.type==='error');
    if(errors.length)throw Error(errors.map(error=>`WGSL line ${error.lineNum}: ${error.message}`).join('\n'));
  }));
  compilationChecks.catch(error=>fail(error.message));
  skyPipeline=device.createRenderPipeline({label:'Astronomical sky',layout,vertex:{module:sky,entryPoint:'skyVertex'},fragment:{module:sky,entryPoint:'skyFragment',targets:[{format}]},primitive:{topology:'triangle-list'},depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'always'},multisample:{count:samples}});
  meshPipeline=device.createRenderPipeline({label:'Station architecture',layout,vertex:{module:mesh,entryPoint:'meshVertex',buffers:[{arrayStride:48,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},{shaderLocation:2,offset:24,format:'float32x3'},{shaderLocation:3,offset:36,format:'float32x3'}]}]},fragment:{module:mesh,entryPoint:'meshFragment',targets:[{format}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'},multisample:{count:samples}});
  dustPipeline=device.createRenderPipeline({label:'Atmospheric particles',layout,vertex:{module:dust,entryPoint:'dustVertex'},fragment:{module:dust,entryPoint:'dustFragment',targets:[{format,blend:{color:{srcFactor:'src-alpha',dstFactor:'one-minus-src-alpha',operation:'add'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha',operation:'add'}}}]},primitive:{topology:'triangle-list'},depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'less'},multisample:{count:samples}});
}
function resize(){
  if(!device)return;
  if(readbackMode&&readbackBusy){pendingResize=true;return;}
  pendingResize=false;
  const scale=PRESETS[quality].scale,ratio=Math.min(devicePixelRatio||1,2);
  renderWidth=Math.max(1,Math.floor(innerWidth*ratio*scale));renderHeight=Math.max(1,Math.floor(innerHeight*ratio*scale));
  if(flight&&(renderWidth!==flight.startWidth||renderHeight!==flight.startHeight))flight.configurationChanged=true;
  canvas.width=renderWidth;canvas.height=renderHeight;
  depthTexture?.destroy();colorTexture?.destroy();
  depthTexture=device.createTexture({size:[renderWidth,renderHeight],format:'depth24plus',sampleCount:PRESETS[quality].samples,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
  corridorRenderer?.setDepth(depthTexture,PRESETS[quality].samples);
  colorTexture=PRESETS[quality].samples>1?device.createTexture({size:[renderWidth,renderHeight],format,sampleCount:PRESETS[quality].samples,usage:GPUTextureUsage.RENDER_ATTACHMENT}):null;
  passDescriptor={colorAttachments:[{view:null,resolveTarget:undefined,clearValue:{r:0,g:0,b:0,a:1},loadOp:'clear',storeOp:'store'}],depthStencilAttachment:{view:depthTexture.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'},timestampWrites:undefined};
  if(colorTexture)passDescriptor.colorAttachments[0].view=colorTexture.createView();
  if(readbackMode){
    readbackTexture?.destroy();readbackBuffer?.destroy();
    readbackStride=Math.ceil(renderWidth*4/256)*256;
    readbackTexture=device.createTexture({label:'Diagnostic offscreen presentation',size:[renderWidth,renderHeight],format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC});
    readbackBuffer=device.createBuffer({label:'Preallocated diagnostic pixel copy',size:readbackStride*renderHeight,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
    readbackImage=new ImageData(renderWidth,renderHeight);
  }
}
async function initialize(){
  try{
    if(!navigator.gpu)throw Error('WebGPU is unavailable. Open this offline file in a recent desktop Chrome or Edge with WebGPU enabled. A compatible GPU and a secure context are required.');
    const adapter=adapterReference=await gpuInstance.requestAdapter({powerPreference:'high-performance'});
    if(!adapter)throw Error('No WebGPU adapter was found. Check hardware acceleration in Chrome or Edge and your graphics driver, then reload.');
    const info=adapter.info||{};
    deviceInfo={vendor:info.vendor||'unreported',architecture:info.architecture||'unreported',device:info.device||'unreported',description:info.description||'unreported',isFallbackAdapter:info.isFallbackAdapter??adapter.isFallbackAdapter??/swiftshader|llvmpipe|software/i.test([info.architecture,info.description].join(' '))};
    const features=adapter.features.has('timestamp-query')?['timestamp-query']:[];
    device=await adapter.requestDevice({requiredFeatures:features});
    device.addEventListener('uncapturederror',event=>fail('WebGPU validation: '+event.error.message));
    device.lost.then(info=>{if(info.reason!=='destroyed')fail('The GPU device was lost: '+info.message+'. Reload to reconnect.');});
    if(readbackMode){
      // Diagnostic fallback for cloud browsers whose WebGPU shared-image swapchain is broken.
      // Rendering remains native WebGPU; only presentation uses an explicit CPU pixel copy.
      readbackContext=canvas.getContext('2d',{alpha:false});format='bgra8unorm';
    }else{
      context=canvas.getContext('webgpu');format=gpuInstance.getPreferredCanvasFormat();context.configure({device,format,alphaMode:'opaque',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC});
    }
    scene=buildScene();meshBuffer=device.createBuffer({label:'Seeded station geometry',size:scene.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(meshBuffer,0,scene.vertices);
    particleBuffer=device.createBuffer({label:'Preallocated dust field',size:scene.dust.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(particleBuffer,0,scene.dust);
    uniformBuffer=device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    if(features.length){
      timestampSet=device.createQuerySet({type:'timestamp',count:2});timestampResolve=device.createBuffer({size:16,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC});timestampRead=device.createBuffer({size:16,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
    }
    createPipelines();await compilationChecks;
    corridorScene=buildCorridor();navigationObstacles=scene.obstacles.concat(corridorScene.obstacles);
    corridorRenderer=new CorridorRenderer(device,format,uniformBuffer,corridorScene,{shadows:params.get('shadows')!=='0',probe:params.get('probe')!=='0'});
    await corridorRenderer.initialize(PRESETS[quality].samples);
    resize();await corridorRenderer.atmosphereCheck;setView(params.get('view')||1);setQuality(quality);setMenu(menuOpen);
    ready=true;$('loading').hidden=true;document.body.classList.add('ready');
    if(params.has('flythrough'))startFlythrough();requestAnimationFrame(render);
  }catch(error){fail(error.message);}
}
function updateCamera(delta,now){
  if(flight){
    const seconds=Math.min(60,(now-flight.start)/1000);sampleFlight(seconds,flightPosition,flightTarget);camera.position.set(flightPosition);const dx=flightTarget[0]-flightPosition[0],dy=flightTarget[1]-flightPosition[1],dz=flightTarget[2]-flightPosition[2];camera.yaw=Math.atan2(dx,-dz);camera.pitch=-Math.atan2(dy,Math.hypot(dx,dz));sceneTime=seconds;
    if(seconds>=60)finishFlight();return;
  }
  if(fixedTime===null)sceneTime+=delta;else sceneTime=fixedTime;
  if(menuOpen)return;
  let x=0,z=0,y=0;if(keys.has('KeyW'))z++;if(keys.has('KeyS'))z--;if(keys.has('KeyA'))x--;if(keys.has('KeyD'))x++;if(keys.has('KeyQ'))y--;if(keys.has('KeyE'))y++;
  const length=Math.hypot(x,z)||1,speed=delta*(keys.has('ShiftLeft')||keys.has('ShiftRight')?14:5),sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw);
  previousPosition.set(camera.position);
  camera.position[0]+=(x/length*cy+z/length*sy)*speed;camera.position[2]+=(x/length*sy-z/length*cy)*speed;camera.position[1]+=y*speed;
  constrainPosition(camera.position,navigationObstacles,previousPosition);
}
function updateUniforms(){
  const yaw=camera.yaw,pitch=camera.pitch,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  viewMatrix(view,camera.position,yaw,pitch);perspective(projection,Math.PI*64/180,renderWidth/renderHeight,.12,700);multiply(vp,projection,view);uniform.set(vp,0);
  uniform[16]=camera.position[0];uniform[17]=camera.position[1];uniform[18]=camera.position[2];uniform[19]=sceneTime;
  uniform[20]=cy;uniform[21]=0;uniform[22]=sy;uniform[23]=0;
  uniform[24]=sy*sp;uniform[25]=cp;uniform[26]=-cy*sp;uniform[27]=0;
  uniform[28]=sy*cp;uniform[29]=-sp;uniform[30]=-cy*cp;uniform[31]=0;
  uniform[32]=renderWidth;uniform[33]=renderHeight;uniform[34]=renderWidth/renderHeight*Math.tan(Math.PI*32/180);uniform[35]=Math.tan(Math.PI*32/180);
  uniform[36]=PRESETS[quality].effects;uniform[37]=sceneTime;uniform[38]=quality==='High'?2:quality==='Medium'?1:0;uniform[39]=debug==='normals'?1:debug==='solid'?2:0;
  device.queue.writeBuffer(uniformBuffer,0,uniform);
}
function updateHud(now){
  if(now-lastHud<350)return;lastHud=now;
  $('coordinates').textContent=`${camera.position[0].toFixed(1)} / ${camera.position[1].toFixed(1)} / ${camera.position[2].toFixed(1)} M`;
  $('quality-label').textContent=quality.toUpperCase();$('location-label').textContent=currentSector();
  if(routeCaption)$('sector').textContent=currentSectorCaption();
  if(showStats){const r=getReport();$('stats').textContent=`${quality} · ${renderWidth}×${renderHeight} · ${scene.triangles.toLocaleString()} triangles\nFrame mean ${r.frame.meanMs?.toFixed(2)||'—'} ms · p99 ${r.frame.p99Ms?.toFixed(2)||'—'} ms\nGPU ${r.gpu.meanMs?.toFixed(2)||'—'} ms · ${deviceInfo.architecture}\n${deviceInfo.isFallbackAdapter?'SOFTWARE DIAGNOSTIC — hardware gate BLOCKED':'REFERENCE GPU NOT SELECTED — gate BLOCKED'}${flight?'\nFLIGHT '+Math.min(60,(now-flight.start)/1000).toFixed(1)+' / 60.0 s':''}`;}
}
function readGpuTiming(){
  timestampRead.mapAsync(GPUMapMode.READ).then(()=>{
    const values=new BigUint64Array(timestampRead.getMappedRange());const ms=Number(values[1]-values[0])/1e6;
    if(gpuCount<gpuSamples.length&&ms>=0)gpuSamples[gpuCount++]=ms;timestampRead.unmap();timestampBusy=false;
  }).catch(error=>{timingError=error.message;timestampBusy=false;});
}
function presentReadback(capturedView){
  // This intentionally expensive path is for visual evidence, never the 60 FPS hardware gate.
  const buffer=readbackBuffer,image=readbackImage,stride=readbackStride,width=renderWidth,height=renderHeight;
  buffer.mapAsync(GPUMapMode.READ).then(()=>{
    const source=new Uint8Array(buffer.getMappedRange()),target=image.data;
    for(let y=0;y<height;y++){
      let sourceOffset=y*stride,targetOffset=y*width*4;
      for(let x=0;x<width;x++){
        target[targetOffset]=source[sourceOffset+2];target[targetOffset+1]=source[sourceOffset+1];target[targetOffset+2]=source[sourceOffset];target[targetOffset+3]=255;sourceOffset+=4;targetOffset+=4;
      }
    }
    buffer.unmap();
    if(buffer===readbackBuffer){readbackContext.putImageData(image,0,0);presentedView=capturedView;presentedFrames++;startupSubmissionVerified=true;}
    readbackBusy=false;if(pendingResize)resize();
  }).catch(error=>{readbackBusy=false;fail('Offscreen diagnostic presentation failed: '+error.message);});
}
function render(now){
  if(crashed)return;
  if(readbackMode&&readbackBusy){requestAnimationFrame(render);return;}
  const ms=lastFrame?now-lastFrame:0;lastFrame=now;const delta=Math.min(ms/1000,.05);
  if(ms>0&&frameCount<frameSamples.length)frameSamples[frameCount++]=ms;
  updateCamera(delta,now);updateUniforms();updateHud(now);
  const textureView=readbackMode?readbackTexture.createView():context.getCurrentTexture().createView();
  if(colorTexture)passDescriptor.colorAttachments[0].resolveTarget=textureView;else passDescriptor.colorAttachments[0].view=textureView;
  const renderFog=debug!=='clear'&&debug!=='sky';
  const sample=timestampSet&&!timestampBusy&&animationFrame%30===0;
  if(sample){timestampBusy=true;passDescriptor.timestampWrites={querySet:timestampSet,beginningOfPassWriteIndex:0};if(!renderFog)passDescriptor.timestampWrites.endOfPassWriteIndex=1;}else passDescriptor.timestampWrites=undefined;
  const encoder=device.createCommandEncoder(),pass=encoder.beginRenderPass(passDescriptor);pass.setBindGroup(0,bindGroup);
  if(debug!=='clear'){pass.setPipeline(skyPipeline);pass.draw(3);}
  if(debug!=='clear'&&debug!=='sky'){
    // Legacy sectors retain their original shader and vertex bytes. Only the old corridor
    // range is replaced; the new physical corridor is drawn from every camera position.
    pass.setPipeline(meshPipeline);pass.setVertexBuffer(0,meshBuffer);
    const range=scene.corridorDrawRange;
    pass.draw(range.firstVertex);pass.draw(scene.vertices.length/12-range.firstVertex-range.vertexCount,1,range.firstVertex+range.vertexCount);
    corridorRenderer.draw(pass);
    pass.setPipeline(dustPipeline);pass.setBindGroup(0,bindGroup);pass.draw(6,PRESETS[quality].dust);
  }
  pass.end();
  if(renderFog)corridorRenderer.drawAtmosphere(encoder,textureView,sample?timestampSet:null);
  if(sample){encoder.resolveQuerySet(timestampSet,0,2,timestampResolve,0);encoder.copyBufferToBuffer(timestampResolve,0,timestampRead,0,16);}
  if(readbackMode){encoder.copyTextureToBuffer({texture:readbackTexture},{buffer:readbackBuffer,bytesPerRow:readbackStride,rowsPerImage:renderHeight},[renderWidth,renderHeight]);readbackBusy=true;}
  device.queue.submit([encoder.finish()]);
  if(!readbackMode&&!startupVerificationStarted){
    // One startup fence catches failed driver/shared-image presentation. Never synchronize every frame.
    startupVerificationStarted=true;
    device.queue.onSubmittedWorkDone().then(()=>{startupSubmissionVerified=true;}).catch(error=>fail('GPU presentation failed: '+error.message+'. Try a compatible desktop GPU/browser.'));
  }
  if(sample)readGpuTiming();
  if(readbackMode)presentReadback(activeView);else{presentedView=activeView;presentedFrames++;}
  animationFrame++;requestAnimationFrame(render);
}

canvas.addEventListener('click',()=>{if(ready&&!menuOpen){flight=null;canvas.requestPointerLock?.();}});
$('explore').addEventListener('click',()=>{setMenu(false);canvas.requestPointerLock?.();});
$('menu-toggle').addEventListener('click',()=>setMenu(!menuOpen));
$('audio-toggle').addEventListener('click',()=>audio.toggle());
$('flythrough').addEventListener('click',startFlythrough);
$('download-report').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(getReport(),null,2)],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='echo-9-performance.json';link.click();URL.revokeObjectURL(link.href);});
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{setView(button.dataset.view);setMenu(false);});
for(const button of document.querySelectorAll('[data-quality]'))button.addEventListener('click',()=>setQuality(button.dataset.quality));
window.addEventListener('resize',resize);
window.addEventListener('keydown',event=>{
  if(event.code==='Escape'){setMenu(!menuOpen);return;}if(event.target instanceof HTMLButtonElement&&event.code==='Space')return;
  if(/^Digit[1-6]$/.test(event.code)){setView(Number(event.code.slice(-1)));setMenu(false);}
  if(event.code==='KeyM'&&!event.repeat)audio.toggle();if(event.code==='KeyH'&&!event.repeat){showStats=!showStats;$('stats').hidden=!showStats;}
  if(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight'].includes(event.code)){keys.add(event.code);event.preventDefault();flight=null;}
});
window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>keys.clear());
document.addEventListener('mousemove',event=>{if(document.pointerLockElement===canvas&&!menuOpen){camera.yaw+=event.movementX*.0018;camera.pitch=clamp(camera.pitch+event.movementY*.0018,-1.45,1.45);}});
document.addEventListener('pointerlockchange',()=>{document.body.classList.toggle('pointer-locked',document.pointerLockElement===canvas);});
window.echo9={gpuInstance,get adapter(){return adapterReference;},get device(){return device;},get ready(){return ready&&startupSubmissionVerified&&(!readbackMode||presentedFrames>0);},setView,setQuality,setTime,startFlythrough,stopFlythrough,getReport,getState,setMenu,get stats(){return getReport();},camera,views:VIEWS,hero:CORRIDOR_HERO};
initialize();
