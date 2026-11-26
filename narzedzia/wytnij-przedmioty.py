# Wycina ikony przedmiotów z arkusza Gemini 3x2 (grafika/zrodla/przedmioty-arkusz.png) do grafika/przedmioty/<id>.webp.
# Białe tło zdejmujemy „odbielaniem”: kolor zmieszany z bielą rozdzielamy na kolor i przezroczystość,
# więc poświata fiolki zostaje półprzezroczysta zamiast białej obwódki (jak drzewa, uwaga Przemka).
import numpy as np
from PIL import Image
KOLEJNOSC = ['amulet', 'pazur', 'kiel', 'krew', 'plecak', 'helm']
im = np.asarray(Image.open('grafika/zrodla/przedmioty-arkusz.png').convert('RGB')).astype(np.float32) / 255
H, W, _ = im.shape
for n, nazwa in enumerate(KOLEJNOSC):
    r, c = divmod(n, 3)
    kom = im[r * H // 2:(r + 1) * H // 2, c * W // 3:(c + 1) * W // 3]
    # Tło to biel połączona z brzegiem komórki (zalewanie od brzegu). Wnętrze przedmiotu zostaje w pełni kryjące,
    # w oryginalnych kolorach (jasne srebro amuletu nie ciemnieje); tylko w tle odbielamy poświatę na półprzezroczystą.
    from scipy import ndimage
    jasne = kom.min(axis=2) > 0.86
    etyk, _ = ndimage.label(jasne)
    brzeg = set(np.unique(np.concatenate([etyk[0], etyk[-1], etyk[:, 0], etyk[:, -1]]))) - {0}
    tlo = np.isin(etyk, list(brzeg))
    a_tla = np.clip((1 - kom.min(axis=2)) * 1.15 - 0.04, 0, 1)
    a = np.where(tlo, a_tla, 1.0)
    a = np.minimum(a, ndimage.uniform_filter(a, 3) + 0.25)                   # miękka krawędź
    kol = np.where((tlo & (a > 0.01))[..., None], (kom - (1 - a[..., None])) / np.maximum(a[..., None], 0.01), kom)
    rgba = np.dstack([np.clip(kol, 0, 1), a])
    ys, xs = np.nonzero(a > 0.06)
    y0, y1, x0, x1 = max(0, ys.min() - 6), ys.max() + 7, max(0, xs.min() - 6), xs.max() + 7
    rgba = rgba[y0:y1, x0:x1]
    h, w = rgba.shape[:2]; bok = max(h, w)
    plotno = np.zeros((bok, bok, 4), np.float32); plotno[(bok - h) // 2:(bok - h) // 2 + h, (bok - w) // 2:(bok - w) // 2 + w] = rgba
    Image.fromarray((plotno * 255).astype(np.uint8), 'RGBA').resize((128, 128), Image.LANCZOS).save(f'grafika/przedmioty/{nazwa}.webp', quality=90)
    print(nazwa, (w, h))
