# Stack technique et justifications — CoFound.mg

> Ce document est un **registre de décisions**, pas une liste de technologies. Chaque brique
> comporte les options envisagées, les critères appliqués, la recommandation et **le
> compromis assumé**.
>
> Principe directeur : *tous les choix sont ceux qu'on prendrait en lançant réellement cette
> entreprise.* Là où un raccourci existe mais ne serait pas le bon choix en production, il
> est nommé et écarté explicitement.

**Version** : 1.0 — 20 août 2026
**Auteur** : Yonni (CTO)

---

## Critères d'évaluation

| | Critère |
|---|---|
| **C1** | Est-ce le choix qu'on ferait en construisant réellement cette entreprise ? |
| **C2** | Tient-il la V2/V3 sans réécriture majeure ? |
| **C3** | Courbe d'apprentissage pour l'équipe, et dette contractée si on prend le raccourci |
| **C4** | Coût réel à 24 mois, pas coût aujourd'hui |
| **C5** | Maturité et écosystème — l'outil sera-t-il encore là et maintenu ? |
| **C6** | Contraintes malgaches : bande passante, latence, parc mobile, hébergement accessible |

## Deux contraintes qui gouvernent presque tout

1. **Application mobile native prévue en V2** ⇒ le backend doit être une API consommable par
   plusieurs clients. Toute technologie qui pousse la logique métier dans la couche web est
   éliminée d'office.
2. **~4 300 lignes de frontend existantes et un design system de qualité** ⇒ toute
   technologie imposant leur réécriture doit apporter un gain décisif, sinon c'est du coût pur.

---

## 1. Frontend — framework applicatif

| Option | C1 | C2 | C3 | C6 |
|---|---|---|---|---|
| **React 19 + Vite (SPA)** *(existant)* | ✅ standard des SaaS applicatifs | ✅ | ✅ zéro migration | ✅ coquille en cache CDN |
| Next.js (App Router) | ✅ mais orienté contenu | ⚠️ attire la logique dans la couche web | ❌ migration du routing et des layouts | ⚠️ SSR = aller-retour à ~250 ms |
| React Router 7 en mode framework | ✅ | ✅ | ⚠️ | ✅ |

### ▶ **React + Vite en SPA**, landing prérendue en statique.

**Pourquoi pas Next.js**, alors que c'est le choix par défaut du marché :

1. **Son atout principal ne s'applique pas.** Le rendu serveur sert le référencement et le
   premier affichage des pages publiques. CoFound, c'est **une page publique et tout le reste
   derrière une authentification**. Le référencement d'un feed privé n'existe pas. On paierait
   la complexité du SSR pour un bénéfice qui concerne un écran sur vingt — et cet écran-là se
   prérend en statique.
2. **La latence joue contre lui ici.** Depuis Antananarivo, l'aller-retour vers un centre de
   données européen tourne autour de 200–300 ms. Avec le rendu serveur, chaque navigation paie
   cet aller-retour avant le premier pixel. Avec une SPA servie par CDN, la coquille est
   **déjà en cache au point de présence le plus proche** ; il ne reste qu'un appel d'API.
3. **Il contredit la décision « mobile natif en V2 ».** Next.js invite par construction à
   écrire la logique métier dans le serveur web (route handlers, server actions). Excellent
   quand le web est le seul client, piège quand une application mobile est annoncée : cette
   logique n'est alors accessible par aucun autre client, et on se retrouve à extraire une API
   a posteriori d'un code jamais pensé pour ça.

**Compromis assumé** : on renonce au rendu serveur pour l'applicatif. Si le besoin apparaît
(page vitrine publique de projet, V2), React Router 7 — déjà présent — dispose d'un mode
framework avec rendu serveur qu'on activera **sur ces routes-là uniquement**. La porte de
sortie existe et ne coûte rien à garder ouverte.

