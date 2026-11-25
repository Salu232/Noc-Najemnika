# Wycina postacie z filmów Przemka (Gemini, białe tło) i składa klatki animacji w obrazy dla gry.
# Uruchomienie z korzenia repo: python3 narzedzia/wytnij-z-filmow.py
# Potrzebne: ffmpeg oraz Python z pakietami pillow, numpy i scipy (pip install pillow numpy scipy).
# Wynik: dla bohatera grafika/bohater.webp i gra/klatki-bohatera.js, dla potworów grafika/ghul.webp,
# grafika/kolos.webp i wspólny gra/klatki-wrogow.js (gdzie leży każda klatka, gdzie postać ma stopy
# i które klatki tworzą którą animację).
import json, os, subprocess, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

ZRODLA = 'grafika/zrodla'
# Filmy mają 24 klatki na sekundę i 4 sekundy (96 klatek). Animacja to (film, numery klatek liczone od 1).
# We wszystkich filmach postać stoi bokiem do nas i patrzy w prawo.
POSTACIE = {
    'bohater': {
        'obraz': 'grafika/bohater.webp',
        'stopy': (295, 345),      # punkt między stopami w spoczynku, w pikselach filmu zmniejszonego o połowę (640 × 360)
        'wys_film': 340,          # tyle pikseli ma stojący bohater w filmie zmniejszonym o połowę
        'wys_swiat': 100,         # tyle jednostek świata ma w grze (od czubka głowy do stóp)
        'skala_obrazu': 0.5,      # klatki do gry są jeszcze o połowę mniejsze: postać ma około 170 px wysokości
        'animacje': {
            'spoczynek': ('film-oddech', list(range(35, 74, 3))),          # jeden pełny oddech: klatka 75 wygląda jak 35
            'bieg':      ('film-bieg',   list(range(47, 72))),             # dwa kroki biegu: klatka 72 wygląda jak 47
            # bieg z mieczem w dłoni (Patryk z Flow, 24 XI 15:09, z klatki 88 filmu cięcia): pełny cykl 24 klatki, klatka 33 wygląda jak 9
            'bieg_miecz': ('film-bieg-miecz', list(range(9, 33))),
            'chod_tyl':  ('film-chod-2', list(range(47, 80, 2))),          # idzie od nas, plecami: klatka 80 wygląda jak 47
            'chod_przod': ('film-chod-przod', list(range(18, 52, 2))),   # idzie do nas, przodem: klatka 52 wygląda jak 18 (cykl 34 klatki)
            'wyciaga':  ('film-miecz-wyciaga', list(range(19, 61, 2))),   # przodem do nas: ręka na rękojeści, wyciąga, unosi przed siebie; chowanie to ta sama animacja wstecz
            # spokojna postawa poza walką (Patryk, 24 XI 14:54: „jak stoi i nie walczy … to normalnie stoi”): początek filmu
            # wyciągania, zanim ręka sięgnie po miecz. Stoi prosto, przodem do nas, a z tej pozy płynnie zaczyna się wyciąganie.
            'stoi':     ('film-miecz-wyciaga', [1, 3, 5, 7, 9]),
            'zamach':    ('film-ciecie', [4, 8, 12, 16, 20, 24, 28, 31, 34, 37]),   # unosi miecz i odprowadza go nisko w lewo, za siebie
            'ciecie':    ('film-ciecie', [39, 41, 43, 45, 47, 49, 52, 55]),        # zamaszyste cięcie w prawo, ręka wyciągnięta
            'powrot':    ('film-ciecie', [58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94]),
            'rana':      ('film-rana',   [7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37]),
            'blok':      ('film-rana',   [49, 52, 55]),                    # miecz trzymany poziomo przed sobą (zapas, gdy nie ma filmu bloku)
            # blok z filmu Patryka z Flow (24 XI, 15:25), z klatki 88 filmu cięcia: unosi miecz poziomo przed głowę,
            # trzyma, cios w ostrze odpycha go o pół kroku. Klatki 35–39 pomijamy: złoty błysk uderzenia zasłania ciało.
            'blok_unosi': ('film-blok', [3, 5, 7, 9, 11, 13, 15, 17]),
            'blok_trzyma': ('film-blok', [17, 19, 21, 23, 25, 27, 29, 31, 33]),
            'blok_cios': ('film-blok', [41, 43, 45, 47, 49, 51, 53, 55, 57]),
            # Cofanie się w gardzie (Patryk z Flow, Veo, 25 XI 12:48, z klatki 88 filmu cięcia): w filmie idzie w miejscu do przodu,
            # więc gra puszcza go wstecz. Pętla: klatka 125 wygląda jak 73 (dwa kroki). Stopy idą za środkiem ciała.
            # cofanie w gardzie oburącz (Patryk z Veo, 25 XI 16:17, z kadru bloku). Veo kazał mu iść do przodu, więc klatki lecą wstecz:
            # 41→107 to pełny cykl dwóch kroków (prawa noga z przodu w 41 i 109). Stary film-cofa miał miecz w jednej ręce.
            'cofa': ('film-miecz-cofa-oburacz', list(range(107, 40, -2))),
            # postawa bojowa: miecz uniesiony przed sobą jak na końcu powrotu po cięciu (Patryk, 24 XI: w walce miecz ma być wyciągnięty)
            'gotowosc':  ('film-ciecie', [82, 85, 88, 91, 94]),
            # przewrót w przód przy uniku: od przysiadu do lądowania w przysiadzie z mieczem przed sobą
            'przewrot':  ('film-przewrot', [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52]),
            # przewrót w dół (do nas) i w górę (od nas), filmy Patryka z Flow, 24 XI: w kadrze prawie nie przesuwa się,
            # więc stopy stoją w miejscu, a drogę robi gra. Od przysiadu przez koziołek do wstania.
            'przewrot_przod': ('film-przewrot-przod', list(range(18, 61, 3))),
            # W górę: sam koziołek (klatki 19–33) dostaje każdą klatkę filmu, a przysiad i wstawanie co drugą-trzecią,
            # żeby w 0,4 s uniku było go widać (Patryk, 24 XI 14:39: „jeszcze [nie] widać takiego fajnego przewrotu”).
            'przewrot_tyl':   ('film-przewrot-tyl', [14, 16, 18] + list(range(19, 34)) + [35, 37, 40, 43, 47]),
            # upadek po śmierci: osuwa się na kolana i pada na bok
            'upadek':    ('film-upadek', [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 76]),
            # atak klątwy (R): unosi przeklętą prawą rękę, wali pięścią w ziemię, wstaje. Wybuch rysuje gra:
            # klatki 31–61 filmu pomijamy, bo fioletowy wybuch zasłania nogi.
            'klatwa_lad':    ('film-magia', [4, 8, 12, 16, 19, 22, 25, 28]),
            'klatwa_uderz':  ('film-magia', [64, 67, 70]),
            'klatwa_wstaje': ('film-magia', [73, 76, 79, 82, 85, 88, 91]),
        },
        # W przewrocie bohater przesuwa się w kadrze o pół swojego wzrostu. W grze drogę przewrotu robi sam ruch,
        # więc stopy tych klatek idą za środkiem ciała: ciało zostaje tam, gdzie gra je stawia.
        'sledz': {'przewrot', 'cofa'},
    },
    # Bohater z mieczem dwuręcznym (Patryk z Flow, 24 XI 19:01, z klatki 88 filmu cięcia): osobny obraz, gra wczytuje go
    # obok zwykłego i bierze z niego te animacje, gdy w walce wybrany jest miecz dwuręczny. Pozostałe animacje zostają zwykłe.
    'bohater_wielki': {
        'obraz': 'grafika/bohater-wielki.webp',
        'stopy': (295, 345), 'wys_film': 340, 'wys_swiat': 100, 'skala_obrazu': 0.5,
        'animacje': {
            'zamach':     ('film-wielki-ciecie', [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 50]),   # unosi miecz nad głowę i odprowadza go nisko w lewo
            'ciecie':     ('film-wielki-ciecie', [52, 58, 59, 60, 62, 64, 66]),   # szerokie cięcie w prawo; 53–57 pomijamy: smuga zostawia plamy
            'powrot':     ('film-wielki-ciecie', [70, 73, 76, 79, 82, 85, 88, 91, 94, 96]),
            'gotowosc':   ('film-wielki-ciecie', [88, 90, 92, 94, 96]),
            # pełny cykl 24 klatki (klatka 34 wygląda jak 10); nogi mijają się przy 0,10 i 0,64 cyklu, jak w zwykłym biegu z mieczem
            'bieg_miecz': ('film-wielki-bieg', list(range(10, 34))),
            # Film bloku (24 XI 19:01) to w środku pchnięcie (Patryk: „blokowanie wygląda jak atak”). Bierzemy z niego tylko
            # koniec: miecz postawiony pionowo przed ciałem. Unosi go z gardy (klatki wstecz), trzyma, cios lekko go odpycha.
            'blok_unosi':  ('film-wielki-blok', [96, 90, 84, 80, 77, 75]),
            'blok_trzyma': ('film-wielki-blok', [71, 72, 73, 74, 75]),
            'blok_cios':   ('film-wielki-blok', [72, 75, 78, 81, 78, 75, 72]),
            # cofanie się w gardzie (Patryk z Flow, 24 XI 19:46): tylna noga w tył, przednia dostawiona; klatka 91 wygląda jak 56.
            # W kadrze bohater sam odchodzi w lewo, więc stopy idą za środkiem ciała, a drogę robi gra.
            'cofa':        ('film-wielki-cofa', list(range(56, 91, 2))),
            # Filmy Patryka z Flow, Veo, 25 XI 13:59, z kadru z mieczem uniesionym przy barku.
            # Unik: rzuca się w bok, przetacza i wstaje. Leżenie (klatki 40–56) pomijamy, żeby w czasie uniku było widać ruch.
            'przewrot':    ('film-wielki-unik', [16, 20, 24, 28, 32, 36, 44, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112]),
            # Trafiony: zgina się, miecz opada, potem wraca do gardy.
            'rana':        ('film-wielki-rana', [22, 26, 30, 34, 38, 42, 48, 56, 66, 76, 86, 96, 104, 110, 116, 122, 128]),
            # Klątwa: wyciąga lewą dłoń przed siebie. Fioletowy wybuch z filmu (klatki 68–124) pomijamy, wybuch rysuje gra.
            'klatwa_lad':    ('film-wielki-klatwa', [24, 28, 32, 36, 40, 44, 48]),
            'klatwa_uderz':  ('film-wielki-klatwa', [52, 56, 58]),
            'klatwa_wstaje': ('film-wielki-klatwa', [128, 136, 144, 152, 160, 168, 172, 176, 180, 184]),
            # Chowanie na plecy (Veo, 25 XI 14:13, z kadru z klatki 0 filmu cięcia). Wyciąganie to ta sama animacja wstecz, jak przy zwykłym.
            # Klatki 60–104 pomijamy: Veo dorysował tam drugi miecz w ręce. Po 56 ręka puszcza rękojeść nad barkiem, od 108 stoi z pustymi rękami.
            'wyciaga':     ('film-wielki-chowa', [121, 117, 113, 109, 57, 53, 49, 45, 41, 37, 33, 29, 25, 21, 17, 13, 9, 5, 1]),
            'stoi':        ('film-wielki-chowa', [125, 133, 141, 149, 157]),
            # Przewroty w dół (do nas) i w górę (od nas): druga próba z Veo (25 XI 15:08, prompt z osią czasu). Veo i tak zrobił
            # stanie na rękach zamiast koziołka (Patryk: „stanie na rękach zrobił”), więc bierzemy tylko przysiad, zwinięcie
            # w kulę i wstanie, a klatki z nogami w górze pomijamy (przód 91–115, tył 56–70). Drogę uniku robi gra.
            # 25 XI 20:15: środek koziołka (kula, przetoczenie przez plecy, wyjście) z póz Gemini; film składa narzedzia/przewrot-z-gemini.py
            'przewrot_przod': ('film-wielki-przewrot-przod-g', list(range(1, 14))),
            'przewrot_tyl':   ('film-wielki-przewrot-tyl-g', list(range(1, 14))),
        },
        'sledz': {'cofa', 'przewrot'},
    },
    'ghul': {
        'obraz': 'grafika/ghul.webp',
        'stopy': (285, 345), 'wys_film': 317, 'wys_swiat': 72, 'skala_obrazu': 0.4,
        'animacje': {
            'chod':       ('ghul-chod', list(range(39, 84, 3))),           # pełny cykl: klatka 84 wygląda jak 39
            'zamach':     ('ghul-atak', [7, 10, 13, 16, 19, 22, 25]),      # przyczaja się
            'skok':       ('ghul-atak', [28, 30, 32, 34, 36, 38, 40]),     # skacze z pazurami
            'odpoczynek': ('ghul-atak', [43, 46, 49, 52, 55]),             # ląduje i wraca do przysiadu
            'trafienie':  ('ghul-trafienie', [7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52]),
            'smierc':     ('ghul-smierc', list(range(13, 80, 3))),         # krew, przewraca się na plecy, leży
            'trup':       ('ghul-smierc', [88]),
        },
    },
    'kolos': {
        'obraz': 'grafika/kolos.webp',
        'stopy': (270, 350), 'wys_film': 344, 'wys_swiat': 165, 'skala_obrazu': 0.62,
        'animacje': {
            'chod':       ('kolos-chod', list(range(47, 95, 3))),          # pełny cykl: klatka 95 wygląda jak 47
            'zamach':     ('kolos-atak', [28, 30, 32, 34, 36, 38, 40, 42, 44]),   # unosi pięści nad głowę
            'skok':       ('kolos-atak', [46, 49, 52, 55, 58]),            # wali w ziemię
            'odpoczynek': ('kolos-atak', [61, 64, 67, 70, 73, 76, 79, 82, 85]),
            'trafienie':  ('kolos-trafienie', list(range(28, 62, 3))),   # od 28: wcześniej z ręki leci łańcuch
            'smierc':     ('kolos-smierc', list(range(25, 74, 3))),        # chwieje się, klęka, pada na twarz
            'trup':       ('kolos-smierc', [85]),
        },
    },
    # Boss ostatniej nocy: rycerz, który był tu przed nami (kartki dziennika), a w połowie walki klątwa robi z niego potwora.
    # Filmy Patryka z Veo, 25 XI wieczorem (grafika/zrodla/boss/rycerz-*.mp4). Faza 1: cięcie poziome i uderzenie w ziemię,
    # faza 2 (po przemianie): pchnięcie pazurem i cięcie z czerwoną błyskawicą. Ataki mają nazwy z przyrostkiem _<atak>.
    'rycerz': {
        'obraz': 'grafika/rycerz.webp',
        'stopy': (318, 324), 'wys_film': 293, 'wys_swiat': 150, 'skala_obrazu': 0.5,
        'sledz': ('chod', 'chod2'), 'srodek': 'glowa',
        'animacje': {
            'chod':                ('boss/rycerz-chod-a', list(range(37, 182, 4))),          # pierwsze 1,5 s obraca się w miejscu
            'zamach_ciecie':       ('boss/rycerz-ciecie-poziome', list(range(46, 71, 3))),   # unosi miecz za plecy
            'skok_ciecie':         ('boss/rycerz-ciecie-poziome', [73, 76, 79, 82, 94, 103, 106, 109, 112, 115]),   # cięcie w poprzek i z powrotem
            'odpoczynek_ciecie':   ('boss/rycerz-ciecie-poziome', list(range(118, 158, 4))),
            'zamach_uderzenie':    ('boss/rycerz-uderzenie-w-ziemie', list(range(19, 68, 4))),   # miecz nad głową
            'skok_uderzenie':      ('boss/rycerz-uderzenie-w-ziemie', [70, 73, 76, 79, 82]),
            'odpoczynek_uderzenie': ('boss/rycerz-uderzenie-w-ziemie', list(range(88, 134, 4))),
            'trafienie':           ('boss/rycerz-zachwianie', list(range(13, 74, 4))),
            'przemiana':           ('boss/rycerz-przemiana-b', list(range(25, 188, 4))),     # kuli się, pęka, rośnie mu pazur i kolce
            'chod2':               ('boss/rycerz-f2-chod', list(range(25, 146, 4))),
            'zamach_pazur':        ('boss/rycerz-f2-pazur-pchniecie', [16, 19, 22, 25, 28, 31]),   # 34–43: dziwne machnięcie mieczem, pomijamy
            'skok_pazur':          ('boss/rycerz-f2-pazur-pchniecie', [46, 49, 52, 55, 58, 64]),
            'odpoczynek_pazur':    ('boss/rycerz-f2-pazur-pchniecie', list(range(70, 110, 4))),
            'zamach_blyskawica':   ('boss/rycerz-f2-pazur-i-ciecie-blyskawica', [40, 46, 52, 58, 64, 70, 73, 76, 79, 82, 85, 88]),
            'skok_blyskawica':     ('boss/rycerz-f2-pazur-i-ciecie-blyskawica', [91, 94, 97, 100, 103, 106, 109]),
            'odpoczynek_blyskawica': ('boss/rycerz-f2-pazur-i-ciecie-blyskawica', list(range(112, 161, 4))),
            'smierc':              ('boss/rycerz-f2-smierc-na-ziemi', list(range(25, 146, 4))),   # klątwa pali go od środka, pada
            'trup':                ('boss/rycerz-f2-smierc-na-ziemi', [181]),
        },
    },
    # Wiedźma z bagien (Patryk: obraz z Gemini i cztery filmy z Veo, 25 XI 14:45). W filmach ataku, trafienia i śmierci
    # patrzy w prawo jak w chodzie (Claude najpierw błędnie je odwrócił). Z ataku bierzemy unoszenie kostura, kulę i wyrzut ręki;
    # fioletowy promień z filmu (klatki 85–117) pomijamy, pocisk rysuje gra. Błyski trafienia (klatki 25–37) też.
    'wiedzma': {
        'obraz': 'grafika/wiedzma.webp',
        'stopy': (320, 349), 'wys_film': 340, 'wys_swiat': 108, 'skala_obrazu': 0.4,
        'animacje': {
            'chod':       ('wiedzma-chod', list(range(41, 100, 3))),      # klatka 100 wygląda prawie jak 41
            'zamach':     ('wiedzma-atak', [9, 17, 25, 33, 41, 49, 57, 65]),
            'skok':       ('wiedzma-atak', [81, 85, 89]),                  # wypuszcza kulę (dalej w filmie leci promień, ten pomijamy)
            'odpoczynek': ('wiedzma-atak', [121, 129, 137, 145, 153]),
            'trafienie':  ('wiedzma-trafienie', [41, 45, 49, 53, 57, 61, 65, 73, 81, 89, 97, 105, 113, 121, 137, 153]),
            'smierc':     ('wiedzma-smierc', [41, 45, 49, 57, 65, 73, 81, 85, 89, 93, 97, 129, 137, 145, 153, 161, 177]),   # pada i rozpływa się w kałużę błota (Patryk, 25 XI 16:35); sam wybuch błota (101–125) pomijamy
            'trup':       ('wiedzma-smierc', [189]),
        },
    },
}
ODWROC = set()   # 25 XI 15:08: odwracanie filmów wiedźmy było błędem (patrzyła tyłem do bohatera), filmy zostają jak są
# W klatkach 39–49 cięcia smuga z filmu zasłania biodra i po jej zdjęciu zostaje dziura.
# Pas z dziurą bierzemy z klatki 55, w której bohater stoi w tym samym rozkroku, a smugi już nie ma.
LATKI = {('film-ciecie', k): 55 for k in (39, 41, 43, 45, 47, 49)}
# W filmie magii pod bohaterem zostaje popękana, jasna ziemia z fioletem. Zdejmujemy ją od wiersza 235 w dół.
ZIEMIA = {('film-magia', k) for k in [64, 67, 70, 73, 76, 79, 82, 85, 88, 91]}
PATRZY = 1                # w filmach postacie patrzą w prawo
# Film chodu przodem (Patryk z Flow, 24 XI) ma bohatera w innym miejscu kadru: środek ciała około 324 piksela, a nie 295.
# Stopy dla klatek tego filmu: środek kołysania ciała w cyklu i wiersz, w którym stopy mijają się na ziemi.
STOPY_FILMU = {**{f'boss/rycerz-f2-{n}': (337, 325) for n in ('chod', 'pazur-pchniecie', 'pazur-i-ciecie-blyskawica', 'smierc-na-ziemi')}, 'film-miecz-cofa-oburacz': (336, 346), 'wiedzma-atak': (340, 352), 'wiedzma-trafienie': (340, 352), 'wiedzma-smierc': (340, 352), 'film-chod-przod': (324, 346), 'film-miecz-wyciaga': (331, 340), 'film-przewrot-przod': (318, 327), 'film-przewrot-tyl': (321, 342), 'film-bieg-miecz': (292, 340), 'film-wielki-bieg': (285, 340), 'film-wielki-cofa': (283, 347)}
# W filmie wyciągania miecza (Patryk z Flow, 24 XI) bohater jest o 5% niższy w kadrze (321 zamiast 337 pikseli): klatki powiększamy.
# Przewroty w górę i w dół: stojący bohater ma tam 298 i 331 pikseli, a w chodzie przodem i plecami 327 i 340.
SKALA_FILMU = {'film-miecz-wyciaga': 1.05, 'film-przewrot-przod': 1.10, 'film-przewrot-tyl': 1.03, 'film-bieg-miecz': 1.04, 'film-wielki-cofa': 1.03}


