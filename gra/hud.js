// Pasek życia z „Krwią za krew”, wytrzymałość, klątwa, nazwa etapu i myśl bohatera. Zwykły HTML nad płótnem.
import { BOHATER } from './dane.js';
import { etapNazwa } from './walka.js';

export function przygotujHud() {
  const $ = id => document.getElementById(id);
  const el = {
    zycie: $('zycie'), smuga: $('smuga'), sila: $('sila'), etap: $('etap'), mysl: $('mysl'),
    krew: $('krew-podpowiedz'), info: $('info'), pasekZycia: $('pasek-zycia'), portret: $('rama-portret'), klatwa: $('klatwa'), przyciskKlatwy: $('przycisk-klatwa'), akcja: $('akcja'), wnetrze: $('wnetrze'),
    mikstury: $('zapas-mikstur'), drewno: $('zapas-drewna'), ileMikstur: $('ile-mikstur'), przyciskMikstury: $('przycisk-mikstura'),
  };
  const ostatnie = {};
  const ustaw = (klucz, wartosc, fn) => { if (ostatnie[klucz] !== wartosc) { ostatnie[klucz] = wartosc; fn(wartosc); } };

  // licznik klatek: średnia z ostatniej sekundy
  let klatki = 0, odliczanie = 0, fps = 0;

  const dotykHud = matchMedia && matchMedia('(pointer: coarse)').matches;
  function aktualizuj(gra, dt, opisRysowania) {
    const b = gra.bohater, max = BOHATER.zycie;
    const z = Math.max(0, b.zycie) / max * 100, s = b.smuga / max * 100;
    ustaw('zycie', z.toFixed(1), v => { el.zycie.style.width = v + '%'; });
    ustaw('smuga', `${z.toFixed(1)}|${s.toFixed(1)}`, () => { el.smuga.style.left = z + '%'; el.smuga.style.width = s + '%'; });
    ustaw('smugaZyje', b.smugaCzas > 0 && b.smuga > 0, v => el.smuga.classList.toggle('zywa', v));
    ustaw('sila', (b.sila / BOHATER.sila * 100).toFixed(0), v => { el.sila.style.width = v + '%'; });
    ustaw('slaby', b.sila < gra.bron.koszt, v => el.sila.classList.toggle('pusta', v));
    ustaw('klatwa', (b.klatwa * 100).toFixed(0), v => { el.klatwa.style.width = v + '%'; });
    ustaw('klatwaGotowa', b.klatwa >= 1, v => { el.klatwa.classList.toggle('gotowa', v); el.przyciskKlatwy.classList.toggle('gotowa', v); });
    ustaw('etap', etapNazwa(gra), v => { el.etap.textContent = v; });
    const pokazMysl = gra.mysl.czas > 0 ? gra.mysl.tekst : '';
    ustaw('mysl', pokazMysl, v => { el.mysl.textContent = v; el.mysl.classList.toggle('widac', !!v); });
    ustaw('krew', b.smugaCzas > 0 && b.smuga > 0 && b.stan !== 'upadl', v => el.krew.classList.toggle('widac', v));
    ustaw('mikstury', b.mikstury, v => {
      if (el.mikstury) el.mikstury.textContent = dotykHud ? '' : `${v} × mikstura (Q)`;
      if (el.ileMikstur) el.ileMikstur.textContent = v;
      if (el.przyciskMikstury) el.przyciskMikstury.classList.toggle('pusta', !v);
    });
    ustaw('drewno', !!b.drewno, v => { if (el.drewno) el.drewno.hidden = !v; });
    ustaw('rana', b.flash > 0.15, v => { el.pasekZycia.classList.toggle('rana', v); if (el.portret) el.portret.classList.toggle('rana', v); });

    // czynność w chacie (posłanie) albo zamknięte drzwi w walce; ekran snu
    const dotyk = matchMedia && matchMedia('(pointer: coarse)').matches;
    const otwarte = gra.faza === 'przerwa' || gra.faza === 'swit';
    const napisAkcji = gra.akcja === 'wejdz' ? (otwarte ? 'Wejdź do chaty' : '!Nie teraz, potwory blisko') : ({ otworz: 'Otwórz drzwi', zamknij: 'Zamknij drzwi', odpocznij: 'Odpocznij na posłaniu', wstan: 'Wstań', drewno: 'Weź polano', dorzuc: 'Dorzuć do ognia' }[gra.akcja] || '');
    ustaw('akcja', napisAkcji, v => {                                  // „!” na początku: czynność teraz niedostępna
      const zamkniete = v.startsWith('!'), t = zamkniete ? v.slice(1) : v;
      el.akcja.hidden = !v; el.akcja.classList.toggle('zamkniete', zamkniete);
      el.akcja.textContent = !v ? '' : (dotyk || zamkniete ? t : `E: ${t}`);
    });
    ustaw('wnetrze', !!b.spi, v => el.wnetrze.classList.toggle('widac', v));   // sen: izba gaśnie

    klatki++; odliczanie += dt;
    if (odliczanie >= 1) { fps = Math.round(klatki / odliczanie); klatki = 0; odliczanie = 0; el.info.textContent = `${fps} kl./s · ${opisRysowania}`; }
  }

  return { aktualizuj, get fps() { return fps; } };
}
