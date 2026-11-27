// Bot przechodzi całą noc samą logiką (bez rysowania) w obecnym kształcie gry: pomija zmierzch,
// zbiera łup po fali, sprzedaje go handlarzowi i kupuje (pas, wywar siły, napar, mikstury).
// Mierzy trudność i monety: ile ma przed każdą falą, ile wydał, ile razy padł, ile trwała walka z rycerzem.
// Uruchomienie: node testy/bot-noc2.mjs [ile_prob] [dobry|prosty] [polana|bagno] [limit_s]   (27 XI, po „dalej za proste” Patryka)
// Na bagnie idzie dookoła głębokiej wody (szuka drogi po siatce), bo prosto wpadałby na brzeg i stał.
const ile = Number(process.argv[2]) || 6, tryb = process.argv[3] || 'dobry', limit = Number(process.argv[5]) || 1500;
globalThis.MAPA_NOCY = process.argv[4] || 'polana';
const { nowaGra, aktualizuj, wybierzUlepszenie, zamknijKartke, sprzedaj, kupTowar, kupMiksture, mozeKupic, mozeKupicTowar } = await import('../gra/walka.js');
const { LUP } = await import('../gra/dane.js');
const { zderzenia, SZER, WYS } = await import('../gra/swiat.js');
const K = 24, GW = Math.ceil(SZER / K), GH = Math.ceil(WYS / K), wolne = new Uint8Array(GW * GH);
for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const p = { x: i * K, y: j * K }; zderzenia(p, 14); wolne[j * GW + i] = Math.hypot(p.x - i * K, p.y - j * K) < 2 ? 1 : 0; }
const komorka = (p) => Math.max(0, Math.min(GW - 1, Math.round(p.x / K))) + Math.max(0, Math.min(GH - 1, Math.round(p.y / K))) * GW;
function prosto(a, b) { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 12); for (let i = 1; i < n; i++) { const t = i / n; if (!wolne[komorka({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })]) return false; } return true; }
function nastepny(a, b) {                       // BFS od celu: zwraca punkt kilka kratek dalej na drodze bohatera
  const start = komorka(a), cel = komorka(b), skad = new Int32Array(GW * GH).fill(-1), q = [cel]; skad[cel] = cel;
  for (let h = 0; h < q.length && skad[start] < 0; h++) { const c = q[h], x = c % GW; for (const n of [c - 1, c + 1, c - GW, c + GW]) { if (n < 0 || n >= GW * GH || skad[n] >= 0 || (n === c - 1 && x === 0) || (n === c + 1 && x === GW - 1) || (!wolne[n] && n !== start)) continue; skad[n] = c; q.push(n); } }
  if (skad[start] < 0) return b;
  let c = start; for (let k = 0; k < 3 && c !== cel; k++) c = skad[c];
  return { x: (c % GW) * K, y: ((c / GW) | 0) * K };
}
const wyniki = [];
for (let proba = 0; proba < ile; proba++) {
  const gra = nowaGra(); const dt = 1 / 60; let t = 0, trzyma = false, zakupy = -1, bossOd = 0, ost = { x: 0, y: 0, t: 0 }, objazd = null;
  gra.faza = 'przerwa'; gra.fazaCzas = 3; gra.mroczek = 0.8;
  const w0 = { etapy: [], upadki: 0, rany: 0, bossCzas: 0, minZycie: 100, mikstury: 0, kupione: [] };
  while (gra.faza !== 'koniec' && gra.faza !== 'swit' && t < limit) {
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
      else if (nd > gra.bron.zasieg * 0.85) {
        const c = prosto(b, naj) ? naj : nastepny(b, naj), cx = c.x - b.x, cy = c.y - b.y, cd = Math.hypot(cx, cy) || 1;
        w.ruchX = cx / cd; w.ruchY = cy / cd;
        if (t - ost.t > 0.6) { if (Math.hypot(b.x - ost.x, b.y - ost.y) < 6 && b.stan === 'wolny') objazd = { kat: Math.atan2(cy, cx) + (Math.random() < 0.5 ? 1.6 : -1.6), do: t + 0.5 }; ost = { x: b.x, y: b.y, t }; }
        if (objazd && t < objazd.do) { w.ruchX = Math.cos(objazd.kat); w.ruchY = Math.sin(objazd.kat); }   // utknął na brzegu: krok w bok
      }
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
