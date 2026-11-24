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

**Od 24 XI w grze jest bohater z filmów Przemka (punkt 9).** Ten punkt zostaje jako zapis pierwszej próby i jej wniosków.

**Patryk (23 XI, 23:05):** *„główny bohater to jest jeszcze nie ten wygląd jest zbyt prosty, nie wyróżnia się niczym szczególnym (…) możemy dodać animacje do naszych walk, ale charakter postaci musimy jeszcze dopracować, co najlepsze mam do tego gemina”*. Uwaga dotyczyła bohatera rysowanego kodem. O 23:10 Patryk przysłał arkusz z Gemini: *„napisałem do niego zeby wygenerował nam grafike w ruchu walki”*. Dokładnego polecenia nie mamy, więc tego obrazu nie da się powtórzyć jednym poleceniem; kolejne robimy z nim jako wzorem (punkt 8).

Arkusz leży w [grafika/zrodla/arkusz-patryka.jpg](../grafika/zrodla/arkusz-patryka.jpg) (848 × 1264 px; do 24 XI nazywał się `grafika/bohater-arkusz-gemini.jpg`). Jest na nim sześć póz na różowym tle: stoi (przód), plecy, zamach, w połowie cięcia, uderzenie i wypad. Wygląd zgadza się z punktem 6: wilcze futro, połatana skóra, kolczuga, jeden naramiennik, bandaże, łańcuch na prawym nadgarstku i długi wyszczerbiony miecz.

**Jak trafił do gry (Claude, 23 XI).** Narzędzie `narzedzia/wytnij-bohatera.py` (usunięte 24 XI, jest w historii gita w commicie `c18d042`) zdejmowało różowe tło, usuwało półprzezroczyste smugi ruchu, wycinało pozy bez podpisów i strzałek, zmniejszało je i składało w `grafika/bohater.webp` (40 KB). Miejsce stóp każdej pozy jest wpisane w narzędziu ręcznie. Gra wybiera pozę według fazy walki, a ruch dokłada kod: pochylenie, przysiad, odbicie w lewo i prawo, drżenie przy ładowaniu i powidoki przy uniku.

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

**Nieaktualne od 24 XI (Claude):** chód, rana i blok przyszły w filmach Przemka (punkt 9), a filmy sprawdzają się lepiej niż arkusze póz. Czego jeszcze brakuje i jak o to prosić, jest w punkcie 9. Polecenia niżej zostają jako zapis.

Przed każdym poleceniem dołącz w Gemini arkusz z punktu 7 jako obraz wzorcowy. Te polecenia nie mają stałego dopisku stylu, bo styl ma przyjść z obrazu wzorcowego; dopisek mógłby go zmienić.

**8a. Spoczynek z boku i chód**

