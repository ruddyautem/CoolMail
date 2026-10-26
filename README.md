# CoolMail

Démo React/Vite d’une **boîte partagée entre tous les utilisateurs connectés**, conformément au fonctionnement du site existant. Ce projet stocke des messages dans Firestore et n’envoie pas d’emails SMTP.

Configurer les variables Firebase publiques de `src/firebase.js`, activer Google dans Firebase Authentication, puis lancer `bun install --frozen-lockfile`, `bun run dev` et `bun run build`. Les tests se lancent avec `bun run test`.

## Lecture et historique

La liste et le compteur portent sur la même collection partagée `emails`. Les anciens messages sans `senderUid`, les messages d’autres comptes et les nouveaux messages restent visibles aux utilisateurs connectés. Aucune migration, réattribution ni suppression des anciens documents n’est nécessaire.

La requête initiale trie les messages par date décroissante et se limite à 50 résultats ; le défilement charge davantage de messages. Elle utilise l’index automatique de `timestamp`, sans index composé par propriétaire. Les abonnements sont nettoyés au démontage.

Si l’index de date a été désactivé, le mode de compatibilité trie les messages côté client avant de limiter la page affichée. Ce mode lit davantage de documents ; réactiver l’index automatique de date est recommandé pour les grosses collections. Un refus de permission est affiché comme tel, et le bouton Actualiser relance le chargement.

## Écriture et règles

Les nouveaux messages enregistrent l’UID et l’email de l’expéditeur authentifié, ainsi que l’email du destinataire. Ces champs servent à identifier les nouveaux envois, pas à masquer les autres messages de cette démo. Le formulaire attend la confirmation Firestore et conserve le brouillon si l’envoi échoue.

`firestore.rules` et `firebase.json` décrivent la configuration prévue : lecture partagée pour les utilisateurs authentifiés, validation de l’identité et du contenu lors d’une création, modification et suppression interdites. Les règles distantes ne sont jamais modifiées par le build. Tester les règles dans l’émulateur avant déploiement et coordonner leur activation avec la publication du nouveau client, car l’ancienne version n’envoie pas les nouveaux champs d’identité.

La navigation directe vers `/mail` sans sélection revient à la boîte. Le style de l’interface est conservé. Les contrôles de maquette dépourvus de service associé restent des éléments de démonstration.
