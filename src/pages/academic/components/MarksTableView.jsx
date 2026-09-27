import React from "react";

export default function MarksTableView({
  classrooms,
  viewClassroom,
  viewSubject,
  viewSubjects,
  viewStudents,
  selectedViewSubject,
  marksLoading,
  allMarks,
  getStudentMark,
  onClassroomChange,
  onSubjectChange,
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          View Student Marks
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Select a classroom and subject to view student marks.
        </p>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* CLASSROOM */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Classroom
          </label>
          <select
            value={viewClassroom}
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
            value={viewSubject}
            onChange={onSubjectChange}
            disabled={!viewClassroom}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800"
          >
            <option value="">
              {!viewClassroom ? "Select Classroom First" : "Select Subject"}
            </option>
            {viewSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
                {subject.code ? ` (${subject.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NO SUBJECT */}
      {viewClassroom && viewSubjects.length === 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
          No subjects are assigned to you for this classroom.
        </div>
      )}

      {/* LOADING */}
      {marksLoading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading student marks...
          </p>
        </div>
      )}

      {/* MARKS TABLE */}
      {!marksLoading && viewClassroom && viewSubject && (
        <div className="mt-4">
          {/* TABLE HEADER */}
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedViewSubject?.name || "Subject"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Examination marks
              </p>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              {viewStudents.length} Students
            </span>
          </div>

          {viewStudents.length === 0 ? (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-6 text-center dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No students found in this classroom.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-xs dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-gray-800 dark:bg-slate-800">
                  <tr className="dark:border-slate-700">
                    <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      #
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Student
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      ID
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      First Term
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Midterm
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Final
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Assignment
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Grade
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 dark:bg-gray-900">
                  {viewStudents.map((student, index) => {
                    const first_term = getStudentMark(student._id, "first_term");
                    const midterm = getStudentMark(student._id, "Midterm");
                    const final = getStudentMark(student._id, "Final");
                    const assignment = getStudentMark(student._id, "Assignment");

                    const grade =
                      final?.grade ||
                      midterm?.grade ||
                      first_term?.grade ||
                      assignment?.grade ||
                      "-";

                    const remarks =
                      final?.remarks ||
                      midterm?.remarks ||
                      first_term?.remarks ||
                      assignment?.remarks ||
                      "-";

                    return (
                      <tr
                        key={student._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400 dark:border-slate-700">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900 dark:text-white dark:border-slate-700">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400 dark:border-slate-700">
                          {student.rollNumber || "-"}
                        </td>

                        {/* FIRST TERM */}
                        <td className="whitespace-nowrap px-3 py-2 text-center text-slate-700 dark:text-slate-300 dark:border-slate-700">
                          {first_term ? (
                            <div>
                              <div className="font-medium">
                                {first_term.marksObtained}/{first_term.maxMarks}
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500">
                                {first_term.grade}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* MIDTERM */}
                        <td className="whitespace-nowrap px-3 py-2 text-center text-slate-700 dark:text-slate-300 dark:border-slate-700">
                          {midterm ? (
                            <div>
                              <div className="font-medium">
                                {midterm.marksObtained}/{midterm.maxMarks}
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500">
                                {midterm.grade}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* FINAL */}
                        <td className="whitespace-nowrap px-3 py-2 text-center text-slate-700 dark:text-slate-300 dark:border-slate-700">
                          {final ? (
                            <div>
                              <div className="font-medium">
                                {final.marksObtained}/{final.maxMarks}
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500">
                                {final.grade}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* ASSIGNMENT */}
                        <td className="whitespace-nowrap px-3 py-2 text-center text-slate-700 dark:text-slate-300 dark:border-slate-700">
                          {assignment ? (
                            <div>
                              <div className="font-medium">
                                {assignment.marksObtained}/{assignment.maxMarks}
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500">
                                {assignment.grade}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* GRADE */}
                        <td className="whitespace-nowrap px-3 py-2 text-center dark:border-slate-700">
                          <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {grade}
                          </span>
                        </td>

                        {/* REMARKS */}
                        <td className="max-w-[200px] truncate px-3 py-2 text-slate-500 dark:text-slate-400 dark:border-slate-700">
                          {remarks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
