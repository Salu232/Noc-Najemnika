// Świat polany: las, chata, ognisko, mgły i wszystko, o co można się zderzyć.
// Mapa jest ustawiona ręcznie, a losowe są tylko drzewa w lesie (zawsze te same dzięki ziarnu).

export const SZER = 3200, WYS = 2400;

// Która mapa (27 XI, początek bagna): ?mapa=bagno w adresie. Bez tego zawsze polana, tak jak dotąd.
// Bagno to na razie polana przerobiona kodem (martwy las, woda płytka i głęboka); obrazy z Gemini przyjdą później (docs/bagno.md).
// W artefakcie adresu nie da się zmienić, więc przycisk na ekranie startu zapisuje wybór w przeglądarce (noc-mapa) i przeładowuje grę.
// Patryk, 27 XI 14:57: na telefonie w artefakcie przycisk nie działał (pamięć przeglądarki albo zmiana adresu tam nie przechodzi).
// Dlatego najpierw window.name: zostaje w tej samej ramce po przeładowaniu, także w zamkniętej ramce artefaktu.
// jednorazowo (27 XI): pamięć przeglądarki niesie mapę tylko przez jedno przeładowanie, więc nowe otwarcie gry zaczyna się na polanie
// stary klucz noc-mapa (trwały, do v106) tylko się usuwa, żeby nie wrzucił na bagno ostatni raz
const zPamieci = () => { try { const m = localStorage.getItem('noc-przejscie'); localStorage.removeItem('noc-przejscie'); localStorage.removeItem('noc-mapa'); return m; } catch (e) { return null; } };
// też jednorazowo: po odczycie nazwa ramki jest czyszczona, więc odświeżenie albo nowe otwarcie gry zaczyna od polany (Patryk, 27 XI 16:51)
const zNazwy = () => { try { const m = /noc-mapa=(\w+)/.exec(window.name || ''); if (m) window.__nocStan = window.name; window.name = ''; return m && m[1]; } catch (e) { return null; } };
// Na czas testów (Patryk, 27 XI 23:09: „daj odrazu mape z bagien”, „jak wszytko bedzie grało to wtedy to zmienimy”): gra otwiera się na bagnie.
// Polana jest w menu pauzy („Próba: wróć na polanę”). Po testach: false.
export const START_NA_BAGNIE = true;
export const MAPA = (globalThis.MAPA_NOCY || (typeof location !== 'undefined' && new URLSearchParams(location.search).get('mapa')) || ((n, p) => n || p)(typeof window !== 'undefined' && zNazwy(), zPamieci()) || (START_NA_BAGNIE ? 'bagno' : 'polana')) === 'bagno' ? 'bagno' : 'polana';
export const BAGNO = MAPA === 'bagno';

// Chata z Gemini (grafika/chata.webp, 951×951) w skali świata.
export const CHATA = { obrazSzer: 951, obrazWys: 951, skala: 0.62 };
CHATA.x = 1600 - (CHATA.obrazSzer * CHATA.skala) / 2;
CHATA.y = 1020 - 690 * CHATA.skala;               // podstawa ścian (690 w obrazie) leży na y = 1020
// Na bagnie chaty z polany nie ma: odsuwamy ją daleko poza mapę, więc jej obraz, ściany, drzwi i izba nikomu nie przeszkadzają.
if (BAGNO) { CHATA.x = -6000; CHATA.y = -6000; }
const zObrazu = (sx, sy) => ({ x: CHATA.x + sx * CHATA.skala, y: CHATA.y + sy * CHATA.skala });
CHATA.podstawa = zObrazu(0, 690).y;
CHATA.okno = zObrazu(597, 567);
CHATA.drzwi = zObrazu(462, 712);                  // przed drzwiami, na ziemi: tu się wchodzi i stąd wychodzi
// Bryła chaty na ziemi: od przedniej ściany (692) w głąb do 380 piksela obrazu, razem z kominem i prawą ścianą.
// Do 24 XI był tu tylko pas przy przedniej ścianie (585–692) i dało się wejść „w dach” (docs/chata.md).
CHATA.sciana = { a: zObrazu(165, 380), b: zObrazu(855, 692) };
// Chata od środka, jak w Tibii (Patryk, 24 XI 13:14; obraz bez dachu: grafika/chata-bez-dachu.webp, ten sam kadr).
// Izba to podłoga między ścianami; drzwi to przejście w przedniej ścianie. Ściany to prostokąty wokół izby,
// sprzęty to prostokąty w izbie. Liczby to piksele obrazu chaty, odczytane z obrazu bez dachu (Claude, 24 XI).
const prost = (x0, y0, x1, y1) => { const a = zObrazu(x0, y0), b = zObrazu(x1, y1); return { x0: a.x, y0: a.y, x1: b.x, y1: b.y }; };
CHATA.izba = prost(215, 432, 748, 670);
CHATA.przejscie = prost(427, 670, 503, 692);      // drzwi: w walce zamknięte
CHATA.prog = zObrazu(465, 681);                   // środek progu: stąd liczy się „przy drzwiach”, z obu stron
CHATA.skrzydlo = prost(429, 540, 505, 663);      // skrzydło drzwi na obrazie chaty z dachem (zawiasy po lewej)
CHATA.sciany = [
  prost(165, 380, 855, 432),                       // tylna, z kominem
  prost(165, 432, 215, 692),                       // lewa
  prost(748, 432, 855, 692),                       // prawa, kamienna
  prost(215, 670, 427, 692),                       // przednia, na lewo od drzwi
  prost(503, 670, 748, 692),                       // przednia, na prawo od drzwi
];
CHATA.sprzety = [
  prost(215, 432, 402, 535),                       // posłanie z wilczą skórą
  prost(450, 432, 590, 452),                       // palenisko
  prost(637, 445, 727, 566),                       // ława i stół
];
CHATA.poslanie = { ...zObrazu(330, 560), r: 42 }; // tu kładzie się spać
CHATA.palenisko = zObrazu(518, 410);              // ogień w izbie: tu świeci
CHATA.stol = { ...zObrazu(682, 592), r: 48 };     // stół przy ławie: przerabianie łupów (26 XI)
CHATA.drzwiOtwarte = false;                       // ustawia walka.js: drzwi otwiera E, w walce są zamknięte
CHATA.ploty = [
  [[160, 470], [45, 585]], [[45, 585], [30, 805]],
  [[30, 805], [395, 900]], [[515, 815], [700, 872]],
].map(([p, q]) => [zObrazu(p[0], p[1]), zObrazu(q[0], q[1])]);

// Na bagnie „ognisko” to żar pod kotłem wiedźmy przed jej chatą: ten sam ogień do pilnowania, inne miejsce.
export const OGNISKO = BAGNO ? { x: 1600, y: 1120, promien: 30 } : { ...zObrazu(455, 1030), promien: 28 };
export const START = { x: OGNISKO.x + 90, y: OGNISKO.y + 40 };
// Stos drewna pod ścianą chaty, na lewo od drzwi (w obrazie chaty x 200–340, y 580–690): tu bierze się polano do ogniska.
export const STOS_DREWNA = BAGNO ? { x: 1395, y: 1085 } : zObrazu(270, 725);

