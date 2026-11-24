// Wejście do gry: ładuje PixiJS i obraz chaty, składa logikę, rysowanie, sterowanie i pasek.
import { nowaGra, aktualizuj, ustawBron } from './walka.js';
import { BRONIE, DOMYSLNA_BRON } from './dane.js';
import { przygotujRysowanie } from './rysowanie.js';
import { przygotujWejscie } from './wejscie.js';
import { przygotujHud } from './hud.js';
import { obudzDzwiek, zagraj, przelaczDzwiek } from './dzwiek.js';

// Wersja „legacy” umie rysować także bez karty graficznej (decyzja 002: PixiJS).
const PIXI_ADRESY = [
  'https://cdn.jsdelivr.net/npm/pixi.js-legacy@7.4.2/dist/pixi-legacy.min.js',
  'https://unpkg.com/pixi.js-legacy@7.4.2/dist/pixi-legacy.min.js',
];

const $ = id => document.getElementById(id);

function zaladujSkrypt(src) {
  return new Promise((ok, zle) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => zle(new Error(src)); document.head.appendChild(s); });
}
async function zaladujPixi() {
  for (const a of PIXI_ADRESY) { try { await zaladujSkrypt(a); if (window.PIXI) return; } catch (e) { /* następny adres */ } }
  throw new Error('nie udało się pobrać biblioteki PixiJS');
}
function zaladujObraz(url, co) {
  return new Promise((ok, zle) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => zle(new Error('brak obrazu: ' + co)); i.src = url; });
}

function pokaz(id, widac) { $(id).hidden = !widac; }

