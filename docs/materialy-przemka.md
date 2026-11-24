# Materiały od Przemka (24 XI wieczorem): co bierzemy do gry

Patryk, 24 XI, 17:22: *„przemek na przesłał parę ciekawego materiału do wkorzystania, chciałbym zebyś przepatrzyszł je pod kazdym mozliwym kątem i wybrać co tych grafik mogłoby się nam przydać do gry (…) musimy się skupić się zeby nie przepalać całego 5h limitu, zrobić to jakoś z głową”*.

Przejrzał Claude, 24 XI wieczorem, na małych podglądach (obrazy w całości, z filmów co 24. klatkę). Nic jeszcze nie weszło do gry. Ten plik to wybór i kolejność.

**Gdzie leżą:** 16 arkuszy z wiadomości Patryka i 4 arkusze z plików projektu skopiowane pod czytelnymi nazwami do `noc-najemnika-v2/materialy-przemka/` w plikach projektu. Filmy (ognisko, latarnia, pochodnia, koksownik, totemy, bieg rycerza) są w korzeniu plików projektu, pod nazwami od Przemka.

## Co pasuje od razu, a co nie

Wszystko jest w tym samym stylu co chata i bohater (tusz, przygaszone kolory), na białym tle, czyli tak jak filmy, które już umiemy wycinać (`narzedzia/wytnij-z-filmow.py`). Widok jest lekko z góry, jak w grze. Rysunki są w świetle dnia, a noc dokłada gra, tak jak dla chaty.

Trzy zastrzeżenia:
1. **Karty ulepszeń** mają wpisany angielski tekst, a w jednym błąd (*„BLOOD LEACH”* zamiast *leech*). Do gry tylko jako wzór, a karty do wygenerowania na nowo bez napisów (napis dokłada gra, po polsku).
2. **Kafle przejść trawa/ziemia** są zrobione pod siatkę kafli, a nasza ziemia nie jest z kafli, tylko z jednego tła i plam. Zieleń jest też żywsza niż nasza polana. Odkładamy.
3. **Bieg rycerza w hełmie** (`Mercenary_running_with_drawn_sword…`) to nie nasz bohater, tylko inna postać, i ma szare tło zamiast białego. Nadaje się na przyszłego wroga, nie na bohatera.

Pliki w korzeniu plików projektu ze scenami i renderami (`scena2…`, `RENDER…`, `PRZEKAZANIE_PROJEKTU.md` itd.) należą do innej pracy i ich nie oceniałem.

## Wybór, od największego zysku przy najmniejszej pracy

