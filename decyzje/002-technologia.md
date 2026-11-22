# 002: Technologia gry

**Data:** 22 XI 2026 · **Proponuje:** Claude · **Status:** propozycja, czeka na akceptację Patryka

## Pytanie

Na czym budujemy nową wersję?

## Propozycja

Zwykły JavaScript w przeglądarce, podzielony na małe moduły, z grafiką rysowaną na płótnie (Canvas). Bez dużego silnika i bez instalowania czegokolwiek, żeby zagrać. Gra jest publikowana automatycznie przez GitHub Pages pod stałym adresem, na przykład `salu232.github.io/Noc-Najemnika`.

Testy działają osobno i grają w grę jak człowiek, w prawdziwej przeglądarce, także w rozmiarze ekranu telefonu.

## Jakie były możliwości

| Możliwość | Plusy | Minusy |
| --- | --- | --- |
| **Zwykły JavaScript i Canvas, moduły** (propozycja) | działa od razu w przeglądarce na telefonie; możemy przenieść kod walki z wersji 1; nic nie trzeba instalować, żeby zagrać; kod jest prosty do czytania i nauki | sami piszemy rzeczy, które silnik dałby gotowe; przy bardzo dużych hordach może zabraknąć wydajności |
| **Phaser** (silnik gier 2D w przeglądarce) | gotowe sceny, dźwięk, kamera i szybsze rysowanie przez kartę graficzną | trzeba się uczyć silnika; kod walki z wersji 1 trzeba przepisać pod jego zasady |
| **Godot** (pełny silnik z edytorem) | wygodny edytor map, dobre narzędzia | wersja przeglądarkowa jest ciężka i wolno się ładuje na telefonie; zmiana całego sposobu pracy |

## Dlaczego ta propozycja

1. **Lekcja z historii projektów Jozza:** prosta, kompletna gra wygrała z ambitną architekturą ([docs/lekcje.md](../docs/lekcje.md), punkt 1). Silnik to dużo nowej aparatury, zanim powstanie coś do grania.
2. **Rdzeń walki już mamy.** Napisaliśmy go w zwykłym JavaScripcie i ludzie go chwalą. Przeniesiemy go do modułów zamiast pisać od zera.
3. **Telefon:** prawdziwa strona pod własnym adresem pozwala włączyć pełny ekran i dodać grę do ekranu głównego jak aplikację. W podglądzie w ramce to często było zablokowane.
4. **Nauka:** każdy moduł to krótki plik o jednej rzeczy (`walka.js`, `wrogowie.js`, `dialog.js`). Łatwo zajrzeć i zrozumieć.

## Ryzyko i co z nim robimy

Największe ryzyko to wydajność przy hordach. Dlatego pierwszym technicznym testem będzie 100 wrogów na ekranie telefonu. Rysowanie trzymamy w jednym osobnym module. Jeśli Canvas nie da rady, podmienimy tylko ten moduł na szybszy (na przykład PixiJS, który rysuje przez kartę graficzną), bez przepisywania reszty gry.

## Jak to cofnąć

Do pierwszego szkieletu gry zmiana technologii nic nie kosztuje. Później koszt rośnie, dlatego decydujemy teraz.
