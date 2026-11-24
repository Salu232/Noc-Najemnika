# Kadry startowe do Flow z innym mieczem (Patryk, 24 XI 18:38: bohater ma trzymać miecz wielkości wybranej broni).
# Z kadru bohater-miecz-klatka.png (klatka 88 filmu cięcia) skraca ostrze dla lekkiego miecza i poszerza je dla wielkiego.
# Uruchomienie: python3 narzedzia/kadr-innego-miecza.py (ścieżka kadru niżej, w plikach projektu); wynik w bieżącym katalogu.
import numpy as np
from PIL import Image
from scipy import ndimage
src='/mnt/project-files/noc-najemnika-v2/gra-polana/bohater-miecz-klatka.png'
a=np.asarray(Image.open(src).convert('RGB')).astype(float); H,W=a.shape[:2]
G=np.array([617.,252.]); T=np.array([446.,35.]); L=np.linalg.norm(T-G); v=(T-G)/L; n=np.array([-v[1],v[0]])
yy,xx=np.mgrid[0:H,0:W].astype(float); qx=xx-G[0]; qy=yy-G[1]
t=qx*v[0]+qy*v[1]; s=qx*n[0]+qy*n[1]
lum=a.mean(2)
pas=(np.abs(s)<13)&(t>-4)&(t<L+10)
ostrze=pas&(lum<238)
def wersja(dl,gr,nazwa):
    b=a.copy()
    if dl<1: b[(np.abs(s)<18)&(t>L*dl-6)&(t<L+16)]=255          # skracanie: stare ostrze za nowym czubkiem znika (leży na bieli)
    # mapowanie odwrotne warstwy ostrza
    ts=t/dl; ss=s/gr
    px=G[0]+ts*v[0]+ss*n[0]; py=G[1]+ts*v[1]+ss*n[1]
    m=ndimage.map_coordinates(ostrze.astype(float),[py,px],order=1)
    kol=np.stack([ndimage.map_coordinates(a[...,c],[py,px],order=1) for c in range(3)],-1)
    m[t<8]=0                                  # rękojeść i dłoń zostają z oryginału
    m=np.clip(m,0,1)[...,None]
    b=b*(1-m)+kol*m
    Image.fromarray(b.clip(0,255).astype(np.uint8)).save(nazwa)
wersja(0.62,0.85,'bohater-miecz-krotki-klatka.png')
wersja(1.12,1.5,'bohater-miecz-wielki-klatka.png')
