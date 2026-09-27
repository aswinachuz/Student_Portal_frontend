import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axiosClient from "../../api/axiosClient";
import AttendanceSummaryCards from "./components/AttendanceSummaryCards";
import AttendanceActionBar from "./components/AttendanceActionBar";
import AttendanceRegisterTable from "./components/AttendanceRegisterTable";
import AttendanceRules from "./components/AttendanceRules";

export default function AttendanceManager() {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [currentMonth, setCurrentMonth] =
    useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [todaySubmitted, setTodaySubmitted] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // Used to automatically scroll to today
  const registerScrollRef = useRef(null);
  const todayHeaderRef = useRef(null);

  // =====================================================
  // DATE HELPERS
  // =====================================================

  function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getCurrentMonth() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
  }

  const today = getTodayDate();

  // =====================================================
  // MONTH
  // =====================================================

  const [year, month] =
    currentMonth.split("-").map(Number);

  const daysInMonth = new Date(
    year,
    month,
    0
  ).getDate();

  const monthDays = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;

      return `${currentMonth}-${String(
        day
      ).padStart(2, "0")}`;
    }
  );

  // =====================================================
  // DATE STATUS
  // =====================================================

  const isToday = (date) => {
    return date === today;
  };

  const isFutureDate = (date) => {
    return date > today;
  };

  const isPastDate = (date) => {
    return date < today;
  };

  // =====================================================
  // FETCH CLASSROOM + STUDENTS
  // =====================================================

  const fetchClassroomStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const assignmentResponse =
        await axiosClient.get(
          "/teaching-assignments"
        );

      const assignmentData =
        assignmentResponse.data || {};

      const classTeacherClassroom =
        assignmentData.classTeacherClassroom;

      if (!classTeacherClassroom?._id) {
        setClassroom(null);
        setStudents([]);

        setError(
          "You are not assigned as a Class Teacher to any classroom."
        );

        return;
      }

      const studentResponse =
        await axiosClient.get(
          "/teacher/students"
        );

      const responseData =
        studentResponse.data || {};

      let studentList = [];

      if (Array.isArray(responseData.data)) {
        studentList = responseData.data;
      } else if (
        Array.isArray(responseData.students)
      ) {
        studentList = responseData.students;
      } else if (
        Array.isArray(responseData)
      ) {
        studentList = responseData;
      }

      const classTeacherStudents =
        studentList.filter((student) => {
          const studentClassroom =
            student.classroom?._id ||
            student.classroom;

          return (
            studentClassroom?.toString() ===
            classTeacherClassroom._id.toString()
          );
        });

      classTeacherStudents.sort(
        (a, b) => {
          const rollA =
            parseInt(
              a.rollNumber,
              10
            ) || 0;

          const rollB =
            parseInt(
              b.rollNumber,
              10
            ) || 0;

          return rollA - rollB;
        }
      );

      setClassroom(
        classTeacherClassroom
      );

      setStudents(
        classTeacherStudents
      );
    } catch (err) {
      console.error(
        "FETCH ATTENDANCE CLASSROOM ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load classroom students."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH MONTHLY ATTENDANCE
  // =====================================================

  const fetchMonthlyAttendance =
    async () => {
      if (!classroom?._id) {
        return;
      }

      try {
        setAttendanceLoading(true);
        setError("");
        setSuccess("");

        const firstDate =
          `${currentMonth}-01`;

        const lastDate =
          `${currentMonth}-${String(
            daysInMonth
          ).padStart(2, "0")}`;

        const response =
          await axiosClient.get(
            "/attendance",
            {
              params: {
                classroomId:
                  classroom._id,
                startDate:
                  firstDate,
                endDate:
                  lastDate,
              },
            }
          );

        const records =
          response.data || [];

        const newAttendanceData =
          {};

        records.forEach((record) => {
          const studentId =
            record.student?._id ||
            (typeof record.student ===
            "string"
              ? record.student
              : null);

          if (
            !studentId ||
            !record.date
          ) {
            return;
          }

          const recordDate =
            new Date(record.date);

          const recordYear =
            recordDate.getUTCFullYear();

          const recordMonth =
            String(
              recordDate.getUTCMonth() +
                1
            ).padStart(2, "0");

          const recordDay =
            String(
              recordDate.getUTCDate()
            ).padStart(2, "0");

          const dateKey =
            `${recordYear}-${recordMonth}-${recordDay}`;

          if (
            !newAttendanceData[
              studentId
            ]
          ) {
            newAttendanceData[
              studentId
            ] = {};
          }

          newAttendanceData[
            studentId
          ][dateKey] =
            record.status;
        });

        setAttendanceData(
          newAttendanceData
        );

        // Check whether today has already
        // been submitted
        const submittedToday =
          Object.values(
            newAttendanceData
          ).some(
            (studentAttendance) => {
              return Boolean(
                studentAttendance[
                  today
                ]
              );
            }
          );

        setTodaySubmitted(
          submittedToday
        );
      } catch (err) {
        console.error(
          "FETCH MONTHLY ATTENDANCE ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load monthly attendance."
        );
      } finally {
        setAttendanceLoading(
          false
        );
      }
    };

  // =====================================================
  // LOAD CLASSROOM
  // =====================================================

  useEffect(() => {
    fetchClassroomStudents();
  }, []);

  // =====================================================
  // LOAD MONTHLY ATTENDANCE
  // =====================================================

  useEffect(() => {
    if (
      classroom?._id &&
      students.length > 0
    ) {
      fetchMonthlyAttendance();
    }
  }, [
    classroom,
    students,
    currentMonth,
  ]);

  // =====================================================
  // AUTO SCROLL TO TODAY
  // =====================================================

  useEffect(() => {
    if (
      currentMonth !==
      getCurrentMonth()
    ) {
      return;
    }

    if (
      attendanceLoading ||
      !registerScrollRef.current ||
      !todayHeaderRef.current
    ) {
      return;
    }

    // Wait until the table is fully rendered
    const timer =
      setTimeout(() => {
        const container =
          registerScrollRef.current;

        const todayHeader =
          todayHeaderRef.current;

        if (
          !container ||
          !todayHeader
        ) {
          return;
        }

        // Width of the two sticky columns:
        // Roll + Student Name
        const stickyColumnsWidth =
          70 + 190;

        const targetScroll =
          todayHeader.offsetLeft -
          stickyColumnsWidth -
          10;

        container.scrollLeft =
          Math.max(
            0,
            targetScroll
          );
      }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentMonth,
    attendanceLoading,
    students,
    attendanceData,
  ]);

  // =====================================================
  // CHANGE ATTENDANCE
  // =====================================================

  const handleAttendanceChange = (
    studentId,
    date,
    status
  ) => {
    if (
      !isToday(date) ||
      todaySubmitted
    ) {
      return;
    }

    setAttendanceData(
      (previous) => ({
        ...previous,

        [studentId]: {
          ...(previous[
            studentId
          ] || {}),

          [date]: status,
        },
      })
    );
  };

  // =====================================================
  // MARK ALL PRESENT
  // =====================================================

  const markAllPresent = () => {
    if (todaySubmitted) {
      return;
    }

    const updatedAttendance = {
      ...attendanceData,
    };

    students.forEach(
      (student) => {
        if (
          !updatedAttendance[
            student._id
          ]
        ) {
          updatedAttendance[
            student._id
          ] = {};
        }

        updatedAttendance[
          student._id
        ][today] = "Present";
      }
    );

    setAttendanceData(
      updatedAttendance
    );
  };

  // =====================================================
  // MARK ALL ABSENT
  // =====================================================

  const markAllAbsent = () => {
    if (todaySubmitted) {
      return;
    }

    const updatedAttendance = {
      ...attendanceData,
    };

    students.forEach(
      (student) => {
        if (
          !updatedAttendance[
            student._id
          ]
        ) {
          updatedAttendance[
            student._id
          ] = {};
        }

        updatedAttendance[
          student._id
        ][today] = "Absent";
      }
    );

    setAttendanceData(
      updatedAttendance
    );
  };

  // =====================================================
  // SUBMIT TODAY'S ATTENDANCE
  // =====================================================

  const handleSubmit = async () => {
    if (todaySubmitted) {
      setError(
        "Today's attendance has already been submitted."
      );

      return;
    }

    if (
      currentMonth !==
      getCurrentMonth()
    ) {
      setError(
        "You can submit attendance only for the current month."
      );

      return;
    }

    if (students.length === 0) {
      setError(
        "No students found."
      );

      return;
    }

    const incomplete =
      students.some(
        (student) =>
          !attendanceData[
            student._id
          ]?.[today]
      );

    if (incomplete) {
      setError(
        "Please mark Present, Absent, or Duty Leave for every student."
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
              attendanceData[
                student._id
              ][today],
          })
        );

      await axiosClient.post(
        "/attendance",
        {
          classroomId:
            classroom._id,

          date: today,

          attendanceRecords,
        }
      );

      setTodaySubmitted(true);

      setSuccess(
        "Today's attendance submitted successfully. It is now locked for teachers."
      );

      await fetchMonthlyAttendance();
    } catch (err) {
      console.error(
        "SUBMIT ATTENDANCE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredStudents =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return students;
      }

      return students.filter(
        (student) => {
          const name =
            student.name?.toLowerCase() ||
            "";

          const roll =
            student.rollNumber?.toLowerCase() ||
            "";

          const email =
            student.email?.toLowerCase() ||
            "";

          return (
            name.includes(
              searchText
            ) ||
            roll.includes(
              searchText
            ) ||
            email.includes(
              searchText
            )
          );
        }
      );
    }, [
      students,
      search,
    ]);

  // =====================================================
  // STUDENT MONTHLY SUMMARY
  // =====================================================

  const getStudentSummary = (
    studentId
  ) => {
    const studentAttendance =
      attendanceData[
        studentId
      ] || {};

    let present = 0;
    let absent = 0;
    let dutyLeave = 0;

    monthDays.forEach(
      (date) => {
        const status =
          studentAttendance[
            date
          ];

        if (
          status === "Present"
        ) {
          present++;
        }

        if (
          status === "Absent"
        ) {
          absent++;
        }

        if (
          status === "Duty Leave"
        ) {
          dutyLeave++;
        }
      }
    );

    const attended =
      present + dutyLeave;

    const percentage =
      attended + absent > 0
        ? (
            (attended /
              (attended +
                absent)) *
            100
          ).toFixed(1)
        : "0.0";

    return {
      present,
      absent,
      dutyLeave,
      percentage,
    };
  };

  // =====================================================
  // TODAY SUMMARY
  // =====================================================

  const classSummary =
    useMemo(() => {
      let present = 0;
      let absent = 0;
      let dutyLeave = 0;

      students.forEach(
        (student) => {
          const todayStatus =
            attendanceData[
              student._id
            ]?.[today];

          if (
            todayStatus ===
            "Present"
          ) {
            present++;
          }

          if (
            todayStatus ===
            "Absent"
          ) {
            absent++;
          }

          if (
            todayStatus ===
            "Duty Leave"
          ) {
            dutyLeave++;
          }
        }
      );

      return {
        present,
        absent,
        dutyLeave,
      };
    }, [
      students,
      attendanceData,
      today,
    ]);

  // =====================================================
  // CHANGE MONTH
  // =====================================================

  const changeMonth = (
    value
  ) => {
    setCurrentMonth(value);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">
          Loading attendance...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Attendance Register
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Monthly classroom attendance register.
        </p>
      </div>

      {/* CLASSROOM + MONTH */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-800">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Classroom
            </label>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {classroom?.name || "No classroom"}
              {classroom?.section ? ` - ${classroom.section}` : ""}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Month
            </label>
            <input
              type="month"
              value={currentMonth}
              max={getCurrentMonth()}
              onChange={(e) => changeMonth(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {success}
        </div>
      )}

      {/* LOCKED */}
      {todaySubmitted && currentMonth === getCurrentMonth() && (
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 dark:border-green-800 dark:bg-green-950">
          <p className="text-xs font-semibold text-green-800 dark:text-green-200">
            Today's attendance has been submitted.
          </p>
          <p className="mt-0.5 text-[10px] text-green-700 dark:text-green-300">
            Today's attendance is locked. Only an admin can make corrections.
          </p>
        </div>
      )}

      {/* LEGEND */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-7 items-center justify-center rounded bg-green-100 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
              P
            </span>
            <span className="text-slate-600 dark:text-slate-300">Present</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-7 items-center justify-center rounded bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
              A
            </span>
            <span className="text-slate-600 dark:text-slate-300">Absent</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-7 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              DL
            </span>
            <span className="text-slate-600 dark:text-slate-300">Duty Leave</span>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Duty Leave counts as Present.
          </span>
        </div>
      </div>

      {/* TODAY SUMMARY */}
      <AttendanceSummaryCards
        totalStudents={students.length}
        classSummary={classSummary}
      />

      {/* SEARCH + ACTIONS */}
      <AttendanceActionBar
        search={search}
        setSearch={setSearch}
        isCurrentMonth={currentMonth === getCurrentMonth()}
        todaySubmitted={todaySubmitted}
        saving={saving}
        onMarkAllPresent={markAllPresent}
        onMarkAllAbsent={markAllAbsent}
        onSubmit={handleSubmit}
      />

      {/* ATTENDANCE REGISTER */}
      <AttendanceRegisterTable
        classroom={classroom}
        currentMonth={currentMonth}
        students={students}
        filteredStudents={filteredStudents}
        monthDays={monthDays}
        attendanceData={attendanceData}
        today={today}
        todaySubmitted={todaySubmitted}
        attendanceLoading={attendanceLoading}
        registerScrollRef={registerScrollRef}
        todayHeaderRef={todayHeaderRef}
        getStudentSummary={getStudentSummary}
        onAttendanceChange={handleAttendanceChange}
      />

      {/* INFORMATION */}
      <AttendanceRules />
    </div>
  );
}
