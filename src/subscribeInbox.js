import { limit, onSnapshot, orderBy } from 'firebase/firestore';
import { inboxQuery } from './inboxQuery.js';

function isMissingIndex(error) {
  return error?.code === 'failed-precondition' && /index/i.test(error.message || '');
}

function compareMessages(a, b) {
  const first = a.data.timestamp, second = b.data.timestamp;
  return (second?.seconds || 0) - (first?.seconds || 0)
    || (second?.nanoseconds || 0) - (first?.nanoseconds || 0)
    || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
}

export function inboxErrorMessage(error) {
  if (error?.code === 'permission-denied') return 'Firebase refuse l’accès à cette boîte. Les règles Firestore doivent autoriser la boîte partagée aux utilisateurs connectés.';
  if (error?.code === 'unauthenticated') return 'Votre connexion a expiré. Reconnectez-vous pour charger les messages.';
  if (error?.code === 'failed-precondition') return 'La requête Firestore ne peut pas être exécutée. Vérifiez la configuration des index.';
  return 'Impossible de charger les messages pour le moment. Vérifiez votre connexion puis réessayez.';
}

export function subscribeInbox(db, user, pageSize, onMessages, onError, listen = onSnapshot) {
  let active = true;
  const subscriptions = new Set();

  function subscribe(indexed) {
    const constraints = indexed ? [orderBy('timestamp', 'desc'), limit(pageSize)] : [];
    const stop = listen(inboxQuery(db, user, ...constraints), snapshot => {
      if (!active) return;
      const messages = snapshot.docs.map(doc => {
        const data = doc.data({ serverTimestamps: 'estimate' });
        return { id: doc.id, data, timestamp: data.timestamp?.seconds ?? null };
      });
      // If the timestamp index is unavailable, sort the shared messages before
      // taking the visible page,
      // otherwise new mail could be hidden by an arbitrary document-ID limit.
      messages.sort(compareMessages);
      onMessages(messages.slice(0, pageSize));
    }, error => {
      if (!active) return;
      if (indexed && isMissingIndex(error)) {
        subscribe(false);
        return;
      }
      onError(error);
    });
    subscriptions.add(stop);
  }

  subscribe(true);
  return () => {
    active = false;
    subscriptions.forEach(stop => stop());
    subscriptions.clear();
  };
}
