// Phase4B selected independent actual-triangle clearance diagnostic (no GPU).
import {writeFile} from 'node:fs/promises';
import {buildCorridor,CORRIDOR_HERO} from '../src/corridor.js';
import {sampleFlight,VIEWS,FLIGHT_POINTS} from '../src/math.js';
const corridor=buildCorridor(),vertices=corridor.vertices;
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
function nearest(point,limit=Infinity){
 let result=null,best2=limit*limit;
 for(let i=0;i<triangles.length;i++){
  const t=triangles[i],r=Math.sqrt(best2);
  if(point[0]<t.min[0]-r||point[0]>t.max[0]+r||point[1]<t.min[1]-r||point[1]>t.max[1]+r||point[2]<t.min[2]-r||point[2]>t.max[2]+r)continue;
  const distance2=triangleDistance2(point,...t.points);if(distance2<best2){best2=distance2;result={distance:Math.sqrt(distance2),triangle:i,point:point.slice()};}
 }return result;
}
const p=new Float32Array(3),target=new Float32Array(3);let route=null,speedBound=0;
for(let i=0;i<FLIGHT_POINTS.length-1;i++){
 const a=FLIGHT_POINTS[Math.max(0,i-1)].p,b=FLIGHT_POINTS[i].p,c=FLIGHT_POINTS[i+1].p,d=FLIGHT_POINTS[Math.min(i+2,FLIGHT_POINTS.length-1)].p;
 const bounds=[0,1,2].map(axis=>{
  const A=1.5*(-a[axis]+3*b[axis]-3*c[axis]+d[axis]),B=2*a[axis]-5*b[axis]+4*c[axis]-d[axis],C=.5*(-a[axis]+c[axis]),times=[0,1],turn=-B/(2*A);if(turn>0&&turn<1)times.push(turn);
  return Math.max(...times.map(t=>Math.abs((A*t*t+B*t+C)/(60/(FLIGHT_POINTS.length-1)))));
 });speedBound=Math.max(speedBound,Math.hypot(...bounds));
}
for(let sample=0;sample<=4800;sample++){
 const seconds=sample*.0125;sampleFlight(seconds,p,target);const hit=nearest(Array.from(p),route?.distance??Infinity);if(hit)route={...hit,seconds};
}
let walking=null;for(let z=23;z<=72;z+=.05){const hit=nearest([0,1.72,z],walking?.distance??Infinity);if(hit)walking=hit;}
const report={selectedC:nearest([-1.2,1.72,25.6]),walkingCentreline:{height:1.72,stepMetres:.05,sampleMinimum:walking,continuousClearanceLowerBound:walking.distance-.025},scope:'Double-sided distance to actual baked corridor triangles only; full unchanged 60s route and six saved cameras. Legacy-sector meshes covered separately by baseline regression.',triangleCount:corridor.triangles,routeSamples:4801,stepSeconds:.0125,routeSampleMinimum:route,analyticSpeedBoundMetresPerSecond:speedBound,maximumDistanceToNearestTimeSample:speedBound*.0125/2,continuousRouteClearanceLowerBound:route.distance-speedBound*.0125/2,requiredCameraRadius:.45,hero:nearest(CORRIDOR_HERO.position),savedViews:VIEWS.map((v,i)=>({view:i+1,...nearest(v.position)}))};
await writeFile('docs/qa/overhaul-v1/iteration-4b/selected/verification/actual-mesh-clearance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
