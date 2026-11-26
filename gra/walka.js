// Logika walki: bohater, wrogowie, etapy nocy. Nic tu nie rysuje — rysowanie jest w rysowanie.js.
import { BOHATER, BRONIE, DOMYSLNA_BRON, MOCNY, KLATWA, WROGOWIE, ETAPY, NOC, CHATA_ODPOCZYNEK, TOTEM, LUP, OGIEN, ULEPSZENIA, KARTKI, KARTKA, PRZEMIANA, WSTEP, PRZEDMIOTY, STOL } from './dane.js';
import { START, CHATA, OGNISKO, TOTEMY, STOS_DREWNA, MIEJSCA, DROGA, wIzbie, zderzenia, punktWMgle } from './swiat.js';

const TAU = Math.PI * 2;
const rozn = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const losuj = (a, b) => a + Math.random() * (b - a);
// Ruch w górę i w dół ekranu idzie w głąb polany, a ziemia jest spłaszczona (PERSP 0,62 w rysowanie.js), więc ten sam krok
// wyglądał na szybszy niż w bok (Patryk, 25 XI 22:24). Pion chodu bohatera i potworów razy 0,8 (nie 0,62: byłoby ociężale).
const PION = 0.8;

export function nowaGra(bron = DOMYSLNA_BRON) {
  const gra = {
    bronKlucz: BRONIE[bron] ? bron : DOMYSLNA_BRON, bron: BRONIE[BRONIE[bron] ? bron : DOMYSLNA_BRON],
    czas: 0, zatrzymanie: 0, wstrzas: 0, mroczek: WSTEP.zmierzch,
    bohater: null, wrogowie: [], pociski: [], krew: [], iskry: [], slady: [], zdarzenia: [],
    etap: 0, faza: 'wstep', fazaCzas: NOC.przerwa, walkaCzas: 0, kolejka: [],
    odkryte: [], odkryj: null,                                           // wstęp: obejrzane miejsca (swiat.js, MIEJSCA)
    mysl: { tekst: '', czas: 0 },
    drzwi: { otwarte: false, o: 0 },   // drzwi chaty: czy otwarte i jak daleko obrócone (0 zamknięte, 1 otwarte)
    statystyki: { zabici: 0, upadki: 0, parowania: 0, czas: 0, totemy: 0 },
    // cele nocy (24 XI 18:41): totemy do rozbicia, łup, gasnące ognisko, ulepszenia między falami
    totemy: TOTEMY.map((t, i) => ({ i, mgla: t.mgla, x: t.x, y: t.y, promien: t.promien, zycie: TOTEM.zycie, flash: 0, zniszczony: false })),
    lup: [], ogien: 1, ogienPrzygasl: false, wybor: null, ulepszenia: [],
    plecak: {},                                                               // nowa gra: pusty plecak (Patryk, 26 XI: bez zapisów, dopóki gra nie urośnie)
    kartka: null, czytana: null, kartki: 0, przemiana: 0,   // dziennik rycerza i cena klątwy (25 XI)
    mod: { zasieg: 1, szybkosc: 1, garda: 1, oddech: 1, klatwa: 1, cialo: 1 },
  };
  gra.trwale = {};
  zapiszPlecak(gra);                                                          // zdejmuje stare zapisy plecaka z przeglądarki
  zastosujTrwale(gra);
  zastosujBron(gra);
  postawBohatera(gra);
  // chata wygląda na zamieszkałą, ale nikogo w niej nie ma; pierwsza kartka leży w izbie (Patryk, 25 XI 20:35)
  const k0 = KARTKI[0].gdzie, p0 = { x: k0.x, y: k0.y }; zderzenia(p0, 18); gra.kartka = { nr: 0, x: p0.x, y: p0.y };
  // wstęp: bohater przychodzi drogą z południa o zmierzchu
  // (Patryk, 26 XI 12:27: „jeszcze dalej od chaty”): na drodze przy skraju lasu, chata daleko przed nim
  const p = DROGA[Math.round(DROGA.length * 0.2)], q = DROGA[Math.round(DROGA.length * 0.2) + 3];
  gra.bohater.x = p.x; gra.bohater.y = p.y; gra.bohater.kat = Math.atan2(q.y - p.y, q.x - p.x);
  gra.podpowiedzZa = WSTEP.pierwszaPodpowiedz;
  powiedz(gra, WSTEP.przyjscie, 5);
  return gra;
}

function postawBohatera(gra) {
  gra.bohater = {
    x: START.x, y: START.y, promien: BOHATER.promien,
    zycie: BOHATER.zycie, smuga: 0, smugaCzas: 0,
    sila: BOHATER.sila, odnowaZa: 0,
    kat: -Math.PI / 2, stan: 'wolny', t: 0, trwanie: 0,
    cios: null, strona: 1, rozped: 0, seriaCzas: 0, kolejkaAtaku: false,
    blok: false, blokOd: -9, nietykalny: 0, unikKat: 0,
    odrzutX: 0, odrzutY: 0, chod: 0, idzie: false, flash: 0,
    klatwa: KLATWA.start, klatwaUderzyla: false,
    wChacie: false, spi: false,     // w izbie chaty (cisza stoi, leczy się); śpi na posłaniu: niewidoczny, nietykalny
    mikstury: gra.bohater ? gra.bohater.mikstury : Math.min(LUP.max, LUP.start + ((gra.trwale && gra.trwale.helm) || 0)), drewno: false,
  };
}

// Do 26 XI plecak i ulepszenia ze stołu zostawały między grami. Teraz trwają jedną grę; zapis postaci przyjdzie, gdy gra urośnie.
export function zapiszPlecak() { try { localStorage.removeItem('noc-plecak'); localStorage.removeItem('noc-trwale'); } catch (e) { /* bez pamięci */ } }

// Stół w izbie: trwałe ulepszenia z łupów (dane.js, STOL)
function efektStolu(gra, id) {
  const m = gra.mod;
  if (id === 'klinga') m.szybkosc *= 0.93;
  else if (id === 'talizman') m.cialo *= 0.9;
  else if (id === 'wywar') m.klatwa *= 1.25;
}
function zastosujTrwale(gra) { for (const r of STOL) for (let i = 0; i < (gra.trwale[r.id] || 0); i++) efektStolu(gra, r.id); }
export function kosztStolu(gra, r) { const poz = (gra.trwale[r.id] || 0) + 1, k = {}; for (const id in r.koszt) k[id] = r.koszt[id] * poz; return k; }
export function mozeZrobic(gra, r) {
  if ((gra.trwale[r.id] || 0) >= r.max) return false;
  const k = kosztStolu(gra, r); for (const id in k) if ((gra.plecak[id] || 0) < k[id]) return false; return true;
}
export function zrobNaStole(gra, id) {
  const r = STOL.find(x => x.id === id); if (!r || !mozeZrobic(gra, r)) return false;
  const k = kosztStolu(gra, r); for (const p in k) gra.plecak[p] -= k[p];
  gra.trwale[id] = (gra.trwale[id] || 0) + 1; efektStolu(gra, id); zastosujBron(gra);
  if (id === 'helm') gra.bohater.mikstury = Math.min(LUP.max, gra.bohater.mikstury + 1);
  gra.zdarzenia.push({ typ: 'ulepszenie', id }); return true;
}

export function powiedz(gra, tekst, czas = 3.5) { gra.mysl.tekst = tekst; gra.mysl.czas = czas; }

// Zmiana miecza w trakcie gry (z menu pauzy): działa od następnego ciosu.
export function ustawBron(gra, klucz) {
  if (!BRONIE[klucz]) return;
  gra.bronKlucz = klucz; zastosujBron(gra);
  const b = gra.bohater; if (b.stan === 'cios') { b.stan = 'wolny'; b.cios = null; }
}

// Miecz z ulepszeniami: kopia danych broni, żeby ulepszenia nie zmieniały wspólnych liczb.
function zastosujBron(gra) {
  const m = gra.mod, z = BRONIE[gra.bronKlucz];
  gra.bron = { ...z, zasieg: z.zasieg * m.zasieg, zamach: z.zamach * m.szybkosc, powrot: z.powrot * m.szybkosc };
}

// Wybór ulepszenia po fali: gra stoi, dopóki gracz nie wybierze (HUD pokazuje trzy karty).
export function wybierzUlepszenie(gra, id) {
  if (!gra.wybor || !gra.wybor.includes(id)) return;
  const m = gra.mod, b = gra.bohater;
  if (id === 'zasieg') m.zasieg *= 1.125;
  else if (id === 'szybkosc') m.szybkosc *= 0.85;
  else if (id === 'garda') m.garda *= 0.7;
  else if (id === 'oddech') m.oddech *= 1.35;
  else if (id === 'klatwa') m.klatwa *= 1.5;
  else if (id === 'cialo') m.cialo *= 0.8;
  else if (id === 'mikstura') { b.zycie = BOHATER.zycie; b.smuga = 0; b.mikstury = Math.min(LUP.max, b.mikstury + 1); }
  zastosujBron(gra);
  gra.ulepszenia.push(id); gra.wybor = null;
  gra.zdarzenia.push({ typ: 'ulepszenie', id });
}

