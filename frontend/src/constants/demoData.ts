export const INITIAL_SUBJECTS = [
  { id: "SUB-001", subjectKey: "german", nameFr: "Allemand", nameEn: "German", code: "DE", categoryKey: "academicCategoryLanguage", levels: ["A1", "A2", "B1", "B2"], duration: "3 mois", weeklySessions: 3, sessionDuration: "3h", baseFee: 50000, owner: "Responsable pédagogique", statusKey: "subjectStatusActive", color: "cyan", description: "Parcours allemand pour études, travail, voyage et certification." },
  { id: "SUB-002", subjectKey: "english", nameFr: "Anglais", nameEn: "English", code: "GB", categoryKey: "academicCategoryLanguage", levels: ["Beginner", "Intermediate"], duration: "3 mois", weeklySessions: 3, sessionDuration: "2h", baseFee: 40000, owner: "Responsable pédagogique", statusKey: "subjectStatusActive", color: "violet", description: "Parcours anglais pour communication professionnelle et académique." },
  { id: "SUB-003", subjectKey: "computer", nameFr: "Informatique", nameEn: "Computer skills", code: "IT", categoryKey: "academicCategoryTech", levels: ["Intro", "Office"], duration: "2 mois", weeklySessions: 2, sessionDuration: "2h", baseFee: 30000, owner: "Admin IT", statusKey: "subjectStatusActive", color: "orange", description: "Compétences informatiques pratiques pour débutants." },
  { id: "SUB-004", subjectKey: "artificialIntelligence", nameFr: "Intelligence artificielle", nameEn: "Artificial Intelligence", code: "AI", categoryKey: "academicCategoryTech", levels: ["Intro", "Prompting", "Automation"], duration: "2 mois", weeklySessions: 2, sessionDuration: "2h", baseFee: 50000, owner: "AI Coach", statusKey: "subjectStatusActive", color: "emerald", description: "Formation pratique IA, prompts, agents et automatisation." }
];

export const INITIAL_COHORTS = [
  { id: "c1", nameKey: "a1Morning", subjectKey: "german", level: "A1", students: 18, capacity: 25, teacher: "M. Joseph", schedule: "08:00 - 11:00", progress: 32, statusKey: "active", gradient: "from-cyan-400 to-sky-600" },
  { id: "c2", nameKey: "b1Evening", subjectKey: "german", level: "B1", students: 25, capacity: 25, teacher: "Mme Brigitte", schedule: "16:00 - 19:00", progress: 58, statusKey: "full", gradient: "from-violet-500 to-purple-700" },
  { id: "c3", nameKey: "itIntro", subjectKey: "computer", level: "Intro", students: 10, capacity: 20, teacher: "Admin IT", schedule: "14:00 - 16:00", progress: 43, statusKey: "planned", gradient: "from-orange-400 to-red-500" },
  { id: "c4", nameKey: "ai", subjectKey: "artificialIntelligence", level: "Intro", students: 8, capacity: 20, teacher: "AI Coach", schedule: "12:00 - 14:00", progress: 18, statusKey: "planned", gradient: "from-emerald-400 to-cyan-700" }
];

export const INITIAL_LEARNERS = [
  { id: "STU-001", name: "Koffi Mensah", phone: "+228 90 00 00 01", subjectKey: "german", level: "A1", statusKey: "active", progress: 32, attendance: 91, paid: 25000, balance: 25000 },
  { id: "STU-002", name: "Afi Lawson", phone: "+228 90 00 00 02", subjectKey: "german", level: "B1", statusKey: "active", progress: 58, attendance: 84, paid: 50000, balance: 25000 },
  { id: "STU-003", name: "Kodjo Amouzou", phone: "+228 90 00 00 03", subjectKey: "computer", level: "Intro", statusKey: "active", progress: 43, attendance: 96, paid: 30000, balance: 0 },
  { id: "STU-004", name: "Ama Johnson", phone: "+228 90 00 00 04", subjectKey: "english", level: "Beginner", statusKey: "active", progress: 24, attendance: 88, paid: 20000, balance: 20000 },
  { id: "STU-005", name: "Eric Mawuli", phone: "+228 90 00 00 05", subjectKey: "artificialIntelligence", level: "Intro", statusKey: "active", progress: 18, attendance: 94, paid: 25000, balance: 25000 }
];

