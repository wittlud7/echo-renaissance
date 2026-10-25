import test from 'node:test';
import assert from 'node:assert/strict';
import {projectStyle,readingCSS,suggestStyle} from '../public/echo/appearance.js';
import {publicationSnapshot} from '../lib/publications.mjs';
import {checkVault} from '../lib/vault-validation.mjs';
const project={id:'a',title:'在生活里观看',format:'随笔',status:'写作中',sourceIds:[],sections:[{heading:'一个瞬间',body:'自己的观察。'.repeat(30)}],updatedAt:'2026-10-22T00:00:00Z'};
const consent={authorName:'作者',intent:'重新看待日常',confirmed:true};
test('旧草稿跟随平台，作品可独立定稿；建议不改变正文与风格',()=>{
 assert.equal(projectStyle(project,'garden'),'garden');
 assert.equal(projectStyle({...project,styleId:'screen'},'garden'),'screen');
 const draft={...project,theme:'自然',styleId:'retro'},before=JSON.stringify(draft);
 assert.equal(suggestStyle(draft).id,'garden');assert.equal(JSON.stringify(draft),before);
 assert.equal(suggestStyle({...project,format:'视频脚本'}).id,'screen');
});
test('公开版本固定发表时的风格，后续空间风格不改变它；拒绝任意CSS',()=>{
 const snapshot=publicationSnapshot(project,[],consent,'garden');assert.equal(snapshot.styleId,'garden');
 const p={...project,styleId:'screen'};const fixed=publicationSnapshot(p,[],consent,'garden');p.styleId='retro';assert.equal(fixed.styleId,'screen');
 const unsafe='</style><script>alert(1)</script>';
 assert.equal(publicationSnapshot({...project,styleId:unsafe},[],consent,'garden').styleId,'garden');
 assert.ok(!readingCSS(unsafe).includes('<script>'));
 const vault={version:1,entries:[],customWorks:[],journal:[],projects:[project],demo:false};
 assert.throws(()=>checkVault({...vault,appearance:unsafe}));
 assert.throws(()=>checkVault({...vault,projects:[{...project,styleId:unsafe}]}));
});
