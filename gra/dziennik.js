// Dziennik zadań (Jozz, 28 XI: „to, co masz na górze, co ci mówi, co już wykonałeś i ile ci zostało w tym poziomie,
// aby gracz, który się zgubił i nie wie, co gdzie ma kliknąć, miał tam wskazówki … typowy quest log w grach”).
// Tu tylko liczenie: co jest do zrobienia teraz, co już zrobione i gdzie to jest względem bohatera. Okno składa main.js.
// Nic nie zmienia w grze, więc da się to sprawdzić w Node (testy/dziennik.mjs).
import { ETAPY, KARTKI, WSTEP, ZIOLA, OGIEN, HANDLARZ, BOHATER } from './dane.js';
import { MIEJSCA, BAGNO, CHATA, CHATA_WIEDZMY, OGNISKO, STOS_DREWNA, MIEJSCE_HANDLARZA, LATARNIE, DROGA_POLNOC, KARTKA_START } from './swiat.js';

// Kierunek na mapie: góra ekranu to północ (droga na bagno idzie w górę mapy).
const STRONY = ['na wschód', 'na północny wschód', 'na północ', 'na północny zachód', 'na zachód', 'na południowy zachód', 'na południe', 'na południowy wschód'];
export function kierunek(b, cel) {
  const dx = cel.x - b.x, dy = cel.y - b.y, d = Math.hypot(dx, dy);
  if (d < 110) return 'tuż obok';
  const a = Math.atan2(-dy, dx), i = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
  const jak = d < 500 ? 'blisko' : d < 1100 ? 'kawałek dalej' : 'daleko';
  return `${jak}, ${STRONY[i]}`;
}

const duza = s => s.charAt(0).toUpperCase() + s.slice(1);
// Miejsca w izbie: trzeba wiedzieć, że do środka wchodzi się drzwiami
const wIzbie = (id, dotyk) => BAGNO ? (id === 'chata' ? 'W izbie na palach: wejdź drzwiami z pomostu.' : '') : (id === 'palenisko' || id === 'poslanie' ? `W izbie chaty: podejdź do drzwi, otwórz je (${dotyk ? 'napis na dole' : 'E'}) i wejdź.` : '');

