import { LogOut, User as UserIcon, Settings as SettingsIcon, BarChart2, Shield, Calendar, Trophy, BookOpen } from "lucide-react";
import { User, Settings } from "../types";

interface NavbarProps {
  user: User | null;
  settings: Settings;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Navbar({ user, settings, currentView, onNavigate, onLogout }: NavbarProps) {
  // Map semester key to human display
  const semesterLabels: Record<string, string> = {
    PRELIM: "Prelim Period",
    MIDTERM: "Midterm Period",
    PREFINALS: "Pre-Finals Period",
    FINALS: "Finals Period",
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#EBE7E0] bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(user ? (user.role === "ADMIN" ? "admin-dashboard" : "student-dashboard") : "landing")}>
            <span className="text-2xl">{settings.logoUrl || "🎓"}</span>
            <span className="font-display font-bold text-xl tracking-tight text-[#2D2A29]">
              {settings.siteName || "EduQuiz"}
            </span>
          </div>

          {/* Center stats / Active period indicators */}
          {user && (
            <div className="hidden md:flex items-center gap-2 rounded-full bg-[#DDE4DC] px-3.5 py-1 text-xs font-semibold text-[#4A5D46] border border-[#5A6F56]/15 font-sans">
              <Calendar className="h-3.5 w-3.5" />
              <span>Active Term: <strong className="font-bold">{semesterLabels[settings.activeSemester]}</strong></span>
            </div>
          )}

          {/* Actions / Nav Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!user ? (
              <>
                <button
                  id="btn-nav-login"
                  onClick={() => onNavigate("login")}
                  className="rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-[#433F3E] hover:bg-[#EBE7E0]/60 transition-all cursor-pointer whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  id="btn-nav-signup"
                  onClick={() => onNavigate("signup")}
                  className="rounded-lg bg-[#5A6F56] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#4A5D46] shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Admin Quick Switch to Management links */}
                {user.role === "ADMIN" ? (
                  <div className="hidden lg:flex items-center gap-1.5 border-r border-[#EBE7E0] pr-4 mr-1">
                    <button
                      onClick={() => onNavigate("admin-dashboard")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                        currentView.startsWith("admin-dashboard") ? "bg-[#2D2A29] text-white" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate("admin-quizzes")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                        currentView.startsWith("admin-quizz") ? "bg-[#2D2A29] text-white" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Quizzes
                    </button>
                    <button
                      onClick={() => onNavigate("admin-students")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                        currentView === "admin-students" ? "bg-[#2D2A29] text-white" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      Students
                    </button>
                    <button
                      onClick={() => onNavigate("admin-settings")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                        currentView === "admin-settings" ? "bg-[#2D2A29] text-white" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      <SettingsIcon className="h-3.5 w-3.5" />
                      Settings
                    </button>
                  </div>
                ) : (
                  // Student Regular Navbar Menu
                  <div className="hidden lg:flex items-center gap-1 border-r border-[#EBE7E0] pr-4 mr-1">
                    <button
                      onClick={() => onNavigate("student-dashboard")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                        currentView === "student-dashboard" ? "bg-[#DDE4DC]/60 text-[#4A5D46]" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate("student-quiz-list")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                        currentView === "student-quiz-list" ? "bg-[#DDE4DC]/60 text-[#4A5D46]" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Quizzes
                    </button>
                    <button
                      onClick={() => onNavigate("student-progress")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                        currentView === "student-progress" ? "bg-[#DDE4DC]/60 text-[#4A5D46]" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      Analytics
                    </button>
                    <button
                      onClick={() => onNavigate("student-leaderboard")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                        currentView === "student-leaderboard" ? "bg-[#DDE4DC]/60 text-[#4A5D46]" : "text-[#6B635E] hover:bg-[#EBE7E0]/45"
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      Leaderboard
                    </button>
                  </div>
                )}

                {/* Profile Widget dropdown or indicators */}
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onNavigate(user.role === "ADMIN" ? "admin-settings" : "student-profile")}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-85"
                  >
                    {user.avatar && user.avatar.trim() !== "" ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-[#EBE7E0]/60"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-end justify-center overflow-hidden shrink-0 ring-2 ring-[#EBE7E0]/60">
                        <svg className="w-[85%] h-[85%] text-white translate-y-[10%]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-[#2D2A29] leading-tight block max-w-[120px] truncate">
                        {user.name}
                      </p>
                      <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-mono text-[#8C847E]">
                        {user.role === "ADMIN" ? (
                          <span className="text-[#BC8F71] font-bold flex items-center gap-0.5">
                            <Shield className="h-2.5 w-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="text-[#5A6F56] font-semibold">Student</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="rounded-lg p-2 text-[#6B635E] hover:bg-[#EBE7E0]/60 hover:text-[#2D2A29] transition-all cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
