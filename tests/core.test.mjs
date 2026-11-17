import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {build} from '../scripts/build.mjs';
import {seededRandom,lookAngles,viewMatrix,perspective,multiply,constrainPosition,sampleFlight,VIEWS,WORLD_SEED,FLIGHT_POINTS} from '../src/math.js';
import {buildScene} from '../src/scene.js';
import {Geometry} from '../src/geometry.js';
import {buildCorridor,CORRIDOR_HERO,CORRIDOR_LIGHTS,CORRIDOR_PROBE} from '../src/corridor.js';

const digest=bytes=>createHash('sha256').update(Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength)).digest('hex');
const near=(a,b,tolerance=1e-5)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≠ ${b}`);

test('seeded random has a stable, distinct sequence and a bounded range',()=>{
  const random=seededRandom(WORLD_SEED),same=seededRandom(WORLD_SEED),other=seededRandom(WORLD_SEED+1);
  const samples=Array.from({length:1024},()=>random());
  assert.deepEqual(samples,Array.from({length:1024},()=>same()));
  assert.notEqual(samples[0],other());assert.ok(samples.every(x=>x>=0&&x<1));
  near(samples.reduce((a,b)=>a+b,0)/samples.length,.5,.05);
});
test('projection maps the near/far clipping planes to WebGPU 0..1 depth',()=>{
  const p=new Float32Array(16);perspective(p,Math.PI/3,16/9,.1,700);
  const project=z=>(p[10]*z+p[14])/(-z);
  near(project(-.1),0);near(project(-700),1);
  assert.ok(p[0]>0&&p[5]>p[0]);
});
test('lookAngles and viewMatrix agree for all six views',()=>{
  for(const {position,target} of VIEWS){
    const [yaw,pitch]=lookAngles(position,target),v=new Float32Array(16);viewMatrix(v,position,yaw,pitch);
    const transformed=[0,0,0];for(let r=0;r<3;r++)transformed[r]=v[r]*target[0]+v[4+r]*target[1]+v[8+r]*target[2]+v[12+r];
    near(transformed[0],0,1e-4);near(transformed[1],0,1e-4);assert.ok(transformed[2]<0);
    for(let r=0;r<3;r++)near(v[r]*position[0]+v[4+r]*position[1]+v[8+r]*position[2]+v[12+r],0,1e-4);
  }
});
test('matrix multiplication preserves a known translation through identity',()=>{
  const identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),matrix=identity.slice();matrix[12]=3;matrix[13]=-2;matrix[14]=7;
  assert.deepEqual(multiply(new Float32Array(16),identity,matrix),matrix);
});
test('architectural bounds allow one uninterrupted route and protect major solids',()=>{
  for(let z=-20;z<127.5;z+=.2){const p=[0,3.5,z];constrainPosition(p);near(p[2],z);near(p[0],0);}
  assert.equal(constrainPosition([100,0,40])[0],3.75);
  assert.equal(constrainPosition([15,4,21.2])[0],3.75,'rear bulkhead cannot be crossed outside the opening');
  assert.equal(constrainPosition([18,5.5,3])[1],6.2,'gallery slab stays solid');
  assert.equal(constrainPosition([23,5.5,100])[1],6.1,'hangar catwalk stays solid');
  const p=[.5,2,0],boxes=[[-1,0,-1,1,4,1]];constrainPosition(p,boxes);assert.ok(p[0]>=1.45||p[0]<=-1.45||p[2]>=1.45||p[2]<=-1.45);
  assert.ok(constrainPosition([0,-10,-100])[1]>=1.6);
});
test('wide-room bulkhead collisions stop forward motion without sideways teleporting',()=>{
  const obstacles=[];
  const previous=new Float32Array([15,3,20.6]),next=new Float32Array([15.1,3,21.1]);
  constrainPosition(next,obstacles,previous);near(next[0],15.1);near(next[2],20.8);
  // Repeated pushes use Float32 storage, as the actual camera does.
  for(let frame=0;frame<60;frame++){
    previous.set(next);next[2]+=.25;constrainPosition(next,obstacles,previous);near(next[0],15.1);near(next[2],20.8);
  }
  previous.set([18,3,72.2]);next.set([18.1,3,71.7]);constrainPosition(next,obstacles,previous);near(next[0],18.1);near(next[2],72);
  for(let frame=0;frame<60;frame++){
    previous.set(next);next[2]-=.25;constrainPosition(next,obstacles,previous);near(next[0],18.1);near(next[2],72);
  }
  previous.set([0,3,20.6]);next.set([0,3,21.1]);constrainPosition(next,obstacles,previous);near(next[2],21.1);
  previous.set([0,3,72.2]);next.set([0,3,71.7]);constrainPosition(next,obstacles,previous);near(next[2],71.7);
});
test('60-second route is finite, deterministic and reaches both approved endpoints',()=>{
  const p=new Float32Array(3),t=new Float32Array(3),again=new Float32Array(3);
  sampleFlight(0,p,t);assert.deepEqual(Array.from(p),FLIGHT_POINTS[0].p.map(Math.fround));
  sampleFlight(60,p,t);assert.deepEqual(Array.from(p),FLIGHT_POINTS.at(-1).p.map(Math.fround));
  for(let seconds=0;seconds<=60;seconds+=.125){sampleFlight(seconds,p,t);sampleFlight(seconds,again,t);assert.deepEqual(p,again);assert.ok([...p,...t].every(Number.isFinite));assert.ok(Math.abs(p[0])<27&&p[1]>1.6&&p[2]>-23&&p[2]<129);}
});
test('procedural geometry is deterministic, finite, structurally rich and changes with seed',()=>{
  const scene=buildScene(),same=buildScene(),other=buildScene(WORLD_SEED+1);
  assert.equal(digest(scene.vertices),digest(same.vertices));assert.equal(digest(scene.dust),digest(same.dust));assert.notEqual(digest(scene.vertices),digest(other.vertices));
  assert.ok(scene.triangles>10000);assert.equal(scene.vertices.length,scene.triangles*36);assert.ok(scene.vertices.every(Number.isFinite));assert.equal(scene.dust.length,850*4);assert.ok(scene.obstacles.length>25);
  for(const saved of VIEWS){
    const position=saved.position.slice();constrainPosition(position,scene.obstacles);assert.deepEqual(position,saved.position,'saved view must not be displaced by new colliders');
  }
  const insideInstrument=[0,6.7,-7.3];constrainPosition(insideInstrument,scene.obstacles);
  for(const box of scene.instrumentBounds){
    const inside=insideInstrument[0]>box[0]-.45&&insideInstrument[0]<box[3]+.45&&insideInstrument[1]>box[1]-.45&&insideInstrument[1]<box[4]+.45&&insideInstrument[2]>box[2]-.45&&insideInstrument[2]<box[5]+.45;
    assert.equal(inside,false,'manual camera is kept outside optical assembly');
  }
  const pathPosition=new Float32Array(3),pathTarget=new Float32Array(3);
  for(let seconds=0;seconds<=60;seconds+=.1){
    sampleFlight(seconds,pathPosition,pathTarget);const constrained=Array.from(pathPosition);constrainPosition(constrained,scene.obstacles);
    for(let axis=0;axis<3;axis++)near(constrained[axis],pathPosition[axis],.001);
    // Collision-free is insufficient for a cinematic route: retain a four-metre
    // clearance from the optical assembly so a nearby arch cannot fill the frame.
    for(const box of scene.instrumentBounds){
      const dx=Math.max(box[0]-pathPosition[0],0,pathPosition[0]-box[3]);
      const dy=Math.max(box[1]-pathPosition[1],0,pathPosition[1]-box[4]);
      const dz=Math.max(box[2]-pathPosition[2],0,pathPosition[2]-box[5]);
      assert.ok(Math.hypot(dx,dy,dz)>=4,`instrument too close at ${seconds.toFixed(2)} seconds`);
    }
  }
  for(let i=0;i<scene.vertices.length;i+=12){const length=Math.hypot(scene.vertices[i+3],scene.vertices[i+4],scene.vertices[i+5]);assert.ok(length<1.001);}
});
test('corridor is separately seeded, physically tessellated and has valid PBR attributes',()=>{
  const corridor=buildCorridor(),again=buildCorridor(),different=buildCorridor((WORLD_SEED^0xC0771D0)+1);
  assert.equal(digest(corridor.vertices),digest(again.vertices));assert.notEqual(digest(corridor.vertices),digest(different.vertices));
  assert.ok(corridor.triangles>50000,'architecture is actually tessellated');assert.equal(corridor.vertices.length,corridor.triangles*36);
  let bevelNormals=0,emissiveVertices=0,underfloorVertices=0;
  for(let i=0;i<corridor.vertices.length;i+=12){
    const v=corridor.vertices;assert.ok(v.subarray(i,i+12).every(Number.isFinite));
    near(Math.hypot(v[i+3],v[i+4],v[i+5]),1,.001);
    if(Math.max(Math.abs(v[i+3]),Math.abs(v[i+4]),Math.abs(v[i+5]))<.92)bevelNormals++;
    if(v[i+9]>0)emissiveVertices++;
    if(v[i+1]<-.1)underfloorVertices++;
    assert.ok(v[i+10]>=.18&&v[i+10]<=.95,'perceptual roughness in a physical range');assert.ok(v[i+11]>=0&&v[i+11]<=1,'metal fraction in 0..1');
  }
  assert.ok(bevelNormals>10000,'real angled faces and smooth pipe normals');assert.ok(underfloorVertices>1000,'recessed floor geometry exists below the grating');assert.ok(emissiveVertices>0);
  assert.deepEqual(VIEWS[3].position,CORRIDOR_HERO.position);assert.deepEqual(VIEWS[3].target,CORRIDOR_HERO.target);
  assert.equal(CORRIDOR_LIGHTS.length,2);assert.equal(CORRIDOR_PROBE.mips,Math.log2(CORRIDOR_PROBE.size)+1);
  assert.ok(CORRIDOR_LIGHTS.every(light=>light.position.every(Number.isFinite)&&light.far>1&&light.fov>0&&light.fov<180));
  assert.ok(CORRIDOR_PROBE.position.every((v,i)=>v>CORRIDOR_PROBE.min[i]&&v<CORRIDOR_PROBE.max[i]));
});
test('flared corridor exit has an opaque pressure shell in every cross-sectional direction',()=>{
  const corridor=buildCorridor(),range=corridor.exitShellRange;
  const vertices=corridor.vertices.subarray(range.firstVertex*12,(range.firstVertex+range.vertexCount)*12);
  function rayHitsTriangle(origin,direction,offset){
    const a=Array.from(vertices.subarray(offset,offset+3)),b=Array.from(vertices.subarray(offset+12,offset+15)),c=Array.from(vertices.subarray(offset+24,offset+27));
    const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
    const edge1=sub(b,a),edge2=sub(c,a),p=cross(direction,edge2),determinant=dot(edge1,p);if(Math.abs(determinant)<1e-9)return false;
    const inverse=1/determinant,t=sub(origin,a),u=dot(t,p)*inverse;if(u<-.00001||u>1.00001)return false;
    const q=cross(t,edge1),v=dot(direction,q)*inverse;if(v<-.00001||u+v>1.00001)return false;
    return dot(edge2,q)*inverse>0;
  }
  for(const z of [66.3,67.2,68.9,70.4,71.9])for(let angle=0;angle<64;angle++){
    const theta=angle/64*Math.PI*2,direction=[Math.cos(theta),Math.sin(theta),0];let hit=false;
    for(let offset=0;offset<vertices.length;offset+=36)if(rayHitsTriangle([0,3,z],direction,offset)){hit=true;break;}
    assert.ok(hit,`unskinned exit at z=${z}, angle=${angle}`);
  }
});
test('original approved flight and all saved cameras remain clear of the new corridor',()=>{
  // Golden route fingerprint from baseline 7e967f0. This task may not move the flight.
  assert.equal(createHash('sha256').update(JSON.stringify(FLIGHT_POINTS)).digest('hex'),'1e7eefbd8441973ef80a658eb488f9603719b402c44d4462ea505233ffad272a');
  const legacy=buildScene(),corridor=buildCorridor(),obstacles=legacy.obstacles.concat(corridor.obstacles),p=new Float32Array(3),t=new Float32Array(3);
  for(let seconds=0;seconds<=60;seconds+=.025){sampleFlight(seconds,p,t);const constrained=Array.from(p);constrainPosition(constrained,obstacles);for(let axis=0;axis<3;axis++)near(constrained[axis],p[axis],.001);}
  for(const saved of VIEWS){const p=saved.position.slice();constrainPosition(p,obstacles);assert.deepEqual(p,saved.position);}
  const stopped=constrainPosition([-3.5,1.7,28.2],obstacles);assert.ok(stopped[0]>-2.9||stopped[2]<27||stopped[2]>29,'new service cabinet blocks manual flight');
});
test('cuboid helper produces twelve triangles and outward normals',()=>{
  const g=new Geometry();g.box(0,0,0,2,2,2,[1,1,1]);const vertices=g.finish();assert.equal(g.triangles,12);
  for(let i=0;i<vertices.length;i+=12){const dot=vertices[i]*vertices[i+3]+vertices[i+1]*vertices[i+4]+vertices[i+2]*vertices[i+5];near(dot,1);}
});
test('build is byte-for-byte reproducible and standalone, with no external resources',async()=>{
  const a=await build(),b=await build();assert.equal(a.html,b.html);assert.equal(a.html,await readFile(new URL('../index.html',import.meta.url),'utf8'));
  assert.equal((a.html.match(/<script\b/g)||[]).length,1);assert.ok(a.html.includes('type="module"'));assert.ok(!a.html.includes('/*__SCRIPT__*/'));assert.ok(!a.html.includes('/*__CSS__*/'));
  for(const attribute of a.html.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*(?:src|href)\s*=\s*"([^"]*)"/gi))assert.ok(attribute[1].startsWith('data:'),'all embedded resources must be inline');
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(a.html));assert.ok(!/url\(\s*['"]?(?:https?:|\/\/)/i.test(a.html));
  assert.ok(!/^import\s/m.test(a.html));assert.ok(a.bytes>0);assert.ok(a.gzipBytes<a.bytes);assert.ok(a.html.includes('window.echo9='));
});
