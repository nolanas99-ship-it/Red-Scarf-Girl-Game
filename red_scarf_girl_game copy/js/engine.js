'use strict';
// Game engine: state, input, movement, rendering, dialogue, menus and saving.
// Story content lives in story.js; room layouts live in rooms.js.
const G = (() => {
  const TS = 16, VW = 320, VH = 240;
  const SAVE_KEY = 'redScarfGirl_v2';
  const $ = id => document.getElementById(id);
  const cv = $('game'), c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;

  let state = null;
  let room = null, roomId = null;
  let npcs = [];
  const player = { x: 0, y: 0, dir: 'down', frame: 0, walkT: 0, moving: false };
  const keys = {};
  let busy = false;            // a script or transition is running
  let mode = 'title';          // title | play | menu
  let waiter = null;           // key handler for dialogue/choices/cards
  let fade = 1, fadeTarget = 1, fadeRes = null;
  let exitCooldown = 0;
  let night = false;
  let lastT = 0;
  let audioCtx = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function newState() {
    return {
      v: 2, ch: 0, step: 0, room: 'home_back', x: 3, y: 7, dir: 'down',
      stats: { standing: 60, family: 45, conscience: 40 },
      flags: {}, words: {}, seen: {}, journal: [], posters: [],
      ended: false, ending: null, sound: true, textSpeed: 1,
    };
  }

  // ---------- Map helpers ----------
  function get(tx, ty) { const row = room.map[ty]; return row ? (row[tx] || 'X') : 'X'; }
  function roomW() { return room.map[0].length * TS; }
  function visibleObjects() { return room.objects.filter(o => !o.show || o.show(state)); }
  function overlap(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }

  function blocked(x, y) {
    const L = x - 5, T = y - 5, W = 10, H = 5;
    const pts = [[L, T], [L + W - .01, T], [L, T + H - .01], [L + W - .01, T + H - .01]];
    for (const [px, py] of pts) {
      if (px < 0 || py < 0 || px >= roomW() || py >= room.map.length * TS) return true;
      if (ART.SOLID.has(get(px / TS | 0, py / TS | 0))) return true;
    }
    for (const o of visibleObjects()) {
      if (o.solid === false || o.wall || o.overhead) continue;
      if (overlap(L, T, W, H, o.x * TS, o.y * TS, o.w * TS, o.h * TS)) return true;
    }
    for (const n of npcs) if (!n.path && overlap(L, T, W, H, n.x - 6, n.y - 5, 12, 6)) return true;
    return false;
  }

  // ---------- Rooms ----------
  function tileToFeet(tx, ty) { return { x: (tx + .5) * TS, y: ty * TS + 12 }; }

  function enterRoom(id, tx, ty, dir) {
    roomId = id; room = ROOMS[id];
    const p = tileToFeet(tx, ty);
    player.x = p.x; player.y = p.y; player.dir = dir || player.dir;
    state.room = id; state.x = tx; state.y = ty; state.dir = player.dir;
    npcs = STORY.cast(state, id).map(([nid, x, y, d]) => makeNPC(nid, x, y, d));
    exitCooldown = .35;
    hud();
    showRoomName();
  }

  // Rebuild who is in the room after the story moves on, keeping people where they stand.
  function refreshCast() {
    if (!room) return;
    npcs = STORY.cast(state, roomId).map(([id, x, y, d]) => npcs.find(n => n.id === id) || makeNPC(id, x, y, d));
  }

  function makeNPC(id, tx, ty, dir) {
    const p = tileToFeet(tx, ty);
    return { id, x: p.x, y: p.y, dir: dir || 'down', home: dir || 'down', frame: 0, walkT: 0, def: NPCS[id], path: null, idleT: Math.random() * 4 };
  }

  function showRoomName() {
    const el = $('roomName');
    el.textContent = room.name;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }

  // BFS over unlocked exits to find which exit leads toward a target room.
  function routeExit(from, to) {
    if (from === to) return null;
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const r = q.shift();
      for (const e of ROOMS[r].exits) {
        if (e.locked && e.locked(state)) continue;
        if (prev[e.to] !== undefined) continue;
        prev[e.to] = { r, e };
        if (e.to === to) {
          let cur = to;
          while (prev[cur].r !== from) cur = prev[cur].r;
          return prev[cur].e;
        }
        q.push(e.to);
      }
    }
    return null;
  }

  // ---------- Story progress ----------
  function curChapter() { return CHAPTERS[state.ch] || null; }
  function curStep() { const ch = curChapter(); return ch && !state.ended ? ch.steps[state.step] || null : null; }

  function hud() {
    const ch = curChapter(), st = curStep();
    $('hudCh').textContent = state.ended ? 'THE END' : `CH.${state.ch + 1} · ${ch.title.toUpperCase()}`;
    if (st) {
      const goal = typeof st.goal === 'function' ? st.goal(state) : st.goal;
      $('hudGoal').textContent = '▸ ' + goal;
      const where = st.room === roomId ? 'here' : ROOMS[st.room].name;
      $('hudWhere').textContent = st.where ? st.where : `Go to: ${where}`;
      $('hudWhere').style.display = st.room === roomId && !st.where ? 'none' : '';
    } else {
      $('hudGoal').textContent = '▸ Explore freely. Press C for the menu.';
      $('hudWhere').style.display = 'none';
    }
  }

  async function runStep(step) {
    busy = true;
    try {
      const r = await step.run();
      hideDlg();
      if (r !== false) await completeStep(step);
    } catch (err) { console.error(err); hideDlg(); }
    busy = false;
    checkAuto();
  }

  async function completeStep(step) {
    const ch = curChapter();
    const goal = typeof step.goal === 'function' ? step.goal(state) : step.goal;
    journal(`${ch.when} · ${goal}`, step.note ? (typeof step.note === 'function' ? step.note(state) : step.note) : 'Done.', 'STORY');
    state.step++;
    refreshCast();
    if (state.step >= ch.steps.length) {
      const sum = typeof ch.summary === 'function' ? ch.summary(state) : ch.summary;
      journal(`Chapter ${state.ch + 1} complete · ${ch.title}`, sum, 'CHAPTER SUMMARY');
      state.ch++;
      if (state.ch >= CHAPTERS.length) { state.ch = CHAPTERS.length - 1; save(true); await showEnding(); return; }
      await startChapter();
    }
    save(true);
    hud();
  }

  async function startChapter(fromSave) {
    const ch = curChapter();
    state.step = fromSave ? state.step : 0;
    await fadeTo(1);
    hideDlg();
    await card(ch);
    const s = ch.start;
    if (s) enterRoom(s.room, s.x, s.y, s.dir); else enterRoom(state.room, state.x, state.y, state.dir);
    night = false;
    await fadeTo(0);
    for (const w of ch.words || []) await learn(w);
    save(true);
  }

  function checkAuto() {
    const st = curStep();
    if (st && st.auto && st.room === roomId && !busy) runStep(st);
  }

  function journal(title, text, tag) {
    state.journal.unshift({ title, text, tag });
    if (state.journal.length > 200) state.journal.pop();
  }

  // ---------- Effects ----------
  const STAT_NAMES = { standing: 'Standing', family: 'Family', conscience: 'Conscience' };
  function fx(e) {
    for (const [k, v] of Object.entries(e)) {
      if (!(k in state.stats) || !v) continue;
      state.stats[k] = clamp(state.stats[k] + v, 0, 100);
      pop(`${STAT_NAMES[k]} ${v > 0 ? '+' : ''}${v}`, k, v > 0);
    }
  }
  function pop(text, kind, good) {
    const el = document.createElement('div');
    el.className = `pop ${kind} ${good ? 'up' : 'down'}`;
    el.textContent = (good ? '▲ ' : '▼ ') + text;
    $('pops').appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  function toast(text) {
    const el = document.createElement('div');
    el.className = 'pop note'; el.textContent = text;
    $('pops').appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  function standingLabel(v) {
    return v >= 75 ? 'Admired' : v >= 50 ? 'Accepted' : v >= 30 ? 'Watched' : v >= 10 ? 'Suspected' : 'Outcast';
  }

  // ---------- Sound ----------
  function blip(freq) {
    if (!state || !state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(.025, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .05);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + .05);
    } catch (e) { /* audio is optional */ }
  }

  // ---------- Dialogue ----------
  // Like classic top-down RPGs, the box moves to the top when Ji-li is low on screen.
  function placeDlg() { $('dlg').classList.toggle('top', player.y > 150); }

  function camX() { return clamp(player.x - VW / 2, 0, Math.max(0, roomW() - VW)); }

  function drawFace(def) {
    const f = $('face'), fc = f.getContext('2d');
    fc.clearRect(0, 0, f.width, f.height);
    if (!def) { f.style.display = 'none'; return; }
    f.style.display = '';
    const spr = ART.sprite(def.key, def.pal, def.opt);
    fc.imageSmoothingEnabled = false;
    fc.drawImage(spr.down[0], 0, 0, 12, 12, 0, 0, 12, 12);
  }

  function hideDlg() { $('dlg').classList.add('hide'); waiter = null; }

  function say(who, text) {
    return new Promise(res => {
      const def = who && NPCS[who];
      const name = def ? def.name : (who || '');
      placeDlg();
      $('dlg').classList.remove('hide', 'word');
      $('dlg').classList.toggle('narr', !name);
      $('dlgName').textContent = name;
      $('dlgChoices').innerHTML = ''; $('dlgHint').textContent = '';
      drawFace(def);
      const el = $('dlgText');
      el.textContent = '';
      $('dlgNext').style.visibility = 'hidden';
      let i = 0, done = false;
      const speed = 26 / (state.textSpeed || 1);
      const voice = def ? def.voice : 420;
      const tick = () => {
        if (done) return;
        i++;
        el.textContent = text.slice(0, i);
        if (i % 2 === 0 && text[i - 1] !== ' ') blip(voice);
        if (i >= text.length) { finish(); return; }
        const ch = text[i - 1];
        setTimeout(tick, /[.!?]/.test(ch) ? speed * 6 : ch === ',' ? speed * 3 : speed);
      };
      const finish = () => { done = true; el.textContent = text; $('dlgNext').style.visibility = 'visible'; };
      setTimeout(tick, speed);
      waiter = act => {
        if (act === 'cancel' && !done) { finish(); return; }
        if (act !== 'confirm') return;
        if (!done) { finish(); return; }
        waiter = null;
        res();
        requestAnimationFrame(() => { if (!waiter) hideDlg(); });
      };
    });
  }

  // options: array of strings or {t, hint}
  function choose(options, prompt, who) {
    return new Promise(res => {
      const def = who && NPCS[who];
      placeDlg();
      $('dlg').classList.remove('hide', 'word', 'narr');
      $('dlgName').textContent = def ? def.name : (prompt ? '' : 'What do you do?');
      drawFace(def || NPCS.jili);
      $('dlgText').textContent = prompt || '';
      $('dlgNext').style.visibility = 'hidden';
      const opts = options.map(o => typeof o === 'string' ? { t: o } : o);
      let sel = 0;
      const box = $('dlgChoices');
      const draw = () => {
        box.innerHTML = '';
        opts.forEach((o, i) => {
          const b = document.createElement('div');
          b.className = 'opt' + (i === sel ? ' sel' : '');
          b.textContent = (i === sel ? '▶ ' : '   ') + o.t;
          b.onpointerenter = () => { sel = i; draw(); };
          b.onclick = () => pick(i);
          box.appendChild(b);
        });
        $('dlgHint').textContent = opts[sel].hint || '';
      };
      const pick = i => { waiter = null; blip(660); res(i); requestAnimationFrame(() => { if (!waiter) hideDlg(); }); };
      draw();
      waiter = act => {
        if (act === 'up') { sel = (sel + opts.length - 1) % opts.length; blip(520); draw(); }
        if (act === 'down') { sel = (sel + 1) % opts.length; blip(520); draw(); }
        if (act === 'confirm') pick(sel);
      };
    });
  }

  function learn(id) {
    if (state.words[id]) return Promise.resolve();
    state.words[id] = true;
    const w = WORDS[id];
    if (!w) return Promise.resolve();
    return new Promise(res => {
      $('dlg').classList.remove('hide', 'narr', 'top');
      $('dlg').classList.add('word');
      $('dlgName').textContent = '★ NEW WORD: ' + w.term;
      drawFace(null);
      $('dlgText').textContent = w.def;
      $('dlgChoices').innerHTML = ''; $('dlgHint').textContent = 'Saved under WORDS in the menu (C).';
      $('dlgNext').style.visibility = 'visible';
      blip(880); setTimeout(() => blip(1175), 90);
      waiter = act => {
        if (act !== 'confirm') return;
        waiter = null; $('dlg').classList.remove('word'); res();
        requestAnimationFrame(() => { if (!waiter) hideDlg(); });
      };
    });
  }

  function card(ch) {
    return new Promise(res => {
      const el = $('card');
      el.innerHTML = '';
      const num = document.createElement('div'); num.className = 'card-num'; num.textContent = `CHAPTER ${state.ch + 1} OF ${CHAPTERS.length}`;
      const h = document.createElement('h2'); h.textContent = ch.title;
      const when = document.createElement('div'); when.className = 'card-when'; when.textContent = ch.when;
      el.append(num, h, when);
      ch.intro.forEach((line, i) => {
        const p = document.createElement('p'); p.textContent = line; p.style.animationDelay = (0.4 + i * 0.5) + 's';
        el.appendChild(p);
      });
      const go = document.createElement('div'); go.className = 'card-go'; go.textContent = 'Press Z / Enter to begin';
      go.style.animationDelay = (0.6 + ch.intro.length * 0.5) + 's';
      el.appendChild(go);
      el.classList.remove('hide');
      const start = performance.now();
      const close = () => { if (performance.now() - start < 500) return; waiter = null; el.classList.add('hide'); el.onclick = null; res(); };
      el.onclick = close;
      waiter = act => { if (act === 'confirm') close(); };
    });
  }

  // ---------- Fades & cutscene helpers ----------
  function fadeTo(v, ms = 280) {
    fadeTarget = v;
    return new Promise(res => { fadeRes = res; fadeSpeed = 1 / (ms / 1000); });
  }
  let fadeSpeed = 4;

  async function teleport(id, tx, ty, dir) {
    await fadeTo(1);
    enterRoom(id, tx, ty, dir);
    await fadeTo(0);
    checkAuto();
  }

  function addNPC(id, tx, ty, dir) { removeNPC(id); const n = makeNPC(id, tx, ty, dir); npcs.push(n); return n; }
  function removeNPC(id) { npcs = npcs.filter(n => n.id !== id); }
  function findNPC(id) { return npcs.find(n => n.id === id); }
  function walkNPC(id, pts, speed = 48) {
    const n = findNPC(id);
    if (!n) return Promise.resolve();
    return new Promise(res => { n.path = pts.map(([tx, ty]) => tileToFeet(tx, ty)); n.speed = speed; n.onDone = res; });
  }
  function faceNPC(id, dir) { const n = findNPC(id); if (n) { n.dir = dir; n.home = dir; } }
  function facePlayer(dir) { player.dir = dir; }
  function setNight(v) { night = v; }

  // ---------- Interaction ----------
  function frontPoint() {
    const { x, y, dir } = player;
    return dir === 'up' ? [x, y - 14] : dir === 'down' ? [x, y + 7] : dir === 'left' ? [x - 11, y - 3] : [x + 11, y - 3];
  }
  function entityAt(px, py) {
    for (const n of npcs) if (px >= n.x - 7 && px <= n.x + 7 && py >= n.y - 16 && py <= n.y + 4) return { kind: 'npc', id: n.id, n };
    for (const o of visibleObjects()) {
      if (!o.look && !o.proxy && !o.id) continue;
      if (px >= o.x * TS && px < (o.x + o.w) * TS && py >= o.y * TS && py < (o.y + o.h) * TS) return { kind: 'obj', id: o.id, o };
    }
    return null;
  }
  function facing() { const [px, py] = frontPoint(); return entityAt(px, py); }

  async function interact() {
    let ent = facing();
    if (!ent) return;
    // proxies let you talk to someone across a desk or counter
    if (ent.kind === 'obj' && ent.o.proxy && findNPC(ent.o.proxy)) ent = { kind: 'npc', id: ent.o.proxy, n: findNPC(ent.o.proxy) };
    const st = curStep();
    if (ent.kind === 'npc') {
      const opp = { up: 'down', down: 'up', left: 'right', right: 'left' }[player.dir];
      ent.n.dir = opp;
    }
    if (st && !st.auto && st.room === roomId && st.target === ent.id) { await runStep(st); return; }
    busy = true;
    try {
      if (ent.kind === 'npc') {
        state.seen['npc:' + ent.id] = 1;
        const lines = STORY.npcLines(ent.id, state);
        await playLines(lines, ent.id);
        ent.n.dir = ent.n.home;
      } else {
        state.seen[roomId + ':' + ent.id] = 1;
        await playLines(STORY.pick(ent.o.look, state), null);
      }
    } catch (err) { console.error(err); }
    hideDlg();
    busy = false;
  }

  async function playLines(lines, speaker) {
    if (typeof lines === 'function') lines = await lines(state);
    if (!lines) return;
    if (!Array.isArray(lines)) lines = [lines];
    for (const l of lines) {
      if (Array.isArray(l)) await say(l[0], l[1]);
      else await say(speaker, l);
    }
  }

  // ---------- Update ----------
  function update(dt) {
    if (fade !== fadeTarget) {
      const d = fadeSpeed * dt;
      fade = fadeTarget > fade ? Math.min(fadeTarget, fade + d) : Math.max(fadeTarget, fade - d);
    }
    if (fade === fadeTarget && fadeRes) { const r = fadeRes; fadeRes = null; r(); }
    for (const n of npcs) {
      if (n.path && n.path.length) {
        const t = n.path[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), stp = n.speed * dt;
        if (Math.abs(dx) > Math.abs(dy)) n.dir = dx > 0 ? 'right' : 'left'; else n.dir = dy > 0 ? 'down' : 'up';
        if (d <= stp) { n.x = t.x; n.y = t.y; n.path.shift(); } else { n.x += dx / d * stp; n.y += dy / d * stp; }
        n.walkT += dt; n.frame = [0, 1, 0, 2][(n.walkT * 8 | 0) % 4];
        if (!n.path.length) { n.path = null; n.frame = 0; n.home = n.dir; if (n.onDone) { const f = n.onDone; n.onDone = null; f(); } }
      } else if (n.def && n.def.fidget && !busy) {
        n.idleT -= dt;
        if (n.idleT < 0) { n.idleT = 2 + Math.random() * 4; n.dir = ['down', 'left', 'right', n.home][Math.random() * 4 | 0]; }
      }
    }
    if (mode !== 'play' || busy || waiter) { player.moving = false; player.frame = 0; return; }
    let dx = 0, dy = 0;
    if (keys.up) dy -= 1; if (keys.down) dy += 1; if (keys.left) dx -= 1; if (keys.right) dx += 1;
    player.moving = !!(dx || dy);
    if (player.moving) {
      if (dx && !dy) player.dir = dx > 0 ? 'right' : 'left';
      else if (dy && !dx) player.dir = dy > 0 ? 'down' : 'up';
      else if (!(player.dir === (dx > 0 ? 'right' : 'left') || player.dir === (dy > 0 ? 'down' : 'up'))) player.dir = dy > 0 ? 'down' : 'up';
      const m = Math.hypot(dx, dy), sp = (keys.run ? 115 : 75) * dt;
      const nx = player.x + dx / m * sp, ny = player.y + dy / m * sp;
      if (dx) { if (!blocked(nx, player.y)) player.x = nx; else if (!dy) slide(0, nx, sp); }
      if (dy) { if (!blocked(player.x, ny)) player.y = ny; else if (!dx) slide(1, ny, sp); }
      player.walkT += dt * (keys.run ? 1.5 : 1);
      player.frame = [0, 1, 0, 2][(player.walkT * 8 | 0) % 4];
    } else { player.frame = 0; player.walkT = 0; }
    state.x = player.x / TS - .5; state.y = (player.y - 12) / TS; state.dir = player.dir;
    exitCooldown -= dt;
    if (exitCooldown <= 0) checkExits();
  }

  // Slips the player around corners so doors and gaps are easy to walk into.
  function slide(vertical, target, sp) {
    for (let o = 1; o <= 7; o++) {
      for (const s of [-1, 1]) {
        const free = vertical ? !blocked(player.x + s * o, target) && !blocked(player.x + s * o, player.y)
                              : !blocked(target, player.y + s * o) && !blocked(player.x, player.y + s * o);
        if (free) { if (vertical) player.x += s * Math.min(sp, o); else player.y += s * Math.min(sp, o); return; }
      }
    }
  }

  function checkExits() {
    const px = player.x, py = player.y - 3;
    for (const e of room.exits) {
      if (px >= e.x * TS && px < (e.x + e.w) * TS && py >= e.y * TS && py < (e.y + e.h) * TS) {
        const lockMsg = e.locked && e.locked(state);
        if (lockMsg) {
          const back = { up: [0, 8], down: [0, -8], left: [8, 0], right: [-8, 0] }[e.dir];
          player.x += back[0]; player.y += back[1];
          busy = true;
          say(null, lockMsg).then(() => { hideDlg(); busy = false; });
          return;
        }
        busy = true;
        (async () => {
          await fadeTo(1, 200);
          enterRoom(e.to, e.tx, e.ty, e.face || e.dir);
          save(true);
          await fadeTo(0, 200);
          busy = false;
          checkAuto();
        })();
        return;
      }
    }
  }

  // ---------- Render ----------
  function npcSprite(n) { return ART.sprite(n.def.key, n.def.pal, n.def.opt); }

  function render(t) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH);
    if (!room || !state) return;
    const cx = Math.round(camX());
    const offX = roomW() < VW ? Math.round((VW - roomW()) / 2) : 0;
    c.translate(-cx + offX, 0);
    const rows = room.map.length, cols = room.map[0].length;
    const tx0 = Math.max(0, cx / TS | 0), tx1 = Math.min(cols, tx0 + VW / TS + 2);
    for (let ty = 0; ty < rows; ty++) for (let tx = tx0; tx < tx1; tx++) ART.tile(c, get(tx, ty), tx, ty, room, get);
    // soft shadow along the base of walls
    for (let ty = 1; ty < rows; ty++) for (let tx = tx0; tx < tx1; tx++) {
      const t0 = get(tx, ty), up = get(tx, ty - 1);
      if (!ART.SOLID.has(t0) && t0 !== 'D' && (up === '#' || up === 'b')) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(tx * TS, ty * TS, TS, 3); }
    }
    const st = Object.assign({}, state, { night });
    const objs = visibleObjects();
    for (const o of objs) if (o.wall) ART.obj(c, o, st);
    const list = [];
    for (const o of objs) if (!o.wall && !o.overhead) list.push({ y: (o.y + o.h) * TS - .5, draw: () => ART.obj(c, o, st) });
    for (const n of npcs) list.push({ y: n.y, draw: () => drawChar(npcSprite(n), n) });
    list.push({ y: player.y + .1, draw: () => drawChar(ART.sprite('jili', NPCS.jili.pal, NPCS.jili.opt), player) });
    list.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    for (const o of objs) if (o.overhead) ART.obj(c, o, st);
    drawMarkers(t);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const ch = curChapter();
    const tint = night ? 'rgba(12,16,40,.55)' : ch && !state.ended ? ch.tint : null;
    if (tint) { c.fillStyle = tint; c.fillRect(0, 0, VW, VH); }
    if (fade > 0) { c.fillStyle = `rgba(0,0,0,${fade})`; c.fillRect(0, 0, VW, VH); }
  }

  function drawChar(spr, e) {
    c.fillStyle = 'rgba(0,0,0,.25)';
    c.beginPath(); c.ellipse(e.x, e.y + 1, 6, 2.5, 0, 0, 7); c.fill();
    c.drawImage(spr[e.dir][e.frame || 0], Math.round(e.x - 6), Math.round(e.y - 17));
  }

  function entityTop(id) {
    const n = findNPC(id);
    if (n) return [n.x, n.y - 24];
    const o = visibleObjects().find(o => o.id === id);
    if (o) return [(o.x + o.w / 2) * TS, o.y * TS - (o.wall ? -2 : 10)];
    return null;
  }

  function drawMarkers(t) {
    const st = curStep();
    if (st && !busy) {
      if (st.room === roomId) {
        if (st.auto) return;
        const p = entityTop(st.target);
        if (p) ART.arrow(c, p[0], p[1], 'down', t);
      } else {
        const e = routeExit(roomId, st.room);
        if (e) {
          const cx = (e.x + e.w / 2) * TS, cy = (e.y + e.h / 2) * TS;
          const off = { up: [0, 14], down: [0, -12], left: [12, 0], right: [-12, 0] }[e.dir];
          ART.arrow(c, cx + off[0], cy + off[1], e.dir, t);
        }
      }
    }
    // sparkle on things not yet examined
    for (const o of visibleObjects()) {
      if (!o.look || state.seen[roomId + ':' + o.id]) continue;
      const ph = (t / 900 + ART.hash(o.x, o.y) * 6) % 6;
      if (ph > 1) continue;
      const a = Math.sin(ph * Math.PI);
      const sx = (o.x + o.w / 2) * TS + 4, sy = o.y * TS + (o.wall ? 6 : -4);
      c.fillStyle = `rgba(255,255,230,${a})`;
      c.fillRect(sx - 1, sy - 3, 2, 6); c.fillRect(sx - 3, sy - 1, 6, 2);
    }
    // what you're facing
    if (mode === 'play' && !busy && !waiter) {
      const f = facing();
      if (f) {
        const id = f.kind === 'obj' && f.o.proxy && findNPC(f.o.proxy) ? f.o.proxy : f.id;
        const p = entityTop(id);
        if (p && !(st && st.room === roomId && st.target === id)) {
          c.fillStyle = '#000'; c.fillRect(p[0] - 4, p[1] - 6, 9, 9);
          c.fillStyle = '#fff'; c.fillRect(p[0] - 3, p[1] - 5, 7, 7);
          c.fillStyle = '#000'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Z', p[0] + .5, p[1] - 1);
        }
      }
    }
  }

  function loop(t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t;
    update(dt);
    render(t);
    requestAnimationFrame(loop);
  }

  // ---------- Input ----------
  const KEYMAP = {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
    z: 'confirm', enter: 'confirm', ' ': 'confirm', e: 'confirm',
    x: 'cancel', shift: 'cancel',
    c: 'menu', tab: 'menu', escape: 'menu', j: 'menu', m: 'menu',
  };
  function keyAction(act, repeat) {
    if (waiter) { if (!(repeat && act === 'confirm')) waiter(act); return; }
    if (mode === 'title') { TITLE.key(act); return; }
    if (mode === 'menu') { MENU.key(act); return; }
    if (mode === 'play' && !busy) {
      if (act === 'confirm' && !repeat) interact();
      if (act === 'menu') MENU.open();
    }
  }
  window.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') return;
    if (tag === 'button' && (e.key === 'Enter' || e.key === ' ')) return;
    const k = e.key.toLowerCase();
    const act = KEYMAP[k];
    if (!act) return;
    e.preventDefault();
    if (['up', 'down', 'left', 'right'].includes(act)) keys[act] = true;
    if (k === 'x' || k === 'shift') keys.run = true;
    keyAction(act, e.repeat);
  });
  window.addEventListener('keyup', e => {
    const act = KEYMAP[e.key.toLowerCase()];
    if (['up', 'down', 'left', 'right'].includes(act)) keys[act] = false;
    if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') keys.run = false;
  });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  // on-screen touch controls
  document.querySelectorAll('#touch [data-k]').forEach(b => {
    const k = b.dataset.k;
    const down = e => {
      e.preventDefault();
      if (['up', 'down', 'left', 'right'].includes(k)) keys[k] = true;
      if (k === 'cancel') keys.run = true;
      keyAction(k, false);
    };
    const up = e => { e.preventDefault(); if (['up', 'down', 'left', 'right'].includes(k)) keys[k] = false; if (k === 'cancel') keys.run = false; };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });
  // clicking the dialogue box advances it
  $('dlg').addEventListener('click', e => { if (e.target.classList.contains('opt')) return; if (waiter) waiter('confirm'); });

  // ---------- Scaling ----------
  function fit() {
    const touch = matchMedia('(pointer: coarse)').matches;
    document.body.classList.toggle('touch', touch);
    const availH = innerHeight - (touch ? 150 : 16), availW = innerWidth - 16;
    let s = Math.min(availW / VW, availH / VH);
    if (s >= 2) s = Math.floor(s);
    s = Math.max(1, s);
    document.documentElement.style.setProperty('--u', s + 'px');
  }
  window.addEventListener('resize', fit);

  // ---------- Saving ----------
  function save(silent) {
    if (!state) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); if (!silent) toast('Game saved.'); }
    catch (e) { if (!silent) toast('Could not save in this browser. Try Export.'); }
  }
  function validSave(s) { return s && s.v === 2 && s.stats && Number.isFinite(s.ch) && Number.isFinite(s.step) && ROOMS[s.room]; }
  function readSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return validSave(s) ? s : null; } catch (e) { return null; } }
  function exportSave() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'red-scarf-girl-save.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Save file downloaded.');
  }
  function importSave(file, after) {
    const r = new FileReader();
    r.onload = () => {
      try { const s = JSON.parse(r.result); if (!validSave(s)) throw 0; loadState(s); save(true); toast('Save imported.'); after && after(); }
      catch (e) { toast('That file is not a Red Scarf Girl save.'); }
    };
    r.readAsText(file);
  }

  function loadState(s) {
    state = Object.assign(newState(), s);
    mode = 'play'; busy = false; night = false;
    $('title').classList.add('hide');
    enterRoom(state.room, state.x, state.y, state.dir);
    fade = 1; fadeTo(0).then(checkAuto);
    hud();
  }

  async function newGame() {
    state = newState();
    mode = 'play';
    $('title').classList.add('hide');
    room = ROOMS[state.room];
    busy = true;
    await startChapter();
    busy = false;
    save(true);
    hud();
  }

  // ---------- Ending ----------
  async function showEnding() {
    state.ended = true;
    hud();
    await fadeTo(1);
    const e = STORY.ending(state);
    state.ending = e.id;
    const el = $('card');
    el.innerHTML = '';
    const num = document.createElement('div'); num.className = 'card-num'; num.textContent = 'ENDING';
    const h = document.createElement('h2'); h.textContent = e.title;
    el.append(num, h);
    for (const line of e.lines) { const p = document.createElement('p'); p.textContent = line; el.appendChild(p); }
    const hr = document.createElement('div'); hr.className = 'card-when'; hr.textContent = 'WHAT REALLY HAPPENED'; el.appendChild(hr);
    for (const line of STORY.history) { const p = document.createElement('p'); p.className = 'hist'; p.textContent = line; el.appendChild(p); }
    const stats = document.createElement('p'); stats.className = 'hist';
    stats.textContent = `Your final numbers — Standing ${state.stats.standing} (${standingLabel(state.stats.standing)}), Family ${state.stats.family}, Conscience ${state.stats.conscience}. Things examined: ${seenCount()} of ${seenTotal()}.`;
    el.appendChild(stats);
    const go = document.createElement('div'); go.className = 'card-go'; go.textContent = 'Press Z / Enter to keep exploring';
    el.appendChild(go);
    el.classList.remove('hide');
    el.scrollTop = 0;
    await new Promise(res => {
      const start = performance.now();
      const close = () => { if (performance.now() - start < 800) return; waiter = null; el.classList.add('hide'); el.onclick = null; res(); };
      el.onclick = close;
      waiter = act => { if (act === 'confirm') close(); };
    });
    enterRoom('home', 10, 11, 'down');
    await fadeTo(0);
    save(true);
  }

  function seenTotal() {
    let n = 0;
    for (const r of Object.values(ROOMS)) n += r.objects.filter(o => o.look).length;
    return n + Object.keys(NPCS).filter(k => k !== 'jili' && !NPCS[k].extra).length;
  }
  function seenCount() { return Object.keys(state.seen).length; }

  function start() {
    fit();
    TITLE.open();
    requestAnimationFrame(loop);
  }

  return {
    TS, start, newGame, loadState, readSave, save, exportSave, importSave,
    say, choose, learn, fx, toast, wait, teleport, addNPC, removeNPC, walkNPC, faceNPC, facePlayer, setNight,
    hideDlg, journal, standingLabel, seenCount, seenTotal, hud,
    get state() { return state; }, get roomId() { return roomId; }, get busy() { return busy; },
    setMode(m) { mode = m; }, get mode() { return mode; },
    setWaiter(w) { waiter = w; }, get waiter() { return waiter; },
    curStep, curChapter,
    placePlayer(tx, ty, dir) { const p = tileToFeet(tx, ty); player.x = p.x; player.y = p.y; if (dir) player.dir = dir; },
  };
})();