**Ajout** : `vite-plugin-pwa` pour l'installabilité et la mise en cache de la coquille. Le
champ *« Framework front : (PWA) »* du cahier des charges était vide ; il est rempli ainsi —
**PWA installable et cache statique en V1, aucune écriture hors ligne**.

---

## 2. Backend — framework

| Option | C1 | C3 | C5 |
|---|---|---|---|
| **NestJS** | ✅ structure imposée, adaptée à une équipe qui grandit | ⚠️ DI et décorateurs à apprendre (~1 semaine) | ✅ 8 ans, très large écosystème |
| Express / Fastify + structure maison | ❌ conventions divergentes à 3 développeurs | ✅ | ✅ |
| Laravel | ✅ excellent framework | ✅ 2/3 de l'équipe le connaît | ✅ |

### ▶ **NestJS** — le choix du cahier des charges est validé, avec la justification qu'il ne donnait pas.

**Les deux préoccupations les plus délicates de ce produit sont transversales**, et NestJS
les traite nativement :

| Préoccupation | Mécanisme Nest | Ce que ça évite |
|---|---|---|
| Autorisation (RBAC, refus par défaut) | **Guard** global | La dispersion dans les contrôleurs — on en oublie un, la fuite arrive par là |
| Projection pseudonymisée | **Interceptor / serializer** | Un masquage réécrit à chaque endpoint, donc oubliable |
| Journal d'audit | **Interceptor** | Des appels manuels dispersés et incomplets |

Autrement dit, NestJS n'est pas retenu pour son élégance mais **parce que sa structure
correspond à la forme de nos risques**.

**Pourquoi pas Laravel**, alors que deux membres le maîtrisent : ça sépare le langage entre
le back et le front, et on perd le bénéfice le plus concret d'une équipe de trois en
TypeScript partout — **les schémas de validation et les types partagés**. À trois, dupliquer
chaque règle de validation des deux côtés et les maintenir synchronisées est une source
d'erreurs permanente.

**Pourquoi pas Express nu** : sans opinion imposée, trois développeurs produisent trois
architectures. À l'échelle de ce domaine (RBAC, audit, machine à états, import par lots),
c'est de la dette garantie.

**Compromis assumé** : une semaine d'apprentissage de l'injection de dépendances pour deux
membres sur trois. Coût unique, bénéfice permanent.

---

## 3. Style d'architecture

### ▶ **Monolithe modulaire**, un seul déployable.

Modules à frontières explicites : `auth`, `identity`, `organizations`, `import`, `matching`,
`projects`, `discovery`, `opportunities`, `messaging`, `moderation`, `notifications`,
`finance`.

Les microservices résoudraient un problème d'échelle et d'organisation que nous n'avons pas,
en en créant trois que nous ne savons pas encore gérer : transactions distribuées,
observabilité répartie, déploiement coordonné.

Ce qui compte pour C2, c'est que **les frontières soient nettes dès maintenant** : aucun
accès direct d'un module aux tables d'un autre. Le jour où le matching ou les notifications
demandent une échelle propre, on les extrait — parce que la couture existe.

> « Défendable dans deux ans » ne signifie pas avoir découpé trop tôt, mais avoir rendu le
> découpage possible.

---

## 4. Base de données

| Option | Adéquation au domaine | C2 | C6 |
|---|---|---|---|
| **PostgreSQL** | ✅ domaine profondément relationnel | ✅ JSONB, recherche plein texte, extensions | ✅ managé partout, peu coûteux |
| MySQL | ✅ | ⚠️ JSON et recherche plein texte plus faibles | ✅ |
| MongoDB | ❌ | ❌ | ✅ |

### ▶ **PostgreSQL** — validé, avec deux précisions.

Le domaine est un graphe de relations : personne ↔ affiliation ↔ organisation ↔ projet ↔
membre ↔ candidature ↔ opportunité. L'intégrité référentielle n'y est pas un confort — un
journal d'audit référençant un utilisateur supprimé est une défaillance de conformité, pas un
bug d'affichage.