// ---------- jedna klatka ----------
export function zamknijKartke(gra) { gra.czytana = null; }

export function aktualizuj(gra, dt, w) {
  // kartka podniesiona w walce czeka na ciszę po fali (Patryk, 26 XI 13:27: trzy kartki w minutę przerywały walkę)
  if (gra.kartkaCzeka != null && gra.faza !== 'walka' && !gra.wybor && gra.czytana === null) { gra.czytana = gra.kartkaCzeka; gra.kartkaCzeka = null; }
  if (gra.wybor || gra.czytana !== null || gra.stol) return;      // wybór ulepszenia, kartka albo stół: noc czeka
  if (gra.zatrzymanie > 0) { gra.zatrzymanie -= dt; return; }   // krótkie zatrzymanie po trafieniu: czuć ciężar ciosu
  gra.czas += dt;
  if (gra.faza !== 'koniec') gra.statystyki.czas += dt;
  gra.wstrzas = Math.max(0, gra.wstrzas - dt * 30);
  if (gra.mysl.czas > 0) gra.mysl.czas -= dt;

  if (gra.faza === 'wstep') odkrywanie(gra, w, dt);
  aktualizujBohatera(gra, dt, w);
  if (gra.odkryj && gra.bohater.stan === 'wolny' && !gra.bohater.spi) gra.akcja = 'obejrzyj';
  {                                                                     // stół w izbie: poza walką
    const b = gra.bohater;
    if (!gra.akcja && b.wChacie && b.stan === 'wolny' && !b.spi && gra.faza !== 'walka' && Math.hypot(b.x - CHATA.stol.x, b.y - CHATA.stol.y) < CHATA.stol.r + b.promien) {
      gra.akcja = 'stol'; if (w.akcja) { w.akcja = false; gra.stol = true; }
    }
  }
  aktualizujCele(gra, dt, w);
  aktualizujWrogow(gra, dt);
  aktualizujPociski(gra, dt);
  aktualizujKrew(gra, dt);
  aktualizujEtapy(gra, dt);
}

// ---------- bohater ----------
function najblizszyWrog(gra, zasieg) {
  const b = gra.bohater; let naj = null, nd = zasieg;
  for (const e of gra.wrogowie) {
    if (e.stan === 'wynurza' || e.stan === 'martwy') continue;
    const d = Math.hypot(e.x - b.x, e.y - b.y) - e.promien;
    if (d < nd) { nd = d; naj = e; }
  }
  return naj;
}

// Kierunek cięcia: palec przeciągnięty po ekranie, potem mysz, a gdy nic nie celuje, najbliższy wróg albo kierunek patrzenia.
function celKat(gra, w) {
  const b = gra.bohater;
  if (w.atakKat != null) return w.atakKat;
  if (w.kat != null) return w.kat;
  const e = najblizszyWrog(gra, gra.bron.zasieg + 70);
  if (e) return Math.atan2(e.y - b.y, e.x - b.x);
  return b.kat;
}

function ustawLuk(gra, c) {
  const luk = gra.bron.luk + (c.mocny ? MOCNY.luk : 0);
  c.od = c.kat - c.kier * luk; c.do = c.kat + c.kier * luk; c.aktualny = c.od;
}

function aktualizujBohatera(gra, dt, w) {
  const b = gra.bohater, bron = gra.bron;
  gra.akcja = null;
  if (b.stan === 'upadl') return;
  if (wChacie(gra, dt, w)) return;
  b.flash = Math.max(0, b.flash - dt);
  b.nietykalny = Math.max(0, b.nietykalny - dt);

  // kierunek patrzenia: myszka, a bez niej ruch
  let rx = w.ruchX, ry = w.ruchY; const rl = Math.hypot(rx, ry);
  if (rl > 1) { rx /= rl; ry /= rl; }
  if (b.stan !== 'cios') {
    if (w.kat != null) b.kat = w.kat;
    else if (rl > 0.2) b.kat = Math.atan2(ry, rx);
  }

  // blok przerywa branie zamachu i ładowanie, ale nie samo cięcie ani powrót miecza
  if (w.blok && b.stan === 'cios' && (b.cios.faza === 'zamach' || b.cios.faza === 'laduje')) { b.stan = 'wolny'; b.cios = null; b.kolejkaAtaku = false; }
  const chceBlok = w.blok && b.stan === 'wolny';
  if (chceBlok && !b.blok) b.blokOd = gra.czas;
  b.blok = chceBlok;
  if (b.blok && w.kat == null) {                 // bez myszki blok sam obraca się do najgroźniejszego wroga w pobliżu
    let cel = null, ocena = Infinity;
    for (const e of gra.wrogowie) {
      if (e.zycie <= 0 || e.stan === 'martwy') continue;
      const d = Math.hypot(e.x - b.x, e.y - b.y); if (d > BOHATER.blok.zasiegObrotu) continue;
      const o = d - (e.stan === 'zamach' || e.stan === 'skok' ? 150 : 0);
      if (o < ocena) { ocena = o; cel = e; }
    }
    if (cel) { const r = rozn(Math.atan2(cel.y - b.y, cel.x - b.x), b.kat), k = Math.min(Math.abs(r), BOHATER.blok.obrot * dt); b.kat += Math.sign(r) * k; }
  }

  if (w.atakStart) b.kolejkaAtaku = true;
  const mozeUnik = w.unik && b.sila >= BOHATER.unik.koszt * 0.5;

  // klątwa: z wolnego stanu albo w trakcie brania zamachu, gdy pasek jest pełny
  if (w.klatwa && b.klatwa >= 1 && (b.stan === 'wolny' || (b.stan === 'cios' && (b.cios.faza === 'zamach' || b.cios.faza === 'laduje')))) zacznijKlatwe(gra);

  if (b.stan === 'wolny') {
    if (mozeUnik) zacznijUnik(gra, rx, ry, rl);
    else if (b.kolejkaAtaku && !b.blok) zacznijCios(gra, w);
  } else if (b.stan === 'cios') {
    const c = b.cios;
    c.t += dt;
    if (c.faza === 'zamach' || c.faza === 'laduje') {
      // dopóki miecz się nie rusza, można jeszcze wycelować
      c.kat = celKat(gra, w); b.kat = c.kat; ustawLuk(gra, c);
      if (mozeUnik) { zacznijUnik(gra, rx, ry, rl); }
      else if (c.faza === 'zamach' && c.t >= c.czasZamachu) {
        if (w.atakTrzyma) { c.faza = 'laduje'; c.t = 0; }
        else zacznijCiecie(gra, false);
      } else if (c.faza === 'laduje') {
        c.naladowanie = Math.min(1, c.t / bron.ladowanie);
        if (c.naladowanie >= 1 && !c.pelny) { c.pelny = true; gra.zdarzenia.push({ typ: 'naladowany' }); }
        if (!w.atakTrzyma) zacznijCiecie(gra, c.naladowanie >= 1);
      }
    } else if (c.faza === 'ciecie') {
      tnij(gra, dt);
      if (c.utknal || c.t >= c.czasCiecia) {
        c.faza = 'powrot'; c.t = 0;
        if (c.trafienia >= 3) gra.zdarzenia.push({ typ: 'przeciete', ile: c.trafienia });
      }
    } else if (c.faza === 'powrot') {
      const koniec = c.czasPowrotu + (c.utknal ? BOHATER.miecz.grzeznie : 0);
      if (mozeUnik && !c.utknal) zacznijUnik(gra, rx, ry, rl);           // unik przerywa powrót miecza
      else if (c.t >= koniec) {
        b.stan = 'wolny'; b.cios = null; b.seriaCzas = BOHATER.oknoSerii;
        if (b.kolejkaAtaku && !w.blok) zacznijCios(gra, w, true);
      }
    }
  } else if (b.stan === 'unik') {
    b.t += dt;
    // Prędkość idzie za fazą przewrotu (Patryk, 25 XI 15:22: „wygląda jak kucanie i przyspieszenie i jeździ po mapie”):
    // w przysiadzie prawie stoi, najszybciej toczy się zwinięty w kulę (około 0,43 czasu), przy wstawaniu już stoi w miejscu.
    const cfg = { czas: b.unikCzas || BOHATER.unik.czas, dystans: b.unikDystans || BOHATER.unik.dystans }, p = Math.min(1, b.t / cfg.czas);
    const v = cfg.dystans / cfg.czas / 0.7036 * (0.3 * (1 - p) + Math.sin(Math.PI * Math.min(1, p * 1.15)));
    b.x += Math.cos(b.unikKat) * v * dt; b.y += Math.sin(b.unikKat) * v * dt;
    if (b.t >= cfg.czas) { b.stan = 'wolny'; if (b.kolejkaAtaku) zacznijCios(gra, w); }
  } else if (b.stan === 'zachwiany') {
    b.t += dt; if (b.t >= b.trwanie) b.stan = 'wolny';
  } else if (b.stan === 'klatwa') {
    b.t += dt;
    if (!b.klatwaUderzyla && b.t >= KLATWA.ladowanie) uderzKlatwa(gra);
    if (b.t >= KLATWA.ladowanie + KLATWA.uderzenie + KLATWA.wstawanie) { b.stan = 'wolny'; b.kolejkaAtaku = false; }
  }

  // ruch: z ciężkim mieczem w ręku idzie się wolniej
  let v = 0;
  if (b.stan === 'wolny') v = BOHATER.szybkosc * (b.blok ? BOHATER.blok.spowolnienie : 1);
  // W bloku nie sunie po mapie (Patryk, 24 XI 19:09: „jak blokuje to jeździ po mapie”), tylko drobi krótkie kroki w gardzie:
  // prędkość idzie falą, krok i chwila postoju. Rysowanie dokłada do tego lekkie ugięcie kolan.
  if (b.stan === 'wolny' && b.blok && rl > 0.05) { b.krokGardy = (b.krokGardy || 0) + dt * TAU * BOHATER.blok.krokiNaSekunde; v *= 1 - (gra.bronKlucz === 'wielki' ? 1 : 0.6) * Math.cos(b.krokGardy); }   // krok i postój pod filmy cofania; zwykły miecz łagodniej (Patryk, 25 XI 15:34: „przeskakuje”)
  else if (b.stan === 'cios') v = BOHATER.szybkosc * (b.cios.faza === 'laduje' ? MOCNY.ruchLadowania : bron.ruch);
  if (v > 0 && rl > 0.05) { b.x += rx * v * dt; b.y += ry * v * dt * PION; b.idzie = true; b.chod += dt * 9 * Math.min(1, rl) * (v / BOHATER.szybkosc + 0.3); }
  else b.idzie = false;
  b.x += b.odrzutX * dt; b.y += b.odrzutY * dt;
  b.odrzutX *= Math.max(0, 1 - dt * 8); b.odrzutY *= Math.max(0, 1 - dt * 8);
  zderzenia(b, b.promien);

  // wytrzymałość i „Krew za krew”
  if (b.odnowaZa > 0) b.odnowaZa -= dt;
  else b.sila = Math.min(BOHATER.sila, b.sila + BOHATER.odnowaSily * gra.mod.oddech * dt * (b.blok ? BOHATER.blok.odnowa : 1));
  if (b.smugaCzas > 0) b.smugaCzas -= dt; else b.smuga = Math.max(0, b.smuga - 60 * dt);
  if (b.seriaCzas > 0) { b.seriaCzas -= dt; if (b.seriaCzas <= 0) b.rozped = 0; }
}

