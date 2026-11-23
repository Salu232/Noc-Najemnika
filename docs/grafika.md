# Grafika

Propozycja do dyskusji. Styl grafiki ustalimy na jednej próbce, karczmie, a wynik zapiszemy jako decyzję 003.

## Jaki klimat

Mroczne fantasy w nastroju, który lubimy w Berserku: brud, błoto, krew, ciężkie czernie i przygaszone kolory. Jedynym ciepłym światłem jest ogień. Ludzie są zmęczeni, budynki krzywe i stare, a las gęsty i wrogi.

W poleceniach dla Gemini nie wpisujemy nazw cudzych dzieł ani artystów. Powody:

1. **Oryginalność.** Taki dopisek każe modelowi naśladować konkretny, rozpoznawalny styl, a my chcemy własny.
2. **Kontrola.** Opis cech (tusz, kreskowanie, kolory) daje nam więcej wpływu na wynik niż samo nazwisko.
3. **Mniej odmów.** Narzędzia często odrzucają albo osłabiają polecenia z nazwiskami artystów.

## Co Gemini zrobi dobrze, a co słabo

| Rzecz | Jak pójdzie | Gdzie w grze |
| --- | --- | --- |
| Portrety postaci | dobrze | okno rozmowy |
| Ilustracje scen | dobrze | karty rozdziałów, odzyskane wspomnienia |
| Widoki miejsc | dobrze | wzór dla map, tło menu |
| Ikony przedmiotów i ścieżek ciała | dość dobrze, trzeba pilnować jednego stylu | ekwipunek, wybór ścieżki |
| Budynki widziane z góry | niepewnie, bo modele wolą widok z ukosa | mapa; to sprawdza próbka |
| Postacie w ruchu | słabo, bo każda klatka wychodzi trochę inna | 23 XI: arkusz sześciu póz bohatera wyszedł spójny i jest w grze na próbę (punkt 7) |

Wniosek: obrazy z Gemini dajemy tam, gdzie gracz się zatrzymuje i patrzy. W ruchu zostaje grafika rysowana kodem, ale w tych samych kolorach i z tym samym światłem.

## Jak pracujemy

1. Claude pisze polecenie po angielsku, bo modele obrazów najlepiej rozumieją angielski. Na końcu zawsze jest ten sam dopisek stylu.
2. Patryk wkleja polecenie do Gemini, generuje 2–3 wersje i wybiera najlepszą.
3. Patryk wrzuca obraz do wątku w pełnej rozdzielczości.
4. Claude ocenia, czy da się go użyć w grze, i wstawia go: przycina, dopasowuje kolory i zmniejsza do rozmiaru, który szybko ładuje się na telefonie.
5. Każdy przyjęty obraz trafia do folderu `grafika/` razem z poleceniem, z którego powstał, żeby dało się go powtórzyć albo poprawić.

Później Patryk może dodać klucz API Gemini w ustawieniach środowiska, w którym pracuje Claude. Wtedy Claude generuje obrazy sam. Klucza nigdy nie wklejamy do czatu ani do repozytorium. Generowanie przez API może być płatne osobno od subskrypcji, więc sprawdzimy cenę, zanim z niego skorzystamy. Sprawdzimy też, co warunki Google mówią o używaniu tych obrazów w grze.

## Stały dopisek stylu

Dodajemy go na końcu każdego polecenia:

> dark fantasy, grim medieval world, hand-inked illustration with heavy black shadows and rough crosshatching, muted desaturated palette of ash grey, mud brown and dried-blood red, warm firelight as the only warm color, gritty and weathered, no text, no watermark, no logo

## Próbka stylu: karczma

Pięć poleceń. Każde kończy się dopiskiem stylu. Karczma nawiązuje do „Pod Wronim Gniazdem” z wersji 1.

### 1. Karczma z zewnątrz, widok z ukosa

> A lonely roadside tavern on the edge of a dark forest at night, in pouring rain. Two-storey timber-framed building with a sagging shingle roof, a crooked stone chimney with smoke, small windows glowing with warm firelight. A wooden sign with a carved crow sitting on a nest, hanging on rusty chains. Muddy yard with puddles reflecting the light, a cart without a horse, stacked barrels, a dead tree. Seen from above at a three-quarter angle.

### 2. Karczma z góry, do mapy (test)