// Zadania na teraz. dotyk: telefon (przycisk zamiast klawisza E).
export function dziennik(gra, dotyk = false) {
  const b = gra.bohater, E = dotyk ? 'dotknij napisu na dole ekranu' : 'naciśnij E';
  const zadania = [], zrobione = [];
  const dodaj = (tekst, opis, gdzie, extra = {}) => zadania.push({ tekst, opis, gdzie: gdzie ? { x: gdzie.x, y: gdzie.y } : null, kierunek: gdzie ? kierunek(b, gdzie) : '', ...extra });
  const rozdzial = BAGNO ? 'Rozdział II · Bagno wiedźmy' : 'Rozdział I · Polana we mgle';
  let tytul = '', cel = '';

  // co już za tobą: obejrzane miejsca, odparte fale, kartki
  for (const id of gra.odkryte) { const m = MIEJSCA.find(x => x.id === id); if (m) zrobione.push(duza(`obejrzyj ${m.nazwa}`)); }
  for (let i = 0; i < Math.min(gra.etap, ETAPY.length); i++) zrobione.push(`Noc ${i + 1} odparta: ${ETAPY[i].nazwa}`);
  for (let i = 0; i < Math.min(gra.kartki, KARTKI.length); i++) zrobione.push(`Przeczytaj kartkę ${i + 1} z ${KARTKI.length} dziennika rycerza`);

  if (gra.faza === 'wstep') {
    const totem = MIEJSCA.find(m => m.id === 'totem');
    const reszta = MIEJSCA.filter(m => m !== totem);
    const ile = gra.odkryte.length + Math.min(1, gra.kartki), wszystkie = MIEJSCA.length + 1;
    tytul = `Zmierzch · obejrzane ${ile} z ${wszystkie}`; cel = 'Rozejrzyj się, zanim zapadnie noc';
    for (const m of reszta) {
      if (gra.odkryte.includes(m.id)) continue;
      const zagadka = m.wsk || WSTEP.wskazowki[m.id] || '';
      dodaj(`Obejrzyj ${m.nazwa}`, [zagadka, wIzbie(m.id, dotyk), `Na miejscu ${E}.`].filter(Boolean).join(' '), m);
    }
    if (gra.kartki < 1) {
      const k = gra.kartka || KARTKA_START || CHATA.palenisko;
      dodaj('Znajdź pierwszą kartkę', BAGNO ? 'Leży w izbie wiedźmy, przy stole. Wejdź drzwiami z pomostu i podejdź do niej, podniesie się sama.' : `Leży na podłodze w izbie chaty. Otwórz drzwi (${dotyk ? 'napis na dole' : 'E'}), wejdź i podejdź do niej, podniesie się sama.`, k);
    }
    if (totem && !gra.odkryte.includes('totem')) {
      const gotowy = gra.kartki >= 1 && reszta.every(m => gra.odkryte.includes(m.id));
      dodaj(`Na koniec: obejrzyj ${totem.nazwa}`, gotowy ? `${totem.wsk || WSTEP.wskazowki.totem} Na miejscu ${E}. Dotknięcie budzi noc, więc przygotuj się do walki.` : 'Czeka, aż obejrzysz resztę i przeczytasz pierwszą kartkę. Jego dotknięcie budzi noc.', totem, { czeka: !gotowy });
    }
    if (!zadania.length) cel = 'Wszystko obejrzane. Zaraz zapadnie noc: trzymaj się ognia.';
  } else if (gra.faza === 'przerwa' || gra.faza === 'walka' || gra.faza === 'upadek') {
    const e = Math.min(gra.etap, ETAPY.length - 1), boss = gra.wrogowie.find(w => w.typ.boss);
    tytul = `Noc ${e + 1} z ${ETAPY.length}: ${ETAPY[e].nazwa}`;
    if (gra.faza === 'upadek') cel = 'Upadłeś. Za chwilę wstaniesz przy ogniu i fala zacznie się od nowa.';
    else if (gra.faza === 'walka') {
      const zostalo = gra.wrogowie.filter(w => w.stan !== 'martwy').length + gra.kolejka.length;
      cel = boss ? `Pokonaj: ${boss.typ.czary ? 'wiedźma z bagna' : 'rycerz'} (${Math.max(0, Math.round(boss.zycie / boss.zycieMax * 100))}% życia)` : `Przetrwaj falę: zostało ${zostalo} ${zostalo === 1 ? 'potwór' : zostalo % 10 >= 2 && zostalo % 10 <= 4 && (zostalo % 100 < 10 || zostalo % 100 >= 20) ? 'potwory' : 'potworów'}`;
    } else cel = b.wChacie ? 'Cisza. W izbie noc czeka, aż wyjdziesz.' : `Cisza przed falą: ${Math.max(0, Math.ceil(gra.fazaCzas))} s`;

    const ranny = b.zycie < BOHATER.zycie * 0.7;
    if (ranny && b.mikstury > 0) dodaj('Wypij miksturę', `Ranny jesteś. Mikstura leczy od razu (${dotyk ? 'przycisk z fiolką' : 'Q'}). Masz ${b.mikstury}.`, null);
    if (gra.faza !== 'walka' && ranny && !BAGNO && !b.wChacie) dodaj('Odpocznij na posłaniu', 'W ciszy między falami sen w izbie leczy rany, a noc czeka, aż wyjdziesz. ' + wIzbie('poslanie', dotyk), CHATA.poslanie);
    if (gra.ogien < OGIEN.przygasa + 0.15) dodaj('Dorzuć do ognia', b.drewno ? `Niesiesz polano. Przy ognisku ${E}.` : `Ogień przygasa, a w ciemności gorzej widać potwory. Weź polano ze stosu drewna (${E}), potem dorzuć przy ognisku.`, b.drewno ? OGNISKO : STOS_DREWNA);
    if (gra.kartka) dodaj('Podnieś kartkę dziennika', 'Kartka z dziennika rycerza leży na ziemi. Podejdź do niej, podniesie się sama.', gra.kartka);
    if (gra.nowe && gra.nowe.length) dodaj('Przeczytaj nową kartkę', `Czeka w plecaku (${dotyk ? 'przycisk plecaka u góry' : 'I'}).`, null);
    if (gra.faza === 'przerwa' && gra.etap >= 1) dodaj('Pohandluj ze starcem', `${BAGNO ? 'Stoi niedaleko ogniska' : 'Stoi przy drodze'} tylko w ciszy między falami. Kupisz mikstury (${HANDLARZ.mikstura} monet) i wywary, sprzedasz łup. Masz ${gra.grosze || 0} monet. Na miejscu ${E}.`, MIEJSCE_HANDLARZA, { dodatkowe: true });
    if (BAGNO) {
      const ziele = gra.plecak.ziele || 0, lezy = gra.lup.filter(l => l.typ === 'ziele');
      if (ziele >= ZIOLA.naMiksture && gra.faza !== 'walka') dodaj('Uwarz miksturę w kotle', `Masz ${ziele} wiązek ziela, kocioł z trzech robi miksturę. Kocioł stoi na pomoście przed chatą, ${E}.`, CHATA_WIEDZMY.kociol, { dodatkowe: true });
      else if (lezy.length && gra.faza !== 'walka') {
        const naj = lezy.reduce((a, c) => Math.hypot(c.x - b.x, c.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? c : a);
        dodaj(`Zbierz ziele (${ziele} z ${ZIOLA.naMiksture})`, 'Rośnie na wyspach dookoła, po kładkach. Wystarczy przejść obok. Trzy wiązki w kotle to mikstura.', naj, { dodatkowe: true });
      }
      const zgasle = LATARNIE.map((l, i) => ({ ...l, o: gra.latarnie[i].ogien })).filter(l => l.o < 0.6);
      if (zgasle.length && gra.etap < ETAPY.length - 1) {
        const naj = zgasle.reduce((a, c) => Math.hypot(c.x - b.x, c.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? c : a);
        dodaj(`Zapal pochodnie (zgasłe: ${zgasle.length} z ${LATARNIE.length})`, `Topielce nie wychodzą z wody tam, gdzie płonie ogień. Przy pochodni na palu ${E}.`, naj, { dodatkowe: true });
      }
    }
  } else if (gra.faza === 'swit' || gra.faza === 'koniec') {
    tytul = 'Świt';
    if (BAGNO && gra.kleczy && !gra.porozmawiano) { cel = 'Wiedźma klęczy w błocie. Porozmawiaj z nią.'; dodaj('Porozmawiaj z wiedźmą', `Podejdź do niej i ${E}.`, gra.kleczy); }
    else cel = 'Przetrwałeś noc.';
  } else if (gra.faza === 'wedrowka' || gra.faza === 'odchodzi') {
    tytul = 'Ranek'; cel = 'Idź na bagno: drogą na północ, przez las.';
    const kon = DROGA_POLNOC.length ? DROGA_POLNOC[DROGA_POLNOC.length - 2] : null;
    dodaj('Idź drogą na bagna', 'Za chatą, po prawej, droga skręca na północ przez las. Idź nią do górnego skraju mapy.', kon);
  }
  // najbliższe najpierw (to, co czeka na resztę, zawsze na końcu)
  const odl = z => (z.czeka ? 1e9 : 0) + (z.gdzie ? Math.hypot(z.gdzie.x - b.x, z.gdzie.y - b.y) : -1);
  if (gra.faza === 'wstep') zadania.sort((a, c) => odl(a) - odl(c));
  for (const z of zadania) z.tekst = duza(z.tekst);
  return { rozdzial, tytul, cel, zadania, zrobione };
}
