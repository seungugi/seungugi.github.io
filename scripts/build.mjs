import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const {marked}=createRequire(import.meta.url)('marked');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const styleVersion=createHash('sha256').update(await fs.readFile(path.join(root,'styles.css'))).digest('hex').slice(0,12);
const sectionsVersion=createHash('sha256').update(await fs.readFile(path.join(root,'assets/sections.js'))).digest('hex').slice(0,12);
const data=JSON.parse(await fs.readFile(path.join(root,'content/profile.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const out=(name,html)=>fs.writeFile(path.join(root,name),html);
const external=(url,label,cls='')=>`<a href="${esc(url)}" class="${cls}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const icons={
 velog:'<path d="M3 0C1.338 0 0 1.338 0 3v18c0 1.662 1.338 3 3 3h18c1.662 0 3-1.338 3-3V3c0-1.662-1.338-3-3-3H3Zm6.883 6.25c.63 0 1.005.3 1.125.9l1.463 8.303c.465-.615.846-1.133 1.146-1.553.465-.66.893-1.418 1.283-2.273.405-.855.608-1.62.608-2.295 0-.405-.113-.727-.338-.967-.21-.255-.608-.577-1.193-.967.6-.765 1.35-1.148 2.25-1.148.48 0 .878.143 1.193.428.33.285.494.704.494 1.26 0 .93-.39 2.093-1.17 3.488-.765 1.38-2.241 3.457-4.431 6.232l-2.227.156-1.711-9.628h-2.25V7.24c.6-.195 1.305-.406 2.115-.63.81-.24 1.358-.36 1.643-.36Z"/>',
 github:'<path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.09c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.03-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.4-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.66 10.66 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8z"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/>',
};
const social=(url,label,icon)=>`<a class="social-icon" href="${esc(url)}" aria-label="${label}"${url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg></a>`;
function header(prefix=''){
 return `<a class="skip" href="#main">본문으로 건너뛰기</a><header class="container header"><div class="header-left"><h1><a href="${prefix||'./'}">${esc(data.name)}</a></h1><h2>${esc(data.headline)}</h2></div><div class="header-right"><div class="social-icons">${social(data.github,'GitHub','github')}${social(data.instagram,'Instagram','instagram')}${social(data.velog,'Velog','velog')}</div><p>Email: <a href="mailto:${data.email}">${data.email}</a></p><p>Phone: <a href="tel:+821075581545">${data.phone}</a></p></div></header>`;
}
function shell(title,description,body,prefix='',canonical=''){
 return `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://seungugi.github.io/${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://seungugi.github.io/${canonical}"><meta property="og:image" content="https://seungugi.github.io/assets/asset-00.webp"><link rel="icon" type="image/svg+xml" href="${prefix}assets/favicon.svg"><link rel="stylesheet" href="${prefix}styles.css?v=${styleVersion}"></head><body>${header(prefix)}${body}<footer class="container footer"><p>${esc(data.name)} · <a href="mailto:${data.email}">${data.email}</a> · ${external(data.github,'Github')}</p></footer></body></html>\n`;
}
const section=(id,title,body)=>id==='about'?`<section class="resume-section" id="${id}"><h2 class="section-title">${title}</h2>${body}</section>`:`<details class="resume-section" id="${id}"><summary><h2 class="section-title">${title}</h2></summary><div class="section-content">${body}</div></details>`;
const row=(title,meta,body)=>`<article class="resume-row"><div class="details"><h3>${title}</h3>${meta}</div><div class="description">${body}</div></article>`;
const projectPoints={
 invader:['그리드 좌표를 바탕으로 모듈을 배치하고, 90도 단위 회전과 배치 미리보기를 구현했습니다.','상점·인벤토리와 보드 상태를 연결하고, 배치된 모듈 데이터를 전투 시스템에 전달했습니다.'],
 blockblaster:['드래그 앤 드롭으로 블록을 배치하고, 완성된 가로·세로 라인의 중복 제거와 콤보 점수를 처리했습니다.','블록 배치 가능 여부를 검사해 게임오버를 판정하고, 오브젝트 풀링과 최고 점수 저장을 적용했습니다.'],
 'hollow-knight':['플레이어 이동·이단 점프·방향별 공격과 Runner, Fly, Crawler 몬스터를 구현했습니다.','방 단위 카메라와 다층 배경으로 Hollow Knight 튜토리얼 일부를 재현했습니다.'],
 gomoku:['2인 턴 전환과 보드 좌표 관리를 구현했습니다.','마지막에 놓인 돌을 기준으로 네 방향을 검사하는 승리 판정과 재시작 기능을 구현했습니다.']
};
const projects=data.projects.map(p=>row(`<a href="projects/${p.slug}.html">${esc(p.name.replace('(Imitation)',''))}</a>`,`${external(p.github,p.github.replace('https://',''),'item-link')}<p>Unity · C#</p><p>${esc(p.genres.join(' · '))}</p>${p.name.includes('Imitation')?'<p>모작 프로젝트</p>':''}`,`<p class="quote">${esc(p.summary)}</p><ul>${projectPoints[p.slug].map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="project-links"><a href="projects/${p.slug}.html">상세 내용 보기 →</a>${p.attachments.map(a=>' · '+external(a.path,esc(a.name))).join('')}</p>`)).join('');
const skillGroup=(title,names)=>`<h3 class="subheading">${title}</h3><ul>${data.skills.filter(s=>names.includes(s.name)).map(s=>`<li><strong>${esc(s.name)}</strong> — ${s.level} / 10</li>`).join('')}</ul>`;
const home=`<main class="container" id="main">
${section('about','About Me',`<div class="about-row"><div class="profile-column"><div class="profile-photo" role="img" aria-label="벚꽃나무 아래의 이승욱" style="background-image:url('${data.photo}')"></div></div><div class="about-content"><p>안녕하세요. 배움을 이어가는 프로그래머 <strong>${esc(data.name)}</strong>입니다.</p><p>부산대학교에서 컴퓨터공학을 전공하고 있습니다. <mark>Unity</mark>와 <mark>C#</mark>을 사용해 게임의 규칙과 플레이를 구현하며, AI 프로젝트와 대회에도 참여하고 있습니다.</p><p>${esc(data.englishName)} · ${esc(data.location)}<br>${data.birth}</p><p>${external('/assets/resume.pdf','이력서 PDF','resume-pdf-link')}</p></div></div>`)}
${section('experience','Experience',data.experience.filter(([,title])=>!data.education.some(s=>s.name===title)).sort((a,b)=>b[0].slice(0,7).localeCompare(a[0].slice(0,7))).map(([period,title,detail])=>row(esc(title),`<p>${esc(period)}</p>`,`<p>${esc(detail)}</p>`)).join(''))}
${section('projects','Projects',projects)}
${section('certificates','자격 · 인증',data.certificates.map(c=>row(esc(c.name),`<p>${c.score!==null?`${c.score}점`:esc(c.status)}</p>`,`<p>${c.name==='TOPCIT'?'TOPCIT 성적 인증':c.name==='NYPC'?'NYPC 마스터 트랙 — 전략 게임 AI 개발':c.name==='OPIC'?'영어 말하기 시험 준비 중':'SK하이닉스 해커톤 참여 인증'}</p>${c.assets.length?`<p>${c.assets.map(a=>external('/'+a.path,/\.pdf$/.test(a.path)?'인증서 PDF':'인증 이미지')).join(' · ')}</p>`:''}`)).join(''))}
${section('skills','Skill',`${skillGroup('개발 · 제작',['Python','C','C#','JavaScript','Blender','GitHub'])}${skillGroup('문서 · 협업 · AI 도구',['Notion','한글','Microsoft Word','Microsoft PowerPoint','Microsoft Excel','ChatGPT','Google Gemini'])}`)}
${section('education','Education',data.education.map((s,i)=>row(esc(s.name),`<p>${esc(s.period)}</p>`,`<p><strong>${esc(s.detail)}</strong></p><p>${esc(s.en)}</p>${i===0?`<ul><li>이수 학점: ${data.credits}</li><li>평점 평균: ${data.gpa}</li></ul>`:''}`)).join(''))}
</main><script src="assets/sections.js?v=${sectionsVersion}" defer></script>`;
await out('index.html',shell('이승욱 | 배움을 이어가는 Programmer','이승욱의 개발 이력서. Unity와 C# 게임 개발 프로젝트, AI 프로젝트 경험과 학습 기록을 소개합니다.',home));
await fs.mkdir(path.join(root,'projects'),{recursive:true});
for(const [i,p] of data.projects.entries()){
 const md=(await fs.readFile(path.join(root,'content/projects',p.slug+'.md'),'utf8')).replaceAll('../../assets/','../assets/');
 const headings=[];let count=0;
 const rendered=marked.parse(md).replace(/<h([12])>([\s\S]*?)<\/h\1>/g,(_,level,label)=>{const id=`section-${++count}`;headings.push({id,label:label.replace(/<[^>]+>/g,'')});return `<h${Number(level)+1} id="${id}">${label}</h${Number(level)+1}>`;});
 const next=data.projects[(i+1)%data.projects.length];
 const body=`<main class="container project-document" id="main"><p class="no-print"><a href="../#projects">← 모든 프로젝트</a></p><h2 class="section-title">${esc(p.name)}</h2><p class="quote">${esc(p.summary)}</p><p class="document-tools">${external(p.github,'GitHub 저장소')}${p.attachments.map(a=>' · '+external('../'+a.path,esc(a.name))).join('')}</p><div class="detail-layout"><aside class="toc no-print" aria-label="프로젝트 목차"><h3>목차</h3>${headings.map(h=>`<a href="#${h.id}">${esc(h.label)}</a>`).join('')}</aside><article class="article">${rendered}<p class="print-only">https://seungugi.github.io/projects/${p.slug}.html</p></article></div><nav class="next-project no-print" aria-label="다른 프로젝트"><a href="../#projects">← 프로젝트 목록</a><a href="${next.slug}.html">${esc(next.name)} →</a></nav></main>`;
 await out(`projects/${p.slug}.html`,shell(`${p.name} | 이승욱`,p.summary,body,'../',`projects/${p.slug}.html`));
}
await out('404.html',shell('페이지를 찾을 수 없습니다 | 이승욱','이승욱 포트폴리오',`<script>if(location.pathname==="/portfolio"||location.pathname.startsWith("/portfolio/")){location.replace(location.origin+(location.pathname.slice("/portfolio".length)||"/")+location.search+location.hash);}</script><main id="main" class="container"><h2 class="section-title">페이지를 찾을 수 없습니다.</h2><p><a href="/">홈으로 돌아가기 →</a></p></main>`,'/'));
await out('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://seungugi.github.io/</loc></url>${data.projects.map(p=>`<url><loc>https://seungugi.github.io/projects/${p.slug}.html</loc></url>`).join('')}</urlset>`);
console.log('Built resume home, 4 project pages, 404 and sitemap.');
