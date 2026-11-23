# Stan projektu

Aktualizowany przy każdej zmianie. Historia jest w gicie, tutaj tylko to, co obowiązuje teraz.

**Ostatnia zmiana:** 23 XI 2026 w nocy: bohater z Gemini w grze na próbę i pierwsze animacje walki (ciało idzie za mieczem, wrogowie padają, mocny cios przecina na pół). Fundamenty i gra czekają w pull requeście nr 1.

## Teraz

- Fundamenty repozytorium są gotowe: wizja, lekcje, projekt walki, dziennik pomysłów i zasady pracy.
- **Pierwsza grywalna walka, „Polana we mgle”:** noc przy chacie, potwory wychodzą z mgły w czterech etapach aż do świtu. Są cięcia w serii, blok, parowanie, unik, „Krew za krew” i „Miecz, który waży”. Opis i wnioski są w [docs/walka.md](docs/walka.md), punkt 8, a kod w [gra/](gra/README.md). Wieczorem walka dostała nowy styl po uwagach Patryka (punkt 9): cios w fazach, rozpęd, mocny cios i wybór miecza. W nocy doszły animacje walki i bohater z arkusza Gemini (punkt 10).
- Pierwsza wersja gry jest w [archiwum/v1/](archiwum/v1/) razem z listą tego, co z niej bierzemy.
- Technologia: zwykły JavaScript, bez silnika, przyjęta przez Patryka ([decyzje/002-technologia.md](decyzje/002-technologia.md)). Od 23 XI rysuje PixiJS, bo zwykłe płótno było na telefonie za wolne; zmiana jest w jednym pliku.
- Walka: pierwsza wersja specjalizacji to prawa ręka i nogi, a łuk jest bronią dodatkową ([docs/walka.md](docs/walka.md)).
- Fabuła: założenia Patryka i propozycje Claude są w [fabula/zarys.md](fabula/zarys.md). Patryk pisze rozdział I.
- Grafika: plan pracy z Gemini i próbka stylu na karczmie ([docs/grafika.md](docs/grafika.md)). W grze są już dwa obrazy z Gemini: chata i bohater w sześciu pozach walki (punkt 7).

## Dalej, w tej kolejności

1. Test 100 wrogów na telefonie średniej klasy, czyli bramka techniczna z [docs/walka.md](docs/walka.md), punkt 2. Pierwszy wynik (23 XI, telefon Patryka w aplikacji Claude): 17–30 klatek na sekundę, czyli za wolno. Lżejsze efekty liczyły się jednak w 6 ms, więc czas ginął poza naszym kodem. Powtórka bez oszczędzania baterii: pusta scena bez wrogów ma tylko 21 klatek na sekundę, a wklejanie gotowych obrazków jest wolniejsze niż rysowanie od zera. To wygląda na rysowanie procesorem zamiast karty graficznej. Próba ma teraz też wersję przez kartę graficzną (PixiJS); czeka na przebieg w przeglądarce Chrome. „Polana we mgle” pokazuje w rogu liczbę klatek i to, czy rysuje karta graficzna, więc odpowiedź przyjdzie też przy zwykłym graniu.
2. Szkielet gry: bohater chodzi, tnie i blokuje na telefonie i komputerze. **Zrobione w „Polanie we mgle” (23 XI)**; brakuje stałego adresu na GitHub Pages, który włączymy po scaleniu pull requesta nr 1.
3. Rdzeń walki z wersji 1, przeniesiony i poprawiony: cięcia kierunkowe, blok, unik i hordy, a do tego umiejętności, które wracają stopniowo.
4. Specjalizacje ciała w pierwszej wersji: prawa ręka i nogi, po 2 ścieżki.
5. Rozdział I według fabuły Patryka, od przebudzenia w lesie.

Równolegle: próbka stylu na karczmie, a po niej decyzja 003 o stylu grafiki.

## Czeka na Patryka

- Zagranie w „Polanę we mgle” z bohaterem z Gemini i odpowiedź, czego w walce jeszcze brakuje.
- Brakujące klatki bohatera z Gemini: chód, blok, unik, rana (polecenia w [docs/grafika.md](docs/grafika.md), punkt 8).
- Przejrzenie i scalenie pull requesta nr 1 z fundamentami i grą.
- Obrazy z Gemini według poleceń z [docs/grafika.md](docs/grafika.md).
- Fabuła: kto zdradził i dlaczego, oraz pozostałe pytania z końca [fabula/zarys.md](fabula/zarys.md).
