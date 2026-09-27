import React, { useEffect, useState } from "react";
import {
  Upload,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import axiosClient from "../../api/axiosClient";
import { getFileUrl } from "../../utils/fileUrl";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";

export default function TeacherStudents() {
  const toast = useToast();
  const confirm = useConfirm();
  const [students, setStudents] = useState([]);
  const [classroom, setClassroom] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // GET STUDENTS
  // ==========================================



  const getStudents = async () => {
  try {
    setError("");

    // ------------------------------------------
    // GET TEACHER ASSIGNMENT INFORMATION
    // ------------------------------------------

    const assignmentResponse =
      await axiosClient.get(
        "/teaching-assignments"
      );

    const assignmentData =
      assignmentResponse.data || {};

    // Class Teacher classroom is the
    // authoritative classroom for Student Management.
    const classTeacherClassroom =
      assignmentData.classTeacherClassroom;

    if (!classTeacherClassroom?._id) {
      setStudents([]);
      setClassroom(null);

      setError(
        "You are not assigned as a Class Teacher to any classroom."
      );

      return;
    }

    // ------------------------------------------
    // GET STUDENTS
    // ------------------------------------------

    const response =
      await axiosClient.get(
        "/teacher/students"
      );

    const data =
      response.data || {};

    let studentList = [];

    if (Array.isArray(data.students)) {
      studentList = data.students;
    } else if (Array.isArray(data.data)) {
      studentList = data.data;
    } else if (
      data.data &&
      Array.isArray(data.data.students)
    ) {
      studentList = data.data.students;
    }

    // ------------------------------------------
    // ONLY CLASS TEACHER CLASSROOM STUDENTS
    // ------------------------------------------

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

    // ------------------------------------------
    // SET DATA
    // ------------------------------------------

    setStudents(
      classTeacherStudents
    );

    setClassroom(
      classTeacherClassroom
    );
  } catch (err) {
    console.error(
      "GET STUDENTS ERROR:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Unable to load students"
    );
  }
};

  useEffect(() => {
    getStudents();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // PHOTO
  // ==========================================

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be less than 5 MB.");
      return;
    }

    setError("");
    setPhoto(file);

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingStudent(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
    });

    setPhoto(null);
    setPhotoPreview("");

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name || "",
      email: student.email || "",
      password: "",
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",
      gender: student.gender || "",
      address: student.address || "",
    });

    setPhoto(null);

    if (student.avatar) {
      setPhotoPreview(
        getFileUrl(student.avatar)
      );
    } else {
      setPhotoPreview("");
    }

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
    });

    setPhoto(null);
    setPhotoPreview("");
    setEditingStudent(null);
    setShowForm(false);
  };

  // ==========================================
  // SAVE STUDENT
  // ==========================================

  const saveStudent = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);

      data.append(
        "dateOfBirth",
        formData.dateOfBirth
      );

      data.append(
        "gender",
        formData.gender
      );

      data.append(
        "address",
        formData.address
      );

      // Password is optional
      if (formData.password.trim()) {
        data.append(
          "password",
          formData.password
        );
      }

      // Photo
      if (photo) {
        data.append("avatar", photo);
      }

      // UPDATE
      if (editingStudent) {
        await axiosClient.put(
          `/teacher/students/${editingStudent._id}`,
          data
        );

        setMessage(
          "Student updated successfully"
        );
      }

      // ADD
      else {
        await axiosClient.post(
          "/teacher/students",
          data
        );

        setMessage(
          "Student added successfully"
        );
      }

      resetForm();
      await getStudents();
    } catch (err) {
      console.error(
        "SAVE STUDENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save student"
      );
    }
  };

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const deleteStudent = async (student) => {
    const confirmed = await confirm({
      title: "Delete Student",
      message: `Delete ${student.name}?`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(
        `/teacher/students/${student._id}`
      );

      setMessage(
        "Student deleted successfully"
      );

      await getStudents();
    } catch (err) {
      console.error(
        "DELETE STUDENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete student"
      );
    }
  };
  return (
    <div className="space-y-4">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Student Management
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage students in your assigned classroom.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="w-fit rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Student
        </button>

      </div>

      {/* ======================================
          CLASSROOM SUMMARY
      ====================================== */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 px-4 py-3 dark:border-blue-900/60 dark:bg-blue-950/30">

        <div className="flex items-center justify-between gap-4">

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Assigned Classroom
            </p>

            <h2 className="mt-0.5 truncate text-base font-bold text-slate-900 dark:text-white">
              {classroom
                ? `${classroom.name} - ${classroom.section}`
                : "Loading..."}
            </h2>
          </div>

          <div className="shrink-0 rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-center shadow-sm dark:bg-slate-900">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Students
            </p>

            <p className="text-lg font-bold leading-tight text-blue-600 dark:text-blue-400">
              {students.length}
            </p>
          </div>

        </div>

      </div>

      {/* ======================================
          MESSAGES
      ====================================== */}

      {message && (
        <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-3 py-2 text-xs text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      {showForm && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">

          <div className="mb-4 flex items-start justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStudent ? "Edit Student" : "Add Student"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {editingStudent
                  ? "Update student information."
                  : "Create a new student account."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-md p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>

          </div>

          <form
            onSubmit={saveStudent}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >

            {/* PHOTO */}

            <div className="md:col-span-2">

              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Student Photo
              </label>

              <div className="mt-2 flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:border-slate-700 dark:bg-gray-800">

                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Student"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      No Photo
                    </span>
                  )}

                </div>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-gray-800">

                  <Upload size={14} />

                  {photoPreview ? "Change Photo" : "Upload Photo"}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </label>

              </div>

            </div>

            {/* STUDENT ID */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Student ID
              </label>

              <input
                type="text"
                value={
                  editingStudent
                    ? editingStudent.rollNumber || ""
                    : "Auto generated"
                }
                readOnly
                className="mt-1 w-full cursor-not-allowed rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-gray-800 dark:text-slate-400"
              />

              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                New students receive APS001, APS002, APS003...
              </p>
            </div>

            {/* NAME */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Student Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* PHONE */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  editingStudent
                    ? "Leave blank to keep current password"
                    : "Leave blank for 123456"
                }
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />

              {!editingStudent && (
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  Default password is 123456
                </p>
              )}
            </div>

            {/* DATE OF BIRTH */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* GENDER */}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                placeholder="Enter student address"
                className="mt-1 w-full resize-none rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-2 md:col-span-2">

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                {editingStudent ? "Update Student" : "Add Student"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================
          STUDENTS TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm dark:border-slate-700 dark:bg-gray-900">

        <div className="overflow-x-auto">

          <table className="min-w-full text-left dark:text-slate-200">

            <thead className="bg-slate-100 dark:bg-gray-800 dark:bg-slate-800">

              <tr className="dark:border-slate-700">

                <th className="px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Student
                </th>

                <th className="px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Student ID
                </th>

                <th className="px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Gender
                </th>

                <th className="px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Email
                </th>

                <th className="px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Phone
                </th>

                <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-600 dark:text-slate-300 dark:border-slate-700">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="dark:bg-gray-900">

              {students.map((student) => (

                <tr
                  key={student._id}
                  className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >

                  {/* STUDENT */}

                  <td className="px-3 py-2 dark:border-slate-700">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">

                        {student.avatar ? (
                          <img
                            src={getFileUrl(student.avatar)}
                            alt={student.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          student.name
                            ?.charAt(0)
                            ?.toUpperCase()
                        )}

                      </div>

                      <span className="max-w-[160px] truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {student.name}
                      </span>

                    </div>

                  </td>

                  {/* STUDENT ID */}

                  <td className="px-3 py-2 dark:border-slate-700">

                    <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                      {student.rollNumber || "-"}
                    </span>

                  </td>

                  {/* GENDER */}

                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 dark:border-slate-700">
                    {student.gender || "-"}
                  </td>

                  {/* EMAIL */}

                  <td className="max-w-[220px] truncate px-3 py-2 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    {student.email}
                  </td>

                  {/* PHONE */}

                  <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700">
                    {student.phone || "-"}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-3 py-2 dark:border-slate-700">

                    <div className="flex justify-end gap-1.5">

                      <button
                        type="button"
                        onClick={() => openEditForm(student)}
                        className="flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteStudent(student)}
                        className="flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950 px-2 py-1 text-[10px] font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {students.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No students found.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}