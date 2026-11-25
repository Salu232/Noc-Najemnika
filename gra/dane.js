// Dane gry. Tu zmieniamy liczby bez dotykania silnika (decyzja 002, punkt 5).
// Czas jest w sekundach, odległości w jednostkach świata (bohater ma około 80 jednostek wzrostu).

export const BOHATER = {
  zycie: 100,
  sila: 100,               // wytrzymałość: ciosy, bloki i uniki ją zużywają
  szybkosc: 165,
  promien: 14,
  odnowaSily: 34,          // ile wytrzymałości wraca na sekundę
  opoznienieOdnowy: 0.6,   // po ilu sekundach od wysiłku zaczyna wracać

  unik: { koszt: 24, czas: 0.4, dystans: 150, nietykalny: 0.36, czasPion: 0.6, dystansPion: 135, nietykalnyPion: 0.44 },   // 25 XI 20:54 Patryk: przewroty w górę i w dół „strasznie szybkie” (23 klatki w 0,4 s), więc w pionie 0,6 s
  // 25 XI: 0,36, bo przewrót rusza wolniej z przysiadu; 24 XI: przewrót z filmu, więc trochę dłuższy niż dawny odskok (0,32 s)
  // 24 XI 15:17, Patryk: blok „bardziej efektywniejszy”. Było: koszt 14 (ciężki ×3), parowanie 0,18 s, spowolnienie 0,45, kąt 1,35 rad,
  // odrzut 160, ciężki cios przez blok 50% ran, odnowa siły w bloku 30%. Teraz blok obraca się sam do atakującego (bez myszki),
  // a zablokowany ghul odskakuje i musi się zebrać (odpoczynek), więc blok daje okazję do cięcia.
  // 24 XI 19:09, Patryk: w bloku „jeździ po mapie”. Było spowolnienie 0,55 płynnie; teraz 0,3 krótkimi krokami (2,2 na sekundę; 25 XI 1,4, żeby film cofania dwuręcznym nie biegł za szybko),
  // a zablokowany cios cofa go o pół kroku (cofniecie: prędkość odrzutu, ciężki ×2).
  blok: { kosztNaCios: 9, mnoznikCiezki: 2.2, oknoParowania: 0.25, spowolnienie: 0.3, krokiNaSekunde: 1.4, cofniecie: 70, kat: 1.75, odrzut: 240, ranaCiezka: 0.3, odnowa: 0.5, obrot: 9, zasiegObrotu: 260 },

  // Ciosy idą na zmianę: w prawo, w lewo, w prawo… Każdy następny zadany od razu po poprzednim
  // ma rozpęd: krótszy zamach (ciężar miecza pracuje dla ciebie, jeśli nie dasz mu stanąć).
  rozped: { max: 2, skrocenie: 0.22 },   // do 2 stopni, każdy skraca zamach o 22%
  oknoSerii: 0.35,         // ile czasu po powrocie miecza można dołożyć następny cios z rozpędem

  // Pomysł „Krew za krew” (docs/walka.md, punkt 7.2)
  krewZaKrew: { czas: 3, zaTrafienie: 7 },

  // Pomysł „Miecz, który waży” (docs/walka.md, punkt 7.3): ile trwa wyrywanie miecza z kolosa
  // i jak długo gra staje przy trafieniu
  miecz: { grzeznie: 0.32, zatrzymanie: 0.05, zatrzymanieGrzeznie: 0.13 },
};

