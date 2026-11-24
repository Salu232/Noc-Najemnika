// Rysowanie gry w PixiJS: karta graficzna, a gdy jej nie ma, zwykłe płótno.
// Logika jest w walka.js. Tu tylko obraz: niczego w stanie gry nie zmieniamy poza kolejką śladów.

import { SZER, WYS, CHATA, OGNISKO, MGLY, DRZEWA } from './swiat.js';
import { BOHATER, WROGOWIE, KLATWA } from './dane.js';
import { KLATKI as KB, ANIMACJE as AB, SKALA as SKALA_B, PATRZY as PATRZY_B } from './klatki-bohatera.js';
import { WROGOWIE_FILM } from './klatki-wrogow.js';
import * as O from './obrazki.js';

const TAU = Math.PI * 2;
const PERSP = 0.62;            // świat widziany z ukosa: pion jest spłaszczony
const OB = 0x0b0a09;           // kolor obrysu
const ogr = (v, a, b) => Math.max(a, Math.min(b, v));
const losuj = (a, b) => a + Math.random() * (b - a);

const CIECIE_WYS = { ghul: 17, kolos: 30 };   // na jakiej wysokości miecz przecina ciało wroga
// Potwory z filmów Przemka (narzedzia/wytnij-z-filmow.py): ghul ma 72 jednostki wzrostu, kolos 165.
const FILM_WROGA = {
  ghul: { ciecie: 30, droga: 75, smierc: 1.0, trafienie: 0.3, oko: { x: 30, y: -62 }, cien: 3.6 },    // droga: ile jednostek na pełny cykl chodu
  kolos: { ciecie: 70, droga: 100, smierc: 1.5, trafienie: 0.35, oko: { x: 72, y: -130 }, cien: 3.6 },
};

