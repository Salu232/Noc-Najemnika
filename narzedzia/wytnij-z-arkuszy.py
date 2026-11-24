# Wycina rysunki z arkuszy Przemka (białe tło, wiele rysunków na jednym obrazie) i z filmu ogniska,
# a potem składa je w jeden obraz dla gry, tak jak klatki bohatera.
# Uruchomienie z korzenia repo: python3 narzedzia/wytnij-z-arkuszy.py
#   z --podglad KATALOG: zamiast składać, zapisuje podgląd każdego arkusza z ponumerowanymi rysunkami
#   (te numery wpisuje się niżej w RYSUNKI).
# Potrzebne: ffmpeg oraz Python z pakietami pillow, numpy i scipy.
# Wynik: grafika/rekwizyty.webp i gra/rekwizyty.js (gdzie leży każdy rysunek i gdzie stoi na ziemi).
# Opis wyboru: docs/materialy-przemka.md (etap A).
import json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ARKUSZE = 'grafika/zrodla/przemek'
SZER_ATLASU = 2048

# nazwa: (arkusz, numer rysunku z podglądu, skala, podstawa)
# Skala: ile pikseli obrazu gry na piksel arkusza. Podstawa: 'pien' (gdzie drzewo wchodzi w ziemię;
# według niej gra stawia i sortuje) albo 'srodek' (plamy i kępy leżą płasko na ziemi).
DRZ, ZIE = 0.62, 0.42
RYSUNKI = {
    # drzewa (drzewa-2-swierki: świerki, kłoda, pień, martwe; drzewa-1: sosna, drzewo z mchem, złamany pień, krzaki)
    'swierk_a':   ('drzewa-2-swierki', 1, DRZ, 'pien'),
    'swierk_b':   ('drzewa-2-swierki', 4, DRZ, 'pien'),
    'martwe_a':   ('drzewa-2-swierki', 2, DRZ, 'pien'),
    'martwe_b':   ('drzewa-2-swierki', 5, DRZ, 'pien'),
    'kloda':      ('drzewa-2-swierki', 3, DRZ, 'pien'),
    'pien':       ('drzewa-2-swierki', 7, DRZ, 'pien'),
    'sosna':      ('drzewa-1', 1, DRZ, 'pien'),
    'zlamane':    ('drzewa-1', 2, DRZ, 'pien'),
    'mszyste':    ('drzewa-1', 3, DRZ, 'pien'),
    'krzak_a':    ('drzewa-1', 4, DRZ, 'pien'),
    'krzak_b':    ('drzewa-1', 5, DRZ, 'pien'),
    # kępy trawy, mchu i ziemi
    'trawa_a':    ('kepy-trawy-ziemi', 2, ZIE, 'pien'),
    'trawa_b':    ('kepy-trawy-ziemi', 3, ZIE, 'pien'),
    'trawa_c':    ('kepy-trawy-ziemi', 1, ZIE, 'pien'),
    'trawa_d':    ('trawa-mech', 1, ZIE, 'pien'),
    'trawa_e':    ('trawa-mech', 3, ZIE, 'pien'),
    'trawa_f':    ('trawa-mech', 8, ZIE, 'pien'),
    'trawa_g':    ('trawa-mech', 12, ZIE, 'pien'),
    'ziemia_a':   ('kepy-trawy-ziemi', 6, ZIE, 'srodek'),
    'ziemia_b':   ('kepy-trawy-ziemi', 5, ZIE, 'srodek'),
    'ziemia_c':   ('kepy-trawy-ziemi', 4, ZIE, 'srodek'),
    'mech_a':     ('kepy-trawy-ziemi', 8, ZIE, 'srodek'),
    'mech_b':     ('kepy-trawy-ziemi', 7, ZIE, 'srodek'),
    'mech_c':     ('kepy-trawy-ziemi', 9, ZIE, 'srodek'),
    'mech_d':     ('trawa-mech', 4, ZIE, 'srodek'),
    'mech_e':     ('trawa-mech', 6, ZIE, 'srodek'),
    'bloto':      ('plamy-krew-bloto-liscie', 4, 0.32, 'srodek'),
    'liscie':     ('plamy-krew-bloto-liscie', 25, 0.32, 'srodek'),
    'ziemia_d':   ('plamy-krew-bloto-liscie', 26, 0.32, 'srodek'),
    # krew: rozbryzgi, kałuże, ślady pazurów
    'krew_duza':  ('plamy-krew-bloto-liscie', 1, 0.32, 'srodek'),
    'bryzg_a':    ('krew-kaluze-pazury', 1, 0.4, 'srodek'),
    'bryzg_b':    ('krew-kaluze-pazury', 2, 0.4, 'srodek'),
    'bryzg_c':    ('krew-kaluze-pazury', 3, 0.4, 'srodek'),
    'bryzg_d':    ('krew-kaluze-pazury', 11, 0.4, 'srodek'),
    'bryzg_e':    ('krew-kaluze-pazury', 14, 0.4, 'srodek'),
    'bryzg_f':    ('krew-kaluze-pazury', 13, 0.4, 'srodek'),
    'bryzg_g':    ('krew-kaluze-pazury', 21, 0.4, 'srodek'),
    'bryzg_h':    ('krew-kaluze-pazury', 23, 0.4, 'srodek'),
    'kaluza_a':   ('krew-kaluze-pazury', 7, 0.4, 'srodek'),
    'kaluza_b':   ('krew-kaluze-pazury', 15, 0.4, 'srodek'),
    'kaluza_c':   ('krew-kaluze-pazury', 27, 0.4, 'srodek'),
    'kaluza_d':   ('krew-kaluze-pazury', 36, 0.4, 'srodek'),
    'pazury_a':   ('krew-kaluze-pazury', 20, 0.4, 'srodek'),
    'pazury_b':   ('krew-kaluze-pazury', 30, 0.4, 'srodek'),
}

