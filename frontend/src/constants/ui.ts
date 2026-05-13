export const ICONS = {
  dashboard: "▦",
  users: "👥",
  cohorts: "🏫",
  teachers: "👨‍🏫",
  courses: "🎓",
  attendance: "✅",
  exams: "📝",
  library: "📚",
  payments: "💳",
  reports: "📈",
  ai: "✨",
  settings: "⚙️",
  globe: "🌐",
  bell: "🔔",
  search: "🔎",
  plus: "+",
  german: "DE",
  english: "GB",
  it: "💻",
  backup: "💾",
  restore: "↥",
  reset: "🗑️",
  audit: "🛡️",
  subjects: "📘",
  menu: "☰",
  close: "✕"
};

export const PROGRAMS = [
  { id: "german", code: "DE", nameKey: "german", detail: "A1 · A2 · B1 · B2", count: 4, gradient: "from-cyan-500 to-sky-700" },
  { id: "english", code: "GB", nameKey: "english", detail: "Beginner · Intermediate", count: 2, gradient: "from-violet-600 to-purple-800" },
  { id: "computer", code: "IT", nameKey: "computer", detail: "Intro · Office · AI", count: 3, gradient: "from-orange-500 to-red-600" },
  { id: "artificialIntelligence", code: "AI", nameKey: "artificialIntelligence", detail: "Prompting · Agents · Automation", count: 3, gradient: "from-emerald-400 to-cyan-700" }
];

export const TEACHER_ROLE_OPTIONS = ["teacherRoleSuperAdmin", "teacherRoleAdmin", "teacherRoleSecretariat", "teacherRoleTrainer", "teacherRolePedagogyLead", "teacherRoleAssistant", "teacherRoleAccountant", "teacherRoleITSupport", "teacherRoleAiAssistant", "teacherRoleGuest", "teacherRoleReadOnly"];

export const STAFF_DEPARTMENT_OPTIONS = ["departmentAdministration", "departmentSecretariat", "departmentPedagogy", "departmentFinance", "departmentIT", "departmentAI", "departmentDirection"];

export const TEACHER_ACCOUNT_STATUS_OPTIONS = ["activeAccount", "suspendedAccount", "disabledAccount"];

export const FIELD_OPTIONS = {
  subjectKey: ["german", "english", "computer", "artificialIntelligence"],
  level: ["A1", "A2", "B1", "B2", "Beginner", "Intermediate", "Intro"],
  subjectStatusKey: ["subjectStatusActive", "subjectStatusDraft", "subjectStatusArchived", "subjectStatusDisabled"],
  subjectCategoryKey: ["academicCategoryLanguage", "academicCategoryTech", "academicCategoryProfessional", "academicCategoryOther"],
  statusKey: ["active", "planned", "full", "published", "draft", "review", "present", "absent", "late", "excused", "passed", "failed", "needsSupport", "corrected", "notCorrected", "received", "partial", "overdue", "waived", "ready", "generated", "inReview", "validated", "waitingValidation", "rejected", "enabled", "disabled", "configurable", "locked", "completed", "scheduled", "pendingApproval", "failedStatus"],
  typeKey: ["grammar", "vocabulary", "oralPractice", "quiz", "workshop", "mockExam", "assignment", "pdf", "audio", "video", "document", "promptBank", "template", "academicReport", "financeReport", "attendanceReport", "qualityReport", "aiReport", "dialogue", "lessonPlan", "correction", "interviewSimulation", "contentDraft", "vocabularySheet", "correctedExercise", "homeworkDraft", "librarySupport", "backup", "restore", "reset", "loginActivity", "dataChange", "securityEvent"],
  decisionKey: ["passed", "failed", "needsSupport"],
  correctionKey: ["corrected", "notCorrected"],
  methodKey: ["cash", "mobileMoney", "bankTransfer"],
  visibilityKey: ["studentsOnly", "teachersOnly", "internalOnly", "publicResource"],
  categoryKey: ["centerIdentity", "academicConfig", "financeConfig", "languageConfig", "aiConfig", "roleConfig"],
  periodKey: ["weekly", "monthly", "quarterly"],
  audienceKey: ["director", "secretariat", "academicTeam"],
  severityKey: ["low", "medium", "critical"],
  approvalKey: ["approved", "pendingApproval"],
  integrityKey: ["approved", "pendingApproval"],
  targetKey: ["dashboard", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "payments", "reports", "ai", "settings"],
  cohortNameKey: ["a1Morning", "b1Evening", "itIntro", "ai", "demoCohortName"],
  nameKey: ["brand", "languageConfig", "academicConfig", "financeConfig", "aiConfig", "roleConfig", "demoSettingName"],
  owner: ["Admin", "Secrétariat", "M. Joseph", "Mme Brigitte", "Admin IT", "AI Coach", "System"],
  requester: ["Admin", "M. Joseph", "Mme Brigitte", "Admin IT", "AI Coach"],
  validationKey: ["generatedByAi", "validatedByTeacher"],
  publishTargetKey: ["keepAsDraft", "publishToLibrary", "publishToCourse", "publishToAssessment"]
};