**Précision 1 — JSONB, mais délibérément.** Les 9 blocs du BMC et les réponses d'onboarding
ont un schéma qui bougera à chaque itération produit : en JSONB. Tout le reste en relationnel
strict, avec contraintes.
> Règle : *JSONB pour ce qui varie légitimement, jamais pour éviter d'écrire une migration.*

**Précision 2 — la recherche reste dans PostgreSQL.** `tsvector` + `pg_trgm` + **`unaccent`**
couvrent les besoins du MVP. L'`unaccent` n'est pas un détail : « Télécom » et « Telecom »
doivent se trouver mutuellement, de même que les noms malgaches avec et sans diacritiques. On
n'ajoute pas de moteur de recherche dédié tant que la pertinence n'est pas un problème
ressenti — c'est un service de moins à exploiter et à garder synchronisé.

---

## 5. ORM

### ▶ **Prisma** — validé.

Les trois membres le connaissent : sur C3, c'est décisif, et rien d'autre n'apporte de gain
compensant l'apprentissage. Migrations propres, types générés, bonne intégration Nest.

**Compromis assumé, à dire explicitement** : Prisma est faible sur les requêtes complexes. Le
calcul de score du Dream-Match et les agrégats analytiques seront écrits **en SQL brut avec
un typage explicite**. Ce n'est pas un échec de l'ORM, c'est son usage normal — l'ORM sert le
CRUD et les relations, le SQL sert l'analytique. Le prévoir dès le départ évite de tordre
l'ORM jusqu'à produire des requêtes illisibles et lentes.

---

## 6. Authentification

| Option | C1 | C4 (24 mois) | Risque |
|---|---|---|---|
| **Maison, primitives éprouvées** | ✅ notre cycle de vie est spécifique | ✅ ~0 | ⚠️ à nous de ne pas nous tromper |
| Auth0 / Clerk | ⚠️ conçus pour l'inscription libre | ❌ facturation par utilisateur actif | ✅ |
| Supabase Auth | ⚠️ | ✅ | ✅ |

### ▶ **Authentification maison, sur des primitives éprouvées.**

**Pourquoi pas un service tiers**, alors que c'est en général le bon réflexe :

1. **Il n'y a pas d'inscription.** L'essentiel de la valeur d'un Clerk ou d'un Auth0 —
   parcours d'inscription, connexion sociale, liens magiques en libre-service — ne s'applique
   pas.
2. **Ce qui reste est couplé à notre domaine** : jetons d'invitation rattachés à un lot
   d'import, états `invité / actif / gelé / sortant / alumni`, permissions dérivées de
   l'affiliation. Externaliser, c'est synchroniser en permanence deux sources de vérité sur
   l'identité.
3. **C4** : une facturation par utilisateur actif sur une plateforme **gratuite pour les
   établissements** met un coût variable en face d'un revenu nul.
4. **Commercial** : vendre à un ministère une plateforme dont les identités étudiantes sont
   hébergées chez un prestataire américain est une conversation qu'on préfère éviter.

### Correction apportée au cahier des charges

Le cahier des charges dit « JWT + Refresh Tokens ». C'est incomplet, et l'implémentation
naïve de cette phrase est l'erreur de sécurité la plus répandue. Ce qui est fait précisément :

- Mots de passe hachés en **argon2id**. Jamais de sel maison, jamais de primitive inventée.
- **Jeton d'accès de courte durée (15 min), gardé en mémoire du client** — jamais dans
  `localStorage`, qui est lisible par n'importe quelle injection de script.
- **Jeton de rafraîchissement dans un cookie `httpOnly`, `Secure`, `SameSite=Lax`**, avec
  **rotation à chaque usage et révocation de toute la famille de jetons en cas de
  réutilisation détectée** — ce qui transforme un vol de jeton en incident détecté plutôt
  qu'en accès permanent.
