import React, { useState, useEffect } from "react";
import { 
  Trophy, BookOpen, Clock, AlertTriangle, ShieldCheck, Mail, LogIn, 
  UserPlus, User as UserIcon, Calendar, BarChart2, Shield, Settings as SettingsIcon,
  ChevronRight, AlignJustify, X, GraduationCap, Compass, FileSpreadsheet, Lock, Check,
  Home, FileQuestion
} from "lucide-react";
import { User, Settings, Quiz, Assignment, Attempt, Question, QuestionBankItem, LeaderboardEntry, StudentQuestionSubmission } from "./types";
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
import { StudentSubmissionsView, AdminSubmissionsView } from "./components/SubmissionsViews";
import { StudentPendingApproval } from "./components/StudentPendingApproval";

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
  const [submissions, setSubmissions] = useState<StudentQuestionSubmission[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<string[]>([]);
  const [signUpVerificationCode, setSignUpVerificationCode] = useState("");
  const [upgradeVerificationCode, setUpgradeVerificationCode] = useState("");
  const [copiedCodeAdmin, setCopiedCodeAdmin] = useState<string | null>(null);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string | null>(null);
  const [lastGeneratedType, setLastGeneratedType] = useState<"student" | "admin" | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Custom Iframe-Safe Confirmation overlay states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  // Selection references
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [activeQuizEditorId, setActiveQuizEditorId] = useState<string | null>(null); // null means creating

  // Mobile menu open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchVerificationCodesSilently = async () => {
    try {
      const res = await fetch("/api/admin/verification-codes");
      if (res.ok) {
        const data = await res.json();
        setVerificationCodes(data);
      }
    } catch {
      // Quiet fail
    }
  };

  // Load Initial Configuration and settings
  useEffect(() => {
    fetchSettings();
    fetchVerificationCodesSilently();
    if (user) {
      refreshData();
    }
  }, [user, view]);

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

        // 5.5. All Student Submissions (admin only)
        const subRes = await fetch("/api/submissions");
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData);
        }

        // 5.6. Verification Codes (admin only)
        const vcRes = await fetch("/api/admin/verification-codes");
        if (vcRes.ok) {
          const vcData = await vcRes.json();
          setVerificationCodes(vcData);
        }
      } else {
        if (user.isGuest) {
          const guestAttemptsKey = `eduquiz-guest-attempts-${user.id}`;
          const localAtt = localStorage.getItem(guestAttemptsKey);
          if (localAtt) {
            setAttempts(JSON.parse(localAtt));
          } else {
            setAttempts([]);
          }
          setAssignments([]);
          setSubmissions([]);
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

          // 7.5. Student Specific Submissions (student only)
          const studentSubRes = await fetch(`/api/submissions?studentId=${user.id}`);
          if (studentSubRes.ok) {
            const studentSubData = await studentSubRes.json();
            setSubmissions(studentSubData);
          }
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
    const verificationCode = (data.get("verificationCode") || "") as string;

    if (!name || !email || !password) {
      showToast("All fields are required to register your account", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, verificationCode })
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

  const handleContinueAsGuest = () => {
    triggerNavigate("signup");
    showToast("Join instantly! Fill in your Name, Email, and Password. No verification code is required to access your student profile!", "success");
  };

  const handleUpgradeGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.isGuest) return;

    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const verificationCode = data.get("verificationCode") as string;

    if (!name || !email || !password) {
      showToast("Name, email, and password are required.", "error");
      return;
    }

    try {
      // Get guest attempts from local storage to upload and sync
      const guestAttemptsKey = `eduquiz-guest-attempts-${user.id}`;
      const savedLocal = localStorage.getItem(guestAttemptsKey);
      const attemptsList = savedLocal ? JSON.parse(savedLocal) : [];

      const res = await fetch("/api/auth/upgrade-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          verificationCode: verificationCode || "",
          attempts: attemptsList
        })
      });

      const responseData = await res.json();
      if (res.ok) {
        const upgradedUser = responseData.user;
        setUser(upgradedUser);
        localStorage.setItem("eduquiz-student-user", JSON.stringify(upgradedUser));
        
        // Wipe local guest attempts since they're uploaded now
        localStorage.removeItem(guestAttemptsKey);

        showToast("Success! Your temporary guest account is now fully active!", "success");
        setView("student-dashboard");
      } else {
        showToast(responseData.message || "Invalid or expired Admin Verification Code", "error");
      }
    } catch {
      showToast("Connection failure registering guest account", "error");
    }
  };

  const handleGenerateVerificationCode = async (type: "student" | "admin" = "student") => {
    try {
      const res = await fetch("/api/admin/verification-codes", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        const code = data.code;
        
        // Save to active states
        setLastGeneratedKey(code);
        setLastGeneratedType(type);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);

        // Auto copy to clipboard instantly!
        try {
          await navigator.clipboard.writeText(code);
        } catch (clipErr) {
          console.warn("Clipboard auto-copy failed", clipErr);
        }

        await refreshData();
      }
    } catch {
      showToast("Could not generate code", "error");
    }
  };

  const handleDeleteVerificationCode = async (code: string) => {
    try {
      const res = await fetch(`/api/admin/verification-codes/${code}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Deleted verification code successfully", "success");
        await refreshData();
      }
    } catch {
      showToast("Could not delete code", "error");
    }
  };

  const handleClearVerificationCodes = async () => {
    // Optimistic state update for instant, lag-free UI reaction in iframe
    setVerificationCodes([]);
    try {
      const res = await fetch("/api/admin/verification-codes", {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Cleared all active unused keys", "success");
        await refreshData();
      } else {
        showToast("Could not clear keys", "error");
        // Rollback on failure
        const vcRes = await fetch("/api/admin/verification-codes");
        if (vcRes.ok) {
          const vcData = await vcRes.json();
          setVerificationCodes(vcData);
        }
      }
    } catch {
      showToast("Could not clear keys", "error");
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

    if (user.isGuest) {
      const targetQuiz = quizzes.find(q => q.id === activeQuizId);
      const quizQuestions = targetQuiz?.questions || [];

      let score = 0;
      quizQuestions.forEach((q) => {
        const studentAnsIdx = userAnswers[q.id];
        if (studentAnsIdx !== undefined && Number(studentAnsIdx) === q.correctAnswer) {
          score++;
        }
      });
      const total = quizQuestions.length;
      const percent = total > 0 ? (score / total) * 100 : 0;
      const passed = percent >= 60;

      const newAttempt: Attempt = {
        id: "at-guest-" + Math.random().toString(36).substring(2, 9),
        quizId: activeQuizId,
        studentId: user.id,
        score,
        total,
        passed,
        answers: userAnswers,
        createdAt: new Date().toISOString(),
        quizTitle: targetQuiz ? targetQuiz.title : "Archived Quiz",
        quizSubject: targetQuiz ? targetQuiz.subject : "Unsorted",
        quizSemester: targetQuiz ? targetQuiz.semester : "MIDTERM",
        studentName: user.name,
      };

      const guestAttemptsKey = `eduquiz-guest-attempts-${user.id}`;
      const savedLocal = localStorage.getItem(guestAttemptsKey);
      const guestAttemptsList: Attempt[] = savedLocal ? JSON.parse(savedLocal) : [];
      guestAttemptsList.unshift(newAttempt);
      localStorage.setItem(guestAttemptsKey, JSON.stringify(guestAttemptsList));

      setAttempts(guestAttemptsList);

      if (passed) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 0;
      }
      setUser({ ...user });
      localStorage.setItem("eduquiz-student-user", JSON.stringify(user));

      setActiveAttemptId(newAttempt.id);
      showToast(`[Guest Mode] Attempt logged locally: Scored ${score}/${total}.`, "success");
      setView("student-results");
      return;
    }

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

    if (user.isGuest) {
      const updatedGuest: User = {
        ...user,
        name: name || user.name,
        email: email || user.email,
        createdAt: user.createdAt
      };
      setUser(updatedGuest);
      localStorage.setItem("eduquiz-student-user", JSON.stringify(updatedGuest));
      showToast("Guest profile updated locally!", "success");
      return;
    }

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
  const onCreateStudent = async (payload: any) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Student created cleanly in database.", "success");
        await refreshData();
        return true;
      } else {
        showToast(data.message || "Could not create student profile.", "error");
        return false;
      }
    } catch {
      showToast("Creation timeout", "error");
      return false;
    }
  };

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
    handleCustomConfirm(
      "Terminate Student Registration",
      "Are you sure you want to terminate this student's registration? This removes all their history attempts.",
      async () => {
        try {
          const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
          if (res.ok) {
            showToast("Student profile purged from directories.", "success");
            await refreshData();
          }
        } catch {
          showToast("Purge timeout", "error");
        }
      }
    );
  };

  const onApproveStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        showToast("Student account approved and activated!", "success");
        await refreshData();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to approve student.", "error");
      }
    } catch {
      showToast("Network failure, could not approve student.", "error");
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
    handleCustomConfirm(
      "Terminate Examination Packet",
      "Terminate this examination packet? Existing assignments will be flattened.",
      async () => {
        try {
          const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
          if (res.ok) {
            showToast("Quiz deleted successfully.", "success");
            await refreshData();
          }
        } catch {
          showToast("Delete timeout", "error");
        }
      }
    );
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

  const onSubmitQuestionSubmissions = async (subPayloads: any[]) => {
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subPayloads)
      });
      if (res.ok) {
        showToast("Your suggested questions were submitted to Dr. Vance for approval!", "success");
        await refreshData();
        return true;
      } else {
        showToast("Failed to submit suggested questions", "error");
        return false;
      }
    } catch {
      showToast("Network timeout submitting questions", "error");
      return false;
    }
  };

  const onReviewSubmission = async (id: string, status: "APPROVED" | "REJECTED", feedback?: string) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminFeedback: feedback })
      });
      if (res.ok) {
        showToast(status === "APPROVED" ? "Question APPROVED! Added to Quest Bank." : "Question submission rejected with feedback.", "success");
        await refreshData();
        return true;
      } else {
        showToast("Failed to update submission status.", "error");
        return false;
      }
    } catch {
      showToast("Communication link timeout updating submission status.", "error");
      return false;
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
      {user && user.isApproved !== false && view !== "student-quiz-taking" && (
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
                onClick={() => triggerNavigate("student-submissions")}
                className={`flex flex-col items-center gap-1 cursor-pointer flex-1 py-1 transition ${
                  view === "student-submissions" ? "text-[#5A6F56]" : "text-[#8C847E]"
                }`}
              >
                <FileQuestion className="h-5 w-5" />
                <span className="text-[10px] font-bold font-sans">Suggest Qs</span>
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

                  <div className="relative text-center flex items-center justify-center my-1">
                    <span className="bg-white px-3 text-[10px] text-gray-400 font-mono uppercase z-10">or</span>
                    <div className="absolute w-full border-b border-gray-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="w-full py-3 bg-[#EEF2ED] hover:bg-[#DDE5DC] text-[#4A5D46] font-bold rounded-2xl cursor-pointer transition uppercase text-xs tracking-wider border border-[#5A6F56]/10"
                  >
                    Instant Student Signup (No Code) 🚀
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

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-amber-700 font-mono block flex items-center justify-between">
                      <span>Admin Verification Code</span>
                      <span className="text-[9px] font-normal text-amber-600 font-sans italic">Optional Code</span>
                    </label>
                    <input
                      name="verificationCode"
                      type="text"
                      value={signUpVerificationCode}
                      onChange={(e) => setSignUpVerificationCode(e.target.value)}
                      placeholder="e.g. EQ-XXXX-XXXX (Optional)"
                      className="w-full bg-[#FCFAF6] border border-[#BC8F71]/40 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#BC8F71] placeholder:text-[#BC8F71]/40 font-mono tracking-wider"
                    />

                    <p className="text-[10px] text-slate-500 leading-normal mt-1">
                      This code is completely optional! Leave it blank to register and activate your student account instantly.
                    </p>
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
            user.isApproved === false ? (
              <StudentPendingApproval
                user={user}
                onLogout={handleLogout}
                onActivated={(updatedUser) => {
                  setUser(updatedUser);
                  localStorage.setItem("eduquiz-student-user", JSON.stringify(updatedUser));
                  showToast("Account activated successfully!", "success");
                  triggerNavigate("student-dashboard");
                }}
                showToast={showToast}
              />
            ) : (
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
                  user={user!}
                />
              )}

              {/* STUDENT ACTIVE QUIZ TAKING ENGINE */}
              {view === "student-quiz-taking" && activeQuizId && (
                <StudentQuizTaking 
                  quiz={quizzes.find(q => q.id === activeQuizId)!}
                  onCancel={() => triggerNavigate("student-quiz-list")}
                  onSubmitAttempt={onSubmitAttempt}
                  allQuizzes={quizzes}
                  attempts={attempts}
                  onStartQuiz={onStartQuiz}
                  user={user || undefined}
                  assignments={assignments}
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
                  {user.isGuest ? (
                    <>
                      <div>
                        <h1 className="text-2xl font-serif italic text-amber-800">Activate Registered Account 🌟</h1>
                        <p className="text-xs text-[#8C847E]">Promote your temporary local guest writer account to a fully synchronized account with the school's live leaderboard!</p>
                      </div>

                      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-amber-200 shadow-sm space-y-6">
                        <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl text-xs text-amber-900 leading-relaxed">
                          <strong>How does this work?</strong>
                          <ul className="list-disc pl-4 mt-1.5 space-y-1">
                            <li>Your local quiz achievements (attempts) will automatically upload and sync to your new account.</li>
                            <li>You will be listed on the live school leaderboard and rank dynamically in the active semesters.</li>
                            <li>You will be able to submit co-authored questions for extra credits!</li>
                          </ul>
                        </div>

                        <form onSubmit={handleUpgradeGuest} className="space-y-4 text-xs font-medium text-slate-700">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Complete Name</label>
                            <input
                              name="name"
                              type="text"
                              required
                              placeholder="e.g. Alex Rivera"
                              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Active Email Address</label>
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="e.g. alex@gmail.com"
                              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">Choose Password</label>
                            <input
                              name="password"
                              type="password"
                              required
                              placeholder="Create your account password..."
                              className="w-full bg-[#F9F8F6] border border-[#D9D3C7] rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-[#5A6F56]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-amber-700 font-mono block flex items-center justify-between">
                              <span>Admin Verification Code</span>
                              <span className="text-[9px] font-normal text-amber-600 font-sans italic">Optional Key</span>
                            </label>
                            <input
                              name="verificationCode"
                              type="text"
                              value={upgradeVerificationCode}
                              onChange={(e) => setUpgradeVerificationCode(e.target.value)}
                              placeholder="e.g. EQ-XXXX-XXXX (Optional)"
                              className="w-full bg-[#FCFAF6] border border-amber-300 rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-amber-500 font-mono tracking-wider"
                            />

                            <p className="text-[10px] text-slate-500 mt-1">
                              This code is completely optional! Leave it blank to activate your student account instantly.
                            </p>
                          </div>

                          <div className="pt-4 border-t border-[#F3F1ED] flex justify-end gap-2 text-xs">
                            <button
                              type="submit"
                              className="w-full sm:w-auto px-6 py-3 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-bold rounded-2xl cursor-pointer"
                            >
                              Verify & Promote Account 🚀
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
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
                            onClick={() => {
                              handleCustomConfirm(
                                "Terminate Account",
                                "Are you sure you want to terminate your account? All logs will be deleted.",
                                async () => {
                                  try {
                                    const res = await fetch(`/api/students/${user.id}`, { method: "DELETE" });
                                    if (res.ok) {
                                      showToast("Account deleted successfully.", "success");
                                      handleLogout();
                                    }
                                  } catch {}
                                }
                              );
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl text-xs"
                          >
                            Self Delete Account
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STUDENT SUGGESTIONS & CO-AUTHORING DESK */}
              {view === "student-submissions" && (
                <StudentSubmissionsView 
                  user={user}
                  submissions={submissions}
                  onSubmitSubmissions={onSubmitQuestionSubmissions}
                />
              )}
            </>
            )
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

              {/* ADMIN PROPOSALS REVIEW AUDIT */}
              {view === "admin-submissions" && (
                <AdminSubmissionsView 
                  submissions={submissions}
                  onReviewSubmission={onReviewSubmission}
                />
              )}

              {/* ADMIN STUDENT DIRECTORY ROSTER */}
              {view === "admin-students" && (
                <AdminStudents 
                  students={students}
                  onCreateStudent={onCreateStudent}
                  onUpdateStudent={onUpdateStudent}
                  onDeleteStudent={onDeleteStudent}
                  onApproveStudent={onApproveStudent}
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
                  onConfirmDialog={handleCustomConfirm}
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

                    <div className="space-y-6">
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

                      {/* KEY CODE VERIFICATION MANAGEMENT PANEL */}
                      <div className="bg-white p-6 rounded-[32px] border border-[#BC8F71]/35 space-y-4 shadow-xs relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full pointer-events-none flex items-center justify-center pl-7 pb-7 text-amber-500 font-mono text-xl">
                          🔑
                        </div>
                        <div>
                          <h3 className="font-bold text-[#2D2A29] text-xs uppercase tracking-widest font-mono border-b border-[#F3F1ED] pb-3">
                            Validation Keys Generator
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-2">
                            Generate unique, single-use active validation tokens for student signup and verification-code promotion. 
                          </p>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-[#8C847E] font-mono tracking-wider uppercase block">
                            Choose Verification Role to Generate:
                          </span>
                          <div className="grid grid-cols-2 gap-2 pb-1">
                            <button
                              type="button"
                              onClick={() => handleGenerateVerificationCode("student")}
                              className="px-3 py-3 bg-[#5A6F56] hover:bg-[#4a5d46] text-white font-bold rounded-xl text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs active:scale-95"
                            >
                              <span>👨‍🎓 Student Signup Key</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateVerificationCode("admin")}
                              className="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs active:scale-95"
                            >
                              <span>⚙️ Admin Upgrade Key</span>
                            </button>
                          </div>
                        </div>

                        {/* DESCRIPTIVE PRESENTATION FOR RECENTLY GENERATED CODE & QR CODE */}
                        {lastGeneratedKey && (
                          <div className="bg-[#FAF9F6] border border-amber-300/60 rounded-2xl p-4 space-y-3 animate-fade-in relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[#EBE7E0] pb-2">
                              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider font-mono">
                                🎯 Active {lastGeneratedType === "student" ? "Student" : "Admin"} Key Issued
                              </span>
                              <span className="text-[9.5px] bg-[#EBE7E0]/60 text-slate-705 px-2 py-0.5 rounded-full font-mono">
                                Auto-Copied 📋
                              </span>
                            </div>

                            <div className="flex gap-4 items-center">
                              {/* QR Code Container */}
                              <div className="bg-white p-2 rounded-xl border border-[#EBE7E0] shadow-3xs flex-shrink-0 flex items-center justify-center">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96&96&data=${encodeURIComponent(lastGeneratedKey)}`} 
                                  alt="Verification QR Code"
                                  className="w-24 h-24 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="text-[10px] text-[#8C847E]">Click code below to copy again:</div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(lastGeneratedKey);
                                      setCopiedNotification(true);
                                      setTimeout(() => setCopiedNotification(false), 2000);
                                    } catch {}
                                  }}
                                  className="w-full text-left font-mono font-black text-amber-950 text-xl tracking-wider select-all cursor-pointer hover:bg-amber-50 rounded-lg p-1.5 border border-dashed border-amber-300/40 bg-amber-50/20 active:scale-98 transition flex items-center justify-between"
                                >
                                  <span className="truncate">{lastGeneratedKey}</span>
                                  {copiedNotification ? (
                                    <span className="text-[9px] text-green-600 font-sans shrink-0 font-bold ml-1 bg-green-50 px-1.5 py-0.5 rounded animate-bounce">✓ Recopied</span>
                                  ) : (
                                    <span className="text-[9px] text-[#8C847E] font-sans font-normal ml-1">📋 Tap</span>
                                  )}
                                </button>
                                <p className="text-[9.5px] text-stone-500 leading-snug">
                                  Use this token for registry verification. Scan key or paste to prefill inputs instantly.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#8C847E] font-mono">
                            <span className="flex items-center gap-2">
                              <span>Active Unused Keys ({verificationCodes.length})</span>
                              {verificationCodes.length > 0 && (
                                <button
                                  type="button"
                                  onClick={handleClearVerificationCodes}
                                  className="text-[9px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded transition cursor-pointer lowercase"
                                >
                                  (clear keys ✕)
                                </button>
                              )}
                            </span>
                            {verificationCodes.length > 0 && <span>Click any key below to Copy</span>}
                          </div>

                          {verificationCodes.length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[11px]">
                              No active codes. Click "Generate" to provision client licenses.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                              {verificationCodes.map((code) => (
                                <div 
                                  key={code} 
                                  className="group flex items-center justify-between bg-amber-50/50 hover:bg-amber-50 border border-amber-200/50 rounded-xl p-2 transition"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(code);
                                      setCopiedCodeAdmin(code);
                                      setTimeout(() => setCopiedCodeAdmin(null), 1500);
                                    }}
                                    className="font-mono text-xs text-amber-950 hover:underline font-bold text-left truncate flex-1 flex items-center justify-between"
                                    title="Click to copy"
                                  >
                                    <span>🔑 {code}</span>
                                    {copiedCodeAdmin === code && (
                                      <span className="text-[9px] text-green-600 bg-green-50 px-1 rounded mr-1 animate-pulse font-sans">✓ Copied</span>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVerificationCode(code)}
                                    className="text-stone-400 hover:text-rose-600 text-[10px] pl-1 font-bold transition"
                                    title="Delete key"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUPABASE CLOUD SYNC & REPLICATION */}
                  <AdminSupabaseSync currentUser={user} />
                </div>
              )}
            </>
          )}

          </div>
        )}
      </main>

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-100 animate-fade-in font-sans">
          <div className="bg-white max-w-sm w-full p-6 leading-relaxed rounded-[32px] border border-[#EBE7E0] space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-serif italic text-[#2D2A29] font-bold">{confirmDialog.title}</h3>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed font-sans">{confirmDialog.message}</p>
            
            <div className="flex gap-2 pt-2 justify-end text-xs font-bold font-sans">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 hover:bg-slate-100 rounded-xl transition text-stone-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
