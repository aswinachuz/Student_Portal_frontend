import React from "react";

// =====================================================
// STATUS BUTTON
// =====================================================
function StatusButton({ status, editable, onChange }) {
  if (!editable) {
    if (status === "Present") {
      return (
        <span className="flex h-7 w-9 items-center justify-center rounded bg-green-100 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
          P
        </span>
      );
    }
    if (status === "Absent") {
      return (
        <span className="flex h-7 w-9 items-center justify-center rounded bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
          A
        </span>
      );
    }
    if (status === "Duty Leave") {
      return (
        <span className="flex h-7 w-9 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          DL
        </span>
      );
    }
    return <span className="text-slate-300 dark:text-slate-600">—</span>;
  }
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-9 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-0 text-center text-[10px] font-bold outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
    >
      <option value="">-</option>
      <option value="Present">P</option>
      <option value="Absent">A</option>
      <option value="Duty Leave">DL</option>
    </select>
  );
}

export default function AttendanceRegisterTable({
  classroom,
  currentMonth,
  students,
  filteredStudents,
  monthDays,
  attendanceData,
  today,
  todaySubmitted,
  attendanceLoading,
  registerScrollRef,
  todayHeaderRef,
  getStudentSummary,
  onAttendanceChange,
}) {
  const [year, month] = currentMonth.split("-").map(Number);
  const isToday = (date) => date === today;
  const isFutureDate = (date) => date > today;
  const isPastDate = (date) => date < today;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-gray-800">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Attendance Register
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              {classroom?.name}
              {classroom?.section ? ` - ${classroom.section}` : ""}
              {" • "}
              {new Date(year, month - 1).toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            {students.length} Students
          </span>
        </div>
      </div>

      {attendanceLoading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading monthly attendance...
          </p>
        </div>
      ) : (
        <div ref={registerScrollRef} className="overflow-x-auto">
          <table className="min-w-max border-collapse text-xs dark:text-slate-200">
            <thead className="dark:bg-slate-800">
              <tr className="bg-slate-100 dark:bg-slate-700 dark:border-slate-700">
                <th className="sticky left-0 z-20 min-w-[60px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-center text-[10px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  Roll
                </th>

                <th className="sticky left-[60px] z-20 min-w-[170px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-left text-[10px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  Student Name
                </th>

                {monthDays.map((date) => {
                  const day = date.split("-")[2];
                  const todayCell = isToday(date);
                  const future = isFutureDate(date);

                  return (
                    <th
                      key={date}
                      ref={todayCell ? todayHeaderRef : null}
                      className={`min-w-[48px] border border-slate-200 dark:border-slate-700 px-1 py-2 text-center text-[10px] font-semibold dark:border-slate-600 ${
                        todayCell
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                          : future
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:bg-slate-800"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div>{day}</div>
                      {todayCell && (
                        <div className="mt-0.5 text-[8px] font-bold">TODAY</div>
                      )}
                    </th>
                  );
                })}

                <th className="sticky right-0 z-20 min-w-[65px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-center text-[10px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  %
                </th>
              </tr>
            </thead>

            <tbody className="dark:bg-gray-900">
              {filteredStudents.length === 0 ? (
                <tr className="dark:border-slate-700">
                  <td
                    colSpan={monthDays.length + 3}
                    className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const summary = getStudentSummary(student._id);

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-750"
                    >
                      <td className="sticky left-0 z-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-2 py-2 text-center text-[10px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-gray-800 dark:text-slate-200">
                        {student.rollNumber || "-"}
                      </td>

                      <td className="sticky left-[60px] z-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2 dark:border-slate-600 dark:bg-gray-800">
                        <div className="max-w-[160px] truncate text-[11px] font-medium text-slate-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="max-w-[160px] truncate text-[9px] text-slate-500 dark:text-slate-400">
                          {student.email}
                        </div>
                      </td>

                      {monthDays.map((date) => {
                        const status = attendanceData[student._id]?.[date];
                        const todayCell = isToday(date);
                        const future = isFutureDate(date);
                        const past = isPastDate(date);

                        return (
                          <td
                            key={date}
                            className={`border border-slate-200 dark:border-slate-700 p-0.5 text-center dark:border-slate-600 ${
                              todayCell
                                ? "bg-blue-50 dark:bg-blue-950/30"
                                : future
                                ? "bg-slate-50 dark:bg-slate-800/60"
                                : ""
                            }`}
                          >
                            {status ? (
                              <StatusButton
                                status={status}
                                editable={todayCell && !todaySubmitted}
                                onChange={(newStatus) =>
                                  onAttendanceChange(student._id, date, newStatus)
                                }
                              />
                            ) : todayCell ? (
                              <StatusButton
                                status=""
                                editable={!todaySubmitted}
                                onChange={(newStatus) =>
                                  onAttendanceChange(student._id, date, newStatus)
                                }
                              />
                            ) : past ? (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="sticky right-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-2 py-2 text-center text-[10px] font-bold text-slate-700 dark:border-slate-600 dark:bg-gray-800 dark:text-slate-200">
                        {summary.percentage}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
