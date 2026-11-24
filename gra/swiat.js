// Świat polany: las, chata, ognisko, mgły i wszystko, o co można się zderzyć.
// Mapa jest ustawiona ręcznie, a losowe są tylko drzewa w lesie (zawsze te same dzięki ziarnu).

export const SZER = 3200, WYS = 2400;

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
export const TOTEMY = [
  { mgla: 'zachod', rys: 'totem_czaszka', x: MGLY.zachod.x, y: MGLY.zachod.y, wys: 175, promien: 22 },
  { mgla: 'wschod', rys: 'totem_rogi', x: MGLY.wschod.x, y: MGLY.wschod.y, wys: 170, promien: 18 },
  { mgla: 'poludnie', rys: 'totem_obelisk', x: MGLY.poludnie.x - 60, y: MGLY.poludnie.y, wys: 150, promien: 22 },
  { mgla: 'poludnie', rys: 'totem_kamien', x: MGLY.poludnie.x + 70, y: MGLY.poludnie.y - 20, wys: 140, promien: 22 },
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
const LAS = [['swierk_a', 30], ['swierk_b', 30], ['martwe_a', 7], ['martwe_b', 7], ['zlamane', 6], ['sosna', 6], ['mszyste', 6], ['pien', 4], ['kloda', 4]];
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
export const OZDOBY = [];
(function rozsyp() {
  const POLANA = ['trawa_a', 'trawa_b', 'trawa_c', 'trawa_d', 'trawa_e', 'trawa_f', 'trawa_g', 'trawa_a', 'trawa_b', 'trawa_e', 'ziemia_b', 'mech_c', 'bloto'];
  const LASU = ['mech_a', 'mech_b', 'mech_c', 'mech_d', 'mech_e', 'liscie', 'liscie', 'trawa_c', 'trawa_d', 'trawa_f', 'ziemia_d', 'krzak_a', 'krzak_b', 'krzak_b'];
  const PLASKIE = /^(ziemia|mech|bloto|liscie)/;
  const chata = { x0: CHATA.x + 10, x1: CHATA.x + 951 * CHATA.skala, y0: CHATA.y + 330 * CHATA.skala, y1: CHATA.podstawa + 70 };
  for (let i = 0; i < 9000 && OZDOBY.length < 420; i++) {
    const x = 30 + los2() * (SZER - 60), y = 70 + los2() * (WYS - 100);
    const nx = (x - 1600) / 980, ny = (y - 1260) / 700, naPolanie = nx * nx + ny * ny < 0.92;
    if (naPolanie && los2() < 0.75) continue;                                            // polana rzadziej
    if (x > chata.x0 - 40 && x < chata.x1 + 30 && y > chata.y0 && y < chata.y1) continue;
    if (Math.hypot(x - OGNISKO.x, (y - OGNISKO.y) * 1.4) < 120) continue;
    const lista = naPolanie ? POLANA : LASU, rys = lista[(los2() * lista.length) | 0];
    const odst = PLASKIE.test(rys) ? 110 : 60;
    if (OZDOBY.some(o => Math.hypot(o.x - x, o.y - y) < Math.max(odst, o.odst))) continue;
    if (/^krzak/.test(rys) && DRZEWA.some(d => Math.hypot(d.x - x, d.y - y) < 40)) continue;
    OZDOBY.push({ x, y, rys, odst, lustro: los2() < 0.5, skala: 0.8 + los2() * 0.45, plaskie: PLASKIE.test(rys), stoi: /^krzak/.test(rys) });
  }
})();

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
  for (const t of TOTEMY) {
    const dx = p.x - t.x, dy = p.y - t.y, q = Math.hypot(dx, dy), m = r + t.promien;
    if (q < m && q > 0.001) { p.x = t.x + dx / q * m; p.y = t.y + dy / q * m; }
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