async function start() {
  const cv = $('gra');
  let obraz, obrazBohatera, obrazGhula, obrazKolosa, obrazBezDachu;
  try {
    [, obraz, obrazBohatera, obrazGhula, obrazKolosa, obrazBezDachu] = await Promise.all([
      zaladujPixi(), zaladujObraz(new URL('../grafika/chata.webp', import.meta.url).href, 'chata'),
      zaladujObraz(new URL('../grafika/bohater.webp', import.meta.url).href, 'bohater').catch(() => null),   // bez niego gra rysuje bohatera kodem
      zaladujObraz(new URL('../grafika/ghul.webp', import.meta.url).href, 'ghul').catch(() => null),         // potwory z filmów Przemka; bez nich rysowane kodem
      zaladujObraz(new URL('../grafika/kolos.webp', import.meta.url).href, 'kolos').catch(() => null),
      zaladujObraz(new URL('../grafika/chata-bez-dachu.webp', import.meta.url).href, 'chata bez dachu').catch(() => null),   // izba jak w Tibii (docs/chata.md)
    ]);
  } catch (e) {
    $('ladowanie').textContent = 'Nie udało się wczytać gry: ' + e.message + '. Odśwież stronę.';
    return;
  }

  let rys;
  // bohater: obraz z Gemini albo rysowany kodem; wybór zapamiętany w tej przeglądarce (do porównania)
  let wyglad = 'gemini';
  try { if (localStorage.getItem('noc-bohater') === 'rysowany') wyglad = 'rysowany'; } catch (e) { /* bez pamięci */ }
  if (/bohater=rysowany/.test(location.search)) wyglad = 'rysowany';
  try { rys = przygotujRysowanie(cv, obraz, { wymusProcesor: /procesor/.test(location.search), obrazBohatera, bohater: wyglad, obrazyWrogow: { ghul: obrazGhula, kolos: obrazKolosa }, obrazBezDachu }); }
  catch (e) { $('ladowanie').textContent = 'Ta przeglądarka nie umie narysować gry: ' + (e && e.message || e); return; }

  const wejscie = przygotujWejscie(cv, {
    ekranNaSwiat: rys.ekranNaSwiat,
    elementy: { przyciski: $('przyciski'), tnij: $('przycisk-tnij'), blok: $('przycisk-blok'), unik: $('przycisk-unik'), klatwa: $('przycisk-klatwa'), akcja: $('akcja'), drazekTlo: $('drazek-tlo'), drazekGalka: $('drazek-galka'), celTlo: $('cel-tlo'), celGalka: $('cel-galka') },
  });
  const hud = przygotujHud();

  // wybór miecza: waga to gust; zapamiętany w tej przeglądarce
  let bron = DOMYSLNA_BRON;
  try { const z = localStorage.getItem('noc-bron'); if (z && BRONIE[z]) bron = z; } catch (e) { /* bez pamięci */ }
  let gra = nowaGra(bron), pauza = true, zaczeta = false;
  function pokazBronie() {
    for (const grupa of document.querySelectorAll('.bronie')) {
      if (!grupa.children.length) for (const k in BRONIE) {
        const b = document.createElement('button'); b.type = 'button'; b.dataset.bron = k; b.textContent = BRONIE[k].nazwa;
        b.addEventListener('click', () => { bron = k; ustawBron(gra, k); try { localStorage.setItem('noc-bron', k); } catch (e) { /* */ } pokazBronie(); });
        grupa.appendChild(b);
      }
      for (const b of grupa.children) b.setAttribute('aria-pressed', String(b.dataset.bron === bron));
    }
    for (const o of document.querySelectorAll('.opis-broni')) o.textContent = `${BRONIE[bron].nazwa}. ${BRONIE[bron].opis}`;
  }
  pokazBronie();
  window.__gra = () => gra;                       // do testów: podgląd stanu z konsoli

  addEventListener('resize', () => rys.rozmiar());
  $('ladowanie').hidden = true;
  pokaz('zacznij', true);

  function wznow() {
    obudzDzwiek();
    pokaz('ekran-startu', false); pokaz('ekran-pauzy', false);
    pauza = false; zaczeta = true;
  }
  $('zacznij').addEventListener('click', () => {
    try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) { /* bez pełnego ekranu */ }
    wznow();
  });
  $('wroc').addEventListener('click', wznow);
  const zatrzymaj = () => { if (zaczeta && !pauza && gra.faza !== 'koniec') { pauza = true; pokaz('ekran-pauzy', true); } };
  $('przycisk-pauza').addEventListener('click', zatrzymaj);
  addEventListener('keydown', e => { if (e.key === 'Escape' || e.key.toLowerCase() === 'p') { if (pauza && zaczeta && gra.faza !== 'koniec') wznow(); else zatrzymaj(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) zatrzymaj(); });
  const napisBohatera = () => { for (const x of document.querySelectorAll('.przycisk-bohater')) { x.hidden = !rys.maBohateraZGemini; x.textContent = rys.bohater === 'gemini' ? 'Bohater: z Gemini' : 'Bohater: rysowany kodem'; } };
  napisBohatera();
  for (const b of document.querySelectorAll('.przycisk-bohater')) b.addEventListener('click', () => {
    const t = rys.ustawBohatera(rys.bohater === 'gemini' ? 'rysowany' : 'gemini');
    try { localStorage.setItem('noc-bohater', t); } catch (e) { /* */ }
    napisBohatera();
  });
  for (const b of document.querySelectorAll('.przycisk-dzwiek')) b.addEventListener('click', () => {
    const wl = przelaczDzwiek(); for (const x of document.querySelectorAll('.przycisk-dzwiek')) x.textContent = wl ? 'Dźwięk: włączony' : 'Dźwięk: wyłączony';
  });
  $('jeszcze-raz').addEventListener('click', () => {
    gra = nowaGra(bron); rys.wyczysc(); pokaz('ekran-konca', false); pauza = false;
  });

  function pokazKoniec() {
    const s = gra.statystyki, min = Math.floor(s.czas / 60), sek = Math.floor(s.czas % 60);
    $('wynik').innerHTML = '';
    for (const [co, ile] of [['Zabite potwory', s.zabici], ['Sparowane ciosy', s.parowania], ['Upadki', s.upadki], ['Czas', `${min}:${String(sek).padStart(2, '0')}`]]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = co; dd.textContent = ile; $('wynik').append(dt, dd);
    }
    pokaz('ekran-konca', true);
  }

  // ?tempo=0.25 zwalnia grę czterokrotnie: do oglądania animacji klatka po klatce i do testów
  const tempo = Math.min(1, Math.max(0.05, Number(new URLSearchParams(location.search).get('tempo')) || 1));
  let ostatni = performance.now();
  function klatka(teraz) {
    requestAnimationFrame(klatka);
    const dt = Math.min(0.05, Math.max(0, (teraz - ostatni) / 1000)) * tempo; ostatni = teraz;
    const w = wejscie.odczytaj(gra);
    if (!pauza && gra.faza !== 'koniec') aktualizuj(gra, dt, w);
    const zd = gra.zdarzenia.splice(0);
    for (const z of zd) { zagraj(z); if (z.typ === 'koniec') setTimeout(pokazKoniec, 900); }
    rys.rysuj(gra, dt, zd);
    hud.aktualizuj(gra, dt, rys.opis);
  }
  requestAnimationFrame(klatka);
}

start();