// Broń: waga to gust (Patryk, 23 XI). Do 24 XI były trzy miecze; lekki wypadł (Patryk, 18:44: „ten mały miecz wgl bym nie
// zostawiał (…) lepiej już zwykły miecz i dwuręczny większy”). Zostają dwa: zwykły miecz i dwuręczny.
// zamach: ile trwa wzięcie miecza do ciosu; ciecie: jak szybko ostrze przechodzi łuk; powrot: ile trwa,
// zanim miecz znów jest gotowy. luk: połowa szerokości cięcia (w radianach), krok: ile bohater idzie za ciosem.
// ruch: jak szybko bohater chodzi w trakcie ciosu (część zwykłej szybkości). przerywa: czy cios przerywa zamach ghula.
// przecinaCiezkich: czy przechodzi przez kolosa zamiast w nim grzęznąć. ladowanie: ile trzymać, żeby cios był mocny.
export const BRONIE = {
  poltorareczny: {
    nazwa: 'Miecz', opis: 'Szybki i pewny. Ghul pada od jednego albo dwóch cięć, a w kolosie miecz grzęźnie.',
    dlugosc: 72, szerokosc: 3.8,
    zamach: 0.17, ciecie: 0.13, powrot: 0.26, zasieg: 110, luk: 1.05,
    obrazenia: 2, odrzut: 260, koszt: 13, krok: 50, ruch: 0.35,
    przerywa: false, przecinaCiezkich: false, ladowanie: 0.6,
  },
  wielki: {
    nazwa: 'Dwuręczny', opis: 'Ciężki i wolny. Ghula zabija jedno cięcie, a miecz przechodzi nawet przez kolosa.',
    dlugosc: 92, szerokosc: 5.6,
    zamach: 0.3, ciecie: 0.17, powrot: 0.42, zasieg: 128, luk: 1.2,
    obrazenia: 3, odrzut: 420, koszt: 20, krok: 70, ruch: 0.2,
    przerywa: false, przecinaCiezkich: true, ladowanie: 0.8,
  },
};
export const DOMYSLNA_BRON = 'poltorareczny';

// Mocny cios: przytrzymaj atak, aż miecz się naładuje, i puść. Szerszy łuk, większe rany, przechodzi przez wszystko.
export const MOCNY = { luk: 0.7, zasieg: 1.15, obrazenia: 2.5, odrzut: 1.8, koszt: 0.8, ciecie: 1.25, ruchLadowania: 0.3 };

// Klątwa (R, na telefonie przycisk Klątwa): bohater unosi przeklętą prawą rękę i wali pięścią w ziemię.
// Wszystko wokół dostaje i odlatuje, ghule zwykle giną, kolos się chwieje. Przez cały czas nikt go nie zrani.
// Pasek klątwy napełnia się od trafień i zabitych; na początku nocy jest pełny, żeby dało się ją od razu wypróbować.
export const KLATWA = {
  ladowanie: 0.45, uderzenie: 0.25, wstawanie: 0.5,   // sekundy: unosi rękę, uderza, wstaje
  zasieg: 190, obrazenia: 3, odrzut: 620,
  zaTrafienie: 0.04, zaZabicie: 0.1, start: 1,
};

// Chata (docs/chata.md): wchodzi się drzwiami, odpoczywa tylko w ciszy między etapami nocy (decyzja Patryka, 24 XI).
// W środku życie i wytrzymałość wracają, a cisza przed następnym etapem płynie wolniej, ale płynie:
// gdy przyjdą potwory, bohater sam wychodzi przed drzwi.
// W izbie życie wraca powoli, a na posłaniu (sen) szybko. W izbie bohater chodzi wolniej niż na polanie.
// Patryk, 24 XI 12:29: „za malo czasu żeby cokolwiek zobaczyć w tym domku (…) walka się rozpocznie jak wychodzi się z chaty”.
// W chacie cisza stoi (tempoCiszy 0); po wyjściu zostaje jej co najmniej ciszaPoWyjsciu sekund, żeby odejść od drzwi.
export const CHATA_ODPOCZYNEK = { zasiegDrzwi: 70, leczenie: 2, leczenieSen: 9, tempoCiszy: 0, ciszaPoWyjsciu: 3 };

