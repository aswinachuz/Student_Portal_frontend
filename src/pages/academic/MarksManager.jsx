import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import MarksTableView from "./components/MarksTableView";
import MarkEntryForm from "./components/MarkEntryForm";

export default function MarksManager() {
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [classTeacherClassroom, setClassTeacherClassroom] =
    useState(null);

  // --------------------------------------------------
  // MARK ENTRY FORM
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    classroom: "",
    subject: "",
    student: "",
    examType: "Midterm",
    marksObtained: "",
    maxMarks: "100",
    remarks: "",
  });

  // --------------------------------------------------
  // MARKS VIEW FILTER
  // --------------------------------------------------

  const [viewClassroom, setViewClassroom] = useState("");
  const [viewSubject, setViewSubject] = useState("");

  const [allMarks, setAllMarks] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);

  // --------------------------------------------------
  // GENERAL STATES
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==================================================
  // FETCH INITIAL DATA
  // ==================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------
      // TEACHING ASSIGNMENTS
      // ------------------------------------------------

      const assignmentResponse =
        await axiosClient.get("/teaching-assignments");

      const assignmentData =
        assignmentResponse.data?.data || [];

      setAssignments(assignmentData);

      setClassTeacherClassroom(
        assignmentResponse.data?.classTeacherClassroom || null
      );

      // ------------------------------------------------
      // CLASSROOMS
      // ------------------------------------------------
      // Use classrooms returned by teaching assignments.
      // This includes the teacher's class-teacher classroom
      // and classrooms where the teacher is a subject teacher.

      let classroomData =
        assignmentResponse.data?.classrooms || [];

      if (!Array.isArray(classroomData)) {
        classroomData = [];
      }

      setClassrooms(classroomData);

      // ------------------------------------------------
      // SUBJECTS
      // ------------------------------------------------

      const subjectResponse =
        await axiosClient.get("/subjects");

      let subjectData =
        subjectResponse.data?.data ||
        subjectResponse.data?.subjects ||
        [];

      if (!Array.isArray(subjectData)) {
        subjectData = [];
      }

      setSubjects(subjectData);

      // ------------------------------------------------
      // STUDENTS
      // ------------------------------------------------

      const studentResponse =
        await axiosClient.get("/teacher/students");

      let studentData =
        studentResponse.data?.data ||
        studentResponse.data?.students ||
        [];

      if (!Array.isArray(studentData)) {
        studentData = [];
      }

      setStudents(studentData);
    } catch (err) {
      console.error(
        "FETCH MARK DATA ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load marks data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==================================================
  // GET ID
  // ==================================================

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "object") {
      return value._id || "";
    }

    return value;
  };

  // ==================================================
  // CLASS TEACHER CHECK
  // ==================================================

  const selectedClassroomIsClassTeacherClass =
    formData.classroom &&
    classTeacherClassroom &&
    getId(classTeacherClassroom) ===
      formData.classroom;

  // ==================================================
  // GET ASSIGNMENT
  // ==================================================

  const getAssignmentForSubject = (
    subjectId,
    classroomId
  ) => {
    return assignments.find(
      (assignment) => {
        const assignmentSubject =
          getId(assignment.subject);

        const assignmentClassroom =
          getId(assignment.classroom);

        return (
          assignmentSubject === subjectId &&
          assignmentClassroom === classroomId
        );
      }
    );
  };

  // ==================================================
  // FILTER SUBJECTS FOR MARK ENTRY
  // ==================================================

  const filteredSubjects =
    subjects.filter((subject) => {
      if (!formData.classroom) {
        return false;
      }

      // Class Teacher can manage all subjects
      // in their classroom.
      if (
        selectedClassroomIsClassTeacherClass
      ) {
        return true;
      }

      // Subject Teacher can manage only the
      // subject assigned to them for this classroom.
      const assignment =
        getAssignmentForSubject(
          subject._id,
          formData.classroom
        );

      return !!assignment;
    });

  // ==================================================
  // FILTER STUDENTS FOR MARK ENTRY
  // ==================================================

  const filteredStudents =
    students.filter((student) => {
      if (!formData.classroom) {
        return false;
      }

      const studentClassroom =
        getId(student.classroom);

      return (
        studentClassroom ===
        formData.classroom
      );
    });

  // ==================================================
  // SUBJECTS FOR MARKS VIEW
  // ==================================================

  const viewSubjects =
    subjects.filter((subject) => {
      if (!viewClassroom) {
        return false;
      }

      // Class Teacher can view all subjects
      // in their classroom.
      if (
        classTeacherClassroom &&
        getId(classTeacherClassroom) ===
          viewClassroom
      ) {
        return true;
      }

      // Subject Teacher can view only the
      // subject assigned to them for this classroom.
      return !!getAssignmentForSubject(
        subject._id,
        viewClassroom
      );
    });

  // ==================================================
  // FETCH ALL MARKS
  // ==================================================

  const fetchAllMarks = async (
    classroomId,
    subjectId
  ) => {
    if (!classroomId || !subjectId) {
      setAllMarks([]);
      return;
    }

    try {
      setMarksLoading(true);
      setError("");

      const response =
        await axiosClient.get(
          "/marks",
          {
            params: {
              classroomId,
              subjectId,
              limit: 1000,
            },
          }
        );

      const markData =
        response.data?.data || [];

      setAllMarks(
        Array.isArray(markData)
          ? markData
          : []
      );
    } catch (err) {
      console.error(
        "FETCH ALL MARKS ERROR:",
        err
      );

      setAllMarks([]);

      setError(
        err.response?.data?.message ||
          "Unable to load student marks."
      );
    } finally {
      setMarksLoading(false);
    }
  };

  // ==================================================
  // VIEW CLASSROOM CHANGE
  // ==================================================

  const handleViewClassroomChange = (
    e
  ) => {
    const classroomId =
      e.target.value;

    setViewClassroom(classroomId);
    setViewSubject("");
    setAllMarks([]);
    setError("");
  };

  // ==================================================
  // VIEW SUBJECT CHANGE
  // ==================================================

  const handleViewSubjectChange = (
    e
  ) => {
    const subjectId =
      e.target.value;

    setViewSubject(subjectId);

    if (
      viewClassroom &&
      subjectId
    ) {
      fetchAllMarks(
        viewClassroom,
        subjectId
      );
    } else {
      setAllMarks([]);
    }

    setError("");
  };

  // ==================================================
  // MARK ENTRY CLASSROOM CHANGE
  // ==================================================

  const handleClassroomChange = (
    e
  ) => {
    const classroomId =
      e.target.value;

    setFormData({
      classroom: classroomId,
      subject: "",
      student: "",
      examType: "Midterm",
      marksObtained: "",
      maxMarks: "100",
      remarks: "",
    });

    setMessage("");
    setError("");
  };

  // ==================================================
  // FORM INPUT CHANGE
  // ==================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==================================================
  // SAVE MARKS
  // ==================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.classroom) {
      setError(
        "Please select a classroom."
      );
      return;
    }

    if (!formData.subject) {
      setError(
        "Please select a subject."
      );
      return;
    }

    if (!formData.student) {
      setError(
        "Please select a student."
      );
      return;
    }

    if (
      formData.marksObtained === ""
    ) {
      setError(
        "Please enter marks obtained."
      );
      return;
    }

    const marksObtained =
      Number(
        formData.marksObtained
      );

    const maxMarks =
      Number(
        formData.maxMarks
      );

    if (marksObtained < 0) {
      setError(
        "Marks obtained cannot be negative."
      );
      return;
    }

    if (maxMarks <= 0) {
      setError(
        "Maximum marks must be greater than 0."
      );
      return;
    }

    if (
      marksObtained >
      maxMarks
    ) {
      setError(
        "Marks obtained cannot be greater than maximum marks."
      );
      return;
    }

    // ------------------------------------------------
    // SUBJECT TEACHER SECURITY CHECK
    // ------------------------------------------------

    if (
      !selectedClassroomIsClassTeacherClass
    ) {
      const assignment =
        getAssignmentForSubject(
          formData.subject,
          formData.classroom
        );

      if (!assignment) {
        setError(
          "You are not assigned to this subject."
        );
        return;
      }
    }

    try {
      setSaving(true);

      await axiosClient.post(
        "/marks",
        {
          student:
            formData.student,

          subject:
            formData.subject,

          classroom:
            formData.classroom,

          examType:
            formData.examType,

          marksObtained,

          maxMarks,

          remarks:
            formData.remarks,
        }
      );

      setMessage(
        "Marks saved successfully."
      );

      // ------------------------------------------------
      // REFRESH TABLE IF SAME
      // SUBJECT IS BEING VIEWED
      // ------------------------------------------------

      if (
        viewClassroom ===
          formData.classroom &&
        viewSubject ===
          formData.subject
      ) {
        await fetchAllMarks(
          viewClassroom,
          viewSubject
        );
      }

      // ------------------------------------------------
      // CLEAR STUDENT ENTRY
      // ------------------------------------------------

      setFormData((prev) => ({
        ...prev,
        student: "",
        marksObtained: "",
        maxMarks: "100",
        remarks: "",
      }));
    } catch (err) {
      console.error(
        "SAVE MARK ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save marks."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // GET MARK FOR STUDENT + EXAM
  // ==================================================

  const getStudentMark = (
    studentId,
    examType
  ) => {
    return allMarks.find(
      (mark) =>
        getId(mark.student) ===
          studentId &&
        mark.examType ===
          examType
    );
  };

  // ==================================================
  // GET STUDENTS FOR SELECTED CLASS
  // ==================================================

  const viewStudents =
    students.filter(
      (student) =>
        getId(student.classroom) ===
        viewClassroom
    );

  // ==================================================
  // SELECTED SUBJECT
  // ==================================================

  const selectedViewSubject =
    subjects.find(
      (subject) =>
        subject._id ===
        viewSubject
    );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          Loading marks manager...
        </p>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

    return (
    <div className="space-y-4">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Marks & Grades
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage student marks and view subject-wise results.
        </p>
      </div>

      {/* ==================================================
          VIEW STUDENT MARKS
      ================================================== */}

      <MarksTableView
        classrooms={classrooms}
        viewClassroom={viewClassroom}
        viewSubject={viewSubject}
        viewSubjects={viewSubjects}
        viewStudents={viewStudents}
        selectedViewSubject={selectedViewSubject}
        marksLoading={marksLoading}
        allMarks={allMarks}
        getStudentMark={getStudentMark}
        onClassroomChange={handleViewClassroomChange}
        onSubjectChange={handleViewSubjectChange}
      />

      {/* ==================================================
          ENTER MARKS
      ================================================== */}

      <MarkEntryForm
        formData={formData}
        classrooms={classrooms}
        filteredSubjects={filteredSubjects}
        filteredStudents={filteredStudents}
        saving={saving}
        message={message}
        error={error}
        onChange={handleChange}
        onClassroomChange={handleClassroomChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}