// Wejście do gry: ładuje PixiJS i obraz chaty, składa logikę, rysowanie, sterowanie i pasek.
import { nowaGra, aktualizuj, ustawBron, wybierzUlepszenie, zamknijKartke, zapiszPlecak, kosztStolu, mozeZrobic, zrobNaStole } from './walka.js';
import { BRONIE, DOMYSLNA_BRON, ULEPSZENIA, KARTKI, PRZEMIANA, WSTEP, PRZEDMIOTY, STOL } from './dane.js';
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
  let obraz, obrazBohatera, obrazBohateraWielki, obrazGhula, obrazKolosa, obrazWiedzmy, obrazRycerza, obrazBestii, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki;
  try {
    [, obraz, obrazBohatera, obrazBohateraWielki, obrazGhula, obrazKolosa, obrazWiedzmy, obrazRycerza, obrazBestii, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki] = await Promise.all([
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
      /ziemia=stara/.test(location.search) ? null : zaladujObraz(new URL('../grafika/ziemia.webp', import.meta.url).href, 'ziemia').catch(() => null),   // ziemia z Gemini (Patryk, 25 XI); ?ziemia=stara pokazuje dawny kafel
      /droga=(farba|kafel)/.test(location.search) ? null : zaladujObraz(new URL('../grafika/droga.webp', import.meta.url).href, 'droga').catch(() => null),   // łata drogi z rysunku ziemi Przemka (v39; ?droga=laty); ?droga=farba pokazuje drogę z v38
      /droga=(farba|laty)/.test(location.search) ? null : zaladujObraz(new URL('../grafika/droga-kafel.webp', import.meta.url).href, 'droga-kafel').catch(() => null),   // kafel drogi z Gemini (Patryk, 25 XI)
      zaladujObraz(new URL('../grafika/kartka-lezy.webp', import.meta.url).href, 'kartka').catch(() => null),   // kartka z dziennika rycerza na ziemi (Gemini, 25 XI)
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
  try { rys = przygotujRysowanie(cv, obraz, { wymusProcesor: /procesor/.test(location.search), obrazBohatera, obrazBohateraWielki, bohater: wyglad, obrazyWrogow: { ghul: obrazGhula, kolos: obrazKolosa, wiedzma: obrazWiedzmy, rycerz: obrazRycerza, bestia: obrazBestii }, obrazBezDachu, obrazDrzwi, obrazRekwizytow, obrazZiemi, obrazDrogi, obrazKaflaDrogi, obrazKartki }); }
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
  function prolog(potem) {
    const el = $('prolog'), tekst = $('prolog-tekst'); tekst.textContent = ''; pokaz('prolog', true);
    let i = 0, czekaj = null, koniec = false;
    const zakoncz = () => { if (koniec) return; koniec = true; clearTimeout(czekaj); removeEventListener('keydown', klawisz, true); pokaz('prolog', false); potem(); };
    const nastepne = () => {
      clearTimeout(czekaj);
      if (i >= WSTEP.prolog.length) { zakoncz(); return; }
      for (const p of tekst.children) p.classList.add('minione');
      const p = document.createElement('p'); p.textContent = WSTEP.prolog[i++]; tekst.append(p);
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
    // dwa zakończenia (25 XI): ile razy sięgnąłeś po klątwę, tyle żaru zostaje pod skórą
    const zar = gra.przemiana >= PRZEMIANA.prog;
    // po rycerzu (26 XI, Patryk): słońce nad pokonanym, klątwa zeszła z polany, ale to pierwszy etap jej zdejmowania
    const boss = !!gra.bossPadl;
    $('tytul-konca').textContent = boss ? 'Świt nad polaną' : 'Świt';
    $('tekst-konca').textContent = boss
      ? (zar
        ? 'Rycerz leży w trawie, a słońce pierwszy raz od dawna dotyka polany. Klątwa zeszła z tego miejsca, ale żar pod Twoją skórą już nie gaśnie. Ręka pali, kiedy nie tniesz.'
        : 'Rycerz leży w trawie, a słońce pierwszy raz od dawna dotyka polany. Klątwa zeszła z tego miejsca, a żar pod Twoją skórą przygasa. Nie sięgałeś po nią bez potrzeby.')
      : zar
        ? 'Mgła cofa się do lasu, ale żar pod skórą już nie gaśnie. Ręka pali, kiedy nie tniesz. Rycerz pisał, że domek szuka następcy.'
        : 'Mgła cofa się do lasu, a żar pod skórą przygasa. Nie sięgałeś po klątwę bez potrzeby. Może jednak da się ją zdjąć.';
    $('dalej-konca').hidden = !boss;
    $('dalej-konca').textContent = 'To dopiero pierwszy etap. Rycerz pisał o bagnach wiedźmy: tam jest następny ślad.';
    for (const [co, ile] of [['Zabite potwory', s.zabici], ['Sparowane ciosy', s.parowania], ['Upadki', s.upadki], ['Kartki dziennika', `${gra.kartki} z ${KARTKI.length}`], ['Żar klątwy', `${Math.round(gra.przemiana * 100)}%`], ['Czas', `${min}:${String(sek).padStart(2, '0')}`]]) {
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
    pokazWybor();
    pokazKartke();
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
      const b = pole(ki, `Kartka ${i + 1}`, 0, czytal ? 'Kartka z dziennika rycerza.' : 'Tej kartki jeszcze nie znalazłeś.', czytal ? () => { kartkaZPlecaka = true; gra.czytana = i; pokazKartke(); } : null);
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

  // rzeczy zostają między grami: zapis, gdy coś przybędzie
  let plecakZapisany = '';
  setInterval(() => { const t = JSON.stringify(gra.plecak); if (t !== plecakZapisany) { plecakZapisany = t; zapiszPlecak(gra); } }, 1000);

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
