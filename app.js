const DEFAULT_DYNASTIC_HOUSES=[{"id":"volkevich","title":"I. Династический дом Волькевич","body":"Объединяет семейства Волькевич, Ричардсон и Цветкович, составляющие основу главной династии Sims Stories. Принадлежность семейств Грей и Артур к этому дому пока остаётся открытым вопросом.","members":["family-2","family-12","family-1"]},{"id":"capuletti","title":"II. Династический дом Тиби","body":"Объединяет семейства Капулетти, Тиби, Монтекки и Лоран, связанные общей родословной и многовековой историей.","members":["family-3","family-5","family-8","family-17"]},{"id":"third","title":"III. Третий Династический дом","body":"Место пока остаётся незанятым. В будущем на него смогут претендовать семьи, чья история, влияние и династические связи позволят им получить особый статус.","members":[]}];
const OFFICIAL_SIMS4_CITIES=["Стрейнджервиль","Честнат-Ридж","Оазис Спрингс","Тартоза","Ондарион","Дель-Соль-Вэлли","Ньюкрест","Сан Мишуно","Эвергрин-Харбор","Сан-Секвойя","Виллоу Крик","Магнолия Променейд","Бриндлтон-Бэй","Форготтн Холлоу","Гора Комореби","Коппердейл","Глиммербрук","Вранбург","Мунвуд Милл","Сиудад-Энаморада","Хэнфорд-он-Бэгли","Гибби-Пойнт","Бритчестер","Винденбург","Иннисгрин","Нордхавен","Томаранг","Сулани"];
const REMAINING_FAMILY_ORDER=["Ландграаб","Гот","Лотарио","Кальенте","Али","Даронги","Гинана","Эль Кассар","Абрантеш","Ланмей","Истри","Атрау","Альто"];
const CITY_RENAMES={'Сан-Мишуно':'Сан Мишуно','Оазис-Спрингс':'Оазис Спрингс','Виллоу-Крик':'Виллоу Крик','Форготн-Холлоу':'Форготтн Холлоу','Комореби':'Гора Комореби'};
// Apply the new catalog once. Preserve custom cities, biographies and photos.
function updateCityCatalog(){
 if((data.catalogVersion||0)>=2)return;
 const oldNames=Array.isArray(data.cities)?data.cities:[];
 const extra=oldNames.map(n=>CITY_RENAMES[n]||n).filter(n=>!OFFICIAL_SIMS4_CITIES.includes(n));
 data.cities=[...OFFICIAL_SIMS4_CITIES,...new Set(extra)];
 data.cityDetails ||= {};
 for(const [from,to] of Object.entries(CITY_RENAMES)){
   if(from===to)continue;
   const old=data.cityDetails[from];
   if(old){
     const current=data.cityDetails[to]||{};
     data.cityDetails[to]={...old,...current,description:current.description||old.description||'',photos:[...new Set([...(old.photos||[]),...(current.photos||[])])]};
     delete data.cityDetails[from];
   }
   for(const records of [data.blocks||[],data.articles||[]]){
     for(const record of records)if(record.parent==='city/'+from)record.parent='city/'+to;
   }
 }
 data.catalogVersion=2;
}
const ownerMode=location.protocol==='file:' || new URLSearchParams(location.search).get('edit')==='1';document.body.classList.toggle('public-view',!ownerMode);
let data,active='home';const app=document.querySelector('#app'),nav=document.querySelector('#nav');const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const page=id=>data.pages.find(p=>p.id===id);const card=(p)=>`<button class="card" data-go="${esc(p.id)}"><span class="card-icon">${esc((sims4Groups.includes(p.group)||p.group==='Семья'||p.id==='sims4')?'♢':p.icon)}</span><h3>${esc(p.title)}</h3><p>${esc(p.body.split('\n')[0].slice(0,125))}</p><span class="arrow">Подробнее ↗</span></button>`;const worldMenuOrder=['all-families','families','other-families','characters'];
const worldMenuTitles={'all-families':'Династия Sims Stories','families':'Двадцатка влиятельных семей','other-families':'Семьи Sims Stories','characters':'Персонажи'};
const occultOrder=['vampires','werewolves','mages','fairies','mermaids','aliens','ghosts','plantsims'];
const archiveOrder=['stories','updates','mods'];
const sims4Groups=['Мир','Сверхъестественное','Архив'];
const expandedGroups=new Set(JSON.parse(localStorage.getItem('avvomika-nav-open')||'["The Sims 4","Мир"]'));
function groupRank(group,p){const order=group==='Мир'?worldMenuOrder:group==='Сверхъестественное'?occultOrder:archiveOrder;const i=order.indexOf(p.id);return i<0?1000:i;}
function navLink(p,icon){return `<button class="nav-item ${active===p.id?'active':''}" data-go="${esc(p.id)}"><span class="icon">${esc(icon||p.icon||'♢')}</span><span>${esc(p.title)}</span></button>`;}
function drawNav(){
  let html=`<button class="nav-item nav-home ${active==='home'?'active':''}" data-go="home"><span class="icon">⌂</span>Главная</button>`;
  const games=[{key:'The Sims 4',title:'The Sims 4',symbol:'♢',id:'sims4'}, {key:'inZOI',title:'inZOI',symbol:'◈',id:'inzoi'}, {key:'The Sims 3',title:'The Sims 3',symbol:'◇',id:'sims3'}];
  for(const g of games){
    const opened=expandedGroups.has(g.key);
    html+=`<button class="nav-group-toggle game-toggle ${g.id==='sims4'?'sims4-toggle':''}" data-group="${esc(g.key)}" aria-expanded="${opened}"><span class="game-group-name"><span class="game-group-icon">${g.symbol}</span>${g.title}</span><span class="nav-chevron">⌄</span></button>`;
    html+=`<div class="nav-game-items" ${opened?'':'hidden'}>`;
    if(g.id==='sims4'){
      html+=navLink(page('sims4'),'♢');
      for(const group of sims4Groups){
        const isOpen=expandedGroups.has(group),items=data.pages.filter(p=>p.group===group && p.id!=='cities').sort((a,b)=>groupRank(group,a)-groupRank(group,b));
        html+=`<button class="nav-group-toggle nav-subgroup" data-group="${esc(group)}" aria-expanded="${isOpen}"><span>${esc(group)}</span><span class="nav-chevron">⌄</span></button>`;
        html+=`<div class="nav-subgroup-items" ${isOpen?'':'hidden'}>`;
        for(const item of items)html+=navLink(item,'♢');
        if(group==='Сверхъестественное')html+=`<button class="nav-item" data-add-section="1"><span class="icon">＋</span>Добавить раздел</button>`;
        html+='</div>';
      }
    }else{
      html+=navLink(page(g.id),g.symbol);
      const children=data.pages.filter(p=>p.group===g.key);
      for(const child of children)html+=navLink(child,g.symbol);
    }
    html+='</div>';
  }
  html+=`<div class="nav-standalone"><button class="nav-item ${active==='author'?'active':''}" data-go="author"><span class="icon">✎</span>Об авторе</button></div>`;
  nav.innerHTML=html;
}
nav.addEventListener('click',e=>{
 if(e.target.closest('[data-add-section]')){openSectionEditor();return;}
 const toggle=e.target.closest('[data-group]');if(!toggle)return;
 const g=toggle.dataset.group;
 if(expandedGroups.has(g))expandedGroups.delete(g);else expandedGroups.add(g);
 localStorage.setItem('avvomika-nav-open',JSON.stringify([...expandedGroups]));drawNav();
});
function home(){
 const mainCards=['sims4','inzoi','sims3'].map(id=>card(page(id))).join('');
 const authorCard=card(page('author'));
 app.innerHTML=`<section class="hero portal-hero"><h1>Каждый мир —<br><em>новая история.</em></h1></section>
 <section class="section"><div class="section-head"><h2>Выбери мир</h2></div>
 <div class="grid games-grid">${mainCards}</div></section>
 <section class="section author-home-section"><div class="section-head"><h2>Об авторе</h2></div>
 <div class="grid author-home-grid">${authorCard}</div></section>
 <section class="section"><div class="info-box">Это пространство Avvomika: проекты развиваются и пополняются новыми историями.</div></section>`;
}
function sims4Home(){
 const links=[
  ['all-families','Династия Sims Stories'],
  ['families','Двадцатка влиятельных семей'],
  ['other-families','Семьи Sims Stories'],
  ['updates','Дневник Sims Stories']
 ];
 app.innerHTML=`<section class="page sims4-overview">
  <span class="kicker">♢ THE SIMS 4</span>
  <h1>The Sims 4</h1>
  <section class="section"><h2>Разделы Sims Stories</h2>
   <div class="grid sims-stories-grid">${links.map(([id,title])=>`<button class="card sims-story-link" type="button" data-go="${id}"><span class="card-icon">♢</span><h3>${esc(title)}</h3><span class="arrow">Открыть ↗</span></button>`).join('')}</div>
  </section>
  ${universalBlocks('sims4')}
  ${articleList('sims4')}
 </section>`;
}
function editPortal(){const modal=modalForm('Приветствие Avvomika',[{name:'body',label:'Текст главной страницы',multiline:true}],v=>{data.portalDescription=v.body;persist()});modal.querySelector('[name=body]').value=data.portalDescription||''}
function editSims4Intro(){const modal=modalForm('Вступление The Sims 4',[{name:'body',label:'Описание Sims Stories',multiline:true}],v=>{data.homeDescription=v.body;persist()});modal.querySelector('[name=body]').value=data.homeDescription||''}

