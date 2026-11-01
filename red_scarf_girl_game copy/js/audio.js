'use strict';
// Tiny chiptune music sequencer and sound effects, all generated with Web Audio (no audio files).
const AUDIO = (() => {
  let ctx = null, master, musicBus, sfxBus, noiseBuf;
  let song = null, songName = null, step = 0, nextTime = 0, timer = null;
  let sfxOn = true, musicOn = true;

  function init() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? .1 : 0; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = .45; sfxBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { return false; }
  }
  // browsers only allow audio after the first user gesture
  ['keydown', 'pointerdown'].forEach(ev => window.addEventListener(ev, () => { if (init() && ctx.state === 'suspended') ctx.resume(); }, { capture: true }));

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function tone(freq, dur, { type = 'square', vol = .2, when = 0, bus = sfxBus, slide = 0, attack = .005 } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, { vol = .3, when = 0, bus = sfxBus, freq = 1200, type = 'lowpass', q = 1 } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(bus); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
  }

  const SFX = {
    blip: f => tone(f || 440, .05, { vol: .06 }),
    step: () => noise(.04, { vol: .05, freq: 900 }),
    door: () => { noise(.12, { vol: .18, freq: 500 }); tone(110, .15, { type: 'triangle', vol: .15, slide: -40 }); },
    pickup: () => { tone(880, .08, { vol: .12 }); tone(1320, .12, { vol: .12, when: .07 }); },
    memory: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .25, { type: 'triangle', vol: .12, when: i * .08 })),
    pistol: () => { noise(.12, { vol: .5, freq: 2200 }); tone(180, .08, { vol: .2, slide: -120 }); },
    rifle: () => { noise(.14, { vol: .6, freq: 1600 }); tone(120, .1, { vol: .25, slide: -80 }); },
    shotgun: () => { noise(.3, { vol: .8, freq: 900 }); tone(80, .2, { vol: .3, slide: -50 }); },
    enemyShot: () => noise(.1, { vol: .25, freq: 1400 }),
    hit: () => { noise(.06, { vol: .3, freq: 3000, type: 'highpass' }); tone(240, .06, { vol: .1, slide: -100 }); },
    hurt: () => { tone(160, .2, { type: 'sawtooth', vol: .2, slide: -90 }); noise(.1, { vol: .2, freq: 600 }); },
    down: () => { tone(200, .3, { type: 'triangle', vol: .15, slide: -150 }); },
    reload: () => { noise(.03, { vol: .2, freq: 4000, type: 'highpass' }); noise(.03, { vol: .2, freq: 3000, type: 'highpass', when: .18 }); },
    empty: () => tone(1200, .03, { vol: .08 }),
    explode: () => { noise(.8, { vol: .9, freq: 400 }); tone(60, .6, { type: 'sine', vol: .5, slide: -30 }); },
    rescue: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, { type: 'triangle', vol: .14, when: i * .07 })),
    alarm: () => { tone(880, .15, { vol: .1 }); tone(660, .15, { vol: .1, when: .16 }); },
    bang: () => { noise(1.2, { vol: 1, freq: 1800 }); tone(70, 1, { type: 'sine', vol: .5, slide: -40 }); },
  };

  // ----- Songs: 16th-step patterns of MIDI notes (0 = rest). -----
  const P = (s) => s.trim().split(/\s+/).map(n => n === '.' ? 0 : +n);
  const SONGS = {
    title: { bpm: 72, wave: 'triangle', lead: P('74 . . 76 78 . . . 81 . 78 . 76 . . . 74 . . 71 69 . . . 71 . 74 . 71 . . .'), bass: P('50 . . . . . . . 45 . . . . . . . 47 . . . . . . . 43 . . . . . . .'), leadVol: .5 },
    home: { bpm: 96, wave: 'triangle', lead: P('74 . 76 78 81 . 78 76 74 . 71 69 71 . . . 69 71 74 . 76 . 78 76 74 . 71 . 74 . . .'), bass: P('50 . 57 . 50 . 57 . 47 . 54 . 47 . 54 . 45 . 52 . 45 . 52 . 50 . 57 . 50 . . .') },
    tense: { bpm: 104, wave: 'square', lead: P('69 . . 72 . 74 . . 72 . 69 . 67 . . . 69 . . 72 . 74 . 76 74 . 72 . 69 . . .'), bass: P('45 . 45 . 45 . 45 . 43 . 43 . 43 . 43 . 41 . 41 . 41 . 41 . 40 . 40 . 40 . 40 .'), drum: P('1 . . . 2 . . . 1 . 1 . 2 . . .'), leadVol: .35 },
    sad: { bpm: 66, wave: 'triangle', lead: P('69 . . . 72 . 71 . 69 . . . 64 . . . 65 . . . 67 . 69 . 67 . . . . . . .'), bass: P('45 . . . . . . . 41 . . . . . . . 43 . . . . . . . 40 . . . . . . .') },
    hope: { bpm: 84, wave: 'triangle', lead: P('74 . 78 . 81 . . 83 81 . 78 . 76 . . . 78 . 81 . 83 . 86 . 83 . 81 . 78 . . .'), bass: P('50 . . . 57 . . . 55 . . . 57 . . . 50 . . . 54 . . . 55 . . . 57 . . .') },
    countryside: { bpm: 78, wave: 'sine', lead: P('76 . 79 . 81 . 79 76 74 . . . 72 . 74 . 76 . . . 79 . 76 74 72 . . . . . . .'), bass: P('48 . . . 55 . . . 52 . . . 55 . . . 48 . . . 55 . . . 50 . . . 43 . . .'), leadVol: .5 },
    // DLC
    dlc_title: { bpm: 100, wave: 'square', lead: P('62 . . 62 65 . 69 . 67 . 65 . 62 . . . 60 . . 60 64 . 67 . 65 . 64 . 62 . . .'), bass: P('38 . 38 . 38 . 38 . 36 . 36 . 36 . 36 .'), drum: P('1 . 3 . 2 . 3 . 1 . 3 . 2 . 3 3'), leadVol: .3 },
    march: { bpm: 116, wave: 'square', lead: P('67 . 67 . 70 . 72 . 74 . . . 72 . 70 . 67 . 67 . 65 . 67 . 70 . . . . . . .'), bass: P('43 . 50 . 43 . 50 . 41 . 48 . 41 . 48 .'), drum: P('1 . 3 . 2 . 3 3 1 . 3 . 2 . 3 .'), leadVol: .28 },
    battle: { bpm: 140, wave: 'sawtooth', lead: P('62 . 65 62 69 . 67 65 62 . 65 62 70 . 69 67 62 . 65 62 69 . 67 65 64 . 65 64 62 . . .'), bass: P('38 38 . 38 38 . 38 . 36 36 . 36 36 . 36 . 34 34 . 34 34 . 34 . 33 33 . 33 33 . 33 .'), drum: P('1 3 2 3 1 3 2 3 1 3 2 3 1 1 2 3'), leadVol: .18 },
    palace: { bpm: 88, wave: 'square', lead: P('62 . . . 63 . . . 62 . . . 58 . . . 60 . . . 62 . 63 . 65 . . . 63 . . .'), bass: P('38 . . 38 . . 38 . 34 . . 34 . . 34 . 36 . . 36 . . 36 . 31 . . 31 . . 31 .'), drum: P('1 . . . 2 . . . 1 . 1 . 2 . . 3'), leadVol: .25 },
    victory: { bpm: 108, wave: 'square', lead: P('72 . 72 . 72 . 76 . 79 . . . 76 . 79 . 84 . . . . . . . 81 . 79 . 76 . 79 .'), bass: P('48 . 55 . 48 . 55 . 53 . 60 . 55 . 59 .'), drum: P('1 . 3 . 2 . 3 . 1 . 3 . 2 3 3 3'), leadVol: .3 },
  };

  function schedule() {
    if (!ctx || !song) return;
    const spb = 60 / song.bpm / 4;
    while (nextTime < ctx.currentTime + .15) {
      const L = song.lead[step % song.lead.length];
      if (L) tone(hz(L), spb * 1.8, { type: song.wave, vol: song.leadVol || .45, bus: musicBus, when: nextTime - ctx.currentTime, attack: .01 });
      const B = song.bass && song.bass[step % song.bass.length];
      if (B) tone(hz(B), spb * 1.6, { type: 'triangle', vol: .55, bus: musicBus, when: nextTime - ctx.currentTime });
      const D = song.drum && song.drum[step % song.drum.length];
      if (D === 1) { tone(90, .12, { type: 'sine', vol: .9, bus: musicBus, slide: -50, when: nextTime - ctx.currentTime }); }
      if (D === 2) noise(.1, { vol: .5, freq: 1800, bus: musicBus, when: nextTime - ctx.currentTime });
      if (D === 3) noise(.03, { vol: .25, freq: 7000, type: 'highpass', bus: musicBus, when: nextTime - ctx.currentTime });
      step++; nextTime += spb;
    }
  }

  function music(name) {
    if (name === songName) return;
    songName = name; song = SONGS[name] || null; step = 0;
    if (!init()) return;
    nextTime = ctx.currentTime + .1;
    if (!timer) timer = setInterval(schedule, 40);
  }

  return {
    sfx(name, arg) { if (!sfxOn || !init()) return; const f = SFX[name]; if (f) f(arg); },
    music,
    setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.value = on ? .1 : 0; },
    setSfx(on) { sfxOn = on; },
  };
})();