# Ognisko z filmu Przemka (Campfire_flickering…, 96 klatek, 24 na sekundę). Pętla: klatki 43–78 co druga
# (18 klatek, 1,5 s); klatka 79 wygląda najbardziej jak 43. Ostatnie cztery klatki przenikają się z klatkami
# sprzed 43, więc szew pętli nie skacze. Dym jest szary na białym, więc odpada razem z tłem (dym dokłada gra).
OGIEN = {'film': 'grafika/zrodla/film-ognisko.mp4', 'start': 43, 'okres': 36, 'co': 2, 'przenikanie': 4, 'skala': 0.42}   # skala: względem filmu zmniejszonego do 640 × 360


def wczytaj(nazwa):
    return np.asarray(Image.open(f'{ARKUSZE}/{nazwa}.jpg').convert('RGB')).astype(np.float32)


def tlo_arkusza(a, prog=232, nasycenie=22):
    """Białe tło: jasne i szare piksele połączone z brzegiem, oraz większe białe dziury między gałęziami."""
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    biale = (lum > prog) & (sat < nasycenie)
    lab, n = ndimage.label(biale)
    brzeg = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    tlo = np.isin(lab, brzeg[brzeg > 0])
    if n:
        roz = ndimage.sum(biale, lab, range(1, n + 1)); sr = ndimage.mean(lum, lab, range(1, n + 1))
        tlo |= np.isin(lab, np.nonzero((roz > 6) & (sr > 238))[0] + 1)
    return tlo


def skladowe(tlo):
    """Numeruje rysunki: wszystko poza tłem, sklejone w promieniu kilku pikseli (źdźbła trawy, krople krwi)."""
    rz = ndimage.binary_closing(~tlo, iterations=4)
    lab, n = ndimage.label(ndimage.binary_dilation(rz, iterations=6))
    return lab, ndimage.find_objects(lab)