def kluczuj(obraz, dol=0.80):
    """Zdejmuje białe tło, szary cień pod stopami i jasne efekty (smugi, iskry)."""
    a = np.asarray(obraz).astype(np.float32)
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    H = a.shape[0]
    prog = np.full(lum.shape, 150.0); prog[int(H * dol):] = 92.0         # przy stopach leży szary cień: tam próg niższy
    jasne = (lum > prog) & (sat < 26 + np.clip(lum - 150, 0, None) * 0.5)
    lab, n = ndimage.label(jasne)
    brzeg = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    tlo = np.isin(lab, brzeg[brzeg > 0])
    if n:                                                                    # białe dziury między nogami to też tło
        srednia = ndimage.mean(lum, lab, range(1, n + 1)); roz = ndimage.sum(jasne, lab, range(1, n + 1))
        tlo |= np.isin(lab, np.nonzero(((srednia > 225) & (roz > 12)) | ((srednia > 200) & (roz > 40)))[0] + 1)
    postac = ~tlo
    lab2, n2 = ndimage.label(postac, structure=np.ones((3, 3)))
    if n2 > 1:                                                               # drobiny i iskry odpadają
        roz = ndimage.sum(postac, lab2, range(1, n2 + 1))
        postac = np.isin(lab2, np.nonzero(roz > max(150, roz.max() * 0.02))[0] + 1)
    dz, nd = ndimage.label(~postac)
    if nd:                                                                   # małe odblaski na stali zostają
        rozd = ndimage.sum(~postac, dz, range(1, nd + 1))
        postac |= np.isin(dz, np.nonzero(rozd < 25)[0] + 1)
    blisko = postac & ~ndimage.binary_erosion(postac, iterations=1)         # krawędź zmieszana z bielą
    alfa = postac.astype(np.float32)
    am = np.clip((250 - lum) / 140, 0.2, 1.0)
    alfa[blisko] = am[blisko]
    kol = a.copy(); m = blisko
    kol[m] = np.clip((a[m] - (1 - alfa[m])[:, None] * 255) / alfa[m][:, None], 0, 255)
    return Image.fromarray(np.dstack([kol, alfa * 255]).astype(np.uint8), 'RGBA')


