// Bot gra całą noc samą logiką (bez rysowania), żeby sprawdzić, czy da się dojść do świtu i ile ran dostaje.
// Uruchomienie: node testy/bot-noc.mjs <dobry|prosty> <miecz|poltorareczny|wielki>
//   dobry: blokuje ghule, odskakuje przed kolosem i na kolosa ładuje mocny cios; prosty: tylko tnie.
import { nowaGra, aktualizuj } from '../gra/walka.js';
const tryb = process.argv[2] || 'dobry', bron = process.argv[3] || 'poltorareczny';
const wyniki = [];
for (let proba = 0; proba < 5; proba++) {
  const gra = nowaGra(bron); let t = 0, trzyma = false; const dt = 1 / 60; const zd = {};
  while (gra.faza !== 'koniec' && t < 900) {
    const b = gra.bohater; let naj = null, nd = 1e9;
    for (const e of gra.wrogowie) { if (e.stan === 'wynurza') continue; const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < nd) { nd = d; naj = e; } }
    const w = { ruchX: 0, ruchY: 0, kat: null, atakStart: false, atakTrzyma: false, atakKat: null, blok: false, unik: false };
    if (naj) {
      const dx = naj.x - b.x, dy = naj.y - b.y; w.kat = Math.atan2(dy, dx);
      const groza = gra.wrogowie.find(e => e.stan === 'zamach' && Math.hypot(e.x - b.x, e.y - b.y) < (e.typ.ciezki ? 170 : 90) && e.t > e.typ.zamach - 0.12);
      if (tryb === 'dobry' && groza && groza.typ.ciezki) { w.unik = true; w.ruchX = -dx / nd; w.ruchY = -dy / nd; trzyma = false; }
      else if (tryb === 'dobry' && groza && b.sila > 20 && !(b.stan === 'cios' && b.cios.faza === 'ciecie')) { w.blok = true; w.kat = Math.atan2(groza.y - b.y, groza.x - b.x); trzyma = false; }
      else if (nd > gra.bron.zasieg * 0.85) { w.ruchX = dx / nd; w.ruchY = dy / nd; }
      else {
        const naKolosa = tryb === 'dobry' && naj.typ.ciezki;
        if (b.stan === 'wolny' && Math.random() < 0.3) { w.atakStart = true; trzyma = naKolosa; }
        if (trzyma && b.stan === 'cios' && b.cios.faza === 'laduje' && b.cios.naladowanie >= 1) trzyma = false;
        w.atakTrzyma = trzyma;
      }
    }
    aktualizuj(gra, dt, w); t += dt;
    for (const z of gra.zdarzenia) zd[z.typ] = (zd[z.typ] || 0) + 1; gra.zdarzenia.length = 0;
    if (gra.slady.length > 2000) gra.slady.length = 0;
  }
  wyniki.push({ faza: gra.faza, etap: gra.etap, czasGry: Math.round(gra.statystyki.czas), zabici: gra.statystyki.zabici, upadki: gra.statystyki.upadki, rany: zd.rana || 0, zamachy: zd.zamach || 0, grzeznie: zd.grzeznie || 0, mocne: zd.naladowany || 0 });
}
const sr = k => (wyniki.reduce((a, w) => a + w[k], 0) / wyniki.length).toFixed(1);
console.log(`${tryb.padEnd(6)} ${bron.padEnd(13)} świt ${wyniki.filter(w => w.faza === 'koniec').length}/5  czas ${sr('czasGry')} s  rany ${sr('rany')}  upadki ${sr('upadki')}  cięcia ${sr('zamachy')}  grzęźnie ${sr('grzeznie')}  mocne ${sr('mocne')}`);