| # | Co | Z którego arkusza | Do czego w grze | Praca |
|---|---|---|---|---|
| 1 | **Ognisko z filmu** (płomień i dym w pętli) | film `Campfire_flickering…` | zamiast ogniska rysowanego kodem na środku polany; to pierwsza rzecz, którą widać | mała: wycięcie pętli jak bieg, płomień zostaje przy zdejmowaniu bieli, dym robi gra |
| 2 | **Drzewa**: dwa świerki, dwa martwe drzewa, pień, kłoda, uschnięty świerk, sosna jak bonsai, drzewo z mchem, dwa krzaki | `drzewa-1`, `drzewa-2-swierki` | zamiast sosen rysowanych kodem na brzegu lasu; kłoda i pień jako przeszkody na polanie | średnia: wycięcie z arkusza, stopy drzew, sylwetka za drzewem jak przy chacie |
| 3 | **Kępy trawy, mchu i ziemi**, plamy błota i liści | `trawa-mech`, `kepy-trawy-ziemi`, `plamy-krew-bloto-liscie` | rozsypane po polanie, bez zderzeń; polana przestaje być płaska | mała |
| 4 | **Krew, kałuże, ślady pazurów** | `krew-kaluze-pazury`, `plamy-krew-bloto-liscie` | zamiast kropek krwi: plamy po trafieniu, kałuże pod trupami, ślady pazurów po ranie bohatera | mała |
| 5 | **Iskry i rozbryzgi trafienia** (dolne dwa rzędy) | `ciecia-krew-iskry` | pomarańczowe iskry przy bloku i parowaniu, rozbryzg krwi przy trafieniu; czerwone łuki cięć tylko jako próba obok obecnego sierpa | mała |
| 6 | **Kręgi z kolcami i strzałki** | `kregi-strzalki` | krąg z kolcami jako ostrzeżenie przed uderzeniem kolosa (jego strefa); mniejszy krąg pod celem; strzałka kierunku uniku na telefonie | mała |
| 7 | **Ikony umiejętności**: miecz, przeklęta ręka, but, mikstura | `interfejs-pasek-ikony` | na przyciski telefonu: Tnij, Klątwa, Unik (i mikstura na później) | mała |
| 8 | **Pasek z okrągłym portretem** | `interfejs-pasek-ikony` | rama dla portretu bohatera i pasków życia, siły i klątwy | średnia (paski muszą się wpasować w ramę) |
| 9 | **Rekwizyty obozu**: płot, stos drewna, beczki, pochodnia na ścianie; latarnia na słupie i pochodnia z filmów | `rekwizyty-oboz`, `otoczenie-skaly-kosci`, filmy latarni i pochodni | obok chaty i na skraju polany; latarnia i pochodnia świecą (gra dokłada światło jak dla okna) | średnia |
| 10 | **Skały, kości, koło od wozu** | `otoczenie-skaly-kosci` | skały jako przeszkody, kości przy mgłach, z których wychodzą potwory | mała |
| 11 | **Panel z czaszkami** | `panel` | rama ekranu startu, pauzy i końca nocy | mała |

## Na później (fabuła i nowe potwory)

| Co | Arkusz | Pomysł |
|---|---|---|
| **Totemy i obeliski** (z filmem fioletowego dymu) | `totemy-obeliski`, film `Totem_magic…` | totem przy każdej mgle, z której wychodzą potwory; fiolet pasuje do klątwy. Może cel: zniszczyć totem, żeby mgła ucichła |
| **Ołtarz ze świecami, kamień ofiarny, niebieski koksownik** (z filmem) | `oltarz-koksownik`, film `Blue_fire…` | miejsca w rozdziale I (kult, klątwa bohatera) |
| **Krypta, sarkofagi, kolumny** | `ruiny-krypta` | ruiny w lesie, wejście do podziemi w dalszych rozdziałach |
| **Przedmioty**: mikstury, sakiewka, kieł, klucz, kość z runami, list, sztylet | `przedmioty` | łup z potworów i fabuła (list, klucz); mikstura do ikony z punktu 7 |
| **Karty ulepszeń** (tylko wzór) | `karty-ulepszen` | wybór jednego z trzech ulepszeń między nocami, napisy po polsku z gry |
| **Pełzacz** (opancerzona bestia) | `pelzacz` | nowy potwór: niski, szybki, z pancerzem na grzbiecie; cios od przodu odbija się od pancerza, trzeba z boku albo klątwą |
| **Tarczownik** (rycerz z tarczą i buzdyganem) i **rycerz w hełmie** z filmu biegu | `tarczownik`, film `Mercenary_running…` | ludzie, nie potwory: dezerterzy albo kultyści; tarcza blokuje cięcia od przodu, trzeba unikiem za plecy |

Nowe potwory potrzebują filmów (chód, atak, trafienie, śmierć). Robimy to tą samą metodą co bohater: obraz z arkusza jako pierwsza (i przy pętli ostatnia) klatka we Flow, bokiem, w prawo, na białym tle ([docs/grafika.md](grafika.md), punkt 13).

## Jak to zrobić z głową (żeby nie przepalić limitu)