// Mgły na skraju lasu. Z nich wychodzą potwory (pomysł Patryka, 23 XI).
export const MGLY = {
  zachod: { x: 560, y: 1380, r: 280 },
  wschod: { x: 2660, y: 1180, r: 280 },
  poludnie: { x: 1720, y: 2060, r: 300 },
};

// Totemy na miejscu mgieł (Patryk, 24 XI 18:20: „zamiast mgły to potwory mogłyby się pojawiać przez te kamienie i totemy”).
// Rysunki i pętla fioletowego dymu z filmu Przemka (narzedzia/wytnij-z-arkuszy.py). wys: wysokość w jednostkach świata.
// 27 XI (Patryk: „nie wiem, czy te totemy w ogóle są potrzebne”): potwory przychodzą z portali, więc zostaje jeden totem z czaszką,
// jako znak dawnego mieszkańca (wstęp: „Kość i pióra na palu”). Rogi, obelisk i kamień zdjęte.
export const TOTEMY = BAGNO ? [
  { mgla: 'wschod', rys: 'totem_czaszka', x: 2580, y: 1050, wys: 175, promien: 30 },   // bagno: kamień ze znakiem (na razie rysunek totemu)
] : [
  { mgla: 'zachod', rys: 'totem_czaszka', x: MGLY.zachod.x, y: MGLY.zachod.y, wys: 175, promien: 30 },
];

