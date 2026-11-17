import {SKY_SHADER,MESH_SHADER,DUST_SHADER} from './shaders.js';

// The legacy display output remains bit-for-bit the same expression. A second MRT target
// retains the existing pre-tone linear radiance for physically scoped corridor composition.
const LEGACY_MRT=/* wgsl */`
struct LegacyMRT {@location(0) display:vec4<f32>,@location(1) radiance:vec4<f32>};
fn legacyOutput(display:vec3<f32>,radiance:vec3<f32>)->LegacyMRT{
  var o:LegacyMRT;o.display=vec4(display,1.);o.radiance=vec4(radiance,0.);return o;
}
`;
export function legacyHdrVariant(source,kind){
  let result=source.replace('@fragment fn',LEGACY_MRT+'\n@fragment fn');
  result=result.replace('->@location(0) vec4<f32>{','->LegacyMRT{');
  if(kind==='sky')result=result.replace('return vec4(tone(color*vignette),1.);','return legacyOutput(tone(color*vignette),color*vignette);');
  if(kind==='mesh')result=result.replace('return vec4(tone(color),1.);','return legacyOutput(tone(color),color);').replace('return vec4(.05,.2,.3,1.);','return legacyOutput(vec3(.05,.2,.3),vec3(.05,.2,.3));').replace('return vec4(n*.5+.5,1.);','return legacyOutput(n*.5+.5,n*.5+.5);');
  if(kind==='dust')result=result.replace('return vec4(.4,.7,.83,a);','var o:LegacyMRT;o.display=vec4(.4,.7,.83,a);o.radiance=vec4(pow(vec3(.4,.7,.83),vec3(2.2)),a);return o;');
  return result;
}
export const HDR_SKY_SHADER=legacyHdrVariant(SKY_SHADER,'sky');
export const HDR_MESH_SHADER=legacyHdrVariant(MESH_SHADER,'mesh');
export const HDR_DUST_SHADER=legacyHdrVariant(DUST_SHADER,'dust');
export const HDR_PARTICLE_BLEND={color:{srcFactor:'src-alpha',dstFactor:'one-minus-src-alpha',operation:'add'},alpha:{srcFactor:'zero',dstFactor:'one',operation:'add'}};

export function halfToNumber(bits){
  const sign=bits&0x8000?-1:1,exponent=(bits>>>10)&31,fraction=bits&1023;
  if(exponent===31)return fraction?NaN:sign*Infinity;
  if(exponent===0)return sign*fraction*2**-24;
  return sign*(1+fraction/1024)*2**(exponent-15);
}
export function summarizeHdrPixels(values,width,height,strideBytes){
  let maximum=-Infinity,minimum=Infinity,sum=0,count=0,negative=0,nonFinite=0,corridorMaximum=-Infinity,corridorSum=0,corridorCount=0,aboveOne=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const index=y*strideBytes/2+x*4,coverage=halfToNumber(values[index+3]);
    for(let channel=0;channel<3;channel++){
      const value=halfToNumber(values[index+channel]);if(!Number.isFinite(value)){nonFinite++;continue;}
      maximum=Math.max(maximum,value);minimum=Math.min(minimum,value);sum+=value;count++;
      if(value<0)negative++;if(value>1)aboveOne++;
      if(coverage>.5){corridorMaximum=Math.max(corridorMaximum,value);corridorSum+=value;corridorCount++;}
    }
  }
  return {format:'rgba16float',width,height,maximum,minimum,mean:count?sum/count:null,finite:nonFinite===0,nonFiniteValues:nonFinite,negativeValues:negative,valuesAboveOne:aboveOne,corridor:{maximum:corridorCount?corridorMaximum:null,mean:corridorCount?corridorSum/corridorCount:null,rgbValues:corridorCount},alphaSemantics:'Spatial corridor coverage; not opacity or display gamma'};
}
