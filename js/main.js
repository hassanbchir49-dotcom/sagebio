const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  menu.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  toggle.textContent = open ? '✕' : '☰';
}

toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

const RESERVATION_EMAIL = 'hassanbchir49@gmail.com';
const form = document.getElementById('reservation-form');
const status = document.getElementById('form-status');

function setStatus(message, type) {
  status.className = 'form-status ' + type;
  status.textContent = message;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fields = [...form.querySelectorAll('input[required]')];
  let valid = true;
  fields.forEach((f) => {
    const ok = f.value.trim() !== '' && f.checkValidity();
    f.classList.toggle('invalid', !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    setStatus('Merci de remplir correctement tous les champs.', 'error');
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus('Envoi en cours…', '');

  try {
    const response = await fetch('https://formsubmit.co/ajax/' + RESERVATION_EMAIL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const result = await response.json();
    if (!response.ok || result.success === 'false') throw new Error(result.message || 'Erreur');

    form.reset();
    setStatus('Merci ! Votre réservation a bien été envoyée. Nous vous recontacterons par e-mail.', 'ok');
  } catch (err) {
    const data = new FormData(form);
    const body = ['Nom', 'Prénom', 'Organisation', 'Email'].map((k) => k + ' : ' + data.get(k)).join('\n');
    const mailto = 'mailto:' + RESERVATION_EMAIL +
      '?subject=' + encodeURIComponent('Réservation SAGEBIO 2027') +
      '&body=' + encodeURIComponent(body);
    status.className = 'form-status error';
    status.innerHTML = 'L\'envoi automatique a échoué. <a href="' + mailto + '">Envoyer par e-mail</a>.';
  } finally {
    button.disabled = false;
  }
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');

const lightboxCount = lightbox.querySelector('.lightbox-count');
const openers = [...document.querySelectorAll('.g-open')];
let current = 0;

function showPhoto(index) {
  current = (index + openers.length) % openers.length;
  const btn = openers[current];
  const img = btn.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = btn.closest('figure').querySelector('figcaption').firstChild.textContent;
  lightboxCount.textContent = (current + 1) + ' / ' + openers.length;
}

openers.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    showPhoto(i);
    lightbox.showModal();
  });
});

lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(current - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(current + 1));

lightbox.addEventListener('click', (e) => {
  if (e.target !== lightboxImg && !e.target.closest('.lightbox-nav')) lightbox.close();
});

lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

let touchStartX = null;
lightboxImg.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightboxImg.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
});

function closeMenu() { setMenu(false); }

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
});
window.matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);

menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});
