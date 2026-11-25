# Stan projektu

Aktualizowany przy każdej zmianie. Historia jest w gicie, tutaj tylko to, co obowiązuje teraz.

**Ostatnia zmiana:** 25 XI 2026 przed południem: z dwuręcznym w bloku widać kroki w tył (film Patryka z Flow); drzewo zasłaniające bohatera przygasa, zamiast robić z niego ducha. Wcześniej 24 XI wpół do 20: wyciąganie i chowanie miecza tylko na stojąco, w biegu od razu. Wcześniej po 19: w bloku bohater drobi krótkie kroki zamiast sunąć, a cios w ostrze go cofa. Wcześniej po 19: z dwuręcznym bohater ma własne cięcie, gardę, bieg i blok (filmy Patryka z Flow), wybór ulepszeń w ramie z czaszkami. Wcześniej przed 19: totemy da się rozbić (strona cichnie), mikstury z łupu (Q), ognisko gaśnie i trzeba dorzucać drewna ze stosu pod chatą, wybór ulepszenia po każdej fali; dwie bronie (miecz i dwuręczny). Wcześniej wpół do 19: paski w ramie z czaszkami z portretem, totemy z filmu zamiast mgieł (potwory wychodzą spod nich). Wcześniej po 18: dłuższe przerwy między falami (9 s), z każdą falą więcej potworów i bardziej agresywne; etap B grafik Przemka (iskry przy bloku, rozbryzgi krwi, krąg z kolcami pod kolosem, ikony przycisków na telefonie). Wcześniej wieczorem: etap A grafik Przemka (ognisko z filmu, drzewa z arkuszy, kępy trawy, mchu i liści na ziemi, krew i kałuże z arkuszy; docs/materialy-przemka.md). Wcześniej po 15: blok z filmu (unosi, trzyma, drga przy ciosie) i skuteczniejszy (tańszy, szerszy, sam się obraca do wroga). W walce bohater biega z mieczem w dłoni, poza walką stoi prosto. Przed 15: drzwi zamyka się też z izby, jaśniej wokół bohatera, gęstszy koziołek w górę. Wcześniej po 14: przewrót w górę i w dół z filmów Patryka, drzwi chaty otwiera się E (z animacją i skrzypieniem), nowa mgła, polecenie do Flow w dwóch krokach. Wcześniej po południu: chata jak w Tibii (wchodzi się drzwiami, dach znika, w środku posłanie), wyciąganie i chowanie miecza z filmu, chód w dół przodem. Wcześniej w południe: chata ma izbę z obrazu Gemini (chodzenie, sen na posłaniu, wyjście drzwiami), a bohater obok chaty nie robi się już przezroczysty. Wcześniej rano: drzwi i odpoczynek w ciszy, cięcie jak mieczem (sierp i ostrze), garda w walce, plan chaty. W nocy: ghul i kolos z filmów Przemka, a bohater dostał bieg, chód plecami, przewrót przy uniku i upadek. Wcześniej tej nocy klątwa pod R i bohater z filmów. Fundamenty i gra czekają w pull requeście nr 1.

## Teraz

