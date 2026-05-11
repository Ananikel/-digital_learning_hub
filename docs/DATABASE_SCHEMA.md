# DATABASE_SCHEMA.md

## Entités du Système (PostgreSQL)

### 1. Authentification & Sécurité
*   **users** : id, email, password_hash, role_id, created_at, updated_at.
*   **roles** : id, name (Super Admin, etc.), description.
*   **permissions** : id, name (create_course, etc.), module.
*   **role_permissions** : role_id, permission_id.

### 2. Gestion Académique
*   **subjects** : id, name_fr, name_en, code, category, color, description.
*   **levels** : id, name, subject_id, duration, base_fee.
*   **cohorts** : id, name, subject_id, level_id, teacher_id, schedule, capacity, status.
*   **courses** : id, title, cohort_id, teacher_id, week, session, type, objective, status.

### 3. Utilisateurs & Inscriptions
*   **students** : id, user_id (optional), full_name, phone, enrollment_date, status.
*   **parents** : id, full_name, phone, student_id.
*   **teachers** : id, user_id, full_name, phone, qualification, availability.
*   **enrollments** : id, student_id, cohort_id, status, enrollment_date.

### 4. Pédagogie
*   **attendance** : id, student_id, course_id, date, status (present, absent, late, excused), note.
*   **assessments** : id, title, course_id, type (quiz, mock_exam, etc.), max_score.
*   **grades** : id, student_id, assessment_id, score, decision, feedback, correction_status.

### 5. Finance
*   **payments** : id, student_id, amount, method (cash, mobile_money, bank), status, reference, date, due_date.
*   **expenses** : id, description, amount, category, date.

### 6. IA & Bibliothèque
*   **ai_requests** : id, requester_id, subject_id, prompt, output, status (pending, validated), validated_by.
*   **resources** : id, title, type (pdf, audio, etc.), file_url, visibility, subject_id, level_id.

### 7. Administration
*   **audit_logs** : id, user_id, action, module, target_id, timestamp.
*   **settings** : id, key, value, category, description.
