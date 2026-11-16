import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function build(){
  const files=['math.js','geometry.js','scene.js','shaders.js','main.js'];
  let script='';
  for(const file of files){
    const source=await readFile(resolve(root,'src',file),'utf8');
    script+=`\n// ${file}\n`+source.replace(/^import .*?;\n/gm,'').replace(/^export /gm,'');
  }
  const css=await readFile(resolve(root,'src/style.css'),'utf8'),template=await readFile(resolve(root,'src/template.html'),'utf8');
  const html=template.replace('/*__CSS__*/',()=>css).replace('/*__SCRIPT__*/',()=>script);
  await writeFile(resolve(root,'index.html'),html);
  return {html,bytes:Buffer.byteLength(html),gzipBytes:gzipSync(html,{level:9}).byteLength};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=await build();console.log(`Built standalone index.html: ${result.bytes.toLocaleString()} bytes raw · ${result.gzipBytes.toLocaleString()} bytes gzip`);
}