export const WROGOWIE = {
  ghul: {
    nazwa: 'ghul',
    zycie: [2, 3],         // losowo od-do
    szybkosc: [80, 105],
    promien: 13,
    skala: 1.25,
    zasiegAtaku: 72,
    zamach: 0.45,          // jak długo zapowiada atak
    skok: 0.22,
    obrazenia: 12,
    odpoczynek: 1.1,
    ciezki: false,
  },
  kolos: {
    nazwa: 'kolos',
    zycie: [8, 8],
    szybkosc: [42, 48],
    promien: 30,
    skala: 2.3,
    zasiegAtaku: 100,
    zamach: 0.95,
    skok: 0.25,
    obrazenia: 30,
    odpoczynek: 1.7,
    ciezki: true,          // miecz w nim grzęźnie (chyba że to wielki miecz albo mocny cios)
    strefa: 78,            // promień uderzenia w ziemię
  },
  // Wiedźma z bagien (Patryk, 25 XI 14:15, wybór z karty; obraz i filmy 14:45). Walczy z daleka: trzyma dystans,
  // zbiera klątwę na kosturze (zamach) i rzuca w bohatera fioletową kulę. Kulę można zablokować albo przeskoczyć unikiem.
  // Gdy bohater podejdzie, cofa się, ale wolno, więc warto do niej dobiec.
  wiedzma: {
    nazwa: 'wiedzma',
    zycie: [3, 4],
    szybkosc: [88, 104],   // 25 XI 15:09, Patryk: „musi się żywiej ruszać jak te nasze ghule” (było 52–62)
    promien: 14,
    skala: 1.3,
    zasiegAtaku: 380,      // z tej odległości zaczyna rzucać
    dystans: 220,          // bliżej tego cofa się; między rzutami krąży bokiem wokół bohatera
    zamach: 0.75,
    skok: 0.3,             // wyrzut kuli
    obrazenia: 13,
    odpoczynek: 1.2,
    ciezki: false,
    pocisk: { szybkosc: 250, promien: 11, zycie: 2.4 },
  },
  // Boss ostatniej nocy (Patryk, 25 XI: dwie fazy, „widzimy, kim możemy się stać”). Rycerz z kartek dziennika: czekał przy ogniu.
  // W połowie życia klątwa go bierze (przemiana, wtedy nietykalny), w drugiej fazie jest szybszy i bije pazurem.
  // Każdy atak ostrzega czerwonym kręgiem na ziemi, jak kolos: cel to punkt przed nim, strefa to promień trafienia.
  rycerz: {
    nazwa: 'rycerz',
    boss: true,
    zycie: [26, 26],      // razy 1,5 z ostatniej nocy: 39, przemiana przy 20 (25 XI 21:46, Patryk: „za prosty”; było 18)
    szybkosc: [58, 64],
    promien: 26,
    skala: 2.0,
    zasiegAtaku: 110,
    zamach: 0.9, skok: 0.4,
    obrazenia: 26,
    odpoczynek: 1.1,
    ciezki: true,
    strefa: 80,
    przemiana: { prog: 0.5, czas: 5.2, szybkosc: 1.4, odpoczynek: 0.65 },
    ataki: {
      1: [
        { nazwa: 'ciecie', zasieg: 105, cel: 55, strefa: 85, zamach: 0.75, skok: 0.55, odpoczynek: 1.4, obrazenia: 1 },      // szerokie cięcie przed sobą
        { nazwa: 'uderzenie', zasieg: 120, cel: 80, strefa: 70, zamach: 1.1, skok: 0.3, odpoczynek: 1.6, obrazenia: 1.35 },  // miecz w ziemię
      ],
      2: [
        { nazwa: 'pazur', zasieg: 165, cel: 110, strefa: 62, zamach: 0.5, skok: 0.45, odpoczynek: 1.0, obrazenia: 0.9 },     // długie pchnięcie pazurem
        { nazwa: 'wbicie', zasieg: 125, cel: 65, strefa: 105, zamach: 1.2, skok: 0.45, odpoczynek: 1.3, obrazenia: 1.3 },   // płonący pazur w ziemię (film Veo 4 s, 26 XI: sama łapa, miecz nieruchomy)
        { nazwa: 'miecz', zasieg: 135, cel: 70, strefa: 125, zamach: 1.5, skok: 0.45, odpoczynek: 1.6, obrazenia: 1.5 },   // ogień z łapy na ostrze, cios z góry i przyklęk (dawne wbicie; Patryk, 26 XI: „żeby z miecza uderzył”)
        { nazwa: 'doskok', zasieg: 330, cel: 0, strefa: 85, zamach: 0.75, skok: 0.7, odpoczynek: 1.5, obrazenia: 1.4, leci: true, trafW: 0.85 },   // skok z daleka tam, gdzie stoi bohater; ląduje pazurem
      ],
    },
  },
};

