import { isDate, nextDay, stayError, requestReservation } from './booking.mjs';

document.documentElement.classList.add('js');
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navMenu');
function closeMenu() {
  nav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuButton.focus();
  }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const query = new URLSearchParams(location.search);
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  for (const name of ['room', 'guests']) {
    const input = contactForm.elements.namedItem(name);
    const value = query.get(name);
    if ([...input.options].some(option => option.value === value)) input.value = value;
  }
  for (const name of ['checkin', 'checkout']) {
    const value = query.get(name);
    if (isDate(value || '')) contactForm.elements.namedItem(name).value = value;
  }
}
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
document.querySelectorAll('form').forEach(form => {
  const checkin = form.elements.namedItem('checkin');
  const checkout = form.elements.namedItem('checkout');
  if (!checkin || !checkout) return;
  checkin.min = today;
  function validateDates() {
    checkin.setCustomValidity(''); checkout.setCustomValidity('');
    checkout.min = isDate(checkin.value) ? nextDay(checkin.value) : today;
    const error = stayError(checkin.value, checkout.value, today);
    if (error) (checkin.value && (!isDate(checkin.value) || checkin.value < today) ? checkin : checkout).setCustomValidity(error);
  }
  checkin.addEventListener('input', validateDates);
  checkout.addEventListener('input', validateDates);
  validateDates();
});
contactForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = contactForm.querySelector('[type=submit]');
  if (submit.disabled || !contactForm.reportValidity()) return;
  const status = contactForm.querySelector('.form-status');
  const content = submit.innerHTML;
  const data = new FormData(contactForm);
  submit.disabled = true; contactForm.setAttribute('aria-busy', 'true');
  submit.textContent = 'Sending enquiry…'; status.textContent = '';
  try {
    await requestReservation(data);
    // Storage may be disabled in private browsing; delivery still succeeded.
    try { sessionStorage.setItem('effizie-enquiry-sent', 'true'); } catch { /* optional receipt */ }
    location.assign('thankyou.html');
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'The request timed out. Delivery could not be confirmed. Please contact our team by phone or WhatsApp before retrying.'
      : error.message === 'Failed to fetch'
        ? 'Unable to connect. Please check your connection, or contact our team by phone or WhatsApp.'
        : error.message || 'Unable to send your enquiry. Please call or use WhatsApp.';
  } finally {
    submit.disabled = false; submit.innerHTML = content;
    contactForm.removeAttribute('aria-busy');
  }
});
const thanks = document.querySelector('[data-thankyou-message]');
if (thanks) {
  let sent = false;
  try {
    sent = sessionStorage.getItem('effizie-enquiry-sent') === 'true';
    sessionStorage.removeItem('effizie-enquiry-sent');
  } catch { /* show neutral wording when a receipt cannot be read */ }
  if (sent) {
    thanks.textContent = 'Your enquiry has been sent. Our team will contact you about availability and rates. Your reservation is confirmed only after the hotel confirms your booking.';
  } else {
    document.querySelector('.success-symbol')?.setAttribute('hidden', '');
    document.querySelector('.thank-you .eyebrow').textContent = 'PLAN A STAY WITH US';
  }
}

const filters = [...document.querySelectorAll('[data-filter]')];
const photos = [...document.querySelectorAll('.gallery-item')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  photos.forEach(photo => { photo.hidden = button.dataset.filter !== 'All' && photo.dataset.category !== button.dataset.filter; });
  const count = photos.filter(photo => !photo.hidden).length;
  document.querySelector('.photo-count').textContent = `${count} photograph${count === 1 ? '' : 's'}`;
}));
const lightbox = document.querySelector('.lightbox');
let visiblePhotos = [], photoIndex = 0, opener;
function showPhoto(index) {
  photoIndex = (index + visiblePhotos.length) % visiblePhotos.length;
  const button = visiblePhotos[photoIndex].querySelector('.gallery-open');
  const img = lightbox.querySelector('#lightbox-image');
  img.src = button.dataset.image; img.alt = button.dataset.caption;
  lightbox.querySelector('#lightbox-caption').textContent = button.dataset.caption;
  lightbox.querySelector('[data-photo-position]').textContent = `${photoIndex + 1} / ${visiblePhotos.length}`;
}
document.querySelectorAll('.gallery-open').forEach(button => button.addEventListener('click', () => {
  opener = button; visiblePhotos = photos.filter(photo => !photo.hidden);
  showPhoto(visiblePhotos.indexOf(button.closest('.gallery-item')));
  lightbox.showModal();
}));
lightbox?.querySelector('[data-close-lightbox]').addEventListener('click', () => lightbox.close());
lightbox?.querySelector('[data-prev]').addEventListener('click', () => showPhoto(photoIndex - 1));
lightbox?.querySelector('[data-next]').addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
});
lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener('close', () => opener?.focus());
