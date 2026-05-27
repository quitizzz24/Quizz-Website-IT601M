import React, { useState } from "react";
import { 
  Users, BookOpen, ShieldAlert, BadgeInfo, Calendar, Trash2, 
  Edit, Sparkles, Filter, Search, PlusCircle, Check, 
  Settings as SettingsIcon, Clipboard, BarChart3, Database, 
  Lock, ArrowRight, Save, RefreshCw, FileSpreadsheet
} from "lucide-react";
import { User, Settings, Quiz, Assignment, Attempt, Question, QuestionBankItem, LeaderboardEntry } from "../types";

// ==========================================
// 1. ADMIN DASHBOARD
// ==========================================
interface AdminDashboardProps {
  settings: Settings;
  quizzes: Quiz[];
  students: any[];
  attempts: Attempt[];
  onNavigate: (view: string) => void;
}

export function AdminDashboard({
  settings,
  quizzes,
  students,
  attempts,
  onNavigate
}: AdminDashboardProps) {
  // Activity calculations
  const totalStudents = students.length;
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.status === "PUBLISHED").length;
  const draftQuizzes = totalQuizzes - publishedQuizzes;
  const recentActivities = attempts.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Top Banner */}
      <div className="rounded-[32px] bg-[#2D2A29] text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A6F56]/15 via-[#1C1F1B] to-transparent pointer-events-none"></div>
        <div>
          <span className="px-3 py-1 bg-[#F2EDE7] text-[#BC8F71] rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none">
            ⭐ ADMINISTRATIVE PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white mt-3">
            EduQuiz Management Suite
          </h1>
          <p className="text-xs text-[#DDE4DC]/80 mt-1 max-w-lg leading-relaxed font-sans">
            Configure system states, manage student registration rosters, author content packets, and generate visual grade reports in real-time.
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[#8C847E] text-[8px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest font-mono truncate block">Students</span>
            <p className="text-base sm:text-2xl font-bold text-[#2D2A29]">{totalStudents}</p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#F3F1ED] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#5A6F56] shrink-0 ml-1">
            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[#8C847E] text-[8px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest font-mono truncate block">Quizzes</span>
            <p className="text-base sm:text-2xl font-bold text-[#2D2A29] truncate">
              {totalQuizzes} <span className="text-[10px] sm:text-xs font-normal text-[#8C847E] hidden xs:inline">({publishedQuizzes} Live)</span>
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#F2EDE7] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#BC8F71] shrink-0 ml-1">
            <Clipboard className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[#8C847E] text-[8px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest font-mono truncate block">Semester</span>
            <p className="text-[10px] sm:text-xs md:text-sm font-extrabold text-[#4A5D46] uppercase bg-[#DDE4DC] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-full w-fit truncate">
              {settings.activeSemester}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#E9F0E8] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#5A6F56] shrink-0 ml-1">
            <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>

      {/* Admin Quick Action panel */}
      <div className="bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-4">
        <h3 className="font-bold text-[#2D2A29] text-sm">Task Orchestrator Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => onNavigate("admin-quizzes")} 
            className="p-4 bg-[#F9F8F6] hover:bg-[#EBE7E0]/40 rounded-2xl border border-[#EBE7E0] text-center space-y-2 cursor-pointer transition"
          >
            <span className="text-2xl block">✏️</span>
            <span className="text-xs font-bold block text-[#2D2A29]">Quiz Builder</span>
          </button>
          
          <button 
            onClick={() => onNavigate("admin-assign")} 
            className="p-4 bg-[#F9F8F6] hover:bg-[#EBE7E0]/40 rounded-2xl border border-[#EBE7E0] text-center space-y-2 cursor-pointer transition"
          >
            <span className="text-2xl block">📅</span>
            <span className="text-xs font-bold block text-[#2D2A29]">Assign Quizzes</span>
          </button>

          <button 
            onClick={() => onNavigate("admin-question-bank")} 
            className="p-4 bg-[#F9F8F6] hover:bg-[#EBE7E0]/40 rounded-2xl border border-[#EBE7E0] text-center space-y-2 cursor-pointer transition"
          >
            <span className="text-2xl block">📚</span>
            <span className="text-xs font-bold block text-[#2D2A29]">Question Bank</span>
          </button>

          <button 
            onClick={() => onNavigate("admin-reports")} 
            className="p-4 bg-[#F9F8F6] hover:bg-[#EBE7E0]/40 rounded-2xl border border-[#EBE7E0] text-center space-y-2 cursor-pointer transition"
          >
            <span className="text-2xl block">📊</span>
            <span className="text-xs font-bold block text-[#2D2A29]">Grade Reports</span>
          </button>
        </div>
      </div>

      {/* Double column feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Activity flow */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2A29]">Recent Student Activities</h3>
            <button
              onClick={() => onNavigate("admin-reports")}
              className="text-[#5A6F56] text-xs font-bold hover:underline cursor-pointer"
            >
              Analyze Records
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#EBE7E0] divide-y divide-[#F3F1ED] overflow-hidden">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-[#8C847E]/80 italic p-8 text-center">No quiz attempt submissions logged so far.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#F9F8F6] transition">
                  <div className="min-w-0">
                    <p className="font-bold text-[#2D2A29] leading-snug truncate">
                      {act.studentName}
                    </p>
                    <p className="text-[#8C847E] mt-0.5 truncate">
                      Completed: <strong className="text-slate-700">{act.quizTitle}</strong> ({act.quizSemester})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <strong className={`font-mono text-xs font-bold ${
                      act.passed ? "text-[#5A6F56]" : "text-rose-600"
                    }`}>
                      {act.score} / {act.total} Correct
                    </strong>
                    <p className="text-[10px] text-[#8C847E]">{new Date(act.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global info indicators */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[#2D2A29]">Administrative Guide</h3>
          <div className="bg-[#EBE7E0] p-6 rounded-[32px] border border-[#D9D3C7] space-y-4 text-xs font-sans text-[#433F3E] leading-relaxed">
            <div className="flex items-center gap-2 text-[#5A6F56]">
              <Check className="h-4 w-4" />
              <strong className="font-bold">System Status: Fully Operational</strong>
            </div>
            <p>
              Use this management suite to configure quizzes, review student progress, and manage school-wide parameters.
            </p>
            <div className="p-3 bg-white/45 rounded-xl border border-white/20 text-[#2D2A29]">
              <span className="font-bold text-[#4A5D46] block">Site Mode: Secure Access</span>
              Strict role filtering ensures student evaluation integrity and secure grading sheets.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}


// ==========================================
// 2. STUDENT ROSTER MANAGEMENT
// ==========================================
interface AdminStudentsProps {
  students: any[];
  onCreateStudent: (payload: any) => Promise<boolean>;
  onUpdateStudent: (id: string, payload: any) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onApproveStudent?: (id: string) => Promise<void>;
}

export function AdminStudents({
  students,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onApproveStudent
}: AdminStudentsProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editStreak, setEditStreak] = useState(0);

  // Create Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createAvatar, setCreateAvatar] = useState("🎓");
  const [createStreak, setCreateStreak] = useState(0);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditName(s.name || "");
    setEditEmail(s.email || "");
    setEditPassword(""); // Blank default to preserve the hash unless explicitly modified
    setEditAvatar(s.avatar || "🎓");
    setEditStreak(s.streak || 0);
  };

  const saveEdit = async () => {
    if (!editName || !editEmail) return;
    await onUpdateStudent(editingId!, {
      name: editName,
      email: editEmail,
      password: editPassword,
      avatar: editAvatar,
      streak: Number(editStreak) || 0
    });
    setEditingId(null);
  };

  const handleCreateStudentSubmit = async () => {
    if (!createName || !createEmail || !createPassword) {
      return;
    }
    const success = await onCreateStudent({
      name: createName,
      email: createEmail,
      password: createPassword,
      avatar: createAvatar,
      streak: Number(createStreak) || 0
    });
    if (success) {
      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateAvatar("🎓");
      setCreateStreak(0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Student Enrollment Directory</h1>
          <p className="text-xs text-[#8C847E]">Inspect records, revise names/emails/streaks or add directly to the database.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5A6F56] text-white hover:bg-[#4A5D46] px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          <PlusCircle className="h-4 w-4" /> Add Student Account
        </button>
      </div>

      {/* Search students utility bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EBE7E0]">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search roster by names or email addresses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F3EF] border-none rounded-2xl text-xs py-3 pl-10 pr-4 text-[#433F3E] placeholder-[#8C847E]"
          />
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#8C847E]" />
        </div>
      </div>

      {/* Student List Grid on mobile, Table on desktop */}
      <div className="bg-white rounded-[32px] border border-[#EBE7E0] overflow-hidden shadow-2xs">
        {filteredStudents.length === 0 ? (
          <p className="p-10 text-center text-xs text-[#8C847E]">No registered students matched search parameter.</p>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F9F8F6] text-[#8C847E] font-bold font-mono uppercase tracking-wider border-b border-[#EBE7E0]">
                  <tr>
                    <th className="p-4 pl-6">Student Account</th>
                    <th className="p-4">Quizzes Taken Log</th>
                    <th className="p-4">Daily Streak</th>
                    <th className="p-4">Enrollment Joined Date</th>
                    <th className="p-4 text-right pr-6">Roster Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F1ED] text-slate-700">
                  {filteredStudents.map((student) => {
                    const isEmoji = student.avatar && student.avatar.length <= 4;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          {student.avatar && student.avatar.trim() !== "" ? (
                            isEmoji ? (
                              <div className="w-10 h-10 rounded-full bg-[#F2EDE7] flex items-center justify-center text-lg shrink-0">
                                {student.avatar}
                              </div>
                            ) : (
                              <img src={student.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                            )
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0">
                              <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#2D2A29] flex items-center gap-1.5 flex-wrap">
                              <span>{student.name}</span>
                              {student.isApproved === false && (
                                <span className="bg-amber-100/75 border border-amber-305 text-amber-900 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide uppercase">
                                  Pending approval
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#8C847E] font-mono">{student.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-600">
                          {student.quizzesTakenCount} Finished
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-800 font-bold font-mono rounded-lg border border-amber-200/50">
                            🔥 {student.streak || 0}
                          </span>
                        </td>
                        <td className="p-4 text-[#8C847E] font-medium font-mono">
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2 shrink-0">
                          {student.isApproved === false && onApproveStudent && (
                            <button
                              onClick={() => onApproveStudent(student.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Approve / Activate student credentials manually"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => startEdit(student)}
                            className="p-2 text-slate-500 hover:text-[#5A6F56] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Edit roster data directly"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Purge student from database"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card Stack */}
            <div className="block md:hidden divide-y divide-[#F3F1ED]">
              {filteredStudents.map((student) => {
                const isEmoji = student.avatar && student.avatar.length <= 4;
                return (
                  <div key={student.id} className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      {student.avatar && student.avatar.trim() !== "" ? (
                        isEmoji ? (
                          <div className="w-11 h-11 rounded-full bg-[#F2EDE7] flex items-center justify-center text-xl shrink-0">
                            {student.avatar}
                          </div>
                        ) : (
                          <img src={student.avatar} className="w-11 h-11 rounded-full object-cover shrink-0" alt="" />
                        )
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0">
                          <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2A29] flex items-center gap-1.5 flex-wrap">
                          <span>{student.name}</span>
                          {student.isApproved === false && (
                            <span className="bg-amber-100/75 border border-amber-305 text-amber-900 px-1.5 py-0.5 rounded-full text-[8px] font-bold font-mono tracking-wide uppercase">
                              Pending approval
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-[#8C847E] font-mono">{student.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold py-1">
                      <div className="bg-[#FAF9F6] p-2 rounded-xl text-center border border-[#EBE7E0]">
                        <span className="text-[#8C847E] text-[10px] uppercase font-mono block">Assessments</span>
                        <strong className="text-slate-800 font-bold block mt-0.5">{student.quizzesTakenCount}</strong>
                      </div>
                      <div className="bg-amber-50/40 p-2 rounded-xl text-center border border-amber-100">
                        <span className="text-amber-800 text-[10px] uppercase font-mono block">Streak</span>
                        <strong className="text-amber-900 font-bold block mt-0.5">🔥 {student.streak || 0}</strong>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-[#F3F1ED] leading-none">
                      {student.isApproved === false && onApproveStudent && (
                        <button
                          onClick={() => onApproveStudent(student.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Approve Account
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(student)}
                        className="px-4 py-2 bg-[#F3F1ED] text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Edit Student
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CREATE STUDENT POPUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 leading-relaxed rounded-[32px] border border-[#EBE7E0] space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-serif italic text-[#2D2A29] font-bold">Add Student to Database Directly</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">Define a real student authorization profile directly. No single-use codes needed.</p>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Clara"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. maria@edu.ph"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Initial Password</label>
                <input
                  type="password"
                  placeholder="e.g. student123"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Avatar / Symbol</label>
                  <input
                    type="text"
                    value={createAvatar}
                    onChange={(e) => setCreateAvatar(e.target.value)}
                    placeholder="Emoji e.g. 🎓 or Image URL"
                    className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Activity Streak 🔥</label>
                  <input
                    type="number"
                    value={createStreak}
                    onChange={(e) => setCreateStreak(Number(e.target.value) || 0)}
                    className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Dialog
              </button>
              <button
                onClick={handleCreateStudentSubmit}
                disabled={!createName || !createEmail || !createPassword}
                className="px-5 py-2 bg-[#5A6F56] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#4A5D46]"
              >
                Commit to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Backdrop Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 leading-relaxed rounded-[32px] border border-[#EBE7E0] space-y-4 shadow-xl">
            <h3 className="text-lg font-serif italic text-[#2D2A29] font-bold">Direct Database Editor</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">You are modifying records directly. Changes reflect in real-time scores.</p>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Change Password Hash</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to maintain original password"
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Avatar Symbol/URL</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Streak 🔥 Days</label>
                  <input
                    type="number"
                    value={editStreak}
                    onChange={(e) => setEditStreak(Number(e.target.value) || 0)}
                    className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Dialog
              </button>
              <button
                id="btn-save-student-edit"
                onClick={saveEdit}
                className="px-5 py-2 bg-[#5A6F56] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#4A5D46]"
              >
                Save Roster Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// ==========================================
// 3. QUIZ INDEX & BUILDERS (CRUD)
// ==========================================
interface AdminQuizzesProps {
  quizzes: Quiz[];
  settings: Settings;
  onEditQuiz: (quizId: string) => void;
  onCreateQuizTrigger: () => void;
  onDeleteQuiz: (quizId: string) => Promise<void>;
  onTogglePublish: (quiz: Quiz) => Promise<void>;
}

export function AdminQuizzes({
  quizzes,
  settings,
  onEditQuiz,
  onCreateQuizTrigger,
  onDeleteQuiz,
  onTogglePublish
}: AdminQuizzesProps) {
  const [selectedSemPeriod, setSelectedSemPeriod] = useState<"ALL" | "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS">("ALL");

  const filteredQuizzes = quizzes.filter(q => {
    if (selectedSemPeriod === "ALL") return true;
    return q.semester === selectedSemPeriod;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Curriculum Syllabus Assessments</h1>
          <p className="text-xs text-[#8C847E]">Browse draft & published modules mapped across distinct timelines.</p>
        </div>

        <button 
          onClick={onCreateQuizTrigger}
          className="bg-[#5A6F56] text-white hover:bg-[#4A5D46] px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <PlusCircle className="h-4 w-4" /> Create New Quiz
        </button>
      </div>

      {/* Sorting Tabs Criteria */}
      <div className="flex border-b border-[#E1DCD3] gap-2 overflow-x-auto pb-0.5">
        {(["ALL", "PRELIM", "MIDTERM", "PREFINALS", "FINALS"] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedSemPeriod(period)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer whitespace-nowrap ${
              selectedSemPeriod === period 
                ? "text-[#5A6F56] border-b-2 border-[#5A6F56]" 
                : "text-[#8C847E] hover:text-[#2D2A29]"
            }`}
          >
            {period === "ALL" ? "All Semesters" : `${period} Period`}
          </button>
        ))}
      </div>

      {/* List items block */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-[#EBE7E0] p-16 text-center">
          <p className="text-4xl text-slate-400">📋</p>
          <h3 className="font-bold text-slate-700 mt-4 text-sm">No quizzes loaded</h3>
          <p className="text-xs text-[#8C847E] mt-1 max-w-sm mx-auto">Create a quiz to initiate student assessment sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const isActiveTerm = quiz.semester === settings.activeSemester;
            return (
              <div 
                key={quiz.id}
                className="bg-white rounded-[32px] border border-[#EBE7E0] hover:border-[#D9D3C7] shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider border border-[#5A6F56]/15 bg-[#DDE4DC] text-[#4A5D46] rounded-md uppercase">
                      {quiz.semester}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      quiz.status === "PUBLISHED" 
                        ? "bg-[#E9F0E8] text-[#4A5D46]" 
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {quiz.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#2D2A29] text-base leading-snug line-clamp-1">{quiz.title}</h3>
                    <p className="text-[#8C847E] text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {quiz.description || "Testing parameters aligned with current student curricula guidelines."}
                    </p>
                  </div>

                  {/* Visual metrics count indicator */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F3F1ED] text-xs text-[#6B635E] font-medium font-mono">
                    <div>
                      Questions: <strong className="text-slate-800">{quiz.questionCount || 0} items</strong>
                    </div>
                    <div>
                      Time Rate: <strong className="text-slate-800">{quiz.timeLimit} mins</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#F9F8F6] border-t border-[#EBE7E0] flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEditQuiz(quiz.id)}
                      className="px-3.5 py-1.5 bg-white border border-[#D9D3C7] text-slate-800 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-100"
                    >
                      Edit / Revise
                    </button>
                    <button
                      onClick={() => onTogglePublish(quiz)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                        quiz.status === "PUBLISHED"
                          ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                          : "bg-[#5A6F56] text-white hover:bg-[#4A5D46]"
                      }`}
                    >
                      {quiz.status === "PUBLISHED" ? "Go Draft" : "Make Live"}
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteQuiz(quiz.id)}
                    className="p-2 text-[#8C847E] hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ==========================================
// 4. QUIZ AUTHORING / EDITOR COMPONENT
// ==========================================
interface AdminQuizEditorProps {
  quizIdToEdit: string | null; // Null means creating
  quizzes: Quiz[];
  questionBank: QuestionBankItem[];
  onSaveQuiz: (quizPayload: any) => Promise<void>;
  onClose: () => void;
}

export function AdminQuizEditor({
  quizIdToEdit,
  quizzes,
  questionBank,
  onSaveQuiz,
  onClose
}: AdminQuizEditorProps) {
  const currentQuiz = quizIdToEdit ? quizzes.find(q => q.id === quizIdToEdit) : null;

  // Form states
  const [title, setTitle] = useState(currentQuiz ? currentQuiz.title : "");
  const [subject, setSubject] = useState(currentQuiz ? currentQuiz.subject : "Great Books - SY2526-2T");
  const [description, setDescription] = useState(currentQuiz ? currentQuiz.description : "");
  const [semester, setSemester] = useState<"PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS">(
    currentQuiz ? currentQuiz.semester : "MIDTERM"
  );
  const [timeLimit, setTimeLimit] = useState(currentQuiz ? currentQuiz.timeLimit : 15);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(currentQuiz ? currentQuiz.status : "DRAFT");

  // Questions authorized
  const [questions, setQuestions] = useState<any[]>(
    currentQuiz && currentQuiz.questions ? currentQuiz.questions : []
  );

  // New Draft Question Form state
  const [currQText, setCurrQText] = useState("");
  const [currOptions, setCurrOptions] = useState<string[]>(["", "", "", ""]);
  const [currCorrect, setCurrCorrect] = useState<number>(0);

  // Add Question to stack
  const addQuestion = () => {
    if (!currQText || currOptions.some(o => !o.trim())) return;
    setQuestions(prev => [
      ...prev,
      {
        id: "qn-" + Math.random().toString(36).substring(2, 9),
        text: currQText,
        options: [...currOptions],
        correctAnswer: currCorrect
      }
    ]);
    // Reset draft fields
    setCurrQText("");
    setCurrOptions(["", "", "", ""]);
    setCurrCorrect(0);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const addFromBank = (item: QuestionBankItem) => {
    setQuestions(prev => [
      ...prev,
      {
        id: "qn-" + Math.random().toString(36).substring(2, 9),
        text: item.text,
        options: [...item.options],
        correctAnswer: item.correctAnswer
      }
    ]);
  };

  const handleSave = () => {
    if (!title || !subject || !timeLimit) return;
    onSaveQuiz({
      id: quizIdToEdit,
      title,
      subject,
      description,
      semester,
      timeLimit: Number(timeLimit),
      status,
      questions
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E1DCD3] pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">
            {quizIdToEdit ? "Revise Quiz Modules" : "Author New Examination Packet"}
          </h1>
          <p className="text-xs text-[#8C847E]">Define evaluation standards, add question datasets and lock semesters.</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Basic fields parameters */}
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-3xl border border-[#EBE7E0] h-fit">
          <h3 className="font-bold text-sm text-[#2D2A29] pb-2 border-b border-[#F3F1ED]">Syllabus Metadata</h3>
          
          <div className="space-y-4 text-xs text-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fundamental Calculus Integrals"
                className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Core Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3"
                >
                  <option value="Great Books - SY2526-2T">Great Books - SY2526-2T</option>
                  <option value="Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T">Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T</option>
                  <option value="Management Information Systems - SY2526-2T">Management Information Systems - SY2526-2T</option>
                  <option value="Mobile Systems and Technologies - SY2526-2T">Mobile Systems and Technologies - SY2526-2T</option>
                  <option value="Programming Languages - SY2526-2T">Programming Languages - SY2526-2T</option>
                  <option value="Web Systems and Technologies - SY2526-2T">Web Systems and Technologies - SY2526-2T</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Semester Mapping</label>
                <select
                  value={semester}
                  onChange={(e: any) => setSemester(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3"
                >
                  <option value="PRELIM">Prelim Period</option>
                  <option value="MIDTERM">Midterm Period</option>
                  <option value="PREFINALS">Pre-Finals Period</option>
                  <option value="FINALS">Finals Period</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Duration Clock (Mins)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 focus:ring-1 focus:ring-[#5A6F56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Initial Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 animate-float"
                >
                  <option value="DRAFT">Pending Draft</option>
                  <option value="PUBLISHED">Published (Go live)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black font-mono tracking-wider text-[#8C847E]">Course Packet Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter broad instruction parameters..."
                className="w-full h-24 bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 resize-none outline-none focus:ring-1 focus:ring-[#5A6F56]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F3F1ED]">
            <button
              id="btn-quiz-save"
              onClick={handleSave}
              className="w-full py-3 bg-[#5A6F56] hover:bg-[#4A5D46] text-white text-xs font-bold rounded-2xl cursor-pointer shadow-xs transition"
            >
              Commit Examination Dataset ({questions.length} items)
            </button>
          </div>
        </div>

        {/* Question Creation flow & bank */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active stack */}
          <div className="bg-white p-6 rounded-3xl border border-[#EBE7E0] space-y-4">
            <h3 className="font-bold text-sm text-[#2D2A29]">Active Quiz Stack ({questions.length})</h3>
            
            {questions.length === 0 ? (
              <p className="text-xs text-[#8C847E] italic">No active question nodes added. Author some below.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#EBE7E0] flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[#2D2A29] leading-tight truncate">
                        {idx + 1}. {q.text}
                      </p>
                      <p className="text-[10px] text-[#8C847E] mt-0.5 font-mono">
                        Correct Option Index: {["A", "B", "C", "D"][q.correctAnswer]}
                      </p>
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-[#8C847E] hover:text-rose-600 transition shrink-0"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Author new item manual card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EBE7E0] space-y-4">
            <h3 className="font-bold text-[#2D2A29] text-sm flex items-center gap-1">
              <span>✍️</span> Author Single Question Node
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#8C847E]">Question Text Body</label>
                <input
                  type="text"
                  value={currQText}
                  onChange={(e) => setCurrQText(e.target.value)}
                  placeholder="e.g. What is equivalent to the power rule for integration?"
                  className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl text-xs py-2.5 px-3 outline-none"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currOptions.map((opt, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono">Option {["A", "B", "C", "D"][i]}</label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...currOptions];
                        next[i] = e.target.value;
                        setCurrOptions(next);
                      }}
                      placeholder={`Choice option context...`}
                      className="w-full bg-white border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Correct choice Index</label>
                  <select
                    value={currCorrect}
                    onChange={(e) => setCurrCorrect(Number(e.target.value))}
                    className="w-full bg-[#EBE7E0] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3"
                  >
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>

                <div className="pt-4 text-right">
                  <button
                    onClick={addQuestion}
                    className="px-5 py-2.5 bg-[#BC8F71] text-white font-bold text-xs rounded-xl hover:bg-[#a67d60] transition cursor-pointer"
                  >
                    Insert Question Node
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Bank injection panel */}
          {questionBank.length > 0 && (
            <div className="bg-[#F2EDE7] p-5 rounded-3xl border border-[#D9D3C7] space-y-3">
              <h4 className="font-bold text-[#2D2A29] text-xs uppercase tracking-wider font-mono">Question Bank Shortcuts</h4>
              <p className="text-[10px] text-[#8C847E]">Instantly augment your active test layout with standard curriculum bank questions.</p>
              
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {questionBank.map((item) => (
                  <div key={item.id} className="p-3 bg-white hover:bg-slate-50 transition border border-[#D9D3C7]/40 rounded-xl flex items-center justify-between text-xs gap-3">
                    <span className="truncate font-medium">{item.text} <strong className="text-[10px] text-[#BC8F71] uppercase">({item.subject})</strong></span>
                    <button
                      onClick={() => addFromBank(item)}
                      className="px-2.5 py-1 bg-[#5A6F56] hover:bg-[#4A5D46] text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-0.5 shrink-0"
                    >
                      <PlusCircle className="h-3 w-3" /> Insert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


// ==========================================
// 5. QUESTION BANK UTILITY CARD
// ==========================================
interface AdminQuestionBankProps {
  questionBank: QuestionBankItem[];
  onCreateBankItem: (itemPayload: any) => Promise<void>;
  onDeleteBankItem: (id: string) => Promise<void>;
}

export function AdminQuestionBank({
  questionBank,
  onCreateBankItem,
  onDeleteBankItem
}: AdminQuestionBankProps) {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("Great Books - SY2526-2T");
  const [opts, setOpts] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleCreate = async () => {
    if (!text || opts.some(o => !o.trim())) return;
    await onCreateBankItem({
      text,
      subject,
      options: opts,
      correctAnswer
    });
    // Reset forms
    setText("");
    setOpts(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Central Question Bank Packets</h1>
          <p className="text-xs text-[#8C847E]">Define standardized evaluation data blocks reusable across multiple exams.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-[#EBE7E0] h-fit space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A29] flex items-center gap-1.5 border-b border-[#F3F1ED] pb-3">
            <PlusCircle className="h-4.5 w-4.5 text-[#5A6F56]" />
            Author Template Node
          </h3>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#8C847E]">Curriculum Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
              >
                <option value="Great Books - SY2526-2T">Great Books - SY2526-2T</option>
                <option value="Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T">Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T</option>
                <option value="Management Information Systems - SY2526-2T">Management Information Systems - SY2526-2T</option>
                <option value="Mobile Systems and Technologies - SY2526-2T">Mobile Systems and Technologies - SY2526-2T</option>
                <option value="Programming Languages - SY2526-2T">Programming Languages - SY2526-2T</option>
                <option value="Web Systems and Technologies - SY2526-2T">Web Systems and Technologies - SY2526-2T</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#8C847E]">Question Template Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type the core standard definition question..."
                className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2.5 px-3 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#8C847E] block">Authorized Choices</label>
              {opts.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...opts];
                    next[i] = e.target.value;
                    setOpts(next);
                  }}
                  placeholder={`Choice ${["A", "B", "C", "D"][i]}`}
                  className="w-full bg-white border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono">Correct Index</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                  className="w-full bg-[#EBE7E0] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
                >
                  <option value="0">Choice A Correct</option>
                  <option value="1">Choice B Correct</option>
                  <option value="2">Choice C Correct</option>
                  <option value="3">Choice D Correct</option>
                </select>
              </div>

              <div className="pt-4 text-right">
                <button
                  onClick={handleCreate}
                  className="px-5 py-2.5 bg-[#BC8F71] hover:bg-[#a67d60] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                >
                  Save to Question Bank
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bank List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A29]">Question Bank Questions ({questionBank.length})</h3>
          
          {questionBank.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-[#EBE7E0] p-12 text-center text-xs text-[#8C847E] italic">
              Central question library package inventory is empty.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-2">
              {questionBank.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-3xl border border-[#EBE7E0] flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-[#F2EDE7] text-[#BC8F71] rounded-md uppercase">
                        {item.subject}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#2D2A29] text-xs sm:text-sm mt-3 leading-relaxed">
                      {item.text}
                    </h4>
                    
                    {/* Choices read preview */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-slate-600 font-mono">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="truncate">
                          {["A", "B", "C", "D"][oIdx]}. <span className={oIdx === item.correctAnswer ? "text-[#5A6F56] font-bold" : ""}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#F3F1ED] pt-3 flex justify-end">
                    <button
                      onClick={() => onDeleteBankItem(item.id)}
                      className="px-3.5 py-1.5 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Wipe Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


// ==========================================
// 6. ASSIGN QUIZZES TO STUDENTS
// ==========================================
interface AdminAssignQuizzesProps {
  quizzes: Quiz[];
  students: any[];
  onCommitAssignments: (quizId: string, studentIds: string[], dueDate: string) => Promise<void>;
  onClose: () => void;
}

export function AdminAssignQuizzes({
  quizzes,
  students,
  onCommitAssignments,
  onClose
}: AdminAssignQuizzesProps) {
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  });

  const activeQuizzes = quizzes.filter(q => q.status === "PUBLISHED");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudentSelection = (sId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  const selectAll = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleCommit = () => {
    if (!selectedQuizId || selectedStudentIds.length === 0 || !dueDate) return;
    onCommitAssignments(selectedQuizId, selectedStudentIds, dueDate);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Create Examination Allocations</h1>
          <p className="text-xs text-[#8C847E]">Deploy specific active questionnaires to target student profiles securely.</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Allocator Parameters panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-[#EBE7E0] h-fit space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A29] border-b border-[#F3F1ED] pb-3 text-left">Allocation Parameters</h3>
          
          <div className="space-y-4 text-xs text-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#8C847E]">1. Target Published Quiz</label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
              >
                {activeQuizzes.length === 0 ? (
                  <option value="">No published quizzes found (author/publish one first!)</option>
                ) : (
                  activeQuizzes.map(q => (
                    <option key={q.id} value={q.id}>
                      [{q.semester}] {q.title} ({q.subject})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#8C847E]">2. Absolute Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-[#F3F1ED]">
              <div className="p-3 bg-[#F2EDE7] rounded-xl text-[11px] text-[#6B635E] border border-[#D9D3C7]/40 leading-relaxed">
                <span className="font-bold text-[#2D2A29] block">Deployment Summary</span>
                Target Quiz ID is dispatched to <strong className="text-slate-800">{selectedStudentIds.length}</strong> active profiles. Deployed components instantly occupy student dashboards.
              </div>
            </div>

            <button
              id="btn-assign-quiz"
              onClick={handleCommit}
              disabled={selectedStudentIds.length === 0}
              className={`w-full py-3 text-xs font-bold rounded-2xl cursor-pointer shadow-xs transition ${
                selectedStudentIds.length === 0
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-[#5A6F56] hover:bg-[#4A5D46] text-white"
              }`}
            >
              Commit Assignment Cycle
            </button>
          </div>
        </div>

        {/* Student Select multiselector checkbox list panel */}
        <div className="lg:col-span-3 bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="font-bold text-sm text-[#2D2A29]">Select Recipient Students ({selectedStudentIds.length} chosen)</h3>
            
            <div className="flex gap-2">
              <button 
                onClick={selectAll}
                className="px-2.5 py-1 border border-[#D9D3C7]/80 hover:bg-slate-150 text-[10px] font-bold text-[#6B635E] rounded-md cursor-pointer whitespace-nowrap"
              >
                Select All
              </button>
              <button 
                onClick={deselectAll}
                className="px-2.5 py-1 border border-[#D9D3C7]/80 hover:bg-slate-150 text-[10px] font-bold text-[#6B635E] rounded-md cursor-pointer whitespace-nowrap"
              >
                Clear Selected
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search specific students to associate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F3EF] border-none rounded-2xl text-xs py-2.5 pl-10 pr-4 text-[#433F3E] placeholder-[#8C847E]"
            />
            <Search className="w-4 h-4 absolute left-4 top-3 text-[#8C847E]" />
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-[#8C847E] italic p-6 text-center">No students registered in workspace catalog.</p>
            ) : (
              filteredStudents.map((stud) => {
                const isChecked = selectedStudentIds.includes(stud.id);
                return (
                  <div
                    key={stud.id}
                    onClick={() => toggleStudentSelection(stud.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isChecked 
                        ? "bg-[#DDE4DC]/60 border-[#5A6F56]/30" 
                        : "bg-[#F9F8F6] border-[#EBE7E0] hover:bg-[#EBE7E0]/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {stud.avatar && stud.avatar.trim() !== "" ? (
                        <img src={stud.avatar} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0">
                          <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-[#2D2A29]">{stud.name}</p>
                        <p className="text-[10px] text-[#8C847E]">{stud.email}</p>
                      </div>
                    </div>
                    {/* Tick Checkbox */}
                    <div className={`h-55 w-5 bg-white border rounded-lg flex items-center justify-center shrink-0 ${
                      isChecked ? "border-[#5A6F56] text-[#5A6F56] scale-[1.05]" : "border-[#D9D3C7]"
                    }`}>
                      {isChecked && <Check className="h-4 w-4 font-black" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}


// ==========================================
// 7. RESULTS & REPORTS PANEL
// ==========================================
interface AdminReportsProps {
  attempts: Attempt[];
  onResetScores: (semesterTarget: string) => Promise<void>;
}

export function AdminReports({
  attempts,
  onResetScores
}: AdminReportsProps) {
  const [selectedQuizFilter, setSelectedQuizFilter] = useState("ALL");
  const [selectedSemFilter, setSelectedSemFilter] = useState("ALL");

  // Filter list
  const filteredAttempts = attempts.filter(at => {
    const semMatch = selectedSemFilter === "ALL" ? true : at.quizSemester === selectedSemFilter;
    const titleMatch = selectedQuizFilter === "ALL" ? true : at.quizTitle === selectedQuizFilter;
    return semMatch && titleMatch;
  });

  // Extract unique quiz names for quick categorization dropdown filter
  const uniqueQuizzes = Array.from(new Set(attempts.map(at => at.quizTitle)));

  // Mock Export CSV helper action
  const triggerExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Student Name,Quiz Title,Semester,Score,Total Possible,Accuracy Percent,Date Logged,Result Status\r\n";
    filteredAttempts.forEach(at => {
      const accuracy = Math.round((at.score / at.total) * 100);
      csvContent += `"${at.studentName}","${at.quizTitle}","${at.quizSemester}","${at.score}","${at.total}","${accuracy}%","${new Date(at.createdAt).toLocaleDateString()}","${at.passed ? 'PASSED' : 'FAILED'}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduQuiz_Grade_Analysis_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Student Grade Reports</h1>
          <p className="text-xs text-[#8C847E]">Generate academic reports or export results to CSV spreadsheets.</p>
        </div>

        <button 
          onClick={triggerExportCSV}
          className="bg-[#5A6F56] hover:bg-[#4A5D46] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export CSV Spreadsheet
        </button>
      </div>

      {/* Filter and reset panels */}
      <div className="bg-white p-5 rounded-3xl border border-[#EBE7E0] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">By Semester:</label>
            <select
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
            >
              <option value="ALL">All Periods</option>
              <option value="PRELIM">Prelim Period</option>
              <option value="MIDTERM">Midterm Period</option>
              <option value="PREFINALS">Pre-Finals Period</option>
              <option value="FINALS">Finals Period</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">By Specific Quiz Name:</label>
            <select
              value={selectedQuizFilter}
              onChange={(e) => setSelectedQuizFilter(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
            >
              <option value="ALL">All Quizzes</option>
              {uniqueQuizzes.map((q, idx) => (
                <option key={idx} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Informative notification message */}
        <div className="bg-[#F2EDE7] p-4 rounded-2xl border border-[#D9D3C7]/40 text-xs text-[#6B635E] leading-relaxed self-stretch flex flex-col justify-center">
          <p className="font-bold text-[#2D2A29] mb-1">Spreadsheet Export Details</p>
          CSV contains user names, attempt timestamps, accuracy ratios, raw correctness matrices, and pass status.
        </div>
      </div>

      {/* Primary attempts roster logs database list */}
      <div className="bg-white rounded-[32px] border border-[#EBE7E0] overflow-hidden shadow-2xs">
        {filteredAttempts.length === 0 ? (
          <p className="p-10 text-center text-xs text-[#8C847E] italic">No exam attempts match search filters.</p>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F9F8F6] text-[#8C847E] font-bold font-mono uppercase tracking-wider border-b border-[#EBE7E0]">
                  <tr>
                    <th className="p-4 pl-6">Student ID / Name</th>
                    <th className="p-4">Assigned Exam Module</th>
                    <th className="p-4">Term</th>
                    <th className="p-4 text-center">Score Ratio</th>
                    <th className="p-4">Date Completed</th>
                    <th className="p-4 text-right pr-6">Status Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F1ED] text-slate-700">
                  {filteredAttempts.map((at) => (
                    <tr key={at.id} className="hover:bg-slate-50 font-sans">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-[#2D2A29]">{at.studentName}</p>
                        <span className="text-[10px] text-[#8C847E] font-mono leading-none">{at.studentId}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-850">
                        {at.quizTitle}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#DDE4DC] text-[#4A5D46] rounded font-bold font-mono text-[9px] uppercase">
                          {at.quizSemester}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold font-mono text-slate-800">
                        {at.score} / {at.total} ({Math.round(at.score/at.total*100)}%)
                      </td>
                      <td className="p-4 font-medium text-[#8C847E]">
                        {new Date(at.createdAt).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          at.passed ? "bg-[#E9F0E8] text-[#4A5D46]" : "bg-rose-50 text-rose-700"
                        }`}>
                          {at.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card Stack */}
            <div className="block md:hidden divide-y divide-[#F3F1ED]">
              {filteredAttempts.map((at) => (
                <div key={at.id} className="p-5 space-y-4 font-sans text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#2D2A29] text-sm leading-tight">{at.studentName}</p>
                      <span className="text-[10px] text-[#8C847E] font-mono leading-none block mt-0.5">{at.studentId}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                      at.passed ? "bg-[#E9F0E8] text-[#4A5D46]" : "bg-rose-50 text-rose-700"
                    }`}>
                      {at.passed ? "Passed" : "Failed"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-[#8C847E] uppercase font-bold tracking-wider font-mono">Exam Module</p>
                    <p className="font-semibold text-[#2D2A29] text-xs leading-snug">{at.quizTitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] pt-1.5 border-t border-[#F3F1ED] text-[#6B635E]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#DDE4DC] text-[#4A5D46] rounded font-bold font-mono text-[9px] uppercase m-0.5">
                        {at.quizSemester}
                      </span>
                      <span>
                        {new Date(at.createdAt).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="font-semibold text-[#2D2A29] mt-1 pr-1">
                      Score: <span className="font-mono font-bold">{at.score} / {at.total}</span> ({Math.round(at.score/at.total*100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}


// ==========================================
// 8. LEADERBOARD UTILITIES MANAGEMENT
// ==========================================
interface AdminLeaderboardProps {
  settings: Settings;
  leaderboard: LeaderboardEntry[];
  onToggleVisibility: (visible: boolean) => Promise<void>;
  onResetLeaderboard: (target: string) => Promise<void>;
  onConfirmDialog?: (title: string, message: string, onConfirm: () => void) => void;
}

export function AdminLeaderboard({
  settings,
  leaderboard,
  onToggleVisibility,
  onResetLeaderboard,
  onConfirmDialog
}: AdminLeaderboardProps) {
  const [resetTarget, setResetTarget] = useState("all");

  const handleReset = () => {
    const msg = "Are you sure you want to delete all student attempt data across your selection? This cannot be undone.";
    if (onConfirmDialog) {
      onConfirmDialog("Delete Attempt Data", msg, () => {
        onResetLeaderboard(resetTarget);
      });
    } else {
      const isConfirmed = window.confirm(msg);
      if (isConfirmed) {
        onResetLeaderboard(resetTarget);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Leaderboard & Gamification Controls</h1>
          <p className="text-xs text-[#8C847E]">Manage top rank visual displays or clear historical quiz record stores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Toggle Configuration controls */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-6 h-fit">
          <div className="space-y-2">
            <h3 className="font-bold text-[#2D2A29] text-sm border-b border-[#F3F1ED] pb-3">Visibility Configuration</h3>
            
            <div className="flex items-center justify-between py-2 text-xs">
              <div>
                <strong className="text-[#2D2A29] font-bold block">Display Board to Students</strong>
                <span className="text-[10px] text-[#8C847E]">Toggle whether students can view competitive ranks.</span>
              </div>
              
              <button
                onClick={() => onToggleVisibility(!settings.leaderboardVisible)}
                className={`px-4 py-2 font-bold rounded-xl text-xs transition cursor-pointer ${
                  settings.leaderboardVisible
                    ? "bg-[#5A6F56] hover:bg-[#4A5D46] text-white shadow-xs"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {settings.leaderboardVisible ? "Visible (On)" : "Hidden (Off)"}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#F3F1ED]">
            <h3 className="font-bold text-[#2D2A29] text-sm">Dangerous Actions</h3>
            
            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C847E] block font-mono">Reset Scope Target:</label>
                <select
                  value={resetTarget}
                  onChange={(e) => setResetTarget(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none"
                >
                  <option value="all">Wipe All Time (Total System Reset)</option>
                  <option value="PRELIM">Wipe Prelim Timeline Only</option>
                  <option value="MIDTERM">Wipe Midterm Timeline Only</option>
                  <option value="PREFINALS">Wipe Pre-Finals Timeline Only</option>
                  <option value="FINALS">Wipe Finals Timeline Only</option>
                </select>
              </div>

              <div className="p-3 bg-red-50 text-red-800 rounded-xl leading-relaxed text-[11px] border border-red-200 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Absolute Hazard Area!</strong>
                  Clearing scores flattens leaderboard achievements and student streaks to zero. This cannot be reverted.
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> Reset target leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic preview list block of current standing */}
        <div className="lg:col-span-3 bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A29]">Current Cumulative Roster Placement preview</h3>
          
          <div className="divide-y divide-[#F3F1ED]">
            {leaderboard.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#8C847E] italic">No placement preview parameters recorded so far.</p>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={item.studentId} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#F9F8F6] px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-black text-[#BC8F71] font-mono text-center">{idx + 1}</span>
                    {item.avatar && item.avatar.trim() !== "" ? (
                      <img src={item.avatar} className="h-8 w-8 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0">
                        <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#2D2A29] leading-tight">{item.name}</p>
                      <p className="text-[10px] text-[#8C847E] font-mono leading-none">{item.studentId}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <strong className="text-slate-800 font-extrabold font-mono">{item.totalScore} Points</strong>
                      <p className="text-[10px] text-[#8C847E] font-sans">Avg {item.averagePercent}% Acc</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}


// ==========================================
// 9. SITE SETTINGS & ACTIVE TIMELINES CONFIG
// ==========================================
interface AdminSettingsProps {
  settings: Settings;
  onUpdateSettings: (payload: any) => Promise<void>;
}

export function AdminSettings({
  settings,
  onUpdateSettings
}: AdminSettingsProps) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "🎓");
  const [activeSemester, setActiveSemester] = useState<"PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS">(
    settings.activeSemester
  );

  const handleSave = async () => {
    if (!siteName) return;
    await onUpdateSettings({
      siteName,
      logoUrl,
      activeSemester
    });
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-6 shadow-2xs">
      <h3 className="font-bold text-sm text-[#2D2A29] pb-3 border-b border-[#F3F1ED] flex items-center gap-1.5 leading-none">
        <SettingsIcon className="h-4.5 w-4.5 text-[#5A6F56]" /> Site settings parameters
      </h3>

      <div className="space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#8C847E]">Site / Institution Display Title</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#8C847E]">Logo Symbol / Emoji Icon</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#8C847E] block">Active Academic Milestone Timeline (Lock Indicator)</label>
          <select
            value={activeSemester}
            onChange={(e: any) => setActiveSemester(e.target.value)}
            className="w-full bg-[#EBE7E0] border border-[#D9D3C7] text-slate-900 rounded-xl text-xs py-2.5 px-3 outline-none font-bold cursor-pointer"
          >
            <option value="PRELIM">Prelim Period Ongoing</option>
            <option value="MIDTERM">Midterm Period Ongoing</option>
            <option value="PREFINALS">Pre-Finals Period Ongoing</option>
            <option value="FINALS">Finals Period Ongoing</option>
          </select>
          <span className="text-[10px] block leading-relaxed italic bg-[#E9F0E8] text-[#4A5D46] p-3 rounded-lg border border-[#5A6F56]/15 mt-1.5">
            Warning: Making a timeline active restricts student access to that period's active tests. All past timeline quizzes are instantly locked as viewed history elements.
          </span>
        </div>

        <div className="pt-4 border-t border-[#F3F1ED] flex justify-end">
          <button
            id="btn-settings-save"
            onClick={handleSave}
            className="px-6 py-3 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save global states
          </button>
        </div>
      </div>
    </div>
  );
}
