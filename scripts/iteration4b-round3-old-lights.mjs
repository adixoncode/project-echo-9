/** QA-only photometric A/B: freeze final baked mesh, restore earlier renderer lights. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {CORRIDOR_LIGHT_TABLE as oldLights} from '../docs/qa/overhaul-v1/iteration-4b/round-2/source/src/corridor-lights.js';
import {CORRIDOR_LIGHT_TABLE as finalLights} from '../src/corridor-lights.js';
const out='docs/qa/overhaul-v1/iteration-4b/round-3',dir='/tmp/echo9-4b-oldlights';await mkdir(dir,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');let html=await readFile('index.html','utf8');const productionSha256=hash(html);
const marker='corridorScene=buildCorridor();';if(html.split(marker).length!==2)throw Error('Expected one corridor build');
// Build from the FINAL table first. Geometry, material colors/PBR/emission,
// source housings and orientations stay identical; only renderer table inputs
// and its cached shadows/probe/scattering use the old photometry.
const hook=`${marker}\n    const previousPhotometry=${JSON.stringify(oldLights)};CORRIDOR_LIGHT_TABLE.forEach((source,i)=>Object.assign(source,previousPhotometry[i]));window.__echoLightingAB={mode:'old renderer lights on exact final mesh',finalVisibleEmitters:true};`;
html=html.replace(marker,hook);const changes=finalLights.map((l,i)=>({id:l.id,positionUnchanged:JSON.stringify(l.position)===JSON.stringify(oldLights[i].position),colorUnchanged:JSON.stringify(l.color)===JSON.stringify(oldLights[i].color),old:{target:oldLights[i].target,power:oldLights[i].power},final:{target:l.target,power:l.power}}));
if(changes.some(c=>!c.positionUnchanged||!c.colorUnchanged))throw Error('This controlled study requires unchanged source positions/colors');
await writeFile(`${dir}/index.html`,html);await writeFile(`${out}/old-lights-source.html.gz`,gzipSync(html,{level:9}));await writeFile(`${out}/old-lights-source.json`,JSON.stringify({productionSha256,oldLightsSha256:hash(html),scope:'Actual final baked vertices/surfaces/housing orientation/emission held fixed; after build and before renderer/bake, restore all old renderer light-table fields. No shader/post/exposure/effect change. Runtime hashes required to establish exact mesh identity.',changes,oldLights,finalLights},null,2)+'\n');console.log('Derived old-light renderer-only baseline; final mesh frozen.');
