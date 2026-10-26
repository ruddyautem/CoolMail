import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, limit, orderBy, query, queryEqual } from 'firebase/firestore';
import { inboxErrorMessage, subscribeInbox } from './subscribeInbox.js';

// Only construct queries; all subscriptions are intercepted before any network I/O.
const db = getFirestore(initializeApp({ projectId: 'demo-coolmail-regressions' }, 'inbox-regressions'));
const user = { uid: 'fixture-user', email: 'Fixture@example.test', emailVerified: true };
const doc = (id, seconds, nanoseconds = 0) => ({ id, data: () => ({ subject: id, timestamp: { seconds, nanoseconds } }) });

function fixture(account = user, pageSize = 2) {
  const calls = [], updates = [], errors = [];
  const cleanup = subscribeInbox(db, account, pageSize, data => updates.push(data), error => errors.push(error), (q, next, error) => {
    const call = { query: q, next, error, stopped: false };
    calls.push(call);
    return () => { call.stopped = true; };
  });
  return { calls, updates, errors, cleanup };
}

test('the shared subscription uses descending order and a bounded page without an owner filter', () => {
  const f = fixture();
  assert.ok(queryEqual(f.calls[0].query, query(collection(db, 'emails'), orderBy('timestamp', 'desc'), limit(2))));
  f.calls[0].next({ docs: [doc('first', 20), doc('second', 10)] });
  assert.deepEqual(f.updates[0].map(m => m.id), ['first', 'second']);
  assert.equal(f.calls.length, 1);
  f.cleanup();
});

test('a disabled timestamp index can fall back without hiding newly arrived shared messages', () => {
  const f = fixture();
  f.calls[0].error({ code: 'failed-precondition', message: 'The query requires an index.' });
  assert.equal(f.calls.length, 2);
  assert.ok(queryEqual(f.calls[1].query, query(collection(db, 'emails'))));
  // A limit before sorting would hide a new document whose ID sorts later.
  f.calls[1].next({ docs: [doc('a-old', 1), doc('b-middle', 2), doc('z-new', 100)] });
  assert.deepEqual(f.updates[0].map(m => m.id), ['z-new', 'b-middle']);
  f.calls[1].next({ docs: [doc('a-old', 1), doc('b-middle', 2), doc('z-new', 100), doc('zz-arrived', 101)] });
  assert.deepEqual(f.updates[1].map(m => m.id), ['zz-arrived', 'z-new']);
  assert.deepEqual(f.errors, []);
  f.cleanup();
  assert.ok(f.calls.every(call => call.stopped));
});

test('permission failures never trigger a broader read and retain a useful diagnostic', () => {
  const f = fixture();
  const error = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
  f.calls[0].error(error);
  assert.equal(f.calls.length, 1);
  assert.equal(f.errors[0], error);
  assert.match(inboxErrorMessage(error), /Firebase refuse/);
  f.cleanup();
});

test('old messages without senderUid and other senders remain visible in the authenticated shared mailbox', () => {
  const f = fixture({ ...user, emailVerified: false });
  assert.ok(queryEqual(f.calls[0].query, query(collection(db, 'emails'), orderBy('timestamp', 'desc'), limit(2))));
  f.calls[0].next({ docs: [doc('legacy-without-owner', 1), { id: 'other-sender', data: () => ({ senderUid: 'another-user', timestamp: { seconds: 2 } }) }] });
  assert.deepEqual(f.updates[0].map(m => m.id), ['other-sender', 'legacy-without-owner']);
  assert.throws(() => fixture({ ...user, uid: undefined }), /Authentification requise/);
  f.cleanup();
});

test('timestamps keep nanosecond order and callbacks stop after unmount', () => {
  const f = fixture();
  f.calls[0].next({ docs: [doc('older', 1793045298, 1), doc('newer', 1793045298, 2)] });
  assert.deepEqual(f.updates[0].map(m => m.id), ['newer', 'older']);
  f.cleanup();
  f.calls[0].error({ code: 'failed-precondition', message: 'Index missing' });
  f.calls[0].next({ docs: [doc('late', 30)] });
  assert.equal(f.calls.length, 1);
  assert.equal(f.updates.length, 1);
});
