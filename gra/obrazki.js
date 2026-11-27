// Obrazki rysowane kodem, dopóki nie ma grafik z Gemini: ziemia, sosny, ghule, kolos, światło, mgła.
// Wszystko jest w kolorach dnia. Noc dokłada silnik (ciemność z wyciętym światłem), tak jak ustaliliśmy w Próbie chaty.

import { SZER, WYS, CHATA, OGNISKO, MGLY, DROGA as DROGA_GLOWNA, DROGA_SZER } from './swiat.js';

const TAU = Math.PI * 2;
export const PX = 2;                       // ile pikseli obrazka na jednostkę świata

export function plotno(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return c;
}

function losowe(ziarno) {
  let z = ziarno;
  return () => { z = (z * 16807) % 2147483647; return z / 2147483647; };
}

// ---------- ziemia ----------
export function kafelZiemi() {
  const N = 512, c = plotno(N, N), g = c.getContext('2d'), r = losowe(99);
  const zawin = fn => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { g.save(); g.translate(dx, dy); fn(); g.restore(); } };
  g.fillStyle = '#5f5a4d'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 260; i++) {
    const x = r() * N, y = r() * N, rx = 10 + r() * 46, ry = rx * (0.4 + r() * 0.3), ciemna = r() < 0.55;
    // 25 XI (Przemek: stara tekstura „nie pasuje”): plamy słabsze, a jasne nie odcinają się już jak monety
    zawin(() => { g.fillStyle = ciemna ? 'rgba(52,49,42,0.22)' : 'rgba(104,94,78,0.14)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); });
  }
  for (let i = 0; i < 190; i++) {
    const x = r() * N, y = r() * N, dl = 5 + r() * 9;
    zawin(() => {
      g.strokeStyle = 'rgba(96,110,70,0.75)'; g.lineWidth = 1.2; g.beginPath();
      for (let k = -2; k <= 2; k++) { g.moveTo(x + k * 2, y); g.lineTo(x + k * 3 + (r() - 0.5) * 3, y - dl); }
      g.stroke();
    });
  }
  // kamyki z obrysem (jasne „monety”) usunięte 25 XI: kamienie i ziemię dają teraz kępy z arkuszy Przemka
  g.strokeStyle = 'rgba(20,18,16,0.3)'; g.lineWidth = 0.7;
  for (let i = 0; i < 140; i++) {
    const x = r() * N, y = r() * N;
    zawin(() => { g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(x + k * 3, y); g.lineTo(x + k * 3 + 6, y + 6); } g.stroke(); });
  }
  return c;
}

// Plamy na ziemi w małej rozdzielczości (1/8), rozciągane na cały świat: ciemne igliwie w lesie,
// jaśniejsza polana, wydeptany krąg przy ognisku, ścieżka do furtki i wilgotna ziemia pod mgłą.
export const SKALA_PLAM = 8;
export function plamyZiemi() {
  const s = SKALA_PLAM, c = plotno(SZER / s, WYS / s), g = c.getContext('2d');
  g.scale(1 / s, 1 / s);
  g.fillStyle = 'rgba(28,30,22,0.62)'; g.fillRect(0, 0, SZER, WYS);
  // polana: wycinamy las miękkim kołem
  g.save(); g.globalCompositeOperation = 'destination-out';
  const pol = g.createRadialGradient(1600, 1260, 300, 1600, 1260, 1050);
  pol.addColorStop(0, 'rgba(0,0,0,1)'); pol.addColorStop(0.75, 'rgba(0,0,0,0.85)'); pol.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = pol; g.save(); g.translate(1600, 1260); g.scale(1, 0.72); g.translate(-1600, -1260); g.fillRect(0, 0, SZER, WYS * 2); g.restore();
  g.restore();
  // wydeptany krąg i ścieżka do furtki
  const brazowy = (x, y, r, a) => { const k = g.createRadialGradient(x, y, 0, x, y, r); k.addColorStop(0, `rgba(120,98,70,${a})`); k.addColorStop(1, 'rgba(120,98,70,0)'); g.fillStyle = k; g.fillRect(x - r, y - r, r * 2, r * 2); };
  brazowy(OGNISKO.x, OGNISKO.y, 230, 0.55);
  const furtka = { x: CHATA.x + 455 * CHATA.skala, y: CHATA.y + 860 * CHATA.skala };
  for (let i = 0; i <= 10; i++) { const t = i / 10; brazowy(OGNISKO.x + (furtka.x - OGNISKO.x) * t, OGNISKO.y + (furtka.y - OGNISKO.y) * t, 60, 0.4); }
  // wilgotna, ciemna ziemia pod mgłą
  for (const k in MGLY) {
    const m = MGLY[k], gr = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 1.2);
    gr.addColorStop(0, 'rgba(20,24,26,0.55)'); gr.addColorStop(1, 'rgba(20,24,26,0)');
    g.fillStyle = gr; g.fillRect(m.x - m.r * 1.2, m.y - m.r * 1.2, m.r * 2.4, m.r * 2.4);
  }
  return c;
}

