
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { ICONS, PROGRAMS, TEACHER_ROLE_OPTIONS, STAFF_DEPARTMENT_OPTIONS, TEACHER_ACCOUNT_STATUS_OPTIONS } from "./constants/ui";
import { DICT } from "./constants/translations";
import { api } from "./utils/api";
import { 
  INITIAL_SUBJECTS, INITIAL_COHORTS, INITIAL_LEARNERS, INITIAL_TEACHERS, 
  INITIAL_COURSES, INITIAL_ATTENDANCE, INITIAL_ASSESSMENTS, INITIAL_RESOURCES, 
  INITIAL_PAYMENTS, INITIAL_REPORTS, INITIAL_AI_REQUESTS, DEFAULT_PUBLIC_CONFIG, 
  INITIAL_SETTINGS, INITIAL_MAINTENANCE 
} from "./constants/demoData";

const DEMO_USERS = [
  { id: "USR-001", name: "Anani Kelensi", email: "admin@lms.local", roleKey: "superAdminRole", role: "superAdmin", avatar: "AK", color: "from-cyan-400 to-violet-600", password: "password123" },
  { id: "USR-002", name: "Secrétariat", email: "secretariat@lms.local", roleKey: "secretariatRole", role: "secretariat", avatar: "SC", color: "from-emerald-400 to-cyan-600", password: "password123" },
  { id: "USR-003", name: "M. Joseph", email: "teacher@lms.local", roleKey: "teacherRole", role: "teacher", avatar: "MJ", color: "from-orange-400 to-red-600", password: "password123" },
  { id: "USR-004", name: "Koffi Mensah", email: "student@lms.local", roleKey: "studentRole", role: "student", avatar: "KM", color: "from-violet-500 to-fuchsia-600", password: "password123" },
  { id: "USR-005", name: "Mme Brigitte", email: "pedagogy@lms.local", roleKey: "pedagogyLead", role: "pedagogy", avatar: "MB", color: "from-sky-400 to-blue-700", password: "password123" }
];

const ROLE_NAV = {
  superAdmin: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "payments", "reports", "ai", "settings", "backup", "restore", "reset", "audit"],
  admin: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "payments", "reports", "ai", "settings", "audit"],
  secretariat: ["dashboard", "learners", "cohorts", "attendance", "payments", "reports", "library"],
  teacher: ["dashboard", "learners", "cohorts", "courses", "attendance", "exams", "library", "ai"],
  student: ["dashboard", "courses", "attendance", "exams", "library", "payments"],
  pedagogy: ["dashboard", "subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "reports", "ai", "audit"]
};

const ROLE_ACTIONS = {
  superAdmin: { edit: "all", delete: "all" },
  admin: { edit: "all", delete: "all" },
  secretariat: { edit: ["learners", "cohorts", "attendance", "payments", "library"], delete: ["learners", "cohorts", "attendance", "library"] },
  teacher: { edit: ["courses", "attendance", "exams", "library", "ai"], delete: ["courses", "attendance", "exams", "library", "ai"] },
  pedagogy: { edit: ["subjects", "learners", "cohorts", "teachers", "courses", "attendance", "exams", "library", "reports", "ai"], delete: ["courses", "attendance", "exams", "library", "reports", "ai"] },
  student: { edit: [], delete: [] }
};

const FIELD_OPTIONS = {
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
  teacher: INITIAL_TEACHERS.map((teacher) => teacher.name),
  owner: ["Admin", "Secrétariat", "M. Joseph", "Mme Brigitte", "Admin IT", "AI Coach", "System"],
  requester: ["Admin", "M. Joseph", "Mme Brigitte", "Admin IT", "AI Coach"],
  validationKey: ["generatedByAi", "validatedByTeacher"],
  publishTargetKey: ["keepAsDraft", "publishToLibrary", "publishToCourse", "publishToAssessment"]
};

const COURSE_OBJECTIVE_TEMPLATES = {
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

const TEACHER_PERMISSION_OPTIONS = [
  { key: "createCourse", labelKey: "permissionCreateCourse", group: "pedagogy" },
  { key: "editCourse", labelKey: "permissionEditCourse", group: "pedagogy" },
  { key: "takeAttendance", labelKey: "permissionTakeAttendance", group: "pedagogy" },
  { key: "editAttendance", labelKey: "permissionEditAttendance", group: "pedagogy" },
  { key: "createAssessment", labelKey: "permissionCreateAssessment", group: "pedagogy" },
  { key: "correctAssessment", labelKey: "permissionCorrectAssessment", group: "pedagogy" },
  { key: "publishResource", labelKey: "permissionPublishResource", group: "library" },
  { key: "useAi", labelKey: "permissionUseAi", group: "ai" },
  { key: "validateAi", labelKey: "permissionValidateAi", group: "ai" },
  { key: "viewReports", labelKey: "permissionViewReports", group: "reports" },
  { key: "managePayments", labelKey: "permissionManagePayments", group: "finance" },
  { key: "manageLearners", labelKey: "permissionManageLearners", group: "admin" },
  { key: "manageEnrollments", labelKey: "permissionManageEnrollments", group: "admin" },
  { key: "manageSettings", labelKey: "permissionManageSettings", group: "security" },
  { key: "manageUsers", labelKey: "permissionManageUsers", group: "security" },
  { key: "viewFinanceReports", labelKey: "permissionViewFinanceReports", group: "finance" },
  { key: "viewAudit", labelKey: "permissionViewAudit", group: "security" },
  { key: "criticalBackup", labelKey: "permissionCriticalBackup", group: "critical", superAdminOnly: true },
  { key: "criticalRestore", labelKey: "permissionCriticalRestore", group: "critical", superAdminOnly: true },
  { key: "criticalReset", labelKey: "permissionCriticalReset", group: "critical", superAdminOnly: true }
];

const CRITICAL_PERMISSION_KEYS = ["criticalBackup", "criticalRestore", "criticalReset"];

const ROLE_PERMISSION_TEMPLATES = {
  teacherRoleSuperAdmin: TEACHER_PERMISSION_OPTIONS.map((permission) => permission.key),
  teacherRoleAdmin: ["manageLearners", "manageEnrollments", "managePayments", "viewReports", "viewFinanceReports", "manageSettings", "manageUsers", "viewAudit"],
  teacherRoleSecretariat: ["manageLearners", "manageEnrollments", "takeAttendance", "managePayments", "viewReports"],
  teacherRoleTrainer: ["createCourse", "editCourse", "takeAttendance", "createAssessment", "correctAssessment", "publishResource", "useAi"],
  teacherRolePedagogyLead: ["createCourse", "editCourse", "takeAttendance", "editAttendance", "createAssessment", "correctAssessment", "publishResource", "useAi", "validateAi", "viewReports"],
  teacherRoleAssistant: ["takeAttendance", "createAssessment", "publishResource", "useAi"],
  teacherRoleAccountant: ["managePayments", "viewFinanceReports", "viewReports"],
  teacherRoleITSupport: ["manageSettings", "viewAudit", "useAi"],
  teacherRoleAiAssistant: ["publishResource", "useAi", "validateAi"],
  teacherRoleGuest: ["takeAttendance", "createAssessment"],
  teacherRoleReadOnly: ["viewReports"]
};

function getStaffPermissionsForRole(roleKey) {
  const permissions = ROLE_PERMISSION_TEMPLATES[roleKey] || [];
  if (roleKey === "teacherRoleSuperAdmin") return permissions;
  return permissions.filter((permission) => !CRITICAL_PERMISSION_KEYS.includes(permission));
}

const REPORT_GENERATED_SUMMARY_KEYS = {
  globalReport: "reportSummaryQualityGenerated",
  academicReport: "reportSummaryAcademicGenerated",
  financeReport: "reportSummaryFinanceGenerated",
  attendanceReport: "reportSummaryAttendanceGenerated",
  qualityReport: "reportSummaryQualityGenerated",
  aiReport: "reportSummaryAiGenerated"
};

function getReportTitle(report, t) {
  if (!report) return "";
  return report.titleKey ? t(report.titleKey) : report.title;
}

function getReportSummary(report, t) {
  if (!report) return "";
  return report.summaryKey ? t(report.summaryKey) : report.summary;
}

const FIELD_LABELS = {
  name: "name",
  title: "resourceTitle",
  nameKey: "cohortName",
  subjectKey: "subject",
  level: "level",
  phone: "phone",
  statusKey: "status",
  progress: "progress",
  attendance: "attendance",
  paid: "paid",
  balance: "balance",
  students: "students",
  capacity: "capacityLabel",
  teacher: "teacher",
  schedule: "schedule",
  qualification: "qualification",
  workload: "workload",
  availability: "availability",
  assigned: "assignedCohorts",
  typeKey: "resourceType",
  decisionKey: "assessmentDecision",
  correctionKey: "correctionStatus",
  methodKey: "paymentMethod",
  visibilityKey: "resourceVisibility",
  categoryKey: "settingCategory",
  periodKey: "reportPeriod",
  audienceKey: "reportAudience",
  owner: "resourceOwner",
  requester: "resourceOwner",
  courseTitle: "courseTitle",
  learnerName: "learners",
  note: "attendanceNote",
  description: "resourceDescription",
  date: "attendanceDate",
  score: "assessmentScore",
  maxScore: "maxScore",
  amountPaid: "amountPaid",
  amountDue: "amountDue",
  totalFees: "totalFees",
  paymentDate: "paymentDate",
  dueDate: "dueDate",
  receipt: "receiptNumber",
  value: "settingValue"
};

var isStudentUser = (user) => {
  return user?.role === "student";
};

var getCurrentLearnerForUser = (user, learners = []) => {
  if (!isStudentUser(user)) return null;
  return learners.find((learner) => learner.name === user?.name || learner.id === user?.linkedLearnerId) || null;
};

var filterStudentCourses = (courses = [], learner) => {
  if (!learner) return [];
  return courses.filter((course) => {
    const isPublished = course.statusKey === "published";
    const matchesSubject = !learner.subjectKey || course.subjectKey === learner.subjectKey;
    const matchesLevel = !learner.level || course.level === learner.level;
    const matchesCohort = !learner.cohortNameKey || course.cohortNameKey === learner.cohortNameKey;
    return isPublished && matchesSubject && matchesLevel && matchesCohort;
  });
};

var filterStudentResources = (resources = [], learner) => {
  if (!learner) return [];
  return resources.filter((resource) => {
    const isVisible = ["studentsOnly", "publicResource"].includes(resource.visibilityKey);
    const matchesSubject = !learner.subjectKey || resource.subjectKey === learner.subjectKey;
    const matchesLevel = !learner.level || resource.level === learner.level;
    return isVisible && matchesSubject && matchesLevel;
  });
};

function canRolePerform(user, action, tab) {
  if (!user?.role || !tab) return false;
  if (["backup", "restore", "reset"].includes(tab) && user.role !== "superAdmin") return false;
  if (tab === "payments" && !canUserViewFinance(user)) return false;
  if (action === "delete" && tab === "subjects") return false;
  const permission = ROLE_ACTIONS[user.role]?.[action];
  if (permission === "all") return true;
  return Array.isArray(permission) && permission.includes(tab);
}

function canUserViewFinance(user) {
  return ["superAdmin", "admin", "secretariat"].includes(user?.role) || ["managePayments", "viewFinanceReports"].some((permission) => user?.permissions?.includes(permission));
}

function canUserViewPaymentModule(user) {
  return ["superAdmin", "admin", "secretariat", "student"].includes(user?.role) || user?.permissions?.includes("managePayments");
}

function canUserViewFinanceReports(user) {
  return ["superAdmin", "admin", "secretariat"].includes(user?.role) || user?.permissions?.includes("viewFinanceReports");
}

function canUserManagePreEnrollments(user) {
  return ["superAdmin", "admin", "secretariat"].includes(user?.role) || user?.permissions?.includes("manageEnrollments");
}

function isSafeExternalUrl(url) {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
}

function secureOpenExternalUrl(url) {
  if (!isSafeExternalUrl(url)) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clampNumber(value, min = 0, max = 100) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return min;
  return Math.min(max, Math.max(min, numericValue));
}

function safePercent(part, total) {
  const numericTotal = Number(total);
  if (!Number.isFinite(numericTotal) || numericTotal <= 0) return 0;
  return Math.round((Number(part) / numericTotal) * 100);
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} F`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvBlobUrl(rows = []) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))
  ];
  const csv = csvLines.join(String.fromCharCode(10));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  return URL.createObjectURL(blob);
}

function downloadFromBlobUrl(url, filename) {
  if (!url) return false;
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

function downloadCsv(filename, rows = []) {
  const url = csvBlobUrl(rows);
  if (!url) return;
  downloadFromBlobUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function buildPrintableHtml(title, bodyHtml) {
  return `<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111827}.document{max-width:820px;margin:0 auto;border:1px solid #e5e7eb;border-radius:18px;padding:28px}.header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #111827;padding-bottom:18px;margin-bottom:24px}.brand{font-size:22px;font-weight:700}.muted{color:#6b7280;font-size:12px}.title{font-size:26px;font-weight:700;margin:0 0 8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{border:1px solid #e5e7eb;border-radius:14px;padding:14px}.label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em}.value{font-size:15px;font-weight:700;margin-top:6px}.summary{line-height:1.65;white-space:pre-wrap}.footer{border-top:1px solid #e5e7eb;margin-top:24px;padding-top:14px;font-size:12px;color:#6b7280}@media print{button{display:none}body{margin:0}.document{border:0}}</style></head><body>${bodyHtml}</body></html>`;
}

function printDocument(title, bodyHtml) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);
  const frameDocument = iframe.contentWindow?.document;
  if (!frameDocument) return;
  frameDocument.open();
  frameDocument.write(buildPrintableHtml(title, bodyHtml));
  frameDocument.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1200);
  }, 250);
}


