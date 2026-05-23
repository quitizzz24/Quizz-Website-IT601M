import React, { useState, useEffect } from "react";
import { 
  Trophy, BookOpen, Clock, AlertTriangle, ShieldCheck, Mail, LogIn, 
  UserPlus, User as UserIcon, Calendar, BarChart2, Shield, Settings as SettingsIcon,
  ChevronRight, AlignJustify, X, GraduationCap, Compass, FileSpreadsheet, Lock, Check,
  Home
} from "lucide-react";
import { User, Settings, Quiz, Assignment, Attempt, Question, QuestionBankItem, LeaderboardEntry } from "./types";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { Toast, ToastMessage } from "./components/Toast";
import { 
  StudentDashboard, StudentQuizList, StudentQuizTaking, StudentResultsView, StudentProgressView 
} from "./components/StudentViews";
import { 
  AdminDashboard, AdminStudents, AdminQuizzes, AdminQuizEditor, AdminQuestionBank, AdminAssignQuizzes, AdminReports, AdminLeaderboard, AdminSettings 
} from "./components/AdminViews";
import { AdminSupabaseSync } from "./components/AdminSupabaseSync";

const renderAvatar = (avatarUrl: string | undefined, sizeClass: string = "h-8 w-8", extraStyle: string = "ring-2 ring-slate-100") => {
  if (avatarUrl && avatarUrl.trim() !== "") {
    return (
      <img 
        src={avatarUrl} 
        alt="" 
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full object-cover shrink-0 ${extraStyle}`} 
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0 ${extraStyle}`}>
      <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
};

export default function App() {
  // Session States
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("eduquiz-student-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<string>(() => {
    const savedUser = localStorage.getItem("eduquiz-student-user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      return u.role === "ADMIN" ? "admin-dashboard" : "student-dashboard";
    }
    return "landing";
  });

  // Global Context Elements
  const [settings, setSettings] = useState<Settings>({
    activeSemester: "MIDTERM",
    leaderboardVisible: true,
    siteName: "EduQuiz Studio",
    logoUrl: "🎓"
  });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selection references
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [activeQuizEditorId, setActiveQuizEditorId] = useState<string | null>(null); // null means creating

  // Mobile menu open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load Initial Configuration and settings
  useEffect(() => {
    fetchSettings();
    if (user) {
      refreshData();
    }
  }, [user]);

  const showToast = (text: string, type: "success" | "error" | "warning" = "success") => {
    const newToast: ToastMessage = {
      id: Math.random().toString(),
      type,
      text
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // Quiet fail fallback
    }
  };

  const refreshData = async () => {
    if (!user) return;
    try {
      // 1. Quizzes
      const quRes = await fetch("/api/quizzes");
      if (quRes.ok) {
        const quData = await quRes.json();
        setQuizzes(quData);
      }

      // 2. Leaderboard
      const lbRes = await fetch(`/api/leaderboard?semester=${settings.activeSemester}`);
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
      }

      if (user.role === "ADMIN") {
        // 3. Students (admin only)
        const studRes = await fetch("/api/students");
        if (studRes.ok) {
          const studData = await studRes.json();
          setStudents(studData);
        }

        // 4. Question Bank (admin only)
        const qbRes = await fetch("/api/questions-bank");
        if (qbRes.ok) {
          const qbData = await qbRes.json();
          setQuestionBank(qbData);
        }

        // 5. All score attempts (admin only)
        const attRes = await fetch("/api/attempts");
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttempts(attData);
        }
      } else {
        // 6. User Specific Assignments (student only)
        const assignRes = await fetch(`/api/assignments?studentId=${user.id}`);
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          setAssignments(assignData);
        }

        // 7. User Specific Attempts (student only)
        const studentAttRes = await fetch(`/api/attempts?studentId=${user.id}`);
        if (studentAttRes.ok) {
          const studentAttData = await studentAttRes.json();
          setAttempts(studentAttData);
        }
      }
    } catch {
      showToast("Sync server offline. Fallback to offline parameters.", "error");
    }
  };

  // Auth flow APIs
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!email || !password) {
      showToast("Email and password fields are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const responseData = await res.json();
      if (res.ok) {
        const loggedUser = responseData.user;
        setUser(loggedUser);
        localStorage.setItem("eduquiz-student-user", JSON.stringify(loggedUser));
        showToast(`Successfully authenticated. Welcome back ${loggedUser.name}!`, "success");
        setView(loggedUser.role === "ADMIN" ? "admin-dashboard" : "student-dashboard");
      } else {
        showToast(responseData.message || "Authentication credentials mismatch", "error");
      }
    } catch {
      showToast("Endpoint timeout error. Retry.", "error");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!name || !email || !password) {
      showToast("All fields are required to register your account", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const responseData = await res.json();
      if (res.ok) {
        const loggedUser = responseData.user;
        setUser(loggedUser);
        localStorage.setItem("eduquiz-student-user", JSON.stringify(loggedUser));
        showToast("Roster self-registration completed successfully!", "success");
        setView("student-dashboard");
      } else {
        showToast(responseData.message || "Roster credentials invalid or email registered", "error");
      }
    } catch {
      showToast("Network failure. Retry registration.", "error");
    }
  };

  // Reset Instructions sent to simulation parameters
  const [simulatedInstructions, setSimulatedInstructions] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;

    if (!email) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const responseData = await res.json();
      if (res.ok) {
        showToast(responseData.message, "success");
        setSimulatedInstructions(responseData.simulation);
      } else {
        showToast(responseData.message || "User not found", "error");
      }
    } catch {
      showToast("Server request timeout", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("eduquiz-student-user");
    setSimulatedInstructions(null);
    showToast("Session disconnected securely.", "success");
    setView("landing");
  };

  // Student specific actions
  const onStartQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const fullQuiz = await res.json();
        // Check if student has active session for this
        const targetQ = quizzes.find(q => q.id === quizId);
        if (targetQ && targetQ.semester !== settings.activeSemester) {
          // Warning locked archive readonly mode
          showToast(`This test belongs to the locked ${targetQ.semester} semester history tracker. View mode activated.`, "warning");
        }
        setActiveQuizId(quizId);
        const idxOfQuiz = quizzes.findIndex(q => q.id === quizId);
        quizzes[idxOfQuiz] = fullQuiz; // sync questions
        setView("student-quiz-taking");
      } else {
        showToast("Failed to fetch questionnaire details.", "error");
      }
    } catch {
      showToast("Server timeout assembling quiz framework", "error");
    }
  };

  const onSubmitAttempt = async (userAnswers: Record<string, number>) => {
    if (!user || !activeQuizId) return;
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuizId,
          studentId: user.id,
          answers: userAnswers
        })
      });
      if (res.ok) {
        const attemptResult: Attempt = await res.json();
        setActiveAttemptId(attemptResult.id);
        const assocQuiz = quizzes.find(q => q.id === activeQuizId);
        showToast(`Attempt logged successfully: Scored ${attemptResult.score}/${attemptResult.total}.`, "success");
        await refreshData();
        setView("student-results");
      } else {
        showToast("Error saving quiz attempt", "error");
      }
    } catch {
      showToast("Network crash. Your scores are stored locally.", "error");
    }
  };

  // Self Profile configuration edits
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          name,
          email,
          password
        })
      });
      const responseData = await res.json();
      if (res.ok) {
        const nextUser = responseData.user;
        setUser(nextUser);
        localStorage.setItem("eduquiz-student-user", JSON.stringify(nextUser));
        showToast("Profile credentials updated successfully!", "success");
      } else {
        showToast(responseData.message || "Failed to edit profile details", "error");
      }
    } catch {
      showToast("Profile update timeout", "error");
    }
  };

  // Admin Actions
  const onUpdateStudent = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Student roster updated cleanly.", "success");
        await refreshData();
      } else {
        showToast(" Roster change rejected by compiler.", "error");
      }
    } catch {
      showToast(" Roster timeout", "error");
    }
  };

  const onDeleteStudent = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to terminate this student's registration? This removes all their history attempts.");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Student profile purged from directories.", "success");
        await refreshData();
      }
    } catch {
      showToast("Purge timeout", "error");
    }
  };

  const onTogglePublish = async (quiz: Quiz) => {
    const nextStatus = quiz.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Quiz status updated to ${nextStatus}.`, "success");
        await refreshData();
      }
    } catch {
      showToast("Publish toggling failed", "error");
    }
  };

  const onDeleteQuiz = async (quizId: string) => {
    const isConfirmed = window.confirm("Terminate this examination packet? Existing assignments will be flattened.");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Quiz deleted successfully.", "success");
        await refreshData();
      }
    } catch {
      showToast("Delete timeout", "error");
    }
  };

  const onSaveQuiz = async (quizPayload: any) => {
    try {
      const method = quizPayload.id ? "PUT" : "POST";
      const url = quizPayload.id ? `/api/quizzes/${quizPayload.id}` : "/api/quizzes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizPayload)
      });
      if (res.ok) {
        showToast(quizPayload.id ? "System exam metadata revised successfully!" : "New Exam Packet dispatched live!", "success");
        await refreshData();
        setView("admin-quizzes");
      } else {
        showToast("Quiz parameters validation failed.", "error");
      }
    } catch {
      showToast("Server Timeout authoring exams", "error");
    }
  };

  const onCreateQuestionBankItem = async (payload: any) => {
    try {
      const res = await fetch("/api/questions-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Template stored into reusable Question Bank.", "success");
        await refreshData();
      }
    } catch {
      showToast("Timeout adding question", "error");
    }
  };

  const onDeleteQuestionBankItem = async (id: string) => {
    try {
      const res = await fetch(`/api/questions-bank/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Question successfully removed from bank.", "success");
        await refreshData();
      }
    } catch {
      showToast("Timeout", "error");
    }
  };

  const onCommitAssignments = async (quizId: string, studentIds: string[], dueDate: string) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, studentIds, dueDate })
      });
      if (res.ok) {
        showToast(`Assignments completed successfully for ${studentIds.length} profiles.`, "success");
        await refreshData();
        setView("admin-dashboard");
      } else {
        showToast("Scheduler error deploying assessments", "error");
      }
    } catch {
      showToast("Allocating Timeout", "error");
    }
  };

  const onToggleLeaderboardVisibility = async (visible: boolean) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderboardVisible: visible })
      });
      if (res.ok) {
        const nextSettings = await res.json();
        setSettings(nextSettings);
        showToast(`Gamification ranks visibility: ${visible ? 'ON' : 'OFF'}`, "success");
      }
    } catch {
      showToast("Toggle timeout", "error");
    }
  };

  const onResetLeaderboard = async (targetRange: string) => {
    try {
      const res = await fetch("/api/leaderboard/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetRange })
      });
      if (res.ok) {
        showToast("Leaderboard standings have been reset successfully.", "success");
        await refreshData();
      }
    } catch {
      showToast("Reset Timeout", "error");
    }
  };

  const onUpdateSettings = async (payload: any) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const nextS = await res.json();
        setSettings(nextS);
        showToast("Platform configurations synced beautifully!", "success");
      }
    } catch {
      showToast("Parameters sync status offline", "error");
    }
  };

  // Nav helper router
  const triggerNavigate = (targetView: string) => {
    setMobileMenuOpen(false);
    setView(targetView);
  };

  return (
    <div className="bg-[#F9F8F6] text-[#433F3E] min-h-screen font-sans flex flex-col antialiased selection:bg-[#5A6F56]/20">
      
      {/* Toast Alert stack */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Global Navbar */}
      <Navbar 
        user={user} 
        settings={settings} 
        currentView={view} 
        onNavigate={triggerNavigate} 
        onLogout={handleLogout} 
      />

      {/* Mobile Bottom Navigation Bar styled in natural earthy colors */}
      {user && view !== "student-quiz-taking" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F9F8F6] border-t border-[#EBE7E0] shadow-lg flex items-center justify-around py-2.5 px-2">
          {user.role === "ADMIN" ? (
            <>
              <button
                onClick={() => triggerNavigate("admin-dashboard")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "admin-dashboard" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Home</span>
              </button>
              <button
                onClick={() => triggerNavigate("admin-quizzes")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view.startsWith("admin-quiz") || view === "admin-question-bank" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Quizzes</span>
              </button>
              <button
                onClick={() => triggerNavigate("admin-students")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "admin-students" || view === "admin-assign" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Roster</span>
              </button>
              <button
                onClick={() => triggerNavigate("admin-reports")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "admin-reports" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Reports</span>
              </button>
              <button
                onClick={() => triggerNavigate("admin-settings")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "admin-settings" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => triggerNavigate("student-dashboard")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-dashboard" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Home</span>
              </button>
              <button
                onClick={() => triggerNavigate("student-quiz-list")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-quiz-list" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Quizzes</span>
              </button>
              <button
                onClick={() => triggerNavigate("student-progress")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-progress" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Progress</span>
              </button>
              <button
                onClick={() => triggerNavigate("student-leaderboard")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-leaderboard" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Standings</span>
              </button>
              <button
                onClick={() => triggerNavigate("student-profile")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-profile" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Profile</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Main Core Container Render Router */}
      <main className="flex-grow">
        {view === "landing" ? (
          <LandingPage 
            onStartQuizJourney={() => triggerNavigate(user ? (user.role === "ADMIN" ? "admin-dashboard" : "student-dashboard") : "login")}
            onNavigate={triggerNavigate}
          />
        ) : (
          <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${user && view !== "student-quiz-taking" ? "pb-24 lg:pb-8" : "pb-8"}`}>

          {/* VIEW: Login Page */}
          {view === "login" && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white p-8 rounded-[36px] border border-[#EBE7E0] space-y-6 shadow-xs relative">
                <div className="text-center space-y-1.5">
                  <span className="text-3xl block">{settings.logoUrl || "🎓"}</span>
                  <h2 className="text-2xl font-serif italic text-[#2D2A29] font-semibold">Log In to EduQuiz</h2>
                  <p className="text-xs text-[#8C847E]">Enter registered student/admin keys below</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Workplace email address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. student@eduquiz.com"
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Secret password key</label>
                      <button 
                        type="button" 
                        onClick={() => triggerNavigate("forgot-password")}
                        className="text-[10px] text-[#BC8F71] font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Enter credentials keys..."
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <button
                    id="btn-login"
                    type="submit"
                    className="w-full py-3.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-bold rounded-2xl shadow-xs cursor-pointer transition uppercase tracking-wider"
                  >
                    Authenticate Account
                  </button>
                </form>

                <div className="pt-4 border-t border-[#F3F1ED] text-center text-xs">
                  <span className="text-[#8C847E]">Don't have an account yet? </span>
                  <button 
                    onClick={() => triggerNavigate("signup")}
                    className="font-bold text-[#5A6F56] hover:underline cursor-pointer"
                  >
                    Sign up now
                  </button>
                </div>

                {/* Seeding Demo indicators */}
                <div className="p-4 bg-[#F2EDE7] rounded-2xl border border-[#D9D3C7]/40 space-y-2.5 text-[11px] text-[#6B635E]">
                  <strong className="text-[#2D2A29] block">Quick Sandbox credentials selection:</strong>
                  <div className="grid grid-cols-1 gap-1 font-mono">
                    <div>Student: <code className="bg-white/60 px-1 py-0.5 rounded text-slate-800">student@eduquiz.com</code> / password: <code className="bg-white/60 px-1 py-0.5 rounded text-slate-800">student123</code></div>
                    <div>Admin: <code className="bg-white/60 px-1 py-0.5 rounded text-slate-800">admin@eduquiz.com</code> / password: <code className="bg-white/60 px-1 py-0.5 rounded text-slate-800">admin123</code></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Sign Up Page (Students Only) */}
          {view === "signup" && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white p-8 rounded-[36px] border border-[#EBE7E0] space-y-6 shadow-xs relative">
                <div className="text-center space-y-1.5">
                  <span className="text-3xl block">🏷️</span>
                  <h2 className="text-2xl font-serif italic text-[#2D2A29] font-semibold">Sign Up publicly</h2>
                  <p className="text-xs text-[#8C847E]">Register a fresh student card roster dynamically</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Your Complete Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Your active Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. alex@gmail.com"
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Choose dynamic password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Create security keys..."
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <button
                    id="btn-register"
                    type="submit"
                    className="w-full py-3.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-bold rounded-2xl shadow-xs cursor-pointer transition uppercase tracking-wider"
                  >
                    Register Student Account
                  </button>
                </form>

                <div className="pt-4 border-t border-[#F3F1ED] text-center text-xs">
                  <span className="text-[#8C847E]">Already have an account? </span>
                  <button 
                    onClick={() => triggerNavigate("login")}
                    className="font-bold text-[#5A6F56] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Forgot Password Page */}
          {view === "forgot-password" && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white p-8 rounded-[36px] border border-[#EBE7E0] space-y-6 shadow-xs relative">
                <div className="text-center space-y-1.5">
                  <span className="text-3xl block">🔑</span>
                  <h2 className="text-2xl font-serif italic text-[#2D2A29] font-semibold">Forgot Password</h2>
                  <p className="text-xs text-[#8C847E]">Enter your email below to receive instructions to reset your password</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Your Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. student@eduquiz.com"
                      className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#BC8F71] hover:bg-[#a67d60] text-white font-bold rounded-2xl shadow-xs cursor-pointer transition"
                  >
                    Send Recovery Instructions
                  </button>
                </form>

                {simulatedInstructions && (
                  <div className="p-4 bg-[#E9F0E8] border border-[#5A6F56]/20 rounded-2xl space-y-1.5 animate-float">
                    <strong className="text-xs font-semibold text-[#4A5D46] block">Simulation Payload Detected:</strong>
                    <p className="text-[11px] text-slate-700 font-mono leading-relaxed bg-white/60 p-2.5 rounded-xl border border-white">
                      {simulatedInstructions}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#F3F1ED] text-center text-xs">
                  <button 
                    onClick={() => triggerNavigate("login")}
                    className="font-bold text-[#5A6F56] hover:underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* STUDENT LOGGED IN SERVICES ROUTER */}
          {/* ========================================== */}
          {user && user.role === "STUDENT" && (
            <>
              {/* STUDENT DASHBOARD */}
              {view === "student-dashboard" && (
                <StudentDashboard 
                  user={user}
                  settings={settings}
                  assignments={assignments}
                  attempts={attempts}
                  quizzes={quizzes}
                  leaderboard={leaderboard}
                  onNavigate={triggerNavigate}
                  onStartQuiz={onStartQuiz}
                />
              )}

              {/* STUDENT QUIZ LISTING */}
              {view === "student-quiz-list" && (
                <StudentQuizList 
                  settings={settings}
                  quizzes={quizzes}
                  attempts={attempts}
                  assignments={assignments}
                  onStartQuiz={onStartQuiz}
                />
              )}

              {/* STUDENT ACTIVE QUIZ TAKING ENGINE */}
              {view === "student-quiz-taking" && activeQuizId && (
                <StudentQuizTaking 
                  quiz={quizzes.find(q => q.id === activeQuizId)!}
                  onCancel={() => triggerNavigate("student-quiz-list")}
                  onSubmitAttempt={onSubmitAttempt}
                />
              )}

              {/* STUDENT RESULTS BREAKDOWN SCREEN */}
              {view === "student-results" && activeAttemptId && (
                <StudentResultsView 
                  quiz={quizzes.find(q => q.id === activeQuizId)!}
                  attempt={attempts.find(at => at.id === activeAttemptId)!}
                  onRetake={() => onStartQuiz(activeQuizId!)}
                  onBackToDashboard={() => triggerNavigate("student-dashboard")}
                />
              )}

              {/* STUDENT PROGRESS ANALYTICS HISTORY SCREEN */}
              {view === "student-progress" && (
                <StudentProgressView 
                  attempts={attempts}
                  settings={settings}
                />
              )}

              {/* STUDENT COMPETITIVE LEADERBOARDS */}
              {view === "student-leaderboard" && (
                <div className="space-y-6 animate-fade-in font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-serif italic text-[#2D2A29]">Academics Standings</h1>
                      <p className="text-xs text-[#8C847E]">Compete with other students in real-time academic rankings.</p>
                    </div>
                  </div>

                  {settings.leaderboardVisible ? (
                    <div className="bg-white rounded-[32px] border border-[#EBE7E0] overflow-hidden">
                      <div className="p-6 border-b border-[#F3F1ED] flex justify-between items-center bg-[#F9F8F6]">
                        <span className="text-xs font-bold text-[#8C847E] font-mono block">ACTIVE LEADERBOARD RANGE: {settings.activeSemester} PERIOD</span>
                        <span className="text-[10px] text-[#5A6F56] font-bold">Updated real-time</span>
                      </div>

                      <div className="divide-y divide-[#F3F1ED]">
                        {leaderboard.map((item, idx) => {
                          const isSelf = item.studentId === user.id;
                          return (
                            <div 
                              key={item.studentId}
                              className={`p-5 flex items-center justify-between transition-all ${
                                isSelf ? "bg-[#DDE4DC]/35 border-y border-[#5A6F56]/15 font-semibold" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <span className={`w-6 text-center font-display font-black text-sm ${
                                  idx === 0 ? "text-amber-500 text-lg" : idx === 1 ? "text-[#BC8F71]" : "text-[#8C847E]"
                                }`}>
                                  {idx + 1}
                                </span>
                                {renderAvatar(item.avatar, "h-10 w-10", "ring-2 ring-slate-100")}
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-[#2D2A29] truncate flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    {isSelf && <span className="text-[9px] bg-[#5A6F56] text-white px-2 py-0.5 rounded-full font-bold uppercase font-mono">You</span>}
                                  </p>
                                  {/* Badge selection */}
                                  <div className="flex flex-wrap gap-1 mt-1 leading-none">
                                    {item.badges.length === 0 ? (
                                      <span className="text-[9px] text-[#8C847E] italic">No micro badges earned</span>
                                    ) : (
                                      item.badges.map((badge, bIdx) => (
                                        <span key={bIdx} className="px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-200/50 rounded text-[9px] font-bold">
                                          {badge}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-sm font-extrabold text-[#2D2A29] font-mono leading-none">{item.totalScore} pts</p>
                                <span className="text-[10px] text-[#8C847E] font-mono block mt-1">{item.quizzesTaken} Tests • {item.averagePercent}% Acc</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-12 text-center rounded-[32px] border border-[#EBE7E0] space-y-3">
                      <Lock className="h-8 w-8 text-[#BC8F71] mx-auto animate-float" />
                      <h4 className="font-bold text-sm text-[#2D2A29]">Leaderboard Temporarily Locked</h4>
                      <p className="text-xs text-[#8C847E] max-w-sm mx-auto">The administrator has temporarily hidden the leaderboard. Standings will be visible soon.</p>
                    </div>
                  )}
                </div>
              )}

              {/* STUDENT EDIT PROFILE & SETTINGS */}
              {view === "student-profile" && (
                <div className="max-w-xl mx-auto space-y-6 animate-fade-in font-sans">
                  <div>
                    <h1 className="text-2xl font-serif italic text-[#2D2A29]">Edit Student Profile</h1>
                    <p className="text-xs text-[#8C847E]">Update your displayed visual avatar, correct credential spelling errors or edit password keys.</p>
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#EBE7E0] space-y-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-medium text-slate-700">
                      
                      {/* Avatar Picker / Upload UI */}
                      <div className="space-y-3 pb-4 border-b border-[#F3F1ED]">
                        <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Your Display Profile Image</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Profile Avatar Frame resembling Facebook's empty silhouette if blank */}
                          {user.avatar && user.avatar.trim() !== "" ? (
                            <img 
                              src={user.avatar} 
                              alt="Active Avatar" 
                              referrerPolicy="no-referrer"
                              className="w-20 h-20 rounded-full object-cover border-4 border-[#5A6F56]/15 shadow-sm shrink-0" 
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden border-4 border-stone-200 shadow-xs shrink-0">
                              <svg className="w-16 h-16 text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1 space-y-2 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                              {/* Hidden standard file input */}
                              <label className="cursor-pointer bg-[#5A6F56] hover:bg-[#4A5D46] px-4 py-2 rounded-xl text-white font-bold transition flex items-center gap-1.5 shadow-xs">
                                <span>Upload New Picture</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    if (file.size > 2.5 * 1024 * 1024) {
                                      showToast("Image size must be smaller than 2.5MB", "error");
                                      return;
                                    }

                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      const base64String = reader.result as string;
                                      try {
                                        const res = await fetch("/api/users/profile", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ studentId: user.id, avatar: base64String })
                                        });
                                        if (res.ok) {
                                          const nextU = (await res.json()).user;
                                          setUser(nextU);
                                          localStorage.setItem("eduquiz-student-user", JSON.stringify(nextU));
                                          showToast("Profile avatar successfully updated!", "success");
                                        } else {
                                          showToast("Could not update profile", "error");
                                        }
                                      } catch {
                                        showToast("Connection timeout, try again", "error");
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>

                              {/* Remove Picture button if custom picture set */}
                              {user.avatar && user.avatar.trim() !== "" && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch("/api/users/profile", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ studentId: user.id, avatar: "" })
                                      });
                                      if (res.ok) {
                                        const nextU = (await res.json()).user;
                                        setUser(nextU);
                                        localStorage.setItem("eduquiz-student-user", JSON.stringify(nextU));
                                        showToast("Profile image reset to neutral silhouette!", "success");
                                      }
                                    } catch {
                                      showToast("Failed to reset avatar symbol", "error");
                                    }
                                  }}
                                  className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer transition"
                                >
                                  Remove Image
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-[#8C847E] font-medium max-w-sm">
                              Upload standard JPEG, PNG or WebP files. The placeholder adapts dynamically to your custom layout aspect.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Roster Full Name</label>
                        <input
                          name="name"
                          type="text"
                          defaultValue={user.name}
                          required
                          className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl py-2.5 px-3 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Roster Email Address</label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={user.email}
                          required
                          className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl py-2.5 px-3 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Update Password Keys</label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Leave space blank to keep unchanged keys"
                          className="w-full bg-[#F5F3EF] border border-[#D9D3C7] rounded-xl py-2.5 px-3 outline-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#F3F1ED] flex justify-end gap-2 text-xs">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-bold rounded-2xl cursor-pointer"
                        >
                          Save Credentials changes
                        </button>
                      </div>
                    </form>

                    {/* Dangerous section */}
                    <div className="pt-6 border-t border-rose-100 space-y-4">
                      <div>
                        <h4 className="font-bold text-rose-800 text-xs">Delete Student Account</h4>
                        <p className="text-[10px] text-[#8C847E]">Permanently delete your profile and all quiz records.</p>
                      </div>
                      <button
                        onClick={async () => {
                          const isConfirmed = window.confirm("Are you sure you want to terminate your account? All logs will be deleted.");
                          if (isConfirmed) {
                            try {
                              const res = await fetch(`/api/students/${user.id}`, { method: "DELETE" });
                              if (res.ok) {
                                showToast("Account deleted successfully.", "success");
                                handleLogout();
                              }
                            } catch {}
                          }
                        }}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl text-xs"
                      >
                        Self Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================== */}
          {/* ADMIN LOGGED IN SERVICES ROUTER */}
          {/* ========================================== */}
          {user && user.role === "ADMIN" && (
            <>
              {/* ADMIN DASHBOARD */}
              {view === "admin-dashboard" && (
                <AdminDashboard 
                  settings={settings}
                  quizzes={quizzes}
                  students={students}
                  attempts={attempts}
                  onNavigate={triggerNavigate}
                />
              )}

              {/* ADMIN STUDENT DIRECTORY ROSTER */}
              {view === "admin-students" && (
                <AdminStudents 
                  students={students}
                  onUpdateStudent={onUpdateStudent}
                  onDeleteStudent={onDeleteStudent}
                />
              )}

              {/* ADMIN QUIZ LIST INDEX */}
              {view === "admin-quizzes" && (
                <AdminQuizzes 
                  quizzes={quizzes}
                  settings={settings}
                  onEditQuiz={(quizId) => {
                    setActiveQuizEditorId(quizId);
                    triggerNavigate("admin-edit-quiz");
                  }}
                  onCreateQuizTrigger={() => {
                    setActiveQuizEditorId(null);
                    triggerNavigate("admin-create-quiz");
                  }}
                  onDeleteQuiz={onDeleteQuiz}
                  onTogglePublish={onTogglePublish}
                />
              )}

              {/* ADMIN QUIZ AUTHORING EDITOR */}
              {(view === "admin-create-quiz" || view === "admin-edit-quiz") && (
                <AdminQuizEditor 
                  quizIdToEdit={activeQuizEditorId}
                  quizzes={quizzes}
                  questionBank={questionBank}
                  onSaveQuiz={onSaveQuiz}
                  onClose={() => triggerNavigate("admin-quizzes")}
                />
              )}

              {/* ADMIN REUSABLE TEMPLATES QUESTION BANK */}
              {view === "admin-question-bank" && (
                <AdminQuestionBank 
                  questionBank={questionBank}
                  onCreateBankItem={onCreateQuestionBankItem}
                  onDeleteBankItem={onDeleteQuestionBankItem}
                />
              )}

              {/* ADMIN CREATE EXAM ALLOCATIONS TO RECIPIENTS */}
              {view === "admin-assign" && (
                <AdminAssignQuizzes 
                  quizzes={quizzes}
                  students={students}
                  onCommitAssignments={onCommitAssignments}
                  onClose={() => triggerNavigate("admin-dashboard")}
                />
              )}

              {/* ADMIN RESULTS AND EXPORT CSV MODULES */}
              {view === "admin-reports" && (
                <AdminReports 
                  attempts={attempts}
                  onResetScores={onResetLeaderboard}
                />
              )}

              {/* ADMIN LEADERBOARDS & DANGEROUS RESET SUITE */}
              {view === "admin-leaderboard" && (
                <AdminLeaderboard 
                  settings={settings}
                  leaderboard={leaderboard}
                  onToggleVisibility={onToggleLeaderboardVisibility}
                  onResetLeaderboard={onResetLeaderboard}
                />
              )}

              {/* ADMIN SITE CONFIGURATION SETTINGS */}
              {view === "admin-settings" && (
                <div className="space-y-6 animate-fade-in font-sans max-w-5xl mx-auto">
                  <div className="border-b border-[#EBE7E0]/60 pb-4">
                    <h1 className="text-2xl font-serif italic text-[#2D2A29]">Global Platform Orchestration</h1>
                    <p className="text-xs text-[#8C847E] mt-1">Define the current dynamic calendar milestones, adjust brand elements, and update credentials.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Site settings parameters */}
                    <AdminSettings 
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                    />

                    {/* Secondary admin profile update */}
                    <div className="bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-4 shadow-2xs">
                      <h3 className="font-bold text-[#2D2A29] text-xs uppercase tracking-widest font-mono border-b border-[#F3F1ED] pb-3">
                        Revise admin credentials
                      </h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs text-slate-700">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#8C847E]">Administrator Name</label>
                          <input
                            name="name"
                            type="text"
                            defaultValue={user.name}
                            required
                            className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#8C847E]">Administrator Email Address</label>
                          <input
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            required
                            className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-2 px-3 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                          />
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
                          >
                            Save profile credentials
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* SUPABASE CLOUD SYNC & REPLICATION */}
                  <AdminSupabaseSync />
                </div>
              )}
            </>
          )}

          </div>
        )}
      </main>

    </div>
  );
}