// Etapy nocy: wrogów przybywa stopniowo (Patryk, 23 XI).
// z: z których mgieł wychodzą, co: odstęp między kolejnymi w sekundach.
// Patryk, 24 XI 18:06: „z początku fali przeciętne, ale z każdą nową falą jest ich więcej i są bardziej agresywne”.
// zlosc: mnożnik szybkości i czasu odpoczynku po ataku (mniej odpoczynku to częstsze ataki).
// Do 24 XI etapy miały 1, 3, 16 i 1 + 8 potworów, wszystkie tak samo szybkie.
// 25 XI 13:12, Patryk: fale mocniejsze, potwory trudniejsze, od pierwszej fali więcej potworów.
// Było: 2, 5, 12, kolos + 14 ghuli; złość tylko szybkość i odpoczynek. Teraz 5, 9, 16, dwa kolosy + 18 ghuli,
// a złość dokłada też życie (mnożnik, zaokrąglony) i siłę ciosu.
export const ETAPY = [
  {
    nazwa: 'Coś przy totemach',
    mysl: 'Totemy się budzą. Coś przy nich oddycha.',
    zlosc: { szybkosc: 1.05, odpoczynek: 0.95, zycie: 1, obrazenia: 1 },
    grupy: [{ typ: 'ghul', ile: 5, z: ['zachod', 'wschod'], co: 1.6 }],
  },
  {
    nazwa: 'Kilku',
    mysl: 'Więcej oczu. Trzymaj się ognia.',
    zlosc: { szybkosc: 1.12, odpoczynek: 0.8, zycie: 1.2, obrazenia: 1.15 },
    grupy: [{ typ: 'ghul', ile: 9, z: ['wschod', 'poludnie', 'zachod'], co: 0.9 }, { typ: 'wiedzma', ile: 1, z: ['poludnie'], co: 4 }],
  },
  {
    nazwa: 'Horda',
    mysl: 'Idą wszystkie naraz.',
    zlosc: { szybkosc: 1.2, odpoczynek: 0.66, zycie: 1.4, obrazenia: 1.3 },
    grupy: [{ typ: 'ghul', ile: 16, z: ['zachod', 'wschod', 'poludnie'], co: 0.25 }, { typ: 'wiedzma', ile: 2, z: ['zachod', 'wschod'], co: 5 }],
  },
  {
    // Ostatnia noc: rycerz z kartek czeka przy ogniu (25 XI wieczorem; wcześniej tu były dwa kolosy i 18 ghuli).
    // boss: wychodzi z drogi na południe od ogniska, nie z totemu, więc rozbite totemy go nie zatrzymają.
    nazwa: 'Rycerz',
    mysl: 'Przy drodze ktoś stoi. Nie oddycha jak człowiek.',
    zlosc: { szybkosc: 1.28, odpoczynek: 0.55, zycie: 1.5, obrazenia: 1.45 },
    grupy: [
      { typ: 'rycerz', ile: 1, z: ['boss'], co: 0, od: 4 },
      { typ: 'kolos', ile: 1, z: ['poludnie'], co: 0, od: 30 },
      { typ: 'ghul', ile: 10, z: ['zachod', 'wschod'], co: 1.4 },
      { typ: 'wiedzma', ile: 1, z: ['wschod'], co: 0, od: 18 },
    ],
  },
];

export const NOC = {
  przerwa: 9,              // sekundy ciszy przed etapem, gdy widać myśl bohatera (do 24 XI 18:06 było 4; Patryk: „lekko mieć więcej czasu”)
  mroczek: 0.8,            // jak ciemna jest noc (0 to dzień)
  swit: 5,                 // jak długo wstaje świt po ostatnim etapie
  powrot: 2.6,             // ile trwa powrót przy ognisku po upadku
};

// ---------- Cele nocy (propozycje Claude'a, Patryk 24 XI 18:41: „każdy pomysł … można je spróbować dodać”) ----------
// Totemy: można je rozbić mieczem albo klątwą. Rozbity totem ucisza swoją stronę: potwory z niej już nie przychodzą
// (do końca nocy). Południe ma dwa totemy, więc cichnie dopiero po obu.
export const TOTEM = { zycie: 24, zaKlatwe: 6 };