// Droga do chaty w połowie rozdzielczości świata: wydeptana ziemia z miękkimi brzegami, dwie koleiny, kamyki
// i kreski tuszem wzdłuż brzegów, jak w rysunkach z arkuszy (Patryk, 25 XI 13:12).
export const SKALA_DROGI = 1;   // 25 XI: płótno tylko wokół drogi (RAMKA_DROGI), więc stać nas na pełną rozdzielczość kafla
export function ramkaDrogi(D) {
  const x0 = Math.max(0, Math.min(...D.map(p => p.x)) - 120), y0 = Math.max(0, Math.min(...D.map(p => p.y)) - 120);
  const x1 = Math.min(SZER, Math.max(...D.map(p => p.x)) + 120), y1 = Math.min(WYS, Math.max(...D.map(p => p.y)) + 120);
  return { x: x0, y: y0, w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) };
}
export const RAMKA_DROGI = ramkaDrogi(DROGA_GLOWNA);
// lata: łata nawierzchni z rysunku ziemi Przemka (grafika/droga.webp, narzedzia/kafel-drogi.py). Kładziona wzdłuż drogi
// pod losowymi kątami, żeby się nie powtarzała jak kafel, i przycinana miękko do kształtu drogi. Bez niej: sama farba.
export function obrazDrogi(lata = null, kafel = null, DROGA = DROGA_GLOWNA, ziarno = 7) {
  const RAMKA_DROGI = ramkaDrogi(DROGA);
  const s = SKALA_DROGI, c = plotno(RAMKA_DROGI.w / s, RAMKA_DROGI.h / s), r = losowe(ziarno);
  let g = c.getContext('2d');
  g.scale(1 / s, 1 / s); g.translate(-RAMKA_DROGI.x, -RAMKA_DROGI.y);  g.lineCap = 'round'; g.lineJoin = 'round';
  const linia = (przes, szer, kolor) => {
    g.strokeStyle = kolor; g.lineWidth = szer; g.beginPath();
    DROGA.forEach((p, i) => {
      const q = DROGA[Math.min(DROGA.length - 1, i + 1)], o = DROGA[Math.max(0, i - 1)];
      const dx = q.x - o.x, dy = q.y - o.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      const x = p.x + nx * przes, y = p.y + ny * przes;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    });
    g.stroke();
  };
  g.filter = 'blur(20px)'; linia(0, DROGA_SZER * 1.5, 'rgba(70,58,44,0.45)');      // miękki pas wydeptanej ziemi
  if (kafel) {
    // Kafel drogi z Gemini (Patryk, 25 XI): koleiny biegną w nim pionowo, więc kładziemy go pasami wzdłuż drogi,
    // obróconymi w jej kierunku, a wysokość kafla odmierzamy długością przebytej drogi. Potem miękko przycinamy do kształtu.
    const glowne = g, w = plotno(RAMKA_DROGI.w / s, RAMKA_DROGI.h / s), maska = plotno(RAMKA_DROGI.w / s, RAMKA_DROGI.h / s);
    g = maska.getContext('2d'); g.scale(1 / s, 1 / s); g.translate(-RAMKA_DROGI.x, -RAMKA_DROGI.y);  g.lineCap = 'round'; g.lineJoin = 'round';
    g.filter = 'blur(10px)'; linia(0, DROGA_SZER * 1.08, '#fff'); g.filter = 'none';
    const gw = w.getContext('2d'); gw.scale(1 / s, 1 / s); gw.translate(-RAMKA_DROGI.x, -RAMKA_DROGI.y); 
    const szerK = DROGA_SZER * 1.35, k = szerK / kafel.width, wysK = kafel.height * k;
    let v = 0;
    for (let i = 0; i < DROGA.length - 1; i++) {
      const p = DROGA[i], q = DROGA[i + 1], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
      if (d < 0.01) continue;
      gw.save(); gw.translate(p.x, p.y); gw.rotate(Math.atan2(dy, dx) - Math.PI / 2);
      let zrobione = 0;
      while (zrobione < d + 1.5) {                                        // +1,5: zakładka, żeby na zakrętach nie było szpar
        const sy = ((v + zrobione) % wysK + wysK) % wysK, ile = Math.min(d + 1.5 - zrobione, wysK - sy);
        gw.drawImage(kafel, 0, sy / k, kafel.width, ile / k, -szerK / 2, zrobione, szerK, ile);
        zrobione += ile;
      }
      gw.restore(); v += d;
    }
    gw.setTransform(1, 0, 0, 1, 0, 0); gw.globalCompositeOperation = 'destination-in'; gw.drawImage(maska, 0, 0);
    g = glowne; g.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(w, 0, 0); g.restore();
  } else if (lata) {
    const glowne = g, w = plotno(RAMKA_DROGI.w / s, RAMKA_DROGI.h / s), maska = plotno(RAMKA_DROGI.w / s, RAMKA_DROGI.h / s);
    g = maska.getContext('2d'); g.scale(1 / s, 1 / s); g.translate(-RAMKA_DROGI.x, -RAMKA_DROGI.y);  g.lineCap = 'round'; g.lineJoin = 'round';
    g.filter = 'blur(12px)'; linia(0, DROGA_SZER * 1.12, '#fff'); g.filter = 'none';
    const gw = w.getContext('2d'); gw.scale(1 / s, 1 / s); gw.translate(-RAMKA_DROGI.x, -RAMKA_DROGI.y); 
    const sk = 0.36;
    for (let i = 0; i < DROGA.length; i += 3) {
      const p = DROGA[i];
      gw.save(); gw.translate(p.x + (r() - 0.5) * 20, p.y + (r() - 0.5) * 20); gw.rotate(r() * TAU);
      gw.scale(sk * (r() < 0.5 ? -1 : 1) * (0.9 + r() * 0.25), sk * (0.9 + r() * 0.25));
      gw.drawImage(lata, -lata.width / 2, -lata.height / 2); gw.restore();
    }
    gw.setTransform(1, 0, 0, 1, 0, 0); gw.globalCompositeOperation = 'destination-in'; gw.drawImage(maska, 0, 0);
    g = glowne; g.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(w, 0, 0); g.restore();
  } else { g.filter = 'blur(6px)'; linia(0, DROGA_SZER, 'rgba(104,86,64,0.62)'); }
  g.filter = 'none';
  if (!kafel) for (const strona of [-1, 1]) linia(strona * DROGA_SZER * 0.22, 7, lata ? 'rgba(30,24,20,0.28)' : 'rgba(38,30,24,0.42)');   // koleiny (kafel ma własne)
  // kreski tuszem przy brzegach i w poprzek, kamyki
  g.strokeStyle = 'rgba(18,14,12,0.55)'; g.lineWidth = 1.4;
  for (let i = 1; i < DROGA.length - 1; i++) {
    const p = DROGA[i], q = DROGA[i + 1], o = DROGA[i - 1], dx = q.x - o.x, dy = q.y - o.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    for (const strona of [-1, 1]) if (r() < 0.8) {
      const w = DROGA_SZER * (0.46 + r() * 0.12) * strona, x = p.x + nx * w, y = p.y + ny * w, dl = 6 + r() * 12;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx / d * dl + nx * strona * 3, y + dy / d * dl + ny * strona * 3); g.stroke();
    }
    if (!kafel && r() < 0.35) { const w = (r() - 0.5) * DROGA_SZER * 0.8, x = p.x + nx * w, y = p.y + ny * w, rr = 2 + r() * 4;
      g.fillStyle = 'rgba(120,112,100,0.8)'; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr, 0, 0, TAU); g.fill(); g.stroke(); }
  }
  return c;
}

