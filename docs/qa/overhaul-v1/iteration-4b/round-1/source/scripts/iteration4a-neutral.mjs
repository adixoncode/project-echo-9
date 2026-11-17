/** QA-only real neutral blockout. Never modifies production source or index.html. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {buildCorridor} from '../src/corridor.js';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-4a');
const diagnosticDir=process.env.NEUTRAL_DIR||'/tmp/echo9-4a-neutral';
await mkdir(out,{recursive:true});await mkdir(diagnosticDir,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let html=await readFile(resolve(root,'index.html'),'utf8');const productionSha256=hash(html);
// Require the current geometry module to be present in the built artifact. This
// rejects a stale build before provenance can incorrectly bind two geometries.
const geometrySource=(await readFile(resolve(root,'src/corridor.js'),'utf8')).replace(/^import .*?;\n/gm,'').replace(/^export \{.*?\} from .*?;\n/gm,'').replace(/^export /gm,'');
if(!html.includes(geometrySource))throw Error('Build index.html from current sources before creating neutral diagnostic');
const start=html.indexOf('fn surfaceColor(');if(start<0||html.indexOf('fn surfaceColor(',start+1)>=0)throw Error('Expected exactly one production surfaceColor function');
const begin=html.indexOf('{',start);let depth=1,end=begin+1;
for(;end<html.length&&depth;end++){if(html[end]==='{')depth++;else if(html[end]==='}')depth--;}
if(depth!==0)throw Error('Could not locate complete material function');
const originalFunction=html.slice(start,end);
const neutralFunction=`fn surfaceColor(input:CorridorOut,n:vec3<f32>,v:vec3<f32>,useEnvironment:bool,receiverNormal:vec3<f32>)->vec3<f32>{
  // QA diagnostic only: uniform rough neutral nonmetal, no wear/IBL/emission.
  let direct=directRadiance(input.world,n,v,vec3(.32),.88,0.,receiverNormal);
  let hemisphere=.025*(.45+.55*max(n.y,0.));
  return direct+vec3(hemisphere);
}`;
html=html.slice(0,start)+neutralFunction+html.slice(end);
const marker='const CORRIDOR_LIGHTS=CORRIDOR_LIGHT_TABLE.filter';
if(html.split(marker).length!==2)throw Error('Expected one authored light-table declaration');
html=html.replace(marker,'// QA-only neutral colors; all source positions, powers, cones and shadow indices retained.\nCORRIDOR_LIGHT_TABLE.forEach(source=>{source.color=[1,1,1];});\n'+marker);
const diagnosticApi=`
window.__echoGeometryDiagnostics=async()=>{
 const vertices=corridorScene.vertices,positionsNormals=new Float32Array(vertices.length/2);
 for(let i=0,j=0;i<vertices.length;i+=12)for(let k=0;k<6;k++)positionsNormals[j++]=vertices[i+k];
 const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
 return {mode:'QA-only uniform rough neutral blockout',triangles:corridorScene.triangles,positionNormalSha256:await digest(positionsNormals),surfaceStreamSha256:await digest(corridorScene.surfaces),productionSha256:'${productionSha256}',overrides:{base:[.32,.32,.32],roughness:.88,metal:0,proceduralDetail:false,environmentIBL:false,emission:false,neutralLightColors:true,sameLightPositionsPowersCones:true,geometricShadows:true,ambientHemisphere:.025}};
};
`;
if(html.split('\ninitialize();').length!==2)throw Error('Expected one application initializer');
html=html.replace('\ninitialize();',diagnosticApi+'\ninitialize();');
const c=buildCorridor(),positionsNormals=new Float32Array(c.vertices.length/2);
for(let i=0,j=0;i<c.vertices.length;i+=12)for(let k=0;k<6;k++)positionsNormals[j++]=c.vertices[i+k];
const record={productionSha256,neutralSha256:hash(html),productionMaterialFunctionSha256:hash(originalFunction),neutralMaterialFunctionSha256:hash(neutralFunction),geometry:{triangles:c.triangles,positionNormalSha256:hash(positionsNormals),surfaceStreamSha256:hash(c.surfaces)},scope:'QA-only HTML transform; production source/index unchanged. Same exact geometry, source positions/powers/cones/shadows, projection and final transfer. Uniform gray rough nonmetallic GGX, no material detail/environment IBL/emission; white light colors and small hemisphere ambient. Fog/bloom must be disabled in capture URL.',requiredQuery:'test=1&readback=1&view=4&quality=High&clean=1&fog=0&bloom=0',hardwareAcceptance:'BLOCKED'};
await writeFile(resolve(diagnosticDir,'index.html'),html);
await writeFile(resolve(out,'neutral-source.html.gz'),gzipSync(html,{level:9}));
await writeFile(resolve(out,'neutral-source.json'),JSON.stringify(record,null,2)+'\n');
if(hash(await readFile(resolve(root,'index.html')))!==productionSha256)throw Error('Production artifact changed while deriving neutral diagnostic');
console.log(JSON.stringify(record,null,2));
