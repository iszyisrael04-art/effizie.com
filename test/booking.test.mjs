import test from 'node:test';
import assert from 'node:assert/strict';
import { isDate, nextDay, stayError, requestReservation } from '../booking.mjs';

test('stay dates reject past dates, invalid dates, and checkout before arrival', () => {
  assert.equal(isDate('2026-02-30'), false);
  assert.equal(isDate('2028-02-29'), true);
  assert.equal(isDate('2026-2-01'), false);
  assert.equal(nextDay('2026-12-31'), '2027-01-01');
  assert.equal(nextDay('2028-02-28'), '2028-02-29');
  assert.equal(stayError('2026-10-23', '2026-10-24', '2026-10-22'), '');
  assert.equal(stayError('', '', '2026-10-22'), '');
  assert.match(stayError('2026-10-21', '', '2026-10-22'), /today or later/);
  assert.match(stayError('', '2026-10-24', '2026-10-22'), /check-in date first/);
  assert.match(stayError('2026-10-24', '2026-10-24', '2026-10-22'), /after check-in/);
  assert.match(stayError('2026-10-24', '2026-10-23', '2026-10-22'), /after check-in/);
});

test('only the provider confirming success completes an enquiry', async () => {
  const data = new FormData(); data.set('name', 'Test guest');
  await requestReservation(data, async (url, options) => {
    assert.equal(url, 'https://formspree.io/f/mpqgwvdk');
    assert.equal(options.method, 'POST');
    assert.equal(options.body, data);
    assert.equal(options.headers.Accept, 'application/json');
    return { ok: true, json: async () => ({ ok: true }) };
  });
  await assert.rejects(requestReservation(data, async () => ({ ok: false })), /could not accept/);
  await assert.rejects(requestReservation(data, async () => ({ ok: true, json: async () => ({ error: 'unconfirmed' }) })), /could not confirm/);
  await assert.rejects(requestReservation(data, async () => { throw new TypeError('Failed to fetch'); }), /Failed to fetch/);
});
