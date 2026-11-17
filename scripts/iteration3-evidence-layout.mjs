// Documentation layout only. No scene-image retouching or generated scene pixels.
import {chromium} from 'playwright';
import {resolve} from 'node:path';
const dir=resolve(import.meta.dirname,'../docs/qa/overhaul-v1/iteration-3');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1440},deviceScaleFactor:1});
 await page.goto('http://localhost:4173/docs/qa/overhaul-v1/iteration-3/evidence.html');
 await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));
 for(const id of ['p0','materials','grade','aa'])await page.locator('#'+id).screenshot({path:resolve(dir,`comparison-${id}.png`)});
 console.log('Saved documentation layouts from actual unchanged image files.');
}finally{await browser.close();}
