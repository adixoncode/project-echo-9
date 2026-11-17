import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-3/p0',tag=process.env.QA_TAG||'before';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const samples=JSON.parse(await readFile('docs/qa/overhaul-v1/iteration-3/p0/mesh-before.json','utf8')).samples;
const reports=[];
try{for(const [name,flags] of (process.env.QA_VARIANTS?JSON.parse(process.env.QA_VARIANTS):[['red-only','onlyLight=1&probe=0&bloom=0'],['red-no-atmosphere','onlyLight=1&probe=0&fog=0&bloom=0'],['red-no-shadow','onlyLight=1&probe=0&fog=0&bloom=0&shadows=0']])){
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://localhost:4173/index.html?test=1&readback=1&view=4&quality=High&clean=1&'+flags);
 await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:300000});
 if(!(await page.evaluate(()=>window.echo9?.ready)))throw Error(errors.join('\n'));
 await page.waitForFunction(()=>window.echo9.getState().presentedFrames>=2,null,{timeout:300000});
 await page.screenshot({path:`${out}/${tag}-${name}.png`});
 const shadows=await page.evaluate(s=>window.echo9.getShadowDiagnostics(s),samples),state=await page.evaluate(()=>window.echo9.getState());
 reports.push({name,flags,state,shadows,errors});console.log(`${tag}-${name} captured`);await page.close();
 }}finally{await browser.close();await writeFile(`${out}/${tag}-gpu.json`,JSON.stringify({artifactSha256:createHash('sha256').update(await readFile('index.html')).digest('hex'),reports},null,2));}
