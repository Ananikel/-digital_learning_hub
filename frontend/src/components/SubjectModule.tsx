import React, { useMemo, useState } from 'react';
import { GlassCard, SectionHeader } from './shared/CommonUI';
import { ICONS, FIELD_OPTIONS } from '../constants/ui';
import { formatMoney, cn } from '../utils/helpers';

export function SubjectModule({ t, language = "fr", subjects, setSubjects, selectedSubjectId, setSelectedSubjectId, currentUser, learners = [], cohorts = [], courses = [], resources = [], payments = [] }) {
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
    return { 
        learners: learners.filter((item) => item.subjectKey === subjectKey).length, 
        cohorts: cohorts.filter((item) => item.subjectKey === subjectKey).length, 
        courses: courses.filter((item) => item.subjectKey === subjectKey).length, 
        resources: resources.filter((item) => item.subjectKey === subjectKey).length, 
        payments: payments.filter((item) => item.subjectKey === subjectKey).length 
    };
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
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-white">{t("subjectBusinessForm")}</h3>
              <p className="mt-1 text-xs leading-5 text-violet-100/80">{t("subjectBusinessFormSub")}</p>
              {!canManageSubjects ? <p className="mt-2 inline-flex rounded-full bg-orange-400/15 px-3 py-1 text-xs text-orange-200">{t("readOnlyMode")}: {t("noEditPermission")}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-violet-100">{editingSubjectId ? t("updateMode") : t("createMode")}</span>
              <button disabled={!canManageSubjects} onClick={resetSubjectForm} className={cn("rounded-full px-3 py-1 text-xs transition", canManageSubjects ? "bg-white/10 text-slate-200 hover:bg-white/20" : "bg-white/5 text-slate-500")}>{t("newLearnerForm")}</button>
              <button disabled={!canManageSubjects} onClick={editSelectedSubject} className={cn("rounded-full px-3 py-1 text-xs transition", canManageSubjects ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" : "bg-white/5 text-slate-500")}>{t("editSelectedSubject")}</button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{t("subjectIdentity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectNameFr")}</span><input disabled={!canManageSubjects} value={subjectDraft.nameFr} onChange={(event) => updateSubjectDraft("nameFr", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectNameEn")}</span><input disabled={!canManageSubjects} value={subjectDraft.nameEn} onChange={(event) => updateSubjectDraft("nameEn", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectCode")}</span><input disabled={!canManageSubjects} value={subjectDraft.code} onChange={(event) => updateSubjectDraft("code", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">Key</span><input disabled={!canManageSubjects} value={subjectDraft.subjectKey} onChange={(event) => updateSubjectDraft("subjectKey", event.target.value)} placeholder="new_subject" className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("subjectCategory")}</span><select disabled={!canManageSubjects} value={subjectDraft.categoryKey} onChange={(event) => updateSubjectDraft("categoryKey", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none">{FIELD_OPTIONS.subjectCategoryKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1025]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("subjectRules")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs text-slate-400">{t("subjectLevels")}</span><input disabled={!canManageSubjects} value={subjectDraft.levelsText} onChange={(event) => updateSubjectDraft("levelsText", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectDuration")}</span><input disabled={!canManageSubjects} value={subjectDraft.duration} onChange={(event) => updateSubjectDraft("duration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectWeeklySessions")}</span><input disabled={!canManageSubjects} type="number" value={subjectDraft.weeklySessions} onChange={(event) => updateSubjectDraft("weeklySessions", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectSessionDuration")}</span><input disabled={!canManageSubjects} value={subjectDraft.sessionDuration} onChange={(event) => updateSubjectDraft("sessionDuration", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
                <label className="block"><span className="mb-2 block text-xs text-slate-400">{t("subjectBaseFee")}</span><input disabled={!canManageSubjects} type="number" value={subjectDraft.baseFee} onChange={(event) => updateSubjectDraft("baseFee", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1025] px-3 py-2 text-sm text-white outline-none disabled:text-slate-500" /></label>
              </div>
            </div>
          </div>
          <button disabled={!canManageSubjects} onClick={saveSubjectForm} className={cn("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageSubjects ? "bg-gradient-to-r from-cyan-500 via-violet-600 to-orange-500 text-white shadow-violet-600/30 hover:-translate-y-1" : "bg-white/5 text-slate-500")}>{t("saveSubject")}</button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-slate-400">{ICONS.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchSubjects")} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0b1025] px-4 py-3 text-sm text-white outline-none">
            <option value="all">{t("filterAll")}</option>
            {FIELD_OPTIONS.subjectCategoryKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            {FIELD_OPTIONS.subjectStatusKey.map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select>
          <button disabled={!canManageSubjects} onClick={addDemoSubject} className={cn("rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition", canManageSubjects ? "bg-violet-600 text-white shadow-violet-600/30 hover:-translate-y-1 hover:bg-violet-500" : "bg-white/5 text-slate-500")}>{t("addDemoSubject")}</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((subject) => {
            const usage = getSubjectUsage(subject.subjectKey);
            const usageCount = Object.values(usage).reduce((sum, value) => sum + value, 0);
            return (
              <button key={subject.id} onClick={() => setSelectedSubjectId(subject.id)} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition duration-300 hover:-translate-y-2 hover:bg-white/10">
                <div className={cn("h-2 bg-gradient-to-r", colorGradient(subject.color))} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{subjectLabel(subject)}</h3>
                      <p className="mt-1 text-xs text-slate-400">{subject.code} · {t(subject.categoryKey)} · {(subject.levels || []).join(" · ")}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${statusTone(subject.statusKey)}`}>{t(subject.statusKey)}</span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{subject.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100">{t("subjectUsage")}: {usageCount}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{formatMoney(subject.baseFee)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title={t("subjectProfile")} subtitle={selectedSubject ? t("selectedSubject") : t("noSubjectSelected")} />
        {selectedSubject ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className={cn("h-2 bg-gradient-to-r", colorGradient(selectedSubject.color))} />
              <div className="p-5">
                <p className="text-2xl font-semibold text-white">{subjectLabel(selectedSubject)}</p>
                <p className="mt-1 text-sm text-slate-400">{selectedSubject.code} · {selectedSubject.subjectKey}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs ${statusTone(selectedSubject.statusKey)}`}>{t(selectedSubject.statusKey)}</span>
                  <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-200">{t(selectedSubject.categoryKey)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectLevels")}</p><p className="mt-2 text-sm font-semibold text-white">{(selectedSubject.levels || []).join(", ")}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectBaseFee")}</p><p className="mt-2 text-sm font-semibold text-cyan-300">{formatMoney(selectedSubject.baseFee)}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectDuration")}</p><p className="mt-2 text-sm font-semibold text-white">{selectedSubject.duration}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("subjectWeeklySessions")}</p><p className="mt-2 text-sm font-semibold text-orange-300">{selectedSubject.weeklySessions} · {selectedSubject.sessionDuration}</p></div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{t("subjectUsage")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <span className="text-slate-300">{t("linkedLearners")}: {selectedUsage.learners}</span>
                  <span className="text-slate-300">{t("linkedCohorts")}: {selectedUsage.cohorts}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0b1025]/60 p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("actions")}</p>
                <div className="grid gap-2">
                    <button onClick={() => activateSubject(selectedSubject)} className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20">{t("activateSubject")}</button>
                    <button onClick={() => archiveSubject(selectedSubject)} className="rounded-2xl bg-orange-500/10 px-4 py-3 text-xs font-semibold text-orange-100 transition hover:bg-orange-500/20">{t("archiveSubject")}</button>
                    {canHardDelete && <button onClick={() => deleteSubject(selectedSubject)} className="rounded-2xl bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20">{t("delete")}</button>}
                </div>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
