# PRODUCT_REQUIREMENTS.md

## 1. Vision du Produit
**Digital Learning Hub** (Institut Érudits) est une plateforme intégrée de LMS (Learning Management System) et CRM scolaire. Elle vise à simplifier la gestion académique, administrative et financière pour un institut proposant des formations (Allemand, Anglais, Informatique, IA).

## 2. Public Cible
*   **Administrateurs/Super Admin** : Gestion totale, configuration système, audit.
*   **Secrétariat** : Inscriptions, paiements, suivi administratif.
*   **Responsables Pédagogiques** : Gestion des matières, validation des contenus IA, rapports.
*   **Enseignants** : Gestion des cours, appels, évaluations.
*   **Apprenants** : Consultation des cours, ressources, suivi des paiements.

## 3. Fonctionnalités Clés (MVP)

### 3.1 Gestion Académique
*   **Matières & Niveaux** : Catalogue configurable.
*   **Cohortes** : Groupes d'élèves avec planning et formateur dédié.
*   **Cours** : Planification des séances et objectifs pédagogiques.
*   **Évaluations** : Quiz, devoirs, examens blancs avec système de notation.
*   **Présences** : Suivi quotidien des absences et retards.

### 3.2 Gestion Administrative & Financière
*   **Apprenants** : CRM complet (contact, historique, documents).
*   **Personnel** : Gestion des rôles et permissions (RBAC).
*   **Paiements** : Suivi des frais de scolarité, acomptes, et soldes. Gestion du Mobile Money (TMoney/Moov).
*   **Préinscription en ligne** : Formulaire public pour les nouveaux candidats.

### 3.3 Innovation & Outils
*   **Assistant IA** : Génération de supports (dialogues, quiz, plans de cours) avec validation humaine obligatoire.
*   **Bibliothèque** : Centralisation des ressources numériques (PDF, Audio, Vidéo).
*   **Rapports** : Tableaux de bord analytiques (pédagogie, finance, présence).

## 4. Contraintes Techniques
*   **Stack** : React (Frontend), Node.js/Express (Backend), PostgreSQL (Database).
*   **Interface** : Moderne, responsive, mode Navy, bilingue (FR/EN).
*   **Déploiement** : VPS via Coolify.

## 5. Critères d'Acceptation
*   L'application doit être totalement bilingue sans texte "hardcodé".
*   Les permissions doivent être vérifiées au niveau du backend.
*   Le système doit être capable de gérer 500+ utilisateurs.
