import { collection, query } from 'firebase/firestore';
export function inboxQuery(db, user, ...constraints) {
  if (!user?.uid) throw new Error('Authentification requise pour la boîte partagée.');
  // CoolMail is intentionally a shared demo mailbox. Legacy messages do not
  // contain senderUid; they must remain visible without assigning false owners.
  return query(collection(db, 'emails'), ...constraints);
}