// Династические дома: три иерархических блока и список остальных семейств Двадцатки.
function dynasticHousesHTML(){
 const houses=data.dynasticHouses||[];
 const assigned=new Set(houses.flatMap(h=>h.members||[]));
 const groupCards=houses.map(h=>{
  const members=(h.members||[]).map(id=>page(id)).filter(Boolean);
  const links=members.map(p=>`<button class="dynastic-family" data-go="${esc(p.id)}"><span class="dynastic-family-symbol">♢</span>${esc(p.title)}<span aria-hidden="true">↗</span></button>`).join('');
  return `<section class="dynastic-house"><div class="dynastic-head"><h2>${esc(h.title)}</h2><button class="edit-current" data-edit-house="${esc(h.id)}">✎ Изменить</button></div><div class="dynastic-description">${linkedText(h.body)}</div>${familyTreeLinks('house/'+h.id,h.title,true)}${members.length?`<div class="dynastic-members">${links}</div>`:'<div class="dynastic-empty">Статус: место свободно</div>'}</section>`;
 }).join('');
 const remaining=data.families.map((name,i)=>page('family-'+(i+1))).filter(p=>p&&!assigned.has(p.id)).sort((a,b)=>{const ai=REMAINING_FAMILY_ORDER.indexOf(a.title),bi=REMAINING_FAMILY_ORDER.indexOf(b.title);return (ai<0?999:ai)-(bi<0?999:bi)});
 return `<section class="dynastic-section"><div class="dynastic-intro"><h2>Династические дома</h2><p>История Двадцатки складывается из династических домов и самостоятельных семейств.</p></div><div class="dynastic-houses">${groupCards}</div><section class="dynastic-remaining"><h2>Остальные семьи Двадцатки</h2><div class="grid">${remaining.map(card).join('')}</div></section></section>`;
}
function editDynasticHouse(id){
 const h=(data.dynasticHouses||[]).find(x=>x.id===id);if(!h)return;
 const modal=modalForm('Редактировать династический дом',[{name:'title',label:'Название дома'},{name:'body',label:'Описание',multiline:true}],v=>{h.title=v.title;h.body=v.body;persist()});
 modal.querySelector('[name=title]').value=h.title;modal.querySelector('[name=body]').value=h.body;
}

function details(p){
 // The Sims Stories dynasty has an editorial page rather than a generic collection layout.
 // This changes only markup: existing description, trees and blocks remain in data.json.
 if(p.id==='all-families'){
   const treeButtons=familyTreeLinks('all-families',p.title);
   app.innerHTML=`<article class="page dynasty-story-page">
     <span class="kicker">♢ THE SIMS 4 / МИР</span>
     <div class="page-top"><h1>${esc(p.title)}</h1></div>
     ${treeButtons}
     <section class="dynasty-story-intro"><div class="prose">${linkedText(p.body)}</div>
       <button class="edit-current" data-edit="${esc(p.id)}">✎ Изменить вступление</button>
     </section>
     ${universalBlocks(p.id)}
     ${articleList(p.id)}
     <div class="dynasty-story-toolbar">
       <div class="dynasty-story-toolbar-title">Продолжить летопись</div>
       <button class="create-main" type="button" data-dynasty-insert="text">＋ Добавить текст</button>
       <button class="create-secondary" type="button" data-dynasty-insert="image">＋ Добавить скриншот</button>
       <p>Добавляй фрагменты по очереди. Стрелками ↑ и ↓ у каждого блока можно менять их порядок.</p>
     </div>
   </article>`;
   return;
 }
 let extra='';
 if(p.id==='families')extra=dynasticHousesHTML()+collection('families')+`<h2 class="spaced-heading">Генеалогические древа</h2><p class="prose">Ссылки на конкретные древа можно добавить на страницах семейств.</p><div class="links">${data.externalTrees.map(x=>`<a target="_blank" rel="noopener" href="${esc(x.url)}">${esc(x.label)} ↗</a>`).join('')}</div>`;
 if(p.id==='all-families')extra=familyTreeLinks('all-families',p.title)+collection(p.id);
 if(p.id==='other-families')extra=collection(p.id);
 if(p.id==='characters')extra=`<div class="residence-tools"><button class="edit-current" data-cities-edit="1">✎ Изменить список городов проживания</button></div>`+collection(p.id);
 if(p.id.startsWith('family-'))extra=familyTreeLinks(p.id,p.title);
 if(p.id==='mods')extra=modsTable();
 if(p.id==='cities')extra=`<h2>Города Симс 4</h2><div class="city-list">${data.cities.map(x=>`<button class="tag city-link" data-city="${esc(x)}">${esc(x)} ↗</button>`).join('')}</div>`;
 if(p.group==='Сверхъестественное')extra+=subsectionsHTML(p.id)+collection(p.id);
 extra+=universalBlocks(p.id)+articleList(p.id);
 app.innerHTML=`<article class="page"><span class="kicker">${esc(sims4Groups.includes(p.group)||p.group==='Семья'?'THE SIMS 4 / '+p.group:'AVVOMIKA / '+p.group)}</span><div class="page-top"><h1>${esc(p.title)}</h1><button class="edit-current" data-edit="${esc(p.id)}">✎ Изменить описание</button></div><div class="prose">${linkedText(p.body)}</div><div class="create-row"><button class="create-main" data-create="${esc(p.id)}">＋ Добавить на страницу</button><button class="create-secondary" data-photo-add="${esc(p.id)}">＋ Добавить фото</button><span class="create-hint">Фото, текст, карточка или отдельная страница</span></div>${extra}</article>`;
}

