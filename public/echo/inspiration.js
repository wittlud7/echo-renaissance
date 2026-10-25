// Associations are inspectable text/tag matches, never invented personal memories.
const topics={
 '日常':['日常','生活','散步','房间','枕头','窗边','早餐','小事'],
 '记忆':['记忆','回忆','童年','小时候','故乡','过去','往事'],
 '自然':['自然','植物','树木','森林','花园','山','河流','鸟','树叶'],
 '自我':['自我','自己','身份','身体','面孔','成长'],
 '时间':['时间','时光','岁月','等待','衰老'],
 '离别':['离别','告别','失去','离开','分别'],
 '亲密':['亲密','家人','母亲','父亲','朋友','爱人','关系','陪伴'],
 '城市':['城市','街道','地铁','通勤','建筑','搬家'],
 '孤独':['孤独','独处','寂寞','一个人'],
 '观察':['观察','细节','光线','光影','看见','凝视','窗','颜色'],
 '声音':['声音','音乐','歌声','旋律','聆听'],
 '表达':['表达','分享','书信','交流','回应','创作','出版']
};
const norm=s=>String(s||'').normalize('NFKC').toLowerCase();
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'word'}):null;
const common=new Set(['今天','昨天','明天','现在','当时','最近','时候','已经','还是','一直','真的','觉得','感觉','可能','这个','那个','一些','一次','一个','一种','什么','怎么','这样','那样','这里','那里','因为','所以','但是','如果','然后','可以','能够','应该','需要','没有','开始','发现','我的','你的','我们','他们','她们','以及','关于']);
function words(text){return [...new Set((segmenter?[...segmenter.segment(text)].filter(s=>s.isWordLike).map(s=>s.segment):text.match(/[a-z]{3,}|[\p{Script=Han}]{2,8}/gu)||[]).filter(w=>w.length>=2&&w.length<=30&&!common.has(w)&&/\p{L}/u.test(w)))].slice(0,80);}
export function topicTerms(text,tags=[]){const t=norm(text);return Object.entries(topics).filter(([key,words])=>tags.includes(key)||words.some(w=>t.includes(w))).map(([key])=>key);}
export const histories=[
 {id:'leonardo',name:'把观察留在同一页',person:'列奥纳多·达·芬奇',date:'约 1487—1505 年',fact:'Forster 札记保存了几何、水力、马腿、服装与人体等研究，留下跨领域观察的痕迹。',source:'V&A · Leonardo da Vinci’s notebooks',url:'https://www.vam.ac.uk/articles/leonardo-da-vincis-notebooks',topics:['观察','自然','日常'],practice:'选一件小物，写出三个可见细节、一个疑问和一段被它唤起的往事。补一句：我想借它说的是……'},
 {id:'durer',name:'自己与枕头，都值得被看见',person:'阿尔布雷希特·丢勒',date:'1493 年',fact:'在同一张纸上，丢勒研究自己的面孔、手和枕头；背面还描绘了不同枕头的褶皱与光线。',source:'The Met · Self-portrait, Study of a Hand and a Pillow',url:'https://www.metmuseum.org/art/collection/search/459214',topics:['自我','日常','观察'],practice:'先不评价自己，写三句此刻身体的状态，再描写身边一件普通物品。把一个细节改写为随笔的第一句。'},
 {id:'print',name:'让作品来到另一个人面前',person:'欧洲版画与印刷传播',date:'15—16 世纪',fact:'版画与活字印刷扩大了图像和知识的传播；文艺复兴时期的版画也让古罗马建筑与雕塑被更多人看见。',source:'The Met · The Printed Image in the West',url:'https://www.metmuseum.org/essays/the-printed-image-in-the-west-history-and-techniques',topics:['表达','亲密'],practice:'从私人记录取一个愿意分享的片段，为一位具体的人写一封 80 字短笺。补一句：我希望你读到这里时……'}
];
export function personalMaterials(state,works,entries=state.entries||[]){
 const known=works instanceof Map?works:new Map(works.map(w=>[w.id,w]));
 const workTags=id=>known.get(id)?.tags||[];
 return [
  ...(state.journal||[]).map(j=>({key:'journal:'+j.id,id:j.id,kind:'journal',label:'我的札记',title:j.title||j.text.slice(0,24),text:j.text,date:j.eventDate||j.date,dateKind:j.eventDate?'经历发生':'记录写于',tags:j.tags||[],workId:'',ref:{kind:'journal',id:j.id}})),
  ...(state.memories||[]).map(m=>({key:'memory:'+m.id,id:m.id,kind:'memory',label:'我的回忆',title:known.get(m.workId)?.title||'一段自己的回忆',text:m.text,date:m.date,dateKind:'回忆记录于',tags:workTags(m.workId),workId:m.workId,ref:{kind:'memory',id:m.id}})),
  ...entries.filter(e=>e.status!=='想体验'&&e.note?.trim()).map(e=>({key:'entry:'+e.id,id:e.id,kind:'entry',label:'我的作品短评',title:known.get(e.workId)?.title||'过去的短评',text:e.note,date:e.dateUnknown?'':e.date,dateKind:'相遇日期',tags:workTags(e.workId),workId:e.workId,ref:{kind:'entry',id:e.id}}))
 ];
}
export function connectPast(query,materials,{tags=[],exclude='',limit=6}={}){
 const text=norm(query),qt=topicTerms(text,tags),explicit=tags.map(norm).filter(t=>t.length>1);
 const terms=words(text);
 if(!text.trim()&&!tags.length)return [];
 return materials.filter(m=>m.key!==exclude).map(m=>{
  const target=norm(m.text+' '+m.title),mt=topicTerms(target,m.tags),shared=qt.filter(t=>mt.includes(t));
  const literal=[...new Set([...explicit,...terms])].filter(t=>target.includes(t)||(m.tags||[]).map(norm).includes(t));
  const reasons=[...new Set([...shared,...literal])].slice(0,5);const score=shared.length*2+literal.length*3;
  return {...m,reasons,score};
 }).filter(m=>m.score>0).sort((a,b)=>b.score-a.score||String(b.date).localeCompare(String(a.date))||a.key.localeCompare(b.key)).slice(0,limit);
}
export function historySuggestions(query,tags=[]){const ts=topicTerms(query,tags);return histories.map(h=>({...h,matches:h.topics.filter(t=>ts.includes(t))})).sort((a,b)=>b.matches.length-a.matches.length);}
export function creativeDirections(records){
 const groups=new Map();for(const m of records){for(const topic of topicTerms(m.text+' '+m.title,m.tags)){const list=groups.get(topic)||[];list.push(m);groups.set(topic,list);}}
 return [...groups].filter(([,items])=>items.length>=2).sort((a,b)=>b[1].length-a[1].length).slice(0,4).map(([topic,items])=>({topic,items,title:`关于「${topic}」，我真正想说什么？`,question:`这些不同时间的记录里，什么改变了，什么仍然重要？`}));
}
export function validatePersonalContext(state){
 if(state.captureDraft!==undefined&&(!state.captureDraft||Array.isArray(state.captureDraft)||typeof state.captureDraft!=='object'))throw Error('札记草稿格式不正确');
 const str=(s,max)=>typeof s==='string'&&s.length<=max;
 const refs=rs=>Array.isArray(rs)&&rs.length<=100&&rs.every(r=>r&&['journal','memory','entry'].includes(r.kind)&&str(r.id,100));
 const history=ids=>Array.isArray(ids)&&ids.length<=histories.length&&ids.every(id=>histories.some(h=>h.id===id));
 const compass=c=>c&&str(c.question,600)&&str(c.why,600)&&str(c.reader,200);
 for(const j of [...(state.journal||[]),...(state.captureDraft?[state.captureDraft]:[])]){
  if(!j||typeof j!=='object')throw Error('札记格式不正确');
  if(j.title!==undefined&&!str(j.title,200)||j.tags!==undefined&&(!Array.isArray(j.tags)||j.tags.length>12||!j.tags.every(t=>str(t,100)))||j.kind!==undefined&&!['随笔','经历','观察'].includes(j.kind)||j.eventDate!==undefined&&(typeof j.eventDate!=='string'||j.eventDate!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(j.eventDate))||j.linkedRefs!==undefined&&!refs(j.linkedRefs)||j.historyIds!==undefined&&!history(j.historyIds))throw Error('札记的连接或经历日期格式不正确');
 }
 const d=state.captureDraft;if(d&&(d.text!==undefined&&!str(d.text,10000)||d.prompt!==undefined&&!str(d.prompt,500)||d.noteId!==undefined&&!str(d.noteId,100)||d.compass!==undefined&&!compass(d.compass)))throw Error('札记草稿格式不正确');
 for(const p of state.projects||[])if(p.originRefs!==undefined&&!refs(p.originRefs)||p.historyIds!==undefined&&!history(p.historyIds)||p.creativeCompass!==undefined&&!compass(p.creativeCompass))throw Error('创作罗盘或素材出处格式不正确');
 return state;
}