// Klątwa: najpierw unosi rękę (można go wtedy obejść, ale nie zranić), potem uderza w ziemię.
function zacznijKlatwe(gra) {
  const b = gra.bohater;
  b.stan = 'klatwa'; b.t = 0; b.cios = null; b.blok = false; b.kolejkaAtaku = false; b.rozped = 0;
  b.klatwa = 0; b.klatwaUderzyla = false;
  gra.przemiana = Math.min(1, gra.przemiana + PRZEMIANA.zaKlatwe);   // cena klątwy
  b.nietykalny = KLATWA.ladowanie + KLATWA.uderzenie + KLATWA.wstawanie;
  gra.zdarzenia.push({ typ: 'klatwa_laduje' });
}

function uderzKlatwa(gra) {
  const b = gra.bohater; b.klatwaUderzyla = true;
  let ile = 0;
  for (const e of gra.wrogowie) {
    if (e.stan === 'wynurza' || e.stan === 'martwy') continue;
    const dx = e.x - b.x, dy = e.y - b.y, d = Math.hypot(dx, dy) - e.promien;
    if (d > KLATWA.zasieg) continue;
    const kat = Math.atan2(dy, dx), blisko = 1 - Math.max(0, d) / KLATWA.zasieg;
    zranWroga(gra, e, KLATWA.obrazenia, kat, KLATWA.odrzut * (0.5 + 0.5 * blisko), true, false, true);
    if (e.zycie > 0) { e.stan = 'ogluszony'; e.t = 0; }                      // kto przeżył, chwieje się i dostaje podwójnie
    ile++;
  }
  for (const t of gra.totemy) if (!t.zniszczony && Math.hypot(t.x - b.x, t.y - b.y) - t.promien < KLATWA.zasieg) zranTotem(gra, t, TOTEM.zaKlatwe);
  gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.12); gra.wstrzas = Math.max(gra.wstrzas, 16);
  gra.zdarzenia.push({ typ: 'klatwa', x: b.x, y: b.y, zasieg: KLATWA.zasieg, ile });
}

// Chata jak w Tibii (Patryk, 24 XI; docs/chata.md): wchodzi się drzwiami na tej samej mapie, dach znika (rysowanie.js).
// W izbie cisza stoi i rany się goją; przy posłaniu można zasnąć. W walce drzwi są zamknięte.
// Zwraca true, gdy bohater śpi (wtedy nic więcej się z nim nie dzieje).
function wChacie(gra, dt, w) {
  const b = gra.bohater, O = CHATA_ODPOCZYNEK;
  // drzwi: E otwiera i zamyka (Patryk, 24 XI 13:51: „trzeba dodać otwieranie drzwi”); przejść można, gdy są prawie otwarte
  const D = gra.drzwi;
  if (gra.faza === 'walka' && D.otwarte) { D.otwarte = false; gra.zdarzenia.push({ typ: 'drzwi', otwarte: false }); }   // w walce trzaskają
  D.o = Math.max(0, Math.min(1, D.o + (D.otwarte ? 1 : -1) * dt / 0.45));
  CHATA.drzwiOtwarte = D.o > 0.7;
  const przyDrzwiach = b.stan === 'wolny' && Math.abs(b.x - CHATA.drzwi.x) < 45 && Math.abs(b.y - CHATA.prog.y) < O.zasiegDrzwi;
  const wPrzejsciu = Math.abs(b.x - CHATA.drzwi.x) < 40 && b.y > CHATA.przejscie.y0 - 8 && b.y < CHATA.przejscie.y1 + 8;
  if (przyDrzwiach && !b.spi) {
    if (gra.faza === 'walka') gra.akcja = 'wejdz';                                       // HUD: „Nie teraz”
    else if (!D.otwarte) gra.akcja = 'otworz';
    else if (!wPrzejsciu) gra.akcja = 'zamknij';
    if (w.akcja && (gra.akcja === 'otworz' || gra.akcja === 'zamknij')) {
      D.otwarte = gra.akcja === 'otworz'; w.akcja = false; gra.zdarzenia.push({ typ: 'drzwi', otwarte: D.otwarte });
    }
  }
  const wSrodku = wIzbie(b);
  if (wSrodku !== b.wChacie) {
    b.wChacie = wSrodku;
    if (wSrodku) { gra.zdarzenia.push({ typ: 'chata_wejscie' }); powiedz(gra, 'Ciepło. Chwila spokoju.', 2.5); }
    else {
      b.spi = false; gra.zdarzenia.push({ typ: 'chata_wyjscie' });
      if (gra.faza === 'przerwa') gra.fazaCzas = Math.max(gra.fazaCzas, O.ciszaPoWyjsciu);   // etap rusza dopiero po wyjściu
    }
  }
  if (!b.wChacie) return false;
  b.zycie = Math.min(BOHATER.zycie, b.zycie + (b.spi ? O.leczenieSen : O.leczenie) * dt);
  if (b.spi) {                                                             // śpi: ruch albo czynność budzi
    b.idzie = false; b.blok = false; b.sila = BOHATER.sila; gra.akcja = 'wstan';
    if (w.akcja || (Math.hypot(w.ruchX, w.ruchY) > 0.3 && gra.czas - b.spiOd > 0.8)) { b.spi = false; powiedz(gra, 'Wstajesz.', 1.2); }
    return b.spi;
  }
  if (b.stan === 'wolny' && !gra.akcja && Math.hypot(b.x - CHATA.poslanie.x, b.y - CHATA.poslanie.y) < CHATA.poslanie.r) {
    gra.akcja = 'odpocznij';
    if (w.akcja) { b.spi = true; b.spiOd = gra.czas; b.idzie = false; b.blok = false; powiedz(gra, 'Śpisz pod wilczą skórą. Rany się zasklepiają.', 3); return true; }
  }
  return false;
}

function zuzyjSile(b, ile) { b.sila = Math.max(0, b.sila - ile); b.odnowaZa = BOHATER.opoznienieOdnowy; }

