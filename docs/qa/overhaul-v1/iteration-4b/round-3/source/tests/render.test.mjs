import {test} from 'node:test';
import assert from 'node:assert/strict';
import {halfToNumber,summarizeHdrPixels,HDR_PARTICLE_BLEND,HDR_SKY_SHADER,HDR_MESH_SHADER} from '../src/hdr.js';
import {CORRIDOR_LIGHT_TABLE,CORRIDOR_LIGHTS,packCorridorLights} from '../src/corridor-lights.js';
import {CORRIDOR_SHADER} from '../src/corridor-shaders.js';
import {CORRIDOR_FINAL_SHADER,corridorComposeShader,corridorVolumeShader} from '../src/corridor-post-shaders.js';
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} ≠ ${b}`);
test('half-float diagnostics decode normal, subnormal, signed and nonfinite GPU values',()=>{
  assert.equal(halfToNumber(0x3c00),1);assert.equal(halfToNumber(0x4000),2);assert.equal(halfToNumber(0x7bff),65504);
  assert.equal(halfToNumber(1),2**-24);assert.equal(halfToNumber(0x0400),2**-14);
  assert.equal(halfToNumber(0xbc00),-1);assert.ok(Object.is(halfToNumber(0x8000),-0));
  assert.equal(halfToNumber(0x7c00),Infinity);assert.equal(halfToNumber(0xfc00),-Infinity);assert.ok(Number.isNaN(halfToNumber(0x7e00)));
});
test('HDR diagnostic reduction ignores padded rows and separates actual corridor coverage',()=>{
  const pixels=new Uint16Array(256);pixels.fill(0x7c00);pixels.set([0x4000,0x3c00,0x3800,0x3c00],0);pixels.set([0xbc00,0x7c00,0x7e00,0],128);
  const report=summarizeHdrPixels(pixels,1,2,256);
  assert.equal(report.maximum,2);assert.equal(report.minimum,-1);near(report.mean,.625);assert.equal(report.negativeValues,1);assert.equal(report.nonFiniteValues,2);assert.equal(report.finite,false);assert.equal(report.valuesAboveOne,1);
  assert.equal(report.corridor.maximum,2);assert.equal(report.corridor.rgbValues,3);near(report.corridor.mean,3.5/3);
});
test('transparent particles blend radiance without ever creating or erasing corridor coverage',()=>{
  const factors={zero:()=>0,one:()=>1,'src-alpha':a=>a,'one-minus-src-alpha':a=>1-a};
  for(const coverage of [0,.125,.5,1])for(const opacity of [0,.1,.5,.9,1]){
    const alpha=opacity*factors[HDR_PARTICLE_BLEND.alpha.srcFactor](opacity)+coverage*factors[HDR_PARTICLE_BLEND.alpha.dstFactor](opacity);near(alpha,coverage);
  }
  assert.equal(HDR_PARTICLE_BLEND.color.srcFactor,'src-alpha');assert.equal(HDR_PARTICLE_BLEND.color.dstFactor,'one-minus-src-alpha');
});
test('only the final corridor display pass tone-maps; material and scattering retain linear HDR',()=>{
  const calls=shader=>(shader.replace('fn tone(', 'fn declaredTone(').match(/\btone\(/g)||[]).length;
  assert.equal(calls(CORRIDOR_SHADER),0);assert.equal(calls(corridorVolumeShader(true)),0);assert.equal(calls(corridorComposeShader(true)),0);assert.equal(calls(CORRIDOR_FINAL_SHADER),1);
  assert.ok(HDR_SKY_SHADER.includes('legacyOutput(tone(color*vignette),color*vignette)'));
  assert.ok(HDR_MESH_SHADER.includes('legacyOutput(tone(color),color)'));
});
test('one authored light table packs the same fixture, shadow and shader positions/spectra',()=>{
  const packed=packCorridorLights();assert.equal(packed.byteLength,528);assert.equal(packed[128],CORRIDOR_LIGHT_TABLE.length);assert.equal(CORRIDOR_LIGHTS.length,2);
  CORRIDOR_LIGHT_TABLE.forEach((light,index)=>{
    for(let axis=0;axis<3;axis++){near(packed[index*16+axis],light.position[axis],1e-5);near(packed[index*16+8+axis],light.color[axis]);}
    near(Math.hypot(...light.direction),1);assert.ok(light.innerCos>light.outerCos);assert.ok(light.emission>0&&light.power>0);near(packed[index*16+15],light.emission,1e-5);
  });
  assert.deepEqual(CORRIDOR_LIGHTS.map(l=>l.shadow),[0,1]);assert.ok(CORRIDOR_LIGHT_TABLE.filter(l=>l.id.startsWith('red-')).every(l=>l.mount==='pendant'));
});
test('primary cones illuminate the intended rib front and foreground reflection receiver',()=>{
  for(const [index,point,normal] of [[0,[-3.9,2.4,53.7],[0,0,-1]],[1,[0,0,39],[0,1,0]],[7,[-.7,3,71.6],[0,0,-1]]]){
    const light=CORRIDOR_LIGHT_TABLE[index],delta=point.map((p,i)=>p-light.position[i]),length=Math.hypot(...delta),travel=delta.map(v=>v/length);
    const cone=travel.reduce((s,v,i)=>s+v*light.direction[i],0);assert.ok(cone>light.outerCos,`${light.id} misses its receiver`);
    assert.ok(travel.reduce((s,v,i)=>s-v*normal[i],0)>0,`${light.id} is behind its receiver normal`);
  }
});
