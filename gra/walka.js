// Logika walki: bohater, wrogowie, etapy nocy. Nic tu nie rysuje — rysowanie jest w rysowanie.js.
import { BOHATER, BRONIE, DOMYSLNA_BRON, MOCNY, KLATWA, WROGOWIE, ETAPY, NOC, CHATA_ODPOCZYNEK, TOTEM, LUP, OGIEN, ULEPSZENIA } from './dane.js';
import { START, CHATA, OGNISKO, TOTEMY, STOS_DREWNA, wIzbie, zderzenia, punktWMgle } from './swiat.js';

const TAU = Math.PI * 2;
const rozn = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const losuj = (a, b) => a + Math.random() * (b - a);

export function nowaGra(bron = DOMYSLNA_BRON) {
  const gra = {
    bronKlucz: BRONIE[bron] ? bron : DOMYSLNA_BRON, bron: BRONIE[BRONIE[bron] ? bron : DOMYSLNA_BRON],
    czas: 0, zatrzymanie: 0, wstrzas: 0, mroczek: NOC.mroczek,
    bohater: null, wrogowie: [], krew: [], iskry: [], slady: [], zdarzenia: [],
    etap: 0, faza: 'przerwa', fazaCzas: NOC.przerwa, walkaCzas: 0, kolejka: [],
    mysl: { tekst: '', czas: 0 },
    drzwi: { otwarte: false, o: 0 },   // drzwi chaty: czy otwarte i jak daleko obrócone (0 zamknięte, 1 otwarte)
    statystyki: { zabici: 0, upadki: 0, parowania: 0, czas: 0, totemy: 0 },
    // cele nocy (24 XI 18:41): totemy do rozbicia, łup, gasnące ognisko, ulepszenia między falami
    totemy: TOTEMY.map((t, i) => ({ i, mgla: t.mgla, x: t.x, y: t.y, promien: t.promien, zycie: TOTEM.zycie, flash: 0, zniszczony: false })),
    lup: [], ogien: 1, ogienPrzygasl: false, wybor: null, ulepszenia: [],
    mod: { zasieg: 1, szybkosc: 1, garda: 1, oddech: 1, klatwa: 1, cialo: 1 },
  };
  zastosujBron(gra);
  postawBohatera(gra);
  powiedz(gra, ETAPY[0].mysl, NOC.przerwa);
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
    mikstury: gra.bohater ? gra.bohater.mikstury : LUP.start, drewno: false,
  };
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
export function aktualizuj(gra, dt, w) {
  if (gra.wybor) return;                                           // wybór ulepszenia: noc czeka
  if (gra.zatrzymanie > 0) { gra.zatrzymanie -= dt; return; }   // krótkie zatrzymanie po trafieniu: czuć ciężar ciosu
  gra.czas += dt;
  if (gra.faza !== 'koniec') gra.statystyki.czas += dt;
  gra.wstrzas = Math.max(0, gra.wstrzas - dt * 30);
  if (gra.mysl.czas > 0) gra.mysl.czas -= dt;

  aktualizujBohatera(gra, dt, w);
  aktualizujCele(gra, dt, w);
  aktualizujWrogow(gra, dt);
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
    const cfg = BOHATER.unik, v = cfg.dystans / cfg.czas * 1.25 * Math.max(0, 1 - b.t / cfg.czas);
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
  else if (b.stan === 'cios') v = BOHATER.szybkosc * (b.cios.faza === 'laduje' ? MOCNY.ruchLadowania : bron.ruch);
  if (v > 0 && rl > 0.05) { b.x += rx * v * dt; b.y += ry * v * dt; b.idzie = true; b.chod += dt * 9 * Math.min(1, rl) * (v / BOHATER.szybkosc + 0.3); }
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
  b.nietykalny = BOHATER.unik.nietykalny;
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
    if (wrog.typ.ciezki && wrog.zycie > 0 && !bron.przecinaCiezkich && !c.mocny) {
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
  const ciezki = !!e.typ.ciezki;
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
    if (b.sila <= 0) {               // gardę przebito
      b.stan = 'zachwiany'; b.t = 0; b.trwanie = 0.55; b.blok = false;
      zranBohatera(gra, e.typ.obrazenia * 0.5, odWroga, false);
    } else if (ciezki) zranBohatera(gra, e.typ.obrazenia * BOHATER.blok.ranaCiezka, odWroga, false);
    return;
  }
  zranBohatera(gra, e.typ.obrazenia, odWroga, ciezki);
}

