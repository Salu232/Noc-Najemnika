// Świat polany: las, chata, ognisko, mgły i wszystko, o co można się zderzyć.
// Mapa jest ustawiona ręcznie, a losowe są tylko drzewa w lesie (zawsze te same dzięki ziarnu).

export const SZER = 3200, WYS = 2400;

// Która mapa (27 XI, początek bagna): ?mapa=bagno w adresie. Bez tego zawsze polana, tak jak dotąd.
// Bagno to na razie polana przerobiona kodem (martwy las, woda płytka i głęboka); obrazy z Gemini przyjdą później (docs/bagno.md).
// W artefakcie adresu nie da się zmienić, więc przycisk na ekranie startu zapisuje wybór w przeglądarce (noc-mapa) i przeładowuje grę.
// Patryk, 27 XI 14:57: na telefonie w artefakcie przycisk nie działał (pamięć przeglądarki albo zmiana adresu tam nie przechodzi).
// Dlatego najpierw window.name: zostaje w tej samej ramce po przeładowaniu, także w zamkniętej ramce artefaktu.
const zPamieci = () => { try { return localStorage.getItem('noc-mapa'); } catch (e) { return null; } };
const zNazwy = () => { try { const m = /noc-mapa=(\w+)/.exec(window.name || ''); return m && m[1]; } catch (e) { return null; } };
export const MAPA = (globalThis.MAPA_NOCY || (typeof location !== 'undefined' && new URLSearchParams(location.search).get('mapa')) || (typeof window !== 'undefined' && zNazwy()) || zPamieci() || 'polana') === 'bagno' ? 'bagno' : 'polana';
export const BAGNO = MAPA === 'bagno';

// Chata z Gemini (grafika/chata.webp, 951×951) w skali świata.
export const CHATA = { obrazSzer: 951, obrazWys: 951, skala: 0.62 };
CHATA.x = 1600 - (CHATA.obrazSzer * CHATA.skala) / 2;
CHATA.y = 1020 - 690 * CHATA.skala;               // podstawa ścian (690 w obrazie) leży na y = 1020
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

export const OGNISKO = { ...zObrazu(455, 1030), promien: 28 };
export const START = { x: OGNISKO.x + 90, y: OGNISKO.y + 40 };
// Stos drewna pod ścianą chaty, na lewo od drzwi (w obrazie chaty x 200–340, y 580–690): tu bierze się polano do ogniska.
export const STOS_DREWNA = zObrazu(270, 725);

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
export const TOTEMY = [
  { mgla: 'zachod', rys: 'totem_czaszka', x: MGLY.zachod.x, y: MGLY.zachod.y, wys: 175, promien: 22 },
];

