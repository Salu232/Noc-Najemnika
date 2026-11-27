// Dźwięki składane w przeglądarce (Web Audio), bez plików. Prowizorka, dopóki nie wybierzemy prawdziwych.
let ac = null, glosnosc = null, szumBufor = null, wlaczony = true;

export function obudzDzwiek() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); glosnosc = ac.createGain(); glosnosc.gain.value = 0.55; glosnosc.connect(ac.destination);
      szumBufor = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
      const d = szumBufor.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      wczytajUtwor(); wczytajProbki();
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
  if (z.wiedzma) {                                                      // wiedźma bagna: głos z jej filmów
    if (z.typ === 'rzut' && probka('wiedzma-rzut', 0.75, 0.6)) return;
    if (z.typ === 'jek' && probka('wiedzma-jek', 0.8, 1.6)) return;
    if (z.typ === 'bossPadl') probka('wiedzma-upadek', 0.9, 2);
    if (z.typ === 'glos') { probka(z.n, 1, 1); return; }
  }
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
    case 'brak_tchu': szum(t, 0.32, 'bandpass', 900, 350, 0.3, 1.5); ton(t, 0.16, 'square', 130, 95, 0.08); ton(t + 0.12, 0.14, 'square', 105, 80, 0.06); break;   // ciężki wydech i głuche „nie” (27 XI, Przemek)
    case 'unikniety': szum(t, 0.15, 'bandpass', 1400, 600, 0.15, 2); break;
    case 'klatwa_laduje': ton(t, 0.45, 'sawtooth', 55, 140, 0.12); szum(t, 0.45, 'bandpass', 300, 1600, 0.12, 4); break;
    case 'ostrzezenie':                                                    // róg wojenny z lasu przed falą (27 XI, poprawiony po teście Patryka: „słaby”)
      rog(t, 65, 2.8, 0.9); bum(t, 1);
      if (z.boss) { rog(t + 3.1, 49, 3.6, 1); bum(t + 3.1, 1.3); rog(t + 3.15, 73.5, 3.5, 0.35); }
      break;
    case 'portal': ton(t, 1.4, 'sawtooth', 40, 95, 0.18); szum(t, 1.3, 'bandpass', 200, 2400, 0.3, 5); ton(t + 0.3, 1.1, 'sine', 300, 120, 0.12); szum(t + 1.2, 0.5, 'lowpass', 900, 120, 0.35); break;   // klątwa rozdziera powietrze (27 XI)
    case 'portal_zamkniety': ton(t, 0.35, 'sine', 220, 50, 0.25); szum(t, 0.3, 'bandpass', 2400, 300, 0.2, 3); break;   // rana w powietrzu zrasta się   // klątwa rozdziera powietrze (27 XI)
    case 'grosze': ton(t, 0.09, 'triangle', 2400, 2300, 0.12); ton(t + 0.06, 0.12, 'triangle', 3100, 2900, 0.1); ton(t + 0.13, 0.1, 'triangle', 2700, 2600, 0.07); break;   // brzęk monet u handlarza (27 XI)
    case 'grosze_z': ton(t + 0.05, 0.07, 'triangle', 2600, 2500, 0.05); ton(t + 0.1, 0.09, 'triangle', 3300, 3100, 0.04); break;   // grosz z potwora, cicho
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
// Głosy z filmów Patryka (27 XI 22:00, Patryk: „trzeba dźwięk dodawać, fajny jest”): wiedźma bagna rzuca, jęczy i pada.
// Wycięte z dźwięku filmów Veo do dzwiek/wiedzma-*.mp3. Jeśli się nie wczytają, zostają dźwięki z kodu.
const probki = {}, ostatnio = {};
function wczytajProbki() {
  // kwestie wiedźmy (dusza, wejscie, wrzask) czekają na filmy Patryka: bez pliku po prostu ich nie słychać
  for (const n of ['wiedzma-rzut', 'wiedzma-jek', 'wiedzma-upadek', 'wiedzma-dusza', 'wiedzma-wejscie', 'wiedzma-wrzask'])
    fetch(new URL(`../dzwiek/${n}.mp3`, import.meta.url).href).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status))
      .then(b => new Promise((ok, zle) => ac.decodeAudioData(b, ok, zle))).then(b => { probki[n] = b; }).catch(() => { /* bez próbki */ });
}
// Zwraca true, gdy próbka zagrała. odstep: najkrótszy czas między dwoma odtworzeniami tej samej próbki.
function probka(n, glos = 0.8, odstep = 0.3) {
  const b = probki[n], t = ac.currentTime; if (!b || t - (ostatnio[n] ?? -9) < odstep) return !!b;
  ostatnio[n] = t;
  const zr = ac.createBufferSource(), g = ac.createGain(); zr.buffer = b; g.gain.value = glos; zr.connect(g); g.connect(glosnosc); zr.start(t);
  return true;
}
function wczytajUtwor() {
  fetch(new URL('../dzwiek/walka.mp3', import.meta.url).href).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status))
    .then(b => new Promise((ok, zle) => ac.decodeAudioData(b, ok, zle))).then(b => { utwor = b; }).catch(() => { /* zostaje muzyka z kodu */ });
}
function muzykaUtworu(moc) {
  const t = ac.currentTime, gra_ = wlaczony && moc > 0;
  if (gra_ && !granie) {
    const zr = ac.createBufferSource(); zr.buffer = utwor; zr.loop = true;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5500;   // ciszej i ciemniej, żeby siedziała pod ciosami (Patryk, 27 XI 11:41: „wtopić, nie tak głośno”)
    zr.connect(lp); lp.connect(g); g.connect(glosnosc); zr.start(t);
    granie = { zr, g, ciszaOd: null };
  }
  if (!granie) return;
  if (gra_) { granie.ciszaOd = null; granie.g.gain.setTargetAtTime(moc > 1 ? 0.6 : 0.46, t, 0.5); return; }   // 27 XI 12:00: minimalnie głośniej
  if (granie.ciszaOd === null) { granie.ciszaOd = t; granie.g.gain.setTargetAtTime(wlaczony ? 0.16 : 0.0001, t, 0.8); }
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

// Dźwięki otoczenia (27 XI, Patryk: „w tle muzyczka czy dźwięki pogody?”; Claude: poza walką bez muzyki, sama noc).
// Deszcz i wiatr cały czas, trzask ogniska tym głośniej, im bliżej, w izbie deszcz przytłumiony jak o dach.
// Co kilkanaście sekund coś daleko w lesie: wycie, trzask gałęzi albo sowa; przed falą częściej i bliżej.
let oto = null;
function petlaSzumu(sek) {
  const b = ac.createBuffer(2, Math.floor(ac.sampleRate * sek), ac.sampleRate);
  for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); let r = 0; for (let i = 0; i < d.length; i++) { r = 0.97 * r + 0.03 * (Math.random() * 2 - 1); d[i] = (Math.random() * 2 - 1) * 0.6 + r * 4; } }
  const z = ac.createBufferSource(); z.buffer = b; z.loop = true; z.start(); return z;
}
function zbudujOtoczenie() {
  const wyj = ac.createGain(); wyj.gain.value = 0.0001; wyj.connect(glosnosc);
  // deszcz: szum przez filtr; na dworze jasny, w izbie stłumiony
  const dz = petlaSzumu(4), dzF = ac.createBiquadFilter(); dzF.type = 'lowpass'; dzF.frequency.value = 7000;
  const dzH = ac.createBiquadFilter(); dzH.type = 'highpass'; dzH.frequency.value = 400;
  const dzG = ac.createGain(); dzG.gain.value = 0.11; dz.connect(dzH); dzH.connect(dzF); dzF.connect(dzG); dzG.connect(wyj);
  // wiatr: wąskie pasmo, które powoli pływa w górę i w dół
  const wi = petlaSzumu(5), wiF = ac.createBiquadFilter(); wiF.type = 'bandpass'; wiF.Q.value = 3; wiF.frequency.value = 450;
  const lfo = ac.createOscillator(), lfoG = ac.createGain(); lfo.frequency.value = 0.07; lfoG.gain.value = 220; lfo.connect(lfoG); lfoG.connect(wiF.frequency); lfo.start();
  const lfo2 = ac.createOscillator(), lfo2G = ac.createGain(); lfo2.frequency.value = 0.045; lfo2G.gain.value = 0.05;
  const wiG = ac.createGain(); wiG.gain.value = 0.07; lfo2.connect(lfo2G); lfo2G.connect(wiG.gain); lfo2.start();
  wi.connect(wiF); wiF.connect(wiG); wiG.connect(wyj);
  // ognisko: niski szum płomienia; trzaski dokłada otoczenie() co klatkę
  const og = petlaSzumu(3), ogF = ac.createBiquadFilter(); ogF.type = 'lowpass'; ogF.frequency.value = 320;
  const ogG = ac.createGain(); ogG.gain.value = 0.0001; og.connect(ogF); ogF.connect(ogG); ogG.connect(wyj);
  return { wyj, dzF, dzG, wiG, ogG, ogien: 0, nastepne: ac.currentTime + 8 };
}
function trzask(t, moc) {
  const z = ac.createBufferSource(); z.buffer = szumBufor; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800 + Math.random() * 2500;
  const g = ac.createGain(); const a = moc * (0.05 + Math.random() * 0.12); g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.01 + Math.random() * 0.03);
  z.connect(f); f.connect(g); g.connect(oto.wyj); z.start(t, Math.random() * 0.5); z.stop(t + 0.06);
}
function zLasu(t, blisko) {                                           // jedno zdarzenie z ciemności, w pogłosie
  const g = ac.createGain(); g.gain.value = blisko ? 0.5 : 0.25; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = blisko ? 2400 : 1200;
  const pan = ac.createStereoPanner ? ac.createStereoPanner() : null; if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; g.connect(pan); pan.connect(lp); } else g.connect(lp);
  lp.connect(oto.wyj); lp.connect(poglos());
  const r = Math.random(), los = (a, b) => a + Math.random() * (b - a);
  if (r < 0.45) {                                                     // wycie: ślizg w górę, drżenie, opadnięcie
    const f0 = los(330, 420), dl = los(2.2, 3.4);
    for (const [m, a] of [[1, 0.22], [2.01, 0.05]]) {
      const o = ac.createOscillator(); o.type = 'sine'; const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5.5; vg.gain.value = 6 * m; v.connect(vg); vg.connect(o.frequency);
      o.frequency.setValueAtTime(f0 * 0.75 * m, t); o.frequency.linearRampToValueAtTime(f0 * 1.35 * m, t + dl * 0.35); o.frequency.linearRampToValueAtTime(f0 * 1.25 * m, t + dl * 0.75); o.frequency.linearRampToValueAtTime(f0 * 0.8 * m, t + dl);
      const og = ac.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(a, t + 0.5); og.gain.setValueAtTime(a, t + dl * 0.7); og.gain.exponentialRampToValueAtTime(0.0001, t + dl);
      o.connect(og); og.connect(g); o.start(t); v.start(t); o.stop(t + dl + 0.1); v.stop(t + dl + 0.1);
    }
  } else if (r < 0.75) {                                              // trzask gałęzi: dwa, trzy suche pęknięcia
    for (let k = 0, tt = t; k < 2 + (Math.random() * 2 | 0); k++, tt += los(0.06, 0.25)) {
      const z = ac.createBufferSource(); z.buffer = szumBufor; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = los(700, 1600); f.Q.value = 1.5;
      const zg = ac.createGain(); zg.gain.setValueAtTime(0.6, tt); zg.gain.exponentialRampToValueAtTime(0.0001, tt + los(0.05, 0.12));
      z.connect(f); f.connect(zg); zg.connect(g); z.start(tt, Math.random() * 0.4); z.stop(tt + 0.15);
    }
  } else {                                                            // sowa: dwa niskie pohukiwania
    for (const [d, dl] of [[0, 0.35], [0.55, 0.6]]) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(390, t + d); o.frequency.linearRampToValueAtTime(350, t + d + dl);
      const og = ac.createGain(); og.gain.setValueAtTime(0.0001, t + d); og.gain.exponentialRampToValueAtTime(0.18, t + d + 0.06); og.gain.exponentialRampToValueAtTime(0.0001, t + d + dl);
      o.connect(og); og.connect(g); o.start(t + d); o.stop(t + d + dl + 0.05);
    }
  }
}
// s: { gra: czy gra trwa (nie pauza), wIzbie, ogien: 0..1 jak blisko i jak mocno pali się ognisko, napiecie: 0..1 przed falą, walka }
export function otoczenie(s) {
  if (!ac || ac.state !== 'running') return;
  if (!oto) oto = zbudujOtoczenie();
  const t = ac.currentTime, on = wlaczony && s.gra;
  oto.wyj.gain.setTargetAtTime(on ? 1.3 : 0.0001, t, 0.6);
  oto.dzF.frequency.setTargetAtTime(s.wIzbie ? 700 : 7000, t, 0.25);
  oto.dzG.gain.setTargetAtTime(s.wIzbie ? 0.13 : (s.walka ? 0.055 : 0.085), t, 0.3);   // 27 XI 12:00: deszcz minimalnie ciszej
  oto.wiG.gain.setTargetAtTime(s.wIzbie ? 0.02 : 0.07, t, 0.4);
  oto.ogG.gain.setTargetAtTime(0.0001 + 0.3 * s.ogien, t, 0.3);
  if (!on) return;
  if (Math.random() < s.ogien * 0.35) trzask(t + Math.random() * 0.05, s.ogien);
  if (t >= oto.nastepne) {
    if (!s.walka && !s.wIzbie || Math.random() < 0.3) zLasu(t, s.napiecie > 0.5);
    oto.nastepne = t + (s.napiecie > 0.5 ? 5 + Math.random() * 6 : 12 + Math.random() * 18);
  }
}
