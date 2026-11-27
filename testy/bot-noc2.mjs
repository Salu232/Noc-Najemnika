// Bot przechodzi całą noc samą logiką (bez rysowania) w obecnym kształcie gry: pomija zmierzch,
// zbiera łup po fali, sprzedaje go handlarzowi i kupuje (pas, wywar siły, napar, mikstury).
// Mierzy trudność i monety: ile ma przed każdą falą, ile wydał, ile razy padł, ile trwała walka z rycerzem.
// Uruchomienie: node testy/bot-noc2.mjs [ile_prob] [dobry|prosty]   (27 XI, po „dalej za proste” Patryka)
import { nowaGra, aktualizuj, wybierzUlepszenie, zamknijKartke, sprzedaj, kupTowar, kupMiksture, mozeKupic, mozeKupicTowar } from '../gra/walka.js';
import { LUP } from '../gra/dane.js';
const ile = Number(process.argv[2]) || 6, tryb = process.argv[3] || 'dobry';
const wyniki = [];
for (let proba = 0; proba < ile; proba++) {
  const gra = nowaGra(); const dt = 1 / 60; let t = 0, trzyma = false, zakupy = -1, bossOd = 0;
  gra.faza = 'przerwa'; gra.fazaCzas = 3; gra.mroczek = 0.8;
  const w0 = { etapy: [], upadki: 0, rany: 0, bossCzas: 0, minZycie: 100, mikstury: 0, kupione: [] };
  while (gra.faza !== 'koniec' && gra.faza !== 'swit' && t < 1500) {
    const b = gra.bohater;
    if (gra.faza === 'przerwa' && zakupy !== gra.etap) {           // cisza: łup do plecaka, potem handel
      zakupy = gra.etap;
      for (const l of gra.lup) { if (l.typ === 'mikstura') b.mikstury = Math.min(LUP.max + (gra.pas ? 1 : 0), b.mikstury + 1); else gra.plecak[l.typ] = (gra.plecak[l.typ] || 0) + 1; }
      gra.lup.length = 0;
      const przed = gra.grosze;
      if (gra.etap >= 1) {
        for (const id of Object.keys(gra.plecak)) while (sprzedaj(gra, id));
        const zarobek = gra.grosze - przed;
        for (const id of ['pas', 'sila', 'oddech']) if (mozeKupicTowar(gra, id) && kupTowar(gra, id)) w0.kupione.push(gra.etap + ':' + id);
        while (mozeKupic(gra) && kupMiksture(gra)) w0.kupione.push(gra.etap + ':mikstura');
        w0.etapy.push({ etap: gra.etap, monety: przed, zaLup: zarobek, zostalo: gra.grosze });
      }
    }
    let naj = null, nd = 1e9;
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
    if (gra.wybor) wybierzUlepszenie(gra, gra.wybor[(Math.random() * gra.wybor.length) | 0]);
    if (gra.czytana !== null) zamknijKartke(gra);
    w.mikstura = b.zycie < 35 && b.mikstury > 0;
    if (w.mikstura) w0.mikstury++;
    if (gra.faza === 'walka') w0.minZycie = Math.min(w0.minZycie, b.zycie);
    const boss = gra.wrogowie.find(e => e.typ.boss);
    if (boss && !bossOd) bossOd = t;
    aktualizuj(gra, dt, w); t += dt;
    for (const z of gra.zdarzenia) { if (z.typ === 'rana') w0.rany++; if (z.typ === 'bossPadl') w0.bossCzas = Math.round(t - bossOd); } gra.zdarzenia.length = 0;
    if (gra.slady.length > 2000) gra.slady.length = 0;
  }
  w0.upadki = gra.statystyki.upadki; w0.koniec = gra.faza; w0.etap = gra.etap; w0.czas = Math.round(t);
  wyniki.push(w0);
  console.log(`próba ${proba + 1}: ${w0.koniec} etap ${w0.etap}, upadki ${w0.upadki}, rany ${w0.rany}, mikstury wypite ${w0.mikstury}, rycerz ${w0.bossCzas || '-'} s, czas ${w0.czas} s`);
  for (const e of w0.etapy) console.log(`   przed falą ${e.etap + 1}: ${e.monety} monet + ${e.zaLup} za łup, zostało ${e.zostalo}`);
  console.log('   kupione', w0.kupione.join(' '));
}
