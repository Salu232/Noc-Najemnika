// Dźwięki składane w przeglądarce (Web Audio), bez plików. Prowizorka, dopóki nie wybierzemy prawdziwych.
let ac = null, glosnosc = null, szumBufor = null, wlaczony = true;

export function obudzDzwiek() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); glosnosc = ac.createGain(); glosnosc.gain.value = 0.55; glosnosc.connect(ac.destination);
      szumBufor = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
      const d = szumBufor.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}

export function przelaczDzwiek() { wlaczony = !wlaczony; return wlaczony; }
export const dzwiekWlaczony = () => wlaczony;

function obwiednia(g, t, szczyt, atak, zanik) {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(szczyt, t + atak); g.gain.exponentialRampToValueAtTime(0.0001, t + atak + zanik);
}
function szum(t, czas, filtr, od, doHz, szczyt, q = 1) {
  const z = ac.createBufferSource(); z.buffer = szumBufor;
  const f = ac.createBiquadFilter(); f.type = filtr; f.Q.value = q; f.frequency.setValueAtTime(od, t); f.frequency.exponentialRampToValueAtTime(doHz, t + czas);
  const g = ac.createGain(); obwiednia(g, t, szczyt, 0.01, czas);
  z.connect(f); f.connect(g); g.connect(glosnosc); z.start(t, Math.random() * 0.2); z.stop(t + czas + 0.05);
}
function ton(t, czas, typ, od, doHz, szczyt) {
  const o = ac.createOscillator(); o.type = typ; o.frequency.setValueAtTime(od, t); o.frequency.exponentialRampToValueAtTime(doHz, t + czas);
  const g = ac.createGain(); obwiednia(g, t, szczyt, 0.005, czas);
  o.connect(g); g.connect(glosnosc); o.start(t); o.stop(t + czas + 0.05);
}

export function zagraj(z) {
  if (!ac || !wlaczony || ac.state !== 'running') return;
  const t = ac.currentTime;
  switch (z.typ) {
    case 'zamach':
      if (z.mocny) { szum(t, 0.32, 'bandpass', 250, 1100, 0.5, 1); ton(t, 0.25, 'sawtooth', 110, 60, 0.08); }
      else if (z.ciezki) szum(t, 0.22, 'bandpass', 350, 1300, 0.35, 1.2); else szum(t, 0.13, 'bandpass', 700, 2200, 0.25, 1.3);
      break;
    case 'naladowany': ton(t, 0.2, 'sine', 520, 980, 0.18); break;
    case 'trafienie': ton(t, 0.12, 'sine', 140, 45, 0.6); szum(t, 0.08, 'lowpass', 2200, 500, 0.35); break;
    case 'grzeznie': ton(t, 0.18, 'square', 190, 120, 0.12); szum(t, 0.16, 'bandpass', 1800, 900, 0.3, 3); break;
    case 'blok': ton(t, 0.12, 'triangle', 950, 700, 0.22); szum(t, 0.06, 'highpass', 3000, 2000, 0.2); break;
    case 'parowanie': ton(t, 0.45, 'sine', 1500, 1350, 0.28); ton(t, 0.35, 'sine', 2250, 2100, 0.12); break;
    case 'rana': ton(t, 0.22, 'sine', 95, 40, 0.7); szum(t, 0.12, 'lowpass', 700, 200, 0.35); break;
    case 'smierc': szum(t, 0.2, 'lowpass', 1000, 250, 0.4); break;
    case 'totem_traf': ton(t, 0.16, 'triangle', 420, 260, 0.25); szum(t, 0.1, 'bandpass', 1600, 700, 0.25, 2); break;
    case 'totem_rozbity': ton(t, 0.7, 'sine', 90, 30, 0.9); szum(t, 0.6, 'lowpass', 1800, 120, 0.7); ton(t, 0.6, 'sawtooth', 220, 60, 0.08); break;
    case 'mikstura': ton(t, 0.3, 'sine', 420, 760, 0.2); break;
    case 'podniesione': ton(t, 0.12, 'sine', 880, 1200, 0.12); break;
    case 'drewno': szum(t, 0.12, 'bandpass', 600, 300, 0.25, 2); break;
    case 'dorzucone': szum(t, 0.5, 'bandpass', 900, 300, 0.35, 1); ton(t, 0.2, 'sine', 120, 70, 0.3); break;
    case 'przemiana': ton(t, 1.6, 'sawtooth', 55, 30, 0.35); szum(t, 1.4, 'lowpass', 900, 60, 0.6); ton(t + 0.2, 1.2, 'sine', 140, 40, 0.5); break;   // klątwa bierze rycerza
    case 'boss': ton(t, 1.2, 'sine', 62, 48, 0.6); ton(t, 1.2, 'triangle', 93, 72, 0.15); break;
    case 'tapniecie': ton(t, 0.55, 'sine', 70, 28, 0.9); szum(t, 0.35, 'lowpass', 500, 80, 0.5); break;
    case 'drzwi':                                                          // skrzypnięcie zawiasów, przy zamykaniu głuche stuknięcie
      ton(t, 0.35, 'sawtooth', z.otwarte ? 210 : 260, z.otwarte ? 320 : 180, 0.05); szum(t, 0.3, 'bandpass', 900, 1400, 0.08, 6);
      if (!z.otwarte) ton(t + 0.38, 0.14, 'sine', 90, 45, 0.5);
      break;
    case 'unikniety': szum(t, 0.15, 'bandpass', 1400, 600, 0.15, 2); break;
    case 'klatwa_laduje': ton(t, 0.45, 'sawtooth', 55, 140, 0.12); szum(t, 0.45, 'bandpass', 300, 1600, 0.12, 4); break;
    case 'ostrzezenie': {                                                  // róg z mgły przed falą: niski, nabrzmiewa i opada (27 XI); przed bossem dwa razy
      const rog = (t0) => { for (const [f, a] of [[73, 0.32], [110, 0.12], [146, 0.06]]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.94, t0); o.frequency.linearRampToValueAtTime(f, t0 + 0.5); o.frequency.linearRampToValueAtTime(f * 0.9, t0 + 2.2);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t0); lp.frequency.linearRampToValueAtTime(900, t0 + 0.8); lp.frequency.linearRampToValueAtTime(250, t0 + 2.2);
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(a, t0 + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.3);
        o.connect(lp); lp.connect(g); g.connect(glosnosc); o.start(t0); o.stop(t0 + 2.4); } };
      rog(t); if (z.boss) rog(t + 2.6);
      break;
    }
    case 'portal': ton(t, 1.4, 'sawtooth', 40, 95, 0.18); szum(t, 1.3, 'bandpass', 200, 2400, 0.3, 5); ton(t + 0.3, 1.1, 'sine', 300, 120, 0.12); break;   // klątwa rozdziera powietrze (27 XI)
    case 'grosze': ton(t, 0.09, 'triangle', 2400, 2300, 0.12); ton(t + 0.06, 0.12, 'triangle', 3100, 2900, 0.1); ton(t + 0.13, 0.1, 'triangle', 2700, 2600, 0.07); break;   // brzęk monet u handlarza (27 XI)
    case 'handel': szum(t, 0.25, 'bandpass', 700, 400, 0.15, 2); break;   // szelest plecaka starca
    case 'klatwa': ton(t, 0.8, 'sine', 62, 24, 1); szum(t, 0.5, 'lowpass', 1400, 90, 0.7); szum(t, 0.25, 'highpass', 5000, 2500, 0.18); break;
  }
}

