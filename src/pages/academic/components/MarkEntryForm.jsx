import React from "react";

export default function MarkEntryForm({
  formData,
  classrooms,
  filteredSubjects,
  filteredStudents,
  saving,
  message,
  error,
  onChange,
  onClassroomChange,
  onSubmit,
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Enter Marks
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Enter marks for an individual student.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* CLASSROOM */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Classroom
          </label>
          <select
            value={formData.classroom}
            onChange={onClassroomChange}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name} - {classroom.section}
              </option>
            ))}
          </select>
        </div>

        {/* SUBJECT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Subject
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={onChange}
            disabled={!formData.classroom}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800"
          >
            <option value="">
              {!formData.classroom ? "Select Classroom First" : "Select Subject"}
            </option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
                {subject.code ? ` (${subject.code})` : ""}
              </option>
            ))}
          </select>

          {formData.classroom && filteredSubjects.length === 0 && (
            <p className="mt-1 text-[10px] text-amber-500">
              No subject assigned to you for this classroom.
            </p>
          )}
        </div>

        {/* STUDENT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Student
          </label>
          <select
            name="student"
            value={formData.student}
            onChange={onChange}
            disabled={!formData.subject}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800"
          >
            <option value="">
              {!formData.subject ? "Select Subject First" : "Select Student"}
            </option>
            {filteredStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
                {student.rollNumber ? ` (${student.rollNumber})` : ""}
              </option>
            ))}
          </select>

          {formData.subject && filteredStudents.length === 0 && (
            <p className="mt-1 text-[10px] text-amber-500">
              No students found in this classroom.
            </p>
          )}
        </div>

        {/* EXAM TYPE */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Exam Type
          </label>
          <select
            name="examType"
            value={formData.examType}
            onChange={onChange}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="first_term">First Term</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>

        {/* MARKS */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Marks Obtained
          </label>
          <input
            type="number"
            name="marksObtained"
            value={formData.marksObtained}
            onChange={onChange}
            min="0"
            step="0.01"
            placeholder="85"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* MAX MARKS */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Maximum Marks
          </label>
          <input
            type="number"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={onChange}
            min="1"
            step="0.01"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* REMARKS */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Teacher Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={onChange}
            rows="2"
            placeholder="Enter teacher remarks..."
            className="w-full resize-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* MESSAGES */}
        <div className="md:col-span-2">
          {message && (
            <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* SAVE */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </form>
    </div>
  );
}
