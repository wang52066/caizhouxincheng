/**
 * ai-comic demo front-end
 * - 支持 Demo 模式（前端合成文本 + 占位图）
 * - 支持真实后端模式（当你部署 server 并填写 API URL）
 *
 * 接口约定（后端）:
 * POST /api/generate
 * body: { title, theme, characters, panels }
 * resp: { title, panels: [{idx, scene, dialog: [..], image: "url"}] }
 */

const $ = (id) => document.getElementById(id);
const titleEl = $('title');
const themeEl = $('theme');
const charsEl = $('characters');
const panelsEl = $('panels');
const generateBtn = $('generate');
const generateRealBtn = $('generate-real');
const statusEl = $('status');
const preview = $('preview');
const apiUrlEl = $('apiUrl');
const downloadZipBtn = $('downloadZip');

function setStatus(t){ statusEl.textContent = t || ''; }

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// Demo text generator (simple templating)
function demoGenerateScript({title, theme, characters, panels}){
  const charList = characters.split(',').map(s=>s.trim()).filter(Boolean);
  const panelsArr = [];
  for (let i=1;i<=panels;i++){
    const scene = `场景 ${i}：${pick(['街道','屋内','天台','实验室','丛林','车站','废墟'])} - ${theme}`;
    const lines = [];
    const who = charList.length ? pick(charList) : `角色${randInt(1,3)}`;
    lines.push({who, text: pick([
      '这就是我们的机会！',
      '你确定要这样做吗？',
      '快走，别回头！',
      '我有一个计划，你来帮忙。',
      '系统出现了异常！',
      '看，那边有信号！'
    ])});
    if (charList.length>1 && Math.random()>0.4) {
      const other = pick(charList.filter(c=>c!==who));
      lines.push({who: other, text: pick(['我会掩护你。','别冲动，听我说。','我们分头行动。','等等，那里有陷阱！'])});
    }
    panelsArr.push({
      idx: i,
      scene,
      dialog: lines
    });
  }
  return { title: title || `未命名漫剧`, panels: panelsArr };
}

// generate placeholder image url (picsum)
function demoMakeImageUrl(seed){
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
}

function renderResult(res){
  preview.innerHTML = '';
  if (!res || !res.panels) { setStatus('生成失败：返回数据格式不正确'); return; }
  res.panels.forEach(p=>{
    const node = document.createElement('div');
    node.className = 'panel';
    const img = document.createElement('img');
    img.src = p.image || demoMakeImageUrl(`${res.title}-${p.idx}`);
    img.alt = p.scene;
    const right = document.createElement('div');
    const scene = document.createElement('div');
    scene.className = 'meta';
    scene.textContent = `${p.idx}. ${p.scene}`;
    const dialogWrap = document.createElement('div');
    dialogWrap.className = 'dialog';
    p.dialog.forEach(d=>{
      const el = document.createElement('div');
      el.innerHTML = `<strong>${escapeHTML(d.who)}:</strong> ${escapeHTML(d.text)}`;
      dialogWrap.appendChild(el);
    });
    right.appendChild(scene);
    right.appendChild(dialogWrap);
    node.appendChild(img);
    node.appendChild(right);
    preview.appendChild(node);
  });
}

// escape
function escapeHTML(s){ return (s+'').replace(/[&<>\