> Top-down view looking straight down at a medieval roadside tavern, as a 2D game map asset. Shingle roof with moss and holes, crooked stone chimney with smoke, small muddy yard with barrels and a cart, short shadow falling to the bottom right. Orthographic, no perspective, centered, isolated on a plain flat dark background.

### 3. Wnętrze karczmy

> Interior of a cramped medieval tavern at night. Low ceiling with smoke-blackened beams, a stone hearth with a roaring fire, rough wooden tables, tired mercenaries and frightened peasants drinking in silence. A single contract notice nailed to a board with a knife. Candles, smoke, wet cloaks drying by the fire. Seen from a corner of the room.

### 4. Karczmarz, portret do okna rozmowy

> Bust portrait of a medieval innkeeper: a heavy middle-aged man wiping his hands on a stained apron, an old burn scar on his forearm, tired suspicious eyes. Dark background lit by firelight from one side. He looks straight at the viewer.

### 5. Bohater, portret

Wygląd opisuje [fabula/zarys.md](../fabula/zarys.md), punkt „Wygląd” (23 XI).

> Bust portrait of a lone mercenary in his early thirties, tall and broad-shouldered, exhausted hollow eyes, short dark hair wet from rain, stubble, small old scars. A worn grey wolf pelt over his shoulders, patched dark leather, one scavenged steel pauldron, mail underneath, hood down. Thin black veins creep from his right hand up the forearm, partly under a dirty bandage. A rusty chain is wrapped around his right wrist. Dark forest background, cold moonlight.

### 6. Bohater w całej postaci, do gry (23 XI)

Ten sam kąt kamery co chata w widoku jak w Tibii, równe światło dnia i jednolite tło, tak jak ustaliliśmy z Gemini.

