import React, { useMemo, useState } from 'react';
import { GlassCard, SectionHeader } from './shared/CommonUI';
import { ICONS, FIELD_OPTIONS } from '../constants/ui';
import { formatMoney, downloadCsv, clampNumber, cn } from '../utils/helpers';
import { canRolePerform, canUserViewFinance, canUserManagePreEnrollments } from '../utils/rbac';

export function LearnerModule({ t, learners, setLearners, selectedLearnerId, setSelectedLearnerId, preEnrollments = [], setPreEnrollments, currentUser }) {
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
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
