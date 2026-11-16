import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const page=await context.newPage();
const checks=[],errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
const check=(name,pass,evidence)=>{checks.push({name,status:pass?'PASS':'FAIL',evidence});if(!pass)process.exitCode=1;};
const state=()=>page.evaluate(()=>window.echo9.getState());
try{
  const url=process.env.ECHO_URL||'http://localhost:4173/index.html?test=1&readback=1';
  await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready,null,{timeout:90000});
  let s=await state();check('startup and full-resolution High',s.ready&&s.renderSize[0]===1920&&s.renderSize[1]===1080,s);
  await page.keyboard.press('Escape');s=await state();check('Escape opens menu',s.menuOpen,s.menuOpen);
  await page.locator('#explore').click();await page.waitForTimeout(300);s=await state();check('Explore closes menu and acquires pointer lock',!s.menuOpen&&s.pointerLocked,s);
  const before=s.position;await page.keyboard.down('KeyW');await page.waitForTimeout(1800);await page.keyboard.up('KeyW');s=await state();check('W changes camera position',Math.hypot(...s.position.map((v,i)=>v-before[i]))>.02,{before,after:s.position});
  const y=s.position[1];await page.keyboard.down('KeyE');await page.waitForTimeout(1100);await page.keyboard.up('KeyE');s=await state();check('E ascends',s.position[1]>y,{before:y,after:s.position[1]});
  const yaw=s.yaw;await page.mouse.move(1000,540);await page.mouse.move(1150,550);s=await state();check('Pointer motion changes camera direction',s.yaw!==yaw,{before:yaw,after:s.yaw});
  await page.keyboard.press('KeyH');check('H reveals telemetry',await page.locator('#stats').isVisible());
  await page.keyboard.press('KeyM');await page.waitForTimeout(300);s=await state();check('M starts synthesized audio after interaction',s.audio,s.audio);await page.keyboard.press('KeyM');await page.waitForTimeout(100);check('M mutes audio',!(await state()).audio);
  await page.evaluate(()=>{document.exitPointerLock();window.echo9.setMenu(true);});
  await page.locator('[data-quality="Low"]').click();await page.waitForFunction(()=>window.echo9.getState().renderSize[0]===1344);s=await state();check('Low reports explicit 0.7 render scale',s.quality==='Low'&&s.renderSize[1]===756,s);
  await page.locator('[data-quality="Medium"]').click();await page.waitForFunction(()=>window.echo9.getState().renderSize[0]===1920);s=await state();check('Medium preserves full resolution',s.quality==='Medium'&&s.renderSize[1]===1080,s);
  await page.locator('[data-quality="High"]').click();await page.keyboard.press('Digit4');s=await state();check('View 4 selects corridor and closes menu',s.sector==='SERVICE SPINE'&&!s.menuOpen,s);
  await page.keyboard.press('Digit5');s=await state();check('View 5 selects hangar',s.sector==='HANGAR',s);
  await page.keyboard.press('Digit1');s=await state();check('View 1 selects observatory',s.sector==='OBSERVATORY',s);
  await context.setOffline(true);await page.goto('file://'+resolve(import.meta.dirname,'../index.html')+'?test=1&readback=1');await page.waitForFunction(()=>window.echo9?.ready,null,{timeout:90000});s=await state();check('Standalone HTML renders from file with network offline',s.ready,s);
  check('No external runtime requests',requests.every(r=>r.startsWith('http://localhost:4173/')||r.startsWith('file:')||r.startsWith('data:')),requests);
  check('No runtime errors',errors.length===0,errors);
}catch(error){check('Smoke completion',false,error.message);}
finally{await context.close();await browser.close();}
const result={mode:'Software WebGPU offscreen readback diagnostics; audio audibility and hardware swapchain remain unverified',checks,errors};
await writeFile(new URL('../docs/qa/smoke-report.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
