# Chata bez dachu (Patryk z Gemini, 24 XI): ta sama chata w przekroju, do wejścia „jak w Tibii” (docs/chata.md).
# Uruchomienie z korzenia repo: python3 narzedzia/chata-bez-dachu.py   (potrzebne: pillow, numpy)
# Obraz z Gemini ma 1024 × 1024 i czarne tło; chata leży w nim dokładnie tak jak w grafika/chata.webp (951 × 951),
# tylko w innej skali: dopasowanie podwórka daje skalę 0,929 (951/1024) i przesunięcie 0 (Claude, 24 XI, korelacja 0,93).
# Gra bierze z tego obrazu tylko sam dom (wielokąt DOM w gra/rysowanie.js); podwórko zostaje z chata.webp.
# Czarne tło nad ścianami (tam, gdzie był dach) zdejmuje obrys OBRYS, poprowadzony po zewnętrznej krawędzi
# czarnych kresek na szczytach ścian: same kreski zostają, tło znika. Samo zdejmowanie czerni zjadało też
# te grube kreski i ciemne miejsca podwórka.
# Wynik: grafika/chata-bez-dachu.webp, 951 × 951, z przezroczystością.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OBRYS = [(150, 440), (180, 405), (292, 217), (491, 227), (499, 241), (561, 241), (563, 233), (779, 246),
         (796, 384), (829, 367), (846, 500), (880, 600), (900, 951), (0, 951), (0, 600), (150, 520)]

zr = Image.open('grafika/zrodla/chata-bez-dachu.jpg').convert('RGB').resize((951, 951), Image.LANCZOS)
maska = Image.new('L', zr.size, 0)
ImageDraw.Draw(maska).polygon(OBRYS, fill=255)
maska = maska.filter(ImageFilter.GaussianBlur(0.8))
wynik = zr.convert('RGBA'); wynik.putalpha(maska)
wynik.save('grafika/chata-bez-dachu.webp', 'WEBP', quality=86, method=6)
print('grafika/chata-bez-dachu.webp gotowe')
