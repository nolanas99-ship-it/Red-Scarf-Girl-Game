'use strict';
// Title screen, pause menu, and the da-zi-bao writing desk.
const $ui = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CONTROLS = [
  ['Arrow keys / WASD', 'Walk'],
  ['Z / Enter / E', 'Talk, examine, confirm'],
  ['Hold X / Shift', 'Run (and skip text)'],
  ['C / Esc / Tab', 'Menu: goal, story so far, words, journal'],
];

const TITLE = (() => {
  const el = $ui('title');
  let sel = 0, opts = [], panel = null;

  function open() {
    G.setMode('title');
    panel = null;
    el.classList.remove('hide');
    build();
  }

  function build() {
    const save = G.readSave();
    opts = [];
    if (save) opts.push({ t: 'Continue', sub: `Chapter ${save.ch + 1} · ${CHAPTERS[save.ch].title}`, fn: () => G.loadState(save) });
    opts.push({ t: 'New Story', sub: 'Shanghai, 1966', fn: () => save ? confirmNew() : G.newGame() });
    opts.push({ t: 'How to Play', sub: 'Controls and background', fn: () => { panel = 'help'; render(); } });
    sel = 0;
    render();
  }

  function confirmNew() { panel = 'confirm'; sel = 1; render(); }

  function render() {
    let inner = '';
    if (panel === 'help') {
      inner = `<div class="t-panel">
        <h3>How to play</h3>
        <table>${CONTROLS.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
        <p>Your current goal is always shown at the top of the screen. A <b class="yel">yellow arrow</b> points to where you need to go next. Things that <b>sparkle</b> haven't been examined yet. Almost everything can be looked at.</p>
        <p>Your choices change three things: <b>Standing</b> (how people treat you in public), <b>Family</b> (how close you are to your family), and <b>Conscience</b> (how true you stay to what you believe). They also change what people remember and how the story ends.</p>
        <p>New words like <i>da-zi-bao</i> and <i>Four Olds</i> are explained when they first appear. You can review them under WORDS in the menu.</p>
        <p class="dim">This game is inspired by <i>Red Scarf Girl: A Memoir of the Cultural Revolution</i> by Ji-li Jiang (1997). It is an original, simplified adaptation: the dialogue is invented and some events are combined.</p>
        <div class="t-opt sel">▶ Back</div></div>`;
    } else if (panel === 'confirm') {
      inner = `<div class="t-panel"><h3>Start a new story?</h3><p>This replaces your saved game.</p>
        ${['Yes, start over', 'No, go back'].map((t, i) => `<div class="t-opt ${i === sel ? 'sel' : ''}" data-i="${i}">${i === sel ? '▶ ' : '&nbsp;&nbsp;'}${t}</div>`).join('')}</div>`;
    } else {
      inner = `<div class="t-menu">${opts.map((o, i) => `<div class="t-opt ${i === sel ? 'sel' : ''}" data-i="${i}">${i === sel ? '▶ ' : '&nbsp;&nbsp;'}${o.t}<small>${o.sub}</small></div>`).join('')}</div>`;
    }
    el.innerHTML = `<div class="t-scarf"></div>
      <h1>RED SCARF GIRL</h1>
      <div class="t-sub">A story of the Cultural Revolution</div>
      ${inner}
      <div class="t-foot">Inspired by the memoir by Ji-li Jiang · Z / Enter to select</div>`;
    el.querySelectorAll('.t-opt').forEach(o => {
      o.onclick = () => { const i = +o.dataset.i; if (!isNaN(i)) sel = i; key('confirm'); };
    });
  }

  function key(act) {
    if (panel === 'help') { if (act === 'confirm' || act === 'cancel' || act === 'menu') { panel = null; build(); } return; }
    const n = panel === 'confirm' ? 2 : opts.length;
    if (act === 'up') sel = (sel + n - 1) % n;
    if (act === 'down') sel = (sel + 1) % n;
    if (act === 'cancel' && panel === 'confirm') { panel = null; build(); return; }
    if (act === 'confirm') {
      if (panel === 'confirm') { if (sel === 0) { panel = null; G.newGame(); } else { panel = null; build(); } return; }
      opts[sel].fn();
      return;
    }
    render();
  }

  return { open, key };
})();