def alfa_z_bieli(a, maska):
    """Miękka krawędź: kolor rozmieszany z bielą (biel → przezroczystość), w środku rysunku pełne krycie."""
    wyp = (255 - a.min(2)) / 255
    alfa = np.clip(wyp * 3.2, 0, 1)
    rdzen = ndimage.binary_erosion(maska, iterations=2)
    alfa = np.where(rdzen, 1.0, alfa) * maska
    kol = np.clip((a - (1 - alfa)[..., None] * 255) / np.maximum(alfa, 0.05)[..., None], 0, 255)
    return np.dstack([kol, alfa * 255]).astype(np.uint8)


def wytnij(a, tlo, lab, sl, nr):
    s = sl[nr - 1]
    x0, y0, x1, y1 = s[1].start, s[0].start, s[1].stop, s[0].stop
    # rysunek to jego składowa i drobiny, których ramka leży w całości w jego ramce (krople przy rozbryzgu)
    nalezy = lab[y0:y1, x0:x1] == nr
    for i, t in enumerate(sl):
        if t is None or i + 1 == nr: continue
        if t[1].start >= x0 and t[1].stop <= x1 and t[0].start >= y0 and t[0].stop <= y1:
            nalezy |= lab[y0:y1, x0:x1] == i + 1
    maska = nalezy & ~tlo[y0:y1, x0:x1]
    return Image.fromarray(alfa_z_bieli(a[y0:y1, x0:x1], maska), 'RGBA')


def podstawa(obraz, jak):
    al = np.asarray(obraz)[..., 3] > 128
    ys, xs = np.nonzero(al)
    if jak == 'srodek':
        return (xs.min() + xs.max()) / 2 / obraz.width, (ys.min() + ys.max()) / 2 / obraz.height
    dol = ys.max(); pas = ys > dol - (dol - ys.min()) * 0.1     # pień: środek najniższej dziesiątej części rysunku
    return float(xs[pas].mean()) / obraz.width, (dol - (dol - ys.min()) * 0.035) / obraz.height


def kluczuj_ogien(a):
    tlo = tlo_arkusza(a, prog=188, nasycenie=34)                     # dym (jasnoszary) odpada razem z bielą
    tlo = ndimage.binary_opening(tlo, iterations=1) | tlo
    lab, n = ndimage.label(~tlo)
    if n > 1:                                                         # iskry i drobinki dymu odpadają
        roz = ndimage.sum(~tlo, lab, range(1, n + 1))
        tlo |= ~np.isin(lab, np.nonzero(roz > roz.max() * 0.02)[0] + 1)
    return alfa_z_bieli(a, ~tlo)


def klatki_ognia():
    o = OGIEN
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', o['film'], '-vf', 'scale=640:360', f'{tmp}/%03d.png'], check=True)
        film = lambda k: np.asarray(Image.open(f'{tmp}/{k:03d}.png').convert('RGB')).astype(np.float32)
        numery = list(range(o['start'], o['start'] + o['okres'], o['co']))
        klatki = []
        for i, k in enumerate(numery):
            a = film(k); zostalo = len(numery) - i
            if zostalo <= o['przenikanie']:                               # szew pętli
                w = 1 - zostalo / (o['przenikanie'] + 1)
                a = a * (1 - w) + film(k - o['okres']) * w
            klatki.append(kluczuj_ogien(a))
    al = np.max([k[..., 3] for k in klatki], axis=0) > 20
    ys, xs = np.nonzero(al); x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    wy = []
    for k in klatki:
        im = Image.fromarray(k[y0:y1, x0:x1], 'RGBA')
        wy.append(im.resize((round(im.width * o['skala']), round(im.height * o['skala'])), Image.LANCZOS))
    return wy