function zacznijUnik(gra, rx, ry, rl) {
  const b = gra.bohater;
  b.stan = 'unik'; b.t = 0; b.cios = null; b.blok = false;
  b.unikKat = rl > 0.2 ? Math.atan2(ry, rx) : b.kat + Math.PI;     // bez kierunku: odskok do tyłu
  const u = BOHATER.unik, pion = Math.abs(Math.sin(b.unikKat)) > 0.7;   // w górę i w dół pełny przewrót przez głowę: wolniej i krócej
  b.unikCzas = pion ? u.czasPion : u.czas; b.unikDystans = pion ? u.dystansPion : u.dystans;
  b.nietykalny = pion ? u.nietykalnyPion : u.nietykalny;
  b.kolejkaAtaku = false; b.rozped = 0;
  zuzyjSile(b, BOHATER.unik.koszt);
}

// Branie zamachu. Cios zadany zaraz po poprzednim ma rozpęd i idzie w drugą stronę.
function zacznijCios(gra, w, zaraz = false) {
  const b = gra.bohater, bron = gra.bron;
  b.kolejkaAtaku = false;
  if (b.sila < bron.koszt * 0.4) return;                            // brak sił: bohater nie podniesie miecza
  const seria = zaraz || b.seriaCzas > 0;
  b.rozped = seria ? Math.min(BOHATER.rozped.max, b.rozped + 1) : 0;
  b.strona = seria ? -b.strona : 1;
  b.seriaCzas = 0;
  const kat = celKat(gra, w);
  b.kat = kat;
  const c = {
    faza: 'zamach', t: 0, kat, kier: b.strona, mocny: false, naladowanie: 0, pelny: false,
    utknal: false, trafieni: new Set(), trafienia: 0, wTejKlatce: 0,
    czasZamachu: bron.zamach * (1 - BOHATER.rozped.skrocenie * b.rozped), czasCiecia: bron.ciecie, czasPowrotu: bron.powrot,
  };
  ustawLuk(gra, c);
  b.stan = 'cios'; b.cios = c;
  zuzyjSile(b, bron.koszt);
}

// Miecz rusza: od tej chwili kierunek jest ustalony.
function zacznijCiecie(gra, mocny) {
  const b = gra.bohater, c = b.cios, bron = gra.bron;
  c.faza = 'ciecie'; c.t = 0; c.mocny = mocny;
  if (mocny) { zuzyjSile(b, bron.koszt * MOCNY.koszt); c.czasCiecia = bron.ciecie * MOCNY.ciecie; b.rozped = 0; }
  ustawLuk(gra, c);
  b.odrzutX += Math.cos(c.kat) * bron.krok * 5; b.odrzutY += Math.sin(c.kat) * bron.krok * 5;   // krok za ciosem
  gra.zdarzenia.push({ typ: 'zamach', ciezki: mocny || bron.obrazenia >= 3, mocny });
}

// Ostrze przechodzi po łuku i trafia wrogów po kolei, tak jak ich mija.
// „Miecz, który waży”: słabych przecina na wylot, w ciężkim grzęźnie i dalej nie leci.
function tnij(gra, dt) {
  const b = gra.bohater, c = b.cios, bron = gra.bron;
  const q = Math.min(1, c.t / c.czasCiecia), e = 1 - (1 - q) * (1 - q);
  c.aktualny = c.od + (c.do - c.od) * e;
  const przeszlo = Math.abs(c.aktualny - c.od), kier = Math.sign(c.do - c.od) || 1;
  const zasieg = bron.zasieg * (c.mocny ? MOCNY.zasieg : 1);
  let nowe = 0;
  const cele = [];
  for (const e2 of gra.wrogowie) {
    if (e2.stan === 'wynurza' || e2.stan === 'martwy' || c.trafieni.has(e2)) continue;
    const dx = e2.x - b.x, dy = e2.y - b.y, d = Math.hypot(dx, dy);
    if (d - e2.promien > zasieg) continue;
    const tol = Math.atan2(e2.promien, Math.max(d, 1)) + (d < b.promien + e2.promien + 10 ? 0.6 : 0);
    let r = kier * (Math.atan2(dy, dx) - c.od); r = ((r % TAU) + TAU) % TAU; if (r > TAU - tol) r -= TAU;
    if (r <= przeszlo + tol) cele.push({ e: e2, r, d });
  }
  cele.sort((p, q2) => p.r - q2.r);
  const gdzie = [];                       // gdzie ostrze weszło w ciało: dla obrazu (błysk cięcia)
  for (const { e: wrog, d } of cele) {
    c.trafieni.add(wrog);
    const obr = Math.round(bron.obrazenia * (c.mocny ? MOCNY.obrazenia : 1)) * (wrog.stan === 'ogluszony' ? 2 : 1);
    const katOd = Math.atan2(wrog.y - b.y, wrog.x - b.x);
    gdzie.push({ x: wrog.x, y: wrog.y, wys: 20 * wrog.typ.skala, kat: katOd + kier * Math.PI / 2 });
    zranWroga(gra, wrog, obr, katOd, bron.odrzut * (c.mocny ? MOCNY.odrzut : 1), bron.przerywa || c.mocny, c.mocny || bron.przecinaCiezkich);
    nowe++; c.trafienia++;
    krewZaKrew(b);
    b.klatwa = Math.min(1, b.klatwa + KLATWA.zaTrafienie * gra.mod.klatwa);
    if (wrog.typ.ciezki && !wrog.typ.boss && wrog.zycie > 0 && !bron.przecinaCiezkich && !c.mocny) {   // w bossie miecz nie grzęźnie: bot „słaby” utykał 136 razy na noc
      c.utknal = true;
      gra.zatrzymanie = Math.max(gra.zatrzymanie, BOHATER.miecz.zatrzymanieGrzeznie);
      iskry(gra, wrog.x - Math.cos(katOd) * wrog.promien, wrog.y - 30 - Math.sin(katOd) * wrog.promien, 10);
      gra.zdarzenia.push({ typ: 'grzeznie' });
      break;
    }
  }
  // totemy: ostrze trafia je tak jak wrogów (raz na cios)
  for (const t of gra.totemy) {
    if (t.zniszczony || c.trafieni.has(t)) continue;
    const dx = t.x - b.x, dy = t.y - b.y, d = Math.hypot(dx, dy);
    if (d - t.promien > zasieg) continue;
    const tol = Math.atan2(t.promien, Math.max(d, 1)) + 0.3;
    let r = kier * (Math.atan2(dy, dx) - c.od); r = ((r % TAU) + TAU) % TAU; if (r > TAU - tol) r -= TAU;
    if (r > przeszlo + tol) continue;
    c.trafieni.add(t);
    zranTotem(gra, t, Math.round(bron.obrazenia * (c.mocny ? MOCNY.obrazenia : 1)));
    gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.05); gra.wstrzas = Math.max(gra.wstrzas, 3);
    iskry(gra, t.x - dx / d * t.promien, t.y - 50, 8);
  }
  if (nowe) {
    const ciezar = 0.6 + 0.4 * bron.obrazenia, pierwsze = c.trafienia === nowe;
    gra.zatrzymanie = Math.max(gra.zatrzymanie, BOHATER.miecz.zatrzymanie * ciezar * (c.mocny ? 1.5 : 1) * (pierwsze ? 1 : 0.5));
    gra.wstrzas = Math.max(gra.wstrzas, (c.mocny ? 10 : 2 + bron.obrazenia * 2));
    gra.zdarzenia.push({ typ: 'trafienie', ile: nowe, mocny: c.mocny, gdzie });
  }
}

function krewZaKrew(b) {
  if (b.smugaCzas <= 0 || b.smuga <= 0) return;
  const r = Math.min(b.smuga, BOHATER.krewZaKrew.zaTrafienie);
  b.zycie = Math.min(BOHATER.zycie, b.zycie + r); b.smuga -= r;
}

function zranBohatera(gra, ile, odKata, ciezki) {
  const b = gra.bohater;
  ile *= gra.mod.cialo;
  b.zycie -= ile; b.flash = 0.25;
  b.smuga = Math.min(BOHATER.zycie - Math.max(0, b.zycie), b.smuga + ile);
  b.smugaCzas = BOHATER.krewZaKrew.czas;
  b.odrzutX += Math.cos(odKata) * (ciezki ? 420 : 200); b.odrzutY += Math.sin(odKata) * (ciezki ? 420 : 200);
  gra.wstrzas = Math.max(gra.wstrzas, ciezki ? 12 : 7);
  gra.zdarzenia.push({ typ: 'rana' });
  for (let i = 0; i < 6; i++) gra.krew.push({ x: b.x, y: b.y, z: 40, vx: losuj(-120, 120), vy: losuj(-80, 80), vz: losuj(60, 180), r: losuj(1.5, 3) });
  if (ciezki && b.zycie > 0) { b.stan = 'zachwiany'; b.t = 0; b.trwanie = 0.4; b.cios = null; }
  if (b.zycie <= 0) upadek(gra);
}

