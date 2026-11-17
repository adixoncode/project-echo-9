// A tiny dependency-free math layer. Matrices are column major, WebGPU depth is 0..1.
export function seededRandom(seed = 0xecc009) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let n = state;
    n = Math.imul(n ^ n >>> 15, n | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
export const clamp = (n, low, high) => Math.max(low, Math.min(n, high));
export const mix = (a, b, t) => a + (b - a) * t;
export function normalize(v) {
  const l = Math.hypot(...v) || 1;
  return v.map(n => n / l);
}
export function cross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
export const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export function multiply(out, a, b) {
  for (let c=0;c<4;c++) for (let r=0;r<4;r++) {
    out[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  }
  return out;
}
export function perspective(out, fov, aspect, near, far) {
  out.fill(0); const f=1/Math.tan(fov/2);
  out[0]=f/aspect; out[5]=f; out[10]=far/(near-far); out[11]=-1; out[14]=near*far/(near-far);
  return out;
}
export function viewMatrix(out, position, yaw, pitch) {
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
  const rx=cy, rz=sy, ux=sy*sp, uy=cp, uz=-cy*sp, bx=-sy*cp, by=sp, bz=cy*cp;
  out[0]=rx;out[1]=ux;out[2]=bx;out[3]=0;
  out[4]=0;out[5]=uy;out[6]=by;out[7]=0;
  out[8]=rz;out[9]=uz;out[10]=bz;out[11]=0;
  out[12]=-rx*position[0]-rz*position[2];
  out[13]=-ux*position[0]-uy*position[1]-uz*position[2];
  out[14]=-bx*position[0]-by*position[1]-bz*position[2];out[15]=1;
  return out;
}
export function lookAngles(position, target) {
  const dx=target[0]-position[0],dy=target[1]-position[1],dz=target[2]-position[2];
  return [Math.atan2(dx,-dz),-Math.atan2(dy,Math.hypot(dx,dz))];
}
// Piecewise cubic interpolation gives a reproducible path with no accumulating integration drift.
export function catmull(out, a, b, c, d, t) {
  const t2=t*t,t3=t2*t;
  for(let i=0;i<3;i++) out[i]=.5*((2*b[i])+(-a[i]+c[i])*t+(2*a[i]-5*b[i]+4*c[i]-d[i])*t2+(-a[i]+3*b[i]-3*c[i]+d[i])*t3);
  return out;
}
export const WORLD_SEED = 0xecc009;
export const VIEWS = [
  {name:'THE OBSERVATORY',sector:'01 / KEPLER DECK',position:[0,5.8,16],target:[0,9,-23],description:'The last light of a forgotten orbit.'},
  {name:'A WORLD WITHOUT END',sector:'01 / PANORAMIC ARRAY',position:[-10,7,-4],target:[2,12,-42],description:'Asterion. Six billion years of weather.'},
  {name:'THE LISTENING ARRAY',sector:'01 / RESEARCH GALLERY',position:[17,9.5,7],target:[-3,3,-7],description:'Still listening. Still waiting.'},
  {name:'SERVICE SPINE',sector:'02 / MAINTENANCE',position:[-2.35,1.72,27.5],target:[-13.5,1.78,61],description:'Follow the red pulse into the dark.'},
  {name:'THE SILENT HANGAR',sector:'03 / DOCKING BAY',position:[-14,7,81],target:[5,6,108],description:'Departure clearance never came.'},
  {name:'VESSEL E-09',sector:'03 / SALVAGE PLATFORM',position:[16,5.5,112],target:[-3,4.2,101],description:'An unfinished journey, held in suspension.'}
];
export const FLIGHT_POINTS = [
  {p:[0,5.8,16],t:[0,9,-23]}, {p:[-8,6.5,4],t:[1,11,-32]},
  {p:[-11,8,-7],t:[6,12,-40]}, {p:[-9,8,6],t:[-4,3,-6]},
  {p:[5,5.5,15],t:[0,4,24]}, {p:[0,3.5,27],t:[0,3.5,52]},
  {p:[0,3.5,45],t:[0,3.5,75]}, {p:[0,4.2,67],t:[0,5,96]},
  {p:[-10,7,82],t:[1,5,103]}, {p:[-13,9,105],t:[2,5,104]},
  {p:[14,8,115],t:[0,4,102]}, {p:[16,5.5,112],t:[-3,4.2,101]}
];
export function sampleFlight(seconds, outPosition, outTarget) {
  const segment=clamp(seconds/60,0,1)*(FLIGHT_POINTS.length-1), i=Math.min(Math.floor(segment),FLIGHT_POINTS.length-2),f=segment-i;
  const a=FLIGHT_POINTS[Math.max(0,i-1)],b=FLIGHT_POINTS[i],c=FLIGHT_POINTS[i+1],d=FLIGHT_POINTS[Math.min(i+2,FLIGHT_POINTS.length-1)];
  catmull(outPosition,a.p,b.p,c.p,d.p,f); catmull(outTarget,a.t,b.t,c.t,d.t,f);
}
// Bounds are deliberately architectural: the narrow spine opens into both large rooms.
export function constrainPosition(position, obstacles=[], previousPosition=null) {
  position[2]=clamp(position[2],-21.8,127.5);
  // Stop on the approached face, retaining lateral movement along the bulkhead.
  // The stop values are inside the broad room, avoiding Float32 threshold oscillation.
  if(previousPosition&&Math.abs(position[0])>3.75){
    if(previousPosition[2]<=20.85&&position[2]>20.8)position[2]=20.8;
    if(previousPosition[2]>=71.9&&position[2]<72)position[2]=72;
  }
  const z=position[2],limit=z<20.85?20.8:z<71.9?3.75:26;
  position[0]=clamp(position[0],-limit,limit);
  const corridorCeiling=4.9-Math.max(0,Math.abs(position[0])-2.3)*1.15+clamp((z-66)/6,0,1)*3.5;
  position[1]=clamp(position[1],1.6,z>72?25:z>24?corridorCeiling:24);
  if(z<18.5&&z>-19&&Math.abs(position[0])>16.05&&position[1]>4.65&&position[1]<6.2) {
    position[1]=position[1]<5.4?4.65:6.2;
  }
  if(z>72.5&&z<129.5&&Math.abs(position[0])>20.45&&position[1]>4.5&&position[1]<6.1) {
    position[1]=position[1]<5.3?4.5:6.1;
  }
  for(const box of obstacles) {
    const r=.45;
    if(position[0]>box[0]-r&&position[0]<box[3]+r&&position[1]>box[1]-r&&position[1]<box[4]+r&&position[2]>box[2]-r&&position[2]<box[5]+r){
      const distances=[position[0]-box[0]+r,box[3]+r-position[0],position[2]-box[2]+r,box[5]+r-position[2]];
      const i=distances.indexOf(Math.min(...distances));
      if(i<2)position[0]=i===0?box[0]-r:box[3]+r;else position[2]=i===2?box[2]-r:box[5]+r;
    }
  }
  return position;
}
