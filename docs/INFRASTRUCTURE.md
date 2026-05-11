# INFRASTRUCTURE.md

## Objectif

Ce fichier définit l'infrastructure cible prévue pour le MVP LMS / CRM Institut Érudits avant le démarrage sérieux du backend.

## Spécification VPS prévue

L'application sera hébergée sur un VPS avec les caractéristiques suivantes :

| Ressource | Spécification |
|---|---|
| Type | VPS |
| CPU | 1 vCPU core |
| RAM | 4 GB RAM |
| Stockage | 50 GB NVMe disk space |
| Bande passante | 4 TB bandwidth |

## Hypothèse d'utilisation

Cette configuration est adaptée pour un MVP scolaire ou un premier déploiement contrôlé, notamment pour environ 500 utilisateurs prévus, avec une utilisation progressive.

Elle convient pour :

- Frontend web de l'application
- Backend API
- Base de données PostgreSQL ou Supabase auto-hébergé selon le choix final
- Authentification et gestion des rôles
- Gestion des élèves, parents, professeurs, classes, notes, présences, paiements et rapports
- Stockage limité de fichiers administratifs et pédagogiques

## Points à surveiller

Cette configuration reste limitée. Il faut donc éviter de surcharger le VPS dès le MVP.

À surveiller :

- Utilisation RAM
- Taille de la base PostgreSQL
- Volume des fichiers téléversés
- Nombre de connexions simultanées
- Sauvegardes automatiques
- Logs applicatifs
- Tâches lourdes en arrière-plan

## Recommandation technique pour le MVP

Pour rester stable sur 1 vCPU et 4 GB RAM, le backend doit être simple, propre et optimisé.

Recommandations :

- Utiliser PostgreSQL avec index propres sur les tables principales
- Éviter les requêtes trop lourdes côté dashboard
- Paginer toutes les grandes listes : élèves, paiements, présences, notes, rapports
- Limiter les uploads de fichiers au départ
- Compresser les images si l'application accepte des photos
- Mettre en cache certains indicateurs du dashboard si nécessaire
- Activer les sauvegardes régulières
- Séparer plus tard le stockage de fichiers si le volume augmente

## Architecture cible MVP

Architecture recommandée :

- Frontend : React, Tailwind CSS, i18n FR/EN
- Backend : Node.js, Express ou NestJS
- Base de données : PostgreSQL
- Authentification : JWT ou Supabase Auth selon le choix final
- Reverse proxy : NGINX ou proxy intégré selon l'environnement
- SSL : Let's Encrypt ou Cloudflare
- Sécurité : UFW, Fail2Ban, HTTPS obligatoire, variables d'environnement protégées

## Stratégie d'évolution

Phase 1 : MVP sur le VPS actuel

- Déploiement frontend + backend + PostgreSQL
- Utilisation limitée et test réel avec un petit groupe
- Audit performance et sécurité

Phase 2 : Optimisation

- Ajout monitoring
- Sauvegardes automatiques
- Compression fichiers
- Amélioration des requêtes SQL
- Séparation des environnements dev, staging et production

Phase 3 : Scalabilité

Quand l'application devient active avec beaucoup de données ou plusieurs écoles, envisager :

- VPS plus puissant
- Base PostgreSQL managée
- Stockage objet séparé pour fichiers
- CDN pour assets statiques
- Monitoring avancé
- Pipeline CI/CD

## Décision actuelle

La configuration VPS retenue pour le démarrage est :

1 vCPU core, 4 GB RAM, 50 GB NVMe disk space, 4 TB bandwidth.

Cette configuration sera considérée comme la contrainte d'infrastructure officielle du MVP.