const MENU = (() => {
  const el = $ui('menu');
  const TABS = ['Story', 'Ji-li', 'Words', 'Journal', 'Options'];
  let tab = 0;

  function open() { G.setMode('menu'); el.classList.remove('hide'); render(); }
  function close() { el.classList.add('hide'); G.setMode('play'); }

  function bar(label, v, cls, note) {
    return `<div class="stat"><div class="stat-top"><b>${label}</b><span>${v} / 100</span></div>
      <div class="bar ${cls}"><span style="width:${v}%"></span></div><div class="stat-note">${note}</div></div>`;
  }

  function body() {
    const s = G.state, ch = CHAPTERS[s.ch];
    if (tab === 0) {
      const st = G.curStep();
      const goal = st ? (typeof st.goal === 'function' ? st.goal(s) : st.goal) : 'The story is complete. Explore freely.';
      const where = st ? (st.where || ROOMS[st.room].name) : '';
      let html = `<div class="goalbox"><div class="k">CURRENT GOAL</div><div class="g">▸ ${esc(goal)}</div>${where ? `<div class="w">${esc(where)}</div>` : ''}</div>`;
      html += `<div class="k">STORY SO FAR</div>`;
      for (let i = 0; i < s.ch; i++) {
        const c = CHAPTERS[i];
        html += `<div class="entry"><small>CHAPTER ${i + 1} · ${c.when}</small><h4>${esc(c.title)}</h4><p>${esc(typeof c.summary === 'function' ? c.summary(s) : c.summary)}</p></div>`;
      }
      if (!s.ended) {
        html += `<div class="entry now"><small>CHAPTER ${s.ch + 1} · ${ch.when} · NOW</small><h4>${esc(ch.title)}</h4><p>${esc(ch.intro.join(' '))}</p>
          <p class="dim">Step ${Math.min(s.step + 1, ch.steps.length)} of ${ch.steps.length} in this chapter.</p></div>`;
      }
      return html;
    }
    if (tab === 1) {
      const sv = s.stats;
      let html = `<p class="dim">These numbers are part of the game. They are not a score of who Ji-li really is.</p>`;
      html += bar(`Standing: ${G.standingLabel(sv.standing)}`, sv.standing, 'red', 'How classmates, teachers and neighbors treat you in public. In real life, a family\'s "black" label came from their ancestors, not from anything a child did.');
      html += bar('Family', sv.family, 'blue', 'How close and trusted you are within your family.');
      html += bar('Conscience', sv.conscience, 'gold', 'How true you stay to what you believe is right, even when it costs you.');
      const mem = rememberList(s);
      html += `<div class="k" style="margin-top:1em">CHOICES PEOPLE REMEMBER</div>`;
      html += mem.length ? `<ul class="mem">${mem.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : `<p class="dim">Nothing yet.</p>`;
      html += `<p class="dim">Things examined: ${G.seenCount()} of about ${G.seenTotal()}.</p>`;
      return html;
    }
    if (tab === 2) {
      const ids = Object.keys(WORDS).filter(k => s.words[k]);
      return `<p class="dim">${ids.length} of ${Object.keys(WORDS).length} words learned.</p>` +
        ids.map(k => `<div class="entry"><h4>${esc(WORDS[k].term)}</h4><p>${esc(WORDS[k].def)}</p></div>`).join('');
    }
    if (tab === 3) {
      if (!s.journal.length) return '<p class="dim">Your journal is empty.</p>';
      return s.journal.map(j => `<div class="entry"><small>${esc(j.tag || '')}</small><h4>${esc(j.title)}</h4><p>${esc(j.text)}</p></div>`).join('');
    }
    return `<div class="opts">
      <button data-a="save">Save now</button>
      <button data-a="export">Download save file</button>
      <button data-a="import">Load save file…</button>
      <button data-a="sound">Sound: ${s.sound ? 'ON' : 'OFF'}</button>
      <button data-a="speed">Text speed: ${s.textSpeed > 1 ? 'FAST' : 'NORMAL'}</button>
      <button data-a="title">Back to title screen</button>
      </div>
      <div class="k" style="margin-top:1em">CONTROLS</div>
      <table class="ctl">${CONTROLS.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <p class="dim">The game saves automatically when you change rooms or finish a goal.</p>`;
  }

  function rememberList(s) {
    const f = s.flags, out = [];
    const add = (k, t) => { if (f[k]) out.push(t); };
    add('passedAudition', 'You passed the audition for the Liberation Army Arts Academy.');
    add('cheeredSign', 'You cheered when the old shop sign was smashed.');
    add('pitiedShopkeeper', 'You felt sorry for the old shopkeeper, and the Red Guards noticed.');
    add('savedBook', 'You saved one of Grandpa Hong\'s storybooks.');
    add('criticizedTeacher', 'You posted a da-zi-bao criticizing a teacher.');
    add('refusedPoster', 'You refused to write a da-zi-bao.');
    add('supportedAnYi', 'You held An Yi\'s hand in front of everyone.');
    add('exposed', 'Du Hai told the class about your grandfather.');
    add('gaveRibbon', 'You gave Song Po-po your hair ribbon.');
    add('promisedAnYi', 'You promised to always be An Yi\'s friend.');
    add('keptPhoto', 'You secretly kept one family photo.');
    add('raided', 'Red Guards searched your home.');
    add('inExhibition', 'You were chosen for the Class Education Exhibition.');
    add('dadTaken', 'Dad was detained by his theater.');
    add('toreposter', 'You tore down a poster about your father.');
    add('refused', 'You refused to testify against Dad.');
    add('testified', 'You agreed to testify against Dad.');
    add('letterFound', 'Thin-Face found Mom\'s letter.');
    add('sweptWithGrandma', 'You swept the lane beside Grandma.');
    return out;
  }

  function render() {
    el.innerHTML = `<div class="m-tabs">${TABS.map((t, i) => `<div class="m-tab ${i === tab ? 'sel' : ''}" data-i="${i}">${t}</div>`).join('')}<div class="m-x" title="Close">✕</div></div>
      <div class="m-body">${body()}</div>
      <div class="m-foot">◀ ▶ switch tabs · ▲ ▼ scroll · C / X close</div>`;
    el.querySelectorAll('.m-tab').forEach(t => t.onclick = () => { tab = +t.dataset.i; render(); });
    el.querySelector('.m-x').onclick = close;
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => action(b.dataset.a));
  }

  function action(a) {
    const s = G.state;
    if (a === 'save') G.save();
    if (a === 'export') G.exportSave();
    if (a === 'import') { const f = $ui('fileInput'); f.onchange = () => { if (f.files[0]) G.importSave(f.files[0], close); f.value = ''; }; f.click(); }
    if (a === 'sound') s.sound = !s.sound;
    if (a === 'speed') s.textSpeed = s.textSpeed > 1 ? 1 : 2.2;
    if (a === 'title') { G.save(true); close(); TITLE.open(); return; }
    G.save(true);
    render();
  }

  function key(act) {
    if (act === 'menu' || act === 'cancel') { close(); return; }
    if (act === 'left') { tab = (tab + TABS.length - 1) % TABS.length; render(); }
    if (act === 'right') { tab = (tab + 1) % TABS.length; render(); }
    const b = el.querySelector('.m-body');
    if (act === 'up') b.scrollTop -= 40;
    if (act === 'down') b.scrollTop += 40;
  }

  return { open, close, key };
})();

const UI = {
  // Opens the poster-writing desk. Resolves with {title, text, published}.
  writer(prompt) {
    return new Promise(res => {
      const el = $ui('writer');
      el.innerHTML = `<div class="w-box">
        <div class="k">DA-ZI-BAO · BIG-CHARACTER POSTER</div>
        <p class="w-prompt">${esc(prompt)}</p>
        <input id="wTitle" maxlength="60" placeholder="Headline (optional)">
        <textarea id="wText" maxlength="1200" placeholder="Write your poster here, in your own words..."></textarea>
        <div class="w-row"><span id="wCount">0 words</span><label><input type="checkbox" id="wPub" checked> Paste it on the school wall for everyone to read</label></div>
        <p class="dim">The game doesn't grade your opinions. It only remembers whether you posted it.</p>
        <button id="wDone">Finish poster</button></div>`;
      el.classList.remove('hide');
      const ta = $ui('wText');
      setTimeout(() => ta.focus(), 50);
      ta.oninput = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; $ui('wCount').textContent = `${n} word${n === 1 ? '' : 's'}`; };
      $ui('wDone').onclick = () => {
        const text = ta.value.trim();
        if (text.length < 3) { G.toast('Write at least a few words first.'); ta.focus(); return; }
        const r = { title: $ui('wTitle').value.trim() || 'Untitled poster', text, published: $ui('wPub').checked };
        el.classList.add('hide');
        res(r);
      };
    });
  },
};

window.addEventListener('load', () => G.start());
