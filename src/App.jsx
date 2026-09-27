import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

// ================= AUTH =================
const Login = lazy(() => import("./pages/auth/Login"));

// ================= ADMIN =================
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const TeacherManagement = lazy(() => import("./pages/admin/TeacherManagement"));
const ClassroomManagement = lazy(() => import("./pages/admin/ClassroomManagement"));
const Announcements = lazy(() => import("./pages/admin/Announcements"));
const AdminAttendanceCorrection = lazy(() =>
  import("./pages/admin/AdminAttendanceCorrection")
);

// ================= STUDENT =================
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentMarks = lazy(() => import("./pages/student/StudentMarks"));
const StudentAssignments = lazy(() =>
  import("./pages/student/StudentAssignments")
);
const StudentTimetable = lazy(() => import("./pages/student/StudentTimetable"));

// ================= TEACHER =================
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherAssignments = lazy(() =>
  import("./pages/teacher/TeacherAssignments")
);
const TeacherStudents = lazy(() => import("./pages/teacher/TeacherStudents"));
const TeacherSubjects = lazy(() => import("./pages/teacher/TeacherSubjects"));
const TeacherTimetable = lazy(() => import("./pages/teacher/TeacherTimetable"));

// ================= ACADEMIC =================
const MarksManager = lazy(() => import("./pages/academic/MarksManager"));
const AttendanceManager = lazy(() =>
  import("./pages/academic/AttendanceManager")
);

// ================= SHARED =================
const Profile = lazy(() => import("./pages/shared/Profile"));

function RouteFallback() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* ================= LOGIN ================= */}
              <Route path="/login" element={<Login />} />

              {/* ================= AUTHENTICATED USERS ================= */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* ================= ADMIN ================= */}
                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route
                      path="/admin/teachers"
                      element={<TeacherManagement />}
                    />
                    <Route
                      path="/admin/classrooms"
                      element={<ClassroomManagement />}
                    />
                    <Route
                      path="/admin/attendance"
                      element={<AdminAttendanceCorrection />}
                    />
                    <Route
                      path="/admin/announcements"
                      element={<Announcements />}
                    />
                  </Route>

                  {/* ================= STUDENT ================= */}
                  <Route
                    element={<ProtectedRoute allowedRoles={["student"]} />}
                  >
                    <Route
                      path="/student/dashboard"
                      element={<StudentDashboard />}
                    />
                    <Route
                      path="/student/attendance"
                      element={<StudentAttendance />}
                    />
                    <Route path="/student/marks" element={<StudentMarks />} />
                    <Route
                      path="/student/assignments"
                      element={<StudentAssignments />}
                    />
                    <Route
                      path="/student/timetable"
                      element={<StudentTimetable />}
                    />
                  </Route>

                  {/* ================= TEACHER ================= */}
                  <Route
                    element={<ProtectedRoute allowedRoles={["teacher"]} />}
                  >
                    <Route
                      path="/teacher/dashboard"
                      element={<TeacherDashboard />}
                    />
                    <Route
                      path="/teacher/assignments"
                      element={<TeacherAssignments />}
                    />
                    <Route
                      path="/teacher/students"
                      element={<TeacherStudents />}
                    />
                    <Route
                      path="/teacher/subjects"
                      element={<TeacherSubjects />}
                    />
                    <Route
                      path="/teacher/timetable"
                      element={<TeacherTimetable />}
                    />
                    {/* Teacher uses the same Announcements page */}
                    <Route
                      path="/teacher/announcements"
                      element={<Announcements />}
                    />
                    <Route
                      path="/teacher/attendance"
                      element={<AttendanceManager />}
                    />
                    <Route
                      path="/teacher/marks"
                      element={<MarksManager />}
                    />
                  </Route>

                  {/* ================= MARKS MANAGER ================= */}
                  <Route
                    element={
                      <ProtectedRoute allowedRoles={["admin", "teacher"]} />
                    }
                  >
                    <Route path="/marks" element={<MarksManager />} />
                  </Route>

                  {/* ================= ATTENDANCE MANAGER ================= */}
                  <Route
                    element={
                      <ProtectedRoute allowedRoles={["admin", "teacher"]} />
                    }
                  >
                    <Route
                      path="/attendance"
                      element={<AttendanceManager />}
                    />
                  </Route>

                  {/* ================= PROFILE ================= */}
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* ================= UNKNOWN URL ================= */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}