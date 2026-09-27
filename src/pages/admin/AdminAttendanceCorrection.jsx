import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { getTodayDate, formatDate } from "../../utils/dateUtils";

export default function AdminAttendanceCorrection() {
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [classroomId, setClassroomId] = useState("");
  const [date, setDate] = useState(getTodayDate());

  const [loadingClassrooms, setLoadingClassrooms] =
    useState(true);
  const [loadingStudents, setLoadingStudents] =
    useState(false);
  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD CLASSROOMS
  // =====================================================

  const fetchClassrooms = async () => {
    try {
      setLoadingClassrooms(true);
      setError("");

      const response =
        await axiosClient.get(
          "/classrooms"
        );

      const data =
        response.data?.data ||
        response.data ||
        [];

      setClassrooms(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD CLASSROOMS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load classrooms."
      );
    } finally {
      setLoadingClassrooms(false);
    }
  };

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const fetchStudents = async () => {
    if (!classroomId) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");

      const response =
        await axiosClient.get(
          "/admin/students",
          {
            params: {
              classroomId,
            },
          }
        );

      const data =
        response.data?.data ||
        response.data?.students ||
        response.data ||
        [];

      setStudents(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD STUDENTS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );

      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  const fetchAttendance = async () => {
    if (
      !classroomId ||
      !date
    ) {
      return;
    }

    try {
      setLoadingAttendance(true);
      setError("");

      const response =
        await axiosClient.get(
          "/attendance",
          {
            params: {
              classroomId,
              startDate: date,
              endDate: date,
            },
          }
        );

      const records =
        response.data || [];

      const attendanceMap = {};

      if (Array.isArray(records)) {
        records.forEach(
          (record) => {
            const studentId =
              record.student?._id ||
              record.student;

            if (
              studentId &&
              record.status
            ) {
              attendanceMap[
                String(studentId)
              ] = record.status;
            }
          }
        );
      }

      setAttendance(
        attendanceMap
      );
    } catch (err) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );

      setAttendance({});
    } finally {
      setLoadingAttendance(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // =====================================================
  // CLASSROOM CHANGE
  // =====================================================

  useEffect(() => {
    if (!classroomId) {
      setStudents([]);
      setAttendance({});
      return;
    }

    fetchStudents();
  }, [classroomId]);

  // =====================================================
  // LOAD ATTENDANCE AFTER STUDENTS / DATE
  // =====================================================

  useEffect(() => {
    if (
      classroomId &&
      date
    ) {
      fetchAttendance();
    }
  }, [
    classroomId,
    date,
  ]);

  // =====================================================
  // CHANGE ATTENDANCE
  // =====================================================

  const handleAttendanceChange = (
    studentId,
    status
  ) => {
    setAttendance(
      (previous) => ({
        ...previous,
        [studentId]: status,
      })
    );

    setSuccess("");
    setError("");
  };

  // =====================================================
  // SAVE CORRECTIONS
  // =====================================================

  const handleSave = async () => {
    if (!classroomId) {
      setError(
        "Please select a classroom."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select a date."
      );
      return;
    }

    if (students.length === 0) {
      setError(
        "No students found in this classroom."
      );
      return;
    }

    const incomplete =
      students.some(
        (student) =>
          !attendance[
            student._id
          ]
      );

    if (incomplete) {
      setError(
        "Please select attendance for every student."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const attendanceRecords =
        students.map(
          (student) => ({
            studentId:
              student._id,

            status:
              attendance[
                student._id
              ],
          })
        );

      const response =
        await axiosClient.put(
          "/attendance/correction",
          {
            classroomId,
            date,
            attendanceRecords,
          }
        );

      setSuccess(
        response.data?.message ||
          "Attendance corrected successfully."
      );

      // Reload from database
      await fetchAttendance();
    } catch (err) {
      console.error(
        "SAVE ATTENDANCE CORRECTION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save attendance correction."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SELECT ALL PRESENT
  // =====================================================

  const markAll = (status) => {
    const updated = {};

    students.forEach(
      (student) => {
        updated[
          student._id
        ] = status;
      }
    );

    setAttendance(updated);
    setSuccess("");
    setError("");
  };

  // =====================================================
  // SELECTED CLASSROOM
  // =====================================================

  const selectedClassroom =
    classrooms.find(
      (classroom) =>
        String(classroom._id) ===
        String(classroomId)
    );

  // =====================================================
  // LOADING CLASSROOMS
  // =====================================================

  if (loadingClassrooms) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading classrooms...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Attendance Correction
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Admin can correct attendance for any classroom and date.
        </p>
      </div>

      {/* =================================================
          ADMIN NOTICE
      ================================================= */}

      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950">

        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
          Admin Correction Mode
        </p>

        <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-300">
          Corrections made here can change attendance even after a teacher has submitted and locked it.
        </p>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="grid gap-3 md:grid-cols-2">

          {/* CLASSROOM */}

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              Classroom
            </label>

            <select
              value={classroomId}
              onChange={(e) =>
                setClassroomId(
                  e.target.value
                )
              }
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">
                Select Classroom
              </option>

              {classrooms.map(
                (classroom) => (
                  <option
                    key={classroom._id}
                    value={classroom._id}
                  >
                    {classroom.name}

                    {classroom.section
                      ? ` - ${classroom.section}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* DATE */}

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              max={getTodayDate()}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {success}
        </div>
      )}

      {/* =================================================
          CLASSROOM INFORMATION
      ================================================= */}

      {selectedClassroom && (
        <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950 px-3 py-2 dark:border-blue-900 dark:bg-blue-950">

          <div className="flex flex-wrap items-center justify-between gap-2">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Selected Classroom
              </p>

              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedClassroom.name}

                {selectedClassroom.section
                  ? ` - ${selectedClassroom.section}`
                  : ""}
              </h2>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Date
              </p>

              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(date)}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =================================================
          STUDENT SECTION
      ================================================= */}

      {classroomId && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-gray-900">

          {/* HEADER */}

          <div className="flex flex-col gap-2.5 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Student Attendance
              </h2>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {students.length} student
                {students.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {/* QUICK ACTIONS */}

            {students.length > 0 && (
              <div className="flex flex-wrap gap-1.5">

                <button
                  type="button"
                  onClick={() =>
                    markAll(
                      "Present"
                    )
                  }
                  className="rounded-md bg-green-600 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-green-700"
                >
                  All Present
                </button>

                <button
                  type="button"
                  onClick={() =>
                    markAll(
                      "Absent"
                    )
                  }
                  className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-red-700"
                >
                  All Absent
                </button>

                <button
                  type="button"
                  onClick={() =>
                    markAll(
                      "Duty Leave"
                    )
                  }
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                >
                  All Duty Leave
                </button>

              </div>
            )}

          </div>

          {/* LOADING */}

          {loadingStudents ||
          loadingAttendance ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loading attendance...
              </p>
            </div>
          ) : students.length ===
            0 ? (
            <div className="p-8 text-center">

              <p className="text-xs text-slate-500 dark:text-slate-400">
                No students found in this classroom.
              </p>

            </div>
          ) : (
            <>
              {/* TABLE */}

              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px] border-collapse text-xs dark:text-slate-200">

                  <thead className="dark:bg-slate-800">

                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">

                      <th className="w-[70px] border-r border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        Roll
                      </th>

                      <th className="border-r border-slate-200 dark:border-slate-700 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        Student Name
                      </th>

                      <th className="w-[180px] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        Attendance
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 dark:bg-gray-900">

                    {students.map(
                      (student) => (
                        <tr
                          key={
                            student._id
                          }
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >

                          {/* ROLL */}

                          <td className="border-r border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                            {student.rollNumber ||
                              "-"}
                          </td>

                          {/* NAME */}

                          <td className="border-r border-slate-200 dark:border-slate-700 px-4 py-2 dark:border-slate-700">

                            <p className="font-semibold text-slate-900 dark:text-white">
                              {student.name}
                            </p>

                            {student.email && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {student.email}
                              </p>
                            )}

                          </td>

                          {/* ATTENDANCE */}

                          <td className="px-3 py-2 text-center dark:border-slate-700">

                            <select
                              value={
                                attendance[
                                  student._id
                                ] || ""
                              }
                              onChange={(
                                e
                              ) =>
                                handleAttendanceChange(
                                  student._id,
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-md border px-2.5 py-1 text-xs font-semibold outline-none focus:border-blue-500 ${
                                attendance[
                                  student._id
                                ] ===
                                "Present"
                                  ? "border-green-300 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                                  : attendance[
                                      student._id
                                    ] ===
                                    "Absent"
                                  ? "border-red-300 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                                  : attendance[
                                      student._id
                                    ] ===
                                    "Duty Leave"
                                  ? "border-blue-300 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 text-slate-500 dark:text-slate-400"
                              } dark:border-slate-600 dark:bg-slate-800 dark:text-white`}
                            >
                              <option value="">
                                Select Status
                              </option>

                              <option value="Present">
                                Present
                              </option>

                              <option value="Absent">
                                Absent
                              </option>

                              <option value="Duty Leave">
                                Duty Leave
                              </option>
                            </select>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* SAVE */}

              <div className="flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Admin corrections override the teacher's submitted attendance.
                </p>

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Corrections"}
                </button>

              </div>

            </>
          )}

        </div>
      )}

      {/* =================================================
          NO CLASSROOM
      ================================================= */}

      {!classroomId && (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-gray-900 p-8 text-center dark:border-slate-700 dark:bg-slate-900">

          <div className="text-2xl">
            📋
          </div>

          <h2 className="mt-2 text-xs font-semibold text-slate-800 dark:text-white">
            Select a classroom
          </h2>

          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            Select a classroom above to view and correct attendance.
          </p>

        </div>
      )}

    </div>
  );
}