# Zdejmuje namalowany dym znad komina z grafika/chata.webp (Patryk, 25 XI 20:40: „dym z komina … jest w miejscu”).
# Dym rysuje teraz gra (rysowanie.js, „dym z komina”), więc na obrazie zostaje komin z ciemnym wylotem.
# Uruchamiać na obrazie z dymem (kopia sprzed zmiany: git show b14a895:grafika/chata.webp).
from PIL import Image, ImageDraw
P = 'grafika/chata.webp'
im = Image.open(P).convert('RGBA'); px = im.load()
for y in range(0, 139):
    for x in range(690, im.width): px[x, y] = (0, 0, 0, 0)     # nad krawędzią komina był tylko dym
d = ImageDraw.Draw(im)
gora = [(747, 139), (792, 139), (787, 153), (741, 153)]       # wierzch komina (był zasłonięty dymem)
d.polygon(gora, fill=(92, 90, 88, 255), outline=(20, 18, 16, 255))
d.polygon([(752, 142), (786, 142), (782, 150), (747, 150)], fill=(18, 15, 13, 255), outline=(40, 36, 33, 255))   # wylot
im.save(P, 'WEBP', quality=92, method=6)
