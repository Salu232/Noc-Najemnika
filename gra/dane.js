// Dane gry. Tu zmieniamy liczby bez dotykania silnika (decyzja 002, punkt 5).
// Czas jest w sekundach, odległości w jednostkach świata (bohater ma około 80 jednostek wzrostu).

export const BOHATER = {
  zycie: 100,
  sila: 100,               // wytrzymałość: ciosy, bloki i uniki ją zużywają
  szybkosc: 165,
  promien: 14,
  odnowaSily: 34,          // ile wytrzymałości wraca na sekundę
  opoznienieOdnowy: 0.6,   // po ilu sekundach od wysiłku zaczyna wracać

  unik: { koszt: 24, czas: 0.32, dystans: 150, nietykalny: 0.24 },
  blok: { kosztNaCios: 14, oknoParowania: 0.18, spowolnienie: 0.45, kat: 1.35 },

  // Seria trzech ciosów: w prawo, w lewo i ciężki z góry.
  ciosy: {
    prawo: { koszt: 10, zamach: 0.07, czas: 0.26, zasieg: 98, luk: 1.25, obrazenia: 1, odrzut: 170, od: -1.35, do: 1.35 },
    lewo: { koszt: 10, zamach: 0.07, czas: 0.26, zasieg: 98, luk: 1.25, obrazenia: 1, odrzut: 170, od: 1.35, do: -1.35 },
    gora: { koszt: 18, zamach: 0.16, czas: 0.40, zasieg: 116, luk: 0.95, obrazenia: 2, odrzut: 430, od: -1.0, do: 1.0, ciezki: true },
  },
  seria: ['prawo', 'lewo', 'gora'],
  oknoSerii: 0.45,         // ile czasu po ciosie można dołożyć następny w serii

  // Pomysł „Krew za krew” (docs/walka.md, punkt 7.2)
  krewZaKrew: { czas: 3, zaTrafienie: 7 },

  // Pomysł „Miecz, który waży” (docs/walka.md, punkt 7.3)
  miecz: { grzeznie: 0.32, zatrzymanie: 0.05, zatrzymanieGrzeznie: 0.13 },
};

export const WROGOWIE = {
  ghul: {
    nazwa: 'ghul',
    zycie: [2, 3],         // losowo od-do (seria trzech ciosów zabija każdego)
    szybkosc: [80, 105],
    promien: 13,
    skala: 1.25,
    zasiegAtaku: 58,
    zamach: 0.45,          // jak długo zapowiada atak
    skok: 0.18,
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
    ciezki: true,          // miecz w nim grzęźnie
    strefa: 78,            // promień uderzenia w ziemię
  },
};

// Etapy nocy: wrogów przybywa stopniowo (Patryk, 23 XI).
// z: z których mgieł wychodzą, co: odstęp między kolejnymi w sekundach.
export const ETAPY = [
  {
    nazwa: 'Coś w mgle',
    mysl: 'Mgła gęstnieje. Coś w niej oddycha.',
    grupy: [{ typ: 'ghul', ile: 1, z: ['zachod'], co: 1 }],
  },
  {
    nazwa: 'Kilku',
    mysl: 'Więcej oczu. Trzymaj się ognia.',
    grupy: [{ typ: 'ghul', ile: 3, z: ['wschod', 'poludnie'], co: 1.2 }],
  },
  {
    nazwa: 'Horda',
    mysl: 'Idą wszystkie naraz.',
    grupy: [{ typ: 'ghul', ile: 16, z: ['zachod', 'wschod', 'poludnie'], co: 0.2 }],
  },
  {
    nazwa: 'Kolos',
    mysl: 'Ziemia drży. To coś dużego.',
    grupy: [
      { typ: 'kolos', ile: 1, z: ['poludnie'], co: 0 },
      { typ: 'ghul', ile: 8, z: ['zachod', 'wschod'], co: 0.7 },
    ],
  },
];

export const NOC = {
  przerwa: 4,              // sekundy ciszy przed etapem, gdy widać myśl bohatera
  mroczek: 0.8,            // jak ciemna jest noc (0 to dzień)
  swit: 5,                 // jak długo wstaje świt po ostatnim etapie
  powrot: 2.6,             // ile trwa powrót przy ognisku po upadku
};
