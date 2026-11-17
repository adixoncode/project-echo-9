import {COMMON} from './shaders.js';
import {CORRIDOR_LIGHTING_WGSL} from './corridor-lights.js';
export const CORRIDOR_SHADER=COMMON+CORRIDOR_LIGHTING_WGSL+/* wgsl */`
struct CorridorIn {@location(0) position:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>};
struct CorridorOut {@builtin(position) position:vec4<f32>,@location(0) world:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>};
@vertex fn corridorVertex(input:CorridorIn)->CorridorOut{
  var o:CorridorOut;o.position=u.viewProjection*vec4(input.position,1.);o.world=input.position;o.normal=input.normal;o.color=input.color;o.material=input.material;return o;
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
fn surfaceColor(input:CorridorOut,n:vec3<f32>,v:vec3<f32>,useEnvironment:bool,receiverNormal:vec3<f32>)->vec3<f32>{
  let p=input.world;let emission=input.material.x;
  if(emission>0.){return input.color*emission;}
  let broadVariation=noise(p*vec3(3.1,.85,2.1));let stains=noise(p*vec3(7.,.55,4.));
  let wear=pow(max(0.,noise(p*vec3(17.,4.,13.))-.58),2.)*.5;
  var base=input.color*(.84+.23*broadVariation);
  // Low-amplitude wear changes roughness and reflectance, never replaces geometry.
  base=mix(base,vec3(.105,.05,.025),smoothstep(.69,.86,stains)*.18);
  let floorFacing=abs(n.y)>.8;
  let rough=clamp(input.material.y+select(.11,.08,floorFacing)+(stains-.5)*.15+wear,.25,.92);let metal=clamp(input.material.z-stains*.035,0.,1.);
  var shadingNormal=n;
  if(floorFacing){
    shadingNormal=normalize(n+vec3(sin(p.z*.83+p.x*1.9)*.026,0.,sin(p.x*2.4+p.z*.19)*.015));
  }else{
    let tangent=normalize(cross(n,vec3(0.,1.,0.)));let bitangent=cross(n,tangent);
    shadingNormal=normalize(n+tangent*(noise(p*vec3(.45,3.,.45))-.5)*.025+bitangent*(noise(p*vec3(2.,.3,2.))-.5)*.012);
  }
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
