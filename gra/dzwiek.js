// Dźwięki składane w przeglądarce (Web Audio), bez plików. Prowizorka, dopóki nie wybierzemy prawdziwych.
let ac = null, glosnosc = null, szumBufor = null, wlaczony = true;

export function obudzDzwiek() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); glosnosc = ac.createGain(); glosnosc.gain.value = 0.55; glosnosc.connect(ac.destination);
      szumBufor = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
      const d = szumBufor.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      wczytajUtwor();
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
    case 'ostrzezenie':                                                    // róg wojenny z lasu przed falą (27 XI, poprawiony po teście Patryka: „słaby”)
      rog(t, 65, 2.8, 0.9); bum(t, 1);
      if (z.boss) { rog(t + 3.1, 49, 3.6, 1); bum(t + 3.1, 1.3); rog(t + 3.15, 73.5, 3.5, 0.35); }
      break;
    case 'portal': ton(t, 1.4, 'sawtooth', 40, 95, 0.18); szum(t, 1.3, 'bandpass', 200, 2400, 0.3, 5); ton(t + 0.3, 1.1, 'sine', 300, 120, 0.12); szum(t + 1.2, 0.5, 'lowpass', 900, 120, 0.35); break;   // klątwa rozdziera powietrze (27 XI)
    case 'portal_zamkniety': ton(t, 0.35, 'sine', 220, 50, 0.25); szum(t, 0.3, 'bandpass', 2400, 300, 0.2, 3); break;   // rana w powietrzu zrasta się   // klątwa rozdziera powietrze (27 XI)
    case 'grosze': ton(t, 0.09, 'triangle', 2400, 2300, 0.12); ton(t + 0.06, 0.12, 'triangle', 3100, 2900, 0.1); ton(t + 0.13, 0.1, 'triangle', 2700, 2600, 0.07); break;   // brzęk monet u handlarza (27 XI)
    case 'handel': szum(t, 0.25, 'bandpass', 700, 400, 0.15, 2); break;   // szelest plecaka starca
    case 'klatwa': ton(t, 0.8, 'sine', 62, 24, 1); szum(t, 0.5, 'lowpass', 1400, 90, 0.7); szum(t, 0.25, 'highpass', 5000, 2500, 0.18); break;
  }
}

// Pogłos: wspólny dla rogu i muzyki, z szumu, który wygasa (bez plików).
let poglosN = null;
function poglos() {
  if (poglosN) return poglosN;
  const n = Math.floor(ac.sampleRate * 3), buf = ac.createBuffer(2, n, ac.sampleRate);
  for (let k = 0; k < 2; k++) { const d = buf.getChannelData(k); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8); }
  const c = ac.createConvolver(); c.buffer = buf; const g = ac.createGain(); g.gain.value = 0.55; c.connect(g); g.connect(glosnosc);
  return (poglosN = c);
}
let krzywa = null;
function przester() {
  const w = ac.createWaveShaper();
  if (!krzywa) { krzywa = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; krzywa[i] = Math.tanh(x * 3.2); } }
  w.curve = krzywa; return w;
}
// Róg: kilka rozstrojonych pił przez przester i filtr, który się otwiera; wejście z podciągnięciem tonu, potem drżenie i opadnięcie.
function rog(t0, f, dl, moc) {
  const wej = ac.createGain(); wej.gain.value = 0.5;
  const sh = przester(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2.5;
  lp.frequency.setValueAtTime(250, t0); lp.frequency.linearRampToValueAtTime(1500, t0 + 0.5); lp.frequency.linearRampToValueAtTime(1100, t0 + dl - 0.6); lp.frequency.linearRampToValueAtTime(200, t0 + dl);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.42 * moc, t0 + 0.3); g.gain.setValueAtTime(0.42 * moc, t0 + dl - 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dl);
  wej.connect(sh); sh.connect(lp); lp.connect(g); g.connect(glosnosc); g.connect(poglos());
  const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t0); vg.gain.linearRampToValueAtTime(f * 0.012, t0 + 1.2); vib.connect(vg); vib.start(t0); vib.stop(t0 + dl + 0.1);
  for (const [m, typ, a] of [[1, 'sawtooth', 0.5], [1.004, 'sawtooth', 0.4], [0.996, 'sawtooth', 0.4], [2, 'square', 0.15], [0.5, 'sine', 0.5]]) {
    const o = ac.createOscillator(); o.type = typ;
    o.frequency.setValueAtTime(f * m * 0.78, t0); o.frequency.exponentialRampToValueAtTime(f * m, t0 + 0.22); o.frequency.setValueAtTime(f * m, t0 + dl - 0.5); o.frequency.exponentialRampToValueAtTime(f * m * 0.9, t0 + dl);
    vg.connect(o.frequency);
    const og = ac.createGain(); og.gain.value = a; o.connect(og); og.connect(wej); o.start(t0); o.stop(t0 + dl + 0.1);
  }
  szum(t0, 0.35, 'bandpass', 500, 1400, 0.12, 2);                     // oddech na początku
}
function bum(t, moc) { ton(t, 1.4, 'sine', 62, 28, 0.9 * moc); szum(t, 0.6, 'lowpass', 700, 60, 0.6 * moc); }

