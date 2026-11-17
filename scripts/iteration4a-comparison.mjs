// Documentation layout of unchanged real images, not generated scene content.
import {chromium} from 'playwright';
import {resolve} from 'node:path';
const out=resolve(import.meta.dirname,'../docs/qa/overhaul-v1/iteration-4a');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1440},deviceScaleFactor:1});
 await page.goto('http://localhost:4173/docs/qa/overhaul-v1/iteration-4a/comparison.html');
 await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));
 for(const id of ['reference','baseline','baseline-hud','blockout','thumbnail'])await page.locator(`#${id}-comparison`).screenshot({path:resolve(out,`comparison-${id}.png`)});
 await page.goto('http://localhost:4173/docs/qa/overhaul-v1/iteration-4a/details.html');
 await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));
 for(const id of ['near','middle','far'])await page.locator(`#${id}`).screenshot({path:resolve(out,`comparison-${id}.png`)});
 console.log('Saved4A documentation comparison layouts.');
}finally{await browser.close();}
