// Curated palettes only. Stored preferences never become executable CSS.
export const styles = [
 {id:'retro',name:'昨日刊物',era:'70s / 80s',description:'奶油纸、砖红油墨与橄榄绿。把每一次表达，装订成自己的刊物。',paper:'#f3e8ce',surface:'#eaddbc',ink:'#342f25',muted:'#70634f',accent:'#a44028',line:'#c7b38c',hero:'#404630',heroInk:'#f8edcf',serif:true},
 {id:'screen',name:'银幕留白',era:'CINEMA NOTES',description:'黑白、细线与大段留白。让影像观察、城市与人的故事缓缓展开。',paper:'#f4f3ef',surface:'#e6e5e0',ink:'#252525',muted:'#676761',accent:'#484843',line:'#c5c4bd',hero:'#292927',heroInk:'#f4f3ef',serif:false},
 {id:'garden',name:'苔绿手稿',era:'FIELD JOURNAL',description:'植物绿与温润纸色。适合自然观察、日常散文与安静的自我对话。',paper:'#f1f3e9',surface:'#e2e8d8',ink:'#2c4438',muted:'#5c6f58',accent:'#486c42',line:'#bfcbb4',hero:'#304a3c',heroInk:'#edf1df',serif:true},
 {id:'classic',name:'回声书房',era:'ECHO ORIGINAL',description:'保留熟悉的浅色书房。柔和、克制，让注意力回到文字本身。',paper:'#f5f3ed',surface:'#eceee5',ink:'#263c35',muted:'#64715e',accent:'#80653e',line:'#cbd0c2',hero:'#1c3128',heroInk:'#f0ecdd',serif:true}
];
export function styleId(value,fallback='retro'){return styles.some(s=>s.id===value)?value:fallback;}
export function getStyle(value){return styles.find(s=>s.id===styleId(value));}
export function projectStyle(project,platform='retro'){return styleId(project?.styleId,styleId(platform));}
export function suggestStyle(project,works=[]){
 const tags=[project.theme,...works.filter(w=>project.sourceIds?.includes(w.id)).flatMap(w=>w.tags||[])].join(' ');
 if(/自然|植物|日常|田园|森林/.test(tags))return {id:'garden',reason:'素材里出现了自然或日常的线索，温润的绿与手稿感或许适合它。'};
 if(project.format==='视频脚本'||/城市|影像|建筑/.test(tags))return {id:'screen',reason:'影像与城市的观察，可以试试黑白留白，让叙述和画面成为主角。'};
 return {id:'retro',reason:'试试旧刊物的纸感与油墨色，把来自不同作品的线索编成自己的文艺专刊。'};
}
export function readingCSS(value){const s=getStyle(value);return `:root{color-scheme:light}body{max-width:760px;margin:60px auto;padding:0 25px;background:${s.paper};color:${s.ink};font:17px/2 ${s.serif?'Georgia,"Songti SC",SimSun,serif':'Arial,"Microsoft YaHei",sans-serif'}}h1{font-size:36px;line-height:1.5;border-top:4px solid ${s.accent};padding-top:25px}h2{font-size:23px;margin-top:45px;color:${s.accent}}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:${s.muted}}footer{border-top:1px solid ${s.line};margin-top:50px;padding-top:20px;font-size:12px}@media(max-width:540px){body{margin:30px auto;padding:0 20px;font-size:16px}h1{font-size:29px}h2{font-size:21px}}`;}
