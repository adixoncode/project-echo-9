import {normalize,cross,dot,perspective,multiply} from './math.js';
import {CORRIDOR_LIGHTS,CORRIDOR_PROBE} from './corridor.js';
import {CORRIDOR_SHADER,CORRIDOR_SHADOW_SHADER,CORRIDOR_PREFILTER_SHADER,corridorAtmosphereShader} from './corridor-shaders.js';

const CORRIDOR_VERTEX_LAYOUT={arrayStride:48,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},{shaderLocation:2,offset:24,format:'float32x3'},{shaderLocation:3,offset:36,format:'float32x3'}]};
function cameraMatrix(position,target,fov,near,far){
  const back=normalize(position.map((v,i)=>v-target[i])),right=normalize(cross([0,1,0],back)),up=cross(back,right);
  const view=new Float32Array([right[0],up[0],back[0],0,right[1],up[1],back[1],0,right[2],up[2],back[2],0,-dot(right,position),-dot(up,position),-dot(back,position),1]);
  return multiply(new Float32Array(16),perspective(new Float32Array(16),fov,1,near,far),view);
}
// These axes match the texture_cube face-selection convention, including the vertical image flip.
function cubeCamera(position,face){
  const rights=[[0,0,-1],[0,0,1],[1,0,0],[1,0,0],[1,0,0],[-1,0,0]];
  const ups=[[0,1,0],[0,1,0],[0,0,-1],[0,0,1],[0,1,0],[0,1,0]];
  const forwards=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const r=rights[face],up=ups[face],back=forwards[face].map(v=>-v);
  const view=new Float32Array([r[0],up[0],back[0],0,r[1],up[1],back[1],0,r[2],up[2],back[2],0,-dot(r,position),-dot(up,position),-dot(back,position),1]);
  return multiply(new Float32Array(16),perspective(new Float32Array(16),Math.PI*.5,1,.06,100),view);
}
export class CorridorRenderer{
  constructor(device,format,mainUniform,geometry,{shadows=true,probe=true}={}){
    this.device=device;this.format=format;this.mainUniform=mainUniform;this.geometry=geometry;this.shadowResolution=2048;this.probeOptions=CORRIDOR_PROBE;this.shadowsEnabled=shadows;this.probeEnabled=probe;this.bakeMilliseconds=null;
    this.vertexBuffer=device.createBuffer({label:'Beveled service-spine architecture',size:geometry.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(this.vertexBuffer,0,geometry.vertices);
    this.cameraLayout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}}]});
    this.mainCameraGroup=device.createBindGroup({layout:this.cameraLayout,entries:[{binding:0,resource:{buffer:mainUniform}}]});
    this.lightingLayout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'depth',viewDimension:'2d-array'}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:'comparison'}},{binding:3,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float',viewDimension:'cube'}},{binding:4,visibility:GPUShaderStage.FRAGMENT,sampler:{type:'filtering'}}]});
    this.lightingBuffer=device.createBuffer({size:192,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    this.shadowTexture=device.createTexture({label:'Two cached geometric spotlight shadow maps',size:[this.shadowResolution,this.shadowResolution,2],format:'depth32float',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
    this.shadowSampler=device.createSampler({compare:'less-equal',minFilter:'linear',magFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
    const p=CORRIDOR_PROBE;
    this.rawProbe=device.createTexture({label:'Actual room radiance: six HDR views',size:[p.size,p.size,6],format:'rgba16float',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC});
    this.filteredProbe=device.createTexture({label:'GGX roughness-prefiltered local room reflection',size:[p.size,p.size,6],mipLevelCount:p.mips,format:'rgba16float',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST});
    this.probeSampler=device.createSampler({minFilter:'linear',magFilter:'linear',mipmapFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
    this.lightingGroup=device.createBindGroup({layout:this.lightingLayout,entries:[{binding:0,resource:{buffer:this.lightingBuffer}},{binding:1,resource:this.shadowTexture.createView({dimension:'2d-array'})},{binding:2,resource:this.shadowSampler},{binding:3,resource:this.filteredProbe.createView({dimension:'cube'})},{binding:4,resource:this.probeSampler}]});
    this.lightingData=new Float32Array(48);
    this.shadowCameras=CORRIDOR_LIGHTS.map((light,index)=>{
      const matrix=cameraMatrix(light.position,light.target,light.fov*Math.PI/180,.15,light.far);this.lightingData.set(matrix,index*16);
      const buffer=device.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(buffer,0,matrix);return {matrix,buffer};
    });
    this.lightingData.set([...p.position,p.mips-1],32);this.lightingData.set([...p.min,0],36);this.lightingData.set([...p.max,0],40);this.lightingData.set([1,probe?1:0,this.shadowResolution,0],44);device.queue.writeBuffer(this.lightingBuffer,0,this.lightingData);
    this.layout=device.createPipelineLayout({bindGroupLayouts:[this.cameraLayout,this.lightingLayout]});
  }
  async initialize(samples=4){
    const device=this.device,started=performance.now();
    this.module=device.createShaderModule({label:'Corridor physical materials / actual-room IBL',code:CORRIDOR_SHADER});
    const shadowModule=device.createShaderModule({label:'Geometric spotlight occlusion',code:CORRIDOR_SHADOW_SHADER});
    const filterModule=device.createShaderModule({label:'GGX importance-sampled cubemap prefilter',code:CORRIDOR_PREFILTER_SHADER});
    for(const module of [this.module,shadowModule,filterModule]){
      const info=await module.getCompilationInfo(),errors=info.messages.filter(message=>message.type==='error');if(errors.length)throw Error(errors.map(error=>`Corridor WGSL line${error.lineNum}: ${error.message}`).join('\n'));
    }
    this.setSamples(samples);
    this.probePipeline=device.createRenderPipeline({layout:this.layout,vertex:{module:this.module,entryPoint:'corridorVertex',buffers:[CORRIDOR_VERTEX_LAYOUT]},fragment:{module:this.module,entryPoint:'corridorProbeFragment',targets:[{format:'rgba16float'}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'}});
    const shadowLayout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:'uniform'}}]});
    const shadowPipeline=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[shadowLayout]}),vertex:{module:shadowModule,entryPoint:'shadowVertex',buffers:[{arrayStride:48,attributes:[{shaderLocation:0,offset:0,format:'float32x3'}]}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'less',depthBias:1,depthBiasSlopeScale:.5}});
    const encoder=device.createCommandEncoder({label:'One-time corridor lighting bake'});
    for(let i=0;i<2;i++){
      const group=device.createBindGroup({layout:shadowLayout,entries:[{binding:0,resource:{buffer:this.shadowCameras[i].buffer}}]});
      const pass=encoder.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:this.shadowTexture.createView({dimension:'2d',baseArrayLayer:i,arrayLayerCount:1}),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
      pass.setPipeline(shadowPipeline);pass.setBindGroup(0,group);pass.setVertexBuffer(0,this.vertexBuffer);pass.draw(this.geometry.vertices.length/12);pass.end();
    }
    const p=CORRIDOR_PROBE,probeDepth=device.createTexture({size:[p.size,p.size],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT});
    this.probeCameraBuffers=[];
    for(let face=0;face<6;face++){
      const uniform=new Float32Array(40);uniform.set(cubeCamera(p.position,face));uniform.set([...p.position,12],16);
      const buffer=device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(buffer,0,uniform);this.probeCameraBuffers.push(buffer);
      const group=device.createBindGroup({layout:this.cameraLayout,entries:[{binding:0,resource:{buffer}}]});
      const pass=encoder.beginRenderPass({colorAttachments:[{view:this.rawProbe.createView({dimension:'2d',baseArrayLayer:face,arrayLayerCount:1}),clearValue:{r:0,g:0,b:0,a:1},loadOp:'clear',storeOp:'store'}],depthStencilAttachment:{view:probeDepth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
      pass.setPipeline(this.probePipeline);pass.setBindGroup(0,group);pass.setBindGroup(1,this.lightingGroup);pass.setVertexBuffer(0,this.vertexBuffer);pass.draw(this.geometry.vertices.length/12);pass.end();
    }
    encoder.copyTextureToTexture({texture:this.rawProbe},{texture:this.filteredProbe},[p.size,p.size,6]);
    const filter=device.createComputePipeline({layout:'auto',compute:{module:filterModule,entryPoint:'prefilter'}});this.filterBuffers=[];
    for(let mip=1;mip<p.mips;mip++){
      const size=Math.max(1,p.size>>mip),data=new ArrayBuffer(16);new Uint32Array(data).set([size,128]);new Float32Array(data)[2]=mip/(p.mips-1);
      const buffer=device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});device.queue.writeBuffer(buffer,0,data);this.filterBuffers.push(buffer);
      const group=device.createBindGroup({layout:filter.getBindGroupLayout(0),entries:[{binding:0,resource:this.rawProbe.createView({dimension:'cube'})},{binding:1,resource:this.probeSampler},{binding:2,resource:this.filteredProbe.createView({dimension:'2d-array',baseMipLevel:mip,mipLevelCount:1})},{binding:3,resource:{buffer}}]});
      const pass=encoder.beginComputePass();pass.setPipeline(filter);pass.setBindGroup(0,group);pass.dispatchWorkgroups(Math.ceil(size/8),Math.ceil(size/8),6);pass.end();
    }
    device.queue.submit([encoder.finish()]);await device.queue.onSubmittedWorkDone();probeDepth.destroy();
    this.lightingData[44]=this.shadowsEnabled?1:0;device.queue.writeBuffer(this.lightingBuffer,0,this.lightingData);
    this.bakeMilliseconds=performance.now()-started;
  }
  setSamples(samples){
    if(!this.module)return;
    this.pipeline=this.device.createRenderPipeline({label:'Beveled corridor: GGX / PCF / local HDR reflections',layout:this.layout,vertex:{module:this.module,entryPoint:'corridorVertex',buffers:[CORRIDOR_VERTEX_LAYOUT]},fragment:{module:this.module,entryPoint:'corridorFragment',targets:[{format:this.format}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'},multisample:{count:samples}});
  }
  setDepth(texture,samples){
    const device=this.device,multisampled=samples>1;
    const layout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'depth',multisampled}}]});
    const module=device.createShaderModule({label:'Ray-bounded corridor aerial perspective',code:corridorAtmosphereShader(multisampled)});
    this.atmosphereCheck=module.getCompilationInfo().then(info=>{const errors=info.messages.filter(message=>message.type==='error');if(errors.length)throw Error(errors.map(error=>error.message).join('\n'));});
    this.atmosphereGroup=device.createBindGroup({layout,entries:[{binding:0,resource:{buffer:this.mainUniform}},{binding:1,resource:texture.createView()}]});
    this.atmospherePipeline=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[layout]}),vertex:{module,entryPoint:'fogVertex'},fragment:{module,entryPoint:'fogFragment',targets:[{format:this.format,blend:{color:{srcFactor:'src-alpha',dstFactor:'one-minus-src-alpha',operation:'add'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha',operation:'add'}}}]},primitive:{topology:'triangle-list'}});
  }
  drawAtmosphere(encoder,target,timestampSet=null){
    const descriptor={colorAttachments:[{view:target,loadOp:'load',storeOp:'store'}]};
    if(timestampSet)descriptor.timestampWrites={querySet:timestampSet,endOfPassWriteIndex:1};
    const pass=encoder.beginRenderPass(descriptor);pass.setPipeline(this.atmospherePipeline);pass.setBindGroup(0,this.atmosphereGroup);pass.draw(3);pass.end();
  }
  draw(pass){pass.setPipeline(this.pipeline);pass.setBindGroup(0,this.mainCameraGroup);pass.setBindGroup(1,this.lightingGroup);pass.setVertexBuffer(0,this.vertexBuffer);pass.draw(this.geometry.vertices.length/12);}
  report(){const p=CORRIDOR_PROBE;let filteredBytes=0;for(let mip=0;mip<p.mips;mip++)filteredBytes+=(p.size>>mip)**2*6*8;return {triangles:this.geometry.triangles,geometryBytes:this.geometry.vertices.byteLength,estimatedGpuBytes:this.geometry.vertices.byteLength+2*this.shadowResolution**2*4+p.size**2*6*8+filteredBytes+192,shadowMaps:{count:2,resolution:this.shadowResolution,format:'depth32float',filter:'4-tap comparison PCF',enabled:this.shadowsEnabled,cached:true},environment:{source:'Six native HDR renders of actual procedural corridor geometry, direct lights and geometric shadows',resolution:CORRIDOR_PROBE.size,faces:6,mips:CORRIDOR_PROBE.mips,prefilter:'128-sample GGX importance convolution per mip texel',parallaxCorrection:'Room-box projected reflected rays',enabled:this.probeEnabled,cached:true},atmosphere:{bounds:[[-3.9,0,24],[3.9,5.6,72]],extinctionPerMetre:.065,integration:'Shared-depth-clipped ray length inside physical corridor; 4 source samples, display-space composite'},bakeMilliseconds:this.bakeMilliseconds,fixedExposure:1.35};}
}
