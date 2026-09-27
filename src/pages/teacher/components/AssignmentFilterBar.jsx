import React from "react";

export default function AssignmentFilterBar({
  filterClassroom,
  setFilterClassroom,
  filterSubject,
  setFilterSubject,
  filterSearch,
  setFilterSearch,
  classrooms,
  filterSubjects,
  totalCount,
  filteredCount,
  onReset,
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
          Filter Assignments
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Filter assignments by classroom, subject, or search.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* CLASSROOM FILTER */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Classroom
          </label>
          <select
            value={filterClassroom}
            onChange={(e) => setFilterClassroom(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Classrooms</option>
            {classrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name}
                {classroom.section ? ` - ${classroom.section}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* SUBJECT FILTER */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Subject
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Subjects</option>
            {filterSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
                {subject.code ? ` (${subject.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH FILTER */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Search
          </label>
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search assignment..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredCount} of {totalCount} assignments
        </p>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
