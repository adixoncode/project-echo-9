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
fn extinction(p:vec3<f32>,maximum:f32)->f32{
  // Continuous optical density through the real corridor; no flat depth slice.
  return maximum*(.10+.90*smoothstep(32.,59.,p.z))+.026*smoothstep(56.,73.,p.z);
}
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
    let p=u.camera.xyz+segment.direction*(segment.begin+(f32(i)+.5)*step);let sigma=extinction(p,options.volume.x);let stepT=exp(-sigma*step);
    // Broad reflected room light supplies a low-energy, occlusion-captured bounce.
    // It comes from the actual HDR room probe, not an unrelated sky/fog color.
    var incident=textureSampleLevel(environment,environmentSampler,segment.direction,lighting.probe.w).rgb*.28;
    for(var lightIndex=0;lightIndex<i32(corridorLights.info.x);lightIndex++){
      let source=corridorLights.entries[lightIndex];let displacement=p-source.positionPower.xyz;let distance2=dot(displacement,displacement);let travel=displacement*inverseSqrt(max(distance2,.00000001));let cosine=dot(travel,-segment.direction);
      let phase=(1.-anisotropy*anisotropy)/(12.5663706*pow(max(.001,1.+anisotropy*anisotropy-2.*anisotropy*cosine),1.5));
      // Finite quadrature footprint averages the source near-field instead of sampling a point singularity.
      var sourceOpticalDepth=0.;let sourceDistance=sqrt(distance2);
      for(var s=0;s<3;s++){sourceOpticalDepth+=extinction(mix(source.positionPower.xyz,p,(f32(s)+.5)/3.),options.volume.x)*sourceDistance/3.;}
      incident+=lightRadiance(p,vec3(0.),lightIndex)*exp(-sourceOpticalDepth)*phase*distance2/(distance2+.4225);
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
/* AgX inset/outset matrices and contrast fit adapted from Noniv/web-ocean,
js/wgsl/post.js, commit a07c7fd522ef0a897601c114f927a49d93d95520.
The polynomial is already display encoded. ECHO-9 writes to rgba/bgra8unorm,
so adding COMMON's gamma transform here would encode the display twice.
The following license is embedded in the offline HTML along with this source.
MIT License

Copyright (c) 2026 Maksymilian Dendura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
fn agxDisplay(linearRadiance:vec3<f32>)->vec3<f32>{
  let inset=mat3x3<f32>(.842479062253094,.0423282422610123,.0423756549057051,
    .0784335999999992,.878468636469772,.0784336,
    .0792237451477643,.0791661274605434,.879142973793104);
  let outset=mat3x3<f32>(1.19687900512017,-.0528968517574562,-.0529716355144438,
    -.0980208811401368,1.15190312990417,-.0980434501171241,
    -.0990297440797205,-.0989611768448433,1.15107367264116);
  let x=clamp((log2(max(inset*linearRadiance,vec3(1e-10)))+12.47393)/16.5,vec3(0.),vec3(1.));
  let x2=x*x;let x4=x2*x2;
  let encoded=15.5*x4*x2-40.14*x4*x+31.96*x4-6.868*x2*x+.4298*x2+.1191*x-.00232;
  return clamp(outset*encoded,vec3(0.),vec3(1.));
}
fn displayDither(pixel:vec2<f32>)->f32{
  // Stable pixel-anchored triangular dither: deterministic for stills and motion.
  return (hash(vec3(pixel,7.))+hash(vec3(pixel.yx+vec2(29.,71.),19.))-1.)/1020.;
}
@fragment fn finalFragment(input:PostVertex)->@location(0) vec4<f32>{
  let pixel=vec2<i32>(input.position.xy);let color=textureLoad(composed,pixel,0);
  if(color.a<=0. || options.display.w<.5){return textureLoad(legacy,pixel,0);}
  var radiance=color.rgb;
  if(options.display.z>.5){
    let uv=input.position.xy/u.resolution.xy;
    let glare=textureSampleLevel(bloom0,bloomSampler,uv,0.).rgb*.45+textureSampleLevel(bloom1,bloomSampler,uv,0.).rgb*.30+textureSampleLevel(bloom2,bloomSampler,uv,0.).rgb*.17+textureSampleLevel(bloom3,bloomSampler,uv,0.).rgb*.08;
    radiance+=glare*options.glare.x;
  }
  let exposed=max(radiance,vec3(0.))*options.display.x;
  var display:vec3<f32>;
  if(options.glare.w>.5){display=agxDisplay(exposed);}else{display=tone(exposed);}
  return vec4(clamp(display+displayDither(input.position.xy),vec3(0.),vec3(1.)),1.);
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
