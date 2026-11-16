import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=[];
try{
  for(const mode of ['missing-api','null-adapter','device-rejection']){
    const page=await browser.newPage({viewport:{width:1280,height:720}});
    await page.addInitScript(mode=>{
      Object.defineProperty(navigator,'gpu',{configurable:true,value:mode==='missing-api'?undefined:{requestAdapter:async()=>mode==='null-adapter'?null:{info:{},features:new Set(),requestDevice:async()=>{throw Error('Injected device initialization failure');}}}});
    },mode);
    await page.goto(process.env.ECHO_URL||'http://localhost:4173/index.html');
    await page.waitForSelector('#error:not([hidden])');
    const result=await page.evaluate(()=>({message:document.querySelector('#error p').textContent,ready:window.echo9?.ready,loading:!document.querySelector('#loading').hidden}));
    const pass=result.message.length>25&&result.ready===false&&!result.loading;
    results.push({mode,status:pass?'PASS':'FAIL',...result});
    if(!pass)process.exitCode=1;
    await page.close();
  }
}finally{await browser.close();}
await writeFile(new URL('../docs/qa/fallback-report.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
