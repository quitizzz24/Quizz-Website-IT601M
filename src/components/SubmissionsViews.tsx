import React, { useState } from "react";
import { 
  FileQuestion, Plus, Trash2, Send, Clock, CheckCircle2, 
  XCircle, MessageSquare, BookOpen, Award, User, ClipboardCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, StudentQuestionSubmission } from "../types";

const CORE_MODULES = [
  "Great Books - SY2526-2T",
  "Programming Languages - SY2526-2T",
  "Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T",
  "Management Information Systems - SY2526-2T",
  "Mobile Systems and Technologies - SY2526-2T",
  "Web Systems and Technologies - SY2526-2T"
];

// =========================================================================
// 1. STUDENT VIEW: Suggest multiple questions & Monitor submission ledger
// =========================================================================
interface StudentSubmissionsViewProps {
  user: UserType;
  submissions: StudentQuestionSubmission[];
  onSubmitSubmissions: (payloads: any[]) => Promise<boolean>;
}

export function StudentSubmissionsView({ 
  user, 
  submissions, 
  onSubmitSubmissions 
}: StudentSubmissionsViewProps) {
  const [currentText, setCurrentText] = useState("");
  const [currentSubject, setCurrentSubject] = useState(CORE_MODULES[0]);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);

  // Local drafted queue that student is co-creating
  const [draftQueue, setDraftQueue] = useState<any[]>([]);
  const [isSubmittingLease, setIsSubmittingLease] = useState(false);

  const handleOptionChange = (idx: number, val: string) => {
    const nextOpts = [...options];
    nextOpts[idx] = val;
    setOptions(nextOpts);
  };

  const handleAddQuestionToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentText.trim()) return;
    if (options.some(opt => !opt.trim())) return;

    const newItem = {
      text: currentText,
      subject: currentSubject,
      options: [...options],
      correctAnswer,
      studentId: user.id,
      studentName: user.name,
    };

    setDraftQueue([...draftQueue, newItem]);
    // Clear question text and options, but preserve selected module for rapid queue builds
    setCurrentText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const handleRemoveDraftItem = (idx: number) => {
    setDraftQueue(draftQueue.filter((_, i) => i !== idx));
  };

  const handleSubmitAllDrafts = async () => {
    if (draftQueue.length === 0) return;
    setIsSubmittingLease(true);
    const ok = await onSubmitSubmissions(draftQueue);
    setIsSubmittingLease(false);
    if (ok) {
      setDraftQueue([]);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Deck */}
      <div className="bg-white rounded-xl sm:rounded-[32px] p-4 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-1 sm:space-y-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="p-2 sm:p-2.5 bg-[#F2EDE7] rounded-xl sm:rounded-2xl text-[#2D2A29] shrink-0">
            <FileQuestion className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div>
            <h1 className="text-lg sm:text-2xl font-serif italic text-[#2D2A29] font-bold">Academic Question Proposal Desk</h1>
            <p className="text-[10px] sm:text-xs text-[#8C847E]">
              Formulate, construct, and co-design multiple-choice questions for handout evaluation libraries.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Left Column: Editor Form + Current session queue */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl sm:rounded-[32px] p-4 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-4 sm:space-y-6">
            <h3 className="text-[#2D2A29] font-serif italic text-sm sm:text-base font-bold flex items-center gap-2 border-b border-[#F3F1ED] pb-3">
              <span>Step 1: Write Custom Question</span>
            </h3>

            <form onSubmit={handleAddQuestionToDraft} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6B635E] uppercase tracking-wider">Select Module Classification</label>
                <select 
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#EBE7E0] p-3 text-[#2D2A29] focus:ring-1 focus:ring-[#5A6F56] focus:border-[#5A6F56] font-sans bg-white cursor-pointer"
                >
                  {CORE_MODULES.map(m => (
                    <option key={m} value={m}>{m.split(" - ")[0]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6B635E] uppercase tracking-wider">Question Text</label>
                <textarea 
                  required
                  placeholder="e.g. Which algorithm optimizes heap storage in native compilers?"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-xl border border-[#EBE7E0] p-3 text-[#2D2A29] focus:ring-1 focus:ring-[#5A6F56] focus:border-[#5A6F56] font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6B635E] uppercase tracking-wider block">Define Choices & Mark Correct Answer</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#F9F8F6] p-2 rounded-xl border border-[#EBE7E0]/60">
                      <input 
                        type="radio" 
                        name="student-correct-answer"
                        checked={correctAnswer === idx}
                        onChange={() => setCorrectAnswer(idx)}
                        className="h-4 w-4 text-[#5A6F56] focus:ring-[#5A6F56] cursor-pointer"
                        title="Mark as correct choice"
                      />
                      <span className="text-xs font-mono font-bold text-[#BC8F71] shrink-0">Option {String.fromCharCode(65 + idx)}:</span>
                      <input 
                        required
                        type="text"
                        placeholder={`Provide selectable choice text...`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-grow bg-transparent border-none text-xs focus:ring-0 p-1 text-[#433F3E]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 border border-dashed border-[#BC8F71] hover:border-[#BC8F71] text-[#BC8F71] hover:bg-[#BC8F71]/5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Question to Session Draft List
              </button>
            </form>
          </div>

          {/* Local session draft queue card */}
          <div className="bg-white rounded-xl sm:rounded-[32px] p-4 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F1ED] pb-3">
              <div>
                <h3 className="text-[#2D2A29] font-serif italic text-sm sm:text-base font-bold">Step 2: Session Draft Checklist ({draftQueue.length})</h3>
                <p className="text-[10px] text-[#8C847E]">Questions currently prepared for submission batching.</p>
              </div>
              {draftQueue.length > 0 && (
                <button
                  onClick={() => setDraftQueue([])}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {draftQueue.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EBE7E0] text-xs text-[#8C847E]">
                  ✏️ Formulate questions above and click "Add Question" to queue them for a synchronized bulk submit!
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                    {draftQueue.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={idx} 
                        className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#EBE7E0] flex items-start justify-between gap-3 relative"
                      >
                        <div className="space-y-2 flex-grow min-w-0 pr-3">
                          <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            {item.subject.split(" - ")[0]}
                          </span>
                          <h5 className="text-xs font-bold text-[#2D2A29] line-clamp-2 leading-tight">
                            {item.text}
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                            {item.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="text-[10px] truncate max-w-full flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${oIdx === item.correctAnswer ? "bg-[#5A6F56]" : "bg-[#BC8F71]/30"}`} />
                                <span className={oIdx === item.correctAnswer ? "font-bold text-[#4A5D46]" : "text-[#6B635E]"}>
                                  {String.fromCharCode(65 + oIdx)}: {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRemoveDraftItem(idx)}
                          className="p-1.5 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-600 transition cursor-pointer"
                          title="Remove draft question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={handleSubmitAllDrafts}
                    disabled={isSubmittingLease}
                    className="w-full py-3 bg-[#5A6F56] hover:bg-[#4A5D46] disabled:bg-[#5A6F56]/60 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingLease ? "Saving Submissions..." : `Submit suggested questions queue (${draftQueue.length})`}
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Submission History Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl sm:rounded-[32px] p-4 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-[#2D2A29] font-serif italic text-sm sm:text-base font-bold">My Suggested Submissions ({submissions.length})</h3>
              <p className="text-[10px] text-[#8C847E]">Monitor the approval states and audit feedback from Dr. Vance here.</p>
            </div>

            <div className="space-y-3.5 max-h-[660px] overflow-y-auto pr-1 scrollbar-thin">
              {submissions.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EBE7E0] text-xs text-[#8C847E]">
                  No previous suggestions found. Get started by drafting your first set of handouts above!
                </div>
              ) : (
                [...submissions].reverse().map((sub) => (
                  <div key={sub.id} className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#EBE7E0]/80 space-y-3 relative overflow-hidden group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[9px] font-bold text-[#6B635E] bg-[#EBE7E0]/60 px-2 py-0.5 rounded-md">
                        {sub.subject.split(" - ")[0]}
                      </span>
                      
                      {sub.status === "PENDING" && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wider font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          <Clock className="h-2.5 w-2.5 animate-pulse shrink-0" />
                          PENDING AUDIT
                        </span>
                      )}
                      
                      {sub.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wider font-mono text-emerald-800 bg-[#E9F0E8] px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                          IN BANK
                        </span>
                      )}

                      {sub.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wider font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <XCircle className="h-2.5 w-2.5 shrink-0" />
                          COULD IMPROVE
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#2D2A29] leading-tight line-clamp-2">{sub.text}</h4>
                      <p className="text-[9px] text-[#8C847E]">Submitted on {new Date(sub.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1 bg-white p-2 rounded-xl border border-[#EBE7E0]/50 text-[10px]">
                      {sub.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1 min-w-0">
                          <span className={`h-1 w-1 rounded-full ${oIdx === sub.correctAnswer ? "bg-[#5A6F56]" : "bg-transparent border border-[#BC8F71]"}`} />
                          <span className={`${oIdx === sub.correctAnswer ? "font-extrabold text-[#4A5D46]" : "text-[#6B635E]"} truncate`}>
                            {String.fromCharCode(65 + oIdx)}: {opt}
                          </span>
                        </div>
                      ))}
                    </div>

                    {sub.adminFeedback && (
                      <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-amber-200/40 text-[10px] text-[#845D3F] flex items-start gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold">Dr. Vance's Note:</p>
                          <p className="italic leading-relaxed">"{sub.adminFeedback}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// =========================================================================
// 2. ADMIN VIEW: Audit proposals block & Approve/Reject list
// =========================================================================
interface AdminSubmissionsViewProps {
  submissions: StudentQuestionSubmission[];
  onReviewSubmission: (id: string, status: "APPROVED" | "REJECTED", feedback?: string) => Promise<boolean>;
}

export function AdminSubmissionsView({ 
  submissions, 
  onReviewSubmission 
}: AdminSubmissionsViewProps) {
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const handleFeedbackChange = (id: string, text: string) => {
    setFeedbackInput({
      ...feedbackInput,
      [id]: text
    });
  };

  const handleReviewAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setBusyIds({ ...busyIds, [id]: true });
    const ok = await onReviewSubmission(id, status, feedbackInput[id] || "");
    setBusyIds({ ...busyIds, [id]: false });
    if (ok) {
      // Clear specific input text
      const nextFeedback = { ...feedbackInput };
      delete nextFeedback[id];
      setFeedbackInput(nextFeedback);
    }
  };

  const filtered = submissions.filter(s => s.status === activeTab);

  // Stats counting
  const pendingCount = submissions.filter(s => s.status === "PENDING").length;
  const approvedCount = submissions.filter(s => s.status === "APPROVED").length;
  const rejectedCount = submissions.filter(s => s.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header Desk */}
      <div className="bg-white rounded-xl sm:rounded-[32px] p-4 sm:p-6 border border-[#EBE7E0] shadow-2xs space-y-1 sm:space-y-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="p-2 sm:p-2.5 bg-[#F2EDE7] rounded-xl sm:rounded-2xl text-[#2D2A29] shrink-0">
            <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div>
            <h1 className="text-lg sm:text-2xl font-serif italic text-[#2D2A29] font-bold">Proposals Co-Authoring Board</h1>
            <p className="text-[10px] sm:text-xs text-[#8C847E]">
              Audit user suggested handout items. Confirm answers accuracy and promote draft templates straight into all active semesters.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE7E0] pb-2">
        <div className="flex items-center gap-2 p-1 bg-[#EBE7E0]/40 rounded-2xl border border-[#EBE7E0]/85 self-start">
          <button 
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PENDING" ? "bg-white text-[#2D2A29] shadow-2xs" : "text-[#6B635E] hover:bg-white/40"
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button 
            onClick={() => setActiveTab("APPROVED")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "APPROVED" ? "bg-[#5A6F56] text-white shadow-2xs" : "text-[#6B635E] hover:bg-white/40"
            }`}
          >
            Approved Pool ({approvedCount})
          </button>
          <button 
            onClick={() => setActiveTab("REJECTED")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "REJECTED" ? "bg-rose-600 text-white shadow-2xs" : "text-[#6B635E] hover:bg-white/40"
            }`}
          >
            Needs Revision ({rejectedCount})
          </button>
        </div>
        <span className="text-[10px] text-[#8C847E] font-medium font-sans">
          Audit rate: {submissions.length > 0 ? Math.round(((approvedCount + rejectedCount) / submissions.length) * 100) : 100}% Processed
        </span>
      </div>

      {/* Main Grid List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-16 bg-white rounded-xl sm:rounded-[32px] border border-[#EBE7E0] p-4 sm:p-6">
              <span className="text-4xl block mb-2">📥</span>
              <h4 className="font-bold text-sm text-[#2D2A29]">No Suggestions Classified Here</h4>
              <p className="text-xs text-[#8C847E] mt-1">There are no suggested multiple choice questions matching this review status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((sub) => {
                const isBusy = busyIds[sub.id];
                return (
                  <div 
                    key={sub.id} 
                    className="bg-white rounded-xl sm:rounded-[32px] border border-[#EBE7E0] p-4 sm:p-5 flex flex-col justify-between gap-4 sm:gap-5 relative hover:shadow-2xs transition-all duration-200"
                  >
                    {/* Inner header details */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2 border-b border-[#F3F1ED] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-full bg-[#F2EDE7] flex items-center justify-center text-xs text-[#BC8F71] font-bold">
                            {sub.studentName.charAt(0)}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#2D2A29] leading-none">{sub.studentName}</p>
                            <span className="text-[9px] text-[#8C847E]">Student Co-Author</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#BC8F71] bg-[#F2EDE7]/60 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          {sub.subject.split(" - ")[0]}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-[#2D2A29] font-semibold leading-relaxed">
                          "{sub.text}"
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-1.5">
                          {sub.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-sans border transition ${
                                oIdx === sub.correctAnswer 
                                  ? "bg-emerald-50/50 border-emerald-200 text-[#4A5D46] font-bold" 
                                  : "bg-[#FAFAF9] border-[#EBE7E0]/60 text-[#6B635E]"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${oIdx === sub.correctAnswer ? "bg-emerald-500" : "bg-neutral-300"}`} />
                              <span className="truncate">Option {String.fromCharCode(65 + oIdx)}: {opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Audit Controls depending on Tab */}
                    {activeTab === "PENDING" ? (
                      <div className="space-y-3 pt-3 border-t border-[#F3F1ED]">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#6B635E] uppercase tracking-wider block">Admin Auditor Feedback</label>
                          <input 
                            type="text"
                            placeholder="e.g. Approved. Solid test target. / Please refine Option C..."
                            value={feedbackInput[sub.id] || ""}
                            onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                            className="w-full text-xs rounded-xl border border-[#EBE7E0] p-2.5 text-[#2D2A29] focus:ring-1 focus:ring-[#5A6F56]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleReviewAction(sub.id, "REJECTED")}
                            disabled={isBusy}
                            className="py-2.5 border border-[#BC8F71]/35 hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Request Edit
                          </button>
                          <button
                            onClick={() => handleReviewAction(sub.id, "APPROVED")}
                            disabled={isBusy}
                            className="py-2.5 bg-[#5A6F56] hover:bg-[#4A5D46] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Bank
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-[#F3F1ED] space-y-2">
                        {sub.adminFeedback ? (
                          <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-amber-200/40 text-[10px] text-[#845D3F]">
                            <p className="font-extrabold flex items-center gap-1 mb-0.5">
                              <MessageSquare className="h-3 w-3" /> Audit Remark
                            </p>
                            <p className="italic leading-normal select-text">"{sub.adminFeedback}"</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#8C847E] font-medium italic">No comments provided in audit record.</p>
                        )}
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          activeTab === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          Audited on {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
