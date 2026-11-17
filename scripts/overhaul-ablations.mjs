/** Diagnostic feature-off renders of the same approved candidate; no artistic revisions. */
import {createRequire} from 'node:module';import {writeFile,readFile} from 'node:fs/promises';import {resolve} from 'node:path';import {createHash} from 'node:crypto';
const {chromium}=createRequire(import.meta.url)('playwright');const root=resolve(import.meta.dirname,'..'),out=resolve(root,process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-3');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const results=[];const sha=createHash('sha256').update(await readFile(resolve(root,'index.html'))).digest('hex');
try{
 const variants=process.env.QA_VARIANTS?JSON.parse(process.env.QA_VARIANTS):[['no-shadows','shadows=0'],['no-environment','probe=0'],['no-atmosphere','fog=0'],['no-bloom','bloom=0']];
 for(const [name,parameter]of variants){
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  await page.goto('http://localhost:4173/index.html?test=1&readback=1&view=4&quality=High&clean=1&'+parameter);
  await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:240000});
  if(!(await page.evaluate(()=>window.echo9?.ready)))throw Error(name+' failed: '+errors.join('\n'));
  await page.waitForFunction(()=>window.echo9.getState().presentedFrames>=2,null,{timeout:240000});
  await page.screenshot({path:resolve(out,name+'.png')});const report=await page.evaluate(()=>window.echo9.getReport());
  results.push({name,artifactSha256:sha,report,errors});if(errors.length)process.exitCode=1;
  console.log('Captured '+name);await page.close();
 }
}finally{await browser.close();}
await writeFile(resolve(out,'feature-ablations.json'),JSON.stringify(results,null,2)+'\n');
