# Wycina klatki bohatera z arkusza z Gemini (jednolite różowe tło) i składa je w jeden obraz dla gry.
# Uruchomienie z korzenia repo: python3 narzedzia/wytnij-bohatera.py
# Wynik: grafika/bohater.webp (klatki z przezroczystym tłem) i gra/klatki-bohatera.js (gdzie leży każda klatka i gdzie ma stopy).
import json
import numpy as np
from PIL import Image, ImageFilter

ZRODLO = 'grafika/bohater-arkusz-gemini.jpg'
SKALA = 0.46            # zmniejszenie: 400 px postaci z arkusza -> 184 px w obrazie, czyli dwa piksele na jednostkę świata
WYS_SWIAT = 92          # tyle jednostek świata ma stojący bohater

# Kawałki arkusza (x0, y0, x1, y1) bez podpisów i strzałek, kierunek, w który patrzy postać,
# i punkt na ziemi między stopami (w pikselach arkusza), wokół którego postać stoi.
KLATKI = {
    'stoi':      {'pole': (270, 25, 540, 440),  'patrzy': -1, 'stopy': (418, 418)},
    'plecy':     {'pole': (560, 25, 760, 440),  'patrzy': 1,  'stopy': (652, 412)},
    'zamach':    {'pole': (60, 480, 320, 747),  'patrzy': 1,  'stopy': (190, 735)},
    'ciecie':    {'pole': (440, 480, 820, 762), 'patrzy': 1,  'stopy': (548, 732)},
    'uderzenie': {'pole': (80, 870, 420, 1168), 'patrzy': 1,  'stopy': (195, 1150)},
    'wypad':     {'pole': (440, 920, 840, 1168),'patrzy': 1,  'stopy': (548, 1150)},
}

im = np.asarray(Image.open(ZRODLO).convert('RGB')).astype(np.float32)
R, G, B = im[..., 0], im[..., 1], im[..., 2]
roz = np.minimum(R, B) - G                      # jak bardzo piksel jest różowy jak tło
alfa = 1.0 - np.clip((roz - 22.0) / 48.0, 0, 1)
nad = np.clip(roz - 6.0, 0, None)               # zdejmujemy różową poświatę z krawędzi
rgb = im.copy(); rgb[..., 0] -= nad; rgb[..., 2] -= nad; rgb = np.clip(rgb, 0, 255)
# smugi ruchu dorysowane przez Gemini są półprzezroczyste i cienkie: zostawiamy tylko to, co leży przy pełnej postaci
pelne = Image.fromarray(((alfa > 0.92) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
alfa = alfa * (np.asarray(pelne) > 0)

klatki, obrazy = {}, []
for nazwa, k in KLATKI.items():
    x0, y0, x1, y1 = k['pole']
    a = alfa[y0:y1, x0:x1]
    ys, xs = np.nonzero(a > 0.05)
    bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0 + 1, ys.min() + y0, ys.max() + y0 + 1
    kaw = np.dstack([rgb[by0:by1, bx0:bx1], alfa[by0:by1, bx0:bx1, None] * 255]).astype(np.uint8)
    obr = Image.fromarray(kaw, 'RGBA')
    w, h = max(1, round(obr.width * SKALA)), max(1, round(obr.height * SKALA))
    obr = obr.resize((w, h), Image.LANCZOS)
    sx, sy = k['stopy']
    klatki[nazwa] = {'w': w, 'h': h, 'ax': round((sx - bx0) / (bx1 - bx0), 4), 'ay': round((sy - by0) / (by1 - by0), 4), 'patrzy': k['patrzy']}
    obrazy.append((nazwa, obr))

# jeden pas klatek obok siebie, z odstępem, żeby filtr nie łapał sąsiada
ODST = 4
szer = sum(o.width for _, o in obrazy) + ODST * (len(obrazy) + 1)
wys = max(o.height for _, o in obrazy) + 2 * ODST
atlas = Image.new('RGBA', (szer, wys), (0, 0, 0, 0))
x = ODST
for nazwa, o in obrazy:
    atlas.paste(o, (x, ODST)); klatki[nazwa]['x'] = x; klatki[nazwa]['y'] = ODST; x += o.width + ODST
atlas.save('grafika/bohater.webp', 'WEBP', quality=88, method=6)

skala = WYS_SWIAT / (KLATKI['stoi']['stopy'][1] - 33) / SKALA      # jednostki świata na piksel obrazu
with open('gra/klatki-bohatera.js', 'w', encoding='utf-8') as f:
    f.write('// Plik zrobiony przez narzedzia/wytnij-bohatera.py z arkusza Gemini. Nie poprawiaj ręcznie, tylko uruchom narzędzie jeszcze raz.\n')
    f.write('// x, y, w, h: miejsce klatki w grafika/bohater.webp; ax, ay: stopy jako ułamek szerokości i wysokości;\n')
    f.write('// patrzy: 1 w prawo, -1 w lewo; SKALA: ile jednostek świata ma jeden piksel obrazu.\n')
    f.write(f'export const SKALA = {skala:.4f};\n')
    f.write('export const KLATKI = ' + json.dumps(klatki, ensure_ascii=False, indent=1) + ';\n')
print(atlas.size, json.dumps(klatki))
