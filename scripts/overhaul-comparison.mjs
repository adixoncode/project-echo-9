// Documentation layout only: unchanged reference and actual browser renders, no generated/retouched scene pixels.
import {createRequire} from 'node:module';import {resolve} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');const root=resolve(import.meta.dirname,'..'),dir=resolve(root,'docs/qa/overhaul-v1/iteration-1');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:1920,height:1440},deviceScaleFactor:1});await page.goto('http://localhost:4173/docs/qa/overhaul-v1/iteration-1/comparison.html');await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));for(const kind of ['reference','baseline'])await page.locator('#'+kind+'-comparison').screenshot({path:resolve(dir,'comparison-'+kind+'.png')});console.log('Saved native HTML comparison screenshots.');}finally{await browser.close();}
