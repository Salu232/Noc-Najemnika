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
    case 'klatwa': ton(t, 0.8, 'sine', 62, 24, 1); szum(t, 0.5, 'lowpass', 1400, 90, 0.7); szum(t, 0.25, 'highpass', 5000, 2500, 0.18); break;
  }
}