// ---------- sosny i martwe drzewo ----------
export const DRZEWO_H = 270;              // wysokość wzorcowa; każde drzewo skaluje się do swojej wysokości
export function obrazDrzewa(wariant) {
  const h = DRZEWO_H, szer = h * 0.36 + 16, W = szer * 2, H = h + 40;
  const c = plotno(W * PX, H * PX), g = c.getContext('2d');
  g.scale(PX, PX); g.translate(szer, h + 14);     // podstawa pnia w (0,0)
  g.lineJoin = 'round'; g.strokeStyle = '#0b0a09'; g.lineWidth = 1.6;
  if (wariant === 3) {                              // martwe drzewo: szary pień i połamane gałęzie
    g.fillStyle = '#6f6860';
    g.beginPath(); g.moveTo(-7, 0); g.lineTo(-4, -h * 0.8); g.lineTo(0, -h * 0.86); g.lineTo(4, -h * 0.78); g.lineTo(7, 0); g.closePath(); g.fill(); g.stroke();
    const r = losowe(5);
    for (let i = 0; i < 9; i++) {
      const y = -h * (0.25 + i * 0.065), str = i % 2 ? 1 : -1, dl = (h * 0.28) * (1 - i * 0.07) * (0.6 + r() * 0.5);
      g.lineWidth = 4.5 - i * 0.35; g.strokeStyle = '#0b0a09';
      g.beginPath(); g.moveTo(0, y); g.lineTo(str * dl * 0.6, y - dl * 0.35); g.lineTo(str * dl, y - dl * 0.2 + r() * 10); g.stroke();
      g.lineWidth = Math.max(1, 2.6 - i * 0.25); g.strokeStyle = '#7d766d'; g.stroke();
    }
    return { canvas: c, ox: szer, oy: h + 14, w: W, h: H };
  }
  const zielen = ['#3c5a44', '#45603f', '#36533f'][wariant] || '#3c5a44';
  g.fillStyle = '#6b5442'; g.fillRect(-5, -28, 10, 28); g.strokeRect(-5, -28, 10, 28);
  const pietra = 5;
  for (let i = 0; i < pietra; i++) {
    const f = i / pietra, sz = (1 - f * 0.78) * (h * 0.34), dol = -18 - f * h * 0.78, gora = dol - h * 0.32;
    g.fillStyle = zielen; g.strokeStyle = '#0b0a09'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(0, gora); g.lineTo(sz, dol); g.lineTo(sz * 0.55, dol - 3); g.lineTo(sz * 0.3, dol - 6); g.lineTo(-sz * 0.3, dol - 6); g.lineTo(-sz * 0.55, dol - 3); g.lineTo(-sz, dol); g.closePath();
    g.fill(); g.stroke();
    g.strokeStyle = 'rgba(160,184,150,0.5)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-2, gora + 6); g.lineTo(-sz + 6, dol - 3); g.stroke();
    g.strokeStyle = 'rgba(10,14,10,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(3, gora + 10); g.lineTo(sz - 8, dol - 4); g.stroke();
  }
  return { canvas: c, ox: szer, oy: h + 14, w: W, h: H };
}

