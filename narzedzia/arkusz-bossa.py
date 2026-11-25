# Arkusze póz z Gemini (Patryk, 25 XI 22:40) jako „klatki filmu” dla wytnij-z-filmow.py: każda poza trafia na białe płótno
# 640×480 w skali filmów drugiej fazy (stojący rycerz ma 303 piksele), stopami na wierszu 445, w kolumnie 337.
# Wycinanie tła i odbielanie poświaty robi potem wytnij-z-filmow.py, tak jak dla filmów (bez białych obwódek).
# Uruchomienie: python3 narzedzia/arkusz-bossa.py, potem python3 narzedzia/wytnij-z-filmow.py ghul kolos wiedzma rycerz
import os, numpy as np
from PIL import Image
BAZA, X0, Y0, WZOR = 445, 337, 549, 303   # Y0: linia stóp na arkuszu; WZOR: wzrost stojącego rycerza w filmach 2. fazy
for nazwa in ('wbicie', 'doskok'):
    im = Image.open(f'grafika/zrodla/boss/rycerz-arkusz-{nazwa}.png').convert('RGB'); a = np.asarray(im).astype(int)
    m = a.min(2) < 200; cols = m.any(0); segs = []; x = 0
    while x < len(cols):                                   # pozy oddziela pas bieli
        if cols[x]:
            x0 = x
            while x < len(cols) and cols[x:x + 15].any(): x += 1
            segs.append((x0, x))
        x += 1
    gora = np.nonzero(m[:, segs[0][0]:segs[0][1]].any(1))[0][0]
    s = WZOR / (Y0 - gora)                                 # skala z pierwszej pozy (stoi)
    kat = f'grafika/zrodla/boss/arkusz-{nazwa}'; os.makedirs(kat, exist_ok=True)
    for i, (x0, x1) in enumerate(segs):
        ciemne = (a[:, x0:x1].max(2) < 90)                 # stopy: ciemne piksele tuż nad linią stóp, bez pazura z prawej
        pas = ciemne[Y0 - 30:Y0 - 4, : int((x1 - x0) * 0.7)]
        if pas.sum() < 40: pas = ciemne[Y0 - 170:Y0 - 70]   # w skoku stopy są w powietrzu: bierzemy nogi
        sx = x0 + float(np.median(np.nonzero(pas)[1]))
        poza = im.crop((x0, 0, x1, im.height)); poza = poza.resize((round(poza.width * s), round(poza.height * s)), Image.LANCZOS)
        p = Image.new('RGB', (640, 480), (255, 255, 255))
        p.paste(poza, (round(X0 - (sx - x0) * s), round(BAZA - Y0 * s)))
        p.save(f'{kat}/{i + 1:03d}.png')
    print(nazwa, len(segs), 'póz, skala', round(s, 3))