export const ROLE_NAV = {
  superAdmin: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "payments", "reports", "ai", "settings", "backup", "restore", "reset", "audit"],
  admin: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "payments", "reports", "ai", "settings", "audit"],
  secretariat: ["dashboard", "learners", "cohorts", "attendance", "payments", "reports", "library"],
  teacher: ["dashboard", "learners", "cohorts", "courses", "attendance", "exams", "library", "ai"],
  student: ["dashboard", "courses", "attendance", "exams", "library", "payments"],
  pedagogy: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "reports", "ai", "audit"]
};

export const ROLE_ACTIONS = {
  superAdmin: { edit: "all", delete: "all" },
  admin: { edit: "all", delete: "all" },
  secretariat: { edit: ["learners", "cohorts", "attendance", "payments", "library"], delete: ["learners", "cohorts", "attendance", "library"] },
  teacher: { edit: ["courses", "attendance", "exams", "library", "ai"], delete: ["courses", "attendance", "exams", "library", "ai"] },
  pedagogy: { edit: ["subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "reports", "ai"], delete: ["courses", "attendance", "exams", "library", "reports", "ai"] },
  student: { edit: [], delete: [] }
};

export const COURSE_OBJECTIVE_TEMPLATES = {
  fr: [
    { id: "greetingA1", labelKey: "objectiveGreetingA1", subjectKey: "german", level: "A1", text: "À la fin de la séance, l’apprenant doit pouvoir saluer, se présenter simplement, épeler son nom et comprendre des formules de base en allemand." },
    { id: "grammarA1", labelKey: "objectiveGrammarA1", subjectKey: "german", level: "A1", text: "À la fin de la séance, l’apprenant doit pouvoir utiliser les pronoms personnels, conjuguer sein et haben au présent, et produire de courtes phrases simples." },
    { id: "dailyRoutineA2", labelKey: "objectiveDailyRoutineA2", subjectKey: "german", level: "A2", text: "À la fin de la séance, l’apprenant doit pouvoir décrire sa routine quotidienne en utilisant des verbes fréquents et des marqueurs de temps." },
    { id: "interviewB1", labelKey: "objectiveInterviewB1", subjectKey: "german", level: "B1", text: "À la fin de la séance, l’apprenant doit pouvoir simuler un entretien simple lié au travail, avec des réponses structurées et un vocabulaire approprié." },
    { id: "fileBasics", labelKey: "objectiveFileBasics", subjectKey: "computer", level: "Intro", text: "À la fin de la séance, l’apprenant doit pouvoir créer, renommer, classer et retrouver des fichiers dans un dossier organisé." },
    { id: "promptBasics", labelKey: "objectivePromptBasics", subjectKey: "artificialIntelligence", level: "Intro", text: "À la fin de la séance, l’apprenant doit pouvoir rédiger une instruction claire à une IA, préciser le contexte, le résultat attendu et les contraintes." }
  ],
  en: [
    { id: "greetingA1", labelKey: "objectiveGreetingA1", subjectKey: "german", level: "A1", text: "By the end of the session, the learner should be able to greet someone, introduce themselves simply, spell their name, and understand basic German expressions." },
    { id: "grammarA1", labelKey: "objectiveGrammarA1", subjectKey: "german", level: "A1", text: "By the end of the session, the learner should be able to use personal pronouns, conjugate sein and haben in the present tense, and produce short simple sentences." },
    { id: "dailyRoutineA2", labelKey: "objectiveDailyRoutineA2", subjectKey: "german", level: "A2", text: "By the end of the session, the learner should be able to describe a daily routine using common verbs and time markers." },
    { id: "interviewB1", labelKey: "objectiveInterviewB1", subjectKey: "german", level: "B1", text: "By the end of the session, the learner should be able to simulate a simple work-related interview with structured answers and appropriate vocabulary." },
    { id: "fileBasics", labelKey: "objectiveFileBasics", subjectKey: "computer", level: "Intro", text: "By the end of the session, the learner should be able to create, rename, organize, and retrieve files inside a structured folder." },
    { id: "promptBasics", labelKey: "objectivePromptBasics", subjectKey: "artificialIntelligence", level: "Intro", text: "By the end of the session, the learner should be able to write a clear AI instruction with context, expected output, and constraints." }
  ]
};