// ---------- ghul (kształt z pierwszej wersji gry, ciemniejszy, z pazurami i kręgosłupem) ----------
export const GHUL = { klatki: 12, w: 76, h: 52, ox: 38, oy: 44, oko: { x: 10.5, y: -28 } };
export function rysujGhula(c, t, sx, zamach, blysk, martwy) {
  const cialo = martwy ? '#3a312e' : (blysk ? '#f4eee6' : '#564c47');
  const konczyny = martwy ? '#2e2724' : (blysk ? '#f4eee6' : '#463d39');
  const ob = '#0a0807';
  c.lineCap = 'round'; c.lineJoin = 'round';
  const sw = Math.sin(t * 9) * 4, wy = zamach ? 6 * sx : 0;
  const konczynyDroga = () => { c.beginPath(); c.moveTo(-8 * sx, -24); c.lineTo(-12 * sx - sw, -8); c.lineTo(-10 * sx - sw, -1); c.moveTo(7 * sx, -24); c.lineTo(15 * sx + sw + wy, -10); c.lineTo(19 * sx + sw + wy * 1.4, -4); };
  c.strokeStyle = ob; c.lineWidth = 5.6; konczynyDroga(); c.stroke();
  c.strokeStyle = konczyny; c.lineWidth = 3.4; konczynyDroga(); c.stroke();
  // pazury
  if (!martwy) {
    const px = 19 * sx + sw + wy * 1.4;
    c.strokeStyle = blysk ? '#ffffff' : '#c9bfb0'; c.lineWidth = 1;
    c.beginPath(); for (let k = -1; k <= 1; k++) { c.moveTo(px, -4); c.lineTo(px + 4 * sx, -2 + k * 2); } c.stroke();
  }
  c.fillStyle = ob; c.beginPath(); c.ellipse(0, -15, 12.2, 15.2, sx * 0.25, 0, TAU); c.fill();
  c.fillStyle = cialo; c.beginPath(); c.ellipse(0, -15, 11, 14, sx * 0.25, 0, TAU); c.fill();
  if (!blysk) {
    c.strokeStyle = 'rgba(15,10,9,0.65)'; c.lineWidth = 1.1;              // żebra
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(1 * sx, -19 + i * 4, 7, 2.5, sx * 0.25, 0.3, Math.PI - 0.3); c.stroke(); }
    c.fillStyle = martwy ? '#2e2724' : '#7a6f68';                            // kręgosłup
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-8.5 * sx + i * 1.2 * sx, -25 + i * 5, 1.7, 0, TAU); c.fill(); }
  }
  // głowa wysunięta do przodu
  c.fillStyle = ob; c.beginPath(); c.ellipse(7 * sx, -27, 8.7, 7.7, 0, 0, TAU); c.fill();
  c.fillStyle = cialo; c.beginPath(); c.ellipse(7 * sx, -27, 7.5, 6.5, 0, 0, TAU); c.fill();
  if (!martwy) {
    c.fillStyle = '#2a0608'; c.beginPath(); c.ellipse(11 * sx, -23.5, 3.2, zamach ? 2.6 : 1.3, 0, 0, TAU); c.fill();   // paszcza
    if (zamach) { c.strokeStyle = '#e8e0cc'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo((9 + k * 1.6) * sx, -25.6); c.lineTo((9.4 + k * 1.6) * sx, -24); } c.stroke(); }
    c.fillStyle = zamach ? '#ff5a3a' : '#e0202a';
    c.beginPath(); c.arc(9 * sx, -28, 1.5, 0, TAU); c.arc(12 * sx, -27.5, 1.2, 0, TAU); c.fill();
  } else {
    c.fillStyle = 'rgba(110,10,16,0.85)'; c.beginPath(); c.ellipse(0, -10, 9, 4, 0.3, 0, TAU); c.fill();
  }
}

