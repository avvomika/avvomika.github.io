/* Avvomika — browser-only GitHub publishing. No credentials are committed to the repo. */
(() => {
  'use strict';
  if (document.body.classList.contains('public-view')) return;

  const OWNER = 'avvomika';
  const REPO = 'avvomika.github.io';
  const BRANCH = 'main';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data.json`;
  const DIRTY_KEY = 'avv-sync-dirty-v1';
  const SHA_KEY = 'avv-sync-base-sha-v1';
  const TOKEN_KEY = 'avv-sync-token-session-v1';
  const REMOTE_HEADERS = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  let token = '';
  try {token = sessionStorage.getItem(TOKEN_KEY) || '';} catch (e) {/* private window */}
  let baselineSha = localStorage.getItem(SHA_KEY) || '';
  let dirty = localStorage.getItem(DIRTY_KEY) === '1';
  let fetched = null;
  let busy = false;

  const sidebarBottom = document.querySelector('.sidebar-bottom');
  if (!sidebarBottom) return;
  const open = document.createElement('button');
  open.id = 'avv-sync-entry';
  open.type = 'button';
  open.className = 'ghost';
  open.textContent = '☁ Синхронизация GitHub';
  sidebarBottom.insertBefore(open, sidebarBottom.querySelector('small'));

  const dialog = document.createElement('dialog');
  dialog.id = 'avv-sync-dialog';
  dialog.innerHTML = `
    <div class="avv-head"><h2>Синхронизация Avvomika</h2><button type="button" class="avv-close" aria-label="Закрыть">✕</button></div>
    <p>Продолжай на компьютере и планшете с одной версией энциклопедии. Сначала получи новые данные, редактируй страницы, затем опубликуй всё одной кнопкой.</p>
    <label for="avv-token">Ключ GitHub (только для публикации)</label>
    <input id="avv-token" type="password" spellcheck="false" autocomplete="off" placeholder="github_pat_…" aria-describedby="avv-token-help">
    <p id="avv-token-help">Создай fine-grained token только для репозитория <b>avvomika.github.io</b> с доступом <b>Contents → Read and write</b>. Никому не отправляй токен. Он хранится только на этом устройстве до закрытия вкладки, не включается в JSON и не публикуется на сайте.</p>
    <div class="avv-actions">
      <button type="button" data-sync-action="connect">Подключить ключ</button>
      <button type="button" data-sync-action="forget">Забыть ключ</button>
    </div>
    <div class="avv-actions">
      <button type="button" data-sync-action="load">↓ Получить актуальную версию</button>
      <button type="button" class="avv-primary" data-sync-action="publish">↑ Опубликовать всё</button>
    </div>
    <div class="avv-actions">
      <button type="button" data-sync-action="adopt">Использовать мой локальный черновик</button>
    </div>
    <div class="avv-status" role="status" aria-live="polite" data-kind="warning">Выбери «Получить актуальную версию», прежде чем начинать редактировать с нового устройства.</div>
    <p class="avv-note"><b>Безопасность:</b> сначала сохрани резервную копию кнопкой «Экспортировать всё» в боковом меню. Когда другое устройство опубликует изменения, здесь нужно снова нажать «Получить актуальную версию». Если обе версии изменились, сайт остановит публикацию вместо перезаписи чужих изменений.</p>
    <p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Создать ключ GitHub ↗</a> · <a href="https://github.com/avvomika/avvomika.github.io" target="_blank" rel="noopener noreferrer">Открыть репозиторий ↗</a></p>
  `;
  document.body.appendChild(dialog);
  const tokenInput = dialog.querySelector('#avv-token');
  const status = dialog.querySelector('.avv-status');
  const actionButtons = [...dialog.querySelectorAll('[data-sync-action]')];
  const setStatus = (text, kind='warning') => {
    status.textContent = text;
    status.dataset.kind = kind;
  };
  const setBusy = value => {
    busy = value;
    actionButtons.forEach(b => {b.disabled = value;});
  };
  function getCurrentData() {
    const d = window.avvSyncBridge?.getData();
    if (!d || !Array.isArray(d.pages)) throw Error('Редактор ещё загружается. Попробуй ещё раз.');
    return d;
  }
  function keepToken(value) {
    token = value;
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {/* token remains in memory */}
  }
  function rememberBase(sha) {
    baselineSha = sha;
    localStorage.setItem(SHA_KEY, sha);
  }
  function rememberDirty(value) {
    dirty = value;
    localStorage.setItem(DIRTY_KEY, value ? '1' : '0');
  }
  function noteLocalSave() {
    rememberDirty(true);
    setStatus('Есть неопубликованные изменения на этом устройстве. После редактирования нажми «Опубликовать всё».','warning');
  }
  window.avvSync = {noteLocalSave};

  const objEq = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  async function fetchGitHubData() {
    const headers = {...REMOTE_HEADERS};
    if (token) headers.Authorization = `Bearer ${token}`;
    let response;
    try {
      response = await fetch(`${API}?ref=${BRANCH}`, {method:'GET',headers,cache:'no-store'});
    } catch (e) {throw Error('Нет соединения с GitHub. Проверь интернет и повтори попытку.');}
    if (!response.ok) {
      if ([401,403].includes(response.status) && token) throw Error('GitHub отклонил ключ. Проверь срок его действия и право Contents: Read and write для avvomika.github.io.');
      throw Error(`Не удалось получить data.json из GitHub (${response.status}).`);
    }
    const file = await response.json();
    if (!file.sha) throw Error('GitHub не вернул контрольную сумму data.json.');
    // GitHub Contents API omits base64 above 1 MiB; retrieve the Git blob instead.
    let payload = file;
    if (!payload.content || payload.encoding !== 'base64') {
      const blobUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs/${encodeURIComponent(file.sha)}`;
      const blobResponse = await fetch(blobUrl,{headers,cache:'no-store'});
      if (!blobResponse.ok) throw Error(`Не удалось прочитать большой data.json (${blobResponse.status}).`);
      payload=await blobResponse.json();
    }
    if (!payload.content || payload.encoding!=='base64')throw Error('GitHub не смог прочитать содержимое файла данных.');
    const bytes = Uint8Array.from(atob(payload.content.replace(/\s/g,'')), c=>c.charCodeAt(0));
    const json = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    if (!Array.isArray(json.pages)) throw Error('Файл GitHub имеет неправильный формат.');
    fetched = {sha:file.sha,json};
    return fetched;
  }
  function updateStatusAfterFetch(remote) {
    const local = getCurrentData();
    // A freshly loaded browser can safely start from published data.
    const draftExists = !!localStorage.getItem('sims-data');
    if (baselineSha && !dirty) {
      window.avvSyncBridge.replaceData(remote.json);
      rememberBase(remote.sha);
      rememberDirty(false);
      setStatus('Актуальная версия загружена с GitHub. Можно редактировать и публиковать.','ok');
    } else if (!draftExists || objEq(remote.json,local)) {
      window.avvSyncBridge.replaceData(remote.json);
      rememberBase(remote.sha);
      rememberDirty(false);
      setStatus('Подключено. Содержимое совпадает с опубликованным. Можно работать.','ok');
    } else if (dirty && baselineSha === remote.sha) {
      setStatus('Найден неопубликованный черновик этого устройства. Можно продолжить работу и опубликовать его.','warning');
    } else {
      // This includes old local drafts from earlier versions: do not overwrite them.
      rememberBase('');
      setStatus('В этом браузере есть локальная версия, отличающаяся от GitHub. Ничего не удалено. Сначала сделай «Экспортировать всё», затем выбери «Получить актуальную версию» ИЛИ «Использовать мой локальный черновик».','warning');
    }
  }
  async function connect() {
    const candidate=tokenInput.value.trim() || token;
    if (!candidate) {setStatus('Вставь ключ GitHub. Без ключа можно читать данные, но нельзя публиковать.','warning'); return;}
    keepToken(candidate);
    tokenInput.value='';
    const remote=await fetchGitHubData();
    updateStatusAfterFetch(remote);
  }
  async function load() {
    const remote=await fetchGitHubData();
    const current=getCurrentData();
    const different=!objEq(remote.json,current);
    if (different && localStorage.getItem('sims-data')) {
      const answer=confirm('Загрузить свежую версию с GitHub? Текущий локальный черновик будет заменён. Если здесь есть несохранённые на GitHub изменения, сначала закрой окно и нажми «Экспортировать всё» для резервной копии.');
      if (!answer) {setStatus('Локальный черновик сохранён без изменений.','warning'); return;}
    }
    window.avvSyncBridge.replaceData(remote.json);
    rememberBase(remote.sha);
    rememberDirty(false);
    setStatus('Готово! Последняя версия загружена из репозитория. Продолжай редактирование.','ok');
  }
  async function adopt() {
    const remote=await fetchGitHubData();
    const msg='ВНИМАНИЕ: использовать локальный черновик как будущую версию сайта? Это может заменить опубликованные изменения с другого устройства. Сначала экспортируй резервную копию и убедись, что именно этот черновик нужно публиковать. Продолжить?';
    if (!confirm(msg)) {setStatus('Оставили обе версии без изменений.','warning');return;}
    rememberBase(remote.sha);
    rememberDirty(true);
    setStatus('Локальный черновик выбран для публикации. Проверь содержимое и нажми «Опубликовать всё».','warning');
  }
  function utf8ToBase64(text) {
    const bytes=new TextEncoder().encode(text);
    let binary='';
    for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
    return btoa(binary);
  }
  async function publish() {
    if (!token) {setStatus('Для публикации вставь ключ GitHub и нажми «Подключить ключ».','warning');return;}
    const snapshot=JSON.stringify(getCurrentData(),null,2)+'\n';
    if (new Blob([snapshot]).size > 6*1024*1024) {
      throw Error('Общий JSON стал больше 6 МБ. Для надёжной синхронизации вынеси большие фотографии в файлы сайта. Экспорт JSON остаётся доступен.');
    }
    const remote=await fetchGitHubData();
    if (!baselineSha) {
      setStatus('Сначала получи актуальную версию с GitHub. Если нужно опубликовать прежний локальный черновик, нажми «Использовать мой локальный черновик» после резервного экспорта.','warning');return;
    }
    if (baselineSha!==remote.sha) {
      setStatus('На GitHub уже появилась другая версия данных (возможно, с планшета или компьютера). Публикация остановлена, чтобы ничего не потерялось. Сначала экспортируй локальный черновик и сравни данные; затем загрузи свежую версию.','error');return;
    }
    if (!dirty && objEq(remote.json,getCurrentData())) {
      setStatus('На GitHub уже находится эта версия. Изменений для публикации нет.','ok');return;
    }
    let response;
    try {
      response=await fetch(API, {
        method:'PUT',
        headers:{...REMOTE_HEADERS, 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'},
        body:JSON.stringify({message:'Обновление энциклопедии Avvomika',content:utf8ToBase64(snapshot),sha:remote.sha,branch:BRANCH})
      });
    } catch (e) {throw Error('Сеть прервалась во время публикации. Проверь GitHub перед повтором.');}
    if (!response.ok) {
      if ([409,422].includes(response.status))throw Error('GitHub обнаружил конфликт изменений. Сначала получи свежую версию и проверь локальный черновик.');
      if ([401,403].includes(response.status))throw Error('GitHub не разрешил публикацию: проверь ключ и Contents: Read and write.');
      throw Error(`Не удалось опубликовать (${response.status}). Изменения остались в браузере.`);
    }
    const result=await response.json();
    rememberBase(result.content?.sha||'');
    rememberDirty(false);
    setStatus('Успешно! Все изменения отправлены в GitHub. После обновления GitHub Pages их увидят посетители. На другом устройстве нажми «Получить актуальную версию».','ok');
  }
  open.addEventListener('click',()=>{
    if (typeof dialog.showModal === 'function')dialog.showModal();
    if (token) setStatus('Ключ уже подключён в этой вкладке. Перед новой работой нажми «Получить актуальную версию».','ok');
  });
  dialog.querySelector('.avv-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('click',async e=>{
    const b=e.target.closest('[data-sync-action]');
    if (!b || busy)return;
    const action=b.dataset.syncAction;
    if (action==='forget') {
      keepToken('');tokenInput.value='';
      setStatus('Ключ отключён от этой вкладки. Локальный черновик сохранён.','ok');
      return;
    }
    setBusy(true);
    setStatus('Связываемся с GitHub…');
    try {
      if (action==='connect')await connect();
      if (action==='load')await load();
      if (action==='adopt')await adopt();
      if (action==='publish')await publish();
    }catch(error){setStatus(error.message||'Произошла ошибка. Попробуй ещё раз.','error');}
    finally{setBusy(false);}
  });
})();