function trafBohatera(gra, e) {
  const b = gra.bohater;
  if (b.stan === 'upadl') return;
  if (b.spi) return;
  if (b.nietykalny > 0) { gra.zdarzenia.push({ typ: 'unikniety' }); return; }
  const katDoWroga = Math.atan2(e.y - b.y, e.x - b.x), odWroga = katDoWroga + Math.PI;
  const ciezki = !!e.typ.ciezki, ob = e.obrazenia * (e.at ? e.at.obrazenia : 1);   // boss: każdy atak bije inaczej
  if (b.blok && Math.abs(rozn(katDoWroga, b.kat)) < BOHATER.blok.kat) {
    if (!ciezki && gra.czas - b.blokOd < BOHATER.blok.oknoParowania) {
      // parowanie: wróg odsłonięty, następny cios zadaje podwójne obrażenia
      e.stan = 'ogluszony'; e.t = 0; e.vx = Math.cos(katDoWroga) * 260; e.vy = Math.sin(katDoWroga) * 260;
      gra.statystyki.parowania++;
      gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.09); gra.wstrzas = Math.max(gra.wstrzas, 4);
      iskry(gra, (b.x + e.x) / 2, (b.y + e.y) / 2 - 40, 14);
      gra.zdarzenia.push({ typ: 'parowanie', x: (b.x + e.x) / 2, y: (b.y + e.y) / 2 - 40, kat: katDoWroga });
      return;
    }
    zuzyjSile(b, BOHATER.blok.kosztNaCios * gra.mod.garda * (ciezki ? BOHATER.blok.mnoznikCiezki : 1));
    iskry(gra, (b.x + e.x) / 2, (b.y + e.y) / 2 - 40, 10);
    e.vx += Math.cos(katDoWroga) * BOHATER.blok.odrzut; e.vy += Math.sin(katDoWroga) * BOHATER.blok.odrzut;
    if (!ciezki) { e.stan = 'odpoczynek'; e.t = 0; e.cel = null; }      // odbity ghul musi się zebrać: okazja do cięcia
    gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.04); gra.wstrzas = Math.max(gra.wstrzas, 2.5);
    gra.zdarzenia.push({ typ: 'blok', x: (b.x + e.x) / 2, y: (b.y + e.y) / 2 - 40, kat: katDoWroga });
    b.odrzutX -= Math.cos(katDoWroga) * BOHATER.blok.cofniecie * (ciezki ? 2 : 1); b.odrzutY -= Math.sin(katDoWroga) * BOHATER.blok.cofniecie * (ciezki ? 2 : 1);   // cios w ostrze cofa go o pół kroku
    if (b.sila <= 0) {               // gardę przebito
      b.stan = 'zachwiany'; b.t = 0; b.trwanie = 0.55; b.blok = false;
      zranBohatera(gra, ob * 0.5, odWroga, false);
    } else if (ciezki) zranBohatera(gra, ob * BOHATER.blok.ranaCiezka, odWroga, false);
    return;
  }
  zranBohatera(gra, ob, odWroga, ciezki);
}

function upadek(gra) {
  const b = gra.bohater;
  b.stan = 'upadl'; b.zycie = 0; b.smuga = 0;
  gra.faza = 'upadek'; gra.fazaCzas = NOC.powrot;
  gra.statystyki.upadki++;
  powiedz(gra, 'Klątwa nie pozwala ci umrzeć.', NOC.powrot);
}

// ---------- wrogowie ----------
// zlosc: z każdym etapem nocy potwory są szybsze i krócej odpoczywają po ataku (Patryk, 24 XI 18:06),
// od 25 XI także mocniej biją i mają więcej życia (Patryk, 25 XI 13:12: „potwory trudniejsze”)
function nowyWrog(typNazwa, punkt, zlosc = { szybkosc: 1, odpoczynek: 1 }) {
  const typ = WROGOWIE[typNazwa];
  return {
    typ, x: punkt.x, y: punkt.y, vx: 0, vy: 0, promien: typ.promien, odpoczynek: typ.odpoczynek * zlosc.odpoczynek,
    zycie: Math.round(losuj(typ.zycie[0], typ.zycie[1]) * (zlosc.zycie || 1)), obrazenia: typ.obrazenia * (zlosc.obrazenia || 1), szybkosc: losuj(typ.szybkosc[0], typ.szybkosc[1]) * zlosc.szybkosc,
    stan: 'wynurza', t: 0, kat: 0, anim: Math.random() * 10, flash: 0, widac: 0, drzy: 0, cel: null, trafil: false,
    faza: 1, at: null, mOdp: zlosc.odpoczynek, zycieMax: Math.round(losuj(typ.zycie[0], typ.zycie[0]) * (zlosc.zycie || 1)),
  };
}

// przecina: cios, który zabija, rozcina ciało na dwie części (mocny cios albo wielki miecz)
function zranWroga(gra, e, ile, kat, odrzut, przerywa, przecina = false, zKlatwy = false) {
  if (e.stan === 'przemiana' || e.stan === 'martwy') return;                 // w czasie przemiany klątwa go chroni
  e.zycie -= ile; e.flash = 0.12;
  const pm = e.typ.przemiana;
  if (pm && e.faza === 1 && e.zycie <= e.zycieMax * pm.prog) {             // boss: klątwa go bierze, druga faza
    e.zycie = Math.max(e.zycie, Math.ceil(e.zycieMax * pm.prog)); e.faza = 2;
    e.stan = 'przemiana'; e.t = 0; e.at = null; e.cel = null; e.vx = e.vy = 0;
    e.szybkosc *= pm.szybkosc; e.mOdp *= pm.odpoczynek;
    gra.wstrzas = Math.max(gra.wstrzas, 14); gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.15);
    powiedz(gra, 'Klątwa go bierze. Tak będę wyglądał, jeśli jej nie zatrzymam.', 5);
    gra.zdarzenia.push({ typ: 'przemiana', x: e.x, y: e.y });
    return;
  }
  const sila = odrzut / (e.typ.ciezki ? 6 : 1);
  e.vx += Math.cos(kat) * sila; e.vy += Math.sin(kat) * sila;
  // lekki miecz nie przerywa zamachu ghula: przerwie go cięższy miecz, mocny cios, parowanie albo śmierć
  if (przerywa && !e.typ.ciezki && e.stan === 'zamach') { e.stan = 'odpoczynek'; e.t = e.odpoczynek - 0.35; }
  const n = e.typ.ciezki ? 6 : 9;
  for (let i = 0; i < n; i++) gra.krew.push({ x: e.x, y: e.y, z: 22 * e.typ.skala, vx: Math.cos(kat) * losuj(40, 170) + losuj(-50, 50), vy: Math.sin(kat) * losuj(40, 170) + losuj(-50, 50), vz: losuj(40, 170), r: losuj(1.3, 2.8) });
  if (e.zycie <= 0) {
    e.stan = 'martwy';
    gra.statystyki.zabici++;
    if (e.typ.boss) {                                                       // rycerz pada: klątwa schodzi z niego, a o świcie z polany
      gra.bossPadl = { x: e.x, y: e.y };
      powiedz(gra, 'Upadł. Klątwa schodzi z niego jak dym.', 4.5);
      gra.zdarzenia.push({ typ: 'bossPadl', x: e.x, y: e.y });
    }
    if (!zKlatwy) gra.bohater.klatwa = Math.min(1, gra.bohater.klatwa + KLATWA.zaZabicie * gra.mod.klatwa);
    if (Math.random() < (e.typ.ciezki ? LUP.szansaKolos : LUP.szansaGhul)) gra.lup.push({ typ: 'mikstura', x: e.x + losuj(-10, 10), y: e.y + losuj(-6, 6), t: 0 });
    // rzeczy do plecaka (26 XI): pazur z ghula, kieł z kolosa, krew z wiedźmy, z rycerza przyłbica i amulet (te nie znikają)
    for (const id in PRZEDMIOTY) {
      const pr = PRZEDMIOTY[id];
      if (pr.z === e.typ.nazwa && Math.random() < pr.szansa) gra.lup.push({ typ: id, x: e.x + losuj(-34, 34), y: e.y + losuj(-14, 18), t: 0, trwa: pr.z === 'rycerz' });
    }
    // ciało pada od bohatera (rysowanie najpierw pokazuje upadek, potem zostawia ślad na ziemi)
    const odBoh = Math.cos(kat) >= 0 ? 1 : -1;
    gra.slady.push({ typ: 'cialo', wrog: e.typ.nazwa, x: e.x, y: e.y, obrot: odBoh * losuj(0.75, 1.3), sx: -odBoh, kat, pada: true, przeciety: przecina && !e.typ.ciezki && !e.typ.pocisk && !e.typ.doskok });   // kolos i wiedźma padają z filmu (Patryk, 25 XI 16:17: przecięty boss „spada śmiesznie”)
    if (przecina) for (let i = 0; i < 10; i++) gra.krew.push({ x: e.x, y: e.y, z: 18 * e.typ.skala, vx: losuj(-60, 60), vy: losuj(-40, 40), vz: losuj(160, 300), r: losuj(1.5, 3.2) });
    gra.slady.push({ typ: 'kaluza', x: e.x, y: e.y, duza: true });
    gra.zdarzenia.push({ typ: 'smierc', ciezki: !!e.typ.ciezki });
  }
}

