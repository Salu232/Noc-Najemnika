// Sterowanie. Komputer: WASD albo strzałki, mysz celuje, lewy przycisk tnie, prawy blokuje, spacja to unik.
// Telefon: lewy kciuk chodzi (drążek pojawia się tam, gdzie dotkniesz), prawa strona ekranu tnie:
// stuknięcie tnie najbliższego wroga, przeciągnięcie tnie w tę stronę. Przyciski Blok i Unik są w prawym dolnym rogu.

const PRZECIAGNIECIE = 30;   // od ilu pikseli przesunięcie palca jest cięciem w kierunek, a nie stuknięciem

export function przygotujWejscie(cv, { ekranNaSwiat, elementy }) {
  const klawisze = new Set();
  const w = { ruchX: 0, ruchY: 0, kat: null, atak: false, atakKat: null, blok: false, unik: false };
  const jednorazowe = { atak: false, atakKat: null, unik: false };
  const mysz = { x: 0, y: 0, jest: false, blok: false };
  const drazek = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const ciecie = { id: null, sx: 0, sy: 0, zrobione: false };
  let blokPrzyciskiem = false, dotyk = false;

  // ---------- klawiatura ----------
  const RUCH = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (RUCH.includes(k) || k === ' ' || k === 'shift' || k === 'k' || k === 'j') e.preventDefault();
    if (e.repeat) { klawisze.add(k); return; }
    klawisze.add(k);
    if (k === ' ') jednorazowe.unik = true;
    if (k === 'j') { jednorazowe.atak = true; jednorazowe.atakKat = null; }
  });
  addEventListener('keyup', e => klawisze.delete(e.key.toLowerCase()));
  addEventListener('blur', () => { klawisze.clear(); mysz.blok = false; blokPrzyciskiem = false; drazek.id = null; ciecie.id = null; });

  // ---------- mysz i dotyk na płótnie ----------
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') {
      mysz.x = e.clientX; mysz.y = e.clientY; mysz.jest = true;
      if (e.button === 0) { jednorazowe.atak = true; jednorazowe.atakKat = null; }
      if (e.button === 2) mysz.blok = true;
      return;
    }
    if (!dotyk) { dotyk = true; elementy.przyciski.hidden = false; }
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    if (e.clientX < innerWidth * 0.5 && drazek.id === null) {
      drazek.id = e.pointerId; drazek.ox = drazek.x = e.clientX; drazek.oy = drazek.y = e.clientY;
      pokazDrazek();
    } else if (ciecie.id === null) {
      ciecie.id = e.pointerId; ciecie.sx = e.clientX; ciecie.sy = e.clientY; ciecie.zrobione = false;
    }
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { mysz.x = e.clientX; mysz.y = e.clientY; mysz.jest = true; return; }
    if (e.pointerId === drazek.id) { drazek.x = e.clientX; drazek.y = e.clientY; pokazDrazek(); }
    else if (e.pointerId === ciecie.id && !ciecie.zrobione) {
      const dx = e.clientX - ciecie.sx, dy = e.clientY - ciecie.sy;
      if (Math.hypot(dx, dy) > PRZECIAGNIECIE) { ciecie.zrobione = true; jednorazowe.atak = true; jednorazowe.atakKat = Math.atan2(dy, dx); }
    }
  });
  const pusc = e => {
    if (e.pointerType === 'mouse') { if (e.button === 2 || e.buttons === 0) mysz.blok = false; return; }
    if (e.pointerId === drazek.id) { drazek.id = null; pokazDrazek(); }
    if (e.pointerId === ciecie.id) {
      if (!ciecie.zrobione) { jednorazowe.atak = true; jednorazowe.atakKat = null; }   // stuknięcie: tnie najbliższego
      ciecie.id = null;
    }
  };
  cv.addEventListener('pointerup', pusc);
  cv.addEventListener('pointercancel', pusc);
  cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') mysz.jest = false; });

  // ---------- przyciski na telefonie ----------
  const { blok, unik } = elementy;
  blok.addEventListener('pointerdown', e => { e.preventDefault(); blokPrzyciskiem = true; blok.classList.add('wcisniety'); blok.setPointerCapture(e.pointerId); });
  const puscBlok = () => { blokPrzyciskiem = false; blok.classList.remove('wcisniety'); };
  blok.addEventListener('pointerup', puscBlok); blok.addEventListener('pointercancel', puscBlok); blok.addEventListener('lostpointercapture', puscBlok);
  unik.addEventListener('pointerdown', e => { e.preventDefault(); jednorazowe.unik = true; unik.classList.add('wcisniety'); setTimeout(() => unik.classList.remove('wcisniety'), 120); });
  for (const el of [blok, unik]) el.addEventListener('contextmenu', e => e.preventDefault());

  function pokazDrazek() {
    const { drazekTlo, drazekGalka } = elementy;
    if (drazek.id === null) { drazekTlo.hidden = drazekGalka.hidden = true; return; }
    drazekTlo.hidden = drazekGalka.hidden = false;
    const dx = drazek.x - drazek.ox, dy = drazek.y - drazek.oy, d = Math.hypot(dx, dy), m = Math.min(1, 50 / Math.max(d, 1));
    drazekTlo.style.transform = `translate(${drazek.ox - 50}px, ${drazek.oy - 50}px)`;
    drazekGalka.style.transform = `translate(${drazek.ox + dx * m - 20}px, ${drazek.oy + dy * m - 20}px)`;
  }

  // ---------- odczyt raz na klatkę ----------
  function odczytaj(gra) {
    let ix = 0, iy = 0;
    if (klawisze.has('arrowleft') || klawisze.has('a')) ix -= 1;
    if (klawisze.has('arrowright') || klawisze.has('d')) ix += 1;
    if (klawisze.has('arrowup') || klawisze.has('w')) iy -= 1;
    if (klawisze.has('arrowdown') || klawisze.has('s')) iy += 1;
    if (drazek.id !== null) {
      const dx = drazek.x - drazek.ox, dy = drazek.y - drazek.oy, d = Math.hypot(dx, dy);
      if (d > 8) { const m = Math.min(1, d / 50); ix = dx / d * m; iy = dy / d * m; }
    }
    w.ruchX = ix; w.ruchY = iy;
    w.kat = null;
    if (mysz.jest && !dotyk) {
      const p = ekranNaSwiat(mysz.x, mysz.y), b = gra.bohater;
      w.kat = Math.atan2(p.y - (b.y - 30), p.x - b.x);
    }
    w.blok = mysz.blok || blokPrzyciskiem || klawisze.has('shift') || klawisze.has('k');
    w.atak = jednorazowe.atak; w.atakKat = jednorazowe.atakKat; w.unik = jednorazowe.unik;
    jednorazowe.atak = false; jednorazowe.atakKat = null; jednorazowe.unik = false;
    return w;
  }

  return { odczytaj, get dotyk() { return dotyk; } };
}
