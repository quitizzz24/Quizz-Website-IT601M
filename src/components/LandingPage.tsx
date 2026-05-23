import { GraduationCap, Trophy, ShieldCheck, CheckCircle, BarChart3, Star, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onStartQuizJourney: () => void;
  onNavigate: (view: string) => void;
}

export function LandingPage({ onStartQuizJourney, onNavigate }: LandingPageProps) {
  return (
    <div className="bg-[#F9F8F6] min-h-[calc(100vh-4rem)] flex flex-col justify-between font-sans">
      
      {/* Hero Header Section */}
      <header className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-br from-[#1C1F1B] via-[#2A3127] to-[#2D2A29] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5A6F56]/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5A6F56]/20 px-3.5 py-1.5 text-xs font-semibold text-[#DDE4DC] border border-[#5A6F56]/30 mb-6 backdrop-blur-md">
            <GraduationCap className="h-4 w-4 text-[#BC8F71]" />
            <span>Empowering Academic Excellence</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight italic">
            The Semester Quiz Platform Built for <span className="text-[#BC8F71]">Student Success</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#DDE4DC]/80 max-w-2xl mx-auto font-sans leading-relaxed">
            Test your knowledge, review past lessons, compete on dynamic period-based leaderboards, and monitor your personal academic performance indicators.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={onStartQuizJourney}
              className="px-6 py-3.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white font-semibold rounded-lg shadow-lg hover:shadow-[#5A6F56]/20 transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-bold"
            >
              Start Assessing Now
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="px-6 py-3.5 bg-[#2D2A29]/80 hover:bg-[#2D2A29] border border-[#5A6F56]/15 text-[#DDE4DC] font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider font-bold"
            >
              Sign In to Your Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Feature Bento Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif italic text-3xl font-bold text-[#2D2A29] tracking-tight">
            Designed for Real Progress
          </h2>
          <p className="mt-4 text-sm text-[#6B635E] font-sans">
            EduQuiz integrates structural curriculum timing directly into the testing loop, keeping students aligned with their active term milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-[#EBE7E0] p-6 sm:p-8 rounded-[32px] shadow-2xs hover:shadow-sm transition duration-200 flex flex-row md:flex-col items-start gap-5 md:gap-0">
            <div className="h-12 w-12 rounded-2xl bg-[#F2EDE7] text-[#BC8F71] flex items-center justify-center shrink-0 md:mb-6">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#2D2A29]">
                Active Terms & Lockdowns
              </h3>
              <p className="mt-3 text-xs text-[#6B635E] font-sans leading-relaxed">
                Quizzes are cataloged chronologically by periods: <strong className="font-bold text-[#2D2A29]">Prelim, Midterm, Pre-Finals, and Finals</strong>. Only the active period quizzes can be engaged to preserve test integrity.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-[#EBE7E0] p-6 sm:p-8 rounded-[32px] shadow-2xs hover:shadow-sm transition duration-200 flex flex-row md:flex-col items-start gap-5 md:gap-0">
            <div className="h-12 w-12 rounded-2xl bg-[#E9F0E8] text-[#5A6F56] flex items-center justify-center shrink-0 md:mb-6">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#2D2A29]">
                Interactive Leaderboards
              </h3>
              <p className="mt-3 text-xs text-[#6B635E] font-sans leading-relaxed">
                Compete directly for honors. Simple filter buttons allow students to inspect either their cumulative standing or filter specifically down to current period achievements.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-[#EBE7E0] p-6 sm:p-8 rounded-[32px] shadow-2xs hover:shadow-sm transition duration-200 flex flex-row md:flex-col items-start gap-5 md:gap-0">
            <div className="h-12 w-12 rounded-2xl bg-[#F2EDE7] text-[#BC8F71] flex items-center justify-center shrink-0 md:mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#2D2A29]">
                Detailed Analytics & History
              </h3>
              <p className="mt-3 text-xs text-[#6B635E] font-sans leading-relaxed">
                Visualize performance trend lines over time. Retrieve graded attempts with deep question-by-question breakdowns and clarifying answer key details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works section */}
      <section className="bg-[#EBE7E0]/45 py-16 border-y border-[#EBE7E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif italic text-2xl font-bold text-[#2D2A29] text-center mb-12">
            Dynamic Assessment Cycle (3-Step Overview)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-[#5A6F56] text-white font-mono flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h4 className="font-serif italic font-bold text-[#2D2A29]">Self-Register</h4>
              <p className="mt-2 text-xs text-[#6B635E] max-w-xs font-sans">
                Sign up publicly as a student. Start with clean stats, real-time tracking, and an interactive personal assessment dashboard.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-[#5A6F56] text-white font-mono flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h4 className="font-serif italic font-bold text-[#2D2A29]">Take Quizzes</h4>
              <p className="mt-2 text-xs text-[#6B635E] max-w-xs font-sans">
                Complete assignments within countdown times. Your scores and correct choices are calculated on completion instantly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-[#5A6F56] text-white font-mono flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h4 className="font-serif italic font-bold text-[#2D2A29]">Climb Ranks</h4>
              <p className="mt-2 text-xs text-[#6B635E] max-w-xs font-sans">
                Earn streak achievements for continuous evaluations, stack points, and compete for first place on the local school leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Sign off */}
      <section className="py-16 bg-white flex flex-col items-center px-4">
        <div className="flex items-center gap-1 text-amber-500 mb-4">
          <Star className="fill-amber-500 h-5 w-5" />
          <Star className="fill-amber-500 h-5 w-5" />
          <Star className="fill-amber-500 h-5 w-5" />
          <Star className="fill-amber-500 h-5 w-5" />
          <Star className="fill-amber-500 h-5 w-5" />
        </div>
        <blockquote className="text-center font-serif text-[#433F3E] italic max-w-3xl text-sm sm:text-base leading-relaxed">
          "EduQuiz completely transformed our period review sessions. Separating quizzes into distinct Prelim, Midterm, and Final segments kept me focused on what mattered most."
        </blockquote>
        <p className="mt-3 text-xs font-semibold text-[#8C847E] font-sans">
          — Sofia Rodriguez, 12-Streak Academy Ranker
        </p>
      </section>

      {/* Footer view */}
      <footer className="bg-[#2D2A29] text-[#DDE4DC]/60 py-12 border-t border-[#3E3A39]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-serif text-white font-bold leading-none tracking-tight text-lg italic">EduQuiz Academy</span>
          </div>
          <p className="text-xs text-[#DDE4DC]/40 font-mono text-center sm:text-right">
            &copy; {new Date().getFullYear()} EduQuiz Applet. All rights reserved. Built for secure full-stack assessments.
          </p>
        </div>
      </footer>

    </div>
  );
}