> Full-body character design of the same lone mercenary, standing, seen from above at the same three-quarter angle as a top-down 2D game. Tall, heavy, broad-shouldered, slightly hunched with exhaustion. Worn grey wolf pelt over the shoulders, patched dark leather, mismatched scavenged armor: one pauldron, a bracer, mail underneath. A long dark-iron bastard sword with a notched blade, held low in the right hand; a rusty chain is wrapped around the hilt and his right wrist. Black veins creep from his right hand up the forearm, partly under a dirty bandage. Even, dim daylight, no night, no glow. Plain flat magenta background (#FF00FF), no checkerboard, no shadow on the background.

Przy bohaterze unikamy znaków Gutsa: miecza wielkiego jak płyta, protezy ręki, ślepego oka, blizny w poprzek nosa i czarnej zbroi.

### 7. Bohater w ruchu walki: arkusz od Patryka (23 XI)

**Patryk (23 XI, 23:05):** *„główny bohater to jest jeszcze nie ten wygląd jest zbyt prosty, nie wyróżnia się niczym szczególnym (…) możemy dodać animacje do naszych walk, ale charakter postaci musimy jeszcze dopracować, co najlepsze mam do tego gemina”*. Uwaga dotyczyła bohatera rysowanego kodem. O 23:10 Patryk przysłał arkusz z Gemini: *„napisałem do niego zeby wygenerował nam grafike w ruchu walki”*. Dokładnego polecenia nie mamy, więc tego obrazu nie da się powtórzyć jednym poleceniem; kolejne robimy z nim jako wzorem (punkt 8).

Arkusz leży w [grafika/bohater-arkusz-gemini.jpg](../grafika/bohater-arkusz-gemini.jpg) (848 × 1264 px). Jest na nim sześć póz na różowym tle: stoi (przód), plecy, zamach, w połowie cięcia, uderzenie i wypad. Wygląd zgadza się z punktem 6: wilcze futro, połatana skóra, kolczuga, jeden naramiennik, bandaże, łańcuch na prawym nadgarstku i długi wyszczerbiony miecz.

**Jak trafił do gry (Claude, 23 XI).** Narzędzie [narzedzia/wytnij-bohatera.py](../narzedzia/wytnij-bohatera.py) zdejmuje różowe tło, usuwa półprzezroczyste smugi ruchu, wycina pozy bez podpisów i strzałek, zmniejsza je i składa w [grafika/bohater.webp](../grafika/bohater.webp) (40 KB). Miejsce stóp każdej pozy jest wpisane w narzędziu ręcznie. Gra wybiera pozę według fazy walki, a ruch dokłada kod: pochylenie, przysiad, odbicie w lewo i prawo, drżenie przy ładowaniu i powidoki przy uniku.

| Poza z arkusza | Kiedy w grze |
| --- | --- |
| stoi (przód) | spokój, chód, zachwianie, upadek |
| plecy | gdy patrzy w górę ekranu |
| zamach | zamach i ładowanie mocnego ciosu; też blok i odskok do tyłu, bo nie ma dla nich pozy |
| w połowie cięcia | pierwsza połowa cięcia |
| uderzenie | druga połowa cięcia i początek powrotu miecza |
| wypad | unik w bok albo do przodu |

**Czego brakuje i co jest nie tak:**

1. Nie ma chodu, bloku, uniku, rany ani upadku. Chód udaje teraz kołysanie stojącej pozy.
2. W pozie „w połowie cięcia” Gemini narysował dwa miecze naraz, w górze i przy ziemi. W ruchu trwa to ułamek sekundy, więc zostawiliśmy, ale kolejne polecenia mówią „exactly one sword”.
3. Stojąca poza patrzy w lewo, a pozy ataku w prawo. Gra je odbija, ale przy przejściu ze spoczynku do ataku postać się „przekręca”. Pomoże stojąca poza z boku (punkt 8).
4. Na arkuszu są podpisy i strzałki, choć dopisek stylu mówi „no text”. Wycina je narzędzie.
5. Bohater jest malowany, a potwory rysuje kod grubą kreską, więc wyglądają jak z dwóch gier. Następny krok to potwory z Gemini w tym samym stylu.

Przycisk „Bohater: z Gemini / rysowany kodem” na ekranie startu i w pauzie przełącza obie wersje, żeby dało się je porównać. Wybór zostaje w przeglądarce.

### 8. Brakujące klatki bohatera (polecenia do Gemini)

Przed każdym poleceniem dołącz w Gemini arkusz z punktu 7 jako obraz wzorcowy. Te polecenia nie mają stałego dopisku stylu, bo styl ma przyjść z obrazu wzorcowego; dopisek mógłby go zmienić.

**8a. Spoczynek z boku i chód**

> Using the attached character sheet as the reference, draw the same mercenary in exactly the same drawing style: same face, grey wolf-fur collar, patched brown leather, chainmail, one steel pauldron, bandaged forearms, a chain on the right wrist, and the long dark-iron sword with a notched blade. Draw 5 frames in one row, all facing right, seen from the same slightly elevated three-quarter angle as the attack poses in the reference: frame 1 standing still with the sword held low in the right hand, frames 2 to 5 a walk cycle. Same size in every frame, feet on one common baseline, wide gaps so the frames do not touch. Exactly one sword per frame. No motion lines, no trails, no sparks, no text, no labels, no arrows. Even, dim daylight. Plain flat magenta background (#FF00FF), no shadow on the background.

**8b. Obrona, unik i rana**

> Using the attached character sheet as the reference, draw the same mercenary in exactly the same drawing style and at the same scale. Draw 6 poses in two rows, all facing right, from the same slightly elevated three-quarter angle as the attack poses: 1. guard: sword held diagonally across the body to catch a blow; 2. hit by a blow: flinching backwards, head turned away; 3. dodge roll, start: crouching low and pushing off; 4. dodge roll, end: rising from the roll; 5. sword stuck in something heavy, pulling it with both hands; 6. falling to one knee, leaning on the sword. Feet on one baseline in each row, wide gaps between poses. Exactly one sword per pose. No motion lines, no trails, no sparks, no text, no labels, no arrows. Even, dim daylight. Plain flat magenta background (#FF00FF), no shadow on the background.

## Jak ocenimy próbkę

1. **Klimat** (decyduje Patryk): czy to wygląda jak nasza gra?
2. **Spójność** (sprawdza Claude): czy obrazy z różnych poleceń wyglądają jak z jednej gry?
3. **Użyteczność** (sprawdza Claude): czy widok z góry pasuje do mapy i czy obraz jest czytelny na ekranie telefonu?

Po próbce wybieramy jedną z dwóch dróg i zapisujemy ją jako decyzję 003:

- **Droga A:** obrazy z Gemini idą prosto do gry (budynki, tła, portrety), a kod rysuje postacie w ruchu.
- **Droga B:** obrazy z Gemini są wzorem, a grafikę na mapie rysuje kod w tym samym stylu. Portrety i ilustracje zostają z Gemini.