function editHistory(){const modal=modalForm('История вселенной',[{name:'body',label:'История Sims Stories',multiline:true}],v=>{data.homeHistory=v.body;persist()});modal.querySelector('[name=body]').value=data.homeHistory||''}
function modsTable(){const rows=(data.mods||[]).map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.author)}</td><td>${esc(m.category)}</td><td>${esc(m.version)}</td><td>${esc(m.notes)}</td><td><button class="edit-current" data-mod-edit="${esc(m.id)}">✎</button> <button class="edit-current" data-mod-delete="${esc(m.id)}">×</button></td></tr>`).join('');return `<section class="section mods-section"><div class="section-head"><h2>Мои модификации</h2><button class="edit-current" data-mod-add="1">＋ Добавить мод</button></div><div class="mods-scroll"><table class="mods-table"><thead><tr><th>Мод</th><th>Автор</th><th>Категория</th><th>Версия</th><th>Примечания</th><th>Действия</th></tr></thead><tbody>${rows||'<tr><td colspan="6">Пока нет записей. Нажмите «Добавить мод».</td></tr>'}</tbody></table></div></section>`}
function editMod(id){const old=(data.mods||[]).find(m=>m.id===id);const fields=[{name:'name',label:'Название мода'},{name:'author',label:'Автор'},{name:'category',label:'Категория'},{name:'version',label:'Версия / совместимость'},{name:'notes',label:'Примечания',multiline:true}];const modal=modalForm(old?'Изменить мод':'Добавить мод',fields,v=>{data.mods||=[];if(old)Object.assign(old,v);else data.mods.push({...v,id:'mod-'+Date.now()});persist()});if(old)for(const f of fields)modal.querySelector(`[name="${f.name}"]`).value=old[f.name]||''}
function deleteMod(id){if(!confirm('Удалить мод из таблицы?'))return;data.mods=(data.mods||[]).filter(m=>m.id!==id);persist()}
function normalizeData(){data.pages=data.pages.filter(p=>!['about','servo','chronicle'].includes(p.id));if(!data.pages.some(p=>p.id==='author'))data.pages.push({id:'author',title:'Об авторе',group:'Информация',icon:'✎',body:'Здесь можно рассказать об авторе Sims Stories — Avvomika, истории создания проекта и площадках, где выходят новые истории. Нажмите «Редактировать», чтобы написать свой текст.'});if(!data.pages.some(p=>p.id==='other-families'))data.pages.push({id:'other-families',title:'Семьи Sims Stories',group:'Мир',icon:'♧',body:'Другие семьи, проживающие в мире Sims Stories. Здесь можно добавлять семейства, их истории и отдельные материалы.'});for(const p of data.pages)if(worldMenuTitles[p.id]){p.title=worldMenuTitles[p.id];p.group='Мир'}const dynasty=data.pages.find(p=>p.id==='all-families');if(dynasty)dynasty.title='Династия Sims Stories';const otherFamilies=data.pages.find(p=>p.id==='other-families');if(otherFamilies)otherFamilies.title='Семьи Sims Stories';const order=['all-families','families','other-families','characters'];const occult=['vampires','werewolves','mages','fairies','mermaids','aliens','ghosts','plantsims'];const rank=p=>p.group==='Мир'?order.indexOf(p.id):p.group==='Сверхъестественное'?(occult.indexOf(p.id)<0?100:occult.indexOf(p.id)):0;data.pages.sort((a,b)=>a.group===b.group?rank(a)-rank(b):0);data.homeHistory ||= 'Здесь будет история вселенной Sims Stories. Нажмите «Редактировать историю», чтобы добавить свой текст.';data.mods ||= [];data.dynasticHouses ||= DEFAULT_DYNASTIC_HOUSES.map(h=>({...h,members:[...h.members]}));for(const h of data.dynasticHouses){if(h.id==='capuletti'&&h.title==='II. Династический дом Капулетти'){h.title='II. Династический дом Тиби';h.members=['family-3','family-5','family-8','family-17'];}}updateCityCatalog();for(const [idx,newName] of [[8,'Эль Кассар'],[15,'Ландграаб']]){if(data.families[idx]!==newName){const p=data.pages.find(x=>x.id==='family-'+(idx+1));const old=p?.title||data.families[idx];data.families[idx]=newName;if(p){p.title=newName;if(p.body?.startsWith('История семьи '+old+'.'))p.body=p.body.replace(old,newName)}}}const journal=data.pages.find(p=>p.id==='updates');if(journal)journal.title='Дневник Sims Stories';data.portalDescription ||= 'Истории, персонажи, династии и открытия в The Sims 4, inZOI и The Sims 3.';
 const gamePages=[{id:'sims4',title:'Обзор The Sims 4',group:'Игры',icon:'♢',body:'Мир Sims Stories: династии, биографии и хроники.'},{id:'inzoi',title:'inZOI',group:'Игры',icon:'◈',body:'Мои истории в inZOI. Здесь можно создавать статьи, добавлять описания и материалы по игре.'},{id:'sims3',title:'The Sims 3',group:'Игры',icon:'◇',body:'Мои истории в The Sims 3: династия Симовских и другие события сохранения.'}];
 for(const gp of gamePages)if(!data.pages.some(p=>p.id===gp.id))data.pages.push(gp);const sims4Page=data.pages.find(p=>p.id==='sims4');if(sims4Page)sims4Page.title='The Sims 4';
 for(const item of data.pages)if(sims4Groups.includes(item.group)||item.group==='Семья')item.icon='♢';
}
function searchView(q){const entries=(data.entries||[]).filter(x=>(x.title+' '+x.body).toLowerCase().includes(q.toLowerCase()));let matched=data.pages.filter(p=>p.id!=='cities'&&(p.title+' '+p.body+' '+p.group).toLowerCase().includes(q.toLowerCase()));app.innerHTML=`<section class="page"><span class="kicker">ПОИСК</span><h1>Результаты поиска</h1><p class="lead">Запрос: ${esc(q)}</p>${matched.length||entries.length?`<div class="grid">${matched.map(card).join('')}${entries.map(entryCard).join('')}</div>`:'<div class="empty">Ничего не найдено. Попробуйте другой запрос.</div>'}</section>`}function render({ resetScroll = false } = {}){const savedScrollY=window.scrollY;const currentRoute=location.hash;active=decodeURIComponent(location.hash.slice(1))||'home';const current=page(active);if(current){if(sims4Groups.includes(current.group)||current.group==='Семья')expandedGroups.add('The Sims 4');else if(current.id==='sims4')expandedGroups.add('The Sims 4');else if(current.id==='inzoi')expandedGroups.add('inZOI');else if(current.id==='sims3')expandedGroups.add('The Sims 3');}drawNav();if(active.startsWith('search='))searchView(active.slice(7));else if(active==='home')home();else if(active==='sims4')sims4Home();else if(active.startsWith('article/'))articlePage(decodeURIComponent(active.slice(8)));else if(active.startsWith('city/'))cityPage(decodeURIComponent(active.slice(5)));else{const p=page(active);p?details(p):home()}if(resetScroll){
  window.scrollTo(0,0);
 }else{
  // Rebuilding the page after saving text/photos must not jump to the top.
  // Restore again next frame because closing a dialog may change focus/scroll.
  window.scrollTo(0,savedScrollY);
  requestAnimationFrame(()=>{
   if(location.hash!==currentRoute)return;
   window.scrollTo(0,savedScrollY);
   requestAnimationFrame(()=>{
    if(location.hash===currentRoute)window.scrollTo(0,savedScrollY);
   });
  });
 }}document.addEventListener('click',e=>{const el=e.target.closest('[data-go]');if(el)location.hash=el.dataset.go;const ed=e.target.closest('[data-edit]');if(ed)openEditor(ed.dataset.edit);if(e.target.closest('[data-cities-edit]'))openCitiesEditor();const add=e.target.closest('[data-add]');if(add)openEntryEditor(add.dataset.add);const ent=e.target.closest('[data-entry]');if(ent)openEntryEditor(null,ent.dataset.entry);const del=e.target.closest('[data-delete-entry]');if(del)deleteEntry(del.dataset.deleteEntry);if(e.target.closest('[data-home-edit]'))openHomeEditor();if(e.target.closest('[data-portal-edit]'))editPortal();if(e.target.closest('[data-sims4-edit]'))editSims4Intro();if(e.target.closest('[data-history-edit]'))editHistory();const edHouse=e.target.closest('[data-edit-house]');if(edHouse)editDynasticHouse(edHouse.dataset.editHouse);if(e.target.closest('[data-mod-add]'))editMod();const me=e.target.closest('[data-mod-edit]');if(me)editMod(me.dataset.modEdit);const md=e.target.closest('[data-mod-delete]');if(md)deleteMod(md.dataset.modDelete);const create=e.target.closest('[data-create]');if(create)openCreateMenu(create.dataset.create);const photo=e.target.closest('[data-photo-add]');if(photo)editPhoto(photo.dataset.photoAdd);const trees=e.target.closest('[data-edit-trees]');if(trees)editFamilyTrees(trees.dataset.editTrees);const blockAdd=e.target.closest('[data-block-add]');if(blockAdd)editBlock(blockAdd.dataset.blockAdd);const blockEdit=e.target.closest('[data-block-edit]');if(blockEdit)editBlock(null,blockEdit.dataset.blockEdit);const blockDel=e.target.closest('[data-block-delete]');if(blockDel)deleteBlock(blockDel.dataset.blockDelete);const blockMove=e.target.closest('[data-block-move]');if(blockMove)moveBlock(blockMove.dataset.blockMove,Number(blockMove.dataset.dir));const newPage=e.target.closest('[data-new-page]');if(newPage)editArticle(newPage.dataset.newPage);const articleEdit=e.target.closest('[data-article-edit]');if(articleEdit)editArticle(null,articleEdit.dataset.articleEdit);const articleDel=e.target.closest('[data-article-delete]');if(articleDel)deleteArticle(articleDel.dataset.articleDelete);const city=e.target.closest('[data-city]');if(city)location.hash='city/'+encodeURIComponent(city.dataset.city);if(e.target.closest('[data-edit-city]'))openCityEditor(decodeURIComponent(active.slice(5))); const subadd=e.target.closest('[data-add-subsection]');if(subadd)openSubsectionEditor(subadd.dataset.addSubsection);const subedit=e.target.closest('[data-edit-subsection]');if(subedit)openSubsectionEditor(null,subedit.dataset.editSubsection);const subdel=e.target.closest('[data-delete-subsection]');if(subdel)deleteSubsection(subdel.dataset.deleteSubsection)});document.querySelector('#search').addEventListener('input',e=>{const q=e.target.value.trim();location.hash=q?'search='+encodeURIComponent(q):'home'});document.querySelector('#theme').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('sims-avvomika-theme',document.body.classList.contains('light')?'light':'dark')};if(localStorage.getItem('sims-avvomika-theme')==='light')document.body.classList.add('light');const dialog=document.querySelector('#editDialog');let editId;function openEditor(id){editId=id||active;const p=page(editId);if(!p){alert('Откройте нужный раздел для редактирования.');return}document.querySelector('#editTitle').value=p.title;document.querySelector('#editBody').value=p.body;dialog.showModal()}document.querySelector('#editor').onclick=()=>openEditor();document.querySelector('#editForm').addEventListener('submit',e=>{if(e.submitter?.value!=='save')return;const p=page(editId);if(!p)return;p.title=document.querySelector('#editTitle').value;p.body=document.querySelector('#editBody').value;localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.();render()});function exportAllData(){
  if (!data || !Array.isArray(data.pages)) { alert('Данные ещё не загружены. Откройте сайт заново.'); return; }
  const fullCopy = JSON.stringify(data, null, 2);
  const blob = new Blob([fullCopy], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'data.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
document.querySelector('#export').onclick=exportAllData;
document.querySelector('#exportAll').onclick=exportAllData;document.querySelector('#import').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d.pages))throw Error('Неверный формат');data=d;data.entries ||= [];data.subsections ||= [];data.cityDetails ||= {};data.blocks ||= [];data.articles ||= [];data.familyTrees ||= {};normalizeData();localStorage.setItem('sims-data',JSON.stringify(data));dialog.close();render();alert('Данные импортированы')}catch(err){alert('Не удалось импортировать файл: '+err.message)}};window.addEventListener('hashchange',()=>render({resetScroll:true}));async function initializeSite(){try { let d=JSON.parse(document.querySelector('#site-data').textContent); if(location.protocol==='http:'||location.protocol==='https:'){const response=await fetch('data.json',{cache:'no-store'});if(!response.ok)throw new Error('Не удалось загрузить файл data.json ('+response.status+')');d=await response.json();}const draft=ownerMode?JSON.parse(localStorage.getItem('sims-data')||'null'):null; data=draft||d;data.entries ||= [];data.subsections ||= [];data.cityDetails ||= {};data.blocks ||= [];data.articles ||= [];data.familyTrees ||= {};data.homeDescription ||= 'Sims Stories — энциклопедия авторской вселенной The Sims 4. Судьбы персонажей, семейные хроники, тайны и события мира, который продолжает меняться.';if(!data.pages.some(p=>p.id==='fairies'))data.pages.push({id:'fairies',title:'Феи',group:'Сверхъестественное',icon:'✿',body:'Официальная информация The Sims 4, модификации, лор Sims Stories и известные представители.'}); if(!data.pages.some(p=>p.id==='all-families')){const old=data;data=d;data.entries=old.entries||[];data.subsections=old.subsections||[];data.cityDetails=old.cityDetails||{};data.blocks=old.blocks||[];data.articles=old.articles||[];data.homeDescription=old.homeDescription||d.homeDescription;for(const np of data.pages){const op=old.pages.find(p=>p.id===np.id);if(op && !['families'].includes(np.id)){np.body=op.body;if(op.title!=='Летопись обновлений')np.title=op.title}}}const fp=data.pages.find(p=>p.id==='families');if(fp){fp.title=d.pages.find(p=>p.id==='families').title;fp.body=d.pages.find(p=>p.id==='families').body;fp.icon='✧'}data.families=data.families.map(f=>f==='Лоран'?'Лаурен':f);normalizeData(); if(ownerMode&&draft){try{localStorage.setItem('sims-data',JSON.stringify(data))}catch(e){console.warn('Черновик слишком большой для сохранения',e)}} const updates=data.pages.find(p=>p.id==='updates');if(updates&&updates.title==='Летопись обновлений')updates.title='Дневник';render(); } catch(err) { app.innerHTML='<p class="empty">Ошибка загрузки данных: '+esc(err.message)+'</p>'; }}
initializeSite();

function openCitiesEditor(){
 const existing=document.querySelector('#citiesDialog');if(existing)existing.remove();
 const modal=document.createElement('dialog');modal.id='citiesDialog';
 modal.innerHTML='<h2>Список городов</h2><p>Каждый город — с новой строки. Можно добавлять, удалять и менять порядок.</p><textarea class="city-editor" aria-label="Города"></textarea><menu><button class="secondary" type="button" id="cancelCities">Отмена</button><button type="button" id="saveCities">Сохранить города</button></menu>';
 document.body.appendChild(modal);modal.querySelector('textarea').value=data.cities.join('\n');
 modal.querySelector('#cancelCities').onclick=()=>modal.close();
 modal.querySelector('#saveCities').onclick=()=>{
 const values=[...new Set(modal.querySelector('textarea').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];
 data.cities=values;localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.();modal.close();render();
 };
 modal.addEventListener('close',()=>modal.remove());modal.showModal();
}


function persist(){localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.();render()}
function entryCard(x){
 const family=['other-families','all-families','families'].includes(x.parent);
 const city=x.parent==='characters'&&x.city?`<p class="residence-label"><span>Место проживания:</span> ${esc(x.city)}</p>`:'';
 const trees=family?familyTreeLinks('entry/'+x.id,x.title,true):'';
 return `<article class="card entry-card"><h3>${esc(x.title)}</h3><p>${linkedText(x.body)}</p>${city}${trees}<div class="entry-controls"><button class="edit-current" data-entry="${esc(x.id)}">✎ Изменить</button><button class="edit-current" data-delete-entry="${esc(x.id)}">Удалить</button></div></article>`;
}
function collection(parent){const entries=(data.entries||[]).filter(x=>x.parent===parent);return entries.length?`<div class="grid entry-grid">${entries.map(entryCard).join('')}</div>`:''}
function modalForm(title,fields,onSave){
 const editorScrollY=window.scrollY,editorRoute=location.hash;
 const modal=document.createElement('dialog');modal.className='custom-dialog';
 const fieldHTML=f=>{
   const name=esc(f.name),label=esc(f.label),required=f.optional?'':' required';
   if(f.multiline)return `<label>${label}<textarea name="${name}" rows="8"${required}></textarea></label>`;
   if(f.options)return `<label>${label}<select name="${name}"${required}>${f.options.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label>`;
   return `<label>${label}<input name="${name}" type="${esc(f.type||'text')}"${required}></label>`;
 };
 modal.innerHTML=`<form><h2>${esc(title)}</h2>${fields.map(fieldHTML).join('')}<menu><button type="button" class="secondary" data-cancel>Отмена</button><button type="submit">Сохранить</button></menu></form>`;
 document.body.appendChild(modal);
 modal.querySelector('[data-cancel]').onclick=()=>modal.close();
 modal.querySelector('form').onsubmit=e=>{
   e.preventDefault();
   const values=Object.fromEntries(fields.map(f=>[f.name,modal.querySelector(`[name="${f.name}"]`).value.trim()]));
   if(!values.title&&fields.some(f=>f.name==='title'))return;
   onSave(values);modal.close();restoreEditorScroll(editorScrollY,editorRoute);
 };
 modal.addEventListener('close',()=>modal.remove());modal.showModal();return modal;
}
function openEntryEditor(parent,id){
 const old=(data.entries||[]).find(x=>x.id===id);
 const actualParent=old?.parent||parent;
 const isFamily=['other-families','all-families','families'].includes(actualParent);
 const isCharacter=actualParent==='characters';
 const oldTrees=(data.familyTrees||{})['entry/'+(old?.id||'')]||{};
 const fields=[{name:'title',label:isCharacter?'Имя персонажа':isFamily?'Название семьи':'Название'},
   {name:'body',label:'Описание / биография',multiline:true,optional:true}];
 if(isCharacter){
   const options=[{value:'',label:'— Город пока не указан —'},...(data.cities||[]).map(c=>({value:c,label:c}))];
   if(old?.city&&!options.some(x=>x.value===old.city))options.push({value:old.city,label:old.city});
   fields.push({name:'city',label:'Город проживания',options,optional:true});
 }
 if(isFamily){
   fields.push({name:'treeTheSimsTree',label:'TheSimsTree — ссылка на древо (необязательно)',type:'url',optional:true});
   fields.push({name:'treeSimsDynastyTree',label:'Sims Dynasty Tree — ссылка на древо (необязательно)',type:'url',optional:true});
 }
 const modal=modalForm(old?'Редактировать запись':isCharacter?'Новый персонаж':isFamily?'Новая семья':'Новая запись',fields,v=>{
   const idToSave=old?.id||'entry-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
   const {treeTheSimsTree,treeSimsDynastyTree,...values}=v;
   if(old)Object.assign(old,values);
   else data.entries.push({...values,parent:actualParent,id:idToSave});
   if(isFamily){
     data.familyTrees||={};
     const previous=data.familyTrees['entry/'+idToSave]||{};
     data.familyTrees['entry/'+idToSave]={
       thesimstree:{url:treeTheSimsTree||'',label:previous.thesimstree?.label||''},
       simsdynastytree:{url:treeSimsDynastyTree||'',label:previous.simsdynastytree?.label||''}
     };
   }
   persist();
 });
 if(old){modal.querySelector('[name=title]').value=old.title;modal.querySelector('[name=body]').value=old.body||'';}
 if(isCharacter)modal.querySelector('[name=city]').value=old?.city||'';
 if(isFamily){
   modal.querySelector('[name=treeTheSimsTree]').value=oldTrees.thesimstree?.url||'';
   modal.querySelector('[name=treeSimsDynastyTree]').value=oldTrees.simsdynastytree?.url||'';
 }
}
function deleteEntry(id){if(!confirm('Удалить запись?'))return;data.entries=data.entries.filter(x=>x.id!==id);if(data.familyTrees)delete data.familyTrees['entry/'+id];persist()}
function openSectionEditor(){modalForm('Новый раздел сверхъестественного',[{name:'title',label:'Название раздела'},{name:'body',label:'Описание',multiline:true}],v=>{const id='occult-'+Date.now();data.pages.push({id,group:'Сверхъестественное',icon:'✧',...v});persist();location.hash=id})}
function openHomeEditor(){const modal=modalForm('Описание главной страницы',[{name:'body',label:'Описание',multiline:true}],v=>{data.homeDescription=v.body;persist()});modal.querySelector('[name=body]').value=data.homeDescription}

// Подразделы для каждого сверхъестественного вида — сохраняются в data.subsections.
function subsectionsHTML(parent){const items=(data.subsections||[]).filter(x=>x.parent===parent);return items.length?`<div class="content-stream">${items.map(x=>`<section class="subsection"><h2>${esc(x.title)}</h2><div class="prose">${linkedText(x.body)}</div><div class="subsection-actions"><button class="edit-current" data-edit-subsection="${esc(x.id)}">✎ Изменить</button><button class="edit-current" data-delete-subsection="${esc(x.id)}">Удалить</button></div></section>`).join('')}</div>`:''}

function openSubsectionEditor(parent,id){const old=(data.subsections||[]).find(x=>x.id===id);const modal=modalForm(old?'Редактировать подраздел':'Новый подраздел',[{name:'title',label:'Название подраздела'},{name:'body',label:'Описание',multiline:true}],v=>{data.subsections||=[];if(old)Object.assign(old,v);else data.subsections.push({...v,parent,id:'sub-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)});persist()});if(old){modal.querySelector('[name=title]').value=old.title;modal.querySelector('[name=body]').value=old.body}}
function deleteSubsection(id){if(!confirm('Удалить подраздел?'))return;data.subsections=(data.subsections||[]).filter(x=>x.id!==id);persist()}


// Страницы городов: описания, фотографии и переходы по хэштегам.
function cityKey(name){return String(name).toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[\s_]+/g,'-')}
function cityFromTag(tag){return (data.cities||[]).find(name=>cityKey(name)===cityKey(tag))||Object.entries(CITY_RENAMES).find(([old])=>cityKey(old)===cityKey(tag))?.[1]}
// Markdown-style named external links plus the existing city hashtags.
// Example: [Древо семьи Гот](https://example.com/tree)
function linkedText(value){
 const source=String(value||'');
 const re=/\[([^\]\n]{1,140})\]\((https?:\/\/[^\s)]+)\)|#([\p{L}\p{N}_-]+)/gu;
 let out='',pos=0,m;
 while((m=re.exec(source))){
  out+=esc(source.slice(pos,m.index));
  if(m[1]){
   let valid=false;try{const u=new URL(m[2]);valid=['https:','http:'].includes(u.protocol)}catch{}
   out+=valid?`<a href="${esc(m[2])}" target="_blank" rel="noopener noreferrer">${esc(m[1])} ↗</a>`:esc(m[0]);
  }else{
   const city=cityFromTag(m[3]);out+=city?`<a class="hashtag" href="#city/${encodeURIComponent(city)}">${esc(m[0])}</a>`:esc(m[0]);
  }
  pos=re.lastIndex;
 }
 return out+esc(source.slice(pos));
}

function cityPage(name){
 name=CITY_RENAMES[name]||name;
 if(!data.cities.includes(name)){app.innerHTML='<section class="page"><h1>Город не найден</h1><a href="#cities">Вернуться к городам</a></section>';return}
 const item=(data.cityDetails||{})[name]||{};
 const photos=(item.photos||[]).map((src,i)=>`<figure><img src="${esc(src)}" alt="${esc(name)} — изображение ${i+1}" loading="lazy"></figure>`).join('');
 app.innerHTML=`<article class="page city-page"><a class="back-link" href="#cities">← Все города</a><span class="kicker">МИР / ГОРОДА</span><div class="page-top"><h1>${esc(name)}</h1><button class="edit-current" data-edit-city="1">✎ Редактировать город</button></div><div class="prose city-description">${item.description?linkedText(item.description):'Описание пока не добавлено. Нажмите «Редактировать город», чтобы рассказать о нём.'}</div><div class="create-row"><button class="create-main" data-create="city/${esc(name)}">＋ Добавить на страницу</button><button class="create-secondary" data-photo-add="city/${esc(name)}">＋ Добавить фото</button><span class="create-hint">Текст, фото или отдельную страницу</span></div>${universalBlocks('city/'+name)}${articleList('city/'+name)}<h2 class="spaced-heading">Фотографии города</h2>${photos?`<div class="city-gallery">${photos}</div>`:'<p class="city-note">Фотографии пока не добавлены.</p>'}<p class="city-note">Ссылка на эту страницу: <code>#${esc(name.replace(/\s+/g,'-'))}</code>. Упоминайте этот хэштег в описаниях — он станет ссылкой на город.</p></article>`;
}
function openCityEditor(name){
 const old=(data.cityDetails||{})[name]||{};const modal=document.createElement('dialog');modal.className='custom-dialog city-modal';
 modal.innerHTML=`<form><h2>Город: ${esc(name)}</h2><label>Описание<textarea name="description" rows="9" placeholder="История, районы, семьи, достопримечательности…"></textarea></label><label>Добавить фотографии (JPG, PNG, WebP)<input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><p class="city-note">Фотографии хранятся в браузере. Для небольшого сайта добавляйте сжатые изображения; крупные файлы могут превысить лимит хранилища.</p><div class="city-photo-manager"></div><menu><button type="button" class="secondary" data-cancel>Отмена</button><button type="submit">Сохранить</button></menu></form>`;
 document.body.appendChild(modal);modal.querySelector('textarea').value=old.description||'';
 let photos=[...(old.photos||[])];const preview=()=>{modal.querySelector('.city-photo-manager').innerHTML=photos.map((src,i)=>`<div class="city-photo-row"><img src="${esc(src)}" alt="Фото ${i+1}"><button type="button" data-remove-photo="${i}">Удалить фото</button></div>`).join('')};preview();
 modal.addEventListener('click',e=>{const b=e.target.closest('[data-remove-photo]');if(b){photos.splice(Number(b.dataset.removePhoto),1);preview()}});
 modal.querySelector('[data-cancel]').onclick=()=>modal.close();
 modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const files=[...modal.querySelector('[name=photos]').files];try{
 for(const f of files){if(!f.type.startsWith('image/'))continue;const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});photos.push(url)}
 const next={...(data.cityDetails||{}),[name]:{description:modal.querySelector('textarea').value,photos}};
 const previous=data.cityDetails;data.cityDetails=next;try{localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.()}catch(err){data.cityDetails=previous;alert('Не удалось сохранить: изображения слишком большие для хранилища браузера. Уменьшите их размер и повторите попытку.');return}
 modal.close();render();}catch(err){alert('Не удалось прочитать фотографии: '+err.message)}};
 modal.addEventListener('close',()=>modal.remove());modal.showModal();
}


