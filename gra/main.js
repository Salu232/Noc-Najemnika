// Wejście do gry: ładuje PixiJS i obraz chaty, składa logikę, rysowanie, sterowanie i pasek.
import { nowaGra, aktualizuj } from './walka.js';
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
function zaladujObraz(url) {
  return new Promise((ok, zle) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => zle(new Error('brak obrazu chaty')); i.src = url; });
}

function pokaz(id, widac) { $(id).hidden = !widac; }

async function start() {
  const cv = $('gra');
  let obraz;
  try {
    [, obraz] = await Promise.all([zaladujPixi(), zaladujObraz(new URL('../grafika/chata.webp', import.meta.url).href)]);
  } catch (e) {
    $('ladowanie').textContent = 'Nie udało się wczytać gry: ' + e.message + '. Odśwież stronę.';
    return;
  }

  let rys;
  try { rys = przygotujRysowanie(cv, obraz, { wymusProcesor: /procesor/.test(location.search) }); }
  catch (e) { $('ladowanie').textContent = 'Ta przeglądarka nie umie narysować gry: ' + (e && e.message || e); return; }

  const wejscie = przygotujWejscie(cv, {
    ekranNaSwiat: rys.ekranNaSwiat,
    elementy: { przyciski: $('przyciski'), blok: $('przycisk-blok'), unik: $('przycisk-unik'), drazekTlo: $('drazek-tlo'), drazekGalka: $('drazek-galka') },
  });
  const hud = przygotujHud();

  let gra = nowaGra(), pauza = true, zaczeta = false;
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
  for (const b of document.querySelectorAll('.przycisk-dzwiek')) b.addEventListener('click', () => {
    const wl = przelaczDzwiek(); for (const x of document.querySelectorAll('.przycisk-dzwiek')) x.textContent = wl ? 'Dźwięk: włączony' : 'Dźwięk: wyłączony';
  });
  $('jeszcze-raz').addEventListener('click', () => {
    gra = nowaGra(); rys.wyczysc(); pokaz('ekran-konca', false); pauza = false;
  });

  function pokazKoniec() {
    const s = gra.statystyki, min = Math.floor(s.czas / 60), sek = Math.floor(s.czas % 60);
    $('wynik').innerHTML = '';
    for (const [co, ile] of [['Zabite potwory', s.zabici], ['Sparowane ciosy', s.parowania], ['Upadki', s.upadki], ['Czas', `${min}:${String(sek).padStart(2, '0')}`]]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = co; dd.textContent = ile; $('wynik').append(dt, dd);
    }
    pokaz('ekran-konca', true);
  }

  let ostatni = performance.now();
  function klatka(teraz) {
    requestAnimationFrame(klatka);
    const dt = Math.min(0.05, Math.max(0, (teraz - ostatni) / 1000)); ostatni = teraz;
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