const KOM = 48, siatka = new Map();
function aktualizujWrogow(gra, dt) {
  const b = gra.bohater, zywi = gra.wrogowie;
  siatka.clear();
  for (const e of zywi) { const k = ((e.x / KOM) | 0) * 4096 + ((e.y / KOM) | 0); (siatka.get(k) || siatka.set(k, []).get(k)).push(e); }

  for (const e of zywi) {
    const typ = e.typ;
    e.flash = Math.max(0, e.flash - dt);
    const dx = b.x - e.x, dy = b.y - e.y, d = Math.hypot(dx, dy) || 1;
    const doBoh = Math.atan2(dy, dx);
    const bohaterZywy = b.stan !== 'upadl';
    let ax = 0, ay = 0, szyb = e.szybkosc;
    e.t += dt;

    if (e.stan === 'wynurza') {
      e.widac = Math.min(1, e.t / 1.2);
      ax = dx / d * szyb * 0.3; ay = dy / d * szyb * 0.3;
      if (e.t >= 1.2) { e.stan = 'idzie'; e.t = 0; }
    } else if (e.stan === 'idzie' && typ.pocisk) {
      // wiedźma: podchodzi na odległość rzutu, za blisko cofa się wolno, z dystansu zaczyna zbierać klątwę
      if (bohaterZywy) {
        if (!e.strona) e.strona = Math.random() < 0.5 ? -1 : 1;
        if (d > typ.zasiegAtaku) { ax = dx / d * szyb; ay = dy / d * szyb; }
        else {                                                             // w zasięgu krąży bokiem, za blisko odskakuje
          ax = -dy / d * szyb * 0.8 * e.strona; ay = dx / d * szyb * 0.8 * e.strona;
          if (d < typ.dystans) { ax -= dx / d * szyb * 0.7; ay -= dy / d * szyb * 0.7; }
        }
        if (d <= typ.zasiegAtaku && e.t > 0.7) { e.stan = 'zamach'; e.t = 0; e.kat = doBoh; e.strona = -e.strona; }
      }
    } else if (e.stan === 'idzie') {
      if (bohaterZywy) {
        ax = dx / d * szyb; ay = dy / d * szyb;
        if (typ.ataki) {                                                      // boss: wybiera jeden z dwóch ataków swojej fazy
          // wściekłość (Patryk, 26 XI 0:56): poniżej 25% życia krócej odpoczywa, poniżej 10% jeszcze krócej; doskok częściej, ale nie dwa razy pod rząd
          const wsc = e.zycie / e.zycieMax < 0.1 ? 2 : e.zycie / e.zycieMax < 0.25 ? 1 : 0;
          if (!e.nast) {
            // nigdy ten sam atak dwa razy pod rząd (Patryk, 26 XI 11:35: „4 skoki pod rząd niezbyt dobrze wygląda”)
            const l = typ.ataki[e.faza].filter(a => a !== e.ostatni), dsk = l.find(a => a.leci);
            e.nast = dsk && wsc && Math.random() < 0.4 ? dsk : l[(Math.random() * l.length) | 0];
          }
          if (d < e.nast.zasieg + b.promien) {
            e.at = e.ostatni = e.nast; e.nast = null; e.stan = 'zamach'; e.t = 0; e.kat = doBoh;
            e.cel = e.at.leci ? { x: e.x + Math.cos(doBoh) * Math.min(d, 300), y: e.y + Math.sin(doBoh) * Math.min(d, 300) }   // doskok: krąg tam, gdzie stoi bohater
              : { x: e.x + Math.cos(doBoh) * e.at.cel, y: e.y + Math.sin(doBoh) * e.at.cel };
            e.odpoczynek = e.at.odpoczynek * e.mOdp * [1, 0.7, 0.45][wsc];
          }
        } else if (d < typ.zasiegAtaku + b.promien) {
          e.stan = 'zamach'; e.t = 0; e.kat = doBoh;
          if (typ.ciezki) e.cel = { x: e.x + Math.cos(doBoh) * 62, y: e.y + Math.sin(doBoh) * 62 };
        }
      }
    } else if (e.stan === 'zamach') {
      if (!typ.ciezki) { e.kat = doBoh; ax = -dx / d * 25; ay = -dy / d * 25; }
      e.drzy = (Math.random() - 0.5) * 2.4;
      if (typ.pocisk) { ax = 0; ay = 0; e.drzy *= 0.4; }
      if (e.t >= (e.at || typ).zamach) {
        e.stan = 'skok'; e.t = 0; e.drzy = 0; e.trafil = false;
        if (e.at && e.at.leci) e.skokOd = { x: e.x, y: e.y };
        if (typ.doskok) {                                                    // bestia: skacze tam, gdzie bohater stoi teraz, i trochę dalej
          const dl = Math.min(d + 35, typ.zasiegAtaku + 60);
          e.lot = { vx: Math.cos(doBoh) * dl / typ.skok, vy: Math.sin(doBoh) * dl / typ.skok / PION };
        }
        if (typ.pocisk) {                                                   // rzuca kulę tam, gdzie bohater stoi teraz
          const pc = typ.pocisk, sx = Math.cos(doBoh) >= 0 ? 1 : -1;
          gra.pociski.push({ x: e.x + sx * 14, y: e.y, z: 95, vx: Math.cos(doBoh) * pc.szybkosc, vy: Math.sin(doBoh) * pc.szybkosc, t: 0, zycie: pc.zycie, promien: pc.promien, obrazenia: e.obrazenia });
          gra.zdarzenia.push({ typ: 'rzut', x: e.x, y: e.y });
        }
        else if (typ.doskok) { e.vx = e.lot.vx; e.vy = e.lot.vy; }
        else if (!typ.ciezki) { e.vx = Math.cos(e.kat) * 400; e.vy = Math.sin(e.kat) * 400; }
        else { gra.wstrzas = Math.max(gra.wstrzas, 10); gra.zdarzenia.push({ typ: 'tapniecie' }); }
      }
    } else if (e.stan === 'skok') {
      if (e.at && e.at.leci && e.cel && e.skokOd) {                    // doskok: leci łukiem i ląduje tuż przed kręgiem
        const k = Math.min(1, e.t / (e.at.skok * e.at.trafW)), kx = e.cel.x - e.skokOd.x, ky = e.cel.y - e.skokOd.y, kd = Math.hypot(kx, ky) || 1;
        const cel = Math.max(0, kd - 45);
        e.x = e.skokOd.x + kx / kd * cel * k; e.y = e.skokOd.y + ky / kd * cel * k; e.vx = e.vy = 0;
      }
      if (!e.trafil && typ.ciezki && e.t >= (e.at || typ).skok * ((e.at && e.at.trafW) || 0.5)) {
        e.trafil = true;
        if (e.cel && Math.hypot(b.x - e.cel.x, b.y - e.cel.y) < (e.at || typ).strefa + b.promien) trafBohatera(gra, e);
      } else if (!e.trafil && !typ.ciezki && !typ.pocisk && e.t >= 0.03 && d < e.promien + b.promien + 22) {
        e.trafil = true; trafBohatera(gra, e);          // ghul trafia, jeśli w czasie skoku dosięgnie bohatera
      }
      if (typ.doskok && e.lot) { e.vx = e.lot.vx; e.vy = e.lot.vy; }       // leci równo do celu, ściany chaty go zatrzymują
      if (e.t >= (e.at || typ).skok) { e.stan = 'odpoczynek'; e.t = 0; e.cel = null; e.lot = null; if (typ.doskok) { e.vx *= 0.15; e.vy *= 0.15; } }
    } else if (e.stan === 'odpoczynek') {
      ax = dx / d * szyb * 0.35; ay = dy / d * szyb * 0.35;
      if (e.t >= e.odpoczynek) { e.stan = 'idzie'; e.t = 0; e.at = null; }
    } else if (e.stan === 'przemiana') {
      e.drzy = (Math.random() - 0.5) * 3 * (1 - e.t / typ.przemiana.czas);
      if (e.t >= typ.przemiana.czas) { e.stan = 'idzie'; e.t = 0; e.drzy = 0; }
    } else if (e.stan === 'ogluszony') {
      e.drzy = Math.sin(gra.czas * 40) * 1.5;
      if (e.t >= 1.2) { e.stan = 'idzie'; e.t = 0; e.drzy = 0; }
    }

    // rozpychanie się w tłumie
    const cx = (e.x / KOM) | 0, cy = (e.y / KOM) | 0;
    for (let ix = cx - 1; ix <= cx + 1; ix++) for (let iy = cy - 1; iy <= cy + 1; iy++) {
      const lista = siatka.get(ix * 4096 + iy); if (!lista) continue;
      for (const o of lista) {
        if (o === e) continue;
        const ox = e.x - o.x, oy = e.y - o.y, dd = ox * ox + oy * oy, min = (e.promien + o.promien) * 1.05;
        if (dd < min * min && dd > 0.01) { const dl = Math.sqrt(dd), p = (min - dl) / min * 220; ax += ox / dl * p; ay += oy / dl * p; }
      }
    }

    const k = Math.min(1, dt * (e.stan === 'skok' ? 1 : 6));
    if (e.stan !== 'skok') { e.vx += (ax - e.vx) * k; e.vy += (ay - e.vy) * k; }
    else { e.vx *= Math.max(0, 1 - dt * 5); e.vy *= Math.max(0, 1 - dt * 5); }
    e.x += e.vx * dt; e.y += e.vy * dt * PION;
    // nie wchodzi w bohatera
    const bx = e.x - b.x, by = e.y - b.y, bd = Math.hypot(bx, by), bm = e.promien + b.promien;
    if (bohaterZywy && bd < bm && bd > 0.01) { e.x = b.x + bx / bd * bm; e.y = b.y + by / bd * bm; }
    zderzenia(e, e.promien);
    e.anim += dt * Math.hypot(e.vx, e.vy) / 70;
  }
  gra.wrogowie = zywi.filter(e => e.stan !== 'martwy');
}

