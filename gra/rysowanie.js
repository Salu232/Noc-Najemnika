// Rysowanie gry w PixiJS: karta graficzna, a gdy jej nie ma, zwykłe płótno.
// Logika jest w walka.js. Tu tylko obraz: niczego w stanie gry nie zmieniamy poza kolejką śladów.

import { SZER, WYS, CHATA, OGNISKO, MGLY, DRZEWA } from './swiat.js';
import { BOHATER } from './dane.js';
import * as O from './obrazki.js';

const TAU = Math.PI * 2;
const PERSP = 0.62;            // świat widziany z ukosa: pion jest spłaszczony
const OB = 0x0b0a09;           // kolor obrysu
const MIECZ_DL = 70;           // długość ostrza w jednostkach świata (bohater ma około 80)
const ogr = (v, a, b) => Math.max(a, Math.min(b, v));
const losuj = (a, b) => a + Math.random() * (b - a);

export function przygotujRysowanie(cv, obrazChaty, { wymusProcesor = false } = {}) {
  const P = window.PIXI;
  const renderer = P.autoDetectRenderer({
    view: cv, width: innerWidth, height: innerHeight, resolution: Math.min(2, devicePixelRatio || 1), autoDensity: true,
    backgroundColor: 0x07080b, antialias: false, powerPreference: 'high-performance', forceCanvas: wymusProcesor,
  });
  const karta = renderer.type === P.RENDERER_TYPE.WEBGL;
  if (!karta) renderer.resolution = 1;          // bez karty liczy procesor: mniej pikseli
  const lekko = !karta;                          // bez karty: bez deszczu, kreskowania i winiety
  const tx = c => new P.Texture(new P.BaseTexture(c));

  // ---------- tekstury ----------
  const T = {
    ziemia: tx(O.kafelZiemi()), plamy: tx(O.plamyZiemi()),
    drzewa: [0, 1, 2, 3].map(w => { const d = O.obrazDrzewa(w); return { t: tx(d.canvas), ax: d.ox / d.w, ay: d.oy / d.h }; }),
    chata: tx(O.chataWDzien(obrazChaty)),
    cien: tx(O.cien()), kreski: tx(O.kreskowanie()), mgla: tx(O.mgielka()),
    stempel: tx(O.kolo(256, [[0, 'rgba(0,0,0,1)'], [0.45, 'rgba(0,0,0,0.62)'], [1, 'rgba(0,0,0,0)']])),
    cieplo: tx(O.kolo(256, [[0, 'rgba(255,150,70,0.5)'], [0.5, 'rgba(200,90,40,0.18)'], [1, 'rgba(0,0,0,0)']])),
    okoCzerwone: tx(O.kolo(64, [[0, 'rgba(255,80,60,1)'], [0.22, 'rgba(235,30,30,0.65)'], [1, 'rgba(0,0,0,0)']])),
    okoBursztyn: tx(O.kolo(64, [[0, 'rgba(255,200,80,1)'], [0.22, 'rgba(235,140,20,0.65)'], [1, 'rgba(0,0,0,0)']])),
    iskra: tx(O.kolo(32, [[0, 'rgba(255,245,210,1)'], [0.4, 'rgba(255,190,90,0.85)'], [1, 'rgba(0,0,0,0)']])),
    krew: ['#8e1418', '#6d0f12', '#a31b1e'].map(k => tx(O.kropka(32, k))),
  };
  const atlasy = {};
  for (const [nazwa, wzor, rysuj] of [['ghul', O.GHUL, O.rysujGhula], ['kolos', O.KOLOS, O.rysujKolosa]]) {
    const a = O.atlasWroga(wzor, rysuj), baza = new P.BaseTexture(a.canvas), klatki = [];
    for (let w = 0; w < 8; w++) for (let k = 0; k < wzor.klatki; k++) klatki.push(new P.Texture(baza, new P.Rectangle(k * a.cw, w * a.ch, a.cw, a.ch)));
    atlasy[nazwa] = { wzor, klatki, martwy: tx(O.obrazMartwego(wzor, rysuj)) };
  }

  // ---------- warstwy ----------
  const scena = new P.Container();
  const swiat = new P.Container();               // pod ciemnością
  const nad = new P.Container();                 // nad ciemnością, ta sama kamera
  const ekran = new P.Container();               // deszcz, winieta, błyski

  const ziemia = new P.TilingSprite(T.ziemia, SZER, WYS);
  const plamy = new P.Sprite(T.plamy); plamy.scale.set(O.SKALA_PLAM);
  const sladyRT = P.RenderTexture.create({ width: SZER, height: WYS, resolution: 0.5 });
  const slady = new P.Sprite(sladyRT);
  const cienie = new P.Container();
  const aktorzy = new P.Container(); aktorzy.sortableChildren = true;
  const echa = new P.Graphics();                 // powidoki uniku
  const powietrze = new P.Container();           // krew w locie
  const znakiZiemia = new P.Graphics();          // zapowiedź uderzenia kolosa i fala po nim: leżą na ziemi
  swiat.addChild(ziemia, plamy, slady, znakiZiemia, cienie, aktorzy, echa, powietrze);

  // drzewa
  const drzewa = DRZEWA.map((d, i) => {
    const w = i % 7 === 3 ? 3 : d.wariant, td = T.drzewa[w];
    const s = new P.Sprite(td.t); s.anchor.set(td.ax, td.ay);
    s.scale.set(d.h / O.DRZEWO_H / O.PX); s.position.set(d.x, d.y); s.zIndex = d.y;
    aktorzy.addChild(s); return s;
  });

  // chata
  const chata = new P.Sprite(T.chata); chata.position.set(CHATA.x, CHATA.y); chata.scale.set(CHATA.skala); chata.zIndex = CHATA.podstawa;
  aktorzy.addChild(chata);

  // ognisko: kamienie i polana (ogień jest nad ciemnością)
  const kamienie = new P.Graphics(); kamienie.position.set(OGNISKO.x, OGNISKO.y); kamienie.zIndex = OGNISKO.y - 1;
  kamienie.beginFill(0x000000, 0.35); kamienie.drawEllipse(0, 2, 32, 11); kamienie.endFill();
  kamienie.lineStyle(7, 0x0a0806); kamienie.moveTo(-16, 3); kamienie.lineTo(14, -5); kamienie.moveTo(-12, -6); kamienie.lineTo(16, 4);
  kamienie.lineStyle(4, 0x7a5a3e); kamienie.moveTo(-16, 3); kamienie.lineTo(14, -5); kamienie.moveTo(-12, -6); kamienie.lineTo(16, 4);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU; kamienie.lineStyle(1.2, OB); kamienie.beginFill(0x9a968e);
    kamienie.drawEllipse(Math.cos(a) * 24, Math.sin(a) * 9, 7, 5); kamienie.endFill();
  }
  aktorzy.addChild(kamienie);

  // bohater: jedna grafika, rysowana co klatkę
  const bohG = new P.Graphics(); aktorzy.addChild(bohG);
  const bohCien = new P.Sprite(T.cien); bohCien.anchor.set(0.5); cienie.addChild(bohCien);

  // nad ciemnością
  const mgla = new P.Container();
  const kleby = [];
  for (const k in MGLY) {
    const m = MGLY[k];
    for (let i = 0; i < 8; i++) {
      const s = new P.Sprite(T.mgla); s.anchor.set(0.5);
      kleby.push({ s, m, a: i / 8 * TAU, r: m.r * losuj(0.15, 0.55), v: losuj(0.05, 0.12) * (i % 2 ? 1 : -1), roz: m.r * losuj(1.0, 1.5), alfa: losuj(0.55, 0.85) });
      mgla.addChild(s);
    }
  }
  const znaki = new P.Graphics();                  // zapowiedzi ataków, garda, ogłuszenie
  const blaski = new P.Container();
  const blaskOgnia = new P.Sprite(T.cieplo); blaskOgnia.anchor.set(0.5); blaskOgnia.blendMode = P.BLEND_MODES.ADD;
  const blaskOkna = new P.Sprite(T.cieplo); blaskOkna.anchor.set(0.5); blaskOkna.blendMode = P.BLEND_MODES.ADD; blaskOkna.alpha = 0.7;
  blaski.addChild(blaskOgnia, blaskOkna);
  const plomienie = new P.Graphics(); plomienie.blendMode = P.BLEND_MODES.ADD; plomienie.zIndex = OGNISKO.y + 0.5;
  aktorzy.addChild(plomienie);
  const oczy = new P.Container();
  const iskry = new P.Container();
  const smugi = new P.Graphics();
  const duch = new P.Graphics(); duch.alpha = 0.33;
  const napisy = new P.Container();
  nad.addChild(mgla, znaki, blaski, oczy, smugi, iskry, duch, napisy);

  // ciemność z wyciętym światłem (rysowana do osobnej tekstury w połowie rozdzielczości)
  const ciemnoscC = new P.Container();
  const ciemnoscG = new P.Graphics();
  const kreski = new P.TilingSprite(T.kreski, 16, 16);
  const stemple = new P.Container();
  const stempel = () => { const s = new P.Sprite(T.stempel); s.anchor.set(0.5); s.blendMode = P.BLEND_MODES.ERASE; stemple.addChild(s); return s; };
  const swiatloBoh = stempel(), swiatloOgnia = stempel(), swiatloOkna = stempel();
  ciemnoscC.addChild(ciemnoscG, kreski, stemple);
  let ciemnoscRT = null; const ciemnosc = new P.Sprite();

  const deszcz = new P.Graphics();
  const winieta = new P.Sprite();
  const bolG = new P.Graphics();
  ekran.addChild(deszcz, winieta, bolG);
  scena.addChild(swiat, ciemnosc, nad, ekran);

  // ---------- rozmiar i kamera ----------
  let vw = 1, vh = 1, zoom = 1;
  const kam = { x: OGNISKO.x, y: OGNISKO.y, gotowa: false };
  function rozmiar() {
    vw = innerWidth; vh = innerHeight;
    renderer.resize(vw, vh);
    zoom = ogr(Math.min(vw, vh) / 560, 0.5, 1.4);      // na telefonie w pionie widać około 560 jednostek wszerz
    if (ciemnoscRT) ciemnoscRT.destroy(true);
    ciemnoscRT = P.RenderTexture.create({ width: vw, height: vh, resolution: renderer.resolution * 0.5 });
    ciemnosc.texture = ciemnoscRT;
    kreski.width = vw; kreski.height = vh; kreski.tileScale.set(1 / (renderer.resolution * 0.5));
    kreski.visible = !lekko;
    if (winieta.texture && winieta.texture !== P.Texture.EMPTY) winieta.texture.destroy(true);
    winieta.texture = tx(O.winieta(Math.min(vw, 900), Math.min(vh, 900))); winieta.width = vw; winieta.height = vh;
    winieta.visible = !lekko;
  }
  rozmiar();

  const ekranNaSwiat = (px, py) => ({ x: (px - swiat.x) / zoom, y: (py - swiat.y) / zoom });
  const swiatNaEkran = (x, y) => ({ x: swiat.x + x * zoom, y: swiat.y + y * zoom });

  // ---------- ślady na ziemi (krew, ciała, cienie drzew) ----------
  function dorysujSlady(lista) {
    if (!lista.length) return;
    const c = new P.Container();
    for (const s of lista) {
      if (s.typ === 'cialo') {
        const at = atlasy[s.wrog], w = at.wzor, sk = (s.wrog === 'kolos' ? 2.3 : 1.25) / O.PX;
        const sp = new P.Sprite(at.martwy); sp.anchor.set(w.ox / w.w, w.oy / w.h);
        sp.position.set(s.x, s.y); sp.rotation = s.obrot; sp.scale.set(sk * s.sx, sk); c.addChild(sp);
      } else if (s.typ === 'kaluza' || s.typ === 'kropla') {
        const n = s.typ === 'kaluza' ? (s.duza ? 7 : 3) : 1, roz = s.typ === 'kaluza' ? 1 : 0.3;
        for (let i = 0; i < n; i++) {
          const sp = new P.Sprite(T.krew[(Math.random() * 3) | 0]); sp.anchor.set(0.5);
          sp.position.set(s.x + losuj(-14, 14) * roz, s.y + losuj(-7, 7) * roz);
          const r = s.typ === 'kaluza' ? losuj(4, 13) : (s.r || 2) * losuj(0.8, 1.4);
          sp.width = r * 2; sp.height = r * losuj(1.1, 1.5); sp.rotation = losuj(0, Math.PI); sp.alpha = losuj(0.4, 0.75);
          c.addChild(sp);
        }
      } else if (s.typ === 'cien') {
        const sp = new P.Sprite(T.cien); sp.anchor.set(0.5); sp.position.set(s.x, s.y); sp.width = s.w; sp.height = s.h; sp.alpha = s.alfa || 1; c.addChild(sp);
      }
    }
    renderer.render(c, { renderTexture: sladyRT, clear: false });
    c.destroy({ children: true });
    lista.length = 0;
  }
  function wyczysc() {
    renderer.render(new P.Container(), { renderTexture: sladyRT, clear: true });
    dorysujSlady(DRZEWA.map(d => ({ typ: 'cien', x: d.x + 14, y: d.y + 3, w: d.h * 0.42, h: d.h * 0.12, alfa: 0.8 })));
  }
  wyczysc();

  // ---------- pule obiektów ----------
  function pula(rodzic, nowy) {
    const lista = []; let n = 0;
    return {
      start() { n = 0; },
      wez() { let o = lista[n]; if (!o) { o = nowy(); lista.push(o); rodzic.addChild(o); } o.visible = true; n++; return o; },
      koniec() { for (let i = n; i < lista.length; i++) lista[i].visible = false; },
    };
  }
  const pulaWrogow = pula(aktorzy, () => new P.Sprite());
  const pulaCieni = pula(cienie, () => { const s = new P.Sprite(T.cien); s.anchor.set(0.5); return s; });
  const pulaOczu = pula(oczy, () => { const s = new P.Sprite(T.okoCzerwone); s.anchor.set(0.5); s.blendMode = P.BLEND_MODES.ADD; return s; });
  const pulaKrwi = pula(powietrze, () => { const s = new P.Sprite(T.krew[0]); s.anchor.set(0.5); return s; });
  const pulaIskier = pula(iskry, () => { const s = new P.Sprite(T.iskra); s.anchor.set(0.5); s.blendMode = P.BLEND_MODES.ADD; return s; });

  // napisy nad głową: „Sparowane!”, „+7”…
  const styleNapisu = { fontFamily: 'Alegreya SC, Georgia, serif', fontSize: 22, fontWeight: '700', fill: 0xf0e6d6, stroke: 0x000000, strokeThickness: 5 };
  const wolneNapisy = [], aktywneNapisy = [];
  function napis(tekst, x, y, kolor = 0xf0e6d6) {
    let t = wolneNapisy.pop();
    if (!t) { t = new P.Text(tekst, styleNapisu); t.anchor.set(0.5, 1); napisy.addChild(t); } else t.text = tekst;
    t.style.fill = kolor; t.visible = true; t.position.set(x, y); t.alpha = 1;
    aktywneNapisy.push({ t, czas: 0, y });
  }

  // krótkie efekty: pierścienie (parowanie, uderzenie kolosa)
  const pierscienie = [];

  // ---------- bohater ----------
  const stanRys = { upadlOd: -1, poprzZycie: BOHATER.zycie, slad: [], poprzStan: 'wolny' };

  function poza(b, gra) {
    const sx = Math.cos(b.kat) >= 0 ? 1 : -1;
    const p = { sx, a: b.kat + 0.65 * sx, lift: 16, drgaj: 0, smuga: null, blok: false, reka: 13 };
    if (b.stan === 'cios' && b.cios) {
      const c = b.cios, cfg = BOHATER.ciosy[c.typ], kat = c.kat;
      const p0 = Math.cos(kat) >= 0 ? 1 : -1;
      p.sx = p0;
      const od = kat + cfg.od * p0, doK = kat + cfg.do * p0;
      const start = cfg.zamach * 0.5, dl = cfg.zamach * 0.5 + (cfg.ciezki ? 0.13 : 0.09);
      let q = ogr((c.t - start) / dl, 0, 1);
      if (c.utknal) { q = Math.min(q, 0.42); p.drgaj = 1.6; }
      const e = 1 - Math.pow(1 - q, 3);
      if (c.t < start) {                          // zamach: miecz cofa się przed cięciem
        const w = c.t / Math.max(0.001, start);
        p.a = od - 0.3 * p0 * w; p.lift = cfg.ciezki ? -MIECZ_DL * 0.85 * w : 2;
      } else {
        p.a = od + (doK - od) * e;
        p.lift = cfg.ciezki ? -MIECZ_DL * 0.85 * (1 - e) + 10 * e : 2;
      }
      const poKoncu = c.t - (start + dl);
      const alfa = q < 1 ? 1 : Math.max(0, 1 - poKoncu / 0.1);
      if (c.t >= start && alfa > 0) p.smuga = { od, do: p.a, ciezki: !!cfg.ciezki, alfa, utknal: c.utknal, q: e };
    } else if (b.blok) {
      p.blok = true; p.reka = 16;
    } else if (b.stan === 'unik') {
      p.a = b.unikKat + Math.PI * 0.85 * sx; p.lift = 10;
    } else if (b.stan === 'zachwiany') {
      p.a = b.kat + 1.35 * sx; p.lift = 24; p.drgaj = 2.2;
    }
    return p;
  }

  // rysuje bohatera do grafiki g, stopy w (0,0)
  function rysujBohatera(g, b, gra, alfaCala = 1) {
    const p = poza(b, gra), sx = p.sx, X = v => v * sx;
    const krok = b.idzie ? Math.sin(b.chod) : 0;
    const pod = b.idzie ? Math.abs(Math.cos(b.chod)) * 2 : Math.sin(gra.czas * 2.2) * 0.6;
    const dj = p.drgaj ? (Math.random() - 0.5) * p.drgaj : 0;
    const oy = -pod;
    const wiel = (pts) => { const w = new Array(pts.length); for (let i = 0; i < pts.length; i += 2) { w[i] = X(pts[i]) + dj; w[i + 1] = pts[i + 1] + oy; } return w; };
    const ksztalt = (pts, kolor, lw = 1.6) => { g.lineStyle(lw, OB, alfaCala); g.beginFill(kolor, alfaCala); g.drawPolygon(wiel(pts)); g.endFill(); };
    const elipsa = (x, y, rx, ry, kolor, lw = 1.6) => { g.lineStyle(lw, OB, alfaCala); g.beginFill(kolor, alfaCala); g.drawEllipse(X(x) + dj, y + oy, rx, ry); g.endFill(); };

    // ręka z mieczem: dłoń w świecie, nie odbijana
    const srodek = { x: dj, y: -44 + oy };
    let hx, hy, tx2, ty2;
    if (p.blok) {
      hx = srodek.x + Math.cos(b.kat) * p.reka; hy = srodek.y + Math.sin(b.kat) * p.reka * PERSP - 6;
      const kp = b.kat - sx * (Math.PI / 2 - 0.55);
      tx2 = hx + Math.cos(kp) * MIECZ_DL * 0.85; ty2 = hy + Math.sin(kp) * MIECZ_DL * 0.85 * PERSP - 14;
    } else {
      hx = srodek.x + Math.cos(p.a) * p.reka; hy = srodek.y + Math.sin(p.a) * p.reka * PERSP;
      tx2 = hx + Math.cos(p.a) * MIECZ_DL; ty2 = hy + Math.sin(p.a) * MIECZ_DL * PERSP + p.lift;
    }
    const mieczZa = ty2 < hy - 8;              // ostrze w górę ekranu: chowa się za plecami

    const ramie = { x: X(8) + dj, y: -56 + oy };
    if (mieczZa) { rysujMiecz(g, hx, hy, tx2, ty2, alfaCala); rysujReke(g, ramie, hx, hy, alfaCala); }

    // futro zwisające z pleców
    ksztalt([-8, -62, -17, -50, -21, -30, -19, -14, -15, -19, -12, -11, -8, -18, -4, -13, -2, -56], 0x2f2b28);
    g.lineStyle(1, 0x4a4540, alfaCala); g.moveTo(X(-12) + dj, -50 + oy); g.lineTo(X(-15) + dj, -20 + oy); g.moveTo(X(-7) + dj, -52 + oy); g.lineTo(X(-8) + dj, -22 + oy);
    // druga ręka
    g.lineStyle(6.2, OB, alfaCala); g.moveTo(X(-8) + dj, -56 + oy); g.lineTo(X(-11 - krok * 2) + dj, -36 + oy);
    g.lineStyle(4, 0x5a4a3c, alfaCala); g.moveTo(X(-8) + dj, -56 + oy); g.lineTo(X(-11 - krok * 2) + dj, -36 + oy);
    // nogi i buty
    for (const [cx, kol] of [[-5 + krok * 4, 0x37302a], [4 - krok * 4, 0x433a32]]) {
      ksztalt([cx - 3.6, -34, cx + 3.6, -34, cx + 3.3, -7, cx - 3.3, -7], kol);
      ksztalt([cx - 4, -9, cx + 4, -9, cx + 7.5, -1, cx - 4.2, -1], 0x2a231d);
    }
    // tułów: połatana skórzana kurta
    ksztalt([-11, -61, 11, -61, 13, -31, -13, -31], 0x433830);
    g.lineStyle(0); g.beginFill(0x55473b, alfaCala); g.drawRect(X(sx > 0 ? -8 : 2) + dj, -52 + oy, 6, 7); g.endFill();
    g.lineStyle(0.8, 0x1a1410, alfaCala);
    for (let k = 0; k < 3; k++) { const x0 = X(-8 + k * 2.2) + dj; g.moveTo(x0, -53 + oy); g.lineTo(x0, -51 + oy); }
    // kolczuga spod kurty
    ksztalt([-13, -32, 13, -32, 13, -25, 10, -22, 7, -25, 4, -22, 1, -25, -2, -22, -5, -25, -8, -22, -11, -25, -13, -22], 0x767a81, 1.2);
    // pas
    ksztalt([-13.5, -35, 13.5, -35, 13.5, -31, -13.5, -31], 0x2b221b, 1.2);
    elipsa(2, -33, 2.2, 1.8, 0xa29d92, 0.8);
    // wilcze futro na ramionach
    ksztalt([-17, -56, -15, -64, -11, -62, -8, -68, -3, -64, 1, -70, 5, -65, 9, -67, 12, -62, 16, -58, 12, -53, 5, -56, -4, -54, -12, -52], 0x8f897e);
    g.lineStyle(1, 0x5c574f, alfaCala);
    g.moveTo(X(-9) + dj, -60 + oy); g.lineTo(X(-6) + dj, -57 + oy); g.moveTo(X(1) + dj, -63 + oy); g.lineTo(X(3) + dj, -58 + oy);
    // naramiennik z ciemnej stali
    elipsa(9, -57, 7.2, 5, 0x8d939b, 1.4);
    g.lineStyle(0); g.beginFill(0xd8dce0, alfaCala); g.drawCircle(X(9) + dj, -58 + oy, 1); g.endFill();
    // głowa
    elipsa(3, -71, 7.8, 7.8, 0xb48d72);
    ksztalt([-5, -71, -6, -78, -2, -81.5, 3, -80.5, 8, -80, 10.5, -76.5, 9, -74, 5, -77, 0, -76, -3, -72.5], 0x231d19, 1.2);
    g.lineStyle(0); g.beginFill(0x1a1310, alfaCala); g.drawCircle(X(7.2) + dj, -71.5 + oy, 1.1); g.endFill();
    g.lineStyle(1.1, 0x7a3a30, alfaCala); g.moveTo(X(4.5) + dj, -69 + oy); g.lineTo(X(8.5) + dj, -66 + oy);   // blizna na policzku

    if (!mieczZa) { rysujReke(g, ramie, hx, hy, alfaCala); rysujMiecz(g, hx, hy, tx2, ty2, alfaCala); }
    return p;
  }

  function rysujReke(g, ramie, hx, hy, al) {
    g.lineStyle(7, OB, al); g.moveTo(ramie.x, ramie.y); g.lineTo(hx, hy);
    g.lineStyle(4.6, 0xa98670, al); g.moveTo(ramie.x, ramie.y); g.lineTo(hx, hy);
    // bandaż i czarne żyły klątwy
    const mx = (ramie.x + hx) / 2, my = (ramie.y + hy) / 2;
    g.lineStyle(4.6, 0xd6ccb8, al); g.moveTo(mx + (hx - mx) * 0.15, my + (hy - my) * 0.15); g.lineTo(mx + (hx - mx) * 0.55, my + (hy - my) * 0.55);
    g.lineStyle(0.9, 0x150f18, al); g.moveTo(ramie.x + 1, ramie.y + 2); g.lineTo(mx - 1, my); g.lineTo(mx + 1, my + 1);
    // karwasz przy nadgarstku
    g.lineStyle(5.4, 0x4a3c30, al); g.moveTo(hx + (ramie.x - hx) * 0.22, hy + (ramie.y - hy) * 0.22); g.lineTo(hx + (ramie.x - hx) * 0.08, hy + (ramie.y - hy) * 0.08);
  }

  function rysujMiecz(g, hx, hy, tx2, ty2, al) {
    const dx = tx2 - hx, dy = ty2 - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
    // łańcuch od głowicy do nadgarstka
    const gx = hx - ux * 10, gy = hy - uy * 10;
    g.lineStyle(1.3, 0x2a1a10, al); g.beginFill(0x8a5630, al);
    for (let i = 1; i <= 4; i++) { const t = i / 5; g.drawEllipse(gx + (hx - gx) * t - px * 2 + Math.sin(i) * 1.5, gy + (hy - gy) * t + 3 + i * 1.6, 1.8, 1.3); }
    g.endFill();
    // rękojeść i głowica
    g.lineStyle(4.4, OB, al); g.moveTo(gx, gy); g.lineTo(hx + ux * 3, hy + uy * 3);
    g.lineStyle(2.6, 0x3a2a1e, al); g.moveTo(gx, gy); g.lineTo(hx + ux * 3, hy + uy * 3);
    g.lineStyle(1.2, OB, al); g.beginFill(0x6f747b, al); g.drawCircle(gx, gy, 2.6); g.endFill();
    // jelec
    const jx = hx + ux * 4, jy = hy + uy * 4;
    g.lineStyle(5, OB, al); g.moveTo(jx - px * 8, jy - py * 8); g.lineTo(jx + px * 8, jy + py * 8);
    g.lineStyle(3, 0x4d4842, al); g.moveTo(jx - px * 8, jy - py * 8); g.lineTo(jx + px * 8, jy + py * 8);
    // ostrze: ciemne żelazo z jasną krawędzią i wyszczerbieniem
    const bx = hx + ux * 6, by = hy + uy * 6, sz = 3.6;
    const pts = [bx + px * sz, by + py * sz, tx2 - ux * 8 + px * sz * 0.8, ty2 - uy * 8 + py * sz * 0.8, tx2, ty2,
      tx2 - ux * 8 - px * sz * 0.8, ty2 - uy * 8 - py * sz * 0.8,
      bx + ux * L * 0.55 - px * sz * 0.95, by + uy * L * 0.55 - py * sz * 0.95,
      bx + ux * (L * 0.55 - 3) - px * sz * 0.35, by + uy * (L * 0.55 - 3) - py * sz * 0.35,
      bx + ux * (L * 0.55 - 6) - px * sz, by + uy * (L * 0.55 - 6) - py * sz,
      bx - px * sz, by - py * sz];
    g.lineStyle(1.6, OB, al); g.beginFill(0x5c6067, al); g.drawPolygon(pts); g.endFill();
    g.lineStyle(1, 0x34373c, al); g.moveTo(bx, by); g.lineTo(bx + ux * L * 0.7, by + uy * L * 0.7);
    g.lineStyle(1.1, 0xdfe3e8, 0.9 * al); g.moveTo(bx + px * sz * 0.8, by + py * sz * 0.8); g.lineTo(tx2 - ux * 6 + px * sz * 0.6, ty2 - uy * 6 + py * sz * 0.6);
  }

  // ---------- jedna klatka ----------
  let czas = 0;
  const krople = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), v: 0.9 + Math.random() * 0.6, d: 0.6 + Math.random() * 0.8 }));

  function rysuj(gra, dt, zdarzenia) {
    czas += dt;
    const b = gra.bohater;

    // zdarzenia, które widać na obrazie
    for (const z of zdarzenia) {
      if (z.typ === 'parowanie') { napis('Sparowane!', b.x, b.y - 96, 0xffe2a0); pierscienie.push({ x: b.x, y: b.y - 40, r0: 20, r1: 90, t: 0, czas: 0.3, kolor: 0xfff0c0 }); }
      else if (z.typ === 'grzeznie') napis('Miecz grzęźnie', b.x, b.y - 96, 0xc9ccd2);
      else if (z.typ === 'unikniety') napis('Unik', b.x, b.y - 96, 0xa8c4e0);
      else if (z.typ === 'trafienie' && z.ile >= 3) napis(`Przecięte: ${z.ile}`, b.x, b.y - 96, 0xe8b070);
    }
    // „Krew za krew”: życie wróciło po ciosie
    if (b.stan !== 'upadl' && b.zycie > stanRys.poprzZycie + 0.5 && gra.faza !== 'przerwa') napis(`+${Math.round(b.zycie - stanRys.poprzZycie)}`, b.x + 18, b.y - 84, 0xff6a5a);
    stanRys.poprzZycie = b.zycie;
    // kałuża pod bohaterem, gdy upada
    if (b.stan === 'upadl' && stanRys.poprzStan !== 'upadl') { stanRys.upadlOd = czas; gra.slady.push({ typ: 'kaluza', x: b.x, y: b.y, duza: true }); }
    stanRys.poprzStan = b.stan;
    dorysujSlady(gra.slady);

    // kamera
    const celX = b.x + Math.cos(b.kat) * 36, celY = b.y - 40 + Math.sin(b.kat) * 24;
    if (!kam.gotowa) { kam.x = celX; kam.y = celY; kam.gotowa = true; }
    const k = Math.min(1, dt * 5); kam.x += (celX - kam.x) * k; kam.y += (celY - kam.y) * k;
    const pw = vw / 2 / zoom, ph = vh / 2 / zoom;
    const kx = ogr(kam.x, pw, SZER - pw), ky = ogr(kam.y, ph, WYS - ph);
    const drz = gra.wstrzas * 0.8;
    const ox = Math.round((vw / 2 - kx * zoom + (Math.random() - 0.5) * drz * zoom) * 2) / 2;
    const oy = Math.round((vh / 2 - ky * zoom + (Math.random() - 0.5) * drz * zoom) * 2) / 2;
    for (const w of [swiat, nad]) { w.scale.set(zoom); w.position.set(ox, oy); }

    // widoczny kawałek świata (z zapasem na wysokie drzewa)
    const L = -ox / zoom - 140, R = (vw - ox) / zoom + 140, G = -oy / zoom - 60, D = (vh - oy) / zoom + 380;
    for (let i = 0; i < drzewa.length; i++) { const d = DRZEWA[i]; drzewa[i].visible = d.x > L && d.x < R && d.y > G && d.y < D; }

    // bohater
    bohG.clear(); bohG.position.set(b.x, b.y); bohG.zIndex = b.y; bohG.rotation = 0; bohG.alpha = b.nietykalny > 0 ? 0.75 : 1;
    bohG.tint = b.flash > 0 ? 0xff8080 : 0xffffff;
    let pz = null;
    if (b.stan === 'upadl') {
      const t = Math.min(1, (czas - stanRys.upadlOd) / 0.35), sx = Math.cos(b.kat) >= 0 ? 1 : -1;
      pz = rysujBohatera(bohG, b, gra); bohG.rotation = -sx * 1.45 * t; bohG.alpha = 1 - Math.max(0, czas - stanRys.upadlOd - 1.4) * 0.6;
    } else pz = rysujBohatera(bohG, b, gra);
    bohCien.position.set(b.x, b.y + 1); bohCien.width = 40; bohCien.height = 15;

    // powidoki uniku
    echa.clear();
    if (b.stan === 'unik') { stanRys.slad.push({ x: b.x, y: b.y, t: czas }); }
    while (stanRys.slad.length && czas - stanRys.slad[0].t > 0.18) stanRys.slad.shift();
    for (const s of stanRys.slad) {
      const al = 0.28 * (1 - (czas - s.t) / 0.18);
      echa.lineStyle(0); echa.beginFill(0x9fb4cc, al); echa.drawEllipse(s.x, s.y - 40, 13, 34); echa.endFill();
    }

    // duch bohatera, gdy zasłania go chata albo drzewo
    duch.clear();
    let zasloniety = b.y < CHATA.podstawa && b.y > CHATA.y + 120 * CHATA.skala && b.x > CHATA.x + 150 * CHATA.skala && b.x < CHATA.x + 860 * CHATA.skala;
    if (!zasloniety) for (const d of DRZEWA) { if (d.y > b.y && d.y - b.y < d.h * 0.85 && Math.abs(d.x - b.x) < d.h * 0.22) { zasloniety = true; break; } }
    if (zasloniety && b.stan !== 'upadl') { duch.position.set(b.x, b.y); rysujBohatera(duch, b, gra); }

    // smuga cięcia i garda
    smugi.clear(); znaki.clear(); znakiZiemia.clear();
    if (pz && pz.smuga) {
      const s = pz.smuga, cx = b.x, cy = b.y - 44, n = 12, r1 = 22, r2 = MIECZ_DL + 16;
      const kol = s.utknal ? 0xffd090 : 0xe6ecf2;
      const pts = [];
      for (let i = 0; i <= n; i++) { const a = s.od + (s.do - s.od) * i / n, l = s.ciezki ? -MIECZ_DL * 0.85 * (1 - s.q * i / n) : 0; pts.push(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * PERSP + l); }
      for (let i = n; i >= 0; i--) { const a = s.od + (s.do - s.od) * i / n; pts.push(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * PERSP); }
      smugi.lineStyle(0); smugi.beginFill(kol, (s.ciezki ? 0.42 : 0.3) * s.alfa); smugi.drawPolygon(pts); smugi.endFill();
      smugi.lineStyle(2, 0xffffff, 0.55 * s.alfa);
      for (let i = 0; i <= n; i++) { const a = s.od + (s.do - s.od) * i / n, l = s.ciezki ? -MIECZ_DL * 0.85 * (1 - s.q * i / n) : 0; const x = cx + Math.cos(a) * r2, y = cy + Math.sin(a) * r2 * PERSP + l; if (i) smugi.lineTo(x, y); else smugi.moveTo(x, y); }
    }
    if (b.blok) {
      const parowanie = gra.czas - b.blokOd < BOHATER.blok.oknoParowania;
      const cx = b.x, cy = b.y - 30, r = 46, od = b.kat - BOHATER.blok.kat, doK = b.kat + BOHATER.blok.kat;
      znaki.lineStyle(parowanie ? 4 : 2.5, parowanie ? 0xfff0c0 : 0xa8c4e0, parowanie ? 0.95 : 0.45);
      for (let i = 0; i <= 14; i++) { const a = od + (doK - od) * i / 14, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * PERSP; if (i) znaki.lineTo(x, y); else znaki.moveTo(x, y); }
    }

    // wrogowie
    pulaWrogow.start(); pulaCieni.start(); pulaOczu.start();
    for (const e of gra.wrogowie) {
      if (e.x < L - 100 || e.x > R + 100 || e.y < G || e.y > D) continue;
      const at = atlasy[e.typ.nazwa], w = at.wzor, sk = e.typ.skala;
      const sx = Math.cos(e.stan === 'idzie' || e.stan === 'wynurza' || e.stan === 'odpoczynek' ? Math.atan2(b.y - e.y, b.x - e.x) : e.kat) >= 0 ? 1 : -1;
      const zam = e.stan === 'zamach' || e.stan === 'skok';
      const faza = (((e.anim * (e.typ.ciezki ? 3 : 9)) % TAU) + TAU) % TAU;
      const klatka = Math.min(w.klatki - 1, (faza / TAU * w.klatki) | 0);
      const wiersz = (sx < 0 ? 1 : 0) | (zam ? 2 : 0) | (e.flash > 0 ? 4 : 0);
      const sp = pulaWrogow.wez();
      sp.texture = at.klatki[wiersz * w.klatki + klatka]; sp.anchor.set(w.ox / w.w, w.oy / w.h);
      const kucniecie = e.stan === 'zamach' && !e.typ.ciezki ? 0.88 : 1;
      sp.scale.set(sk / O.PX, sk / O.PX * kucniecie);
      sp.position.set(e.x + (e.drzy || 0), e.y); sp.zIndex = e.y;
      sp.alpha = e.stan === 'wynurza' ? e.widac : 1;
      const cs = pulaCieni.wez(); cs.position.set(e.x, e.y + 1); cs.width = e.promien * 2.8; cs.height = e.promien * 1.05; cs.alpha = sp.alpha;
      // oczy świecą w ciemności; przed atakiem rozbłyskują
      const oko = pulaOczu.wez();
      oko.texture = e.typ.ciezki ? T.okoBursztyn : T.okoCzerwone;
      oko.position.set(e.x + (e.drzy || 0) + w.oko.x * sx * sk, e.y + w.oko.y * sk * kucniecie);
      const mocOka = e.stan === 'zamach' ? 1.7 + Math.sin(czas * 40) * 0.3 : (e.stan === 'ogluszony' ? 0.5 : 1);
      oko.width = oko.height = (e.typ.ciezki ? 16 : 11) * mocOka; oko.alpha = (e.stan === 'wynurza' ? e.widac : 1) * 0.8;
      // ogłuszony po parowaniu: wiruje mu w głowie (i dostaje podwójne obrażenia)
      if (e.stan === 'ogluszony') {
        for (let i = 0; i < 3; i++) {
          const a = czas * 6 + i * TAU / 3, x = e.x + Math.cos(a) * 12, y = e.y - 48 * sk / 1.25 + Math.sin(a) * 4;
          znaki.lineStyle(0); znaki.beginFill(0xffe2a0, 0.9); znaki.drawCircle(x, y, 2.4); znaki.endFill();
        }
      }
      // kolos zapowiada uderzenie kręgiem na ziemi
      if (e.typ.ciezki && e.stan === 'zamach' && e.cel) {
        const q = ogr(e.t / e.typ.zamach, 0, 1);
        znakiZiemia.lineStyle(3, 0xff5a3a, 0.85); znakiZiemia.beginFill(0xff3a1a, 0.1 + 0.25 * q);
        znakiZiemia.drawEllipse(e.cel.x, e.cel.y, e.typ.strefa, e.typ.strefa * PERSP); znakiZiemia.endFill();
        znakiZiemia.lineStyle(0); znakiZiemia.beginFill(0xff6a3a, 0.3); znakiZiemia.drawEllipse(e.cel.x, e.cel.y, e.typ.strefa * q, e.typ.strefa * PERSP * q); znakiZiemia.endFill();
      }
      if (e.typ.ciezki && e.stan === 'skok' && e.cel && !e._uderzyl) {
        e._uderzyl = true;
        pierscienie.push({ x: e.cel.x, y: e.cel.y, r0: 20, r1: e.typ.strefa * 1.4, t: 0, czas: 0.4, kolor: 0xd8c8b0, ziemia: true });
        for (let i = 0; i < 8; i++) gra.slady.push({ typ: 'kropla', x: e.cel.x + losuj(-40, 40), y: e.cel.y + losuj(-20, 20), r: 0.1 });
      }
      if (e.stan !== 'skok') e._uderzyl = false;
    }
    pulaWrogow.koniec(); pulaCieni.koniec(); pulaOczu.koniec();

    // krew w powietrzu i iskry
    pulaKrwi.start();
    for (const p of gra.krew) { const s = pulaKrwi.wez(); s.position.set(p.x, p.y - p.z); s.width = s.height = p.r * 2; }
    pulaKrwi.koniec();
    pulaIskier.start();
    for (const p of gra.iskry) { const s = pulaIskier.wez(); s.position.set(p.x, p.y); s.width = s.height = 10; s.alpha = Math.min(1, p.t * 5); }
    pulaIskier.koniec();

    // pierścienie
    for (let i = pierscienie.length - 1; i >= 0; i--) {
      const r = pierscienie[i]; r.t += dt; const q = r.t / r.czas;
      if (q >= 1) { pierscienie.splice(i, 1); continue; }
      const rr = r.r0 + (r.r1 - r.r0) * (1 - (1 - q) * (1 - q));
      const gz = r.ziemia ? znakiZiemia : znaki;
      gz.lineStyle(r.ziemia ? 6 : 3, r.kolor, 0.8 * (1 - q)); gz.beginFill(0, 0); gz.drawEllipse(r.x, r.y, rr, rr * (r.ziemia ? PERSP : 0.8)); gz.endFill();
    }

    // napisy unoszą się i gasną
    for (let i = aktywneNapisy.length - 1; i >= 0; i--) {
      const n = aktywneNapisy[i]; n.czas += dt;
      n.t.y = n.y - n.czas * 40; n.t.alpha = Math.max(0, 1 - Math.max(0, n.czas - 0.5) / 0.5); n.t.scale.set(1 / Math.max(0.8, zoom) * 1.1);
      if (n.czas > 1) { n.t.visible = false; wolneNapisy.push(n.t); aktywneNapisy.splice(i, 1); }
    }

    // mgła płynie powoli wokół swoich miejsc
    for (const k of kleby) {
      k.a += k.v * dt;
      k.s.position.set(k.m.x + Math.cos(k.a) * k.r, k.m.y + Math.sin(k.a) * k.r * 0.6);
      k.s.width = k.roz * 2; k.s.height = k.roz * 1.3; k.s.alpha = k.alfa * (0.85 + Math.sin(czas * 0.7 + k.a) * 0.15) * (gra.faza === 'swit' || gra.faza === 'koniec' ? Math.max(0.2, gra.mroczek / 0.8) : 1);
    }

    // ogień
    const migot = 0.88 + Math.sin(czas * 9.1) * 0.05 + Math.sin(czas * 13.7 + 1) * 0.04 + Math.sin(czas * 3.3) * 0.03;
    plomienie.clear();
    const fx = OGNISKO.x, fy = OGNISKO.y;
    for (let i = 0; i < 4; i++) {
      const m = Math.sin(czas * (7 + i * 2.3) + i * 1.7) * 0.5 + 0.5, wys = 24 + m * 16 - i * 3, szer = 9 - i * 1.4, off = (i - 1.5) * 4;
      plomienie.beginFill(i < 2 ? 0xe66e28 : 0xffc86e, 0.55 + m * 0.2);
      plomienie.moveTo(fx + off - szer, fy - 2);
      plomienie.quadraticCurveTo(fx + off - szer * 0.4, fy - wys * 0.6, fx + off + Math.sin(czas * 5 + i) * 3, fy - wys);
      plomienie.quadraticCurveTo(fx + off + szer * 0.4, fy - wys * 0.6, fx + off + szer, fy - 2);
      plomienie.closePath(); plomienie.endFill();
    }
    blaskOgnia.position.set(fx, fy - 10); blaskOgnia.width = blaskOgnia.height = 300 * migot; blaskOgnia.alpha = 0.55 * Math.max(0.3, gra.mroczek / 0.8);
    blaskOkna.position.set(CHATA.okno.x, CHATA.okno.y + 20); blaskOkna.width = blaskOkna.height = 170; blaskOkna.alpha = 0.6 * Math.max(0.2, gra.mroczek / 0.8);

    // ciemność: zalewamy ekran nocą i wycinamy światło
    ciemnoscG.clear(); ciemnoscG.beginFill(0x05060b, gra.mroczek); ciemnoscG.drawRect(0, 0, vw, vh); ciemnoscG.endFill();
    kreski.alpha = 0.55 * gra.mroczek / 0.8;
    const stawStempel = (s, x, y, r, al) => { s.position.set(ox + x * zoom, oy + y * zoom); s.width = s.height = r * 2 * zoom; s.alpha = al; };
    stawStempel(swiatloBoh, b.x, b.y - 30, 250, 1);
    stawStempel(swiatloOgnia, fx, fy - 10, 380 * migot, 0.95);
    stawStempel(swiatloOkna, CHATA.okno.x, CHATA.okno.y + 30, 150, 0.7);
    renderer.render(ciemnoscC, { renderTexture: ciemnoscRT, clear: true });

    // ekran: deszcz i czerwony błysk po ranie
    deszcz.clear();
    if (!lekko) {
      deszcz.lineStyle(1, 0xbec8d7, 0.22);
      for (const kr of krople) {
        kr.y += kr.v * dt * 1.4; kr.x -= kr.v * dt * 0.25;
        if (kr.y > 1) { kr.y -= 1.05; kr.x = Math.random() * 1.2; }
        const x = kr.x * vw, y = kr.y * vh, d = 16 * kr.d;
        deszcz.moveTo(x, y); deszcz.lineTo(x - d * 0.18, y + d);
      }
    }
    bolG.clear();
    if (b.flash > 0) { bolG.beginFill(0x8a0000, b.flash * 0.9); bolG.drawRect(0, 0, vw, vh); bolG.endFill(); }

    renderer.render(scena);
  }

  return {
    rysuj, rozmiar, wyczysc, ekranNaSwiat, swiatNaEkran, karta,
    opis: karta ? 'karta graficzna' : 'procesor (bez karty graficznej)',
    get zoom() { return zoom; },
  };
}