// ---------- Bagno (27 XI, Patryk: „inna mapa ma być”) ----------
// Woda jest wszędzie, ląd to wyspy (elipsy), grobla od południa (DROGA) i kładki między wyspami. Na środkowej wyspie
// chata wiedźmy na palach (na razie zastępcza) i kocioł. glebia(): mniej niż 0 to ląd, 0–1 płytka woda (brnie się), ponad 1 głęboka (nie do przejścia).
export const WYSPY = BAGNO ? [
  { x: 1600, y: 1150, rx: 430, ry: 260 },      // środkowa: ognisko; chata wiedźmy stoi nad wodą przy jej północnym brzegu
  { x: 720, y: 980, rx: 300, ry: 190 },        // zachodnia: wóz rycerza
  { x: 2520, y: 1080, rx: 300, ry: 190 },      // wschodnia: kamień ze znakiem
  { x: 760, y: 1790, rx: 260, ry: 160 },       // południowo-zachodnia
  { x: 2400, y: 1820, rx: 280, ry: 170 },      // południowo-wschodnia
  { x: 1650, y: 380, rx: 340, ry: 150 },       // północna
  { x: 380, y: 420, rx: 200, ry: 130 },
  { x: 2880, y: 430, rx: 210, ry: 130 },
  { x: 2050, y: 2200, rx: 170, ry: 90 },
] : [];
// Pochodnie na palach (27 XI 20:54, Patryk: „robimy coś innego”; pomysł Claude'a z docs/bagno.md, punkt 8): po jednej na zewnętrznych
// wyspach. Zapala się je E, mgła z wody gasi je w nocy, a z wody przy płonącej pochodni topielce nie wychodzą.
export const LATARNIE = BAGNO ? [{ x: 820, y: 900 }, { x: 2440, y: 1020 }, { x: 700, y: 1740 }, { x: 2470, y: 1770 }, { x: 1520, y: 360 }] : [];
// Losowy punkt suchego lądu na wyspie i (zioła)
export function punktNaWyspie(i) {
  const w = WYSPY[i]; if (!w) return null;
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.72, p = { x: w.x + Math.cos(a) * w.rx * r, y: w.y + Math.sin(a) * w.ry * r };
    if (glebia(p.x, p.y) < -0.3 && LATARNIE.every(l => Math.hypot(l.x - p.x, l.y - p.y) > 50)) return p;
  }
  return null;
}
export const KLADKI = BAGNO ? [
  { a: { x: 1185, y: 1120 }, b: { x: 1005, y: 1010 }, szer: 24 },   // środek – zachód
  { a: { x: 2020, y: 1130 }, b: { x: 2235, y: 1090 }, szer: 24 },   // środek – wschód
  { a: { x: 1965, y: 1020 }, b: { x: 1900, y: 470 }, szer: 22 },    // środek – północ, obok chaty
  { a: { x: 720, y: 1165 }, b: { x: 760, y: 1635 }, szer: 22 },     // zachód – południowy zachód
  { a: { x: 2500, y: 1265 }, b: { x: 2420, y: 1655 }, szer: 22 },   // wschód – południowy wschód
] : [];
// Chata wiedźmy na palach z Gemini (Patryk, 27 XI 16:55): dwa obrazy w tym samym kadrze, z dachem i bez dachu (wnętrze).
// Obraz 2048 px, w świecie 0,4 jednostki na piksel: piksel (ix, iy) leży w (X0 + 0,4·ix, Y0 + 0,4·iy).
// Chata stoi nad wodą przy północnym brzegu środkowej wyspy (Patryk, 27 XI 17:18: „stoję jakby na grafice” między palami).
// Chodzi się tylko po podłodze izby, po pomoście i po kładce; reszta pod chatą to głęboka woda.
// Wielokąty obrysowane na obrazie, w jednostkach świata. Ściana frontowa oddziela izbę od pomostu, z przerwą na drzwi.
export const CHATA_WIEDZMY = BAGNO ? (() => {
  const X0 = 1208, Y0 = 288, s = 0.4, w = (ix, iy) => ({ x: X0 + s * ix, y: Y0 + s * iy });
  const pomost = [w(405, 1172), w(986, 1425), w(1700, 1252), w(1695, 1165), w(1450, 1148), w(1330, 1212), w(1014, 1252), w(443, 1158)];
  // Podłoga izby tylko po deskach, które widać na obrazie wnętrza (Patryk, 28 XI 02:36: stał na stole, na półkach i na ścianie).
  // Od tyłu półki i świeca, z lewej stół i ściana, z prawej beczki i dzbany, z przodu ściana frontowa z drzwiami.
  const izba = [w(885, 888), w(1015, 888), w(1015, 930), w(1095, 930), w(1095, 888), w(1250, 882), w(1262, 960), w(1268, 1085), w(1320, 1125),
    w(1440, 1128), w(1440, 1152), w(1330, 1212), w(1135, 1245), w(1000, 1250), w(880, 1230), w(880, 1000)];
  return {
    X0, Y0, s, w, x: 1630, y: 790,
    izba, pomost,
    // cały dom od ściany do ściany (Patryk, 28 XI 02:45: potwory przechodziły przez chatę): poza izbą nikt tu nie wejdzie
    dom: [w(430, 800), w(1475, 800), w(1475, 1144), w(1330, 1206), w(1135, 1239), w(1000, 1244), w(436, 1152)],   // przód tuż za podłogą izby: przez próg nie ma szczeliny
    drzwi: { x0: 1608, x1: 1657, y: 788 },                             // otwór między skrzydłem a słupem
    drzwiOdc: [w(985, 1252), w(1140, 1245)],                           // zamknięte drzwi: ściana; otwiera i zamyka E (walka.js)
    skrzydlo: [w(905, 1365), w(990, 1272)],                            // otwarte skrzydło stoi na pomoście, po lewej od otworu
    // obrazy (współrzędne obrazu 2048): łata drzwi i to, co w izbie stoi przed bohaterem (rysowanie.js)
    lataDrzwi: [[870, 1060], [972, 972], [1122, 960], [1122, 1262], [995, 1292], [905, 1378], [868, 1352]],
    przod: [[[400, 1000], [490, 930], [870, 1060], [972, 978], [995, 985], [995, 1290], [905, 1372], [840, 1352], [440, 1160], [400, 1140]],
      [[1120, 912], [1180, 912], [1180, 1168], [1208, 1168], [1208, 1250], [1180, 1262], [1120, 1265]],
      [[1208, 1200], [1455, 1085], [1455, 640], [1600, 640], [1600, 1150], [1460, 1140], [1208, 1252]]],
    kladka: { a: w(1170, 1390), b: w(1500, 1870), szer: 40 },           // kładka z pomostu na wyspę (jest na obrazie)
    sciany: [[w(443, 1158), w(1000, 1250)], [w(1135, 1245), w(1330, 1212), w(1450, 1148)],   // frontowa: lewa i prawa od drzwi
      [w(443, 1158), w(470, 1050), w(480, 840)], [w(1450, 1148), w(1460, 1060), w(1460, 840)]],   // boczne: do izby wchodzi się tylko drzwiami (27 XI: wszedł bokiem przy kotle)
    kociol: { ...w(1425, 1192), promien: 20 },
    // Pod pomostem (Patryk, 27 XI 23:30: „ja chodze po tych słupkach jak po powiezchni”): ląd wyspy wchodził między słupy.
    // Ten pas jest teraz wodą, a pomost i kładka zostają do chodzenia. Obrys od przedniej krawędzi pomostu do podstaw słupów z zapasem.
    pod: [w(360, 1150), w(990, 1440), w(1730, 1240), w(1750, 1600), w(1680, 1830), w(1360, 1960), w(1210, 1880), w(1010, 1830), w(880, 1760), w(660, 1640), w(480, 1520), w(360, 1300)],
    slupy: [w(480, 1460), w(660, 1580), w(873, 1700), w(980, 1773), w(1207, 1840), w(1353, 1927), w(1633, 1800), w(1347, 1467), w(1460, 1453), w(1640, 1547)],   // podstawy słupów na obrazie: twarde
    podstawa: 750,                                                     // zIndex chaty z dachem: kto stoi na pomoście, jest przed nią
    strefa: { x0: 1270, y0: 545, x1: 1990, y1: 935 },                  // pod chatą i za nią woda; tu nie rosną drzewa ani trzciny
    bryla: { x0: 1330, y0: 380, x1: 1935, y1: 885 },
  };
})() : null;
const wWielokacie = (x, y, w) => { let c = false; for (let i = 0, j = w.length - 1; i < w.length; j = i++) { const a = w[i], b = w[j]; if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
const odWielokata = (x, y, w) => { if (wWielokacie(x, y, w)) return 0; let m = Infinity; for (let i = 0, j = w.length - 1; i < w.length; j = i++) m = Math.min(m, odOdcinka(x, y, w[j], w[i])); return m; };
export const wIzbieWiedzmy = (p) => !!CHATA_WIEDZMY && (wWielokacie(p.x, p.y, CHATA_WIEDZMY.izba) || odWielokata(p.x, p.y, CHATA_WIEDZMY.izba) < 5);   // z zapasem: przy samej ścianie też w izbie (28 XI: w rogu znikał pod dachem)
const szumBrzegu = (x, y) => 0.5 * Math.sin(x * 0.013 + y * 0.007) + 0.3 * Math.sin(x * 0.031 - y * 0.023) + 0.2 * Math.sin(-x * 0.05 + y * 0.061);
const najblizszyNaBrzegu = (p, w) => {                                // najbliższy punkt na obwodzie wielokąta
  let n = { x: p.x, y: p.y, d: Infinity };
  for (let i = 0, j = w.length - 1; i < w.length; j = i++) {
    const a = w[j], b = w[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)), x = a.x + t * dx, y = a.y + t * dy, d = Math.hypot(p.x - x, p.y - y);
    if (d < n.d) n = { x, y, d };
  }
  return n;
};
const odOdcinka = (x, y, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy; let t = ((x - a.x) * dx + (y - a.y) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a.x - t * dx, y - a.y - t * dy); };
const PAS_PLYTKI = 0.35;                        // szerokość płytkiej wody za brzegiem, jako część promienia wyspy
function naWyspie(x, y) { let q = 99; for (const w of WYSPY) { const dx = (x - w.x) / w.rx, dy = (y - w.y) / w.ry; q = Math.min(q, Math.sqrt(dx * dx + dy * dy)); } return q; }
export function glebia(x, y) {
  if (!BAGNO) return -1;
  let d = naWyspie(x, y);
  const cw = CHATA_WIEDZMY, st = cw.strefa;
  if (wWielokacie(x, y, cw.pod)) d = Math.max(d, 2.2);                   // między słupami chaty: woda, nie ląd (pomost i kładka niżej wracają)
  if (x > st.x0 && x < st.x1 && y > st.y0 && y < st.y1) {             // chata nad wodą: ląd tylko na podłodze i pomoście
    const e = Math.min(x - st.x0, st.x1 - x, y - st.y0, st.y1 - y), f = Math.min(1, e / 90);   // miękko od brzegów strefy
    if (d < 1.6) d += (1.6 - d) * f * f * (3 - 2 * f);
    d = Math.min(d, 0.5 + odWielokata(x, y, cw.izba) / 6, 0.5 + odWielokata(x, y, cw.pomost) / 6);   // pomost bez zapasu: krawędź to krawędź
  }
  if (DROGA_GOTOWA) d = Math.min(d, odDrogi(x, y) / (DROGA_SZER * 0.44));   // grobla: brzeg wody tam, gdzie kończy się narysowana droga (27 XI: stał obok niej w wodzie)
  for (const k of KLADKI) d = Math.min(d, odOdcinka(x, y, k.a, k.b) / k.szer);
  d = Math.min(d, odOdcinka(x, y, cw.kladka.a, cw.kladka.b) / cw.kladka.szer);
  d *= 1 + 0.07 * szumBrzegu(x, y);
  return (d - 1) / PAS_PLYTKI;
}
let DROGA_GOTOWA = false;
export const wPlytkiej = (p) => { const g = glebia(p.x, p.y); return g > 0 && g <= 1; };
export const wGlebokiej = (p) => glebia(p.x, p.y) > 1;
// Punkt w głębokiej wodzie tuż za płycizną, 180–420 od celu: stąd wynurza się topielec.
export function punktZWody(cel, unikaj = []) {                          // unikaj: [{x, y, r}], np. płonące pochodnie
  let naj = null;
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2, r = 180 + Math.random() * 240, p = { x: cel.x + Math.cos(a) * r, y: cel.y + Math.sin(a) * r * 0.8 };
    if (p.x < 40 || p.y < 70 || p.x > SZER - 40 || p.y > WYS - 40) continue;
    if (unikaj.some(u => Math.hypot(u.x - p.x, u.y - p.y) < u.r)) continue;
    if (BAGNO && p.x > 1340 && p.x < 1930 && p.y > 400 && p.y < 1080) continue;   // nie spod chaty ani spod pomostu (28 XI 02:45)
    const g = glebia(p.x, p.y);
    if (g > 1.02 && g < 1.6) return p;
    if (g > 1 && (!naj || g < naj.g)) naj = { ...p, g };
  }
  return naj;
}

