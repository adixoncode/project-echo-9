import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCorridor,CORRIDOR_HERO} from '../src/corridor.js';
import {sampleFlight,VIEWS,FLIGHT_POINTS,constrainPosition,normalize} from '../src/math.js';
import {firstMeshHit} from './helpers/corridor-ray.mjs';
const corridor=buildCorridor(),vertices=corridor.vertices;
const meshRange=range=>vertices.subarray(range.firstVertex*12,(range.firstVertex+range.vertexCount)*12);
// Independent closest-point-on-triangle calculation, including edge/vertex regions.
// Broad-phase bounds only reject triangles farther than the required clearance.
function triangleDistance2(p,a,b,c){
 const sub=(x,y)=>x.map((v,i)=>v-y[i]),dot=(x,y)=>x.reduce((s,v,i)=>s+v*y[i],0),ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap),distance=q=>dot(sub(p,q),sub(p,q));
 if(d1<=0&&d2<=0)return distance(a);
 const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);if(d3>=0&&d4<=d3)return distance(b);
 const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return distance(a.map((v,i)=>v+ab[i]*d1/(d1-d3)));
 const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);if(d6>=0&&d5<=d6)return distance(c);
 const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return distance(a.map((v,i)=>v+ac[i]*d2/(d2-d6)));
 const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return distance(b.map((v,i)=>v+(c[i]-v)*(d4-d3)/(d4-d3+d5-d6)));
 const inv=1/(va+vb+vc),v=vb*inv,w=vc*inv;return distance(a.map((q,i)=>q+ab[i]*v+ac[i]*w));
}
const triangles=[];
for(let i=0;i<vertices.length;i+=36){const points=[0,12,24].map(offset=>Array.from(vertices.subarray(i+offset,i+offset+3)));triangles.push({points,min:[0,1,2].map(axis=>Math.min(...points.map(p=>p[axis]))),max:[0,1,2].map(axis=>Math.max(...points.map(p=>p[axis])))});}
function assertClear(point,r,label,meshTriangles=triangles){
 for(let i=0;i<meshTriangles.length;i++){
  const t=meshTriangles[i];if(point.some((v,axis)=>v<t.min[axis]-r||v>t.max[axis]+r))continue;
  const d=triangleDistance2(point,...t.points);assert.ok(d>=r*r,`${label}: triangle${i} only${Math.sqrt(d).toFixed(5)}m from camera at${JSON.stringify(point)}`);
 }
}
test('4A actual corridor triangles clear the whole unchanged route and every saved camera sphere',()=>{
 const p=new Float32Array(3),target=new Float32Array(3);let previous=null,maxStep=0;
 // Every .0125s, with a .06m guard beyond the .45m camera sphere.
 // Bound each cubic segment's analytic velocity using its quadratic extrema;
 // no unsampled point can travel farther than .06m to its nearest sample.
 let speedBound=0;
 for(let i=0;i<FLIGHT_POINTS.length-1;i++){
  const a=FLIGHT_POINTS[Math.max(0,i-1)].p,b=FLIGHT_POINTS[i].p,c=FLIGHT_POINTS[i+1].p,d=FLIGHT_POINTS[Math.min(i+2,FLIGHT_POINTS.length-1)].p;
  const bounds=[0,1,2].map(axis=>{
   const A=1.5*(-a[axis]+3*b[axis]-3*c[axis]+d[axis]),B=2*a[axis]-5*b[axis]+4*c[axis]-d[axis],C=.5*(-a[axis]+c[axis]),times=[0,1],turn=-B/(2*A);if(turn>0&&turn<1)times.push(turn);
   return Math.max(...times.map(t=>Math.abs((A*t*t+B*t+C)/(60/(FLIGHT_POINTS.length-1)))));
  });speedBound=Math.max(speedBound,Math.hypot(...bounds));
 }
 assert.ok(speedBound*.0125/2<.06,'analytic continuous-route guard exceeds verified triangle margin');
 for(let sample=0;sample<=4800;sample++){
  sampleFlight(sample*.0125,p,target);if(previous)maxStep=Math.max(maxStep,Math.hypot(...p.map((v,i)=>v-previous[i])));assertClear(Array.from(p),.51,`t=${sample*.0125}`);previous=Array.from(p);
 }
 assert.ok(maxStep<=.12,`route sample gap${maxStep} exceeds the two-sided .06m guard`);
 for(const [index,view]of VIEWS.entries())assertClear(view.position,.45,`view${index+1}`);
 assertClear(CORRIDOR_HERO.position,.45,'canonical hero');
});
test('4A pressure thresholds have broad connected octagonal flanges, recessed webs and real axial thickness',()=>{
 assert.equal(corridor.construction.frames.length,3);
 for(const frame of corridor.construction.frames){
  const mesh=meshRange(frame);
  // All eight sectors are solid; probe the centre of each annular face from
  // both axial directions against actual triangles, including diagonal shoulders.
  for(let edge=0;edge<8;edge++){
   const next=(edge+1)%8,point=[0,1].map(axis=>(frame.inner[edge][axis]+frame.inner[next][axis]+frame.outer[edge][axis]+frame.outer[next][axis])/4);
   const front=firstMeshHit(mesh,[...point,frame.z-1],[0,0,1],2),back=firstMeshHit(mesh,[...point,frame.z+1],[0,0,-1],2);
   assert.ok(front&&back,`missing closed octagon sector${edge}`);assert.ok(back.world[2]-front.world[2]>1.20,`sector${edge} lacks structural depth`);
  }
  // Mid-jamb inner reveal: web retreats .17m from the flange's inner opening.
  const front=firstMeshHit(mesh,[2.9,2.4,frame.z-.53],[1,0,0],2),web=firstMeshHit(mesh,[2.9,2.4,frame.z],[1,0,0],2);
  assert.ok(front&&web);assert.ok(web.distance-front.distance>(frame.z<29?.09:.16),'web must be visibly recessed behind flange');
 }
});
test('4A maintenance pocket is recessed behind the jamb and structural occlusion remains physical',()=>{
 const pocket=firstMeshHit(vertices,[-2.9,2.8,33.85],[-1,0,0],3),jamb=firstMeshHit(vertices,[-2.9,2.8,35.3],[-1,0,0],3);
 assert.ok(pocket&&jamb);assert.ok(pocket.distance-jamb.distance>.65,'service equipment must sit behind the pressure plane');
 const frame=corridor.construction.frames.find(f=>f.z===35.3),mesh=meshRange(frame),source=[-1,4.3,31.8],receiver=[-4.0,2.4,36.7],delta=receiver.map((v,i)=>v-source[i]);
 assert.ok(firstMeshHit(mesh,source,normalize(delta),Math.hypot(...delta)),'pressure frame must cast real occlusion');
 assert.equal(firstMeshHit(vertices,[0,2,26],[0,0,1],46),null,'centre passage must remain genuinely open through far transition');
 // Manual contact is tested against both signed jambs and preserves tangential y.
 for(const frame of corridor.construction.frames)for(const side of [-1,1]){
  const innerX=frame.inner[2][0],p=constrainPosition([side*(innerX+.2),2.4,frame.z],corridor.obstacles);
  assert.equal(p[1],2.4);assert.ok(Math.abs(p[0])<=innerX-.449,'solid jamb must stop the camera at its .45m expanded inner face');
 }
});

