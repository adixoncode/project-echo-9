// Calibrate actual production AgX WGSL after a real 4xMSAA rgba16float resolve.
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CORRIDOR_FINAL_SHADER} from '../src/corridor-post-shaders.js';
import {halfToNumber} from '../src/hdr.js';
const productionFunction=CORRIDOR_FINAL_SHADER.slice(CORRIDOR_FINAL_SHADER.indexOf('fn agxDisplay('),CORRIDOR_FINAL_SHADER.indexOf('fn displayDither('));
const cases=[[4,.5,.05],[.18,.18,.18],[16,8,2],[0,0,0],[.8,.6,.4]];
const sha=v=>createHash('sha256').update(v).digest('hex');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});let result;
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173/README.md');
 result=await page.evaluate(async({productionFunction,cases})=>{
  const adapter=await navigator.gpu.requestAdapter();if(!adapter)return {status:'BLOCKED',reason:'No WebGPU adapter'};
  const device=await adapter.requestDevice(),errors=[];device.addEventListener('uncapturederror',e=>errors.push(e.error.message));
  const make=(format,sampleCount,usage)=>device.createTexture({size:[5,1],format,sampleCount,usage});
  const usage=GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC;
  const hdr=make('rgba16float',1,usage),hdrMsaa=make('rgba16float',4,GPUTextureUsage.RENDER_ATTACHMENT),legacy=make('rgba8unorm',1,usage),legacyMsaa=make('rgba8unorm',4,GPUTextureUsage.RENDER_ATTACHMENT),display=make('rgba8unorm',1,usage);
  const vertex=`@vertex fn vertex(@builtin(vertex_index)i:u32)->@builtin(position)vec4<f32>{let p=array<vec2<f32>,3>(vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));return vec4(p[i],0.,1.);}`;
  const literals=cases.map(v=>'vec3<f32>('+v.map(n=>Number.isInteger(n)?n+'.':n).join(',')+')').join(',');
  const scene=device.createShaderModule({code:vertex+`struct Out{@location(0)hdr:vec4<f32>,@location(1)legacy:vec4<f32>};@fragment fn fragment(@builtin(position)p:vec4<f32>)->Out{let values=array<vec3<f32>,5>(${literals});var o:Out;o.hdr=vec4(values[u32(p.x)],select(1.,0.,p.x>4.));o.legacy=vec4(.15,.25,.35,1.);return o;}`});
  const final=device.createShaderModule({code:vertex+productionFunction+`@group(0)@binding(0)var hdr:texture_2d<f32>;@group(0)@binding(1)var legacy:texture_2d<f32>;@fragment fn fragment(@builtin(position)p:vec4<f32>)->@location(0)vec4<f32>{let pixel=vec2<i32>(p.xy);let color=textureLoad(hdr,pixel,0);if(color.a<=0.){return textureLoad(legacy,pixel,0);}return vec4(agxDisplay(color.rgb),1.);}`});
  for(const module of [scene,final]){const info=await module.getCompilationInfo();errors.push(...info.messages.filter(m=>m.type==='error').map(m=>m.message));}
  const scenePipeline=device.createRenderPipeline({layout:'auto',vertex:{module:scene,entryPoint:'vertex'},fragment:{module:scene,entryPoint:'fragment',targets:[{format:'rgba16float'},{format:'rgba8unorm'}]},multisample:{count:4}});
  const finalPipeline=device.createRenderPipeline({layout:'auto',vertex:{module:final,entryPoint:'vertex'},fragment:{module:final,entryPoint:'fragment',targets:[{format:'rgba8unorm'}]}});
  const group=device.createBindGroup({layout:finalPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:hdr.createView()},{binding:1,resource:legacy.createView()}]});
  const makeRead=()=>device.createBuffer({size:256,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),hdrRead=makeRead(),displayRead=makeRead(),legacyRead=makeRead(),encoder=device.createCommandEncoder();
  let pass=encoder.beginRenderPass({colorAttachments:[{view:hdrMsaa.createView(),resolveTarget:hdr.createView(),loadOp:'clear',storeOp:'store',clearValue:{r:0,g:0,b:0,a:0}},{view:legacyMsaa.createView(),resolveTarget:legacy.createView(),loadOp:'clear',storeOp:'store',clearValue:{r:0,g:0,b:0,a:0}}]});pass.setPipeline(scenePipeline);pass.draw(3);pass.end();
  pass=encoder.beginRenderPass({colorAttachments:[{view:display.createView(),loadOp:'clear',storeOp:'store',clearValue:{r:0,g:0,b:0,a:0}}]});pass.setPipeline(finalPipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();
  for(const [texture,buffer]of [[hdr,hdrRead],[display,displayRead],[legacy,legacyRead]])encoder.copyTextureToBuffer({texture},{buffer,bytesPerRow:256},[5,1]);device.queue.submit([encoder.finish()]);
  await Promise.all([hdrRead.mapAsync(GPUMapMode.READ),displayRead.mapAsync(GPUMapMode.READ),legacyRead.mapAsync(GPUMapMode.READ)]);
  const rawHalf=Array.from(new Uint16Array(hdrRead.getMappedRange()).slice(0,20)),encodedRGBA=Array.from(new Uint8Array(displayRead.getMappedRange()).slice(0,20)),legacyRGBA=Array.from(new Uint8Array(legacyRead.getMappedRange()).slice(0,20));
  for(const buffer of [hdrRead,displayRead,legacyRead])buffer.unmap();device.destroy();
  return {rawHalf,encodedRGBA,legacyRGBA,errors,adapter:{vendor:adapter.info.vendor,architecture:adapter.info.architecture,isFallbackAdapter:adapter.info.isFallbackAdapter},format:'rgba16float',msaa:4,displayFormat:'rgba8unorm'};
 },{productionFunction,cases});
}finally{await browser.close();}
if(result.rawHalf){
 // Independent scalar CPU formulation, using GPU half-rounded input, not shader emulation.
 const inset=[[.842479062253094,.0784335999999992,.0792237451477643],[.0423282422610123,.878468636469772,.0791661274605434],[.0423756549057051,.0784336,.879142973793104]],outset=[[1.19687900512017,-.0980208811401368,-.0990297440797205],[-.0528968517574562,1.15190312990417,-.0989611768448433],[-.0529716355144438,-.0980434501171241,1.15107367264116]];
 const mul=(m,v)=>m.map(row=>row.reduce((s,a,i)=>s+a*v[i],0)),clamp=v=>Math.max(0,Math.min(1,v));
 const cpuAgx=v=>mul(outset,mul(inset,v).map(v=>{const x=clamp((Math.log2(Math.max(v,1e-10))+12.47393)/16.5);return 15.5*x**6-40.14*x**5+31.96*x**4-6.868*x**3+.4298*x*x+.1191*x-.00232;})).map(clamp);
 result.samples=cases.map((input,i)=>{const halfRounded=result.rawHalf.slice(i*4,i*4+3).map(halfToNumber),actual=result.encodedRGBA.slice(i*4,i*4+4),cpu=cpuAgx(halfRounded),expected=i===4?result.legacyRGBA.slice(i*4,i*4+4):[...cpu.map(v=>Math.round(v*255)),255];return {input,halfRounded,actual,expected,maxDifferenceLSB:Math.max(...actual.map((v,j)=>Math.abs(v-expected[j]))),wrongDoubleGammaWouldBe:cpu.map(v=>Math.round(v**(1/2.2)*255))};});
 result.status=!result.errors.length&&result.samples.every(s=>s.maxDifferenceLSB<=1)&&result.samples[4].actual.join()===result.legacyRGBA.slice(16,20).join()?'PASS':'FAIL';
 result.legacyBypassExact=result.samples[4].actual.join()===result.legacyRGBA.slice(16,20).join();
 result.grey18DoubleGammaDifferenceLSB=Math.abs(result.samples[1].actual[0]-result.samples[1].wrongDoubleGammaWouldBe[0]);
}
result={...result,artifactSha256:sha(await readFile('index.html')),productionFunctionSha256:sha(productionFunction),productionFunction:'CORRIDOR_FINAL_SHADER.agxDisplay, exact extracted WGSL',transfer:'Linear HDR -> inset/log/contrast/outset -> encoded unorm; no extra gamma',hardwareAcceptance:'BLOCKED',scope:'Actual format/MSAA/production transfer and exact legacy bypass calibration; no performance or art acceptance'};
const out=process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-3';await mkdir(out,{recursive:true});await writeFile(out+'/tone-capability-probe.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(result.status==='FAIL')process.exitCode=1;
