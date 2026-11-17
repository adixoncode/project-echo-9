import {COMMON} from './shaders.js';
import {CORRIDOR_LIGHTING_WGSL} from './corridor-lights.js';
export const POST_VERTEX=/* wgsl */`
struct PostVertex {@builtin(position) position:vec4<f32>,@location(0) uv:vec2<f32>};
@vertex fn postVertex(@builtin(vertex_index) id:u32)->PostVertex{
  let points=array<vec2<f32>,3>(vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));var o:PostVertex;o.position=vec4(points[id],0.,1.);o.uv=points[id];return o;
}
`;
const POST_OPTIONS=/* wgsl */`
struct PostOptions {display:vec4<f32>,volume:vec4<f32>,glare:vec4<f32>};
fn extinction(p:vec3<f32>,maximum:f32)->f32{return maximum*(.12+.88*smoothstep(34.,52.,p.z))+.035*smoothstep(61.,70.,p.z);}
struct RaySegment {direction:vec3<f32>,surfaceDistance:f32,begin:f32,end:f32};
fn raySegment(uv:vec2<f32>,depth:f32)->RaySegment{
  var o:RaySegment;o.direction=normalize(u.forward.xyz+u.right.xyz*uv.x*u.resolution.z+u.up.xyz*uv.y*u.resolution.w);
  o.surfaceDistance=(.12*700.)/max(.0001,700.-depth*(700.-.12))/max(.001,dot(o.direction,u.forward.xyz));
  let safe=select(min(o.direction,vec3(-.000001)),max(o.direction,vec3(.000001)),o.direction>=vec3(0.));
  let a=(vec3(-3.9,0.,24.)-u.camera.xyz)/safe;let b=(vec3(3.9,8.3,72.25)-u.camera.xyz)/safe;
  let nearHit=min(a,b);let farHit=max(a,b);o.begin=max(0.,max(nearHit.x,max(nearHit.y,nearHit.z)));o.end=max(o.begin,min(o.surfaceDistance,min(farHit.x,min(farHit.y,farHit.z))));return o;
}
`;
const depthDeclaration=multisampled=>`var sceneDepth:${multisampled?'texture_depth_multisampled_2d':'texture_depth_2d'};`;
const depthExpression=(multisampled,pixel='pixel')=>multisampled?`min(min(textureLoad(sceneDepth,${pixel},0),textureLoad(sceneDepth,${pixel},1)),min(textureLoad(sceneDepth,${pixel},2),textureLoad(sceneDepth,${pixel},3)))`:`textureLoad(sceneDepth,${pixel},0)`;
export function corridorVolumeShader(multisampled){return COMMON+CORRIDOR_LIGHTING_WGSL+POST_VERTEX+POST_OPTIONS+/* wgsl */`
@group(0) @binding(1) ${depthDeclaration(multisampled)}
@group(0) @binding(2) var<uniform> options:PostOptions;
@fragment fn volumeFragment(input:PostVertex)->@location(0) vec4<f32>{
  let pixel=vec2<i32>(min(input.position.xy*2.,u.resolution.xy-1.));let depth=${depthExpression(multisampled)};
  let segment=raySegment(input.uv,depth);let distance=segment.end-segment.begin;
  var scatter=vec3(0.);var transmittance=1.;let step=distance/24.;let anisotropy=options.volume.z;
  if(distance>.002){for(var i=0;i<24;i++){
    let p=u.camera.xyz+segment.direction*(segment.begin+(f32(i)+.5)*step);let sigma=extinction(p,options.volume.x);let stepT=exp(-sigma*step);var incident=vec3(0.);
    for(var lightIndex=0;lightIndex<i32(corridorLights.info.x);lightIndex++){
      let source=corridorLights.entries[lightIndex];let displacement=p-source.positionPower.xyz;let distance2=dot(displacement,displacement);let travel=displacement*inverseSqrt(max(distance2,.00000001));let cosine=dot(travel,-segment.direction);
      let phase=(1.-anisotropy*anisotropy)/(12.5663706*pow(max(.001,1.+anisotropy*anisotropy-2.*anisotropy*cosine),1.5));
      // Finite quadrature footprint averages the source near-field instead of sampling a point singularity.
      incident+=lightRadiance(p,vec3(0.),lightIndex)*phase*distance2/(distance2+.4225);
    }
    scatter+=transmittance*options.volume.y*(1.-stepT)*incident;transmittance*=stepT;
  }}
  // Alpha stores receiver distance for bilateral reconstruction, never fog opacity.
  return vec4(scatter,segment.surfaceDistance);
}
`;}
export function corridorComposeShader(multisampled){return COMMON+POST_VERTEX+POST_OPTIONS+/* wgsl */`
@group(0) @binding(1) var scene:texture_2d<f32>;
@group(0) @binding(2) ${depthDeclaration(multisampled)}
@group(0) @binding(3) var volumeTexture:texture_2d<f32>;
@group(0) @binding(4) var<uniform> options:PostOptions;
fn bilateralScatter(pixel:vec2<f32>,distance:f32)->vec3<f32>{
  let coordinate=pixel*.5-.5;let base=vec2<i32>(floor(coordinate));let fraction=fract(coordinate);let size=vec2<i32>(textureDimensions(volumeTexture));var radiance=vec3(0.);var total=0.;
  for(var y=0;y<2;y++){for(var x=0;x<2;x++){
    let neighbor=textureLoad(volumeTexture,clamp(base+vec2(x,y),vec2(0),size-1),0);
    let spatial=select(1.-fraction.x,fraction.x,x==1)*select(1.-fraction.y,fraction.y,y==1);
    let depthWeight=exp(-abs(neighbor.a-distance)/max(.1,distance*.04));let weight=spatial*depthWeight;radiance+=neighbor.rgb*weight;total+=weight;
  }}
  return radiance/max(total,.0001);
}
@fragment fn composeFragment(input:PostVertex)->@location(0) vec4<f32>{
  let pixel=vec2<i32>(input.position.xy);let surface=textureLoad(scene,pixel,0);let depth=${depthExpression(multisampled)};
  let segment=raySegment(input.uv,depth);let distance=segment.end-segment.begin;var color=surface.rgb;
  if(options.display.y>.5 && distance>.002){
    let step=distance/24.;var opticalDepth=0.;
    for(var i=0;i<24;i++){let p=u.camera.xyz+segment.direction*(segment.begin+(f32(i)+.5)*step);opticalDepth+=extinction(p,options.volume.x)*step;}
    color=surface.rgb*exp(-opticalDepth)+bilateralScatter(input.position.xy,segment.surfaceDistance);
  }
  return vec4(max(color,vec3(0.)),select(surface.a,1.,distance>.002));
}
`;}
export const CORRIDOR_FINAL_SHADER=COMMON+POST_VERTEX+/* wgsl */`
struct PostOptions {display:vec4<f32>,volume:vec4<f32>,glare:vec4<f32>};
@group(0) @binding(1) var composed:texture_2d<f32>;
@group(0) @binding(2) var legacy:texture_2d<f32>;
@group(0) @binding(3) var<uniform> options:PostOptions;
@group(0) @binding(4) var bloom0:texture_2d<f32>;
@group(0) @binding(5) var bloom1:texture_2d<f32>;
@group(0) @binding(6) var bloom2:texture_2d<f32>;
@group(0) @binding(7) var bloom3:texture_2d<f32>;
@group(0) @binding(8) var bloomSampler:sampler;
@fragment fn finalFragment(input:PostVertex)->@location(0) vec4<f32>{
  let pixel=vec2<i32>(input.position.xy);let color=textureLoad(composed,pixel,0);
  if(color.a<=0. || options.display.w<.5){return textureLoad(legacy,pixel,0);}
  var radiance=color.rgb;
  if(options.display.z>.5){
    let uv=input.position.xy/u.resolution.xy;
    let glare=textureSampleLevel(bloom0,bloomSampler,uv,0.).rgb*.45+textureSampleLevel(bloom1,bloomSampler,uv,0.).rgb*.30+textureSampleLevel(bloom2,bloomSampler,uv,0.).rgb*.17+textureSampleLevel(bloom3,bloomSampler,uv,0.).rgb*.08;
    radiance+=glare*options.glare.x;
  }
  return vec4(tone(max(radiance,vec3(0.))*options.display.x),1.);
}
`;
export const CORRIDOR_BLOOM_SHADER=POST_VERTEX+/* wgsl */`
struct BloomOptions {threshold:f32,knee:f32,first:f32,padding:f32};
@group(0) @binding(0) var source:texture_2d<f32>;
@group(0) @binding(1) var linearSampler:sampler;
@group(0) @binding(2) var<uniform> options:BloomOptions;
fn sampleRadiance(uv:vec2<f32>)->vec3<f32>{
  let color=textureSampleLevel(source,linearSampler,uv,0.);var value=max(color.rgb,vec3(0.));
  if(options.first>.5){
    value*=clamp(color.a,0.,1.);let luminance=dot(value,vec3(.2126,.7152,.0722));
    let knee=clamp(luminance-options.threshold+options.knee,0.,2.*options.knee);let soft=knee*knee/(4.*options.knee+.0001);
    value=min(value,vec3(24.))*max(luminance-options.threshold,soft)/max(luminance,.0001);
  }
  return value;
}
@fragment fn bloomFragment(input:PostVertex)->@location(0) vec4<f32>{
  let uv=input.uv*vec2(.5,-.5)+.5;let texel=1./vec2<f32>(textureDimensions(source));var value=vec3(0.);
  for(var y=-1;y<=1;y++){for(var x=-1;x<=1;x++){
    let weight=select(1.,2.,x==0)*select(1.,2.,y==0);value+=sampleRadiance(uv+vec2(f32(x),f32(y))*texel)*weight;
  }}
  return vec4(value/16.,1.);
}
`;