test('4A upper shoulder and soffit collisions keep manual camera spheres outside the actual frame mesh',()=>{
 // Exact discovered regression, mirrored: original ceiling bounds admitted a
 // point only .23685m from/inside the pressure flange at a .45m camera radius.
 for(const side of [-1,1]){
  const original=[side*2.85,4.26,34.77],hit=firstMeshHit(vertices,original,[0,-1,0],.45);
  assert.ok(hit&&hit.distance<.24,'regression point must exercise the actual sloping flange');
  const stopped=constrainPosition(original.slice(),corridor.obstacles);
  assert.notDeepEqual(stopped,original,'manual motion must stop at the shoulder');assertClear(stopped,.44999,'discovered shoulder regression');
 }
 for(const frame of corridor.construction.frames){
  const sideX=frame.inner[3][0],topX=frame.inner[4][0],sideY=frame.inner[3][1],topY=frame.inner[4][1],mesh=meshRange(frame),frameTriangles=[];
  // These manual samples target each changed pressure frame. Retained small
  // overhead fittings keep their baseline collision simplification; the full
  // route, saved poses and exact discovered point use the entire corridor mesh.
  for(let i=0;i<mesh.length;i+=36){const points=[0,12,24].map(offset=>Array.from(mesh.subarray(i+offset,i+offset+3)));frameTriangles.push({points,min:[0,1,2].map(axis=>Math.min(...points.map(p=>p[axis]))),max:[0,1,2].map(axis=>Math.max(...points.map(p=>p[axis])))});}
  for(const side of [-1,1])for(const fraction of [0,.25,.5,.75,1])for(const offset of [-.65,-.30,0,.2,.4])for(const dz of [-1.2,-.95,-.6,0,.6,.95,1.2]){
   const x=topX+(sideX-topX)*fraction,y=topY-(topY-sideY)*fraction+offset;
   const stopped=constrainPosition([side*x,y,frame.z+dz],corridor.obstacles);assertClear(stopped,.44999,`frame${frame.z} shoulder${side},f${fraction},offset${offset},dz${dz}`,frameTriangles);
  }
  for(const x of [-1.5,0,1.5])for(const y of [4.5,4.75,4.9])for(const dz of [-1.2,-.6,0,.6,1.2]){
   const stopped=constrainPosition([x,y,frame.z+dz],corridor.obstacles);assertClear(stopped,.44999,`frame${frame.z} soffit`,frameTriangles);
  }
 }
});
