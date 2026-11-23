# Wycina bohatera z filmów Przemka (Gemini, białe tło) i składa klatki animacji w jeden obraz dla gry.
# Uruchomienie z korzenia repo: python3 narzedzia/wytnij-z-filmow.py
# Potrzebne: ffmpeg oraz Python z pakietami pillow, numpy i scipy (pip install pillow numpy scipy).
# Wynik: grafika/bohater.webp i gra/klatki-bohatera.js (gdzie leży każda klatka, gdzie ma stopy i które klatki tworzą którą animację).
import json, os, subprocess, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

ZRODLA = 'grafika/zrodla'
# Animacje: (film, numery klatek filmu liczone od 1). Filmy mają 24 klatki na sekundę i 4 sekundy.
# We wszystkich filmach bohater stoi bokiem do nas i patrzy w prawo: w prawo idzie i w prawo tnie.
ANIMACJE = {
    'spoczynek': ('oddech', list(range(35, 74, 3))),          # jeden pełny oddech: klatka 75 wygląda jak 35
    'chod':      ('chod',   list(range(47, 87, 2))),          # dwa kroki: klatka 87 wygląda jak 47
    'zamach':    ('ciecie', [4, 8, 12, 16, 20, 24, 28, 31, 34, 37]),   # unosi miecz i odprowadza go nisko w lewo, za siebie
    'ciecie':    ('ciecie', [39, 41, 43, 45, 47, 49, 52, 55]),        # zamaszyste cięcie w prawo, ręka wyciągnięta
    'powrot':    ('ciecie', [58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94]),
    'rana':      ('rana',   [7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37]),
    'blok':      ('rana',   [49, 52, 55]),                    # miecz trzymany poziomo przed sobą
}
# W klatkach 39–49 cięcia smuga z filmu zasłania biodra i po jej zdjęciu zostaje dziura.
# Pas z dziurą bierzemy z klatki 55, w której bohater stoi w tym samym rozkroku, a smugi już nie ma.
LATKI = {('ciecie', k): 55 for k in (39, 41, 43, 45, 47, 49)}
POL = 0.5                 # kluczowanie na filmie zmniejszonym o połowę (640 × 360)
SKALA_OBRAZU = 0.5        # i jeszcze o połowę do gry: postać ma około 170 px wysokości
STOPY = (295, 345)        # punkt między stopami w spoczynku, w pikselach filmu zmniejszonego o połowę
WYS_SWIAT = 100           # tyle jednostek świata ma stojący bohater (od czubka głowy do stóp)
WYS_FILM = 340            # tyle pikseli ma stojący bohater w filmie zmniejszonym o połowę
PATRZY = 1                # w filmach bohater patrzy w prawo


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
    wyj = os.path.join(katalog, film + '-%03d.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{ZRODLA}/film-{film}.mp4', '-vf', f"select='{wybor}',scale=640:360:flags=lanczos", '-vsync', '0', wyj], check=True)
    return [Image.open(os.path.join(katalog, f'{film}-{i + 1:03d}.png')).convert('RGB') for i in range(len(numery))]


def latka(rgba, dawca):
    """Wiersze, w których klatce brakuje ciała, a dawca je ma, bierze w całości z dawcy (z zapasem 6 wierszy)."""
    a = np.asarray(rgba).copy(); d = np.asarray(dawca)
    ad, af = d[..., 3] > 0, a[..., 3] > 0
    wiersze = [y for y in range(a.shape[0] * 2 // 5, a.shape[0]) if ad[y].sum() > 20 and (ad[y] & ~af[y]).sum() / ad[y].sum() > 0.3]
    if wiersze:
        y0, y1 = max(0, wiersze[0] - 6), min(a.shape[0] - 1, wiersze[-1] + 6)
        a[y0:y1 + 1] = d[y0:y1 + 1]
    return Image.fromarray(a, 'RGBA')


# każdy film czytamy raz: wszystkie potrzebne klatki razem z dawcami łat
potrzebne = {}
for film, numery in ANIMACJE.values(): potrzebne.setdefault(film, set()).update(numery)
for (film, _), dawca in LATKI.items(): potrzebne[film].add(dawca)

klatki, obrazy, anim = {}, [], {}
with tempfile.TemporaryDirectory() as kat:
    kluczowane = {}
    for film, numery in potrzebne.items():
        numery = sorted(numery)
        for k, obr in zip(numery, klatki_filmu(film, numery, kat)): kluczowane[(film, k)] = kluczuj(obr)
    for nazwa, (film, numery) in ANIMACJE.items():
        anim[nazwa] = []
        for k in numery:
            rgba = kluczowane[(film, k)]
            if (film, k) in LATKI: rgba = latka(rgba, kluczowane[(film, LATKI[(film, k)])])
            box = rgba.getbbox()
            kaw = rgba.crop(box)
            w, h = max(1, round(kaw.width * SKALA_OBRAZU)), max(1, round(kaw.height * SKALA_OBRAZU))
            kaw = kaw.resize((w, h), Image.LANCZOS)
            klucz = f'{film}{k}'
            if klucz not in klatki:
                klatki[klucz] = {'w': w, 'h': h, 'ax': round((STOPY[0] - box[0]) / (box[2] - box[0]), 4), 'ay': round((STOPY[1] - box[1]) / (box[3] - box[1]), 4)}
                obrazy.append((klucz, kaw))
            anim[nazwa].append(klucz)

# układamy klatki półkami w obrazie szerokim na 2048 px
SZER, ODST = 2048, 2
x = y = ODST; wys_polki = 0
for klucz, o in sorted(obrazy, key=lambda p: -p[1].height):
    if x + o.width + ODST > SZER: x = ODST; y += wys_polki + ODST; wys_polki = 0
    klatki[klucz]['x'], klatki[klucz]['y'] = x, y
    x += o.width + ODST; wys_polki = max(wys_polki, o.height)
atlas = Image.new('RGBA', (SZER, y + wys_polki + ODST), (0, 0, 0, 0))
for klucz, o in obrazy: atlas.paste(o, (klatki[klucz]['x'], klatki[klucz]['y']))
atlas.save('grafika/bohater.webp', 'WEBP', quality=86, method=6)

skala = WYS_SWIAT / (WYS_FILM * SKALA_OBRAZU)
with open('gra/klatki-bohatera.js', 'w', encoding='utf-8') as f:
    f.write('// Plik zrobiony przez narzedzia/wytnij-z-filmow.py z filmów Przemka. Nie poprawiaj ręcznie, tylko uruchom narzędzie jeszcze raz.\n')
    f.write('// KLATKI: miejsce klatki w grafika/bohater.webp (x, y, w, h) i stopy jako ułamek szerokości i wysokości (ax, ay).\n')
    f.write('// ANIMACJE: które klatki po kolei tworzą daną animację. SKALA: ile jednostek świata ma jeden piksel obrazu. PATRZY: 1, bo w filmach patrzy w prawo.\n')
    f.write(f'export const SKALA = {skala:.4f};\nexport const PATRZY = {PATRZY};\n')
    f.write('export const ANIMACJE = ' + json.dumps(anim, ensure_ascii=False) + ';\n')
    f.write('export const KLATKI = ' + json.dumps(klatki, ensure_ascii=False) + ';\n')
print('obraz', atlas.size, 'klatek', len(klatki), 'skala', round(skala, 4))
