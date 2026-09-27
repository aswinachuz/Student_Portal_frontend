const fs = require('fs');

const path = 'd:\\MERN\\Student Portal\\frontend\\src\\pages\\teacher\\TeacherTimetable.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  'import { useConfirm } from "../../context/ConfirmContext";',
  'import { useConfirm } from "../../context/ConfirmContext";\nimport TimetableClassHeader from "./components/TimetableClassHeader";\nimport TimetableForm from "./components/TimetableForm";\nimport TimetableGrid from "./components/TimetableGrid";'
);

const newReturnBlock = `  return (
    <div className="space-y-5">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Class Timetable
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Weekly classroom timetable
        </p>
      </div>

      <TimetableClassHeader
        isClassTeacher={isClassTeacher}
        classTeacherClassroom={classTeacherClassroom}
      />

      {isClassTeacher && (
        <TimetableForm
          editingId={editingId}
          formData={formData}
          classroomSubjects={classroomSubjects}
          subjectTeachers={subjectTeachers}
          days={days}
          saving={saving}
          message={message}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      )}

      <TimetableGrid
        timetable={timetable}
        days={days}
        periods={periods}
        isClassTeacher={isClassTeacher}
        classTeacherClassroom={classTeacherClassroom}
        getEntry={getEntry}
        onEdit={handleEdit}
        onDelete={handleDelete}
        error={error}
      />

    </div>
  );
}
`;

const searchStr = '  // ==========================================\r\n  // PAGE\r\n  // ==========================================\r\n\r\n  return (';
const searchStr2 = '  // ==========================================\n  // PAGE\n  // ==========================================\n\n  return (';
let idx = content.indexOf(searchStr);
if (idx === -1) idx = content.indexOf(searchStr2);

if (idx !== -1) {
    content = content.slice(0, idx) + searchStr2.split('  return (')[0] + newReturnBlock;
    fs.writeFileSync(path, content, 'utf8');
    console.log('File updated successfully');
} else {
    console.log("Failed to find index");
}
