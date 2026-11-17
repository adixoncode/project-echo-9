import {Geometry} from './geometry.js';
import {seededRandom,WORLD_SEED} from './math.js';

export function buildScene(seed=WORLD_SEED){
  const g=new Geometry(),rand=seededRandom(seed),obstacles=[];
  const navy=[.045,.074,.1],metal=[.13,.19,.23],edge=[.25,.32,.34],dark=[.023,.037,.047];
  const cyan=[.12,.78,.94],ice=[.5,.85,.96],amber=[1,.42,.09],red=[1,.075,.04],white=[.83,.88,.84];
  const B=(...a)=>g.box(...a), L=(...a)=>g.beam(...a);
  const obstacle=(x,y,z,w,h,d)=>obstacles.push([x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2]);
  // Observatory: a cathedral-like shell built around a 44-metre panoramic window.
  B(0,-.65,-1,44,1.3,46,metal,0,1);
  B(0,-.01,-2,7.6,.06,42,[.16,.22,.25],0,1);
  for(const x of [-3.95,3.95])B(x,.045,-2,.065,.05,41,cyan,2.3);
  for(let z=-21;z<22;z+=3.5){
    for(const side of [-1,1]){
      B(side*13,.035,z,17,.035,.055,edge);B(side*20.7,.11,z,.5,.18,1.5,navy);
      B(side*20.71,.22,z,.075,.03,.9,amber,1.3);
    }
  }
  for(let i=0;i<4;i++){
    const z=-23+i*14.7;
    for(let j=0;j<18;j++){
      const a=j/18*Math.PI,b=(j+1)/18*Math.PI;
      const p=[Math.cos(a)*22,.35+Math.sin(a)*24,z],q=[Math.cos(b)*22,.35+Math.sin(b)*24,z];
      L(p,q,.48,metal,0,.7); // structural vaulted ribs
      L([p[0]*.976,p[1]*.986+.08,z+.42],[q[0]*.976,q[1]*.986+.08,z+.42],.055,ice,1.6);
      if(i<3 && j%3===0)L(p,[p[0],p[1],z+14.7],.22,navy);
    }
  }
  // Front glazing mullions are slender enough to leave the atmosphere and rings legible.
  for(const x of [-16,-8,0,8,16]){
    const top=Math.sqrt(1-(x/22)**2)*24;
    L([x,2.7,-23.1],[x,top,-23.1],.18,edge);
    L([x-.22,2.7,-23.04],[x-.22,top,-23.04],.032,cyan,.7);
  }
  for(const y of [3.1,13.5])L([-20.1,y,-23.05],[20.1,y,-23.05],.16,metal);
  B(0,1,-23.1,43,2,1,navy,0,2);
  for(let x=-20;x<=20;x+=2.8){
    B(x,1.05,-22.53,2.5,1.2,.07,metal,0,2);
    B(x,1.7,-22.45,1.8,.045,.04,cyan,1.8);
  }
  // Wraparound research galleries, railings, pressure ribs, and cable conduits.
  for(const side of [-1,1]){
    B(side*21.6,3.5,-1,.8,7,43,navy,0,2);
    B(side*18.9,5.5,-.5,5,.5,37,metal,0,1);
    B(side*16.45,6.65,-.5,.12,.12,37,edge);
    B(side*16.45,5.95,-.5,.08,.08,37,navy);
    for(let z=-18;z<=18;z+=4.5){
      B(side*16.45,6.1,z,.1,1.4,.1,edge);
      L([side*21,0,z],[side*16.8,5.3,z],.32,navy);
      B(side*21.02,2,z,.05,2.3,.28,cyan,2.2);
      for(let k=0;k<3;k++)B(side*21.02,3.5+k*.24,z,.06,.08,1.8,metal);
    }
    // Gently stepped stairs onto the side galleries; collision bounds keep the free camera above floors.
    for(let j=0;j<13;j++)B(side*18.8,j*.43,19-j*.57,4.2,.43,.6,metal,0,1);
    for(let k=0;k<3;k++)L([side*(20.8-k*.18),7,-20],[side*(20.8-k*.18),7,19],.11,edge);
  }
  // Massive rear pressure bulkhead with a continuously open spine entrance.
  for(const side of [-1,1])B(side*13.1,10,22,17.8,20,1.2,navy,0,2);
  B(0,15.2,22,9,10.5,1.2,metal,0,2);
  for(const x of [-4.35,4.35])B(x,4.5,21.3,.35,9,.9,edge);
  B(0,8.9,21.3,9,.35,.9,edge);
  for(const x of [-3.95,3.95])B(x,4.2,20.8,.06,8,.05,amber,2.2);
  B(0,8.2,20.8,7.8,.06,.05,amber,2.2);
  for(const side of [-1,1]){
    for(let i=0;i<4;i++)B(side*(6.5+i*3.5),12.5,21.28,2.9,8,.1,[.09,.14,.18],0,2);
    B(side*12.8,3.3,21.25,8.5,5.2,.2,metal,0,2);
    for(let i=0;i<6;i++)B(side*12.8,1.2+i*.62,21.1,7.5,.13,.15,dark);
  }
  // Instrument platform: brass-edged turntable, suspended optical ring and holographic planet.
  g.cylinder(0,.24,-6,6.4,.48,navy,64,0,1);
  g.cylinder(0,.52,-6,5.8,.15,metal,64,0,1);
  g.torus(0,.63,-6,5.45,.04,cyan,2.8);
  g.torus(0,.64,-6,4.9,.025,amber,1.6);
  for(let i=0;i<24;i++){
    const a=i/24*6.283;
    B(Math.sin(a)*5.9,.64,-6+Math.cos(a)*5.9,.12,.05,.45,i%3===0?amber:edge,i%3===0?1:0,0,a);
  }
  g.cylinder(0,1.2,-6,2.2,1.3,dark,48,0,2);g.cylinder(0,1.92,-6,2.5,.14,edge,48);
  g.torus(0,2.04,-6,2.3,.055,cyan,3.5);
  for(const side of [-1,1]){
    B(side*3.2,2.9,-7.2,.6,5.8,1,navy,0,2);B(side*3.2,3,-6.62,.09,4.5,.06,cyan,2);
    L([side*3.2,5.6,-7.2],[side*2.6,7.8,-7.2],.45,metal);
  }
  g.torus(0,6.7,-7.3,3.35,.26,edge,0,'vertical');
  g.torus(0,6.7,-7.06,3.13,.047,cyan,3.3,'vertical');
  g.sphere(0,4.35,-6,1.4,[.08,.45,.58],.65,32);
  g.torus(0,4.35,-6,2.25,.018,cyan,2.4);
  g.torus(0,4.35,-6,1.75,.018,ice,2,'vertical');
  obstacle(0,1.2,-6,4.4,2.4,4.4);
  // Coarse envelope of the optical ring and its tall fork supports. This deliberately
  // treats the occupied assembly as a solid rather than allowing near-camera clipping.
  const instrumentBounds=[[-3.8,2.6,-8.1,3.8,10.5,-6.45],[-3.9,0,-8,-2.4,8.2,-6.4],[2.4,0,-8,3.9,8.2,-6.4]];
  obstacles.push(...instrumentBounds);
  // Eight asymmetrical research stations establish human scale.
  const console=(x,z,rotation=0)=>{
    B(x,.65,z,3.2,1.3,1.8,navy,0,2,rotation);
    B(x,1.4,z,3.5,.2,2,edge,0,0,rotation);
    const transform=(u,y,v)=>[x+u*Math.cos(rotation)+v*Math.sin(rotation),y,z-u*Math.sin(rotation)+v*Math.cos(rotation)];
    g.quad(transform(-1.55,1.5,.7),transform(1.55,1.5,.7),transform(1.55,2.5,-.6),transform(-1.55,2.5,-.6),dark,0,3);
    g.quad(transform(-1.4,1.55,.62),transform(1.4,1.55,.62),transform(1.4,2.39,-.46),transform(-1.4,2.39,-.46),cyan,1.1,3);
    B(x,.6,z+.95,.1,1.2,.07,cyan,1.4);
    obstacle(x,1,z,3.5,2,2);
  };
  for(const side of [-1,1])for(let i=0;i<4;i++)console(side*(12.8+(i%2)*.9),-14+i*8.4,side*.2);
  // Floor light wells, freight cases, scattered but purposeful maintenance detail.
  for(const side of [-1,1])for(let i=0;i<5;i++){
    B(side*8.1,.035,-18+i*8,.75,.025,1.8,dark);B(side*8.1,.055,-18+i*8,.45,.025,1.5,ice,1.4);
  }
  for(const x of [-18,18]){
    B(x,.8,14.2,2.1,1.6,2.7,metal,0,2);obstacle(x,.8,14.2,2.1,1.6,2.7);
    for(const dx of [-.8,.8])B(x+dx,.85,14.2,.09,1.7,2.8,amber,.2);
  }
  const corridorStart=g.data.length/12;
  // Service spine: dense utility surfaces and alternating interrupted emergency light.
  B(0,-.4,46,9,.8,48,metal,0,1);
  B(0,8.15,46,9,.5,48,navy,0,2);
  for(const side of [-1,1]){
    B(side*4.5,4,46,.7,8,48,navy,0,2);
    for(let z=25;z<70;z+=4){
      B(side*4.08,3.7,z,.1,5.8,3.5,metal,0,2);
      B(side*3.97,1.1,z,.06,.08,2.6,amber,1.2);
      B(side*4.00,6.6,z,.1,.3,2.6,dark);
      for(let k=0;k<4;k++)B(side*3.9,2.1+k*.4,z,.13,.07,1.6,dark);
    }
    for(let k=0;k<4;k++){
      const x=side*(3.0+k*.3),y=6.6+(k%2)*.4;
      L([x,y,23],[x,y,71],.19,k===0?amber:metal,0);
      for(let z=26;z<70;z+=5)B(x,y,z,.3,.3,.16,edge);
    }
    B(side*2.8,.08,46,.055,.035,47,amber,1.5);
    for(let z=27;z<70;z+=5.8){
      B(side*4.03,4.6,z,.1,1.3,.18,ice,3);
      B(side*4.0,4.6,z,.13,1.7,.48,dark);
      B(side*3.88,4.6,z,.06,1.3,.16,z%2>1?amber:cyan,2.9);
    }
  }
  for(let z=24;z<71;z+=7.8){
    const points=[[-4.2,.1,z],[-4.2,5.8,z],[-2.8,7.8,z],[2.8,7.8,z],[4.2,5.8,z],[4.2,.1,z]];
    for(let i=0;i<points.length-1;i++)L(points[i],points[i+1],.27,edge,0,.48);
    L([-2.2,7.55,z],[2.2,7.55,z],.055,amber,2);
    B(0,.025,z,8,.05,.4,dark);
    for(let x=-3;x<=3;x+=.5)B(x,.06,z,.22,.04,.42,amber,.1,0,-.45);
  }
  // Recessed valve banks and overhead drooping cables.
  for(const side of [-1,1])for(let z=31;z<65;z+=14){
    B(side*3.85,2.4,z,.5,2.6,2.1,navy,0,2);
    g.torus(side*3.5,3.6,z,.52,.08,red,.35,'vertical',24);
    for(let j=0;j<5;j++)L([side*3.1,7.8,z+j*.1],[side*2.3,6.0,z+3+j*.1],.05,dark);
  }
  const corridorEnd=g.data.length/12;
  // Hangar: a huge modular truss volume, blue docking aperture and amber gantry.
  B(0,-.7,101,56,1.4,60,metal,0,1);
  B(0,27.8,101,56,1,60,dark,0,2);
  for(const side of [-1,1]){
    B(side*27.8,13.8,101,.8,28,60,navy,0,2);
    B(side*15.7,6.7,71,23,13.4,.8,navy,0,2); // leave spine entry open
    B(side*24.2,5.3,101,6.5,.65,57,metal,0,1);
    B(side*20.9,6.6,101,.1,.1,57,amber,.7);
    for(let z=74;z<=129;z+=7.5){
      B(side*26,12.8,z,1.3,25.6,1.3,metal,0,2);
      L([side*26,.5,z],[side*26,24,z+7],.45,edge);
      L([side*26,24,z],[side*26,.5,z+7],.45,navy);
      B(side*25.2,9,z,.1,4.2,.3,cyan,2);
      B(side*25.2,23,z,.12,.2,2.7,amber,2.5);
      for(let k=0;k<3;k++)B(side*27.2,3.2+k*4.7,z+3,.1,3.6,5.8,[.07,.105,.135],0,2);
    }
    for(const y of [10,18,25])L([side*25.7,y,72],[side*25.7,y,130],.3,navy);
  }
  for(let z=75;z<=127;z+=10.5){
    L([-26,25,z],[26,25,z],.6,metal,0,.9);
    L([-26,28,z],[26,28,z],.45,edge);
    for(let x=-24;x<26;x+=4)L([x,25,z],[x+4,28,z],.24,edge);
    B(0,24.6,z,12,.08,.18,ice,3.7);
    B(-17,24.6,z,6,.08,.12,cyan,2);B(17,24.6,z,6,.08,.12,cyan,2);
  }
  // The rear aperture is a luminous docking forcefield. Thin strips preserve the space view.
  B(-22.5,13,130,11,26,1.4,navy,0,2);B(22.5,13,130,11,26,1.4,navy,0,2);
  B(0,25.5,130,35,5,1.4,metal,0,2);B(0,2,130,35,4,1.4,navy,0,2);
  for(const x of [-16.8,16.8]){B(x,13,129.1,.65,23,1.1,edge);B(x,13,128.45,.12,22,.1,cyan,4);}
  for(const y of [3.7,23.5]){B(0,y,129.1,34,.6,1.1,metal);B(0,y,128.45,33,.1,.1,cyan,3.5);}
  for(let x=-16;x<=16;x+=2)B(x,13.6,129.7,.017,19.3,.025,cyan,.7);
  // Gantry crane, suspended hoist and a memorable asymmetrical salvage vessel.
  for(const x of [-18,18])L([x,20,76],[x,20,127],.6,amber);
  B(0,20.5,104,39,1.4,1.5,amber,0,2);
  for(let x=-18;x<=18;x+=2.2){L([x,19.8,103.2],[x+1.7,21.2,103.2],.12,dark);}
  B(-5,19,104,3,1.5,3,navy);L([-5,18.2,104],[-5,10,104],.09,edge);g.torus(-5,9.8,104,.45,.12,amber,0,'vertical',24);
  // A tall maintenance cradle provides an unambiguous floor reference under the floating ship.
  B(0,.22,103,19,.45,19,dark,0,1);
  for(const x of [-9.3,9.3])B(x,.47,103,.09,.035,19,amber,1.2);
  for(const z of [93.6,112.4])B(0,.47,z,18.6,.035,.09,amber,1.2);
  for(let z=94;z<=112;z+=1)for(const side of [-1,1])B(side*8.7,.48,z,.7,.04,.3,amber,.1,0,-.6);
  // Ship hull, cockpit, swept wings, exposed aft engine and service livery.
  B(0,4.7,102,4.7,2.2,12,[.32,.4,.4],0,2);
  B(0,5.85,99.6,3.8,.18,5.6,white);
  B(0,5.7,96.1,3.2,1.1,3,navy,0,2);
  // sloped cockpit canopy, rather than a simple box
  g.quad([-1.5,5.5,94.5],[1.5,5.5,94.5],[1.65,6.8,97.6],[-1.65,6.8,97.6],[.05,.22,.29],.35,5);
  L([-1.5,5.5,94.5],[-1.65,6.8,97.6],.12,edge);L([1.5,5.5,94.5],[1.65,6.8,97.6],.12,edge);
  B(0,6.82,97.65,3.5,.1,.12,white);
  for(const side of [-1,1]){
    g.quad([side*2,4.4,99],[side*8,3.8,104],[side*7.4,3.8,108],[side*2,4.4,106],metal,0,2);
    g.quad([side*2,4.15,99],[side*2,4.15,106],[side*7.4,3.55,108],[side*8,3.55,104],navy,0,2);
    L([side*8,3.8,104],[side*7.4,3.8,108],.18,amber,.2);
    B(side*2.7,4.2,105.5,1.7,1.7,5,navy,0,2);
    for(let k=0;k<4;k++)B(side*2.7,5.1,104+k*.7,1.8,.13,.2,edge);
    B(side*2.7,4.2,108.08,1.35,1.35,.09,dark);B(side*2.7,4.2,108.15,.85,.85,.1,cyan,2.7);
    B(side*2.45,5,100,.06,.3,6,amber,.6);
    L([side*1.5,3.8,98],[side*2.4,1,97],.23,edge);B(side*2.4,.85,97,1.3,.18,1.8,navy);
    L([side*1.5,3.8,106],[side*2.5,1,107],.23,edge);B(side*2.5,.85,107,1.3,.18,1.8,navy);
  }
  obstacle(0,4.5,102,5,4,12);
  obstacle(-5,4.1,104,6.4,1.1,9);obstacle(5,4.1,104,6.4,1.1,9);
  // Tool bays, tanks, cargo stacks, warning beacons and maintenance robots.
  for(let i=0;i<20;i++){
    const side=i%2?1:-1,x=side*(17+rand()*5),z=77+rand()*46,h=1.2+rand()*2.2;
    B(x,h/2,z,2.5,h,2.6,i%3?metal:navy,0,2);
    for(const dx of [-1,1])B(x+dx,h/2,z,.09,h+.06,2.7,amber,.05);
    B(x,h+.05,z,1.8,.08,1.9,dark);
    if(i%4===0){B(x,h+.3,z,.22,.4,.22,amber,3);}
    obstacle(x,h/2,z,2.5,h,2.6);
  }
  for(const side of [-1,1])for(let j=0;j<3;j++){
    g.cylinder(side*23.4,2.1,87+j*4,1.05,4.2,edge,20);
    g.torus(side*23.4,1,87+j*4,1.06,.08,amber,.2);
    g.torus(side*23.4,3.2,87+j*4,1.06,.08,amber,.2);
  }
  // Suspended fragments drift in the vertex shader; their seeded phase is packed into material.
  for(let i=0;i<38;i++){
    const z=76+rand()*49,x=(rand()-.5)*41,y=9+rand()*11;
    B(x,y,z,.1+rand()*.6,.07+rand()*.2,.2+rand()*.9,i%5?edge:amber,0,6+rand(),rand()*6.28);
  }
  // Small scattered ceiling debris and visible particulate points. Seeded, not re-randomized per frame.
  const dust=[];
  for(let i=0;i<850;i++){
    const z=-22+rand()*152,side=z>72?25:z>23?3.6:20;
    dust.push((rand()-.5)*side*2,1+rand()*(z>72?24:z>23?6:20),z,.3+rand()*.7);
  }
  return {vertices:g.finish(),triangles:g.triangles,corridorDrawRange:{firstVertex:corridorStart,vertexCount:corridorEnd-corridorStart},obstacles,instrumentBounds,dust:new Float32Array(dust),seed};
}
