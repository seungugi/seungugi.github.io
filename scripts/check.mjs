import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const profile=JSON.parse(await fs.readFile(path.join(root,'content/profile.json'),'utf8'));
const pages=['index.html','404.html',...profile.projects.map(p=>'projects/'+p.slug+'.html')];
let links=0,anchors=0;
for(const name of pages){
 const html=await fs.readFile(path.join(root,name),'utf8');
 assert(!/X-Amz-|notion-file-block:|undefined/.test(html),`Unresolved content in ${name}`);
 assert(html.includes('<html lang="ko">'),`Missing Korean language: ${name}`);
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const url=m[1];if(/^(https?:|mailto:|tel:)/.test(url))continue;
  let [urlPath,anchor]=url.split('#');urlPath=urlPath.split('?')[0];let file=urlPath?path.resolve(urlPath.startsWith('/')?root:path.dirname(path.join(root,name)),'.'+(urlPath.startsWith('/')?urlPath:'/')+(urlPath.startsWith('/')?'':urlPath)):path.join(root,name);
  if((await fs.stat(file).catch(()=>null))?.isDirectory())file=path.join(file,'index.html');
  await fs.access(file).catch(()=>{throw new Error(`Broken local link ${name}: ${url}`)});links++;
  if(anchor){const target=await fs.readFile(file,'utf8');assert(target.includes(`id="${anchor}"`),`Missing anchor ${name}: ${url}`);anchors++;}
 }
}
for(const p of profile.projects){const md=await fs.readFile(path.join(root,'content/projects',p.slug+'.md'),'utf8');const html=await fs.readFile(path.join(root,'projects',p.slug+'.html'),'utf8');for(const h of md.matchAll(/^#{1,3} (.+)$/gm))assert(html.includes(h[1]),`Missing source heading: ${p.slug}/${h[1]}`);}
assert(profile.projects.length===4);assert(profile.skills.length===13);assert(profile.certificates.find(c=>c.name==='OPIC').score===null);
console.log(`PASS: ${pages.length} HTML pages, ${links} local links, ${anchors} anchors, all source project headings, no expired asset URLs.`);
