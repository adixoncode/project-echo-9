/** Browser evidence collector. Requires Playwright and Chromium; never treats SwiftShader as hardware. */
import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, process.env.QA_DIR || 'docs/qa');
await mkdir(out, { recursive: true });
const software = process.argv.includes('--software');
const benchmark = process.argv.includes('--benchmark');
const routeOnly = process.argv.includes('--route-only');
const selectedURL = new URL(process.env.ECHO_URL || 'http://localhost:4173/index.html?view=1&quality=High&test=1');
if (process.argv.includes('--readback')) selectedURL.searchParams.set('readback', '1');
const url = selectedURL.href;
const artifactSha256 = createHash('sha256').update(await readFile(resolve(root, 'index.html'))).digest('hex');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', ...(software ? ['--enable-unsafe-webgpu', '--use-angle=swiftshader'] : [])] });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
  ...(process.argv.includes('--video') ? { recordVideo: { dir: resolve(out, 'video'), size: { width: 1920, height: 1080 } } } : {}) });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
const requests = [];
page.on('request', req => requests.push(req.url()));
try {
  await page.goto(url);
  const adapter = await page.evaluate(async () => { const a = await navigator.gpu.requestAdapter(); return a ? { vendor:a.info.vendor, architecture:a.info.architecture, device:a.info.device, description:a.info.description, isFallbackAdapter:a.info.isFallbackAdapter, features:[...a.features] } : null; });
  if (!adapter) {
    await page.screenshot({ path: resolve(out, 'no-adapter.png') });
    await writeFile(resolve(out, 'hardware-probe.json'), JSON.stringify({ browser:browser.version(), adapter:null, status:'BLOCKED', reason:'WebGPU requestAdapter returned null', errors }, null, 2) + '\n');
    console.log('BLOCKED: WebGPU requestAdapter returned null');
    process.exitCode = 2;
  } else {
  await page.waitForFunction(() => window.echo9?.ready || !document.querySelector('#error')?.hidden, null, { timeout: 90000 });
  await page.waitForTimeout(1200);
  if (!(await page.evaluate(() => window.echo9?.ready))) throw new Error('Renderer initialization failed: ' + errors.join('\n'));
  await page.waitForFunction(() => window.echo9.getState().presentedFrames > 0, null, { timeout: 90000 });
  const states = [];
  for (const view of (routeOnly ? [] : [1,2,3,4,5,6])) {
    const previousFrames = await page.evaluate(() => window.echo9.getState().presentedFrames);
    await page.evaluate(n => window.echo9.setView(n), view);
    await page.waitForFunction(({view,previousFrames}) => { const s=window.echo9.getState(); return s.presentedView===view && s.presentedFrames>previousFrames; }, {view,previousFrames}, { timeout: 90000 });
    await page.waitForTimeout(100);
    const state = await page.evaluate(() => window.echo9.getState?.() ?? null);
    if (!state?.ready) throw new Error('Renderer stopped: ' + errors.join('\n'));
    const pixelProbe = await page.evaluate(() => {
      const sample=document.createElement('canvas'); sample.width=64; sample.height=36; const ctx=sample.getContext('2d');
      ctx.drawImage(document.querySelector('#world'),0,0,64,36); const pixels=ctx.getImageData(0,0,64,36).data;
      let sum=0,sumSquares=0,min=255,max=0; for(let i=0;i<pixels.length;i+=4){const l=(pixels[i]+pixels[i+1]+pixels[i+2])/3;sum+=l;sumSquares+=l*l;min=Math.min(min,l);max=Math.max(max,l);}
      const count=pixels.length/4; return {mean:sum/count,variance:sumSquares/count-(sum/count)**2,min,max};
    });
    if(pixelProbe.variance<5 || pixelProbe.max-pixelProbe.min<20) throw new Error('Uniform or blank render in view '+view+': '+JSON.stringify(pixelProbe));
    states.push({...state,pixelProbe});
    await page.screenshot({ path: resolve(out, `view-${view}.png`) });
    console.log(`Captured view ${view}`);
  }
  let report = null;
  let finalPresentedState = null;
  const flightStates = [];
  if (benchmark) {
    await page.evaluate(() => window.echo9.startFlythrough());
    // Deliberately run the full wall-clock 60-second route, even for a fallback adapter.
    for (let step = 0; step < 12; step++) {
      await page.waitForTimeout(5050);
      flightStates.push(await page.evaluate(() => window.echo9.getState()));
      await writeFile(resolve(out, 'flight-progress.json'), JSON.stringify({artifactSha256,flightStates,hardwareAcceptance:'BLOCKED'}, null, 2) + '\n');
    }
    await page.waitForFunction(() => window.echo9.getReport().flythrough.status !== 'RUNNING', null, { timeout: software ? 120000 : 30000 });
    report = await page.evaluate(() => window.echo9.getReport());
    if (report.flythrough.status !== 'PASS') throw new Error('Flight did not complete with fixed configuration: ' + JSON.stringify(report.flythrough));
    // CPU route completion can precede the asynchronous software readback fence.
    // Observe a freshly presented goal frame before declaring the collection done.
    const completedFrames = await page.evaluate(() => window.echo9.getState().presentedFrames);
    await page.waitForFunction(n => window.echo9.getState().presentedFrames > n, completedFrames, {timeout:software ? 240000 : 30000});
    finalPresentedState = await page.evaluate(() => window.echo9.getState());
    if(finalPresentedState.time!==60 || finalPresentedState.flight!==null || !finalPresentedState.ready)throw new Error('Final route frame was not presented');
  }
  const result = { capturedAt: new Date().toISOString(), artifactSha256, url, browser: browser.version(), viewport: {width:1920,height:1080}, softwareFlag: software,
    adapter, routeOnly, hardwareAcceptance: !adapter || adapter.isFallbackAdapter || /swiftshader|llvmpipe/i.test(JSON.stringify(adapter)) ? 'BLOCKED' : 'PENDING_REFERENCE_GPU', states, flightStates, finalPresentedState, report, errors,
    unexpectedRequests: requests.filter(r => !r.startsWith(new URL(url).origin) && !r.startsWith('data:')) };
  await writeFile(resolve(out, 'browser-report.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (errors.length || result.unexpectedRequests.length) process.exitCode = 1;
  }
} catch (error) {
  const runtime = await page.evaluate(() => ({state:window.echo9?.getState(),report:window.echo9?.getReport()})).catch(() => null);
  await writeFile(resolve(out, 'capture-failure.json'), JSON.stringify({artifactSha256,message:error.message,errors,runtime}, null, 2) + '\n');
  console.error(error); process.exitCode = 1;
} finally { await context.close(); await browser.close(); }