// Łup: z potwora czasem wypada mikstura (z kolosa zawsze). Mikstura leczy od razu; Q albo przycisk na telefonie.
export const LUP = { szansaGhul: 0.12, szansaKolos: 1, leczy: 40, max: 3, start: 1, zasiegPodniesienia: 34, znika: 25 };

// Ognisko gaśnie: pełne starcza na czas sekund, światło kurczy się do minimum. Drewno bierze się ze stosu pod ścianą
// chaty (E) i dorzuca przy ognisku (E). Jedno polano dokłada polano.
export const OGIEN = { czas: 140, minimum: 0.15, polano: 0.55, przygasa: 0.3 };

// Ulepszenia: po każdej fali (poza ostatnią) wybór jednego z trzech. Działają do końca nocy.
export const ULEPSZENIA = [
  { id: 'zasieg', nazwa: 'Dłuższe ostrze', opis: 'Miecz sięga o jedną ósmą dalej.' },
  { id: 'szybkosc', nazwa: 'Szybsza ręka', opis: 'Zamach i powrót miecza są o 15% krótsze.' },
  { id: 'garda', nazwa: 'Twarda garda', opis: 'Blok zużywa o 30% mniej sił.' },
  { id: 'oddech', nazwa: 'Drugi oddech', opis: 'Siły wracają o 35% szybciej.' },
  { id: 'klatwa', nazwa: 'Głodna klątwa', opis: 'Pasek klątwy napełnia się o połowę szybciej.' },
  { id: 'mikstura', nazwa: 'Zapas na noc', opis: 'Pełne życie teraz i jedna mikstura więcej.' },
  { id: 'cialo', nazwa: 'Twarda skóra', opis: 'Rany od potworów są o 20% lżejsze.' },
];

// Kartki z dziennika rycerza (25 XI, historia Patryka): przeklęty najemnik szuka w przeklętym domku sposobu
// na własną klątwę. Przed nim był tu rycerz, który jej uległ (boss ostatniej nocy). Jedna kartka na każdą falę;
// leży na polanie od początku fali, aż ją podniesiesz. Gra stoi, póki czytasz.
export const KARTKI = [
  // pierwsza leży w chacie: bohater przeszukuje ją, bo w wiosce słyszał, że tu można zdjąć klątwę (Patryk, 25 XI 20:35)
  { gdzie: { izba: true, x: 1700, y: 975 }, tekst: 'Dotarłem. W wiosce mówili, że w tej chacie klątwa schodzi z człowieka. Chata stoi pusta, ale w palenisku jeszcze żar, a na posłaniu odcisk czyjegoś ciała. Ktokolwiek tu mieszkał, wyszedł w pośpiechu. Zostanę na noc i poszukam, jak on to zrobił.' },
  { gdzie: { dx: 290, dy: -40 }, tekst: 'Wychodzą z mgły, kiedy ogień przygasa. Za dnia przeszukuję chatę: zioła, znaki, cokolwiek. Znalazłem tylko imiona wyryte w belce nad drzwiami. Pięć imion, każde inną ręką. Ostatnie jest świeże.' },
  { gdzie: { dx: 130, dy: 250 }, tekst: 'Klątwa daje siłę, kiedy jej się poddaję. Wczoraj rozbiłem nią trzy bestie naraz i przez chwilę nie czułem bólu. Nie czułem też dłoni. Wiedźma z bagien się śmiała: ta chata nie zdejmuje klątwy, tylko szuka następcy.' },
  { gdzie: { dx: -320, dy: -10 }, tekst: 'Jeśli to czytasz, jesteś tu, bo ja przestałem być sobą. Nie sięgaj po klątwę, choćby było ciężko. Każde uderzenie nią to krok bliżej mnie. Będę czekał przy ogniu ostatniej nocy. Wybacz, jeśli cię nie poznam.' },
];
export const KARTKA = { zasieg: 42 };

// Klątwa ma cenę (25 XI): każde jej użycie przybliża bohatera do przemiany. Widać to po żarze na nim,
// a o świcie decyduje o zakończeniu (przemiana od progu w górę: żar już nie gaśnie).
export const PRZEMIANA = { zaKlatwe: 0.15, prog: 0.5 };
