"""Łata nawierzchni drogi z rysunku ziemi Przemka (plamy-krew-bloto-liscie.jpg, sucha ziemia z kamykami).
Środek rysunku z miękko wygaszonym brzegiem; gra kładzie łaty wzdłuż drogi i przycina je do jej kształtu.
Wynik: grafika/droga.webp. Uruchom: python3 narzedzia/kafel-drogi.py"""
import numpy as np
from PIL import Image
src = Image.open('grafika/zrodla/przemek/plamy-krew-bloto-liscie.jpg').convert('RGB').crop((575, 615, 965, 890))
a = np.asarray(src, dtype=np.float32)
h, w = a.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
e = np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2))
alfa = np.clip((1 - e) / 0.35, 0, 1)                       # pełna w środku, gaśnie na zewnętrznych 35%
jasnosc = a.mean(axis=2)
alfa *= np.clip((235 - jasnosc) / 40, 0, 1)                # białe tło arkusza znika
rgb = a * 1.1                                              # odrobinę jaśniej, jak kafel ziemi
out = np.dstack([np.clip(rgb, 0, 255), alfa * 255]).astype(np.uint8)
Image.fromarray(out, 'RGBA').save('grafika/droga.webp', quality=88)
print('grafika/droga.webp', w, h)
