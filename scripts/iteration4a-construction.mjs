import {chromium} from 'playwright';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='docs/qa/overhaul-v1/iteration-4a/construction';await mkdir(out,{recursive:true});
const tag=process.env.QA_TAG||'geometry-preview',width=Number(process.env.QA_WIDTH||960),height=Number(process.env.QA_HEIGHT||540),url=process.env.ECHO_URL||'http://localhost:4173/index.html?test=1&readback=1&view=4&quality=High&clean=1';
const browser=await chromium.launch({executablePath:'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const errors=[];const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:300000});if(!(await page.evaluate(()=>window.echo9?.ready)))throw Error(errors.join('\n'));await page.waitForFunction(()=>window.echo9.getState().presentedFrames>=2,null,{timeout:300000});await page.screenshot({path:`${out}/${tag}.png`});const report=await page.evaluate(()=>window.echo9.getReport());await writeFile(`${out}/${tag}.json`,JSON.stringify({artifactSha256:createHash('sha256').update(await readFile(process.env.ECHO_ARTIFACT||'index.html')).digest('hex'),url,report,errors},null,2));console.log(tag+' captured');
 if(process.env.QA_AB==='1')for(const [variant,options] of [['legacy-grade',{grade:'legacy',detailAA:true}],['detailAA-off',{grade:'agx',detailAA:false}],['restore',{grade:'agx',detailAA:true}]]){
  const before=await page.evaluate(options=>{const n=window.echo9.getState().presentedFrames;window.echo9.setCorridorDiagnostics(options);return n;},options);
  await page.waitForFunction(n=>window.echo9.getState().presentedFrames>=n+2,before,{timeout:300000});
  if(variant!=='restore')await page.screenshot({path:`${out}/${tag}-${variant}.png`});
 }
}finally{await browser.close();}
