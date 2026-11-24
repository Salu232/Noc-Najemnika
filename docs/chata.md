# Chata jako obiekt

Żywy dokument o chacie na polanie: co z nią robimy, w jakiej kolejności i co już działa.

**Patryk, 24 XI, 03:10:** *„kolejny etap który trzeba dopracować to interakcja z obiektami, przyklad to nasza chata, zebyśmy mogli wejść do środka, kolejny przykład można w tej chacie odpocząć co daje nam regeneracje, wiec trzeba skupić się na interakcji, chcemy wchodzić do tej chaty a ma to sporo błedów”*. O 03:12: *„mamy dodaną grafikę a nie obiekt chaty i to chcemy póżniej dodać”*. O 11:50: *„jestem ciekaw co można teraz wyciągnąć z tej chaty”*.

## Skąd błędy ze zdjęć (sprawdzone w kodzie, Claude, 24 XI)

Zdjęcia: [zrzuty/2026-11-24-chata-1.png](zrzuty/2026-11-24-chata-1.png), [-2](zrzuty/2026-11-24-chata-2.png), [-3](zrzuty/2026-11-24-chata-3.png).

- **Bohater wchodzi „na dach”.** Dla ruchu chata to tylko pas wzdłuż przedniej ściany: prostokąt od punktu (178, 585) do (838, 692) obrazu, czyli około 66 jednostek głębokości (`zderzenia` w [gra/swiat.js](../gra/swiat.js)). Za tym pasem można iść w głąb chaty, a tam na obrazie jest już dach.
- **Bohater znika albo chowa się za kominem.** Gdy stoi za chatą, chata go zasłania, a pokazuje go tylko „duch” (przezroczysta kopia). Duch włącza się jednak tylko w prostokącie od 150 do 860 piksela obrazu w poziomie ([gra/rysowanie.js](../gra/rysowanie.js), „duch bohatera”). Komin i prawy róg chaty są poza nim, więc tam bohater znika bez śladu.
- **Bohater „na dachu”** na drugim zdjęciu to właśnie duch: kopia rysowana nad chatą, gdy bohater stoi w środku jej obrysu.

## Plan

1. **Chata jako bryła.** Podstawa chaty z obrazu (wielokąt ścian na ziemi) blokuje ruch, więc do środka nie da się wejść inaczej niż drzwiami. Za chatą można stać i wtedy widać jasną sylwetkę bohatera, także przy kominie (zrobione, niżej). Jeśli sylwetka nie wystarczy, chata w miejscu bohatera może robić się półprzezroczysta.
2. **Drzwi i wejście.** Przy drzwiach pojawia się napis „Wejdź” (komputer: E, telefon: przycisk). Wejście to ściemnienie ekranu i wnętrze chaty.
3. **Wnętrze.** Jeden obraz z Gemini (polecenie niżej): izba z paleniskiem, ławą i posłaniem. Bohater chodzi po izbie, a wyjście jest drzwiami (zrobione, niżej).
4. **Odpoczynek.** Przy palenisku albo na posłaniu: bohater siada, życie i wytrzymałość wracają z czasem. Tylko w ciszy między etapami nocy (decyzja Patryka, niżej). Pierwsza wersja działa bez obrazu wnętrza (niżej).
5. **Interakcja ogólnie.** Ten sam mechanizm (punkt, promień, napis, czynność) posłuży potem do skrzyń, ludzi do ratowania i ogniska.

## Zrobione

- **24 XI: bryła i duch.** Ruch blokuje teraz cała bryła chaty: od przedniej ściany w głąb do 380 piksela obrazu, razem z kominem i prawą ścianą (`CHATA.sciana` w [gra/swiat.js](../gra/swiat.js)). Za chatą bohatera widać jako jasną, płaską sylwetkę na całej szerokości chaty, także przy kominie; wcześniej była to przezroczysta kopia, która wyglądała jak bohater na dachu. Sprawdzone zrzutami: idąc na drzwi, bohater staje przy ścianie, a postawiony w środku chaty zostaje wypchnięty za nią. Bot przechodzi noc jak wcześniej.

- **24 XI: drzwi i odpoczynek, na razie bez obrazu wnętrza.** Przed drzwiami pojawia się przycisk „Wejdź do chaty” (komputer: E, telefon: przycisk). W środku ekran ściemnia się do blasku paleniska, życie wraca o 7 na sekundę, wytrzymałość od razu jest pełna, a nic nie może zranić. Ruch albo E wyprowadza. Cisza przed następnym etapem płynie w chacie trzy razy wolniej (4 s ciszy to w środku około 13 s, czyli do około 90 życia), a gdy przychodzi etap, bohater sam wychodzi przed drzwi: *„Coś drapie w drzwi. Trzeba wyjść.”* W walce przycisk mówi „Nie teraz, potwory blisko”. Liczby są w `CHATA_ODPOCZYNEK` w [gra/dane.js](../gra/dane.js). Sprawdzone w przeglądarce na komputerze i telefonie: wejście, leczenie, wyjście przy etapie, zamknięte w walce.