- Jetons d'invitation et de réinitialisation : usage unique, expirants, haute entropie,
  **stockés hachés** en base.
- Limitation de débit sur la connexion et verrouillage progressif.
- **[V2]** second facteur TOTP **obligatoire** pour les comptes organisation et staff — ce
  sont eux qui détiennent les données de centaines d'étudiants.

**Compromis assumé** : c'est le seul endroit du produit où « fait maison » comporte un vrai
risque. Il est acceptable **parce qu'on n'invente aucune primitive** — on assemble des
mécanismes standard et documentés. C'est aussi le premier module à faire relire par un tiers.

---

## 7. Temps réel — **désaccord avec le cahier des charges**

| Option | Besoin réel | Poids client | Réseau instable | Exploitation |
|---|---|---|---|---|
| **SSE** | ✅ serveur → client suffit | ✅ natif, 0 Ko | ✅ reconnexion et reprise natives | ✅ HTTP simple |
| Socket.IO *(proposé)* | ⚠️ bidirectionnel non nécessaire | ❌ ~30 Ko | ⚠️ gestion d'état à notre charge | ⚠️ sessions collantes en multi-instance |
| Polling long | ✅ | ✅ | ✅ | ⚠️ connexions retenues |

### ▶ **Server-Sent Events. Socket.IO est rejeté.**

Il faut d'abord énoncer le besoin, ce que le cahier des charges ne faisait pas : **qu'est-ce
qui doit être poussé ?** Les notifications et les nouveaux messages. Les deux vont
exclusivement **du serveur vers le client**. Le client, lui, envoie ses messages par un
`POST` ordinaire.

Socket.IO résout la communication **bidirectionnelle** temps réel — besoin que nous n'avons
pas. En le prenant, on paie : une bibliothèque cliente d'une trentaine de kilooctets sur des
connexions où chaque kilooctet compte (C6), une couche protocolaire au-dessus de WebSocket,
une machinerie de repli, et la contrainte de sessions collantes le jour où l'API tournera sur
plusieurs instances.

SSE fait exactement ce dont on a besoin : du HTTP standard, qui traverse tous les proxys et
pare-feux — y compris ceux des universités, qui bloquent parfois les WebSockets — avec
**reconnexion automatique et reprise par `Last-Event-ID` gérées nativement par le
navigateur**. Sur un réseau mobile qui coupe régulièrement, cette reprise native vaut mieux
que la machine à états qu'on écrirait autour d'un socket.

**Compromis assumé** : si un besoin authentiquement bidirectionnel apparaît — édition
collaborative du BMC à plusieurs curseurs, indicateurs de saisie — on ajoutera un canal
WebSocket **pour cette fonctionnalité précise**. On ne prend pas une dépendance lourde et
globale pour un besoin qu'on n'a pas.

---

## 8. Stockage de fichiers

### ▶ **Cloudflare R2** — validé, avec deux ajouts.

R2 est retenu sur C4 pour une raison précise : **zéro frais de sortie**. Les avatars et
pièces jointes sont servis en boucle ; sur S3, c'est exactement la ligne qui fait la mauvaise
surprise à 18 mois.

**Ajout 1 — téléversement direct par URL présignée.** Le fichier va du navigateur vers R2
sans transiter par notre API : moins de bande passante consommée, moins de charge serveur,
téléversements longs qui ne monopolisent pas un worker.

**Ajout 2 — redimensionnement côté client avant l'envoi.** Faire téléverser une photo de
4 Mo depuis un téléphone en 3G, c'est garantir l'abandon. Le navigateur redimensionne à
512 px avant l'envoi ; le serveur valide type et dimensions par sécurité. Trois lignes de
code, et ça change l'expérience réelle d'un utilisateur à Antsiranana.

Accès via le SDK S3 standard : changer de fournisseur reste une modification de configuration.

---

## 9. Hébergement — **désaccord partiel avec le cahier des charges**

