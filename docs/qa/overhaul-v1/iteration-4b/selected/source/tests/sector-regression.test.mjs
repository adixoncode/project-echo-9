// The owner limits Issue #2 to the corridor. Compare other sectors with the approved baseline.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildScene} from '../src/scene.js';
const baseline=JSON.parse(await readFile(new URL('../docs/qa/overhaul-v1/iteration-1/baseline-sector-hashes.json',import.meta.url),'utf8'));
const digest=array=>createHash('sha256').update(Buffer.from(array.buffer,array.byteOffset,array.byteLength)).digest('hex');
test('corridor overhaul preserves observatory and hangar geometry/material data from baseline',()=>{
 const scene=buildScene(baseline.seed);
 for(const [name,record] of Object.entries(baseline.sectors)){
  const [start,end]=record.floatRange;
  assert.equal(digest(scene.vertices.subarray(start,end)),record.sha256,`${name} changed outside approved scope`);
 }
});
test('corridor generation preserves the original world particle seed stream',()=>{
 const scene=buildScene(baseline.seed);
 assert.equal(digest(scene.dust),baseline.dustSha256,'new corridor generation consumed or changed the existing world RNG stream');
});
