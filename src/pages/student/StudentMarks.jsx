import React, { useEffect, useMemo, useState } from "react";
import { Award, GraduationCap, TrendingUp, BookOpen, CheckCircle2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import StatCard from "../../components/common/StatCard";

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMarks = async () => {
      try {
        const response = await axiosClient.get("/marks");
        if (isMounted) {
          setMarks(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching marks:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMarks();

    return () => {
      isMounted = false;
    };
  }, []);

  const { avgScore, totalExams, distinctSubjects, topGradesCount } = useMemo(() => {
    if (!marks.length) {
      return { avgScore: 0, totalExams: 0, distinctSubjects: 0, topGradesCount: 0 };
    }

    let obt = 0;
    let max = 0;
    const subjects = new Set();
    let topGrades = 0;

    marks.forEach((m) => {
      const o = Number(m.marksObtained);
      const mx = Number(m.maxMarks);
      if (!isNaN(o) && !isNaN(mx) && mx > 0) {
        obt += o;
        max += mx;
      }
      const subjName = m.subject?.name || m.subject;
      if (subjName) subjects.add(subjName);

      const g = (m.grade || "").toUpperCase();
      if (g.startsWith("A")) topGrades++;
    });

    const avg = max > 0 ? Math.round((obt / max) * 100) : 0;

    return {
      avgScore: avg,
      totalExams: marks.length,
      distinctSubjects: subjects.size,
      topGradesCount: topGrades,
    };
  }, [marks]);

  const getGradeBadge = (grade) => {
    if (!grade) return <span className="text-slate-400">-</span>;
    const g = grade.toUpperCase();
    let style = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    if (g.startsWith("A")) {
      style = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    } else if (g.startsWith("B")) {
      style = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    } else if (g.startsWith("C")) {
      style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    } else if (g.startsWith("F") || g.startsWith("D")) {
      style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    }

    return (
      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${style}`}>
        {grade}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/60 dark:text-purple-300">
            <Award size={12} />
            Academic Gradebook
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Marks & Examination Results
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review your examination scores, grades, and teacher remarks across terms.
        </p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={TrendingUp}
          color="purple"
          trend="Overall exam average"
          trendColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Assessments Graded"
          value={totalExams}
          icon={GraduationCap}
          color="blue"
          trend="Examination papers"
          trendColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Subjects Tested"
          value={distinctSubjects}
          icon={BookOpen}
          color="emerald"
          trend="Unique disciplines"
          trendColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Distinctions (A/A+)"
          value={topGradesCount}
          icon={CheckCircle2}
          color="amber"
          trend="Top grade performances"
          trendColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* RESULTS TABLE */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Examination Performance Log
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Detailed list of marks obtained, maximum marks, and remarks
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {marks.length} Records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          </div>
        ) : marks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <p className="text-xs text-slate-400">No marks have been recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Exam Term
                  </th>
                  <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Marks Obtained
                  </th>
                  <th className="px-3.5 py-2.5 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Teacher Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marks.map((mark) => {
                  const obt = Number(mark.marksObtained) || 0;
                  const max = Number(mark.maxMarks) || 100;
                  const pct = Math.round((obt / max) * 100);

                  return (
                    <tr
                      key={mark._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-3.5 py-2.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {mark.subject?.name || mark.subject || "-"}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">
                        {mark.examType || "General Assessment"}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {obt} / {max}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 75
                                ? "bg-emerald-500"
                                : pct >= 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        {getGradeBadge(mark.grade)}
                      </td>
                      <td className="px-3.5 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {mark.remarks || "No remarks provided"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