| Option | C4 à 24 mois | C3 exploitation | C6 |
|---|---|---|---|
| **VPS européen + Docker Compose** | ✅ ~5–15 €/mois, prévisible | ⚠️ à notre charge | ✅ |
| PaaS (Render, Railway) | ❌ coût qui décolle vite | ✅ | ⚠️ paliers gratuits qui mettent en veille |
| Serverless + base serverless | ⚠️ imprévisible | ✅ | ❌ démarrages à froid sur lien à forte latence |

### ▶ **Architecture répartie plutôt qu'un unique VPS.**

Le cahier des charges dit « VPS Linux + Nginx + Docker » pour tout. Chaque composant va là où
il est bon, ce qui coûte moins cher **et** sert mieux les utilisateurs malgaches.

| Composant | Où | Pourquoi |
|---|---|---|
| Frontend statique | **CDN (Cloudflare Pages)** | La coquille ne traverse pas l'océan à chaque visite. Gratuit. |
| API NestJS | **VPS européen** (Hetzner / Scaleway), Docker Compose | Coût prévisible et faible, contrôle total, portable |
| PostgreSQL | **Managé, même région que l'API** | Voir ci-dessous |
| Fichiers | Cloudflare R2 | §8 |
| Emails | Service transactionnel | §11 |

**Sur la base de données — écart net avec le cahier des charges.** Auto-héberger PostgreSQL
sur le même VPS, sans personne dont c'est le métier, c'est l'endroit où l'on perd des
données. Non par incompétence, mais parce que les sauvegardes vérifiées, la restauration
testée et les montées de version demandent une discipline qu'une équipe de trois qui
construit un produit n'aura pas. Une base managée (**Neon, Supabase, Aiven**) apporte
sauvegardes automatiques, restauration à un instant donné et montées de version.
*Les paliers gratuits évoluent : à revérifier au moment du choix.*

> **Contrainte non négociable : base et API dans la même région.** Une base « gratuite » aux
> États-Unis avec une API en Europe ajoute ~100 ms à chaque requête, et il y en a plusieurs
> par écran.

**Sur la région, honnêtement** : aucun grand fournisseur n'a de région à Madagascar. Le trafic
international malgache emprunte les câbles sous-marins vers l'Afrique australe, La Réunion et
l'Europe. **L'Europe (Paris ou Francfort) est le choix pragmatique** — c'est là que se
trouvent les fournisseurs abordables et là que routent les liaisons. Les régions africaines
coûtent nettement plus cher sans garantie de meilleur acheminement, le trafic transitant
souvent par l'Europe malgré tout. **À mesurer réellement avant d'y toucher, jamais à
supposer.**

**Le raccourci qu'on ne prend pas.** Render ou Railway en palier gratuit mettent le service en
veille après inactivité : le premier visiteur attend parfois cinquante secondes. Pour un
produit qu'on présente à un directeur d'université, **un service qui dort est pire que pas de
service**. Et sur C4, ces plateformes deviennent plus chères qu'un VPS dès la sortie du
palier gratuit. Un serveur à 5 € par mois n'est pas un problème de budget, c'est une décision
de sérieux.

**Compromis assumé** : le VPS nous met l'exploitation sur les bras. On la rend supportable
par la discipline, pas par l'héroïsme :
- Docker Compose, déploiement par GitHub Actions
- Sauvegardes automatisées **stockées hors de la machine**
- **Restauration testée au moins une fois avant le lancement** — une sauvegarde jamais
  restaurée n'est pas une sauvegarde
- Supervision de disponibilité

Et comme tout est conteneurisé, passer plus tard chez un grand fournisseur est une migration,
pas une réécriture.

---

## 10. Reverse proxy — **désaccord avec le cahier des charges**

### ▶ **Caddy plutôt que Nginx.**

HTTPS automatique par Let's Encrypt, renouvellement inclus, une dizaine de lignes de
configuration là où Nginx en demande quatre-vingts. Pour une équipe sans personne dédiée à
l'exploitation, c'est la différence entre un certificat qui se renouvelle tout seul et un
certificat qui expire un samedi soir.