// Единый редактор: дополнительные блоки и отдельные статьи для любого раздела.
function safeImageSource(src){const s=String(src||'').trim();return /^(https?:\/\/|\.\.?\/|images\/|data:image\/(?:png|jpeg|webp);base64,)/i.test(s)?s:''}
function universalBlocks(parent){const blocks=(data.blocks||[]).filter(x=>x.parent===parent).sort((a,b)=>a.order-b.order);return blocks.length?`<div class="content-stream">${blocks.map(b=>`<section class="content-block">${b.title?`<h2>${esc(b.title)}</h2>`:''}${b.body?`<div class="prose">${linkedText(b.body)}</div>`:''}${safeImageSource(b.image)?`<figure class="article-image"><img class="content-image" src="${esc(b.image)}" alt="${esc(b.title)}" loading="lazy">${b.imageCaption?`<figcaption>${esc(b.imageCaption)}</figcaption>`:''}</figure>`:''}${b.link&&/^https?:\/\//i.test(b.link)?`<p><a href="${esc(b.link)}" target="_blank" rel="noopener noreferrer">${esc(b.linkLabel||'Перейти по ссылке')} ↗</a></p>`:''}<div class="block-actions"><button class="edit-current" data-block-edit="${esc(b.id)}">✎ Изменить</button><button class="edit-current" data-block-move="${esc(b.id)}" data-dir="-1" aria-label="Выше">↑</button><button class="edit-current" data-block-move="${esc(b.id)}" data-dir="1" aria-label="Ниже">↓</button><button class="edit-current" data-block-delete="${esc(b.id)}">Удалить</button></div></section>`).join('')}</div>`:''}

// Shrink photographs before storing to avoid exhausting browser localStorage.
function photoToDataURL(file){return new Promise((resolve,reject)=>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(Error('Поддерживаются JPG, PNG и WebP.'));
 if(file.size>12*1024*1024)return reject(Error('Выбери фотографию до 12 МБ.'));
 const reader=new FileReader();reader.onerror=()=>reject(Error('Не удалось открыть файл.'));
 reader.onload=()=>{const img=new Image();img.onerror=()=>reject(Error('Не удалось прочитать изображение.'));
 img.onload=()=>{try{const factor=Math.min(1,1400/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*factor));canvas.height=Math.max(1,Math.round(img.height*factor));const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);const result=canvas.toDataURL('image/webp',0.78);if(result.length>3.3*1024*1024)throw Error('Изображение слишком большое. Уменьши его размер.');resolve(result)}catch(err){reject(err)}};img.src=reader.result};reader.readAsDataURL(file)
 })}
