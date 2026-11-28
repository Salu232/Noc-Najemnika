# Zamknięte drzwi widziane z izby (Patryk, 24 XI 14:41: „jak jesteś w srodku to właśnie nie mozesz zamknąć”).
# Obraz bez dachu ma drzwi otwarte na zewnątrz, w lewo. Ta łata zasłania je zamkniętymi:
# ściana na lewo od drzwi i zamknięte skrzydło z chaty z dachem (oba obrazy leżą w tym samym kadrze),
# a nad ścianą, tam gdzie sterczało otwarte skrzydło, podłoga izby z miejsca obok, wyrównana jasnością i z miękkim brzegiem.
# Uruchomienie z korzenia repo: python3 narzedzia/chata-drzwi-zamkniete.py   (potrzebne: pillow, numpy)
# Wynik: grafika/chata-drzwi-zamkniete.webp, 951 × 951, przezroczysty poza łatą. Gra kładzie go na izbie, gdy drzwi są zamknięte.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

bd = Image.open('grafika/chata-bez-dachu.webp').convert('RGBA')
ch = Image.open('grafika/chata.webp').convert('RGBA')
wynik = Image.new('RGBA', bd.size, (0, 0, 0, 0))

# podłoga nad ścianą: kawałek podłogi z otwartego przejścia, przyciemniony do jasności podłogi tuż nad skrzydłem
DOCEL, ZRODLO = (360, 498, 432, 552), (440, 470, 512, 524)
pod = np.asarray(bd.crop(ZRODLO)).astype(np.float32)
wzor = np.asarray(bd.crop((372, 478, 420, 496))).astype(np.float32)[..., :3].reshape(-1, 3).mean(0)
pod[..., :3] *= wzor / pod[..., :3].reshape(-1, 3).mean(0)
pod = Image.fromarray(np.clip(pod, 0, 255).astype(np.uint8))
brzeg = Image.new('L', pod.size, 0); ImageDraw.Draw(brzeg).rectangle((5, 5, pod.width - 1, pod.height - 1), fill=255)
pod.putalpha(brzeg.filter(ImageFilter.GaussianBlur(3)))
wynik.alpha_composite(pod, DOCEL[:2])

wynik.alpha_composite(ch.crop((360, 549, 428, 702)), (360, 549))      # ściana na lewo od drzwi
wynik.alpha_composite(ch.crop((428, 527, 506, 702)), (428, 527))      # zamknięte skrzydło z futryną
wynik.save('grafika/chata-drzwi-zamkniete.webp', 'WEBP', quality=88, method=6)
podglad = bd.copy(); podglad.alpha_composite(wynik); podglad.crop((330, 460, 610, 740)).resize((560, 560)).save('/tmp/claude-0/-home-user/0c81dbe5-8e24-5f64-8dc9-48c00e8e8a67/scratchpad/drzwi-zamk.png')
print('grafika/chata-drzwi-zamkniete.webp gotowe')