// Drzewa: gęsty las dookoła, pusta polana w środku, prześwity przy mgłach.
let ziarno = 11;
const los = () => { ziarno = (ziarno + 0x6D2B79F5) | 0; let t = Math.imul(ziarno ^ (ziarno >>> 15), 1 | ziarno); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const DRZEWA = [];
(function posadzLas() {
  if (BAGNO) {                                                   // martwe drzewa na wyspach i trochę w płytkiej wodzie; nie przy chacie i kotle
    for (let i = 0; i < 8000 && DRZEWA.length < 150; i++) {
      const x = 40 + los() * (SZER - 80), y = 90 + los() * (WYS - 110), q = naWyspie(x, y);
      if (q > 1.25 || (q > 1 && los() < 0.6)) continue;
      { const B = CHATA_WIEDZMY.bryla; if (x > B.x0 - 40 && x < B.x1 + 40 && y > B.y0 - 60 && y < B.y1 + 260) continue; }   // chata i jej kładka
      const cx = (x - 1600) / 430, cy = (y - 1150) / 260; if (cx * cx + cy * cy < 0.85 * 0.85) continue;   // środkowa wyspa wolna: tu się walczy
      if (LATARNIE.some(l => Math.abs(x - l.x) < 140 && y > l.y - 90 && y < l.y + 280)) continue;   // drzewo nie zasłania pochodni
      if (DRZEWA.some(d => Math.hypot(d.x - x, d.y - y) < 105)) continue;
      DRZEWA.push({ x, y, h: 210 + los() * 120, wariant: (los() * 3) | 0, promien: 15 });
    }
    return;
  }
  for (let i = 0; i < 6000 && DRZEWA.length < 230; i++) {
    const x = 40 + los() * (SZER - 80), y = 90 + los() * (WYS - 110);
    const nx = (x - 1600) / 980, ny = (y - 1260) / 700;
    if (nx * nx + ny * ny < 1) continue;                         // polana
    let wMgle = false;
    for (const k in MGLY) { const m = MGLY[k]; if (Math.hypot(x - m.x, y - m.y) < m.r * 0.75) wMgle = true; }
    if (wMgle) continue;
    if (DRZEWA.some(d => Math.hypot(d.x - x, d.y - y) < 92)) continue;
    DRZEWA.push({ x, y, h: 210 + los() * 120, wariant: (los() * 3) | 0, promien: 15 });
  }
  // kilka samotnych drzew na skraju polany
  for (const [x, y] of [[980, 900], [2250, 860], [1080, 1640], [2180, 1600], [2420, 1350]]) DRZEWA.push({ x, y, h: 240, wariant: 1, promien: 15 });
})();

// Drzewa z arkuszy Przemka (docs/materialy-przemka.md, etap A): który rysunek stoi w którym miejscu.
// Osobne ziarno, żeby las stał tam, gdzie stał. Pień i kłoda są niższe, więc mają mniejsze h (cień i zasłanianie).
// Bez obrazu rekwizytów gra rysuje drzewa kodem według wariantu, jak dotąd.
let ziarno2 = 29;
const los2 = () => { ziarno2 = (ziarno2 + 0x6D2B79F5) | 0; let t = Math.imul(ziarno2 ^ (ziarno2 >>> 15), 1 | ziarno2); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const LAS = BAGNO
  ? [['swierk_b', 8], ['martwe_a', 24], ['martwe_b', 24], ['zlamane', 16], ['mszyste', 12], ['pien', 8], ['kloda', 8]]   // bagno: martwy las
  : [['swierk_a', 30], ['swierk_b', 30], ['martwe_a', 7], ['martwe_b', 7], ['zlamane', 6], ['sosna', 6], ['mszyste', 6], ['pien', 4], ['kloda', 4]];
const WYS_RYSUNKU = { pien: 0.3, kloda: 0.34, sosna: 0.8, mszyste: 0.8, zlamane: 0.85, martwe_a: 0.9, martwe_b: 0.85 };
for (let i = 0; i < DRZEWA.length; i++) {
  const d = DRZEWA[i];
  if (!BAGNO && i >= DRZEWA.length - 5) { d.rys = ['swierk_a', 'mszyste', 'martwe_a', 'sosna', 'swierk_b'][i - DRZEWA.length + 5]; }  // samotne na skraju
  else { let r = los2() * 100; for (const [n, w] of LAS) { if ((r -= w) < 0) { d.rys = n; break; } } }
  d.lustro = los2() < 0.5;
  d.h *= WYS_RYSUNKU[d.rys] || 1;
}

// Kępy trawy, mchu, ziemi i liści na ziemi (bez zderzeń): gęściej w lesie, rzadziej na polanie,
// nie w chacie, na podwórku ani przy ognisku.
// Droga do chaty (Patryk, 25 XI 13:12: „żeby jakaś droga prowadziła do tej chatki”): z lasu na południowym zachodzie,
// między totemem z czaszką a totemami na południu, łukiem obok ogniska pod samą furtkę. Punkty to oś drogi, gęsto co ~12 jednostek.
export const DROGA_SZER = 74;
function gladka(P) {                                                         // Catmull-Rom przez punkty, gęsto co ~12 jednostek
  const wyn = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 12));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      wyn.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  wyn.push(P[P.length - 1]);
  return wyn;
}
export const DROGA = (() => {
  const furtka = { x: CHATA.x + 455 * CHATA.skala, y: CHATA.y + 860 * CHATA.skala };
  // na bagnie to grobla: od południowego brzegu mapy na środkową wyspę, do kotła
  const P = BAGNO ? [{ x: 1500, y: WYS + 60 }, { x: 1450, y: 2150 }, { x: 1540, y: 1850 }, { x: 1500, y: 1600 }, { x: 1560, y: 1420 }, { x: 1600, y: 1250 }]
    : [{ x: 820, y: WYS + 60 }, { x: 980, y: 2080 }, { x: 1180, y: 1760 }, { x: 1330, y: 1480 }, { x: 1470, y: 1290 }, { x: furtka.x - 40, y: furtka.y + 40 }, { x: furtka.x, y: furtka.y - 10 }];
  return gladka(P);
})();
// Droga na bagno (Patryk, 27 XI 17:19: „zrobić drogę na polanie do góry i do góry idziemy do chatki”): z polany obok chaty,
// przez las na północ, do górnego brzegu mapy. Po świcie bohater idzie nią, a na jej końcu wczytuje się bagno.
export const DROGA_POLNOC = BAGNO ? [] : gladka([{ x: 1900, y: 1215 }, { x: 2010, y: 1080 }, { x: 2090, y: 860 }, { x: 2130, y: 620 }, { x: 2090, y: 380 }, { x: 2150, y: 160 }, { x: 2170, y: -60 }]);
export function odDrogi(x, y) { let m = Infinity; for (const p of DROGA) m = Math.min(m, Math.hypot(p.x - x, p.y - y)); for (const p of DROGA_POLNOC) m = Math.min(m, Math.hypot(p.x - x, p.y - y)); return m; }
export function odDrogiPolnoc(x, y) { let m = Infinity; for (const p of DROGA_POLNOC) m = Math.min(m, Math.hypot(p.x - x, p.y - y)); return m; }
// Na drodze nie rosną drzewa (las był posadzony wcześniej, więc zdejmujemy te, które na nią wpadły).
for (let i = DRZEWA.length - 1; i >= 0; i--) if (odDrogi(DRZEWA[i].x, DRZEWA[i].y) < DROGA_SZER * 0.75) DRZEWA.splice(i, 1);
DROGA_GOTOWA = true;
if (BAGNO) for (let i = DRZEWA.length - 1; i >= 0; i--) { const d = DRZEWA[i]; if (KLADKI.some(k => odOdcinka(d.x, d.y, k.a, k.b) < 60)) DRZEWA.splice(i, 1); }