- **24 XI, 12:15, Patryk: przezroczysty obok chaty.** *„stojac przy chcacie widać już, jak pośtać robi się przesroczysta”* ([zrzut](zrzuty/2026-11-24-chata-4-przezroczysta.png)). Przyczyna: obraz chaty ma też podwórko (ubitą ziemię, cień na prawo od komina, płot), a cały obraz był rysowany nad bohaterem, gdy ten stał wyżej niż przednia ściana. Ciemna ziemia przykrywała go więc obok chaty, a sylwetkę włączał prostokąt. Teraz obraz jest cięty na dwie warstwy wielokątem `DOM` w [gra/rysowanie.js](../gra/rysowanie.js): podwórko leży na ziemi pod wszystkimi, a nad bohaterem jest tylko sam dom (dach, ściany, komin, dym, drewno, beczka). Sylwetka włącza się, gdy tułów bohatera wypada na nieprzezroczysty piksel domu. Sprawdzone zrzutami: obok prawego boku i przy beczce bohater jest normalny, za dachem i przy kominie widać sylwetkę.

- **24 XI: izba z obrazu Gemini.** Obraz od Patryka: [grafika/wnetrze.webp](../grafika/wnetrze.webp), źródło w [grafika/zrodla/chata-wnetrze.jpg](../grafika/zrodla/chata-wnetrze.jpg) z opisem. Wejście drzwiami to krótkie ściemnienie i izba na cały ekran; bohater chodzi po podłodze, posłanie, palenisko, ława, stół i beczka zatrzymują ruch (`WNETRZE` w [gra/swiat.js](../gra/swiat.js)). Przy posłaniu przycisk „Odpocznij na posłaniu”: bohater śpi pod wilczą skórą, ekran przygasa. Liczby w `CHATA_ODPOCZYNEK` ([gra/dane.js](../gra/dane.js)): w izbie 2 życia na sekundę, we śnie 9, cisza płynie w chacie z tempem 0,3. Wstaje E albo ruch, wychodzi drzwiami („Wyjdź”), a gdy przychodzi etap, i tak budzi się i staje przed drzwiami. Na wąskim telefonie kamera idzie za bohaterem po izbie. Sprawdzone w przeglądarce na komputerze i telefonie: wejście, chodzenie, sen, wstanie, wyjście, wyrzucenie przez etap; bot półtoraręcznym: świt 5/5, rany 8,6 (jak wcześniej).
  Zmiana wobec pierwszej wersji: samo wejście już nie leczy szybko (było 7 na sekundę), szybko leczy dopiero sen na posłaniu.

- **24 XI, 12:29, Patryk: za mało czasu w izbie.** *„jest za malo czasu żeby cokolwiek zobaczyć w tym domku i ocenić bo cię szybko z niego wyrzuca, moża zrobić ze dopiero walka się rozpocznie jak wychodzi się z chaty”*. Teraz w chacie cisza stoi (`tempoCiszy: 0`), więc nic nie wyrzuca. Po wyjściu zostają co najmniej 3 s ciszy (`ciszaPoWyjsciu`), żeby odejść od drzwi, i dopiero wtedy rusza etap. Napis we śnie: „Noc poczeka, aż wyjdziesz.” Uwaga na później: w ciszy da się teraz wyleczyć do pełna przed każdym etapem; jeśli to za łatwo, można ograniczyć sen (np. raz na noc albo do określonego życia). Sprawdzone w przeglądarce: 4 s w izbie przy 1 s ciszy, cisza się nie zmienia; po wyjściu 3 s i etap biegnie dalej.

- **24 XI, 13:14, Patryk: wnętrze jak w Tibii.** *„jak wchodzisz przez drzwi to tylko ci chowa dach i tak jabyś widział przez ten dach”*, o 13:15: *„jak się bedziesz oddalał od chaty to będziesz widział dach, ale wchodząc będzie znikać”*. Czyli bez osobnego ekranu: bohater wchodzi drzwiami na tej samej mapie, dach (i górna część ścian) znika, widać izbę z góry, a po wyjściu dach wraca.
  **Czego do tego trzeba (Claude).** Drugiego obrazu tej samej chaty, w tym samym kadrze i tej samej wielkości, ale bez dachu, z widocznym wnętrzem. Gra położy go pod obecnym obrazem i będzie płynnie zdejmować dach, gdy bohater stanie w środku. Ruch w środku: ściany z obrysu chaty, sprzęty jak w obecnej izbie, posłanie działa tak samo. Obecna izba na osobnym ekranie zostaje, dopóki nie przyjdzie obraz. Gemini może przesunąć albo lekko przeskalować chatę; do kilku procent dopasuję to sam.
  Polecenie (do Gemini, z załączonym [chata-wzor.png](../grafika/chata.webp) i obrazem izby jako drugim wzorem):

  > Using the first attached image of the hut, draw exactly the same hut from exactly the same camera angle, at exactly the same size and in exactly the same place in the frame, in exactly the same drawing style, but with the whole roof and the chimney top removed and the walls cut off at about chest height, like a cutaway dollhouse, so we look down into the single room. Inside, use the room from the second attached image: a stone hearth with a low fire at the back wall, a straw bed with a wolf fur on the left, a bench, a table and a barrel on the right, the door in the front wall where it is now. Keep everything outside the hut identical: the yard, the woodpile, the barrel, the fence and the ground. Transparent background like the first image. No people, no text.

## Decyzje

- **Kiedy wolno odpoczywać w chacie?** Patryk, 24 XI (karta wyboru): *„W ciszy między etapami nocy”*.

## Polecenie do Gemini: wnętrze chaty

Wzór stylu: [grafika/chata.webp](../grafika/chata.webp).

> Using the attached image of the hut as the style reference, draw the inside of this same small medieval hut at night, in exactly the same drawing style. One room seen from slightly above, the whole floor visible: a stone hearth with a low fire in the back wall, a rough wooden bench and table, a straw bed with a wolf fur, hanging herbs, a barrel, the door in the front wall on the bottom edge of the image. Warm firelight, deep shadows in the corners. No people, no text.
