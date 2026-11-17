import {COMMON} from './shaders.js';
import {CORRIDOR_LIGHTING_WGSL} from './corridor-lights.js';
export const CORRIDOR_SHADER='diagnostic(off, derivative_uniformity);\n'+COMMON+CORRIDOR_LIGHTING_WGSL+/* wgsl */`
struct CorridorIn {@location(0) position:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>,@location(4) local:vec4<f32>,@location(5) shape:vec4<f32>};
struct CorridorOut {@builtin(position) position:vec4<f32>,@location(0) world:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>,@location(4) local:vec4<f32>,@location(5) shape:vec4<f32>};
@vertex fn corridorVertex(input:CorridorIn)->CorridorOut{
  var o:CorridorOut;o.position=u.viewProjection*vec4(input.position,1.);o.world=input.position;o.normal=input.normal;o.color=input.color;o.material=input.material;o.local=input.local;o.shape=input.shape;return o;
}
fn fresnelSchlick(cosine:f32,f0:vec3<f32>)->vec3<f32>{return f0+(1.-f0)*pow(1.-clamp(cosine,0.,1.),5.);}
fn ggx(n:vec3<f32>,v:vec3<f32>,l:vec3<f32>,base:vec3<f32>,roughness:f32,metal:f32)->vec3<f32>{
  let h=normalize(v+l);let nv=max(dot(n,v),.001);let nl=max(dot(n,l),0.);let nh=max(dot(n,h),0.);let vh=max(dot(v,h),0.);
  let alpha=roughness*roughness;let alpha2=alpha*alpha;let denominator=nh*nh*(alpha2-1.)+1.;
  let distribution=alpha2/(3.14159265*denominator*denominator+.00001);
  let visibility=.5/(nl*sqrt(nv*nv*(1.-alpha2)+alpha2)+nv*sqrt(nl*nl*(1.-alpha2)+alpha2)+.0001);
  let f=fresnelSchlick(vh,mix(vec3(.04),base,metal));
  return ((1.-f)*(1.-metal)*base/3.14159265+distribution*visibility*f)*nl;
}
fn directRadiance(p:vec3<f32>,n:vec3<f32>,v:vec3<f32>,base:vec3<f32>,rough:f32,metal:f32,receiverNormal:vec3<f32>)->vec3<f32>{
  var color=vec3(.00075,.0011,.0016)*base;
  for(var i=0;i<i32(corridorLights.info.x);i++){
    let delta=corridorLights.entries[i].positionPower.xyz-p;let l=normalize(delta);
    color+=ggx(n,v,l,base,rough,metal)*lightRadiance(p,receiverNormal,i);
  }
  return color;
}
// Box-projected local cubemap lookup: a reflected ray hits the actual room bounds,
// then samples the direction from the probe origin rather than an infinite sky.
fn parallaxDirection(p:vec3<f32>,direction:vec3<f32>)->vec3<f32>{
  let origin=clamp(p,lighting.boxMin.xyz+.005,lighting.boxMax.xyz-.005);
  let safe=select(min(direction,vec3(-.00001)),max(direction,vec3(.00001)),direction>=vec3(0.));
  let farSide=select(lighting.boxMin.xyz,lighting.boxMax.xyz,direction>=vec3(0.));
  let distances=(farSide-origin)/safe;
  let t=min(distances.x,min(distances.y,distances.z));
  return origin+direction*t-lighting.probe.xyz;
}
fn environmentBRDF(rough:f32,nv:f32)->vec2<f32>{
  let c0=vec4(-1.,-.0275,-.572,.022);let c1=vec4(1.,.0425,1.04,-.04);
  let r=rough*c0+c1;let a004=min(r.x*r.x,exp2(-9.28*nv))*r.x+r.y;
  return vec2(-1.04,1.04)*a004+r.zw;
}
// Original ECHO-9 adaptation of footprint-filtered procedural detail. Unresolved
// octaves converge to their mean instead of turning into speckle or moire.
fn materialNoise(q:vec3<f32>)->f32{
  let footprint=max(length(dpdx(q)),length(dpdy(q)));
  let resolved=select(1.,1.-smoothstep(.16,.62,footprint),lighting.options.w>.5);
  return mix(.5,noise(q),resolved);
}
fn surfaceColor(input:CorridorOut,n:vec3<f32>,v:vec3<f32>,useEnvironment:bool,receiverNormal:vec3<f32>)->vec3<f32>{
  let p=input.world;let emission=input.material.x;
  if(emission>0.){return input.color*emission;}
  let local=input.local.xyz;let family=i32(input.local.w+.5);
  let coarse=materialNoise(p*vec3(.75,.42,.6));
  let mottling=materialNoise(p*vec3(3.7,2.9,3.2));
  let grain=materialNoise(p*vec3(21.,18.,23.));
  let fine=materialNoise(p*vec3(92.,85.,96.));
  let brush=materialNoise(vec3(local.x*75.,local.y*.8,local.z*75.));
  let streak=materialNoise(vec3(p.x*18.,p.y*.65,p.z*19.));
  let broken=materialNoise(p*vec3(36.,22.,31.));
  let distances=max(input.shape.xyz-abs(local),vec3(0.));
  // Second-smallest distance is the in-face distance to a real primitive edge.
  // It ignores the zero distance along the face normal and follows chamfered ribs.
  let edge=min(max(distances.x,distances.y),min(max(distances.x,distances.z),max(distances.y,distances.z)));
  let chip=(1.-smoothstep(.008,.048,edge))*smoothstep(.32,.72,mottling*.55+broken*.45);
  let joint=(1.-smoothstep(.045,.17,edge))*(1.-chip);
  let runoff=smoothstep(.48,.72,streak)*smoothstep(.23,.8,coarse);
  var base=input.color;var rough=input.material.y;var metal=input.material.z;
  var slope=vec2((grain-.5)*.065,(mottling-.5)*.035);
  if(family==1){
    // Pigmented paint is dielectric. Exposed chips reveal the conductive substrate.
    base*=.88+coarse*.14+mottling*.08;
    base=mix(base,vec3(.15,.165,.17),chip*.72);
    base*=1.-joint*.48-runoff*.23;
    rough=clamp(.64+(mottling-.5)*.20+runoff*.11-chip*.22,.39,.92);
    metal=mix(.07,.82,chip);
  }else if(family==2){
    base*=.86+coarse*.14+mottling*.10;
    base=mix(base,vec3(.065,.074,.08),chip*.35);base*=1.-joint*.32;
    rough=clamp(.70+(grain-.5)*.16+runoff*.1-chip*.17,.48,.92);metal=.72;
    slope*=.6;
  }else if(family==3){
    // Brushing runs along each authored tube, distinct from cross-panel wear.
    let oxidation=smoothstep(.5,.76,coarse*.6+streak*.4);
    base*=.42+coarse*.23+brush*.13;
    base=mix(base,vec3(.052,.049,.044),oxidation*.34);
    rough=clamp(.45+(mottling-.5)*.20+(brush-.5)*.13+oxidation*.14,.32,.78);metal=.88;
    slope=vec2((brush-.5)*.10,(grain-.5)*.018);
  }else if(family==4){
    // Oxidised grate crests catch broken reflections; troughs retain grease.
    let crest=smoothstep(.015,.04,local.y+input.shape.y);
    base*=.39+coarse*.28+grain*.13;
    base=mix(base,vec3(.038,.027,.019),runoff*.23);
    rough=clamp(.59+(grain-.5)*.22+runoff*.13-crest*.04,.43,.88);metal=.78;
    slope*=.55;
  }else if(family==5){
    base=vec3(.009,.011,.013)*(.75+coarse*.35);
    rough=.83+(mottling-.5)*.09;metal=.015;slope*=.45;
  }else{
    base*=.65+coarse*.14+mottling*.09;
    base=mix(base,vec3(.08,.043,.026),runoff*.23);base*=1.-joint*.32;
    rough=clamp(.53+(mottling-.5)*.22+(grain-.5)*.11+runoff*.16-chip*.10,.34,.88);metal=.85;
  }
  base*=.94+(fine-.5)*.055;
  let helper=select(vec3(0.,1.,0.),vec3(1.,0.,0.),abs(n.y)>.92);
  let tangent=normalize(cross(n,helper));let bitangent=cross(n,tangent);
  let shadingNormal=normalize(n+tangent*slope.x+bitangent*slope.y);
  // Unresolved micro-slope and across-pixel normal variation widen the GGX lobe.
  // This is an industrial-material model, not the source ocean's LEAN constants.
  let footprint=max(length(dpdx(p)),length(dpdy(p)));
  let variance=dot(dpdx(shadingNormal),dpdx(shadingNormal))+dot(dpdy(shadingNormal),dpdy(shadingNormal));
  if(lighting.options.w>.5){rough=pow(clamp(pow(rough,4.)+min(.045,variance*.35)+smoothstep(.008,.075,footprint)*.008,.001,1.),.25);}
  var color=directRadiance(p,shadingNormal,v,base,rough,metal,receiverNormal);
  if(useEnvironment && lighting.options.y>.5){
    let nv=max(dot(shadingNormal,v),.001);let reflected=reflect(-v,shadingNormal);
    let specularEnvironment=textureSampleLevel(environment,environmentSampler,parallaxDirection(p,reflected),rough*lighting.probe.w).rgb;
    let brdf=environmentBRDF(rough,nv);let f0=mix(vec3(.04),base,metal);
    color+=specularEnvironment*(f0*brdf.x+brdf.y);
    let diffuseEnvironment=textureSampleLevel(environment,environmentSampler,shadingNormal,lighting.probe.w).rgb;
    color+=diffuseEnvironment*base*(1.-metal)*.28;
  }
  color+=input.color*emission;
  return color;
}
struct CorridorMRT {@location(0) display:vec4<f32>,@location(1) radiance:vec4<f32>};
@fragment fn corridorFragment(input:CorridorOut,@builtin(front_facing) front:bool)->CorridorMRT{
  let v=normalize(u.camera.xyz-input.world);var n=normalize(input.normal);if(dot(n,v)<0.){n=-n;}
  var face=normalize(cross(dpdx(input.world),dpdy(input.world)));if(dot(face,v)<0.){face=-face;}
  var color=surfaceColor(input,n,v,true,face);
  // Surface radiance stays linear and unbounded until the final composition pass.
  var o:CorridorMRT;o.display=vec4(0.,0.,0.,1.);o.radiance=vec4(color,1.);return o;
}
@fragment fn corridorProbeFragment(input:CorridorOut,@builtin(front_facing) front:bool)->@location(0) vec4<f32>{
  let v=normalize(u.camera.xyz-input.world);var n=normalize(input.normal);if(dot(n,v)<0.){n=-n;}
  var face=normalize(cross(dpdx(input.world),dpdy(input.world)));if(dot(face,v)<0.){face=-face;}
  return vec4(surfaceColor(input,n,v,false,face),1.);
}
`;
export const CORRIDOR_SHADOW_SHADER=/* wgsl */`
struct ShadowCamera {viewProjection:mat4x4<f32>};
@group(0) @binding(0) var<uniform> camera:ShadowCamera;
@vertex fn shadowVertex(@location(0) position:vec3<f32>)->@builtin(position) vec4<f32>{return camera.viewProjection*vec4(position,1.);}
`;
export const CORRIDOR_PREFILTER_SHADER=/* wgsl */`
struct FilterOptions {size:u32,samples:u32,roughness:f32,padding:f32};
@group(0) @binding(0) var source:texture_cube<f32>;
@group(0) @binding(1) var sourceSampler:sampler;
@group(0) @binding(2) var destination:texture_storage_2d_array<rgba16float,write>;
@group(0) @binding(3) var<uniform> options:FilterOptions;
fn radicalInverse(bits:u32)->f32{
  var value=bits;value=(value<<16u)|(value>>16u);value=((value&0x55555555u)<<1u)|((value&0xaaaaaaaau)>>1u);
  value=((value&0x33333333u)<<2u)|((value&0xccccccccu)>>2u);value=((value&0x0f0f0f0fu)<<4u)|((value&0xf0f0f0f0u)>>4u);value=((value&0x00ff00ffu)<<8u)|((value&0xff00ff00u)>>8u);
  return f32(value)*2.3283064365386963e-10;
}
fn faceDirection(face:u32,uv:vec2<f32>)->vec3<f32>{
  switch(face){case 0u:{return normalize(vec3(1.,-uv.y,-uv.x));}case 1u:{return normalize(vec3(-1.,-uv.y,uv.x));}case 2u:{return normalize(vec3(uv.x,1.,uv.y));}case 3u:{return normalize(vec3(uv.x,-1.,-uv.y));}case 4u:{return normalize(vec3(uv.x,-uv.y,1.));}default:{return normalize(vec3(-uv.x,-uv.y,-1.));}}
}
@compute @workgroup_size(8,8,1) fn prefilter(@builtin(global_invocation_id) id:vec3<u32>){
  if(id.x>=options.size||id.y>=options.size||id.z>=6u){return;}
  let uv=(vec2<f32>(id.xy)+.5)/f32(options.size)*2.-1.;let n=faceDirection(id.z,uv);
  let helper=select(vec3(0.,0.,1.),vec3(1.,0.,0.),abs(n.z)>.99);let tangent=normalize(cross(helper,n));let bitangent=cross(n,tangent);
  let alpha=options.roughness*options.roughness;var color=vec3(0.);var weight=0.;
  for(var i=0u;i<options.samples;i++){
    let xi=vec2(f32(i)/f32(options.samples),radicalInverse(i));let phi=6.2831853*xi.x;
    let cosine=sqrt((1.-xi.y)/(1.+(alpha*alpha-1.)*xi.y));let sine=sqrt(max(0.,1.-cosine*cosine));
    let h=normalize(tangent*cos(phi)*sine+bitangent*sin(phi)*sine+n*cosine);let l=normalize(2.*dot(n,h)*h-n);let nl=max(dot(n,l),0.);
    color+=textureSampleLevel(source,sourceSampler,l,0.).rgb*nl;weight+=nl;
  }
  textureStore(destination,vec2<i32>(id.xy),i32(id.z),vec4(color/max(weight,.0001),1.));
}
`;
