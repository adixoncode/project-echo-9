import {normalize,cross} from './math.js';
// All solid architecture is baked once into a shared vertex buffer. No runtime models.
export class Geometry {
  constructor(){this.data=[];this.triangles=0;}
  vertex(p,n,color,emission=0,material=0,ao=1){this.data.push(...p,...n,...color,emission,material,ao);}
  tri(a,b,c,n,color,emission=0,material=0,ao=1){this.vertex(a,n,color,emission,material,ao);this.vertex(b,n,color,emission,material,ao);this.vertex(c,n,color,emission,material,ao);this.triangles++;}
  quad(a,b,c,d,color,emission=0,material=0,ao=1){
    const n=normalize(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])));
    this.tri(a,b,c,n,color,emission,material,ao);this.tri(a,c,d,n,color,emission,material,ao);
  }
  box(x,y,z,w,h,d,color,emission=0,material=0,rotation=0){
    const c=Math.cos(rotation),s=Math.sin(rotation),p=[];
    for(const dz of [-1,1])for(const dy of [-1,1])for(const dx of [-1,1])p.push([x+dx*w*.5*c+dz*d*.5*s,y+dy*h*.5,z-dx*w*.5*s+dz*d*.5*c]);
    for(const ids of [[0,2,3,1],[4,5,7,6],[0,4,6,2],[1,3,7,5],[2,6,7,3],[0,1,5,4]])this.quad(...ids.map(i=>p[i]),color,emission,material);
  }
  beam(a,b,width,color,emission=0,depth=width,material=0){
    const dir=normalize(b.map((v,i)=>v-a[i])),u=normalize(cross(dir,Math.abs(dir[1])>.95?[1,0,0]:[0,1,0])),v=cross(dir,u);
    const p=[];
    for(const q of [a,b])for(const sv of [-1,1])for(const su of [-1,1])p.push(q.map((n,i)=>n+u[i]*su*width*.5+v[i]*sv*depth*.5));
    for(const ids of [[0,2,3,1],[4,5,7,6],[0,4,6,2],[1,3,7,5],[2,6,7,3],[0,1,5,4]])this.quad(...ids.map(i=>p[i]),color,emission,material);
  }
  cylinder(x,y,z,r,h,color,segments=24,emission=0,material=0){
    for(let i=0;i<segments;i++){
      const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
      const p=[x+Math.cos(a)*r,y-h/2,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y-h/2,z+Math.sin(b)*r],u=[q[0],y+h/2,q[2]],v=[p[0],y+h/2,p[2]];
      this.quad(p,v,u,q,color,emission,material);this.tri([x,y+h/2,z],u,v,[0,1,0],color,emission,material);this.tri([x,y-h/2,z],p,q,[0,-1,0],color,emission,material);
    }
  }
  torus(x,y,z,r,tube,color,emission=0,plane='horizontal',segments=72){
    const f=(a,b)=>{
      const rr=r+Math.cos(b)*tube;
      return plane==='vertical'?[x+Math.cos(a)*rr,y+Math.sin(a)*rr,z+Math.sin(b)*tube]:[x+Math.cos(a)*rr,y+Math.sin(b)*tube,z+Math.sin(a)*rr];
    };
    for(let i=0;i<segments;i++)for(let j=0;j<6;j++)this.quad(f(i/segments*6.283,j/6*6.283),f((i+1)/segments*6.283,j/6*6.283),f((i+1)/segments*6.283,(j+1)/6*6.283),f(i/segments*6.283,(j+1)/6*6.283),color,emission,0);
  }
  sphere(x,y,z,r,color,emission=0,segments=24){
    const f=(a,b)=>[x+Math.sin(b)*Math.cos(a)*r,y+Math.cos(b)*r,z+Math.sin(b)*Math.sin(a)*r];
    for(let i=0;i<segments;i++)for(let j=0;j<segments/2;j++){
      const a=i/segments*6.283,b=(i+1)/segments*6.283,c=j/(segments/2)*Math.PI,d=(j+1)/(segments/2)*Math.PI;
      this.quad(f(a,c),f(a,d),f(b,d),f(b,c),color,emission,4);
    }
  }
  finish(){return new Float32Array(this.data);}
}