1. **Jedno narzędzie do wycinania z arkuszy** (`narzedzia/wytnij-z-arkuszy.py`): zdejmuje biel tak jak przy filmach, dzieli arkusz na osobne rysunki, każdemu nadaje nazwę i punkt podstawy (gdzie stoi na ziemi). Wszystkie rekwizyty idą do jednego obrazu, jak klatki bohatera. Robimy je raz, potem każdy arkusz to tylko kilka linijek z nazwami.
2. **Etap A, jedna sesja:** ognisko (1), drzewa (2), kępy i plamy (3), krew (4). To zmienia wygląd całej polany i nie rusza walki.
   **Zrobione 24 XI wieczorem** (Claude, na prośbę Patryka z 17:40). Narzędzie `narzedzia/wytnij-z-arkuszy.py` wycina 44 rysunki z sześciu arkuszy
   (kopie w `grafika/zrodla/przemek/`) i 18 klatek ogniska z filmu (`grafika/zrodla/film-ognisko.mp4`) do jednego obrazu
   `grafika/rekwizyty.webp` (2048 × 891, około 650 KB) i opisu `gra/rekwizyty.js`. Numery rysunków pokazuje `--podglad KATALOG`.
   - **Ognisko:** pętla z klatek 43–78 co druga, 12 na sekundę, krąg 80 jednostek; ostatnie cztery klatki przenikają się z klatkami sprzed 43,
     więc szwu nie widać. Druga kopia z dodawaniem światła, żeby płomień świecił w nocy. Dym z filmu odpada z tłem.
   - **Drzewa:** ten sam las (miejsca i zderzenia bez zmian), ale każde drzewo to rysunek z arkusza: świerki (60%), martwe, złamany pień,
     sosna, drzewo z mchem, pniak i kłoda; połowa odbita w lustrze. Rysunki rozjaśnione o jedną trzecią, bo w nocy ginęły.
   - **Ziemia:** 420 kęp i plam (`OZDOBY` w `gra/swiat.js`): w lesie mech, liście, krzaki; na polanie głównie trawa, rzadziej. Bez zderzeń,
     nie w chacie, na podwórku ani przy ognisku. Krzaki stoją jak drzewa (bohater może przejść za nimi).
   - **Krew:** kałuża pod trupem to kałuża z arkusza (70–95 jednostek), krople, które spadną, zostawiają rozbryzgi. Ślady pazurów są w obrazie, ale jeszcze nieużyte.
   - Bez obrazu rekwizytów gra rysuje wszystko kodem jak dotąd. Bot po zmianie: świt 5/5, rany 8,6 (w zwykłym rozrzucie 7–10,4).
3. **Etap B:** iskry i rozbryzgi (5), krąg kolosa i strzałki (6), ikony na przyciskach (7). To poprawia czytelność walki na telefonie.
   **Zrobione 24 XI po 18** (Claude, na prośbę Patryka). Do tego samego obrazu `grafika/rekwizyty.webp` doszło 11 rysunków z `ciecia-krew-iskry` i `kregi-strzalki`:
   - **Blok:** pomarańczowe iskry lecą od ostrza (nad ciemnością, świecą) i mała gwiazda iskier; **parowanie:** duży wybuch iskier.
   - **Trafienie:** rozbryzg krwi leci w stronę cięcia, przy mocnym ciosie dodatkowo wybuch krwi. Czerwone łuki cięć z arkusza nieużyte, został obecny sierp.
   - **Kolos:** pod miejscem uderzenia krąg z kolcami (pierwszy z arkusza) na czerwonej strefie; pod koniec zamachu miga.
   - **Telefon:** przyciski Tnij, Unik i Klątwa mają ikony (miecz, but, przeklęta ręka) jako `grafika/ikona-*.webp`; Blok został z napisem, bo w arkuszu nie ma ikony tarczy. Mikstura czeka.
   - Strzałki kierunku uniku jeszcze nieużyte.
4. **Etap C:** rama paska (8), rekwizyty i światła (9, 10), panel (11).
5. **Później:** totemy, potwory i fabuła, kiedy przyjdzie ich kolej w planie.

Po każdym etapie: zrzuty na komputerze i telefonie, liczba klatek na sekundę i bot, tak jak dotąd.