// Rzeczy przy drodze z arkusza obozu Przemka (rekwizyty-oboz.jpg): stos drewna, beczki
// i pochodnia przy furtce. Stawiane względem drogi: f to miejsce na drodze (0 skraj lasu, 1 furtka),
// bok to strona (-1 lewa, 1 prawa, patrząc ku chacie), od to odległość od środka drogi. szer: szerokość w świecie,
// promien: zderzenie (0 = przechodzi się przez nie).
// Handlarz stoi przy drodze, po lewej idąc ku chacie, kawałek przed ogniskiem.
export const MIEJSCE_HANDLARZA = BAGNO ? { x: 1380, y: 1250 } : (() => {
  const i = Math.round(0.7 * (DROGA.length - 1)), p = DROGA[i], q = DROGA[i + 1], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
  return { x: p.x + dy / d * 78, y: p.y - dx / d * 78 };
})();
// Na bagnie (28 XI 02:50): miejsca „stos” i „wóz” były tylko napisem, bez rysunku i bez zderzeń. Stos to rysunek drewna;
// wozu nie ma w żadnym arkuszu, więc do czasu obrazu stoi beczka z tym samym herbem (docs/bagno.md, lista obrazów).
export const RZECZY = BAGNO ? [
  { rys: 'drewno', x: 1395, y: 1085, szer: 78, promien: 22 },
  { rys: 'beczka', x: 765, y: 1012, szer: 40, promien: 17 },
  { rys: 'beczka', x: 737, y: 1034, szer: 36, promien: 15, lustro: true },
] : [
  { rys: 'drewno', f: 0.52, bok: 1, od: 82, szer: 78, promien: 22 },
  { rys: 'beczka', f: 0.86, bok: -1, od: 82, szer: 40, promien: 17 },
  { rys: 'beczka', f: 0.835, bok: -1, od: 112, szer: 38, promien: 16, lustro: true },
  { rys: 'pochodnia', f: 0.93, bok: -1, od: 58, szer: 30, promien: 0, swiatlo: true },
].map(r => {
  const i = Math.min(DROGA.length - 2, Math.round(r.f * (DROGA.length - 1))), p = DROGA[i], q = DROGA[i + 1];
  const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
  return { ...r, x: p.x - dy / d * r.od * r.bok, y: p.y + dx / d * r.od * r.bok };
});

export const OZDOBY = [];
(function rozsyp() {
  const POLANA = BAGNO ? ['bloto', 'bloto', 'mech_a', 'mech_c', 'mech_d', 'trawa_c', 'trawa_d', 'trawa_f', 'trawa_g', 'ziemia_d']
    : ['trawa_a', 'trawa_b', 'trawa_c', 'trawa_d', 'trawa_e', 'trawa_f', 'trawa_g', 'trawa_a', 'trawa_b', 'trawa_e', 'ziemia_b', 'mech_c', 'bloto'];
  const LASU = BAGNO ? ['mech_a', 'mech_b', 'mech_c', 'mech_d', 'mech_e', 'bloto', 'bloto', 'trawa_c', 'trawa_d', 'trawa_f', 'krzak_a']
    : ['mech_a', 'mech_b', 'mech_c', 'mech_d', 'mech_e', 'liscie', 'liscie', 'trawa_c', 'trawa_d', 'trawa_f', 'ziemia_d', 'krzak_a', 'krzak_b', 'krzak_b'];
  const PLASKIE = /^(ziemia|mech|bloto|liscie)/;
  const chata = { x0: CHATA.x + 10, x1: CHATA.x + 951 * CHATA.skala, y0: CHATA.y + 330 * CHATA.skala, y1: CHATA.podstawa + 70 };
  for (let i = 0; i < 9000 && OZDOBY.length < 420; i++) {
    const x = 30 + los2() * (SZER - 60), y = 70 + los2() * (WYS - 100);
    const nx = (x - 1600) / 980, ny = (y - 1260) / 700, naPolanie = nx * nx + ny * ny < 0.92;
    if (naPolanie && los2() < 0.75) continue;                                            // polana rzadziej
    if (x > chata.x0 - 40 && x < chata.x1 + 30 && y > chata.y0 && y < chata.y1) continue;
    if (Math.hypot(x - OGNISKO.x, (y - OGNISKO.y) * 1.4) < 120) continue;
    if (odDrogi(x, y) < DROGA_SZER * 0.9) continue;
    if (RZECZY.some(r => Math.hypot(r.x - x, r.y - y) < r.szer * 0.6)) continue;
    if (BAGNO && glebia(x, y) > 0.2) continue;                                                       // w wodzie nic nie leży
    if (BAGNO && x > CHATA_WIEDZMY.bryla.x0 - 20 && x < CHATA_WIEDZMY.bryla.x1 + 20 && y > CHATA_WIEDZMY.bryla.y0 - 40 && y < CHATA_WIEDZMY.bryla.y1 + 20) continue;                                     // na drodze nic nie rośnie
    const lista = naPolanie ? POLANA : LASU, rys = lista[(los2() * lista.length) | 0];
    const odst = PLASKIE.test(rys) ? 110 : 60;
    if (OZDOBY.some(o => Math.hypot(o.x - x, o.y - y) < Math.max(odst, o.odst))) continue;
    if (/^krzak/.test(rys) && DRZEWA.some(d => Math.hypot(d.x - x, d.y - y) < 40)) continue;
    OZDOBY.push({ x, y, rys, odst, lustro: los2() < 0.5, skala: 0.8 + los2() * 0.45, plaskie: PLASKIE.test(rys), stoi: /^krzak/.test(rys) });
  }
})();

// Trzciny i błoto na brzegach wody (bagno): kępy wysokiej trawy w pasie płytkiej wody.