def podglad(katalog):
    os.makedirs(katalog, exist_ok=True)
    for ark in sorted({v[0] for v in RYSUNKI.values()}):
        a = wczytaj(ark); tlo = tlo_arkusza(a); lab, sl = skladowe(tlo)
        im = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(im)
        for i, s in enumerate(sl):
            if s is None or (s[0].stop - s[0].start) * (s[1].stop - s[1].start) < 900: continue
            d.rectangle([s[1].start, s[0].start, s[1].stop, s[0].stop], outline=(255, 0, 0), width=2)
            d.text((s[1].start + 4, s[0].start + 4), str(i + 1), fill=(255, 0, 0))
        im.thumbnail((900, 900)); im.save(f'{katalog}/{ark}.jpg', quality=75)
        print('podgląd:', f'{katalog}/{ark}.jpg')


def zloz():
    obrazy, opis = {}, {}
    cache = {}
    for nazwa, (ark, nr, skala, jak) in RYSUNKI.items():
        if ark not in cache:
            a = wczytaj(ark); tlo = tlo_arkusza(a); cache[ark] = (a, tlo) + skladowe(tlo)
        a, tlo, lab, sl = cache[ark]
        im = wytnij(a, tlo, lab, sl, nr)
        if ark.startswith('drzewa'):                     # drzewa w nocy ginęły w ciemności: rozjaśniamy o jedną trzecią
            px = np.asarray(im).astype(np.float32); px[..., :3] = np.clip(px[..., :3] * 1.35 + 6, 0, 255)
            im = Image.fromarray(px.astype(np.uint8), 'RGBA')
        im = im.resize((max(1, round(im.width * skala)), max(1, round(im.height * skala))), Image.LANCZOS)
        obrazy[nazwa] = im; opis[nazwa] = podstawa(im, jak)
    ogien = klatki_ognia()
    for i, im in enumerate(ogien):
        obrazy[f'ogien_{i:02d}'] = im; opis[f'ogien_{i:02d}'] = (0.5, 0.78)
    # pakowanie półkami: od najwyższych
    kolej = sorted(obrazy, key=lambda n: -obrazy[n].height)
    x = y = h_polki = 0; miejsca = {}
    for n in kolej:
        im = obrazy[n]
        if x + im.width + 2 > SZER_ATLASU: x = 0; y += h_polki + 2; h_polki = 0
        miejsca[n] = (x, y); x += im.width + 2; h_polki = max(h_polki, im.height)
    H = y + h_polki
    atlas = Image.new('RGBA', (SZER_ATLASU, H), (0, 0, 0, 0))
    wynik = {}
    for n in obrazy:
        im = obrazy[n]; x, y = miejsca[n]; atlas.paste(im, (x, y))
        ax, ay = opis[n]
        wynik[n] = {'x': x, 'y': y, 'w': im.width, 'h': im.height, 'ax': round(ax, 3), 'ay': round(ay, 3)}
    atlas.save('grafika/rekwizyty.webp', quality=86, method=6)
    with open('gra/rekwizyty.js', 'w') as f:
        f.write('// Rysunki z arkuszy Przemka i klatki ogniska: gdzie leżą w grafika/rekwizyty.webp i gdzie stoją na ziemi\n')
        f.write('// (ax, ay: punkt podstawy jako część szerokości i wysokości). Plik robi narzedzia/wytnij-z-arkuszy.py, nie poprawiać ręcznie.\n')
        f.write(f'export const OGIEN_KLATEK = {len(ogien)}, OGIEN_FPS = {24 // OGIEN["co"]};\n')
        f.write('export const REKWIZYTY = ' + json.dumps(wynik, separators=(',', ':')).replace('},"', '},\n  "') + ';\n')
    print(f'grafika/rekwizyty.webp {SZER_ATLASU}×{H}, {len(obrazy)} rysunków, {os.path.getsize("grafika/rekwizyty.webp") // 1024} KB')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--podglad': podglad(sys.argv[2])
    else: zloz()
