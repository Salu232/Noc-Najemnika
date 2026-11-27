# Bagno wiedźmy: plan drugiego rozdziału

Żywy dokument. Spisany 27 XI 2026 po południu (Claude), zanim Patryk wrócił około 16:00. Patryk nic tu jeszcze nie zatwierdził: punkty z jego decyzją mają datę, reszta to propozycje.

## Co już ustalone

- **Ślad prowadzi na bagno.** Amulet rycerza ma wyryte trzciny i półksiężyc, czyli znak bagien (`PRZEDMIOTY.amulet`, 26 XI). Świt po rycerzu kończy się myślą *„Rycerz pisał o bagnach wiedźmy. Tam jest następny ślad.”* (`walka.js`, faza `swit`).
- **Kocioł wiedźmy zamiast stołu** (Patryk, 27 XI 11:04, „tak”). Przepisy stołu (`STOL` w `dane.js`) zostały w kodzie właśnie po to. Na bagnie przerabia się na nich łup na ulepszenia.
- **Pełzacz odrzucony** (Patryk, 25 XI): *„już mamy podobnego”* (do ghula). W ostatniej wiadomości z 27 XI wymieniłem go jeszcze raz, ale to był błąd. Wtedy Patryk wybierał spośród: wiedźma, wilki albo upiór. Wiedźma i pies (bestia) już są, więc z tamtej listy został **upiór**.
- **Moneta z arkusza** ma półksiężyc i krzyże (arkusz z 27 XI). Półksiężyc pasuje do znaku bagien, więc można to wykorzystać w fabule.

## Jak to się rozgrywa (propozycja)

1. **Przejście.** Po świcie nad polaną ekran końca ma przycisk „Na bagno” zamiast „Jeszcze raz”. Krótka scena: bohater idzie drogą na północ, mgła gęstnieje. Do plecaka przechodzą tylko amulet, monety i mikstury.
2. **Zmierzch na bagnie** to ten sam schemat co wstęp na polanie: kilka miejsc do obejrzenia i ostatnie, które budzi noc. Proponuję takie miejsca:
   - chata wiedźmy na palach, pusta, kocioł jeszcze ciepły;
   - utopiony wóz z herbem rycerza, czyli rycerz tu był;
   - kamień ze znakiem z amuletu;
   - pomost, z którego coś ciągnie w wodę.
   Ostatni jest **kocioł**: kiedy go dotkniesz, woda się burzy.
3. **Teren.** Płytka woda spowalnia bohatera i potwory, z wyjątkiem topielców. Głęboka woda jest nie do przejścia. Pomosty to wąskie przejścia, dobre do walki z hordą jak w drzwiach.
4. **Noc na bagnie** to cztery fale, jak na polanie, ale z nowymi potworami. Zamiast portali potwory wychodzą z wody. Portale zostają na fale z ghulami, bo to klątwa bohatera je przyciąga.
5. **Zagadka wiedźmy.** Wiedźma (żywa, nie potwór) pojawia się w przerwie, tak jak handlarz. Mówi zagadką, a odpowiedzią jest rzecz, którą trzeba przynieść albo zrobić w kotle. Za dobrą odpowiedź zdradza, co się stało z rycerzem i co dalej z klątwą.
6. **Boss bagna** do wyboru później. Pomysł na start: matka topielców, wielka postać z wody, która wciąga w głąb.

## Nowe potwory (propozycja)

| Potwór | Jak walczy | Czego uczy gracza |
| --- | --- | --- |
| **Topielec** | Czeka pod wodą (widać tylko bąble), wyskakuje, kiedy podejdziesz, chwyta i ciągnie. Trzeba szybko ciąć albo zrobić unik. Na suchym lądzie jest wolny i słaby. | Patrzeć pod nogi i trzymać się pomostów. |
| **Upiór** (z listy Patryka, 25 XI) | Półprzezroczysty, przenika przez inne potwory i ściany. Miecz go nie rani, póki nie zgęstnieje do ataku. Rani go klątwa albo cięcie tuż po jego zamachu. | Wyczucie chwili, a nie samo machanie. |

## Lista obrazów i filmów do zrobienia

Kolejność według tego, co odblokowuje najwięcej pracy. Każdy potwór robimy tak jak ghula i kolosa ([grafika.md](grafika.md), punkt 10): najpierw jeden obraz z bohaterem jako wzorem stylu, potem z tego obrazu cztery filmy w Veo.

**Końcówka do każdego filmu** (ta sama co przy ghulu): *Pure white background, no floor, no shadow. Static camera: no zoom, no pan, no cut. The character stays in the same place in the frame, whole body visible including the feet, side view from slightly above, facing right. No motion trails, no sparks, no glow, no smoke, no text.*

### 1. Teren (Gemini, wzór: `grafika/ziemia.webp` i `grafika/chata.webp`)