// Kule klątwy wiedźmy: lecą prosto, opadają do wysokości piersi, trafiają bohatera jak cios (blok i parowanie działają,
// unik przepuszcza), giną na drzewach, chacie i po czasie.
function aktualizujPociski(gra, dt) {
  const b = gra.bohater;
  for (const p of gra.pociski) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += (45 - p.z) * Math.min(1, dt * 3);
    if (p.t > p.zycie) { p.zgas = true; continue; }
    const q = { x: p.x, y: p.y }; zderzenia(q, 2);
    if (Math.hypot(q.x - p.x, q.y - p.y) > 0.5) { p.zgas = true; gra.zdarzenia.push({ typ: 'pocisk_zgasl', x: p.x, y: p.y - p.z }); continue; }
    if (b.stan !== 'upadl' && Math.hypot(b.x - p.x, b.y - p.y) < b.promien + p.promien) {
      if (b.nietykalny > 0) continue;                                      // unik: kula przelatuje
      p.zgas = true;
      const k = Math.atan2(p.vy, p.vx);
      trafBohatera(gra, { x: b.x - Math.cos(k) * 30, y: b.y - Math.sin(k) * 30, typ: { ciezki: false }, obrazenia: p.obrazenia, vx: 0, vy: 0, stan: 'pocisk' });
      gra.zdarzenia.push({ typ: 'pocisk_zgasl', x: p.x, y: p.y - p.z });
    }
  }
  gra.pociski = gra.pociski.filter(p => !p.zgas);
}

function aktualizujKrew(gra, dt) {
  const k = gra.krew;
  for (let i = k.length - 1; i >= 0; i--) {
    const p = k[i]; p.x += p.vx * dt; p.y += p.vy * dt * 0.6; p.z += p.vz * dt; p.vz -= 520 * dt;
    if (p.z <= 0) { if (Math.random() < 0.35) gra.slady.push({ typ: 'kropla', x: p.x, y: p.y, r: p.r }); k[i] = k[k.length - 1]; k.pop(); }
  }
  if (k.length > 500) k.splice(0, k.length - 500);
  const s = gra.iskry;
  for (let i = s.length - 1; i >= 0; i--) { const p = s[i]; p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; if (p.t <= 0) { s[i] = s[s.length - 1]; s.pop(); } }
}

function iskry(gra, x, y, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = losuj(120, 320); gra.iskry.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: losuj(0.15, 0.35) }); }
}