// Muzyka walki (27 XI, Patryk: „przy walce jakaś dynamiczna muzyczka”). Składana w przeglądarce jak reszta dźwięków:
// bęben (bas i tom), niski bordun i szum jak oddech. moc 0 to cisza, 1 zwykła fala, 2 ostatnia noc z rycerzem (szybciej i gęściej).
let muz = null;
export function muzyka(moc) {
  if (!ac || ac.state !== 'running') return;
  if (!muz) {
    const g = ac.createGain(); g.gain.value = 0.0001; g.connect(glosnosc);
    const dr = ac.createOscillator(); dr.type = 'sawtooth'; dr.frequency.value = 55;
    const drf = ac.createBiquadFilter(); drf.type = 'lowpass'; drf.frequency.value = 160;
    const drg = ac.createGain(); drg.gain.value = 0.05; dr.connect(drf); drf.connect(drg); drg.connect(g); dr.start();
    muz = { g, nast: ac.currentTime + 0.1, krok: 0, moc: 0 };
  }
  const cel = wlaczony && moc > 0 ? (moc > 1 ? 0.75 : 0.6) : 0.0001;
  muz.g.gain.setTargetAtTime(cel, ac.currentTime, moc > 0 ? 0.8 : 1.6);
  muz.moc = moc;
  if (moc <= 0) { muz.nast = ac.currentTime + 0.1; return; }
  const bpm = moc > 1 ? 128 : 108, kr = 60 / bpm / 2;                 // ósemki
  const bas = moc > 1 ? [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1] : [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0];
  const tom = moc > 1 ? [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1] : [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0];
  while (muz.nast < ac.currentTime + 0.25) {
    const t = muz.nast, i = muz.krok % 16;
    const do_ = (f0, f1, cz, a) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + cz);
      const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(a, t + 0.006); gg.gain.exponentialRampToValueAtTime(0.0001, t + cz);
      o.connect(gg); gg.connect(muz.g); o.start(t); o.stop(t + cz + 0.05); };
    if (bas[i]) do_(90, 38, 0.32, 0.9);
    if (tom[i]) do_(170, 95, 0.22, 0.45);
    if (i % 4 === 2) { const z = ac.createBufferSource(); z.buffer = szumBufor; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
      const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.06, t + 0.005); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      z.connect(f); f.connect(gg); gg.connect(muz.g); z.start(t, Math.random() * 0.3); z.stop(t + 0.1); }
    muz.nast += kr; muz.krok++;
  }
}
