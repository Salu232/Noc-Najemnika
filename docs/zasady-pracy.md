# Zasady pracy

## Jak wygląda jedna zmiana

1. Claude robi zmianę na osobnej gałęzi i sprawdza ją: testy oraz własna gra na rozmiarze ekranu telefonu.
2. Claude otwiera pull request. Opis ma zawsze cztery części:
   - **Co zmieniłem:** po ludzku, bez żargonu.
   - **Dlaczego tak:** jakie były inne możliwości i czemu wybrałem tę. To część do nauki.
   - **Jak to sprawdzić:** co kliknąć albo w co zagrać, krok po kroku.
   - **Czego jeszcze nie ma:** uczciwie.
3. Patryk sprawdza i akceptuje (scala) albo pisze, co poprawić.
4. Po scaleniu zmiana sama trafia do gry pod stałym adresem.

Jedna zmiana naraz. Następna zaczyna się, gdy poprzednia jest scalona albo odrzucona.

## Słowniczek

- **Repozytorium (repo):** folder projektu z całą historią zmian.
- **Gałąź:** osobna kopia robocza, na której powstaje zmiana i nie psuje głównej wersji.
- **Commit:** jeden zapisany krok pracy z opisem.
- **Pull request (PR):** prośba o włączenie gałęzi do głównej wersji. Tu Patryk ogląda zmianę i ją akceptuje.
- **Scalenie (merge):** włączenie zaakceptowanej zmiany do głównej wersji.
- **Main:** główna gałąź, czyli wersja, w którą się gra.

## Pomysły

Każdy pomysł, nawet luźny, trafia do [pomysly/POMYSLY.md](../pomysly/POMYSLY.md) z datą i autorem. Nic nie ginie, ale nie wszystko robimy od razu. Pomysł przechodzi do budowy, gdy wzmacnia któryś z [filarów](wizja.md) i pasuje do bieżącego etapu.

## Decyzje

Każda ważniejsza decyzja ma krótki plik w [decyzje/](../decyzje/): pytanie, wybór, dlaczego i jak to cofnąć. Dzięki temu po miesiącu wiadomo, czemu coś jest tak, a nie inaczej.

## Testy

- Testy automatyczne grają tak jak człowiek: dotykają ekranu, przeciągają palcem, czytają dialog.
- Przed każdym wydaniem Claude gra sam w rozmiarze ekranu telefonu i opisuje, co widział.
- Na koniec etapu gra ktoś spoza projektu. Jego słowa zapisujemy w [pomysly/POMYSLY.md](../pomysly/POMYSLY.md), w części „Feedback”.

## Oryginalność

Nie kopiujemy cudzych postaci, imion, symboli, grafik, muzyki ani fabuły. Klimat może być inspirowany, ale wszystko w grze tworzymy sami.