// Drzewa: gęsty las dookoła, pusta polana w środku, prześwity przy mgłach.
let ziarno = 11;
const los = () => { ziarno = (ziarno + 0x6D2B79F5) | 0; let t = Math.imul(ziarno ^ (ziarno >>> 15), 1 | ziarno); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const DRZEWA = [];
(function posadzLas() {
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
  if (i >= DRZEWA.length - 5) { d.rys = ['swierk_a', 'mszyste', 'martwe_a', 'sosna', 'swierk_b'][i - DRZEWA.length + 5]; }  // samotne na skraju
  else { let r = los2() * 100; for (const [n, w] of LAS) { if ((r -= w) < 0) { d.rys = n; break; } } }
  d.lustro = los2() < 0.5;
  d.h *= WYS_RYSUNKU[d.rys] || 1;
}

// Kępy trawy, mchu, ziemi i liści na ziemi (bez zderzeń): gęściej w lesie, rzadziej na polanie,
// nie w chacie, na podwórku ani przy ognisku.
// Droga do chaty (Patryk, 25 XI 13:12: „żeby jakaś droga prowadziła do tej chatki”): z lasu na południowym zachodzie,
// między totemem z czaszką a totemami na południu, łukiem obok ogniska pod samą furtkę. Punkty to oś drogi, gęsto co ~12 jednostek.
export const DROGA_SZER = 74;
export const DROGA = (() => {
  const furtka = { x: CHATA.x + 455 * CHATA.skala, y: CHATA.y + 860 * CHATA.skala };
  const P = [{ x: 820, y: WYS + 60 }, { x: 980, y: 2080 }, { x: 1180, y: 1760 }, { x: 1330, y: 1480 }, { x: 1470, y: 1290 }, { x: furtka.x - 40, y: furtka.y + 40 }, { x: furtka.x, y: furtka.y - 10 }];
  const wyn = [];
  for (let i = 0; i < P.length - 1; i++) {                                   // Catmull-Rom przez punkty
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
})();
export function odDrogi(x, y) { let m = Infinity; for (const p of DROGA) m = Math.min(m, Math.hypot(p.x - x, p.y - y)); return m; }
// Na drodze nie rosną drzewa (las był posadzony wcześniej, więc zdejmujemy te, które na nią wpadły).
for (let i = DRZEWA.length - 1; i >= 0; i--) if (odDrogi(DRZEWA[i].x, DRZEWA[i].y) < DROGA_SZER * 0.75) DRZEWA.splice(i, 1);

// Woda na bagnie: elipsy. Głęboka (rx, ry) jest nie do przejścia, płytka to pas wokół niej (PLYTKA razy większy),
// w którym bohater i potwory brną wolniej. Droga (tu grobla) i obejście chaty zostają suche. Na polanie wody nie ma.
export const PLYTKA = 1.45;
export const WODA = BAGNO ? [
  { x: 820, y: 1060, rx: 210, ry: 120 },       // na zachód od chaty, między lasem a polaną
  { x: 2420, y: 1500, rx: 250, ry: 140 },      // na wschodzie, za ogniskiem
  { x: 1980, y: 1960, rx: 170, ry: 100 },      // na południu, przy grobli
  { x: 2500, y: 820, rx: 150, ry: 90 },        // w lesie na północnym wschodzie
  { x: 520, y: 1820, rx: 190, ry: 110 },       // w lesie na południowym zachodzie
  { x: 1450, y: 1720, rx: 110, ry: 62 },       // oczko na polanie, blisko drogi
] : [];
const wElipsie = (p, w, k) => { const dx = (p.x - w.x) / (w.rx * k), dy = (p.y - w.y) / (w.ry * k); return dx * dx + dy * dy; };
export const wGlebokiej = (p) => WODA.some(w => wElipsie(p, w, 1) < 1);
export const wPlytkiej = (p) => WODA.some(w => { const q = wElipsie(p, w, PLYTKA); return q < 1 && wElipsie(p, w, 1) >= 1; });
// Brzeg głębokiej wody najbliżej punktu (tu wynurzają się topielce).
export function brzegWody(w, kat) { return { x: w.x + Math.cos(kat) * w.rx * 1.08, y: w.y + Math.sin(kat) * w.ry * 1.08 }; }
if (BAGNO) for (let i = DRZEWA.length - 1; i >= 0; i--) if (WODA.some(w => wElipsie(DRZEWA[i], w, PLYTKA * 0.9) < 1)) DRZEWA.splice(i, 1);

// Rzeczy przy drodze z arkusza obozu Przemka (rekwizyty-oboz.jpg): stos drewna, beczki
// i pochodnia przy furtce. Stawiane względem drogi: f to miejsce na drodze (0 skraj lasu, 1 furtka),
// bok to strona (-1 lewa, 1 prawa, patrząc ku chacie), od to odległość od środka drogi. szer: szerokość w świecie,
// promien: zderzenie (0 = przechodzi się przez nie).
// Handlarz stoi przy drodze, po lewej idąc ku chacie, kawałek przed ogniskiem.
export const MIEJSCE_HANDLARZA = (() => {
  const i = Math.round(0.7 * (DROGA.length - 1)), p = DROGA[i], q = DROGA[i + 1], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
  return { x: p.x + dy / d * 78, y: p.y - dx / d * 78 };
})();
export const RZECZY = [
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
    if (BAGNO && WODA.some(w => wElipsie({ x, y }, w, 1.05) < 1)) continue;                                 // w głębokiej wodzie nic nie rośnie                                     // na drodze nic nie rośnie
    const lista = naPolanie ? POLANA : LASU, rys = lista[(los2() * lista.length) | 0];
    const odst = PLASKIE.test(rys) ? 110 : 60;
    if (OZDOBY.some(o => Math.hypot(o.x - x, o.y - y) < Math.max(odst, o.odst))) continue;
    if (/^krzak/.test(rys) && DRZEWA.some(d => Math.hypot(d.x - x, d.y - y) < 40)) continue;
    OZDOBY.push({ x, y, rys, odst, lustro: los2() < 0.5, skala: 0.8 + los2() * 0.45, plaskie: PLASKIE.test(rys), stoi: /^krzak/.test(rys) });
  }
})();

// Trzciny i błoto na brzegach wody (bagno): kępy wysokiej trawy w pasie płytkiej wody.
if (BAGNO) for (const w of WODA) for (let i = 0; i < Math.round(w.rx / 16); i++) {
  const a = los2() * Math.PI * 2, q = 1.0 + los2() * (PLYTKA - 0.95), rys = ['trawa_c', 'trawa_d', 'trawa_f', 'trawa_c', 'bloto'][(los2() * 5) | 0];
  OZDOBY.push({ x: w.x + Math.cos(a) * w.rx * q, y: w.y + Math.sin(a) * w.ry * q, rys, odst: 40, lustro: los2() < 0.5, skala: 0.9 + los2() * 0.5, plaskie: rys === 'bloto', stoi: false });
}

// Siatka drzew, żeby szybko sprawdzać zderzenia.
const KOM = 128, siatka = new Map();
for (const d of DRZEWA) { const k = ((d.x / KOM) | 0) * 1000 + ((d.y / KOM) | 0); (siatka.get(k) || siatka.set(k, []).get(k)).push(d); }

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
export function zderzenia(p, r) {
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
  for (const w of WODA) {                                             // głęboka woda: wypycha na brzeg (elipsa jak rozciągnięte koło)
    const ex = w.rx + r, ey = w.ry + r * 0.7, dx = (p.x - w.x) / ex, dy = (p.y - w.y) / ey, q = Math.hypot(dx, dy);
    if (q < 1 && q > 0.0001) { p.x = w.x + dx / q * ex; p.y = w.y + dy / q * ey; }
  }
  const o = Math.hypot(p.x - OGNISKO.x, p.y - OGNISKO.y), mo = r + OGNISKO.promien;
  if (o < mo && o > 0.001) { p.x = OGNISKO.x + (p.x - OGNISKO.x) / o * mo; p.y = OGNISKO.y + (p.y - OGNISKO.y) / o * mo; }
  p.x = Math.max(30, Math.min(SZER - 30, p.x)); p.y = Math.max(60, Math.min(WYS - 30, p.y));
}

// Potwór wychodzi spod totemu tej strony (przed nim, w stronę polany).
export function punktWMgle(nazwa, stan = null) {
  let lista = TOTEMY.filter((t, i) => t.mgla === nazwa && !(stan && stan[i].zniszczony));
  if (!lista.length) lista = TOTEMY.filter(t => t.mgla === nazwa);
  const t = lista[(Math.random() * lista.length) | 0];
  const a = Math.atan2(1260 - t.y, 1600 - t.x) + (Math.random() - 0.5) * 1.6, d = 45 + Math.random() * 40;
  return { x: t.x + Math.cos(a) * d, y: t.y + Math.sin(a) * d * 0.7 };
}


// Miejsca do obejrzenia we wstępie (dane.js, WSTEP). Ognisko i totem na polanie, reszta w chacie.
export const MIEJSCA = [
  { id: 'ognisko', nazwa: 'ognisko', x: OGNISKO.x, y: OGNISKO.y + 20, mysl: 'Kamienie ułożone równo, jeden przy drugim. Ktoś dbał, żeby ten ogień nie zgasł.' },
  { id: 'totem', nazwa: 'totem', x: TOTEMY[0].x + 30, y: TOTEMY[0].y + 20, mysl: 'Kość i pióra na palu. Dotykam go i ręka zapłonęła. Z lasu coś odpowiada.' },
  { id: 'stos', nazwa: 'stos drewna', x: STOS_DREWNA.x, y: STOS_DREWNA.y, mysl: 'Drewna na całą zimę. Nie planował odchodzić.' },
  { id: 'belka', nazwa: 'belkę nad drzwiami', x: CHATA.prog.x, y: CHATA.prog.y - 45, mysl: 'Nad drzwiami pięć imion, każde wyryte inną ręką. Ostatnie jeszcze się nie zatarło.' },
  { id: 'palenisko', nazwa: 'palenisko', x: CHATA.palenisko.x, y: CHATA.palenisko.y + 55, mysl: 'Żar jeszcze ciepły. Wyszedł najwyżej wczoraj.' },
  { id: 'poslanie', nazwa: 'posłanie', x: CHATA.poslanie.x + 20, y: CHATA.poslanie.y, mysl: 'Na wilczej skórze odcisk ciała. Ciężkiego, jakby spał w zbroi.' },
];
