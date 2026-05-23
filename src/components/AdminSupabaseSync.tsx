import React, { useState, useEffect } from "react";
import { 
  Database, RefreshCw, Power, CheckCircle2, XCircle, AlertCircle, 
  Terminal, Copy, Check, Server, HardDrive
} from "lucide-react";

interface TableStat {
  count: number;
  status: string;
  error?: string;
}

interface SupabaseStatus {
  configured: boolean;
  status: "DISCONNECTED" | "SCHEMA_NEEDED" | "CONNECTED" | "ERROR";
  url?: string;
  message: string;
  stats: Record<string, TableStat> | null;
  mirrorActive: boolean;
  serviceRoleKeyConfigured?: boolean;
}

export function AdminSupabaseSync() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; results?: any } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/supabase/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Supabase status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleMirror = async () => {
    if (!status) return;
    try {
      const nextEnabled = !status.mirrorActive;
      const res = await fetch("/api/supabase/toggle-mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatus(prev => prev ? { ...prev, mirrorActive: data.mirrorToSupabase } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/supabase/sync", {
        method: "POST"
      });
      const data = await res.json();
      setSyncResult(data);
      if (data.success) {
        // Refresh counts
        await fetchStatus();
      }
    } catch (err: any) {
      setSyncResult({ success: false, message: `Sync action crash: ${err.message || err}` });
    } finally {
      setSyncing(false);
    }
  };

  const SQL_MIGRATE = `-- Supabase Postgres Schema Setup for EduQuiz Studio
-- Execute this script in your Supabase project SQL Editor to instantiate the schema tables.

-- Create users table representation
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  "createdAt" TEXT NOT NULL,
  streak INTEGER DEFAULT 0
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  semester TEXT NOT NULL,
  "timeLimit" INTEGER NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  "quizId" TEXT NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  "correctAnswer" INTEGER NOT NULL
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  "quizId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "dueDate" TEXT NOT NULL,
  "assignedAt" TEXT NOT NULL,
  "completedAt" TEXT
);

-- Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  "quizId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  "createdAt" TEXT NOT NULL
);

-- Create settings global store table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  "activeSemester" TEXT NOT NULL,
  "leaderboardVisible" BOOLEAN NOT NULL,
  "siteName" TEXT NOT NULL,
  "logoUrl" TEXT,
  "mirrorToSupabase" BOOLEAN DEFAULT false
);

-- Turn off Row Level Security (RLS) for sandbox compatibility, or add policies later
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div id="supabase-console-container" className="bg-white p-6 rounded-[32px] border border-[#EBE7E0] space-y-6 shadow-2xs w-full">
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3F1ED]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#E1F1E8] text-[#248A56] rounded-xl">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#2D2A29] leading-none">Supabase Cloud Sync & Mirroring</h3>
            <p className="text-[10px] text-[#8C847E] mt-1 leading-relaxed">Connect, query, replicate, and persist local schemas on remote Postgres nodes.</p>
          </div>
        </div>

        <button 
          id="btn-refresh-supabase"
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EBE7E0] hover:bg-[#F9F8F6] text-[10px] uppercase tracking-wider font-extrabold text-[#6B635E] transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Test Status
        </button>
      </div>

      {/* Body contents */}
      {loading && !status ? (
        <div className="py-12 text-center text-xs text-[#8C847E] space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#BC8F71]" />
          <p>Querying Supabase endpoint diagnostics...</p>
        </div>
      ) : status ? (
        <div className="space-y-6">
          
          {/* Main Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: Integration Status */}
            <div className="border border-[#EBE7E0]/80 p-4 rounded-2xl bg-[#FBFBFA] flex flex-col justify-between">
              <span className="text-[9px] uppercase tracking-wider text-[#8C847E] font-extrabold block">Connection Status</span>
              <div className="mt-2.5 flex items-center gap-2">
                {status.status === "CONNECTED" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wide">Connected</span>
                  </>
                )}
                {status.status === "SCHEMA_NEEDED" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wide">Schema Needed</span>
                  </>
                )}
                {status.status === "DISCONNECTED" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-[#8C847E]"></span>
                    <span className="text-xs font-bold text-[#8C847E] bg-[#F2EDE7] px-2 py-0.5 rounded-md uppercase font-mono tracking-wide">Config Missing</span>
                  </>
                )}
                {status.status === "ERROR" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wide">Failed Connection</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-[#6B635E] mt-3 leading-relaxed">
                {status.message}
              </p>
            </div>

            {/* Box 2: Env config details */}
            <div className="border border-[#EBE7E0]/80 p-4 rounded-2xl bg-[#FBFBFA] flex flex-col justify-between">
              <span className="text-[9px] uppercase tracking-wider text-[#8C847E] font-extrabold block">Remote Node URL</span>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#2D2A29] font-mono break-all leading-tight bg-[#F2EDE7]/60 p-2 rounded-lg border border-[#EBE7E0]/50">
                <Server className="h-4.5 w-4.5 text-[#BC8F71] shrink-0" />
                <span>{status.url || "unresolved.supabase.co"}</span>
              </div>
              <p className="text-[10px] text-[#6B635E] mt-3 leading-relaxed">
                {status.configured 
                  ? "Supabase credential keys are securely retrieved server-side without direct browser disclosure."
                  : "Go to build Settings in AI Studio & declare SUPABASE_URL and SUPABASE_ANON_KEY to enable."}
              </p>
            </div>

            {/* Box 3: Live Mirror Status */}
            <div className="border border-[#EBE7E0]/80 p-4 rounded-2xl bg-[#FBFBFA] flex flex-col justify-between">
              <span className="text-[9px] uppercase tracking-wider text-[#8C847E] font-extrabold block">Live Mirror Setup</span>
              <div className="mt-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-sans">
                  {status.mirrorActive ? "Enabled & Active" : "Disabled (Disk-Only)"}
                </span>

                <button
                  id="btn-toggle-mirror"
                  onClick={handleToggleMirror}
                  disabled={!status.configured}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                    status.mirrorActive 
                      ? "bg-slate-950 text-white hover:bg-slate-800" 
                      : "bg-[#5A6F56] text-white hover:bg-[#4A5D46] disabled:opacity-40"
                  }`}
                >
                  <Power className="h-3 w-3" />
                  {status.mirrorActive ? "Deactivate" : "Activate"}
                </button>
              </div>
              <p className="text-[10px] text-[#6B635E] mt-3 leading-relaxed">
                If active, any grade saves, new quizzes, or user register events instantly replicate straight into Postgres.
              </p>
            </div>

          </div>

          {/* Service Role Auth Key status alert */}
          {status.configured && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              status.serviceRoleKeyConfigured 
                ? "bg-emerald-50/40 border-emerald-200/50 text-emerald-950" 
                : "bg-amber-50/40 border-amber-200/50 text-amber-950"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {status.serviceRoleKeyConfigured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Bypass Rate Limits Active (Service Role Key Configured)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Authentication Rate Limits Active (Public Anon Key Mode)</span>
                    </>
                  )}
                </div>
                <p className="text-[10.5px] text-[#6B635E]">
                  {status.serviceRoleKeyConfigured ? (
                    "Your backend is initialized with the Supabase Service Role Key. All batch synchronization attempts will automatically secure and register dummy/student accounts while seamlessly bypassing email double-confirmation and GoTrue SMTP API rate limits."
                  ) : (
                    "Users batch-synced over the Public Anon Key triggers Supabase limits ('email rate limit exceeded'). To enable instant, unlimited, and double-confirmation-free user sync, retrieve the service_role secret from Supabase Dashboard -> Project Settings -> API, and add it as SUPABASE_SERVICE_ROLE_KEY in your project environment."
                  )}
                </p>
              </div>
              
              {!status.serviceRoleKeyConfigured && (
                <div className="bg-white/90 px-3 py-2 rounded-xl border border-amber-200/40 shrink-0 font-mono text-[9px] text-[#8C847E]">
                  SUPABASE_SERVICE_ROLE_KEY=your_key
                </div>
              )}
            </div>
          )}

          {/* Tables Stats breakdown */}
          {status.configured && (
            <div className="border border-[#EBE7E0]/70 rounded-[24px] overflow-hidden">
              <div className="bg-[#F9F8F6] px-4 py-3 border-b border-[#EBE7E0]/50 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#6B635E] flex items-center gap-1.5 font-sans leading-none">
                  <HardDrive className="h-3.5 w-3.5 text-[#5A6F56]" /> Cloud Table Synchronizer State
                </span>
                
                <button
                  id="btn-migrate-now"
                  onClick={handleSyncNow}
                  disabled={syncing || status.status === "ERROR"}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-[#5A6F56] hover:bg-[#4A5D46] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync All Data No-Conflict"}
                </button>
              </div>

              {/* Table details list */}
              {status.stats ? (
                <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-[#EBE7E0]/60 text-center text-xs">
                  {(Object.entries(status.stats) as [string, TableStat][]).map(([table, stat]) => (
                    <div key={table} className="p-3.5 flex flex-col justify-between space-y-1 bg-white">
                      <span className="text-[10px] text-[#8C847E] font-medium block font-mono">{table}</span>
                      <span className="text-base font-black font-mono text-slate-900 mt-1">{stat.count}</span>
                      <div className="mt-1">
                        {stat.status === "OK" ? (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold font-mono">ONLINE</span>
                        ) : stat.status === "MISSING_TABLE" ? (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">MISSING</span>
                        ) : (
                          <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold font-mono">ERROR</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#8C847E]">
                  Run diagnostics check or click "Sync All Data" to seed table schema counters dynamically.
                </div>
              )}
            </div>
          )}

          {/* Migration Sync Results output */}
          {syncResult && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
              syncResult.success 
                ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-900" 
                : "bg-rose-50/50 border-rose-200/60 text-rose-900"
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {syncResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
                <span>{syncResult.success ? "Sync Action Completed Successfully" : "Sync Action Failed"}</span>
              </div>
              <p className="text-[#6B635E] text-[11px]">
                {syncResult.message}
              </p>
              {syncResult.results && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/50 text-[10px] text-[#6B635E]">
                  {Object.entries(syncResult.results).map(([table, res]: any) => (
                    <div key={table} className="bg-white/60 p-2.5 rounded-lg border border-slate-200/40 flex flex-col justify-between">
                      <div className="flex justify-between items-center font-mono">
                        <span className="font-semibold text-slate-700">{table}</span>
                        <span className={res.success ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                          {res.success ? `✓ (${res.count} rows)` : "✕ Failed"}
                        </span>
                      </div>
                      {!res.success && res.error && (
                        <p className="text-[9px] text-rose-600 font-mono bg-rose-50/50 p-1.5 rounded mt-1.5 leading-normal break-words border border-rose-100/50">
                          {res.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Database Setup instructions */}
          <div className="bg-[#F9F8F6] border border-[#EBE7E0] rounded-[24px] p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#2D2A29] flex items-center gap-1.5 leading-none">
                  <Terminal className="h-4 w-4 text-[#BC8F71]" /> Supabase schema instantiation SQL Commands
                </h4>
                <p className="text-[10px] text-[#8C847E] leading-relaxed">Copy the following instruction table queries and paste them directly into your Supabase Dashboard SQL Editor to establish connections successfully.</p>
              </div>

              <button
                id="btn-copy-sql"
                onClick={copySqlToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F2EDE7] border border-[#D9D3C7] rounded-xl text-[10px] font-bold text-[#6B635E] cursor-pointer transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-[10px] text-[#4A4744] bg-[#F2EDE7]/50 border border-[#EBE7E0]/70 p-3.5 rounded-xl font-mono overflow-x-auto max-h-48 leading-relaxed scrollbar-thin">
              {SQL_MIGRATE}
            </pre>
          </div>

        </div>
      ) : (
        <div className="py-6 text-center text-xs text-rose-600">
          <AlertCircle className="h-5 w-5 mx-auto" />
          <p className="mt-1">Unable to communicate with the integration service diagnostics check routines.</p>
        </div>
      )}
    </div>
  );
}