export function przygotujRysowanie(cv, obrazChaty, { wymusProcesor = false, obrazBohatera = null, bohater = 'gemini', obrazyWrogow = {}, obrazBezDachu = null } = {}) {
  const P = window.PIXI;
  const renderer = P.autoDetectRenderer({
    view: cv, width: innerWidth, height: innerHeight, resolution: Math.min(2, devicePixelRatio || 1), autoDensity: true,
    backgroundColor: 0x07080b, antialias: false, powerPreference: 'high-performance', forceCanvas: wymusProcesor,
  });
  const karta = renderer.type === P.RENDERER_TYPE.WEBGL;
  if (!karta) renderer.resolution = 1;          // bez karty liczy procesor: mniej pikseli
  const lekko = !karta;                          // bez karty: bez deszczu, kreskowania i winiety
  const tx = c => new P.Texture(new P.BaseTexture(c));

  // ---------- maska chaty ----------
  // Bohater jest „za chatą” tylko wtedy, gdy jego tułów wypada na nieprzezroczysty piksel obrazu chaty.
  // Wcześniej liczył się prostokąt, więc stojąc obok chaty, przy jej boku, też robił się przezroczysty (Patryk, 24 XI 12:15).
  // Obraz chaty ma też podwórko: ubitą ziemię, cień i płot. Te części idą na ziemię, pod postacie;
  // nad bohaterem (wg głębokości podstawy) zostaje tylko sam dom: dach, ściany, komin, dym, drewno i beczka.
  const calaChata = O.chataWDzien(obrazChaty);
  const DOM = [[158, 0], [951, 0], [951, 300], [862, 300], [862, 585], [850, 600], [800, 672], [795, 692], [158, 692]];
  // wycina z obrazu kolejne wielokąty: [punkty, true] zostawia tylko środek, [punkty, false] wycina środek
  const wytnij = (obraz, ...ksztalty) => {
    const c = document.createElement('canvas'); c.width = obraz.width; c.height = obraz.height;
    const g = c.getContext('2d'); g.drawImage(obraz, 0, 0);
    for (const [pkt, zostaw] of ksztalty) {
      g.globalCompositeOperation = zostaw ? 'destination-in' : 'destination-out';
      g.beginPath(); pkt.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    }
    return c;
  };
  const plotnoChaty = wytnij(calaChata, [DOM, true]), plotnoPodworka = wytnij(calaChata, [DOM, false]);
  // Chata bez dachu (jak w Tibii, docs/chata.md): ten sam kadr co chata. Gdy bohater jest w izbie, dom z dachem gaśnie,
  // a w jego miejscu jest izba. Podłoga, tylna i lewa ściana leżą pod postaciami; przednia ściana (do wysokości piersi),
  // skrzydło drzwi, drewno i kamienna prawa ściana stoją przed bohaterem, który jest w środku.
  const PRZOD = [[150, 540], [392, 540], [392, 512], [428, 512], [428, 700], [503, 700], [503, 527], [525, 527], [525, 558],
    [740, 558], [740, 360], [951, 360], [951, 951], [150, 951]];
  const bezDachu = obrazBezDachu ? O.chataWDzien(obrazBezDachu) : null;
  let maskaChaty = null;
  try {
    const d = plotnoChaty.getContext('2d').getImageData(0, 0, plotnoChaty.width, plotnoChaty.height).data;
    maskaChaty = new Uint8Array((plotnoChaty.width >> 2) * (plotnoChaty.height >> 2));
    for (let y = 0; y < plotnoChaty.height >> 2; y++) for (let x = 0; x < plotnoChaty.width >> 2; x++)
      maskaChaty[y * (plotnoChaty.width >> 2) + x] = d[((y * 4 + 2) * plotnoChaty.width + x * 4 + 2) * 4 + 3] > 128 ? 1 : 0;
  } catch (e) { /* bez maski: zostaje prostokąt */ }
  const chataZaslania = (x, y) => {
    const ix = (x - CHATA.x) / CHATA.skala, iy = (y - CHATA.y) / CHATA.skala;
    if (ix < 0 || iy < 0 || ix >= plotnoChaty.width || iy >= 692) return false;
    if (!maskaChaty) return ix > 140 && ix < 880 && iy > 120;
    return maskaChaty[(iy >> 2) * (plotnoChaty.width >> 2) + (ix >> 2)] === 1;
  };

  // ---------- tekstury ----------
  const T = {
    ziemia: tx(O.kafelZiemi()), plamy: tx(O.plamyZiemi()),
    drzewa: [0, 1, 2, 3].map(w => { const d = O.obrazDrzewa(w); return { t: tx(d.canvas), ax: d.ox / d.w, ay: d.oy / d.h }; }),
    chata: tx(plotnoChaty), podworko: tx(plotnoPodworka),
    cien: tx(O.cien()), kreski: tx(O.kreskowanie()), mgla: [0, 1, 2].map(w => tx(O.mgielka(w))),
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
    // połówki do cięcia na pół: żywa klatka 0 w każdym wierszu i martwe ciało
    const cut = Math.round((wzor.oy - CIECIE_WYS[nazwa]) * O.PX), martwy = tx(O.obrazMartwego(wzor, rysuj)), mb = martwy.baseTexture;
    const polowki = [];
    for (let w = 0; w < 8; w++) polowki.push({ gora: new P.Texture(baza, new P.Rectangle(0, w * a.ch, a.cw, cut)), dol: new P.Texture(baza, new P.Rectangle(0, w * a.ch + cut, a.cw, a.ch - cut)) });
    atlasy[nazwa] = {
      wzor, klatki, martwy, polowki,
      martweGora: new P.Texture(mb, new P.Rectangle(0, 0, mb.width, cut)), martweDol: new P.Texture(mb, new P.Rectangle(0, cut, mb.width, mb.height - cut)),
      ax: wzor.ox / wzor.w, ay: wzor.oy / wzor.h, ayDol: (wzor.oy * O.PX - cut) / (a.ch - cut),
    };
  }
  // bohater z filmów Przemka (Gemini): klatki animacji w grafika/bohater.webp, wycięte narzędziem narzedzia/wytnij-z-filmow.py
  const klatkiB = {};
  if (obrazBohatera) {
    const baza = new P.BaseTexture(obrazBohatera); baza.mipmap = P.MIPMAP_MODES.ON;
    for (const k in KB) klatkiB[k] = { ...KB[k], t: new P.Texture(baza, new P.Rectangle(KB[k].x, KB[k].y, KB[k].w, KB[k].h)) };
  }
  const maObraz = Object.keys(klatkiB).length > 0;
  // ghul i kolos z filmów Przemka; bez obrazu zostają rysowane kodem (atlasy wyżej)
  const filmW = {};
  for (const nazwa in WROGOWIE_FILM) {
    const img = obrazyWrogow[nazwa]; if (!img) continue;
    const d = WROGOWIE_FILM[nazwa], baza = new P.BaseTexture(img); baza.mipmap = P.MIPMAP_MODES.ON;
    const k = {};
    for (const n in d.KLATKI) { const f = d.KLATKI[n]; k[n] = { ...f, t: new P.Texture(baza, new P.Rectangle(f.x, f.y, f.w, f.h)) }; }
    // połówki do cięcia na pół: pierwsza klatka chodu przecięta w pasie
    const f = k[d.ANIMACJE.chod[0]], cut = Math.max(4, Math.round(f.ay * f.h - FILM_WROGA[nazwa].ciecie / d.SKALA));
    const gora = new P.Texture(baza, new P.Rectangle(f.x, f.y, f.w, cut)), dol = new P.Texture(baza, new P.Rectangle(f.x, f.y + cut, f.w, f.h - cut));
    filmW[nazwa] = { ...FILM_WROGA[nazwa], skala: d.SKALA, patrzy: d.PATRZY, anim: d.ANIMACJE, k, gora, dol, ax: f.ax, ayDol: (f.ay * f.h - cut) / (f.h - cut) };
  }
  const klatkaW = (fw, n, q) => { const l = fw.anim[n]; return fw.k[l[Math.min(l.length - 1, Math.max(0, Math.floor(q * l.length)))]]; };
  const klatkaPetliW = (fw, n, c) => { const l = fw.anim[n]; return fw.k[l[((Math.floor(c * l.length) % l.length) + l.length) % l.length]]; };
  let trybBohatera = maObraz ? bohater : 'rysowany';
  // Chód z filmu Przemka to spokojny marsz: stopa na ziemi przesuwa się o około 60 jednostek na cykl (dwa kroki).
  // Bohater w grze idzie prawie biegiem (165 jednostek na sekundę). Gdyby nogi miały nadążyć bez ślizgu, przebierałyby
  // 5 kroków na sekundę. Stąd kompromis: cykl co 110 jednostek drogi, czyli w pełnym marszu 3 kroki na sekundę,
  // dwa i pół raza szybciej niż w filmie. Stopy trochę się ślizgają; zniknie to dopiero przy filmie biegu.
  // 24 XI doszedł film biegu i on zastąpił chód: stopa przesuwa się w nim o około 73 jednostki na cykl (dwa kroki),
  // więc cykl co 90 jednostek drogi to bieg prawie 2 kroki na sekundę i tylko lekki ślizg. Idąc w górę ekranu
  // bohater pokazuje plecy (film chodu tyłem). mijanie: chwile cyklu, w których nogi się mijają, od nich rusza i na nich staje.
  // chod_przod (w dół ekranu, przodem do nas) czeka na film; dopóki go nie ma w klatkach, w dół idzie bieg bokiem
  const RUCH = { bieg: { droga: 90, mijanie: [0.42, 0.94] }, chod_tyl: { droga: 110, mijanie: [0, 0.5] }, chod_przod: { droga: 110, mijanie: [0, 0.5] } };

  // ---------- warstwy ----------
  const scena = new P.Container();
  const swiat = new P.Container();               // pod ciemnością
  const nad = new P.Container();                 // nad ciemnością, ta sama kamera
  const ekran = new P.Container();               // deszcz, winieta, błyski

  const ziemia = new P.TilingSprite(T.ziemia, SZER, WYS);
  const plamy = new P.Sprite(T.plamy); plamy.scale.set(O.SKALA_PLAM);
  const podworko = new P.Sprite(T.podworko); podworko.position.set(CHATA.x, CHATA.y); podworko.scale.set(CHATA.skala);
  const izbaSpod = new P.Sprite(bezDachu ? tx(wytnij(bezDachu, [DOM, true], [PRZOD, false])) : P.Texture.EMPTY);
  const izbaPrzod = new P.Sprite(bezDachu ? tx(wytnij(bezDachu, [DOM, true], [PRZOD, true])) : P.Texture.EMPTY);
  for (const s of [izbaSpod, izbaPrzod]) { s.position.set(CHATA.x, CHATA.y); s.scale.set(CHATA.skala); s.visible = false; }
  izbaPrzod.zIndex = CHATA.podstawa;
  const sladyRT = P.RenderTexture.create({ width: SZER, height: WYS, resolution: 0.5 });
  const slady = new P.Sprite(sladyRT);
  const cienie = new P.Container();
  const aktorzy = new P.Container(); aktorzy.sortableChildren = true;
  const echa = new P.Graphics();                 // powidoki uniku bohatera rysowanego kodem
  const echaS = new P.Container();               // powidoki uniku bohatera z Gemini: przygaszone kopie obrazu
  const powietrze = new P.Container();           // krew w locie
  const znakiZiemia = new P.Graphics();          // zapowiedź uderzenia kolosa i fala po nim: leżą na ziemi
  const para = new P.Graphics();                 // oddech w zimnej nocy
  const trupyC = new P.Container();              // ostatnie ciała leżą jako ostre obrazy, starsze idą do śladów
  swiat.addChild(ziemia, plamy, podworko, izbaSpod, slady, trupyC, znakiZiemia, cienie, echaS, aktorzy, echa, powietrze, para);

  // drzewa
  const drzewa = DRZEWA.map((d, i) => {
    const w = i % 7 === 3 ? 3 : d.wariant, td = T.drzewa[w];
    const s = new P.Sprite(td.t); s.anchor.set(td.ax, td.ay);
    s.scale.set(d.h / O.DRZEWO_H / O.PX); s.position.set(d.x, d.y); s.zIndex = d.y;
    aktorzy.addChild(s); return s;
  });

  // chata
  const chata = new P.Sprite(T.chata); chata.position.set(CHATA.x, CHATA.y); chata.scale.set(CHATA.skala); chata.zIndex = CHATA.podstawa;
  aktorzy.addChild(chata, izbaPrzod);
  // Drzwi chaty (Patryk, 24 XI 13:51): skrzydło wycięte z obrazu obraca się do środka na zawiasach po lewej,
  // za nim ciemna sień z blaskiem ognia. Zamknięte drzwi są po prostu częścią obrazu chaty.
  const SK = CHATA.skrzydlo, skW = Math.round((SK.x1 - SK.x0) / CHATA.skala), skH = Math.round((SK.y1 - SK.y0) / CHATA.skala);
  const sien = document.createElement('canvas'); sien.width = skW; sien.height = skH;
  { const g = sien.getContext('2d'); g.fillStyle = '#120c08'; g.fillRect(0, 0, skW, skH);
    const gr = g.createRadialGradient(skW * 0.55, skH * 1.05, 4, skW * 0.55, skH * 1.05, skH * 0.95);
    gr.addColorStop(0, 'rgba(235,140,60,0.55)'); gr.addColorStop(0.5, 'rgba(150,80,35,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, skW, skH); }
  const liscC = document.createElement('canvas'); liscC.width = skW; liscC.height = skH;
  liscC.getContext('2d').drawImage(plotnoChaty, Math.round((SK.x0 - CHATA.x) / CHATA.skala), Math.round((SK.y0 - CHATA.y) / CHATA.skala), skW, skH, 0, 0, skW, skH);
  const drzwiC = new P.Container(); drzwiC.zIndex = CHATA.podstawa + 0.01; drzwiC.visible = false;
  const sienS = new P.Sprite(tx(sien)), lisc = new P.Sprite(tx(liscC));
  for (const sp of [sienS, lisc]) { sp.position.set(SK.x0, SK.y0); sp.scale.set(CHATA.skala); }
  drzwiC.addChild(sienS, lisc); aktorzy.addChild(drzwiC);

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

  // bohater: obraz z Gemini (bohS) albo grafika rysowana kodem co klatkę (bohG)
  const bohG = new P.Graphics(); aktorzy.addChild(bohG);
  const bohS = new P.Sprite(); aktorzy.addChild(bohS);
  const bohCien = new P.Sprite(T.cien); bohCien.anchor.set(0.5); cienie.addChild(bohCien);

  // nad ciemnością
  const mgla = new P.Container();
  const kleby = [];
  for (const k in MGLY) {
    const m = MGLY[k];
    // Mgła: wiele przygaszonych, postrzępionych pasm w chłodnym szarym kolorze, nisko przy ziemi, wolno dryfuje.
    // Przy bohaterze rzednie, żeby go nie zakrywać.
    for (let i = 0; i < 14; i++) {
      const s = new P.Sprite(T.mgla[i % 3]); s.anchor.set(0.5); s.tint = 0x9aa6b8;
      kleby.push({ s, m, a: i / 14 * TAU + losuj(-0.2, 0.2), r: m.r * losuj(0.1, 0.75), v: losuj(0.02, 0.06) * (i % 2 ? 1 : -1),
        roz: m.r * losuj(0.55, 1.05), splaszcz: losuj(0.42, 0.6), alfa: losuj(0.28, 0.48), faza: losuj(0, TAU), obrot: losuj(-0.15, 0.15) });
      mgla.addChild(s);
    }
  }
  const znaki = new P.Graphics();                  // zapowiedzi ataków, garda, ogłuszenie
  const blaski = new P.Container();
  const blaskOgnia = new P.Sprite(T.cieplo); blaskOgnia.anchor.set(0.5); blaskOgnia.blendMode = P.BLEND_MODES.ADD;
  const blaskOkna = new P.Sprite(T.cieplo); blaskOkna.anchor.set(0.5); blaskOkna.blendMode = P.BLEND_MODES.ADD; blaskOkna.alpha = 0.7;
  const blaskIzby = new P.Sprite(T.cieplo); blaskIzby.anchor.set(0.5); blaskIzby.blendMode = P.BLEND_MODES.ADD;
  blaski.addChild(blaskOgnia, blaskOkna, blaskIzby);
  const plomienie = new P.Graphics(); plomienie.blendMode = P.BLEND_MODES.ADD; plomienie.zIndex = OGNISKO.y + 0.5;
  aktorzy.addChild(plomienie);
  const oczy = new P.Container();
  const iskry = new P.Container();
  const smugi = new P.Graphics();
  const duch = new P.Graphics(); duch.alpha = 0.33;
  // Duch bohatera za chatą albo drzewem: jasna, płaska sylwetka, a nie przezroczysta kopia, żeby nie wyglądało, że stoi na dachu.
  const duchS = new P.Sprite(); duchS.alpha = 0.5;
  try { const cm = new P.filters.ColorMatrixFilter(); cm.matrix = [0, 0, 0, 0, 0.62, 0, 0, 0, 0, 0.76, 0, 0, 0, 0, 0.9, 0, 0, 0, 1, 0]; duchS.filters = [cm]; } catch (e) { duchS.alpha = 0.33; }
  const blaskBoh = new P.Sprite(T.cieplo); blaskBoh.anchor.set(0.5); blaskBoh.blendMode = P.BLEND_MODES.ADD; blaski.addChild(blaskBoh);
  const blaskKlatwy = new P.Sprite(T.cieplo); blaskKlatwy.anchor.set(0.5); blaskKlatwy.blendMode = P.BLEND_MODES.ADD; blaskKlatwy.tint = 0xa060ff; blaski.addChild(blaskKlatwy);
  const napisy = new P.Container();
  nad.addChild(mgla, znaki, blaski, oczy, smugi, iskry, duch, duchS, napisy);

  // ciemność z wyciętym światłem (rysowana do osobnej tekstury w połowie rozdzielczości)
  const ciemnoscC = new P.Container();
  const ciemnoscG = new P.Graphics();
  const kreski = new P.TilingSprite(T.kreski, 16, 16);
  const stemple = new P.Container();
  const stempel = () => { const s = new P.Sprite(T.stempel); s.anchor.set(0.5); s.blendMode = P.BLEND_MODES.ERASE; stemple.addChild(s); return s; };
  const swiatloBoh = stempel(), swiatloOgnia = stempel(), swiatloOkna = stempel(), swiatloIzby = stempel();
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

  const ekranNaSwiat = (px, py) => ({ x: (px - swiat.x) / swiat.scale.x, y: (py - swiat.y) / swiat.scale.y });
  const swiatNaEkran = (x, y) => ({ x: swiat.x + x * swiat.scale.x, y: swiat.y + y * swiat.scale.y });

  // ---------- krótkie animacje: padające ciała, błyski cięć, kurz i oddech ----------
  const padajace = [], ciecia = [], obloczki = [], pioruny = [];
  function nowyPadajacy(s) {
    const typ = WROGOWIE[s.wrog], fw = filmW[s.wrog];
    if (fw) return { s, fw, ciezki: !!typ.ciezki, dir: -s.sx, t: 0, czas: s.przeciety ? (typ.ciezki ? 0.65 : 0.42) : fw.smierc, gasnie: -1, kon: null };
    return { s, at: atlasy[s.wrog], sk: typ.skala, ciezki: !!typ.ciezki, dir: -s.sx, wiersz: s.sx < 0 ? 1 : 0, t: 0, czas: typ.ciezki ? 0.65 : 0.42, gasnie: -1, kon: null };
  }
  // ciało zostaje na ziemi: rysujemy je raz do tekstury śladów
  // Ciało zostaje na ziemi. Tekstura śladów ma połowę rozdzielczości, więc świeże ciała (do 50) leżą
  // jako zwykłe obrazy w pełnej ostrości; dopiero najstarsze trafiają do śladów.
  const trupy = [];
  function zostaw(lista) {
    for (const k of lista) {
      const sp = new P.Sprite(k.tex); sp.anchor.set(k.ax, k.ay); sp.position.set(k.x, k.y); sp.rotation = k.rot; sp.scale.set(k.sx, k.sy);
      trupyC.addChild(sp); trupy.push({ sp, k });
    }
    if (trupy.length > 50) { const stare = trupy.splice(0, trupy.length - 40); utrwal(stare.map(t => t.k)); for (const t of stare) t.sp.destroy(); }
  }
  function utrwal(lista) {
    const c = new P.Container();
    for (const k of lista) { const sp = new P.Sprite(k.tex); sp.anchor.set(k.ax, k.ay); sp.position.set(k.x, k.y); sp.rotation = k.rot; sp.scale.set(k.sx, k.sy); c.addChild(sp); }
    renderer.render(c, { renderTexture: sladyRT, clear: false });
    c.destroy({ children: true });
  }
  function obloczek(x, y, vx, vy, r0, r1, czas, alfa, kolor, ziemia) { if (obloczki.length < 80) obloczki.push({ x, y, vx, vy, r0, r1, t: 0, czas, alfa, kolor, ziemia }); }
  function kurz(x, y, kat, ile, moc = 1) {
    for (let i = 0; i < ile; i++) {
      const a = kat + losuj(-0.6, 0.6), v = losuj(20, 60) * moc;
      obloczek(x + losuj(-6, 6), y + losuj(-3, 3), Math.cos(a) * v, Math.sin(a) * v * PERSP, 3, losuj(9, 15) * moc, losuj(0.35, 0.55), 0.32 * Math.min(1.4, moc), 0x8a7f6c, true);
    }
  }

  // ---------- ślady na ziemi (krew, ciała, cienie drzew) ----------
  function dorysujSlady(lista) {
    if (!lista.length) return;
    const c = new P.Container();
    for (const s of lista) {
      if (s.typ === 'cialo' && s.pada) { padajace.push(nowyPadajacy(s)); continue; }      // najpierw upadek, ślad później
      if (s.typ === 'cialo' && filmW[s.wrog]) {
        const fw = filmW[s.wrog], k = fw.k[fw.anim.trup[0]], sp = new P.Sprite(k.t); sp.anchor.set(k.ax, k.ay);
        sp.position.set(s.x, s.y); sp.scale.set(fw.skala * (s.sx === fw.patrzy ? 1 : -1), fw.skala); c.addChild(sp);
      } else if (s.typ === 'cialo') {
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
    padajace.length = 0; ciecia.length = 0; obloczki.length = 0; pioruny.length = 0;
    for (const t of trupy) t.sp.destroy(); trupy.length = 0;
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
  const pulaKawalkow = pula(aktorzy, () => new P.Sprite());
  const pulaBlyskow = pula(aktorzy, () => { const s = new P.Sprite(); s.blendMode = P.BLEND_MODES.ADD; s.tint = 0xffd8c8; return s; });   // potwór rozbłyska, gdy dostaje
  const pulaEch = pula(echaS, () => { const s = new P.Sprite(); s.tint = 0x9fb4cc; return s; });
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
  // Miecz (Patryk, 24 XI 13:27: wyciągania „nie widać”, chowanie „za szybkie”): wyciąga przez 1 s, chowa przez 1,3 s,
  // a chowa dopiero 1,5 s po tym, jak zrobi się spokojnie. Oba ruchy widać też w marszu, a cios, unik i blok kończą wyciąganie od razu.
  const MIECZ = { wyciaga: 1.0, chowa: 1.3, spokojPrzed: 1.5 };
  const stanRys = {
    miecz: 'schowany', mieczP: 0, spokoj: 0,   // mieczP: 0 w pochwie, 1 w dłoni
    upadlOd: -1, poprzZycie: BOHATER.zycie, slad: [], poprzStan: 'wolny',
    zadyszka: 0, oddech: 0, cykl: 0,          // po walce oddycha ciężej i szybciej
    odepchniecie: 0, pchniecie: 0, ranaKier: 1, // odrzut po bloku, wypad po parowaniu, skąd przyszła rana
    kop: { x: 0, y: 0 }, ucisk: 0, fiolet: 0,      // fiolet: błysk ekranu i światła po uderzeniu klątwy
                // kamera drgnie w stronę cięcia; mocny cios lekko przybliża
    bezDachu: 0,                                  // 0: chata z dachem, 1: dach zdjęty, bohater w izbie
    px: null, py: null, krok: 0, szedl: false, dochodzi: 0, kierKroku: 1, ruch: 'bieg', walka: 0,   // walka: ile jeszcze sekund trzyma gardę po ostatnim wrogu w pobliżu   // gdzie był klatkę temu, ile cykli chodu przeszedł, czy dokańcza krok po zatrzymaniu
  };

  const latwo = q => 1 - (1 - q) * (1 - q);
  const ku = (a, b2, t) => a + Math.atan2(Math.sin(b2 - a), Math.cos(b2 - a)) * t;   // obrót o część kąta najkrótszą drogą

  // Poza bohatera: gdzie jest miecz i jak ustawione jest ciało.
  // pochyl: > 0 pochyla się do przodu, < 0 odchyla do tyłu; przysiad: < 1 przykuca, > 1 wyciąga się; wykrok: przednia noga idzie naprzód.
  // Cięższy miecz (waga) mocniej rzuca ciałem.
  function poza(b, gra) {
    const bron = gra.bron, L = bron.dlugosc, ciezar = bron.obrazenia, waga = 0.8 + 0.12 * ciezar;
    const sx = Math.cos(b.kat) >= 0 ? 1 : -1;
    const spoczynek = b.kat + (0.6 + 0.1 * ciezar) * sx;              // ciężki miecz wisi niżej, prawie wlecze się po ziemi
    const p = { sx, a: spoczynek, lift: 10 + 6 * ciezar, drgaj: 0, smuga: null, blok: false, reka: 13, blask: 0, L, szer: bron.szerokosc, pochyl: 0, przysiad: 1, wykrok: 0, wstecz: false };
    if (b.stan === 'cios' && b.cios) {
      const c = b.cios, kier = Math.sign(c.do - c.od) || 1;
      p.sx = Math.cos(c.kat) >= 0 ? 1 : -1;
      const cofniecie = 0.45 + 0.15 * ciezar;                          // jak daleko miecz idzie do tyłu przed cięciem
      const unies = -L * (0.2 + 0.15 * ciezar);                        // i jak wysoko się unosi (cięższy wyżej)
      if (c.faza === 'zamach') {
        const w = latwo(Math.min(1, c.t / Math.max(0.001, c.czasZamachu)));
        p.a = c.od - kier * cofniecie * w; p.lift = p.lift + (unies - p.lift) * w;
        p.pochyl = -0.13 * w * waga; p.przysiad = 1 - 0.07 * w; p.wykrok = 0.35 * w;      // bierze zamach: odchyla się i ugina nogi
      } else if (c.faza === 'laduje') {
        p.a = c.od - kier * (cofniecie + 0.2 * c.naladowanie); p.lift = unies * (1 + 0.2 * c.naladowanie);
        p.drgaj = 0.4 + c.naladowanie * 1.2; p.blask = c.naladowanie;
        p.pochyl = -(0.15 + 0.07 * c.naladowanie) * waga; p.przysiad = 0.92 - 0.04 * c.naladowanie; p.wykrok = 0.45;
      } else if (c.faza === 'ciecie') {
        const q = Math.min(1, c.t / c.czasCiecia), r = (1 - q) * (1 - q), e = latwo(q);
        p.a = c.aktualny - kier * cofniecie * r; p.lift = unies * r + 6 * (1 - r);
        p.smuga = { od: c.od - kier * cofniecie, do: p.a, alfa: 1, mocny: c.mocny, utknal: c.utknal, l0: unies, l1: p.lift };
        if (c.mocny) p.blask = 1 - q;
        p.pochyl = (-0.14 + (c.mocny ? 0.46 : 0.36) * e) * waga;                          // tnie: całe ciało idzie za mieczem
        p.przysiad = 1 + 0.07 * Math.sin(q * Math.PI) - 0.04 * e; p.wykrok = 0.45 + 0.55 * e;
      } else {                                                          // powrót: miecz ciągnie dalej, potem wraca do ręki
        const koniec = c.czasPowrotu + (c.utknal ? BOHATER.miecz.grzeznie : 0), k = Math.min(1, c.t / Math.max(0.001, koniec));
        const cel = c.utknal ? c.aktualny : c.do + kier * 0.18 * Math.min(1, k * 3);
        p.a = k < 0.6 ? cel : ku(cel, spoczynek, (k - 0.6) / 0.4); p.lift = 6 + (p.lift - 6) * Math.max(0, (k - 0.6) / 0.4);
        if (c.utknal) { p.drgaj = 1.6; p.pochyl = -0.12 * waga; p.wykrok = 0.9; p.przysiad = 0.95; }   // wyszarpuje miecz z cielska
        else { const r2 = Math.max(0, (k - 0.25) / 0.75); p.pochyl = 0.22 * waga * (1 - latwo(r2)); p.wykrok = 1 - latwo(r2); p.przysiad = 0.96 + 0.04 * r2; }
        if (c.t < 0.12) p.smuga = { od: c.od - kier * cofniecie, do: c.utknal ? c.aktualny : c.do, alfa: 1 - c.t / 0.12, mocny: c.mocny, utknal: c.utknal, l0: unies, l1: 6 };
      }
    } else if (b.blok) {
      p.blok = true; p.reka = 16; p.pochyl = 0.06; p.przysiad = 0.94; p.wykrok = 0.4;    // garda: nisko, na szerokich nogach
    } else if (b.stan === 'unik') {
      const q = ogr(b.t / BOHATER.unik.czas, 0, 1);
      p.wstecz = Math.cos(b.unikKat - b.kat) < -0.3;                                     // odskok do tyłu: dalej patrzy na wroga
      if (!p.wstecz) p.sx = Math.cos(b.unikKat) >= 0 ? 1 : -1;
      p.a = b.unikKat + Math.PI * 0.85 * p.sx; p.lift = 10;
      p.pochyl = (p.wstecz ? -0.22 : 0.32) * Math.sin(Math.min(1, q * 1.6) * Math.PI / 2) * (1 - q * 0.6);
      p.przysiad = 0.84 + 0.16 * q; p.wykrok = 0.8 * (1 - q);
    } else if (b.stan === 'zachwiany') {
      p.a = b.kat + 1.35 * sx; p.lift = 24; p.drgaj = 2.2; p.pochyl = -0.22; p.przysiad = 0.93;
    } else if (b.stan === 'klatwa') {                                    // klątwa: drży, gdy unosi rękę, potem przykuca z pięścią w ziemi
      const L = KLATWA.ladowanie, U = KLATWA.uderzenie;
      if (b.t < L) { const w = b.t / L; p.drgaj = 0.7 * w; p.przysiad = 1 - 0.04 * w; p.pochyl = -0.06 * w; }
      else if (b.t < L + U) { p.przysiad = 0.8; p.pochyl = 0.25; p.a = b.kat + 1.5 * sx; p.lift = 30; }
      else { const q = latwo(Math.min(1, (b.t - L - U) / KLATWA.wstawanie)); p.przysiad = 0.8 + 0.2 * q; p.pochyl = 0.25 * (1 - q); p.a = b.kat + 1.5 * sx; p.lift = 30 * (1 - q) + 10 * q; }
    } else if (b.idzie) p.pochyl = 0.07;
    return p;
  }

  // Klatka animacji bohatera z filmów. Cios idzie za fazą (zamach, cięcie, powrót), a nie za zegarem,
  // więc ten sam film pasuje do lekkiego i do wielkiego miecza. Chód idzie za przebytą drogą.
  const klatkaZ = (n, q) => { const l = AB[n]; return l[Math.min(l.length - 1, Math.max(0, Math.floor(q * l.length)))]; };
  const klatkaPetli = (n, cykle) => { const l = AB[n]; return l[((Math.floor(cykle * l.length) % l.length) + l.length) % l.length]; };
  function klatkaBohatera(b, tUp) {
    if (b.stan === 'klatwa') {
      const L = KLATWA.ladowanie, U = KLATWA.uderzenie;
      if (b.t < L) return klatkaZ('klatwa_lad', b.t / L);
      if (b.t < L + U) return klatkaZ('klatwa_uderz', (b.t - L) / U);
      return klatkaZ('klatwa_wstaje', (b.t - L - U) / KLATWA.wstawanie);
    }
    if (b.stan === 'upadl') return klatkaZ('upadek', (czas - stanRys.upadlOd) / 1.4);   // osuwa się na kolana i pada na bok
    if (b.stan === 'zachwiany') return klatkaZ('rana', 0.15 + 0.8 * Math.min(1, b.t / Math.max(0.01, b.trwanie)));
    if (b.stan === 'cios' && b.cios) {
      const c = b.cios;
      if (c.faza === 'zamach') return klatkaZ('zamach', c.t / Math.max(0.001, c.czasZamachu));
      if (c.faza === 'laduje') return klatkaZ('zamach', 1);
      if (c.faza === 'ciecie') return klatkaZ('ciecie', c.t / Math.max(0.001, c.czasCiecia));
      const koniec = c.czasPowrotu + (c.utknal ? BOHATER.miecz.grzeznie : 0);
      return klatkaZ('powrot', c.utknal ? 0 : c.t / Math.max(0.001, koniec));
    }
    if (b.blok) return klatkaZ('blok', 0.5);
    if (b.flash > 0) return klatkaZ('rana', (1 - b.flash / 0.25) * 0.55);
    if (b.stan === 'unik') return klatkaZ('przewrot', b.t / BOHATER.unik.czas);   // unik to przewrót w stronę uniku
    // Wyciąga miecz, gdy zaczyna się walka, i chowa go po niej (film Patryka z Flow, 24 XI; chowanie to ten sam film wstecz).
    // Ma pierwszeństwo przed chodem, żeby było go widać także w ruchu.
    if (stanRys.miecz === 'wyciaga' || stanRys.miecz === 'chowa') return klatkaZ('wyciaga', stanRys.mieczP);
    if (b.idzie || stanRys.dochodzi > 0) return klatkaPetli(stanRys.ruch, stanRys.krok);
    // W walce stoi w gardzie z mieczem uniesionym przed sobą; gdy wokół pusto, opuszcza miecz i oddycha (Patryk, 24 XI).
    // Klatki gardy idą tam i z powrotem, powoli, jak ważenie miecza w dłoniach.
    if (AB.wyciaga ? stanRys.miecz === 'w_dloni' : stanRys.walka > 0) { const l = AB.gotowosc.length, i = Math.floor(czas * 4) % (2 * l - 2); return AB.gotowosc[i < l ? i : 2 * l - 2 - i]; }
    return klatkaPetli('spoczynek', czas * 8 / AB.spoczynek.length);       // oddech jak w filmie: 8 klatek na sekundę
  }
  // ustawia obraz bohatera: stopy w (x, y), pochylenie lx, przysiad sy (szerokość zmienia się odwrotnie, żeby ciało nie traciło masy)
  function ustawPostac(sp, k, sx, x, y, lx, sy, obrot) {
    sp.texture = k.t; sp.anchor.set(k.ax, k.ay);
    sp.scale.set(SKALA_B * (PATRZY_B === sx ? 1 : -1) / Math.sqrt(sy), SKALA_B * sy);
    sp.skew.set(-lx, 0); sp.rotation = obrot; sp.position.set(x, y);
  }

  // rysuje bohatera kodem do grafiki g, stopy w (0,0); p to poza z poza()
  function rysujBohatera(g, b, gra, p, alfaCala = 1) {
    const sx = p.sx, X = v => v * sx;
    const krok = b.idzie && b.stan !== 'unik' ? Math.sin(b.chod) : 0;
    const pod = b.idzie && b.stan !== 'unik' ? Math.abs(Math.cos(b.chod)) * 2 : 0;
    const wk = p.wykrok;
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
      tx2 = hx + Math.cos(kp) * p.L * 0.85; ty2 = hy + Math.sin(kp) * p.L * 0.85 * PERSP - 14;
    } else {
      hx = srodek.x + Math.cos(p.a) * p.reka; hy = srodek.y + Math.sin(p.a) * p.reka * PERSP;
      tx2 = hx + Math.cos(p.a) * p.L; ty2 = hy + Math.sin(p.a) * p.L * PERSP + p.lift;
    }
    const mieczZa = ty2 < hy - 8;              // ostrze w górę ekranu: chowa się za plecami
    p.ostrze = { hx, hy: hy, tx: tx2, ty: ty2 };

    const ramie = { x: X(8) + dj, y: -56 + oy };
    if (mieczZa) { rysujMiecz(g, hx, hy, tx2, ty2, alfaCala, p); rysujReke(g, ramie, hx, hy, alfaCala); }

    // futro zwisające z pleców
    ksztalt([-8, -62, -17, -50, -21, -30, -19, -14, -15, -19, -12, -11, -8, -18, -4, -13, -2, -56], 0x2f2b28);
    g.lineStyle(1, 0x4a4540, alfaCala); g.moveTo(X(-12) + dj, -50 + oy); g.lineTo(X(-15) + dj, -20 + oy); g.moveTo(X(-7) + dj, -52 + oy); g.lineTo(X(-8) + dj, -22 + oy);
    // druga ręka
    g.lineStyle(6.2, OB, alfaCala); g.moveTo(X(-8) + dj, -56 + oy); g.lineTo(X(-11 - krok * 2) + dj, -36 + oy);
    g.lineStyle(4, 0x5a4a3c, alfaCala); g.moveTo(X(-8) + dj, -56 + oy); g.lineTo(X(-11 - krok * 2) + dj, -36 + oy);
    // nogi i buty: od bioder do stóp; w wykroku przednia noga idzie naprzód, tylna się zapiera
    for (const [bx0, cx, kol] of [[-4, -5 + krok * 4 - wk * 6, 0x37302a], [4, 4 - krok * 4 + wk * 8, 0x433a32]]) {
      ksztalt([bx0 - 3.8, -34, bx0 + 3.8, -34, cx + 3.3, -7, cx - 3.3, -7], kol);
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

    if (!mieczZa) { rysujReke(g, ramie, hx, hy, alfaCala); rysujMiecz(g, hx, hy, tx2, ty2, alfaCala, p); }
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

  function rysujMiecz(g, hx, hy, tx2, ty2, al, p) {
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
    const bx = hx + ux * 6, by = hy + uy * 6, sz = p.szer;
    const pts = [bx + px * sz, by + py * sz, tx2 - ux * 8 + px * sz * 0.8, ty2 - uy * 8 + py * sz * 0.8, tx2, ty2,
      tx2 - ux * 8 - px * sz * 0.8, ty2 - uy * 8 - py * sz * 0.8,
      bx + ux * L * 0.55 - px * sz * 0.95, by + uy * L * 0.55 - py * sz * 0.95,
      bx + ux * (L * 0.55 - 3) - px * sz * 0.35, by + uy * (L * 0.55 - 3) - py * sz * 0.35,
      bx + ux * (L * 0.55 - 6) - px * sz, by + uy * (L * 0.55 - 6) - py * sz,
      bx - px * sz, by - py * sz];
    g.lineStyle(1.6, OB, al); g.beginFill(0x5c6067, al); g.drawPolygon(pts); g.endFill();
    g.lineStyle(1, 0x34373c, al); g.moveTo(bx, by); g.lineTo(bx + ux * L * 0.7, by + uy * L * 0.7);
    g.lineStyle(1.1 + p.blask * 1.6, p.blask > 0.05 ? 0xffd890 : 0xdfe3e8, 0.9 * al); g.moveTo(bx + px * sz * 0.8, by + py * sz * 0.8); g.lineTo(tx2 - ux * 6 + px * sz * 0.6, ty2 - uy * 6 + py * sz * 0.6);
  }

  // ---------- jedna klatka ----------
  let czas = 0;
  const krople = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), v: 0.9 + Math.random() * 0.6, d: 0.6 + Math.random() * 0.8 }));

  // Uderzenie klątwy: fala po ziemi, pioruny w górę, odłamki, pęknięcia zostają na ziemi.
  function uderzenieKlatwy(z) {
    pierscienie.push({ x: z.x, y: z.y, r0: 20, r1: z.zasieg * 1.15, t: 0, czas: 0.45, kolor: 0xb070ff, ziemia: true });
    pierscienie.push({ x: z.x, y: z.y, r0: 10, r1: z.zasieg * 0.7, t: 0, czas: 0.22, kolor: 0xf0dcff, ziemia: true });
    for (let i = 0; i < 9; i++) {
      const a = losuj(0, TAU), r = losuj(20, z.zasieg * 0.9), x0 = z.x + Math.cos(a) * r, y0 = z.y + Math.sin(a) * r * PERSP;
      const pkt = [x0, y0], wys = losuj(60, 150), n = 6;
      for (let k = 1; k <= n; k++) pkt.push(x0 + losuj(-14, 14) + (z.x - x0) * 0.15 * k / n, y0 - wys * k / n);
      pioruny.push({ pkt, t: 0, czas: losuj(0.18, 0.34) });
    }
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; kurz(z.x + Math.cos(a) * 14, z.y + Math.sin(a) * 7, a, 1, 2.2); }
    for (let i = 0; i < 10; i++) { const a = losuj(0, TAU), v = losuj(120, 260); obloczek(z.x, z.y - 6, Math.cos(a) * v, Math.sin(a) * v * PERSP, 2, 4, losuj(0.3, 0.5), 0.9, 0x1a0f24, true); }
    // pęknięcia: rysowane raz do śladów na ziemi
    const g = new P.Graphics();
    for (let i = 0; i < 10; i++) {
      let a = i / 10 * TAU + losuj(-0.25, 0.25), x = z.x, y = z.y; const dl = losuj(50, z.zasieg * 0.85);
      const pk = [[x, y]];
      for (let d = 0; d < dl; d += 16) { a += losuj(-0.5, 0.5); x += Math.cos(a) * 16; y += Math.sin(a) * 16 * PERSP; pk.push([x, y]); }
      for (const [szer, kol, al] of [[5, 0x0b0710, 0.7], [2.2, 0x7a3cc8, 0.5]]) {      // ślady mają pół rozdzielczości, więc kreski grubsze
        g.lineStyle(szer, kol, al); g.moveTo(pk[0][0], pk[0][1]); for (const [px, py] of pk.slice(1)) g.lineTo(px, py);
      }
    }
    renderer.render(g, { renderTexture: sladyRT, clear: false }); g.destroy();
    stanRys.kop.y += 10; stanRys.ucisk = 1.4; stanRys.fiolet = 1; stanRys.zadyszka += 0.15;
    napis('Klątwa', z.x, z.y - 110, 0xc8a0ff);
  }

  // ---------- potwory z filmów Przemka ----------
  // Klatka zależy od stanu z walka.js: zamach i skok idą za czasem ataku, chód za przebytą drogą,
  // trafienie (rozpoznane po błysku) przerywa chód krótkim wstrząsem, ogłuszenie pokazuje cały film trafienia.
  function rysujWrogaZFilmu(e, fw, b, gra) {
    const typ = e.typ;
    const sx = Math.cos(e.stan === 'idzie' || e.stan === 'wynurza' || e.stan === 'odpoczynek' ? Math.atan2(b.y - e.y, b.x - e.x) : e.kat) >= 0 ? 1 : -1;
    if (e.flash > (e._fl || 0) + 0.001) e._trafOd = czas;                 // nowy cios: błysk urósł
    e._fl = e.flash;
    const odTraf = czas - (e._trafOd === undefined ? -9 : e._trafOd);
    let k, oczy = false;
    if (e.stan === 'zamach') { k = klatkaW(fw, 'zamach', e.t / typ.zamach); oczy = !typ.ciezki; }   // kolos unosi pięść nad głowę i zasłania oczy; ostrzega go krąg na ziemi
    else if (e.stan === 'skok') k = klatkaW(fw, 'skok', e.t / typ.skok);
    else if (e.stan === 'ogluszony') k = klatkaW(fw, 'trafienie', e.t / 1.2);
    else if (odTraf < fw.trafienie) k = klatkaW(fw, 'trafienie', 0.4 * odTraf / fw.trafienie);
    else if (e.stan === 'odpoczynek' && e.t < 0.6) k = klatkaW(fw, 'odpoczynek', e.t / 0.6);
    else { k = klatkaPetliW(fw, 'chod', e.anim * 70 / fw.droga); oczy = true; }
    const zn = sx === fw.patrzy ? 1 : -1, odB = e.x >= b.x ? 1 : -1;
    let rot = 0, skx = 1, sky = 1;
    if (e.flash > 0) { const f = e.flash / 0.12; rot += odB * (typ.ciezki ? 0.05 : 0.12) * f; sky *= 1 - 0.08 * f; skx *= 1 + 0.06 * f; }
    const sp = pulaWrogow.wez();
    sp.texture = k.t; sp.anchor.set(k.ax, k.ay); sp.scale.set(fw.skala * zn * skx, fw.skala * sky); sp.rotation = rot;
    sp.position.set(e.x + (e.drzy || 0), e.y); sp.zIndex = e.y; sp.alpha = e.stan === 'wynurza' ? e.widac : 1;
    if (e.flash > 0) {                                                     // rozbłysk przy trafieniu
      const bl = pulaBlyskow.wez(); bl.texture = k.t; bl.anchor.set(k.ax, k.ay); bl.scale.copyFrom(sp.scale); bl.rotation = rot;
      bl.position.copyFrom(sp.position); bl.zIndex = e.y + 0.01; bl.alpha = 0.6 * e.flash / 0.12;
    }
    const cs = pulaCieni.wez(); cs.position.set(e.x, e.y + 1); cs.width = e.promien * fw.cien; cs.height = e.promien * 1.3; cs.alpha = sp.alpha;
    if (oczy) {                                                            // oczy świecą w ciemności; przed atakiem rozbłyskują
      const oko = pulaOczu.wez(); oko.texture = typ.ciezki ? T.okoBursztyn : T.okoCzerwone;
      oko.position.set(e.x + (e.drzy || 0) + sx * fw.oko.x, e.y + fw.oko.y);
      const mocOka = e.stan === 'zamach' ? 1.7 + Math.sin(czas * 40) * 0.3 : 1;
      oko.width = oko.height = (typ.ciezki ? 16 : 11) * mocOka; oko.alpha = sp.alpha * 0.8;
    }
    if (e.stan === 'ogluszony') {                                          // wiruje mu w głowie (i dostaje podwójne obrażenia)
      for (let i = 0; i < 3; i++) {
        const a = czas * 6 + i * TAU / 3, x = e.x + sx * fw.oko.x * 0.6 + Math.cos(a) * 12, y = e.y + fw.oko.y - 16 + Math.sin(a) * 4;
        znaki.lineStyle(0); znaki.beginFill(0xffe2a0, 0.9); znaki.drawCircle(x, y, 2.4); znaki.endFill();
      }
    }
    zapowiedzKolosa(e, gra);
  }
  // kolos zapowiada uderzenie kręgiem na ziemi, a gdy wali, ziemia faluje
  function zapowiedzKolosa(e, gra) {
    if (e.typ.ciezki && e.stan === 'zamach' && e.cel) {
      const q = ogr(e.t / e.typ.zamach, 0, 1);
      znakiZiemia.lineStyle(3, 0xff5a3a, 0.85); znakiZiemia.beginFill(0xff3a1a, 0.1 + 0.25 * q);
      znakiZiemia.drawEllipse(e.cel.x, e.cel.y, e.typ.strefa, e.typ.strefa * PERSP); znakiZiemia.endFill();
      znakiZiemia.lineStyle(0); znakiZiemia.beginFill(0xff6a3a, 0.3); znakiZiemia.drawEllipse(e.cel.x, e.cel.y, e.typ.strefa * q, e.typ.strefa * PERSP * q); znakiZiemia.endFill();
    }
    if (e.typ.ciezki && e.stan === 'skok' && e.cel && !e._uderzyl) {
      e._uderzyl = true;
      pierscienie.push({ x: e.cel.x, y: e.cel.y, r0: 20, r1: e.typ.strefa * 1.4, t: 0, czas: 0.4, kolor: 0xd8c8b0, ziemia: true });
      kurz(e.cel.x, e.cel.y, 0, 6, 1.4); kurz(e.cel.x, e.cel.y, Math.PI, 6, 1.4);
      for (let i = 0; i < 8; i++) gra.slady.push({ typ: 'kropla', x: e.cel.x + losuj(-40, 40), y: e.cel.y + losuj(-20, 20), r: 0.1 });
    }
    if (e.stan !== 'skok') e._uderzyl = false;
  }
  // śmierć z filmu: potwór pada (ghul na plecy, kolos na twarz), a ostatnia klatka zostaje na ziemi
  function padaZFilmu(f, i, dt) {
    const s = f.s, fw = f.fw, q = Math.min(1, f.t / f.czas);
    const dx = Math.cos(s.kat), dy = Math.sin(s.kat), slizg = (f.ciezki ? 8 : 18) * latwo(Math.min(1, q * 2));
    const x = s.x + dx * slizg, y = s.y + dy * slizg, zn = s.sx === fw.patrzy ? 1 : -1;
    const al = f.gasnie >= 0 ? Math.max(0, 1 - f.gasnie / 0.15) : 1;
    const k = klatkaW(fw, 'smierc', q);
    const sp = pulaKawalkow.wez(); sp.texture = k.t; sp.anchor.set(k.ax, k.ay); sp.position.set(x, y); sp.rotation = 0;
    sp.scale.set(fw.skala * zn, fw.skala); sp.zIndex = y; sp.alpha = al;
    if (f.t < 0.12) { const bl = pulaBlyskow.wez(); bl.texture = k.t; bl.anchor.set(k.ax, k.ay); bl.scale.copyFrom(sp.scale); bl.rotation = 0; bl.position.set(x, y); bl.zIndex = y + 0.01; bl.alpha = 0.7 * (1 - f.t / 0.12); }
    if (q >= 1 && f.gasnie < 0) {
      const kt = fw.k[fw.anim.trup[0]];
      zostaw([{ tex: kt.t, ax: kt.ax, ay: kt.ay, x, y, rot: 0, sx: fw.skala * zn, sy: fw.skala }]); f.gasnie = 0;
      if (f.ciezki) { pierscienie.push({ x: x + zn * 60, y, r0: 20, r1: 110, t: 0, czas: 0.4, kolor: 0xb8a890, ziemia: true }); kurz(x + zn * 60, y, 0, 6, 1.6); kurz(x + zn * 60, y, Math.PI, 6, 1.6); stanRys.kop.y += 6; }
      else kurz(x - zn * 25, y, s.kat, 3, 0.8);
    } else if (f.gasnie >= 0) { f.gasnie += dt; if (f.gasnie > 0.15) padajace.splice(i, 1); }
  }

  function rysuj(gra, dt, zdarzenia) {
    czas += dt;
    const b = gra.bohater;
    // dach znika w ćwierć sekundy, gdy bohater wejdzie do izby, i wraca, gdy wyjdzie (jak w Tibii)
    const wProgu = b.x > CHATA.przejscie.x0 && b.x < CHATA.przejscie.x1 && b.y > CHATA.przejscie.y0 && b.y < CHATA.przejscie.y1 + 6;   // w progu dach już gaśnie
    if (bezDachu) stanRys.bezDachu = ogr(stanRys.bezDachu + (b.wChacie || wProgu ? 1 : -1) * dt * 4, 0, 1);
    const fD = stanRys.bezDachu;
    chata.alpha = 1 - fD; chata.visible = fD < 1;
    izbaSpod.alpha = izbaPrzod.alpha = fD; izbaSpod.visible = izbaPrzod.visible = fD > 0;
    const oD = gra.drzwi ? gra.drzwi.o : 0, eD = oD * oD * (3 - 2 * oD);                 // skrzydło zwalnia na końcu obrotu
    drzwiC.visible = oD > 0.001 && fD < 1; drzwiC.alpha = 1 - fD;
    lisc.scale.x = CHATA.skala * (1 - 0.8 * eD); lisc.skew.y = -0.32 * eD;              // obraca się do środka: węższe i uniesione z prawej
    const cien = Math.round(255 - 110 * eD); lisc.tint = (cien << 16) | (cien << 8) | cien;

    // zdarzenia, które widać na obrazie
    for (const z of zdarzenia) {
      if (z.typ === 'parowanie') { napis('Sparowane!', b.x, b.y - 96, 0xffe2a0); pierscienie.push({ x: b.x, y: b.y - 40, r0: 20, r1: 90, t: 0, czas: 0.3, kolor: 0xfff0c0 }); }
      else if (z.typ === 'grzeznie') napis('Miecz grzęźnie', b.x, b.y - 96, 0xc9ccd2);
      else if (z.typ === 'unikniety') napis('Unik', b.x, b.y - 96, 0xa8c4e0);
      else if (z.typ === 'przeciete') napis(`Przecięte: ${z.ile}`, b.x, b.y - 96, 0xe8b070);
      else if (z.typ === 'naladowany') pierscienie.push({ x: b.x, y: b.y, r0: 50, r1: 20, t: 0, czas: 0.22, kolor: 0xffd890, ziemia: true });
      else if (z.typ === 'zamach' && z.mocny) pierscienie.push({ x: b.x, y: b.y, r0: 30, r1: gra.bron.zasieg * 1.1, t: 0, czas: 0.3, kolor: 0xffe8c0, ziemia: true });
      // animacje ciała i uderzenia
      if (z.typ === 'zamach') {
        stanRys.zadyszka += z.mocny ? 0.1 : 0.04 + 0.015 * gra.bron.obrazenia;
        const ka = b.cios ? b.cios.kat : b.kat;
        kurz(b.x - Math.cos(ka) * 10, b.y - Math.sin(ka) * 5, ka + Math.PI, z.mocny ? 5 : 2 + gra.bron.obrazenia, z.mocny ? 1.4 : 0.8 + 0.15 * gra.bron.obrazenia);
      } else if (z.typ === 'trafienie') {
        for (const m of z.gdzie || []) ciecia.push({ x: m.x, y: m.y - m.wys, kat: m.kat, t: 0, czas: z.mocny ? 0.2 : 0.14, dl: z.mocny ? 78 : 40 + 9 * gra.bron.obrazenia });
        const ka = b.cios ? b.cios.kat : b.kat, sila = z.mocny ? 9 : 2.5 + gra.bron.obrazenia * 1.5;
        stanRys.kop.x += Math.cos(ka) * sila; stanRys.kop.y += Math.sin(ka) * sila * PERSP;
        if (z.mocny) stanRys.ucisk = 1;
      } else if (z.typ === 'rana') { stanRys.ranaKier = Math.sign(b.odrzutX) || -(Math.cos(b.kat) >= 0 ? 1 : -1); stanRys.zadyszka += 0.12; }
      else if (z.typ === 'blok') stanRys.odepchniecie = 1;
      else if (z.typ === 'parowanie') stanRys.pchniecie = 1;
      else if (z.typ === 'klatwa_laduje') pierscienie.push({ x: b.x, y: b.y, r0: KLATWA.zasieg, r1: 24, t: 0, czas: KLATWA.ladowanie, kolor: 0x9a5cff, ziemia: true });
      else if (z.typ === 'klatwa') uderzenieKlatwy(z);
    }
    stanRys.zadyszka = ogr(stanRys.zadyszka - dt * 0.05, 0, 1);
    stanRys.oddech += dt * (2 + 2.8 * stanRys.zadyszka);
    stanRys.odepchniecie = Math.max(0, stanRys.odepchniecie - dt * 5); stanRys.pchniecie = Math.max(0, stanRys.pchniecie - dt * 5);
    if (b.stan === 'unik' && stanRys.poprzStan !== 'unik') kurz(b.x, b.y, b.unikKat + Math.PI, 4, 1.1);
    // „Krew za krew”: życie wróciło po ciosie
    if (b.stan !== 'upadl' && b.zycie > stanRys.poprzZycie + 0.5 && gra.faza !== 'przerwa') napis(`+${Math.round(b.zycie - stanRys.poprzZycie)}`, b.x + 18, b.y - 84, 0xff6a5a);
    stanRys.poprzZycie = b.zycie;
    // kałuża pod bohaterem, gdy upada
    if (b.stan === 'upadl' && stanRys.poprzStan !== 'upadl') { stanRys.upadlOd = czas; gra.slady.push({ typ: 'kaluza', x: b.x, y: b.y, duza: true }); }
    stanRys.poprzStan = b.stan;
    // tryb walki: wróg w promieniu 700 (albo cios w toku) trzyma miecz w gardzie, 2 s po ostatnim opuszcza go
    if (b.stan === 'cios' || gra.wrogowie.some(e => e.stan !== 'wynurza' && Math.abs(e.x - b.x) < 700 && Math.abs(e.y - b.y) < 700)) stanRys.walka = 2; else stanRys.walka = Math.max(0, stanRys.walka - dt);
    if (AB.wyciaga) {                                                     // miecz: schowany, wyciaga, w dłoni, chowa
      // walka: cały etap nocy (od chwili, gdy wychodzą potwory) albo wróg blisko; chowa po chwili spokoju
      const walczy = (gra.faza === 'walka' || stanRys.walka > 0) && !b.wChacie && b.stan !== 'upadl';
      stanRys.spokoj = walczy ? 0 : stanRys.spokoj + dt;
      const m = stanRys.miecz;
      if (b.stan === 'cios' || b.stan === 'unik' || b.blok) { stanRys.miecz = 'w_dloni'; stanRys.mieczP = 1; stanRys.spokoj = 0; }   // w biegu walki miecz jest już w dłoni
      else if (walczy && (m === 'schowany' || m === 'chowa')) stanRys.miecz = 'wyciaga';
      else if (stanRys.spokoj > MIECZ.spokojPrzed && (m === 'w_dloni' || m === 'wyciaga')) stanRys.miecz = 'chowa';
      if (stanRys.miecz === 'wyciaga') { stanRys.mieczP = Math.min(1, stanRys.mieczP + dt / MIECZ.wyciaga); if (stanRys.mieczP >= 1) stanRys.miecz = 'w_dloni'; }
      if (stanRys.miecz === 'chowa') { stanRys.mieczP = Math.max(0, stanRys.mieczP - dt / MIECZ.chowa); if (stanRys.mieczP <= 0) stanRys.miecz = 'schowany'; }
    }
    dorysujSlady(gra.slady);

    // kamera
    const celX = b.x + Math.cos(b.kat) * 36, celY = b.y - 40 + Math.sin(b.kat) * 24;
    if (!kam.gotowa) { kam.x = celX; kam.y = celY; kam.gotowa = true; }
    const k = Math.min(1, dt * 5); kam.x += (celX - kam.x) * k; kam.y += (celY - kam.y) * k;
    const zg = Math.exp(-dt * 16); stanRys.kop.x *= zg; stanRys.kop.y *= zg; stanRys.ucisk = Math.max(0, stanRys.ucisk - dt * 5);
    const zz = zoom * (1 + 0.045 * stanRys.ucisk * stanRys.ucisk);   // mocny cios: kamera na chwilę się przybliża
    const pw = vw / 2 / zz, ph = vh / 2 / zz;
    const kx = ogr(kam.x, pw, SZER - pw), ky = ogr(kam.y, ph, WYS - ph);
    const drz = gra.wstrzas * 0.8;
    const ox = Math.round((vw / 2 - kx * zz + ((Math.random() - 0.5) * drz + stanRys.kop.x) * zz) * 2) / 2;
    const oy = Math.round((vh / 2 - ky * zz + ((Math.random() - 0.5) * drz + stanRys.kop.y) * zz) * 2) / 2;
    for (const w of [swiat, nad]) { w.scale.set(zz); w.position.set(ox, oy); }

    // widoczny kawałek świata (z zapasem na wysokie drzewa)
    const L = -ox / zz - 140, R = (vw - ox) / zz + 140, G = -oy / zz - 60, D = (vh - oy) / zz + 380;
    for (let i = 0; i < drzewa.length; i++) { const d = DRZEWA[i]; drzewa[i].visible = d.x > L && d.x < R && d.y > G && d.y < D; }

    // bohater: poza, potem ciało (pochylenie, przysiad, oddech, odrzut po ranie i bloku)
    const pz = poza(b, gra), zad = stanRys.zadyszka;
    if (b.stan === 'unik' && trybBohatera === 'gemini' && maObraz) pz.sx = Math.cos(b.unikKat) >= 0 ? 1 : -1;   // przewrót w stronę uniku
    let lx = pz.sx * pz.pochyl, sy = pz.przysiad;
    if (b.flash > 0 && b.stan !== 'upadl') lx += stanRys.ranaKier * 0.32 * (b.flash / 0.25);
    lx += pz.sx * (0.14 * stanRys.pchniecie - 0.2 * stanRys.odepchniecie);
    const spokoj = b.stan === 'wolny' && !b.idzie && !b.blok;
    if (spokoj) { sy *= 1 + Math.sin(stanRys.oddech) * (0.008 + 0.025 * zad); lx += pz.sx * 0.05 * zad; }
    lx = ogr(lx, -0.5, 0.5);
    const sxs = 1 / Math.sqrt(sy);
    const wSwiecie = (x, y) => ({ x: b.x + sxs * x - Math.sin(lx) * sy * y, y: b.y + Math.cos(lx) * sy * y });   // punkt ciała (stopy w 0,0) na świecie
    const upadl = b.stan === 'upadl', tUp = upadl ? Math.min(1, (czas - stanRys.upadlOd) / 0.35) : 0;
    const gemF = trybBohatera === 'gemini' && maObraz;                      // z filmu upadek pokazuje sam film, bez obracania
    const obrot = upadl && !gemF ? -pz.sx * 1.45 * tUp : 0, alfaB = upadl ? (gemF ? 1 : 1 - Math.max(0, czas - stanRys.upadlOd - 1.4) * 0.6) : (b.nietykalny > 0 && b.stan !== 'unik' ? 0.75 : 1);
    const tint = b.flash > 0 ? 0xff8080 : (pz.blask > 0.05 ? 0xffe6c0 : 0xffffff);
    const gem = trybBohatera === 'gemini' && maObraz;
    bohG.visible = !gem && !b.spi; bohS.visible = gem && !b.spi; bohCien.visible = !b.spi;   // śpiącego na posłaniu nie widać
    // chód: klatki biegną z przebytą drogą. W filmie bohater idzie w bok i trochę do nas, więc idąc tyłem
    // (od celu albo w górę ekranu) film leci wstecz. Rusza i staje w chwili, gdy nogi się mijają, bez przeskoku.
    if (stanRys.px === null) { stanRys.px = b.x; stanRys.py = b.y; }
    const ddx = b.x - stanRys.px, ddy = b.y - stanRys.py, dd = Math.hypot(ddx, ddy);
    stanRys.px = b.x; stanRys.py = b.y;
    const chodzi = b.idzie && b.stan === 'wolny' && !b.blok;
    if (chodzi && dd > 0 && dd < 40) {                                      // w górę ekranu plecami, z zapasem, żeby nie migało
      if (stanRys.ruch === 'bieg' && ddy < -0.8 * dd) { stanRys.ruch = 'chod_tyl'; }
      else if (stanRys.ruch === 'bieg' && ddy > 0.8 * dd && AB.chod_przod) { stanRys.ruch = 'chod_przod'; }   // w dół przodem, gdy jest film
      else if (stanRys.ruch === 'chod_tyl' && ddy > -0.5 * dd) { stanRys.ruch = 'bieg'; }
      else if (stanRys.ruch === 'chod_przod' && ddy < 0.5 * dd) { stanRys.ruch = 'bieg'; }
    }
    const RU = RUCH[stanRys.ruch];
    const faza = () => ((stanRys.krok % 1) + 1) % 1;
    const doMijania = (kier) => { const d = Math.min(...RU.mijanie.map(m => ((kier * (m - faza())) % 1 + 1) % 1)); return d > 0.995 ? 0 : d; };   // ile cyklu do najbliższego mijania nóg
    if (chodzi && !stanRys.szedl && stanRys.dochodzi <= 0) {                 // rusza: od nóg razem, nie z pół kroku
      const f = faza(), m = RU.mijanie.reduce((a, c) => Math.abs(c - f) < Math.abs(a - f) ? c : a);
      stanRys.krok += m - f;
    }
    if (b.idzie && b.stan !== 'unik' && dd > 0 && dd < 40) {
      stanRys.kierKroku = stanRys.ruch === 'chod_tyl' ? (ddy <= 0 ? 1 : -1) : stanRys.ruch === 'chod_przod' ? (ddy >= 0 ? 1 : -1) : (ddx * pz.sx + 0.3 * ddy >= -0.15 * dd ? 1 : -1);
      stanRys.krok += stanRys.kierKroku * dd / RU.droga;
      stanRys.dochodzi = 0;
    } else if (stanRys.szedl && !chodzi && b.stan === 'wolny' && !b.blok && b.flash <= 0) {
      stanRys.dochodzi = doMijania(stanRys.kierKroku) > 0.02 ? 0.3 : 0;      // stanął w pół kroku: dostawia nogę
    }
    if (stanRys.dochodzi > 0) {
      const ile = Math.min(doMijania(stanRys.kierKroku), 1.6 * dt);       // dostawia w tempie marszu, najdłużej 0,3 s
      stanRys.krok += stanRys.kierKroku * ile;
      stanRys.dochodzi = doMijania(stanRys.kierKroku) < 0.005 || b.idzie || b.stan !== 'wolny' ? 0 : stanRys.dochodzi - dt;
    }
    stanRys.szedl = chodzi;
    let kB = null;
    if (gem) {
      kB = klatkiB[klatkaBohatera(b, tUp)];
      lx *= 0.5;                                     // film sam porusza ciałem, kod tylko dodaje trochę wagi
      const dj = pz.drgaj ? (Math.random() - 0.5) * pz.drgaj : 0;
      ustawPostac(bohS, kB, pz.sx, b.x + dj, b.y, lx, sy, obrot);
      bohS.zIndex = b.y; bohS.alpha = alfaB; bohS.tint = tint;
    } else {
      bohG.clear(); rysujBohatera(bohG, b, gra, pz);
      bohG.position.set(b.x, b.y); bohG.skew.set(-lx, 0); bohG.scale.set(sxs, sy); bohG.rotation = obrot;
      bohG.zIndex = b.y; bohG.alpha = alfaB; bohG.tint = tint;
    }
    bohCien.position.set(b.x, b.y + 1); bohCien.width = kB ? Math.max(40, kB.w * SKALA_B * 0.55) : 40; bohCien.height = 15;
    // ciepły blask, gdy ładuje mocny cios
    const sr = wSwiecie(0, -50);
    blaskBoh.position.set(sr.x, sr.y); blaskBoh.width = blaskBoh.height = 150; blaskBoh.alpha = upadl ? 0 : pz.blask * 0.75;
    // fioletowy żar przeklętej ręki: rośnie, gdy ją unosi, przy uderzeniu przechodzi w ziemię
    stanRys.fiolet = Math.max(0, stanRys.fiolet - dt * 2.5);
    if (b.stan === 'klatwa' && b.t < KLATWA.ladowanie) {
      const w = b.t / KLATWA.ladowanie, rk = gem ? wSwiecie(-pz.sx * 16, -68) : wSwiecie(-pz.sx * 10, -48);
      blaskKlatwy.position.set(rk.x, rk.y); blaskKlatwy.width = blaskKlatwy.height = 40 + 90 * w; blaskKlatwy.alpha = 0.35 + 0.55 * w;
    } else {
      blaskKlatwy.position.set(b.x, b.y - 10); blaskKlatwy.width = blaskKlatwy.height = 120 + 380 * stanRys.fiolet; blaskKlatwy.alpha = stanRys.fiolet;
    }
    // oddech w zimnej nocy: obłoczek przy każdym wydechu, gęstszy po walce
    const cykl = Math.floor(stanRys.oddech / TAU);
    if (cykl !== stanRys.cykl) {
      stanRys.cykl = cykl;
      if (!upadl && gra.mroczek > 0.3) { const u = gem ? wSwiecie(pz.sx * 8, -85) : wSwiecie(pz.sx * 9, -67); obloczek(u.x, u.y, pz.sx * 16, -8, 2, 9 + 7 * zad, 0.9, 0.1 + 0.25 * zad, 0xd8dde4, false); }
    }

    // powidoki uniku
    // (czas gry, więc w zwolnionym tempie i w pauzie powidoki stoją razem z grą)
    echa.clear();
    const sl = stanRys.slad, ost = sl[sl.length - 1];
    if (b.stan === 'unik' && (!ost || gra.czas - ost.t > 0.03)) {
      sl.push(gem ? { x: bohS.x, y: bohS.y, t: gra.czas, tex: bohS.texture, ax: bohS.anchor.x, ay: bohS.anchor.y, sx: bohS.scale.x, sy: bohS.scale.y, skx: bohS.skew.x } : { x: b.x, y: b.y, t: gra.czas });
    }
    while (sl.length && (gra.czas - sl[0].t > 0.16 || gra.czas < sl[0].t)) sl.shift();
    pulaEch.start();
    for (const s of sl) {
      const al = 1 - (gra.czas - s.t) / 0.16;
      if (s.tex) { const e = pulaEch.wez(); e.texture = s.tex; e.anchor.set(s.ax, s.ay); e.position.set(s.x, s.y); e.scale.set(s.sx, s.sy); e.skew.set(s.skx, 0); e.alpha = 0.4 * al; }
      else { echa.lineStyle(0); echa.beginFill(0x9fb4cc, 0.22 * al); echa.drawEllipse(s.x, s.y - 40, 11, 30); echa.endFill(); }
    }
    pulaEch.koniec();

    // duch bohatera, gdy zasłania go chata albo drzewo
    duch.clear();
    let zasloniety = stanRys.bezDachu < 0.5 && b.y < CHATA.podstawa && (chataZaslania(b.x, b.y - 30) || chataZaslania(b.x, b.y - 60) || chataZaslania(b.x, b.y - 90));   // tułów na pikselach chaty, razem z kominem
    if (!zasloniety) for (const d of DRZEWA) { if (d.y > b.y && d.y - b.y < d.h * 0.85 && Math.abs(d.x - b.x) < d.h * 0.22) { zasloniety = true; break; } }
    duchS.visible = false;
    if (zasloniety && b.stan !== 'upadl') {
      if (gem) { duchS.visible = true; ustawPostac(duchS, kB, pz.sx, bohS.x, bohS.y, lx, sy, bohS.rotation); }
      else { rysujBohatera(duch, b, gra, pz); duch.position.set(b.x, b.y); duch.skew.set(-lx, 0); duch.scale.set(sxs, sy); }
    }

    // smuga cięcia i garda
    smugi.clear(); znaki.clear(); znakiZiemia.clear();
    if (pz && pz.smuga) {
      // Smuga miecza (Patryk, 24 XI: cięcie wyglądało jak „nożykiem”). Sierp zamiast wachlarza od środka:
      // jasny i gęsty przy ostrzu, gaśnie ku tyłowi łuku, sięga tam, gdzie naprawdę rani cios (zasięg broni).
      // Na czele sierpa leci samo ostrze, szerokie jak wybrany miecz.
      const s = pz.smuga, sc = wSwiecie(0, -44), cx = sc.x, cy = sc.y, n = 18;
      const r2 = Math.max(pz.L + 16, gra.bron.zasieg * (s.mocny ? 1.05 : 0.92)), r1 = r2 * (s.mocny ? 0.3 : 0.42);
      const kol = s.utknal ? 0xffd090 : (s.mocny ? 0xfff0d0 : 0xe6ecf2);
      const pkt = (f, r) => { const a = s.od + (s.do - s.od) * f, l = (s.l0 + (s.l1 - s.l0) * f) * r / r2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * PERSP + l]; };
      const moc = (s.mocny ? 0.62 : 0.48) * s.alfa;
      smugi.lineStyle(0);
      for (let i = 0; i < n; i++) {
        const f0 = i / n, f1 = (i + 1) / n, al = moc * Math.pow(f1, 1.8);
        if (al < 0.01) continue;
        const [ax, ay] = pkt(f0, r2), [bx, by] = pkt(f1, r2), [ci, di] = pkt(f1, r1 + (r2 - r1) * 0.35 * (1 - f1)), [ei, gi] = pkt(f0, r1 + (r2 - r1) * 0.35 * (1 - f0));
        smugi.beginFill(kol, al); smugi.drawPolygon([ax, ay, bx, by, ci, di, ei, gi]); smugi.endFill();
      }
      for (let i = Math.floor(n * 0.35); i < n; i++) {                 // ostra krawędź na zewnątrz łuku
        const [ax, ay] = pkt(i / n, r2), [bx, by] = pkt((i + 1) / n, r2);
        smugi.lineStyle(s.mocny ? 4 : 2.6, 0xffffff, 0.85 * s.alfa * Math.pow((i + 1) / n, 1.4)); smugi.moveTo(ax, ay); smugi.lineTo(bx, by);
      }
      if (s.alfa > 0.6) {                                              // ostrze na czele łuku
        const [hx, hy] = pkt(1, r2 * 0.2), [tx2, ty2] = pkt(1, r2), dx = tx2 - hx, dy = ty2 - hy, d = Math.hypot(dx, dy) || 1;
        const nx = -dy / d, ny = dx / d, w = (gra.bron.szerokosc * 0.9 + 1.4) * (s.mocny ? 1.15 : 1), ux = dx / d, uy = dy / d;
        const [mx, my] = [hx + dx * 0.84, hy + dy * 0.84];
        smugi.lineStyle(4, 0x2a211b, 0.95 * s.alfa); smugi.moveTo(hx - ux * 12, hy - uy * 12); smugi.lineTo(hx, hy);             // rękojeść
        smugi.lineStyle(3.2, 0x3a3029, 0.95 * s.alfa); smugi.moveTo(hx + nx * w * 2.2, hy + ny * w * 2.2); smugi.lineTo(hx - nx * w * 2.2, hy - ny * w * 2.2);   // jelec
        smugi.lineStyle(1.4, 0x15120f, 0.9 * s.alfa); smugi.beginFill(0x9aa4ae, 0.97 * s.alfa);
        smugi.drawPolygon([hx + nx * w, hy + ny * w, mx + nx * w * 0.85, my + ny * w * 0.85, tx2, ty2, mx - nx * w * 0.85, my - ny * w * 0.85, hx - nx * w, hy - ny * w]);
        smugi.endFill();
        smugi.lineStyle(1.1, 0xf4f8ff, 0.9 * s.alfa); smugi.moveTo(hx + nx * w * 0.75, hy + ny * w * 0.75); smugi.lineTo(mx + nx * w * 0.7, my + ny * w * 0.7); smugi.lineTo(tx2, ty2);   // błysk na krawędzi
        smugi.lineStyle(1, 0x5d6670, 0.8 * s.alfa); smugi.moveTo(hx, hy); smugi.lineTo(mx, my);                                     // zbrocze
      }
    }
    // ładowany miecz żarzy się nad ciemnością
    if (!gem && pz.blask > 0.02 && pz.ostrze && b.stan !== 'upadl') {
      const o = pz.ostrze, p1 = wSwiecie(o.hx, o.hy), p2 = wSwiecie(o.tx, o.ty), x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
      smugi.lineStyle(9, 0xff9a30, 0.28 * pz.blask); smugi.moveTo(x1, y1); smugi.lineTo(x2, y2);
      smugi.lineStyle(3, 0xfff0c8, 0.85 * pz.blask); smugi.moveTo(x1, y1); smugi.lineTo(x2, y2);
    }
    // gdzie pójdzie cięcie: łuk na ziemi, dopóki miecz jest w zamachu albo się ładuje
    if (b.stan === 'cios' && b.cios && (b.cios.faza === 'zamach' || b.cios.faza === 'laduje')) {
      const c = b.cios, pelny = c.naladowanie >= 1;
      const zas = gra.bron.zasieg * (pelny ? 1.15 : 1), luk = gra.bron.luk + (pelny ? 0.7 : 0);
      const pts = [b.x, b.y];
      for (let i = 0; i <= 16; i++) { const a = c.kat - luk + 2 * luk * i / 16; pts.push(b.x + Math.cos(a) * zas, b.y + Math.sin(a) * zas * PERSP); }
      znakiZiemia.lineStyle(2.5, pelny ? 0xffd890 : 0xe6ecf2, pelny ? 0.7 : 0.45); znakiZiemia.beginFill(pelny ? 0xffd890 : 0xe6ecf2, pelny ? 0.18 : 0.1);
      znakiZiemia.drawPolygon(pts); znakiZiemia.endFill();
      if (c.faza === 'laduje') {                                       // ładowanie: krąg pod stopami zapełnia się
        znakiZiemia.lineStyle(4, 0x2a2018, 0.6); znakiZiemia.beginFill(0, 0); znakiZiemia.drawEllipse(b.x, b.y, 30, 30 * PERSP); znakiZiemia.endFill();
        znakiZiemia.lineStyle(4, pelny ? 0xfff0c0 : 0xffb050, pelny ? 0.95 : 0.85);
        const kon = -Math.PI / 2 + TAU * c.naladowanie;
        for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (kon + Math.PI / 2) * i / 24, x = b.x + Math.cos(a) * 30, y = b.y + Math.sin(a) * 30 * PERSP; if (i) znakiZiemia.lineTo(x, y); else znakiZiemia.moveTo(x, y); }
      }
    }
    if (b.blok) {
      const parowanie = gra.czas - b.blokOd < BOHATER.blok.oknoParowania;
      const cx = b.x, cy = b.y - 30, r = 46, od = b.kat - BOHATER.blok.kat, doK = b.kat + BOHATER.blok.kat;
      znaki.lineStyle(parowanie ? 4 : 2.5, parowanie ? 0xfff0c0 : 0xa8c4e0, parowanie ? 0.95 : 0.45);
      for (let i = 0; i <= 14; i++) { const a = od + (doK - od) * i / 14, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * PERSP; if (i) znaki.lineTo(x, y); else znaki.moveTo(x, y); }
    }

    // wrogowie
    pulaWrogow.start(); pulaCieni.start(); pulaOczu.start(); pulaBlyskow.start();
    for (const e of gra.wrogowie) {
      if (e.x < L - 100 || e.x > R + 100 || e.y < G || e.y > D) continue;
      if (filmW[e.typ.nazwa]) { rysujWrogaZFilmu(e, filmW[e.typ.nazwa], b, gra); continue; }
      const at = atlasy[e.typ.nazwa], w = at.wzor, sk = e.typ.skala;
      const sx = Math.cos(e.stan === 'idzie' || e.stan === 'wynurza' || e.stan === 'odpoczynek' ? Math.atan2(b.y - e.y, b.x - e.x) : e.kat) >= 0 ? 1 : -1;
      const zam = e.stan === 'zamach' || e.stan === 'skok';
      const faza = (((e.anim * (e.typ.ciezki ? 3 : 9)) % TAU) + TAU) % TAU;
      const klatka = Math.min(w.klatki - 1, (faza / TAU * w.klatki) | 0);
      const wiersz = (sx < 0 ? 1 : 0) | (zam ? 2 : 0) | (e.flash > 0 ? 4 : 0);
      const sp = pulaWrogow.wez();
      sp.texture = at.klatki[wiersz * w.klatki + klatka]; sp.anchor.set(w.ox / w.w, w.oy / w.h);
      const kucniecie = e.stan === 'zamach' && !e.typ.ciezki ? 0.88 : 1;
      // ciało reaguje: odchyla się od ciosu, ghul wyciąga się w skoku, kolos wznosi się i przysiada przy uderzeniu
      const odB = e.x >= b.x ? 1 : -1;
      let rot = 0, skx = 1, sky = kucniecie;
      if (e.flash > 0) { const f = e.flash / 0.12; rot += odB * (e.typ.ciezki ? 0.1 : 0.34) * f; sky *= 1 - 0.12 * f; skx *= 1 + 0.1 * f; }
      if (e.stan === 'skok' && !e.typ.ciezki) { rot -= odB * 0.22; sky *= 1.08; skx *= 0.93; }
      if (e.stan === 'zamach' && e.typ.ciezki) { const q = ogr(e.t / e.typ.zamach, 0, 1); sky *= 1 + 0.06 * q; skx *= 1 - 0.03 * q; rot += odB * 0.08 * q; }
      if (e.stan === 'skok' && e.typ.ciezki) { const u = Math.sin(Math.min(1, e.t / e.typ.skok * 3) * Math.PI / 2); sky *= 1.06 - 0.16 * u; skx *= 0.97 + 0.12 * u; rot -= odB * 0.12 * (1 - u); }
      if (e.stan === 'ogluszony') rot += Math.sin(czas * 11 + e.anim) * 0.14;
      sp.scale.set(sk / O.PX * skx, sk / O.PX * sky); sp.rotation = rot;
      sp.position.set(e.x + (e.drzy || 0), e.y); sp.zIndex = e.y;
      sp.alpha = e.stan === 'wynurza' ? e.widac : 1;
      const cs = pulaCieni.wez(); cs.position.set(e.x, e.y + 1); cs.width = e.promien * 2.8; cs.height = e.promien * 1.05; cs.alpha = sp.alpha;
      // oczy świecą w ciemności; przed atakiem rozbłyskują
      const oko = pulaOczu.wez();
      oko.texture = e.typ.ciezki ? T.okoBursztyn : T.okoCzerwone;
      const okx = w.oko.x * sx * sk * skx, oky = w.oko.y * sk * sky;
      oko.position.set(e.x + (e.drzy || 0) + okx * Math.cos(rot) - oky * Math.sin(rot), e.y + okx * Math.sin(rot) + oky * Math.cos(rot));
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
    pulaWrogow.koniec(); pulaCieni.koniec(); pulaOczu.koniec(); pulaBlyskow.koniec();

    // martwi padają od bohatera; mocny cios albo wielki miecz przecina ich na pół
    pulaKawalkow.start();
    for (let i = padajace.length - 1; i >= 0; i--) {
      const f = padajace[i], at = f.at, s = f.s;
      f.t += dt;
      if (f.fw && !s.przeciety) { padaZFilmu(f, i, dt); continue; }
      const q = Math.min(1, f.t / f.czas), sk = f.fw ? f.fw.skala : f.sk / O.PX, w = f.wiersz | (f.t < 0.07 ? 4 : 0);
      const znak = f.fw ? (s.sx === f.fw.patrzy ? 1 : -1) : 1, wys = f.fw ? f.fw.ciecie : CIECIE_WYS[s.wrog] * f.sk;
      const P1 = f.fw ? { gora: f.fw.gora, dol: f.fw.dol, ax: f.fw.ax, ayDol: f.fw.ayDol, mG: f.fw.gora, mD: f.fw.dol } : null;
      const dx = Math.cos(s.kat), dy = Math.sin(s.kat), slizg = (f.ciezki ? 10 : 24) * latwo(q);
      const al = f.gasnie >= 0 ? Math.max(0, 1 - f.gasnie / 0.15) : 1;
      const kawalek = (tex, ax, ay, x, y, r) => { const k = pulaKawalkow.wez(); k.texture = tex; k.anchor.set(ax, ay); k.position.set(x, y); k.rotation = r; k.scale.set(sk * znak, sk); k.zIndex = y; k.alpha = al; };
      if (!s.przeciety) {
        const x = s.x + dx * slizg, y = s.y + dy * slizg;
        kawalek(at.klatki[w * at.wzor.klatki], at.ax, at.ay, x, y, s.obrot * q * q);
        f.kon = [{ tex: at.martwy, ax: at.ax, ay: at.ay, x, y, rot: s.obrot, sx: sk * s.sx, sy: sk }];
      } else {
        // górna połowa leci łukiem i obraca się, dolna chwilę stoi, potem pada
        const h0 = wys, T = f.czas, g = 900, vz = (0.5 * g * T * T - h0) / T, tt = Math.min(f.t, T);
        const hz = Math.max(0, h0 + vz * tt - 0.5 * g * tt * tt), lot = (f.ciezki ? 30 : 48) * q;
        const gx = s.x + dx * lot, gy = s.y + dy * lot, rKon = f.dir * 1.4, rDol = f.dir * 1.1;
        const rG = f.ciezki ? rKon * latwo(q) : f.dir * (TAU + 1.4) * latwo(q);
        const dxD = s.x + dx * slizg * 0.3, dyD = s.y + dy * slizg * 0.3, rD = rDol * Math.pow(Math.max(0, (q - 0.25) / 0.75), 2);
        if (P1) {                                                     // z filmu: połówki żywej klatki leżą obrócone
          kawalek(P1.dol, P1.ax, P1.ayDol, dxD, dyD, rD * znak);
          kawalek(P1.gora, P1.ax, 1, gx, gy - hz, rG * znak);
          f.kon = [{ tex: P1.mD, ax: P1.ax, ay: P1.ayDol, x: dxD, y: dyD, rot: rDol * znak, sx: sk * znak, sy: sk },
            { tex: P1.mG, ax: P1.ax, ay: 1, x: gx, y: gy, rot: rKon * znak, sx: sk * znak, sy: sk }];
        } else {
          kawalek(at.polowki[w].dol, at.ax, at.ayDol, dxD, dyD, rD);
          kawalek(at.polowki[w].gora, at.ax, 1, gx, gy - hz, rG);
          f.kon = [{ tex: at.martweDol, ax: at.ax, ay: at.ayDol, x: dxD, y: dyD, rot: rDol, sx: sk * s.sx, sy: sk },
            { tex: at.martweGora, ax: at.ax, ay: 1, x: gx, y: gy, rot: rKon, sx: sk * s.sx, sy: sk }];
        }
      }
      if (q >= 1 && f.gasnie < 0) {                                  // leży: zostaje na ziemi, żywa klatka gaśnie nad śladem
        (f.fw ? zostaw : utrwal)(f.kon); f.gasnie = 0;
        if (f.ciezki) { pierscienie.push({ x: s.x, y: s.y, r0: 20, r1: 90, t: 0, czas: 0.35, kolor: 0xb8a890, ziemia: true }); kurz(s.x, s.y, s.kat, 7, 1.6); stanRys.kop.y += 5; }
        else kurz(s.x + dx * 20, s.y + dy * 20, s.kat, 2, 0.7);
      } else if (f.gasnie >= 0) { f.gasnie += dt; if (f.gasnie > 0.15) padajace.splice(i, 1); }
    }
    pulaKawalkow.koniec();

    // błysk cięcia tam, gdzie ostrze weszło w ciało
    for (let i = ciecia.length - 1; i >= 0; i--) {
      const c = ciecia[i]; c.t += dt; const q = c.t / c.czas;
      if (q >= 1) { ciecia.splice(i, 1); continue; }
      const ux = Math.cos(c.kat), uy = Math.sin(c.kat) * PERSP, d = Math.hypot(ux, uy) || 1, vx = ux / d, vy = uy / d;
      const dl = c.dl * (0.55 + 0.45 * Math.min(1, q * 4)) / 2, gr = 4.5 * (1 - q);
      smugi.lineStyle(0); smugi.beginFill(0xfff4e0, 0.95 * (1 - q));
      smugi.drawPolygon([c.x - vx * dl, c.y - vy * dl, c.x - vy * gr, c.y + vx * gr, c.x + vx * dl, c.y + vy * dl, c.x + vy * gr, c.y - vx * gr]);
      smugi.endFill();
      if (q < 0.5) { smugi.beginFill(0xffffff, 0.45 * (1 - q * 2)); smugi.drawCircle(c.x, c.y, 6 + 16 * q); smugi.endFill(); }
    }

    // pioruny klątwy
    for (let i = pioruny.length - 1; i >= 0; i--) {
      const p = pioruny[i]; p.t += dt; const q = p.t / p.czas;
      if (q >= 1) { pioruny.splice(i, 1); continue; }
      if (Math.random() < 0.25) continue;                                  // migocze
      for (const [szer, kol, al] of [[4, 0x9a5cff, 0.75], [1.5, 0xf4e8ff, 0.95]]) {
        smugi.lineStyle(szer, kol, al * (1 - q)); smugi.moveTo(p.pkt[0], p.pkt[1]);
        for (let k = 2; k < p.pkt.length; k += 2) smugi.lineTo(p.pkt[k] + losuj(-2, 2), p.pkt[k + 1]);
      }
    }

    // kurz spod stóp i oddech
    para.clear();
    for (let i = obloczki.length - 1; i >= 0; i--) {
      const o = obloczki[i]; o.t += dt; const q = o.t / o.czas;
      if (q >= 1) { obloczki.splice(i, 1); continue; }
      o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= Math.exp(-dt * 3); o.vy *= Math.exp(-dt * 3);
      const gz = o.ziemia ? znakiZiemia : para, r = o.r0 + (o.r1 - o.r0) * latwo(q);
      gz.lineStyle(0); gz.beginFill(o.kolor, o.alfa * (1 - q)); gz.drawEllipse(o.x, o.y, r, r * (o.ziemia ? PERSP : 0.8)); gz.endFill();
    }

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
      const x = k.m.x + Math.cos(k.a) * k.r, y = k.m.y + Math.sin(k.a) * k.r * 0.5;
      k.s.position.set(x, y); k.s.rotation = k.obrot + Math.sin(czas * 0.05 + k.faza) * 0.06;
      k.s.width = k.roz * 2 * (1 + Math.sin(czas * 0.11 + k.faza) * 0.08); k.s.height = k.roz * 2 * k.splaszcz;
      const przyBoh = Math.min(1, Math.hypot(x - b.x, (y - b.y) * 1.6) / (k.roz * 0.9));        // przy bohaterze rzednie
      k.s.alpha = k.alfa * (0.75 + Math.sin(czas * 0.3 + k.faza) * 0.25) * (0.45 + 0.55 * przyBoh) * (gra.faza === 'swit' || gra.faza === 'koniec' ? Math.max(0.2, gra.mroczek / 0.8) : 1);
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
    blaskOkna.position.set(CHATA.okno.x, CHATA.okno.y + 20); blaskOkna.width = blaskOkna.height = 170; blaskOkna.alpha = 0.6 * Math.max(0.2, gra.mroczek / 0.8) * (1 - stanRys.bezDachu);
    blaskIzby.position.set(CHATA.palenisko.x, CHATA.palenisko.y + 20); blaskIzby.width = blaskIzby.height = 260 * migot; blaskIzby.alpha = 0.5 * stanRys.bezDachu * Math.max(0.3, gra.mroczek / 0.8);

    // ciemność: zalewamy ekran nocą i wycinamy światło
    ciemnoscG.clear(); ciemnoscG.beginFill(0x05060b, gra.mroczek); ciemnoscG.drawRect(0, 0, vw, vh); ciemnoscG.endFill();
    kreski.alpha = 0.55 * gra.mroczek / 0.8;
    const stawStempel = (s, x, y, r, al) => { s.position.set(ox + x * zz, oy + y * zz); s.width = s.height = r * 2 * zz; s.alpha = al; };
    stawStempel(swiatloBoh, b.x, b.y - 30, 250 + 260 * stanRys.fiolet, 1);
    stawStempel(swiatloOgnia, fx, fy - 10, 380 * migot, 0.95);
    stawStempel(swiatloOkna, CHATA.okno.x, CHATA.okno.y + 30, 150, 0.7 * (1 - stanRys.bezDachu));
    stawStempel(swiatloIzby, CHATA.palenisko.x, CHATA.palenisko.y + 60, 240 * migot, 0.95 * stanRys.bezDachu);   // ogień z paleniska oświetla izbę
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
    if (stanRys.fiolet > 0) { bolG.beginFill(0x6a2cc0, stanRys.fiolet * stanRys.fiolet * 0.35); bolG.drawRect(0, 0, vw, vh); bolG.endFill(); }

    renderer.render(scena);
  }

  return {
    rysuj, rozmiar, wyczysc, ekranNaSwiat, swiatNaEkran, karta,
    get bohater() { return trybBohatera; },
    ustawBohatera(t) { trybBohatera = t === 'gemini' && maObraz ? 'gemini' : 'rysowany'; return trybBohatera; },
    maBohateraZGemini: maObraz,
    opis: karta ? 'karta graficzna' : 'procesor (bez karty graficznej)',
    get zoom() { return zoom; },
  };
}
