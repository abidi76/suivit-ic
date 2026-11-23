# AGENTS.md

## Objectif du dépôt

`suivit-ic` est une application TypeScript destinée à la gestion des infrastructures TIC.
Elle contient une application Angular sous `apps/web` et un backend NestJS sous `apps/api`.

## Règles générales

- Répondre et documenter en français.
- Préférer des modifications ciblées et minimales.
- Ne jamais committer de secrets, mots de passe, jetons ou fichiers `.env` locaux.
- Ne pas réintroduire `mock-api.interceptor.ts` dans le flux HTTP principal.
- Conserver les conventions TypeScript et Angular du dépôt.
- Ne pas modifier `main` directement : utiliser une branche dédiée.

## Architecture

- Frontend Angular : `apps/web/src/app`
- Backend NestJS : `apps/api/src`
- Authentification frontend : `apps/web/src/app/core/services/auth.service.ts`
- Configuration HTTP Angular : `apps/web/src/app/app.config.ts`
- Intercepteur JWT : `apps/web/src/app/core/interceptors/auth.interceptor.ts`

## Authentification

- La connexion utilise `POST /api/auth/login` avec `{ identifiant, motDePasse }`.
- La modification du mot de passe utilise `POST /api/auth/change-password` avec `{ identifiant, nouveauMotDePasse }`.
- Accepter les formes de jeton suivantes si elles existent déjà dans les contrats API : `accessToken`, `access_token` ou `token`.
- Accepter les formes utilisateur suivantes : `user` ou `utilisateur`.
- Normaliser les rôles backend vers les rôles frontend avant redirection.
- Stocker uniquement le jeton et les données utilisateur nécessaires côté navigateur ; ne jamais persister un mot de passe en clair.
- Toutes les routes protégées doivent être validées côté serveur, pas seulement côté interface.

## Backend

- Ajouter ou maintenir les endpoints NestJS dans le contrôleur d’authentification.
- Valider les DTO avec les règles NestJS existantes.
- Hasher les mots de passe avec l’algorithme prévu par le projet et ne jamais les enregistrer en clair.
- Ne pas retourner de mot de passe ou de hachage dans les réponses API.
- Rechercher les comptes par email ou matricule selon le contrat réel de l’entité utilisateur.
- Utiliser des erreurs HTTP explicites : `400` pour une entrée invalide, `401` pour des identifiants incorrects, `404` pour un compte absent.

## Tests attendus

Avant une fusion, vérifier au minimum :

1. `POST /api/auth/login` avec un utilisateur valide.
2. `POST /api/auth/login` avec des identifiants invalides.
3. `POST /api/auth/change-password` avec un mot de passe conforme.
4. Rejet d’un mot de passe trop court ou invalide.
5. Absence d’erreurs TypeScript/Angular au build.
6. Absence d’accès aux routes protégées sans jeton valide.

## Commandes

- Installer les dépendances : `npm install`
- Tester/servir selon les scripts définis dans `package.json`.
- Vérifier les scripts disponibles avec `npm run` avant d’en proposer de nouveaux.

## Travail courant sur cette branche

La branche `fix/auth-api-integration` doit corriger l’intégration réelle entre Angular et NestJS.
Ne pas revenir à une authentification simulée localement ni aux mots de passe prédéfinis.