function downloadHtmlDocument(filename, title, bodyHtml) {
  const blob = new Blob([buildPrintableHtml(title, bodyHtml)], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function createPdfDocument(title, sections = []) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 52;

  function addPageIfNeeded(height = 24) {
    if (y + height > pageHeight - 48) {
      pdf.addPage();
      y = 52;
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(String(title || "Document"), margin, y);
  y += 28;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("LMS Center", margin, y);
  y += 22;
  pdf.setDrawColor(210);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 24;

  sections.forEach((section) => {
    addPageIfNeeded(40);
    if (section.heading) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(String(section.heading), margin, y);
      y += 18;
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    (section.rows || []).forEach((row) => {
      const label = String(row.label ?? "");
      const value = String(row.value ?? "");
      const text = label ? `${label}: ${value}` : value;
      const lines = pdf.splitTextToSize(text, maxWidth);
      addPageIfNeeded(lines.length * 14 + 6);
      pdf.text(lines, margin, y);
      y += lines.length * 14 + 8;
    });
    y += 8;
  });

  return pdf;
}

function pdfBlobUrl(title, sections = []) {
  const pdf = createPdfDocument(title, sections);
  const blob = pdf.output("blob");
  return URL.createObjectURL(blob);
}

function downloadPdfDocument(filename, title, sections = []) {
  const url = pdfBlobUrl(title, sections);
  downloadFromBlobUrl(url, filename || "document.pdf");
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function PrintableDocumentPanel({ t, preview, onClose }) {
  const [feedback, setFeedback] = useState("");
  const [links, setLinks] = useState({ html: "", pdf: "", csv: "" });

  useEffect(() => {
    if (!preview) return;
    const nextLinks = {
      html: URL.createObjectURL(new Blob([buildPrintableHtml(preview.title, preview.html)], { type: "text/html;charset=utf-8;" })),
      pdf: preview.pdfSections ? pdfBlobUrl(preview.title, preview.pdfSections) : "",
      csv: preview.csvRows?.length ? csvBlobUrl(preview.csvRows) : ""
    };
    setLinks(nextLinks);
    return () => {
      Object.values(nextLinks).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [preview]);

  if (!preview) return null;

  function handlePrint() {
    setFeedback(t("printReady"));
    printDocument(preview.title, preview.html);
  }

  function handlePdfClick() {
    setFeedback(t("pdfReady"));
  }

  function handleCsvClick() {
    setFeedback(t("csvReady"));
  }

  return (
    <div className="mb-5 rounded-3xl border border-orange-400/30 bg-orange-500/10 p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-white">{t("printPreview")}</h3>
          <p className="mt-1 text-xs leading-5 text-orange-100/80">{t("documentReady")}</p>
          {feedback ? <p className="mt-2 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">{feedback}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handlePrint} className="rounded-2xl bg-violet-500/20 px-4 py-3 text-xs font-semibold text-violet-100 transition hover:-translate-y-1 hover:bg-violet-500/30">{t("print")}</button>
          <a href={links.html || undefined} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-1 hover:bg-white/20">{t("openPrintable")}</a>
          {links.pdf ? <a href={links.pdf} download={preview.pdfFilename || "document.pdf"} onClick={handlePdfClick} className="rounded-2xl bg-orange-500/20 px-4 py-3 text-xs font-semibold text-orange-100 transition hover:-translate-y-1 hover:bg-orange-500/30">{t("exportPdf")}</a> : null}
          {links.csv ? <a href={links.csv} download={preview.csvFilename || "document.csv"} onClick={handleCsvClick} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("exportCsv")}</a> : null}
          <button type="button" onClick={onClose} className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-1 hover:bg-white/20">{t("closePreview")}</button>
        </div>
      </div>
      <iframe title={preview.title || "preview"} className="h-[520px] w-full rounded-2xl bg-white shadow-2xl" srcDoc={buildPrintableHtml(preview.title, preview.html)} />
    </div>
  );
}

function displayValue(value, t) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return t(value) !== value ? t(value) : String(value);
}

function fieldLabel(key, t) {
  const labelKey = FIELD_LABELS[key];
  if (labelKey) return t(labelKey) !== labelKey ? t(labelKey) : labelKey;
  return key.replace(/([A-Z])/g, " $1").replace(/Key$/, "").trim();
}

function summarizeRecord(record, t) {
  if (!record) return "";
  const allowedKeys = ["id", "name", "title", "nameKey", "subjectKey", "level", "learnerName", "teacher", "statusKey", "typeKey", "date", "amountPaid", "amountDue"];
  return allowedKeys
    .filter((key) => record[key] !== undefined)
    .map((key) => `${fieldLabel(key, t)}: ${displayValue(record[key], t)}`)
    .join(" · ");
}

function useT(language) {
  return useCallback((key) => DICT[language]?.[key] || DICT.fr[key] || key, [language]);
}

function ThemeStyleBridge({ theme }) {
  if (theme !== "light") return null;
  return (
    <style>{`
      .theme-light {
        background: #f4f7fb !important;
        color: #111827 !important;
      }

      .theme-light .bg-\[\#070b1d\] {
        background: #f4f7fb !important;
      }

      .theme-light .fixed.rounded-full {
        opacity: .08 !important;
      }

      .theme-light aside {
        background: rgba(255, 255, 255, .98) !important;
        border-color: rgba(15, 23, 42, .10) !important;
        box-shadow: 0 18px 42px rgba(15, 23, 42, .12) !important;
      }

      .theme-light aside button:not(.bg-violet-600) {
        background: #ffffff !important;
        color: #1f2937 !important;
        border: 1px solid rgba(15, 23, 42, .10) !important;
        box-shadow: 0 4px 14px rgba(15, 23, 42, .04) !important;
      }

      .theme-light aside button:not(.bg-violet-600):hover {
        background: #f3f0ff !important;
        color: #5b21b6 !important;
        border-color: rgba(124, 58, 237, .24) !important;
      }

      .theme-light aside .bg-violet-600 {
        background: linear-gradient(135deg, #7c3aed, #9333ea) !important;
        color: #ffffff !important;
        box-shadow: 0 14px 34px rgba(124, 58, 237, .30) !important;
      }

      .theme-light aside .bg-violet-600 * {
        color: #ffffff !important;
      }

      .theme-light main > header,
      .theme-light .lg\:min-w-\[680px\] > div,
      .theme-light .lg\:min-w-\[680px\] > select,
      .theme-light .lg\:min-w-\[680px\] > button {
        box-shadow: 0 10px 26px rgba(15, 23, 42, .10) !important;
      }

      .theme-light .bg-\[\#0b1025\],
      .theme-light .bg-\[\#0b1025\]\/60,
      .theme-light .bg-\[\#0b1025\]\/70,
      .theme-light .bg-\[\#0b1025\]\/75,
      .theme-light .bg-\[\#0b1025\]\/80,
      .theme-light .bg-\[\#111735\]\/80 {
        background: #ffffff !important;
      }

      .theme-light .bg-white\/5,
      .theme-light .bg-white\/10 {
        background: rgba(255, 255, 255, .92) !important;
      }

      .theme-light .rounded-3xl,
      .theme-light .rounded-2xl {
        border-color: rgba(15, 23, 42, .12) !important;
        backdrop-filter: blur(14px);
      }

      .theme-light .shadow-black\/20,
      .theme-light .shadow-black\/30,
      .theme-light .shadow-2xl,
      .theme-light .shadow-xl {
        --tw-shadow-color: rgba(15, 23, 42, .10) !important;
      }

      .theme-light .text-white,
      .theme-light .text-slate-200,
      .theme-light .text-slate-300,
      .theme-light .text-cyan-100,
      .theme-light .text-violet-100,
      .theme-light .text-orange-100,
      .theme-light .text-emerald-100,
      .theme-light .text-rose-100 {
        color: #111827 !important;
      }

      .theme-light .text-slate-400,
      .theme-light .text-slate-500,
      .theme-light .text-cyan-100\/80,
      .theme-light .text-violet-100\/80,
      .theme-light .text-orange-100\/80,
      .theme-light .text-emerald-100\/80,
      .theme-light .text-rose-100\/80 {
        color: #4b5563 !important;
      }

      .theme-light input,
      .theme-light select,
      .theme-light textarea {
        color: #111827 !important;
        background: #ffffff !important;
        border-color: rgba(15, 23, 42, .18) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 0 4px 12px rgba(15,23,42,.04) !important;
      }

      .theme-light input::placeholder,
      .theme-light textarea::placeholder {
        color: #475569 !important;
      }

      .theme-light input:disabled,
      .theme-light select:disabled,
      .theme-light textarea:disabled {
        color: #64748b !important;
        background: #eef2f7 !important;
      }

      .theme-light table {
        background: #ffffff !important;
      }

      .theme-light table thead {
        background: #e8eef7 !important;
      }

      .theme-light table thead th {
        color: #334155 !important;
        font-weight: 800 !important;
      }

      .theme-light table tbody tr {
        border-color: rgba(15, 23, 42, .10) !important;
      }

      .theme-light table tbody td,
      .theme-light table tbody p,
      .theme-light table tbody .text-slate-300 {
        color: #1f2937 !important;
      }

      .theme-light table tbody .text-slate-500,
      .theme-light table tbody .text-slate-400 {
        color: #475569 !important;
      }

      .theme-light tbody tr:hover {
        background: #f8fafc !important;
      }

      .theme-light .bg-cyan-400\/10,
      .theme-light .bg-cyan-500\/10,
      .theme-light .bg-violet-500\/10,
      .theme-light .bg-orange-500\/10,
      .theme-light .bg-emerald-500\/10,
      .theme-light .bg-rose-500\/10 {
        background: rgba(255, 255, 255, .94) !important;
      }

      .theme-light .bg-cyan-400\/15,
      .theme-light .bg-cyan-500\/15,
      .theme-light .bg-violet-400\/15,
      .theme-light .bg-violet-500\/15,
      .theme-light .bg-orange-400\/15,
      .theme-light .bg-orange-500\/15,
      .theme-light .bg-emerald-400\/15,
      .theme-light .bg-emerald-500\/15,
      .theme-light .bg-rose-400\/15,
      .theme-light .bg-rose-500\/15,
      .theme-light .bg-violet-500\/20,
      .theme-light .bg-cyan-500\/20,
      .theme-light .bg-orange-500\/20,
      .theme-light .bg-emerald-500\/20,
      .theme-light .bg-rose-500\/20 {
        background: #ffffff !important;
      }

      .theme-light .text-cyan-200,
      .theme-light .text-cyan-300,
      .theme-light .text-cyan-100 {
        color: #0284c7 !important;
      }

      .theme-light .text-violet-200,
      .theme-light .text-violet-300,
      .theme-light .text-violet-100 {
        color: #7c3aed !important;
      }

      .theme-light .text-orange-200,
      .theme-light .text-orange-300,
      .theme-light .text-orange-100 {
        color: #ea580c !important;
      }

      .theme-light .text-emerald-200,
      .theme-light .text-emerald-300,
      .theme-light .text-emerald-100 {
        color: #059669 !important;
      }

      .theme-light .text-rose-200,
      .theme-light .text-rose-300,
      .theme-light .text-rose-100 {
        color: #e11d48 !important;
      }

      .theme-light .bg-violet-600,
      .theme-light .hover\:bg-violet-500:hover,
      .theme-light .bg-gradient-to-r,
      .theme-light .bg-gradient-to-br,
      .theme-light .bg-gradient-to-t {
        color: #ffffff !important;
      }

      .theme-light .bg-violet-600 *,
      .theme-light .bg-gradient-to-r *,
      .theme-light .bg-gradient-to-br *,
      .theme-light .bg-gradient-to-t *,
      .theme-light [class*="from-cyan-"] *,
      .theme-light [class*="from-violet-"] *,
      .theme-light [class*="from-orange-"] *,
      .theme-light [class*="from-fuchsia-"] * {
        color: #ffffff !important;
      }

      .theme-light .border-white\/10 {
        border-color: rgba(15, 23, 42, .12) !important;
      }

      .theme-light .bg-white.p-3,
      .theme-light .bg-white {
        background: #ffffff !important;
      }

      .theme-light .overflow-x-auto.rounded-3xl {
        background: #ffffff !important;
        box-shadow: 0 16px 40px rgba(15, 23, 42, .08) !important;
      }

      .theme-light .line-clamp-2,
      .theme-light .leading-6,
      .theme-light .leading-5 {
        color: #334155 !important;
      }

      .theme-light main [class*="bg-[#0b1025]"],
      .theme-light main [class*="bg-[#111735]"],
      .theme-light main [class*="bg-white/5"],
      .theme-light main [class*="bg-white/10"] {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .theme-light main [class*="bg-cyan-500/10"],
      .theme-light main [class*="bg-cyan-400/10"],
      .theme-light main [class*="bg-violet-500/10"],
      .theme-light main [class*="bg-orange-500/10"],
      .theme-light main [class*="bg-emerald-500/10"],
      .theme-light main [class*="bg-rose-500/10"] {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .theme-light main .rounded-3xl,
      .theme-light main .rounded-2xl {
        background-color: #ffffff !important;
        border-color: rgba(15, 23, 42, .12) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, .08) !important;
      }

      .theme-light main .rounded-3xl[class*="bg-gradient"],
      .theme-light main .rounded-2xl[class*="bg-gradient"],
      .theme-light main [class*="bg-gradient-to-"] {
        background-color: initial !important;
      }

      .theme-light main [class*="from-cyan-"],
      .theme-light main [class*="from-violet-"],
      .theme-light main [class*="from-orange-"],
      .theme-light main [class*="from-fuchsia-"],
      .theme-light main [class*="from-emerald-"] {
        background-color: initial !important;
      }

      .theme-light main h1,
      .theme-light main h2,
      .theme-light main h3,
      .theme-light main p,
      .theme-light main span,
      .theme-light main label,
      .theme-light main td,
      .theme-light main th,
      .theme-light main button {
        color: #111827;
      }

      .theme-light main .text-slate-400,
      .theme-light main .text-slate-500,
      .theme-light main .placeholder\:text-slate-500::placeholder {
        color: #475569 !important;
      }

      .theme-light main .text-white {
        color: #111827 !important;
      }

      .theme-light main .bg-violet-600,
      .theme-light main .bg-violet-600 *,
      .theme-light main button.bg-violet-600,
      .theme-light main button.bg-violet-600 *,
      .theme-light main [class*="bg-gradient-to-"] *,
      .theme-light main [class*="from-cyan-"] *,
      .theme-light main [class*="from-violet-"] *,
      .theme-light main [class*="from-orange-"] *,
      .theme-light main [class*="from-fuchsia-"] *,
      .theme-light main [class*="from-emerald-"] * {
        color: #ffffff !important;
      }

      .theme-light main input,
      .theme-light main select,
      .theme-light main textarea {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #111827 !important;
        border: 1px solid rgba(15, 23, 42, .18) !important;
      }

      .theme-light main header input,
      .theme-light main header select {
        background: #ffffff !important;
        color: #111827 !important;
      }

      .theme-light main header > div:last-child > div,
      .theme-light main header > div:last-child > select,
      .theme-light main header > div:last-child > button {
        background: #ffffff !important;
        border-color: rgba(15, 23, 42, .12) !important;
        color: #111827 !important;
      }

      .theme-light main header [class*="bg-[#0b1025]"] {
        background: #ffffff !important;
      }

      .theme-light main table,
      .theme-light main table tbody,
      .theme-light main table tr,
      .theme-light main table td {
        background: #ffffff !important;
      }

      .theme-light main table thead,
      .theme-light main table thead tr,
      .theme-light main table thead th {
        background: #edf2f8 !important;
        color: #334155 !important;
      }

      .theme-light main .border-white\/10 {
        border-color: rgba(15, 23, 42, .12) !important;
      }

      .theme-light main iframe,
      .theme-light main .bg-white {
        background: #ffffff !important;
      }
    `}</style>
  );
}

function MetricCard({ title, value, hint, gradient, icon }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-2xl transition duration-300 hover:-translate-y-2 hover:scale-[1.02]", gradient)}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl transition group-hover:bg-white/35" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/75">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-3 text-xs text-white/70">{hint}</p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-2 text-lg shadow-lg backdrop-blur-xl">{icon}</div>
      </div>
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-[#0b1025]/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl transition duration-300 hover:border-violet-400/30 hover:bg-[#111735]/80", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle = "", action = null }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? <button className="text-xs font-medium text-violet-300 transition hover:text-cyan-300">{action}</button> : null}
    </div>
  );
}

function ProgressRing({ value = 72, label = "LMS" }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = (clampNumber(value) / 100) * circumference;

  return (
    <div className="relative flex h-[130px] w-[130px] items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,.12)" strokeWidth="12" fill="none" />
        <circle cx="60" cy="60" r={radius} stroke="url(#ringGradient)" strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray={`${dash} ${circumference - dash}`} />
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}%</p>
      </div>
    </div>
  );
}

function MiniLineChart() {
  const linePoints = "0,75 45,58 90,82 135,50 180,38 225,64 270,26 315,42";

  return (
    <svg viewBox="0 0 315 100" className="h-28 w-full overflow-visible">
      <polyline points={linePoints} fill="none" stroke="rgba(34,211,238,.22)" strokeWidth="10" strokeLinecap="round" />
      <polyline points={linePoints} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ModulePlaceholder({ t, icon, title }) {
  return (
    <GlassCard className="min-h-[520px]">
      <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
        <div className="mb-5 rounded-3xl bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-400 p-[2px] shadow-2xl shadow-violet-700/30">
          <div className="rounded-3xl bg-[#0b1025] p-7 text-5xl">{icon}</div>
        </div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{t("moduleInProgressSub")}</p>
      </div>
    </GlassCard>
  );
}

function Avatar({ user, className = "h-11 w-11" }) {
  return (
    <div className={cn("flex items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-lg shadow-violet-600/20", user?.color || "from-cyan-400 to-violet-600", className)}>
      {user?.avatar || "U"}
    </div>
  );
}

function DemoQr({ label }) {
  const cells = Array.from({ length: 49 }, (_, index) => [0, 1, 2, 6, 7, 8, 14, 18, 20, 23, 25, 28, 30, 31, 35, 38, 40, 42, 43, 44, 46, 48].includes(index));
  return (
    <div className="rounded-3xl border border-white/10 bg-white p-3 shadow-xl shadow-cyan-500/10">
      <div className="grid h-28 w-28 grid-cols-7 gap-1">
        {cells.map((active, index) => (
          <span key={index} className={cn("rounded-sm", active ? "bg-[#0b1025]" : "bg-slate-200")} />
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] font-semibold text-slate-700">{label}</p>
    </div>
  );
}

function LoginScreen({ t, language, setLanguage, theme, setTheme, onLogin, preEnrollments, setPreEnrollments, publicConfig }) {
  const safePublicConfig = publicConfig || DEFAULT_PUBLIC_CONFIG;
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState(DEMO_USERS[0].password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedUser = DEMO_USERS.find((user) => user.email === email) || DEMO_USERS[0];
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    desiredProgram: "german",
    preferredLevel: "A1",
    preferredSchedule: "Matin",
    paymentReference: "",
    paymentPhone: ""
  });
  const [submitted, setSubmitted] = useState(false);

  function updateForm(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem("auth_token", response.access_token);
      // Ensure name is present, fallback to email if not
      const userToLogin = {
        ...response.user,
        name: response.user.name || response.user.email.split('@')[0]
      };
      onLogin(userToLogin);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function submitPreEnrollment() {
    const nextEntry = {
      id: `PRE-${String((preEnrollments?.length || 0) + 1).padStart(3, "0")}`,
      ...form,
      statusKey: "pendingPaymentReview",
      createdAt: new Date().toLocaleDateString()
    };
    setPreEnrollments((previous) => [nextEntry, ...previous]);
    setSubmitted(true);
    setForm({ fullName: "", phone: "", desiredProgram: "german", preferredLevel: "A1", preferredSchedule: "Matin", paymentReference: "", paymentPhone: "" });
  }

  return (
    <div className={cn("min-h-screen bg-[#070b1d] p-6 text-white", theme === "light" ? "theme-light" : "theme-navy")}>
      <ThemeStyleBridge theme={theme} />
      <div className="pointer-events-none fixed -left-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 h-[38rem] w-[38rem] rounded-full bg-violet-600/25 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-5 lg:grid-cols-[1fr_380px]">
          <GlassCard className="flex flex-col justify-center">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-400 p-[2px]"><div className="rounded-2xl bg-[#0b1025] p-3 text-2xl">{ICONS.courses}</div></div>
                <div><h1 className="text-2xl font-semibold">{t("brand")}</h1><p className="text-sm text-slate-400">{t("tagline")}</p></div>
              </div>
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right sm:w-auto sm:min-w-[260px]">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{safePublicConfig.partnerOne}</p>
                <div className="my-3 h-px bg-white/10" />
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{safePublicConfig.partnerTwo}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">{t("courseOffer")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{safePublicConfig.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{safePublicConfig.subtitle}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4"><p className="font-semibold text-white">{safePublicConfig.germanOffer}</p><p className="mt-2 text-xs text-slate-300">{safePublicConfig.duration}</p></div>
                <div className="rounded-2xl bg-white/10 p-4"><p className="font-semibold text-white">{safePublicConfig.otherOffer}</p><p className="mt-2 text-xs text-slate-300">{t("mobilePayment")}</p></div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0b1025]/70 p-4"><p className="text-xs text-slate-400">{t("tmoneyNumber")}</p><p className="mt-1 text-lg font-semibold text-cyan-200">{safePublicConfig.tmoney}</p></div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1025]/70 p-4"><p className="text-xs text-slate-400">{t("moovNumber")}</p><p className="mt-1 text-lg font-semibold text-violet-200">{safePublicConfig.moov}</p></div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-white">{t("enrollmentForm")}</h3><span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("pendingPaymentReview")}</span></div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} placeholder={t("fullName")} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                <input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder={t("phone")} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                <select value={form.desiredProgram} onChange={(event) => updateForm("desiredProgram", event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
                  <option value="german">{t("german")}</option>
                  <option value="english">{t("english")}</option>
                  <option value="computer">{t("computer")}</option>
                  <option value="artificialIntelligence">{t("artificialIntelligence")}</option>
                </select>
                <select value={form.preferredLevel} onChange={(event) => updateForm("preferredLevel", event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
                  {FIELD_OPTIONS.level.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
                <input value={form.paymentReference} onChange={(event) => updateForm("paymentReference", event.target.value)} placeholder={t("paymentReference")} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                <input value={form.paymentPhone} onChange={(event) => updateForm("paymentPhone", event.target.value)} placeholder={t("paymentPhone")} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              </div>
              <button onClick={submitPreEnrollment} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("submitPreEnrollment")}</button>
              {submitted ? <p className="mt-3 rounded-2xl bg-emerald-400/15 px-4 py-3 text-xs text-emerald-200">{t("preEnrollmentSaved")}</p> : null}
              {preEnrollments?.length ? <p className="mt-3 text-xs text-slate-400">{t("pendingEnrollments")}: {preEnrollments.length}</p> : null}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="mb-6 flex items-center gap-3"><Avatar user={selectedUser} className="h-14 w-14" /><div><p className="font-semibold">{selectedUser.name}</p><p className="text-sm text-slate-400">{t(selectedUser.roleKey)}</p></div></div>
            
            {error && <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-200 border border-rose-500/20">{error}</div>}

            <label className="text-xs text-slate-400">{t("email")}</label>
            <div className="relative">
              <select value={email} onChange={(event) => {
                const user = DEMO_USERS.find(u => u.email === event.target.value);
                setEmail(event.target.value);
                if (user) setPassword(user.password);
              }} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none appearance-none">
                {DEMO_USERS.map((user) => <option key={user.id} value={user.email}>{user.email}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
            </div>
            
            <label className="mt-5 block text-xs text-slate-400">{t("password")}</label>
            <input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-colors" 
            />

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="space-y-1">
                <label className="block text-xs text-slate-400">{t("language")}</label>
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-slate-400">{t("theme")}</label>
                <select value={theme} onChange={(event) => setTheme(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
                  <option value="navy">{t("navyMode")}</option>
                  <option value="light">{t("lightMode")}</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {t("signIn")}
            </button>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 lg:mt-28 xl:mt-32">
              <div className="flex items-start gap-4">
                <DemoQr label={t("qrDemo")} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{t("qrAccessTitle")}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{t("qrAccessSub")}</p>
                  <div className="mt-4 grid gap-2">
                    <button className="rounded-2xl bg-cyan-400/15 px-3 py-2 text-left text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/25">{t("scanToEnroll")}</button>
                    <button className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-left text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/25">{t("whatsappContact")}</button>
                    <button className="rounded-2xl bg-orange-400/15 px-3 py-2 text-left text-xs font-semibold text-orange-100 transition hover:bg-orange-400/25">{t("paymentCheck")}</button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function UserMenu({ t, user, onLogout }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1025]/80 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-xl">
      <Avatar user={user} />
      <div className="hidden lg:block"><p className="text-sm font-semibold text-white">{user.name}</p><p className="text-xs text-slate-400">{t(user.roleKey)}</p></div>
      <button onClick={onLogout} className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200 transition hover:bg-rose-500/30 hover:text-white">{t("signOut")}</button>
    </div>
  );
}

function ManagementDock({ t, activeLabel, selectedTitle, selectedDetails, selectedRecord, onSave, onDelete, canEdit, canDelete }) {
  return (
    <div className="mb-5 rounded-3xl border border-white/10 bg-[#0b1025]/75 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{activeLabel}</p>
          <p className="mt-1 text-sm font-semibold text-white">{selectedTitle || t("noLearnerSelected")}</p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{selectedDetails || t("moduleInProgressSub")}</p>
          {!canEdit ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
        </div>
        <div className="w-full lg:min-w-[360px]">
          <RecordActions t={t} title={selectedTitle || activeLabel} record={selectedRecord} details={selectedDetails || t("moduleInProgressSub")} onSave={onSave} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </div>
    </div>
  );
}

function RecordActions({ t, title, record, details, onSave, onDelete, canEdit = false, canDelete = false }) {
  const [mode, setMode] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState({});

  const editableEntries = Object.entries(record || {}).filter(([key, value]) => {
    if (["id", "gradient", "color", "avatar", "role", "roleKey", "moduleId"].includes(key)) return false;
    return ["string", "number", "boolean"].includes(typeof value);
  });

  function openEdit() {
    if (!canEdit) return;
    setDraft(Object.fromEntries(editableEntries));
    setMode("edit");
  }

  function saveEdit() {
    const cleaned = Object.fromEntries(Object.entries(draft).map(([key, value]) => {
      const original = record?.[key];
      if (typeof original === "number") return [key, Number(value) || 0];
      if (typeof original === "boolean") return [key, value === true || value === "true"];
      return [key, value];
    }));
    onSave?.(cleaned);
    setMode(null);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setMode("preview")} className="rounded-2xl bg-cyan-500/15 px-3 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/25">{t("preview")}</button>
        <button disabled={!canEdit} onClick={openEdit} className={cn("rounded-2xl px-3 py-3 text-xs font-semibold transition", canEdit ? "bg-violet-500/20 text-violet-100 hover:-translate-y-1 hover:bg-violet-500/30" : "bg-white/5 text-slate-500")}>{t("edit")}</button>
        <button disabled={!canDelete} onClick={() => setConfirming(true)} className={cn("rounded-2xl px-3 py-3 text-xs font-semibold transition", canDelete ? "bg-rose-500/20 text-rose-100 hover:-translate-y-1 hover:bg-rose-500/30" : "bg-white/5 text-slate-500")}>{t("delete")}</button>
      </div>
      {mode ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-white">{mode === "preview" ? t("previewMode") : t("editMode")}</p><button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-white">{t("cancel")}</button></div>
          <p className="text-sm font-semibold text-cyan-100">{title}</p>
          {mode === "preview" ? <p className="mt-2 text-xs leading-6 text-slate-400">{details}</p> : null}
          {mode === "edit" ? (
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {editableEntries.map(([key, value]) => (
                <label key={key} className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3">
                  <span className="mb-2 block text-xs text-slate-400">{fieldLabel(key, t)}</span>
                  {FIELD_OPTIONS[key] ? (
                    <select value={draft[key] ?? ""} onChange={(event) => setDraft((previous) => ({ ...previous, [key]: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">
                      {FIELD_OPTIONS[key].map((option) => <option key={option} value={option}>{displayValue(option, t)}</option>)}
                    </select>
                  ) : typeof value === "boolean" ? (
                    <select value={String(draft[key])} onChange={(event) => setDraft((previous) => ({ ...previous, [key]: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    String(value).length > 80 || ["description", "summary", "prompt", "output", "objective", "note"].includes(key) ? (
                    <textarea value={draft[key] ?? ""} onChange={(event) => setDraft((previous) => ({ ...previous, [key]: event.target.value }))} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" />
                  ) : (
                    <input type={typeof value === "number" ? "number" : "text"} value={draft[key] ?? ""} onChange={(event) => setDraft((previous) => ({ ...previous, [key]: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" />
                  )
                  )}
                </label>
              ))}
              <button onClick={saveEdit} className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-violet-500">{t("saveDemo")}</button>
            </div>
          ) : null}
        </div>
      ) : null}
      {confirming ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-100">{t("confirmDelete")}</p>
          <p className="mt-2 text-xs leading-6 text-rose-100/80">{t("deleteQuestion")}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white">{t("cancel")}</button>
            <button onClick={() => { onDelete?.(); setConfirming(false); }} className="flex-1 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{t("delete")}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LearnerModule({ t, learners, setLearners, selectedLearnerId, setSelectedLearnerId, preEnrollments = [], setPreEnrollments, currentUser }) {
  const showFinance = canUserViewFinance(currentUser);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  function exportLearnersCsv() {
    downloadCsv("learners.csv", learners.map((learner) => ({
      id: learner.id,
      name: learner.name,
      phone: learner.phone,
      subject: t(learner.subjectKey),
      level: learner.level,
      status: t(learner.statusKey),
      progress: learner.progress,
      attendance: learner.attendance,
      paid: learner.paid,
      balance: learner.balance
    })));
  }
  const emptyLearnerDraft = {
    name: "",
    phone: "",
    subjectKey: "german",
    level: "A1",
    cohortNameKey: "a1Morning",
    statusKey: "active",
    progress: 0,
    attendance: 100,
    paid: 0,
    balance: 50000,
    note: ""
  };
  const [learnerDraft, setLearnerDraft] = useState(emptyLearnerDraft);
  const [editingLearnerId, setEditingLearnerId] = useState(null);

  function updateLearnerDraft(key, value) {
    setLearnerDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetLearnerForm() {
    setLearnerDraft(emptyLearnerDraft);
    setEditingLearnerId(null);
  }

  function editSelectedLearner() {
    const learner = learners.find((item) => item.id === selectedLearnerId);
    if (!learner) return;
    setEditingLearnerId(learner.id);
    setLearnerDraft({
      name: learner.name || "",
      phone: learner.phone || "",
      subjectKey: learner.subjectKey || "german",
      level: learner.level || "A1",
      cohortNameKey: learner.cohortNameKey || "a1Morning",
      statusKey: learner.statusKey || "active",
      progress: learner.progress || 0,
      attendance: learner.attendance || 100,
      paid: learner.paid || 0,
      balance: learner.balance || 0,
      note: learner.note || ""
    });
  }

  function saveLearnerForm() {
    if (!canRolePerform(currentUser, "edit", "learners")) return;
    const safeName = learnerDraft.name.trim() || `${t("demoLearnerName")} ${learners.length + 1}`;
    const normalizedLearner = {
      ...learnerDraft,
      name: safeName,
      progress: clampNumber(learnerDraft.progress),
      attendance: clampNumber(learnerDraft.attendance),
      paid: Number(learnerDraft.paid) || 0,
      balance: Number(learnerDraft.balance) || 0
    };

    if (editingLearnerId) {
      setLearners((previous) => previous.map((item) => item.id === editingLearnerId ? { ...item, ...normalizedLearner } : item));
      setSelectedLearnerId(editingLearnerId);
    } else {
      const newLearner = {
        id: `STU-${String(learners.length + 1).padStart(3, "0")}`,
        ...normalizedLearner
      };
      setLearners((previous) => [newLearner, ...previous]);
      setSelectedLearnerId(newLearner.id);
    }
    resetLearnerForm();
  }

  const rows = useMemo(() => learners.filter((learner) => {
    const haystack = `${learner.name} ${learner.phone} ${t(learner.subjectKey)} ${learner.level}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || learner.subjectKey === filter;
    return matchesSearch && matchesFilter;
  }), [learners, query, filter, t]);

  const selectedLearner = learners.find((learner) => learner.id === selectedLearnerId) || rows[0] || null;

  function addDemoLearner() {
    if (!canRolePerform(currentUser, "edit", "learners")) return;
    const nextIndex = learners.length + 1;
    const newLearner = {
      id: `STU-${String(nextIndex).padStart(3, "0")}`,
      name: `${t("demoLearnerName")} ${nextIndex}`,
      phone: "+228 90 00 00 99",
      subjectKey: filter !== "all" ? filter : "german",
      level: "A1",
      statusKey: "active",
      progress: 0,
      attendance: 100,
      paid: 25000,
      balance: 25000
    };

    setLearners((previousLearners) => [newLearner, ...previousLearners]);
    setSelectedLearnerId(newLearner.id);
  }

  function convertPreEnrollment(entry) {
    if (!canUserManagePreEnrollments(currentUser)) return;
    const nextIndex = learners.length + 1;
    const newLearner = {
      id: `STU-${String(nextIndex).padStart(3, "0")}`,
      name: entry.fullName || `${t("demoLearnerName")} ${nextIndex}`,
      phone: entry.phone || entry.paymentPhone || "+228",
      subjectKey: entry.desiredProgram || "german",
      level: entry.preferredLevel || "A1",
      statusKey: "active",
      progress: 0,
      attendance: 100,
      paid: entry.paymentReference ? 25000 : 0,
      balance: entry.paymentReference ? 25000 : 50000,
      note: t("createdFromPreEnrollment")
    };
    setLearners((previousLearners) => [newLearner, ...previousLearners]);
    setPreEnrollments?.((previous) => previous.filter((item) => item.id !== entry.id));
    setSelectedLearnerId(newLearner.id);
  }

  function rejectPreEnrollment(entryId) {
    if (!canUserManagePreEnrollments(currentUser)) return;
    setPreEnrollments?.((previous) => previous.filter((item) => item.id !== entryId));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("learnerModuleTitle")} subtitle={t("learnerModuleSub")} action={t("seeAll")} />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("exportTools")}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{t("exportToolsSub")}</p>
            </div>
            <button onClick={exportLearnersCsv} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("exportLearnersCsv")}</button>
          </div>
        </div>
        {canUserManagePreEnrollments(currentUser) ? (
          <div className="mb-5 rounded-3xl border border-orange-400/20 bg-orange-400/10 p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-white">{t("pendingEnrollments")}</h3>
                <p className="mt-1 text-xs leading-5 text-orange-100/80">{t("pendingEnrollmentSub")}</p>
              </div>
              <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-100">{preEnrollments.length}</span>
            </div>
            {currentUser?.role !== "student" && preEnrollments.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {preEnrollments.slice(0, 4).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-[#0b1025]/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{entry.fullName || t("demoLearnerName")}</p>
                        <p className="mt-1 text-xs text-slate-400">{entry.phone} · {t(entry.desiredProgram)} · {entry.preferredLevel}</p>
                        <p className="mt-1 text-xs text-cyan-200">{t("paymentReference")}: {entry.paymentReference || "—"}</p>
                      </div>
                      <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-100">{t(entry.statusKey)}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => convertPreEnrollment(entry)} className="rounded-2xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30">{t("convertToLearner")}</button>
                      <button onClick={() => rejectPreEnrollment(entry.id)} className="rounded-2xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30">{t("rejectEnrollment")}</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-300">{t("noPendingEnrollments")}</p>
            )}
          </div>
        ) : null}
        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("learnerBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-cyan-100/80">{t("learnerBusinessFormSub")}</p>
              {!canRolePerform(currentUser, "edit", "learners") ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100">{editingLearnerId ? t("updateMode") : t("createMode")}</span>
              <button disabled={!canRolePerform(currentUser, "edit", "learners")} onClick={resetLearnerForm} className={cn("rounded-full px-3 py-1 text-xs transition", canRolePerform(currentUser, "edit", "learners") ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button>
              <button disabled={!canRolePerform(currentUser, "edit", "learners")} onClick={editSelectedLearner} className={cn("rounded-full px-3 py-1 text-xs transition", canRolePerform(currentUser, "edit", "learners") ? "bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedLearner")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("academicAssignment")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("name")}</span><input disabled={!canRolePerform(currentUser, "edit", "learners")} value={learnerDraft.name} onChange={(event) => updateLearnerDraft("name", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("phone")}</span><input value={learnerDraft.phone} onChange={(event) => updateLearnerDraft("phone", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={learnerDraft.subjectKey} onChange={(event) => updateLearnerDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select value={learnerDraft.level} onChange={(event) => updateLearnerDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={learnerDraft.cohortNameKey} onChange={(event) => updateLearnerDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("status")}</span><select value={learnerDraft.statusKey} onChange={(event) => updateLearnerDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="active">{t("active")}</option><option value="planned">{t("planned")}</option><option value="needsSupport">{t("needsSupport")}</option></select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{showFinance ? t("contactAndFinance") : t("learnerProgress")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("progress")}</span><input type="number" value={learnerDraft.progress} onChange={(event) => updateLearnerDraft("progress", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("attendance")}</span><input type="number" value={learnerDraft.attendance} onChange={(event) => updateLearnerDraft("attendance", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                {showFinance ? <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("paid")}</span><input type="number" value={learnerDraft.paid} onChange={(event) => updateLearnerDraft("paid", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label> : null}
                {showFinance ? <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("balance")}</span><input type="number" value={learnerDraft.balance} onChange={(event) => updateLearnerDraft("balance", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label> : null}
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("adminNote")}</span><textarea value={learnerDraft.note} onChange={(event) => updateLearnerDraft("note", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canRolePerform(currentUser, "edit", "learners")} onClick={saveLearnerForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canRolePerform(currentUser, "edit", "learners") ? "bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveLearner")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchLearners")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
          </select>
          <button disabled={!canRolePerform(currentUser, "edit", "learners")} onClick={addDemoLearner} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canRolePerform(currentUser, "edit", "learners") ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoLearner")}</button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">{t("name")}</th>
                <th className="p-4">{t("subject")}</th>
                <th className="p-4">{t("level")}</th>
                <th className="p-4">{t("attendance")}</th>
                <th className="p-4">{t("progress")}</th>
                {showFinance ? <th className="p-4">{t("payment")}</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((learner) => (
                <tr key={learner.id} onClick={() => setSelectedLearnerId(learner.id)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/10">
                  <td className="p-4"><p className="font-semibold text-white">{learner.name}</p><p className="text-xs text-slate-500">{learner.phone}</p></td>
                  <td className="p-4 text-slate-300">{t(learner.subjectKey)}</td>
                  <td className="p-4"><span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">{learner.level}</span></td>
                  <td className="p-4 text-slate-300">{learner.attendance}%</td>
                  <td className="p-4"><div className="h-2 w-28 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${clampNumber(learner.progress)}%` }} /></div><p className="mt-1 text-xs text-slate-500">{learner.progress}%</p></td>
                  {showFinance ? <td className="p-4"><p className="text-cyan-300">{formatMoney(learner.paid)}</p><p className="text-xs text-orange-300">{formatMoney(learner.balance)}</p></td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("learnerProfile")} subtitle={selectedLearner ? t("selectedLearner") : t("noLearnerSelected")} />
        {selectedLearner ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedLearner.name}</p>
              <p className="mt-1 text-sm text-slate-400">{selectedLearner.phone}</p>
              <div className="mt-4 flex gap-2"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{t(selectedLearner.subjectKey)}</span><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{selectedLearner.level}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("learnerProgress")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedLearner.progress}%</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("learnerAttendance")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedLearner.attendance}%</p></div>
              {showFinance ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("paid")}</p><p className="mt-2 text-xl font-semibold text-cyan-300">{formatMoney(selectedLearner.paid)}</p></div> : null}
              {showFinance ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("balance")}</p><p className="mt-2 text-xl font-semibold text-orange-300">{formatMoney(selectedLearner.balance)}</p></div> : null}
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function SubjectModule({ t, language = "fr", subjects, setSubjects, selectedSubjectId, setSelectedSubjectId, currentUser, learners = [], cohorts = [], courses = [], resources = [], payments = [] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageSubjects = ["superAdmin", "admin", "pedagogy"].includes(currentUser?.role) || currentUser?.permissions?.includes("manageSettings");
  const canHardDelete = currentUser?.role === "superAdmin";
  const emptySubjectDraft = { nameFr: "", nameEn: "", code: "", subjectKey: "", categoryKey: "academicCategoryLanguage", levelsText: "A1, A2", duration: "3 mois", weeklySessions: 3, sessionDuration: "3h", baseFee: 50000, owner: "Responsable pédagogique", statusKey: "subjectStatusDraft", color: "cyan", description: "" };
  const [subjectDraft, setSubjectDraft] = useState(emptySubjectDraft);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [feedback, setFeedback] = useState("");

  function subjectLabel(subject) {
    if (!subject) return "";
    return language === "en" ? subject.nameEn || subject.nameFr : subject.nameFr || subject.nameEn;
  }

  function slugifySubject(value) {
    return String(value || "subject").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `subject_${subjects.length + 1}`;
  }

  function updateSubjectDraft(key, value) {
    setSubjectDraft((previous) => ({ ...previous, [key]: value }));
    setFeedback("");
  }

  function resetSubjectForm() {
    setSubjectDraft(emptySubjectDraft);
    setEditingSubjectId(null);
    setFeedback("");
  }

  function editSelectedSubject() {
    const subject = subjects.find((item) => item.id === selectedSubjectId);
    if (!subject) return;
    setEditingSubjectId(subject.id);
    setSubjectDraft({ nameFr: subject.nameFr || "", nameEn: subject.nameEn || "", code: subject.code || "", subjectKey: subject.subjectKey || "", categoryKey: subject.categoryKey || "academicCategoryLanguage", levelsText: (subject.levels || []).join(", "), duration: subject.duration || "3 mois", weeklySessions: subject.weeklySessions || 3, sessionDuration: subject.sessionDuration || "3h", baseFee: subject.baseFee || 0, owner: subject.owner || "Admin", statusKey: subject.statusKey || "subjectStatusDraft", color: subject.color || "cyan", description: subject.description || "" });
  }

  function getSubjectUsage(subjectKey) {
    return { learners: learners.filter((item) => item.subjectKey === subjectKey).length, cohorts: cohorts.filter((item) => item.subjectKey === subjectKey).length, courses: courses.filter((item) => item.subjectKey === subjectKey).length, resources: resources.filter((item) => item.subjectKey === subjectKey).length, payments: payments.filter((item) => item.subjectKey === subjectKey).length };
  }

  function totalUsage(subjectKey) {
    const usage = getSubjectUsage(subjectKey);
    return Object.values(usage).reduce((sum, value) => sum + value, 0);
  }

  function saveSubjectForm() {
    if (!canManageSubjects) return;
    const nameFr = subjectDraft.nameFr.trim() || `${t("subjects")} ${subjects.length + 1}`;
    const nameEn = subjectDraft.nameEn.trim() || nameFr;
    const subjectKey = subjectDraft.subjectKey.trim() || slugifySubject(nameEn);
    const duplicate = subjects.some((item) => item.id !== editingSubjectId && (item.subjectKey === subjectKey || item.code.toLowerCase() === subjectDraft.code.trim().toLowerCase()));
    if (duplicate) {
      setFeedback(`${t("subjectCode")} / key déjà utilisé.`);
      return;
    }
    const normalizedSubject = { subjectKey, nameFr, nameEn, code: subjectDraft.code.trim().toUpperCase() || subjectKey.slice(0, 3).toUpperCase(), categoryKey: subjectDraft.categoryKey, levels: subjectDraft.levelsText.split(",").map((item) => item.trim()).filter(Boolean), duration: subjectDraft.duration.trim() || "3 mois", weeklySessions: Math.max(1, Number(subjectDraft.weeklySessions) || 1), sessionDuration: subjectDraft.sessionDuration.trim() || "3h", baseFee: Math.max(0, Number(subjectDraft.baseFee) || 0), owner: subjectDraft.owner.trim() || "Admin", statusKey: subjectDraft.statusKey, color: subjectDraft.color || "cyan", description: subjectDraft.description.trim() || t("toDefine") };
    if (editingSubjectId) {
      setSubjects((previous) => previous.map((item) => item.id === editingSubjectId ? { ...item, ...normalizedSubject } : item));
      setSelectedSubjectId(editingSubjectId);
    } else {
      const newSubject = { id: `SUB-${String(subjects.length + 1).padStart(3, "0")}`, ...normalizedSubject };
      setSubjects((previous) => [newSubject, ...previous]);
      setSelectedSubjectId(newSubject.id);
    }
    resetSubjectForm();
  }

  function archiveSubject(subject) {
    if (!canManageSubjects || !subject) return;
    setSubjects((previous) => previous.map((item) => item.id === subject.id ? { ...item, statusKey: "subjectStatusArchived" } : item));
    setFeedback(t("archiveSubject"));
  }

  function activateSubject(subject) {
    if (!canManageSubjects || !subject) return;
    setSubjects((previous) => previous.map((item) => item.id === subject.id ? { ...item, statusKey: "subjectStatusActive" } : item));
    setFeedback(t("activateSubject"));
  }

  function deleteSubject(subject) {
    if (!canHardDelete || !subject) return;
    if (totalUsage(subject.subjectKey) > 0) {
      setFeedback(t("subjectUsedWarning"));
      return;
    }
    setSubjects((previous) => previous.filter((item) => item.id !== subject.id));
    setSelectedSubjectId(subjects.find((item) => item.id !== subject.id)?.id || "");
  }

  const rows = useMemo(() => subjects.filter((subject) => {
    const haystack = `${subject.nameFr} ${subject.nameEn} ${subject.code} ${subject.subjectKey} ${t(subject.categoryKey)} ${(subject.levels || []).join(" ")} ${t(subject.statusKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || subject.categoryKey === filter || subject.statusKey === filter;
    return matchesSearch && matchesFilter;
  }), [subjects, query, filter, t]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) || rows[0] || null;
  const selectedUsage = getSubjectUsage(selectedSubject?.subjectKey);
  const activeSubjects = subjects.filter((subject) => subject.statusKey === "subjectStatusActive").length;

  function addDemoSubject() {
    if (!canManageSubjects) return;
    const nextIndex = subjects.length + 1;
    const newSubject = { id: `SUB-${String(nextIndex).padStart(3, "0")}`, subjectKey: `custom_subject_${nextIndex}`, nameFr: `Nouvelle matière ${nextIndex}`, nameEn: `New subject ${nextIndex}`, code: `SUB${nextIndex}`, categoryKey: "academicCategoryOther", levels: ["Intro"], duration: "3 mois", weeklySessions: 2, sessionDuration: "2h", baseFee: 30000, owner: "Admin", statusKey: "subjectStatusDraft", color: "cyan", description: t("toDefine") };
    setSubjects((previous) => [newSubject, ...previous]);
    setSelectedSubjectId(newSubject.id);
  }

  const statusTone = (key) => key === "subjectStatusActive" ? "bg-emerald-400/15 text-emerald-200" : key === "subjectStatusArchived" ? "bg-orange-400/15 text-orange-200" : key === "subjectStatusDisabled" ? "bg-rose-400/15 text-rose-200" : "bg-cyan-400/15 text-cyan-200";
  const colorGradient = (color) => color === "emerald" ? "from-emerald-400 to-cyan-700" : color === "orange" ? "from-orange-400 to-red-500" : color === "violet" ? "from-violet-500 to-purple-700" : "from-cyan-400 to-sky-600";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("subjectModuleTitle")} subtitle={t("subjectModuleSub")} action={`${t("active")}: ${activeSubjects}/${subjects.length}`} />
        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
          <p className="font-semibold">{t("protectedSubjectRule")}</p>
          <p className="mt-1 text-cyan-100/80">{t("subjectBusinessFormSub")}</p>
          {feedback ? <p className="mt-3 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-100">{feedback}</p> : null}
        </div>
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h3 className="font-semibold text-white">{t("subjectBusinessForm")}</h3><p className="mt-1 text-xs leading-5 text-violet-100/80">{t("subjectBusinessFormSub")}</p>{!canManageSubjects ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}</div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingSubjectId ? t("updateMode") : t("createMode")}</span><button disabled={!canManageSubjects} onClick={resetSubjectForm} className={cn("rounded-full px-3 py-1 text-xs transition", canManageSubjects ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button><button disabled={!canManageSubjects} onClick={editSelectedSubject} className={cn("rounded-full px-3 py-1 text-xs transition", canManageSubjects ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedSubject")}</button></div></div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("subjectIdentity")}</p><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectNameFr")}</span><input disabled={!canManageSubjects} value={subjectDraft.nameFr} onChange={(event) => updateSubjectDraft("nameFr", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectNameEn")}</span><input disabled={!canManageSubjects} value={subjectDraft.nameEn} onChange={(event) => updateSubjectDraft("nameEn", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectCode")}</span><input disabled={!canManageSubjects} value={subjectDraft.code} onChange={(event) => updateSubjectDraft("code", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">Key</span><input disabled={!canManageSubjects} value={subjectDraft.subjectKey} onChange={(event) => updateSubjectDraft("subjectKey", event.target.value)} placeholder="new_subject" className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectCategory")}</span><select disabled={!canManageSubjects} value={subjectDraft.categoryKey} onChange={(event) => updateSubjectDraft("categoryKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.subjectCategoryKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("status")}</span><select disabled={!canManageSubjects} value={subjectDraft.statusKey} onChange={(event) => updateSubjectDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.subjectStatusKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label><label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("resourceDescription")}</span><textarea disabled={!canManageSubjects} value={subjectDraft.description} onChange={(event) => updateSubjectDraft("description", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label></div></div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("subjectRules")}</p><div className="grid gap-3 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("subjectLevels")}</span><input disabled={!canManageSubjects} value={subjectDraft.levelsText} onChange={(event) => updateSubjectDraft("levelsText", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectDuration")}</span><input disabled={!canManageSubjects} value={subjectDraft.duration} onChange={(event) => updateSubjectDraft("duration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectWeeklySessions")}</span><input disabled={!canManageSubjects} type="number" value={subjectDraft.weeklySessions} onChange={(event) => updateSubjectDraft("weeklySessions", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectSessionDuration")}</span><input disabled={!canManageSubjects} value={subjectDraft.sessionDuration} onChange={(event) => updateSubjectDraft("sessionDuration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectBaseFee")}</span><input disabled={!canManageSubjects} type="number" value={subjectDraft.baseFee} onChange={(event) => updateSubjectDraft("baseFee", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectOwner")}</span><input disabled={!canManageSubjects} value={subjectDraft.owner} onChange={(event) => updateSubjectDraft("owner", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label><label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectColor")}</span><select disabled={!canManageSubjects} value={subjectDraft.color} onChange={(event) => updateSubjectDraft("color", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500"><option value="cyan">Cyan</option><option value="violet">Violet</option><option value="orange">Orange</option><option value="emerald">Emerald</option></select></label></div></div>
          </div>
          <button disabled={!canManageSubjects} onClick={saveSubjectForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageSubjects ? "bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveSubject")}</button>
        </div>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-slate-400">{ICONS.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchSubjects")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none"><option value="all">{t("filterAll")}</option>{FIELD_OPTIONS.subjectCategoryKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}{FIELD_OPTIONS.subjectStatusKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select><button disabled={!canManageSubjects} onClick={addDemoSubject} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageSubjects ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoSubject")}</button></div>
        <div className="grid gap-4 lg:grid-cols-2">{rows.map((subject) => { const usage = getSubjectUsage(subject.subjectKey); const usageCount = Object.values(usage).reduce((sum, value) => sum + value, 0); return (<button key={subject.id} onClick={() => setSelectedSubjectId(subject.id)} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10"><div className={cn("h-2 bg-gradient-to-r", colorGradient(subject.color))} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{subjectLabel(subject)}</h3><p className="mt-1 text-xs text-slate-400">{subject.code} · {t(subject.categoryKey)} · {(subject.levels || []).join(" · ")}</p></div><span className={`rounded-full px-3 py-1 text-xs ${statusTone(subject.statusKey)}`}>{t(subject.statusKey)}</span></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{subject.description}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100">{t("subjectUsage")}: {usageCount}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{formatMoney(subject.baseFee)}</span></div></div></button>); })}</div>
      </GlassCard>
      <GlassCard>
        <SectionHeader title={t("subjectProfile")} subtitle={selectedSubject ? t("selectedSubject") : t("noSubjectSelected")} />
        {selectedSubject ? (<div className="space-y-4"><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"><div className={cn("h-2 bg-gradient-to-r", colorGradient(selectedSubject.color))} /><div className="p-5"><p className="text-2xl font-semibold text-white">{subjectLabel(selectedSubject)}</p><p className="mt-1 text-sm text-slate-400">{selectedSubject.code} · {selectedSubject.subjectKey}</p><div className="mt-4 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedSubject.statusKey)}`}>{t(selectedSubject.statusKey)}</span><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedSubject.categoryKey)}</span></div></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectLevels")}</p><p className="mt-2 text-sm font-semibold text-white">{(selectedSubject.levels || []).join(", ")}</p></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectBaseFee")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{formatMoney(selectedSubject.baseFee)}</p></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectDuration")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedSubject.duration}</p></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectWeeklySessions")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedSubject.weeklySessions} · {selectedSubject.sessionDuration}</p></div><div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectUsage")}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span>{t("linkedLearners")}: {selectedUsage.learners}</span><span>{t("linkedCohorts")}: {selectedUsage.cohorts}</span><span>{t("linkedCourses")}: {selectedUsage.courses}</span><span>{t("linkedResources")}: {selectedUsage.resources}</span><span>{t("linkedPayments")}: {selectedUsage.payments}</span></div></div><div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceDescription")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedSubject.description}</p></div></div><div className="grid gap-2"><button disabled={!canManageSubjects} onClick={() => selectedSubject.statusKey === "subjectStatusArchived" ? activateSubject(selectedSubject) : archiveSubject(selectedSubject)} className={cn("w-full rounded-2xl px-5 py-3 text-sm font-semibold transition", canManageSubjects ? "bg-orange-500/20 text-orange-100 hover:-translate-y-1 hover:bg-orange-500/30" : "bg-white/5 text-slate-500")}>{selectedSubject.statusKey === "subjectStatusArchived" ? t("activateSubject") : t("archiveSubject")}</button><button disabled={!canHardDelete || totalUsage(selectedSubject.subjectKey) > 0} onClick={() => deleteSubject(selectedSubject)} className={cn("w-full rounded-2xl px-5 py-3 text-sm font-semibold transition", canHardDelete && totalUsage(selectedSubject.subjectKey) === 0 ? "bg-rose-500/20 text-rose-100 hover:-translate-y-1 hover:bg-rose-500/30" : "bg-white/5 text-slate-500")}>{t("deleteSubjectSafe")}</button>{totalUsage(selectedSubject.subjectKey) > 0 ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-xs leading-5 text-rose-100">{t("subjectUsedWarning")}</p> : null}</div></div>) : null}
      </GlassCard>
    </div>
  );
}

function CohortModule({ t, cohorts, setCohorts, selectedCohortId, setSelectedCohortId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageCohorts = canRolePerform(currentUser, "edit", "cohorts");
  const emptyCohortDraft = {
    nameKey: "a1Morning",
    subjectKey: "german",
    level: "A1",
    students: 0,
    capacity: 25,
    teacher: "M. Joseph",
    schedule: "08:00 - 11:00",
    progress: 0,
    statusKey: "planned"
  };
  const [cohortDraft, setCohortDraft] = useState(emptyCohortDraft);
  const [editingCohortId, setEditingCohortId] = useState(null);

  function updateCohortDraft(key, value) {
    setCohortDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetCohortForm() {
    setCohortDraft(emptyCohortDraft);
    setEditingCohortId(null);
  }

  function editSelectedCohort() {
    if (!canManageCohorts) return;
    const cohort = cohorts.find((item) => item.id === selectedCohortId);
    if (!cohort) return;
    setEditingCohortId(cohort.id);
    setCohortDraft({
      nameKey: cohort.nameKey || "a1Morning",
      subjectKey: cohort.subjectKey || "german",
      level: cohort.level || "A1",
      students: cohort.students || 0,
      capacity: cohort.capacity || 25,
      teacher: cohort.teacher || "M. Joseph",
      schedule: cohort.schedule || "08:00 - 11:00",
      progress: cohort.progress || 0,
      statusKey: cohort.statusKey || "planned"
    });
  }

  function cohortGradient(subjectKey) {
    if (subjectKey === "artificialIntelligence") return "from-emerald-400 to-cyan-700";
    if (subjectKey === "computer") return "from-orange-400 to-red-500";
    if (subjectKey === "english") return "from-violet-500 to-purple-700";
    return "from-cyan-400 to-sky-600";
  }

  function saveCohortForm() {
    if (!canManageCohorts) return;
    const normalizedCohort = {
      ...cohortDraft,
      students: Math.max(0, Number(cohortDraft.students) || 0),
      capacity: Math.max(1, Number(cohortDraft.capacity) || 1),
      progress: clampNumber(cohortDraft.progress),
      gradient: cohortGradient(cohortDraft.subjectKey)
    };

    if (editingCohortId) {
      setCohorts((previous) => previous.map((item) => item.id === editingCohortId ? { ...item, ...normalizedCohort } : item));
      setSelectedCohortId(editingCohortId);
    } else {
      const newCohort = {
        id: `c${cohorts.length + 1}`,
        ...normalizedCohort
      };
      setCohorts((previous) => [newCohort, ...previous]);
      setSelectedCohortId(newCohort.id);
    }
    resetCohortForm();
  }

  const rows = useMemo(() => cohorts.filter((cohort) => {
    const haystack = `${t(cohort.nameKey)} ${t(cohort.subjectKey)} ${cohort.level} ${cohort.teacher} ${cohort.schedule}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || cohort.subjectKey === filter;
    return matchesSearch && matchesFilter;
  }), [cohorts, query, filter, t]);

  const selectedCohort = cohorts.find((cohort) => cohort.id === selectedCohortId) || rows[0] || null;

  function addDemoCohort() {
    if (!canManageCohorts) return;
    const nextIndex = cohorts.length + 1;
    const subjectKey = filter !== "all" ? filter : "german";
    const newCohort = {
      id: `c${nextIndex}`,
      nameKey: "demoCohortName",
      subjectKey,
      level: subjectKey === "english" ? "Beginner" : "A1",
      students: 0,
      capacity: 20,
      teacher: t("toAssign"),
      schedule: "09:00 - 12:00",
      progress: 0,
      statusKey: "planned",
      gradient: subjectKey === "artificialIntelligence" ? "from-emerald-400 to-cyan-700" : subjectKey === "computer" ? "from-orange-400 to-red-500" : subjectKey === "english" ? "from-violet-500 to-purple-700" : "from-cyan-400 to-sky-600"
    };
    setCohorts((previousCohorts) => [newCohort, ...previousCohorts]);
    setSelectedCohortId(newCohort.id);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("cohortModuleTitle")} subtitle={t("cohortModuleSub")} action={t("seeAll")} />
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("cohortBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("cohortBusinessFormSub")}</p>
              {!canManageCohorts ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingCohortId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetCohortForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedCohort} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/30">{t("editSelectedCohort")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("cohortIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohortName")}</span><select value={cohortDraft.nameKey} onChange={(event) => updateCohortDraft("nameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={cohortDraft.subjectKey} onChange={(event) => updateCohortDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select value={cohortDraft.level} onChange={(event) => updateCohortDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("status")}</span><select value={cohortDraft.statusKey} onChange={(event) => updateCohortDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="active">{t("active")}</option><option value="planned">{t("planned")}</option><option value="full">{t("full")}</option></select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("planningAndCapacity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("teacher")}</span><select value={cohortDraft.teacher} onChange={(event) => updateCohortDraft("teacher", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.teacher.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("schedule")}</span><input value={cohortDraft.schedule} onChange={(event) => updateCohortDraft("schedule", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("enrolled")}</span><input type="number" value={cohortDraft.students} onChange={(event) => updateCohortDraft("students", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("capacityLabel")}</span><input type="number" value={cohortDraft.capacity} onChange={(event) => updateCohortDraft("capacity", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("cohortProgress")}</span><input type="number" value={cohortDraft.progress} onChange={(event) => updateCohortDraft("progress", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageCohorts} onClick={saveCohortForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageCohorts ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveCohort")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCohorts")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
          </select>
          <button disabled={!canManageCohorts} onClick={addDemoCohort} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageCohorts ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoCohort")}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((cohort) => (
            <button key={cohort.id} onClick={() => setSelectedCohortId(cohort.id)} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className={cn("h-2 bg-gradient-to-r", cohort.gradient)} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-semibold text-white">{t(cohort.nameKey)}</h3><p className="mt-1 text-xs text-slate-400">{t(cohort.subjectKey)} · {cohort.level}</p></div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{t(cohort.statusKey)}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <p>{t("cohortTeacher")}: {cohort.teacher}</p>
                  <p>{t("cohortSchedule")}: {cohort.schedule}</p>
                  <p>{t("enrolled")}: {cohort.students}</p>
                  <p>{t("capacityLabel")}: {cohort.capacity}</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10"><div className={cn("h-2 rounded-full bg-gradient-to-r", cohort.gradient)} style={{ width: `${clampNumber(cohort.progress)}%` }} /></div>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("cohortProfile")} subtitle={selectedCohort ? t("selectedCohort") : t("noCohortSelected")} />
        {selectedCohort ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className={cn("h-2 bg-gradient-to-r", selectedCohort.gradient)} />
              <div className="p-5">
                <p className="text-2xl font-semibold text-white">{t(selectedCohort.nameKey)}</p>
                <p className="mt-1 text-sm text-slate-400">{t(selectedCohort.subjectKey)} · {selectedCohort.level}</p>
                <div className="mt-4 flex gap-2"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{t(selectedCohort.statusKey)}</span><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{selectedCohort.students}/{selectedCohort.capacity}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("cohortProgress")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedCohort.progress}%</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("capacityLabel")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedCohort.capacity}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("cohortTeacher")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedCohort.teacher}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("cohortSchedule")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedCohort.schedule}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function TeacherModule({ t, teachers, setTeachers, selectedTeacherId, setSelectedTeacherId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageTeachers = ["superAdmin", "admin"].includes(currentUser?.role) || currentUser?.permissions?.includes("manageUsers");
  const emptyTeacherDraft = {
    name: "",
    phone: "",
    email: "",
    position: "",
    departmentKey: "departmentPedagogy",
    subjectKey: "german",
    qualification: "",
    workload: 0,
    availability: "08:00 - 11:00",
    assignedCohorts: ["a1Morning"],
    teacherRoleKey: "teacherRoleTrainer",
    accountStatusKey: "activeAccount",
    permissions: ["createCourse", "editCourse", "takeAttendance", "createAssessment", "correctAssessment"],
    statusKey: "active"
  };
  const [teacherDraft, setTeacherDraft] = useState(emptyTeacherDraft);
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  function updateTeacherDraft(key, value) {
    setTeacherDraft((previous) => ({ ...previous, [key]: value }));
  }

  function applyTeacherRoleTemplate(roleKey) {
    setTeacherDraft((previous) => {
      const nextPermissions = getStaffPermissionsForRole(roleKey);
      const nextDepartment = roleKey === "teacherRoleSecretariat" ? "departmentSecretariat" : roleKey === "teacherRoleAccountant" ? "departmentFinance" : roleKey === "teacherRoleITSupport" ? "departmentIT" : roleKey === "teacherRoleAiAssistant" ? "departmentAI" : roleKey === "teacherRoleSuperAdmin" || roleKey === "teacherRoleAdmin" ? "departmentAdministration" : previous.departmentKey;
      const nextPosition = previous.position || t(roleKey);
      return { ...previous, teacherRoleKey: roleKey, departmentKey: nextDepartment, position: nextPosition, permissions: nextPermissions };
    });
  }

  function toggleTeacherPermission(permissionKey) {
    setTeacherDraft((previous) => {
      if (CRITICAL_PERMISSION_KEYS.includes(permissionKey) && previous.teacherRoleKey !== "teacherRoleSuperAdmin") return previous;
      const current = previous.permissions || [];
      const nextPermissions = current.includes(permissionKey) ? current.filter((item) => item !== permissionKey) : [...current, permissionKey];
      return { ...previous, permissions: nextPermissions };
    });
  }

  function toggleTeacherCohort(cohortKey) {
    setTeacherDraft((previous) => {
      const current = previous.assignedCohorts || [];
      const nextCohorts = current.includes(cohortKey) ? current.filter((item) => item !== cohortKey) : [...current, cohortKey];
      return { ...previous, assignedCohorts: nextCohorts };
    });
  }

  function resetTeacherForm() {
    setTeacherDraft(emptyTeacherDraft);
    setEditingTeacherId(null);
  }

  function editSelectedTeacher() {
    const teacher = teachers.find((item) => item.id === selectedTeacherId);
    if (!teacher) return;
    setEditingTeacherId(teacher.id);
    setTeacherDraft({
      name: teacher.name || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      position: teacher.position || "",
      departmentKey: teacher.departmentKey || "departmentPedagogy",
      subjectKey: teacher.subjectKey || "german",
      qualification: teacher.qualification || "",
      workload: teacher.workload || 0,
      availability: teacher.availability || "08:00 - 11:00",
      assignedCohorts: teacher.assignedCohorts || [],
      teacherRoleKey: teacher.teacherRoleKey || "teacherRoleTrainer",
      accountStatusKey: teacher.accountStatusKey || "activeAccount",
      permissions: teacher.permissions || [],
      statusKey: teacher.statusKey || "active"
    });
  }

  function saveTeacherForm() {
    if (!canManageTeachers) return;
    const sanitizedPermissions = teacherDraft.teacherRoleKey === "teacherRoleSuperAdmin" ? (teacherDraft.permissions || []) : (teacherDraft.permissions || []).filter((permission) => !CRITICAL_PERMISSION_KEYS.includes(permission));
    const normalizedTeacher = {
      ...teacherDraft,
      name: teacherDraft.name.trim() || `${t("demoTeacherName")} ${teachers.length + 1}`,
      phone: teacherDraft.phone.trim() || "+228 91 00 00 99",
      email: teacherDraft.email.trim() || `staff${teachers.length + 1}@lms.local`,
      position: teacherDraft.position.trim() || t("toDefine"),
      qualification: teacherDraft.qualification.trim() || t("toDefine"),
      workload: Math.max(0, Number(teacherDraft.workload) || 0),
      assigned: (teacherDraft.assignedCohorts || []).length,
      assignedCohorts: teacherDraft.assignedCohorts || [],
      permissions: sanitizedPermissions
    };

    if (editingTeacherId) {
      setTeachers((previous) => previous.map((item) => item.id === editingTeacherId ? { ...item, ...normalizedTeacher } : item));
      setSelectedTeacherId(editingTeacherId);
    } else {
      const newTeacher = {
        id: `TCH-${String(teachers.length + 1).padStart(3, "0")}`,
        ...normalizedTeacher
      };
      setTeachers((previous) => [newTeacher, ...previous]);
      setSelectedTeacherId(newTeacher.id);
    }
    resetTeacherForm();
  }

  const rows = useMemo(() => teachers.filter((teacher) => {
    const permissionsText = (teacher.permissions || []).join(" ");
    const cohortsText = (teacher.assignedCohorts || []).map((item) => t(item)).join(" ");
    const haystack = `${teacher.name} ${teacher.phone} ${teacher.email || ""} ${teacher.position || ""} ${t(teacher.departmentKey)} ${t(teacher.subjectKey)} ${teacher.qualification} ${t(teacher.teacherRoleKey)} ${permissionsText} ${cohortsText}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || teacher.subjectKey === filter || teacher.departmentKey === filter || teacher.teacherRoleKey === filter || teacher.accountStatusKey === filter;
    return matchesSearch && matchesFilter;
  }), [teachers, query, filter, t]);

  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId) || rows[0] || null;

  function addDemoTeacher() {
    if (!canManageTeachers) return;
    const nextIndex = teachers.length + 1;
    const subjectKey = filter !== "all" && FIELD_OPTIONS.subjectKey.includes(filter) ? filter : "german";
    const newTeacher = {
      id: `TCH-${String(nextIndex).padStart(3, "0")}`,
      name: `${t("demoTeacherName")} ${nextIndex}`,
      phone: "+228 91 00 00 99",
      email: `staff${nextIndex}@lms.local`,
      position: subjectKey === "artificialIntelligence" ? "Responsable contenu IA" : subjectKey === "computer" ? "Support informatique" : subjectKey === "english" ? "Formateur anglais" : "Formateur allemand",
      departmentKey: subjectKey === "artificialIntelligence" ? "departmentAI" : subjectKey === "computer" ? "departmentIT" : "departmentPedagogy",
      subjectKey,
      qualification: subjectKey === "artificialIntelligence" ? "Prompting · Agents" : subjectKey === "computer" ? "Support IT" : subjectKey === "english" ? "English trainer" : "A1-B2",
      workload: 0,
      availability: t("toDefine"),
      assigned: 0,
      assignedCohorts: [],
      teacherRoleKey: "teacherRoleTrainer",
      accountStatusKey: "activeAccount",
      permissions: ["createCourse", "takeAttendance", "createAssessment"],
      statusKey: "planned"
    };
    setTeachers((previousTeachers) => [newTeacher, ...previousTeachers]);
    setSelectedTeacherId(newTeacher.id);
  }

  const permissionLabel = (permissionKey) => TEACHER_PERMISSION_OPTIONS.find((item) => item.key === permissionKey)?.labelKey || permissionKey;
  const accountTone = (key) => key === "activeAccount" ? "bg-emerald-400/15 text-emerald-200" : key === "suspendedAccount" ? "bg-orange-400/15 text-orange-200" : "bg-rose-400/15 text-rose-200";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("teacherModuleTitle")} subtitle={t("teacherModuleSub")} action={t("seeAll")} />
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("teacherBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("teacherBusinessFormSub")}</p>
              {!canManageTeachers ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("noPermissionToManageTeachers")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingTeacherId ? t("updateMode") : t("createMode")}</span>
              <button disabled={!canManageTeachers} onClick={resetTeacherForm} className={cn("rounded-full px-3 py-1 text-xs transition", canManageTeachers ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button>
              <button disabled={!canManageTeachers} onClick={editSelectedTeacher} className={cn("rounded-full px-3 py-1 text-xs transition", canManageTeachers ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedTeacher")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("teacherIdentity")}</p>
              <div className="grid gap-3">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("teacherName")}</span><input disabled={!canManageTeachers} value={teacherDraft.name} onChange={(event) => updateTeacherDraft("name", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("phone")}</span><input disabled={!canManageTeachers} value={teacherDraft.phone} onChange={(event) => updateTeacherDraft("phone", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("teacherEmail")}</span><input disabled={!canManageTeachers} value={teacherDraft.email} onChange={(event) => updateTeacherDraft("email", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("staffPosition")}</span><input disabled={!canManageTeachers} value={teacherDraft.position} onChange={(event) => updateTeacherDraft("position", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("staffDepartment")}</span><select disabled={!canManageTeachers} value={teacherDraft.departmentKey} onChange={(event) => updateTeacherDraft("departmentKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{STAFF_DEPARTMENT_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("qualification")}</span><input disabled={!canManageTeachers} value={teacherDraft.qualification} onChange={(event) => updateTeacherDraft("qualification", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("teacherAssignment")}</p>
              <div className="grid gap-3">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("staffSubjectOptional")}</span><select disabled={!canManageTeachers} value={teacherDraft.subjectKey} onChange={(event) => updateTeacherDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("hourlyLoad")}</span><input disabled={!canManageTeachers} type="number" value={teacherDraft.workload} onChange={(event) => updateTeacherDraft("workload", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("availability")}</span><input disabled={!canManageTeachers} value={teacherDraft.availability} onChange={(event) => updateTeacherDraft("availability", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs text-slate-400">{t("assignedCohorts")}</p>
                  <div className="flex flex-wrap gap-2">
                    {FIELD_OPTIONS.cohortNameKey.map((cohortKey) => (
                      <button key={cohortKey} disabled={!canManageTeachers} type="button" onClick={() => toggleTeacherCohort(cohortKey)} className={cn("rounded-full px-3 py-1 text-xs transition", (teacherDraft.assignedCohorts || []).includes(cohortKey) ? "bg-cyan-500/25 text-cyan-100" : "bg-white/10 text-slate-300", !canManageTeachers ? "opacity-60" : "hover:bg-cyan-500/30")}>{t(cohortKey)}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">{t("teacherAccess")}</p>
              <div className="grid gap-3">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("teacherRoleType")}</span><select disabled={!canManageTeachers} value={teacherDraft.teacherRoleKey} onChange={(event) => applyTeacherRoleTemplate(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{TEACHER_ROLE_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select><span className="mt-2 block text-[11px] leading-5 text-orange-100/70">{t("rolePermissionHint")}</span></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("accountStatus")}</span><select disabled={!canManageTeachers} value={teacherDraft.accountStatusKey} onChange={(event) => updateTeacherDraft("accountStatusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{TEACHER_ACCOUNT_STATUS_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">{t("permissionsCount")}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100">{(teacherDraft.permissions || []).length}</span>
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {TEACHER_PERMISSION_OPTIONS.map((permission) => {
                      const isCriticalLocked = permission.superAdminOnly && teacherDraft.teacherRoleKey !== "teacherRoleSuperAdmin";
                      return (
                        <label key={permission.key} className={cn("flex items-center gap-3 rounded-xl bg-[#0b1025]/70 px-3 py-2 text-xs", isCriticalLocked ? "text-slate-500" : "text-slate-200")}>
                          <input disabled={!canManageTeachers || isCriticalLocked} type="checkbox" checked={(teacherDraft.permissions || []).includes(permission.key)} onChange={() => toggleTeacherPermission(permission.key)} />
                          <span>{t(permission.labelKey)}</span>
                        </label>
                      );
                    })}
                  </div>
                  {teacherDraft.teacherRoleKey !== "teacherRoleSuperAdmin" ? <p className="mt-3 text-[11px] leading-5 text-rose-100/75">{t("protectedCriticalPermissions")}</p> : null}
                </div>
              </div>
            </div>
          </div>
          <button disabled={!canManageTeachers} onClick={saveTeacherForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageTeachers ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveTeacher")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchTeachers")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
            {STAFF_DEPARTMENT_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            {TEACHER_ROLE_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            {TEACHER_ACCOUNT_STATUS_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select>
          <button disabled={!canManageTeachers} onClick={addDemoTeacher} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageTeachers ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoTeacher")}</button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">{t("teacherName")}</th>
                <th className="p-4">{t("staffDepartment")}</th>
                <th className="p-4">{t("teacherRoleType")}</th>
                <th className="p-4">{t("workload")}</th>
                <th className="p-4">{t("assignedCohorts")}</th>
                <th className="p-4">{t("accountStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((teacher) => (
                <tr key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/10">
                  <td className="p-4"><p className="font-semibold text-white">{teacher.name}</p><p className="text-xs text-slate-500">{teacher.email || teacher.phone}</p></td>
                  <td className="p-4 text-slate-300"><p>{t(teacher.departmentKey)}</p><p className="text-xs text-slate-500">{teacher.position}</p></td>
                  <td className="p-4"><span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">{t(teacher.teacherRoleKey)}</span></td>
                  <td className="p-4 text-cyan-300">{teacher.workload}h</td>
                  <td className="p-4"><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{teacher.assigned || 0}</span></td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${accountTone(teacher.accountStatusKey)}`}>{t(teacher.accountStatusKey)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("teacherProfile")} subtitle={selectedTeacher ? t("selectedTeacher") : t("noTeacherSelected")} />
        {selectedTeacher ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedTeacher.name}</p>
              <p className="mt-1 text-sm text-slate-400">{selectedTeacher.email || selectedTeacher.phone}</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{t(selectedTeacher.departmentKey)}</span><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedTeacher.teacherRoleKey)}</span><span className={`rounded-full px-3 py-1 text-xs ${accountTone(selectedTeacher.accountStatusKey)}`}>{t(selectedTeacher.accountStatusKey)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("staffPosition")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedTeacher.position}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("staffSubjectOptional")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{t(selectedTeacher.subjectKey)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("workload")}</p><p className="mt-2 text-2xl font-semibold text-cyan-300">{selectedTeacher.workload}h</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("assignedCohorts")}</p><p className="mt-2 text-sm font-semibold text-white">{(selectedTeacher.assignedCohorts || []).map((item) => t(item)).join(", ") || "—"}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("availability")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedTeacher.availability}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("teacherAccess")}</p><div className="mt-3 flex flex-wrap gap-2">{(selectedTeacher.permissions || []).map((permission) => <span key={permission} className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100">{t(permissionLabel(permission))}</span>)}</div></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function CourseModule({ t, language, courses, setCourses, selectedCourseId, setSelectedCourseId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageCourses = canRolePerform(currentUser, "edit", "courses");
  const emptyCourseDraft = {
    title: "",
    subjectKey: "german",
    level: "A1",
    cohortNameKey: "a1Morning",
    teacher: "M. Joseph",
    week: 1,
    session: 1,
    duration: "3h",
    typeKey: "vocabulary",
    objective: "",
    resources: 0,
    homework: 0,
    statusKey: "draft",
    progress: 0
  };
  const [courseDraft, setCourseDraft] = useState(emptyCourseDraft);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [objectiveTemplateId, setObjectiveTemplateId] = useState("greetingA1");
  const objectiveTemplates = COURSE_OBJECTIVE_TEMPLATES[language] || COURSE_OBJECTIVE_TEMPLATES.fr;
  const filteredObjectiveTemplates = objectiveTemplates.filter((item) => item.subjectKey === courseDraft.subjectKey || item.level === courseDraft.level || item.subjectKey === "german");
  const selectedObjectiveTemplate = filteredObjectiveTemplates.find((item) => item.id === objectiveTemplateId) || filteredObjectiveTemplates[0] || objectiveTemplates[0];
  const allObjectiveTemplateTexts = [...COURSE_OBJECTIVE_TEMPLATES.fr, ...COURSE_OBJECTIVE_TEMPLATES.en].map((item) => item.text);

  useEffect(() => {
    if (!selectedObjectiveTemplate) return;
    const shouldTranslateCurrentObjective = !courseDraft.objective || allObjectiveTemplateTexts.includes(courseDraft.objective);
    if (shouldTranslateCurrentObjective && courseDraft.objective !== selectedObjectiveTemplate.text) {
      setCourseDraft((previous) => ({ ...previous, objective: selectedObjectiveTemplate.text }));
    }
  }, [language, objectiveTemplateId, selectedObjectiveTemplate?.text]);

  function updateCourseDraft(key, value) {
    setCourseDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetCourseForm() {
    setCourseDraft(emptyCourseDraft);
    setEditingCourseId(null);
    setObjectiveTemplateId("greetingA1");
  }

  function applyObjectiveSuggestion() {
    if (!selectedObjectiveTemplate) return;
    updateCourseDraft("objective", selectedObjectiveTemplate.text);
  }

  function editSelectedCourse() {
    if (!canManageCourses) return;
    const course = courses.find((item) => item.id === selectedCourseId);
    if (!course) return;
    setEditingCourseId(course.id);
    setCourseDraft({
      title: course.title || "",
      subjectKey: course.subjectKey || "german",
      level: course.level || "A1",
      cohortNameKey: course.cohortNameKey || "a1Morning",
      teacher: course.teacher || "M. Joseph",
      week: course.week || 1,
      session: course.session || 1,
      duration: course.duration || "3h",
      typeKey: course.typeKey || "vocabulary",
      objective: course.objective || "",
      resources: course.resources || 0,
      homework: course.homework || 0,
      statusKey: course.statusKey || "draft",
      progress: course.progress || 0
    });
  }

  function saveCourseForm() {
    if (!canManageCourses) return;
    const normalizedCourse = {
      ...courseDraft,
      title: courseDraft.title.trim() || `${t("demoCourseTitle")} ${courses.length + 1}`,
      week: Math.max(1, Number(courseDraft.week) || 1),
      session: Math.max(1, Number(courseDraft.session) || 1),
      resources: Math.max(0, Number(courseDraft.resources) || 0),
      homework: Math.max(0, Number(courseDraft.homework) || 0),
      progress: clampNumber(courseDraft.progress),
      objective: courseDraft.objective.trim() || t("toDefine")
    };

    if (editingCourseId) {
      setCourses((previous) => previous.map((item) => item.id === editingCourseId ? { ...item, ...normalizedCourse } : item));
      setSelectedCourseId(editingCourseId);
    } else {
      const newCourse = {
        id: `CRS-${String(courses.length + 1).padStart(3, "0")}`,
        ...normalizedCourse
      };
      setCourses((previous) => [newCourse, ...previous]);
      setSelectedCourseId(newCourse.id);
    }
    resetCourseForm();
  }

  const rows = useMemo(() => courses.filter((course) => {
    const haystack = `${course.title} ${t(course.subjectKey)} ${course.level} ${course.teacher} ${t(course.typeKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || course.subjectKey === filter;
    return matchesSearch && matchesFilter;
  }), [courses, query, filter, t]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || rows[0] || null;

  function addDemoCourse() {
    if (!canManageCourses) return;
    const nextIndex = courses.length + 1;
    const subjectKey = filter !== "all" ? filter : "german";
    const newCourse = {
      id: `CRS-${String(nextIndex).padStart(3, "0")}`,
      title: `${t("demoCourseTitle")} ${nextIndex}`,
      subjectKey,
      level: subjectKey === "english" ? "Beginner" : subjectKey === "computer" || subjectKey === "artificialIntelligence" ? "Intro" : "A1",
      cohortNameKey: subjectKey === "computer" ? "itIntro" : subjectKey === "artificialIntelligence" ? "ai" : "a1Morning",
      teacher: t("toAssign"),
      week: 1,
      session: 1,
      duration: subjectKey === "german" ? "3h" : "2h",
      typeKey: "workshop",
      objective: t("toDefine"),
      resources: 0,
      homework: 0,
      statusKey: "draft",
      progress: 0
    };
    setCourses((previousCourses) => [newCourse, ...previousCourses]);
    setSelectedCourseId(newCourse.id);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("courseModuleTitle")} subtitle={t("courseModuleSub")} action={t("seeAll")} />
        <div className="mb-5 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("courseBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-orange-100/80">{t("courseBusinessFormSub")}</p>
              {!canManageCourses ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-orange-100">{editingCourseId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetCourseForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedCourse} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/30">{t("editSelectedCourse")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">{t("courseIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("courseTitle")}</span><input value={courseDraft.title} onChange={(event) => updateCourseDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={courseDraft.subjectKey} onChange={(event) => updateCourseDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select value={courseDraft.level} onChange={(event) => updateCourseDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={courseDraft.cohortNameKey} onChange={(event) => updateCourseDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("teacher")}</span><select value={courseDraft.teacher} onChange={(event) => updateCourseDraft("teacher", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.teacher.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseType")}</span><select value={courseDraft.typeKey} onChange={(event) => updateCourseDraft("typeKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="grammar">{t("grammar")}</option><option value="vocabulary">{t("vocabulary")}</option><option value="oralPractice">{t("oralPractice")}</option><option value="quiz">{t("quiz")}</option><option value="workshop">{t("workshop")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseStatus")}</span><select value={courseDraft.statusKey} onChange={(event) => updateCourseDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="published">{t("published")}</option><option value="draft">{t("draft")}</option><option value="review">{t("review")}</option></select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("coursePlanning")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseWeek")}</span><input type="number" value={courseDraft.week} onChange={(event) => updateCourseDraft("week", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseSession")}</span><input type="number" value={courseDraft.session} onChange={(event) => updateCourseDraft("session", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseDuration")}</span><input value={courseDraft.duration} onChange={(event) => updateCourseDraft("duration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseProgress")}</span><input type="number" value={courseDraft.progress} onChange={(event) => updateCourseDraft("progress", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseResources")}</span><input type="number" value={courseDraft.resources} onChange={(event) => updateCourseDraft("resources", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseHomework")}</span><input type="number" value={courseDraft.homework} onChange={(event) => updateCourseDraft("homework", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("objectiveSuggestion")}</span><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><select value={selectedObjectiveTemplate?.id || ""} onChange={(event) => setObjectiveTemplateId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{filteredObjectiveTemplates.map((item) => <option key={item.id} value={item.id}>{t(item.labelKey)} · {item.level}</option>)}</select><button type="button" onClick={applyObjectiveSuggestion} className="rounded-xl bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30">{t("applyObjectiveSuggestion")}</button></div></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("courseObjective")}</span><textarea value={courseDraft.objective} onChange={(event) => updateCourseDraft("objective", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageCourses} onClick={saveCourseForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageCourses ? "bg-gradient-to-r from-orange-500 via-cyan-500 to-violet-600 text-white shadow-orange-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveCourse")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCourses")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
          </select>
          <button disabled={!canManageCourses} onClick={addDemoCourse} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageCourses ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoCourse")}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((course) => (
            <button key={course.id} onClick={() => setSelectedCourseId(course.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{t(course.subjectKey)} · {course.level} · {t(course.cohortNameKey)}</p>
                </div>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">{t(course.statusKey)}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <p>{t("teacher")}: {course.teacher}</p>
                <p>{t("courseType")}: {t(course.typeKey)}</p>
                <p>{t("courseWeek")}: {course.week}</p>
                <p>{t("courseSession")}: {course.session}</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-orange-400" style={{ width: `${clampNumber(course.progress)}%` }} />
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("courseProfile")} subtitle={selectedCourse ? t("selectedCourse") : t("noCourseSelected")} />
        {selectedCourse ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedCourse.title}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedCourse.subjectKey)} · {selectedCourse.level}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{t(selectedCourse.typeKey)}</span>
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedCourse.statusKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseWeek")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedCourse.week}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseSession")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedCourse.session}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseDuration")}</p><p className="mt-2 text-xl font-semibold text-cyan-300">{selectedCourse.duration}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseResources")}</p><p className="mt-2 text-xl font-semibold text-orange-300">{selectedCourse.resources}</p></div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">{t("courseObjective")}</p>
              <p className="mt-2 text-sm leading-6 text-white">{selectedCourse.objective}</p>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function AttendanceModule({ t, learners = [], courses = [], cohorts = [], attendanceRows, setAttendanceRows, selectedAttendanceId, setSelectedAttendanceId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageAttendance = canRolePerform(currentUser, "edit", "attendance");

  function exportAttendanceCsv() {
    downloadCsv("attendance.csv", attendanceRows.map((entry) => ({
      id: entry.id,
      learner: entry.learnerName,
      subject: t(entry.subjectKey),
      cohort: t(entry.cohortNameKey),
      course: entry.courseTitle,
      week: entry.week,
      session: entry.session,
      date: entry.date,
      status: t(entry.statusKey),
      note: entry.note
    })));
  }
  const emptyAttendanceDraft = {
    learnerName: "Koffi Mensah",
    subjectKey: "german",
    cohortNameKey: "a1Morning",
    courseTitle: "Alphabet und Begrüßung",
    week: 1,
    session: 1,
    date: "2026-05-15",
    statusKey: "present",
    note: ""
  };
  const [attendanceDraft, setAttendanceDraft] = useState(emptyAttendanceDraft);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [callSaved, setCallSaved] = useState(false);
  const [callDraft, setCallDraft] = useState({
    subjectKey: "german",
    cohortNameKey: "a1Morning",
    courseTitle: "Alphabet und Begrüßung",
    week: 1,
    session: 1,
    date: "2026-05-15"
  });
  const [callStatuses, setCallStatuses] = useState({});

  function updateCallDraft(key, value) {
    setCallDraft((previous) => ({ ...previous, [key]: value }));
    setCallSaved(false);
  }

  const learnersForCall = useMemo(() => {
    const selectedCohort = cohorts.find((cohort) => cohort.nameKey === callDraft.cohortNameKey);
    return learners.filter((learner) => {
      const matchesDirectCohort = learner.cohortNameKey && learner.cohortNameKey === callDraft.cohortNameKey;
      const matchesCohortProfile = selectedCohort && learner.subjectKey === selectedCohort.subjectKey && learner.level === selectedCohort.level;
      return matchesDirectCohort || matchesCohortProfile;
    });
  }, [learners, cohorts, callDraft.cohortNameKey]);

  function setLearnerCallStatus(learnerName, statusKey) {
    setCallStatuses((previous) => ({ ...previous, [learnerName]: statusKey }));
    setCallSaved(false);
  }

  function bulkMarkCall(statusKey) {
    const nextStatuses = Object.fromEntries(learnersForCall.map((learner) => [learner.name, statusKey]));
    setCallStatuses(nextStatuses);
    setCallSaved(false);
  }

  function saveClassAttendance() {
    if (!canManageAttendance || !learnersForCall.length) return;
    const newEntries = learnersForCall.map((learner, index) => ({
      id: `ATT-${String(attendanceRows.length + index + 1).padStart(3, "0")}`,
      learnerName: learner.name,
      subjectKey: learner.subjectKey || callDraft.subjectKey,
      cohortNameKey: callDraft.cohortNameKey,
      courseTitle: callDraft.courseTitle || t("toDefine"),
      week: Math.max(1, Number(callDraft.week) || 1),
      session: Math.max(1, Number(callDraft.session) || 1),
      date: callDraft.date,
      statusKey: callStatuses[learner.name] || "present",
      note: t("classAttendanceMode")
    }));
    setAttendanceRows((previous) => [...newEntries, ...previous]);
    setSelectedAttendanceId(newEntries[0]?.id || selectedAttendanceId);
    setCallSaved(true);
  }

  function updateAttendanceDraft(key, value) {
    setAttendanceDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetAttendanceForm() {
    setAttendanceDraft(emptyAttendanceDraft);
    setEditingAttendanceId(null);
  }

  function editSelectedAttendance() {
    if (!canManageAttendance) return;
    const entry = attendanceRows.find((item) => item.id === selectedAttendanceId);
    if (!entry) return;
    setEditingAttendanceId(entry.id);
    setAttendanceDraft({
      learnerName: entry.learnerName || "",
      subjectKey: entry.subjectKey || "german",
      cohortNameKey: entry.cohortNameKey || "a1Morning",
      courseTitle: entry.courseTitle || "",
      week: entry.week || 1,
      session: entry.session || 1,
      date: entry.date || "",
      statusKey: entry.statusKey || "present",
      note: entry.note || ""
    });
  }

  function saveAttendanceForm() {
    if (!canManageAttendance) return;
    const normalizedEntry = {
      ...attendanceDraft,
      learnerName: attendanceDraft.learnerName.trim() || `${t("demoLearnerName")} ${attendanceRows.length + 1}`,
      courseTitle: attendanceDraft.courseTitle.trim() || t("toDefine"),
      week: Math.max(1, Number(attendanceDraft.week) || 1),
      session: Math.max(1, Number(attendanceDraft.session) || 1),
      note: attendanceDraft.note.trim() || t("demoAttendanceNote")
    };

    if (editingAttendanceId) {
      setAttendanceRows((previous) => previous.map((item) => item.id === editingAttendanceId ? { ...item, ...normalizedEntry } : item));
      setSelectedAttendanceId(editingAttendanceId);
    } else {
      const newEntry = {
        id: `ATT-${String(attendanceRows.length + 1).padStart(3, "0")}`,
        ...normalizedEntry
      };
      setAttendanceRows((previous) => [newEntry, ...previous]);
      setSelectedAttendanceId(newEntry.id);
    }
    resetAttendanceForm();
  }

  const rows = useMemo(() => attendanceRows.filter((entry) => {
    const haystack = `${entry.learnerName} ${t(entry.subjectKey)} ${t(entry.cohortNameKey)} ${entry.courseTitle} ${t(entry.statusKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || entry.statusKey === filter;
    return matchesSearch && matchesFilter;
  }), [attendanceRows, query, filter, t]);

  const selectedAttendance = attendanceRows.find((entry) => entry.id === selectedAttendanceId) || rows[0] || null;

  const presentCount = attendanceRows.filter((entry) => entry.statusKey === "present" || entry.statusKey === "late").length;
  const attendanceRate = safePercent(presentCount, attendanceRows.length);

  function addDemoAttendance() {
    if (!canManageAttendance) return;
    const nextIndex = attendanceRows.length + 1;
    const statusKey = filter !== "all" ? filter : "present";
    const newEntry = {
      id: `ATT-${String(nextIndex).padStart(3, "0")}`,
      learnerName: `${t("demoLearnerName")} ${nextIndex}`,
      subjectKey: "german",
      cohortNameKey: "a1Morning",
      courseTitle: "Demo attendance session",
      week: 1,
      session: 1,
      date: "2026-05-15",
      statusKey,
      note: t("demoAttendanceNote")
    };
    setAttendanceRows((previousAttendanceRows) => [newEntry, ...previousAttendanceRows]);
    setSelectedAttendanceId(newEntry.id);
  }

  const statusTone = (statusKey) => {
    if (statusKey === "present") return "bg-emerald-400/15 text-emerald-200";
    if (statusKey === "late") return "bg-orange-400/15 text-orange-200";
    if (statusKey === "absent") return "bg-rose-400/15 text-rose-200";
    return "bg-cyan-400/15 text-cyan-200";
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("attendanceModuleTitle")} subtitle={t("attendanceModuleSub")} action={`${t("attendanceRate")}: ${attendanceRate}%`} />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("exportTools")}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{t("exportToolsSub")}</p>
            </div>
            <button onClick={exportAttendanceCsv} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("exportAttendanceCsv")}</button>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("classAttendanceMode")}</h3>
              <p className="mt-1 text-xs leading-5 text-emerald-100/80">{t("classAttendanceSub")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => bulkMarkCall("present")} className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100 transition hover:bg-emerald-500/30">{t("markAllPresent")}</button>
              <button onClick={() => bulkMarkCall("absent")} className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-100 transition hover:bg-rose-500/30">{t("markAllAbsent")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{t("classAttendanceSetup")}</p>
              <div className="grid gap-3">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={callDraft.cohortNameKey} onChange={(event) => updateCallDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{cohorts.map((cohort) => <option key={cohort.id} value={cohort.nameKey}>{t(cohort.nameKey)} · {cohort.level}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courses")}</span><select value={callDraft.courseTitle} onChange={(event) => updateCallDraft("courseTitle", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{courses.map((course) => <option key={course.id} value={course.title}>{course.title}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseWeek")}</span><input type="number" value={callDraft.week} onChange={(event) => updateCallDraft("week", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                  <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseSession")}</span><input type="number" value={callDraft.session} onChange={(event) => updateCallDraft("session", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                </div>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("attendanceDate")}</span><input type="date" value={callDraft.date} onChange={(event) => updateCallDraft("date", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("classAttendanceLearners")}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{learnersForCall.length}</span>
              </div>
              {learnersForCall.length ? (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {learnersForCall.map((learner) => (
                    <div key={learner.id} className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-white">{learner.name}</p>
                        <p className="text-xs text-slate-400">{t(learner.subjectKey)} · {learner.level}</p>
                      </div>
                      <select value={callStatuses[learner.name] || "present"} onChange={(event) => setLearnerCallStatus(learner.name, event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-xs text-white outline-none">
                        <option value="present">{t("present")}</option>
                        <option value="late">{t("late")}</option>
                        <option value="absent">{t("absent")}</option>
                        <option value="excused">{t("excused")}</option>
                      </select>
                    </div>
                  ))}
                </div>
              ) : <p className="rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-300">{t("noLearnersForCall")}</p>}
            </div>
          </div>
          <button onClick={saveClassAttendance} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-1">{t("saveClassAttendance")}</button>
          {callSaved ? <p className="mt-3 rounded-2xl bg-emerald-400/15 px-4 py-3 text-xs text-emerald-200">{t("callSaved")}</p> : null}
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("attendanceBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-cyan-100/80">{t("attendanceBusinessFormSub")}</p>
              {!canManageAttendance ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100">{editingAttendanceId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetAttendanceForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedAttendance} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/30">{t("editSelectedAttendance")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("attendanceIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("learners")}</span><input value={attendanceDraft.learnerName} onChange={(event) => updateAttendanceDraft("learnerName", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={attendanceDraft.subjectKey} onChange={(event) => updateAttendanceDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={attendanceDraft.cohortNameKey} onChange={(event) => updateAttendanceDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("attendanceStatus")}</span><select value={attendanceDraft.statusKey} onChange={(event) => updateAttendanceDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="present">{t("present")}</option><option value="late">{t("late")}</option><option value="absent">{t("absent")}</option><option value="excused">{t("excused")}</option></select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("attendanceSession")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("courses")}</span><input value={attendanceDraft.courseTitle} onChange={(event) => updateAttendanceDraft("courseTitle", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseWeek")}</span><input type="number" value={attendanceDraft.week} onChange={(event) => updateAttendanceDraft("week", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courseSession")}</span><input type="number" value={attendanceDraft.session} onChange={(event) => updateAttendanceDraft("session", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("attendanceDate")}</span><input type="date" value={attendanceDraft.date} onChange={(event) => updateAttendanceDraft("date", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("attendanceNote")}</span><textarea value={attendanceDraft.note} onChange={(event) => updateAttendanceDraft("note", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageAttendance} onClick={saveAttendanceForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageAttendance ? "bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 text-white shadow-cyan-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveAttendance")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchAttendance")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="present">{t("present")}</option>
            <option value="late">{t("late")}</option>
            <option value="absent">{t("absent")}</option>
            <option value="excused">{t("excused")}</option>
          </select>
          <button disabled={!canManageAttendance} onClick={addDemoAttendance} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageAttendance ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoAttendance")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">{t("learners")}</th>
                <th className="p-4">{t("cohorts")}</th>
                <th className="p-4">{t("courses")}</th>
                <th className="p-4">{t("attendanceDate")}</th>
                <th className="p-4">{t("attendanceStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} onClick={() => setSelectedAttendanceId(entry.id)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/10">
                  <td className="p-4"><p className="font-semibold text-white">{entry.learnerName}</p><p className="text-xs text-slate-500">{t(entry.subjectKey)}</p></td>
                  <td className="p-4 text-slate-300">{t(entry.cohortNameKey)}</td>
                  <td className="p-4"><p className="text-slate-300">{entry.courseTitle}</p><p className="text-xs text-slate-500">{t("courseWeek")} {entry.week} · {t("courseSession")} {entry.session}</p></td>
                  <td className="p-4 text-slate-300">{entry.date}</td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${statusTone(entry.statusKey)}`}>{t(entry.statusKey)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("attendanceProfile")} subtitle={selectedAttendance ? t("selectedAttendance") : t("noAttendanceSelected")} />
        {selectedAttendance ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedAttendance.learnerName}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedAttendance.subjectKey)} · {t(selectedAttendance.cohortNameKey)}</p>
              <div className="mt-4 flex gap-2"><span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedAttendance.statusKey)}`}>{t(selectedAttendance.statusKey)}</span><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{selectedAttendance.date}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseWeek")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedAttendance.week}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courseSession")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedAttendance.session}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courses")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedAttendance.courseTitle}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("attendanceNote")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedAttendance.note}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function AssessmentModule({ t, learners = [], courses = [], assessments, setAssessments, selectedAssessmentId, setSelectedAssessmentId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageAssessments = canRolePerform(currentUser, "edit", "exams");
  const emptyAssessmentDraft = {
    title: "",
    learnerName: "Koffi Mensah",
    subjectKey: "german",
    cohortNameKey: "a1Morning",
    courseTitle: "Alphabet und Begrüßung",
    typeKey: "quiz",
    score: 0,
    maxScore: 100,
    date: "2026-05-21",
    decisionKey: "needsSupport",
    correctionKey: "notCorrected",
    note: ""
  };
  const [assessmentDraft, setAssessmentDraft] = useState(emptyAssessmentDraft);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  function updateAssessmentDraft(key, value) {
    setAssessmentDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetAssessmentForm() {
    setAssessmentDraft(emptyAssessmentDraft);
    setEditingAssessmentId(null);
  }

  function editSelectedAssessment() {
    if (!canManageAssessments) return;
    const assessment = assessments.find((item) => item.id === selectedAssessmentId);
    if (!assessment) return;
    setEditingAssessmentId(assessment.id);
    setAssessmentDraft({
      title: assessment.title || "",
      learnerName: assessment.learnerName || "",
      subjectKey: assessment.subjectKey || "german",
      cohortNameKey: assessment.cohortNameKey || "a1Morning",
      courseTitle: assessment.courseTitle || "",
      typeKey: assessment.typeKey || "quiz",
      score: assessment.score || 0,
      maxScore: assessment.maxScore || 100,
      date: assessment.date || "",
      decisionKey: assessment.decisionKey || "needsSupport",
      correctionKey: assessment.correctionKey || "notCorrected",
      note: assessment.note || ""
    });
  }

  function saveAssessmentForm() {
    if (!canManageAssessments) return;
    const score = Math.max(0, Number(assessmentDraft.score) || 0);
    const maxScore = Math.max(1, Number(assessmentDraft.maxScore) || 100);
    const normalizedAssessment = {
      ...assessmentDraft,
      title: assessmentDraft.title.trim() || `${t("demoAssessmentTitle")} ${assessments.length + 1}`,
      learnerName: assessmentDraft.learnerName.trim() || `${t("demoLearnerName")} ${assessments.length + 1}`,
      courseTitle: assessmentDraft.courseTitle.trim() || t("toDefine"),
      score: Math.min(score, maxScore),
      maxScore,
      note: assessmentDraft.note.trim() || t("assessmentNote")
    };

    if (editingAssessmentId) {
      setAssessments((previous) => previous.map((item) => item.id === editingAssessmentId ? { ...item, ...normalizedAssessment } : item));
      setSelectedAssessmentId(editingAssessmentId);
    } else {
      const newAssessment = {
        id: `ASM-${String(assessments.length + 1).padStart(3, "0")}`,
        ...normalizedAssessment
      };
      setAssessments((previous) => [newAssessment, ...previous]);
      setSelectedAssessmentId(newAssessment.id);
    }
    resetAssessmentForm();
  }

  const rows = useMemo(() => assessments.filter((item) => {
    const haystack = `${item.title} ${item.learnerName} ${t(item.subjectKey)} ${t(item.cohortNameKey)} ${item.courseTitle} ${t(item.typeKey)} ${t(item.decisionKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || item.typeKey === filter || item.decisionKey === filter || item.correctionKey === filter;
    return matchesSearch && matchesFilter;
  }), [assessments, query, filter, t]);

  const selectedAssessment = assessments.find((item) => item.id === selectedAssessmentId) || rows[0] || null;
  const correctedCount = assessments.filter((item) => item.correctionKey === "corrected").length;
  const correctionRate = safePercent(correctedCount, assessments.length);

  function addDemoAssessment() {
    if (!canManageAssessments) return;
    const nextIndex = assessments.length + 1;
    const typeKey = filter === "quiz" || filter === "mockExam" || filter === "assignment" ? filter : "quiz";
    const newAssessment = {
      id: `ASM-${String(nextIndex).padStart(3, "0")}`,
      title: `${t("demoAssessmentTitle")} ${nextIndex}`,
      learnerName: `${t("demoLearnerName")} ${nextIndex}`,
      subjectKey: "german",
      cohortNameKey: "a1Morning",
      courseTitle: "Demo assessment session",
      typeKey,
      score: 0,
      maxScore: 100,
      date: "2026-05-21",
      decisionKey: "needsSupport",
      correctionKey: "notCorrected",
      note: t("demoAttendanceNote")
    };
    setAssessments((previousAssessments) => [newAssessment, ...previousAssessments]);
    setSelectedAssessmentId(newAssessment.id);
  }

  const decisionTone = (key) => {
    if (key === "passed") return "bg-emerald-400/15 text-emerald-200";
    if (key === "failed") return "bg-rose-400/15 text-rose-200";
    return "bg-orange-400/15 text-orange-200";
  };

  const correctionTone = (key) => key === "corrected" ? "bg-cyan-400/15 text-cyan-200" : "bg-violet-400/15 text-violet-200";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("assessmentModuleTitle")} subtitle={t("assessmentModuleSub")} action={`${t("correctionStatus")}: ${correctionRate}%`} />
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("assessmentBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("assessmentBusinessFormSub")}</p>
              {!canManageAssessments ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingAssessmentId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetAssessmentForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedAssessment} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/30">{t("editSelectedAssessment")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("assessmentIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("assessmentTitle")}</span><input value={assessmentDraft.title} onChange={(event) => updateAssessmentDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("learners")}</span><select value={assessmentDraft.learnerName} onChange={(event) => {
                  const selectedLearner = learners.find((learner) => learner.name === event.target.value);
                  updateAssessmentDraft("learnerName", event.target.value);
                  if (selectedLearner) {
                    updateAssessmentDraft("subjectKey", selectedLearner.subjectKey || "german");
                    updateAssessmentDraft("level", selectedLearner.level || "A1");
                    updateAssessmentDraft("cohortNameKey", selectedLearner.cohortNameKey || "a1Morning");
                  }
                }} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{learners.map((learner) => <option key={learner.id} value={learner.name}>{learner.name} · {t(learner.subjectKey)} · {learner.level}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={assessmentDraft.subjectKey} onChange={(event) => updateAssessmentDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={assessmentDraft.cohortNameKey} onChange={(event) => updateAssessmentDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courses")}</span><select value={assessmentDraft.courseTitle} onChange={(event) => updateAssessmentDraft("courseTitle", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{courses.map((course) => <option key={course.id} value={course.title}>{course.title} · {t(course.subjectKey)} · {course.level}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("assessmentType")}</span><select value={assessmentDraft.typeKey} onChange={(event) => updateAssessmentDraft("typeKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="quiz">{t("quiz")}</option><option value="assignment">{t("assignment")}</option><option value="mockExam">{t("mockExam")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("attendanceDate")}</span><input type="date" value={assessmentDraft.date} onChange={(event) => updateAssessmentDraft("date", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("assessmentScoring")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("assessmentScore")}</span><input type="number" value={assessmentDraft.score} onChange={(event) => updateAssessmentDraft("score", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("maxScore")}</span><input type="number" value={assessmentDraft.maxScore} onChange={(event) => updateAssessmentDraft("maxScore", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("assessmentDecision")}</span><select value={assessmentDraft.decisionKey} onChange={(event) => updateAssessmentDraft("decisionKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.decisionKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("correctionStatus")}</span><select value={assessmentDraft.correctionKey} onChange={(event) => updateAssessmentDraft("correctionKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.correctionKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("assessmentNote")}</span><textarea value={assessmentDraft.note} onChange={(event) => updateAssessmentDraft("note", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageAssessments} onClick={saveAssessmentForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageAssessments ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveAssessment")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchAssessments")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="quiz">{t("quiz")}</option>
            <option value="assignment">{t("assignment")}</option>
            <option value="mockExam">{t("mockExam")}</option>
            <option value="passed">{t("passed")}</option>
            <option value="needsSupport">{t("needsSupport")}</option>
            <option value="notCorrected">{t("notCorrected")}</option>
          </select>
          <button disabled={!canManageAssessments} onClick={addDemoAssessment} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageAssessments ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoAssessment")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">{t("assessmentTitle")}</th>
                <th className="p-4">{t("learners")}</th>
                <th className="p-4">{t("assessmentType")}</th>
                <th className="p-4">{t("assessmentScore")}</th>
                <th className="p-4">{t("assessmentDecision")}</th>
                <th className="p-4">{t("correctionStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} onClick={() => setSelectedAssessmentId(item.id)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/10">
                  <td className="p-4"><p className="font-semibold text-white">{item.title}</p><p className="text-xs text-slate-500">{t(item.subjectKey)} · {t(item.cohortNameKey)}</p></td>
                  <td className="p-4 text-slate-300">{item.learnerName}</td>
                  <td className="p-4"><span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">{t(item.typeKey)}</span></td>
                  <td className="p-4"><p className="text-cyan-300">{item.score}/{item.maxScore}</p><div className="mt-2 h-2 w-24 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${clampNumber(safePercent(item.score, item.maxScore))}%` }} /></div></td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${decisionTone(item.decisionKey)}`}>{t(item.decisionKey)}</span></td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${correctionTone(item.correctionKey)}`}>{t(item.correctionKey)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("assessmentProfile")} subtitle={selectedAssessment ? t("selectedAssessment") : t("noAssessmentSelected")} />
        {selectedAssessment ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedAssessment.title}</p>
              <p className="mt-1 text-sm text-slate-400">{selectedAssessment.learnerName} · {t(selectedAssessment.subjectKey)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedAssessment.typeKey)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${decisionTone(selectedAssessment.decisionKey)}`}>{t(selectedAssessment.decisionKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("assessmentScore")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedAssessment.score}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("maxScore")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedAssessment.maxScore}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("courses")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedAssessment.courseTitle}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("assessmentNote")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedAssessment.note}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function LibraryModule({ t, courses = [], resources, setResources, selectedResourceId, setSelectedResourceId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManageLibrary = canRolePerform(currentUser, "edit", "library");
  const emptyResourceDraft = {
    title: "",
    subjectKey: "german",
    level: "A1",
    typeKey: "pdf",
    owner: "Admin",
    visibilityKey: "studentsOnly",
    size: "0 KB",
    downloads: 0,
    courseTitle: "Alphabet und Begrüßung",
    description: "",
    fileName: "",
    fileUrl: ""
  };
  const [resourceDraft, setResourceDraft] = useState(emptyResourceDraft);
  const [editingResourceId, setEditingResourceId] = useState(null);

  function updateResourceDraft(key, value) {
    setResourceDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetResourceForm() {
    setResourceDraft(emptyResourceDraft);
    setEditingResourceId(null);
  }

  function editSelectedResource() {
    if (!canManageLibrary) return;
    const resource = resources.find((item) => item.id === selectedResourceId);
    if (!resource) return;
    setEditingResourceId(resource.id);
    setResourceDraft({
      title: resource.title || "",
      subjectKey: resource.subjectKey || "german",
      level: resource.level || "A1",
      typeKey: resource.typeKey || "pdf",
      owner: resource.owner || "Admin",
      visibilityKey: resource.visibilityKey || "studentsOnly",
      size: resource.size || "0 KB",
      downloads: resource.downloads || 0,
      courseTitle: resource.courseTitle || "",
      description: resource.description || "",
      fileName: resource.fileName || "",
      fileUrl: resource.fileUrl || ""
    });
  }

  function saveResourceForm() {
    if (!canManageLibrary) return;
    const normalizedResource = {
      ...resourceDraft,
      title: resourceDraft.title.trim() || `${t("demoResourceTitle")} ${resources.length + 1}`,
      downloads: Math.max(0, Number(resourceDraft.downloads) || 0),
      courseTitle: resourceDraft.courseTitle || t("toAssign"),
      description: resourceDraft.description.trim() || t("demoResourceTitle"),
      fileName: resourceDraft.fileName.trim(),
      fileUrl: resourceDraft.fileUrl.trim()
    };

    if (editingResourceId) {
      setResources((previous) => previous.map((item) => item.id === editingResourceId ? { ...item, ...normalizedResource } : item));
      setSelectedResourceId(editingResourceId);
    } else {
      const newResource = {
        id: `RES-${String(resources.length + 1).padStart(3, "0")}`,
        ...normalizedResource
      };
      setResources((previous) => [newResource, ...previous]);
      setSelectedResourceId(newResource.id);
    }
    resetResourceForm();
  }

  const rows = useMemo(() => resources.filter((resource) => {
    const haystack = `${resource.title} ${t(resource.subjectKey)} ${resource.level} ${t(resource.typeKey)} ${resource.owner} ${t(resource.visibilityKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || resource.typeKey === filter || resource.subjectKey === filter;
    return matchesSearch && matchesFilter;
  }), [resources, query, filter, t]);

  const selectedResource = resources.find((resource) => resource.id === selectedResourceId) || rows[0] || null;

  function addDemoResource() {
    if (!canManageLibrary) return;
    const nextIndex = resources.length + 1;
    const typeKey = ["pdf", "audio", "video", "document", "promptBank", "template"].includes(filter) ? filter : "pdf";
    const newResource = {
      id: `RES-${String(nextIndex).padStart(3, "0")}`,
      title: `${t("demoResourceTitle")} ${nextIndex}`,
      subjectKey: filter === "german" || filter === "english" || filter === "computer" || filter === "artificialIntelligence" ? filter : "german",
      level: "A1",
      typeKey,
      owner: "Admin",
      visibilityKey: "internalOnly",
      size: "0 KB",
      downloads: 0,
      courseTitle: t("toAssign"),
      description: t("demoResourceTitle"),
      fileName: `demo-resource-${nextIndex}.pdf`,
      fileUrl: `https://example.com/resources/demo-resource-${nextIndex}.pdf`
    };
    setResources((previousResources) => [newResource, ...previousResources]);
    setSelectedResourceId(newResource.id);
  }

  const typeTone = (key) => {
    if (key === "pdf") return "bg-rose-400/15 text-rose-200";
    if (key === "audio") return "bg-cyan-400/15 text-cyan-200";
    if (key === "video") return "bg-violet-400/15 text-violet-200";
    if (key === "promptBank") return "bg-emerald-400/15 text-emerald-200";
    return "bg-orange-400/15 text-orange-200";
  };

  function incrementResourceDownload(resourceId) {
    setResources((previous) => previous.map((item) => item.id === resourceId ? { ...item, downloads: (Number(item.downloads) || 0) + 1 } : item));
  }

  function openSelectedResource() {
    if (!isSafeExternalUrl(selectedResource?.fileUrl)) return;
    secureOpenExternalUrl(selectedResource.fileUrl);
  }

  function downloadSelectedResource() {
    if (!selectedResource?.id) return;
    incrementResourceDownload(selectedResource.id);
    if (isSafeExternalUrl(selectedResource.fileUrl)) secureOpenExternalUrl(selectedResource.fileUrl);
  }

  function copySelectedResourceLink() {
    if (!selectedResource?.fileUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(selectedResource.fileUrl).catch(() => {});
      }
    } catch (error) {
      // Clipboard access can be blocked in preview sandboxes.
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("libraryModuleTitle")} subtitle={t("libraryModuleSub")} action={`${resources.length} ${t("library")}`} />
        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("libraryBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-cyan-100/80">{t("libraryBusinessFormSub")}</p>
              {!canManageLibrary ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100">{editingResourceId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetResourceForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedResource} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/30">{t("editSelectedResource")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("resourceIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("resourceTitle")}</span><input value={resourceDraft.title} onChange={(event) => updateResourceDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={resourceDraft.subjectKey} onChange={(event) => updateResourceDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select value={resourceDraft.level} onChange={(event) => updateResourceDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceType")}</span><select value={resourceDraft.typeKey} onChange={(event) => updateResourceDraft("typeKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="pdf">{t("pdf")}</option><option value="audio">{t("audio")}</option><option value="video">{t("video")}</option><option value="document">{t("document")}</option><option value="promptBank">{t("promptBank")}</option><option value="template">{t("template")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceOwner")}</span><select value={resourceDraft.owner} onChange={(event) => updateResourceDraft("owner", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.owner.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("resourceAccess")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceVisibility")}</span><select value={resourceDraft.visibilityKey} onChange={(event) => updateResourceDraft("visibilityKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.visibilityKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceSize")}</span><input value={resourceDraft.size} onChange={(event) => updateResourceDraft("size", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceDownloads")}</span><input type="number" value={resourceDraft.downloads} onChange={(event) => updateResourceDraft("downloads", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceLinkedCourse")}</span><select value={resourceDraft.courseTitle} onChange={(event) => updateResourceDraft("courseTitle", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{courses.map((course) => <option key={course.id} value={course.title}>{course.title} · {t(course.subjectKey)} · {course.level}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceFileName")}</span><input value={resourceDraft.fileName} onChange={(event) => updateResourceDraft("fileName", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceFileUrl")}</span><input value={resourceDraft.fileUrl} onChange={(event) => updateResourceDraft("fileUrl", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("resourceDescription")}</span><textarea value={resourceDraft.description} onChange={(event) => updateResourceDraft("description", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageLibrary} onClick={saveResourceForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageLibrary ? "bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 text-white shadow-cyan-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveResource")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchLibrary")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
            <option value="pdf">{t("pdf")}</option>
            <option value="audio">{t("audio")}</option>
            <option value="video">{t("video")}</option>
            <option value="document">{t("document")}</option>
            <option value="promptBank">{t("promptBank")}</option>
            <option value="template">{t("template")}</option>
          </select>
          <button disabled={!canManageLibrary} onClick={addDemoResource} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageLibrary ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoResource")}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((resource) => (
            <button key={resource.id} onClick={() => setSelectedResourceId(resource.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{resource.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{t(resource.subjectKey)} · {resource.level}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${typeTone(resource.typeKey)}`}>{t(resource.typeKey)}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{resource.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300">
                <p>{t("resourceOwner")}: {resource.owner}</p>
                <p>{t("resourceSize")}: {resource.size}</p>
                <p>{t("resourceDownloads")}: {resource.downloads}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("resourceProfile")} subtitle={selectedResource ? t("selectedResource") : t("noResourceSelected")} />
        {selectedResource ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedResource.title}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedResource.subjectKey)} · {selectedResource.level}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${typeTone(selectedResource.typeKey)}`}>{t(selectedResource.typeKey)}</span>
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedResource.visibilityKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceSize")}</p><p className="mt-2 text-xl font-semibold text-white">{selectedResource.size}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceDownloads")}</p><p className="mt-2 text-2xl font-semibold text-cyan-300">{selectedResource.downloads}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceOwner")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedResource.owner}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceVisibility")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{t(selectedResource.visibilityKey)}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceLinkedCourse")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedResource.courseTitle}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceDescription")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedResource.description}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceFileAccess")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedResource.fileName || t("noFileAttached")}</p><p className="mt-1 truncate text-xs text-slate-400">{selectedResource.fileUrl || t("noFileAttached")}</p></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button disabled={!selectedResource.fileUrl} onClick={openSelectedResource} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedResource.fileUrl ? "bg-cyan-500/20 text-cyan-100 hover:-translate-y-1 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("openResource")}</button>
              <button disabled={!selectedResource.fileUrl} onClick={downloadSelectedResource} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedResource.fileUrl ? "bg-violet-500/20 text-violet-100 hover:-translate-y-1 hover:bg-violet-500/30" : "bg-white/5 text-slate-500")}>{t("downloadResource")}</button>
              <button disabled={!selectedResource.fileUrl} onClick={copySelectedResourceLink} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedResource.fileUrl ? "bg-orange-500/20 text-orange-100 hover:-translate-y-1 hover:bg-orange-500/30" : "bg-white/5 text-slate-500")}>{t("copyResourceLink")}</button>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function PaymentModule({ t, payments, setPayments, selectedPaymentId, setSelectedPaymentId, currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canManagePayments = canRolePerform(currentUser, "edit", "payments");
  const [documentPreview, setDocumentPreview] = useState(null);

  function exportPaymentsCsv() {
    downloadCsv("payments.csv", payments.map((payment) => ({
      id: payment.id,
      receipt: payment.receipt,
      learner: payment.learnerName,
      subject: t(payment.subjectKey),
      cohort: t(payment.cohortNameKey),
      level: payment.level,
      totalFees: payment.totalFees,
      amountPaid: payment.amountPaid,
      amountDue: payment.amountDue,
      method: t(payment.methodKey),
      status: t(payment.statusKey),
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      note: payment.note
    })));
  }

  function paymentReceiptHtml(payment) {
    return `<div class="document"><div class="header"><div><div class="brand">LMS Center</div><div class="muted">${escapeHtml(t("tagline"))}</div></div><div><div class="title">${escapeHtml(t("receiptTitle"))}</div><div class="muted">${escapeHtml(t("receiptNumber"))}: ${escapeHtml(payment.receipt)}</div></div></div><div class="grid"><div class="box"><div class="label">${escapeHtml(t("learners"))}</div><div class="value">${escapeHtml(payment.learnerName)}</div></div><div class="box"><div class="label">${escapeHtml(t("paymentReference"))}</div><div class="value">${escapeHtml(payment.id)}</div></div><div class="box"><div class="label">${escapeHtml(t("subject"))}</div><div class="value">${escapeHtml(t(payment.subjectKey))} · ${escapeHtml(payment.level)}</div></div><div class="box"><div class="label">${escapeHtml(t("cohort"))}</div><div class="value">${escapeHtml(t(payment.cohortNameKey))}</div></div><div class="box"><div class="label">${escapeHtml(t("totalFees"))}</div><div class="value">${escapeHtml(formatMoney(payment.totalFees))}</div></div><div class="box"><div class="label">${escapeHtml(t("amountPaid"))}</div><div class="value">${escapeHtml(formatMoney(payment.amountPaid))}</div></div><div class="box"><div class="label">${escapeHtml(t("amountDue"))}</div><div class="value">${escapeHtml(formatMoney(payment.amountDue))}</div></div><div class="box"><div class="label">${escapeHtml(t("paymentMethod"))}</div><div class="value">${escapeHtml(t(payment.methodKey))}</div></div><div class="box"><div class="label">${escapeHtml(t("paymentDate"))}</div><div class="value">${escapeHtml(payment.paymentDate)}</div></div><div class="box"><div class="label">${escapeHtml(t("paymentStatus"))}</div><div class="value">${escapeHtml(t(payment.statusKey))}</div></div></div><div class="box" style="margin-top:14px"><div class="label">${escapeHtml(t("paymentNote"))}</div><div class="summary">${escapeHtml(payment.note || "—")}</div></div><div class="footer">${escapeHtml(t("receiptIssuedBy"))}: LMS Center · ${escapeHtml(t("receiptFooter"))}</div></div>`;
  }

  function paymentReceiptPdfSections(payment) {
    return [
      {
        heading: t("receiptTitle"),
        rows: [
          { label: t("receiptNumber"), value: payment.receipt },
          { label: t("learners"), value: payment.learnerName },
          { label: t("paymentReference"), value: payment.id },
          { label: t("subject"), value: `${t(payment.subjectKey)} · ${payment.level}` },
          { label: t("cohort"), value: t(payment.cohortNameKey) },
          { label: t("totalFees"), value: formatMoney(payment.totalFees) },
          { label: t("amountPaid"), value: formatMoney(payment.amountPaid) },
          { label: t("amountDue"), value: formatMoney(payment.amountDue) },
          { label: t("paymentMethod"), value: t(payment.methodKey) },
          { label: t("paymentDate"), value: payment.paymentDate },
          { label: t("paymentStatus"), value: t(payment.statusKey) },
          { label: t("paymentNote"), value: payment.note || "—" }
        ]
      },
      { heading: t("receiptIssuedBy"), rows: [{ label: "", value: `LMS Center · ${t("receiptFooter")}` }] }
    ];
  }

  function openPaymentReceiptPreview(payment) {
    if (!payment) return;
    setDocumentPreview({
      title: t("receiptTitle"),
      html: paymentReceiptHtml(payment),
      filename: `${payment.receipt || payment.id || "receipt"}.html`,
      pdfFilename: `${payment.receipt || payment.id || "receipt"}.pdf`,
      pdfSections: paymentReceiptPdfSections(payment),
      csvFilename: `${payment.receipt || payment.id || "receipt"}.csv`,
      csvRows: [{
        id: payment.id,
        receipt: payment.receipt,
        learner: payment.learnerName,
        subject: t(payment.subjectKey),
        cohort: t(payment.cohortNameKey),
        level: payment.level,
        totalFees: payment.totalFees,
        amountPaid: payment.amountPaid,
        amountDue: payment.amountDue,
        method: t(payment.methodKey),
        status: t(payment.statusKey),
        paymentDate: payment.paymentDate,
        dueDate: payment.dueDate,
        note: payment.note
      }]
    });
  }

  function printPaymentReceipt(payment) {
    if (!payment) return;
    openPaymentReceiptPreview(payment);
    setTimeout(() => printDocument(t("receiptTitle"), paymentReceiptHtml(payment)), 150);
  }

  function exportPaymentReceiptPdf(payment) {
    if (!payment) return;
    openPaymentReceiptPreview(payment);
  }
  const emptyPaymentDraft = {
    learnerName: "Koffi Mensah",
    subjectKey: "german",
    cohortNameKey: "a1Morning",
    level: "A1",
    totalFees: 50000,
    amountPaid: 25000,
    amountDue: 25000,
    methodKey: "mobileMoney",
    statusKey: "partial",
    paymentDate: "2026-05-22",
    dueDate: "2026-06-22",
    receipt: "RC-0000",
    note: ""
  };
  const [paymentDraft, setPaymentDraft] = useState(emptyPaymentDraft);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  function updatePaymentDraft(key, value) {
    setPaymentDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetPaymentForm() {
    setPaymentDraft(emptyPaymentDraft);
    setEditingPaymentId(null);
  }

  function editSelectedPayment() {
    if (!canManagePayments) return;
    const payment = payments.find((item) => item.id === selectedPaymentId);
    if (!payment) return;
    setEditingPaymentId(payment.id);
    setPaymentDraft({
      learnerName: payment.learnerName || "",
      subjectKey: payment.subjectKey || "german",
      cohortNameKey: payment.cohortNameKey || "a1Morning",
      level: payment.level || "A1",
      totalFees: payment.totalFees || 0,
      amountPaid: payment.amountPaid || 0,
      amountDue: payment.amountDue || 0,
      methodKey: payment.methodKey || "mobileMoney",
      statusKey: payment.statusKey || "partial",
      paymentDate: payment.paymentDate || "",
      dueDate: payment.dueDate || "",
      receipt: payment.receipt || "",
      note: payment.note || ""
    });
  }

  function savePaymentForm() {
    if (!canManagePayments) return;
    const totalFees = Math.max(0, Number(paymentDraft.totalFees) || 0);
    const amountPaid = Math.max(0, Number(paymentDraft.amountPaid) || 0);
    const amountDue = Math.max(0, Number(paymentDraft.amountDue) || Math.max(0, totalFees - amountPaid));
    const normalizedPayment = {
      ...paymentDraft,
      totalFees,
      amountPaid,
      amountDue,
      receipt: paymentDraft.receipt || `RC-${String(payments.length + 1).padStart(4, "0")}`
    };

    if (editingPaymentId) {
      setPayments((previous) => previous.map((item) => item.id === editingPaymentId ? { ...item, ...normalizedPayment } : item));
      setSelectedPaymentId(editingPaymentId);
    } else {
      const newPayment = {
        id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
        ...normalizedPayment
      };
      setPayments((previous) => [newPayment, ...previous]);
      setSelectedPaymentId(newPayment.id);
    }
    resetPaymentForm();
  }

  const rows = useMemo(() => payments.filter((payment) => {
    const haystack = `${payment.id} ${payment.learnerName} ${t(payment.subjectKey)} ${t(payment.cohortNameKey)} ${t(payment.statusKey)} ${t(payment.methodKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || payment.statusKey === filter || payment.subjectKey === filter || payment.methodKey === filter;
    return matchesSearch && matchesFilter;
  }), [payments, query, filter, t]);

  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) || rows[0] || null;
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const totalDue = payments.reduce((sum, payment) => sum + payment.amountDue, 0);

  function addDemoPayment() {
    if (!canManagePayments) return;
    const nextIndex = payments.length + 1;
    const subjectKey = ["german", "english", "computer", "artificialIntelligence"].includes(filter) ? filter : "german";
    const statusKey = ["received", "partial", "overdue", "waived"].includes(filter) ? filter : "partial";
    const newPayment = {
      id: `PAY-${String(nextIndex).padStart(3, "0")}`,
      learnerName: `${t("demoLearnerName")} ${nextIndex}`,
      subjectKey,
      cohortNameKey: subjectKey === "computer" ? "itIntro" : subjectKey === "artificialIntelligence" ? "ai" : subjectKey === "english" ? "demoCohortName" : "a1Morning",
      level: subjectKey === "english" ? "Beginner" : subjectKey === "computer" || subjectKey === "artificialIntelligence" ? "Intro" : "A1",
      totalFees: 50000,
      amountPaid: statusKey === "received" ? 50000 : 25000,
      amountDue: statusKey === "received" ? 0 : 25000,
      methodKey: "mobileMoney",
      statusKey,
      paymentDate: "2026-05-22",
      dueDate: "2026-06-22",
      receipt: `RC-${String(nextIndex).padStart(4, "0")}`,
      note: t("demoPaymentNote")
    };
    setPayments((previousPayments) => [newPayment, ...previousPayments]);
    setSelectedPaymentId(newPayment.id);
  }

  const statusTone = (key) => {
    if (key === "received") return "bg-emerald-400/15 text-emerald-200";
    if (key === "partial") return "bg-cyan-400/15 text-cyan-200";
    if (key === "overdue") return "bg-rose-400/15 text-rose-200";
    return "bg-violet-400/15 text-violet-200";
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("paymentModuleTitle")} subtitle={t("paymentModuleSub")} action={`${t("collected")}: ${formatMoney(totalCollected)}`} />
        <PrintableDocumentPanel t={t} preview={documentPreview} onClose={() => setDocumentPreview(null)} />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("exportTools")}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{t("exportToolsSub")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportPaymentsCsv} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("exportPaymentsCsv")}</button>
              <button disabled={!selectedPayment} onClick={() => printPaymentReceipt(selectedPayment)} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedPayment ? "bg-violet-500/20 text-violet-100 hover:-translate-y-1 hover:bg-violet-500/30" : "bg-white/5 text-slate-500")}>{t("printReceipt")}</button>
              <button disabled={!selectedPayment} onClick={() => exportPaymentReceiptPdf(selectedPayment)} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedPayment ? "bg-orange-500/20 text-orange-100 hover:-translate-y-1 hover:bg-orange-500/30" : "bg-white/5 text-slate-500")}>{t("exportReceiptPdf")}</button>
            </div>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("paymentBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-emerald-100/80">{t("paymentBusinessFormSub")}</p>
              {!canManagePayments ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-100">{editingPaymentId ? t("updateMode") : t("createMode")}</span>
              <button onClick={resetPaymentForm} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20">{t("newLearnerForm")}</button>
              <button onClick={editSelectedPayment} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/30">{t("editSelectedPayment")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{t("paymentIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("learners")}</span><input value={paymentDraft.learnerName} onChange={(event) => updatePaymentDraft("learnerName", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select value={paymentDraft.subjectKey} onChange={(event) => updatePaymentDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select value={paymentDraft.cohortNameKey} onChange={(event) => updatePaymentDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select value={paymentDraft.level} onChange={(event) => updatePaymentDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("paymentMethod")}</span><select value={paymentDraft.methodKey} onChange={(event) => updatePaymentDraft("methodKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.methodKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("paymentStatus")}</span><select value={paymentDraft.statusKey} onChange={(event) => updatePaymentDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="received">{t("received")}</option><option value="partial">{t("partial")}</option><option value="overdue">{t("overdue")}</option><option value="waived">{t("waived")}</option></select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("paymentAmounts")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("totalFees")}</span><input type="number" value={paymentDraft.totalFees} onChange={(event) => updatePaymentDraft("totalFees", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("amountPaid")}</span><input type="number" value={paymentDraft.amountPaid} onChange={(event) => updatePaymentDraft("amountPaid", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("amountDue")}</span><input type="number" value={paymentDraft.amountDue} onChange={(event) => updatePaymentDraft("amountDue", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("receiptNumber")}</span><input value={paymentDraft.receipt} onChange={(event) => updatePaymentDraft("receipt", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("paymentDate")}</span><input type="date" value={paymentDraft.paymentDate} onChange={(event) => updatePaymentDraft("paymentDate", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("dueDate")}</span><input type="date" value={paymentDraft.dueDate} onChange={(event) => updatePaymentDraft("dueDate", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("paymentNote")}</span><textarea value={paymentDraft.note} onChange={(event) => updatePaymentDraft("note", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManagePayments} onClick={savePaymentForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManagePayments ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-600 text-white shadow-emerald-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("savePayment")}</button>
        </div>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("amountPaid")}</p><p className="mt-2 text-2xl font-semibold text-cyan-300">{formatMoney(totalCollected)}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("amountDue")}</p><p className="mt-2 text-2xl font-semibold text-orange-300">{formatMoney(totalDue)}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("payments")}</p><p className="mt-2 text-2xl font-semibold text-white">{payments.length}</p></div>
        </div>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPayments")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
            <option value="received">{t("received")}</option>
            <option value="partial">{t("partial")}</option>
            <option value="overdue">{t("overdue")}</option>
            <option value="mobileMoney">{t("mobileMoney")}</option>
            <option value="cash">{t("cash")}</option>
            <option value="bankTransfer">{t("bankTransfer")}</option>
          </select>
          <button disabled={!canManagePayments} onClick={addDemoPayment} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManagePayments ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>
            {t("addDemoPayment")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">{t("paymentReference")}</th>
                <th className="p-4">{t("learners")}</th>
                <th className="p-4">{t("subject")}</th>
                <th className="p-4">{t("amountPaid")}</th>
                <th className="p-4">{t("amountDue")}</th>
                <th className="p-4">{t("paymentStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((payment) => (
                <tr key={payment.id} onClick={() => setSelectedPaymentId(payment.id)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/10">
                  <td className="p-4"><p className="font-semibold text-white">{payment.id}</p><p className="text-xs text-slate-500">{payment.receipt}</p></td>
                  <td className="p-4"><p className="text-slate-300">{payment.learnerName}</p><p className="text-xs text-slate-500">{t(payment.cohortNameKey)} · {payment.level}</p></td>
                  <td className="p-4 text-slate-300">{t(payment.subjectKey)}</td>
                  <td className="p-4 text-cyan-300">{formatMoney(payment.amountPaid)}</td>
                  <td className="p-4 text-orange-300">{formatMoney(payment.amountDue)}</td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${statusTone(payment.statusKey)}`}>{t(payment.statusKey)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("paymentProfile")} subtitle={selectedPayment ? t("selectedPayment") : t("noPaymentSelected")} />
        {selectedPayment ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedPayment.learnerName}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedPayment.subjectKey)} · {t(selectedPayment.cohortNameKey)} · {selectedPayment.level}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedPayment.statusKey)}`}>{t(selectedPayment.statusKey)}</span>
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedPayment.methodKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("totalFees")}</p><p className="mt-2 text-xl font-semibold text-white">{formatMoney(selectedPayment.totalFees)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("amountPaid")}</p><p className="mt-2 text-xl font-semibold text-cyan-300">{formatMoney(selectedPayment.amountPaid)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("amountDue")}</p><p className="mt-2 text-xl font-semibold text-orange-300">{formatMoney(selectedPayment.amountDue)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("receiptNumber")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedPayment.receipt}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("paymentDate")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedPayment.paymentDate}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("dueDate")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedPayment.dueDate}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("paymentNote")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedPayment.note}</p></div>
            </div>
            <div className="grid gap-2">
              <button onClick={() => printPaymentReceipt(selectedPayment)} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("printReceipt")}</button>
              <button onClick={() => exportPaymentReceiptPdf(selectedPayment)} className="w-full rounded-2xl bg-orange-500/20 px-5 py-3 text-sm font-semibold text-orange-100 transition hover:-translate-y-1 hover:bg-orange-500/30">{t("exportReceiptPdf")}</button>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function ReportModule({ t, reports, setReports, selectedReportId, setSelectedReportId, learners = [], cohorts = [], courses = [], attendanceRows = [], assessments = [], payments = [], resources = [], aiRequests = [], preEnrollments = [], currentUser }) {
  const showFinance = canUserViewFinanceReports(currentUser);
  const canManageReports = canRolePerform(currentUser, "edit", "reports");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [documentPreview, setDocumentPreview] = useState(null);

  function exportReportsCsv() {
    downloadCsv("reports.csv", reports.map((report) => ({
      id: report.id,
      title: getReportTitle(report, t),
      type: t(report.typeKey),
      period: t(report.periodKey),
      audience: t(report.audienceKey),
      owner: report.owner,
      status: t(report.statusKey),
      date: report.date,
      learners: report.metrics?.learners || 0,
      attendance: report.metrics?.attendance || 0,
      success: report.metrics?.success || 0,
      revenue: report.metrics?.revenue || 0,
      summary: getReportSummary(report, t)
    })));
  }

  function selectedReportHtml(report) {
    return `<div class="document"><div class="header"><div><div class="brand">LMS Center</div><div class="muted">${escapeHtml(t("tagline"))}</div></div><div><div class="title">${escapeHtml(getReportTitle(report, t))}</div><div class="muted">${escapeHtml(t(report.typeKey))} · ${escapeHtml(t(report.periodKey))} · ${escapeHtml(report.date)}</div></div></div><div class="grid"><div class="box"><div class="label">${escapeHtml(t("reportAudience"))}</div><div class="value">${escapeHtml(t(report.audienceKey))}</div></div><div class="box"><div class="label">${escapeHtml(t("reportOwner"))}</div><div class="value">${escapeHtml(report.owner)}</div></div><div class="box"><div class="label">${escapeHtml(t("learners"))}</div><div class="value">${escapeHtml(report.metrics?.learners || 0)}</div></div><div class="box"><div class="label">${escapeHtml(t("attendanceRate"))}</div><div class="value">${escapeHtml(report.metrics?.attendance || 0)}%</div></div><div class="box"><div class="label">${escapeHtml(t("successRate"))}</div><div class="value">${escapeHtml(report.metrics?.success || 0)}%</div></div><div class="box"><div class="label">${escapeHtml(t("revenue"))}</div><div class="value">${escapeHtml(formatMoney(report.metrics?.revenue || 0))}</div></div></div><div class="box" style="margin-top:14px"><div class="label">${escapeHtml(t("reportSummary"))}</div><div class="summary">${escapeHtml(getReportSummary(report, t) || "—")}</div></div><div class="footer">${escapeHtml(t("reportDocumentTitle"))} · LMS Center</div></div>`;
  }

  function reportPdfSections(report) {
    return [
      {
        heading: getReportTitle(report, t),
        rows: [
          { label: t("reportType"), value: t(report.typeKey) },
          { label: t("reportPeriod"), value: t(report.periodKey) },
          { label: t("reportAudience"), value: t(report.audienceKey) },
          { label: t("reportOwner"), value: report.owner },
          { label: t("reportDate"), value: report.date },
          { label: t("learners"), value: report.metrics?.learners || 0 },
          { label: t("attendanceRate"), value: `${report.metrics?.attendance || 0}%` },
          { label: t("successRate"), value: `${report.metrics?.success || 0}%` },
          { label: t("revenue"), value: formatMoney(report.metrics?.revenue || 0) },
          { label: t("reportSummary"), value: getReportSummary(report, t) || "—" }
        ]
      }
    ];
  }

  function openReportPreview(report) {
    if (!report) return;
    setDocumentPreview({
      title: t("reportDocumentTitle"),
      html: selectedReportHtml(report),
      filename: `${report.id || "report"}.html`,
      pdfFilename: `${report.id || "report"}.pdf`,
      pdfSections: reportPdfSections(report),
      csvFilename: `${report.id || "report"}.csv`,
      csvRows: [{
        id: report.id,
        title: getReportTitle(report, t),
        type: t(report.typeKey),
        period: t(report.periodKey),
        audience: t(report.audienceKey),
        owner: report.owner,
        status: t(report.statusKey),
        date: report.date,
        learners: report.metrics?.learners || 0,
        attendance: report.metrics?.attendance || 0,
        success: report.metrics?.success || 0,
        revenue: report.metrics?.revenue || 0,
        summary: getReportSummary(report, t)
      }]
    });
  }

  function printSelectedReport(report) {
    if (!report) return;
    openReportPreview(report);
    setTimeout(() => printDocument(t("reportDocumentTitle"), selectedReportHtml(report)), 150);
  }

  function exportSelectedReportPdf(report) {
    if (!report) return;
    openReportPreview(report);
  }
  const emptyReportDraft = {
    title: "",
    titleKey: "",
    typeKey: "academicReport",
    periodKey: "weekly",
    audienceKey: "director",
    owner: "Admin",
    statusKey: "generated",
    date: "2026-05-25",
    metrics: { learners: 0, attendance: 0, success: 0, revenue: 0 },
    summary: "",
    summaryKey: ""
  };
  const [reportDraft, setReportDraft] = useState(emptyReportDraft);
  const [editingReportId, setEditingReportId] = useState(null);

  useEffect(() => {
    if (!reportDraft.summaryKey) return;
    setReportDraft((previous) => ({ ...previous, summary: t(previous.summaryKey) }));
  }, [t, reportDraft.summaryKey]);

  useEffect(() => {
    if (!reportDraft.titleKey) return;
    setReportDraft((previous) => ({ ...previous, title: t(previous.titleKey) }));
  }, [t, reportDraft.titleKey]);

  function updateReportDraft(key, value) {
    setReportDraft((previous) => ({ ...previous, [key]: value, ...(key === "summary" ? { summaryKey: "" } : {}), ...(key === "title" ? { titleKey: "" } : {}) }));
  }

  function updateReportMetric(key, value) {
    setReportDraft((previous) => ({ ...previous, metrics: { ...previous.metrics, [key]: value } }));
  }

  function resetReportForm() {
    setReportDraft(emptyReportDraft);
    setEditingReportId(null);
  }

  function editSelectedReport() {
    if (!canManageReports) return;
    const report = reports.find((item) => item.id === selectedReportId);
    if (!report) return;
    setEditingReportId(report.id);
    setReportDraft({
      title: getReportTitle(report, t) || "",
      titleKey: report.titleKey || "",
      typeKey: report.typeKey || "academicReport",
      periodKey: report.periodKey || "weekly",
      audienceKey: report.audienceKey || "director",
      owner: report.owner || "Admin",
      statusKey: report.statusKey || "generated",
      date: report.date || "2026-05-25",
      metrics: {
        learners: report.metrics?.learners || 0,
        attendance: report.metrics?.attendance || 0,
        success: report.metrics?.success || 0,
        revenue: report.metrics?.revenue || 0
      },
      summary: getReportSummary(report, t) || "",
      summaryKey: report.summaryKey || ""
    });
  }

  function saveReportForm() {
    if (!canManageReports) return;
    const normalizedReport = {
      ...reportDraft,
      title: reportDraft.title.trim() || `${t("demoReportTitle")} ${reports.length + 1}`,
      titleKey: reportDraft.titleKey || "",
      metrics: {
        learners: Math.max(0, Number(reportDraft.metrics.learners) || 0),
        attendance: clampNumber(reportDraft.metrics.attendance),
        success: clampNumber(reportDraft.metrics.success),
        revenue: Math.max(0, Number(reportDraft.metrics.revenue) || 0)
      },
      summary: reportDraft.summary.trim() || t("reportSummary"),
      summaryKey: reportDraft.summaryKey || ""
    };

    if (editingReportId) {
      setReports((previous) => previous.map((item) => item.id === editingReportId ? { ...item, ...normalizedReport } : item));
      setSelectedReportId(editingReportId);
    } else {
      const newReport = {
        id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
        ...normalizedReport
      };
      setReports((previous) => [newReport, ...previous]);
      setSelectedReportId(newReport.id);
    }
    resetReportForm();
  }

  const rows = useMemo(() => reports.filter((report) => {
    if (!showFinance && report.typeKey === "financeReport") return false;
    const haystack = `${getReportTitle(report, t)} ${getReportSummary(report, t)} ${t(report.typeKey)} ${t(report.periodKey)} ${t(report.audienceKey)} ${report.owner} ${t(report.statusKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || report.typeKey === filter || report.periodKey === filter || report.statusKey === filter;
    return matchesSearch && matchesFilter;
  }), [reports, query, filter, t, showFinance]);

  const selectedReport = reports.find((report) => report.id === selectedReportId) || rows[0] || null;
  const readyCount = reports.filter((report) => report.statusKey === "ready" || report.statusKey === "generated").length;
  const reportStats = useMemo(() => {
    const totalCollected = payments.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0);
    const totalDue = payments.reduce((sum, payment) => sum + (Number(payment.amountDue) || 0), 0);
    const presentRows = attendanceRows.filter((entry) => entry.statusKey === "present" || entry.statusKey === "late").length;
    const attendanceRateValue = safePercent(presentRows, attendanceRows.length);
    const passedAssessments = assessments.filter((item) => item.decisionKey === "passed").length;
    const successRateValue = safePercent(passedAssessments, assessments.length);
    return {
      learners: learners.length,
      cohorts: cohorts.length,
      courses: courses.length,
      collected: totalCollected,
      due: totalDue,
      attendance: attendanceRateValue,
      success: successRateValue,
      overduePayments: payments.filter((payment) => payment.statusKey === "overdue").length,
      uncorrectedAssessments: assessments.filter((item) => item.correctionKey === "notCorrected").length,
      resources: resources.length,
      pendingAi: aiRequests.filter((item) => item.statusKey === "waitingValidation").length,
      preEnrollments: preEnrollments.length
    };
  }, [learners, cohorts, courses, attendanceRows, assessments, payments, resources, aiRequests, preEnrollments]);

  const averageSuccess = reportStats.success;
  const averageAttendance = reportStats.attendance;

  function metricsFromPlatform(typeKey) {
    if (typeKey === "financeReport") return { learners: reportStats.learners, attendance: 0, success: 0, revenue: reportStats.collected };
    if (typeKey === "attendanceReport") return { learners: reportStats.learners, attendance: reportStats.attendance, success: 0, revenue: 0 };
    if (typeKey === "academicReport") return { learners: reportStats.learners, attendance: reportStats.attendance, success: reportStats.success, revenue: 0 };
    if (typeKey === "aiReport") return { learners: reportStats.pendingAi, attendance: 0, success: 0, revenue: 0 };
    if (typeKey === "qualityReport") return { learners: reportStats.uncorrectedAssessments, attendance: reportStats.attendance, success: reportStats.success, revenue: 0 };
    return { learners: reportStats.learners, attendance: reportStats.attendance, success: reportStats.success, revenue: reportStats.collected };
  }

  function addDemoReport() {
    if (!canManageReports) return;
    const nextIndex = reports.length + 1;
    const typeKey = ["globalReport", "academicReport", "financeReport", "attendanceReport", "qualityReport", "aiReport"].includes(filter) ? filter : "globalReport";
    const newReport = {
      id: `RPT-${String(nextIndex).padStart(3, "0")}`,
      title: `${t("demoReportTitle")} ${nextIndex}`,
      typeKey,
      periodKey: "weekly",
      audienceKey: "director",
      owner: "Admin",
      statusKey: "generated",
      date: "2026-05-25",
      metrics: metricsFromPlatform(typeKey),
      summary: t("demoReportTitle"),
      summaryKey: ""
    };
    setReports((previousReports) => [newReport, ...previousReports]);
    setSelectedReportId(newReport.id);
  }

  function generateReportFromType() {
    if (!canManageReports) return;
    setReportDraft((previous) => {
      const summaryKey = REPORT_GENERATED_SUMMARY_KEYS[previous.typeKey] || "reportSummary";
      return {
        ...previous,
        title: previous.titleKey ? t(previous.titleKey) : (previous.title || `${t(previous.typeKey)} · ${t(previous.periodKey)}`),
        titleKey: previous.titleKey || "",
        statusKey: "generated",
        metrics: metricsFromPlatform(previous.typeKey),
        summaryKey,
        summary: t(summaryKey)
      };
    });
  }

  function autofillReportFromPlatform() {
    if (!canManageReports) return;
    setReportDraft((previous) => ({
      ...previous,
      metrics: metricsFromPlatform(previous.typeKey),
      statusKey: "generated"
    }));
  }

  const statusTone = (key) => {
    if (key === "ready") return "bg-emerald-400/15 text-emerald-200";
    if (key === "generated") return "bg-cyan-400/15 text-cyan-200";
    return "bg-orange-400/15 text-orange-200";
  };

  const typeTone = (key) => {
    if (key === "globalReport") return "bg-white/10 text-white";
    if (key === "financeReport") return "bg-cyan-400/15 text-cyan-200";
    if (key === "attendanceReport") return "bg-emerald-400/15 text-emerald-200";
    if (key === "qualityReport") return "bg-orange-400/15 text-orange-200";
    if (key === "aiReport") return "bg-violet-400/15 text-violet-200";
    return "bg-rose-400/15 text-rose-200";
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("reportModuleTitle")} subtitle={t("reportModuleSub")} action={`${t("generatedReports")}: ${readyCount}/${reports.length}`} />
        <PrintableDocumentPanel t={t} preview={documentPreview} onClose={() => setDocumentPreview(null)} />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("exportTools")}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{t("exportToolsSub")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportReportsCsv} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("exportReportsCsv")}</button>
              <button disabled={!selectedReport} onClick={() => printSelectedReport(selectedReport)} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedReport ? "bg-violet-500/20 text-violet-100 hover:-translate-y-1 hover:bg-violet-500/30" : "bg-white/5 text-slate-500")}>{t("printReport")}</button>
              <button disabled={!selectedReport} onClick={() => exportSelectedReportPdf(selectedReport)} className={cn("rounded-2xl px-4 py-3 text-xs font-semibold transition", selectedReport ? "bg-orange-500/20 text-orange-100 hover:-translate-y-1 hover:bg-orange-500/30" : "bg-white/5 text-slate-500")}>{t("exportReportPdf")}</button>
            </div>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("reportBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("reportBusinessFormSub")}</p>
              {!canManageReports ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingReportId ? t("updateMode") : t("createMode")}</span>
              <button disabled={!canManageReports} onClick={resetReportForm} className={cn("rounded-full px-3 py-1 text-xs transition", canManageReports ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button>
              <button disabled={!canManageReports} onClick={editSelectedReport} className={cn("rounded-full px-3 py-1 text-xs transition", canManageReports ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedReport")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("reportIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("reportTitle")}</span><input disabled={!canManageReports} value={reportDraft.title} onChange={(event) => updateReportDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportType")}</span><select value={reportDraft.typeKey} onChange={(event) => updateReportDraft("typeKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="globalReport">{t("globalReport")}</option><option value="academicReport">{t("academicReport")}</option>{showFinance ? <option value="financeReport">{t("financeReport")}</option> : null}<option value="attendanceReport">{t("attendanceReport")}</option><option value="qualityReport">{t("qualityReport")}</option><option value="aiReport">{t("aiReport")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportPeriod")}</span><select value={reportDraft.periodKey} onChange={(event) => updateReportDraft("periodKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.periodKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportAudience")}</span><select value={reportDraft.audienceKey} onChange={(event) => updateReportDraft("audienceKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.audienceKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportOwner")}</span><select value={reportDraft.owner} onChange={(event) => updateReportDraft("owner", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.owner.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportStatus")}</span><select value={reportDraft.statusKey} onChange={(event) => updateReportDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none"><option value="generated">{t("generated")}</option><option value="ready">{t("ready")}</option><option value="inReview">{t("inReview")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportDate")}</span><input type="date" value={reportDraft.date} onChange={(event) => updateReportDraft("date", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("reportIndicators")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportLearnersCount")}</span><input type="number" value={reportDraft.metrics.learners} onChange={(event) => updateReportMetric("learners", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("attendanceRate")}</span><input type="number" value={reportDraft.metrics.attendance} onChange={(event) => updateReportMetric("attendance", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("successRate")}</span><input type="number" value={reportDraft.metrics.success} onChange={(event) => updateReportMetric("success", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
                {showFinance ? <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportRevenueAmount")}</span><input type="number" value={reportDraft.metrics.revenue} onChange={(event) => updateReportMetric("revenue", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label> : null}
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("reportSummary")}</span><textarea value={reportDraft.summary} onChange={(event) => updateReportDraft("summary", event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr]">
            <button disabled={!canManageReports} onClick={generateReportFromType} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold transition", canManageReports ? "bg-cyan-500/20 text-cyan-100 hover:-translate-y-1 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("generateReport")}</button>
            <button disabled={!canManageReports} onClick={autofillReportFromPlatform} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold transition", canManageReports ? "bg-white/10 text-white hover:-translate-y-1 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("autofillFromPlatform")}</button>
            <button disabled={!canManageReports} onClick={saveReportForm} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition sm:col-span-2", canManageReports ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-orange-500 text-white shadow-violet-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveReport")}</button>
          </div>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("generatedReports")}</p><p className="mt-2 text-2xl font-semibold text-white">{reports.length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("ready")}</p><p className="mt-2 text-2xl font-semibold text-cyan-300">{readyCount}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("attendanceRate")}</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{averageAttendance}%</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("successRate")}</p><p className="mt-2 text-2xl font-semibold text-orange-300">{averageSuccess}%</p></div>
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{t("autoReportStats")}</h3>
              <p className="mt-1 text-xs leading-5 text-cyan-100/80">{t("reportModuleSub")}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("activeLearners")}</p><p className="mt-2 text-xl font-semibold text-white">{reportStats.learners}</p></div>
            {showFinance ? <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("collected")}</p><p className="mt-2 text-xl font-semibold text-cyan-300">{formatMoney(reportStats.collected)}</p></div> : null}
            {showFinance ? <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("unpaidBalance")}</p><p className="mt-2 text-xl font-semibold text-orange-300">{formatMoney(reportStats.due)}</p></div> : null}
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("preEnrollmentCount")}</p><p className="mt-2 text-xl font-semibold text-violet-200">{reportStats.preEnrollments}</p></div>
            {showFinance ? <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("overduePaymentsCount")}</p><p className="mt-2 text-xl font-semibold text-rose-200">{reportStats.overduePayments}</p></div> : null}
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("uncorrectedAssessmentsCount")}</p><p className="mt-2 text-xl font-semibold text-orange-200">{reportStats.uncorrectedAssessments}</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("pendingAiCount")}</p><p className="mt-2 text-xl font-semibold text-cyan-200">{reportStats.pendingAi}</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">{t("publishedResourcesCount")}</p><p className="mt-2 text-xl font-semibold text-emerald-200">{reportStats.resources}</p></div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchReports")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="globalReport">{t("globalReport")}</option>
            <option value="academicReport">{t("academicReport")}</option>
            <option value="financeReport">{t("financeReport")}</option>
            <option value="attendanceReport">{t("attendanceReport")}</option>
            <option value="qualityReport">{t("qualityReport")}</option>
            <option value="aiReport">{t("aiReport")}</option>
            <option value="weekly">{t("weekly")}</option>
            <option value="monthly">{t("monthly")}</option>
            <option value="ready">{t("ready")}</option>
            <option value="generated">{t("generated")}</option>
            <option value="inReview">{t("inReview")}</option>
          </select>
          <button disabled={!canManageReports} onClick={addDemoReport} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageReports ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoReport")}</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((report) => (
            <button key={report.id} onClick={() => setSelectedReportId(report.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{getReportTitle(report, t)}</h3>
                  <p className="mt-1 text-xs text-slate-400">{t(report.periodKey)} · {report.date}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${typeTone(report.typeKey)}`}>{t(report.typeKey)}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{getReportSummary(report, t)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(report.statusKey)}`}>{t(report.statusKey)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{t(report.audienceKey)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{report.owner}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("reportProfile")} subtitle={selectedReport ? t("selectedReport") : t("noReportSelected")} />
        {selectedReport ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{getReportTitle(selectedReport, t)}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedReport.typeKey)} · {t(selectedReport.periodKey)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedReport.statusKey)}`}>{t(selectedReport.statusKey)}</span>
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedReport.audienceKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("learners")}</p><p className="mt-2 text-2xl font-semibold text-white">{selectedReport.metrics.learners}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("attendanceRate")}</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{selectedReport.metrics.attendance}%</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("successRate")}</p><p className="mt-2 text-2xl font-semibold text-orange-300">{selectedReport.metrics.success}%</p></div>
              {showFinance ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("revenue")}</p><p className="mt-2 text-xl font-semibold text-cyan-300">{formatMoney(selectedReport.metrics.revenue)}</p></div> : null}
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("reportOwner")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedReport.owner}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("reportSummary")}</p><p className="mt-2 text-sm leading-6 text-white">{getReportSummary(selectedReport, t)}</p></div>
            </div>
            <div className="grid gap-2">
              <button onClick={() => printSelectedReport(selectedReport)} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("printReport")}</button>
              <button onClick={() => exportSelectedReportPdf(selectedReport)} className="w-full rounded-2xl bg-orange-500/20 px-5 py-3 text-sm font-semibold text-orange-100 transition hover:-translate-y-1 hover:bg-orange-500/30">{t("exportReportPdf")}</button>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function AiAssistantModule({ t, aiRequests, setAiRequests, selectedAiRequestId, setSelectedAiRequestId, learners = [], courses = [], currentUser }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const canCreateAi = ["superAdmin", "admin", "teacher", "pedagogy"].includes(currentUser?.role);
  const canValidateAi = ["superAdmin", "admin", "pedagogy"].includes(currentUser?.role);
  const emptyAiDraft = {
    title: "",
    subjectKey: "german",
    level: "A1",
    cohortNameKey: "a1Morning",
    courseTitle: "Alphabet und Begrüßung",
    typeKey: "dialogue",
    requester: currentUser?.name || "Admin",
    statusKey: "waitingValidation",
    date: "2026-05-25",
    prompt: "",
    output: "",
    validationKey: "generatedByAi",
    validator: "Mme Brigitte",
    publishTargetKey: "keepAsDraft"
  };
  const [aiDraft, setAiDraft] = useState(emptyAiDraft);
  const [editingAiId, setEditingAiId] = useState(null);

  function updateAiDraft(key, value) {
    setAiDraft((previous) => ({ ...previous, [key]: value }));
  }

  function resetAiForm() {
    setAiDraft(emptyAiDraft);
    setEditingAiId(null);
  }

  function editSelectedAiRequest() {
    const request = aiRequests.find((item) => item.id === selectedAiRequestId);
    if (!request) return;
    setEditingAiId(request.id);
    setAiDraft({
      title: request.title || "",
      subjectKey: request.subjectKey || "german",
      level: request.level || "A1",
      cohortNameKey: request.cohortNameKey || "a1Morning",
      courseTitle: request.courseTitle || "Alphabet und Begrüßung",
      typeKey: request.typeKey || "dialogue",
      requester: request.requester || currentUser?.name || "Admin",
      statusKey: request.statusKey || "waitingValidation",
      date: request.date || "2026-05-25",
      prompt: request.prompt || "",
      output: request.output || "",
      validationKey: request.validationKey || "generatedByAi",
      validator: request.validator || "Mme Brigitte",
      publishTargetKey: request.publishTargetKey || "keepAsDraft"
    });
  }

  function previewKeyForType(typeKey) {
    const map = {
      dialogue: "aiPreviewDialogue",
      lessonPlan: "aiPreviewLessonPlan",
      quiz: "aiPreviewQuiz",
      correction: "aiPreviewCorrection",
      interviewSimulation: "aiPreviewInterview",
      vocabularySheet: "aiPreviewVocabulary",
      correctedExercise: "aiPreviewExercise",
      homeworkDraft: "aiPreviewHomework",
      librarySupport: "aiPreviewLibrary",
      contentDraft: "aiPreviewLibrary"
    };
    return map[typeKey] || "aiPreviewLibrary";
  }

  function buildAiTemplateOutput(draft) {
    const contextLine = `${t("subject")}: ${t(draft.subjectKey)} · ${t("level")}: ${draft.level} · ${t("cohort")}: ${t(draft.cohortNameKey)} · ${t("courses")}: ${draft.courseTitle}`;
    const destinationLine = `${t("aiPublishTarget")}: ${t(draft.publishTargetKey)} · ${t("aiValidation")}: ${t("waitingValidation")}`;
    const basePrompt = draft.prompt?.trim() || `${t(draft.typeKey)} · ${t(draft.subjectKey)} · ${draft.level} · ${draft.courseTitle}`;

    const templates = {
      dialogue: [
        `${t("aiGeneratedOutputTitle")}: ${t("dialogue")}`,
        contextLine,
        `1. ${t("aiStepDialogueShort")} ${draft.level}.`,
        `2. ${t("aiStepVocabularyTranslation")}`,
        `3. ${t("aiStepComprehensionQuestions")}`,
        `4. ${t("aiStepOralActivity")}`,
        destinationLine
      ],
      lessonPlan: [
        `${t("aiGeneratedOutputTitle")}: ${t("lessonPlan")}`,
        contextLine,
        `1. ${t("aiStepMeasurableObjective")}`,
        `2. ${t("aiStepLessonFlow")}`,
        `3. ${t("aiStepGuidedActivity")}`,
        `4. ${t("aiStepIndependentExercise")}`,
        `5. ${t("aiStepMiniAssessment")}`,
        destinationLine
      ],
      quiz: [
        `${t("aiGeneratedOutputTitle")}: ${t("quiz")}`,
        contextLine,
        `1. ${t("aiStepQuestions")}`,
        `2. ${t("aiStepAnswerChoices")}`,
        `3. ${t("aiStepRubric")}`,
        `4. ${t("aiStepAnswerKey")}`,
        destinationLine
      ],
      correction: [
        `${t("aiGeneratedOutputTitle")}: ${t("correction")}`,
        contextLine,
        `1. ${t("aiStepStrengths")}`,
        `2. ${t("aiStepErrors")}`,
        `3. ${t("aiStepCorrectedVersion")}`,
        `4. ${t("aiStepTeachingRecommendation")}`,
        destinationLine
      ],
      interviewSimulation: [
        `${t("aiGeneratedOutputTitle")}: ${t("interviewSimulation")}`,
        contextLine,
        `1. ${t("aiStepScenario")}`,
        `2. ${t("aiStepPossibleQuestions")}`,
        `3. ${t("aiStepModelAnswers")}`,
        `4. ${t("aiStepEvaluationGrid")}`,
        destinationLine
      ],
      vocabularySheet: [
        `${t("aiGeneratedOutputTitle")}: ${t("vocabularySheet")}`,
        contextLine,
        `1. ${t("aiStepVocabularyList")}`,
        `2. ${t("aiStepExampleSentences")}`,
        `3. ${t("aiStepTranslation")}`,
        `4. ${t("aiStepMemoryActivity")}`,
        destinationLine
      ],
      correctedExercise: [
        `${t("aiGeneratedOutputTitle")}: ${t("correctedExercise")}`,
        contextLine,
        `1. ${t("aiStepProgressiveExercise")}`,
        `2. ${t("aiStepDetailedCorrection")}`,
        `3. ${t("aiStepReviewPoints")}`,
        `4. ${t("aiStepRemediation")}`,
        destinationLine
      ],
      homeworkDraft: [
        `${t("aiGeneratedOutputTitle")}: ${t("homeworkDraft")}`,
        contextLine,
        `1. ${t("aiStepHomeworkInstruction")}`,
        `2. ${t("aiStepEvaluationCriteria")}`,
        `3. ${t("aiStepSubmissionFormat")}`,
        `4. ${t("aiStepClassReminder")}`,
        destinationLine
      ],
      librarySupport: [
        `${t("aiGeneratedOutputTitle")}: ${t("librarySupport")}`,
        contextLine,
        `1. ${t("aiStepReadySupport")}`,
        `2. ${t("aiStepContentSummary")}`,
        `3. ${t("aiStepTargetAudience")}`,
        `4. ${t("aiStepDraftStatus")}`,
        destinationLine
      ],
      contentDraft: [
        `${t("aiGeneratedOutputTitle")}: ${t("contentDraft")}`,
        contextLine,
        `1. ${t("aiStepStructuredDraft")}`,
        `2. ${t("aiStepContentGoal")}`,
        `3. ${t("aiStepKeyPoints")}`,
        `4. ${t("aiStepHumanValidation")}`,
        destinationLine
      ]
    };

    return [
      `${t("aiTemplateMode")}`,
      `${t("aiPromptText")}: ${basePrompt}`,
      ...(templates[draft.typeKey] || templates.contentDraft),
      `${t("aiValidationRequired")}`
    ].join(String.fromCharCode(10));
  }

  function generateAiDraftPreview() {
    setAiDraft((previous) => ({
      ...previous,
      title: previous.title || `${t(previous.typeKey)} · ${t(previous.subjectKey)} ${previous.level}`,
      prompt: previous.prompt || `${t(previous.typeKey)} · ${t(previous.subjectKey)} · ${previous.level} · ${previous.courseTitle}`,
      output: buildAiTemplateOutput(previous),
      statusKey: "waitingValidation",
      validationKey: "generatedByAi"
    }));
  }

  function saveAiForm() {
    if (!canCreateAi) return;
    const normalizedRequest = {
      ...aiDraft,
      title: aiDraft.title.trim() || `${t("demoAiTitle")} ${aiRequests.length + 1}`,
      prompt: aiDraft.prompt.trim() || t("aiPromptText"),
      output: aiDraft.output.trim() || t(previewKeyForType(aiDraft.typeKey)),
      requester: aiDraft.requester || currentUser?.name || "Admin"
    };

    if (editingAiId) {
      setAiRequests((previous) => previous.map((item) => item.id === editingAiId ? { ...item, ...normalizedRequest } : item));
      setSelectedAiRequestId(editingAiId);
    } else {
      const newRequest = { id: `AI-${String(aiRequests.length + 1).padStart(3, "0")}`, ...normalizedRequest };
      setAiRequests((previous) => [newRequest, ...previous]);
      setSelectedAiRequestId(newRequest.id);
    }
    resetAiForm();
  }

  function updateAiStatus(requestId, statusKey) {
    if (!canValidateAi) return;
    setAiRequests((previous) => previous.map((item) => item.id === requestId ? { ...item, statusKey, validationKey: statusKey === "validated" ? "validatedByTeacher" : item.validationKey, validator: currentUser?.name || item.validator } : item));
    setAiDraft((previous) => editingAiId === requestId ? { ...previous, statusKey, validationKey: statusKey === "validated" ? "validatedByTeacher" : previous.validationKey, validator: currentUser?.name || previous.validator } : previous);
  }

  const rows = useMemo(() => aiRequests.filter((item) => {
    const haystack = `${item.title} ${t(item.subjectKey)} ${item.level} ${t(item.typeKey)} ${t(item.statusKey)} ${item.requester}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || item.subjectKey === filter || item.typeKey === filter || item.statusKey === filter;
    return matchesSearch && matchesFilter;
  }), [aiRequests, query, filter, t]);

  const selectedAiRequest = aiRequests.find((item) => item.id === selectedAiRequestId) || rows[0] || null;
  const validatedCount = aiRequests.filter((item) => item.statusKey === "validated").length;
  const waitingCount = aiRequests.filter((item) => item.statusKey === "waitingValidation").length;

  function addDemoAiRequest() {
    const nextIndex = aiRequests.length + 1;
    const subjectKey = ["german", "english", "computer", "artificialIntelligence"].includes(filter) ? filter : "german";
    const typeKey = ["dialogue", "lessonPlan", "quiz", "correction", "interviewSimulation", "vocabularySheet", "correctedExercise", "homeworkDraft", "librarySupport"].includes(filter) ? filter : "contentDraft";
    const newRequest = {
      id: `AI-${String(nextIndex).padStart(3, "0")}`,
      title: `${t("demoAiTitle")} ${nextIndex}`,
      subjectKey,
      level: subjectKey === "english" ? "Beginner" : subjectKey === "computer" || subjectKey === "artificialIntelligence" ? "Intro" : "A1",
      typeKey,
      requester: "Admin",
      statusKey: "waitingValidation",
      date: "2026-05-25",
      prompt: t("aiPromptText"),
      output: t(previewKeyForType(typeKey)),
      validationKey: "generatedByAi",
      validator: "Mme Brigitte",
      publishTargetKey: "keepAsDraft",
      cohortNameKey: subjectKey === "computer" ? "itIntro" : subjectKey === "artificialIntelligence" ? "ai" : "a1Morning",
      courseTitle: subjectKey === "computer" ? "File management basics" : subjectKey === "artificialIntelligence" ? "Prompting fundamentals" : "Alphabet und Begrüßung"
    };
    setAiRequests((previousAiRequests) => [newRequest, ...previousAiRequests]);
    setSelectedAiRequestId(newRequest.id);
  }

  const statusTone = (key) => {
    if (key === "validated") return "bg-emerald-400/15 text-emerald-200";
    if (key === "rejected") return "bg-rose-400/15 text-rose-200";
    return "bg-orange-400/15 text-orange-200";
  };

  const typeTone = (key) => {
    if (key === "dialogue") return "bg-cyan-400/15 text-cyan-200";
    if (key === "quiz") return "bg-violet-400/15 text-violet-200";
    if (key === "correction") return "bg-orange-400/15 text-orange-200";
    if (key === "lessonPlan") return "bg-emerald-400/15 text-emerald-200";
    if (["vocabularySheet", "correctedExercise", "homeworkDraft", "librarySupport"].includes(key)) return "bg-cyan-400/15 text-cyan-200";
    return "bg-rose-400/15 text-rose-200";
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("aiModuleTitle")} subtitle={t("aiModuleSub")} action={`${t("validated")}: ${validatedCount}/${aiRequests.length}`} />
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="font-semibold text-emerald-100">{t("aiNoApiMode")}</p>
            <p className="mt-2 text-xs leading-5 text-emerald-100/75">{t("aiNoApiModeSub")}</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="font-semibold text-cyan-100">{t("aiOptionalApiMode")}</p>
            <p className="mt-2 text-xs leading-5 text-cyan-100/75">{t("aiOptionalApiModeSub")}</p>
          </div>
          <div className="rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
            <p className="font-semibold text-violet-100">{t("aiLocalMode")}</p>
            <p className="mt-2 text-xs leading-5 text-violet-100/75">{t("aiLocalModeSub")}</p>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">{t("aiWorkflowTitle")}</p>
              <p className="mt-1 text-xs leading-5 text-orange-100/80">{t("aiWorkflowSub")}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-orange-100">{t("aiApiKeyLater")}</span>
          </div>
        </div>
        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("aiBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("aiBusinessFormSub")}</p>
              {!canCreateAi ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingAiId ? t("updateMode") : t("createMode")}</span>
              <button disabled={!canCreateAi} onClick={resetAiForm} className={cn("rounded-full px-3 py-1 text-xs transition", canCreateAi ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button>
              <button disabled={!canCreateAi} onClick={editSelectedAiRequest} className={cn("rounded-full px-3 py-1 text-xs transition", canCreateAi ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedAiRequest")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("aiRequestIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("aiRequestTitle")}</span><input disabled={!canCreateAi} value={aiDraft.title} onChange={(event) => updateAiDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subject")}</span><select disabled={!canCreateAi} value={aiDraft.subjectKey} onChange={(event) => updateAiDraft("subjectKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.subjectKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("level")}</span><select disabled={!canCreateAi} value={aiDraft.level} onChange={(event) => updateAiDraft("level", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.level.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("cohort")}</span><select disabled={!canCreateAi} value={aiDraft.cohortNameKey} onChange={(event) => updateAiDraft("cohortNameKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.cohortNameKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("courses")}</span><select disabled={!canCreateAi} value={aiDraft.courseTitle} onChange={(event) => updateAiDraft("courseTitle", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{courses.map((course) => <option key={course.id} value={course.title}>{course.title} · {t(course.subjectKey)} · {course.level}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("aiRequestType")}</span><select disabled={!canCreateAi} value={aiDraft.typeKey} onChange={(event) => updateAiDraft("typeKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500"><option value="dialogue">{t("dialogue")}</option><option value="lessonPlan">{t("lessonPlan")}</option><option value="quiz">{t("quiz")}</option><option value="correction">{t("correction")}</option><option value="interviewSimulation">{t("interviewSimulation")}</option><option value="vocabularySheet">{t("vocabularySheet")}</option><option value="correctedExercise">{t("correctedExercise")}</option><option value="homeworkDraft">{t("homeworkDraft")}</option><option value="librarySupport">{t("librarySupport")}</option><option value="contentDraft">{t("contentDraft")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("resourceOwner")}</span><select disabled={!canCreateAi} value={aiDraft.requester} onChange={(event) => updateAiDraft("requester", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.requester.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("aiGenerationContext")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportDate")}</span><input disabled={!canCreateAi} type="date" value={aiDraft.date} onChange={(event) => updateAiDraft("date", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("reportStatus")}</span><select disabled={!canCreateAi} value={aiDraft.statusKey} onChange={(event) => updateAiDraft("statusKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500"><option value="waitingValidation">{t("waitingValidation")}</option><option value="validated">{t("validated")}</option><option value="rejected">{t("rejected")}</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("aiValidator")}</span><select disabled={!canCreateAi} value={aiDraft.validator} onChange={(event) => updateAiDraft("validator", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500"><option value="Mme Brigitte">Mme Brigitte</option><option value="Admin">Admin</option><option value="AI Coach">AI Coach</option></select></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("aiPublishTarget")}</span><select disabled={!canCreateAi} value={aiDraft.publishTargetKey} onChange={(event) => updateAiDraft("publishTargetKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500">{FIELD_OPTIONS.publishTargetKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("aiPromptText")}</span><textarea disabled={!canCreateAi} value={aiDraft.prompt} onChange={(event) => updateAiDraft("prompt", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("aiOutputPreview")}</span><textarea disabled={!canCreateAi} value={aiDraft.output} onChange={(event) => updateAiDraft("output", event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button disabled={!canCreateAi} onClick={generateAiDraftPreview} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold transition", canCreateAi ? "bg-cyan-500/20 text-cyan-100 hover:-translate-y-1 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("generateAiPreview")}</button>
            <button disabled={!canValidateAi} onClick={() => updateAiStatus(editingAiId || selectedAiRequestId, "validated")} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold transition", canValidateAi ? "bg-emerald-500/20 text-emerald-100 hover:-translate-y-1 hover:bg-emerald-500/30" : "bg-white/5 text-slate-500")}>{t("validateAiRequest")}</button>
            <button disabled={!canValidateAi} onClick={() => updateAiStatus(editingAiId || selectedAiRequestId, "rejected")} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold transition", canValidateAi ? "bg-rose-500/20 text-rose-100 hover:-translate-y-1 hover:bg-rose-500/30" : "bg-white/5 text-slate-500")}>{t("rejectAiRequest")}</button>
            <button disabled={!canCreateAi} onClick={saveAiForm} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition sm:col-span-3", canCreateAi ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-orange-500 text-white shadow-violet-600/20 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveAiRequest")}</button>
          </div>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiGeneratedItems")}</p><p className="mt-2 text-2xl font-semibold text-white">{aiRequests.length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("validated")}</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{validatedCount}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("waitingValidation")}</p><p className="mt-2 text-2xl font-semibold text-orange-300">{waitingCount}</p></div>
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
          <p className="font-semibold">{t("aiRiskControl")}</p>
          <p className="mt-1 text-cyan-100/80">{t("aiHumanRule")}</p>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchAi")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="german">{t("filterGerman")}</option>
            <option value="english">{t("filterEnglish")}</option>
            <option value="computer">{t("filterComputer")}</option>
            <option value="artificialIntelligence">{t("filterAI")}</option>
            <option value="dialogue">{t("dialogue")}</option>
            <option value="lessonPlan">{t("lessonPlan")}</option>
            <option value="quiz">{t("quiz")}</option>
            <option value="correction">{t("correction")}</option>
            <option value="interviewSimulation">{t("interviewSimulation")}</option>
            <option value="vocabularySheet">{t("vocabularySheet")}</option>
            <option value="correctedExercise">{t("correctedExercise")}</option>
            <option value="homeworkDraft">{t("homeworkDraft")}</option>
            <option value="librarySupport">{t("librarySupport")}</option>
            <option value="validated">{t("validated")}</option>
            <option value="waitingValidation">{t("waitingValidation")}</option>
            <option value="rejected">{t("rejected")}</option>
          </select>
          <button onClick={addDemoAiRequest} className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1 hover:bg-violet-500">
            {t("addDemoAiRequest")}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((item) => (
            <button key={item.id} onClick={() => setSelectedAiRequestId(item.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{t(item.subjectKey)} · {item.level} · {item.requester}</p><p className="mt-1 text-xs text-slate-500">{item.courseTitle || t("toDefine")}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${typeTone(item.typeKey)}`}>{t(item.typeKey)}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{item.prompt}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(item.statusKey)}`}>{t(item.statusKey)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{t(item.publishTargetKey || "keepAsDraft")}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{item.date}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("aiRequestProfile")} subtitle={selectedAiRequest ? t("selectedAiRequest") : t("noAiRequestSelected")} />
        {selectedAiRequest ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedAiRequest.title}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedAiRequest.subjectKey)} · {selectedAiRequest.level}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${typeTone(selectedAiRequest.typeKey)}`}>{t(selectedAiRequest.typeKey)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedAiRequest.statusKey)}`}>{t(selectedAiRequest.statusKey)}</span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiPromptText")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedAiRequest.prompt}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiOutputPreview")}</p><p className="mt-2 text-sm leading-6 text-cyan-100">{selectedAiRequest.output}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiValidation")}</p><p className="mt-2 text-sm font-semibold text-emerald-300">{t(selectedAiRequest.validationKey)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("resourceOwner")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedAiRequest.requester}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiValidator")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedAiRequest.validator || "—"}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("aiPublishTarget")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{t(selectedAiRequest.publishTargetKey || "keepAsDraft")}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function SettingsModule({ t, language = "fr", settings, setSettings, selectedSettingId, setSelectedSettingId, publicConfig, setPublicConfig }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [settingsView, setSettingsView] = useState("identity");
  const [publicDraft, setPublicDraft] = useState(publicConfig || DEFAULT_PUBLIC_CONFIG);
  const [publicSaved, setPublicSaved] = useState(false);

  const localText = {
    fr: {
      controlCenter: "Centre de configuration",
      controlCenterSub: "Configurer les règles globales utilisées par les modules, sans modifier le backend pour le moment.",
      identityTab: "Identité",
      academicTab: "Académique",
      financeTab: "Finances",
      accessTab: "Accès",
      aiTab: "IA",
      securityTab: "Sécurité",
      activeSection: "Section active",
      globalRules: "Règles globales",
      globalRulesSub: "Ces paramètres préparent la future connexion à la base de données.",
      centerLogo: "Logo du centre",
      receiptIdentity: "Identité sur reçus et rapports",
      defaultLanguage: "Langue par défaut",
      activeTheme: "Apparence active",
      academicStructure: "Structure pédagogique",
      levelDuration: "Durée par niveau",
      weeklySessions: "Séances par semaine",
      sessionDuration: "Durée d’une séance",
      levelsConfigured: "Niveaux configurés",
      financeRules: "Règles financières",
      defaultCurrency: "Devise par défaut",
      installments: "Paiement par tranche",
      mobileMoneyRequired: "Référence mobile money requise",
      receiptNumbering: "Numérotation des reçus",
      roleMatrix: "Matrice rôles et permissions",
      superAdminRule: "Backup, Restore et Reset restent réservés au Super Admin.",
      apiPolicy: "Politique IA",
      noMonthlyFee: "Mode sans frais mensuels par défaut",
      optionalApi: "Clé API optionnelle plus tard",
      humanValidation: "Validation humaine obligatoire",
      publishDestination: "Destination après validation",
      securityRules: "Sécurité et maintenance",
      auditRetention: "Conservation des journaux",
      criticalApproval: "Validation des actions critiques",
      backupFrequency: "Fréquence de sauvegarde prévue",
      resetProtection: "Protection contre reset accidentel",
      configured: "Configuré",
      pendingBackend: "À connecter au backend plus tard",
      enforced: "Appliqué",
      planned: "Planifié",
      identitySaved: "Configuration publique mise à jour.",
      quickConfig: "Configuration rapide",
      platformConfigList: "Liste des paramètres système",
      editableLater: "Editable maintenant en démonstration, persistant plus tard via PostgreSQL.",
      recommendedDefault: "Valeur recommandée",
      currentValue: "Valeur actuelle",
      operationalImpact: "Impact opérationnel",
      centerNameImpact: "Utilisé sur l’interface, les reçus, les rapports et la page publique.",
      i18nImpact: "Évite les textes codés en dur et maintient le basculement FR/EN.",
      financeImpact: "Structure les frais, les soldes, les relances et les reçus.",
      accessImpact: "Sépare les responsabilités entre direction, secrétariat, pédagogie et enseignants.",
      aiImpact: "Évite les frais non désirés et impose une validation humaine.",
      securityImpact: "Trace les actions sensibles et limite les risques d’erreur administrative."
    },
    en: {
      controlCenter: "Configuration center",
      controlCenterSub: "Configure global rules used by modules, without changing the backend for now.",
      identityTab: "Identity",
      academicTab: "Academic",
      financeTab: "Finance",
      accessTab: "Access",
      aiTab: "AI",
      securityTab: "Security",
      activeSection: "Active section",
      globalRules: "Global rules",
      globalRulesSub: "These settings prepare the future database connection.",
      centerLogo: "Center logo",
      receiptIdentity: "Identity on receipts and reports",
      defaultLanguage: "Default language",
      activeTheme: "Active appearance",
      academicStructure: "Academic structure",
      levelDuration: "Duration per level",
      weeklySessions: "Sessions per week",
      sessionDuration: "Session duration",
      levelsConfigured: "Configured levels",
      financeRules: "Finance rules",
      defaultCurrency: "Default currency",
      installments: "Installment payment",
      mobileMoneyRequired: "Mobile money reference required",
      receiptNumbering: "Receipt numbering",
      roleMatrix: "Role and permission matrix",
      superAdminRule: "Backup, Restore and Reset remain reserved for the Super Admin.",
      apiPolicy: "AI policy",
      noMonthlyFee: "No monthly fee mode by default",
      optionalApi: "Optional API key later",
      humanValidation: "Human validation required",
      publishDestination: "Destination after validation",
      securityRules: "Security and maintenance",
      auditRetention: "Audit log retention",
      criticalApproval: "Critical action approval",
      backupFrequency: "Planned backup frequency",
      resetProtection: "Protection against accidental reset",
      configured: "Configured",
      pendingBackend: "To connect to backend later",
      enforced: "Enforced",
      planned: "Planned",
      identitySaved: "Public configuration updated.",
      quickConfig: "Quick configuration",
      platformConfigList: "System settings list",
      editableLater: "Editable now in demo, persistent later through PostgreSQL.",
      recommendedDefault: "Recommended value",
      currentValue: "Current value",
      operationalImpact: "Operational impact",
      centerNameImpact: "Used on the interface, receipts, reports and public page.",
      i18nImpact: "Prevents hard-coded text and keeps FR/EN switching consistent.",
      financeImpact: "Structures fees, balances, follow-ups and receipts.",
      accessImpact: "Separates responsibilities across management, secretariat, pedagogy and teachers.",
      aiImpact: "Avoids unwanted fees and enforces human validation.",
      securityImpact: "Tracks sensitive actions and limits administrative error risk."
    }
  };

  const lt = (key) => localText[language]?.[key] || localText.fr[key] || key;

  function updatePublicDraft(key, value) {
    setPublicDraft((previous) => ({ ...previous, [key]: value }));
    setPublicSaved(false);
  }

  function savePublicConfig() {
    setPublicConfig(publicDraft);
    setPublicSaved(true);
  }

  const rows = useMemo(() => settings.filter((setting) => {
    const haystack = `${t(setting.nameKey)} ${t(setting.categoryKey)} ${setting.value} ${setting.owner} ${t(setting.statusKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || setting.categoryKey === filter || setting.statusKey === filter;
    return matchesSearch && matchesFilter;
  }), [settings, query, filter, t]);

  const selectedSetting = settings.find((setting) => setting.id === selectedSettingId) || rows[0] || null;
  const enabledCount = settings.filter((setting) => setting.statusKey === "enabled" || setting.statusKey === "configurable").length;
  const lockedCount = settings.filter((setting) => setting.statusKey === "locked").length;

  function addDemoSetting() {
    const nextIndex = settings.length + 1;
    const categoryKey = ["centerIdentity", "academicConfig", "financeConfig", "languageConfig", "aiConfig", "roleConfig"].includes(filter) ? filter : "academicConfig";
    const newSetting = {
      id: `SET-${String(nextIndex).padStart(3, "0")}`,
      nameKey: "demoSettingName",
      categoryKey,
      value: t("toDefine"),
      owner: "Admin",
      statusKey: "configurable",
      description: t("demoSettingName")
    };
    setSettings((previousSettings) => [newSetting, ...previousSettings]);
    setSelectedSettingId(newSetting.id);
  }

  const statusTone = (key) => {
    if (key === "enabled") return "bg-emerald-400/15 text-emerald-200";
    if (key === "configurable") return "bg-cyan-400/15 text-cyan-200";
    if (key === "locked") return "bg-violet-400/15 text-violet-200";
    return "bg-rose-400/15 text-rose-200";
  };

  const categoryTone = (key) => {
    if (key === "centerIdentity") return "bg-cyan-400/15 text-cyan-200";
    if (key === "academicConfig") return "bg-violet-400/15 text-violet-200";
    if (key === "financeConfig") return "bg-emerald-400/15 text-emerald-200";
    if (key === "aiConfig") return "bg-orange-400/15 text-orange-200";
    if (key === "roleConfig") return "bg-rose-400/15 text-rose-200";
    return "bg-white/10 text-slate-300";
  };

  const tabs = [
    { id: "identity", label: lt("identityTab"), icon: "🏫" },
    { id: "academic", label: lt("academicTab"), icon: "🎓" },
    { id: "finance", label: lt("financeTab"), icon: "💳" },
    { id: "access", label: lt("accessTab"), icon: "🛡️" },
    { id: "ai", label: lt("aiTab"), icon: "✨" },
    { id: "security", label: lt("securityTab"), icon: "🔐" }
  ];

  const configurationCards = {
    identity: [
      { label: lt("centerLogo"), value: "LMS Center", status: lt("configured"), impact: lt("centerNameImpact") },
      { label: lt("receiptIdentity"), value: "LMS Center · Digital Learning Hub", status: lt("configured"), impact: lt("centerNameImpact") },
      { label: lt("defaultLanguage"), value: "FR / EN", status: lt("enforced"), impact: lt("i18nImpact") },
      { label: lt("activeTheme"), value: `${t("navyMode")} / ${t("lightMode")}`, status: lt("configured"), impact: lt("i18nImpact") }
    ],
    academic: [
      { label: lt("levelDuration"), value: "3 mois / 3 months", status: lt("configured"), impact: lt("academicStructure") },
      { label: lt("weeklySessions"), value: "3", status: lt("configured"), impact: lt("academicStructure") },
      { label: lt("sessionDuration"), value: "3h", status: lt("configured"), impact: lt("academicStructure") },
      { label: lt("levelsConfigured"), value: "A1 · A2 · B1 · B2 · Intro", status: lt("configured"), impact: lt("academicStructure") }
    ],
    finance: [
      { label: lt("defaultCurrency"), value: "F CFA", status: lt("configured"), impact: lt("financeImpact") },
      { label: lt("installments"), value: t("enabled"), status: lt("configured"), impact: lt("financeImpact") },
      { label: lt("mobileMoneyRequired"), value: t("enabled"), status: lt("planned"), impact: lt("financeImpact") },
      { label: lt("receiptNumbering"), value: "RC-0001", status: lt("configured"), impact: lt("financeImpact") }
    ],
    access: [
      { label: t("superAdminRole"), value: "Full access", status: lt("enforced"), impact: lt("superAdminRule") },
      { label: t("secretariatRole"), value: `${t("learners")} · ${t("payments")} · ${t("attendance")}`, status: lt("configured"), impact: lt("accessImpact") },
      { label: t("teacherRole"), value: `${t("courses")} · ${t("attendance")} · ${t("exams")} · ${t("library")}`, status: lt("configured"), impact: lt("accessImpact") },
      { label: t("studentRole"), value: "Read-only", status: lt("enforced"), impact: lt("accessImpact") }
    ],
    ai: [
      { label: lt("noMonthlyFee"), value: t("enabled"), status: lt("enforced"), impact: lt("aiImpact") },
      { label: lt("optionalApi"), value: lt("pendingBackend"), status: lt("planned"), impact: lt("aiImpact") },
      { label: lt("humanValidation"), value: t("enabled"), status: lt("enforced"), impact: lt("aiImpact") },
      { label: lt("publishDestination"), value: `${t("library")} · ${t("courses")} · ${t("exams")}`, status: lt("planned"), impact: lt("aiImpact") }
    ],
    security: [
      { label: lt("auditRetention"), value: "365 jours / days", status: lt("configured"), impact: lt("securityImpact") },
      { label: lt("criticalApproval"), value: t("superAdminOnlyAccess"), status: lt("enforced"), impact: lt("superAdminRule") },
      { label: lt("backupFrequency"), value: "Daily", status: lt("planned"), impact: lt("securityImpact") },
      { label: lt("resetProtection"), value: "Double confirmation", status: lt("planned"), impact: lt("securityImpact") }
    ]
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t("settingsModuleTitle")} subtitle={t("settingsModuleSub")} action={`${t("enabled")}: ${enabledCount}/${settings.length}`} />

        <div className="mb-5 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{lt("controlCenter")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{lt("controlCenterSub")}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{lt("activeSection")}: {tabs.find((tab) => tab.id === settingsView)?.label}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setSettingsView(tab.id)} className={cn("rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition hover:-translate-y-1", settingsView === tab.id ? "border-violet-400 bg-violet-600 text-white shadow-lg shadow-violet-600/25" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{lt("quickConfig")}</h3>
              <p className="mt-1 text-xs leading-5 text-cyan-100/80">{lt("editableLater")}</p>
            </div>
            {publicSaved ? <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">{lt("identitySaved")}</span> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicTitle")}</span><input value={publicDraft.title} onChange={(event) => updatePublicDraft("title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("partnerOneName")}</span><input value={publicDraft.partnerOne} onChange={(event) => updatePublicDraft("partnerOne", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("partnerTwoName")}</span><input value={publicDraft.partnerTwo} onChange={(event) => updatePublicDraft("partnerTwo", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicTmoney")}</span><input value={publicDraft.tmoney} onChange={(event) => updatePublicDraft("tmoney", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicGermanOffer")}</span><input value={publicDraft.germanOffer} onChange={(event) => updatePublicDraft("germanOffer", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicMoov")}</span><input value={publicDraft.moov} onChange={(event) => updatePublicDraft("moov", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicOtherOffer")}</span><input value={publicDraft.otherOffer} onChange={(event) => updatePublicDraft("otherOffer", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3"><span className="mb-2 block text-xs text-slate-400">{t("publicWhatsapp")}</span><input value={publicDraft.whatsapp} onChange={(event) => updatePublicDraft("whatsapp", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3 md:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("publicDuration")}</span><input value={publicDraft.duration} onChange={(event) => updatePublicDraft("duration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block rounded-2xl border border-white/10 bg-[#0b1025]/60 p-3 md:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("publicSubtitle")}</span><textarea value={publicDraft.subtitle} onChange={(event) => updatePublicDraft("subtitle", event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none" /></label>
          </div>
          <button onClick={savePublicConfig} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("savePublicConfig")}</button>
        </div>

        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-white">{lt("globalRules")}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">{lt("globalRulesSub")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(configurationCards[settingsView] || []).map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-[#0b1025]/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100">{item.status}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400"><span className="font-semibold text-slate-200">{lt("operationalImpact")}: </span>{item.impact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("settings")}</p><p className="mt-2 text-2xl font-semibold text-white">{settings.length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("enabled")}</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{enabledCount}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("locked")}</p><p className="mt-2 text-2xl font-semibold text-violet-300">{lockedCount}</p></div>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchSettings")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="centerIdentity">{t("centerIdentity")}</option>
            <option value="academicConfig">{t("academicConfig")}</option>
            <option value="financeConfig">{t("financeConfig")}</option>
            <option value="languageConfig">{t("languageConfig")}</option>
            <option value="aiConfig">{t("aiConfig")}</option>
            <option value="roleConfig">{t("roleConfig")}</option>
            <option value="enabled">{t("enabled")}</option>
            <option value="configurable">{t("configurable")}</option>
            <option value="locked">{t("locked")}</option>
            <option value="disabled">{t("disabled")}</option>
          </select>
          <button onClick={addDemoSetting} className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1 hover:bg-violet-500">
            {t("addDemoSetting")}
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-white">{lt("platformConfigList")}</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((setting) => (
            <button key={setting.id} onClick={() => setSelectedSettingId(setting.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{t(setting.nameKey)}</h3>
                  <p className="mt-1 text-xs text-slate-400">{setting.id} · {setting.owner}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(setting.statusKey)}`}>{t(setting.statusKey)}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{setting.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${categoryTone(setting.categoryKey)}`}>{t(setting.categoryKey)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{setting.value}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("settingProfile")} subtitle={selectedSetting ? t("selectedSetting") : t("noSettingSelected")} />
        {selectedSetting ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{t(selectedSetting.nameKey)}</p>
              <p className="mt-1 text-sm text-slate-400">{t(selectedSetting.categoryKey)} · {selectedSetting.id}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedSetting.statusKey)}`}>{t(selectedSetting.statusKey)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${categoryTone(selectedSetting.categoryKey)}`}>{t(selectedSetting.categoryKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("settingValue")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedSetting.value}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("settingOwner")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedSetting.owner}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("settingDescription")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedSetting.description}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function StudentReadOnlyModule({ t, moduleId, currentUser, learners = [], courses = [], attendanceRows = [], assessments = [], resources = [], payments = [] }) {
  const currentLearner = getCurrentLearnerForUser(currentUser, learners);
  const [selectedId, setSelectedId] = useState("");
  const rows = useMemo(() => {
    if (!currentLearner) return [];
    if (moduleId === "courses") return filterStudentCourses(courses, currentLearner);
    if (moduleId === "attendance") return attendanceRows.filter((entry) => entry.learnerName === currentLearner.name);
    if (moduleId === "exams") return assessments.filter((item) => item.learnerName === currentLearner.name);
    if (moduleId === "library") return filterStudentResources(resources, currentLearner);
    if (moduleId === "payments") return payments.filter((payment) => payment.learnerName === currentLearner.name);
    return [];
  }, [moduleId, currentLearner, courses, attendanceRows, assessments, resources, payments]);

  useEffect(() => {
    setSelectedId((previous) => rows.some((item) => item.id === previous) ? previous : rows[0]?.id || "");
  }, [rows]);

  const selected = rows.find((item) => item.id === selectedId) || rows[0] || null;
  const titleKey = moduleId === "courses" ? "courseModuleTitle" : moduleId === "attendance" ? "attendanceModuleTitle" : moduleId === "exams" ? "assessmentModuleTitle" : moduleId === "library" ? "libraryModuleTitle" : "paymentModuleTitle";
  const subtitleKey = moduleId === "courses" ? "courseModuleSub" : moduleId === "attendance" ? "attendanceModuleSub" : moduleId === "exams" ? "assessmentModuleSub" : moduleId === "library" ? "libraryModuleSub" : "paymentModuleSub";

  function itemTitle(item) {
    if (!item) return "";
    return item.title || item.courseTitle || item.learnerName || item.receipt || item.id;
  }

  function itemMeta(item) {
    if (!item) return "";
    if (moduleId === "payments") return `${t(item.subjectKey)} · ${item.level} · ${t(item.statusKey)}`;
    if (moduleId === "exams") return `${item.courseTitle} · ${item.score}/${item.maxScore}`;
    if (moduleId === "attendance") return `${item.courseTitle} · ${item.date} · ${t(item.statusKey)}`;
    if (moduleId === "library") return `${t(item.typeKey)} · ${item.size}`;
    return `${t(item.subjectKey)} · ${item.level} · ${t(item.statusKey)}`;
  }

  function detailCards(item) {
    if (!item) return [];
    if (moduleId === "payments") return [
      [t("totalFees"), formatMoney(item.totalFees)],
      [t("amountPaid"), formatMoney(item.amountPaid)],
      [t("amountDue"), formatMoney(item.amountDue)],
      [t("paymentMethod"), t(item.methodKey)],
      [t("receiptNumber"), item.receipt],
      [t("dueDate"), item.dueDate]
    ];
    if (moduleId === "exams") return [[t("assessmentScore"), `${item.score}/${item.maxScore}`], [t("assessmentDecision"), t(item.decisionKey)], [t("correctionStatus"), t(item.correctionKey)], [t("attendanceDate"), item.date]];
    if (moduleId === "attendance") return [[t("attendanceDate"), item.date], [t("attendanceStatus"), t(item.statusKey)], [t("courseWeek"), item.week], [t("courseSession"), item.session]];
    if (moduleId === "library") return [[t("resourceType"), t(item.typeKey)], [t("resourceSize"), item.size], [t("resourceLinkedCourse"), item.courseTitle], [t("resourceVisibility"), t(item.visibilityKey)]];
    return [[t("teacher"), item.teacher], [t("courseWeek"), item.week], [t("courseSession"), item.session], [t("courseDuration"), item.duration], [t("courseResources"), item.resources], [t("courseHomework"), item.homework]];
  }

  const description = selected?.objective || selected?.note || selected?.description || selected?.paymentNote || selected?.courseTitle || t("readOnlyMode");

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t(titleKey)} subtitle={t(subtitleKey)} action={t("readOnlyMode")} />
        <div className="mb-5 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-4 text-sm leading-6 text-orange-100">
          <p className="font-semibold">{t("readOnlyMode")}</p>
          <p className="mt-1 text-orange-100/80">{t("noEditPermission")}</p>
        </div>
        {rows.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((item) => (
              <button key={item.id} onClick={() => setSelectedId(item.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{itemTitle(item)}</h3>
                    <p className="mt-1 text-xs text-slate-400">{itemMeta(item)}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{item.id}</span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{item.note || item.objective || item.description || item.courseTitle || "—"}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">{t("noLearnerSelected")}</p>
        )}
      </GlassCard>

      <GlassCard>
        <SectionHeader title={moduleId === "payments" ? t("selectedPayment") : moduleId === "library" ? t("selectedResource") : moduleId === "exams" ? t("selectedAssessment") : moduleId === "attendance" ? t("selectedAttendance") : t("selectedCourse")} subtitle={currentLearner ? `${currentLearner.name} · ${t(currentLearner.subjectKey)} · ${currentLearner.level}` : t("studentRole")} />
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{itemTitle(selected)}</p>
              <p className="mt-1 text-sm text-slate-400">{itemMeta(selected)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {detailCards(selected).map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{moduleId === "payments" ? t("paymentNote") : t("resourceDescription")}</p>
                <p className="mt-2 text-sm leading-6 text-white">{description}</p>
              </div>
            </div>
            {moduleId === "library" && isSafeExternalUrl(selected.fileUrl) ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <button onClick={() => secureOpenExternalUrl(selected.fileUrl)} className="rounded-2xl bg-cyan-500/20 px-4 py-3 text-xs font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-500/30">{t("openResource")}</button>
                <button onClick={() => secureOpenExternalUrl(selected.fileUrl)} className="rounded-2xl bg-violet-500/20 px-4 py-3 text-xs font-semibold text-violet-100 transition hover:-translate-y-1 hover:bg-violet-500/30">{t("downloadResource")}</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

function MaintenanceModule({ t, moduleId, icon, operations, setOperations, selectedOperationId, setSelectedOperationId, currentUser }) {
  const isCriticalMaintenance = ["backup", "restore", "reset"].includes(moduleId);
  const canManageMaintenance = !isCriticalMaintenance || currentUser?.role === "superAdmin";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const moduleRows = operations.filter((item) => item.moduleId === moduleId);

  const rows = useMemo(() => moduleRows.filter((item) => {
    const haystack = `${item.title} ${t(item.typeKey)} ${t(item.targetKey)} ${item.owner} ${t(item.statusKey)} ${t(item.severityKey)}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || item.statusKey === filter || item.severityKey === filter || item.typeKey === filter;
    return matchesSearch && matchesFilter;
  }), [operations, query, filter, t, moduleId]);

  const selectedOperation = operations.find((item) => item.id === selectedOperationId && item.moduleId === moduleId) || rows[0] || null;
  const completedCount = moduleRows.filter((item) => item.statusKey === "completed").length;
  const pendingCount = moduleRows.filter((item) => item.statusKey === "scheduled" || item.approvalKey === "pendingApproval").length;

  function addDemoOperation() {
    if (!canManageMaintenance) return;
    const nextIndex = operations.length + 1;
    const newOperation = {
      id: `MNT-${String(nextIndex).padStart(3, "0")}`,
      moduleId,
      title: `${t("demoMaintenanceName")} ${nextIndex}`,
      typeKey: moduleId,
      targetKey: "settings",
      owner: "Admin",
      statusKey: "scheduled",
      severityKey: moduleId === "reset" || moduleId === "restore" ? "critical" : "medium",
      startedAt: "2026-05-26 09:00",
      completedAt: t("pending"),
      retention: moduleId === "audit" ? t("retention365Days") : t("retention30Days"),
      integrityKey: "pendingApproval",
      approvalKey: "pendingApproval",
      description: t("demoMaintenanceName")
    };
    setOperations((previousOperations) => [newOperation, ...previousOperations]);
    setSelectedOperationId(newOperation.id);
  }

  const statusTone = (key) => {
    if (key === "completed") return "bg-emerald-400/15 text-emerald-200";
    if (key === "failedStatus") return "bg-rose-400/15 text-rose-200";
    return "bg-orange-400/15 text-orange-200";
  };

  const severityTone = (key) => {
    if (key === "critical") return "bg-rose-400/15 text-rose-200";
    if (key === "medium") return "bg-orange-400/15 text-orange-200";
    return "bg-cyan-400/15 text-cyan-200";
  };

  const titleKey = moduleId === "backup" ? "backupModuleTitle" : moduleId === "restore" ? "restoreModuleTitle" : moduleId === "reset" ? "resetModuleTitle" : "auditModuleTitle";
  const subKey = moduleId === "backup" ? "backupModuleSub" : moduleId === "restore" ? "restoreModuleSub" : moduleId === "reset" ? "resetModuleSub" : "auditModuleSub";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <GlassCard>
        <SectionHeader title={t(titleKey)} subtitle={t(subKey)} action={`${t("completed")}: ${completedCount}/${moduleRows.length}`} />
        {!canManageMaintenance ? (
          <div className="mb-5 rounded-3xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
            <p className="font-semibold">{t("superAdminOnlyAccess")}</p>
            <p className="mt-1 text-rose-100/80">{t("criticalActionBlocked")}</p>
          </div>
        ) : null}
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("maintenance")}</p><p className="mt-2 text-2xl font-semibold text-white">{moduleRows.length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("completed")}</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{completedCount}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("pendingApproval")}</p><p className="mt-2 text-2xl font-semibold text-orange-300">{pendingCount}</p></div>
        </div>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchMaintenance")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="scheduled">{t("scheduled")}</option>
            <option value="pendingApproval">{t("pendingApproval")}</option>
            <option value="critical">{t("critical")}</option>
            <option value="medium">{t("medium")}</option>
            <option value="low">{t("low")}</option>
            <option value="loginActivity">{t("loginActivity")}</option>
            <option value="dataChange">{t("dataChange")}</option>
            <option value="securityEvent">{t("securityEvent")}</option>
          </select>
          <button disabled={!canManageMaintenance} onClick={addDemoOperation} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageMaintenance ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoMaintenance")}</button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((item) => (
            <button key={item.id} onClick={() => setSelectedOperationId(item.id)} className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{item.id} · {item.owner}</p>
                </div>
                <span className="text-2xl">{icon}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(item.statusKey)}`}>{t(item.statusKey)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${severityTone(item.severityKey)}`}>{t(item.severityKey)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{t(item.typeKey)}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <SectionHeader title={t("maintenanceProfile")} subtitle={selectedOperation ? t("selectedMaintenance") : t("noMaintenanceSelected")} />
        {selectedOperation ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-semibold text-white">{selectedOperation.title}</p>
              <p className="mt-1 text-sm text-slate-400">{selectedOperation.id} · {t(selectedOperation.typeKey)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedOperation.statusKey)}`}>{t(selectedOperation.statusKey)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${severityTone(selectedOperation.severityKey)}`}>{t(selectedOperation.severityKey)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("targetModule")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{t(selectedOperation.targetKey)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("operator")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedOperation.owner}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("startedAt")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedOperation.startedAt}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("completedAt")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedOperation.completedAt}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("retention")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{selectedOperation.retention}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("integrityCheck")}</p><p className="mt-2 text-sm font-semibold text-emerald-300">{t(selectedOperation.integrityKey)}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("settingDescription")}</p><p className="mt-2 text-sm leading-6 text-white">{selectedOperation.description}</p></div>
            </div>
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1">{t("viewDetails")}</button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

const SECURITY_MAINTENANCE_MODULE = {
  fr: {
    title: "Audit, sécurité & maintenance",
    subtitle: "Centre de contrôle pour la traçabilité, les accès, les sauvegardes et la stabilité de la plateforme.",
    cards: [
      { title: "Journal d’audit", value: "Actif", detail: "Actions sensibles, connexions et tentatives refusées" },
      { title: "Sécurité RBAC", value: "Renforcée", detail: "Contrôle par rôle pour les modules critiques" },
      { title: "Sauvegardes", value: "À planifier", detail: "Exporter, restaurer et conserver une copie externe" },
      { title: "Maintenance", value: "Surveillance", detail: "Vérification mobile, performance, erreurs et stabilité" },
    ],
    checklist: [
      "Vérifier les permissions Root, Admin, Comptable, Professeur et Étudiant",
      "Contrôler les boutons ajouter, modifier, supprimer et exporter",
      "Tester le mode clair, le mode navy et l’affichage mobile",
      "Créer une sauvegarde avant toute mise à jour majeure",
      "Revoir les journaux d’audit après chaque cycle de correction",
    ],
    logs: [
      { actor: "System", role: "ROOT", action: "Initialisation du journal d’audit", module: "Sécurité", severity: "success" },
      { actor: "System", role: "ROOT", action: "Contrôle RBAC appliqué aux actions sensibles", module: "Permissions", severity: "info" },
      { actor: "Admin", role: "ADMIN", action: "Vérification de la sauvegarde recommandée", module: "Maintenance", severity: "warning" },
    ],
  },
  en: {
    title: "Audit, Security & Maintenance",
    subtitle: "Control center for traceability, access, backups, and platform stability.",
    cards: [
      { title: "Audit log", value: "Active", detail: "Sensitive actions, logins, and denied attempts" },
      { title: "RBAC security", value: "Strengthened", detail: "Role-based control for critical modules" },
      { title: "Backups", value: "To schedule", detail: "Export, restore, and keep an external copy" },
      { title: "Maintenance", value: "Monitoring", detail: "Mobile, performance, errors, and stability checks" },
    ],
    checklist: [
      "Review Root, Admin, Accountant, Teacher, and Student permissions",
      "Check add, edit, delete, and export buttons",
      "Test light mode, navy mode, and mobile display",
      "Create a backup before each major update",
      "Review audit logs after each correction cycle",
    ],
    logs: [
      { actor: "System", role: "ROOT", action: "Audit log initialized", module: "Security", severity: "success" },
      { actor: "System", role: "ROOT", action: "RBAC control applied to sensitive actions", module: "Permissions", severity: "info" },
      { actor: "Admin", role: "ADMIN", action: "Backup verification recommended", module: "Maintenance", severity: "warning" },
    ],
  },
};

function statusBadgeClass(severity) {
  if (severity === "success") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (severity === "warning") return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (severity === "error") return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
}

export default function App() {
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("navy");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  // Au chargement, on vérifie si un utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Pour l'instant on simule la récupération, idéalement on ferait api.auth.me()
      const savedUser = localStorage.getItem("user_info");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const handleLogin = (user) => {
    // Mapping backend user -> frontend expected format
    // Le backend renvoie 'ADMIN', mais le frontend attend 'superAdmin' pour les accès complets (finance, etc.)
    const backendRole = user.role.toLowerCase();
    const normalizedRole = backendRole === 'admin' ? 'superAdmin' : backendRole;
    
    const mappedUser = {
      ...user,
      role: normalizedRole,
      roleKey: normalizedRole === 'superAdmin' ? 'superAdminRole' : 
               normalizedRole === 'teacher' ? 'teacherRole' : 
               normalizedRole === 'student' ? 'studentRole' : 'guestRole',
      avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      color: normalizedRole === 'superAdmin' ? 'from-cyan-400 to-violet-600' : 'from-emerald-400 to-cyan-600'
    };
    setCurrentUser(mappedUser);
    localStorage.setItem("user_info", JSON.stringify(mappedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    setCurrentUser(null);
  };

  const [learners, setLearners] = useState([]);
  const [subjectsData, setSubjectsData] = useState(INITIAL_SUBJECTS);

  // Charger les données réelles depuis le Backend
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const realLearners = await api.learners.getAll();
          setLearners(realLearners);
        } catch (err) {
          console.error("Erreur lors du chargement des apprenants:", err);
          // Optionnel: Garder les données de démo en cas d'erreur
          setLearners(INITIAL_LEARNERS);
        }
      };
      fetchData();
    }
  }, [currentUser]);
  const [cohortsData, setCohortsData] = useState(INITIAL_COHORTS);
  const [teachersData, setTeachersData] = useState(INITIAL_TEACHERS);
  const [coursesData, setCoursesData] = useState(INITIAL_COURSES);
  const [attendanceData, setAttendanceData] = useState(INITIAL_ATTENDANCE);
  const [assessmentsData, setAssessmentsData] = useState(INITIAL_ASSESSMENTS);
  const [resourcesData, setResourcesData] = useState(INITIAL_RESOURCES);
  const [paymentsData, setPaymentsData] = useState(INITIAL_PAYMENTS);
  const [reportsData, setReportsData] = useState(INITIAL_REPORTS);
  const [aiRequestsData, setAiRequestsData] = useState(INITIAL_AI_REQUESTS);
  const [settingsData, setSettingsData] = useState(INITIAL_SETTINGS);
  const [maintenanceData, setMaintenanceData] = useState(INITIAL_MAINTENANCE);
  const [preEnrollments, setPreEnrollments] = useState([]);
  const [publicConfig, setPublicConfig] = useState(DEFAULT_PUBLIC_CONFIG);
  const [selectedSubjectId, setSelectedSubjectId] = useState(INITIAL_SUBJECTS[0].id);
  const [selectedLearnerId, setSelectedLearnerId] = useState(INITIAL_LEARNERS[0].id);
  const [selectedCohortId, setSelectedCohortId] = useState(INITIAL_COHORTS[0].id);
  const [selectedTeacherId, setSelectedTeacherId] = useState(INITIAL_TEACHERS[0].id);
  const [selectedCourseId, setSelectedCourseId] = useState(INITIAL_COURSES[0].id);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(INITIAL_ATTENDANCE[0].id);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(INITIAL_ASSESSMENTS[0].id);
  const [selectedResourceId, setSelectedResourceId] = useState(INITIAL_RESOURCES[0].id);
  const [selectedPaymentId, setSelectedPaymentId] = useState(INITIAL_PAYMENTS[0].id);
  const [selectedReportId, setSelectedReportId] = useState(INITIAL_REPORTS[0].id);
  const [selectedAiRequestId, setSelectedAiRequestId] = useState(INITIAL_AI_REQUESTS[0].id);
  const [selectedSettingId, setSelectedSettingId] = useState(INITIAL_SETTINGS[0].id);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(INITIAL_MAINTENANCE[0].id);
  const t = useT(language);


  const totalRevenue = learners.reduce((sum, learner) => sum + learner.paid, 0);
  const totalBalance = learners.reduce((sum, learner) => sum + learner.balance, 0);
  const avgAttendance = safePercent(learners.reduce((sum, learner) => sum + learner.attendance, 0), learners.length * 100);
  const showFinance = canUserViewFinance(currentUser);
  const showPaymentModule = canUserViewPaymentModule(currentUser);
  const uncorrectedAssessments = assessmentsData.filter((assessment) => assessment.correctionKey === "notCorrected").length;
  const teacherDashboardActions = actions => showFinance ? actions : actions.filter((action) => action.labelKey !== "paymentReceived");
  const teacherDashboardReminders = reminders => showFinance ? reminders : reminders.filter((reminder) => reminder.labelKey !== "paymentFollowup");

  const filteredLearners = learners.filter((learner) => {
    const haystack = `${learner.name} ${learner.phone} ${t(learner.subjectKey)} ${learner.level}`.toLowerCase();
    return haystack.includes(globalSearch.toLowerCase());
  });

  const allNavItems = [
    { id: "dashboard", label: t("dashboard"), icon: ICONS.dashboard },
    { id: "subjects", label: t("subjects"), icon: ICONS.subjects },
    { id: "learners", label: t("learners"), icon: ICONS.users },
    { id: "cohorts", label: t("cohorts"), icon: ICONS.cohorts },
    { id: "teachers", label: t("teachers"), icon: ICONS.teachers },
    { id: "courses", label: t("courses"), icon: ICONS.courses },
    { id: "attendance", label: t("attendance"), icon: ICONS.attendance },
    { id: "exams", label: t("exams"), icon: ICONS.exams },
    { id: "library", label: t("library"), icon: ICONS.library },
    { id: "payments", label: t("payments"), icon: ICONS.payments },
    { id: "reports", label: t("reports"), icon: ICONS.reports },
    { id: "ai", label: t("ai"), icon: ICONS.ai },
    { id: "settings", label: t("settings"), icon: ICONS.settings },
    { id: "backup", label: t("backup"), icon: ICONS.backup },
    { id: "restore", label: t("restore"), icon: ICONS.restore },
    { id: "reset", label: t("reset"), icon: ICONS.reset },
    { id: "audit", label: t("audit"), icon: ICONS.audit }
  ];

  const navItems = allNavItems.filter((item) => {
    const roleAllowsItem = (ROLE_NAV[currentUser?.role || "student"] || ROLE_NAV.student).includes(item.id);
    if (item.id === "payments" && !showPaymentModule) return false;
    return roleAllowsItem;
  });

  useEffect(() => {
    if (!currentUser) return;
    const allowedTabs = navItems.map((item) => item.id);
    if (!allowedTabs.includes(activeTab)) setActiveTab("dashboard");
  }, [currentUser, activeTab, navItems]);

  const activeLabel = navItems.find((item) => item.id === activeTab)?.label || t("dashboard");

  const actions = [
    { labelKey: "newStudent", detail: "Koffi Mensah · A1", time: t("justNow"), icon: ICONS.users, value: "+1" },
    { labelKey: "paymentReceived", detail: "Afi Lawson", time: "18 min", icon: ICONS.payments, value: "+25 000 F" },
    { labelKey: "quizCompleted", detail: "B1 · Simulation", time: "2 h", icon: ICONS.exams, value: "82%" },
    { labelKey: "resourceAdded", detail: "A1 Week Pack", time: "4 h", icon: ICONS.library, value: "PDF" }
  ];

  const reminders = [
    { day: "12", month: "Jan", labelKey: "todayClass", dots: ["bg-cyan-400", "bg-violet-500", "bg-orange-400"] },
    { day: "13", month: "Jan", labelKey: "paymentFollowup", dots: ["bg-violet-500", "bg-orange-400"] },
    { day: "14", month: "Jan", labelKey: "quizReview", dots: ["bg-cyan-400", "bg-emerald-400"] }
  ];

  const activeSelection = (() => {
    if (activeTab === "subjects") return subjectsData.find((item) => item.id === selectedSubjectId);
    if (activeTab === "learners") return learners.find((item) => item.id === selectedLearnerId);
    if (activeTab === "cohorts") return cohortsData.find((item) => item.id === selectedCohortId);
    if (activeTab === "teachers") return teachersData.find((item) => item.id === selectedTeacherId);
    if (activeTab === "courses") return coursesData.find((item) => item.id === selectedCourseId);
    if (activeTab === "attendance") return attendanceData.find((item) => item.id === selectedAttendanceId);
    if (activeTab === "exams") return assessmentsData.find((item) => item.id === selectedAssessmentId);
    if (activeTab === "library") return resourcesData.find((item) => item.id === selectedResourceId);
    if (activeTab === "payments") return paymentsData.find((item) => item.id === selectedPaymentId);
    if (activeTab === "reports") return reportsData.find((item) => item.id === selectedReportId);
    if (activeTab === "ai") return aiRequestsData.find((item) => item.id === selectedAiRequestId);
    if (activeTab === "settings") return settingsData.find((item) => item.id === selectedSettingId);
    if (["backup", "restore", "reset", "audit"].includes(activeTab)) return maintenanceData.find((item) => item.id === selectedMaintenanceId && item.moduleId === activeTab);
    return null;
  })();

  const selectedTitle = activeTab === "reports" && activeSelection ? getReportTitle(activeSelection, t) : activeSelection?.name || activeSelection?.title || (activeSelection?.nameKey ? t(activeSelection.nameKey) : "");
  const selectedDetails = summarizeRecord(activeSelection, t);
  const canEditActive = Boolean(activeSelection) && canRolePerform(currentUser, "edit", activeTab);
  const canDeleteActive = Boolean(activeSelection) && activeTab !== "subjects" && canRolePerform(currentUser, "delete", activeTab);

  function updateActiveSelection(changes) {
    const id = activeSelection?.id;
    if (!id || !canEditActive) return;
    const updateById = (items) => items.map((item) => item.id === id ? { ...item, ...changes } : item);
    if (activeTab === "subjects") setSubjectsData(updateById);
    if (activeTab === "learners") setLearners(updateById);
    if (activeTab === "cohorts") setCohortsData(updateById);
    if (activeTab === "teachers") setTeachersData(updateById);
    if (activeTab === "courses") setCoursesData(updateById);
    if (activeTab === "attendance") setAttendanceData(updateById);
    if (activeTab === "exams") setAssessmentsData(updateById);
    if (activeTab === "library") setResourcesData(updateById);
    if (activeTab === "payments") setPaymentsData(updateById);
    if (activeTab === "reports") setReportsData(updateById);
    if (activeTab === "ai") setAiRequestsData(updateById);
    if (activeTab === "settings") setSettingsData(updateById);
    if (["backup", "restore", "reset", "audit"].includes(activeTab)) setMaintenanceData(updateById);
  }

  function deleteActiveSelection() {
    const id = activeSelection?.id;
    if (!id || !canDeleteActive) return;
    if (activeTab === "subjects") return;
    if (activeTab === "learners") { setLearners((items) => items.filter((item) => item.id !== id)); setSelectedLearnerId(learners.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "cohorts") { setCohortsData((items) => items.filter((item) => item.id !== id)); setSelectedCohortId(cohortsData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "teachers") { setTeachersData((items) => items.filter((item) => item.id !== id)); setSelectedTeacherId(teachersData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "courses") { setCoursesData((items) => items.filter((item) => item.id !== id)); setSelectedCourseId(coursesData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "attendance") { setAttendanceData((items) => items.filter((item) => item.id !== id)); setSelectedAttendanceId(attendanceData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "exams") { setAssessmentsData((items) => items.filter((item) => item.id !== id)); setSelectedAssessmentId(assessmentsData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "library") { setResourcesData((items) => items.filter((item) => item.id !== id)); setSelectedResourceId(resourcesData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "payments") { setPaymentsData((items) => items.filter((item) => item.id !== id)); setSelectedPaymentId(paymentsData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "reports") { setReportsData((items) => items.filter((item) => item.id !== id)); setSelectedReportId(reportsData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "ai") { setAiRequestsData((items) => items.filter((item) => item.id !== id)); setSelectedAiRequestId(aiRequestsData.find((item) => item.id !== id)?.id || ""); }
    if (activeTab === "settings") { setSettingsData((items) => items.filter((item) => item.id !== id)); setSelectedSettingId(settingsData.find((item) => item.id !== id)?.id || ""); }
    if (["backup", "restore", "reset", "audit"].includes(activeTab)) { setMaintenanceData((items) => items.filter((item) => item.id !== id)); setSelectedMaintenanceId(maintenanceData.find((item) => item.id !== id && item.moduleId === activeTab)?.id || ""); }
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fermer le menu mobile lors du changement d'onglet
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  if (!currentUser) {
    return <LoginScreen t={t} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} preEnrollments={preEnrollments} setPreEnrollments={setPreEnrollments} publicConfig={publicConfig} onLogin={handleLogin} />;
  }

  return (
    <div className={cn("min-h-screen overflow-x-hidden bg-[#070b1d] text-white", theme === "light" ? "theme-light" : "theme-navy")}>
      <ThemeStyleBridge theme={theme} />
      <div className="pointer-events-none fixed -left-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 h-[38rem] w-[38rem] rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-[30rem] w-[30rem] rounded-full bg-orange-500/15 blur-3xl" />

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Mobile & Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 transform border-r border-white/10 bg-[#0b1025]/95 p-5 transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:block lg:w-72 lg:translate-x-0 lg:rounded-3xl lg:border lg:bg-[#0b1025]/80 lg:shadow-2xl lg:shadow-black/30 lg:backdrop-blur-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-400 p-[2px] shadow-lg shadow-violet-600/30">
              <div className="rounded-2xl bg-[#0b1025] p-3 text-2xl">{ICONS.courses}</div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{t("brand")}</h1>
              <p className="text-xs text-slate-400">{t("tagline")}</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl bg-white/5 p-2 text-slate-400 lg:hidden">
            {ICONS.close || "✕"}
          </button>
        </div>

        <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 scrollbar-hide">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition duration-300", activeTab === item.id ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40" : "text-slate-400 hover:translate-x-1 hover:bg-white/10 hover:text-white")}>
              {activeTab === item.id ? <span className="absolute -left-5 h-7 w-1 rounded-full bg-violet-400 lg:block hidden" /> : null}
              <span className="text-base transition group-hover:scale-125">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="relative mx-auto flex max-w-[1500px] flex-1 flex-col gap-4 p-3 sm:gap-5 sm:p-5 lg:flex-row">
        {/* On retire l'aside original car il est fusionné ci-dessus */}
        
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1025]/80 text-xl text-white shadow-lg lg:hidden">
                {ICONS.menu || "☰"}
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{activeLabel}</h1>
                  <span className="hidden rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-200 md:inline-flex">{t("brand")}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">{t("overviewSub")}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[680px] lg:grid-cols-[minmax(240px,1fr)_auto_auto_auto_auto] lg:items-center">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1025]/80 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-xl">
                <span className="text-slate-400">{ICONS.search}</span>
                <input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder={t("search")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
              </div>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025]/80 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl">
                <option className="text-slate-950" value="fr">Français</option>
                <option className="text-slate-950" value="en">English</option>
              </select>
              <select value={theme} onChange={(event) => setTheme(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025]/80 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl">
                <option className="text-slate-950" value="navy">{t("navyMode")}</option>
                <option className="text-slate-950" value="light">{t("lightMode")}</option>
              </select>
              <UserMenu t={t} user={currentUser} onLogout={() => { setCurrentUser(null); setActiveTab("dashboard"); }} />
              <button onClick={() => setActiveTab("learners")} className="relative rounded-2xl border border-white/10 bg-[#0b1025]/80 px-4 py-3 text-lg backdrop-blur-xl transition hover:bg-white/10">
                {ICONS.bell}
                {preEnrollments.length ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-orange-500/40">{preEnrollments.length}</span> : null}
              </button>
            </div>
          </header>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm", activeTab === item.id ? "border-violet-400 bg-violet-600 text-white" : "border-white/10 bg-[#0b1025]/80 text-slate-300")}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {activeTab !== "dashboard" ? (
            <ManagementDock t={t} activeLabel={activeLabel} selectedTitle={selectedTitle} selectedDetails={selectedDetails} selectedRecord={activeSelection} onSave={updateActiveSelection} onDelete={deleteActiveSelection} canEdit={canEditActive} canDelete={canDeleteActive} />
          ) : null}

          {activeTab === "dashboard" ? (
            <div className="grid gap-5 xl:grid-cols-[1fr_285px]">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title={t("activeLearners")} value={learners.length} hint={t("learnersHint")} gradient="from-cyan-500 to-sky-700" icon={ICONS.users} />
                  <MetricCard title={t("runningCohorts")} value={cohortsData.length} hint={t("cohortsHint")} gradient="from-violet-600 to-purple-800" icon={ICONS.cohorts} />
                  <MetricCard title={t("avgAttendance")} value={`${avgAttendance}%`} hint={t("attendanceHint")} gradient="from-orange-500 to-red-600" icon={ICONS.attendance} />
                  {showFinance ? <MetricCard title={t("collected")} value={`${formatMoney(totalRevenue)}`} hint={`${t("balance")}: ${formatMoney(totalBalance)}`} gradient="from-fuchsia-600 to-violet-800" icon={ICONS.payments} /> : <MetricCard title={t("quizReview")} value={uncorrectedAssessments} hint={t("exams")} gradient="from-fuchsia-600 to-violet-800" icon={ICONS.exams} />}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
                  <GlassCard>
                    <SectionHeader title={t("programs")} subtitle={t("programSub")} action={t("seeAll")} />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {PROGRAMS.map((program) => (
                        <button key={program.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
                          <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-30 blur-2xl transition group-hover:opacity-70", program.gradient)} />
                          <div className="relative flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">{program.code}</span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{program.count} {t("levels")}</span>
                          </div>
                          <h3 className="relative mt-6 text-lg font-semibold">{t(program.nameKey)}</h3>
                          <p className="relative mt-2 text-xs text-slate-400">{program.detail}</p>
                        </button>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <SectionHeader title={t("levelSummary")} subtitle={t("learnerDistribution")} />
                    <div className="flex items-center justify-center"><ProgressRing value={72} label="LMS" /></div>
                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-3"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-cyan-400" />A1 · 18</div>
                      <div className="rounded-2xl bg-white/5 p-3"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-violet-500" />B1 · 25</div>
                      <div className="rounded-2xl bg-white/5 p-3"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-400" />IT · 10</div>
                      <div className="rounded-2xl bg-white/5 p-3"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-400" />EN · 0</div>
                    </div>
                  </GlassCard>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
                  <GlassCard>
                    <SectionHeader title={t("recentActions")} subtitle={t("recentSub")} />
                    <div className="space-y-4">
                      {teacherDashboardActions(actions).map((action) => (
                        <div key={action.labelKey} className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:translate-x-1 hover:bg-white/10">
                          <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white p-3 text-xl text-slate-950">{action.icon}</div>
                            <div>
                              <p className="font-medium text-white">{t(action.labelKey)}</p>
                              <p className="text-xs text-slate-400">{action.detail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {showFinance || action.labelKey !== "paymentReceived" ? <p className="text-sm font-semibold text-cyan-300">{action.value}</p> : null}
                            <p className="text-xs text-slate-500">{action.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <SectionHeader title={t("monthlySummary")} subtitle={showFinance ? t("monthlySub") : t("attendanceHint")} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">{showFinance ? t("revenue") : t("quizReview")}</p>
                        <p className="mt-2 text-3xl font-semibold text-violet-300">{showFinance ? "75K" : uncorrectedAssessments}</p>
                        <MiniLineChart />
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">{t("attendanceRate")}</p>
                        <div className="mt-5 flex h-32 items-end gap-2">
                          {[60, 44, 72, 52, 88, 74, 92, 70].map((bar, index) => (
                            <div key={index} className="flex flex-1 items-end">
                              <div className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 via-cyan-400 to-orange-300 transition hover:scale-110" style={{ height: `${bar}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard>
                  <SectionHeader title={t("currentCohorts")} action={t("seeAll")} />
                  <div className="grid gap-4 lg:grid-cols-3">
                    {cohortsData.map((cohort) => (
                      <div key={cohort.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-2 hover:bg-white/10">
                        <div className={cn("h-2 bg-gradient-to-r", cohort.gradient)} />
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{t(cohort.nameKey)}</h3>
                              <p className="mt-1 text-xs text-slate-400">{t(cohort.subjectKey)} · {cohort.level}</p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{t(cohort.statusKey)}</span>
                          </div>
                          <div className="mt-5 space-y-2 text-sm text-slate-300">
                            <p>{t("teacher")}: {cohort.teacher}</p>
                            <p>{t("schedule")}: {cohort.schedule}</p>
                            <p>{cohort.students}/{cohort.capacity} {t("students")}</p>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-white/10">
                            <div className={cn("h-2 rounded-full bg-gradient-to-r", cohort.gradient)} style={{ width: `${clampNumber(cohort.progress)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <aside className="space-y-5">
                {currentUser?.role !== "student" ? <button onClick={() => setActiveTab("learners")} className="w-full rounded-3xl bg-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-1 hover:bg-violet-500">
                  {t("newEnrollment")}
                </button> : null}

                {preEnrollments.length ? (
                  <button onClick={() => setActiveTab("learners")} className="w-full rounded-3xl border border-orange-400/30 bg-orange-500/15 p-5 text-left shadow-xl shadow-orange-500/10 transition hover:-translate-y-1 hover:bg-orange-500/20">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-orange-200">{t("pendingEnrollmentBadge")}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{t("preEnrollmentAlertTitle")}</h3>
                        <p className="mt-2 text-xs leading-5 text-orange-100/80">{t("preEnrollmentAlertSub")}</p>
                      </div>
                      <span className="flex h-10 min-w-10 items-center justify-center rounded-2xl bg-orange-500 px-3 text-lg font-bold text-white">{preEnrollments.length}</span>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-cyan-200">{t("viewPendingEnrollments")} →</p>
                  </button>
                ) : null}

                <GlassCard>
                  <SectionHeader title={t("reminders")} action={t("seeAll")} />
                  <div className="grid gap-4">
                    {teacherDashboardReminders(reminders).map((reminder) => (
                      <div key={reminder.labelKey} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-4xl font-light text-white">{reminder.day}</p>
                            <p className="text-sm text-slate-400">{reminder.month}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{t(reminder.labelKey)}</p>
                            <div className="mt-3 flex justify-end gap-2">
                              {reminder.dots.map((dot, index) => <span key={index} className={cn("h-2.5 w-2.5 rounded-full", dot)} />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {currentUser?.role !== "student" ? <GlassCard>
                  <SectionHeader title={t("quickActions")} />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[[t("createLearner"), ICONS.users], [t("createCohort"), ICONS.cohorts], [t("addCourse"), ICONS.courses], [t("createQuiz"), ICONS.exams], [t("sendReminder"), ICONS.bell], [t("generateAI"), ICONS.ai]].map(([label, icon]) => (
                      <button key={label} className="group rounded-3xl border border-white/10 bg-white/5 p-4 text-center transition duration-300 hover:-translate-y-1 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/30">
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl transition group-hover:bg-white group-hover:text-slate-950">{icon}</div>
                        <p className="text-xs text-slate-300 group-hover:text-white">{label}</p>
                      </button>
                    ))}
                  </div>
                </GlassCard> : null}

                {currentUser?.role !== "student" ? <GlassCard>
                  <SectionHeader title={t("learnersTable")} />
                  <div className="space-y-3">
                    {filteredLearners.slice(0, 3).map((learner) => (
                      <div key={learner.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{learner.name}</p>
                            <p className="text-xs text-slate-400">{t(learner.subjectKey)} · {learner.level}</p>
                          </div>
                          <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">{learner.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard> : null}
              </aside>
            </div>
          ) : null}

          {activeTab === "subjects" ? (
            <SubjectModule t={t} language={language} subjects={subjectsData} setSubjects={setSubjectsData} selectedSubjectId={selectedSubjectId} setSelectedSubjectId={setSelectedSubjectId} currentUser={currentUser} learners={learners} cohorts={cohortsData} courses={coursesData} resources={resourcesData} payments={paymentsData} />
          ) : null}

          {activeTab === "learners" ? (
            <LearnerModule t={t} learners={learners} setLearners={setLearners} selectedLearnerId={selectedLearnerId} setSelectedLearnerId={setSelectedLearnerId} preEnrollments={preEnrollments} setPreEnrollments={setPreEnrollments} currentUser={currentUser} />
          ) : null}

          {activeTab === "cohorts" ? (
            <CohortModule t={t} cohorts={cohortsData} setCohorts={setCohortsData} selectedCohortId={selectedCohortId} setSelectedCohortId={setSelectedCohortId} currentUser={currentUser} />
          ) : null}

          {activeTab === "teachers" ? (
            <TeacherModule t={t} teachers={teachersData} setTeachers={setTeachersData} selectedTeacherId={selectedTeacherId} setSelectedTeacherId={setSelectedTeacherId} currentUser={currentUser} />
          ) : null}
          {activeTab === "courses" ? (
            currentUser?.role === "student" ? <StudentReadOnlyModule t={t} moduleId="courses" currentUser={currentUser} learners={learners} courses={coursesData} /> : <CourseModule t={t} language={language} courses={coursesData} setCourses={setCoursesData} selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} currentUser={currentUser} />
          ) : null}
          {activeTab === "attendance" ? (
            currentUser?.role === "student" ? <StudentReadOnlyModule t={t} moduleId="attendance" currentUser={currentUser} learners={learners} attendanceRows={attendanceData} /> : <AttendanceModule t={t} learners={learners} courses={coursesData} cohorts={cohortsData} attendanceRows={attendanceData} setAttendanceRows={setAttendanceData} selectedAttendanceId={selectedAttendanceId} setSelectedAttendanceId={setSelectedAttendanceId} currentUser={currentUser} />
          ) : null}
          {activeTab === "exams" ? (
            currentUser?.role === "student" ? <StudentReadOnlyModule t={t} moduleId="exams" currentUser={currentUser} learners={learners} assessments={assessmentsData} /> : <AssessmentModule t={t} learners={learners} courses={coursesData} assessments={assessmentsData} setAssessments={setAssessmentsData} selectedAssessmentId={selectedAssessmentId} setSelectedAssessmentId={setSelectedAssessmentId} currentUser={currentUser} />
          ) : null}
          {activeTab === "library" ? (
            currentUser?.role === "student" ? <StudentReadOnlyModule t={t} moduleId="library" currentUser={currentUser} learners={learners} resources={resourcesData} /> : <LibraryModule t={t} courses={coursesData} resources={resourcesData} setResources={setResourcesData} selectedResourceId={selectedResourceId} setSelectedResourceId={setSelectedResourceId} currentUser={currentUser} />
          ) : null}
          {activeTab === "payments" ? (
            currentUser?.role === "student" ? <StudentReadOnlyModule t={t} moduleId="payments" currentUser={currentUser} learners={learners} payments={paymentsData} /> : <PaymentModule t={t} payments={paymentsData} setPayments={setPaymentsData} selectedPaymentId={selectedPaymentId} setSelectedPaymentId={setSelectedPaymentId} currentUser={currentUser} />
          ) : null}

          {activeTab === "reports" ? (
            <ReportModule t={t} reports={reportsData} setReports={setReportsData} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} learners={learners} cohorts={cohortsData} courses={coursesData} attendanceRows={attendanceData} assessments={assessmentsData} payments={paymentsData} resources={resourcesData} aiRequests={aiRequestsData} preEnrollments={preEnrollments} currentUser={currentUser} />
          ) : null}

          {activeTab === "ai" ? (
            <AiAssistantModule t={t} aiRequests={aiRequestsData} setAiRequests={setAiRequestsData} selectedAiRequestId={selectedAiRequestId} setSelectedAiRequestId={setSelectedAiRequestId} learners={learners} courses={coursesData} currentUser={currentUser} />
          ) : null}

          {activeTab === "settings" ? (
            <SettingsModule t={t} language={language} settings={settingsData} setSettings={setSettingsData} selectedSettingId={selectedSettingId} setSelectedSettingId={setSelectedSettingId} publicConfig={publicConfig} setPublicConfig={setPublicConfig} />
          ) : null}

          {["backup", "restore", "reset", "audit"].includes(activeTab) ? (
            <MaintenanceModule t={t} moduleId={activeTab} icon={navItems.find((item) => item.id === activeTab)?.icon} operations={maintenanceData} setOperations={setMaintenanceData} selectedOperationId={selectedMaintenanceId} setSelectedOperationId={setSelectedMaintenanceId} currentUser={currentUser} />
          ) : null}

          {activeTab !== "dashboard" && activeTab !== "subjects" && activeTab !== "learners" && activeTab !== "cohorts" && activeTab !== "teachers" && activeTab !== "courses" && activeTab !== "attendance" && activeTab !== "exams" && activeTab !== "library" && activeTab !== "payments" && activeTab !== "reports" && activeTab !== "ai" && activeTab !== "settings" && activeTab !== "backup" && activeTab !== "restore" && activeTab !== "reset" && activeTab !== "audit" ? (
            <ModulePlaceholder t={t} icon={navItems.find((item) => item.id === activeTab)?.icon} title={activeLabel} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

/* 
  --------------------------------------------------------------------------
  AUDIT INTEGRATION EXAMPLES (Commented for build stabilization)
  --------------------------------------------------------------------------
  Section à finaliser après stabilisation du MVP.
*/

// export interface AuditRootControlsProps {
//   currentUser: CurrentUser | null;
//   selectedAuditRecord: AuditOperation | null;
//   repo: AuditRepository;
//   ipAddress?: string | null;
//   deviceInfo?: string | null;
//   onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
//   onCloseModal?: () => void;
// }

// export interface RootAuditFormState {
//   reason: string;
//   confirmText: string;
// }

// ... (reste de la section déjà gérée par le commentaire bloc ci-dessus)

// Minimal JSX example.
// Adapt Button, Dialog, Input, Textarea, and Toast to your UI library.
export const rootAuditControlsJsxExample = `
const ui = getAuditUiState(currentUser, selectedAuditRecord);

<Button disabled={!ui.editTab} onClick={() => openAuditModal('Modifier')}>
  Modifier
</Button>

<Button disabled={!ui.archiveButton} onClick={() => openAuditModal('Archiver')}>
  Archiver
</Button>

<Button disabled={!ui.restoreButton} onClick={() => openAuditModal('Restaurer')}>
  Restaurer
</Button>

<Button disabled={!ui.deleteButton} onClick={() => openAuditModal('Supprimer opération test')}>
  Supprimer
</Button>

<Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Validation ROOT requise</DialogTitle>
      <DialogDescription>
        Indiquez la raison de cette action, puis tapez CONFIRMER.
      </DialogDescription>
    </DialogHeader>

    <Textarea
      value={rootAuditForm.reason}
      onChange={(event) => setRootAuditForm({ ...rootAuditForm, reason: event.target.value })}
      placeholder="Raison de l’action"
    />

    <Input
      value={rootAuditForm.confirmText}
      onChange={(event) => setRootAuditForm({ ...rootAuditForm, confirmText: event.target.value })}
      placeholder="Tapez CONFIRMER"
    />

    <Button
      onClick={() =>
        handleRootAuditAction({
          currentUser,
          selectedAuditRecord,
          repo,
          action: pendingAuditAction,
          form: rootAuditForm,
          changes: auditEditChanges,
          ipAddress,
          deviceInfo,
          onNotify,
          onCloseModal: () => setAuditModalOpen(false),
        })
      }
    >
      Valider
    </Button>
  </DialogContent>
</Dialog>
`;

// Supabase RLS policy template.
// Use this only after mapping auth.uid() to your profiles/users table.
export const auditSupabaseRlsPolicySql = `
alter table audit_operations enable row level security;

create policy if not exists "ROOT can view all audit operations"
on audit_operations
for select
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ROOT'
  )
);

create policy if not exists "ROOT can insert audit traces"
on audit_operations
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ROOT'
  )
);

create policy if not exists "ROOT can update audit operations"
on audit_operations
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ROOT'
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ROOT'
  )
);

create policy if not exists "ROOT can delete test audit operations only"
on audit_operations
for delete
using (
  is_test_operation = true
  and exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ROOT'
  )
);
`;

export const finalAuditImplementationSteps = [
  'Run auditDatabaseMigrationSql in Supabase SQL Editor.',
  'Review the profiles table name and role field before applying RLS policies.',
  'Connect createSupabaseAuditRepository(supabase) inside the Audit page.',
  'Replace old readOnly checks with hasAuditPermission and getAuditUiState.',
  'Add the ROOT validation modal requiring reason and CONFIRMER.',
  'Connect Archive, Restore, Delete, and Edit buttons to handleRootAuditAction.',
  'Test as ROOT, ADMIN, COMPTABLE, PROFESSEUR, and ETUDIANT.',
  'Verify mobile mode, light mode, and navy mode before deployment.',
];

