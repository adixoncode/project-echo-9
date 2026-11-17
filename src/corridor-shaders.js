import {COMMON} from './shaders.js';
export const CORRIDOR_SHADER=COMMON+/* wgsl */`
struct Lighting {
  shadowMatrices:array<mat4x4<f32>,2>,
  probe:vec4<f32>,
  boxMin:vec4<f32>,
  boxMax:vec4<f32>,
  options:vec4<f32>,
};
@group(1) @binding(0) var<uniform> lighting:Lighting;
@group(1) @binding(1) var shadowMap:texture_depth_2d_array;
@group(1) @binding(2) var shadowSampler:sampler_comparison;
@group(1) @binding(3) var environment:texture_cube<f32>;
@group(1) @binding(4) var environmentSampler:sampler;
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
fn geometricShadow(p:vec3<f32>,n:vec3<f32>,index:i32)->f32{
  if(lighting.options.x<.5){return 1.;}
  let position=lighting.shadowMatrices[index]*vec4(p+n*.006,1.);let clip=position.xyz/position.w;
  let uv=clip.xy*vec2(.5,-.5)+.5;
  if(position.w<=0. || any(uv<vec2(0.)) || any(uv>vec2(1.)) || clip.z<0. || clip.z>1.){return 0.;}
  let texel=1./lighting.options.z;let bias=.000012;
  var value=0.;
  for(var y=0;y<2;y++){for(var x=0;x<2;x++){
    let offset=(vec2(f32(x),f32(y))-.5)*texel*1.5;
    value+=textureSampleCompareLevel(shadowMap,shadowSampler,uv+offset,index,clip.z-bias);
  }}
  return value*.25;
}
fn directRadiance(p:vec3<f32>,n:vec3<f32>,v:vec3<f32>,base:vec3<f32>,rough:f32,metal:f32)->vec3<f32>{
  var color=vec3(.00075,.0011,.0016)*base;
  let positions=array<vec3<f32>,6>(vec3(-3.3,4.45,33.6),vec3(.45,4.85,48.),vec3(.45,4.78,41.2),vec3(.45,4.78,56.3),vec3(.45,4.78,65.3),vec3(.8,5.04,29.3));
  let targets=array<vec3<f32>,6>(vec3(2.2,.65,37.2),vec3(-.3,.3,51.),vec3(.45,.1,42.2),vec3(.45,.1,57.3),vec3(.45,.1,66.3),vec3(.8,1.,30.));
  let colors=array<vec3<f32>,6>(vec3(.57,.72,.92),vec3(1.,.018,.009),vec3(1.,.022,.012),vec3(1.,.018,.009),vec3(1.,.022,.012),vec3(.48,.58,.66));
  let powers=array<f32,6>(155.,125.,28.,30.,26.,6.);
  for(var i=0;i<6;i++){
    let delta=positions[i]-p;let distance2=dot(delta,delta);let l=normalize(delta);
    let spot=dot(-l,normalize(targets[i]-positions[i]));
    let cone=smoothstep(select(.44,.60,i==0),.88,spot);
    var visibility=1.;if(i<2){visibility=geometricShadow(p,n,i);}
    let radiance=colors[i]*powers[i]*cone*visibility/max(distance2,.16);
    color+=ggx(n,v,l,base,rough,metal)*radiance;
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
fn surfaceColor(input:CorridorOut,n:vec3<f32>,v:vec3<f32>,useEnvironment:bool)->vec3<f32>{
  let p=input.world;let emission=input.material.x;
  let broadVariation=noise(p*vec3(3.1,.85,2.1));let stains=noise(p*vec3(7.,.55,4.));
  let wear=pow(max(0.,noise(p*vec3(17.,4.,13.))-.58),2.)*.5;
  var base=input.color*(.84+.23*broadVariation);
  // Low-amplitude wear changes roughness and reflectance, never replaces geometry.
  base=mix(base,vec3(.105,.05,.025),smoothstep(.69,.86,stains)*.18);
  let rough=clamp(input.material.y+(stains-.5)*.12+wear,.18,.92);let metal=clamp(input.material.z-stains*.035,0.,1.);
  var color=directRadiance(p,n,v,base,rough,metal);
  if(useEnvironment && lighting.options.y>.5){
    let nv=max(dot(n,v),.001);let reflected=reflect(-v,n);
    let specularEnvironment=textureSampleLevel(environment,environmentSampler,parallaxDirection(p,reflected),rough*lighting.probe.w).rgb;
    let brdf=environmentBRDF(rough,nv);let f0=mix(vec3(.04),base,metal);
    color+=specularEnvironment*(f0*brdf.x+brdf.y);
    let diffuseEnvironment=textureSampleLevel(environment,environmentSampler,n,lighting.probe.w).rgb;
    color+=diffuseEnvironment*base*(1.-metal)*.28;
  }
  color+=input.color*emission;
  return color;
}
@fragment fn corridorFragment(input:CorridorOut,@builtin(front_facing) front:bool)->@location(0) vec4<f32>{
  let v=normalize(u.camera.xyz-input.world);var n=normalize(input.normal);if(dot(n,v)<0.){n=-n;}
  var color=surfaceColor(input,n,v,true);
  // Fixed exposure: lamps may be bright, but black recesses remain black.
  return vec4(tone(color*1.35),1.);
}
@fragment fn corridorProbeFragment(input:CorridorOut,@builtin(front_facing) front:bool)->@location(0) vec4<f32>{
  let v=normalize(u.camera.xyz-input.world);var n=normalize(input.normal);if(dot(n,v)<0.){n=-n;}
  return vec4(surfaceColor(input,n,v,false),1.);
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
// Bounded aerial perspective. Shared scene depth limits the integration to the visible
// ray segment inside the physical corridor, including a distant room seen through its exit.
export function corridorAtmosphereShader(multisampled){return COMMON+/* wgsl */`
@group(0) @binding(1) var sceneDepth:${multisampled?'texture_depth_multisampled_2d':'texture_depth_2d'};
struct FogVertex {@builtin(position) position:vec4<f32>,@location(0) uv:vec2<f32>};
@vertex fn fogVertex(@builtin(vertex_index) id:u32)->FogVertex{
  let points=array<vec2<f32>,3>(vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));var o:FogVertex;o.position=vec4(points[id],0.,1.);o.uv=points[id];return o;
}
@fragment fn fogFragment(input:FogVertex)->@location(0) vec4<f32>{
  let ray=normalize(u.forward.xyz+u.right.xyz*input.uv.x*u.resolution.z+u.up.xyz*input.uv.y*u.resolution.w);
  let pixel=vec2<i32>(input.position.xy);let depth=textureLoad(sceneDepth,pixel,0);
  let viewDistance=(.12*700.)/max(.0001,700.-depth*(700.-.12));
  let visibleDistance=viewDistance/max(.001,dot(ray,u.forward.xyz));
  let safe=select(min(ray,vec3(-.000001)),max(ray,vec3(.000001)),ray>=vec3(0.));
  let a=(vec3(-3.9,0.,24.)-u.camera.xyz)/safe;let b=(vec3(3.9,5.6,72.)-u.camera.xyz)/safe;
  let nearHit=min(a,b);let farHit=max(a,b);let begin=max(0.,max(nearHit.x,max(nearHit.y,nearHit.z)));
  let end=min(visibleDistance,min(farHit.x,min(farHit.y,farHit.z)));let distance=max(0.,end-begin);
  var scattered=vec3(0.);
  for(var i=0;i<4;i++){
    let p=u.camera.xyz+ray*mix(begin,end,(f32(i)+.5)*.25);
    let red=exp(-abs(p.z-52.)/15.);let cold=exp(-length(p-vec3(-1.,2.6,34.))*.22);
    scattered+=vec3(.0022,.0028,.004)+vec3(.014,.00065,.0003)*red+vec3(.001,.0025,.004)*cold;
  }
  return vec4(tone(scattered*.25*1.35),1.-exp(-distance*.065));
}
`}