export const INITIAL_TEACHERS = [
  { id: "TCH-001", name: "M. Joseph", phone: "+228 91 00 00 01", email: "joseph@lms.local", position: "Formateur allemand", departmentKey: "departmentPedagogy", subjectKey: "german", qualification: "B2/C1", workload: 9, availability: "08:00 - 11:00", assigned: 1, assignedCohorts: ["a1Morning"], teacherRoleKey: "teacherRoleTrainer", accountStatusKey: "activeAccount", permissions: ["createCourse", "editCourse", "takeAttendance", "createAssessment", "correctAssessment", "publishResource", "useAi"], statusKey: "active" },
  { id: "TCH-002", name: "Mme Brigitte", phone: "+228 91 00 00 02", email: "brigitte@lms.local", position: "Responsable pédagogique", departmentKey: "departmentPedagogy", subjectKey: "german", qualification: "Responsable pédagogique", workload: 9, availability: "16:00 - 19:00", assigned: 1, assignedCohorts: ["b1Evening"], teacherRoleKey: "teacherRolePedagogyLead", accountStatusKey: "activeAccount", permissions: ["createCourse", "editCourse", "takeAttendance", "editAttendance", "createAssessment", "correctAssessment", "publishResource", "useAi", "validateAi", "viewReports"], statusKey: "active" },
  { id: "TCH-003", name: "Admin IT", phone: "+228 91 00 00 03", email: "it@lms.local", position: "Support informatique", departmentKey: "departmentIT", subjectKey: "computer", qualification: "Support IT / IA", workload: 4, availability: "14:00 - 16:00", assigned: 1, assignedCohorts: ["itIntro"], teacherRoleKey: "teacherRoleITSupport", accountStatusKey: "activeAccount", permissions: ["createCourse", "editCourse", "takeAttendance", "publishResource", "useAi", "manageSettings", "viewAudit"], statusKey: "planned" },
  { id: "TCH-004", name: "AI Coach", phone: "+228 91 00 00 04", email: "ai@lms.local", position: "Responsable contenu IA", departmentKey: "departmentAI", subjectKey: "artificialIntelligence", qualification: "Prompting · Agents", workload: 4, availability: "12:00 - 14:00", assigned: 1, assignedCohorts: ["ai"], teacherRoleKey: "teacherRoleAiAssistant", accountStatusKey: "activeAccount", permissions: ["createCourse", "editCourse", "publishResource", "useAi", "validateAi"], statusKey: "planned" },
  { id: "TCH-005", name: "Secrétariat", phone: "+228 91 00 00 05", email: "secretariat@lms.local", position: "Secrétaire administratif", departmentKey: "departmentSecretariat", subjectKey: "german", qualification: "Accueil · inscriptions · paiements", workload: 40, availability: "08:00 - 17:00", assigned: 0, assignedCohorts: [], teacherRoleKey: "teacherRoleSecretariat", accountStatusKey: "activeAccount", permissions: ["manageLearners", "manageEnrollments", "takeAttendance", "managePayments", "viewReports"], statusKey: "active" }
];

export const INITIAL_COURSES = [
  { id: "CRS-001", title: "Alphabet und Begrüßung", subjectKey: "german", level: "A1", cohortNameKey: "a1Morning", teacher: "M. Joseph", week: 1, session: 1, duration: "3h", typeKey: "vocabulary", objective: "Salutations, alphabet, sons de base", resources: 3, homework: 1, statusKey: "published", progress: 30 },
  { id: "CRS-002", title: "Sich vorstellen", subjectKey: "german", level: "A1", cohortNameKey: "a1Morning", teacher: "M. Joseph", week: 1, session: 2, duration: "3h", typeKey: "oralPractice", objective: "Présentation personnelle simple", resources: 4, homework: 1, statusKey: "published", progress: 45 },
  { id: "CRS-003", title: "Interview simulation", subjectKey: "german", level: "B1", cohortNameKey: "b1Evening", teacher: "Mme Brigitte", week: 7, session: 1, duration: "3h", typeKey: "quiz", objective: "Réponses structurées en entretien", resources: 2, homework: 1, statusKey: "review", progress: 60 },
  { id: "CRS-004", title: "File management basics", subjectKey: "computer", level: "Intro", cohortNameKey: "itIntro", teacher: "Admin IT", week: 2, session: 1, duration: "2h", typeKey: "workshop", objective: "Créer, classer et retrouver des fichiers", resources: 2, homework: 1, statusKey: "draft", progress: 20 },
  { id: "CRS-005", title: "Prompting fundamentals", subjectKey: "artificialIntelligence", level: "Intro", cohortNameKey: "ai", teacher: "AI Coach", week: 1, session: 1, duration: "2h", typeKey: "workshop", objective: "Rédiger une instruction claire et vérifiable", resources: 3, homework: 1, statusKey: "draft", progress: 10 }
];

