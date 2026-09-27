import React from "react";
import { Plus, Check, RotateCcw, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { PERIOD_SLOTS } from "../../../constants/timetable";

export default function TimetableForm({
  editingId,
  formData,
  classroomSubjects,
  subjectTeachers,
  days,
  saving,
  message,
  error,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {editingId ? "Edit Timetable Period Slot" : "Schedule New Period Slot"}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Assign a subject, faculty instructor, day, and period slot.
            </p>
          </div>
        </div>

        {editingId && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Editing Mode
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* SUBJECT */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Select Subject</option>
            {classroomSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* TEACHER */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Teacher <span className="text-rose-500">*</span>
          </label>
          <select
            name="teacher"
            value={formData.teacher}
            onChange={onChange}
            required
            disabled={!formData.subject}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/60"
          >
            <option value="">
              {formData.subject ? "Select Teacher" : "Select Subject First"}
            </option>
            {subjectTeachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        {/* DAY */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Day <span className="text-rose-500">*</span>
          </label>
          <select
            name="day"
            value={formData.day}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* PERIOD */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Period <span className="text-rose-500">*</span>
          </label>
          <select
            name="period"
            value={formData.period || ""}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Select Period</option>
            {PERIOD_SLOTS.map((slot) => (
              <option key={slot.period} value={slot.period}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        {/* FEEDBACK MESSAGES */}
        {(message || error) && (
          <div className="sm:col-span-2 lg:col-span-4">
            {message && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={15} />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {editingId ? <Check size={14} /> : <Plus size={14} />}
            {saving ? "Saving..." : editingId ? "Save Slot Changes" : "Assign Period Slot"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw size={13} />
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
