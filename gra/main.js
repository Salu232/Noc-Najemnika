// Wejście do gry: ładuje PixiJS i obraz chaty, składa logikę, rysowanie, sterowanie i pasek.
import { nowaGra, aktualizuj, ustawBron, wybierzUlepszenie, zamknijKartke, zapiszPlecak, kosztStolu, mozeZrobic, zrobNaStole, sprzedaj, kupMiksture, mozeKupic, odejdzOdHandlarza, kupTowar, mozeKupicTowar, maxMikstur, stanDoPrzeniesienia, przeniesStan, ruszajNaBagno } from './walka.js';
import { BRONIE, DOMYSLNA_BRON, ULEPSZENIA, KARTKI, PRZEMIANA, WSTEP, PRZEDMIOTY, STOL, HANDLARZ, LUP } from './dane.js';
import { przygotujRysowanie } from './rysowanie.js';
import { przygotujWejscie } from './wejscie.js';
import { przygotujHud } from './hud.js';
import { obudzDzwiek, zagraj, przelaczDzwiek, muzyka, otoczenie } from './dzwiek.js';
import { OGNISKO, BAGNO } from './swiat.js';

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
  let obraz, obrazBohatera, obrazBohateraWielki, obrazGhula, obrazKolosa, obrazWiedzmy, obrazRycerza, obrazBestii, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki, obrazHandlarza;
  try {
    [, obraz, obrazBohatera, obrazBohateraWielki, obrazGhula, obrazKolosa, obrazWiedzmy, obrazRycerza, obrazBestii, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki, obrazHandlarza] = await Promise.all([
      zaladujPixi(), zaladujObraz(new URL('../grafika/chata.webp', import.meta.url).href, 'chata'),
      zaladujObraz(new URL('../grafika/bohater.webp', import.meta.url).href, 'bohater').catch(() => null),   // bez niego gra rysuje bohatera kodem
      zaladujObraz(new URL('../grafika/bohater-wielki.webp', import.meta.url).href, 'bohater z dwuręcznym').catch(() => null),   // cięcie, garda, bieg i blok z mieczem dwuręcznym
      zaladujObraz(new URL('../grafika/ghul.webp', import.meta.url).href, 'ghul').catch(() => null),         // potwory z filmów Przemka; bez nich rysowane kodem
      zaladujObraz(new URL('../grafika/kolos.webp', import.meta.url).href, 'kolos').catch(() => null),
      zaladujObraz(new URL('../grafika/wiedzma.webp', import.meta.url).href, 'wiedzma').catch(() => null),
      zaladujObraz(new URL('../grafika/rycerz.webp', import.meta.url).href, 'rycerz').catch(() => null),   // boss ostatniej nocy
      zaladujObraz(new URL('../grafika/bestia.webp', import.meta.url).href, 'bestia').catch(() => null),   // czworonożny skoczek (26 XI)
      zaladujObraz(new URL('../grafika/chata-bez-dachu.webp', import.meta.url).href, 'chata bez dachu').catch(() => null),   // izba jak w Tibii (docs/chata.md)
      zaladujObraz(new URL('../grafika/chata-drzwi-zamkniete.webp', import.meta.url).href, 'drzwi').catch(() => null),   // zamknięte drzwi widziane z izby
      zaladujObraz(new URL('../grafika/rekwizyty.webp', import.meta.url).href, 'rekwizyty').catch(() => null),   // drzewa, kępy, krew i ognisko z arkuszy Przemka; bez nich rysowane kodem
      /ziemia=stara/.test(location.search) ? null : zaladujObraz(new URL(BAGNO ? '../grafika/ziemia-bagno.webp' : '../grafika/ziemia.webp', import.meta.url).href, 'ziemia').catch(() => null),   // ziemia z Gemini (Patryk, 25 XI); ?ziemia=stara pokazuje dawny kafel
      /droga=(farba|kafel)/.test(location.search) ? null : zaladujObraz(new URL('../grafika/droga.webp', import.meta.url).href, 'droga').catch(() => null),   // łata drogi z rysunku ziemi Przemka (v39; ?droga=laty); ?droga=farba pokazuje drogę z v38
      /droga=(farba|laty)/.test(location.search) ? null : zaladujObraz(new URL('../grafika/droga-kafel.webp', import.meta.url).href, 'droga-kafel').catch(() => null),   // kafel drogi z Gemini (Patryk, 25 XI)
      zaladujObraz(new URL('../grafika/kartka-lezy.webp', import.meta.url).href, 'kartka').catch(() => null),   // kartka z dziennika rycerza na ziemi (Gemini, 25 XI)
      zaladujObraz(new URL('../grafika/handlarz.webp', import.meta.url).href, 'handlarz').catch(() => null),   // handlarz przy drodze (filmy Patryka, 27 XI)
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
  try { rys = przygotujRysowanie(cv, obraz, { wymusProcesor: /procesor/.test(location.search), obrazBohatera, obrazBohateraWielki, bohater: wyglad, obrazyWrogow: { ghul: obrazGhula, kolos: obrazKolosa, wiedzma: obrazWiedzmy, rycerz: obrazRycerza, bestia: obrazBestii }, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki, obrazHandlarza }); }
  catch (e) { $('ladowanie').textContent = 'Ta przeglądarka nie umie narysować gry: ' + (e && e.message || e); return; }

  const wejscie = przygotujWejscie(cv, {
    ekranNaSwiat: rys.ekranNaSwiat,
    elementy: { przyciski: $('przyciski'), tnij: $('przycisk-tnij'), blok: $('przycisk-blok'), unik: $('przycisk-unik'), klatwa: $('przycisk-klatwa'), mikstura: $('przycisk-mikstura'), akcja: $('akcja'), drazekTlo: $('drazek-tlo'), drazekGalka: $('drazek-galka'), celTlo: $('cel-tlo'), celGalka: $('cel-galka') },
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
    pokaz('ekran-startu', false); pokaz('ekran-pauzy', false); pokaz('ekran-plecaka', false); plecakOtwarty = false;
    pauza = false; zaczeta = true;
  }
  $('zacznij').addEventListener('click', () => {
    try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) { /* bez pełnego ekranu */ }
    obudzDzwiek(); pokaz('ekran-startu', false);
    prolog(wznow);
  });
  // Prolog (26 XI): zdania na czarnym tle, każde po kilku sekundach albo po dotknięciu; potem bohater przychodzi na polanę.
  const PROLOG = BAGNO ? WSTEP.prologBagno : WSTEP.prolog;
  function prolog(potem) {
    const el = $('prolog'), tekst = $('prolog-tekst'); tekst.textContent = ''; pokaz('prolog', true);
    let i = 0, czekaj = null, koniec = false;
    const zakoncz = () => { if (koniec) return; koniec = true; clearTimeout(czekaj); removeEventListener('keydown', klawisz, true); pokaz('prolog', false); potem(); };
    const nastepne = () => {
      clearTimeout(czekaj);
      if (i >= PROLOG.length) { zakoncz(); return; }
      for (const p of tekst.children) p.classList.add('minione');
      const p = document.createElement('p'); p.textContent = PROLOG[i++]; tekst.append(p);
      requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('widac')));
      if (i === 1) setTimeout(() => $('prolog-dalej').classList.add('widac'), 2500);
      czekaj = setTimeout(nastepne, 1800 + p.textContent.length * 55);
    };
    const klawisz = e => { if ([' ', 'enter', 'e'].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopImmediatePropagation(); nastepne(); } else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); zakoncz(); } };
    el.onclick = e => { if (e.target.id === 'prolog-pomin') zakoncz(); else nastepne(); };
    addEventListener('keydown', klawisz, true);
    nastepne();
  }
  $('wroc').addEventListener('click', wznow);
  const zatrzymaj = () => { if (zaczeta && !pauza && gra.faza !== 'koniec') { pauza = true; pokaz('ekran-pauzy', true); } };
  $('przycisk-pauza').addEventListener('click', zatrzymaj);
  addEventListener('keydown', e => { if (e.key === 'Escape' || e.key.toLowerCase() === 'p') { if (pauza && zaczeta && gra.faza !== 'koniec') wznow(); else zatrzymaj(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) zatrzymaj(); });
  const napisBohatera = () => { for (const x of document.querySelectorAll('.przycisk-bohater')) { x.hidden = !rys.maBohateraZGemini; x.textContent = rys.bohater === 'gemini' ? 'Bohater: z Gemini' : 'Bohater: rysowany kodem'; } };
  napisBohatera();
  // Bagno to drugi rozdział (27 XI, Patryk: „musi być połączone ze sobą”): wchodzi się tam tylko po świcie nad polaną,
  // przyciskiem „Idź na bagno”. Bohater zabiera monety, mikstury, plecak, pas i ulepszenia ze stołu.
  // Przeładowanie strony niesie mapę i stan w window.name (działa też tam, gdzie przeglądarka nie daje pamięci).
  function przejdz(mapa, stan) {
    let n = 'noc-mapa=' + mapa;
    if (stan) n += ';noc-stan=' + encodeURIComponent(JSON.stringify(stan));
    try { window.name = n; } catch (e) { /* */ }
    try { localStorage.setItem('noc-mapa', mapa); if (stan) localStorage.setItem('noc-stan', JSON.stringify(stan)); else localStorage.removeItem('noc-stan'); } catch (e) { /* bez pamięci */ }
    location.reload();
  }
  let stanZPolany = null;
  if (BAGNO) {
    try { const m = /noc-stan=([^;]*)/.exec(window.name || ''); if (m) stanZPolany = JSON.parse(decodeURIComponent(m[1])); } catch (e) { /* */ }
    if (!stanZPolany) try { const z = localStorage.getItem('noc-stan'); if (z) stanZPolany = JSON.parse(z); } catch (e) { /* bez pamięci */ }
    przeniesStan(gra, stanZPolany);
    document.title = 'Noc najemnika: bagno wiedźmy';
    const h = document.querySelector('#ekran-startu h1') || document.querySelector('h1'); if (h) h.textContent = 'Bagno wiedźmy';
    const w = h && h.nextElementSibling;
    if (w) w.textContent = stanZPolany
      ? 'Rozdział drugi. Przyszedłeś z polany z tym, co zostało w plecaku. Woda, martwy las i topielce, które chwytają: tnij, żeby puściły.'
      : 'Rozdział drugi, wersja próbna (bez rzeczy z polany). Woda, martwy las i topielce, które chwytają: tnij, żeby puściły.';
  }
  // „Ruszaj na bagno”: ekran końca znika, bohater idzie drogą przez las; na skraju mapy ściemnia się i wczytuje bagno
  $('na-bagno').addEventListener('click', () => { ruszajNaBagno(gra); pokaz('ekran-konca', false); pauza = false; });
  function odejdzNaBagno() {
    const z = document.createElement('div');
    z.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;transition:opacity 1.6s ease;z-index:50;pointer-events:none';
    document.body.append(z); requestAnimationFrame(() => requestAnimationFrame(() => { z.style.opacity = '1'; }));
    setTimeout(() => przejdz('bagno', stanDoPrzeniesienia(gra)), 1800);
  }
  // skrót do prób, póki bagno się buduje: w pauzie, nie na ekranie startu
  $('przeskocz-mapa').textContent = BAGNO ? 'Próba: wróć na polanę' : 'Próba: przeskocz na bagno';
  $('przeskocz-mapa').addEventListener('click', () => przejdz(BAGNO ? 'polana' : 'bagno', null));
  for (const b of document.querySelectorAll('.przycisk-bohater')) b.addEventListener('click', () => {
    const t = rys.ustawBohatera(rys.bohater === 'gemini' ? 'rysowany' : 'gemini');
    try { localStorage.setItem('noc-bohater', t); } catch (e) { /* */ }
    napisBohatera();
  });
  for (const b of document.querySelectorAll('.przycisk-dzwiek')) b.addEventListener('click', () => {
    const wl = przelaczDzwiek(); for (const x of document.querySelectorAll('.przycisk-dzwiek')) x.textContent = wl ? 'Dźwięk: włączony' : 'Dźwięk: wyłączony';
  });
  $('jeszcze-raz').addEventListener('click', () => {
    gra = nowaGra(bron); if (BAGNO) przeniesStan(gra, stanZPolany); rys.wyczysc(); pokaz('ekran-konca', false); pauza = false;
  });

  function pokazKoniec() {
    const s = gra.statystyki, min = Math.floor(s.czas / 60), sek = Math.floor(s.czas % 60);
    $('wynik').innerHTML = '';
    // dwa zakończenia (25 XI): ile razy sięgnąłeś po klątwę, tyle żaru zostaje pod skórą
    const zar = gra.przemiana >= PRZEMIANA.prog;
    // po rycerzu (26 XI, Patryk): słońce nad pokonanym, klątwa zeszła z polany, ale to pierwszy etap jej zdejmowania
    const boss = !!gra.bossPadl;
    $('tytul-konca').textContent = BAGNO ? 'Świt na bagnie' : boss ? 'Świt nad polaną' : 'Świt';
    $('tekst-konca').textContent = BAGNO
      ? 'Woda się uspokaja, mgła siada na trzcinach. Przetrwałeś noc na bagnie. Wiedźma jeszcze nie wróciła.'
      : boss
      ? (zar
        ? 'Rycerz leży w trawie, a słońce pierwszy raz od dawna dotyka polany. Klątwa zeszła z tego miejsca, ale żar pod Twoją skórą już nie gaśnie. Ręka pali, kiedy nie tniesz.'
        : 'Rycerz leży w trawie, a słońce pierwszy raz od dawna dotyka polany. Klątwa zeszła z tego miejsca, a żar pod Twoją skórą przygasa. Nie sięgałeś po nią bez potrzeby.')
      : zar
        ? 'Mgła cofa się do lasu, ale żar pod skórą już nie gaśnie. Ręka pali, kiedy nie tniesz. Rycerz pisał, że domek szuka następcy.'
        : 'Mgła cofa się do lasu, a żar pod skórą przygasa. Nie sięgałeś po klątwę bez potrzeby. Może jednak da się ją zdjąć.';
    $('dalej-konca').hidden = !boss || BAGNO;
    $('na-bagno').hidden = !boss || BAGNO;
    $('jeszcze-raz').className = $('na-bagno').hidden ? 'glowny' : 'drugi';
    $('dalej-konca').textContent = 'To dopiero pierwszy etap. Rycerz pisał o bagnach wiedźmy: tam jest następny ślad.';
    for (const [co, ile] of [['Zabite potwory', s.zabici], ['Sparowane ciosy', s.parowania], ['Zebrane monety', s.monety || 0], ['Upadki', s.upadki], ['Kartki dziennika', `${gra.kartki} z ${KARTKI.length}`], ['Żar klątwy', `${Math.round(gra.przemiana * 100)}%`], ['Czas', `${min}:${String(sek).padStart(2, '0')}`]]) {
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
    for (const z of zd) { zagraj(z); if (z.typ === 'koniec') setTimeout(pokazKoniec, 900); if (z.typ === 'na-bagno') odejdzNaBagno(); }
    muzyka(!pauza && gra.faza === 'walka' && gra.wrogowie.length ? (gra.etap >= 3 ? 2 : 1) : 0);
    { const b = gra.bohater, d = Math.hypot(b.x - OGNISKO.x, b.y - OGNISKO.y);
      otoczenie({ gra: zaczeta && !pauza && gra.faza !== 'koniec', wIzbie: !!b.wChacie, walka: gra.faza === 'walka', ogien: b.wChacie ? 0 : Math.max(0, 1 - d / 420) * (0.35 + 0.65 * (gra.ogien ?? 1)), napiecie: gra.faza === 'przerwa' && gra.etap > 0 && gra.fazaCzas < 12 ? 1 : 0 }); }
    rys.rysuj(gra, dt, zd);
    hud.aktualizuj(gra, dt, rys.opis);
    pokazWybor();
    pokazKartke();
    $('przycisk-plecak').classList.toggle('nowa', !!(gra.nowe && gra.nowe.length));
    if (!!gra.handel !== handelPokazany) { handelPokazany = !!gra.handel; pokaz('ekran-handlarza', handelPokazany); if (handelPokazany) { $('slowa-handlarza').textContent = HANDLARZ.powitania[(gra.handlarz.wizyty - 1) % HANDLARZ.powitania.length]; pokazHandel(); } }
    if (!!gra.stol !== stolPokazany) { stolPokazany = !!gra.stol; pokaz('ekran-stolu', stolPokazany); if (stolPokazany) pokazStol(); }
  }
  // Plecak (26 XI): I albo przycisk; gra stoi. Pola: mikstury, rzeczy z potworów i łup z rycerza, przeczytane kartki.
  let plecakOtwarty = false, kartkaZPlecaka = false;
  const ikonaPrzedmiotu = (id, kolor) => {
    const img = document.createElement('img'); img.className = 'ikona'; img.alt = ''; img.src = `grafika/przedmioty/${id}.webp`;
    img.onerror = () => { const d = document.createElement('span'); d.className = 'zastepcza'; d.style.color = kolor; d.style.background = kolor; img.replaceWith(d); };
    return img;
  };
  function pole(ikona, nazwa, ile, opis, naKlik) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pole';
    const n = document.createElement('span'); n.textContent = nazwa; b.append(ikona, n);
    if (ile > 1) { const c = document.createElement('b'); c.textContent = '×' + ile; b.append(c); }
    b.addEventListener('click', () => { for (const x of $('pola-plecaka').children) x.setAttribute('aria-pressed', String(x === b)); $('opis-rzeczy').textContent = opis; if (naKlik) naKlik(); });
    return b;
  }
  function pokazPlecak() {
    const lista = $('pola-plecaka'); lista.textContent = ''; $('opis-rzeczy').textContent = 'Dotknij rzeczy, żeby ją obejrzeć. Kartki można przeczytać jeszcze raz.';
    const mi = document.createElement('img'); mi.className = 'ikona'; mi.alt = ''; mi.src = 'grafika/ikona-mikstura.webp';
    lista.append(pole(mi, 'Mikstura', gra.bohater.mikstury, `Leczy od razu (Q). Masz ${gra.bohater.mikstury}, uniesiesz najwyżej 3.`));
    for (const id of ['amulet', 'helm', 'kiel', 'krew', 'pazur']) {
      const ile = gra.plecak[id] || 0; if (!ile) continue;
      const pr = PRZEDMIOTY[id]; lista.append(pole(ikonaPrzedmiotu(id, pr.kolor), pr.nazwa, ile, pr.opis));
    }
    for (let i = 0; i < KARTKI.length; i++) {
      const czytal = i < gra.kartki;
      const ki = document.createElement('img'); ki.className = 'ikona'; ki.alt = ''; ki.src = 'grafika/kartka.webp';
      const nowa = (gra.nowe || []).includes(i);
      const b = pole(ki, `Kartka ${i + 1}`, 0, nowa ? 'Nowa, jeszcze nieprzeczytana.' : czytal ? 'Kartka z dziennika rycerza.' : 'Tej kartki jeszcze nie znalazłeś.', czytal ? () => { kartkaZPlecaka = true; gra.nowe = (gra.nowe || []).filter(n => n !== i); gra.czytana = i; pokazKartke(); } : null);
      if (nowa) b.classList.add('nowa');
      if (!czytal) b.classList.add('puste');
      lista.append(b);
    }
  }
  function przelaczPlecak(otworz = !plecakOtwarty) {
    if (otworz && (!zaczeta || gra.faza === 'koniec' || gra.czytana !== null || gra.wybor)) return;
    plecakOtwarty = otworz; pokaz('ekran-plecaka', otworz);
    if (otworz) { pauza = true; pokazPlecak(); } else pauza = false;
  }
  $('przycisk-plecak').addEventListener('click', () => przelaczPlecak(true));
  $('zamknij-plecak').addEventListener('click', () => przelaczPlecak(false));
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'i' || gra.czytana !== null) return;
    if (pauza && !plecakOtwarty) return; przelaczPlecak();
  });
  const ikonaPlecaka = new Image(); ikonaPlecaka.onload = () => { $('przycisk-plecak').style.backgroundImage = 'url(grafika/przedmioty/plecak.webp)'; $('przycisk-plecak').classList.add('ma-ikone'); }; ikonaPlecaka.src = 'grafika/przedmioty/plecak.webp';
  // Stół w izbie (26 XI): przerabianie łupów na trwałe ulepszenia; gra stoi, dopóki nie odejdziesz.
  let stolPokazany = false;
  function pokazStol() {
    const lista = $('przepisy'); lista.textContent = '';
    for (const r of STOL) {
      const poz = gra.trwale[r.id] || 0, k = kosztStolu(gra, r), d = document.createElement('div'); d.className = 'przepis';
      const t = document.createElement('strong'); t.textContent = `${r.nazwa}${r.max > 1 ? ` (${poz}/${r.max})` : ''}`;
      const o = document.createElement('p'); o.className = 'opis'; o.textContent = r.opis;
      const ko = document.createElement('div'); ko.className = 'koszt';
      if (poz < r.max) for (const id in k) {
        const sp = document.createElement('span'), im = document.createElement('img'); im.src = `grafika/przedmioty/${id}.webp`; im.alt = '';
        const ma = gra.plecak[id] || 0; sp.append(im, `${PRZEDMIOTY[id].nazwa}: ${ma}/${k[id]}`); if (ma < k[id]) sp.classList.add('brak'); ko.append(sp);
      } else ko.textContent = 'Zrobione do końca.';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'drugi'; b.textContent = 'Zrób'; b.disabled = !mozeZrobic(gra, r);
      b.addEventListener('click', () => { if (zrobNaStole(gra, r.id)) pokazStol(); });
      d.append(t, b, o, ko); lista.append(d);
    }
  }
  $('odejdz-od-stolu').addEventListener('click', () => { gra.stol = false; });

  // Handlarz (27 XI): przy drodze między falami. Gra stoi, dopóki nie odejdziesz.
  let handelPokazany = false;
  const grosze = n => `${n} ${n === 1 ? 'moneta' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'monety' : 'monet'}`   // Patryk, 27 XI 12:36: „nie grosze, tylko monety”;
  function towar(ikona, nazwa, opis, przycisk, mozna, naKlik) {
    const d = document.createElement('div'); d.className = 'przepis';
    const t = document.createElement('strong'); t.textContent = nazwa;
    const o = document.createElement('p'); o.className = 'opis'; o.textContent = opis;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'drugi'; b.textContent = przycisk; b.disabled = !mozna;
    b.addEventListener('click', () => { if (naKlik()) pokazHandel(); });
    if (ikona) { d.classList.add('towar'); ikona.className = 'obraz'; d.append(ikona); }   // duża ikona po lewej (arkusz Gemini, 27 XI)
    d.append(t, b, o); return d;
  }
  function naglowek(tekst) { const h = document.createElement('p'); h.className = 'naglowek'; h.textContent = tekst; const d = document.createElement('div'); d.className = 'przepis'; d.style.background = 'none'; d.style.border = '0'; d.style.padding = '0'; d.append(h); return d; }
  function pokazHandel() {
    $('grosze').textContent = `W sakiewce: ${grosze(gra.grosze)}`;
    const lista = $('towary'); lista.textContent = '';
    lista.append(naglowek('Kupujesz'));
    const mi = document.createElement('img'); mi.src = 'grafika/przedmioty/mikstura.webp'; mi.alt = '';
    const mx = maxMikstur(gra), pelno = gra.bohater.mikstury >= mx;
    lista.append(towar(mi, `Mikstura: ${grosze(HANDLARZ.mikstura)}`, pelno ? `Masz ${gra.bohater.mikstury}, więcej nie uniesiesz.` : `Leczy od razu (Q). Masz ${gra.bohater.mikstury} z ${mx}.`, 'Kup', mozeKupic(gra), () => kupMiksture(gra)));
    for (const t of HANDLARZ.towary) {
      const ma = t.napoj ? !!(gra.napoj && gra.napoj[t.id]) : !!gra[t.id];
      const ik = document.createElement('img'); ik.src = `grafika/przedmioty/${t.id}.webp`; ik.alt = '';   // ikony z arkusza Gemini (27 XI)
      lista.append(towar(ik, `${t.nazwa}: ${grosze(t.cena)}`, ma ? (t.napoj ? 'Już wypite. Działa do końca następnej fali.' : 'Już masz.') : t.opis, 'Kup', mozeKupicTowar(gra, t.id), () => kupTowar(gra, t.id)));
    }
    lista.append(naglowek('Sprzedajesz'));
    let cos = false;
    for (const id of ['pazur', 'kiel', 'krew', 'helm']) {
      const ile = gra.plecak[id] || 0; if (!ile) continue; cos = true;
      const pr = PRZEDMIOTY[id], im = document.createElement('img'); im.src = `grafika/przedmioty/${id}.webp`; im.alt = '';
      lista.append(towar(im, `${pr.nazwa} ×${ile}: ${grosze(pr.cena)}`, 'Za monety kupisz u niego mikstury i wywary.', 'Sprzedaj', true, () => sprzedaj(gra, id)));
    }
    if (!cos) { const p = document.createElement('p'); p.className = 'pusto'; p.textContent = 'Nie masz nic, co by go zainteresowało. Pazury, kły i krew z potworów kupi chętnie.'; lista.append(p); }
  }
  $('odejdz-od-handlarza').addEventListener('click', () => odejdzOdHandlarza(gra));
  addEventListener('keydown', e => { if (gra.handel && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); odejdzOdHandlarza(gra); } }, true);

  // rzeczy zostają między grami: zapis, gdy coś przybędzie

  // Kartka z dziennika rycerza: gra stoi, dopóki jej nie schowasz (przycisk, E, Enter, spacja albo Esc).
  let kartkaPokazana = null;
  function pokazKartke() {
    if (gra.czytana === kartkaPokazana) return; kartkaPokazana = gra.czytana;
    pokaz('ekran-kartki', gra.czytana !== null);
    if (gra.czytana === null) return;
    $('tekst-kartki').textContent = KARTKI[gra.czytana].tekst;
    $('nr-kartki').textContent = `Kartka ${gra.czytana + 1} z ${KARTKI.length}`;
  }
  const schowaj = () => { zamknijKartke(gra); pokazKartke(); if (kartkaZPlecaka) { kartkaZPlecaka = false; pokaz('ekran-plecaka', true); } };
  $('schowaj-kartke').addEventListener('click', schowaj);
  addEventListener('keydown', e => {
    if (gra.czytana === null || !['e', 'enter', ' ', 'escape'].includes(e.key.toLowerCase())) return;
    e.preventDefault(); e.stopImmediatePropagation(); schowaj();
  }, true);
  // Wybór ulepszenia po fali: trzy karty, gra stoi, dopóki nie wybierzesz (walka.js, wybierzUlepszenie).
  let wyborPokazany = null;
  function pokazWybor() {
    const klucz = gra.wybor ? gra.wybor.join() : null;
    if (klucz === wyborPokazany) return; wyborPokazany = klucz;
    pokaz('ekran-wyboru', !!gra.wybor);
    if (!gra.wybor) return;
    const lista = $('karty-wyboru'); lista.textContent = '';
    for (const id of gra.wybor) {
      const u = ULEPSZENIA.find(x => x.id === id), b = document.createElement('button');
      b.type = 'button'; b.className = 'wybor-karta';
      const h = document.createElement('strong'); h.textContent = u.nazwa; const p = document.createElement('span'); p.textContent = u.opis;
      b.append(h, p); b.addEventListener('click', () => { wybierzUlepszenie(gra, id); pokazWybor(); });
      lista.append(b);
    }
  }
  requestAnimationFrame(klatka);
}

start();