**Compromis assumé** : Nginx a une communauté plus vaste, donc plus de réponses toutes faites
en cas de configuration exotique. À notre échelle, la simplicité l'emporte largement.

---

## 11. Email transactionnel — **absent du cahier des charges, et pourtant critique**

**Sans email, il n'y a pas de plateforme** : l'unique porte d'entrée d'un étudiant est un
message d'invitation.

### ▶ **Resend** (ou **Brevo** si l'on privilégie l'hébergement européen et le coût au volume).

Le critère déterminant n'est pas le prix, c'est la **délivrabilité**. Une invitation qui tombe
dans les indésirables, c'est un étudiant perdu — et à l'échelle d'une promotion, c'est un
établissement perdu.

- **SPF, DKIM et DMARC correctement configurés sur `cofound.mg`.** Sans DKIM, une part
  significative des messages sera classée en indésirable, notamment par les filtres
  universitaires.
- Montée en volume progressive plutôt qu'un envoi massif d'un coup sur un domaine neuf.
- **Webhook de rebond branché sur le rapport d'import.** Quand douze adresses du fichier de
  l'établissement n'existent pas, l'information remonte **dans sa console** : « 12 adresses
  invalides, voici lesquelles ». Une contrainte technique transformée en service, et une
  protection de la réputation du domaine.

> **À traiter tôt** : l'enregistrement d'un domaine en `.mg` passe par le registre national et
> comporte des démarches locales. À lancer bien avant d'en avoir besoin, car la délivrabilité
> et la crédibilité en dépendent.

---

## 12. Traitements asynchrones — **absent du cahier des charges**

Un import de 500 étudiants ne peut pas s'exécuter dans une requête HTTP, et l'envoi de 500
invitations non plus.

| Option | Infra supplémentaire | Adéquation |
|---|---|---|
| **pg-boss** (file dans PostgreSQL) | ✅ aucune | ✅ largement suffisant à notre volume |
| BullMQ + Redis | ❌ un service avec état de plus | ✅ nécessaire à fort débit |

### ▶ **pg-boss.**

Les traitements de fond sont **transactionnels avec nos données** : créer les comptes et
mettre en file les invitations dans la même transaction élimine toute une classe
d'incohérences (comptes orphelins, emails partis pour des comptes non créés). Et on n'ajoute
pas Redis — c'est-à-dire un service supplémentaire à superviser et à sauvegarder — pour un
débit que PostgreSQL absorbe sans effort.

**Point de bascule écrit d'avance** — on introduira Redis quand l'une de ces conditions sera
vraie :
- plusieurs instances d'API à alimenter en SSE (il faudra un canal de diffusion) ;
- un débit de traitements que la base ne suit plus.

> Écrire le déclencheur à l'avance évite les deux erreurs symétriques : ajouter trop tôt, et
> s'accrocher trop tard.

---

## 13. Briques secondaires

