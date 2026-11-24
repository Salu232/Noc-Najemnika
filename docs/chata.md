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
3. **Wnętrze.** Jeden obraz z Gemini (polecenie niżej): izba z paleniskiem, ławą i posłaniem. Bohater chodzi po izbie, a wyjście jest drzwiami.
4. **Odpoczynek.** Przy palenisku albo na posłaniu: bohater siada, życie i wytrzymałość wracają z czasem, a pasek klątwy nie rośnie. Kiedy wolno odpoczywać, decyduje Patryk (pytanie niżej).
5. **Interakcja ogólnie.** Ten sam mechanizm (punkt, promień, napis, czynność) posłuży potem do skrzyń, ludzi do ratowania i ogniska.

## Zrobione

- **24 XI: bryła i duch.** Ruch blokuje teraz cała bryła chaty: od przedniej ściany w głąb do 380 piksela obrazu, razem z kominem i prawą ścianą (`CHATA.sciana` w [gra/swiat.js](../gra/swiat.js)). Za chatą bohatera widać jako jasną, płaską sylwetkę na całej szerokości chaty, także przy kominie; wcześniej była to przezroczysta kopia, która wyglądała jak bohater na dachu. Sprawdzone zrzutami: idąc na drzwi, bohater staje przy ścianie, a postawiony w środku chaty zostaje wypchnięty za nią. Bot przechodzi noc jak wcześniej.

## Do decyzji Patryka

- **Kiedy wolno odpoczywać w chacie?** Propozycja Claude: tylko w ciszy między etapami nocy. Pokonasz falę i masz chwilę, żeby się podleczyć, ale w środku walki chata nie jest kryjówką.

## Polecenie do Gemini: wnętrze chaty

Wzór stylu: [grafika/chata.webp](../grafika/chata.webp).

> Using the attached image of the hut as the style reference, draw the inside of this same small medieval hut at night, in exactly the same drawing style. One room seen from slightly above, the whole floor visible: a stone hearth with a low fire in the back wall, a rough wooden bench and table, a straw bed with a wolf fur, hanging herbs, a barrel, the door in the front wall on the bottom edge of the image. Warm firelight, deep shadows in the corners. No people, no text.
