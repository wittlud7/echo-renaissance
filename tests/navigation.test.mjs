import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationGroups,navigationGroup,sectionNavigation} from '../public/echo/navigation.js';

test('旧页面全部拥有唯一主入口，主导航最多四项',()=>{
 assert.equal(navigationGroups.length,4);
 for(const page of ['atelier','notebook','journal','collection','retrospective','connections','today','universe','renaissance','studio','commons','read','person']){
  assert.equal(navigationGroups.filter(g=>g.pages.includes(page)).length,1,page);
 }
 for(const group of navigationGroups)assert.ok(group.tabs.length<=3);
});
test('深链接、旧札记链接和未知地址保持可理解的导航归属',()=>{
 assert.equal(navigationGroup('read/shared-id').id,'create');
 assert.equal(navigationGroup('person/author-id').id,'create');
 assert.equal(navigationGroup('journal').id,'materials');
 assert.equal(navigationGroup('connections').id,'materials');
 assert.equal(navigationGroup('universe').id,'discover');
 assert.equal(navigationGroup('unknown').id,'atelier');
});
test('二级入口保留导入工具，阅读页和札记别名标记正确位置',()=>{
 assert.equal(sectionNavigation('atelier'),'');
 assert.match(sectionNavigation('connections'),/class="section-utility" href="#connections" aria-current="page"/);
 assert.match(sectionNavigation('journal'),/href="#notebook" aria-current="page"/);
 assert.match(sectionNavigation('read'),/href="#commons" aria-current="page"/);
 assert.match(sectionNavigation('universe'),/href="#universe" aria-current="page"/);
});
