# ARCHITECTURE.md

## Vision générale

Le projet LMS / CRM Institut Érudits est une plateforme bilingue FR/EN destinée à gérer les opérations scolaires, administratives, pédagogiques, financières et communicationnelles d'un institut.

L'architecture doit être simple, maintenable et adaptée à un VPS limité : 1 vCPU core, 4 GB RAM, 50 GB NVMe disk space et 4 TB bandwidth.

## Objectif de l'architecture

L'objectif est de permettre à un développeur de reconstruire ou continuer le MVP sans confusion.

L'application doit :

- Centraliser les données scolaires et financières
- Supporter environ 500 utilisateurs au départ
- Gérer les rôles et permissions avec précision
- Être bilingue dès le départ
- Rester performante sur une infrastructure légère
- Préparer une future montée en charge

## Stack recommandée

| Couche | Choix recommandé |
|---|---|
| Frontend | React + Tailwind CSS |
| UI | Dashboard moderne, responsive, clair et mode navy |
| Internationalisation | i18n FR/EN, sans texte codé en dur |
| Backend | Node.js avec Express ou NestJS |
| Base de données | PostgreSQL |
| Authentification | JWT, sessions sécurisées ou Supabase Auth |
| Hébergement | VPS |
| Reverse proxy | NGINX ou proxy compatible |
| SSL | Let's Encrypt ou Cloudflare |
| Sécurité | UFW, Fail2Ban, HTTPS, RBAC, audit logs |

## Contrainte VPS officielle

- 1 vCPU core
- 4 GB RAM
- 50 GB NVMe disk space
- 4 TB bandwidth

Ces limites doivent guider les décisions techniques.

## Principes clés

### 1. Simplicité backend

Le backend doit rester modulaire, mais pas inutilement complexe.

Modules backend recommandés :

- Auth
- Users
- Roles & Permissions
- Students
- Parents
- Teachers
- Classes
- Attendance
- Grades
- Finance
- Reports
- Announcements
- Settings
- Audit Logs

### 2. Base de données propre

La base PostgreSQL doit être structurée autour des entités clés :

- users
- roles
- permissions
- students
- parents
- teachers
- classes
- enrollments
- attendance
- grades
- payments
- expenses
- announcements
- settings
- audit_logs

### 3. Performance

Pour respecter la limite de 1 vCPU et 4 GB RAM :

- Pagination obligatoire sur les grandes tables
- Index SQL sur les champs recherchés souvent
- Dashboard analytique avec requêtes optimisées
- Pas de calcul lourd côté serveur à chaque chargement
- Uploads limités au MVP

### 4. Sécurité

Sécurité minimum obligatoire :

- HTTPS actif
- Mots de passe hachés
- RBAC appliqué côté backend, pas seulement côté frontend
- Journalisation des actions critiques
- Protection contre accès non autorisé aux modules sensibles
- Backup et restauration réservés au super admin
- Variables d'environnement hors du code source

## Déploiement recommandé

Structure possible :

```text
/app
  /frontend
  /backend
  /database
  /docs
  docker-compose.yml
  .env.example
```

## Services recommandés

Pour le MVP :

- frontend app
- backend api
- postgres db
- nginx proxy

Éviter d'ajouter trop de services au départ, car le VPS est limité.

## Décision d'architecture

Le backend doit être développé progressivement après validation complète des fichiers de cadrage, notamment :

- AGENTS.md
- SKILLS.md
- ROADMAP.md
- PRODUCT_REQUIREMENTS.md
- MODULES.md
- RBAC_MATRIX.md
- DATABASE_SCHEMA.md
- API_CONTRACT.md
- INFRASTRUCTURE.md
