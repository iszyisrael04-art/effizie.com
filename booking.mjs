// Dates use calendar values, independent of browser timezone and DST changes.
export function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function nextDay(value) {
  if (!isDate(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
export function stayError(checkin, checkout, today) {
  if (checkin && (!isDate(checkin) || checkin < today)) return 'Please choose a check-in date today or later.';
  if (checkout && !checkin) return 'Please choose your check-in date first.';
  if (checkout && (!isDate(checkout) || checkout <= checkin)) return 'Check-out must be after check-in.';
  return '';
}
export async function requestReservation(data, fetcher = globalThis.fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetcher('https://formspree.io/f/mpqgwvdk', {
      method: 'POST', body: data,
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) throw new Error('The form provider could not accept your enquiry. Please try again, call, or use WhatsApp.');
    const result = await response.json();
    if (result.ok !== true) throw new Error('We could not confirm delivery. Please try again, call, or use WhatsApp.');
  } finally {
    clearTimeout(timer);
  }
}