// Muzyka walki (27 XI; druga wersja po teście Patryka: „muzyczka taka sobie”). Składana w przeglądarce:
// bęben wojenny i werbel, galopujący bas na pochodzie d-moll (d, d, B, C), smyczkowe akordy w pogłosie.
// moc 0 to cisza, 1 zwykła fala, 2 ostatnia noc z rycerzem (szybciej, gęściej i z głosem rogu na początku taktu).
const POCHOD = [[73.42, [146.8, 174.6, 220]], [73.42, [146.8, 174.6, 220]], [58.27, [116.5, 146.8, 174.6]], [65.41, [130.8, 164.8, 196]]];
let muz = null;
// Utwór Patryka do walki (Suno, „Blood on the Frozen River”, 27 XI). Gdy się wczyta, gra go zamiast muzyki składanej w kodzie.
// Fala zaczyna go od początku (cichy wstęp narasta z falą). Przerwa między potworami do 6 s go nie urywa, tylko ścisza.
let utwor = null, granie = null;
function wczytajUtwor() {
  fetch(new URL('../dzwiek/walka.mp3', import.meta.url).href).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status))
    .then(b => new Promise((ok, zle) => ac.decodeAudioData(b, ok, zle))).then(b => { utwor = b; }).catch(() => { /* zostaje muzyka z kodu */ });
}
function muzykaUtworu(moc) {
  const t = ac.currentTime, gra_ = wlaczony && moc > 0;
  if (gra_ && !granie) {
    const zr = ac.createBufferSource(); zr.buffer = utwor; zr.loop = true;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); zr.connect(g); g.connect(glosnosc); zr.start(t);
    granie = { zr, g, ciszaOd: null };
  }
  if (!granie) return;
  if (gra_) { granie.ciszaOd = null; granie.g.gain.setTargetAtTime(moc > 1 ? 0.95 : 0.8, t, 0.5); return; }
  if (granie.ciszaOd === null) { granie.ciszaOd = t; granie.g.gain.setTargetAtTime(wlaczony ? 0.35 : 0.0001, t, 0.8); }
  if (t - granie.ciszaOd > 6 || !wlaczony) {                          // fala się skończyła: wygasa i staje
    const { zr, g } = granie; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0.0001, t, 0.9); zr.stop(t + 4); granie = null;
  }
}

export function muzyka(moc) {
  if (!ac || ac.state !== 'running') return;
  if (utwor) { muzykaUtworu(moc); return; }
  if (!muz) { const g = ac.createGain(); g.gain.value = 0.0001; g.connect(glosnosc); g.connect(poglos()); muz = { g, nast: ac.currentTime + 0.1, krok: 0 }; }
  const cel = wlaczony && moc > 0 ? (moc > 1 ? 0.62 : 0.5) : 0.0001;
  muz.g.gain.setTargetAtTime(cel, ac.currentTime, moc > 0 ? 0.6 : 1.4);
  if (moc <= 0) { muz.nast = ac.currentTime + 0.1; muz.krok = 0; return; }
  const kr = 60 / (moc > 1 ? 132 : 112) / 4;                           // szesnastki
  const BEBEN = moc > 1 ? [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1] : [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  const WERBEL = moc > 1 ? [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1] : [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
  const BAS = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];             // galop: dłuższa i dwie krótkie
  while (muz.nast < ac.currentTime + 0.25) {
    const t = muz.nast, i = muz.krok % 16, takt = Math.floor(muz.krok / 16) % 4, [fb, akord] = POCHOD[takt];
    const sinus = (f0, f1, cz, a) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + cz);
      const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(a, t + 0.005); gg.gain.exponentialRampToValueAtTime(0.0001, t + cz);
      o.connect(gg); gg.connect(muz.g); o.start(t); o.stop(t + cz + 0.05); };
    const szumek = (typ, f, cz, a, q = 1) => { const z = ac.createBufferSource(); z.buffer = szumBufor; const fl = ac.createBiquadFilter(); fl.type = typ; fl.frequency.value = f; fl.Q.value = q;
      const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(a, t + 0.004); gg.gain.exponentialRampToValueAtTime(0.0001, t + cz);
      z.connect(fl); fl.connect(gg); gg.connect(muz.g); z.start(t, Math.random() * 0.3); z.stop(t + cz + 0.05); };
    if (BEBEN[i]) { sinus(95, 40, 0.45, 1); szumek('lowpass', 400, 0.12, 0.35); }
    if (WERBEL[i]) { szumek('bandpass', 1500, 0.16, 0.32, 0.8); sinus(200, 150, 0.08, 0.2); }
    if (i % 2 === 0 || moc > 1) szumek('highpass', 7000, 0.04, i % 4 === 2 ? 0.05 : 0.025);
    if (BAS[i] && (moc > 1 || i % 4 !== 3)) {                            // bas: krótkie szarpnięcie piły przez filtr
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fb * (i === 14 && takt === 3 ? 2 : 1);
      const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(i % 4 === 0 ? 900 : 600, t); fl.frequency.exponentialRampToValueAtTime(120, t + kr * 1.6);
      const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(i % 4 === 0 ? 0.32 : 0.2, t + 0.006); gg.gain.exponentialRampToValueAtTime(0.0001, t + kr * 1.8);
      o.connect(fl); fl.connect(gg); gg.connect(muz.g); o.start(t); o.stop(t + kr * 2);
    }
    if (i === 0) {                                                      // akord smyczków na cały takt
      const dl = kr * 16;
      for (const f of akord) for (const r of [0.997, 1.003]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * r;
        const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(500, t); fl.frequency.linearRampToValueAtTime(moc > 1 ? 1600 : 1100, t + dl * 0.6);
        const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.linearRampToValueAtTime(0.035, t + dl * 0.35); gg.gain.linearRampToValueAtTime(0.0001, t + dl);
        o.connect(fl); fl.connect(gg); gg.connect(muz.g); o.start(t); o.stop(t + dl + 0.05);
      }
      if (moc > 1 && takt === 0 && wlaczony) rog(t, 73.42, kr * 14, 0.35);
    }
    muz.nast += kr; muz.krok++;
  }
}
