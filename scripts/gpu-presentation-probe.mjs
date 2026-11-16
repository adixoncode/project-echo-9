// Minimal, scene-independent reproduction of the cloud swapchain limitation.
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');
const software=process.argv.includes('--software');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox',...(software?['--enable-unsafe-webgpu','--use-angle=swiftshader']:[])]});
const results=[];
try {
  for(const presentation of ['offscreen','swapchain']) {
    const page=await browser.newPage();
    await page.goto(process.env.ECHO_URL||'http://localhost:4173/README.md');
    const result=await page.evaluate(async presentation=>{
      let adapter;
      try{
        adapter=await navigator.gpu?.requestAdapter();
        if(!adapter)return {presentation,status:'BLOCKED',reason:'No WebGPU adapter'};
        const device=await adapter.requestDevice();
        const info={vendor:adapter.info.vendor,architecture:adapter.info.architecture,isFallbackAdapter:adapter.info.isFallbackAdapter};
        let texture,format;
        if(presentation==='swapchain'){
          const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;document.body.replaceChildren(canvas);
          const context=canvas.getContext('webgpu');format=navigator.gpu.getPreferredCanvasFormat();context.configure({device,format,alphaMode:'opaque',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC});texture=context.getCurrentTexture();
        }else {format='rgba8unorm';texture=device.createTexture({size:[4,4],format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC});}
        const buffer=device.createBuffer({size:1024,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});
        const encoder=device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:texture.createView(),clearValue:{r:1,g:0,b:1,a:1},loadOp:'clear',storeOp:'store'}]});pass.end();
        encoder.copyTextureToBuffer({texture},{buffer,bytesPerRow:256},[4,4]);device.queue.submit([encoder.finish()]);await buffer.mapAsync(GPUMapMode.READ);
        const pixel=Array.from(new Uint8Array(buffer.getMappedRange()).slice(0,4));buffer.unmap();device.destroy();
        return {presentation,status:pixel.join(',')==='255,0,255,255'?'PASS':'FAIL',adapter:info,format,expected:[255,0,255,255],pixel};
      }catch(error){return {presentation,status:'BLOCKED',reason:error.message};}
    },presentation);
    results.push(result);await page.close();
  }
}finally{await browser.close();}
const report={browser:browser.version(),softwareFlag:software,sceneCodeUsed:false,results};
await writeFile(new URL('../docs/qa/presentation-probe.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