function upadek(gra) {
  const b = gra.bohater;
  b.stan = 'upadl'; b.zycie = 0; b.smuga = 0;
  gra.faza = 'upadek'; gra.fazaCzas = NOC.powrot;
  gra.statystyki.upadki++;
  powiedz(gra, 'Klątwa nie pozwala ci umrzeć.', NOC.powrot);
}

// ---------- wrogowie ----------
// zlosc: z każdym etapem nocy potwory są szybsze i krócej odpoczywają po ataku (Patryk, 24 XI 18:06)
function nowyWrog(typNazwa, punkt, zlosc = { szybkosc: 1, odpoczynek: 1 }) {
  const typ = WROGOWIE[typNazwa];
  return {
    typ, x: punkt.x, y: punkt.y, vx: 0, vy: 0, promien: typ.promien, odpoczynek: typ.odpoczynek * zlosc.odpoczynek,
    zycie: Math.round(losuj(typ.zycie[0], typ.zycie[1])), szybkosc: losuj(typ.szybkosc[0], typ.szybkosc[1]) * zlosc.szybkosc,
    stan: 'wynurza', t: 0, kat: 0, anim: Math.random() * 10, flash: 0, widac: 0, drzy: 0, cel: null, trafil: false,
  };
}

// przecina: cios, który zabija, rozcina ciało na dwie części (mocny cios albo wielki miecz)
function zranWroga(gra, e, ile, kat, odrzut, przerywa, przecina = false, zKlatwy = false) {
  e.zycie -= ile; e.flash = 0.12;
  const sila = odrzut / (e.typ.ciezki ? 6 : 1);
  e.vx += Math.cos(kat) * sila; e.vy += Math.sin(kat) * sila;
  // lekki miecz nie przerywa zamachu ghula: przerwie go cięższy miecz, mocny cios, parowanie albo śmierć
  if (przerywa && !e.typ.ciezki && e.stan === 'zamach') { e.stan = 'odpoczynek'; e.t = e.odpoczynek - 0.35; }
  const n = e.typ.ciezki ? 6 : 9;
  for (let i = 0; i < n; i++) gra.krew.push({ x: e.x, y: e.y, z: 22 * e.typ.skala, vx: Math.cos(kat) * losuj(40, 170) + losuj(-50, 50), vy: Math.sin(kat) * losuj(40, 170) + losuj(-50, 50), vz: losuj(40, 170), r: losuj(1.3, 2.8) });
  if (e.zycie <= 0) {
    e.stan = 'martwy';
    gra.statystyki.zabici++;
    if (!zKlatwy) gra.bohater.klatwa = Math.min(1, gra.bohater.klatwa + KLATWA.zaZabicie * gra.mod.klatwa);
    if (Math.random() < (e.typ.ciezki ? LUP.szansaKolos : LUP.szansaGhul)) gra.lup.push({ typ: 'mikstura', x: e.x + losuj(-10, 10), y: e.y + losuj(-6, 6), t: 0 });
    // ciało pada od bohatera (rysowanie najpierw pokazuje upadek, potem zostawia ślad na ziemi)
    const odBoh = Math.cos(kat) >= 0 ? 1 : -1;
    gra.slady.push({ typ: 'cialo', wrog: e.typ.nazwa, x: e.x, y: e.y, obrot: odBoh * losuj(0.75, 1.3), sx: -odBoh, kat, pada: true, przeciety: przecina });
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
    } else if (e.stan === 'idzie') {
      if (bohaterZywy) {
        ax = dx / d * szyb; ay = dy / d * szyb;
        if (d < typ.zasiegAtaku + b.promien) {
          e.stan = 'zamach'; e.t = 0; e.kat = doBoh;
          if (typ.ciezki) e.cel = { x: e.x + Math.cos(doBoh) * 62, y: e.y + Math.sin(doBoh) * 62 };
        }
      }
    } else if (e.stan === 'zamach') {
      if (!typ.ciezki) { e.kat = doBoh; ax = -dx / d * 25; ay = -dy / d * 25; }
      e.drzy = (Math.random() - 0.5) * 2.4;
      if (e.t >= typ.zamach) {
        e.stan = 'skok'; e.t = 0; e.drzy = 0; e.trafil = false;
        if (!typ.ciezki) { e.vx = Math.cos(e.kat) * 400; e.vy = Math.sin(e.kat) * 400; }
        else { gra.wstrzas = Math.max(gra.wstrzas, 10); gra.zdarzenia.push({ typ: 'tapniecie' }); }
      }
    } else if (e.stan === 'skok') {
      if (!e.trafil && typ.ciezki && e.t >= typ.skok * 0.5) {
        e.trafil = true;
        if (e.cel && Math.hypot(b.x - e.cel.x, b.y - e.cel.y) < typ.strefa + b.promien) trafBohatera(gra, e);
      } else if (!e.trafil && !typ.ciezki && e.t >= 0.03 && d < e.promien + b.promien + 22) {
        e.trafil = true; trafBohatera(gra, e);          // ghul trafia, jeśli w czasie skoku dosięgnie bohatera
      }
      if (e.t >= typ.skok) { e.stan = 'odpoczynek'; e.t = 0; e.cel = null; }
    } else if (e.stan === 'odpoczynek') {
      ax = dx / d * szyb * 0.35; ay = dy / d * szyb * 0.35;
      if (e.t >= e.odpoczynek) { e.stan = 'idzie'; e.t = 0; }
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
    e.x += e.vx * dt; e.y += e.vy * dt;
    // nie wchodzi w bohatera
    const bx = e.x - b.x, by = e.y - b.y, bd = Math.hypot(bx, by), bm = e.promien + b.promien;
    if (bohaterZywy && bd < bm && bd > 0.01) { e.x = b.x + bx / bd * bm; e.y = b.y + by / bd * bm; }
    zderzenia(e, e.promien);
    e.anim += dt * Math.hypot(e.vx, e.vy) / 70;
  }
  gra.wrogowie = zywi.filter(e => e.stan !== 'martwy');
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

// ---------- etapy nocy ----------
function aktualizujEtapy(gra, dt) {
  if (gra.faza === 'przerwa') {
    gra.fazaCzas -= dt * (gra.bohater.wChacie ? CHATA_ODPOCZYNEK.tempoCiszy : 1);   // w chacie cisza stoi
    if (gra.fazaCzas <= 0) {
      gra.faza = 'walka'; gra.walkaCzas = 0; gra.kolejka = [];
      for (const g of ETAPY[gra.etap].grupy) for (let i = 0; i < g.ile; i++) {
        const z = g.z[i % g.z.length];
        if (stronaCicha(gra, z)) continue;                                              // rozbite totemy: z tej strony nikt nie przyjdzie
        gra.kolejka.push({ typ: g.typ, z, t: i * g.co });
      }
      gra.kolejka.sort((a, b) => a.t - b.t);
    }
  } else if (gra.faza === 'walka') {
    gra.walkaCzas += dt;
    while (gra.kolejka.length && gra.kolejka[0].t <= gra.walkaCzas) {
      const q = gra.kolejka.shift();
      if (stronaCicha(gra, q.z)) continue;
      gra.wrogowie.push(nowyWrog(q.typ, punktWMgle(q.z, gra.totemy), ETAPY[gra.etap].zlosc));
    }
    if (!gra.kolejka.length && !gra.wrogowie.length) {
      gra.etap++;
      if (gra.etap >= ETAPY.length) { gra.faza = 'swit'; gra.fazaCzas = NOC.swit; powiedz(gra, 'Świt. Mgła się cofa. Przetrwałeś.', NOC.swit); }
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
      gra.wrogowie = []; gra.kolejka = [];
      gra.faza = 'przerwa'; gra.fazaCzas = NOC.przerwa;
      powiedz(gra, 'Znowu ten ogień. Znowu ta noc.', NOC.przerwa);
    }
  } else if (gra.faza === 'swit') {
    gra.fazaCzas -= dt;
    gra.mroczek = Math.max(0.12, NOC.mroczek * Math.max(0, gra.fazaCzas / NOC.swit));
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
    if (l.t > LUP.znika) { gra.lup.splice(i, 1); continue; }
    if (b.stan !== 'upadl' && b.mikstury < LUP.max && Math.hypot(l.x - b.x, l.y - b.y) < LUP.zasiegPodniesienia + b.promien) {
      b.mikstury++; gra.lup.splice(i, 1); gra.zdarzenia.push({ typ: 'podniesione', x: l.x, y: l.y });
    }
  }
  if (w.mikstura && b.mikstury > 0 && b.stan !== 'upadl' && b.zycie < BOHATER.zycie) {
    b.mikstury--; b.zycie = Math.min(BOHATER.zycie, b.zycie + LUP.leczy); b.smuga = Math.max(0, Math.min(b.smuga, BOHATER.zycie - b.zycie));
    gra.zdarzenia.push({ typ: 'mikstura' });
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
  return `Noc ${Math.min(gra.etap, ETAPY.length - 1) + 1} z ${ETAPY.length}: ${ETAPY[Math.min(gra.etap, ETAPY.length - 1)].nazwa}`;
}
