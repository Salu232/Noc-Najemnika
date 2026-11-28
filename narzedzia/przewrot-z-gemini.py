"""Składa film przewrotu z klatek filmu Veo i póz z Gemini (25 XI).

Veo przy koziołku robił stanie na rękach, więc środek przewrotu (kula, przetoczenie przez plecy, wyjście)
bierzemy z arkusza póz z Gemini, a przysiad i wstawanie z filmu. Wynik to zwykły film mp4 w kadrze filmów
bohatera (1280 × 720), który wytnij-z-filmow.py tnie jak każdy inny.
Uruchom: python3 narzedzia/przewrot-z-gemini.py
"""
import subprocess, io, numpy as np
from PIL import Image
from scipy import ndimage

Z = 'grafika/zrodla/'
# arkusz, kolumny póz (x0, x1), skala do kadru filmu, środek ciała i linia ziemi w filmie
ARKUSZE = {
    'przod': dict(arkusz='gemini-przewrot-przod.jpg', film='film-wielki-przewrot', skala=1.75, srodek=633, ziemia=662,
                  pozy={3: (530, 700), 4: (726, 903), 5: (913, 1094)},
                  przed=[37, 49, 61, 67], po=[127, 133, 139, 145]),
    'tyl':   dict(arkusz='gemini-przewrot-tyl.png', film='film-wielki-przewrot-tyl', skala=1.56, srodek=660, ziemia=668,
                  pozy={3: (956, 1149), 4: (1366, 1573), 5: (1719, 2060)},
                  przed=[19, 31, 37, 40], po=[81, 85, 91, 97]),
}
KOLEJ = [3, 3, 4, 4, 5]   # kula dwie klatki, przetoczenie dwie, wyjście jedna

def klatka(film, n):
    b = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', Z + film + '.mp4', '-vf', f'select=eq(n\\,{n - 1})',
                        '-vframes', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGB')

def poza(ark, x0, x1, cfg):
    kaw = ark.crop((x0, 0, x1, ark.height))
    g = np.asarray(kaw.convert('L')) < 200
    lab, n = ndimage.label(ndimage.binary_dilation(g, iterations=3))
    if n > 1:                                   # zostaje tylko największy kawałek (bez czubka miecza sąsiedniej pozy)
        wiel = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); g2 = lab == (1 + int(np.argmax(wiel)))
        a = np.asarray(kaw).copy(); a[~g2] = 255; kaw = Image.fromarray(a)
        g = g & g2
    ys, xs = np.nonzero(g); kaw = kaw.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = cfg['skala']; kaw = kaw.resize((round(kaw.width * s), round(kaw.height * s)), Image.LANCZOS)
    tlo = Image.new('RGB', (1280, 720), (251, 251, 251))
    sx = (xs.mean() - xs.min()) * s                # środek ciała, nie środek ramki
    tlo.paste(kaw, (round(cfg['srodek'] - sx), cfg['ziemia'] - kaw.height))
    return tlo

for nazwa, cfg in ARKUSZE.items():
    ark = Image.open(Z + cfg['arkusz']).convert('RGB')
    kl = [klatka(cfg['film'], n) for n in cfg['przed']] + [poza(ark, *cfg['pozy'][p], cfg) for p in KOLEJ] + [klatka(cfg['film'], n) for n in cfg['po']]
    wyj = Z + f'film-wielki-przewrot-{nazwa}-g.mp4'
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1280x720', '-r', '24', '-i', '-',
                          '-c:v', 'libx264', '-crf', '8', '-pix_fmt', 'yuv444p', wyj], stdin=subprocess.PIPE)
    for k in kl: p.stdin.write(k.tobytes())
    p.stdin.close(); p.wait(); print(wyj, len(kl), 'klatek')