| Brique | Retenu | Justification |
|---|---|---|
| **Style d'API** | **REST + OpenAPI généré** | Consommable par le web, le mobile V2 et un partenaire. Et surtout, la **sérialisation explicite garantit le masquage pseudonyme** — en GraphQL, n'importe quel champ peut être demandé, ce qui rend la garantie beaucoup plus fragile. tRPC écarté : couple trop fortement le client TypeScript, inadapté à une application native. |
| **Validation** | **Zod, partagé client/serveur** (`nestjs-zod`) | Une seule source de vérité par règle. S'écarte de l'idiome Nest (`class-validator`) : compromis assumé, le partage vaut plus que l'orthodoxie. |
| **Dépôt** | **Monorepo pnpm** — `apps/web`, `apps/api`, `packages/shared` | Sans espace de travail partagé, on perd le bénéfice principal du TypeScript de bout en bout et on duplique la validation. |
| **Recherche** | **PostgreSQL** (`tsvector`, `pg_trgm`, `unaccent`) | Un service de moins à exploiter et synchroniser. Meilisearch le jour où la pertinence devient un problème ressenti. |
| **Cache** | **Aucun au départ** | Cache HTTP et CDN pour le statique. Redis arrive avec le point de bascule du §12. |
| **i18n** | **i18next** | Mature, pluralisation correcte, écosystème large. Règle de lint interdisant les chaînes en dur. |
| **Erreurs** | **Sentry** | On ne corrige pas ce qu'on ne voit pas. Un utilisateur malgache ne remplira pas de rapport de bug. |
| **Disponibilité** | Sonde externe (UptimeRobot, BetterStack) | Palier gratuit suffisant. |
| **Journaux** | **pino**, structurés en JSON | Journaux exploitables plutôt que du `console.log`. |
| **Mesure d'audience** | **Umami ou Plausible — pas Google Analytics** | On promet la minimisation des données aux établissements et l'anonymisation aux ministères. Livrer Google Analytics à côté est une contradiction qu'un partenaire institutionnel finira par relever. |
| **Tests** | **Vitest** + **Supertest** sur une vraie base + **Playwright** sur 3 parcours | Voir ci-dessous |
| **CI/CD** | **GitHub Actions** | Déjà en usage dans l'équipe. Lint, types, tests, build, déploiement. |

### Sur les tests — ce n'est pas une question de forme

Deux ensembles de règles sont des **promesses commerciales et éthiques**, pas des détails
d'implémentation :

1. « L'établissement ne peut pas lire les conversations de ses étudiants. »
2. « Le nom, la photo et le genre ne sortent pas de l'API avant dévoilement mutuel. »

Ces deux-là reçoivent une **couverture exhaustive** — matrice complète des rôles croisée avec
les ressources, et projection pseudonyme vérifiée sur chaque endpoint renvoyant un profil. Le
reste du code reçoit une couverture pragmatique.

> On ne vise pas un pourcentage global : on teste intégralement ce dont la violation
> détruirait le projet, et raisonnablement le reste.

---

## 14. Verdict, ligne par ligne, sur la stack du cahier des charges

| Ligne d'origine | Verdict | Ce qui change |
|---|---|---|
| Frontend : React + TypeScript | ✅ **Validé** | + Vite en SPA ; Next.js écarté avec argumentaire |
| Framework front : *(PWA)* | ⚠️ **Champ rempli** | PWA installable + cache statique ; aucune écriture hors ligne en V1 |
| Styling : Tailwind CSS | ✅ **Validé** | Design system existant conservé tel quel |
| Backend : Node.js + TypeScript | ✅ **Validé** | — |
| Framework back : NestJS | ✅ **Validé** | Justification ajoutée : guards, interceptors, monolithe modulaire |
| Base de données : PostgreSQL | ✅ **Validé** | + JSONB délibéré, recherche intégrée, `unaccent` |
| ORM : Prisma | ✅ **Validé** | + SQL brut assumé pour matching et agrégats |
| Temps réel : WebSocket + Socket.IO | ❌ **Rejeté** | **SSE** — besoin unidirectionnel, poids client, réseau instable |
| Auth : JWT + Refresh Tokens | ⚠️ **Corrigé** | argon2id ; accès en mémoire ; rafraîchissement en cookie `httpOnly` avec rotation et détection de réutilisation |
| Permissions : RBAC | ✅ **Validé, précisé** | Contextuel, refus par défaut, dans un guard, matrice testée exhaustivement |
| Stockage : Cloudflare R2 | ✅ **Validé** | + URL présignées, redimensionnement client |
| Conteneurisation : Docker | ✅ **Validé** | Docker Compose ; portabilité = notre porte de sortie |
| Serveur : VPS Linux | ⚠️ **Affiné** | VPS pour l'API seule ; statique sur CDN ; **PostgreSQL managé** |
| Reverse proxy : Nginx | ❌ **Remplacé** | **Caddy** — HTTPS automatique, configuration dix fois plus courte |
| — | ➕ **Manquant** | Email transactionnel · file de traitements · recherche · supervision · tests · CI/CD · monorepo et types partagés · sauvegardes restaurées · i18n · mesure d'audience respectueuse |