export const INITIAL_ATTENDANCE = [
  { id: "ATT-001", learnerName: "Koffi Mensah", subjectKey: "german", cohortNameKey: "a1Morning", courseTitle: "Alphabet und Begrüßung", week: 1, session: 1, date: "2026-05-12", statusKey: "present", note: "Participation active" },
  { id: "ATT-002", learnerName: "Afi Lawson", subjectKey: "german", cohortNameKey: "b1Evening", courseTitle: "Interview simulation", week: 7, session: 1, date: "2026-05-12", statusKey: "late", note: "Arrivée après 20 minutes" },
  { id: "ATT-003", learnerName: "Kodjo Amouzou", subjectKey: "computer", cohortNameKey: "itIntro", courseTitle: "File management basics", week: 2, session: 1, date: "2026-05-13", statusKey: "excused", note: "Absence justifiée" },
  { id: "ATT-004", learnerName: "Ama Johnson", subjectKey: "english", cohortNameKey: "demoCohortName", courseTitle: "Speaking basics", week: 1, session: 1, date: "2026-05-14", statusKey: "present", note: "Bonne participation" },
  { id: "ATT-005", learnerName: "Eric Mawuli", subjectKey: "artificialIntelligence", cohortNameKey: "ai", courseTitle: "Prompting fundamentals", week: 1, session: 1, date: "2026-05-14", statusKey: "present", note: "Très engagé" }
];

export const INITIAL_ASSESSMENTS = [
  { id: "ASM-001", title: "Quiz A1 salutations", learnerName: "Koffi Mensah", subjectKey: "german", cohortNameKey: "a1Morning", courseTitle: "Alphabet und Begrüßung", typeKey: "quiz", score: 82, maxScore: 100, date: "2026-05-15", decisionKey: "passed", correctionKey: "corrected", note: "Bonne maîtrise du vocabulaire de base" },
  { id: "ASM-002", title: "Simulation entretien B1", learnerName: "Afi Lawson", subjectKey: "german", cohortNameKey: "b1Evening", courseTitle: "Interview simulation", typeKey: "mockExam", score: 68, maxScore: 100, date: "2026-05-18", decisionKey: "needsSupport", correctionKey: "corrected", note: "Renforcer la structure des réponses orales" },
  { id: "ASM-003", title: "Devoir fichiers", learnerName: "Kodjo Amouzou", subjectKey: "computer", cohortNameKey: "itIntro", courseTitle: "File management basics", typeKey: "assignment", score: 0, maxScore: 100, date: "2026-05-19", decisionKey: "needsSupport", correctionKey: "notCorrected", note: "À corriger par le formateur" },
  { id: "ASM-004", title: "Prompt clarity check", learnerName: "Eric Mawuli", subjectKey: "artificialIntelligence", cohortNameKey: "ai", courseTitle: "Prompting fundamentals", typeKey: "quiz", score: 74, maxScore: 100, date: "2026-05-20", decisionKey: "passed", correctionKey: "corrected", note: "Bonne compréhension des consignes" }
];

