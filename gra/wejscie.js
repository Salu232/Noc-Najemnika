// Sterowanie.
// Komputer: WASD albo strzałki, mysz celuje. Lewy przycisk tnie; przytrzymany ładuje mocny cios, który wychodzi po puszczeniu.
//   Prawy przycisk albo Shift blokuje, spacja to unik (trzymana: bieg po przewrocie), R to klątwa (gdy jej pasek jest pełny), E to czynność (np. sen na posłaniu w chacie).
// Telefon: lewy kciuk chodzi. Prawy kciuk tnie: przycisk Tnij (albo dowolne miejsce po prawej) działa jak drążek.
//   Stuknięcie tnie najbliższego wroga, przeciągnięcie celuje, a przytrzymanie ładuje mocny cios.
//   Przyciski Blok, Unik i Klątwa są obok.

const CELOWANIE = 16;    // od ilu pikseli przeciągnięcia palec celuje, a nie tylko stuka

export function przygotujWejscie(cv, { ekranNaSwiat, elementy }) {
  const klawisze = new Set();
  const w = { ruchX: 0, ruchY: 0, kat: null, atakStart: false, atakTrzyma: false, atakKat: null, blok: false, unik: false, unikTrzyma: false, klatwa: false, akcja: false, mikstura: false };
  const jednorazowe = { atak: false, unik: false, klatwa: false, akcja: false, mikstura: false };
  const mysz = { x: 0, y: 0, jest: false, blok: false, atak: false };
  const drazek = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const atak = { id: null, ox: 0, oy: 0, x: 0, y: 0, celuje: false };
  let blokPrzyciskiem = false, unikPrzyciskiem = false, blokPalec = null, unikPalec = null, dotyk = false;

  function pokazDotyk() { if (!dotyk) { dotyk = true; elementy.przyciski.hidden = false; } }
  try { if (matchMedia('(pointer: coarse)').matches) pokazDotyk(); } catch (e) { /* stara przeglądarka */ }

  // ---------- klawiatura ----------
  const RUCH = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (RUCH.includes(k) || k === ' ' || k === 'shift' || k === 'k' || k === 'j') e.preventDefault();
    if (e.repeat) return;
    klawisze.add(k);
    if (k === ' ') jednorazowe.unik = true;
    if (k === 'j') jednorazowe.atak = true;
    if (k === 'r') jednorazowe.klatwa = true;
    if (k === 'e') jednorazowe.akcja = true;
    if (k === 'q') jednorazowe.mikstura = true;                // mikstura z łupu
  });
  addEventListener('keyup', e => klawisze.delete(e.key.toLowerCase()));
  addEventListener('blur', () => { klawisze.clear(); mysz.blok = mysz.atak = false; blokPrzyciskiem = false; unikPrzyciskiem = false; drazek.id = null; atak.id = null; pokazDrazki(); });

  // ---------- atak palcem: wspólne dla przycisku Tnij i prawej strony ekranu ----------
  function atakDol(id, x, y) {
    if (atak.id !== null) return;
    atak.id = id; atak.ox = atak.x = x; atak.oy = atak.y = y; atak.celuje = false;
    jednorazowe.atak = true; elementy.tnij.classList.add('wcisniety');
    pokazDrazki();
  }
  function atakRuch(id, x, y) {
    if (id !== atak.id) return;
    atak.x = x; atak.y = y;
    if (Math.hypot(x - atak.ox, y - atak.oy) > CELOWANIE) atak.celuje = true;
    pokazDrazki();
  }
  function atakGora(id) {
    if (id !== atak.id) return;
    atak.id = null; elementy.tnij.classList.remove('wcisniety'); pokazDrazki();
  }

  // ---------- mysz i dotyk na płótnie ----------
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') {
      mysz.x = e.clientX; mysz.y = e.clientY; mysz.jest = true;
      if (e.button === 0) { jednorazowe.atak = true; mysz.atak = true; }
      if (e.button === 2) mysz.blok = true;
      return;
    }
    pokazDotyk();
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (_) { /* bez przechwycenia */ }
    if (e.clientX < innerWidth * 0.5 && drazek.id === null) {
      drazek.id = e.pointerId; drazek.ox = drazek.x = e.clientX; drazek.oy = drazek.y = e.clientY;
      pokazDrazki();
    } else {
      const p = najblizszy(e.clientX, e.clientY);
      if (p && p !== tnij) wcisnij(p, e.pointerId); else atakDol(e.pointerId, e.clientX, e.clientY);
    }
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { mysz.x = e.clientX; mysz.y = e.clientY; mysz.jest = true; return; }
    if (e.pointerId === drazek.id) { drazek.x = e.clientX; drazek.y = e.clientY; pokazDrazki(); }
    else atakRuch(e.pointerId, e.clientX, e.clientY);
  });
  const pusc = e => {
    if (e.pointerType === 'mouse') {
      if (e.button === 2 || !(e.buttons & 2)) mysz.blok = false;
      if (e.button === 0 || !(e.buttons & 1)) mysz.atak = false;
      return;
    }
    if (e.pointerId === drazek.id) { drazek.id = null; pokazDrazki(); }
    if (e.pointerId === blokPalec) puscBlok();
    if (e.pointerId === unikPalec) puscUnik();
    atakGora(e.pointerId);
  };
  cv.addEventListener('pointerup', pusc);
  cv.addEventListener('pointercancel', pusc);
  cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') mysz.jest = false; });
  addEventListener('mouseup', e => { if (e.button === 0) mysz.atak = false; if (e.button === 2) mysz.blok = false; });

  // ---------- przyciski na telefonie ----------
  const { tnij, blok, unik, klatwa } = elementy;
  // Palec, który trochę chybi (27 XI 19:37, Przemek: „klikam unik, a zamiast uniku daje mi drugi atak”): Unik stoi tuż nad Tnij,
  // a reszta prawej strony ekranu też tnie, więc dotyk obok Uniku był cięciem. Teraz dotyk idzie do przycisku, do którego
  // palcu najbliżej (licząc w promieniach przycisku, więc mały Unik nie przegrywa z dużym Tnij), jeśli jest w 1,75 promienia.
  const PRZYCISKI = [tnij, unik, blok, klatwa, elementy.mikstura];
  function najblizszy(x, y, prog = 1.75) {
    let naj = null, ocena = prog;
    for (const p of PRZYCISKI) {
      if (!p || p.offsetParent === null) continue;
      const r = p.getBoundingClientRect(); if (!r.width) continue;
      const o = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) / (r.width / 2);
      if (o < ocena) { ocena = o; naj = p; }
    }
    return naj;
  }
  function wcisnij(p, id) {
    if (p === unik) { jednorazowe.unik = true; unikPrzyciskiem = true; unikPalec = id; unik.classList.add('wcisniety'); }
    else if (p === blok) { blokPrzyciskiem = true; blokPalec = id; blok.classList.add('wcisniety'); }
    else if (p === elementy.mikstura) jednorazowe.mikstura = true;
    else if (p === klatwa) { jednorazowe.klatwa = true; klatwa.classList.add('wcisniety'); setTimeout(() => klatwa.classList.remove('wcisniety'), 120); }
  }
  tnij.addEventListener('pointerdown', e => {
    e.preventDefault(); pokazDotyk();
    try { tnij.setPointerCapture(e.pointerId); } catch (_) { /* bez przechwycenia */ }
    const inny = najblizszy(e.clientX, e.clientY);
    if (inny && inny !== tnij) { wcisnij(inny, e.pointerId); return; }   // brzeg Tnij bliżej środka Uniku: to był unik
    const r = tnij.getBoundingClientRect();
    atakDol(e.pointerId, r.left + r.width / 2, r.top + r.height / 2);
    atakRuch(e.pointerId, e.clientX, e.clientY);
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) tnij.addEventListener(ev, e => { if (e.pointerId === unikPalec) puscUnik(); if (e.pointerId === blokPalec) puscBlok(); });
  // Między przyciskami była martwa strefa (pole przycisków 196 × 196 px łapało dotyk i nic nie robiło). Teraz dotyk tam idzie do najbliższego przycisku.
  const pole = elementy.przyciski;
  pole.addEventListener('pointerdown', e => {
    if (e.target !== pole) return;
    e.preventDefault(); pokazDotyk();
    const p = najblizszy(e.clientX, e.clientY, 9);
    if (!p) return;
    try { pole.setPointerCapture(e.pointerId); } catch (_) { /* */ }
    if (p === tnij) { const r = tnij.getBoundingClientRect(); atakDol(e.pointerId, r.left + r.width / 2, r.top + r.height / 2); atakRuch(e.pointerId, e.clientX, e.clientY); }
    else wcisnij(p, e.pointerId);
  });
  pole.addEventListener('pointermove', e => atakRuch(e.pointerId, e.clientX, e.clientY));
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) pole.addEventListener(ev, e => { if (e.pointerId === unikPalec) puscUnik(); if (e.pointerId === blokPalec) puscBlok(); atakGora(e.pointerId); });
  tnij.addEventListener('pointermove', e => atakRuch(e.pointerId, e.clientX, e.clientY));
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) tnij.addEventListener(ev, e => atakGora(e.pointerId));
  blok.addEventListener('pointerdown', e => { e.preventDefault(); pokazDotyk(); blokPrzyciskiem = true; blok.classList.add('wcisniety'); try { blok.setPointerCapture(e.pointerId); } catch (_) { /* */ } });
  function puscBlok() { blokPrzyciskiem = false; blokPalec = null; blok.classList.remove('wcisniety'); }
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) blok.addEventListener(ev, puscBlok);
  unik.addEventListener('pointerdown', e => { e.preventDefault(); pokazDotyk(); jednorazowe.unik = true; unikPrzyciskiem = true; unik.classList.add('wcisniety'); try { unik.setPointerCapture(e.pointerId); } catch (_) { /* */ } });
  function puscUnik() { unikPrzyciskiem = false; unikPalec = null; unik.classList.remove('wcisniety'); }   // trzymany dalej: bieg
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) unik.addEventListener(ev, puscUnik);
  klatwa.addEventListener('pointerdown', e => { e.preventDefault(); pokazDotyk(); jednorazowe.klatwa = true; klatwa.classList.add('wcisniety'); setTimeout(() => klatwa.classList.remove('wcisniety'), 120); });
  if (elementy.mikstura) elementy.mikstura.addEventListener('pointerdown', e => { e.preventDefault(); pokazDotyk(); jednorazowe.mikstura = true; });
  for (const el of [tnij, blok, unik, klatwa]) el.addEventListener('contextmenu', e => e.preventDefault());
  // przycisk czynności (Odpocznij, Wstań) działa i palcem, i myszą
  if (elementy.akcja) elementy.akcja.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); jednorazowe.akcja = true; });

  function pokazDrazki() {
    const { drazekTlo, drazekGalka, celTlo, celGalka } = elementy;
    const rysuj = (d, tlo, galka, widac) => {
      tlo.hidden = galka.hidden = !widac; if (!widac) return;
      const dx = d.x - d.ox, dy = d.y - d.oy, dl = Math.hypot(dx, dy), m = Math.min(1, 50 / Math.max(dl, 1));
      tlo.style.transform = `translate(${d.ox - 50}px, ${d.oy - 50}px)`;
      galka.style.transform = `translate(${d.ox + dx * m - 20}px, ${d.oy + dy * m - 20}px)`;
    };
    rysuj(drazek, drazekTlo, drazekGalka, drazek.id !== null);
    rysuj(atak, celTlo, celGalka, atak.id !== null && atak.celuje);
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
    w.atakKat = atak.id !== null && atak.celuje ? Math.atan2(atak.y - atak.oy, atak.x - atak.ox) : null;
    w.atakTrzyma = mysz.atak || atak.id !== null || klawisze.has('j');
    w.blok = mysz.blok || blokPrzyciskiem || klawisze.has('shift') || klawisze.has('k');
    w.unikTrzyma = unikPrzyciskiem || klawisze.has(' ');
    w.atakStart = jednorazowe.atak; w.unik = jednorazowe.unik; w.klatwa = jednorazowe.klatwa; w.akcja = jednorazowe.akcja; w.mikstura = jednorazowe.mikstura;
    jednorazowe.atak = false; jednorazowe.unik = false; jednorazowe.klatwa = false; jednorazowe.akcja = false; jednorazowe.mikstura = false;
    return w;
  }

  return { odczytaj, get dotyk() { return dotyk; } };
}
