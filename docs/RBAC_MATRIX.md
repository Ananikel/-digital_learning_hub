# RBAC_MATRIX.md

## Matrice des Rôles et Permissions

| Module | Action | Super Admin | Admin | Secrétariat | Pédagogie | Enseignant | Étudiant |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Système** | Configurer Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Backup / Restore | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Logs d'audit | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Matières** | Gérer (CRUD) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Utilisateurs** | Gérer Personnel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Gérer Apprenants | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Académique** | Gérer Cohortes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Gérer Cours | ✅ | ✅ | ❌ | ✅ | ✅ | 👁️ |
| | Faire l'appel | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |
| **Évaluations** | Créer / Modifier | ✅ | ✅ | ❌ | ✅ | ✅ | 👁️ |
| | Corriger / Noter | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Finance** | Gérer Paiements | ✅ | ✅ | ✅ | ❌ | ❌ | 👁️ |
| | Voir Rapports Fin. | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **IA / Lib** | Utiliser Assistant IA | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| | Valider Contenu IA | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| | Gérer Bibliothèque | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |

**Légende :**
*   ✅ : Accès complet (CRUD)
*   ❌ : Pas d'accès
*   👁️ : Lecture seule
