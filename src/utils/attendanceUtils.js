export function calculateAttendanceStats(attendanceRecords) {
  let present = 0;
  let absent = 0;
  let duty = 0;

  for (const record of attendanceRecords || []) {
    if (record.status === "Present") present++;
    else if (record.status === "Absent") absent++;
    else if (record.status === "Duty Leave") duty++;
  }

  const attended = present + duty;
  const percentage =
    attendanceRecords && attendanceRecords.length > 0
      ? Math.round((attended / attendanceRecords.length) * 100)
      : 0;

  return {
    presentCount: present,
    absentCount: absent,
    dutyLeaveCount: duty,
    attendedCount: attended,
    attendancePercentage: percentage,
  };
}
