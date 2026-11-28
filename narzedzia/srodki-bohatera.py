#!/usr/bin/env python3
# Przesunięcie animacji bohatera tak, żeby postać na klatce stała tam, gdzie jest bohater w świecie (cień, zderzenia).
# Jozz, 28 XI 00:37: „aby postać w tej animacji była tam gdzie postać jest w swiecie, czyli tam gdzie cien (…) nie musisz zmieniać
# animacji, tylko jej offset”. Dla każdej animacji liczy średni środek tułowia (35–75% wysokości postaci) i zapisuje, o ile
# pikseli obrazu przesunąć punkt zaczepienia (ax) każdej jej klatki. Jedno przesunięcie na animację, więc nic nie drga.
# Uruchomienie: python3 narzedzia/srodki-bohatera.py   (zapisuje gra/srodki-bohatera.js)
import json, re
import numpy as np
from PIL import Image

def licz(js, obraz):
    src = open(js).read()
    obj = lambda n: json.loads(re.search(r'export const ' + n + r' = (\{.*?\});\n', src, re.S).group(1))
    A, K = obj('ANIMACJE'), obj('KLATKI')
    al = np.asarray(Image.open(obraz).convert('RGBA'))[:, :, 3]
    wynik = {}
    for a, klatki in A.items():
        dx = []
        for f in klatki:
            k = K[f]; m = al[k['y']:k['y'] + k['h'], k['x']:k['x'] + k['w']] > 40
            ys, xs = np.nonzero(m)
            if len(ys) == 0: continue
            g, d = ys.min(), ys.max(); s = (ys > g + 0.35 * (d - g)) & (ys < g + 0.75 * (d - g))
            dx.append(xs[s].mean() - k['ax'] * k['w'])
        if not dx: continue
        p = float(np.mean(dx))
        for f in klatki: wynik.setdefault(f, round(p, 1))
    return wynik

w = licz('gra/klatki-bohatera.js', 'grafika/bohater.webp')
w.update(licz('gra/klatki-bohatera-wielki.js', 'grafika/bohater-wielki.webp'))
with open('gra/srodki-bohatera.js', 'w') as o:
    o.write('// Plik zrobiony przez narzedzia/srodki-bohatera.py. O ile pikseli obrazu przesunąć zaczepienie klatki, żeby tułów stał nad cieniem.\n')
    o.write('export const PRZESUNIECIE = ' + json.dumps(w) + ';\n')
print(len(w), 'klatek')
