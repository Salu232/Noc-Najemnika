// Bot gra całą noc samą logiką (bez rysowania), żeby sprawdzić, czy da się dojść do świtu i ile ran dostaje.
// Uruchomienie: node testy/bot-noc.mjs dobry   (dobry: blokuje ghule i odskakuje przed kolosem; prosty: tylko tnie)
import { nowaGra, aktualizuj } from '../gra/walka.js';
const tryb = process.argv[2] || 'dobry';
const wyniki = [];
for (let proba = 0; proba < 5; proba++) {
  const gra = nowaGra(); let t = 0; const dt = 1 / 60; const zd = {};
  while (gra.faza !== 'koniec' && t < 900) {
    const b = gra.bohater; let naj = null, nd = 1e9;
    for (const e of gra.wrogowie) { if (e.stan === 'wynurza') continue; const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < nd) { nd = d; naj = e; } }
    const w = { ruchX: 0, ruchY: 0, kat: null, atak: false, atakKat: null, blok: false, unik: false };
    if (naj) {
      const dx = naj.x - b.x, dy = naj.y - b.y; w.kat = Math.atan2(dy, dx);
      const groza = gra.wrogowie.find(e => e.stan === 'zamach' && Math.hypot(e.x - b.x, e.y - b.y) < (e.typ.ciezki ? 170 : 90) && e.t > e.typ.zamach - 0.12);
      if (tryb === 'dobry' && groza && groza.typ.ciezki) { w.unik = true; w.ruchX = -dx / nd; w.ruchY = -dy / nd; }
      else if (tryb === 'dobry' && groza && b.sila > 20) { w.blok = true; w.kat = Math.atan2(groza.y - b.y, groza.x - b.x); }
      else if (nd > 85) { w.ruchX = dx / nd; w.ruchY = dy / nd; }
      else if (Math.random() < 0.3) w.atak = true;
    }
    aktualizuj(gra, dt, w); t += dt;
    for (const z of gra.zdarzenia) zd[z.typ] = (zd[z.typ] || 0) + 1; gra.zdarzenia.length = 0;
    if (gra.slady.length > 2000) gra.slady.length = 0;
  }
  wyniki.push({ faza: gra.faza, etap: gra.etap, czas: Math.round(t), ...gra.statystyki, czasGry: Math.round(gra.statystyki.czas), zd });
}
for (const w of wyniki) console.log(JSON.stringify(w));
