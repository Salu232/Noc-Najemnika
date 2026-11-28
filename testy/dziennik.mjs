// Dziennik zadań (28 XI): czy w każdej fazie mówi, co robić, i czy kierunki zgadzają się z mapą.
// Uruchomienie: node testy/dziennik.mjs [polana|bagno]
globalThis.MAPA_NOCY = process.argv[2] || 'polana';
const { nowaGra } = await import('../gra/walka.js');
const { dziennik, kierunek } = await import('../gra/dziennik.js');
const { MIEJSCA, OGNISKO, BAGNO } = await import('../gra/swiat.js');
const { ETAPY } = await import('../gra/dane.js');
let bledy = 0;
const sprawdz = (co, ok) => { console.log(`${ok ? 'OK ' : 'ŹLE'} ${co}`); if (!ok) bledy++; };

const b = { x: 1000, y: 1000 };
sprawdz('kierunek: w górę mapy to północ', kierunek(b, { x: 1000, y: 300 }).endsWith('na północ'));
sprawdz('kierunek: w prawo to wschód', kierunek(b, { x: 1700, y: 1000 }).endsWith('na wschód'));
sprawdz('kierunek: w dół i w lewo to południowy zachód', kierunek(b, { x: 600, y: 1400 }).endsWith('na południowy zachód'));
sprawdz('kierunek: tuż obok', kierunek(b, { x: 1050, y: 1030 }) === 'tuż obok');

const g = nowaGra();
let d = dziennik(g);
sprawdz(`zmierzch: zadanie na każde miejsce i kartkę (${d.zadania.length} z ${MIEJSCA.length + 1})`, d.zadania.length === MIEJSCA.length + 1);
sprawdz('zmierzch: totem czeka na końcu listy', d.zadania[d.zadania.length - 1].czeka === true);
sprawdz('zmierzch: każde zadanie ma miejsce i kierunek', d.zadania.every(z => z.gdzie && z.kierunek));
g.odkryte.push(MIEJSCA[0].id);
d = dziennik(g);
sprawdz('obejrzane miejsce znika z listy i trafia do „Za tobą”', !d.zadania.some(z => z.tekst.endsWith(MIEJSCA[0].nazwa)) && d.zrobione.length === 1);
for (const m of MIEJSCA) if (m.id !== 'totem' && !g.odkryte.includes(m.id)) g.odkryte.push(m.id);
g.kartki = 1;
d = dziennik(g);
sprawdz('po reszcie i kartce totem przestaje czekać', d.zadania.length === 1 && !d.zadania[0].czeka);

g.faza = 'przerwa'; g.etap = 1; g.fazaCzas = 6.3; g.ogien = 0.2; g.bohater.zycie = 30;
d = dziennik(g);
sprawdz(`cisza: tytuł nocy (${d.tytul})`, d.tytul === `Noc 2 z ${ETAPY.length}: ${ETAPY[1].nazwa}`);
sprawdz(`cisza: odliczanie (${d.cel})`, d.cel === 'Cisza przed falą: 7 s');
sprawdz('cisza: gasnący ogień', d.zadania.some(z => z.tekst === 'Dorzuć do ognia'));
sprawdz('cisza: ranny z miksturą', d.zadania.some(z => z.tekst === 'Wypij miksturę'));
sprawdz('cisza: handlarz po pierwszej fali', d.zadania.some(z => z.tekst === 'Pohandluj ze starcem'));
sprawdz('za tobą: odparta pierwsza noc', d.zrobione.some(t => t.startsWith('Noc 1 odparta')));

g.faza = 'walka'; g.kolejka = [{}, {}]; g.wrogowie = [{ stan: 'idzie', typ: {} }];
d = dziennik(g);
sprawdz(`walka: ile potworów zostało (${d.cel})`, d.cel === 'Przetrwaj falę: zostało 3 potwory');
sprawdz('walka: bez handlarza', !d.zadania.some(z => z.tekst === 'Pohandluj ze starcem'));

g.faza = 'swit'; g.wrogowie = []; g.kolejka = [];
if (BAGNO) { g.kleczy = { x: OGNISKO.x, y: OGNISKO.y }; d = dziennik(g); sprawdz('świt na bagnie: rozmowa z wiedźmą', d.zadania.some(z => z.tekst === 'Porozmawiaj z wiedźmą')); }
else { g.faza = 'wedrowka'; d = dziennik(g); sprawdz('ranek: droga na bagna ma kierunek', d.zadania.length === 1 && !!d.zadania[0].kierunek); }

console.log(bledy ? `\n${bledy} błędów` : '\nWszystko się zgadza.');
process.exit(bledy ? 1 : 0);
