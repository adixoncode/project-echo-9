import {normalize} from './math.js';
// Single authoring table: fixtures, BRDF, shadow cameras, HDR probe and scattering
// consume these positions, spectra, cones and calibrated source intensities.
function light(id,position,target,color,power,fov,shadow=-1,size=[.30,.19,.10],mount='ceiling'){
  return {id,position,target,color,power,fov,far:38,shadow,size,mount,radius:.18,direction:normalize(target.map((v,i)=>v-position[i])),outerCos:Math.cos(fov*Math.PI/360),innerCos:Math.cos(fov*.31*Math.PI/180),emission:power/(400*size[0]*size[1])};
}
export const CORRIDOR_LIGHT_TABLE=[
  light('cold-rib-key',[-1,4.3,31.8],[-3.75,2.4,35.3],[.57,.74,.94],280,104,0),
  light('red-depth-key',[.45,4.75,44.1],[.45,.45,45.2],[1,.025,.011],360,148,1,[.20,.28,.20],'pendant'),
  light('cold-left-graze',[1.35,4.55,29.8],[3.7,2.15,33.1],[.53,.68,.84],105,96),
  light('cold-middle-rib',[-.3,4.65,38.7],[-3.7,2.4,41.4],[.45,.61,.79],110,96),
  light('red-middle',[.45,4.75,52.5],[.2,.55,54.5],[1,.022,.008],110,120,-1,[.20,.28,.20],'pendant'),
  light('red-far',[.45,4.75,61.7],[.2,.4,63],[1,.022,.008],90,120,-1,[.20,.28,.20],'pendant'),
  light('cold-service-bay',[-4.3,3.6,33.5],[-1.5,1.6,35],[.55,.71,.87],30,110,-1,[.72,.36,.07],'wall')
];
export const CORRIDOR_LIGHTS=CORRIDOR_LIGHT_TABLE.filter(light=>light.shadow>=0);
export function packCorridorLights(lights=CORRIDOR_LIGHT_TABLE){
  const data=new Float32Array(8*16+4);
  for(let i=0;i<lights.length;i++){
    const l=lights[i];data.set([...l.position,l.power,...l.direction,l.outerCos,...l.color,l.innerCos,l.radius,l.shadow,l.far,l.emission],i*16);
  }
  data[128]=lights.length;return data;
}
export const CORRIDOR_LIGHTING_WGSL=/* wgsl */`
struct Lighting {shadowMatrices:array<mat4x4<f32>,2>,probe:vec4<f32>,boxMin:vec4<f32>,boxMax:vec4<f32>,options:vec4<f32>};
struct CorridorLight {positionPower:vec4<f32>,directionOuter:vec4<f32>,colorInner:vec4<f32>,shape:vec4<f32>};
struct LightTable {entries:array<CorridorLight,8>,info:vec4<f32>};
@group(1) @binding(0) var<uniform> lighting:Lighting;
@group(1) @binding(1) var shadowMap:texture_depth_2d_array;
@group(1) @binding(2) var shadowSampler:sampler_comparison;
@group(1) @binding(3) var environment:texture_cube<f32>;
@group(1) @binding(4) var environmentSampler:sampler;
@group(1) @binding(5) var<uniform> corridorLights:LightTable;
fn geometricShadow(p:vec3<f32>,normal:vec3<f32>,lightIndex:i32)->f32{
  let source=corridorLights.entries[lightIndex];let index=i32(source.shape.y);
  if(lighting.options.x<.5 || index<0){return 1.;}
  let receiver=p+normal*.006;
  let position=lighting.shadowMatrices[index]*vec4(receiver,1.);let clip=position.xyz/position.w;
  let uv=clip.xy*vec2(.5,-.5)+.5;
  if(position.w<=0. || any(uv<vec2(0.)) || any(uv>vec2(1.)) || clip.z<0. || clip.z>1.){return 0.;}
  // A planar receiver's projected depth is affine in shadow UV. Correct each PCF
  // comparison at its actual texel centre rather than comparing all taps with one
  // centre depth (which self-shadows sloping planes). Zero normal = volume sample.
  var gradient=vec2(0.);
  let planeDistance=-dot(normal,receiver-source.positionPower.xyz);
  if(dot(normal,normal)>.5 && abs(planeDistance)>.0001){
    let back=-source.directionOuter.xyz;let right=normalize(cross(vec3(0.,1.,0.),back));let up=cross(back,right);
    let tangent=sqrt(max(0.,1.-source.directionOuter.w*source.directionOuter.w))/source.directionOuter.w;
    let nearTerm=.15*source.shape.z/(source.shape.z-.15);
    gradient=vec2(dot(normal,right),-dot(normal,up))*(2.*nearTerm*tangent/planeDistance);
  }
  let resolution=lighting.options.z;let coordinate=uv*resolution-.5;let base=vec2<i32>(floor(coordinate));let fraction=fract(coordinate);var visibility=0.;
  for(var y=0;y<2;y++){for(var x=0;x<2;x++){
    let texel=clamp(base+vec2(x,y),vec2(0),vec2(i32(resolution)-1));let sampleUv=(vec2<f32>(texel)+.5)/resolution;
    let expected=clip.z+dot(gradient,sampleUv-uv)-.000012;
    let stored=textureLoad(shadowMap,texel,index,0);
    let weight=select(1.-fraction.x,fraction.x,x==1)*select(1.-fraction.y,fraction.y,y==1);
    visibility+=select(0.,1.,expected<=stored)*weight;
  }}
  return visibility;
}
fn lightRadiance(p:vec3<f32>,normal:vec3<f32>,index:i32)->vec3<f32>{
  let source=corridorLights.entries[index];let delta=source.positionPower.xyz-p;let distance2=dot(delta,delta);let l=delta*inverseSqrt(max(distance2,.00000001));
  let cone=smoothstep(source.directionOuter.w,source.colorInner.w,dot(-l,source.directionOuter.xyz));
  let rangeFade=1.-smoothstep(source.shape.z*.85,source.shape.z,sqrt(distance2));
  let visibility=geometricShadow(p,normal,index);
  return source.colorInner.rgb*source.positionPower.w*cone*visibility*rangeFade/max(distance2,source.shape.x*source.shape.x);
}
`;
