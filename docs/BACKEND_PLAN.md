# BACKEND_PLAN.md

## Objectif

Ce fichier décrit le plan backend du MVP LMS / CRM Institut Érudits.

Le backend doit être développé après stabilisation du frontend MVP, de la documentation produit, des modules, de la matrice RBAC et de l'architecture.

## Contrainte d'infrastructure

Le backend doit fonctionner sur le VPS suivant :

- 1 vCPU core
- 4 GB RAM
- 50 GB NVMe disk space
- 4 TB bandwidth

Cette contrainte impose une approche simple, optimisée et progressive.

## Priorité backend

### Phase 1 : Fondations

- Initialiser projet backend
- Configurer variables d'environnement
- Connecter PostgreSQL
- Créer structure modulaire
- Ajouter système d'erreurs propre
- Ajouter validation des entrées
- Ajouter logs de base

### Phase 2 : Authentification

- Connexion utilisateur
- Déconnexion
- Gestion session ou token JWT
- Hash des mots de passe
- Protection des routes
- Gestion du profil utilisateur

### Phase 3 : RBAC

- Rôles
- Permissions
- Affectation de permissions par rôle
- Protection backend par permission
- Restrictions frontend alignées avec backend

### Phase 4 : Modules scolaires essentiels

- Élèves
- Parents
- Professeurs
- Classes
- Inscriptions
- Présences quotidiennes
- Notes

### Phase 5 : Finance scolaire

- Paiements
- Frais scolaires
- Dépenses
- Reçus
- Rapports financiers simples

### Phase 6 : Communication

- Annonces
- Notifications dashboard
- Messages internes simples

### Phase 7 : Administration avancée

- Paramètres de l'école
- Partenaires affichés sur login
- Configuration bilingue
- Backup / Restore / Reset, super admin seulement
- Audit logs

## Règles backend importantes

- Ne jamais faire confiance au frontend pour les permissions
- Valider toutes les entrées côté serveur
- Paginer toutes les listes importantes
- Indexer les colonnes utilisées pour recherche et filtres
- Garder les fichiers uploadés limités au MVP
- Journaliser les actions sensibles
- Préparer `.env.example` pour faciliter la reprise par un développeur

## Endpoints prioritaires

Exemples initiaux :

```text
POST /auth/login
POST /auth/logout
GET /auth/me

GET /users
POST /users
PATCH /users/:id
DELETE /users/:id

GET /students
POST /students
PATCH /students/:id
DELETE /students/:id

GET /classes
POST /classes
PATCH /classes/:id
DELETE /classes/:id

GET /attendance
POST /attendance

GET /grades
POST /grades

GET /payments
POST /payments

GET /dashboard/overview
GET /audit-logs
```

## Décision

Le backend doit commencer seulement après validation des fichiers `.md`, surtout :

- INFRASTRUCTURE.md
- DATABASE_SCHEMA.md
- API_CONTRACT.md
- RBAC_MATRIX.md