> **La remarque de fond** : le cahier des charges listait des technologies, pas une
> architecture. Les briques absentes ne sont pas des accessoires — sans email il n'y a pas
> d'utilisateurs, sans file d'attente l'import casse au premier fichier volumineux, sans
> sauvegarde restaurée on perd les données d'un établissement partenaire.

---

## 15. Coût réel à 24 mois

*Hypothèses à corriger avec le business plan : ~5 000 étudiants, ~30 établissements,
~20 partenaires, ~50 Go de fichiers.*

| Poste | Aujourd'hui | À 24 mois | Note |
|---|---|---|---|
| Frontend (CDN) | 0 € | 0 € | Palier gratuit largement suffisant |
| VPS API | ~5 € | ~15–25 € | Instance plus grosse, ou deux instances |
| PostgreSQL managé | 0 € | ~20–40 € | Le poste qui croît le plus |
| Fichiers R2 | 0 € | ~2–5 € | Sortie gratuite = pas de mauvaise surprise |
| Email | 0 € | ~20 € | Croît avec le volume de notifications |
| Sentry, supervision | 0 € | 0–25 € | Paliers gratuits tenables longtemps |
| Domaine `.mg` | ~30 €/an | ~30 €/an | — |
| **Total mensuel** | **≈ 5 €** | **≈ 60–115 €** | Prévisible, sans effet de seuil |

**Deux propriétés à retenir pour le business plan** :
1. **Aucun poste n'est facturé par utilisateur actif.** La croissance du nombre d'étudiants —
   gratuite pour nous par construction du modèle économique — ne fait pas exploser la facture.
2. **La sortie réseau est gratuite** partout où elle compte, ce qui élimine la ligne qui
   surprend le plus souvent.

---

## 16. Synthèse

**Validé** : React + TypeScript, Tailwind, Node + TypeScript, NestJS, PostgreSQL, Prisma,
RBAC, Cloudflare R2, Docker.

**Rejeté ou corrigé** : Socket.IO → **SSE** · Nginx → **Caddy** · JWT en stockage local →
**cookie `httpOnly` avec rotation** · VPS unique → **statique sur CDN + API sur VPS +
PostgreSQL managé**.

**Écarté après examen, avec la raison** :
- **Next.js** — le rendu serveur ne sert qu'un écran, et il attire la logique métier hors de
  l'API alors qu'une application native est prévue.
- **Laravel** — perte des types et schémas partagés.
- **Auth0 / Clerk** — conçus pour l'inscription libre, qui n'existe pas ici ; coût par
  utilisateur actif face à un revenu nul de ce côté.
- **GraphQL et tRPC** — garantie de masquage plus fragile ; couplage inadapté au mobile.
- **Redis et Meilisearch** — services avec état ajoutés avant d'en avoir le besoin.
- **Paliers gratuits des PaaS** — un service qui se met en veille est un choix qu'on ne
  referait jamais en production.

**Ajouté** : email transactionnel avec délivrabilité soignée et rebonds rebranchés sur le
rapport d'import · file de traitements dans PostgreSQL · recherche intégrée · supervision ·
stratégie de tests ciblée sur les permissions et le pseudonymat · CI/CD · monorepo à types
partagés · sauvegardes hors machine et restauration testée.

### Le fil conducteur de tous ces arbitrages

> **Ne pas ajouter de service avec état tant qu'un service existant fait le travail.**
>
> **Placer chaque garantie critique — autorisation, masquage, audit — à un seul endroit du
> code, appliquée systématiquement, plutôt que répétée à chaque endpoint.**
