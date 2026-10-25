import {styles,styleId,projectStyle,suggestStyle} from './appearance.js';
export function setupAppearance({getState:S,works:W,save,render,show,close,toast,head,esc}){
 function picker(projectId=''){
  const p=S().projects?.find(p=>p.id===projectId),current=p?projectStyle(p,S().appearance):styleId(S().appearance),suggestion=p?suggestStyle(p,W()):null;
  const card=s=>`<button class="style-card" data-action="t-apply" data-style-choice="${s.id}" data-project="${esc(p?.id||'')}" aria-pressed="${current===s.id}"><span class="style-sample" style="--sample-paper:${s.paper};--sample-ink:${s.ink};--sample-accent:${s.accent}"><small>${s.era}</small><b>在人间，回声。</b><i></i></span><span class="style-description"><strong>${s.name}${current===s.id?' · 当前':''}${suggestion?.id===s.id?' · 建议试试':''}</strong>${s.description}</span></button>`;
  show(`${head(p?'为这件作品选择风格':'为你的创作空间换一种气质')}<p class="muted">${p?'选择后只改变这件作品。风格会用于写作、阅读预览、公开版本与 HTML 导出。':'平台默认风格会随账号保存。作品也可以单独选择自己的风格。'}</p>${suggestion?`<div class="style-suggestion">${esc(suggestion.reason)}<br>这是一条排版建议，你的文字不会因此改变。</div>`:''}<div class="style-grid">${styles.map(card).join('')}</div>${p?`<button data-action="t-apply" data-style-choice="inherit" data-project="${esc(p.id)}">跟随平台默认风格${!p.styleId?' · 当前':''}</button><p class="muted" style="margin-top:12px">已分享的版本保持发表时的风格。要让读者看到新风格，请再更新公开版本。</p>`:'<p class="muted">「昨日刊物」取意于七八十年代的书刊与唱片内页，以字体、留白与纸墨色构成，不会给原作封面添加滤镜。</p>'}`);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-action^="t-"]');if(!b)return;if(b.dataset.action==='t-open')return picker();if(b.dataset.action==='t-project')return picker(b.dataset.project);if(b.dataset.action==='t-apply'){
  const p=S().projects?.find(p=>p.id===b.dataset.project);
  if(b.dataset.project&&!p)return;
  if(p){if(b.dataset.styleChoice==='inherit')delete p.styleId;else p.styleId=styleId(b.dataset.styleChoice);p.updatedAt=new Date().toISOString();}
  else S().appearance=styleId(b.dataset.styleChoice);
  save();close();render();toast(p?'这件作品的风格已保存。':'创作空间的风格已更新。');
 }});
 return {picker};
}
