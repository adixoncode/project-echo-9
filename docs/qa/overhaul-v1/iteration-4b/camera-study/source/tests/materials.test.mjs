import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCorridor,CORRIDOR_SURFACES} from '../src/corridor.js';
test('corridor material coordinates are finite, primitive-owned and cover all six authored surfaces',()=>{
 const c=buildCorridor(),families=new Set(),counts={};
 assert.equal(c.surfaces.length,c.vertices.length/12*8);
 for(let triangle=0;triangle<c.triangles;triangle++){
  const start=triangle*24,family=c.surfaces[start+3];families.add(family);counts[family]=(counts[family]||0)+1;
  for(let vertex=0;vertex<3;vertex++){
   const offset=start+vertex*8,record=c.surfaces.subarray(offset,offset+8);assert.ok(record.every(Number.isFinite));assert.equal(record[3],family,'material family cannot interpolate across a primitive');assert.ok(record.subarray(4,7).every(v=>v>0));
  }
 }
 assert.deepEqual([...families].sort(),Object.values(CORRIDOR_SURFACES).sort());
 // Thin top-facing members in the actual walking trench carry grating, while
 // dark flexible loops remain rubber. Family identity is not a world-space mask.
 let trench=0,rubber=0;
 for(let i=0;i<c.vertices.length;i+=12){const v=c.vertices,s=c.surfaces,j=i/12*8;if(s[j+3]===CORRIDOR_SURFACES.grate&&Math.abs(v[i])<2.1&&v[i+1]<.1)trench++;if(s[j+3]===CORRIDOR_SURFACES.rubber&&v[i+1]>2.5)rubber++;}
 assert.ok(trench>10000);assert.ok(rubber>1000);
});