// Dedicated image shortcut: goes straight to the file picker in the existing content editor.
function editPhoto(parent){
 editBlock(parent);
 const modal=[...document.querySelectorAll('dialog.block-photo-dialog')].at(-1);
 if(!modal)return;
 const title=modal.querySelector('h2');if(title)title.textContent='Добавить фотографию';
 const file=modal.querySelector('input[name="imageFile"]');if(file)file.focus();
}
// Единая настройка двух внешних древ: династия, дома, все семьи Двадцатки и новые семьи.
function treeTargetTitle(id){
 if(id.startsWith('house/'))return (data.dynasticHouses||[]).find(h=>h.id===id.slice(6))?.title;
 if(id.startsWith('entry/'))return (data.entries||[]).find(e=>e.id===id.slice(6))?.title;
 return page(id)?.title;
}
function familyTreeLinks(id,title,compact=false){
 const trees=data.familyTrees?.[id]||{};
 const sites=[['thesimstree','TheSimsTree'],['simsdynastytree','Sims Dynasty Tree']];
 const links=sites.map(([key,site])=>{
   const item=trees[key]||{},url=String(item.url||'').trim();
   const label=String(item.label||`Древо ${title} · ${site}`);
   if(/^https?:\/\//i.test(url))return `<a class="tree-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span>♢</span>${esc(label)}<span aria-hidden="true">↗</span></a>`;
   if(ownerMode)return `<button type="button" class="tree-link tree-link-empty" data-edit-trees="${esc(id)}"><span>♢</span>＋ Добавить ${esc(site)}</button>`;
   return '';
 }).filter(Boolean).join('');
 if(!links&&!ownerMode)return '';
 return `<section class="family-tree-section ${compact?'family-tree-compact':''}"><div class="section-head"><h2>Генеалогия</h2><button class="edit-current" data-edit-trees="${esc(id)}">✎ Настроить два древа</button></div><div class="family-tree-links">${links}</div></section>`;
}
function editFamilyTrees(id){
 const title=treeTargetTitle(id);if(!title)return;
 const old=data.familyTrees?.[id]||{};
 const dialog=document.createElement('dialog');dialog.className='custom-dialog family-trees-dialog';
 dialog.innerHTML=`<form><h2>Два древа: ${esc(title)}</h2><p class="form-help">Вставь ссылки на свои деревья. Вместо длинных адресов читатели увидят кнопки с выбранными названиями.</p>
 <fieldset><legend>1. TheSimsTree</legend><label>Ссылка на древо<input name="thesimstreeUrl" type="url" placeholder="https://thesimstree.com/…"></label><label>Название кнопки<input name="thesimstreeLabel" placeholder="Семейное древо · TheSimsTree"></label></fieldset>
 <fieldset><legend>2. Sims Dynasty Tree</legend><label>Ссылка на древо<input name="simsdynastytreeUrl" type="url" placeholder="https://simsdynastytree.com/…"></label><label>Название кнопки<input name="simsdynastytreeLabel" placeholder="Семейное древо · Sims Dynasty Tree"></label></fieldset>
 <menu><button type="button" class="secondary" data-cancel>Отмена</button><button type="submit">Сохранить древа</button></menu></form>`;
 document.body.appendChild(dialog);const form=dialog.querySelector('form');
 for(const key of ['thesimstree','simsdynastytree']){
   form.elements[key+'Url'].value=old[key]?.url||'';
   form.elements[key+'Label'].value=old[key]?.label||'';
 }
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-cancel]'))dialog.close()});
 form.addEventListener('submit',e=>{e.preventDefault();const next={};
  for(const [key,site] of [['thesimstree','TheSimsTree'],['simsdynastytree','Sims Dynasty Tree']]){
   const url=form.elements[key+'Url'].value.trim();
   if(url&&!/^https?:\/\//i.test(url)){alert('Ссылка должна начинаться с https://');return}
   next[key]={url,label:form.elements[key+'Label'].value.trim()||`Древо ${title} · ${site}`};
  }
  data.familyTrees||={};data.familyTrees[id]=next;
  try{localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.()}catch(err){alert('Не удалось сохранить: '+err.message);return}
  dialog.close();render();
 });
 dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
}
function editBlock(parent,id){
 const editorScrollY=window.scrollY,editorRoute=location.hash;
 const old=(data.blocks||[]).find(x=>x.id===id);
 if(parent==='all-families' && old?.kind==='dynasty-text')return editDynastyStoryBlock('text',old);
 if(parent==='all-families' && old?.kind==='dynasty-image')return editDynastyStoryBlock('image',old);
 const modal=document.createElement('dialog');modal.className='custom-dialog block-photo-dialog';
 modal.innerHTML=`<form><h2>${old?'Изменить текст и изображения':'Добавить текст и изображение'}</h2>
 <label>Заголовок (необязательно для фотографии)<input name="title" placeholder="Например, семейный портрет"></label>
 <label>Описание / текст<textarea name="body" rows="8" placeholder="Например: История семьи Гот..."></textarea></label>
 <p class="form-help">Чтобы сделать ссылку прямо в тексте, напиши: <code>[Древо семьи Гот](https://адрес-древа)</code></p>
 <label>Фотография с компьютера (JPG, PNG, WebP)<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>
 <label>Или ссылка на изображение (необязательно)<input name="image" type="text" placeholder="https://… или images/goth.jpg"></label>
 <label>Подпись под фотографией (необязательно)<input name="imageCaption" type="text" placeholder="Семья Гот в своём поместье"></label>
 <div class="photo-edit-preview"></div>
 <label>Внешняя ссылка (необязательно)<input name="link" type="url" placeholder="https://thesimstree.com/…"></label>
 <label>Текст ссылки (необязательно)<input name="linkLabel" type="text" placeholder="Семейное древо / Древо семьи Гот"></label>
 <menu><button type="button" class="secondary" data-cancel>Отмена</button><button type="submit">Сохранить</button></menu></form>`;
 document.body.appendChild(modal);const form=modal.querySelector('form');
 for(const k of ['title','body','image','imageCaption','link','linkLabel'])form.elements[k].value=old?.[k]||'';
 const preview=modal.querySelector('.photo-edit-preview');const updatePreview=src=>{preview.innerHTML=safeImageSource(src)?`<div class="photo-preview-inner"><img src="${esc(src)}" alt="Предпросмотр"><button type="button" data-remove-image>Удалить изображение</button></div>`:''};
 updatePreview(old?.image||'');
 form.elements.image.addEventListener('input',()=>updatePreview(form.elements.image.value));
 form.elements.imageFile.addEventListener('change',()=>{if(form.elements.imageFile.files.length)preview.textContent='Фотография будет добавлена при сохранении.'});
 modal.addEventListener('click',e=>{if(e.target.closest('[data-cancel]'))modal.close();if(e.target.closest('[data-remove-image]')){form.elements.image.value='';form.elements.imageFile.value='';updatePreview('')}});
 form.addEventListener('submit',async e=>{
  e.preventDefault();const submit=form.querySelector('[type=submit]');submit.disabled=true;
  try{
   const record={};for(const k of ['title','body','image','imageCaption','link','linkLabel'])record[k]=form.elements[k].value.trim();
   const file=form.elements.imageFile.files[0];if(file)record.image=await photoToDataURL(file);
   if(record.image&&!safeImageSource(record.image))throw Error('Укажи ссылку на изображение, начинающуюся с https://, или выбери файл.');
   if(record.link&&!/^https?:\/\//i.test(record.link))throw Error('Адрес внешней ссылки должен начинаться с https://');
   const prev=old?{...old}:null;data.blocks||=[];
   if(old)Object.assign(old,record);else data.blocks.push({...record,parent,id:'block-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),order:data.blocks.length});
   try{localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.()}catch(err){if(old)Object.assign(old,prev);else data.blocks.pop();throw Error('Недостаточно места в браузере для фотографии. Попробуй изображение меньшего размера или загрузи его в папку сайта.')}
   modal.close();render();restoreEditorScroll(editorScrollY,editorRoute);
  }catch(err){alert('Не удалось сохранить: '+err.message)}finally{submit.disabled=false}
 });
 modal.addEventListener('close',()=>modal.remove());modal.showModal();
}

function deleteBlock(id){if(!confirm('Удалить блок?'))return;data.blocks=data.blocks.filter(x=>x.id!==id);persist()}
function moveBlock(id,dir){const b=data.blocks.find(x=>x.id===id);if(!b)return;const peers=data.blocks.filter(x=>x.parent===b.parent).sort((a,c)=>a.order-c.order),i=peers.indexOf(b),other=peers[i+dir];if(!other)return;const temp=b.order;b.order=other.order;other.order=temp;persist()}
function articleList(parent){const items=(data.articles||[]).filter(x=>x.parent===parent);return items.length?`<section class="article-links"><h2>Подробнее по теме</h2><div class="grid">${items.map(x=>`<button class="card" data-go="article/${esc(x.id)}"><h3>${esc(x.title)}</h3><p>${esc(x.body.slice(0,130))}</p><span class="arrow">Открыть страницу ↗</span></button>`).join('')}</div></section>`:''}

function articlePage(id){const a=(data.articles||[]).find(x=>x.id===id);if(!a){app.innerHTML='<section class="page"><h1>Страница не найдена</h1></section>';return}app.innerHTML=`<article class="page"><a class="back-link" href="#${esc(a.parent)}">← Вернуться</a><div class="page-top"><h1>${esc(a.title)}</h1><div class="block-actions"><button class="edit-current" data-article-edit="${esc(id)}">✎ Изменить страницу</button><button class="edit-current" data-article-delete="${esc(id)}">Удалить</button></div></div><div class="prose">${linkedText(a.body)}</div><div class="create-row"><button class="create-main" data-create="article/${esc(id)}">＋ Добавить на страницу</button><button class="create-secondary" data-photo-add="article/${esc(id)}">＋ Добавить фото</button><span class="create-hint">Текст, фото или вложенная страница</span></div>${universalBlocks('article/'+id)}${articleList('article/'+id)}</article>`}

function editArticle(parent,id){const old=(data.articles||[]).find(x=>x.id===id);const modal=modalForm(old?'Редактировать статью':'Новая страница',[{name:'title',label:'Название страницы'},{name:'body',label:'Текст статьи',multiline:true}],v=>{data.articles||=[];if(old)Object.assign(old,v);else data.articles.push({...v,parent,id:'article-'+Date.now()});persist();if(!old)location.hash='article/'+data.articles[data.articles.length-1].id});if(old){modal.querySelector('[name=title]').value=old.title;modal.querySelector('[name=body]').value=old.body}}
function deleteArticle(id){if(!confirm('Удалить статью и её вложенные материалы?'))return;data.articles=data.articles.filter(x=>x.id!==id);data.blocks=(data.blocks||[]).filter(x=>x.parent!=='article/'+id);location.hash='home';persist()}

function openCreateMenu(parent){
 const modal=document.createElement('dialog');modal.className='custom-dialog create-dialog';
 const choices=[
  ['photo','🖼️','Фотографию с компьютера','Загрузить изображение JPG, PNG или WebP'],
  ['text','📝','Текстовый раздел','Подзаголовок, описание, текст, фото и внешняя ссылка'],
  ['article','📄','Отдельную страницу','Например, биография или подробная история']
 ];
 if(parent==='characters')choices.unshift(['entry','👤','Карточку персонажа','Имя, биография и город проживания']);
 if(parent==='all-families'||parent==='other-families'||parent==='families')choices.unshift(['entry','🏠','Карточку семьи','Название, описание и две ссылки на древа']);
 if(parent==='cities')choices.unshift(['city','🌍','Город','Добавить город в список и открыть его страницу']);
 modal.innerHTML=`<div class="create-dialog-top"><h2>Что добавить?</h2><p>Выбери тип содержимого для этой страницы.</p></div><div class="create-options">${choices.map(([type,icon,title,description])=>`<button type="button" data-create-type="${type}"><span class="choice-icon">${icon}</span><span><strong>${title}</strong><small>${description}</small></span><span class="choice-arrow">↗</span></button>`).join('')}</div><menu><button type="button" class="secondary" data-close-create>Отмена</button></menu>`;
 document.body.appendChild(modal);
 modal.onclick=e=>{if(e.target.closest('[data-close-create]'))modal.close();const b=e.target.closest('[data-create-type]');if(!b)return;const type=b.dataset.createType;modal.close();if(type==='photo')editPhoto(parent);else if(type==='text')editBlock(parent);else if(type==='article')editArticle(parent);else if(type==='entry')openEntryEditor(parent);else if(type==='city')openCitiesEditor()};
 modal.addEventListener('close',()=>modal.remove());modal.showModal();
}

// Short, focused editors for the dynasty's alternating text/screenshot timeline.
// Older universal blocks are still supported and can be reordered together with new ones.

// Save the reader's position when editing: dialogs and image loading can otherwise move the viewport.
function restoreEditorScroll(y,route){
 if(location.hash!==route)return;
 window.scrollTo(0,y);
 requestAnimationFrame(()=>{
  if(location.hash!==route)return;
  window.scrollTo(0,y);
  requestAnimationFrame(()=>{
   if(location.hash===route)window.scrollTo(0,y);
  });
 });
}
function editDynastyStoryBlock(kind,old=null){
 if(!ownerMode)return;
 const editorScrollY=window.scrollY;
 const editorRoute=location.hash;
 const isImage=kind==='image';
 const dialog=document.createElement('dialog');dialog.className='custom-dialog dynasty-story-dialog';
 dialog.innerHTML=`<form>
   <h2>${old?'Редактировать':'Добавить'} ${isImage?'скриншот':'текст'}</h2>
   ${isImage?`<label>Скриншот с компьютера или планшета
       <input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>
       <label>Или ссылка на изображение (необязательно)
       <input name="imageUrl" type="text" placeholder="https://…"></label>
       <label>Подпись под скриншотом (необязательно)
       <input name="imageCaption" type="text" placeholder="Например, знакомство основателей"></label>
       <div class="dynasty-current-image"></div>`
      :`<label>Подзаголовок (необязательно)
       <input name="title" type="text" placeholder="Например, Первые годы"></label>
       <label>Текст истории
       <textarea name="body" rows="10" required placeholder="Напиши продолжение своей истории…"></textarea></label>`}
   <menu><button type="button" class="secondary" data-cancel>Отмена</button>
     <button type="submit">Сохранить</button></menu></form>`;
 document.body.appendChild(dialog);
 const form=dialog.querySelector('form');
 if(old){
   if(isImage){
     form.elements.imageUrl.value=old.image?.startsWith('data:')?'':(old.image||'');
     form.elements.imageCaption.value=old.imageCaption||'';
     if(safeImageSource(old.image))dialog.querySelector('.dynasty-current-image').innerHTML=`<img src="${esc(old.image)}" alt="Текущий скриншот">`;
   }else{form.elements.title.value=old.title||'';form.elements.body.value=old.body||'';}
 }
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 form.addEventListener('submit',async e=>{
   e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;
   try{
     const record=isImage?{
       kind:'dynasty-image',title:'',body:'',image:old?.image||'',imageCaption:form.elements.imageCaption.value.trim(),link:'',linkLabel:''
     }:{
       kind:'dynasty-text',title:form.elements.title.value.trim(),body:form.elements.body.value.trim(),image:'',imageCaption:'',link:'',linkLabel:''
     };
     if(isImage){
       const chosen=form.elements.imageFile.files[0];
       if(chosen)record.image=await photoToDataURL(chosen);
       else if(form.elements.imageUrl.value.trim())record.image=form.elements.imageUrl.value.trim();
       if(!safeImageSource(record.image))throw Error('Выбери скриншот с устройства или вставь ссылку на изображение.');
     }else if(!record.body)throw Error('Напиши текст истории.');
     data.blocks||=[];
     const previous=old?{...old}:null;
     let added=null;
     if(old)Object.assign(old,record);
     else{
       const positions=data.blocks.filter(b=>b.parent==='all-families').map(b=>Number(b.order)||0);
       const order=Math.max(-1,...positions)+1;
       added={...record,parent:'all-families',id:'block-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),order};
       data.blocks.push(added);
     }
     try{localStorage.setItem('sims-data',JSON.stringify(data));window.avvSync?.noteLocalSave?.()}
     catch(err){if(old)Object.assign(old,previous);if(added)data.blocks=data.blocks.filter(b=>b!==added);throw Error('Браузеру не хватает места. Попробуй уменьшить скриншот.')}
     dialog.close();render();
     restoreEditorScroll(editorScrollY,editorRoute);
   }catch(err){alert('Не удалось сохранить: '+err.message)}finally{button.disabled=false;}
 });
 dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
}
document.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-dynasty-insert]');
 if(!trigger||!ownerMode)return;
 editDynastyStoryBlock(trigger.dataset.dynastyInsert);
});

// Safe editor bridge: no tokens or private credentials are added to exported data.
window.avvSyncBridge = {
  getData() { return data; },
  replaceData(next) {
    if (!next || !Array.isArray(next.pages)) throw new Error('Неправильный файл данных');
    const prior = data;
    data = JSON.parse(JSON.stringify(next));
    try {
      data.entries ||= []; data.subsections ||= []; data.cityDetails ||= {}; data.blocks ||= [];
      data.articles ||= []; data.familyTrees ||= {}; normalizeData();
      localStorage.setItem('sims-data', JSON.stringify(data));
      render();
    } catch (e) {data = prior; throw e;}
  }
};