// Trzciny w płytkiej wodzie przy brzegach wysp (bagno).
if (BAGNO) for (let i = 0, n = 0; i < 20000 && n < 260; i++) {
  const x = 40 + los2() * (SZER - 80), y = 80 + los2() * (WYS - 110), g = glebia(x, y);
  if (g < 0.05 || g > 0.85) continue;
  { const B = CHATA_WIEDZMY.bryla; if (x > B.x0 && x < B.x1 && y > B.y0 && y < B.y1 + 220) continue; }
  if (OZDOBY.some(o => Math.hypot(o.x - x, o.y - y) < 46)) continue;
  const rys = ['trawa_c', 'trawa_d', 'trawa_f', 'trawa_c', 'trawa_d'][(los2() * 5) | 0];
  OZDOBY.push({ x, y, rys, odst: 46, lustro: los2() < 0.5, skala: 0.9 + los2() * 0.5, plaskie: false, stoi: false }); n++;
}

// Siatka drzew, żeby szybko sprawdzać zderzenia.
const KOM = 128, siatka = new Map();
// Kłoda leży, więc nie wystarczy jej jedno kółko u nasady (28 XI: przechodziło się przez jej pień). Kółka wzdłuż osi
// z rysunku (grafika/rekwizyty.webp, „kloda” 265×209, nasada w 0.198, 0.943): od (45, 180) do (235, 85) px rysunku.
const KLODY = [];
for (const d of DRZEWA) if (d.rys === 'kloda') {
  const k = d.h / (209 * 0.943), sx = d.lustro ? -1 : 1;
  for (let i = 0; i <= 5; i++) { const t = i / 5, px = 45 + 190 * t - 52.5, py = 180 - 95 * t - 197; KLODY.push({ x: d.x + sx * px * k, y: d.y + py * k, promien: 26 * k }); }
}
// Krzaki (28 XI, Patryk: „każdy obiekt ma być fizyczny a nie grafika”): przechodziło się przez nie. Kółko w dolnej części krzaka,
// mniejsze niż rysunek, żeby bohater chował się za gałęziami, a nie odbijał od powietrza (rysunek 78 j. szerokości razy skala).
const KRZAKI = OZDOBY.filter(o => o.stoi).map(o => ({ x: o.x, y: o.y - 8 * o.skala, promien: 19 * o.skala }));
for (const d of [...DRZEWA, ...KLODY, ...KRZAKI]) { const k = ((d.x / KOM) | 0) * 1000 + ((d.y / KOM) | 0); (siatka.get(k) || siatka.set(k, []).get(k)).push(d); }

// Wypycha koło o promieniu r z prostokąta najkrótszą drogą (także gdy środek jest już w środku prostokąta).
function odepchnijOdProstokata(p, s, r) {
  const nx = Math.max(s.x0, Math.min(p.x, s.x1)), ny = Math.max(s.y0, Math.min(p.y, s.y1));
  const ex = p.x - nx, ey = p.y - ny, dd = Math.hypot(ex, ey);
  if (dd >= r) return;
  if (dd > 0.0001) { p.x = nx + ex / dd * r; p.y = ny + ey / dd * r; return; }
  const g = p.y - s.y0, dl = s.y1 - p.y, l = p.x - s.x0, pr = s.x1 - p.x, m = Math.min(g, dl, l, pr);
  if (m === g) p.y = s.y0 - r; else if (m === dl) p.y = s.y1 + r; else if (m === l) p.x = s.x0 - r; else p.x = s.x1 + r;
}

export const wIzbie = (p) => p.x > CHATA.izba.x0 && p.x < CHATA.izba.x1 && p.y > CHATA.izba.y0 && p.y < CHATA.izba.y1 + 4;

function odepchnijOdOdcinka(p, a, b, r) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L; t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx, cy = a.y + t * dy, ex = p.x - cx, ey = p.y - cy, d = Math.hypot(ex, ey);
  if (d < r && d > 0.0001) { p.x = cx + ex / d * r; p.y = cy + ey / d * r; }
}

// Wypycha postać (x, y, promien) z drzew, ścian chaty, płotów i ogniska.
// Bohater na bagnie nie wchodzi do wody wcale (Patryk, 27 XI 23:34: „stoje jak na mapie”, „a to jest woda”): granica to brzeg (głębia 0),
// a nie próg głębokiej wody. Potwory dalej brną.
export const PROG_BOHATERA = BAGNO ? 0.02 : 1;
export function zderzenia(p, r, plywa = false, prog = 1) {   // plywa: potwory na bagnie brną też przez głęboką wodę (wolno), tylko bohater nie
  const cx = (p.x / KOM) | 0, cy = (p.y / KOM) | 0;
  for (let ix = cx - 1; ix <= cx + 1; ix++) for (let iy = cy - 1; iy <= cy + 1; iy++) {
    const lista = siatka.get(ix * 1000 + iy); if (!lista) continue;
    for (const d of lista) {
      const dx = p.x - d.x, dy = p.y - d.y, q = Math.hypot(dx, dy), m = r + d.promien;
      if (q < m && q > 0.001) { p.x = d.x + dx / q * m; p.y = d.y + dy / q * m; }
    }
  }
  for (let k = 0; k < 2; k++) {                                       // dwa razy: w rogu dwie ściany pchają naraz
    for (const q of CHATA.sciany) odepchnijOdProstokata(p, q, r);
    for (const q of CHATA.sprzety) odepchnijOdProstokata(p, q, r);
    if (!CHATA.drzwiOtwarte) {                                        // zamknięte drzwi: bohater w izbie zostaje w izbie, reszta na zewnątrz
      const q = CHATA.przejscie;                                       // (wcześniej wypychały zawsze na zewnątrz, więc z izby przechodziło się przez nie)
      if (p.x > q.x0 - r && p.x < q.x1 + r && p.y > q.y0 - r && p.y < q.y1 + r) p.y = p.wChacie ? q.y0 - r : q.y1 + r;
    }
  }
  for (const [a, b] of CHATA.ploty) odepchnijOdOdcinka(p, a, b, r);
  for (const t of RZECZY) if (t.promien) {
    const dx = p.x - t.x, dy = p.y - t.y, q = Math.hypot(dx, dy), m = r + t.promien;
    if (q < m && q > 0.001) { p.x = t.x + dx / q * m; p.y = t.y + dy / q * m; }
  }
  for (const t of TOTEMY) {
    const dx = p.x - t.x, dy = p.y - t.y, q = Math.hypot(dx, dy), m = r + t.promien;
    if (q < m && q > 0.001) { p.x = t.x + dx / q * m; p.y = t.y + dy / q * m; }
  }
  if (BAGNO) {
    const cw = CHATA_WIEDZMY;
    for (let k = 0; k < 2; k++) for (const lam of cw.sciany) for (let i = 0; i + 1 < lam.length; i++) {   // ściana frontowa: odcinki, przerwa na drzwi
      const a = lam[i], b2 = lam[i + 1], dx = b2.x - a.x, dy = b2.y - a.y, L = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)), qx = a.x + t * dx, qy = a.y + t * dy, e = Math.hypot(p.x - qx, p.y - qy), m = r * 0.8;
      if (e < m && e > 0.001) { p.x = qx + (p.x - qx) / e * m; p.y = qy + (p.y - qy) / e * m; }
    }
    if (wWielokacie(p.x, p.y, cw.dom) && !wWielokacie(p.x, p.y, cw.izba)) {   // w ścianach, meblach albo pod domem: na najbliższy brzeg izby albo na zewnątrz
      const a = najblizszyNaBrzegu(p, cw.izba), z = najblizszyNaBrzegu(p, cw.dom), q = a.d < z.d ? a : z;
      const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
      p.x = q.x + dx / L * 1.5; p.y = q.y + dy / L * 1.5;                  // za brzeg, w stronę, w którą już szedł
    }
    { const [a, b2] = cw.drzwiOtwarte ? cw.skrzydlo : cw.drzwiOdc, dx = b2.x - a.x, dy = b2.y - a.y, L = dx * dx + dy * dy;   // drzwi albo otwarte skrzydło
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)), qx = a.x + t * dx, qy = a.y + t * dy, e = Math.hypot(p.x - qx, p.y - qy), m = r * 0.8;
      if (e < m && e > 0.001) { p.x = qx + (p.x - qx) / e * m; p.y = qy + (p.y - qy) / e * m; } }
    { const dx = p.x - cw.kociol.x, dy = p.y - cw.kociol.y, q = Math.hypot(dx, dy), m = r + cw.kociol.promien; if (q < m && q > 0.001) { p.x = cw.kociol.x + dx / q * m; p.y = cw.kociol.y + dy / q * m; } }
    for (const l of cw.slupy) { const dx = p.x - l.x, dy = p.y - l.y, q = Math.hypot(dx, dy), m = r + 7; if (q < m && q > 0.001) { p.x = l.x + dx / q * m; p.y = l.y + dy / q * m; } }   // słupy chaty
    for (const l of LATARNIE) { const dx = p.x - l.x, dy = p.y - l.y, q = Math.hypot(dx, dy), m = r + 8; if (q < m && q > 0.001) { p.x = l.x + dx / q * m; p.y = l.y + dy / q * m; } }   // pal pochodni
    // głęboka woda: krok po kroku pod spadek głębokości, aż do płycizny
    for (let k = 0; !plywa && k < 40 && glebia(p.x, p.y) > prog; k++) {
      const h = 6, gx = glebia(p.x + h, p.y) - glebia(p.x - h, p.y), gy = glebia(p.x, p.y + h) - glebia(p.x, p.y - h), gl = Math.hypot(gx, gy) || 1;
      p.x -= gx / gl * 5; p.y -= gy / gl * 5;
    }
  }
  const o = Math.hypot(p.x - OGNISKO.x, p.y - OGNISKO.y), mo = r + OGNISKO.promien;
  if (o < mo && o > 0.001) { p.x = OGNISKO.x + (p.x - OGNISKO.x) / o * mo; p.y = OGNISKO.y + (p.y - OGNISKO.y) / o * mo; }
  p.x = Math.max(30, Math.min(SZER - 30, p.x)); p.y = Math.max(60, Math.min(WYS - 30, p.y));
}