def klatki_filmu(film, numery, katalog):
    wybor = '+'.join(f'eq(n\\,{k - 1})' for k in numery)
    plik = film.replace('/', '_')                    # filmy bossa leżą w podkatalogu boss/
    wyj = os.path.join(katalog, plik + '-%03d.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{ZRODLA}/{film}.mp4', '-vf', f"select='{wybor}',scale=640:360:flags=lanczos" + (',hflip' if film in ODWROC else ''), '-vsync', '0', wyj], check=True)
    obrazy = [Image.open(os.path.join(katalog, f'{plik}-{i + 1:03d}.png')).convert('RGB') for i in range(len(numery))]
    if film.startswith('boss/'):                     # filmy bossa mają ciemną ramkę na brzegach kadru: zamalowujemy ją bielą
        for o in obrazy:
            a = np.asarray(o).copy(); a[:6] = a[-12:] = 255; a[:, :6] = a[:, -6:] = 255; o.paste(Image.fromarray(a))
    return obrazy


def zdejmij_ziemie(rgba, zrodlo, od=235):
    """Od wiersza `od` w dół zostawia tylko ciemne (buty, spodnie) i ciepłe piksele (dłoń), bez fioletu i bez cienkich pęknięć."""
    a = np.asarray(rgba).copy(); s = np.asarray(zrodlo).astype(np.float32)
    lum = s.mean(2); sat = s.max(2) - s.min(2); r, g, b = s[..., 0], s[..., 1], s[..., 2]
    fiolet = (b > g + 35) & (r > g + 10)
    pas = np.zeros(lum.shape, bool); pas[od:] = True
    m = (a[..., 3] > 0) & ~fiolet & ~(pas & ~((lum < 95) | ((r - b > 12) & (lum < 200))))
    m = np.where(pas, ndimage.binary_opening(m, structure=np.ones((5, 5))), m)
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    if n > 1: m = lab == np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1
    dz, nd = ndimage.label(~m)
    if nd: m |= np.isin(dz, np.nonzero(ndimage.sum(~m, dz, range(1, nd + 1)) < 40)[0] + 1)
    a[..., 3] = np.where(m, a[..., 3], 0)
    dziury = m & (a[..., 3] == 0)                                            # zatkane dziurki: kolor z filmu
    a[dziury, :3] = s[dziury].astype(np.uint8); a[dziury, 3] = 255
    return Image.fromarray(a, 'RGBA')