export const INITIAL_RESOURCES = [
  { id: "RES-001", title: "A1 Week 1 Pack", subjectKey: "german", level: "A1", typeKey: "pdf", owner: "M. Joseph", visibilityKey: "studentsOnly", size: "2.4 MB", downloads: 18, courseTitle: "Alphabet und Begrüßung", fileName: "a1-week-1-pack.pdf", fileUrl: "https://example.com/resources/a1-week-1-pack.pdf", description: "Fiche de vocabulaire, dialogue, exercices et devoir de révision." },
  { id: "RES-002", title: "B1 Interview Audio", subjectKey: "german", level: "B1", typeKey: "audio", owner: "Mme Brigitte", visibilityKey: "teachersOnly", size: "8.1 MB", downloads: 7, courseTitle: "Interview simulation", fileName: "b1-interview-audio.mp3", fileUrl: "https://example.com/resources/b1-interview-audio.mp3", description: "Audio de préparation aux réponses orales en entretien." },
  { id: "RES-003", title: "File Practice Template", subjectKey: "computer", level: "Intro", typeKey: "template", owner: "Admin IT", visibilityKey: "internalOnly", size: "640 KB", downloads: 10, courseTitle: "File management basics", fileName: "file-practice-template.docx", fileUrl: "https://example.com/resources/file-practice-template.docx", description: "Modèle d’exercice pour créer, classer et retrouver des fichiers." },
  { id: "RES-004", title: "Prompt Bank Starter", subjectKey: "artificialIntelligence", level: "Intro", typeKey: "promptBank", owner: "AI Coach", visibilityKey: "studentsOnly", size: "1.2 MB", downloads: 12, courseTitle: "Prompting fundamentals", fileName: "prompt-bank-starter.pdf", fileUrl: "https://example.com/resources/prompt-bank-starter.pdf", description: "Banque de prompts pour générer dialogues, quiz et corrections." },
  { id: "RES-005", title: "English Speaking Cards", subjectKey: "english", level: "Beginner", typeKey: "document", owner: "English Trainer", visibilityKey: "publicResource", size: "900 KB", downloads: 4, courseTitle: "Speaking basics", fileName: "english-speaking-cards.pdf", fileUrl: "https://example.com/resources/english-speaking-cards.pdf", description: "Cartes de conversation pour pratiquer l’anglais débutant." }
];

export const INITIAL_PAYMENTS = [
  { id: "PAY-001", learnerName: "Koffi Mensah", subjectKey: "german", cohortNameKey: "a1Morning", level: "A1", totalFees: 50000, amountPaid: 25000, amountDue: 25000, methodKey: "mobileMoney", statusKey: "partial", paymentDate: "2026-05-10", dueDate: "2026-06-10", receipt: "RC-0001", note: "Premier acompte reçu" },
  { id: "PAY-002", learnerName: "Afi Lawson", subjectKey: "german", cohortNameKey: "b1Evening", level: "B1", totalFees: 75000, amountPaid: 50000, amountDue: 25000, methodKey: "cash", statusKey: "partial", paymentDate: "2026-05-09", dueDate: "2026-06-09", receipt: "RC-0002", note: "Paiement partiel au secrétariat" },
  { id: "PAY-003", learnerName: "Kodjo Amouzou", subjectKey: "computer", cohortNameKey: "itIntro", level: "Intro", totalFees: 30000, amountPaid: 30000, amountDue: 0, methodKey: "cash", statusKey: "received", paymentDate: "2026-05-08", dueDate: "2026-05-08", receipt: "RC-0003", note: "Paiement complet" },
  { id: "PAY-004", learnerName: "Ama Johnson", subjectKey: "english", cohortNameKey: "demoCohortName", level: "Beginner", totalFees: 40000, amountPaid: 20000, amountDue: 20000, methodKey: "bankTransfer", statusKey: "partial", paymentDate: "2026-05-11", dueDate: "2026-06-11", receipt: "RC-0004", note: "Solde attendu avant la prochaine tranche" },
  { id: "PAY-005", learnerName: "Eric Mawuli", subjectKey: "artificialIntelligence", cohortNameKey: "ai", level: "Intro", totalFees: 50000, amountPaid: 25000, amountDue: 25000, methodKey: "mobileMoney", statusKey: "overdue", paymentDate: "2026-05-01", dueDate: "2026-05-20", receipt: "RC-0005", note: "Relance nécessaire" }
];