// ---------- wstęp: odkrywanie polany i chaty ----------
// Przy nieobejrzanym miejscu E (na telefonie przycisk akcji) daje myśl bohatera. Noc zapada, gdy wszystko
// obejrzane i przeczytana pierwsza kartka (Patryk, 26 XI 12:06).
function odkrywanie(gra, w, dt) {
  const b = gra.bohater;
  gra.odkryj = null;
  let naj = WSTEP.zasieg + b.promien;
  for (const m of MIEJSCA) {
    if (gra.odkryte.includes(m.id)) continue;
    const d = Math.hypot(m.x - b.x, m.y - b.y);
    if (d < naj) { naj = d; gra.odkryj = m; }
  }
  if (gra.odkryj && w.akcja && b.stan === 'wolny' && !b.spi) {
    const m = gra.odkryj; gra.odkryte.push(m.id); gra.odkryj = null; w.akcja = false;
    powiedz(gra, m.mysl, 4.5); gra.zdarzenia.push({ typ: 'odkryte', x: m.x, y: m.y });
    gra.podpowiedzZa = WSTEP.kolejnaPodpowiedz;
  }
  // Podpowiedź dla kogoś, kto gra pierwszy raz (Patryk, 26 XI 12:27): po chwili bez odkrycia bohater mówi,
  // rzadko i zagadką, o najbliższym nieobejrzanym miejscu (Patryk, 12:28: bez prowadzenia za rękę). Pierwsza uczy tylko E.
  gra.podpowiedzZa -= dt;
  if (gra.podpowiedzZa <= 0 && gra.mysl.czas <= 0) {
    gra.podpowiedzZa = WSTEP.kolejnaPodpowiedz;
    const zostalo = MIEJSCA.filter(m => !gra.odkryte.includes(m.id));
    if (gra.odkryte.length === 0 && !zostalo.some(m => Math.hypot(m.x - b.x, m.y - b.y) < 500)) powiedz(gra, 'Droga prowadzi do chaty. Tam, gdzie coś błyszczy, warto się zatrzymać (E).', 5);
    else if (zostalo.length) {
      const m = zostalo.reduce((a, c) => Math.hypot(c.x - b.x, c.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? c : a);
      gra.wskazane = m.id; powiedz(gra, WSTEP.wskazowki[m.id], 4.5);
    } else if (gra.kartki < 1) powiedz(gra, 'W izbie coś leży na podłodze. Kartka?', 4.5);
  }
}
export const ileOdkryc = () => MIEJSCA.length + 1;   // miejsca i pierwsza kartka

// ---------- etapy nocy ----------
function aktualizujEtapy(gra, dt) {
  if (gra.faza === 'wstep') {
    if (gra.odkryte.length >= MIEJSCA.length && gra.kartki >= 1 && gra.mysl.czas < 1) {
      gra.faza = 'przerwa'; gra.fazaCzas = NOC.przerwa + 3; powiedz(gra, WSTEP.noc, NOC.przerwa);
    }
    return;
  }
  if (gra.faza === 'przerwa' && gra.etap === 0 && gra.mroczek < NOC.mroczek) gra.mroczek = Math.min(NOC.mroczek, gra.mroczek + dt * (NOC.mroczek - WSTEP.zmierzch) / 6);   // zapada noc
  if (gra.faza === 'przerwa') {
    gra.fazaCzas -= dt * (gra.bohater.wChacie ? CHATA_ODPOCZYNEK.tempoCiszy : 1);   // w chacie cisza stoi
    if (gra.fazaCzas <= 0) {
      gra.faza = 'walka'; gra.walkaCzas = 0; gra.kolejka = [];
      const kt = gra.etap > 0 && KARTKI[gra.etap];
      if (kt && !gra.kartka) { const p = { x: OGNISKO.x + kt.gdzie.dx, y: OGNISKO.y + kt.gdzie.dy }; zderzenia(p, 22); gra.kartka = { nr: gra.etap, x: p.x, y: p.y }; }
      for (const g of ETAPY[gra.etap].grupy) for (let i = 0; i < g.ile; i++) {
        const z = g.z[i % g.z.length];
        if (z !== 'boss' && stronaCicha(gra, z)) continue;                              // rozbite totemy: z tej strony nikt nie przyjdzie
        gra.kolejka.push({ typ: g.typ, z, t: (g.od || 0) + i * g.co });
      }
      gra.kolejka.sort((a, b) => a.t - b.t);
    }
  } else if (gra.faza === 'walka') {
    gra.walkaCzas += dt;
    while (gra.kolejka.length && gra.kolejka[0].t <= gra.walkaCzas) {
      const q = gra.kolejka.shift();
      if (q.z === 'boss') {                                                            // rycerz wychodzi z drogi na południe od ogniska
        const p = { x: OGNISKO.x + 30, y: OGNISKO.y + 360 }; zderzenia(p, 30);
        gra.wrogowie.push(nowyWrog(q.typ, p, ETAPY[gra.etap].zlosc));
        powiedz(gra, 'Ten pancerz… to on pisał te kartki. Czekał przy ogniu.', 4);
        gra.zdarzenia.push({ typ: 'boss' });
        continue;
      }
      if (stronaCicha(gra, q.z)) continue;
      gra.wrogowie.push(nowyWrog(q.typ, punktWMgle(q.z, gra.totemy), ETAPY[gra.etap].zlosc));
    }
    if (!gra.kolejka.length && !gra.wrogowie.length) {
      gra.etap++;
      if (gra.etap >= ETAPY.length) {
        gra.faza = 'swit'; gra.switT = 0; gra.slonce = 0;
        gra.fazaCzas = gra.bossPadl ? NOC.switBoss : NOC.swit;
        if (!gra.bossPadl) powiedz(gra, 'Świt. Mgła się cofa. Przetrwałeś.', NOC.swit);   // po rycerzu najpierw wybrzmiewa „Upadł…”
      }
      else {
        gra.faza = 'przerwa'; gra.fazaCzas = NOC.przerwa; powiedz(gra, ETAPY[gra.etap].mysl, NOC.przerwa);
        const wolne = ULEPSZENIA.map(u => u.id).filter(id => id === 'mikstura' || !gra.ulepszenia.includes(id));
        gra.wybor = []; while (gra.wybor.length < 3 && wolne.length) gra.wybor.push(wolne.splice((Math.random() * wolne.length) | 0, 1)[0]);
        gra.zdarzenia.push({ typ: 'wybor' });
      }
    }
  } else if (gra.faza === 'upadek') {
    gra.fazaCzas -= dt;
    if (gra.fazaCzas <= 0) {
      postawBohatera(gra);
      gra.wrogowie = []; gra.kolejka = []; gra.pociski = [];
      gra.faza = 'przerwa'; gra.fazaCzas = NOC.przerwa;
      powiedz(gra, 'Znowu ten ogień. Znowu ta noc.', NOC.przerwa);
    }
  } else if (gra.faza === 'swit') {
    // Świt po rycerzu (Patryk, 26 XI 0:56): słońce nad pokonanym, klątwa schodzi z polany, ale to dopiero pierwszy etap.
    gra.fazaCzas -= dt; gra.switT += dt;
    const dlugi = !!gra.bossPadl, cal = dlugi ? NOC.switBoss : NOC.swit;
    const q = dlugi ? Math.min(1, Math.max(0, (gra.switT - 2) / 9)) : Math.min(1, gra.switT / NOC.swit); gra.slonce = q * q * (3 - 2 * q);
    gra.mroczek = Math.max(dlugi ? 0 : 0.12, NOC.mroczek * (1 - gra.slonce));
    if (dlugi) {
      const zar = gra.przemiana >= PRZEMIANA.prog;
      const kwestie = [
        [4.5, 'Świt. Mgła cofa się do lasu.'],
        [9, 'Klątwa zeszła z tej polany. Czuję to w ziemi.'],
        [13.5, zar ? 'Ze mnie nie zeszła. Ręka dalej pali.' : 'Ze mnie jeszcze nie. Ale żar przygasa.'],
        [18, 'Rycerz pisał o bagnach wiedźmy. Tam jest następny ślad.'],
      ];
      for (const [t, tekst] of kwestie) if (gra.switT >= t && gra.switT - dt < t) powiedz(gra, tekst, 4.6);
    }
    if (gra.fazaCzas <= 0) { gra.faza = 'koniec'; gra.zdarzenia.push({ typ: 'koniec' }); }
  }
}

// ---------- cele nocy: totemy, łup, ognisko ----------
const stronaCicha = (gra, z) => gra.totemy.filter(t => t.mgla === z).every(t => t.zniszczony);

function zranTotem(gra, t, ile) {
  t.zycie -= ile; t.flash = 0.15;
  gra.zdarzenia.push({ typ: 'totem_traf', i: t.i, x: t.x, y: t.y });
  if (t.zycie > 0) return;
  t.zniszczony = true; gra.statystyki.totemy++;
  gra.wstrzas = Math.max(gra.wstrzas, 12); gra.zatrzymanie = Math.max(gra.zatrzymanie, 0.1);
  const cicha = stronaCicha(gra, t.mgla);
  if (cicha) gra.kolejka = gra.kolejka.filter(q => q.z !== t.mgla);
  gra.zdarzenia.push({ typ: 'totem_rozbity', i: t.i, x: t.x, y: t.y, cicha });
  powiedz(gra, cicha ? 'Totem pęka. Z tej strony już nic nie przyjdzie.' : 'Jeden pękł. Obok stoi drugi.', 3);
}

function aktualizujCele(gra, dt, w) {
  const b = gra.bohater;
  for (const t of gra.totemy) t.flash = Math.max(0, t.flash - dt);
  // łup: podnosi się sam, gdy bohater przejdzie obok
  for (let i = gra.lup.length - 1; i >= 0; i--) {
    const l = gra.lup[i]; l.t += dt;
    if (l.t > LUP.znika && !l.trwa) { gra.lup.splice(i, 1); continue; }
    if (l.typ !== 'mikstura') {                                            // rzecz do plecaka: bez limitu
      if (b.stan !== 'upadl' && Math.hypot(l.x - b.x, l.y - b.y) < LUP.zasiegPodniesienia + b.promien) {
        const pr = PRZEDMIOTY[l.typ], pierwszy = !gra.plecak[l.typ];
        gra.plecak[l.typ] = (gra.plecak[l.typ] || 0) + 1; gra.lup.splice(i, 1);
        gra.zdarzenia.push({ typ: 'podniesione', x: l.x, y: l.y, rzecz: l.typ });
        if (pierwszy || pr.wazny) powiedz(gra, pr.wazny ? pr.opis : `${pr.nazwa}. Do plecaka (I).`, pr.wazny ? 5 : 2.5);
      }
      continue;
    }
    if (b.stan !== 'upadl' && b.mikstury < LUP.max && Math.hypot(l.x - b.x, l.y - b.y) < LUP.zasiegPodniesienia + b.promien) {
      b.mikstury++; gra.lup.splice(i, 1); gra.zdarzenia.push({ typ: 'podniesione', x: l.x, y: l.y });
    }
  }
  if (w.mikstura && b.mikstury > 0 && b.stan !== 'upadl' && b.zycie < BOHATER.zycie) {
    b.mikstury--; b.zycie = Math.min(BOHATER.zycie, b.zycie + LUP.leczy); b.smuga = Math.max(0, Math.min(b.smuga, BOHATER.zycie - b.zycie));
    gra.zdarzenia.push({ typ: 'mikstura' });
  }
  // kartka z dziennika: podniesiona otwiera się do czytania
  if (gra.kartka && b.stan !== 'upadl' && Math.hypot(gra.kartka.x - b.x, gra.kartka.y - b.y) < KARTKA.zasieg + b.promien) {
    if (gra.faza === 'walka') { gra.kartkaCzeka = gra.kartka.nr; powiedz(gra, 'Kartka z dziennika. Przeczytam, kiedy ucichnie.', 2.5); }
    else gra.czytana = gra.kartka.nr;
    gra.kartki++; gra.zdarzenia.push({ typ: 'kartka', x: gra.kartka.x, y: gra.kartka.y }); gra.kartka = null;
  }
  // ognisko gaśnie; drewno ze stosu pod chatą
  if (gra.faza === 'walka' || gra.faza === 'przerwa') gra.ogien = Math.max(OGIEN.minimum, gra.ogien - dt / OGIEN.czas);
  if (gra.ogien < OGIEN.przygasa && !gra.ogienPrzygasl) { gra.ogienPrzygasl = true; powiedz(gra, 'Ogień przygasa. Drewno leży pod ścianą chaty.', 3.5); }
  if (gra.ogien > OGIEN.przygasa + 0.1) gra.ogienPrzygasl = false;
  if (b.stan !== 'wolny' || gra.akcja || b.wChacie) return;
  if (!b.drewno && Math.hypot(b.x - STOS_DREWNA.x, b.y - STOS_DREWNA.y) < 70) {
    gra.akcja = 'drewno';
    if (w.akcja) { b.drewno = true; w.akcja = false; gra.zdarzenia.push({ typ: 'drewno' }); powiedz(gra, 'Polano pod pachą. Do ognia.', 2); }
  } else if (b.drewno && Math.hypot(b.x - OGNISKO.x, b.y - OGNISKO.y) < 95) {
    gra.akcja = 'dorzuc';
    if (w.akcja) { b.drewno = false; w.akcja = false; gra.ogien = Math.min(1, gra.ogien + OGIEN.polano); gra.zdarzenia.push({ typ: 'dorzucone', x: OGNISKO.x, y: OGNISKO.y }); }
  }
}

export function etapNazwa(gra) {
  if (gra.faza === 'swit' || gra.faza === 'koniec') return 'Świt';
  if (gra.faza === 'wstep') return `Zmierzch · obejrzane ${gra.odkryte.length + Math.min(1, gra.kartki)} z ${ileOdkryc()}`;
  return `Noc ${Math.min(gra.etap, ETAPY.length - 1) + 1} z ${ETAPY.length}: ${ETAPY[Math.min(gra.etap, ETAPY.length - 1)].nazwa}`;
}

// do testów (testy/, narzędzia w przeglądarce): zranienie wroga z zewnątrz
export const __test = { zranWroga };
