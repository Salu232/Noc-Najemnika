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
    case 'zamach': z.ciezki ? szum(t, 0.22, 'bandpass', 350, 1300, 0.35, 1.2) : szum(t, 0.12, 'bandpass', 900, 2600, 0.22, 1.4); break;
    case 'trafienie': ton(t, 0.12, 'sine', 140, 45, 0.6); szum(t, 0.08, 'lowpass', 2200, 500, 0.35); break;
    case 'grzeznie': ton(t, 0.18, 'square', 190, 120, 0.12); szum(t, 0.16, 'bandpass', 1800, 900, 0.3, 3); break;
    case 'blok': ton(t, 0.12, 'triangle', 950, 700, 0.22); szum(t, 0.06, 'highpass', 3000, 2000, 0.2); break;
    case 'parowanie': ton(t, 0.45, 'sine', 1500, 1350, 0.28); ton(t, 0.35, 'sine', 2250, 2100, 0.12); break;
    case 'rana': ton(t, 0.22, 'sine', 95, 40, 0.7); szum(t, 0.12, 'lowpass', 700, 200, 0.35); break;
    case 'smierc': szum(t, 0.2, 'lowpass', 1000, 250, 0.4); break;
    case 'tapniecie': ton(t, 0.55, 'sine', 70, 28, 0.9); szum(t, 0.35, 'lowpass', 500, 80, 0.5); break;
    case 'unikniety': szum(t, 0.15, 'bandpass', 1400, 600, 0.15, 2); break;
  }
}
