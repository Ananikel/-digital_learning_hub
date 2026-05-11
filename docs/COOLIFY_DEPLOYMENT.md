# Déploiement sur Coolify - Digital Learning Hub

Ce guide détaille les étapes pour mettre en ligne le projet sur votre instance Coolify.

## 1. Base de données PostgreSQL

Dans Coolify, créez une nouvelle ressource **PostgreSQL**.

- **Destination** : Votre serveur.
- **Paramètres** : Notez bien l'**Internal Connection String** (ex: `postgres://user:pass@postgres:5432/db`).
- **Public Access** : Désactivé (le backend communiquera via le réseau interne).

## 2. Déploiement du Backend (NestJS)

Ajoutez une nouvelle application de type **Public Repository** ou **Private Repository**.

- **Build Pack** : Docker (un Dockerfile est présent à la racine du dossier `/backend`).
- **Variables d'Environnement** :
  - `DATABASE_URL` : L'URL de connexion interne de votre Postgres Coolify.
  - `JWT_SECRET` : Une clé secrète longue et complexe.
  - `JWT_EXPIRES_IN` : `7d`
  - `PORT` : `3000`
- **Domaine** : Configurez votre sous-domaine (ex: `api.votre-domaine.com`).
- **Health Check** : Port `3000`.

## 3. Déploiement du Frontend (Vite)

Ajoutez une nouvelle application.

- **Build Pack** : Static.
- **Build Command** : `npm run build`
- **Publish Directory** : `dist`
- **Variables d'Environnement (Build time)** :
  - `VITE_API_URL` : L'URL publique de votre API (ex: `https://api.votre-domaine.com`).
- **Domaine** : Votre domaine principal (ex: `votre-domaine.com`).

## 4. Initialisation de la base (Post-déploiement)

Une fois le backend déployé, vous pouvez exécuter les migrations depuis le terminal de l'application dans Coolify :
```bash
npx prisma migrate deploy
npx prisma db seed
```
