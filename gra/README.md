# Kod gry

Każdy plik robi jedną rzecz. Logika nie wie nic o rysowaniu, a rysowanie niczego w logice nie zmienia, więc oba da się sprawdzać osobno (bot w [../testy/bot-noc.mjs](../testy/bot-noc.mjs) gra samą logiką).

| Plik | Co robi |
| --- | --- |
| [dane.js](dane.js) | **liczby gry:** bohater, ciosy, blok, unik, ghul, kolos, etapy nocy. Tu zmieniamy siłę i trudność |
| [swiat.js](swiat.js) | mapa: wielkość, chata, płot, ognisko, mgły, las i zderzenia z nimi |
| [walka.js](walka.js) | logika: ruch, cięcia, blok, parowanie, unik, Krew za krew, Miecz który waży, wrogowie i etapy nocy |
| [rysowanie.js](rysowanie.js) | obraz w PixiJS: ziemia, las, chata, postacie, krew, mgła, noc z wyciętym światłem, deszcz |
| [obrazki.js](obrazki.js) | rysunki robione kodem, dopóki nie ma obrazów z Gemini: sosny, ghul, kolos, światło, mgła |
| [wejscie.js](wejscie.js) | sterowanie: klawiatura i mysz, kciuki i przyciski na telefonie |
| [hud.js](hud.js) | pasek życia i sił, nazwa etapu, myśl bohatera, licznik klatek |
| [dzwiek.js](dzwiek.js) | dźwięki składane w przeglądarce, bez plików |
| [main.js](main.js) | składa wszystko razem: wczytuje PixiJS i obraz chaty, prowadzi pętlę gry, pauzę i koniec nocy |

Strona gry to [../index.html](../index.html). Obraz chaty leży w [../grafika/chata.webp](../grafika/chata.webp).

**Jak to działa w jednej klatce:** `main.js` pyta `wejscie.js`, co gracz wcisnął, `walka.js` przesuwa świat o ułamek sekundy, a `rysowanie.js` i `hud.js` pokazują, co z tego wyszło. Zdarzenia z walki (cięcie, trafienie, parowanie, rana) idą do dźwięków i do napisów nad głową.

**Noc w grze** dokłada silnik: obrazy są w świetle dnia, a gra zalewa ekran ciemnością i wycina w niej światło ogniska, okna i bohatera. To kierunek z „Próby chaty” (dziennik pomysłów, 22 XI).
