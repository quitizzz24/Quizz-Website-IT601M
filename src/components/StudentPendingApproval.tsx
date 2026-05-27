import React, { useState } from "react";
import { User } from "../types";
import { Key, ShieldAlert, LogOut, CheckCircle, RefreshCw } from "lucide-react";

interface StudentPendingApprovalProps {
  user: User;
  onLogout: () => void;
  onActivated: (updatedUser: User) => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const StudentPendingApproval: React.FC<StudentPendingApprovalProps> = ({
  user,
  onLogout,
  onActivated,
  showToast
}) => {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          verificationCode: code.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Success! Your account has been verified and activated!", "success");
        onActivated(data.user);
      } else {
        showToast(data.message || "Invalid or expired verification code.", "error");
      }
    } catch (err) {
      showToast("Connection error verifying your activation code.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/auth/check-status?userId=${user.id}`);
      const data = await res.json();
      if (res.ok) {
        if (data.approved) {
          showToast("Awesome! Direct check confirms your account is now approved and active!", "success");
          onActivated(data.user);
        } else {
          showToast("Status checked: Still pending manual educator approval. Please wait or enter a code.", "info");
        }
      } else {
        showToast("We were unable to verify your validation state.", "error");
      }
    } catch {
      showToast("Network delay while querying directory nodes.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-[32px] border border-amber-200/65 shadow-xs space-y-6 animate-fade-in font-sans">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-250/20 flex items-center justify-center mx-auto text-amber-600 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif italic text-amber-900 font-bold">Account Activation Pending</h2>
          <p className="text-xs text-[#8C847E]">
            Welcome, <strong className="text-slate-800">{user.name}</strong>! Your account requires activation before you can access quizzes.
          </p>
        </div>
      </div>

      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/30 text-xs text-amber-950 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold mb-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Status: Awaiting Instructor Approval</span>
        </div>
        <p>
          Self-registered or guest upgrade profiles must be verified to synchronize access credentials. Choose one of the options below to activate:
        </p>
      </div>

      {/* Option A: Enter active code */}
      <form onSubmit={handleVerify} className="space-y-3 pt-2">
        <label className="text-[10px] uppercase font-bold text-amber-800 font-mono block">
          Option 1: Activate instantly with Code
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3.5 text-amber-700/60">
            <Key className="h-4 w-4" />
          </span>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code (EQ-XXXX-XXXX)..."
            className="w-full bg-[#FCFAF6] border border-amber-200/70 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs tracking-wider placeholder:text-amber-700/35 uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={verifying || !code.trim()}
          className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {verifying ? "Activating..." : "Validate & Activate Account 🚀"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-dashed border-stone-200"></div>
        <span className="flex-shrink mx-3 text-[10px] font-bold text-[#8C847E] uppercase tracking-wider font-mono">
          Or
        </span>
        <div className="flex-grow border-t border-dashed border-stone-200"></div>
      </div>

      {/* Option B: Wait and refresh */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold text-[#8C847E] font-mono block">
          Option 2: Wait for System Approval
        </span>
        <p className="text-xs text-slate-500 leading-snug">
          Ask your instructor or administrator to manually accept your signup in their roster system. You can refresh below to check if they have approved you:
        </p>
        <button
          type="button"
          onClick={handleCheckStatus}
          disabled={refreshing}
          className="w-full py-2.5 bg-[#FCFAF6] hover:bg-[#F3EFE9] border border-[#BC8F71]/30 text-amber-950 font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-700" : ""}`} />
          {refreshing ? "Checking directory..." : "Check System Approval Status"}
        </button>
      </div>

      {/* Footer log out button */}
      <div className="pt-4 border-t border-[#F3F1ED] flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          ID: {user.id}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 hover:bg-stone-50 border border-stone-250 text-stone-700 font-bold rounded-xl text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out & Sign Out
        </button>
      </div>
    </div>
  );
};