| Co | Polecenie |
| --- | --- |
| Ziemia bagna (kafel) | Using the attached ground texture as the style reference, paint a seamless tileable top-down texture of swamp ground in exactly the same drawing style and at the same scale: dark wet mud, patches of moss, rotting leaves, small puddles reflecting nothing, a few broken reeds lying flat. Muted greens and browns, no bright colours. Evenly lit, no shadows from objects, no text. Square image. |
| Płytka woda (kafel) | Using the attached ground texture as the style reference, paint a seamless tileable top-down texture of shallow murky swamp water in exactly the same drawing style: brown-green water, floating duckweed and a few lily pads, faint ripples, mud visible underneath in places. Evenly lit, no reflections of the sky, no text. Square image. |
| Chata wiedźmy | Using the first attached image of the hut as the reference, draw a different hut from exactly the same camera angle, at about the same size, in exactly the same drawing style: a crooked witch's hut on wooden stilts above swamp water, roof of rotten reeds, bundles of herbs and small animal skulls hanging under the eaves, a narrow plank walkway leading to the door, a black iron cauldron on a fire pit on a small platform in front. Transparent background like the attached image. No people, no text. |
| Rekwizyty bagna (arkusz 3×2) | Using the attached image as the style reference, draw six separate swamp props in exactly the same drawing style, top-down view from slightly above, arranged in a 3 by 2 grid on a pure white background with lots of empty space between them: 1) a clump of tall reeds, 2) a dead leaning tree with bare branches, 3) a short wooden plank walkway section, 4) a half-sunken wooden cart with a broken wheel, 5) a mossy standing stone carved with reeds and a crescent moon, 6) a rotten tree stump with mushrooms. No shadows on the background, no text. |

### 2. Topielec (Gemini obraz + 4 filmy Veo, wzór: obraz bohatera na białym tle)

| Co | Polecenie |
| --- | --- |
| Obraz | Using the attached image of the mercenary as the style reference, draw a drowned man in exactly the same drawing style. A bloated, waterlogged corpse risen from the swamp: pale green-grey swollen skin, long black hair plastered to the face, white eyes without pupils, strands of weed and mud hanging from the arms, the rotten remains of a peasant shirt, long fingers with broken nails, water dripping from everything. About as tall as the mercenary, hunched forward with arms reaching. Full body, side view from slightly above, facing right. Pure white background, no floor, no shadow, no text. |
| Wynurzenie | The drowned man rises up from below the bottom edge of the frame as if emerging from water, head first, then shoulders and arms, and stands hunched, reaching forward. |
| Chód | The drowned man wades forward on the spot in a loop, slow and heavy, arms reaching, like walking on a treadmill. The last frame matches the first. |
| Atak | The drowned man lunges forward and grabs with both hands, pulls back hard as if dragging something towards itself, then lets go and settles back. |
| Śmierć | The drowned man is struck a fatal blow from the front: he staggers, collapses backwards and sinks flat onto the ground, lying still. |

### 3. Upiór (tak samo)

| Co | Polecenie |
| --- | --- |
| Obraz | Using the attached image of the mercenary as the style reference, draw a wraith in exactly the same drawing style. The ghost of a drowned knight: a tall gaunt figure in a torn, flowing burial cloak, rusted fragments of armour on the shoulders, a hollow dark face under a hood with two faint pale eyes, no legs, the lower body fading into wisps of grey mist. Full body, side view from slightly above, facing right. Pure white background, no floor, no shadow, no text. |
| Unoszenie | The wraith floats on the spot in a loop, swaying slowly, the cloak and the mist below it drifting. The last frame matches the first. |
| Atak | The wraith rears back, then sweeps forward with one long clawed hand in a wide slash, and drifts back to its floating pose. |
| Śmierć | The wraith is struck a fatal blow: it convulses, then dissolves upwards into grey mist and is gone, leaving an empty white frame. |

### 4. Wiedźma, ta żywa od zagadki (Gemini, portret i postać)

| Co | Polecenie |
| --- | --- |
| Postać | Using the attached image of the mercenary as the style reference, draw an old swamp witch in exactly the same drawing style. A small, bent old woman, not a monster: grey hair in thin braids woven with bones and reeds, a long dark green patched dress hem soaked in mud, a necklace of small bird skulls, a crooked staff topped with a crescent moon of bone, sharp clever eyes. Full body, side view from slightly above, facing left. Pure white background, no floor, no shadow, no text. |
| Portret do rozmowy | The same old swamp witch, head and shoulders portrait, looking at the viewer with a sly half-smile, lit from below by the warm glow of a fire, dark background, in exactly the same drawing style. No text. |
| Film: czeka | The old witch stands on the spot leaning on her staff, slowly stirring the air with her free hand, head tilting, in a loop. The last frame matches the first. |

### 5. Kocioł (Gemini, ikony do okna kotła)

Do okna kotła wystarczą ikony z dotychczasowego arkusza przedmiotów i z arkusza mikstur. Brakuje jednej ikony kotła: *a black iron cauldron on three legs with green bubbling liquid and steam, in exactly the same drawing style as the attached icons, single object centred on a pure white background, no text.*

## Co już jest w grze (27 XI, adres `?mapa=bagno`)

- Druga mapa: martwy las, zielonkawa ziemia, sześć oczek wody rysowanych kodem. Głęboka woda jest nie do przejścia, a w płytkiej bohater brnie wolniej (×0,62), potwory też (×0,72). Polana bez zmian.
- Topielec na klatkach ghula w kolorze mułu: wynurza się z oczka, chwyta na 1,1 s, puszcza po cięciu. Fale na bagnie mają dodatkowo 3 / 5 / 7 / 4 topielców.
- Jeszcze z polany: chata, ognisko, droga, teksty wstępu i nazwy fal.

## Co Claude zrobi, zanim przyjdą obrazy

- Przełączanie map w `swiat.js`, bo dziś polana jest jedyną mapą, ze stałymi `SZER`, `WYS` i drogą.
- Teren bagna z kodu, z zastępczymi kolorami: płytka i głęboka woda, pomosty, zderzenia.
- Topielec na zastępczej grafice (ghul w kolorze błota), żeby sprawdzić, czy wynurzanie i chwyt w ogóle bawią.
- Okno kotła z przepisów `STOL`.

Kiedy przyjdą obrazy, wchodzą na miejsce zastępczych tak samo jak przy handlarzu: `narzedzia/wytnij-z-filmow.py <postać>`.