// ---------- kolos: przygarbiony olbrzym z garbem, z którego wyrastają kości ----------
export const KOLOS = { klatki: 8, w: 70, h: 76, ox: 35, oy: 71, oko: { x: 18.5, y: -38 } };
export function rysujKolosa(c, t, sx, zamach, blysk, martwy) {
  const skora = martwy ? '#433e38' : (blysk ? '#f4eee6' : '#6c665a');
  const ciemna = martwy ? '#34302b' : (blysk ? '#f4eee6' : '#4f4a41');
  const kosc = blysk ? '#ffffff' : '#ddd4c2';
  const ob = '#0a0807';
  c.lineJoin = 'round'; c.lineCap = 'round';
  const kr = Math.sin(t) * 3;
  const X = v => v * sx;
  const wielokat = (pts, kol, lw = 2.4) => { c.beginPath(); c.moveTo(X(pts[0]), pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(X(pts[i]), pts[i + 1]); c.closePath(); c.fillStyle = kol; c.strokeStyle = ob; c.lineWidth = lw; c.fill(); c.stroke(); };
  const elipsa = (x, y, rx, ry, kol) => { c.fillStyle = ob; c.beginPath(); c.ellipse(X(x), y, rx + 1.3, ry + 1.3, 0, 0, TAU); c.fill(); c.fillStyle = kol; c.beginPath(); c.ellipse(X(x), y, rx, ry, 0, 0, TAU); c.fill(); };
  const reka = (x1, y1, x2, y2, gr, kol) => { c.strokeStyle = ob; c.lineWidth = gr + 2.6; c.beginPath(); c.moveTo(X(x1), y1); c.lineTo(X(x2), y2); c.stroke(); c.strokeStyle = kol; c.lineWidth = gr; c.stroke(); };
  // nogi: krótkie i grube
  reka(-8, -18, -10 - kr, -2, 8, ciemna); reka(7, -18, 9 + kr, -2, 8, ciemna);
  elipsa(-10 - kr, -2, 5.5, 2.5, ciemna); elipsa(10 + kr, -2, 5.5, 2.5, ciemna);
  // tylna ręka
  if (zamach) { reka(-6, -42, -10, -66, 8, ciemna); elipsa(-10, -68, 6.5, 6, ciemna); }
  else { reka(-8, -40, -17 + kr, -12, 8, ciemna); elipsa(-17 + kr, -10, 6, 5.5, ciemna); }
  // tułów z garbem
  c.beginPath(); c.moveTo(X(-14), -16);
  c.quadraticCurveTo(X(-23), -34, X(-13), -48); c.quadraticCurveTo(X(-3), -57, X(8), -49);
  c.quadraticCurveTo(X(18), -41, X(16), -27); c.quadraticCurveTo(X(14), -15, X(3), -14); c.closePath();
  c.fillStyle = skora; c.strokeStyle = ob; c.lineWidth = 2.4; c.fill(); c.stroke();
  if (!blysk) {
    c.fillStyle = 'rgba(30,26,22,0.35)'; c.beginPath(); c.moveTo(X(-15), -18); c.lineTo(X(-19), -32); c.lineTo(X(-14), -44); c.lineTo(X(-8), -30); c.lineTo(X(-6), -15); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,112,98,0.6)'; c.beginPath(); c.ellipse(X(6), -28, 6, 8, 0, 0, TAU); c.fill();    // brzuch
    c.strokeStyle = 'rgba(70,20,20,0.75)'; c.lineWidth = 1;              // szwy po dawnych ranach
    c.beginPath(); c.moveTo(X(-3), -44); c.lineTo(X(7), -24);
    for (let k = 0; k < 5; k++) { const x = -2 + k * 2, y = -42 + k * 4; c.moveTo(X(x - 1.6), y - 1.6); c.lineTo(X(x + 1.6), y + 1.6); }
    c.stroke();
  }
  // kości z garbu
  for (let i = 0; i < 4; i++) {
    const bx = -13 + i * 5.5, by = -45 - Math.sin((i + 0.5) / 4 * Math.PI) * 6;
    c.beginPath(); c.moveTo(X(bx - 2.5), by + 4); c.lineTo(X(bx - 5), by - 9 - i * 1.5); c.lineTo(X(bx + 2.5), by + 3); c.closePath();
    c.fillStyle = kosc; c.strokeStyle = ob; c.lineWidth = 1.2; c.fill(); c.stroke();
  }
  // mała głowa nisko przed garbem
  elipsa(17, -37, 6.5, 5.8, skora);
  if (!martwy) {
    c.fillStyle = '#2a0608'; c.beginPath(); c.ellipse(X(20), -33, 3.2, zamach ? 2.4 : 1.1, 0, 0, TAU); c.fill();
    c.fillStyle = zamach ? '#ffc040' : '#e8a020'; c.beginPath(); c.arc(X(18.5), -38.5, 1.4, 0, TAU); c.arc(X(21), -37.8, 1.1, 0, TAU); c.fill();
  } else {
    c.fillStyle = 'rgba(110,10,16,0.85)'; c.beginPath(); c.ellipse(0, -24, 15, 6, 0.2, 0, TAU); c.fill();
  }
  // przednia ręka: wielka, wlecze się po ziemi albo wznosi do uderzenia
  if (zamach) { reka(9, -42, -2, -70, 10, skora); elipsa(-3, -73, 8.5, 8, skora); }
  else { reka(11, -40, 21 - kr, -9, 10, skora); elipsa(21 - kr, -6, 8.5, 7, skora); }
}