export const INITIAL_REPORTS = [
  { id: "RPT-001", titleKey: "reportTitleAcademicInitial", typeKey: "globalReport", periodKey: "weekly", audienceKey: "academicTeam", owner: "Mme Brigitte", statusKey: "ready", date: "2026-05-20", metrics: { learners: 18, attendance: 91, success: 82, revenue: 25000 }, summaryKey: "reportSummaryAcademicInitial", summary: "" },
  { id: "RPT-002", titleKey: "reportTitleFinanceInitial", typeKey: "financeReport", periodKey: "weekly", audienceKey: "secretariat", owner: "Secrétariat", statusKey: "generated", date: "2026-05-21", metrics: { learners: 5, attendance: 0, success: 0, revenue: 150000 }, summaryKey: "reportSummaryFinanceInitial", summary: "" },
  { id: "RPT-003", titleKey: "reportTitleAttendanceInitial", typeKey: "attendanceReport", periodKey: "monthly", audienceKey: "director", owner: "Admin", statusKey: "ready", date: "2026-05-22", metrics: { learners: 5, attendance: 92, success: 0, revenue: 0 }, summaryKey: "reportSummaryAttendanceInitial", summary: "" },
  { id: "RPT-004", titleKey: "reportTitleQualityInitial", typeKey: "qualityReport", periodKey: "monthly", audienceKey: "academicTeam", owner: "Responsable pédagogique", statusKey: "inReview", date: "2026-05-23", metrics: { learners: 4, attendance: 0, success: 75, revenue: 0 }, summaryKey: "reportSummaryQualityInitial", summary: "" },
  { id: "RPT-005", titleKey: "reportTitleAiInitial", typeKey: "aiReport", periodKey: "monthly", audienceKey: "director", owner: "AI Coach", statusKey: "generated", date: "2026-05-24", metrics: { learners: 8, attendance: 94, success: 74, revenue: 25000 }, summaryKey: "reportSummaryAiInitial", summary: "" }
];

export const INITIAL_AI_REQUESTS = [
  { id: "AI-001", title: "Dialogue A1 présentation", subjectKey: "german", level: "A1", typeKey: "dialogue", requester: "M. Joseph", statusKey: "validated", date: "2026-05-24", prompt: "Créer un dialogue A1 en allemand sur la présentation personnelle avec traduction française et 10 questions.", output: "Dialogue court, vocabulaire clé, traduction et questions de compréhension.", validationKey: "validatedByTeacher" },
  { id: "AI-002", title: "Quiz B1 entretien", subjectKey: "german", level: "B1", typeKey: "quiz", requester: "Mme Brigitte", statusKey: "waitingValidation", date: "2026-05-24", prompt: "Créer un quiz B1 sur une simulation d’entretien avec correction et barème.", output: "12 questions, barème sur 100 points, corrigé proposé.", validationKey: "generatedByAi" },
  { id: "AI-003", title: "Plan séance fichiers", subjectKey: "computer", level: "Intro", typeKey: "lessonPlan", requester: "Admin IT", statusKey: "validated", date: "2026-05-23", prompt: "Créer un plan de séance pour apprendre à organiser des fichiers sur ordinateur.", output: "Objectifs, déroulé, exercice pratique, mini-évaluation.", validationKey: "validatedByTeacher" },
  { id: "AI-004", title: "Correction prompt", subjectKey: "artificialIntelligence", level: "Intro", typeKey: "correction", requester: "AI Coach", statusKey: "waitingValidation", date: "2026-05-22", prompt: "Corriger un prompt d’étudiant et proposer une version plus claire.", output: "Analyse de clarté, précision, contraintes et version améliorée.", validationKey: "generatedByAi" }
];

export const DEFAULT_PUBLIC_CONFIG = {
  title: "Préinscription en ligne",
  subtitle: "Apprenez l’allemand, préparez votre projet d’étude, de travail ou de voyage, puis finalisez votre inscription après vérification du paiement mobile.",
  germanOffer: "Allemand A1 · A2 · B1 · B2",
  otherOffer: "Anglais · Informatique · IA",
  duration: "3 mois par niveau · 3 séances de 3h par semaine",
  tmoney: "+228 90 00 00 00",
  moov: "+228 99 00 00 00",
  whatsapp: "+228 90 00 00 00",
  partnerOne: "KelensiTech",
  partnerTwo: "Deutsch Institut"
};