def latka(rgba, dawca):
    """Wiersze, w których klatce brakuje ciała, a dawca je ma, bierze w całości z dawcy (z zapasem 6 wierszy)."""
    a = np.asarray(rgba).copy(); d = np.asarray(dawca)
    ad, af = d[..., 3] > 0, a[..., 3] > 0
    wiersze = [y for y in range(a.shape[0] * 2 // 5, a.shape[0]) if ad[y].sum() > 20 and (ad[y] & ~af[y]).sum() / ad[y].sum() > 0.3]
    if wiersze:
        y0, y1 = max(0, wiersze[0] - 6), min(a.shape[0] - 1, wiersze[-1] + 6)
        a[y0:y1 + 1] = d[y0:y1 + 1]
    return Image.fromarray(a, 'RGBA')


def srodek_glowy(rgba):
    """Środek głowy i barków: mediana kolumn w górnej ćwierci postaci. Miecz i pazur odstają w bok, głowa nie,
    więc chód bossa nie kołysze się już na boki (Patryk, 25 XI 21:46: „chodzenie ułomne, z boku na bok”)."""
    a = np.asarray(rgba)[..., 3] > 128
    ys = np.nonzero(a.any(1))[0]; y0 = ys[0]; y1 = y0 + max(8, (ys[-1] - y0) // 4)
    return float(np.median(np.nonzero(a[y0:y1])[1]))


def odbiel(rgba):
    """Poświata i obwódka zmieszane z białym tłem filmu stają się półprzezroczyste w swoim kolorze
    (Patryk, 25 XI 21:46: przemiana „jakby źle dodana na tle gry”, jasna obwódka jak na drzewach Przemka)."""
    a = np.asarray(rgba).astype(np.float32); kol, al = a[..., :3], a[..., 3] / 255
    mn = kol.min(2); m = (al > 0) & (mn > 90)
    nowa = np.clip(1 - mn / 255, 0.02, 1)
    kol2 = np.clip((kol - 255 * (1 - nowa[..., None])) / nowa[..., None], 0, 255)
    kol[m] = kol2[m]; al = np.where(m, al * np.clip((1 - mn / 255) * 1.15, 0, 1), al)
    return Image.fromarray(np.dstack([kol, al * 255]).astype(np.uint8), 'RGBA')


def srodek(rgba):
    """Środek ciała w poziomie: średnia kolumna nieprzezroczystych pikseli."""
    a = np.asarray(rgba)[..., 3] > 0
    return float(np.nonzero(a)[1].mean())


def zrob(nazwa, cfg):
    animacje = cfg['animacje']
    potrzebne = {}                                   # każdy film czytamy raz: wszystkie potrzebne klatki razem z dawcami łat
    for film, numery in animacje.values(): potrzebne.setdefault(film, set()).update(numery)
    for (film, _), dawca in LATKI.items():
        if film in potrzebne: potrzebne[film].add(dawca)
    klatki, obrazy, anim = {}, [], {}
    with tempfile.TemporaryDirectory() as kat:
        kluczowane = {}
        for film, numery in potrzebne.items():
            numery = sorted(numery)
            for k, obr in zip(numery, klatki_filmu(film, numery, kat)):
                kluczowane[(film, k)] = zdejmij_ziemie(kluczuj(obr), obr) if (film, k) in ZIEMIA else kluczuj(obr)
                if film.startswith('boss/'): kluczowane[(film, k)] = odbiel(kluczowane[(film, k)])
        for an, (film, numery) in animacje.items():
            anim[an] = []
            sledz = an in cfg.get('sledz', ())
            stopy = STOPY_FILMU.get(film, cfg['stopy'])
            sr = srodek_glowy if cfg.get('srodek') == 'glowa' else srodek
            s0 = sr(kluczowane[(film, numery[0])]) if sledz else 0
            for k in numery:
                rgba = kluczowane[(film, k)]
                if (film, k) in LATKI: rgba = latka(rgba, kluczowane[(film, LATKI[(film, k)])])
                box = rgba.getbbox()
                kaw = rgba.crop(box)
                s = cfg['skala_obrazu'] * SKALA_FILMU.get(film, 1)
                w, h = max(1, round(kaw.width * s)), max(1, round(kaw.height * s))
                kaw = kaw.resize((w, h), Image.LANCZOS)
                sx = stopy[0] + (sr(rgba) - s0 if sledz else 0)
                klucz = f'{film}{k}' + ('s' if sledz else '')
                if klucz not in klatki:
                    klatki[klucz] = {'w': w, 'h': h, 'ax': round((sx - box[0]) / (box[2] - box[0]), 4), 'ay': round((stopy[1] - box[1]) / (box[3] - box[1]), 4)}
                    obrazy.append((klucz, kaw))
                anim[an].append(klucz)

    # układamy klatki półkami w obrazie szerokim na 2048 px
    SZER, ODST = 2048, 2
    x = y = ODST; wys_polki = 0
    for klucz, o in sorted(obrazy, key=lambda p: -p[1].height):
        if x + o.width + ODST > SZER: x = ODST; y += wys_polki + ODST; wys_polki = 0
        klatki[klucz]['x'], klatki[klucz]['y'] = x, y
        x += o.width + ODST; wys_polki = max(wys_polki, o.height)
    atlas = Image.new('RGBA', (SZER, y + wys_polki + ODST), (0, 0, 0, 0))
    for klucz, o in obrazy: atlas.paste(o, (klatki[klucz]['x'], klatki[klucz]['y']))
    atlas.save(cfg['obraz'], 'WEBP', quality=84, method=6)
    skala = cfg['wys_swiat'] / (cfg['wys_film'] * cfg['skala_obrazu'])
    print(nazwa, 'obraz', atlas.size, 'klatek', len(klatki), 'skala', round(skala, 4))
    return {'SKALA': round(skala, 4), 'PATRZY': PATRZY, 'ANIMACJE': anim, 'KLATKI': klatki}


OPIS = ('// Plik zrobiony przez narzedzia/wytnij-z-filmow.py z filmów Przemka. Nie poprawiaj ręcznie, tylko uruchom narzędzie jeszcze raz.\n'
        '// KLATKI: miejsce klatki w obrazie postaci (x, y, w, h) i stopy jako ułamek szerokości i wysokości (ax, ay).\n'
        '// ANIMACJE: które klatki po kolei tworzą daną animację. SKALA: ile jednostek świata ma jeden piksel obrazu. PATRZY: 1, bo w filmach postać patrzy w prawo.\n')

# Bez argumentów robi wszystkie postacie; z nazwami (np. bohater_wielki) tylko te.
import sys
wybrane = sys.argv[1:] or list(POSTACIE)
wynik = {nazwa: zrob(nazwa, cfg) for nazwa, cfg in POSTACIE.items() if nazwa in wybrane}
for nazwa, plik in (('bohater', 'gra/klatki-bohatera.js'), ('bohater_wielki', 'gra/klatki-bohatera-wielki.js')):
    if nazwa not in wynik: continue
    b = wynik.pop(nazwa)
    with open(plik, 'w', encoding='utf-8') as f:
        f.write(OPIS)
        f.write(f"export const SKALA = {b['SKALA']};\nexport const PATRZY = {b['PATRZY']};\n")
        f.write('export const ANIMACJE = ' + json.dumps(b['ANIMACJE'], ensure_ascii=False) + ';\n')
        f.write('export const KLATKI = ' + json.dumps(b['KLATKI'], ensure_ascii=False) + ';\n')
if wynik:
  with open('gra/klatki-wrogow.js', 'w', encoding='utf-8') as f:
    f.write(OPIS)
    f.write('// Obraz każdego potwora: grafika/<nazwa>.webp.\n')
    f.write('export const WROGOWIE_FILM = ' + json.dumps(wynik, ensure_ascii=False) + ';\n')