// Atlas: wszystkie klatki jednego wroga na jednym płótnie. Wiersze: kierunek × zamach × błysk.
export function atlasWroga(wzor, rysuj) {
  const s = PX, cw = Math.ceil(wzor.w * s), ch = Math.ceil(wzor.h * s);
  const c = plotno(cw * wzor.klatki, ch * 8), g = c.getContext('2d');
  for (let wiersz = 0; wiersz < 8; wiersz++) {
    const sx = wiersz & 1 ? -1 : 1, zamach = !!(wiersz & 2), blysk = !!(wiersz & 4);
    for (let k = 0; k < wzor.klatki; k++) {
      g.save(); g.beginPath(); g.rect(k * cw, wiersz * ch, cw, ch); g.clip();
      g.setTransform(s, 0, 0, s, k * cw + wzor.ox * s, wiersz * ch + wzor.oy * s);
      rysuj(g, (k + 0.5) / wzor.klatki * TAU / (wzor.klatki === 12 ? 9 : 1), sx, zamach, blysk, false);
      g.restore();
    }
  }
  return { canvas: c, cw, ch };
}

export function obrazMartwego(wzor, rysuj) {
  const s = PX, c = plotno(wzor.w * s, wzor.h * s), g = c.getContext('2d');
  g.setTransform(s, 0, 0, s, wzor.ox * s, wzor.oy * s);
  rysuj(g, 0, 1, false, false, true);
  return c;
}

