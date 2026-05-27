import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, BookOpen, Clock, AlertCircle, Calendar, LineChart, 
  ArrowRight, Check, X, ShieldAlert, BadgeInfo, Play, 
  RotateCcw, Sparkles, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Settings, Quiz, Assignment, Attempt, LeaderboardEntry } from "../types";

export const getSemesterLabel = (sem: string, isShort = false): string => {
  const mapping: Record<string, string> = isShort ? {
    PRELIM: "Prelim",
    MIDTERM: "Midterm",
    PREFINALS: "Pre-Finals",
    FINALS: "Finals"
  } : {
    PRELIM: "Prelim Period",
    MIDTERM: "Midterm Period",
    PREFINALS: "Pre-Finals Period",
    FINALS: "Finals Period"
  };
  return mapping[sem] || sem;
};

// ==========================================
// 0. PERSONALIZED STUDY RECOMMENDATIONS
// ==========================================
interface QuizRecommendationsProps {
  user: User;
  quizzes: Quiz[];
  attempts: Attempt[];
  assignments: Assignment[];
  onStartQuiz: (quizId: string) => void;
  subject?: string;
  isCompact?: boolean;
  currentQuizId?: string;
}

export function QuizRecommendations({
  user,
  quizzes,
  attempts,
  assignments,
  onStartQuiz,
  subject,
  isCompact = false,
  currentQuizId
}: QuizRecommendationsProps) {
  const [createdTime, setCreatedTime] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(86400); // 24 Hours in seconds

  useEffect(() => {
    const key = `eduquiz-recomm-created-${user.id}`;
    let saved = localStorage.getItem(key);
    let parsedTime = saved ? parseInt(saved, 10) : null;

    if (!parsedTime || isNaN(parsedTime)) {
      parsedTime = Date.now();
      localStorage.setItem(key, parsedTime.toString());
    }
    setCreatedTime(parsedTime);

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - (parsedTime || now);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const remainingSecs = Math.max(0, Math.ceil((twentyFourHours - elapsed) / 1000));
      setSecondsLeft(remainingSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.id, createdTime]);

  const handleRefresh = () => {
    const key = `eduquiz-recomm-created-${user.id}`;
    const now = Date.now();
    localStorage.setItem(key, now.toString());
    setCreatedTime(now);
    setSecondsLeft(86400);
  };

  const isExpired = secondsLeft <= 0;

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getRecommendedList = (): Quiz[] => {
    if (isExpired) return [];

    let candidates = quizzes.filter(q => q.status === "PUBLISHED");
    if (subject) {
      candidates = candidates.filter(q => q.subject === subject);
    }
    if (currentQuizId) {
      candidates = candidates.filter(q => q.id !== currentQuizId);
    }

    const sorted = [...candidates].sort((a, b) => {
      const aAssigned = assignments.some(as => as.quizId === a.id && !as.completedAt) ? 1 : 0;
      const bAssigned = assignments.some(as => as.quizId === b.id && !as.completedAt) ? 1 : 0;
      if (aAssigned !== bAssigned) return bAssigned - aAssigned;

      const aFailed = attempts.some(at => at.quizId === a.id && !at.passed) ? 1 : 0;
      const bFailed = attempts.some(at => at.quizId === b.id && !at.passed) ? 1 : 0;
      if (aFailed !== bFailed) return bFailed - aFailed;

      const aNoAttempt = !attempts.some(at => at.quizId === a.id) ? 1 : 0;
      const bNoAttempt = !attempts.some(at => at.quizId === b.id) ? 1 : 0;
      if (aNoAttempt !== bNoAttempt) return bNoAttempt - aNoAttempt;

      return 0;
    });

    return sorted.slice(0, 3);
  };

  const recommendedQuizzes = getRecommendedList();

  if (isCompact) {
    if (isExpired) {
      return (
        <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-200/50 text-[11px] leading-relaxed text-amber-900 mt-4">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Recommended Module Quizzes (Expired)</span>
          </div>
          <p className="text-[#8C847E]">The 24-hr study guides have expired. Submit or complete your current test to refresh recommendations inside your dashboard.</p>
        </div>
      );
    }

    if (recommendedQuizzes.length === 0) return null;

    return (
      <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#EBE7E0] space-y-2 mt-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#EBE7E0]/60 pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 animate-pulse" />
            <span className="text-xs font-bold text-[#2D2A29]">Recommend Upwards Study: {subject?.split(" - ")[0]}</span>
          </div>
          <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold shrink-0">
            ⏳ {formatCountdown(secondsLeft)}
          </span>
        </div>
        <div className="space-y-1.5">
          {recommendedQuizzes.map(rq => (
            <div key={rq.id} className="flex items-center justify-between text-[11px] p-2 bg-white rounded-xl border border-[#EBE7E0]/75 hover:border-[#BC8F71]/60 transition-all">
              <span className="truncate font-medium text-[#433F3E] pr-2 flex-1">{rq.title}</span>
              <button 
                onClick={() => onStartQuiz(rq.id)}
                className="px-2 py-0.5 bg-[#BC8F71]/10 hover:bg-[#BC8F71] text-[#BC8F71] hover:text-white rounded-md font-bold transition-all shrink-0 cursor-pointer"
              >
                Fast Try
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F1ED] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F2EDE7] rounded-xl text-[#BC8F71] shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <h3 className="font-serif italic text-lg text-[#2D2A29] font-bold">Personalized Study Targets (24-Hour Limits)</h3>
          </div>
          <p className="text-xs text-[#8C847E]">
            We analyzed your homework status to select 3 optimal module handouts requiring urgent review.
          </p>
        </div>

        {!isExpired ? (
          <div className="bg-amber-50 border border-amber-200/50 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-medium text-[#8C847E]">Remaining:</span>
            <span className="font-mono text-xs font-bold text-amber-700">{formatCountdown(secondsLeft)}</span>
          </div>
        ) : (
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#BC8F71] hover:bg-[#a67d60] text-white text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <RefreshCw className="h-3 w-3 shrink-0 animate-spin-reverse" />
            Refresh Recommendations
          </button>
        )}
      </div>

      {isExpired ? (
        <div className="text-center py-6 px-4 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EBE7E0] space-y-3">
          <span className="text-4xl text-[#BC8F71]/60 block">⏳</span>
          <div>
            <h4 className="font-bold text-sm text-[#2D2A29]">Current Recommendations Expired</h4>
            <p className="text-xs text-[#8C847E] mt-1">
              Your 24-hr recommendations have been removed. Force regenerate to trigger a clean 24-hr series.
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-1.5 bg-white border border-[#BC8F71]/40 text-[#BC8F71] hover:bg-[#BC8F71] hover:text-white rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer"
          >
            Regenerate Now
          </button>
        </div>
      ) : recommendedQuizzes.length === 0 ? (
        <div className="text-center py-6 text-[#8C847E] text-xs font-medium bg-[#FAFAF9] rounded-2xl border border-dashed border-[#EBE7E0]">
          No recommendations available for this module yet. We'll show options as soon as new mock pages are published.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedQuizzes.map((rq, idx) => {
            const isCompleted = attempts.some(a => a.quizId === rq.id);
            const isAssigned = assignments.some(a => a.quizId === rq.id && !a.completedAt);
            return (
              <div 
                key={rq.id} 
                className="bg-[#FAFAF9] hover:bg-[#F6F5F2] border border-[#EBE7E0] rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all group hover:scale-[1.01]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-[#EBE7E0]/60 text-[#6B635E] rounded-md font-mono text-[9px] font-bold">
                      TAG #{idx + 1}
                    </span>
                    {isAssigned && !isCompleted && (
                      <span className="bg-[#BC8F71]/10 text-[#BC8F71] px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider font-mono">
                        ASSIGNED
                      </span>
                    )}
                    {isCompleted && (
                      <span className="bg-[#E9F0E8] text-[#4A5D46] px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider font-mono">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold transition-colors text-xs text-[#2D2A29] line-clamp-2 leading-tight group-hover:text-[#BC8F71]">
                    {rq.title}
                  </h4>
                  <p className="text-[10px] text-[#8C847E]">{rq.subject.split(" - ")[0]}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[#EBE7E0]/50 font-sans">
                  <span className="text-[#8C847E] font-medium">{rq.questionCount || rq.questions?.length || 0} Questions</span>
                  <button 
                    onClick={() => onStartQuiz(rq.id)}
                    className="flex items-center gap-1 font-bold text-[#5A6F56] hover:text-[#4A5D46] cursor-pointer"
                  >
                    <span>Start</span>
                    <Play className="h-2.5 w-2.5 fill-current shrink-0" />
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
// 1. STUDENT DASHBOARD
// ==========================================
interface StudentDashboardProps {
  user: User;
  settings: Settings;
  assignments: Assignment[];
  attempts: Attempt[];
  quizzes: Quiz[];
  leaderboard: LeaderboardEntry[];
  onNavigate: (view: string) => void;
  onStartQuiz: (quizId: string) => void;
}

export function StudentDashboard({
  user,
  settings,
  assignments,
  attempts,
  quizzes,
  leaderboard,
  onNavigate,
  onStartQuiz
}: StudentDashboardProps) {
  // Stats calculations
  const totalTaken = attempts.length;
  const avgPercent = attempts.length > 0 
    ? Math.round((attempts.reduce((sum, current) => sum + (current.score / current.total), 0) / attempts.length) * 100) 
    : 0;

  // Filter out assignments for current active semester
  const activeAssignments = assignments.filter(a => {
    const isCompleted = a.completedAt;
    return !isCompleted && a.quizSemester === settings.activeSemester;
  });

  const recentAttempts = attempts.slice(0, 4);

  // Top rankings
  const topRankings = leaderboard.slice(0, 3);
  const userRankObj = leaderboard.find(l => l.studentId === user.id);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="rounded-[32px] bg-[#EBE7E0] p-6 sm:p-8 border border-[#D9D3C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-[#DDE4DC] text-[#4A5D46] rounded-full text-xs font-bold uppercase tracking-widest border border-[#5A6F56]/15">
            📅 {getSemesterLabel(settings.activeSemester).toUpperCase()} ACTIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-[#2D2A29] mt-2.5">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#6B635E] mt-1 font-sans">
            Ready to enhance your scores? Active tasks are waiting for your attention below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onNavigate("student-submissions")}
            className="px-5 py-2.5 bg-white border border-[#BC8F71]/40 text-[#BC8F71] hover:bg-[#BC8F71]/5 text-xs font-semibold rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Co-Author Questions
          </button>
          <button 
            onClick={() => onNavigate("student-quiz-list")}
            className="px-5 py-2.5 bg-[#5A6F56] text-white hover:bg-[#4A5D46] text-xs font-semibold rounded-2xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Browse All Quizzes
          </button>
        </div>
      </div>

      {user.isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold font-mono uppercase">
              ⚠️ GUEST MODE ACTIVE
            </span>
            <h3 className="font-bold text-sm text-[#2D2A29] font-serif italic">Your progress is saved locally to your browser only!</h3>
            <p className="text-xs text-slate-600">
              Your scores won't appear on the public school leaderboard until your account is upgraded. Contact your administrator or educator to obtain an active **Verification Code**.
            </p>
          </div>
          <button
            onClick={() => onNavigate("student-profile")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
          >
            Promote Account 🌟
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 animate-fade-in">
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-row items-center gap-2 sm:gap-4.5 min-w-0">
          <div className="w-8 h-8 sm:w-14 sm:h-14 bg-[#F2EDE7] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#BC8F71] shrink-0">
            <BookOpen className="w-4 h-4 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-[#8C847E] text-[8px] sm:text-xs uppercase font-extrabold tracking-wider font-mono truncate">Quizzes Taken</p>
            <p className="text-xs sm:text-2xl font-bold text-[#2D2A29] leading-tight mt-0.5 sm:mt-1">{totalTaken}</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-row items-center gap-2 sm:gap-4.5 min-w-0">
          <div className="w-8 h-8 sm:w-14 sm:h-14 bg-[#E9F0E8] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#5A6F56] shrink-0">
            <Trophy className="w-4 h-4 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-[#8C847E] text-[8px] sm:text-xs uppercase font-extrabold tracking-wider font-mono truncate">Average Score</p>
            <p className="text-xs sm:text-2xl font-bold text-[#2D2A29] leading-tight mt-0.5 sm:mt-1">{avgPercent}%</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-row items-center gap-2 sm:gap-4.5 min-w-0">
          <div className="w-8 h-8 sm:w-14 sm:h-14 bg-[#FCEEE6] rounded-lg sm:rounded-2xl flex items-center justify-center text-[#E67E22] shrink-0">
            <span className="text-sm sm:text-2xl">🔥</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#8C847E] text-[8px] sm:text-xs uppercase font-extrabold tracking-wider font-mono truncate">Daily Streak</p>
            <p className="text-xs sm:text-2xl font-bold text-[#2D2A29] leading-tight mt-0.5 sm:mt-1">{user.streak} Days</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending list + Side Leaderboard snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Pending Quizzes column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#2D2A29]">
              Pending {getSemesterLabel(settings.activeSemester, true)} Quizzes ({activeAssignments.length})
            </h2>
            <button 
              onClick={() => onNavigate("student-quiz-list")}
              className="text-[#5A6F56] text-xs font-bold hover:underline cursor-pointer"
            >
              Browse All
            </button>
          </div>

          {activeAssignments.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-[#EBE7E0] p-8 text-center">
              <span className="text-4xl text-[#BC8F71] block mb-2">⭐</span>
              <p className="text-sm font-semibold text-[#2D2A29]">High Five! All caught up!</p>
              <p className="text-xs text-[#8C847E] mt-1">There are no pending assigned quizzes for you in the active term.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeAssignments.map((assign) => (
                <div 
                  key={assign.id}
                  className="bg-white p-5 rounded-3xl border border-[#EBE7E0] hover:border-[#5A6F56] transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F3F1ED] rounded-xl flex items-center justify-center text-[#5A6F56] font-display font-black group-hover:bg-[#5A6F56] group-hover:text-white transition-colors shrink-0">
                      {assign.quizSubject.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2D2A29]">{assign.quizTitle}</h3>
                      <p className="text-xs text-[#8C847E] mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{assign.quizSubject}</span>
                        <span>•</span>
                        <span>{assign.questionCount} Qs</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {assign.quizTimeLimit} mins</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartQuiz(assign.quizId)}
                    className="w-full sm:w-auto px-5 py-2 bg-[#5A6F56] hover:bg-[#4A5D46] text-white text-xs font-semibold rounded-2xl transition shrink-0 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Play className="h-3 w-3 fill-white" /> Start quiz
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recently Completed Section */}
          <div className="pt-4">
            <h2 className="text-lg font-bold text-[#2D2A29] mb-4">Recent Results</h2>
            {recentAttempts.length === 0 ? (
              <p className="text-xs text-[#8C847E] italic">You have not completed any quizzes yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="bg-white p-4 rounded-2xl border border-[#EBE7E0] hover:shadow-2xs transition-all">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC8F71]">
                        {getSemesterLabel(attempt.quizSemester, true)}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                        attempt.passed ? "bg-[#E9F0E8] text-[#4A5D46]" : "bg-rose-50 text-rose-700"
                      }`}>
                        {attempt.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#2D2A29] mt-2 truncate">{attempt.quizTitle}</h4>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F1ED] text-xs">
                      <span className="text-[#8C847E]">Score</span>
                      <strong className="text-slate-800 font-bold font-mono">
                        {attempt.score} / {attempt.total} ({Math.round(attempt.score / attempt.total * 100)}%)
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard snapshot column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[#2D2A29]">Leaderboard Snapshot</h2>
          <div className="bg-[#F2EDE7] rounded-[40px] p-6 border border-[#E1DCD3] space-y-5">
            <div className="space-y-3">
              {topRankings.map((rk, idx) => (
                <div 
                  key={rk.studentId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    rk.studentId === user.id 
                    ? "bg-[#5A6F56] text-white border-transparent" 
                    : "bg-white border-[#EBE7E0]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-5 font-display font-black text-center ${
                      rk.studentId === user.id ? "text-[#EBE7E0]" : "text-[#BC8F71]"
                    }`}>
                      {idx + 1}
                    </span>
                    {rk.avatar && rk.avatar.trim() !== "" ? (
                      <img src={rk.avatar} className="h-8 w-8 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0">
                        <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-xs font-semibold truncate">
                      {rk.name} {rk.studentId === user.id && "(You)"}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold shrink-0 font-mono">
                    {rk.totalScore} pts
                  </span>
                </div>
              ))}
            </div>

            {userRankObj && userRankObj.rank && userRankObj.rank > 3 && (
              <div className="bg-white/70 p-3.5 rounded-2xl border border-[#D9D3C7] text-xs flex justify-between items-center">
                <span className="text-[#6B635E] font-medium">Your Ranking:</span>
                <strong className="text-[#2D2A29] font-bold">#{userRankObj.rank} Placed ({userRankObj.totalScore} pts)</strong>
              </div>
            )}

            <div className="text-center pt-2">
              <button 
                onClick={() => onNavigate("student-leaderboard")}
                className="px-6 py-2 border-2 border-[#BC8F71]/30 text-[#BC8F71] hover:bg-[#BC8F71] hover:text-white rounded-full text-xs font-bold tracking-widest uppercase transition duration-150 cursor-pointer"
              >
                View Full Rankings
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


// ==========================================
// 2. STUDY / QUIZ LISTS & BROWSING
// ==========================================
interface QuizListProps {
  settings: Settings;
  quizzes: Quiz[];
  attempts: Attempt[];
  assignments: Assignment[];
  onStartQuiz: (quizId: string) => void;
  user: User;
}

export function StudentQuizList({
  settings,
  quizzes,
  attempts,
  assignments,
  onStartQuiz,
  user
}: QuizListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ACTIVE_TERM" | "ARCHIVED">("ACTIVE_TERM");
  const [filterType, setFilterType] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const semesters: ("PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS")[] = ["PRELIM", "MIDTERM", "PREFINALS", "FINALS"];

  const modulesMetadata = [
    {
      name: "Great Books - SY2526-2T",
      shortName: "Great Books",
      emoji: "📖",
      description: "Classic literature from Modernism to Contemporary and Global works.",
      color: "from-amber-500/10 to-orange-500/10 text-amber-700 bg-amber-50",
      iconColor: "text-amber-600 bg-amber-100",
    },
    {
      name: "Programming Languages - SY2526-2T",
      shortName: "Programming Languages",
      emoji: "💻",
      description: "Syntax, evaluation rules, lexical scope, type inference, and language paradigms.",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-700 bg-blue-50",
      iconColor: "text-blue-600 bg-blue-100",
    },
    {
      name: "Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T",
      shortName: "Information Assurance",
      emoji: "🛡️",
      description: "Cryptographic standard mechanisms, computer network defense rules, and malware mitigation.",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 bg-emerald-50",
      iconColor: "text-emerald-600 bg-emerald-100",
    },
    {
      name: "Management Information Systems - SY2526-2T",
      shortName: "Management Information Systems",
      emoji: "📊",
      description: "Business Intelligence, CRM pipelines, ERP structures, and transaction databases.",
      color: "from-purple-500/10 to-fuchsia-500/10 text-purple-700 bg-purple-50",
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      name: "Mobile Systems and Technologies - SY2526-2T",
      shortName: "Mobile Systems & Tech",
      emoji: "📱",
      description: "Android lifecycle hooks, SharedPreferences local storage, BroadcastReceivers, and background Services.",
      color: "from-rose-500/10 to-pink-500/10 text-rose-700 bg-rose-50",
      iconColor: "text-rose-600 bg-rose-100",
    },
    {
      name: "Web Systems and Technologies - SY2526-2T",
      shortName: "Web Systems & Tech",
      emoji: "🌐",
      description: "Web browser execution architectures, DOM representations, client-server handshake models, and RESTful stateless APIs.",
      color: "from-sky-500/10 to-cyan-500/10 text-sky-700 bg-sky-50",
      iconColor: "text-sky-600 bg-sky-100",
    }
  ];

  // Base list of quizzes matching the active term vs archived and types
  const getFilteredQuizzesByTabAndType = (quizzesList: Quiz[]) => {
    return quizzesList.filter(q => {
      // Check semester state
      const isActiveSemester = q.semester === settings.activeSemester;
      const tabMatch = activeTab === "ACTIVE_TERM" ? isActiveSemester : !isActiveSemester;

      // Filter type check
      const isCompleted = attempts.some(at => at.quizId === q.id);
      const isAssigned = assignments.some(a => a.quizId === q.id && !a.completedAt);

      let typeMatch = true;
      if (filterType === "COMPLETED") typeMatch = isCompleted;
      if (filterType === "PENDING") typeMatch = isAssigned && !isCompleted;

      return tabMatch && typeMatch && q.status === "PUBLISHED";
    });
  };

  // If a module is selected, we filter matching quizzes of that module
  const currentFilteredQuizzes = getFilteredQuizzesByTabAndType(quizzes).filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === null || q.subject === selectedModule;
    return matchesSearch && matchesModule;
  });

  // Filter modules based on search if not selected
  const matchingModules = modulesMetadata.filter(mod => {
    if (!searchTerm) return true;
    return mod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           mod.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {selectedModule ? (
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#BC8F71] hover:text-[#9A7055] transition-colors cursor-pointer self-start"
              >
                ← Back to Core Modules
              </button>
              <h1 className="text-2xl font-serif italic text-[#2D2A29]">
                {selectedModule.split(" - ")[0]}
              </h1>
              <p className="text-xs text-[#8C847E]">Syllabus lessons and handout questions under {selectedModule}.</p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-serif italic text-[#2D2A29]">Academic Resource Browser</h1>
              <p className="text-xs text-[#8C847E]">Select one of the 6 core modules to explore interactive handouts & quizzes.</p>
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="bg-[#EBE7E0] p-1 rounded-2xl flex items-center border border-[#D9D3C7] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("ACTIVE_TERM")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ACTIVE_TERM" 
                ? "bg-[#5A6F56] text-white shadow-xs" 
                : "text-[#6B635E] hover:text-[#2D2A29]"
            }`}
          >
            Active Period
          </button>
          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ARCHIVED" 
                ? "bg-[#5A6F56] text-white shadow-xs" 
                : "text-[#6B635E] hover:text-[#2D2A29]"
            }`}
          >
            Archived Periods
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EBE7E0] gap-4 flex flex-col md:flex-row items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={selectedModule ? "Search pages, handouts, content..." : "Search core subjects or concepts..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F3EF] focus:bg-[#EBE7E0] border-none rounded-2xl text-xs py-3 pl-10 pr-4 text-[#433F3E] placeholder-[#8C847E]/80 focus:ring-1 focus:ring-[#5A6F56]"
          />
          <svg className="w-4 h-4 absolute left-4 top-3.5 text-[#8C847E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Assignment filter criteria */}
        <div className="flex gap-2 w-full md:w-auto">
          {(["ALL", "PENDING", "COMPLETED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterType === t 
                  ? "bg-[#BC8F71] text-white border-transparent" 
                  : "bg-white text-[#6B635E] border-[#EBE7E0] hover:bg-[#F9F8F6]"
              }`}
            >
              {t === "ALL" ? "All Content" : t === "PENDING" ? "Assigned Only" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Render based on selection state */}
      {!selectedModule ? (
        /* Top Level Cards: The 6 Modules */
        matchingModules.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#EBE7E0] p-16 text-center">
            <p className="text-4xl font-serif">🕵️</p>
            <h3 className="font-bold text-base text-[#2D2A29] mt-4">No modules found</h3>
            <p className="text-xs text-[#8C847E] mt-1">Try resetting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingModules.map((mod) => {
              // Calculate specific stats for this module based on currently configured filters
              const moduleQuizzes = getFilteredQuizzesByTabAndType(quizzes).filter(q => q.subject === mod.name);
              const totalItems = moduleQuizzes.length;
              const completedItems = moduleQuizzes.filter(q => attempts.some(at => at.quizId === q.id)).length;
              const pendingItems = moduleQuizzes.filter(q => assignments.some(a => a.quizId === q.id && !a.completedAt) && !attempts.some(at => at.quizId === q.id)).length;

              return (
                <div 
                  key={mod.name}
                  onClick={() => setSelectedModule(mod.name)}
                  className="bg-white rounded-[32px] border border-[#EBE7E0] p-6 hover:border-[#5A6F56] transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl text-xl ${mod.iconColor} transition-transform group-hover:scale-105 duration-300`}>
                        {mod.emoji}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider bg-[#F2EDE7] text-[#BC8F71] font-extrabold px-2.5 py-1 rounded-md">
                        SY2526-2T
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-[#2D2A29] text-base group-hover:text-[#5A6F56] transition-colors line-clamp-1">
                        {mod.shortName}
                      </h3>
                      <p className="text-xs text-[#8C847E] leading-relaxed line-clamp-3">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#F3F1ED] flex items-center justify-between text-xs font-semibold text-[#6B635E]">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#5A6F56]" />
                      <span>{totalItems} Handout{totalItems !== 1 ? 's' : ''}</span>
                    </div>
                    {pendingItems > 0 && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold border border-amber-200/50 px-2.5 py-0.5 rounded-full animate-pulse">
                        {pendingItems} Pending
                      </span>
                    )}
                    {totalItems > 0 && completedItems === totalItems ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
                        Completed
                      </span>
                    ) : totalItems > 0 && completedItems > 0 ? (
                      <span className="text-[10px] bg-[#F2EDE7] text-[#BC8F71] font-bold px-2.5 py-0.5 rounded-full">
                        {completedItems}/{totalItems} Done
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-[#5A6F56] transition-colors">
                        Explore →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Selected Module View: Inner Quizzes (e.g. 04_Handout_1A.pdf) */
        <div className="space-y-6">

          {currentFilteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-[#EBE7E0] p-16 text-center">
              <p className="text-4xl">📚</p>
              <h3 className="font-bold text-base text-[#2D2A29] mt-4">No quizzes or handouts yet</h3>
              <p className="text-xs text-[#8C847E] mt-1 max-w-sm mx-auto">
                There are currently no active exams or handout files matching this criteria.
              </p>
              <button 
                onClick={() => setSelectedModule(null)}
                className="mt-6 px-5 py-2.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Back to Modules
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFilteredQuizzes.map((quiz) => {
                const completedAttempt = attempts.find(at => at.quizId === quiz.id);
                const isAssigned = assignments.some(a => a.quizId === quiz.id && !a.completedAt);
                const isLocked = activeTab === "ARCHIVED";

                return (
                  <div 
                    key={quiz.id} 
                    className={`bg-white rounded-[32px] border transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between overflow-hidden relative ${
                      isLocked ? "border-[#EBE7E0] opacity-90" : "border-[#EBE7E0] hover:border-[#5A6F56]"
                    }`}
                  >
                    {/* Visual Semester Tag ribbon */}
                    <span className="absolute top-4 right-4 text-[9px] font-black tracking-widest text-[#5A6F56] border border-[#5A6F56]/15 bg-[#DDE4DC] px-2.5 py-0.5 rounded-full uppercase">
                      {getSemesterLabel(quiz.semester, true)}
                    </span>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-[#BC8F71] bg-[#F2EDE7] uppercase font-mono">
                          Handout Questions
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-[#2D2A29] text-base leading-snug line-clamp-2">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-[#8C847E] leading-relaxed line-clamp-3">
                          {quiz.description || "Comprehensive syllabus evaluation. Tests structural core objectives."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F3F1ED] text-xs text-[#6B635E] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#BC8F71]" />
                          <span>{quiz.timeLimit} Minutes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#5A6F56]" />
                          <span>{quiz.questionCount || 5} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#F9F8F6] border-t border-[#EBE7E0] flex items-center justify-between">
                      {completedAttempt ? (
                        <div className="text-left">
                          <p className="text-[10px] text-[#8C847E] font-bold uppercase tracking-wider font-mono">My Result</p>
                          <span className={`text-sm font-black font-mono ${
                            completedAttempt.passed ? "text-[#5A6F56]" : "text-rose-600"
                          }`}>
                            {completedAttempt.score} / {completedAttempt.total} ({Math.round(completedAttempt.score/completedAttempt.total*100)}%)
                          </span>
                        </div>
                      ) : isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Assigned Exam
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8C847E] font-medium italic">Self Enrollable</span>
                      )}

                      {isLocked ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#BC8F71] uppercase tracking-wider leading-none">
                            Locked Archive
                          </span>
                          <p className="text-[9px] text-[#8C847E] mt-0.5">Read-Only mode</p>
                        </div>
                      ) : completedAttempt ? (
                        <button
                          onClick={() => onStartQuiz(quiz.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Retake
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartQuiz(quiz.id)}
                          className="px-5 py-2.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Start Attempt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ==========================================
// 3. QUIZ TAKING SCREEN & ENGINE CONTROLS
// ==========================================
interface QuizTakingProps {
  quiz: Quiz;
  onCancel: () => void;
  onSubmitAttempt: (answers: Record<string, number>) => void;
  allQuizzes?: Quiz[];
  attempts?: Attempt[];
  onStartQuiz?: (quizId: string) => void;
  user?: User;
  assignments?: Assignment[];
}

export function StudentQuizTaking({
  quiz,
  onCancel,
  onSubmitAttempt,
  allQuizzes = [],
  attempts = [],
  onStartQuiz,
  user,
  assignments = []
}: QuizTakingProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // convert to seconds
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Transitional Quiz Flow States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 = next, -1 = prev

  // Persistent reference handles for timeouts
  const timeout1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = quiz.questions || [];

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto submit
      onSubmitAttempt(answers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answers, onSubmitAttempt]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeout1.current) clearTimeout(timeout1.current);
      if (timeout2.current) clearTimeout(timeout2.current);
    };
  }, []);

  // Update selection status when question index switches or initially loads
  useEffect(() => {
    const questionId = questions[currentIdx]?.id;
    if (questionId && questionId in answers) {
      setSelectedOption(answers[questionId]);
      setIsRevealed(true);
      setIsLocked(true);
    } else {
      setSelectedOption(null);
      setIsRevealed(false);
      setIsLocked(false);
    }
  }, [currentIdx, questions, answers]);

  const progressPercent = questions.length > 0 ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  const currentQuestion = questions[currentIdx];

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (optIdx: number) => {
    if (!currentQuestion || isLocked) return;

    // Lock selections and hold local state values
    setIsLocked(true);
    setSelectedOption(optIdx);

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: optIdx
    };
    setAnswers(updatedAnswers);

    // Step 1: Click answer to initiate option selection animation. Wait 600ms.
    timeout1.current = setTimeout(() => {
      // Step 2: Correct / Wrong statuses appear on option elements
      setIsRevealed(true);

      // Step 3: Wait 1 second (pause period), then trigger transition
      timeout2.current = setTimeout(() => {
        if (currentIdx < questions.length - 1) {
          setDirection(1);
          setCurrentIdx(prev => prev + 1);
        } else {
          // If latest question is reached, proceed directly to submission
          onSubmitAttempt(updatedAnswers);
        }
      }, 1000);

    }, 600);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setDirection(1);
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx(prev => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white max-w-xl mx-auto p-8 rounded-[32px] border border-[#EBE7E0] text-center space-y-6">
        <ShieldAlert className="h-12 w-12 text-[#BC8F71] mx-auto" />
        <h2 className="text-xl font-bold text-[#2D2A29]">No Questions Found</h2>
        <p className="text-sm text-[#8C847E]">
          This quiz doesn't contain any question datasets yet. Please notify the instructor or administrator to publish content.
        </p>
        <button onClick={onCancel} className="px-6 py-2.5 bg-[#5A6F56] text-white text-xs font-bold rounded-2xl">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2 px-1.5 sm:px-4 space-y-4 sm:space-y-6 font-sans">
      {/* Header controls & stats */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-[28px] border border-[#EBE7E0] shadow-2xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#BC8F71] uppercase block truncate">{quiz.subject} Term Test</span>
          <h2 className="text-xs sm:text-base font-bold text-[#2D2A29] truncate mt-0.5">{quiz.title}</h2>
        </div>

        {/* Counter Display Clock */}
        <div className={`py-1.5 px-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 border font-mono text-xs sm:text-sm font-bold shrink-0 ${
          timeLeft < 60 ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" : "bg-[#F3F1ED] border-[#D9D3C7]"
        }`}>
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="space-y-1.5 sm:space-y-2 px-1">
        <div className="flex justify-between items-center text-[10.5px] sm:text-xs text-[#8C847E] font-medium">
          <span>Question Progress</span>
          <span className="font-bold text-[#2D2A29]">Question {currentIdx + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-[#EBE7E0] h-1.5 sm:h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#5A6F56] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card Context (with fade/slide transition) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 50 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="bg-white p-4.5 sm:p-8 rounded-[24px] sm:rounded-[36px] border border-[#EBE7E0] shadow-xs space-y-4 sm:space-y-6"
        >
          <div className="space-y-2.5 sm:space-y-4">
            <span className="px-2.5 py-1 bg-[#DDE4DC] text-[#4A5D46] rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase font-mono inline-block">
              Question #{currentIdx + 1}
            </span>
            <h3 className="text-[#2D2A29] text-sm sm:text-lg font-bold leading-relaxed">
              {currentQuestion.text}
            </h3>
          </div>

          {/* Option targets (touch friendly 44px min!) */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQuestion.correctAnswer;
              
              let btnClass = "";
              let badgeClass = "";
              let rightSideSvg = null;

              if (selectedOption === null) {
                // No option selected yet
                btnClass = "bg-[#F9F8F6] text-[#433F3E] border-[#EBE7E0] hover:bg-[#EBE7E0]/45 hover:border-[#BC8F71]/60";
                badgeClass = "bg-white border border-[#D9D3C7] text-[#6B635E]";
              } else if (!isRevealed) {
                // Option clicked, animating state
                if (isSelected) {
                  btnClass = "bg-[#F2EDE7] text-[#2D2A29] border-[#BC8F71] shadow-md scale-[1.01] animate-pulse";
                  badgeClass = "bg-[#BC8F71] text-white";
                  rightSideSvg = (
                    <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-[#BC8F71] border-t-transparent animate-spin shrink-0" />
                  );
                } else {
                  btnClass = "bg-[#F9F8F6] text-[#433F3E] border-[#EBE7E0] opacity-40 pointer-events-none";
                  badgeClass = "bg-white border border-[#D9D3C7] text-[#6B635E]";
                }
              } else {
                // Correct / Wrong reveals
                if (isCorrect) {
                  // The correct answer (always highlighted green)
                  btnClass = "bg-[#E9F0E8] text-[#4A5D46] border-[#5A6F56] font-semibold";
                  badgeClass = "bg-[#5A6F56] text-white";
                  rightSideSvg = (
                    <span className="flex items-center gap-1 bg-[#5A6F56] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs shrink-0 font-mono">
                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Correct
                    </span>
                  );
                } else if (isSelected && !isCorrect) {
                  // Clicked option is wrong
                  btnClass = "bg-rose-50 text-rose-700 border-rose-300 font-semibold";
                  badgeClass = "bg-rose-600 text-white";
                  rightSideSvg = (
                    <span className="flex items-center gap-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs shrink-0 font-mono">
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Wrong
                    </span>
                  );
                } else {
                  // Other options fade out
                  btnClass = "bg-[#F9F8F6] text-[#433F3E] border-[#EBE7E0] opacity-25 pointer-events-none";
                  badgeClass = "bg-white border border-[#D9D3C7] text-[#6B635E]";
                }
              }

              return (
                <motion.button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isLocked}
                  whileHover={!isLocked ? { scale: 1.008, x: 2 } : {}}
                  whileTap={!isLocked ? { scale: 0.992 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[46px] sm:min-h-[52px] select-none cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 transition-colors ${badgeClass}`}>
                      {["A", "B", "C", "D"][optIdx] || optIdx + 1}
                    </span>
                    <span className="text-[11.5px] sm:text-sm font-semibold break-words flex-1 min-w-0">{option}</span>
                  </div>
                  {rightSideSvg && <div className="shrink-0 ml-1">{rightSideSvg}</div>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#F2EDE7] hover:bg-[#EBE7E0] text-[#6B635E] rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer text-center whitespace-nowrap"
        >
          Cancel<span className="hidden sm:inline"> Session</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIdx > 0 && (
            <button
              onClick={handlePrev}
              disabled={isLocked && !isRevealed}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#EBE7E0] hover:bg-[#F9F8F6] text-[#2D2A29] rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              Previous
            </button>
          )}

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={isLocked && !isRevealed}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#BC8F71] hover:bg-[#a67d60] text-white rounded-xl text-[11px] sm:text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              Next<span className="hidden sm:inline"> Question</span>
            </button>
          ) : (
            <button
              id="btn-quiz-submit"
              onClick={() => onSubmitAttempt(answers)}
              disabled={isLocked && !isRevealed}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white rounded-xl text-[11px] sm:text-xs font-extrabold shadow-sm tracking-wide uppercase transition cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {isLocked ? "Submitting..." : <>Submit<span className="hidden sm:inline"> Examination</span></>}
            </button>
          )}
        </div>
      </div>

      {/* Exit dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-[32px] border border-[#EBE7E0] space-y-4 shadow-xl">
            <h3 className="text-lg font-serif italic text-[#2D2A29] font-bold">Abandon Current Progress?</h3>
            <p className="text-xs text-[#8C847E]">
              Are you sure you want to exit? Your progress in this quiz will be lost.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Keep Testing
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Exit & Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 4. RESULTS DISPLAY BREAKDOWN PAGE
// ==========================================
interface ResultsViewProps {
  quiz: Quiz;
  attempt: Attempt;
  onRetake: () => void;
  onBackToDashboard: () => void;
}

export function StudentResultsView({
  quiz,
  attempt,
  onRetake,
  onBackToDashboard
}: ResultsViewProps) {
  const percentScore = Math.round((attempt.score / attempt.total) * 100);
  const isPassed = percentScore >= 60;

  const questions = quiz.questions || [];

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-8 animate-fade-in font-sans">
      
      {/* Result Indicator Badge Banner */}
      <div className={`p-8 rounded-[36px] border text-center space-y-4 relative overflow-hidden shadow-xs ${
        isPassed 
          ? "bg-[#E9F0E8] border-[#5A6F56]/20 text-[#4A5D46]" 
          : "bg-rose-50 border-rose-200 text-rose-800"
      }`}>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest leading-none font-mono">
            {isPassed ? "Examination Passed! 🎉" : "Passing Marker Missed"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif italic font-bold">
            {attempt.score} / {attempt.total} Points
          </h1>
          <p className="text-base font-bold font-mono text-slate-700">{percentScore}% Accuracy Rate</p>
        </div>

        <p className="text-xs max-w-md mx-auto leading-relaxed text-[#6B635E]">
          {isPassed 
            ? "Fabulous! You have exceeded the 60% standard educational pass index threshold. Your active days streak count has increased."
            : "Review the correct explanations below to understand raw conceptual errors. Please attempt a review retake to build confidence."}
        </p>

        <div className="flex justify-center gap-3 pt-1">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 bg-white border border-[#D9D3C7] text-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-100 transition cursor-pointer"
          >
            Retake Exam
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Review breakdown title */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#2D2A29]">Question-by-Question Breakdown</h3>
        
        {questions.length === 0 ? (
          <p className="text-xs text-[#8C847E]">No questions breakdown data is stored for this attempt.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const selectedIdx = attempt.answers[q.id];
              const isCorrect = selectedIdx === q.correctAnswer;

              return (
                <div 
                  key={q.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EBE7E0] shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-[#8C847E] font-bold font-mono">
                      Q{qIndex + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      isCorrect 
                        ? "bg-[#E9F0E8] text-[#4A5D46] border border-[#5A6F56]/10" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#2D2A29] text-sm leading-relaxed">
                    {q.text}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const choiceLetter = ["A", "B", "C", "D"][optIdx] || optIdx + 1;
                      const isChosen = selectedIdx === optIdx;
                      const isAnsCorrect = q.correctAnswer === optIdx;

                      let optStyle = "bg-[#F9F8F6] border-[#EBE7E0] text-slate-700";
                      if (isChosen && isCorrect) {
                        optStyle = "bg-[#E9F0E8] border-[#5A6F56] text-[#4A5D46] font-bold";
                      } else if (isChosen && !isCorrect) {
                        optStyle = "bg-rose-50 border-rose-400 text-rose-700 font-bold";
                      } else if (isAnsCorrect) {
                        optStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                      }

                      return (
                        <div 
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center gap-2 ${optStyle}`}
                        >
                          <span className="h-6 w-6 rounded-lg bg-white/50 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                            {choiceLetter}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}


// ==========================================
// 5. PROGRESS, STATS & SEMESTER CHARTING
// ==========================================
interface ProgressProps {
  attempts: Attempt[];
  settings: Settings;
}

export function StudentProgressView({
  attempts,
  settings
}: ProgressProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");

  const filteredAttempts = attempts.filter(at => {
    if (selectedSemester === "ALL") return true;
    return at.quizSemester === selectedSemester;
  });

  // Calculate stats
  const totalCompleted = filteredAttempts.length;
  const passedCount = filteredAttempts.filter(at => at.passed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;
  const avgScore = totalCompleted > 0 
    ? Math.round((filteredAttempts.reduce((sum, item) => sum + (item.score / item.total), 0) / totalCompleted) * 100)
    : 0;

  // Simple SVG Line graph generator for chronological progression
  // chronologically filter first (old to new)
  const sortedChronologically = [...filteredAttempts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getSvgPathStr = () => {
    if (sortedChronologically.length < 2) return "";
    const width = 600;
    const height = 150;
    const paddingX = 40;
    const paddingY = 20;

    const points = sortedChronologically.map((item, idx) => {
      const accuracy = (item.score / item.total) * 100;
      const x = paddingX + (idx / (sortedChronologically.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - (accuracy / 100) * (height - paddingY * 2);
      return { x, y };
    });

    return points.reduce((path, p, idx) => {
      return path + `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }, "");
  };

  const svgPath = getSvgPathStr();

  return (
    <div className="space-y-7 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-[#2D2A29]">Student Progress Analytics</h1>
          <p className="text-xs text-[#8C847E]">Track your academic performance trends across academic periods.</p>
        </div>

        {/* Filter Selection criteria dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B635E] shrink-0 font-mono">Filter Semesters:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-white border border-[#D9D3C7] rounded-xl text-xs py-2 px-3 focus:ring-1 focus:ring-[#5A6F56] text-[#433F3E] outline-none"
          >
            <option value="ALL">All Semesters</option>
            <option value="PRELIM">Prelim Period</option>
            <option value="MIDTERM">Midterm Period</option>
            <option value="PREFINALS">Pre-Finals Period</option>
            <option value="FINALS">Finals Period</option>
          </select>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-col justify-center min-w-0">
          <h4 className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-[#8C847E] font-mono truncate">Quizzes Evaluated</h4>
          <p className="text-sm sm:text-3xl font-bold text-[#2D2A29] mt-0.5 sm:mt-1.5 leading-none">{totalCompleted}</p>
        </div>
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-col justify-center min-w-0">
          <h4 className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-[#8C847E] font-mono truncate">Class Pass Index</h4>
          <p className="text-sm sm:text-3xl font-bold text-[#5A6F56] mt-0.5 sm:mt-1.5 leading-none">{passRate}%</p>
        </div>
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-[32px] border border-[#EBE7E0] shadow-2xs flex flex-col justify-center min-w-0">
          <h4 className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-[#8C847E] font-mono truncate">Average Accuracy</h4>
          <p className="text-sm sm:text-3xl font-bold text-[#BC8F71] mt-0.5 sm:mt-1.5 leading-none">{avgScore}%</p>
        </div>
      </div>

      {/* Performance Curve graph */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#EBE7E0] space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F1ED] pb-3">
          <div>
            <h3 className="font-bold text-[#2D2A29] text-sm">Chronological Performance Score Chart</h3>
            <p className="text-[10px] text-[#8C847E]">Plotted points display immediate quiz percentage trends.</p>
          </div>
          <span className="text-[10px] text-[#BC8F71] font-bold font-mono bg-[#F2EDE7] px-2.5 py-1 rounded-lg shrink-0">Target Passing Threshold: 60%</span>
        </div>

        {sortedChronologically.length < 2 ? (
          <div className="h-44 flex items-center justify-center border border-[#F3F1ED] rounded-2xl bg-[#F9F8F6] text-xs text-[#8C847E] italic">
            Complete at least two tests in this range to populate the performance trend visualization.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[620px] pt-4 pb-2">
              <svg viewBox="0 0 600 170" className="w-full h-auto">
                {/* Guidelines */}
                <line x1="40" y1="20" x2="560" y2="20" stroke="#F3F1ED" strokeDasharray="3,3" />
                <line x1="40" y1="80" x2="560" y2="80" stroke="#BC8F71" strokeWidth="0.75" strokeDasharray="4,4" />
                <line x1="40" y1="130" x2="560" y2="130" stroke="#EBE7E0" />

                {/* Tic Marks for Timeline axis */}
                <line x1="40" y1="130" x2="40" y2="135" stroke="#EBE7E0" strokeWidth="1.5" />
                <line x1="300" y1="130" x2="300" y2="135" stroke="#EBE7E0" strokeWidth="1.5" />
                <line x1="560" y1="130" x2="560" y2="135" stroke="#EBE7E0" strokeWidth="1.5" />

                {/* Accuracy Labels */}
                <text x="32" y="20" dominantBaseline="middle" textAnchor="end" className="text-[10px] font-bold font-mono fill-[#8C847E]">100%</text>
                <text x="32" y="80" dominantBaseline="middle" textAnchor="end" className="text-[10px] font-bold font-mono fill-[#BC8F71]">60%</text>
                <text x="32" y="130" dominantBaseline="middle" textAnchor="end" className="text-[10px] font-bold font-mono fill-[#8C847E]">0%</text>

                {/* SVG trend path line */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#5A6F56"
                  strokeWidth="3"
                  className="transition-all duration-300"
                />

                {/* Plot circle points */}
                {sortedChronologically.map((item, idx) => {
                  const accuracy = (item.score / item.total) * 100;
                  const x = 40 + (idx / (sortedChronologically.length - 1)) * 520;
                  const y = 130 - (accuracy / 100) * 110;
                  return (
                    <g key={item.id} className="group">
                      <circle
                        cx={x}
                        cy={y}
                        r="5.5"
                        fill={accuracy >= 60 ? "#5A6F56" : "#E67E22"}
                        stroke="#FFF"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-7 transition-all"
                      />
                      <title>{`${item.quizTitle}: ${Math.round(accuracy)}%`}</title>
                    </g>
                  );
                })}

                {/* Timeline Axis Labels */}
                <text x="40" y="152" textAnchor="start" className="text-[9px] font-bold font-mono fill-[#8C847E]">
                  {new Date(sortedChronologically[0].createdAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})} ({getSemesterLabel(sortedChronologically[0].quizSemester, true)})
                </text>
                <text x="300" y="152" textAnchor="middle" className="text-[9px] font-bold font-mono fill-[#8C847E]">
                  Mid-point
                </text>
                <text x="560" y="152" textAnchor="end" className="text-[9px] font-bold font-mono fill-[#8C847E]">
                  {new Date(sortedChronologically[sortedChronologically.length - 1].createdAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})} ({getSemesterLabel(sortedChronologically[sortedChronologically.length - 1].quizSemester, true)})
                </text>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* History log list data table view */}
      <div className="bg-white rounded-[36px] border border-[#EBE7E0] overflow-hidden">
        <div className="p-6 border-b border-[#F3F1ED]">
          <h3 className="font-bold text-[#2D2A29] text-sm">Recent Quiz Attempts</h3>
        </div>
        
        {filteredAttempts.length === 0 ? (
          <p className="text-xs text-[#8C847E] text-center p-8">No matching attempts found in this scope.</p>
        ) : (
          <>
            {/* Desktop Table: visible on sm and up */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F9F8F6] text-[#8C847E] font-bold font-mono uppercase tracking-wider border-b border-[#EBE7E0]">
                  <tr>
                    <th className="p-4 pl-6">Exam Details</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Date Completed</th>
                    <th className="p-4">Achieved Score</th>
                    <th className="p-4 pr-6 text-right">Result status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F1ED] text-slate-700">
                  {filteredAttempts.map((at) => (
                    <tr key={at.id} className="hover:bg-slate-50">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-[#2D2A29]">{at.quizTitle}</p>
                        <span className="text-[10px] text-[#8C847E] font-semibold">{at.quizSubject}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#DDE4DC] text-[#4A5D46] rounded-md font-bold font-mono block w-fit text-[10px]">
                          {getSemesterLabel(at.quizSemester, true)}
                        </span>
                      </td>
                      <td className="p-4 text-[#8C847E] font-medium font-sans">
                        {new Date(at.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#2D2A29]">
                        {at.score} / {at.total} ({Math.round(at.score/at.total*100)}%)
                      </td>
                      <td className="p-4 pr-6 text-right">
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

            {/* Mobile Card Layout: visible on xs screens only */}
            <div className="block sm:hidden divide-y divide-[#F3F1ED]">
              {filteredAttempts.map((at) => (
                <div key={at.id} className="p-5 space-y-3.5 font-sans text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#2D2A29] text-sm leading-tight">{at.quizTitle}</p>
                      <span className="text-[10px] text-[#8C847E] font-semibold mt-0.5 block">{at.quizSubject}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                      at.passed ? "bg-[#E9F0E8] text-[#4A5D46]" : "bg-rose-50 text-rose-700"
                    }`}>
                      {at.passed ? "Passed" : "Failed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#6B635E]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#DDE4DC] text-[#4A5D46] rounded-md font-bold font-mono text-[9px]">
                        {getSemesterLabel(at.quizSemester, true)}
                      </span>
                      <span>
                        {new Date(at.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-right font-semibold">
                      Score: <strong className="font-mono text-[#2D2A29] font-bold">{at.score}/{at.total}</strong> ({Math.round(at.score/at.total*100)}%)
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
