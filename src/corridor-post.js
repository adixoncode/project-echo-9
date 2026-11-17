import {summarizeHdrPixels} from './hdr.js';
import {corridorVolumeShader,corridorComposeShader,CORRIDOR_FINAL_SHADER,CORRIDOR_BLOOM_SHADER} from './corridor-post-shaders.js';
export const CORRIDOR_STAGE='final';
export class CorridorPost{
  constructor(device,format,mainUniform,{fog=true,bloom=true}={}){
    this.device=device;this.format=format;this.mainUniform=mainUniform;this.fogEnabled=fog;this.bloomEnabled=bloom;this.exposure=1.35;this.textures=[];this.readbackBusy=false;this.buffers=[];
  }
  setLighting(layout,group){this.lightingLayout=layout;this.lightingGroup=group;}
  resize(depth,samples,width,height){
    for(const texture of this.textures)texture.destroy();for(const buffer of this.buffers)buffer.destroy();this.textures=[];this.buffers=[];this.width=width;this.height=height;this.gpuBytes=0;
    const device=this.device,make=(label,format,w=width,h=height,sampleCount=1,extraUsage=0)=>{
      const texture=device.createTexture({label,size:[w,h],format,sampleCount,usage:GPUTextureUsage.RENDER_ATTACHMENT|(sampleCount===1?GPUTextureUsage.TEXTURE_BINDING:0)|extraUsage});this.textures.push(texture);this.gpuBytes+=w*h*sampleCount*(format==='rgba16float'?8:4);return texture;
    };
    const buffer=(size,data)=>{const value=device.createBuffer({size,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});if(data)device.queue.writeBuffer(value,0,data);this.buffers.push(value);return value;};
    const module=(label,code)=>device.createShaderModule({label,code});
    this.legacy=make('Unchanged legacy display before corridor composition',this.format);
    this.scene=make('Common linear scene radiance / corridor coverage','rgba16float',width,height,1,GPUTextureUsage.COPY_SRC);
    this.composed=make('Linear light-linked corridor composite before tone mapping','rgba16float',width,height,1,GPUTextureUsage.COPY_SRC);
    this.msaa=samples>1?make('4xMSAA linear scene radiance','rgba16float',width,height,samples):null;
    this.volume=make('Half-resolution shadowed scattering / receiver distance','rgba16float',Math.ceil(width/2),Math.ceil(height/2));
    this.legacyView=this.legacy.createView();this.sceneView=this.scene.createView();this.composedView=this.composed.createView();this.volumeView=this.volume.createView();
    this.hdrAttachment={view:this.msaa?this.msaa.createView():this.sceneView,resolveTarget:this.msaa?this.sceneView:undefined,clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'};
    this.optionBuffer=buffer(48);this.options=new Float32Array([this.exposure,this.fogEnabled?1:0,this.bloomEnabled?1:0,1,.065,.16,.20,24,.06,1.35,.5,0]);device.queue.writeBuffer(this.optionBuffer,0,this.options);
    const uniform={binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}};
    const volumeLayout=device.createBindGroupLayout({entries:[uniform,{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'depth',multisampled:samples>1}},{binding:2,visibility:GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}}]});
    const volumeModule=module('Same-source, shadowed 24-step Beer-Lambert scattering',corridorVolumeShader(samples>1));
    this.volumeGroup=device.createBindGroup({layout:volumeLayout,entries:[{binding:0,resource:{buffer:this.mainUniform}},{binding:1,resource:depth.createView()},{binding:2,resource:{buffer:this.optionBuffer}}]});
    this.volumePipeline=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[volumeLayout,this.lightingLayout]}),vertex:{module:volumeModule,entryPoint:'postVertex'},fragment:{module:volumeModule,entryPoint:'volumeFragment',targets:[{format:'rgba16float'}]},primitive:{topology:'triangle-list'}});
    const composeLayout=device.createBindGroupLayout({entries:[uniform,{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float'}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'depth',multisampled:samples>1}},{binding:3,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float'}},{binding:4,visibility:GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}}]});
    const composeModule=module('Linear HDR transmittance + depth-bilateral in-scattering',corridorComposeShader(samples>1));
    this.composeGroup=device.createBindGroup({layout:composeLayout,entries:[{binding:0,resource:{buffer:this.mainUniform}},{binding:1,resource:this.sceneView},{binding:2,resource:depth.createView()},{binding:3,resource:this.volumeView},{binding:4,resource:{buffer:this.optionBuffer}}]});
    this.composePipeline=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[composeLayout]}),vertex:{module:composeModule,entryPoint:'postVertex'},fragment:{module:composeModule,entryPoint:'composeFragment',targets:[{format:'rgba16float'}]},primitive:{topology:'triangle-list'}});
    this.bloomTextures=[];this.bloomGroups=[];this.bloomViews=[];this.bloomSampler=device.createSampler({minFilter:'linear',magFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
    const bloomModule=module('HDR-only luminance threshold / tent bloom pyramid',CORRIDOR_BLOOM_SHADER);
    this.bloomPipeline=device.createRenderPipeline({layout:'auto',vertex:{module:bloomModule,entryPoint:'postVertex'},fragment:{module:bloomModule,entryPoint:'bloomFragment',targets:[{format:'rgba16float'}]},primitive:{topology:'triangle-list'}});
    for(let level=0;level<4;level++){
      const texture=make(`HDR bloom level ${level}`,'rgba16float',Math.max(1,width>>(level+1)),Math.max(1,height>>(level+1))),view=texture.createView();this.bloomTextures.push(texture);this.bloomViews.push(view);
      const options=buffer(16,new Float32Array([1.35,.5,level===0?1:0,0]));
      this.bloomGroups.push(device.createBindGroup({layout:this.bloomPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:level===0?this.composedView:this.bloomViews[level-1]},{binding:1,resource:this.bloomSampler},{binding:2,resource:{buffer:options}}]}));
    }
    const finalEntries=[uniform,{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float'}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float'}},{binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:'uniform'}}];
    for(let i=0;i<4;i++)finalEntries.push({binding:4+i,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:'float'}});finalEntries.push({binding:8,visibility:GPUShaderStage.FRAGMENT,sampler:{type:'filtering'}});
    const finalLayout=device.createBindGroupLayout({entries:finalEntries}),finalModule=module('Only final exposure / filmic / gamma after linear bloom',CORRIDOR_FINAL_SHADER);
    this.finalGroup=device.createBindGroup({layout:finalLayout,entries:[{binding:0,resource:{buffer:this.mainUniform}},{binding:1,resource:this.composedView},{binding:2,resource:this.legacyView},{binding:3,resource:{buffer:this.optionBuffer}},...this.bloomViews.map((view,i)=>({binding:4+i,resource:view})),{binding:8,resource:this.bloomSampler}]});
    this.finalPipeline=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[finalLayout]}),vertex:{module:finalModule,entryPoint:'postVertex'},fragment:{module:finalModule,entryPoint:'finalFragment',targets:[{format:this.format}]},primitive:{topology:'triangle-list'}});
    this.check=Promise.all([volumeModule,composeModule,bloomModule,finalModule].map(async shader=>{const info=await shader.getCompilationInfo(),errors=info.messages.filter(m=>m.type==='error');if(errors.length)throw Error(errors.map(e=>e.message).join('\n'));}));
  }
  draw(encoder,target,timestampSet=null,enabled=true){
    this.options[1]=this.fogEnabled&&enabled?1:0;this.options[2]=this.bloomEnabled&&enabled?1:0;this.options[3]=enabled?1:0;this.device.queue.writeBuffer(this.optionBuffer,0,this.options);
    if(this.options[1]){const pass=encoder.beginRenderPass({colorAttachments:[{view:this.volumeView,clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});pass.setPipeline(this.volumePipeline);pass.setBindGroup(0,this.volumeGroup);pass.setBindGroup(1,this.lightingGroup);pass.draw(3);pass.end();}
    const composePass=encoder.beginRenderPass({colorAttachments:[{view:this.composedView,clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});composePass.setPipeline(this.composePipeline);composePass.setBindGroup(0,this.composeGroup);composePass.draw(3);composePass.end();
    if(this.options[2])for(let level=0;level<4;level++){const pass=encoder.beginRenderPass({colorAttachments:[{view:this.bloomViews[level],clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});pass.setPipeline(this.bloomPipeline);pass.setBindGroup(0,this.bloomGroups[level]);pass.draw(3);pass.end();}
    const descriptor={colorAttachments:[{view:target,loadOp:'clear',storeOp:'store'}]};if(timestampSet)descriptor.timestampWrites={querySet:timestampSet,endOfPassWriteIndex:1};
    const pass=encoder.beginRenderPass(descriptor);pass.setPipeline(this.finalPipeline);pass.setBindGroup(0,this.finalGroup);pass.draw(3);pass.end();
  }
  async diagnostics(){
    if(this.readbackBusy)throw Error('HDR diagnostic readback already in progress');this.readbackBusy=true;
    const device=this.device,width=this.width,height=this.height,stride=Math.ceil(width*8/256)*256,buffers=[],encoder=device.createCommandEncoder();
    try{
      for(const texture of [this.scene,this.composed]){const buffer=device.createBuffer({label:'On-demand HDR numeric diagnostics',size:stride*height,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});buffers.push(buffer);encoder.copyTextureToBuffer({texture},{buffer,bytesPerRow:stride,rowsPerImage:height},[width,height]);}
      device.queue.submit([encoder.finish()]);const reports=[];
      for(const buffer of buffers){await buffer.mapAsync(GPUMapMode.READ);reports.push(summarizeHdrPixels(new Uint16Array(buffer.getMappedRange()),width,height,stride));buffer.unmap();}
      return {stage:CORRIDOR_STAGE,presentation:'Actual GPU texture copies; scene before scattering, composite after scattering before bloom/final tone',scene:reports[0],composite:reports[1],exposure:this.exposure};
    }finally{for(const buffer of buffers)buffer.destroy();this.readbackBusy=false;}
  }
  report(){return {stage:CORRIDOR_STAGE,sceneFormat:'rgba16float',compositeFormat:'rgba16float',alpha:'Per-material/ray-bounded corridor coverage; HDR dust preserves destination alpha',toneMapping:'Lighting + reflection → shadowed scattering → linear HDR bloom → one final exposure/filmic/gamma; exact legacy display bypass elsewhere',exposure:this.exposure,estimatedGpuBytes:this.gpuBytes||0,fog:{enabled:this.fogEnabled,resolution:[Math.ceil(this.width/2),Math.ceil(this.height/2)],steps:24,extinctionNear:.0078,extinctionFar:.10,albedo:.16,anisotropy:.2,finiteSourceFootprint:.65,source:'Same authored light table and geometric shadow maps',reconstruction:'Receiver-distance bilateral 2x2; full-resolution transmittance'},bloom:{enabled:this.bloomEnabled,levels:4,threshold:1.35,knee:.5,strength:.06,source:'Only scoped linear HDR luminance above threshold'}};}
}
