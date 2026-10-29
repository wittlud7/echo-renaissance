// Four user tasks own every route, including shared reading links and old bookmarks.
export const navigationGroups=[
 {id:'atelier',label:'工作台',href:'atelier',pages:['atelier'],tabs:[]},
 {id:'materials',label:'我的素材',href:'notebook',pages:['notebook','journal','collection','retrospective','connections'],tabs:[['notebook','私人札记'],['collection','书影音'],['retrospective','经历回顾']]},
 {id:'discover',label:'发现灵感',href:'today',pages:['today','universe','renaissance'],tabs:[['today','为你推荐'],['universe','3D 星空'],['renaissance','创作练习']]},
 {id:'create',label:'创作与分享',href:'studio',pages:['studio','commons','read','person'],tabs:[['studio','我的作品'],['commons','作品广场']]}
];
export function navigationGroup(route){const page=String(route||'atelier').split('/')[0];return navigationGroups.find(g=>g.pages.includes(page))||navigationGroups[0];}
export function sectionNavigation(page){const group=navigationGroup(page);if(!group.tabs.length)return '';const active=page==='journal'?'notebook':['read','person'].includes(page)?'commons':page;return `<div class="section-navigation"><nav aria-label="${group.label}内导航">${group.tabs.map(([route,label])=>`<a href="#${route}" ${active===route?'aria-current="page"':''}>${label}</a>`).join('')}</nav>${group.id==='materials'?`<a class="section-utility" href="#connections" ${page==='connections'?'aria-current="page"':''}>导入与同步 ↗</a>`:''}</div>`;}