// Droga potworów (28 XI, Patryk: „potwory jak debile”, „przez domek przechodzą”): szły prosto na bohatera i stawały pod ścianą,
// za kłodą albo pod chatą, gdy bohater był w izbie. Teraz mapa wolnych pól co 20 jednostek (drzewa, kłody, ściany, dom wiedźmy;
// drzwi izby liczą się jako przejście, bo potwory je wyważają) i odległość od bohatera liczona falą. Potwór, który nie widzi
// bohatera wprost, idzie w dół tej odległości: obchodzi przeszkody i wchodzi do izby drzwiami.
const DP = 20, PW = Math.ceil(SZER / DP), PH = Math.ceil(WYS / DP);
let wolneP = null, odlP = null, odlKom = -1;
function policzWolneP() {
  wolneP = new Uint8Array(PW * PH);
  const cw = CHATA_WIEDZMY, bylo = cw && cw.drzwiOtwarte;
  if (cw) cw.drzwiOtwarte = false;                       // drzwi zamknięte; ich odcinek zdejmujemy niżej, żeby było przejście
  const odc = cw && cw.drzwiOdc; if (cw) cw.drzwiOdc = [{ x: -9999, y: -9999 }, { x: -9998, y: -9999 }];
  for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
    const x = (i + 0.5) * DP, y = (j + 0.5) * DP; if (x < 30 || y < 60 || x > SZER - 30 || y > WYS - 30) continue;
    const q = { x, y }; zderzenia(q, 12, true);
    if (Math.hypot(q.x - x, q.y - y) < 3) wolneP[j * PW + i] = 1;
  }
  if (cw) { cw.drzwiOdc = odc; cw.drzwiOtwarte = bylo; }
}
const SASIEDZI = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function krok(i, j, a, b) { const n = (j + b) * PW + i + a; if (i + a < 0 || j + b < 0 || i + a >= PW || j + b >= PH || !wolneP[n]) return -1; if (a && b && (!wolneP[j * PW + i + a] || !wolneP[(j + b) * PW + i])) return -1; return n; }
function policzOdl(bi, bj) {
  odlP = odlP || new Int16Array(PW * PH); odlP.fill(-1);
  const kol = [];
  for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const i = bi + a, j = bj + b; if (i >= 0 && j >= 0 && i < PW && j < PH && wolneP[j * PW + i] && odlP[j * PW + i] < 0) { odlP[j * PW + i] = 0; kol.push(j * PW + i); } }
  for (let h = 0; h < kol.length; h++) {
    const c = kol[h], i = c % PW, j = (c / PW) | 0;
    for (const [a, b] of SASIEDZI) { const n = krok(i, j, a, b); if (n >= 0 && odlP[n] < 0) { odlP[n] = odlP[c] + 1; kol.push(n); } }
  }
}
function widac(ax, ay, bx, by) {                          // prosta od potwora do bohatera idzie tylko po wolnych polach
  const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 10);
  for (let k = 1; k < n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; if (!wolneP[((y / DP) | 0) * PW + ((x / DP) | 0)]) return false; }
  return true;
}
// Punkt, ku któremu potwór ma iść, albo null: wtedy prosto na bohatera.
export function drogaPotwora(e, b) {
  if (!wolneP) policzWolneP();
  const bi = (b.x / DP) | 0, bj = (b.y / DP) | 0;
  if (bj * PW + bi !== odlKom) { odlKom = bj * PW + bi; policzOdl(bi, bj); }
  const i = (e.x / DP) | 0, j = (e.y / DP) | 0, c = j * PW + i;
  if (i < 0 || j < 0 || i >= PW || j >= PH) return null;
  if (odlP[c] < 0) {                                       // stoi na polu zajętym (przy ścianie, pod pniem): idzie na najlepsze wolne pole obok
    let naj = -1;
    for (let bb = -2; bb <= 2; bb++) for (let a = -2; a <= 2; a++) { const x = i + a, y = j + bb, n = y * PW + x; if (x >= 0 && y >= 0 && x < PW && y < PH && odlP[n] >= 0 && (naj < 0 || odlP[n] < odlP[naj])) naj = n; }
    return naj < 0 ? null : { x: (naj % PW + 0.5) * DP, y: (((naj / PW) | 0) + 0.5) * DP };
  }
  if (odlP[c] <= 2 || widac(e.x, e.y, b.x, b.y)) return null;
  let k = c, ki = i, kj = j;
  for (let s = 0; s < 3; s++) {                           // trzy pola w dół odległości: gładszy skręt niż pole po polu
    let naj = -1;
    for (const [a, bb] of SASIEDZI) { const n = krok(ki, kj, a, bb); if (n >= 0 && odlP[n] >= 0 && odlP[n] < odlP[k] && (naj < 0 || odlP[n] < odlP[naj])) naj = n; }
    if (naj < 0) break; k = naj; ki = k % PW; kj = (k / PW) | 0;
  }
  return k === c ? null : { x: (ki + 0.5) * DP, y: (kj + 0.5) * DP };
}

