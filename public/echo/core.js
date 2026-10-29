import {validatePersonalContext} from './inspiration.js';
import {styles} from './appearance.js';
export function similarity(a,b){
 if(a.id===b.id)return {score:0,reasons:[]};
 const intersection=(x=[],y=[])=>[...new Set(x)].filter(t=>y.includes(t));
 const at=(a.tags||[]).filter(t=>t!=='未分类'),bt=(b.tags||[]).filter(t=>t!=='未分类');const knownCreator=a.creator&&!['未知','创作者待补充','未填写'].includes(a.creator)&&a.creator===b.creator;
 const tags=intersection(at,bt),moods=intersection(a.moods,b.moods),weather=intersection(a.weather,b.weather);
 const union=new Set([...at,...bt]).size;
 const score=(union?tags.length/union:0)*.65+(moods.length/Math.max(1,new Set([...(a.moods||[]),...(b.moods||[])]).size))*.2+(knownCreator?.15:0);
 return {score:Math.round(score*100),reasons:[...tags.map(x=>'共同主题 · '+x),...moods.map(x=>'共同情绪 · '+x),...(knownCreator?['共同创作者 · '+a.creator]:[])],tags,weather};
}
export function related(work,works,limit=5){return works.filter(x=>x.id!==work.id).map(x=>({work:x,...similarity(work,x)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.work.id.localeCompare(b.work.id)).slice(0,limit);}
const clean=t=>String(t||'').trim().toLocaleLowerCase();
const known=t=>t&&t!=='未分类';
export function tasteVector(works,{entries=[],preferences={},signals=[]}={}){
 const byId=new Map(works.map(w=>[w.id,w])),v=new Map(),add=(key,n)=>{if(known(key))v.set(clean(key),(v.get(clean(key))||0)+n);};
 for(const t of preferences.themes||[])add(t,3.2);
 for(const t of preferences.avoid||[])add(t,-3.5);
 for(const t of preferences.moods||[])add('mood:'+t,1.8);
 for(const t of preferences.media||[])add('media:'+t,1.2);
 for(const e of entries){const w=byId.get(e.workId);if(!w)continue;const strength=e.status==='已体验'?(e.rating>=4?1.6:e.rating>0&&e.rating<=2?-.8:0):0;if(strength){for(const t of w.tags||[])add(t,strength);add('media:'+w.type,strength*.55);for(const m of w.moods||[])add('mood:'+m,strength*.35);}}
 for(const s of signals){const w=byId.get(s.workId),strength=s.value===1?2.8:s.value===-1?-3:0;if(w&&strength){for(const t of w.tags||[])add(t,strength);add('media:'+w.type,strength*.55);for(const m of w.moods||[])add('mood:'+m,strength*.35);}}
 const scale=Math.max(3.2,...[...v.values()].map(Math.abs));return Object.fromEntries([...v].map(([k,n])=>[k,n/scale]));
}
export function recommend(works,{weather='雨天',mood='沉静',entries=[],preferences={},signals=[],offset=0}={}){
 const vector=tasteVector(works,{entries,preferences,signals}),seen=new Set([...entries.map(x=>x.workId),...signals.map(x=>x.workId)]);
 return ['书籍','电影','音乐'].map(type=>{
  const ranked=works.filter(w=>w.type===type&&!seen.has(w.id)).map(work=>{
   const reasons=[],tags=(work.tags||[]).filter(known),personal=tags.map(t=>({t,s:vector[clean(t)]||0})).sort((a,b)=>b.s-a.s),liked=personal.filter(x=>x.s>.08),avoided=personal.filter(x=>x.s<-.18),moodFit=(work.moods||[]).includes(mood),mediaFit=preferences.media?.includes(type),weatherFit=(work.weather||[]).includes(weather),mediaAffinity=vector[clean('media:'+type)]||0,moodAffinity=Math.max(0,...(work.moods||[]).map(m=>vector[clean('mood:'+m)]||0));
   const affinity=personal.reduce((n,x)=>n+x.s,0)/Math.max(1,Math.sqrt(tags.length));
   const score=Math.max(0,Math.min(100,Math.round(50+affinity*24+mediaAffinity*9+moodAffinity*5+(moodFit?6:0)+(mediaFit?8:0)+(weatherFit?6:0)-(avoided.length?Math.min(20,avoided.length*7):0))));
   if(liked[0])reasons.push('贴近你偏爱的「'+liked[0].t+'」');
   if(moodFit)reasons.push('符合当前的「'+mood+'」情绪');
   if(mediaFit||mediaAffinity>.1)reasons.push('根据你对'+type+'的选择继续探索');
   if(weatherFit)reasons.push('适合'+weather+'的氛围');
   if(avoided[0])reasons.push('包含你暂时少看的「'+avoided[0].t+'」');
   if(!reasons.length)reasons.push('为你打开一条新的跨媒介路径');
   return {work,score,reasons,profileMatches:liked.map(x=>x.t),avoided:avoided.map(x=>x.t)};
  }).sort((a,b)=>b.score-a.score||a.work.id.localeCompare(b.work.id));
  if(!ranked.length)return null;
  const top=ranked.slice(0,Math.min(5,ranked.length));return top[offset%top.length];
 }).filter(Boolean);
}
export function networkLayout(works,{width=900,height=620,limit=72,threshold=12}={}){
 const nodes=works.slice(0,limit).map((work,i)=>({work,x:width/2+Math.cos(i*2.399963+0.31)*(45+Math.sqrt(i+1)*36),y:height/2+Math.sin(i*2.399963+0.31)*(35+Math.sqrt(i+1)*28),vx:0,vy:0})),links=[];
 for(let i=0;i<nodes.length;i++){const candidates=nodes.map((n,j)=>j===i?null:{j,...similarity(nodes[i].work,n.work)}).filter(x=>x&&x.score>0).sort((a,b)=>b.score-a.score),strong=candidates.filter(x=>x.score>=threshold),top=(strong.length?strong:candidates).slice(0,2);for(const r of top){const a=Math.min(i,r.j),b=Math.max(i,r.j);if(!links.some(e=>e.a===a&&e.b===b))links.push({a,b,score:r.score,reasons:r.reasons});}}
 for(let step=0;step<96;step++){
  const f=step<48?1:.52;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),force=Math.max(0,118-d)*.010*f;a.vx-=dx/d*force;a.vy-=dy/d*force;b.vx+=dx/d*force;b.vy+=dy/d*force;}
  for(const edge of links){const a=nodes[edge.a],b=nodes[edge.b],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),ideal=188-edge.score*.72,force=(d-ideal)*.0015*f;a.vx+=dx/d*force;a.vy+=dy/d*force;b.vx-=dx/d*force;b.vy-=dy/d*force;}
  for(const n of nodes){n.vx+=(width/2-n.x)*.0005;n.vy+=(height/2-n.y)*.0005;n.vx*=.78;n.vy*=.78;n.x=Math.max(42,Math.min(width-42,n.x+n.vx));n.y=Math.max(45,Math.min(height-58,n.y+n.vy));}
 }
 return {nodes:nodes.map(({work,x,y})=>({work,x:Math.round(x*10)/10,y:Math.round(y*10)/10})),edges:links};
}
export function parseCSV(text){const rows=[];let row=[],value='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(value);value='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(x=>x.trim()))rows.push(row);row=[];value='';}else value+=c;}if(quoted)throw Error('CSV 引号未闭合');row.push(value);if(row.some(x=>x.trim()))rows.push(row);const headers=(rows.shift()||[]).map(x=>x.replace(/^\uFEFF/,'').trim());return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));}
export function validateBackup(data){if(data?.appearance!==undefined&&!styles.some(s=>s.id===data.appearance))throw Error('空间风格不正确');if(!data||data.version!==1||!Array.isArray(data.entries)||!Array.isArray(data.customWorks)||!Array.isArray(data.journal))throw Error('不是回声 v1 备份文件');if(data.entries.length+data.customWorks.length+data.journal.length>10000)throw Error('单次最多导入 10000 条记录');const string=(x,n=5000)=>typeof x==='string'&&x.length<=n;const ids=new Set();for(const w of data.customWorks){if(!string(w.id,100)||ids.has(w.id)||!string(w.title,200)||!w.title.trim()||!['书籍','电影','音乐'].includes(w.type)||!string(w.creator,200)||!['tags','weather','moods'].every(k=>Array.isArray(w[k])&&w[k].length<=30&&w[k].every(t=>string(t,100))))throw Error('作品数据格式不正确');ids.add(w.id);}for(const e of data.entries){if(!string(e.id,100)||!string(e.workId,100)||!['已体验','体验中','想体验'].includes(e.status)||!Number.isInteger(e.rating)||e.rating<0||e.rating>5||!string(e.note)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date))throw Error('收藏数据格式不正确');}for(const j of data.journal){if(!string(j.id,100)||!string(j.text,10000)||!string(j.date,50)||!string(j.prompt,500))throw Error('手记数据格式不正确');}for(const k of ['projects','memories'])if(data[k]!==undefined&&!Array.isArray(data[k]))throw Error('创作数据格式不正确');if((data.projects||[]).length>200)throw Error('最多保留200个创作项目');for(const p of data.projects||[]){if(p?.styleId!==undefined&&!styles.some(s=>s.id===p.styleId))throw Error('作品风格不正确');if(!p||!string(p.id,100)||!string(p.title,300)||!['随笔','视频脚本','播客提纲'].includes(p.format)||!['构思中','写作中','已完成'].includes(p.status)||!Array.isArray(p.sourceIds)||p.sourceIds.length>100||!p.sourceIds.every(x=>string(x,100))||!Array.isArray(p.sections)||p.sections.length>20||!p.sections.every(x=>x&&string(x.heading,200)&&string(x.body,100000))||!string(p.updatedAt,50))throw Error('创作项目格式不正确');}for(const m of data.memories||[])if(!m||!string(m.id,100)||!string(m.workId,100)||!string(m.text,5000)||!string(m.date,50))throw Error('回忆格式不正确');if(data.preferenceProfile!==undefined){const p=data.preferenceProfile;if(!p||typeof p!=='object'||!['themes','moods','media','avoid'].every(k=>Array.isArray(p[k])&&p[k].length<=40&&p[k].every(x=>string(x,100))))throw Error('偏好地图格式不正确');}if(data.tasteSignals!==undefined&&(!Array.isArray(data.tasteSignals)||data.tasteSignals.length>500||!data.tasteSignals.every(x=>x&&string(x.workId,100)&&[1,-1].includes(x.value))))throw Error('推荐反馈格式不正确');validatePersonalContext(data);return data;}