// ---------- światło, mgła, krew ----------
export function kolo(rozmiar, stopnie) {
  const c = plotno(rozmiar, rozmiar), g = c.getContext('2d'), h = rozmiar / 2;
  const gr = g.createRadialGradient(h, h, 0, h, h, h);
  for (const [o, kol] of stopnie) gr.addColorStop(o, kol);
  g.fillStyle = gr; g.fillRect(0, 0, rozmiar, rozmiar);
  return c;
}

export function kropka(rozmiar, kolor) {
  const c = plotno(rozmiar, rozmiar), g = c.getContext('2d');
  g.fillStyle = kolor; g.beginPath(); g.arc(rozmiar / 2, rozmiar / 2, rozmiar / 2 - 1, 0, TAU); g.fill();
  return c;
}

export function cien() {
  const c = plotno(64, 26), g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 13, 4, 32, 13, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.setTransform(1, 0, 0, 13 / 32, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}

export function kreskowanie() {
  const c = plotno(8, 8), g = c.getContext('2d');
  g.strokeStyle = 'rgba(0,0,0,0.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 8); g.lineTo(8, 0); g.stroke();
  return c;
}

// Kłąb mgły: postrzępione pasma z szumu (kilka oktaw), wygaszone ku brzegom, płaskie jak mgła przy ziemi.
// Wcześniej było tu kilka miękkich kół, które razem dawały jasną, rozmytą plamę (Patryk, 24 XI: „strasznie żle wygląda”).
export function mgielka(wariant = 0) {
  const N = 256, M = 32, c = plotno(N, N), g = c.getContext('2d'), r = losowe(31 + wariant * 17);
  const siatka = Array.from({ length: (M + 1) * (M + 1) }, () => r());
  const szum = (x, y) => {                                   // gładki szum wartości na siatce M × M, zawinięty
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v = (i, j) => siatka[((j % M + M) % M) * (M + 1) + ((i % M + M) % M)];
    return (v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx) * (1 - sy) + (v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx) * sy;
  };
  const d = g.createImageData(N, N), p = d.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let f = 0, a = 0.55, q = 3 / N;
    for (let o = 0; o < 5; o++) { f += a * szum(x * q * 1.6, y * q); a *= 0.5; q *= 2; }   // pasma są szersze niż wyższe
    const dx = (x - N / 2) / (N / 2), dy = (y - N / 2) / (N / 2), brzeg = Math.max(0, 1 - Math.pow(dx * dx + dy * dy * 1.4, 0.8));
    const gest = Math.max(0, Math.min(1, (f - 0.38) * 2.2)) * brzeg * brzeg;
    const k = (y * N + x) * 4; p[k] = 205; p[k + 1] = 212; p[k + 2] = 222; p[k + 3] = Math.round(gest * 255);
  }
  g.putImageData(d, 0, 0);
  return c;
}

export function winieta(w, h) {
  const c = plotno(w, h), g = c.getContext('2d');
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.hypot(w, h) * 0.56);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  return c;
}

// Chata z Gemini rozjaśniona do światła dnia (obraz był nocny). Zrezygnujemy z tego, gdy Gemini da wersję dzienną.
export function chataWDzien(obraz) {
  const c = plotno(CHATA.obrazSzer, CHATA.obrazWys), g = c.getContext('2d');
  g.drawImage(obraz, 0, 0);
  try {
    const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      p[i] = Math.min(255, p[i] * 1.85 + 8); p[i + 1] = Math.min(255, p[i + 1] * 1.85 + 8); p[i + 2] = Math.min(255, p[i + 2] * 1.8 + 8);
    }
    g.putImageData(d, 0, 0);
  } catch (e) { /* obraz z innej domeny: zostaje nocny */ }
  return c;
}