// Potwór wychodzi spod totemu tej strony (przed nim, w stronę polany).
// Ląd i płycizna, na które bohater może dojść od ogniska (siatka co 20 px, liczona raz, przy pierwszym pytaniu). Na bagnie wiedźma,
// która znalazła się poza nim (głęboka woda albo płycizna odcięta głębią), brnie do bohatera, zamiast stać tam, gdzie miecz nie sięga.
let dojscie = null;
const DK = 20, DW = Math.ceil(SZER / DK) + 1, DH = Math.ceil(WYS / DK) + 1;
export function dlaBohatera(p) {
  if (!dojscie) {
    const wolne = new Uint8Array(DW * DH);
    for (let j = 0; j < DH; j++) for (let i = 0; i < DW; i++) wolne[j * DW + i] = glebia(i * DK, j * DK) < PROG_BOHATERA && i * DK > 30 && j * DK > 60 && i * DK < SZER - 30 && j * DK < WYS - 30 ? 1 : 0;   // tylko głęboka woda i brzeg mapy: drzewa i kładki obejdzie
    dojscie = new Uint8Array(DW * DH); const s = Math.round(START.x / DK) + Math.round(START.y / DK) * DW, kol = [s]; dojscie[s] = 1;
    for (let h = 0; h < kol.length; h++) { const c = kol[h], x = c % DW; for (const n of [x > 0 ? c - 1 : -1, x < DW - 1 ? c + 1 : -1, c - DW, c + DW]) if (n >= 0 && n < DW * DH && !dojscie[n] && wolne[n]) { dojscie[n] = 1; kol.push(n); } }
  }
  const i = Math.round(p.x / DK), j = Math.round(p.y / DK);
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const x = i + a, y = j + b; if (x >= 0 && y >= 0 && x < DW && y < DH && dojscie[y * DW + x]) return true; }   // obok drzewa też się liczy
  return false;
}
export function punktWMgle(nazwa, stan = null) {
  let lista = TOTEMY.filter((t, i) => t.mgla === nazwa && !(stan && stan[i].zniszczony));
  if (!lista.length) lista = TOTEMY.filter(t => t.mgla === nazwa);
  const t = lista[(Math.random() * lista.length) | 0];
  const a = Math.atan2(1260 - t.y, 1600 - t.x) + (Math.random() - 0.5) * 1.6, d = 45 + Math.random() * 40;
  return { x: t.x + Math.cos(a) * d, y: t.y + Math.sin(a) * d * 0.7 };
}


// Miejsca do obejrzenia we wstępie (dane.js, WSTEP). Ognisko i totem na polanie, reszta w chacie.
export const KARTKA_START = BAGNO ? { x: 1640, y: 705 } : null;   // pierwsza kartka na bagnie: w izbie wiedźmy, przy stole
export const MIEJSCA = BAGNO ? [
  { id: 'ognisko', nazwa: 'ognisko', x: OGNISKO.x, y: OGNISKO.y + 20, mysl: 'Ognisko na wyspie, kamienie mokre od mgły. Jedyne suche miejsce w okolicy.', wsk: 'Na wyspie ktoś ułożył kamienie pod ogień.' },
  { id: 'kociol', nazwa: 'kocioł', x: CHATA_WIEDZMY.kociol.x - 10, y: CHATA_WIEDZMY.kociol.y + 30, mysl: 'Kocioł nad żarem. W środku coś gęstego, jeszcze ciepłe. Pachnie ziołami i krwią.', wsk: 'Na pomoście przed chatą coś bulgocze. Ktoś tu gotował.' },
  { id: 'chata', nazwa: 'izbę wiedźmy', x: 1560, y: 690, mysl: 'Słoje, zioła, czaszki na półkach. Na stole otwarta księga. Świeca jeszcze się pali, a wiedźmy nie ma.', wsk: 'Chata na palach, drzwi zamknięte. Ktoś w niej mieszka?' },
  { id: 'stos', nazwa: 'drewno', x: STOS_DREWNA.x, y: STOS_DREWNA.y, mysl: 'Suche polana złożone na wyspie. Tutaj suche jest cenniejsze od złota.', wsk: 'Ogień pod kotłem trzeba czymś karmić.' },
  { id: 'kladka', nazwa: 'kładkę', x: 1100, y: 1068, mysl: 'Deski śliskie, jedna złamana. Coś pod nimi przepłynęło. Duże.', wsk: 'Na zachód prowadzą deski nad wodą.' },
  { id: 'woz', nazwa: 'beczki', x: 752, y: 1072, mysl: 'Beczki w błocie, rozbite. Na denku wypalony herb: ten sam, co na pancerzu rycerza. Był tu przede mną.', wsk: 'Na zachodniej wyspie coś leży w błocie.' },
  { id: 'totem', nazwa: 'kamień ze znakiem', x: 2580 - 30, y: 1050 + 25, mysl: 'Półksiężyc i trzcina wyryte w kamieniu. Znak z amuletu. Ręka płonie, woda wokół się burzy.', wsk: 'Na wschodniej wyspie stoi kamień. Amulet ciąży w dłoni.' },
] : [
  { id: 'ognisko', nazwa: 'ognisko', x: OGNISKO.x, y: OGNISKO.y + 20, mysl: 'Kamienie ułożone równo, jeden przy drugim. Ktoś dbał, żeby ten ogień nie zgasł.' },
  { id: 'totem', nazwa: 'totem', x: TOTEMY[0].x + 30, y: TOTEMY[0].y + 20, mysl: 'Kość i pióra na palu. Dotykam go i ręka zapłonęła. Z lasu coś odpowiada.' },
  { id: 'stos', nazwa: 'stos drewna', x: STOS_DREWNA.x, y: STOS_DREWNA.y, mysl: 'Drewna na całą zimę. Nie planował odchodzić.' },
  { id: 'belka', nazwa: 'belkę nad drzwiami', x: CHATA.prog.x, y: CHATA.prog.y - 45, mysl: 'Nad drzwiami pięć imion, każde wyryte inną ręką. Ostatnie jeszcze się nie zatarło.' },
  { id: 'palenisko', nazwa: 'palenisko', x: CHATA.palenisko.x, y: CHATA.palenisko.y + 55, mysl: 'Żar jeszcze ciepły. Wyszedł najwyżej wczoraj.' },
  { id: 'poslanie', nazwa: 'posłanie', x: CHATA.poslanie.x + 20, y: CHATA.poslanie.y, mysl: 'Na wilczej skórze odcisk ciała. Ciężkiego, jakby spał w zbroi.' },
];
