// Dane gry. Tu zmieniamy liczby bez dotykania silnika (decyzja 002, punkt 5).
// Czas jest w sekundach, odległości w jednostkach świata (bohater ma około 80 jednostek wzrostu).

export const BOHATER = {
  zycie: 100,
  sila: 100,               // wytrzymałość: ciosy, bloki i uniki ją zużywają
  szybkosc: 165,
  promien: 14,
  odnowaSily: 34,          // ile wytrzymałości wraca na sekundę
  opoznienieOdnowy: 0.6,   // po ilu sekundach od wysiłku zaczyna wracać

  unik: { koszt: 24, czas: 0.4, dystans: 150, nietykalny: 0.3 },   // 24 XI: przewrót z filmu, więc trochę dłuższy niż dawny odskok (0,32 s)
  // 24 XI 15:17, Patryk: blok „bardziej efektywniejszy”. Było: koszt 14 (ciężki ×3), parowanie 0,18 s, spowolnienie 0,45, kąt 1,35 rad,
  // odrzut 160, ciężki cios przez blok 50% ran, odnowa siły w bloku 30%. Teraz blok obraca się sam do atakującego (bez myszki),
  // a zablokowany ghul odskakuje i musi się zebrać (odpoczynek), więc blok daje okazję do cięcia.
  blok: { kosztNaCios: 9, mnoznikCiezki: 2.2, oknoParowania: 0.25, spowolnienie: 0.55, kat: 1.75, odrzut: 240, ranaCiezka: 0.3, odnowa: 0.5, obrot: 9, zasiegObrotu: 260 },

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

// Broń: waga to gust (Patryk, 23 XI), więc są trzy miecze do wyboru w menu gry.
// zamach: ile trwa wzięcie miecza do ciosu; ciecie: jak szybko ostrze przechodzi łuk; powrot: ile trwa,
// zanim miecz znów jest gotowy. luk: połowa szerokości cięcia (w radianach), krok: ile bohater idzie za ciosem.
// ruch: jak szybko bohater chodzi w trakcie ciosu (część zwykłej szybkości). przerywa: czy cios przerywa zamach ghula.
// przecinaCiezkich: czy przechodzi przez kolosa zamiast w nim grzęznąć. ladowanie: ile trzymać, żeby cios był mocny.
export const BRONIE = {
  miecz: {
    nazwa: 'Miecz', opis: 'Lekki i szybki. Dużo cięć, małe rany, nie przerywa ataku ghula.',
    dlugosc: 58, szerokosc: 3,
    zamach: 0.09, ciecie: 0.11, powrot: 0.16, zasieg: 92, luk: 0.95,
    obrazenia: 1, odrzut: 160, koszt: 8, krok: 30, ruch: 0.5,
    przerywa: false, przecinaCiezkich: false, ladowanie: 0.45,
  },
  poltorareczny: {
    nazwa: 'Półtoraręczny', opis: 'Złoty środek. Ghul pada od jednego albo dwóch cięć, a w kolosie miecz grzęźnie.',
    dlugosc: 72, szerokosc: 3.8,
    zamach: 0.17, ciecie: 0.13, powrot: 0.26, zasieg: 110, luk: 1.05,
    obrazenia: 2, odrzut: 260, koszt: 13, krok: 50, ruch: 0.35,
    przerywa: false, przecinaCiezkich: false, ladowanie: 0.6,
  },
  wielki: {
    nazwa: 'Wielki miecz', opis: 'Ciężki i wolny. Ghula zabija jedno cięcie, a miecz przechodzi nawet przez kolosa.',
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
};

// Etapy nocy: wrogów przybywa stopniowo (Patryk, 23 XI).
// z: z których mgieł wychodzą, co: odstęp między kolejnymi w sekundach.
// Patryk, 24 XI 18:06: „z początku fali przeciętne, ale z każdą nową falą jest ich więcej i są bardziej agresywne”.
// zlosc: mnożnik szybkości i czasu odpoczynku po ataku (mniej odpoczynku to częstsze ataki).
// Do 24 XI etapy miały 1, 3, 16 i 1 + 8 potworów, wszystkie tak samo szybkie.
export const ETAPY = [
  {
    nazwa: 'Coś w mgle',
    mysl: 'Mgła gęstnieje. Coś w niej oddycha.',
    zlosc: { szybkosc: 1, odpoczynek: 1 },
    grupy: [{ typ: 'ghul', ile: 2, z: ['zachod'], co: 2.5 }],
  },
  {
    nazwa: 'Kilku',
    mysl: 'Więcej oczu. Trzymaj się ognia.',
    zlosc: { szybkosc: 1.08, odpoczynek: 0.85 },
    grupy: [{ typ: 'ghul', ile: 5, z: ['wschod', 'poludnie'], co: 1.2 }],
  },
  {
    nazwa: 'Horda',
    mysl: 'Idą wszystkie naraz.',
    zlosc: { szybkosc: 1.15, odpoczynek: 0.72 },
    grupy: [{ typ: 'ghul', ile: 12, z: ['zachod', 'wschod', 'poludnie'], co: 0.3 }],
  },
  {
    nazwa: 'Kolos',
    mysl: 'Ziemia drży. To coś dużego.',
    zlosc: { szybkosc: 1.22, odpoczynek: 0.62 },
    grupy: [
      { typ: 'kolos', ile: 1, z: ['poludnie'], co: 0 },
      { typ: 'ghul', ile: 14, z: ['zachod', 'wschod'], co: 0.6 },
    ],
  },
];

export const NOC = {
  przerwa: 9,              // sekundy ciszy przed etapem, gdy widać myśl bohatera (do 24 XI 18:06 było 4; Patryk: „lekko mieć więcej czasu”)
  mroczek: 0.8,            // jak ciemna jest noc (0 to dzień)
  swit: 5,                 // jak długo wstaje świt po ostatnim etapie
  powrot: 2.6,             // ile trwa powrót przy ognisku po upadku
};
