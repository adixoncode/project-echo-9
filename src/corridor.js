import {Geometry} from './geometry.js';
import {CORRIDOR_LIGHTS,CORRIDOR_LIGHT_TABLE} from './corridor-lights.js';
export {CORRIDOR_LIGHTS} from './corridor-lights.js';
import {seededRandom,normalize,cross,WORLD_SEED} from './math.js';

// Corridor-only construction. Its RNG and material encoding do not touch the legacy world.
// Vertex material = (emission, perceptual roughness, metallic fraction), all in linear light.
export const CORRIDOR_HERO={position:[-2.35,1.72,27.5],target:[-13.5,1.78,61],verticalFov:64};
export const CORRIDOR_PROBE={position:[0,2.55,38],min:[-3.9,-.25,23],max:[3.9,5.6,72],size:128,mips:8};
export function buildCorridor(seed=WORLD_SEED^0xC0771D0){
  const random=seededRandom(seed),g=new Geometry(),obstacles=[];
  const paint=[.048,.055,.062],dark=[.017,.021,.026],alloy=[.32,.34,.35],steel=[.19,.215,.23],oxide=[.12,.045,.024];
  // Chamfered boxes have six broad faces, twelve real bevel strips and eight corners.
  // Profiles therefore catch narrow highlights even without a normal-map texture.
  function chamfer(center,size,b,color=paint,rough=.59,metal=.45,emission=0,basis=null){
    const h=size.map(v=>v*.5);b=Math.min(b,...h.map(v=>v*.8));
    const world=p=>basis?center.map((v,i)=>v+basis[0][i]*p[0]+basis[1][i]*p[1]+basis[2][i]*p[2]):p.map((v,i)=>v+center[i]);
    const face=points=>{
      const p=points.map(world),n=normalize(cross(p[1].map((v,i)=>v-p[0][i]),p[2].map((v,i)=>v-p[0][i])));
      const outward=p.reduce((sum,v)=>sum+v.reduce((s,q,i)=>s+(q-center[i])*n[i],0),0);
      if(outward<0)p.reverse();
      if(p.length===4)g.quad(...p,color,emission,rough,metal);
      else{const nn=normalize(cross(p[1].map((v,i)=>v-p[0][i]),p[2].map((v,i)=>v-p[0][i])));g.tri(...p,nn,color,emission,rough,metal);}
    };
    for(let a=0;a<3;a++)for(const sign of [-1,1]){
      const other=[0,1,2].filter(i=>i!==a),points=[];
      for(const [s,t] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[0,0,0];p[a]=sign*h[a];p[other[0]]=s*(h[other[0]]-b);p[other[1]]=t*(h[other[1]]-b);points.push(p);}face(points);
    }
    for(let a=0;a<3;a++)for(let bb=a+1;bb<3;bb++)for(const sa of [-1,1])for(const sb of [-1,1]){
      const c=3-a-bb,points=[];
      for(const [along,atA] of [[-1,true],[1,true],[1,false],[-1,false]]){const p=[0,0,0];p[a]=sa*(h[a]-(atA?0:b));p[bb]=sb*(h[bb]-(atA?b:0));p[c]=along*(h[c]-b);points.push(p);}face(points);
    }
    for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1])face([[sx*h[0],sy*(h[1]-b),sz*(h[2]-b)],[sx*(h[0]-b),sy*h[1],sz*(h[2]-b)],[sx*(h[0]-b),sy*(h[1]-b),sz*h[2]]]);
  }
  const box=(x,y,z,w,h,d,b=.035,col=paint,rough=.59,metal=.45,emission=0)=>chamfer([x,y,z],[w,h,d],b,col,rough,metal,emission);
  function profile(a,b,w,d,bevel=.035,col=paint,rough=.52,metal=.65){
    const direction=normalize(b.map((v,i)=>v-a[i])),u=normalize(cross(direction,Math.abs(direction[2])>.95?[0,1,0]:[0,0,1])),v=cross(u,direction);
    chamfer(a.map((q,i)=>(q+b[i])*.5),[w,Math.hypot(...b.map((q,i)=>q-a[i])),d],bevel,col,rough,metal,0,[u,direction,v]);
  }
  // Smooth tube normals, with actual curved centre-lines for elbows and cable loops.
  function tube(points,r,col=steel,rough=.38,metal=.9,sides=16){
    const ranges=[0,1,2].map(axis=>Math.max(...points.map(p=>p[axis]))-Math.min(...points.map(p=>p[axis])));
    const reference=[0,0,0];reference[ranges.indexOf(Math.min(...ranges))]=1;
    const rings=points.map((p,i)=>{
      const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dir=normalize(b.map((v,j)=>v-a[j]));
      const u=normalize(cross(dir,reference)),v=cross(dir,u);
      return Array.from({length:sides},(_,j)=>{const angle=j/sides*Math.PI*2,n=u.map((q,k)=>q*Math.cos(angle)+v[k]*Math.sin(angle));return {p:p.map((q,k)=>q+n[k]*r),n};});
    });
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){
      const a=rings[i][j],b=rings[i][(j+1)%sides],c=rings[i+1][(j+1)%sides],d=rings[i+1][j];
      for(const vertex of [a,b,c,a,c,d])g.vertex(vertex.p,vertex.n,col,0,rough,metal);g.triangles+=2;
    }
  }
  function clampPipe(x,y,z,r){
    const pts=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI*2;pts.push([x+Math.cos(a)*(r+.025),y+Math.sin(a)*(r+.025),z]);}tube(pts,.025,dark,.44,.85,8);
    box(x,y-r-.12,z,.22,.12,.16,.018,steel,.42,.8);
  }
  const octagon=[[-2.65,.0],[2.65,.0],[3.9,.85],[3.9,4.0],[2.5,5.6],[-2.5,5.6],[-3.9,4.0],[-3.9,.85]];
  // Layered pressure shell: discrete wall plates, sloped shoulders and a deep ceiling plenum.
  box(0,-.42,47.5,8.5,.5,49,.025,dark,.78,.2);
  for(const side of [-1,1]){
    for(let bay=0;bay<16;bay++){
      const z=24.5+bay*3,open=side===-1&&(bay===3||bay===9),back=side*(open?4.65:4.12);
      box(back,2.4,z,.22,3.3,2.92,.055,paint.map(v=>v*(.85+random()*.22)),.64,.28);
      if(open){
        for(const dz of [-1.45,1.45])box(side*4.02,2.1,z+dz,.9,3.7,.13,.04,steel,.44,.8);
        box(side*4.13,4.0,z,1.2,.14,3,.04,steel,.44,.8);box(side*4.2,.34,z,1.0,.18,3,.04,steel,.5,.8);
        for(let j=0;j<6;j++)box(side*4.45,.75+j*.45,z+.6,.32,.14,1.2,.025,dark,.48,.6);
      }else{
        // Full-height removable panels with raised perimeter lips and double-recessed centres.
        for(const dy of [-1.28,1.28])box(side*3.955,2.35+dy,z,.12,.075,2.64,.018,steel,.46,.8);
        for(const dz of [-1.32,1.32])box(side*3.955,2.35,z+dz,.12,2.6,.075,.018,steel,.46,.8);
        box(side*3.94,2.35,z,.08,2.3,2.37,.035,dark,.68,.35);
        box(side*3.87,2.4,z,.1,1.98,2.08,.07,paint,.7,.22);
        for(const dz of [-.78,.78]){
          const pts=[];for(let k=0;k<=12;k++){const t=k/12*Math.PI;pts.push([side*3.72,1.65+Math.sin(t)*.22,z+dz+Math.cos(t)*.12]);}tube(pts,.027,alloy,.38,.9,8);
        }
        for(const dy of [1.18,3.55])for(const dz of [-1.12,1.12])box(side*3.79,dy,z+dz,.09,.09,.09,.014,alloy,.34,.95);
      }
      // The lower diagonal section holds a separate bank of pipes and removable cowls.
      profile([side*2.7,.07,z-1.43],[side*3.88,.9,z-1.43],.13,2.85,.03,dark,.58,.65);
      profile([side*2.7,.07,z+1.43],[side*3.88,.9,z+1.43],.13,.12,.03,steel,.42,.8);
      if(z<66){
        profile([side*2.5,5.62,z],[side*3.96,4.0,z],.18,2.94,.04,dark,.64,.5);
        for(let k=0;k<3;k++)profile([side*(2.62+k*.32),5.48-k*.35,z-1.35],[side*(2.62+k*.32),5.48-k*.35,z+1.35],.13,.11,.018,steel,.48,.9);
      }
    }
    // Floor-level supply runs with large radiused elbows and joint collars.
    for(let j=0;j<3;j++){
      const x=side*(2.95+j*.22),y=.3+j*.2;
      tube([[x,y,23.2],[x,y,71.8]],.12+j*.018,j===1?alloy:steel,.35,.9,20);
      for(let z=25;z<72;z+=3)clampPipe(x,y,z,.12+j*.018);
    }
    // Upper pipes curve up from a valve bank, then turn along the overhead shoulder.
    for(let j=0;j<3;j++){
      const x=side*(3.25-j*.27),radius=.55+j*.09,startZ=side<0?40.5:30.5,pts=[[x,1.6,startZ+j*.25],[x,3.75-radius,startZ+j*.25]];
      for(let k=1;k<=10;k++){const a=Math.PI-k/10*Math.PI*.5;pts.push([x,3.75-radius+Math.sin(a)*radius,startZ+j*.25+radius+Math.cos(a)*radius]);}
      pts.push([x,3.75,71]);tube(pts,.115+j*.025,steel,.34,.9,20);
      for(let z=Math.max(34,startZ+radius+.5);z<70;z+=5.3)clampPipe(x,3.75,z,.115+j*.025);
    }
  }
  // Heavy octagonal I-section pressure ribs: chamfered web, two flanges, fastener lugs.
  const ribZ=[24.4,29.6,35.3,41.4,47.2,53.7,60.1,66.8,71.6];
  for(const z of ribZ)for(let j=0;j<8;j++){
    const rise=z>70?1.43:1;const a=[octagon[j][0],octagon[j][1]*rise,z],b=[octagon[(j+1)%8][0],octagon[(j+1)%8][1]*rise,z];
    profile(a,b,.34,.7,.045,paint,.45,.7);
    for(const dz of [-.38,.38])profile([a[0],a[1],z+dz],[b[0],b[1],z+dz],.53,.12,.028,steel,.39,.85);
    if(j===2||j===6)for(const y of [1.1,2.6,3.7])box(a[0]>0?3.65:-3.65,y,z,.2,.14,.8,.025,alloy,.33,.95);
  }
  // A service trench is genuinely open between grating bars; the underfloor structure is visible.
  box(0,-.22,47.5,4.3,.12,48,.025,dark,.78,.12);
  for(let z=23.25;z<72;z+=.19)box(0,.025,z,4.14,.08,.055,.012,steel,.36,.9);
  for(let x=-2.05;x<=2.05;x+=.27)box(x,-.035,47.5,.045,.1,48,.01,alloy,.42,.9);
  for(const x of [-2.18,2.18])box(x,.015,47.5,.17,.13,48,.018,steel,.3,.92);
  for(let z=24;z<72;z+=3.1){
    for(const side of [-1,1]){
      box(side*2.47,-.005,z,.43,.11,2.98,.025,paint,.49,.65);
      box(side*2.22,.075,z,.035,.025,2.8,.006,[.28,.11,.055],.53,.35);
    }
    box(0,.075,z,4.35,.045,.095,.012,dark,.45,.85);
  }
  // Deep overhead cable trays and asymmetric ceiling inspection modules.
  for(const x of [-1.95,1.55]){
    box(x,5.29,44.5,.45,.36,42,.04,dark,.61,.65);
    for(let z=24;z<66;z+=.42)box(x,5.08,z,.53,.08,.075,.014,steel,.46,.85);
  }
  for(let z=25;z<66;z+=3.1){
    box(-.15,5.62,z,2.5,.24,2.95,.065,paint,.68,.3);
    box(-.5,5.43,z,1.05,.12,1.68,.035,dark,.59,.7);
    for(let j=0;j<9;j++)box(-.5,5.35,z-.64+j*.16,.87,.06,.065,.012,steel,.44,.85);
    box(.57,5.43,z,.38,.1,1.65,.025,steel,.45,.8);
  }
  // Dark near-right service spine and a few deliberately non-mirrored utility cabinets.
  for(const [side,z,height] of [[-1,28.2,2.6],[1,38.5,1.9],[-1,46.4,2.1],[1,55.5,2.7]]){
    box(side*3.56,1.65,z,.55,height,1.45,.085,paint,.63,.35);
    box(side*3.23,1.7,z,.08,height-.3,1.15,.035,dark,.56,.6);
    if(z>30)box(side*3.15,1.95,z-.25,.045,.15,.13,.015,[.3,.24,.12],.3,.3,.28);
    for(let j=0;j<5;j++)box(side*3.16,1.14+j*.16,z+.25,.045,.045,.48,.008,steel,.4,.8);
    obstacles.push([Math.min(side*3.2,side*3.85),.3,z-.75,Math.max(side*3.2,side*3.85),3.1,z+.75]);
  }
  // Every scene-light housing and emitter is built from the same table as the shaders.
  for(const source of CORRIDOR_LIGHT_TABLE){
    const direction=source.direction,u=normalize(cross(direction,Math.abs(direction[1])>.95?[1,0,0]:[0,1,0])),v=cross(direction,u),basis=[u,v,direction];
    const back=source.position.map((p,i)=>p-direction[i]*.065),front=source.position.map((p,i)=>p+direction[i]*.045);
    if(source.mount==='pendant'){
      // Diffuser is visible from both axial directions; the dark housing sits above it.
      box(...source.position,...source.size,.035,source.color,.28,0,source.emission);
      box(source.position[0],source.position[1]+.22,source.position[2],.40,.12,.38,.025,dark,.5,.75);
      for(const dx of [-.145,.145])box(source.position[0]+dx,source.position[1],source.position[2],.025,.40,.28,.006,dark,.45,.8);
    }else{
      chamfer(back,[source.size[0]+.14,source.size[1]+.12,.17],.025,dark,.5,.75,0,basis);
      chamfer(front,[source.size[0],source.size[1],.035],.012,source.color,.28,0,source.emission,basis);
    }
    if(source.mount!=='wall')tube([[source.position[0],source.position[1]+.12,source.position[2]],[source.position[0],5.56,source.position[2]]],.025,steel,.4,.9,10);
  }
  // Offset wall cable loops, an exposed valve and a small field-repair plate.
  for(const side of [-1,1])for(const z of [32.1,44.6,58.4]){
    const pts=[];for(let k=0;k<=20;k++){const t=k/20;pts.push([side*3.75,3.35-Math.sin(t*Math.PI)*.42,z+t*2.2]);}tube(pts,.035,dark,.65,.15,10);
  }
  const valve=[];for(let k=0;k<=32;k++){const a=k/32*Math.PI*2;valve.push([3.12,2.2+Math.cos(a)*.24,38.1+Math.sin(a)*.24]);}tube(valve,.045,oxide,.55,.65,12);
  for(const [x,y,z] of [[3.5,2.2,38.1],[-3.4,2.7,46.4]])box(x,y,z,.4,.42,.5,.04,steel,.41,.85);
  // The flared exit needs a continuous pressure hull behind its structural profiles.
  // Without this skin, rays from the hangar escape between the low ceiling and tall rib.
  // Both axial ends remain open, and the skin lies outside the original flight clearance.
  const exitShellStart=g.data.length/12;
  const exitSections=[66.2,68.5,71.6,72.25].map(z=>{
    const rise=1+Math.max(0,Math.min(1,(z-66.8)/4.8))*.43;
    return octagon.map(([x,y])=>[x*1.055,y===0?-.25:y*rise+.2,z]);
  });
  for(let section=0;section<exitSections.length-1;section++)for(let edge=0;edge<8;edge++){
    const next=(edge+1)%8;
    g.quad(exitSections[section][edge],exitSections[section][next],exitSections[section+1][next],exitSections[section+1][edge],dark,0,.68,.3);
  }
  const exitShellRange={firstVertex:exitShellStart,vertexCount:g.data.length/12-exitShellStart};
  // Pressure transition at the far end remains open for the original flight path.
  for(const side of [-1,1])box(side*4.05,4,70.8,.35,8,.5,.07,dark,.6,.65);
  box(0,8,70.8,8.5,.4,.5,.08,steel,.43,.8);
  box(0,8.15,69.3,8.5,.2,5.7,.04,dark,.68,.3);
  return {vertices:g.finish(),triangles:g.triangles,obstacles,exitShellRange,seed,hero:CORRIDOR_HERO,probe:CORRIDOR_PROBE,lights:CORRIDOR_LIGHT_TABLE};
}
