# Stan projektu

Aktualizowany przy każdej zmianie. Historia jest w gicie, tutaj tylko to, co obowiązuje teraz.

**Ostatnia zmiana:** 24 XI 2026 w nocy: ghul i kolos z filmów Przemka, a bohater dostał bieg, chód plecami, przewrót przy uniku i upadek. Wcześniej tej nocy klątwa pod R i bohater z filmów. Fundamenty i gra czekają w pull requeście nr 1.

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

Po walce i materiałach Przemka (Patryk, 24 XI): **chata jako obiekt**, czyli wejście do środka, odpoczynek z regeneracją i naprawa błędów chaty ze zdjęć ([pomysly/POMYSLY.md](pomysly/POMYSLY.md), [docs/zrzuty/](docs/zrzuty/)).

## Czeka na Patryka

- Zagranie w „Polanę we mgle” z bohaterem z Gemini i odpowiedź, czego w walce jeszcze brakuje.
- Jak się gra z potworami z filmów, biegiem i przewrotem oraz klątwą pod R; co dopieszczać.
- Rozmowa Przemka z Google Flow (Patryk ją przyśle); przejrzymy, co jeszcze da się wygenerować.
- Przejrzenie i scalenie pull requesta nr 1 z fundamentami i grą.
- Obrazy z Gemini według poleceń z [docs/grafika.md](docs/grafika.md).
- Fabuła: kto zdradził i dlaczego, oraz pozostałe pytania z końca [fabula/zarys.md](fabula/zarys.md).
