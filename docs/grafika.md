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
| Postacie w ruchu | słabo, bo każda klatka wychodzi trochę inna | na razie rysuje je kod |

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

## Jak ocenimy próbkę

1. **Klimat** (decyduje Patryk): czy to wygląda jak nasza gra?
2. **Spójność** (sprawdza Claude): czy obrazy z różnych poleceń wyglądają jak z jednej gry?
3. **Użyteczność** (sprawdza Claude): czy widok z góry pasuje do mapy i czy obraz jest czytelny na ekranie telefonu?

Po próbce wybieramy jedną z dwóch dróg i zapisujemy ją jako decyzję 003:

- **Droga A:** obrazy z Gemini idą prosto do gry (budynki, tła, portrety), a kod rysuje postacie w ruchu.
- **Droga B:** obrazy z Gemini są wzorem, a grafikę na mapie rysuje kod w tym samym stylu. Portrety i ilustracje zostają z Gemini.
