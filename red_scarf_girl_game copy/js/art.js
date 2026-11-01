'use strict';
// Procedural pixel art: tiles, character sprites, and scene objects.
// Everything is drawn at 16px-per-tile on a 320x240 canvas and scaled up.
const ART = (() => {
  const TS = 16;

  function hash(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x | 0, y | 0, w, h); }
  function outline(c, x, y, w, h, col) { R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }
  // shift a #rrggbb colour lighter (+) or darker (-)
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1, 7), 16);
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
  }

  // ---------- Tiles ----------
  // Solid for walking. Bullets are blocked by BLOCK (water and low sandbags let shots pass over).
  const SOLID = new Set(['X', '#', 'b', 'R', 'w', 'h', '=', 'S']);
  const BLOCK = new Set(['X', '#', 'b', 'R', 'h']);
  const ANIMATED = new Set(['w']);

  function floor(c, x, y, tx, ty, kind) {
    switch (kind) {
      case 'wood': {
        for (let r = 0; r < 4; r++) {
          const v = (hash(tx * 7 + r, ty) - .5) * 16;
          R(c, x, y + r * 4, TS, 4, shade('#94653f', v));
          R(c, x, y + r * 4, TS, 1, shade('#a5744c', v));
          R(c, x, y + r * 4 + 3, TS, 1, '#6e432a');
          const seam = (hash(tx, ty * 4 + r) * 16) | 0;
          R(c, x + seam, y + r * 4, 1, 3, '#6e432a');
          if (hash(tx, ty, r) > .7) R(c, x + ((hash(ty, tx, r) * 12) | 0) + 1, y + r * 4 + 1, 3, 1, shade('#7d5034', v));
          if (hash(tx, ty, r + 9) > .93) R(c, x + ((hash(ty, tx, r + 2) * 12) | 0) + 2, y + r * 4 + 1, 2, 2, '#5e3a24');
        }
        break;
      }
      case 'tile': {
        const a = (tx + ty) % 2 ? '#bcb4a2' : '#b0a894';
        R(c, x, y, TS, TS, a);
        R(c, x + 1, y + 1, TS - 2, 1, shade(a, 14));
        R(c, x, y, TS, 1, '#958d7b'); R(c, x, y, 1, TS, '#958d7b');
        if (hash(tx, ty) > .75) R(c, x + 4 + ((hash(ty, tx) * 6) | 0), y + 9, 3, 1, shade(a, -10));
        break;
      }
      case 'concrete': {
        R(c, x, y, TS, TS, '#a7a399');
        for (let i = 0; i < 7; i++) R(c, x + ((hash(tx, ty, i) * 15) | 0), y + ((hash(ty, tx, i) * 15) | 0), 1, 1, i % 3 ? '#958f84' : '#b6b2a8');
        if (tx % 3 === 0) R(c, x, y, 1, TS, '#938e82');
        if (hash(tx, ty, 4) > .85) { R(c, x + 4, y + 6, 5, 1, '#8a857a'); R(c, x + 8, y + 7, 3, 1, '#8a857a'); }
        break;
      }
      case 'paving': {
        R(c, x, y, TS, TS, '#66625d');
        for (let r = 0; r < 2; r++) for (let k = -1; k < 2; k++) {
          const ox = (r + ty) % 2 * 4 + k * 8;
          const base = shade('#938e86', (hash(tx * 3 + k, ty * 2 + r) - .5) * 20);
          const sx = Math.max(0, ox + 1), ex = Math.min(16, ox + 8);
          if (ex <= sx) continue;
          R(c, x + sx, y + r * 8 + 1, ex - sx, 6, base);
          R(c, x + sx, y + r * 8 + 1, ex - sx, 1, shade(base, 16));
          R(c, x + sx, y + r * 8 + 6, ex - sx, 1, shade(base, -14));
        }
        if (hash(tx, ty, 7) > .9) { R(c, x + 3, y + 13, 2, 2, '#5f7a4a'); R(c, x + 4, y + 12, 1, 1, '#76955c'); }
        break;
      }
      case 'road': {
        R(c, x, y, TS, TS, '#58554f');
        for (let i = 0; i < 6; i++) R(c, x + ((hash(tx, ty, i) * 15) | 0), y + ((hash(ty, tx, i + 9) * 15) | 0), 1, 1, i % 2 ? '#4a4843' : '#64615a');
        if (hash(tx, ty, 2) > .9) { R(c, x + 5, y + 4, 4, 1, '#45433e'); R(c, x + 8, y + 5, 3, 1, '#45433e'); }
        if (ty === 8 && tx % 2 === 0) R(c, x + 2, y - 1, 10, 2, '#cfc9ac');
        break;
      }
      case 'dirt': {
        R(c, x, y, TS, TS, '#b39868');
        for (let i = 0; i < 9; i++) R(c, x + ((hash(tx, ty, i) * 15) | 0), y + ((hash(ty, tx, i + 3) * 15) | 0), 1, 1, i % 3 === 0 ? '#9c8156' : i % 3 === 1 ? '#c6ad80' : '#a88d60');
        if (hash(tx, ty, 6) > .8) { R(c, x + 9, y + 3, 2, 2, '#8f8a80'); R(c, x + 9, y + 3, 1, 1, '#b5b0a5'); }
        break;
      }
      case 'grass': {
        R(c, x, y, TS, TS, '#5c8946');
        R(c, x + ((hash(tx, ty, 11) * 8) | 0), y + ((hash(ty, tx, 11) * 8) | 0), 7, 5, '#62904b');
        for (let i = 0; i < 9; i++) {
          const gx = x + ((hash(tx, ty, i) * 15) | 0), gy = y + ((hash(ty, tx, i + 5) * 14) | 0);
          R(c, gx, gy, 1, 2, i % 3 ? '#4a7438' : '#7cab5e');
        }
        if (hash(tx, ty, 13) > .88) { const fx = x + 4 + ((hash(ty, tx, 2) * 8) | 0); R(c, fx, y + 7, 2, 2, hash(tx, ty, 3) > .5 ? '#f0e6a0' : '#e8a0b8'); }
        break;
      }
      case 'field': {
        R(c, x, y, TS, TS, '#7d5b3c');
        for (let r = 0; r < 4; r++) { R(c, x, y + r * 4 + 2, TS, 1, '#694a2f'); R(c, x, y + r * 4 + 1, TS, 1, '#8a6846'); }
        break;
      }
      case 'marble': {
        const a = (tx + ty) % 2 ? '#d8d2c4' : '#cec7b6';
        R(c, x, y, TS, TS, a);
        R(c, x, y, TS, 1, '#b2aa98'); R(c, x, y, 1, TS, '#b2aa98');
        R(c, x + 1, y + 1, TS - 2, 1, '#e6e1d6');
        if (hash(tx, ty, 3) > .6) R(c, x + 3 + ((hash(tx, ty) * 8) | 0), y + 4 + ((hash(ty, tx) * 8) | 0), 4, 1, '#bdb6a6');
        break;
      }
    }
  }

  const WALLS = {
    paper:   { base: '#d6c7a2', motif: '#c8b68e', crown: '#7c5636', board: '#5e3d26', lower: '#8b6a4a' },
    plaster: { base: '#e3dccb', motif: '#d6cfbd', crown: '#8f8a7c', board: '#5f7766', lower: '#86a690' },
    hall:    { base: '#d9d2c0', motif: '#cdc6b2', crown: '#7a3a30', board: '#5c2a22', lower: '#9a4a3c' },
    office:  { base: '#c9c3b0', motif: '#bdb6a2', crown: '#5d5a52', board: '#3f3d38' },
    poor:    { base: '#b9ad94', motif: '#a99c82', crown: '#5e4e3a', board: '#4a3c2c' },
    palace:  { base: '#a8322a', motif: '#962a23', crown: '#d9a640', board: '#5a1a14', lower: '#7a2219' },
  };

  function wall(c, x, y, tx, ty, room, get) {
    const s = WALLS[room.wall] || WALLS.paper;
    R(c, x, y, TS, TS, s.base);
    // small diamond wallpaper motif
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const mx = x + 4 + i * 8, my = y + 4 + j * 8;
      R(c, mx, my - 1, 1, 1, s.motif); R(c, mx - 1, my, 3, 1, s.motif); R(c, mx, my + 1, 1, 1, s.motif);
    }
    const below = get(tx, ty + 1);
    if (below !== '#' && below !== 'D' && below !== 'X') {
      if (s.lower) { R(c, x, y + 7, TS, 9, s.lower); R(c, x, y + 7, TS, 1, shade(s.lower, 25)); R(c, x + (tx % 2 ? 1 : 9), y + 9, 6, 4, shade(s.lower, -12)); }
      R(c, x, y + 13, TS, 3, s.board); R(c, x, y + 13, TS, 1, shade(s.board, 25));
    }
    if (get(tx, ty - 1) === 'X') { R(c, x, y, TS, 3, s.crown); R(c, x, y + 2, TS, 1, shade(s.crown, -25)); R(c, x, y + 3, TS, 1, '#00000030'); }
  }

  function brick(c, x, y, tx, ty, get) {
    R(c, x, y, TS, TS, '#5e372c');
    for (let r = 0; r < 4; r++) {
      const off = (r + ty) % 2 ? 0 : 4;
      for (let k = -1; k < 2; k++) {
        const bx = off + k * 8;
        const sx = Math.max(0, bx), ex = Math.min(16, bx + 7);
        if (ex <= sx) continue;
        const col = shade('#80503f', (hash(tx * 3 + k, ty * 4 + r) - .5) * 26);
        R(c, x + sx, y + r * 4, ex - sx, 3, col);
        R(c, x + sx, y + r * 4, ex - sx, 1, shade(col, 14));
      }
    }
    if (hash(tx, ty, 5) > .9) R(c, x + 2, y + 5, 3, 2, '#9a6a56');
    const below = get(tx, ty + 1);
    if (below && !SOLID.has(below) && below !== 'D') { R(c, x, y + 13, TS, 3, '#3e251e'); R(c, x, y + 13, TS, 1, '#6a4436'); }
    if (get(tx, ty - 1) === 'R') { R(c, x, y, TS, 2, '#2a2628'); R(c, x, y + 2, TS, 1, '#00000040'); }
  }

  function roof(c, x, y, tx, ty, get) {
    // rows of curved clay tiles, like Shanghai shikumen roofs
    R(c, x, y, TS, TS, '#3d3c44');
    for (let k = 0; k < 4; k++) {
      const cx = x + k * 4;
      R(c, cx, y, 3, TS, '#54525c');
      R(c, cx, y, 1, TS, '#68666f');
      R(c, cx + 2, y, 1, TS, '#46454e');
    }
    for (let r = 0; r < 4; r++) R(c, x, y + r * 4 + 3, TS, 1, '#2f2e35');
    if (get && get(tx, ty + 1) !== 'R') R(c, x, y + 13, TS, 3, '#25242a');
  }

  function tile(c, t, tx, ty, room, get) {
    const x = tx * TS, y = ty * TS;
    switch (t) {
      case 'X': R(c, x, y, TS, TS, '#000'); break;
      case '#': wall(c, x, y, tx, ty, room, get); break;
      case 'b': brick(c, x, y, tx, ty, get); break;
      case 'R': roof(c, x, y, tx, ty, get); break;
      case 'D': {
        const up = get(tx, ty - 1);
        if (up === 'b' || up === 'R') brick(c, x, y, tx, ty, get); else if (up === '#') wall(c, x, y, tx, ty, room, get); else floor(c, x, y, tx, ty, room.floor);
        const top = y - 10;
        R(c, x + 1, top, 14, 26, '#2e1e12');
        R(c, x + 2, top + 1, 12, 25, '#6b4429');
        R(c, x + 2, top + 1, 12, 1, '#8a5a36');
        R(c, x + 3, top + 3, 10, 9, '#7d5233'); R(c, x + 3, top + 14, 10, 10, '#7d5233');
        R(c, x + 3, top + 3, 10, 1, '#94643f'); R(c, x + 3, top + 14, 10, 1, '#94643f');
        R(c, x + 11, top + 13, 2, 2, '#e3c060');
        break;
      }
      case '.': floor(c, x, y, tx, ty, room.floor); break;
      case ',': {
        R(c, x, y, TS, TS, '#8d3a33');
        if ((tx + ty) % 2) { R(c, x + 6, y + 5, 4, 6, '#a5483f'); R(c, x + 5, y + 7, 6, 2, '#a5483f'); }
        else R(c, x + 7, y + 7, 2, 2, '#c08a50');
        const L = get(tx - 1, ty) !== ',', Rt = get(tx + 1, ty) !== ',', U = get(tx, ty - 1) !== ',', Dn = get(tx, ty + 1) !== ',';
        if (L) { R(c, x, y, 1, TS, '#6a2a24'); R(c, x + 1, y, 1, TS, '#d1a34f'); }
        if (Rt) { R(c, x + 15, y, 1, TS, '#6a2a24'); R(c, x + 14, y, 1, TS, '#d1a34f'); }
        if (U) { R(c, x, y, TS, 1, '#6a2a24'); R(c, x, y + 1, TS, 1, '#d1a34f'); }
        if (Dn) { R(c, x, y + 15, TS, 1, '#6a2a24'); R(c, x, y + 14, TS, 1, '#d1a34f'); }
        break;
      }
      case 'p': floor(c, x, y, tx, ty, 'paving'); break;
      case 'r': floor(c, x, y, tx, ty, 'road'); break;
      case 'd': floor(c, x, y, tx, ty, 'dirt'); break;
      case 'g': floor(c, x, y, tx, ty, 'grass'); break;
      case 'f': floor(c, x, y, tx, ty, 'field'); break;
      case 'm': floor(c, x, y, tx, ty, 'marble'); break;
      case 'k': {
        floor(c, x, y, tx, ty, 'dirt');
        for (let i = 0; i < 4; i++) R(c, x + i * 4 + 1, y + 2, 3, 12, '#6a4a30');
        R(c, x, y + 4, TS, 2, '#8a8a90'); R(c, x, y + 10, TS, 2, '#8a8a90');
        R(c, x, y + 4, TS, 1, '#b0b0b6'); R(c, x, y + 10, TS, 1, '#b0b0b6');
        break;
      }
      case 'w': {
        R(c, x, y, TS, TS, '#4f7c88');
        const t2 = (Date.now() / 600 + tx * .7 + ty) % 4 | 0;
        R(c, x + 2 + t2, y + 4, 4, 1, '#7fa8b2'); R(c, x + 9 - t2, y + 11, 4, 1, '#7fa8b2');
        if (get(tx, ty - 1) !== 'w') { R(c, x, y, TS, 2, '#3d6672'); R(c, x, y + 2, TS, 1, '#9cc4cc'); }
        break;
      }
      case 'h': {
        floor(c, x, y, tx, ty, 'grass');
        R(c, x, y + 3, TS, 12, '#365e2e');
        for (let i = 0; i < 4; i++) { R(c, x + i * 4, y + 1 + (i % 2) * 2, 5, 6, '#467838'); R(c, x + i * 4 + 1, y + 1 + (i % 2) * 2, 2, 2, '#5f9448'); }
        R(c, x, y + 13, TS, 2, '#24401f');
        break;
      }
      case '=': {
        floor(c, x, y, tx, ty, room.floor === 'dirt' ? 'dirt' : 'grass');
        R(c, x, y + 5, TS, 2, '#6b5a43'); R(c, x, y + 10, TS, 2, '#6b5a43'); R(c, x, y + 5, TS, 1, '#8c7859');
        R(c, x + 2, y + 2, 2, 12, '#7e6a4f'); R(c, x + 10, y + 2, 2, 12, '#7e6a4f');
        R(c, x + 2, y + 2, 1, 12, '#9a8462'); R(c, x + 10, y + 2, 1, 12, '#9a8462');
        break;
      }
      case 'S': {
        floor(c, x, y, tx, ty, room.floor || 'dirt');
        for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
          const bx = x + k * 8 + (r ? 4 : 0) - (r && k ? 8 : 0), by = y + 4 + r * 5;
          R(c, bx, by, 8, 5, '#8a7a52'); R(c, bx, by, 8, 1, '#a8976a'); R(c, bx, by + 4, 8, 1, '#5e5236');
        }
        R(c, x, y + 14, TS, 2, '#00000030');
        break;
      }
    }
  }

  // ---------- Character sprites ----------
  const UPPER = {
    down: [
      '...KKKKKK...', '..KHHHHHHK..', '.KHHHHHHHHK.', '.KHSSSSSSHK.', '.KSSESSESSK.', '.KSSSSSSSSK.',
      '..KSSSSSSK..', '.KCCRRRRCCK.', 'KSCCCRRCCCSK', 'KSCCCCCCCCSK', '.KDDDDDDDDK.'],
    up: [
      '...KKKKKK...', '..KHHHHHHK..', '.KHHHHHHHHK.', '.KHHHHHHHHK.', '.KHHHHHHHHK.', '.KHHHHHHHHK.',
      '..KHHHHHHK..', '.KCCCCCCCCK.', 'KSCCCCCCCCSK', 'KSCCCCCCCCSK', '.KDDDDDDDDK.'],
    right: [
      '...KKKKKK...', '..KHHHHHHK..', '.KHHHHHHHHK.', '.KHHHHSSSSK.', '.KHHHSSSESK.', '.KHHSSSSSSK.',
      '..KKSSSSSK..', '..KCCRRRCK..', '..KCSCCCCK..', '..KCSCCCCK..', '..KDDDDDDK..'],
  };
  const LEGS = {
    front: [
      ['..KPPPPPPK..', '..KPPKKPPK..', '..KPPKKPPK..', '..KBBKKBBK..', '...KK..KK...'],
      ['..KPPPPPPK..', '..KPPKKPPK..', '..KBBKKPPK..', '...KK.KPPK..', '......KBBK..'],
    ],
    side: [
      ['...KPPPPK...', '...KPPPPK...', '...KPPPPK...', '...KBBBBK...', '....KKKK....'],
      ['..KPPPPPK...', '..KPPKKPPK..', '.KPPK..KPPK.', '.KBBK..KBBK.', '..KK....KK..'],
    ],
  };
  const OUT = '#1d1719';

  // Adds a soft top light and darker right/bottom edges so flat colours read as rounded.
  function shadeSprite(c) {
    const img = c.getImageData(0, 0, 12, 18), d = img.data;
    const at = (x, y) => (y * 12 + x) * 4;
    const isOut = i => d[i + 3] && d[i] === 0x1d && d[i + 1] === 0x17 && d[i + 2] === 0x19;
    const src = new Uint8ClampedArray(d);
    for (let y = 1; y < 17; y++) for (let x = 1; x < 11; x++) {
      const i = at(x, y);
      if (!src[i + 3] || isOut(i)) continue;
      const up = at(x, y - 1), rt = at(x + 1, y), dn = at(x, y + 1);
      const upOut = !src[up + 3] || (src[up] === 0x1d && src[up + 1] === 0x17);
      const rtOut = !src[rt + 3] || (src[rt] === 0x1d && src[rt + 1] === 0x17);
      const dnOut = !src[dn + 3] || (src[dn] === 0x1d && src[dn + 1] === 0x17);
      let a = 0;
      if (upOut) a = 22; else if (rtOut || dnOut) a = -20;
      if (a) for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, src[i + k] + a));
    }
    c.putImageData(img, 0, 0);
  }

  function buildFrame(dir, legIdx, pal, opt) {
    const cv = document.createElement('canvas'); cv.width = 12; cv.height = 18;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const flip = dir === 'left';
    const up = UPPER[dir === 'left' ? 'right' : dir];
    let legs;
    if (dir === 'down' || dir === 'up') {
      legs = legIdx === 0 ? LEGS.front[0] : LEGS.front[1];
      if (legIdx === 2) legs = legs.map(r => r.split('').reverse().join(''));
    } else legs = legIdx === 1 ? LEGS.side[1] : LEGS.side[0];
    const rows = up.concat(legs);
    const map = { K: OUT, H: pal.H, S: pal.S, E: OUT, C: pal.C, D: pal.D || pal.C, P: pal.P, B: pal.B || '#2b2220', R: pal.R || pal.C };
    rows.forEach((row, y) => {
      for (let x = 0; x < 12; x++) {
        const ch = row[x]; if (ch === '.') continue;
        c.fillStyle = map[ch]; c.fillRect(flip ? 11 - x : x, y + 2, 1, 1);
      }
    });
    shadeSprite(c);
    // eye shine and a little blush make faces friendlier
    if (dir === 'down' && !opt.noBlush) { R(c, 3, 8, 1, 1, shade(pal.S, -18)); R(c, 8, 8, 1, 1, shade(pal.S, -18)); }
    // accessories
    if (opt.bun && dir !== 'down') { R(c, 4, 0, 4, 3, OUT); R(c, 5, 1, 2, 2, pal.H); }
    if (opt.bun && dir === 'down') { R(c, 4, 0, 4, 2, OUT); R(c, 5, 1, 2, 1, pal.H); }
    if (opt.pig) {
      if (dir === 'down' || dir === 'up') { R(c, 0, 5, 2, 4, OUT); R(c, 0, 6, 1, 2, pal.H); R(c, 10, 5, 2, 4, OUT); R(c, 11, 6, 1, 2, pal.H); R(c, 1, 5, 1, 1, '#d0312d'); R(c, 10, 5, 1, 1, '#d0312d'); }
      else { const px = flip ? 9 : 1; R(c, px, 6, 2, 4, OUT); R(c, px + (flip ? 0 : 1), 7, 1, 2, pal.H); }
    }
    if (opt.cap) {
      R(c, 2, 1, 8, 3, opt.cap); R(c, 2, 1, 8, 1, OUT); R(c, 3, 2, 6, 1, shade(opt.cap, 22));
      if (dir === 'down') { R(c, 2, 4, 8, 1, OUT); if (!opt.noStar) R(c, 5, 2, 2, 1, '#e33'); }
      if (dir === 'right' || dir === 'left') R(c, flip ? 0 : 8, 4, 4, 1, OUT);
    }
    if (opt.helmet) {
      R(c, 1, 0, 10, 5, OUT); R(c, 2, 1, 8, 4, opt.helmet); R(c, 3, 1, 5, 1, shade(opt.helmet, 25));
      R(c, 1, 4, 10, 1, shade(opt.helmet, -25));
      if (dir === 'down') { R(c, 4, 2, 1, 1, shade(opt.helmet, -18)); R(c, 7, 3, 1, 1, shade(opt.helmet, -18)); }
    }
    if (opt.glasses && dir === 'down') { R(c, 3, 6, 3, 1, '#444'); R(c, 6, 6, 3, 1, '#444'); }
    if (opt.glasses && (dir === 'right' || dir === 'left')) R(c, flip ? 3 : 6, 6, 3, 1, '#444');
    if (opt.armband) {
      if (dir === 'down' || dir === 'up') { R(c, 0, 10, 2, 2, '#d22b26'); R(c, 0, 10, 2, 1, '#f05a50'); }
      else R(c, flip ? 6 : 4, 10, 2, 2, '#d22b26');
    }
    if (opt.apron && dir === 'down') { R(c, 3, 11, 6, 6, '#d8d2c2'); R(c, 3, 11, 6, 1, '#ece6d6'); }
    if (opt.badge && dir === 'down') R(c, 8, 10, 1, 1, '#f2d36b');
    return cv;
  }

  const spriteCache = {};
  function sprite(key, pal, opt = {}) {
    if (spriteCache[key]) return spriteCache[key];
    const s = {};
    for (const d of ['down', 'up', 'left', 'right']) s[d] = [0, 1, 2].map(i => buildFrame(d, i, pal, opt));
    spriteCache[key] = s;
    return s;
  }

  // ---------- Scene objects ----------
  // Each draw fn receives (c, x, y, w, h, o, st) where x,y,w,h are the footprint in pixels.
  const O = {};
  const wood = '#6b4429', woodL = '#8a5a36', woodD = '#4a2d1b';

  O.window = (c, x, y, w, h, o, st) => {
    const night = st.night;
    R(c, x + 1, y + 1, w - 2, h - 4, woodD);
    R(c, x + 2, y + 2, w - 4, h - 6, '#8a5a36');
    R(c, x + 4, y + 4, w - 8, h - 10, night ? '#1a2440' : '#9fc6d8');
    if (!night) { for (let i = 0; i < 6; i++) R(c, x + 6 + i, y + 5 + i, 2, 1, '#d8eef4'); R(c, x + 4, y + 4, w - 8, 2, '#b8dae6'); }
    else R(c, x + w - 9, y + 6, 2, 2, '#f2e8b0');
    R(c, x + w / 2 - 1, y + 4, 2, h - 10, woodD); R(c, x + 4, y + (h - 6) / 2, w - 8, 2, woodD);
    R(c, x, y + h - 5, w, 3, woodL); R(c, x, y + h - 5, w, 1, '#a8744a'); R(c, x, y + h - 2, w, 1, '#00000030');
  };
  O.fwindow = (c, x, y, w, h, o, st) => {
    R(c, x + 2, y + 2, w - 4, 12, '#3b2a22');
    R(c, x + 3, y + 3, w - 6, 10, st.night ? '#f0d890' : '#7da2b5');
    if (!st.night) R(c, x + 4, y + 4, 3, 3, '#a8c6d4');
    R(c, x + w / 2, y + 3, 1, 10, '#3b2a22'); R(c, x + 3, y + 8, w - 6, 1, '#3b2a22');
    R(c, x + 1, y + 13, w - 2, 2, '#6a5a4a');
    if (o.shutter) { R(c, x, y + 2, 2, 12, '#4f6a4a'); R(c, x + w - 2, y + 2, 2, 12, '#4f6a4a'); }
  };
  O.photo = (c, x, y, w, h, o, st) => {
    if (o.gone && o.gone(st) && !(o.id === 'photo' && st.flags.photoSurvived && st.ch >= 6)) { R(c, x + 3, y + 8, 10, 9, '#00000018'); R(c, x + 7, y + 6, 2, 2, '#555'); return; }
    R(c, x + 2, y + 7, 12, 11, '#3a2618'); R(c, x + 2, y + 7, 12, 1, '#6a4a30'); R(c, x + 3, y + 8, 10, 9, '#d8cfb8');
    R(c, x + 4, y + 9, 8, 7, '#b8ae96');
    R(c, x + 5, y + 10, 2, 3, '#444'); R(c, x + 9, y + 10, 2, 3, '#444'); R(c, x + 4, y + 13, 8, 3, '#6a6458');
  };
  O.certs = (c, x, y) => {
    for (let i = 0; i < 3; i++) {
      const cx = x + 2 + i * 10, cy = y + 6 + (i % 2) * 6;
      R(c, cx, cy, 9, 8, '#5a3a22'); R(c, cx + 1, cy + 1, 7, 6, '#f1e6c8'); R(c, cx + 2, cy + 2, 5, 1, '#c33'); R(c, cx + 2, cy + 4, 4, 1, '#999'); R(c, cx + 5, cy + 5, 2, 1, '#d9b45a');
    }
  };
  O.clock = (c, x, y, w, h, o, st) => {
    if (st.flags && st.flags.raided) { R(c, x + 4, y + 5, 8, 18, '#e2d6b4'); return; }
    R(c, x + 4, y + 5, 8, 18, wood); R(c, x + 4, y + 5, 8, 1, woodL);
    R(c, x + 5, y + 6, 6, 6, '#efe6cf'); R(c, x + 7, y + 7, 1, 3, '#222'); R(c, x + 7, y + 9, 3, 1, '#222');
    R(c, x + 5, y + 13, 6, 9, '#3a2618');
    const sw = Math.sin(Date.now() / 300) * 2; R(c, x + 7 + sw, y + 14, 2, 6, '#c9a043'); R(c, x + 6 + sw, y + 19, 4, 2, '#e3c060');
  };
  O.portrait = (c, x, y) => {
    R(c, x + 1, y + 3, 14, 18, '#b8322a'); R(c, x + 1, y + 3, 14, 1, '#e05a4a');
    R(c, x + 3, y + 5, 10, 14, '#e9dcc0');
    R(c, x + 5, y + 7, 6, 6, '#e0b88e'); R(c, x + 5, y + 6, 6, 2, '#2a2228'); R(c, x + 4, y + 13, 8, 6, '#6c7a6a');
    R(c, x + 6, y + 9, 1, 1, '#333'); R(c, x + 9, y + 9, 1, 1, '#333');
  };
  O.calendar = (c, x, y) => { R(c, x + 3, y + 6, 10, 13, '#efe8d8'); R(c, x + 3, y + 6, 10, 3, '#c0302a'); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R(c, x + 4 + j * 3, y + 11 + i * 3, 2, 1, i === 1 && j === 2 ? '#c0302a' : '#999'); };
  O.blackboard = (c, x, y, w, h, o, st) => {
    R(c, x, y + 4, w, h - 8, '#4a3a2a'); R(c, x + 2, y + 6, w - 4, h - 12, '#2e4a3a');
    R(c, x + 2, y + 6, w - 4, 1, '#3e5e4a');
    c.fillStyle = '#d8e0d0';
    const lines = o.lines ? o.lines(st) : 3;
    for (let i = 0; i < lines; i++) c.fillRect(x + 8, y + 10 + i * 5, w - 16 - (i * 13) % 30, 1);
    R(c, x + 4, y + h - 6, w - 8, 2, '#6b5a43'); R(c, x + 10, y + h - 7, 4, 1, '#eee');
  };
  O.banner = (c, x, y, w, h, o, st) => {
    R(c, x, y + 3, w, 11, '#b8231e'); R(c, x, y + 3, w, 1, '#e24a3a'); R(c, x, y + 13, w, 1, '#7a1612');
    c.fillStyle = '#f2d36b'; c.font = 'bold 8px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText((typeof o.text === 'function' ? o.text(st) : o.text) || '', x + w / 2, y + 9);
  };
  O.plaque = (c, x, y, w, h, o) => {
    R(c, x + 1, y + 1, w - 2, 10, '#efe6cf'); outline(c, x + 1, y + 1, w - 2, 10, '#3a2618');
    c.fillStyle = '#222'; c.font = 'bold 8px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.text || '', x + w / 2, y + 6);
  };
  O.bookshelf = (c, x, y, w, h, o, st) => {
    const top = y - 18;
    R(c, x, top, w, 34, woodD); R(c, x + 2, top + 2, w - 4, 30, wood); R(c, x, top, w, 1, woodL);
    const empty = st.flags && st.flags.raided && !o.full;
    for (let s = 0; s < 3; s++) {
      const sy = top + 3 + s * 10;
      R(c, x + 2, sy + 8, w - 4, 2, woodD); R(c, x + 2, sy + 8, w - 4, 1, woodL);
      for (let b = 0; b < (w - 6) / 3; b++) {
        if (empty && hash(b, s) > .25) continue;
        const col = ['#a33', '#36a', '#3a6', '#cb5', '#835', '#ddd'][((hash(b, s, 3) * 6) | 0)];
        const bh = 6 + ((hash(b, s) * 2) | 0);
        R(c, x + 3 + b * 3, sy + 8 - bh, 2, bh, col); R(c, x + 3 + b * 3, sy + 8 - bh, 1, bh, shade(col, 30));
      }
    }
  };
  O.cabinet = (c, x, y, w, h, o) => {
    R(c, x, y - 6, w, 20, woodD); R(c, x + 1, y - 5, w - 2, 18, woodL); R(c, x + 1, y - 5, w - 2, 1, '#a8744a');
    R(c, x + w / 2 - 1, y - 2, 1, 12, woodD); R(c, x + w / 2 - 4, y + 3, 2, 2, '#d9b45a'); R(c, x + w / 2 + 2, y + 3, 2, 2, '#d9b45a');
    if (o.radio) { R(c, x + 6, y - 16, 20, 11, '#5a3a22'); R(c, x + 6, y - 16, 20, 1, '#7a5a3a'); R(c, x + 8, y - 14, 9, 7, '#c7b48a'); for (let i = 0; i < 3; i++) R(c, x + 9, y - 13 + i * 2, 7, 1, '#9a8a6a'); R(c, x + 20, y - 13, 3, 3, '#222'); R(c, x + 20, y - 9, 3, 2, '#222'); }
  };
  O.wardrobe = (c, x, y, w) => { R(c, x, y - 20, w, 34, woodD); R(c, x + 1, y - 19, w - 2, 32, wood); R(c, x + 1, y - 19, w - 2, 1, woodL); R(c, x + w / 2, y - 18, 1, 30, woodD); R(c, x + w / 2 - 3, y - 6, 2, 3, '#d9b45a'); };
  O.table = (c, x, y, w, h, o, st) => {
    R(c, x + 2, y + h - 4, 3, 5, woodD); R(c, x + w - 5, y + h - 4, 3, 5, woodD);
    R(c, x, y + 2, w, h - 6, woodD); R(c, x + 1, y + 1, w - 2, h - 8, woodL); R(c, x + 1, y + 1, w - 2, 2, '#a26e45');
    R(c, x + 1, y + h - 7, w - 2, 1, '#00000030');
    const raided = st.flags && st.flags.raided;
    if (o.items !== false && !raided) {
      R(c, x + 10, y + 8, 6, 4, '#e8e2d2'); R(c, x + 11, y + 9, 4, 2, '#b84'); R(c, x + w - 18, y + 9, 6, 4, '#e8e2d2'); R(c, x + w - 17, y + 10, 4, 2, '#d8d0b0');
      R(c, x + w / 2, y + 6, 2, 8, '#2a2a2a'); R(c, x + w / 2 + 3, y + 6, 2, 8, '#2a2a2a');
    }
    if (o.paper) { R(c, x + w / 2 - 6, y + 5, 12, 9, '#efe8d6'); for (let i = 0; i < 3; i++) R(c, x + w / 2 - 4, y + 7 + i * 2, 8, 1, '#777'); }
  };
  O.chair = (c, x, y) => { R(c, x + 3, y - 4, 10, 6, woodD); R(c, x + 4, y - 3, 8, 4, woodL); R(c, x + 3, y + 2, 10, 4, woodL); R(c, x + 3, y + 2, 10, 1, '#a8744a'); R(c, x + 4, y + 6, 2, 6, woodD); R(c, x + 10, y + 6, 2, 6, woodD); };
  O.stool = (c, x, y) => { R(c, x + 3, y + 4, 10, 3, woodL); R(c, x + 3, y + 4, 10, 1, '#a8744a'); R(c, x + 4, y + 7, 2, 6, woodD); R(c, x + 10, y + 7, 2, 6, woodD); };
  O.armchair = (c, x, y) => { R(c, x + 1, y - 6, 14, 18, '#5a3a3a'); R(c, x + 3, y - 4, 10, 9, '#7a4a4a'); R(c, x + 3, y - 4, 10, 1, '#9a6262'); R(c, x + 3, y + 5, 10, 5, '#8c5858'); R(c, x + 2, y + 12, 2, 3, woodD); R(c, x + 12, y + 12, 2, 3, woodD); };
  O.bed = (c, x, y, w, h, o, st) => {
    R(c, x, y - 4, w, 8, woodD); R(c, x, y - 4, w, 1, woodL); R(c, x + 1, y + 2, w - 2, h - 3, woodL);
    const q = o.quilt || '#c6534a';
    R(c, x + 2, y + 3, w - 4, h - 6, q);
    for (let i = 0; i < (w - 4) / 4; i++) for (let j = 0; j < (h - 16) / 6; j++) R(c, x + 3 + i * 4, y + 14 + j * 6, 2, 2, shade(q, 25));
    R(c, x + 3, y + 4, w - 6, 6, '#efe8d8'); R(c, x + 3, y + 9, w - 6, 1, '#cfc6b2');
    R(c, x + 2, y + 12, w - 4, 1, '#00000030');
    if (st.flags && st.flags.raided && o.raidable) { R(c, x + 4, y + 18, 5, 3, '#e9e4d6'); R(c, x + w - 9, y + 26, 4, 2, '#e9e4d6'); R(c, x + 6, y + 30, 2, 2, '#e9e4d6'); }
  };
  O.trunk = (c, x, y, w) => {
    R(c, x + 1, y - 4, w - 2, 16, '#5a3520'); R(c, x + 2, y - 3, w - 4, 6, '#7a4a2a'); R(c, x + 2, y - 3, w - 4, 1, '#94603a');
    R(c, x + 6, y - 4, 2, 16, '#a88a4a'); R(c, x + w - 8, y - 4, 2, 16, '#a88a4a'); R(c, x + w / 2 - 2, y + 2, 4, 4, '#d9b45a');
  };
  O.stove = (c, x, y, w) => {
    R(c, x, y - 4, w, 18, '#8a6a58'); R(c, x + 1, y - 3, w - 2, 4, '#9f7c68');
    for (let i = 0; i < 3; i++) R(c, x + 1, y + 2 + i * 4, w - 2, 1, '#77584a');
    R(c, x + 4, y - 6, 10, 4, '#333'); R(c, x + 5, y - 9, 8, 4, '#444'); R(c, x + 6, y - 9, 6, 1, '#666');
    R(c, x + 18, y + 4, 8, 6, '#2a1a12');
    const f = (Date.now() / 120 | 0) % 3; R(c, x + 19 + f, y + 6, 3, 3, '#e8792a'); R(c, x + 21, y + 5 + f % 2, 2, 2, '#f2c14a');
    const s = (Date.now() / 400) % 6; c.fillStyle = 'rgba(230,230,230,.35)'; c.fillRect(x + 8 + Math.sin(s) * 2, y - 12 - s * 2, 2, 2);
  };
  O.basin = (c, x, y) => { R(c, x + 6, y, 3, 12, woodD); R(c, x + 2, y - 2, 12, 4, '#c8d0d0'); R(c, x + 3, y - 1, 10, 2, '#7aa6b8'); R(c, x + 4, y - 1, 3, 1, '#b0d4e0'); };
  O.desk = (c, x, y, w, h, o) => {
    R(c, x + 1, y + 2, w - 2, 8, woodD); R(c, x + 1, y + 1, w - 2, 6, '#8e6440'); R(c, x + 1, y + 1, w - 2, 1, '#a87a50');
    R(c, x + 2, y + 10, 2, 5, woodD); R(c, x + w - 4, y + 10, 2, 5, woodD);
    if (o.books) { R(c, x + 4, y - 2, 6, 4, '#36a'); R(c, x + 5, y - 4, 6, 3, '#a33'); R(c, x + 5, y - 4, 6, 1, '#c55'); }
    if (o.paper) { R(c, x + w / 2 - 4, y + 1, 8, 5, '#f1ead8'); R(c, x + w / 2 + 3, y, 1, 4, '#222'); }
  };
  O.tdesk = (c, x, y, w, h, o) => {
    R(c, x, y - 2, w, 14, woodD); R(c, x + 1, y - 1, w - 2, 8, '#8e6440'); R(c, x + 1, y - 1, w - 2, 1, '#a87a50'); R(c, x + 2, y + 8, w - 4, 4, '#6b4a30');
    if (o.items !== false) { R(c, x + 6, y - 4, 8, 5, '#efe8d6'); R(c, x + w - 12, y - 6, 6, 7, '#5a6a8a'); R(c, x + w - 12, y - 6, 6, 1, '#7a8aaa'); }
  };
  O.flag = (c, x, y) => {
    R(c, x + 4, y + 8, 8, 6, '#8a8a8a'); R(c, x + 4, y + 8, 8, 1, '#aaa'); R(c, x + 7, y - 52, 2, 62, '#ccc'); R(c, x + 7, y - 52, 1, 62, '#eee');
    for (let i = 0; i < 16; i++) R(c, x + 9 + i, y - 50 + Math.round(Math.sin(i / 3 + Date.now() / 250) * 1.5), 1, 11, i % 4 === 0 ? '#e0352e' : '#d0251f');
    R(c, x + 11, y - 48 + Math.sin(Date.now() / 250), 3, 3, '#f2d36b');
  };
  O.board = (c, x, y, w, h, o, st) => {
    R(c, x, y + 1, w, 13, '#4a3c2c'); R(c, x + 1, y + 2, w - 2, 11, '#8a7a5e'); R(c, x, y + 1, w, 1, '#6a5a44');
    const n = o.count ? o.count(st) : 3;
    for (let i = 0; i < n; i++) {
      const px = x + 2 + ((i * 11) % (w - 12)), py = y + 1 + ((i * 3) % 4);
      R(c, px + 1, py + 1, 10, 12, '#00000030');
      R(c, px, py, 10, 12, i % 3 === 2 ? '#f0d9d0' : '#efe8d6');
      R(c, px + 2, py + 2, 6, 2, i % 2 ? '#222' : '#b8231e');
      R(c, px + 2, py + 6, 6, 1, '#555'); R(c, px + 2, py + 8, 5, 1, '#555');
      if (o.mark && o.mark(st) && i === 0) { R(c, px + 1, py + 3, 8, 1, '#d22'); R(c, px + 4, py, 1, 12, '#d22'); }
    }
  };
  O.plant = (c, x, y) => { R(c, x + 4, y + 6, 8, 8, '#9a5a3a'); R(c, x + 3, y + 5, 10, 2, '#b0704a'); R(c, x + 3, y - 4, 4, 10, '#4c7a3a'); R(c, x + 8, y - 6, 4, 12, '#5f9248'); R(c, x + 6, y - 8, 3, 8, '#4c7a3a'); R(c, x + 9, y - 6, 1, 6, '#7ab05a'); };
  O.tree = (c, x, y) => {
    R(c, x + 6, y - 2, 5, 14, '#5a3e2a'); R(c, x + 6, y - 2, 1, 14, '#7a5a3e');
    c.fillStyle = '#00000025'; c.beginPath(); c.ellipse(x + 8, y + 12, 12, 4, 0, 0, 7); c.fill();
    const sw = Math.sin(Date.now() / 900 + x) * .8;
    const blobs = [[8, -18, 13], [0, -10, 9], [16, -10, 9], [8, -28, 9]];
    for (const [bx, by, r] of blobs) { c.fillStyle = '#365e2e'; c.beginPath(); c.arc(x + bx + sw, y + by, r, 0, 7); c.fill(); }
    for (const [bx, by, r] of blobs) { c.fillStyle = '#4f8240'; c.beginPath(); c.arc(x + bx - 2 + sw, y + by - 2, r - 3, 0, 7); c.fill(); }
    for (const [bx, by, r] of blobs) { c.fillStyle = '#6aa052'; c.beginPath(); c.arc(x + bx - 4 + sw, y + by - 4, r - 7 > 0 ? r - 7 : 2, 0, 7); c.fill(); }
  };
  O.bicycle = (c, x, y) => {
    c.strokeStyle = '#222'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + 7, y + 8, 6, 0, 7); c.stroke(); c.beginPath(); c.arc(x + 25, y + 8, 6, 0, 7); c.stroke();
    c.strokeStyle = '#2f4a6a'; c.beginPath(); c.moveTo(x + 7, y + 8); c.lineTo(x + 14, y); c.lineTo(x + 24, y); c.lineTo(x + 25, y + 8); c.moveTo(x + 14, y); c.lineTo(x + 17, y + 8); c.lineTo(x + 7, y + 8); c.stroke();
    R(c, x + 12, y - 3, 6, 2, '#222'); R(c, x + 23, y - 4, 4, 2, '#222'); R(c, x + 16, y + 7, 2, 2, '#888');
  };
  O.tap = (c, x, y) => { R(c, x + 6, y - 10, 3, 20, '#7a7a80'); R(c, x + 6, y - 10, 1, 20, '#9a9aa0'); R(c, x + 6, y - 10, 8, 3, '#7a7a80'); R(c, x + 12, y - 8, 2, 3, '#555'); R(c, x + 3, y + 6, 11, 8, '#5d6d78'); R(c, x + 4, y + 7, 9, 2, '#7aa6b8'); const d = (Date.now() / 200 | 0) % 6; R(c, x + 12, y - 5 + d * 2, 1, 1, '#9cc4d0'); };
  O.bucket = (c, x, y) => { R(c, x + 4, y + 4, 8, 9, '#6a7a86'); R(c, x + 4, y + 4, 8, 2, '#8a9aa6'); R(c, x + 5, y + 1, 6, 1, '#444'); };
  O.broom = (c, x, y) => { R(c, x + 9, y - 14, 2, 20, '#8a6a3a'); R(c, x + 5, y + 6, 10, 8, '#c9a85a'); R(c, x + 5, y + 6, 10, 2, '#a3833a'); for (let i = 0; i < 4; i++) R(c, x + 6 + i * 2, y + 9, 1, 5, '#b3933a'); };
  O.laundry = (c, x, y, w) => {
    // sagging rope with clothes
    for (let i = 0; i <= w; i += 2) R(c, x + i, y - 18 + Math.round(Math.sin(i / w * Math.PI) * 3), 2, 1, '#cfc6b0');
    const cols = ['#d8d0c0', '#6a8ac0', '#c05050', '#e8e0a0', '#7aa070', '#d8d0c0'];
    for (let i = 0; i < w / 16; i++) {
      const px = i * 16 + 4, sag = Math.round(Math.sin((px + 4) / w * Math.PI) * 3);
      const sx = x + px + Math.sin(Date.now() / 500 + i) * 1;
      const col = cols[i % cols.length], hh = i % 2 ? 10 : 7;
      R(c, sx, y - 17 + sag, 9, hh, col); R(c, sx, y - 17 + sag, 9, 1, shade(col, 25)); R(c, sx + 8, y - 17 + sag, 1, hh, shade(col, -25));
      R(c, sx + 1, y - 18 + sag, 1, 2, '#8a6a3a'); R(c, sx + 7, y - 18 + sag, 1, 2, '#8a6a3a');
    }
  };
  O.shop = (c, x, y, w, h, o, st) => {
    R(c, x, y + 8, w, h - 8, '#4a3a2c');
    R(c, x + 2, y + 10, w - 4, h - 12, '#2f3a40');
    for (let i = 0; i < (w - 4) / 12; i++) { R(c, x + 3 + i * 12, y + 11, 10, h - 14, '#5d7a86'); R(c, x + 4 + i * 12, y + 12, 2, h - 16, '#87a7b2'); }
    // striped awning
    for (let i = 0; i < w; i += 4) R(c, x + i, y + 8, 4, 3, (i / 4) % 2 ? '#e8e0c8' : (o.awning || '#a83a2a'));
    const sign = o.sign ? o.sign(st) : o.text;
    if (sign) {
      R(c, x + 4, y - 4, w - 8, 12, sign.bg || '#2a2a2a'); outline(c, x + 4, y - 4, w - 8, 12, '#c9a043');
      c.fillStyle = sign.fg || '#f2d36b'; c.font = 'bold 9px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(sign.t, x + w / 2, y + 2);
    } else { R(c, x + 4, y - 4, w - 8, 12, '#00000030'); for (let i = 0; i < 4; i++) R(c, x + 8 + i * 12, y - 2 + (i % 2) * 4, 3, 2, '#5a4a3a'); }
    R(c, x, y + h - 2, w, 2, '#3a2a20');
  };
  O.stall = (c, x, y, w, h, o, st) => {
    const closed = st.flags && st.flags.stallClosed;
    for (let i = 0; i < w; i += 4) R(c, x + i, y - 12, 4, 4, closed ? ((i / 4) % 2 ? '#8a8a8a' : '#6a6a6a') : ((i / 4) % 2 ? '#e8d8b0' : '#c0402a'));
    R(c, x + 2, y - 8, 2, 19, woodD); R(c, x + w - 4, y - 8, 2, 19, woodD);
    R(c, x, y + 2, w, 10, woodD); R(c, x + 1, y + 1, w - 2, 6, woodL); R(c, x + 1, y + 1, w - 2, 1, '#a8744a');
    if (!closed) for (let i = 0; i < w / 5 - 1; i++) { const col = ['#a33', '#36a', '#3a6', '#cb5', '#eee'][i % 5]; R(c, x + 3 + i * 5, y - 1, 4, 5, col); R(c, x + 3 + i * 5, y - 1, 4, 1, shade(col, 30)); }
    else { R(c, x + 6, y - 4, w - 12, 4, '#efe8d6'); R(c, x + 4, y - 3, w - 8, 1, '#c02a22'); }
  };
  O.speaker = (c, x, y) => {
    R(c, x + 7, y - 40, 2, 52, '#6a5a4a'); R(c, x + 7, y - 40, 1, 52, '#8a7a6a'); R(c, x + 3, y + 8, 10, 4, '#5a4a3a');
    R(c, x + 9, y - 40, 7, 5, '#888'); R(c, x + 14, y - 42, 3, 9, '#aaa');
    R(c, x - 1, y - 34, 7, 5, '#888'); R(c, x - 2, y - 36, 3, 9, '#aaa');
  };
  O.bench = (c, x, y, w) => { R(c, x + 1, y + 2, w - 2, 4, woodL); R(c, x + 1, y + 2, w - 2, 1, '#a8744a'); R(c, x + 1, y - 2, w - 2, 3, wood); R(c, x + 3, y + 6, 2, 7, woodD); R(c, x + w - 5, y + 6, 2, 7, woodD); };
  O.pingpong = (c, x, y, w, h) => { R(c, x, y + 2, w, h - 6, '#6a6a66'); R(c, x + 1, y + 1, w - 2, h - 8, '#3f7a5a'); R(c, x + 2, y + 2, w - 4, 1, '#eee'); R(c, x + w / 2 - 1, y - 2, 2, h - 6, '#ddd'); R(c, x + 2, y + h - 4, w - 4, 4, '#5a5a56'); };
  O.stage = (c, x, y, w, h) => { R(c, x, y, w, h, woodD); R(c, x + 1, y + 1, w - 2, h - 6, '#a06a3a'); R(c, x + 1, y + 1, w - 2, 1, '#c08a5a'); for (let i = 0; i < w; i += 16) R(c, x + i, y + 1, 1, h - 6, '#8a5a2e'); R(c, x, y + h - 5, w, 5, '#7a2a22'); for (let i = 0; i < w; i += 8) R(c, x + i, y + h - 5, 4, 5, '#9a3a2e'); };
  O.panel = (c, x, y, w) => {
    R(c, x + 3, y + 4, 2, 10, '#555'); R(c, x + w - 5, y + 4, 2, 10, '#555');
    R(c, x, y - 16, w, 22, '#3a3a3a'); R(c, x + 1, y - 15, w - 2, 20, '#efe8d6');
    R(c, x + 3, y - 13, w - 6, 3, '#b8231e');
    R(c, x + 3, y - 8, 10, 8, '#8a8070'); R(c, x + 4, y - 7, 4, 3, '#a8a090'); R(c, x + 15, y - 8, w - 18, 1, '#555'); R(c, x + 15, y - 5, w - 20, 1, '#555'); R(c, x + 15, y - 2, w - 22, 1, '#555');
  };
  O.crates = (c, x, y) => { R(c, x + 1, y - 2, 14, 14, '#8a6a3a'); outline(c, x + 1, y - 2, 14, 14, '#5a4020'); R(c, x + 1, y + 4, 14, 1, '#5a4020'); R(c, x + 2, y - 1, 12, 1, '#aa8a5a'); R(c, x + 2, y - 1, 1, 12, '#5a4020'); };
  O.barrel = (c, x, y) => { R(c, x + 3, y - 4, 10, 16, '#4a5a6a'); R(c, x + 3, y - 4, 10, 2, '#6a7a8a'); R(c, x + 3, y + 2, 10, 1, '#2a3a4a'); R(c, x + 3, y + 8, 10, 1, '#2a3a4a'); R(c, x + 4, y - 3, 2, 14, '#5a6a7a'); };
  O.stand = (c, x, y, w) => { R(c, x, y - 8, w, 3, '#e8e0c8'); R(c, x + 2, y - 5, 2, 16, woodD); R(c, x + w - 4, y - 5, 2, 16, woodD); R(c, x, y + 2, w, 9, '#7a5a3a'); R(c, x + 4, y - 2, 8, 5, '#d8b070'); R(c, x + 14, y - 1, 10, 4, '#c08a50'); R(c, x + 6, y - 6, 3, 4, '#ddd'); const s = (Date.now() / 300) % 5; c.fillStyle = 'rgba(240,240,240,.4)'; c.fillRect(x + 7, y - 8 - s * 2, 2, 2); };
  O.busstop = (c, x, y) => { R(c, x + 7, y - 22, 2, 34, '#555'); R(c, x + 2, y - 26, 12, 8, '#d8d0b0'); outline(c, x + 2, y - 26, 12, 8, '#2a5a8a'); R(c, x + 4, y - 24, 8, 1, '#2a5a8a'); };
  O.lamp = (c, x, y, w, h, o, st) => { R(c, x + 7, y - 30, 2, 42, '#3a3a3a'); R(c, x + 4, y - 32, 8, 3, '#3a3a3a'); R(c, x + 5, y - 29, 6, 2, '#f2e08a'); if (st.night) { c.fillStyle = 'rgba(255,230,140,.15)'; c.beginPath(); c.ellipse(x + 8, y + 6, 18, 8, 0, 0, 7); c.fill(); } };
  O.cat = (c, x, y) => {
    const t = Date.now() / 700, tail = Math.sin(t) * 2;
    R(c, x + 3, y + 6, 9, 6, '#d08a3a'); R(c, x + 3, y + 6, 9, 1, '#e8a85a'); R(c, x + 10, y + 3, 5, 5, '#d08a3a'); R(c, x + 10, y + 2, 1, 2, '#d08a3a'); R(c, x + 14, y + 2, 1, 2, '#d08a3a');
    R(c, x + 12, y + 5, 1, 1, '#222'); R(c, x + 1, y + 5 + tail, 3, 2, '#d08a3a'); R(c, x + 4, y + 12, 2, 2, '#b06a2a'); R(c, x + 9, y + 12, 2, 2, '#b06a2a');
    R(c, x + 5, y + 8, 1, 2, '#b06a2a'); R(c, x + 7, y + 8, 1, 2, '#b06a2a');
  };
  O.door = (c, x, y) => { R(c, x + 1, y - 10, 14, 26, '#3a2618'); R(c, x + 2, y - 9, 12, 25, '#5a4a3a'); R(c, x + 2, y - 9, 12, 1, '#7a6a5a'); R(c, x + 11, y + 2, 2, 2, '#999'); };
  O.hut = (c, x, y, w, h) => {
    R(c, x + 4, y + 4, w - 8, h - 4, '#9a7a52'); R(c, x + w / 2 - 6, y + 10, 12, h - 10, '#3a2a1a');
    c.fillStyle = '#c9a85a'; c.beginPath(); c.moveTo(x - 4, y + 8); c.lineTo(x + w / 2, y - 18); c.lineTo(x + w + 4, y + 8); c.fill();
    for (let i = 0; i < w; i += 5) R(c, x + i, y + 2 - Math.abs(i - w / 2) / 2, 1, 6, '#a3833a');
  };
  O.haystack = (c, x, y, w, h) => { c.fillStyle = '#d8b65a'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2 + 4, 0, 0, 7); c.fill(); c.fillStyle = '#e8ca78'; c.beginPath(); c.ellipse(x + w / 2 - 3, y + h / 2 - 4, w / 3, h / 4, 0, 0, 7); c.fill(); for (let i = 0; i < 8; i++) R(c, x + 4 + i * 3, y + 4 + (i % 3) * 5, 1, 6, '#b8963a'); };
  O.rice = (c, x, y, w, h, o, st) => {
    const n = (st.flags && st.flags.planted) || 0;
    for (let r = 0; r < h / 8; r++) for (let i = 0; i < w / 8; i++) {
      const done = r * (w / 8) + i < (n + 1) * (w / 8) * (h / 8) / 4;
      if (done || hash(i, r) > .5) { R(c, x + 3 + i * 8, y + 2 + r * 8, 1, 5, '#7ac05a'); R(c, x + 5 + i * 8, y + 3 + r * 8, 1, 4, '#5aa040'); R(c, x + 4 + i * 8, y + 1 + r * 8, 1, 3, '#9ad070'); }
    }
  };
  O.tools = (c, x, y) => { R(c, x + 3, y - 14, 2, 26, '#8a6a3a'); R(c, x + 1, y - 16, 6, 4, '#777'); R(c, x + 10, y - 10, 2, 22, '#8a6a3a'); R(c, x + 8, y + 9, 6, 3, '#777'); };
  O.bag = (c, x, y) => { R(c, x + 4, y + 6, 9, 8, '#3a6a4a'); R(c, x + 4, y + 6, 9, 1, '#4a8a5a'); R(c, x + 5, y + 4, 7, 2, '#2a5a3a'); R(c, x + 7, y + 8, 3, 2, '#d9b45a'); };
  O.memory = (c, x, y) => {
    const t = Date.now() / 300, b = Math.sin(t) * 1.5;
    R(c, x + 5, y + 5 + b, 6, 6, '#f2d36b'); R(c, x + 6, y + 4 + b, 4, 8, '#f2d36b'); R(c, x + 4, y + 6 + b, 8, 4, '#f2d36b');
    R(c, x + 6, y + 6 + b, 2, 2, '#fff8d0');
    c.fillStyle = 'rgba(255,230,120,.25)'; c.beginPath(); c.arc(x + 8, y + 8 + b, 7 + Math.sin(t * 1.3), 0, 7); c.fill();
  };
  O.gate = (c, x, y, w) => { R(c, x, y - 12, w, 4, '#c0302a'); R(c, x, y - 12, 3, 28, '#555'); R(c, x + w - 3, y - 12, 3, 28, '#555'); };

  // ----- props used by the DLC levels -----
  O.traincar = (c, x, y, w, h) => {
    R(c, x, y - 10, w, h + 6, '#2a2220');
    R(c, x + 1, y - 9, w - 2, h + 2, '#6a3a2a'); R(c, x + 1, y - 9, w - 2, 2, '#8a5a40');
    for (let i = 6; i < w - 4; i += 6) R(c, x + i, y - 7, 1, h, '#5a2e20');
    R(c, x + w / 2 - 8, y - 5, 16, h - 4, '#4a2618'); R(c, x + w / 2 - 1, y - 5, 2, h - 4, '#2a1a10');
    for (let i = 0; i < 4; i++) { R(c, x + 4 + i * ((w - 14) / 3), y + h - 4, 6, 6, '#222'); R(c, x + 5 + i * ((w - 14) / 3), y + h - 3, 2, 2, '#666'); }
    c.fillStyle = '#f2f2f2'; c.font = 'bold 7px monospace'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('P 4062', x + 4, y - 6);
  };
  O.truck = (c, x, y, w, h, o) => {
    const body = o.wreck ? '#3a3a34' : '#4c5a34';
    R(c, x, y - 8, w, h + 4, '#1a1a16');
    R(c, x + 1, y - 7, w - 12, h + 2, body); R(c, x + 1, y - 7, w - 12, 2, shade(body, 22));
    for (let i = 4; i < w - 14; i += 5) R(c, x + i, y - 5, 1, h - 2, shade(body, -16));
    R(c, x + w - 12, y - 3, 11, h - 2, shade(body, 10)); R(c, x + w - 10, y - 1, 7, 6, o.wreck ? '#222' : '#8ab0c0');
    R(c, x + 4, y + h - 4, 8, 6, '#151515'); R(c, x + w - 10, y + h - 4, 8, 6, '#151515');
    if (o.wreck) { for (let i = 0; i < 5; i++) { const s = (Date.now() / 200 + i * 7) % 30; c.fillStyle = `rgba(60,60,60,${.5 - s / 60})`; c.fillRect(x + w / 2 + Math.sin(i + s / 5) * 3, y - 10 - s, 4, 4); } }
  };
  O.pillar = (c, x, y) => { R(c, x + 3, y - 34, 10, 46, '#9a2a22'); R(c, x + 4, y - 34, 3, 46, '#c04a3a'); R(c, x + 2, y - 36, 12, 4, '#d9a640'); R(c, x + 1, y + 10, 14, 4, '#8a8478'); };
  O.lantern = (c, x, y) => { const sw = Math.sin(Date.now() / 600 + x) * 1.5; R(c, x + 7, y - 26, 1, 8, '#333'); R(c, x + 3 + sw, y - 19, 10, 10, '#d0251f'); R(c, x + 4 + sw, y - 18, 3, 8, '#f05a4a'); R(c, x + 3 + sw, y - 20, 10, 1, '#d9a640'); R(c, x + 3 + sw, y - 9, 10, 1, '#d9a640'); R(c, x + 7 + sw, y - 8, 1, 4, '#d9a640'); };
  O.gatehouse = (c, x, y, w, h) => {
    R(c, x, y + 8, w, h - 8, '#a8322a'); R(c, x, y + 8, w, 2, '#c04a3a');
    for (let i = 0; i < w; i += 6) R(c, x + i, y + 12, 2, h - 14, '#962a23');
    c.fillStyle = '#d9a640'; c.beginPath(); c.moveTo(x - 8, y + 10); c.lineTo(x + 10, y - 6); c.lineTo(x + w - 10, y - 6); c.lineTo(x + w + 8, y + 10); c.fill();
    R(c, x + 10, y - 10, w - 20, 5, '#b88a30');
    for (let i = 0; i < w; i += 4) R(c, x + i - 4, y + 6, 2, 4, '#a07a28');
    R(c, x + w / 2 - 9, y + 14, 18, 22, '#e9dcc0'); outline(c, x + w / 2 - 9, y + 14, 18, 22, '#5a3a22');
    R(c, x + w / 2 - 4, y + 18, 8, 8, '#e0b88e'); R(c, x + w / 2 - 4, y + 17, 8, 3, '#2a2228'); R(c, x + w / 2 - 6, y + 27, 12, 8, '#6c7a6a');
    R(c, x + w / 2 - 12, y + h - 14, 24, 14, '#3a1a14');
  };
  O.boat = (c, x, y, w, h) => {
    c.fillStyle = '#4a3020'; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + w, y + 2); c.lineTo(x + w - 8, y + h); c.lineTo(x + 8, y + h); c.fill();
    R(c, x + 2, y + 2, w - 4, 3, '#6a4a30'); R(c, x + w / 2 - 10, y - 12, 20, 14, '#8a7a5a'); R(c, x + w / 2 - 10, y - 12, 20, 2, '#a8987a');
    R(c, x + w / 2 - 1, y - 30, 2, 18, '#5a4a3a');
  };
  O.sandbags = (c, x, y, w) => { for (let i = 0; i < w; i += 8) { R(c, x + i, y + 4, 8, 5, '#8a7a52'); R(c, x + i, y + 4, 8, 1, '#a8976a'); R(c, x + i + 4, y + 8, 8, 5, '#7e6e48'); } };
  O.statue = (c, x, y) => { R(c, x + 1, y + 2, 14, 10, '#8a8478'); R(c, x + 1, y + 2, 14, 1, '#aaa498'); R(c, x + 4, y - 20, 8, 22, '#b0aaa0'); R(c, x + 5, y - 26, 6, 6, '#b0aaa0'); R(c, x + 5, y - 20, 2, 22, '#c8c2b6'); };
  O.none = () => {};

  function obj(c, o, st) {
    const fn = O[o.type] || O.none;
    fn(c, o.x * TS, o.y * TS, o.w * TS, o.h * TS, o, st);
  }

  // Bouncing yellow arrow used as the "go here" marker
  function arrow(c, x, y, dir, t) {
    const b = Math.sin(t / 150) * 2;
    c.save(); c.translate(x, y);
    const rot = { down: 0, up: Math.PI, left: Math.PI / 2, right: -Math.PI / 2 }[dir] || 0;
    c.rotate(rot); c.translate(0, b);
    c.fillStyle = '#000'; c.beginPath(); c.moveTo(-6, -4); c.lineTo(6, -4); c.lineTo(0, 4); c.fill();
    c.fillStyle = '#ffd94a'; c.beginPath(); c.moveTo(-4, -3); c.lineTo(4, -3); c.lineTo(0, 2); c.fill();
    c.restore();
  }

  // Draws the static tiles of a map into an offscreen canvas once, so each frame only blits it.
  function bakeMap(room, get) {
    const rows = room.map.length, cols = room.map[0].length;
    const cv = document.createElement('canvas'); cv.width = cols * TS; cv.height = rows * TS;
    const c = cv.getContext('2d');
    const live = [];
    for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      const t = get(tx, ty);
      if (ANIMATED.has(t)) live.push([tx, ty, t]);
      tile(c, t, tx, ty, room, get);
    }
    for (let ty = 1; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      const t0 = get(tx, ty), up = get(tx, ty - 1);
      if (!SOLID.has(t0) && t0 !== 'D' && (up === '#' || up === 'b')) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(tx * TS, ty * TS, TS, 3); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(tx * TS, ty * TS + 3, TS, 2); }
    }
    return { canvas: cv, live };
  }

  return { TS, tile, SOLID, BLOCK, sprite, obj, arrow, hash, R, shade, bakeMap };
})();