- Fundamenty repozytorium są gotowe: wizja, lekcje, projekt walki, dziennik pomysłów i zasady pracy.
- **Pierwsza grywalna walka, „Polana we mgle”:** noc przy chacie, potwory wychodzą z mgły w czterech etapach aż do świtu. Są cięcia w serii, blok, parowanie, unik, „Krew za krew” i „Miecz, który waży”. Opis i wnioski są w [docs/walka.md](docs/walka.md), punkt 8, a kod w [gra/](gra/README.md). Wieczorem walka dostała nowy styl po uwagach Patryka (punkt 9): cios w fazach, rozpęd, mocny cios i wybór miecza. W nocy doszły animacje walki (punkt 10), a 24 XI bohater z filmów Przemka ([docs/grafika.md](docs/grafika.md), punkt 9), klątwa pod R (punkt 11) oraz potwory z filmów, bieg i przewrót (punkt 12, grafika: punkt 11).
- Pierwsza wersja gry jest w [archiwum/v1/](archiwum/v1/) razem z listą tego, co z niej bierzemy.
- Technologia: zwykły JavaScript, bez silnika, przyjęta przez Patryka ([decyzje/002-technologia.md](decyzje/002-technologia.md)). Od 23 XI rysuje PixiJS, bo zwykłe płótno było na telefonie za wolne; zmiana jest w jednym pliku.
- Walka: pierwsza wersja specjalizacji to prawa ręka i nogi, a łuk jest bronią dodatkową ([docs/walka.md](docs/walka.md)).
- Fabuła: założenia Patryka i propozycje Claude są w [fabula/zarys.md](fabula/zarys.md). Patryk pisze rozdział I.
- Grafika: plan pracy z Gemini i próbka stylu na karczmie ([docs/grafika.md](docs/grafika.md)). W grze są obrazy z Gemini: chata, a od Przemka bohater z filmów, jego twarz i las (punkt 9) oraz ghul i kolos (punkt 11).

## Dalej, w tej kolejności

1. Test 100 wrogów na telefonie średniej klasy, czyli bramka techniczna z [docs/walka.md](docs/walka.md), punkt 2. Pierwszy wynik (23 XI, telefon Patryka w aplikacji Claude): 17–30 klatek na sekundę, czyli za wolno. Lżejsze efekty liczyły się jednak w 6 ms, więc czas ginął poza naszym kodem. Powtórka bez oszczędzania baterii: pusta scena bez wrogów ma tylko 21 klatek na sekundę, a wklejanie gotowych obrazków jest wolniejsze niż rysowanie od zera. To wygląda na rysowanie procesorem zamiast karty graficznej. Próba ma teraz też wersję przez kartę graficzną (PixiJS); czeka na przebieg w przeglądarce Chrome. „Polana we mgle” pokazuje w rogu liczbę klatek i to, czy rysuje karta graficzna, więc odpowiedź przyjdzie też przy zwykłym graniu.
2. Szkielet gry: bohater chodzi, tnie i blokuje na telefonie i komputerze. **Zrobione w „Polanie we mgle” (23 XI)**; brakuje stałego adresu na GitHub Pages, który włączymy po scaleniu pull requesta nr 1.
3. Rdzeń walki z wersji 1, przeniesiony i poprawiony: cięcia kierunkowe, blok, unik i hordy, a do tego umiejętności, które wracają stopniowo.
4. Specjalizacje ciała w pierwszej wersji: prawa ręka i nogi, po 2 ścieżki.
5. Rozdział I według fabuły Patryka, od przebudzenia w lesie.

Równolegle: próbka stylu na karczmie, a po niej decyzja 003 o stylu grafiki.

Wieczorem 24 XI: przegląd paczki grafik od Przemka i wybór, co wejdzie do gry, w kolejności: [docs/materialy-przemka.md](docs/materialy-przemka.md).

Teraz (Patryk, 24 XI): **chata jako obiekt**, czyli naprawa błędów ze zdjęć, wejście do środka i odpoczynek. Plan i przyczyny błędów są w [docs/chata.md](docs/chata.md).

## Czeka na Patryka

- Zagranie w „Polanę we mgle” z bohaterem z Gemini i odpowiedź, czego w walce jeszcze brakuje.
- Jak się gra z potworami z filmów, biegiem i przewrotem oraz klątwą pod R; co dopieszczać.
- Rozmowa Przemka z Google Flow (Patryk ją przyśle); przejrzymy, co jeszcze da się wygenerować.
- Przejrzenie i scalenie pull requesta nr 1 z fundamentami i grą.
- Obrazy z Gemini według poleceń z [docs/grafika.md](docs/grafika.md).
- Fabuła: kto zdradził i dlaczego, oraz pozostałe pytania z końca [fabula/zarys.md](fabula/zarys.md).