export const INITIAL_SETTINGS = [
  { id: "SET-001", nameKey: "brand", categoryKey: "centerIdentity", value: "LMS Center", owner: "Admin", statusKey: "enabled", description: "Nom public utilisé dans l’interface, les reçus, rapports et documents." },
  { id: "SET-002", nameKey: "languageConfig", categoryKey: "languageConfig", value: "FR / EN", owner: "Admin", statusKey: "enabled", description: "Tous les textes doivent passer par le dictionnaire i18n français et anglais." },
  { id: "SET-003", nameKey: "academicConfig", categoryKey: "academicConfig", value: "3 mois · 3 séances · 3h", owner: "Responsable pédagogique", statusKey: "configurable", description: "Structure par défaut pour les niveaux A1, A2, B1 et autres formations." },
  { id: "SET-004", nameKey: "financeConfig", categoryKey: "financeConfig", value: "Tranches configurables", owner: "Secrétariat", statusKey: "configurable", description: "Gestion des frais, paiements partiels, soldes, reçus et relances." },
  { id: "SET-005", nameKey: "aiConfig", categoryKey: "aiConfig", value: "Validation enseignant obligatoire", owner: "AI Coach", statusKey: "enabled", description: "Les contenus IA restent des brouillons jusqu’à validation humaine." },
  { id: "SET-006", nameKey: "roleConfig", categoryKey: "roleConfig", value: "Admin · Enseignant · Secrétariat · Étudiant", owner: "Admin", statusKey: "locked", description: "Base de séparation des responsabilités avant l’ajout des modules sécurité." }
];

export const INITIAL_MAINTENANCE = [
  { id: "MNT-001", moduleId: "backup", title: "Backup quotidien base LMS", typeKey: "backup", targetKey: "settings", owner: "Admin", statusKey: "completed", severityKey: "medium", startedAt: "2026-05-25 02:00", completedAt: "2026-05-25 02:04", retention: "30 days", integrityKey: "approved", approvalKey: "approved", description: "Sauvegarde quotidienne des données pédagogiques, financières et administratives." },
  { id: "MNT-002", moduleId: "restore", title: "Test restauration mensuel", typeKey: "restore", targetKey: "payments", owner: "Admin", statusKey: "scheduled", severityKey: "critical", startedAt: "2026-05-30 09:00", completedAt: "Pending", retention: "N/A", integrityKey: "pendingApproval", approvalKey: "pendingApproval", description: "Simulation de restauration pour vérifier la disponibilité des données critiques." },
  { id: "MNT-003", moduleId: "reset", title: "Réinitialisation mot de passe enseignant", typeKey: "reset", targetKey: "teachers", owner: "Admin", statusKey: "completed", severityKey: "medium", startedAt: "2026-05-24 16:20", completedAt: "2026-05-24 16:22", retention: "Audit only", integrityKey: "approved", approvalKey: "approved", description: "Réinitialisation contrôlée après vérification de l’identité du demandeur." },
  { id: "MNT-004", moduleId: "audit", title: "Connexion administrateur", typeKey: "loginActivity", targetKey: "dashboard", owner: "System", statusKey: "completed", severityKey: "low", startedAt: "2026-05-25 08:10", completedAt: "2026-05-25 08:10", retention: "365 days", integrityKey: "approved", approvalKey: "approved", description: "Trace de connexion avec horodatage, rôle utilisateur et module accédé." },
  { id: "MNT-005", moduleId: "audit", title: "Modification paiement", typeKey: "dataChange", targetKey: "payments", owner: "Secrétariat", statusKey: "completed", severityKey: "critical", startedAt: "2026-05-25 10:35", completedAt: "2026-05-25 10:36", retention: "365 days", integrityKey: "approved", approvalKey: "approved", description: "Trace de modification d’un montant payé, avec conservation de l’ancienne et nouvelle valeur." }
];

