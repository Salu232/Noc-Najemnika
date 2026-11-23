// Logika walki: bohater, wrogowie, etapy nocy. Nic tu nie rysuje — rysowanie jest w rysowanie.js.
import { BOHATER, BRONIE, DOMYSLNA_BRON, MOCNY, WROGOWIE, ETAPY, NOC } from './dane.js';
import { START, zderzenia, punktWMgle } from './swiat.js';

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
    statystyki: { zabici: 0, upadki: 0, parowania: 0, czas: 0 },
  };
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
  };
}

export function powiedz(gra, tekst, czas = 3.5) { gra.mysl.tekst = tekst; gra.mysl.czas = czas; }

// Zmiana miecza w trakcie gry (z menu pauzy): działa od następnego ciosu.
export function ustawBron(gra, klucz) {
  if (!BRONIE[klucz]) return;
  gra.bronKlucz = klucz; gra.bron = BRONIE[klucz];
  const b = gra.bohater; if (b.stan === 'cios') { b.stan = 'wolny'; b.cios = null; }
}

// ---------- jedna klatka ----------
export function aktualizuj(gra, dt, w) {
  if (gra.zatrzymanie > 0) { gra.zatrzymanie -= dt; return; }   // krótkie zatrzymanie po trafieniu: czuć ciężar ciosu
  gra.czas += dt;
  if (gra.faza !== 'koniec') gra.statystyki.czas += dt;
  gra.wstrzas = Math.max(0, gra.wstrzas - dt * 30);
  if (gra.mysl.czas > 0) gra.mysl.czas -= dt;

  aktualizujBohatera(gra, dt, w);
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
  if (b.stan === 'upadl') return;
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

  if (w.atakStart) b.kolejkaAtaku = true;
  const mozeUnik = w.unik && b.sila >= BOHATER.unik.koszt * 0.5;

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
  else b.sila = Math.min(BOHATER.sila, b.sila + BOHATER.odnowaSily * dt * (b.blok ? 0.3 : 1));
  if (b.smugaCzas > 0) b.smugaCzas -= dt; else b.smuga = Math.max(0, b.smuga - 60 * dt);
  if (b.seriaCzas > 0) { b.seriaCzas -= dt; if (b.seriaCzas <= 0) b.rozped = 0; }
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
    if (wrog.typ.ciezki && wrog.zycie > 0 && !bron.przecinaCiezkich && !c.mocny) {
      c.utknal = true;
      gra.zatrzymanie = Math.max(gra.zatrzymanie, BOHATER.miecz.zatrzymanieGrzeznie);
      iskry(gra, wrog.x - Math.cos(katOd) * wrog.promien, wrog.y - 30 - Math.sin(katOd) * wrog.promien, 10);
      gra.zdarzenia.push({ typ: 'grzeznie' });
      break;
    }
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
      gra.zdarzenia.push({ typ: 'parowanie' });
      return;
    }
    zuzyjSile(b, BOHATER.blok.kosztNaCios * (ciezki ? 3 : 1));
    iskry(gra, (b.x + e.x) / 2, (b.y + e.y) / 2 - 40, 6);
    e.vx += Math.cos(katDoWroga) * 160; e.vy += Math.sin(katDoWroga) * 160;
    gra.zdarzenia.push({ typ: 'blok' });
    if (b.sila <= 0) {               // gardę przebito
      b.stan = 'zachwiany'; b.t = 0; b.trwanie = 0.55; b.blok = false;
      zranBohatera(gra, e.typ.obrazenia * 0.5, odWroga, false);
    } else if (ciezki) zranBohatera(gra, e.typ.obrazenia * 0.5, odWroga, false);
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
function nowyWrog(typNazwa, punkt) {
  const typ = WROGOWIE[typNazwa];
  return {
    typ, x: punkt.x, y: punkt.y, vx: 0, vy: 0, promien: typ.promien,
    zycie: Math.round(losuj(typ.zycie[0], typ.zycie[1])), szybkosc: losuj(typ.szybkosc[0], typ.szybkosc[1]),
    stan: 'wynurza', t: 0, kat: 0, anim: Math.random() * 10, flash: 0, widac: 0, drzy: 0, cel: null, trafil: false,
  };
}

// przecina: cios, który zabija, rozcina ciało na dwie części (mocny cios albo wielki miecz)
function zranWroga(gra, e, ile, kat, odrzut, przerywa, przecina = false) {
  e.zycie -= ile; e.flash = 0.12;
  const sila = odrzut / (e.typ.ciezki ? 6 : 1);
  e.vx += Math.cos(kat) * sila; e.vy += Math.sin(kat) * sila;
  // lekki miecz nie przerywa zamachu ghula: przerwie go cięższy miecz, mocny cios, parowanie albo śmierć
  if (przerywa && !e.typ.ciezki && e.stan === 'zamach') { e.stan = 'odpoczynek'; e.t = e.typ.odpoczynek - 0.35; }
  const n = e.typ.ciezki ? 6 : 9;
  for (let i = 0; i < n; i++) gra.krew.push({ x: e.x, y: e.y, z: 22 * e.typ.skala, vx: Math.cos(kat) * losuj(40, 170) + losuj(-50, 50), vy: Math.sin(kat) * losuj(40, 170) + losuj(-50, 50), vz: losuj(40, 170), r: losuj(1.3, 2.8) });
  if (e.zycie <= 0) {
    e.stan = 'martwy';
    gra.statystyki.zabici++;
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
      if (e.t >= typ.odpoczynek) { e.stan = 'idzie'; e.t = 0; }
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
    gra.fazaCzas -= dt;
    if (gra.fazaCzas <= 0) {
      gra.faza = 'walka'; gra.walkaCzas = 0; gra.kolejka = [];
      for (const g of ETAPY[gra.etap].grupy) for (let i = 0; i < g.ile; i++) gra.kolejka.push({ typ: g.typ, z: g.z[i % g.z.length], t: i * g.co });
      gra.kolejka.sort((a, b) => a.t - b.t);
    }
  } else if (gra.faza === 'walka') {
    gra.walkaCzas += dt;
    while (gra.kolejka.length && gra.kolejka[0].t <= gra.walkaCzas) {
      const q = gra.kolejka.shift();
      gra.wrogowie.push(nowyWrog(q.typ, punktWMgle(q.z)));
    }
    if (!gra.kolejka.length && !gra.wrogowie.length) {
      gra.etap++;
      if (gra.etap >= ETAPY.length) { gra.faza = 'swit'; gra.fazaCzas = NOC.swit; powiedz(gra, 'Świt. Mgła się cofa. Przetrwałeś.', NOC.swit); }
      else { gra.faza = 'przerwa'; gra.fazaCzas = NOC.przerwa; powiedz(gra, ETAPY[gra.etap].mysl, NOC.przerwa); }
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

export function etapNazwa(gra) {
  if (gra.faza === 'swit' || gra.faza === 'koniec') return 'Świt';
  return `Noc ${Math.min(gra.etap, ETAPY.length - 1) + 1} z ${ETAPY.length}: ${ETAPY[Math.min(gra.etap, ETAPY.length - 1)].nazwa}`;
}
