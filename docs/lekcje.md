# Lekcje, których nie powtarzamy

Zebrane z dwóch źródeł: z pierwszej wersji tej gry i jej testów oraz z historii kilkudziesięciu projektów gier, które Jozz robił z agentami AI przez ostatnie miesiące. Jego notatki są prywatne, więc tutaj są tylko wnioski własnymi słowami, bez cytatów.

## Z pierwszej wersji Nocy Najemnika

| Co poszło źle | Skąd to wiemy | Co robimy inaczej |
| --- | --- | --- |
| Gra rosła wszerz: 4 rozdziały, sklep, kronika, wnętrza, wyspa, a podstawy nie dostały żadnej osobnej rundy | feedback Jozza po 20 minutach gry | jeden rozdział dopracowany do końca, zanim powstanie następny |
| Dialog zatrzymywał bohatera, a potwory dalej atakowały | Jozz, potwierdzone w kodzie | rozmowa zatrzymuje cały świat; w biegu są tylko krótkie dymki |
| Opowieść mówiła do gracza na 4 różne sposoby, bez wspólnych zasad | analiza kodu | dwa tryby: rozmowa i dymek, z jasnymi zasadami |
| Mapy były losowane, a drogi nie prowadziły wzroku | Jozz | każda mapa jest projektowana ręcznie |
| Hordy pojawiały się dopiero w połowie gry | Jozz i Przemek | dużo słabych wrogów od pierwszej minuty |
| Testy sprawdzały tylko, czy gra się nie wysypuje. Automat przeskakiwał dialogi i teleportował bohatera | przegląd własnych testów | testy grają jak człowiek, a ostatecznie sprawdza człowiek na telefonie |
| Cały kod był w jednym pliku z 2 700 liniami | historia pracy | kod podzielony na małe moduły z jasnymi nazwami |

## Z historii projektów Jozza

1. **Prosta, kompletna gra wygrywa z ambitną architekturą.** Najdłużej grał w prosty jednoplikowy prototyp RPG. Jego ambitniejsze, technicznie lepsze odrodzenie przegrało z nim jako gra. *U nas:* nowa wersja musi być grywalna od pierwszego tygodnia. Technologia ma służyć grze, a nie odwrotnie.
2. **Narzędzia rosły szybciej niż gra.** Wiele projektów utknęło na budowaniu aparatury, panelach i testach, zanim powstało coś przyjemnego do grania. *U nas:* po każdym większym kroku technicznym musi pojawić się coś, co gracz poczuje.
3. **Testy szły inną drogą niż człowiek.** Wiele razy wszystkie testy były zielone, a gra nie działała tak, jak grał właściciel. *U nas:* test steruje grą tak jak gracz, a przed każdym wydaniem gramy sami na telefonie.
4. **Rygor pomylony z jakością.** W jednym projekcie powstały setki testów do produktu, który nie działał. *U nas:* liczy się, czy gra jest dobra, a nie ile mamy testów.
5. **Restarty bez żniw.** Kilka projektów zaczynało od zera i gubiło to, co już było dobre. *U nas:* pierwsza wersja jest w archiwum, a [lista żniw](../archiwum/v1/ZNIWA.md) mówi, co z niej przenosimy.
6. **Dokumenty „aktualne” starzały się w kilka dni.** Każdy projekt miał kilka plików startowych, które sobie przeczyły. *U nas:* jeden [STAN.md](../STAN.md), aktualizowany przy każdej zmianie.
7. **Za dużo równoległych zmian.** Osiem niescalonych gałęzi naraz sprawiało, że nikt nie wiedział, co jest prawdą. *U nas:* jedna zmiana naraz, scalona albo odrzucona, zanim zacznie się następna.
8. **Właściciel jako tester niedoróbek.** Właściciel dostawał rzeczy, których nikt wcześniej porządnie nie sprawdził. *U nas:* zanim zmiana trafi do Patryka, jest przetestowana i opisana z instrukcją, co sprawdzić.
9. **Ciche ograniczenia.** Gra po cichu przycinała wartości ustawione przez człowieka i psuła mu eksperymenty. *U nas:* jeśli coś ma limit, gra mówi o tym wprost.
10. **Wydanie dla znajomych to prawdziwa bramka.** Najlepiej sprawdziły się rzeczy, w które grali znajomi. *U nas:* każdy etap kończy się grą kogoś spoza projektu.
11. **Opisy na wyrost.** Prototypy bywały opisywane jak gotowy produkt. *U nas:* opisujemy uczciwie, co działa, a czego jeszcze nie ma.