> Using the attached character sheet as the reference, draw the same mercenary in exactly the same drawing style: same face, grey wolf-fur collar, patched brown leather, chainmail, one steel pauldron, bandaged forearms, a chain on the right wrist, and the long dark-iron sword with a notched blade. Draw 5 frames in one row, all facing right, seen from the same slightly elevated three-quarter angle as the attack poses in the reference: frame 1 standing still with the sword held low in the right hand, frames 2 to 5 a walk cycle. Same size in every frame, feet on one common baseline, wide gaps so the frames do not touch. Exactly one sword per frame. No motion lines, no trails, no sparks, no text, no labels, no arrows. Even, dim daylight. Plain flat magenta background (#FF00FF), no shadow on the background.

**8b. Obrona, unik i rana**

> Using the attached character sheet as the reference, draw the same mercenary in exactly the same drawing style and at the same scale. Draw 6 poses in two rows, all facing right, from the same slightly elevated three-quarter angle as the attack poses: 1. guard: sword held diagonally across the body to catch a blow; 2. hit by a blow: flinching backwards, head turned away; 3. dodge roll, start: crouching low and pushing off; 4. dodge roll, end: rising from the roll; 5. sword stuck in something heavy, pulling it with both hands; 6. falling to one knee, leaning on the sword. Feet on one baseline in each row, wide gaps between poses. Exactly one sword per pose. No motion lines, no trails, no sparks, no text, no labels, no arrows. Even, dim daylight. Plain flat magenta background (#FF00FF), no shadow on the background.

### 9. Bohater z filmów Przemka (24 XI)

**Patryk (24 XI, 00:08):** *„przemek wygenerował nam grafike na prompcie naszego bohatera do gemina, mozesz wykorzystać to w 100% spodobałą mi się grafika (…) jestem ciekaw co można by zrobić w tym z animacją, ale zostawiamy ją narazie, męczenie nas tylko zniechęci (…) zebyś skupił się na tych plikach co Ci wysłałem i postarał się przenieść to do gry, ale bedziemy to poprawiać”*. O 00:12: *„i przede wszytkim chodzenie musisz poprawić”*.

Przemek zrobił w Gemini pięć obrazów i sześć filmów (1280 × 720, 24 klatki na sekundę, po 4 sekundy) z polecenia na bohatera z punktów 5 i 6. Wszystko leży w [grafika/zrodla/](../grafika/zrodla/), razem z arkuszem z punktu 7.

| Plik | Co na nim jest | Gdzie w grze |
| --- | --- | --- |
| `film-oddech.mp4` | bohater stoi i oddycha, białe tło | spoczynek |
| `film-chod.mp4` | chód w miejscu, białe tło | do 24 XI chód i unik; teraz nieużyty, chód zastąpił bieg (punkt 11) |
| `film-ciecie.mp4` | zamach, cięcie w prawo ze smugą, powrót | zamach, ładowanie mocnego ciosu, cięcie, powrót miecza |
| `film-rana.mp4` | cios w pierś, odrzut, potem miecz trzymany poziomo | rana, zachwianie, blok (upadek od 24 XI z własnego filmu, punkt 11) |
| `film-magia.mp4` | unosi przeklętą rękę, wali pięścią w ziemię, fioletowe pioruny | od 24 XI klątwa pod R: klatki 4–28, 64–70 i 73–91; wybuch z klatek 31–61 zasłania nogi, więc rysuje go gra |
| `film-zbroja.mp4` | wojownik w hełmie tnie w nocy przy chacie | jeszcze nie: inna postać i film ze sceną, nie na białym tle |
| `przemek-1-portret.jpg` | twarz w deszczu, las | ekran startu (`grafika/portret.webp`) i twarz przy myślach (`grafika/portret-maly.webp`) |
| `przemek-2-wojownik-w-zbroi.jpg` | wojownik w hełmie, trzy pozy | jeszcze nie: kandydat na przyszłą postać |
| `przemek-3-las.jpg` | nocny las | tło ekranu startu (`grafika/las.webp`) |
| `przemek-4-widok-z-ukosa.jpg` | bohater na kawałku ziemi w widoku z ukosa | jeszcze nie: wzór, jak bohater wygląda z góry |
| `przemek-5-biale-tlo.jpg` | bohater w całej postaci, białe tło | jeszcze nie: wzór do kolejnych filmów |

**Jak trafia do gry (Claude, 24 XI).** Narzędzie [narzedzia/wytnij-z-filmow.py](../narzedzia/wytnij-z-filmow.py) wyjmuje z filmów wybrane klatki (ffmpeg), zdejmuje białe tło i szary cień pod stopami, składa 78 klatek w [grafika/bohater.webp](../grafika/bohater.webp) (630 KB) i zapisuje [gra/klatki-bohatera.js](../gra/klatki-bohatera.js): gdzie leży każda klatka, gdzie ma stopy i które klatki tworzą którą animację. Które klatki filmu idą do której animacji, jest wpisane na górze narzędzia. Kto zmieni wybór, uruchamia narzędzie jeszcze raz.

- **Kierunek.** We wszystkich filmach bohater stoi bokiem do nas, patrzy w prawo, w prawo idzie i w prawo tnie. Gra odbija go, gdy celujesz w lewo.
- **Cios idzie za fazą, nie za zegarem.** Zamach to klatki 4–37 filmu cięcia (unosi miecz i odprowadza go nisko za siebie), cięcie to 39–55, powrót 58–94. Dzięki temu ten sam film pasuje do lekkiego i do wielkiego miecza.
- **Smuga z filmu.** W klatkach 39–49 jasna smuga przecina biodra i po jej zdjęciu zostawała dziura. Narzędzie bierze ten pas z klatki 55, w której bohater stoi w tym samym rozkroku, a smugi już nie ma. Smugę cięcia rysuje gra.
- **Chód.** Klatki biegną z przebytą drogą, a nie z zegarem, więc stoją, gdy bohater stoi. Idąc tyłem (od celu albo w górę ekranu) film leci wstecz. Bohater rusza i staje w chwili, gdy nogi się mijają, więc nie przeskakuje z pół kroku do stania.
- **Chód: czego się nie da (zmierzone).** W filmie stopa na ziemi przesuwa się o około 60 jednostek gry na cykl (dwa kroki), a cykl trwa 1,7 sekundy. To spokojny marsz, około 37 jednostek na sekundę. Bohater w grze idzie 165 jednostek na sekundę, czyli prawie biegnie. Gdyby nogi miały nadążyć bez ślizgu, przebierałby 5 kroków na sekundę. Gra robi cykl co 110 jednostek drogi: 3 kroki na sekundę, dwa i pół raza szybciej niż w filmie, a stopy trochę się ślizgają. Pomiar (Claude, 24 XI): stopa śledzona na klatkach 64–75 filmu chodu przesuwa się o 5,2 piksela na klatkę w filmie zmniejszonym do 640 × 360, w którym bohater ma 340 pikseli wzrostu, a w grze 100 jednostek.

**Czego brakowało** (24 XI w nocy Przemek przysłał bieg, chód tyłem i przewrót, punkt 11; ta lista zostaje dla historii) (do Przemka, kiedy będzie ochota; Patryk prosił, żeby animacją się teraz nie męczyć):

1. **Bieg w miejscu, z boku, białe tło.** Najważniejsze dla chodzenia: dopiero bieg pasuje do szybkości bohatera w grze i zdejmie ślizganie stóp.
2. **Chód tyłem do kamery** (w górę ekranu). Teraz bohater idzie w górę przodem do nas, z filmem puszczonym wstecz.
3. **Unik:** odskok albo przewrót w bok.
4. Tak jak w tych filmach: białe tło, kamera stoi, bohater w miejscu i tej samej wielkości, bez smug i iskier (smugi gra rysuje sama).

### 10. Zamówienie dla Przemka (24 XI)

**Patryk (24 XI, 00:43):** *„cholera naprawdę wyszło to dobrze (…) przemek się tym zaczą jarać, i ma pytanie co chciałbyś żeby jeszcze nam wygenerował (…) możemy dodać, jakiś specjalny atak który przy wciśnięciu r się aktywuje, można dodać jeszcze animacje rolla, i będę chciał dodać teraz jakąś grafikę do potworów bo niestety są zbyt powtarzalne i nie dają żadnej satysfakcji z bicia ich”*. O 00:49: *„przemek się tym zajmię więc jak będzie miał materiały to Ci wyślę”*.

Wersja do wysłania Przemkowi (dokument z tymi samymi poleceniami): https://claude.ai/artifact/SV9SUTPNdgRDXHk1xK7XEq. Tu jest kopia do zapisu.

**Kolejność:** ghul, kolos, potem bohater (przewrót, bieg, chód tyłem). Atak na R powstał z filmu magii, który już był (punkt 9). Każdy potwór: najpierw jeden obraz postaci (z obrazem bohatera na białym tle jako wzorem stylu), potem z tego obrazu cztery filmy: chód, atak, trafienie, śmierć.

**Końcówka do każdego filmu** (poza przewrotem): *Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. The character stays in the same place in the frame, whole body visible including the feet, side view from slightly above, facing right. No motion trails, no sparks, no glow, no smoke, no text.*

| Co | Polecenie |
| --- | --- |
| Ghul, obraz | Using the attached image of the mercenary as the style reference, draw a ghoul in exactly the same drawing style. A gaunt, hunched humanoid that crawled out of the night mist: grey-blue skin stretched over bones, long arms reaching to its knees with black claws, a lipless mouth with too many teeth, milky blind eyes, rags of a burial shroud, wet from rain. About as tall as the mercenary when upright, but crouched and ready to leap. Full body, side view from slightly above, facing right. Pure white background, no floor, no shadow, no text. |
| Ghul, chód | The ghoul creeps forward on the spot in a loop, hunched low, claws swaying, like walking on a treadmill. The last frame matches the first. |
| Ghul, atak | The ghoul crouches, then lunges forward slashing with both claws, lands and settles back into its crouch. |
| Ghul, trafienie | The ghoul is struck hard from the front: it flinches and reels backwards, head snapping back, then recovers into its crouch. |
| Ghul, śmierć | The ghoul is struck a fatal blow from the front: it staggers back, collapses onto the ground, twitches once and lies still. |
| Kolos, obraz | Using the attached image of the mercenary as the style reference, draw a colossus in exactly the same drawing style. A hulking, hunched brute about twice the height of the mercenary: bloated grey flesh with plates of bone growing out of the skin like armour, a small head sunk between massive shoulders, huge fists hanging almost to the ground, a rusted iron collar with a broken chain around its neck, wet from rain. Full body, side view from slightly above, facing right. Pure white background, no floor, no shadow, no text. |
| Kolos, chód | The colossus lumbers forward on the spot in a loop, slow and heavy, fists swinging, like walking on a treadmill. The last frame matches the first. |
| Kolos, atak | The colossus raises both fists high above its head, then slams them into the ground in front of it, and slowly straightens up again. |
| Kolos, trafienie | The colossus is struck hard from the front: it barely sways, grunts, shoulders jerking back, then steadies itself. |
| Kolos, śmierć | The colossus is struck a fatal blow from the front: it drops to its knees, then falls forward face down and lies still. |
| Bohater, przewrót (z własną końcówką) | The same mercenary does a quick combat roll to the right: drops low, rolls over his shoulder and comes back up into his standing pose with the sword in hand. Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. He may move across the frame but stays fully visible, feet included. Side view from slightly above. No motion trails, no sparks, no glow, no smoke, no text. |
| Bohater, bieg | The same mercenary runs on the spot in a loop, like on a treadmill: a heavy, determined run, sword held low in his right hand, the wolf-fur cloak bouncing. The last frame matches the first. |
| Bohater, chód tyłem (w końcówce „seen from behind” zamiast „facing right”) | The same mercenary walks away from the camera on the spot in a loop, like on a treadmill. We see his back: the wolf-fur cloak, the pauldron and the sword in his right hand. The last frame matches the first. |

### 11. Ghul, kolos i nowe ruchy bohatera z filmów Przemka (24 XI w nocy)

**Patryk (24 XI, 01:18), z materiałami:** *„jestem ciekaw jak to teraz przeniesiesz do gry bo jestem jak dotąt zachwycony, i będziemy po wolutku dopieszczać każde sczególy”*. Przyszło wszystko z zamówienia z punktu 10, a do tego unik w bok i upadek bohatera. Filmy i obrazy leżą w [grafika/zrodla/](../grafika/zrodla/).

| Plik | Co na nim jest | Gdzie w grze (klatki filmu) |
| --- | --- | --- |
| `ghul-obraz-1.jpg`, `ghul-obraz-2.jpg` | ghul na białym tle | wzór; w grze są klatki z filmów |
| `ghul-chod.mp4` | skrada się w miejscu | chód: 39–81, pełny cykl (klatka 84 wygląda jak 39) |
| `ghul-atak.mp4` | przyczaja się, skacze z pazurami, wraca do przysiadu | zamach 7–25, skok 28–40, odpoczynek 43–55 |
| `ghul-trafienie.mp4` | wstrząs, prostuje się, cofa, wraca | krótki wstrząs przy cięciu (początek filmu), cały film przy ogłuszeniu |
| `ghul-smierc.mp4` | krew, przewraca się na plecy, leży | śmierć 13–79, ciało na ziemi 88 |
| `kolos-obraz.jpg` | kolos na białym tle | wzór |
| `kolos-chod.mp4` | ciężki chód w miejscu | chód: 47–92, pełny cykl |
| `kolos-atak.mp4` | cios w przód, pięść nad głowę, uderzenie w ziemię, kurz | zamach 28–44, uderzenie 46–58, odpoczynek 61–85; cios w przód (1–25) nieużyty |
| `kolos-trafienie.mp4` | z ręki leci łańcuch, potem się zatacza | 28–58; łańcuch z początku pominięty |
| `kolos-smierc.mp4` | klęka i pada na twarz | śmierć 25–73, ciało na ziemi 85 |
| `film-bieg.mp4` | bohater biegnie w miejscu | bieg: 47–71, każda klatka, pełny cykl (zastąpił chód) |
| `film-chod-2.mp4` | odwraca się i idzie od nas, plecami | chód w górę ekranu: 47–79 |
| `film-przewrot.mp4` | przewrót w przód i wstaje z mieczem przed sobą | unik: 22–52 (od przysiadu do lądowania) |
| `film-upadek.mp4` | osuwa się na kolana i pada na bok | śmierć bohatera: 22–76 |
| `film-unik.mp4` | krok w bok | jeszcze nie |
| `film-ciecie-2.mp4` | drugi przewrót | jeszcze nie |

**Jak to działa (Claude, 24 XI).** To samo narzędzie, [narzedzia/wytnij-z-filmow.py](../narzedzia/wytnij-z-filmow.py), robi teraz trzy postacie: bohatera ([grafika/bohater.webp](../grafika/bohater.webp), 147 klatek), ghula ([grafika/ghul.webp](../grafika/ghul.webp), 74 klatki) i kolosa ([grafika/kolos.webp](../grafika/kolos.webp), 69 klatek). Każda postać ma w narzędziu swoje stopy w kadrze, wzrost w filmie i wzrost w grze: bohater 100 jednostek, ghul 72, kolos 165. Klatki potworów opisuje [gra/klatki-wrogow.js](../gra/klatki-wrogow.js). Gdy obraz potwora się nie wczyta, gra rysuje go po staremu kodem.

- **Potwory słuchają walki.** Klatka wynika ze stanu z `walka.js`: zamach i skok idą za czasem ataku, więc film zawsze kończy się razem z atakiem. Chód idzie za przebytą drogą (ghul cykl na 75 jednostek, kolos na 100). Cięcie daje krótki wstrząs z filmu trafienia i jasny rozbłysk całej postaci. Ogłuszenie (po parowaniu albo klątwie) pokazuje cały film trafienia.
- **Śmierć.** Ghul pada na plecy z dala od bohatera, kolos na twarz. Ostatnia klatka zostaje na ziemi. 50 najświeższych ciał leży w pełnej ostrości, a starsze idą do warstwy śladów, która ma połowę rozdzielczości. Mocny cios albo wielki miecz nadal tnie na pół: gra przecina w pasie pierwszą klatkę chodu.
- **Oczy** świecą jak dotąd, ale tylko w chodzie i w zamachu ghula. W zamachu kolosa pięść zasłania głowę, więc ostrzega tylko czerwony krąg na ziemi.
- **Bieg.** W filmie stopa przesuwa się o około 73 jednostki na cykl. Gra robi cykl co 90 jednostek drogi, czyli prawie 2 kroki na sekundę i tylko lekki ślizg; wcześniej marsz ślizgał się mocno. Rusza i staje, gdy nogi się mijają (w 42. i 94. setnej cyklu biegu).
- **Plecami.** Idąc wyraźnie w górę ekranu, bohater pokazuje plecy. Wraca do biegu bokiem, gdy skręci, z zapasem, żeby obraz nie migał.
- **Przewrót.** W filmie bohater przesuwa się w kadrze o pół wzrostu. Narzędzie liczy dla tych klatek stopy od środka ciała, więc drogę przewrotu robi sam unik w grze. Bohater obraca się w stronę uniku. Unik trwa teraz 0,4 s zamiast 0,32 s, a nietykalność 0,3 s zamiast 0,24 s, bo przewrót w 0,32 s był migotaniem. Bot przechodzi noc tak samo jak wcześniej (`dobry`: 5 na 5 świtów każdym mieczem, rany jak przed zmianą).
- **Upadek** z filmu zamiast przechylonej klatki rany. Bohater zostaje na ziemi, nie znika.

**Do dopieszczenia** (sprawdzone na zrzutach w zwolnionym tempie, jeszcze nie w rękach Patryka): po przewrocie bohater wstaje z przysiadu jednym przeskokiem; kurz po uderzeniu kolosa z filmu zostaje szarą plamą przy pięści; obrazy potworów to razem około 1,5 MB do pobrania.

### 12. Miecz, który wygląda jak miecz (24 XI rano)

**Patryk (24 XI, 11:50):** *„zmienił bym jeszcze wygląd tego jak atakuje bo to mi batrdziej przypomina ciecie jakimś nożykiem, a nie prawdziwym mieczem”*. O 11:52: *„to pojawjanie się broni dopiero przy ataku też mało efektywne lepiej już dodać ze jak jest w trybie walki to ma miecz wyciągnięty i atakujesz pózniej przy pokonaniu chowasz bron”*.

**Skąd „nożyk” (sprawdzone na zrzutach w zwolnionym tempie).** W filmie cięcia ostrze w samym łuku zasłania smuga Gemini, którą narzędzie zdejmuje. Zostaje ręka, która z zamachu za plecami od razu wyskakuje wyciągnięta przed siebie, jak przy pchnięciu. Smuga gry była bladym wachlarzem od środka ciała i kończyła się na długości miecza (72 jednostki), krócej niż cios naprawdę rani (110).

**Co zmieniło się w grze (Claude):**
- Smuga to teraz sierp, jasny przy ostrzu i gasnący ku tyłowi łuku. Sięga tam, dokąd rani cios.
- Na czele sierpa leci ostrze z jelcem i rękojeścią, szerokie jak wybrany miecz: wielki miecz jest wyraźnie cięższy od lekkiego.
- W walce (wróg bliżej niż 700 jednostek albo cios w toku) bohater stoi w gardzie z mieczem uniesionym przed sobą. Te klatki pochodzą z końca filmu cięcia (82–94). Gdy wokół pusto, po 2 sekundach opuszcza miecz i oddycha jak dotąd.

**Czego się nie da bez nowych filmów.** Gemini nie dał wyciągania ani chowania miecza, biegu z mieczem w gardzie ani cięcia z widocznym ostrzem. Polecenia poniżej może wkleić Przemek albo my sami. Mają tę samą końcówkę co w punkcie 10, a jako wzór stylu idzie obraz bohatera na białym tle (`przemek-5-biale-tlo.jpg`).

| Co | Polecenie |
| --- | --- |
| Cięcie oburącz | The same mercenary makes one heavy two-handed horizontal sword cut from his left to his right at chest height, the long blade clearly visible during the whole swing, then recovers into a guard with the sword raised in front of him. No motion blur, no smear, no trail on the blade. |
| Postawa bojowa | The same mercenary stands in a combat guard on the spot in a loop: sword drawn and held in both hands in front of him, blade pointing up and forward, knees bent, breathing heavily. The last frame matches the first. |
| Bieg z mieczem | The same mercenary runs on the spot in a loop, like on a treadmill, holding the drawn sword in both hands in front of him, blade clearly visible. The last frame matches the first. |
| Wyciąga miecz | The same mercenary draws the long sword from a plain leather scabbard at his left hip and takes a combat guard (if he has no scabbard, give him one that matches his gear). |
| Chowa miecz | The same mercenary, in a combat guard, lowers the long sword, slides it back into the leather scabbard at his left hip and straightens up. |

### 13. Chód w dół ekranu, przodem do nas (24 XI w południe)

**Patryk (24 XI, 12:39), z filmem nagranym telefonem z ekranu ([klatka](zrzuty/2026-11-24-chod-w-dol.jpg)):** *„trzeba też pomyśleć jak zrobić animacje chodzenia na dól na góre już jest, teraz pasuje zrobić na dół zeby i to miało jakis wygląd”*.

**Stan (Claude).** W górę bohater idzie plecami (`film-chod-2`, punkt 11). W dół gra pokazuje bieg bokiem, bo żaden film nie ma bohatera idącego do nas: początek `film-chod-2` to tylko odwracanie się, a `film-chod` i `film-bieg` są z boku. Bez nowego filmu tego nie zrobimy porządnie; obrót albo odbicie klatek pleców dałoby „chód tyłem do przodu”.

**Co jest gotowe w grze.** Gra ma już miejsce na animację `chod_przod`: włącza ją, gdy bohater idzie wyraźnie w dół (na polanie i w izbie), i wraca do biegu bokiem, gdy skręci, tak samo jak przy plecach. Dopóki filmu nie ma, nic się nie zmienia. Gdy film przyjdzie, wystarczy jedna linia w [narzedzia/wytnij-z-filmow.py](../narzedzia/wytnij-z-filmow.py) z numerami klatek jednego pełnego cyklu.

**Polecenie** (wzór stylu: `przemek-5-biale-tlo.jpg`, ta sama zasada co chód tyłem z punktu 10, w końcówce „seen from the front” zamiast „facing right”):

> The same mercenary walks toward the camera on the spot in a loop, like on a treadmill. We see him from the front: his face, the wolf-fur cloak over his shoulders, the pauldron and the sword held low in his right hand. The last frame matches the first. Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. The character stays in the same place in the frame, whole body visible including the feet, seen from the front and slightly above. No motion trails, no sparks, no glow, no smoke, no text.

Przy okazji warto zrobić też ukosy, bo w dół po skosie bohater nadal pokaże bieg bokiem. To już drugi krok, jeśli pierwszy film się sprawdzi.

**Film przyszedł (Patryk z Flow, 24 XI, 12:52): [grafika/zrodla/film-chod-przod.mp4](../grafika/zrodla/film-chod-przod.mp4).** Bohater idzie prosto do nas w miejscu, białe tło, 96 klatek. Cykl ma 34 klatki (klatka 52 wygląda jak 18, zmierzone porównaniem dolnej części kadru), więc gra bierze co drugą klatkę z 18–50, razem 17. Stopy mijają się w klatkach 18 i 35 (stopy najwyżej w kadrze), czyli na początku i w połowie cyklu, tak jak przy plecach. Bohater stoi w tym filmie w innym miejscu kadru niż w pozostałych, dlatego narzędzie ma dla niego osobny punkt stóp (`STOPY_FILMU`). Wzrost w kadrze jest prawie taki sam jak w biegu (około 330 wobec 337 pikseli), więc skala zostaje wspólna.
Bieg bokiem wraca, gdy bohater skręci bardziej w bok niż w dół (ponad 60° od pionu). Na skos w dół zostaje więc chód przodem. Sprawdzone zrzutami w zwolnionym tempie na polanie i w izbie.

**Wyciąganie i chowanie miecza: dwa obrazy z Gemini (Patryk, 24 XI, 12:52).** [miecz-w-pochwie.jpg](../grafika/zrodla/miecz-w-pochwie.jpg): ręka na rękojeści, miecz przy biodrze. [miecz-wyciagniety.jpg](../grafika/zrodla/miecz-wyciagniety.jpg): miecz wyciągnięty przed siebie. To dwa nieruchome obrazy, więc w grze same nie zrobią ruchu. Najlepiej użyć ich we Flow jako pierwszej i ostatniej klatki filmu: z pierwszego do drugiego to wyciąganie, a chowanie to ten sam film puszczony wstecz, więc wystarczy jeden film. Polecenie:

> The same mercenary draws his sword from his left hip and raises it into a guard in front of him, in one smooth motion. Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. The character stays in the same place in the frame, whole body visible including the feet. No motion trails, no sparks, no glow, no smoke, no text.


**Film wyciągania przyszedł (Patryk z Flow, 24 XI, 13:14): [grafika/zrodla/film-miecz-wyciaga.mp4](../grafika/zrodla/film-miecz-wyciaga.mp4).** Wyszedł przodem do nas, a nie bokiem: ręka na rękojeści, wyciąga, unosi miecz pionowo przed siebie. Gra bierze klatki 25–58 co trzecią (12 klatek, 0,6 s). Gdy zaczyna się walka (wróg bliżej niż 700 jednostek), bohater wyciąga miecz i przechodzi do gardy bokiem. Gdy wokół pusto przez 2 s, chowa miecz tym samym filmem puszczonym wstecz i wraca do oddechu. Cios, unik albo chód przerywają wyciąganie, a stan miecza liczy się dalej w tle. Bohater w tym filmie jest o 5% niższy w kadrze, więc narzędzie powiększa te klatki (`SKALA_FILMU`), i stoi w innym miejscu kadru (`STOPY_FILMU`). Sprawdzone zrzutami w zwolnionym tempie. Przeskok z gardy bokiem do filmu przodem widać, bo to dwa różne ujęcia; jeśli będzie przeszkadzał, potrzebny jest ten sam film bokiem (polecenie wyżej, „facing right”).

**Poprawka (Patryk, 24 XI, 13:27):** *„jak zbliza się potwór nie widać tego wyciągania za bardzo i tak samo chowanie za szybkie i tak samo jak juz walczy i ma wyciagnęta bron to pasuje widać naprzykład jak szarszuje na wroga to z bronią w reku”*.
- **Dlaczego nie było widać wyciągania (Claude).** Ruch szedł tylko wtedy, gdy bohater stał w miejscu, a włączał się, gdy wróg podszedł na 700 jednostek. Zwykle bohater wtedy idzie albo już tnie, więc wyciąganie liczyło się w tle i nie było go widać. Do tego trwało 0,6 s.
- **Teraz:** wyciąga, gdy zaczyna się etap nocy (wychodzą potwory) albo gdy wróg jest blisko. Trwa to 1 s i 21 klatek (19–59 co drugą), a ruch widać także w marszu. Chowa 1,5 s po końcu walki, przez 1,3 s, również w marszu. Cios, unik albo blok od razu kończą wyciąganie. Przez cały etap, gdy bohater stoi, trzyma gardę. Liczby są w `MIECZ` w [gra/rysowanie.js](../gra/rysowanie.js).
- **Czego się nie da bez filmów: szarża z mieczem w dłoni.** Bieg z `film-bieg` ma miecz nisko w prawej ręce. Wygląda tak samo w walce i po niej, więc po schowaniu miecza bohater nadal biegnie z mieczem. Potrzebne są dwa filmy (Flow, z obrazem bohatera na białym tle, końcówka z punktu 10, „facing right”):

| Co | Polecenie |
| --- | --- |
| Szarża z mieczem (walka) | The same mercenary charges forward on the spot in a loop, like on a treadmill: an aggressive run with the drawn sword held in both hands, raised in front of him at shoulder height, blade clearly visible and pointing forward. The last frame matches the first. |
| Bieg bez miecza w dłoni (spokój) | The same mercenary runs on the spot in a loop, like on a treadmill, with his sword sheathed in a plain leather scabbard at his left hip, both hands empty and swinging. The last frame matches the first. |
| Wyciąganie bokiem | The same mercenary, seen from the side and facing right, draws his sword from the leather scabbard at his left hip and raises it into a guard in front of him, in one smooth motion. |

**Pierwsza próba biegu (Patryk z Flow, 24 XI, 13:46): nieudana.** *„nawet nie przypomina naszej postaci a wkłeiłem mu to zdjęcie i prompt”*. Na filmie biegnie inny człowiek, bez futra i płaszcza, w stylu bliższym zdjęciu. Film nie wszedł do repozytorium. Prawdopodobna przyczyna: obraz `przemek-5-biale-tlo.jpg` pokazuje bohatera z ukosa, więc Flow musiał go obrócić bokiem i narysował go od nowa. Następna próba: jako klatka startowa klatka 47 z `film-bieg.mp4` (bohater już bokiem, w biegu, w naszym stylu), plik `bohater-bokiem-klatka.png` w plikach projektu.

**Polecenie przemyślane jeszcze raz (Claude, 24 XI, po prośbie Patryka *„pomyśl jeszcze głebiej nad promptem”*).** Trzy przyczyny, dla których Flow rysuje innego człowieka:
1. *„The same mercenary”* nic nie znaczy dla modelu filmów: on widzi tylko obraz, więc postać trzeba opisać słowami.
2. Obraz startowy był z ukosa, a polecenie kazało biec bokiem. Model musiał postać obrócić, więc narysował ją od nowa.
3. Szarża z mieczem w górze to inna poza niż na obrazie (miecz nisko), więc model zmienia pozę, a z nią postać.

Dlatego dwa kroki. Najpierw Gemini rysuje nieruchomy kadr w docelowej pozie (z naszej klatki biegu bokiem). Potem Flow robi z niego film, w którym ten sam kadr jest pierwszą i ostatnią klatką: postać nie ma się wtedy w co zmienić, a pętla zamyka się sama.

| Krok | Gdzie | Polecenie |
| --- | --- | --- |
| 1a. Kadr: szarża | Gemini (obraz), załącznik `bohater-bokiem-klatka.png` | Redraw exactly this character in exactly the same drawing style, at the same size and in the same place in the frame, in the same side view facing right, mid-run. Change only his arms and sword: he now holds his drawn sword in both hands, raised in front of him at shoulder height, the blade pointing forward and clearly visible. Keep his face, short dark hair, stubble, wolf-fur cloak, hood, leather straps, single steel pauldron, patched trousers and boots exactly the same. Pure white background, no shadow, no text. |
| 1b. Kadr: bieg bez miecza | jak wyżej | Redraw exactly this character in exactly the same drawing style, at the same size and in the same place in the frame, in the same side view facing right, mid-run. Change only his arms and sword: the sword is sheathed in a plain leather scabbard at his left hip, both hands are empty, fists clenched, arms swinging as he runs. Keep his face, short dark hair, stubble, wolf-fur cloak, hood, leather straps, single steel pauldron, patched trousers and boots exactly the same. Pure white background, no shadow, no text. |
| 2. Film | Flow, z kadru 1a albo 1b jako pierwszą i ostatnią klatką | A 2D hand-drawn animation in exactly the style of this image: this exact character runs on the spot in a loop, like on a treadmill, side view facing right. He does not move across the frame; only his legs, arms and cloak move. Keep his face, clothes, colours, ink outlines and size exactly as in the image. Do not turn him into a different person, not photorealistic, not 3D. Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. No motion trails, no sparks, no glow, no smoke, no text. |

Jeśli Flow nie ma pola na ostatnią klatkę, wystarczy pierwsza: szukamy wtedy pętli w filmie tak jak przy chodzie przodem.

**Przewrót w górę i w dół (Patryk, 24 XI, 13:57).** W grze przewrót bokiem jest na razie obracany w stronę uniku ([docs/walka.md](walka.md), punkt 12). Prawdziwe przewroty przodem i tyłem, gdyby Patryk chciał je zrobić, tą samą metodą (tu bez kroku 1, bo zaczyna się od zwykłej pozy): Flow, jako pierwsza klatka: do nas `bohater-przodem-klatka.png` (klatka 18 z `film-chod-przod.mp4`), od nas `bohater-plecami-klatka.png` (klatka 47 z `film-chod-2.mp4`); obie są w plikach projektu.

| Film | Polecenie dla Flow |
| --- | --- |
| Przewrót do nas (w dół ekranu) | A 2D hand-drawn game animation in exactly the style of this image. This exact character, facing the viewer, does a fast combat roll towards the viewer, down the frame: he crouches, tucks his head, rolls forward over his shoulder like a somersault, and springs back up onto his feet, facing the viewer, a short distance lower in the frame. Seen from slightly above, like in a top-down game. Whole body visible at all times, feet included; the camera does not move and he does not grow bigger. Keep his face, wolf-fur cloak, clothes, colours, ink outlines and size exactly as in the image; do not turn him into a different person, not photorealistic, not 3D. Pure white background, no floor, no shadow. No zoom, no pan, no cut. No motion trails, no sparks, no glow, no smoke, no text. |
| Przewrót od nas (w górę ekranu) | A 2D hand-drawn game animation in exactly the style of this image. This exact character, with his back to the viewer, does a fast combat roll away from the viewer, up the frame: he crouches, tucks his head, rolls forward over his shoulder like a somersault, and springs back up onto his feet, still with his back to the viewer, a short distance higher in the frame. Seen from slightly above, like in a top-down game. Whole body visible at all times, feet included; the camera does not move and he does not get smaller. Keep his wolf-fur cloak, clothes, colours, ink outlines and size exactly as in the image; do not turn him into a different person, not photorealistic, not 3D. Pure white background, no floor, no shadow. No zoom, no pan, no cut. No motion trails, no sparks, no glow, no smoke, no text. |

Patryk, 24 XI, 14:22: koziołek z jednego obrazu (wersja 17) *„dalej zle to wygląda to musi wyglądać podobnie jak ten przewrót w prawo czy lewo”*. Obraz tylko jako pierwsza klatka (nie ostatnia), bo bohater kończy w innym miejscu kadru.

**Wynik (24 XI, 14:31):** oba filmy udane za pierwszym razem, są w grze ([grafika/zrodla/film-przewrot-przod.mp4](../grafika/zrodla/film-przewrot-przod.mp4), [film-przewrot-tyl.mp4](../grafika/zrodla/film-przewrot-tyl.mp4)). Bohater w kadrze prawie stoi w miejscu, mimo że polecenie mówiło o przesunięciu; to nawet lepiej dla gry. W przewrocie od nas na chwilę znika wilczy łeb z płaszcza; przy tej prędkości tego nie widać.

**Bieg z mieczem bez Gemini (Claude, 24 XI, 14:54).** Gemini ma limit, ale kadr z mieczem w dłoni już mamy: klatka 88 filmu cięcia (`bohater-miecz-klatka.png` w plikach projektu), bohater w tej samej pozie co w grze, w naszym stylu. Wystarczy sam Flow, z tym kadrem jako pierwszą i ostatnią klatką:

> A 2D hand-drawn game animation in exactly the style of this image. This exact character runs on the spot in a loop, like on a treadmill, facing right, holding his drawn sword in his right hand in front of him exactly as in the image, the blade clearly visible the whole time. He does not move across the frame; only his legs, arms and cloak move. Keep his face, wolf-fur cloak, clothes, colours, ink outlines and size exactly as in the image; do not turn him into a different person, not photorealistic, not 3D. Pure white background, no floor. Static camera: no zoom, no pan, no cut. Whole body visible at all times, feet included. No motion trails, no sparks, no glow, no smoke, no text.

## Jak ocenimy próbkę

1. **Klimat** (decyduje Patryk): czy to wygląda jak nasza gra?
2. **Spójność** (sprawdza Claude): czy obrazy z różnych poleceń wyglądają jak z jednej gry?
3. **Użyteczność** (sprawdza Claude): czy widok z góry pasuje do mapy i czy obraz jest czytelny na ekranie telefonu?

Po próbce wybieramy jedną z dwóch dróg i zapisujemy ją jako decyzję 003:

- **Droga A:** obrazy z Gemini idą prosto do gry (budynki, tła, portrety), a kod rysuje postacie w ruchu.
- **Droga B:** obrazy z Gemini są wzorem, a grafikę na mapie rysuje kod w tym samym stylu. Portrety i ilustracje zostają z Gemini.
