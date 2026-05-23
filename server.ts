import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase Client (Lazy)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    });
    console.log("Supabase Client initialized successfully with URL:", supabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.log("Supabase credentials not found in environment. Cloud sync disabled.");
}

let supabaseAdmin: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("Supabase Admin Client initialized for Auth admin operations bypassing verification & rate limits.");
  } catch (err) {
    console.error("Failed to initialize Supabase Admin client:", err);
  }
}

// Background mirroring helper
async function mirrorRecordToSupabase(table: string, record: any) {
  if (!supabase) return;
  try {
    const cleanRecord = { ...record };
    // JSON fields might need to be parsed or kept as is. Supabase handle objects/arrays natively for JSONB cols.
    const { error } = await supabase.from(table).upsert([cleanRecord], { onConflict: 'id' });
    if (error) {
      console.warn(`Supabase upsert warning on dynamic mirror to ${table}:`, error.message);
    }
  } catch (err: any) {
    console.warn(`Supabase network mirror exception to ${table}:`, err.message);
  }
}

async function deleteRecordFromSupabase(table: string, id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete warning on dynamic mirror from ${table}:`, error.message);
    }
  } catch (err: any) {
    console.warn(`Supabase network mirror delete exception from ${table}:`, err.message);
  }
}

async function syncUserToSupabaseAuth(user: User): Promise<{ success: boolean; error?: string }> {
  const password = user.passwordHash || "student123";

  // 1. If supabaseAdmin exists, we use Admin Auth which bypasses all rate limits & auto-confirms email!
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true, // Auto-confirm email so user can sign in immediately
        user_metadata: {
          name: user.name,
          role: user.role,
          id: user.id
        }
      });
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists") || error.message.includes("Email already in use")) {
          console.log(`Supabase Auth admin sync: ${user.email} already registered.`);
          return { success: true };
        }
        console.warn(`Supabase Auth admin sync error for ${user.email}:`, error.message);
        return { success: false, error: error.message };
      } else {
        console.log(`Supabase Auth admin synced successfully for ${user.email}`);
        return { success: true };
      }
    } catch (err: any) {
      console.warn(`Supabase Auth admin network exception for ${user.email}:`, err.message || err);
      return { success: false, error: err.message || err };
    }
  }

  // 2. Fallback to standard signUp (subject to rate limits & verification)
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: password,
      options: {
        data: {
          name: user.name,
          role: user.role,
          id: user.id
        }
      }
    });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already exists") || error.message.includes("Email already in use")) {
        console.log(`Supabase Auth sync: ${user.email} already registered.`);
        return { success: true };
      }
      console.warn(`Supabase Auth sync error for ${user.email}:`, error.message);
      return { success: false, error: error.message };
    } else {
      console.log(`Supabase Auth synced successfully for ${user.email}`);
      return { success: true };
    }
  } catch (err: any) {
    console.warn(`Supabase Auth network exception for ${user.email}:`, err.message || err);
    return { success: false, error: err.message || err };
  }
}

// Interfaces & Schema definitions
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plaintext or hashed; we use simple string check for simulation/sturdiness
  role: "STUDENT" | "ADMIN";
  avatar: string;
  createdAt: string;
  streak: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  semester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  timeLimit: number; // in minutes
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[]; // 4 options
  correctAnswer: number; // index (0-3)
}

interface QuestionBankItem {
  id: string;
  text: string;
  subject: string;
  options: string[];
  correctAnswer: number;
}

interface Assignment {
  id: string;
  quizId: string;
  studentId: string;
  dueDate: string;
  assignedAt: string;
  completedAt?: string;
}

interface Attempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  total: number;
  passed: boolean;
  answers: Record<string, number>; // questionId -> chosen index
  createdAt: string;
}

interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatar: string;
  totalScore: number;
  quizzesTaken: number;
  averagePercent: number;
  badges: string[];
  rank?: number;
}

interface Settings {
  activeSemester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  leaderboardVisible: boolean;
  siteName: string;
  logoUrl?: string;
  mirrorToSupabase?: boolean;
}

// Database JSON State
interface DB {
  users: User[];
  quizzes: Quiz[];
  questions: Question[];
  questionBank: QuestionBankItem[];
  assignments: Assignment[];
  attempts: Attempt[];
  settings: Settings;
}

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load DB
function loadDB(): DB {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DB = {
      users: [
        {
          id: "u-admin",
          name: "Dr. Elizabeth Vance",
          email: "admin@eduquiz.com",
          passwordHash: "admin123",
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
          createdAt: new Date().toISOString(),
          streak: 0,
        },
        {
          id: "u-student1",
          name: "Alex Rivera",
          email: "student@eduquiz.com",
          passwordHash: "student123",
          role: "STUDENT",
          avatar: "",
          createdAt: new Date().toISOString(),
          streak: 3,
        },
        {
          id: "u-student2",
          name: "Alice Chen",
          email: "alice@gmail.com",
          passwordHash: "student123",
          role: "STUDENT",
          avatar: "",
          createdAt: new Date().toISOString(),
          streak: 7,
        },
        {
          id: "u-student3",
          name: "Marcus Jenkins",
          email: "marcus@gmail.com",
          passwordHash: "student123",
          role: "STUDENT",
          avatar: "",
          createdAt: new Date().toISOString(),
          streak: 1,
        },
        {
          id: "u-student4",
          name: "Sophia Rodriguez",
          email: "sophia@gmail.com",
          passwordHash: "student123",
          role: "STUDENT",
          avatar: "",
          createdAt: new Date().toISOString(),
          streak: 12,
        },
        {
          id: "u-student5",
          name: "Liam O'Connor",
          email: "liam@gmail.com",
          passwordHash: "student123",
          role: "STUDENT",
          avatar: "",
          createdAt: new Date().toISOString(),
          streak: 0,
        },
      ],
      quizzes: [
        {
          id: "q-1",
          title: "04_Handout_1A.pdf",
          subject: "Great Books - SY2526-2T",
          description: "Questions for Modernism to Contemporary and Global Literature based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "q-2",
          title: "04_Handout_1A.pdf",
          subject: "Programming Languages - SY2526-2T",
          description: "Questions for Syntax, Semantics, compilation, lexical analysis and scope rules based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "q-3",
          title: "04_Handout_1A.pdf",
          subject: "Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T",
          description: "Questions on modern encryption, common attack vectors, and operational CIA triad defenses based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "q-4",
          title: "04_Handout_1A.pdf",
          subject: "Management Information Systems - SY2526-2T",
          description: "Questions on enterprise information systems, ERP platforms, and BI data flow based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "q-5",
          title: "04_Handout_1A.pdf",
          subject: "Mobile Systems and Technologies - SY2526-2T",
          description: "Questions on mobile Android lifecycles, event receivers, local storage, and services based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "q-6",
          title: "04_Handout_1A.pdf",
          subject: "Web Systems and Technologies - SY2526-2T",
          description: "Questions on HTTP handshake models, secure protocols, DOM trees, and AJAX client-server APIs based on Handout 1A.",
          semester: "PRELIM",
          timeLimit: 15,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
        }
      ],
      questions: [
        {
          id: "qn-101",
          quizId: "q-1",
          text: "What time period does Modernism span?",
          options: ["1800–1900 CE", "1890–1945 CE", "1945–1990s CE", "1980s–Present"],
          correctAnswer: 1,
        },
        {
          id: "qn-102",
          quizId: "q-1",
          text: "Which of the following best describes 'Experimentation' as a main form of Modernism?",
          options: ["Blending high and low culture", "Breaking artistic and literary traditions to create new forms of expression", "Depicting ordinary people and everyday life", "Questioning absolute truths and grand narratives"],
          correctAnswer: 1,
        },
        {
          id: "qn-103",
          quizId: "q-1",
          text: "James Joyce's Ulysses uses which narrative technique?",
          options: ["Metafiction", "Fragmentation", "Stream-of-consciousness narration", "Dark humor"],
          correctAnswer: 2,
        },
        {
          id: "qn-104",
          quizId: "q-1",
          text: "Which Franz Kafka work is cited as an example of Alienation in Modernism?",
          options: ["The Trial", "In the Penal Colony", "Amerika", "The Metamorphosis"],
          correctAnswer: 3,
        },
        {
          id: "qn-105",
          quizId: "q-1",
          text: "What does 'Alienation' in Modernism reflect?",
          options: ["The rejection of grand narratives", "Blending realism with the surreal", "An individual's sense of isolation and disconnection from society", "The influence of mass media on identity"],
          correctAnswer: 2,
        },
        {
          id: "qn-201",
          quizId: "q-2",
          text: "What program evaluation strategy postpones evaluating an expression until its value is explicitly required?",
          options: ["Eager Evaluation", "Strict Evaluation", "Lazy Evaluation", "Dynamic Evaluation"],
          correctAnswer: 2,
        },
        {
          id: "qn-202",
          quizId: "q-2",
          text: "Which programming paradigm defines computation primarily through mathematical functions, avoiding side effects?",
          options: ["Object-Oriented Programming", "Functional Programming", "Procedural Programming", "Structured Query Programming"],
          correctAnswer: 1,
        },
        {
          id: "qn-203",
          quizId: "q-2",
          text: "In compilation, which phase is responsible for converting source text characters into a sequence of tokens?",
          options: ["Lexical Analysis", "Semantic Analysis", "Syntax Tree Tuning", "Intermediate Code Generation"],
          correctAnswer: 0,
        },
        {
          id: "qn-204",
          quizId: "q-2",
          text: "What terminology represents the range of program instructions wherein a declared variable remains valid?",
          options: ["Lexical Scope", "Dynamic Range", "Compilation Bound", "Closure Frame"],
          correctAnswer: 0,
        },
        {
          id: "qn-205",
          quizId: "q-2",
          text: "Which compiler optimization technique replaces function calls with the actual body of the function?",
          options: ["Dead Code Elimination", "Inlining", "Loop Unrolling", "Constant Folding"],
          correctAnswer: 1,
        },
        {
          id: "qn-301",
          quizId: "q-3",
          text: "Which three foundational components compose the core model of cyber-defense known as the CIA Triad?",
          options: ["Cryptography, Isolation, Authenticity", "Confidentiality, Integrity, Availability", "Connection, Identification, Authorization", "Control, Intrusion, Avoidance"],
          correctAnswer: 1,
        },
        {
          id: "qn-302",
          quizId: "q-3",
          text: "Which cryptography technique utilizes two separate keys (public and private) for encrypting and decrypting data?",
          options: ["Symmetric Cryptography", "Asymmetric Cryptography", "One-Time Pad Cipher", "Hashing Protocols"],
          correctAnswer: 1,
        },
        {
          id: "qn-303",
          quizId: "q-3",
          text: "What type of attack vector intercepts and potentially alters communication between two legitimate conversing peers?",
          options: ["Man-in-the-Middle (MitM) Attack", "Distributed Denial of Service (DDoS)", "SQL Injection (SQLi) Exploit", "Social Engineering Phishing"],
          correctAnswer: 0,
        },
        {
          id: "qn-304",
          quizId: "q-3",
          text: "What is the primary role of a firewall in network-bound security architectures?",
          options: ["To encrypt offline terminal inputs", "To monitor network traffic and filter unauthorized access matches", "To generate safe security clearance keys automatically", "To inspect CPU cooling systems"],
          correctAnswer: 1,
        },
        {
          id: "qn-305",
          quizId: "q-3",
          text: "Which security mechanism validates the identity of a user before granting resources?",
          options: ["Authorization", "Configuration", "Authentication", "Introspection"],
          correctAnswer: 2,
        },
        {
          id: "qn-401",
          quizId: "q-4",
          text: "What business platform integrates finance, marketing, and inventory into one synchronized system?",
          options: ["CRM (Customer Relationship)", "SaaS Engine Hub", "ERP (Enterprise Resource Planning)", "SCM Delivery Hub"],
          correctAnswer: 2,
        },
        {
          id: "qn-402",
          quizId: "q-4",
          text: "Which of the following is a primary goal of Business Intelligence (BI) tools?",
          options: ["Data Entry helper operations", "Analyzing data to make strategic business decisions", "Hard drive partitioning routines", "Network firewall configuration filters"],
          correctAnswer: 1,
        },
        {
          id: "qn-403",
          quizId: "q-4",
          text: "What type of database transaction property ensures that a transaction is completed fully or not at all?",
          options: ["Atomicity", "Consistency", "Isolation", "Durability"],
          correctAnswer: 0,
        },
        {
          id: "qn-404",
          quizId: "q-4",
          text: "Which system acts as a central repository for consolidated enterprise data gathered from multiple distinct sources?",
          options: ["Data Warehouse", "Transaction processing system", "Spreadsheet application", "Content delivery network"],
          correctAnswer: 0,
        },
        {
          id: "qn-405",
          quizId: "q-4",
          text: "What methodology uses machine learning and statistical models to discover structural patterns in large datasets?",
          options: ["Data Mining", "Batch Loading", "Schema Mapping", "Metadata Cataloging"],
          correctAnswer: 0,
        },
        {
          id: "qn-501",
          quizId: "q-5",
          text: "In Android mobile architecture, which activity hook is invoked when the screen is no longer visible to the user?",
          options: ["onPause()", "onStop()", "onDestroy()", "onRestart()"],
          correctAnswer: 1,
        },
        {
          id: "qn-502",
          quizId: "q-5",
          text: "Which open-source compilation framework uses Dart to produce high-performance native iOS and Android experiences?",
          options: ["React Native", "Flutter", "Ionic Cordova", "Xamarin Native"],
          correctAnswer: 1,
        },
        {
          id: "qn-503",
          quizId: "q-5",
          text: "What element is responsible for managing background long-running tasks in mobile apps without a user interface?",
          options: ["ContentProvider", "BroadcastReceiver", "Service", "Fragment"],
          correctAnswer: 2,
        },
        {
          id: "qn-504",
          quizId: "q-5",
          text: "Which mechanism allows Android apps to communicate system-wide events and receive broadcasts?",
          options: ["Intent Filter", "Broadcast Receiver", "SharedPreferences", "AsyncTask"],
          correctAnswer: 1,
        },
        {
          id: "qn-505",
          quizId: "q-5",
          text: "How do mobile applications typically persist lightweight key-value pairs locally?",
          options: ["Room database", "SQLite standalone", "SharedPreferences", "Realm memory layout"],
          correctAnswer: 2,
        },
        {
          id: "qn-601",
          quizId: "q-6",
          text: "Which HTTP status code indicates a client's request was completed successfully?",
          options: ["404 Not Found", "500 Server Error", "301 Redirected", "200 OK"],
          correctAnswer: 3,
        },
        {
          id: "qn-602",
          quizId: "q-6",
          text: "What protocol is standard for secure communication over the web?",
          options: ["HTTP standard", "FTP layout", "HTTPS", "SMTP mail"],
          correctAnswer: 2,
        },
        {
          id: "qn-603",
          quizId: "q-6",
          text: "Which styling layer is responsible for responsive web design layouts?",
          options: ["HTML5 canvas", "CSS3 stylesheets", "Document Object Model", "ECMAScript engine"],
          correctAnswer: 1,
        },
        {
          id: "qn-604",
          quizId: "q-6",
          text: "What is the main purpose of the Document Object Model (DOM) in web browsers?",
          options: ["Enforce strict device security rules", "To represent structured HTML/XML documents as a node tree", "Manage HTTP cookies asynchronously", "Serve requests on high-performance backend channels"],
          correctAnswer: 1,
        },
        {
          id: "qn-605",
          quizId: "q-6",
          text: "What technology allows visual updates of portions of a web page asynchronously without a full page reload?",
          options: ["ASP server maps", "CGI gateways", "AJAX asynchronous transport", "FTP remote servers"],
          correctAnswer: 2,
        }
      ],
      questionBank: [
        {
          id: "qb-1",
          text: "What business platform integrates finance, marketing, and inventory into one synchronized system?",
          subject: "Management Information Systems - SY2526-2T",
          options: ["CRM (Customer Relationship)", "SaaS Engine Hub", "ERP (Enterprise Resource Planning)", "SCM Delivery Hub"],
          correctAnswer: 2,
        },
        {
          id: "qb-2",
          text: "Which program anomaly describes a compilation mismatch where variable names clash in nested scopes?",
          subject: "Programming Languages - SY2526-2T",
          options: ["Static Variable Cloaking", "Shadowing Clash Error", "Variable Shadowing", "Dynamic Scope Binding"],
          correctAnswer: 2,
        },
        {
          id: "qb-3",
          text: "What is the primary role of a firewall in network-bound security architectures?",
          subject: "Information Assurance & Security (Cybersecurity Fundamentals) - SY2526-2T",
          options: ["To encrypt offline terminal inputs", "To monitor network traffic and filter unauthorized access matches", "To generate safe security clearance keys automatically", "To inspect CPU cooling systems"],
          correctAnswer: 1,
        }
      ],
      assignments: [
        {
          id: "a-1",
          quizId: "q-2",
          studentId: "u-student1",
          dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
          assignedAt: new Date().toISOString(),
        },
        {
          id: "a-2",
          quizId: "q-3",
          studentId: "u-student1",
          dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          assignedAt: new Date().toISOString(),
        },
        {
          id: "a-3",
          quizId: "q-5",
          studentId: "u-student1",
          dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          assignedAt: new Date().toISOString(),
        },
        // Inactive semester assignment (Prelim) marked done / pending
        {
          id: "a-4",
          quizId: "q-1",
          studentId: "u-student1",
          dueDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          assignedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
        }
      ],
      attempts: [
        // Let's seed pre-completed student history to populate a nice starting state
        {
          id: "at-1",
          quizId: "q-1",
          studentId: "u-student1",
          score: 3,
          total: 3,
          passed: true,
          answers: { "qn-101": 2, "qn-102": 1, "qn-103": 2 },
          createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
        },
        // Setup details for others
        {
          id: "at-2",
          quizId: "q-1",
          studentId: "u-student2",
          score: 3,
          total: 3,
          passed: true,
          answers: { "qn-101": 2, "qn-102": 1, "qn-103": 2 },
          createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-3",
          quizId: "q-2",
          studentId: "u-student2",
          score: 2,
          total: 3,
          passed: true,
          answers: { "qn-201": 2, "qn-202": 1, "qn-203": 1 },
          createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-4",
          quizId: "q-3",
          studentId: "u-student2",
          score: 3,
          total: 3,
          passed: true,
          answers: { "qn-301": 1, "qn-302": 2, "qn-303": 0 },
          createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-5",
          quizId: "q-3",
          studentId: "u-student3",
          score: 1,
          total: 3,
          passed: false,
          answers: { "qn-301": 0, "qn-302": 1, "qn-303": 0 },
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-6",
          quizId: "q-1",
          studentId: "u-student4",
          score: 2,
          total: 3,
          passed: true,
          answers: { "qn-101": 1, "qn-102": 1, "qn-103": 2 },
          createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-7",
          quizId: "q-2",
          studentId: "u-student4",
          score: 3,
          total: 3,
          passed: true,
          answers: { "qn-201": 2, "qn-202": 1, "qn-203": 0 },
          createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "at-8",
          quizId: "q-3",
          studentId: "u-student4",
          score: 3,
          total: 3,
          passed: true,
          answers: { "qn-301": 1, "qn-302": 2, "qn-303": 0 },
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        }
      ],
      settings: {
        activeSemester: "MIDTERM",
        leaderboardVisible: true,
        siteName: "EduQuiz Academy",
        logoUrl: "🎓",
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf-8");
    return initialDB;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

// Helper to save DB
function saveDB(db: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  if (supabase && db.settings && db.settings.mirrorToSupabase) {
    // Perform live-mirror operations in background
    Promise.all([
      supabase.from("settings").upsert([{ id: "global-params", activeSemester: db.settings.activeSemester, leaderboardVisible: db.settings.leaderboardVisible, siteName: db.settings.siteName, logoUrl: db.settings.logoUrl || "🎓", mirrorToSupabase: db.settings.mirrorToSupabase }], { onConflict: "id" }),
      db.users.length > 0 ? supabase.from("users").upsert(db.users, { onConflict: "id" }) : Promise.resolve(),
      db.quizzes.length > 0 ? supabase.from("quizzes").upsert(db.quizzes.map(q => ({ id: q.id, title: q.title, subject: q.subject, description: q.description, semester: q.semester, timeLimit: q.timeLimit, status: q.status, createdAt: q.createdAt })), { onConflict: "id" }) : Promise.resolve(),
      db.questions.length > 0 ? supabase.from("questions").upsert(db.questions.map(q => ({ id: q.id, quizId: q.quizId, text: q.text, options: q.options, correctAnswer: q.correctAnswer })), { onConflict: "id" }) : Promise.resolve(),
      db.assignments.length > 0 ? supabase.from("assignments").upsert(db.assignments.map(a => ({ id: a.id, quizId: a.quizId, studentId: a.studentId, dueDate: a.dueDate, assignedAt: a.assignedAt, completedAt: a.completedAt })), { onConflict: "id" }) : Promise.resolve(),
      db.attempts.length > 0 ? supabase.from("attempts").upsert(db.attempts.map(at => ({ id: at.id, quizId: at.quizId, studentId: at.studentId, score: at.score, total: at.total, passed: at.passed, answers: at.answers, createdAt: at.createdAt })), { onConflict: "id" }) : Promise.resolve()
    ]).catch(err => {
      console.warn("Background auto-mirror to Supabase encountered a network issue:", err.message || err);
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Endpoints
  // Load database state
  const db = loadDB();

  // --- Supabase Sync API Endpoints ---
  app.get("/api/supabase/status", async (req, res) => {
    const isConfigured = !!supabaseUrl && !!supabaseAnonKey;
    const maskedUrl = supabaseUrl ? `${supabaseUrl.substring(0, 15)}...supabase.co` : "";
    
    if (!isConfigured || !supabase) {
      return res.json({
        configured: false,
        status: "DISCONNECTED",
        message: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are missing in project settings.",
        stats: null,
        mirrorActive: false,
        serviceRoleKeyConfigured: !!supabaseServiceKey
      });
    }

    try {
      const stats: Record<string, { count: number; status: string; error?: string }> = {};
      const tables = ["users", "quizzes", "questions", "assignments", "attempts", "settings"];
      
      let tablesMissing = false;
      let connectionError = false;
      let errorMessage = "";

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          
          if (error) {
            if (error.code === "PGRST116" || error.message.includes("relation") || error.message.includes("does not exist")) {
              stats[table] = { count: 0, status: "MISSING_TABLE" };
              tablesMissing = true;
            } else {
              stats[table] = { count: 0, status: "ERROR", error: error.message };
              connectionError = true;
              errorMessage = error.message;
            }
          } else {
            stats[table] = { count: count || 0, status: "OK" };
          }
        } catch (err: any) {
          stats[table] = { count: 0, status: "ERROR", error: err.message || err };
          connectionError = true;
          errorMessage = err.message || err;
        }
      }

      let syncStatus = "CONNECTED";
      let statusDetails = "Supabase cloud connectivity active and online.";
      if (tablesMissing) {
        syncStatus = "SCHEMA_NEEDED";
        statusDetails = "Connected, but tables are missing. Please execute the SQL initialization script in your Supabase SQL Editor.";
      } else if (connectionError) {
        syncStatus = "ERROR";
        statusDetails = `Connection challenge: ${errorMessage}`;
      }

      res.json({
        configured: true,
        status: syncStatus,
        url: maskedUrl,
        message: statusDetails,
        stats,
        mirrorActive: !!db.settings?.mirrorToSupabase,
        serviceRoleKeyConfigured: !!supabaseServiceKey
      });
    } catch (err: any) {
      res.json({
        configured: true,
        status: "ERROR",
        url: maskedUrl,
        message: `Networking fault: ${err.message || err}`,
        stats: null,
        mirrorActive: !!db.settings?.mirrorToSupabase,
        serviceRoleKeyConfigured: !!supabaseServiceKey
      });
    }
  });

  app.post("/api/supabase/sync", async (req, res) => {
    if (!supabase) {
      return res.status(400).json({ success: false, message: "Supabase is not configured yet. Configure env first." });
    }

    try {
      const results: Record<string, { success: boolean; count: number; error?: string }> = {};
      
      // Sync settings
      const settingsPayload = { 
        id: "global-params", 
        activeSemester: db.settings.activeSemester,
        leaderboardVisible: db.settings.leaderboardVisible,
        siteName: db.settings.siteName,
        logoUrl: db.settings.logoUrl || "🎓",
        mirrorToSupabase: db.settings.mirrorToSupabase
      };
      const { error: setErr } = await supabase.from("settings").upsert([settingsPayload], { onConflict: "id" });
      results["settings"] = { success: !setErr, count: 1, error: setErr?.message };

      // Sync users & replicate accounts into Supabase Authentication systems
      let authSyncedCount = 0;
      const authErrorsList: string[] = [];
      if (db.users.length > 0) {
        const { error: uErr } = await supabase.from("users").upsert(db.users, { onConflict: "id" });
        results["users"] = { success: !uErr, count: db.users.length, error: uErr?.message };

        // Attempt authentication system migration for all registered entities
        for (const u of db.users) {
          const syncRes = await syncUserToSupabaseAuth(u);
          if (syncRes.success) {
            authSyncedCount++;
          } else {
            authErrorsList.push(`${u.email}: ${syncRes.error || "failed"}`);
          }
        }
        results["auth_users"] = {
          success: authErrorsList.length === 0 || authSyncedCount > 0,
          count: authSyncedCount,
          error: authErrorsList.length > 0 ? authErrorsList.slice(0, 3).join("; ") : undefined
        };
      } else {
        results["users"] = { success: true, count: 0 };
        results["auth_users"] = { success: true, count: 0 };
      }

      // Sync quizzes
      if (db.quizzes.length > 0) {
        const mappedQuizzes = db.quizzes.map(q => ({
          id: q.id,
          title: q.title,
          subject: q.subject,
          description: q.description,
          semester: q.semester,
          timeLimit: q.timeLimit,
          status: q.status,
          createdAt: q.createdAt
        }));
        const { error: qErr } = await supabase.from("quizzes").upsert(mappedQuizzes, { onConflict: "id" });
        results["quizzes"] = { success: !qErr, count: db.quizzes.length, error: qErr?.message };
      } else {
        results["quizzes"] = { success: true, count: 0 };
      }

      // Sync questions
      if (db.questions.length > 0) {
        const mappedQuestions = db.questions.map(q => ({
          id: q.id,
          quizId: q.quizId,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
        }));
        const { error: qnErr } = await supabase.from("questions").upsert(mappedQuestions, { onConflict: "id" });
        results["questions"] = { success: !qnErr, count: db.questions.length, error: qnErr?.message };
      } else {
        results["questions"] = { success: true, count: 0 };
      }

      // Sync assignments
      if (db.assignments.length > 0) {
        const mappedAssignments = db.assignments.map(a => ({
          id: a.id,
          quizId: a.quizId,
          studentId: a.studentId,
          dueDate: a.dueDate,
          assignedAt: a.assignedAt,
          completedAt: a.completedAt
        }));
        const { error: aErr } = await supabase.from("assignments").upsert(mappedAssignments, { onConflict: "id" });
        results["assignments"] = { success: !aErr, count: db.assignments.length, error: aErr?.message };
      } else {
        results["assignments"] = { success: true, count: 0 };
      }

      // Sync attempts
      if (db.attempts.length > 0) {
        const mappedAttempts = db.attempts.map(at => ({
          id: at.id,
          quizId: at.quizId,
          studentId: at.studentId,
          score: at.score,
          total: at.total,
          passed: at.passed,
          answers: at.answers,
          createdAt: at.createdAt
        }));
        const { error: attErr } = await supabase.from("attempts").upsert(mappedAttempts, { onConflict: "id" });
        results["attempts"] = { success: !attErr, count: db.attempts.length, error: attErr?.message };
      } else {
        results["attempts"] = { success: true, count: 0 };
      }

      const overallSuccess = !Object.values(results).some(r => !r.success);

      res.json({
        success: overallSuccess,
        results,
        message: overallSuccess 
          ? "Successfully migrated and synchronized all tables seamlessly into Supabase Cloud." 
          : "Sync encountered some missing schemas or access restrictions. Please review table errors."
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: `Migration failed: ${err.message || err}`
      });
    }
  });

  app.post("/api/supabase/toggle-mirror", (req, res) => {
    const { enabled } = req.body;
    db.settings.mirrorToSupabase = !!enabled;
    saveDB(db);
    res.json({
      success: true,
      mirrorToSupabase: db.settings.mirrorToSupabase,
      message: db.settings.mirrorToSupabase 
        ? "Live database mirroring enabled. Every local save operation will mirror to your Supabase tables in real-time."
        : "Live mirroring disabled. State variations are now locked exclusively to local disk."
    });
  });

  // Route: Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Simplistic check
    const isMockMatched = (user.id === "u-admin" && password === "admin123") || password === "student123";
    if (!isMockMatched && user.passwordHash !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        streak: user.streak,
        createdAt: user.createdAt,
      },
      token: `mock-jwt-token-for-${user.id}`
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const newUser: User = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      passwordHash: password,
      role: "STUDENT",
      avatar: "",
      createdAt: new Date().toISOString(),
      streak: 0
    };

    db.users.push(newUser);
    saveDB(db);

    // Dynamic sync directly to Supabase Authentication
    if (supabase) {
      syncUserToSupabaseAuth(newUser).catch(err => {
        console.warn("Background auto-sync to Supabase Auth failed during signup:", err.message || err);
      });
    }

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        streak: newUser.streak,
        createdAt: newUser.createdAt
      },
      token: `mock-jwt-token-for-${newUser.id}`
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ message: "No registered account found with that email address" });
    }
    // Simulation: Return matching user password back as indicator of mock Resend notification
    res.json({
      message: `Simulated Password Reset instructions successfully sent to ${email}.`,
      simulation: `Decoded Simulation Key: Your current account password is '${user.passwordHash}'.`
    });
  });

  // Settings Endpoints
  app.get("/api/settings", (req, res) => {
    res.json(db.settings);
  });

  app.post("/api/settings", (req, res) => {
    const { activeSemester, leaderboardVisible, siteName, logoUrl } = req.body;
    if (activeSemester) db.settings.activeSemester = activeSemester;
    if (typeof leaderboardVisible === "boolean") db.settings.leaderboardVisible = leaderboardVisible;
    if (siteName) db.settings.siteName = siteName;
    if (logoUrl) db.settings.logoUrl = logoUrl;
    saveDB(db);
    res.json(db.settings);
  });

  // Student list Management (Admin)
  app.get("/api/students", (req, res) => {
    const students = db.users.filter(u => u.role === "STUDENT").map(s => {
      const studentAttempts = db.attempts.filter(a => a.studentId === s.id);
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        streak: s.streak,
        createdAt: s.createdAt,
        quizzesTakenCount: studentAttempts.length,
      };
    });
    res.json(students);
  });

  app.put("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const student = db.users.find(u => u.id === id && u.role === "STUDENT");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (password) student.passwordHash = password;

    saveDB(db);
    res.json({ success: true, student });
  });

  app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex(u => u.id === id && u.role === "STUDENT");
    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    db.users.splice(index, 1);
    // clean assignments / attempts
    db.assignments = db.assignments.filter(a => a.studentId !== id);
    db.attempts = db.attempts.filter(at => at.studentId !== id);

    saveDB(db);
    res.json({ success: true });
  });

  // Quizzes endpoints
  app.get("/api/quizzes", (req, res) => {
    const quizzesWithCounts = db.quizzes.map(q => {
      const qQuestions = db.questions.filter(qn => qn.quizId === q.id);
      const assignedCount = db.assignments.filter(a => a.quizId === q.id).length;
      return {
        ...q,
        questionCount: qQuestions.length,
        assignedCount,
      };
    });
    res.json(quizzesWithCounts);
  });

  app.get("/api/quizzes/:id", (req, res) => {
    const { id } = req.params;
    const quiz = db.quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const qQuestions = db.questions.filter(qn => qn.quizId === id);
    res.json({
      ...quiz,
      questions: qQuestions
    });
  });

  app.post("/api/quizzes", (req, res) => {
    const { title, subject, description, semester, timeLimit, status, questions } = req.body;
    if (!title || !subject || !semester || !timeLimit) {
      return res.status(400).json({ message: "Title, Subject, Semester, and Time Limit are required" });
    }

    const quizId = "q-" + Math.random().toString(36).substring(2, 9);
    const newQuiz: Quiz = {
      id: quizId,
      title,
      subject,
      description: description || "",
      semester,
      timeLimit: Number(timeLimit),
      status: status || "DRAFT",
      createdAt: new Date().toISOString(),
    };

    db.quizzes.push(newQuiz);

    if (Array.isArray(questions)) {
      questions.forEach((q: any) => {
        db.questions.push({
          id: "qn-" + Math.random().toString(36).substring(2, 9),
          quizId,
          text: q.text,
          options: q.options || [],
          correctAnswer: Number(q.correctAnswer),
        });
      });
    }

    saveDB(db);
    res.status(201).json(newQuiz);
  });

  app.put("/api/quizzes/:id", (req, res) => {
    const { id } = req.params;
    const { title, subject, description, semester, timeLimit, status, questions } = req.body;

    const quizIndex = db.quizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const existingQuiz = db.quizzes[quizIndex];
    db.quizzes[quizIndex] = {
      ...existingQuiz,
      title: title || existingQuiz.title,
      subject: subject || existingQuiz.subject,
      description: description !== undefined ? description : existingQuiz.description,
      semester: semester || existingQuiz.semester,
      timeLimit: timeLimit !== undefined ? Number(timeLimit) : existingQuiz.timeLimit,
      status: status || existingQuiz.status,
    };

    if (Array.isArray(questions)) {
      // Simple override of quiz questions
      db.questions = db.questions.filter(qn => qn.quizId !== id);
      questions.forEach((q: any) => {
        db.questions.push({
          id: q.id || "qn-" + Math.random().toString(36).substring(2, 9),
          quizId: id,
          text: q.text,
          options: q.options || [],
          correctAnswer: Number(q.correctAnswer),
        });
      });
    }

    saveDB(db);
    res.json(db.quizzes[quizIndex]);
  });

  app.delete("/api/quizzes/:id", (req, res) => {
    const { id } = req.params;
    const quizIndex = db.quizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    db.quizzes.splice(quizIndex, 1);
    db.questions = db.questions.filter(qn => qn.quizId !== id);
    db.assignments = db.assignments.filter(a => a.quizId !== id);
    db.attempts = db.attempts.filter(at => at.quizId !== id);

    saveDB(db);
    res.json({ success: true });
  });

  // Reusable Question Bank endpoints
  app.get("/api/questions-bank", (req, res) => {
    res.json(db.questionBank);
  });

  app.post("/api/questions-bank", (req, res) => {
    const { text, subject, options, correctAnswer } = req.body;
    if (!text || !subject || !options || correctAnswer === undefined) {
      return res.status(400).json({ message: "Missing required properties" });
    }
    const newItem: QuestionBankItem = {
      id: "qb-" + Math.random().toString(36).substring(2, 9),
      text,
      subject,
      options,
      correctAnswer: Number(correctAnswer),
    };
    db.questionBank.push(newItem);
    saveDB(db);
    res.status(201).json(newItem);
  });

  app.put("/api/questions-bank/:id", (req, res) => {
    const { id } = req.params;
    const { text, subject, options, correctAnswer } = req.body;
    const item = db.questionBank.find(qb => qb.id === id);
    if (!item) {
      return res.status(404).json({ message: "Bank item not found" });
    }
    if (text) item.text = text;
    if (subject) item.subject = subject;
    if (options) item.options = options;
    if (correctAnswer !== undefined) item.correctAnswer = Number(correctAnswer);

    saveDB(db);
    res.json(item);
  });

  app.delete("/api/questions-bank/:id", (req, res) => {
    const { id } = req.params;
    const index = db.questionBank.findIndex(qb => qb.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Bank item not found" });
    }
    db.questionBank.splice(index, 1);
    saveDB(db);
    res.json({ success: true });
  });

  // Assignments / quiz schedules
  app.get("/api/assignments", (req, res) => {
    const { studentId, quizId } = req.query;
    let list = db.assignments;
    if (studentId) {
      list = list.filter(a => a.studentId === studentId);
    }
    if (quizId) {
      list = list.filter(a => a.quizId === quizId);
    }

    const compiled = list.map(a => {
      const quiz = db.quizzes.find(q => q.id === a.quizId);
      const student = db.users.find(u => u.id === a.studentId);
      const questionCount = db.questions.filter(qn => qn.quizId === a.quizId).length;
      return {
        ...a,
        quizTitle: quiz ? quiz.title : "Deleted Quiz",
        quizSubject: quiz ? quiz.subject : "Unsorted",
        quizSemester: quiz ? quiz.semester : "MIDTERM",
        quizTimeLimit: quiz ? quiz.timeLimit : 0,
        studentName: student ? student.name : "Removed Student",
        questionCount,
      };
    });
    res.json(compiled);
  });

  app.post("/api/assignments", (req, res) => {
    const { quizId, studentIds, dueDate } = req.body;
    if (!quizId || !Array.isArray(studentIds) || !dueDate) {
      return res.status(400).json({ message: "Quiz, Assigned Students list, and Due Date are required" });
    }

    const createdAssignments: Assignment[] = [];
    studentIds.forEach((sId: string) => {
      // Avoid duplicate assignments for the same quiz to the same student in uncompleted states
      const exists = db.assignments.find(a => a.quizId === quizId && a.studentId === sId && !a.completedAt);
      if (!exists) {
        const newAssign: Assignment = {
          id: "a-" + Math.random().toString(36).substring(2, 9),
          quizId,
          studentId: sId,
          dueDate: new Date(dueDate).toISOString(),
          assignedAt: new Date().toISOString(),
        };
        db.assignments.push(newAssign);
        createdAssignments.push(newAssign);
      }
    });

    saveDB(db);
    res.status(201).json(createdAssignments);
  });

  // Quiz Attempt Submissions
  app.post("/api/attempts", (req, res) => {
    const { quizId, studentId, answers } = req.body;
    if (!quizId || !studentId || !answers) {
      return res.status(400).json({ message: "Missing attempt options" });
    }

    const quizQuestions = db.questions.filter(qn => qn.quizId === quizId);
    let score = 0;
    quizQuestions.forEach((q) => {
      const studentAnsIdx = answers[q.id];
      if (studentAnsIdx !== undefined && Number(studentAnsIdx) === q.correctAnswer) {
        score++;
      }
    });

    const total = quizQuestions.length;
    const percent = total > 0 ? (score / total) * 100 : 0;
    const passed = percent >= 60; // 60% passing mark

    const attempt: Attempt = {
      id: "at-" + Math.random().toString(36).substring(2, 9),
      quizId,
      studentId,
      score,
      total,
      passed,
      answers,
      createdAt: new Date().toISOString(),
    };

    db.attempts.push(attempt);

    // Update assignment as completed
    const assocAssignIndex = db.assignments.findIndex(a => a.quizId === quizId && a.studentId === studentId && !a.completedAt);
    if (assocAssignIndex !== -1) {
      db.assignments[assocAssignIndex].completedAt = new Date().toISOString();
    }

    // Increment streak for student if passed
    const student = db.users.find(u => u.id === studentId);
    if (student) {
      if (passed) {
        student.streak += 1;
      } else {
        // Reset streak if we fail
        student.streak = 0;
      }
    }

    saveDB(db);
    res.status(201).json(attempt);
  });

  app.get("/api/attempts", (req, res) => {
    const { studentId, quizId } = req.query;
    let list = db.attempts;
    if (studentId) {
      list = list.filter(at => at.studentId === studentId);
    }
    if (quizId) {
      list = list.filter(at => at.quizId === quizId);
    }

    const compiled = list.map(at => {
      const quiz = db.quizzes.find(q => q.id === at.quizId);
      const student = db.users.find(u => u.id === at.studentId);
      return {
        ...at,
        quizTitle: quiz ? quiz.title : "Archived Quiz",
        quizSubject: quiz ? quiz.subject : "Unsorted",
        quizSemester: quiz ? quiz.semester : "MIDTERM",
        studentName: student ? student.name : "Removed Student",
      };
    });

    // Sort chronologically Newest first
    compiled.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(compiled);
  });

  // Calculate high performance leaderboard!
  app.get("/api/leaderboard", (req, res) => {
    const { semester } = req.query; // Filter by semester or 'All'
    const students = db.users.filter(u => u.role === "STUDENT");

    let entries: LeaderboardEntry[] = students.map(s => {
      // Find attempts
      let sAttempts = db.attempts.filter(at => at.studentId === s.id);
      if (semester && semester !== "ALL") {
        sAttempts = sAttempts.filter(at => {
          const quiz = db.quizzes.find(q => q.id === at.quizId);
          return quiz?.semester === semester;
        });
      }

      const totalScore = sAttempts.reduce((acc, at) => acc + at.score, 0);
      const totalPossible = sAttempts.reduce((acc, at) => acc + at.total, 0);
      const averagePercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

      // Badges:
      // - "Streak Master" if streak >= 5
      // - "Perfect Score" if any score matches total
      // - "Scholar" if quizzes taken >= 3
      const badges: string[] = [];
      if (s.streak >= 5) badges.push("Streak Master 🔥");
      if (sAttempts.some(at => at.score === at.total && at.total > 0)) {
        badges.push("Perfect Score 🎯");
      }
      if (sAttempts.length >= 3) badges.push("Scholar 🧠");
      if (sAttempts.every(at => at.passed) && sAttempts.length > 0) {
        badges.push("Honor Roll 🎖️");
      }

      return {
        studentId: s.id,
        name: s.name,
        avatar: s.avatar,
        totalScore,
        quizzesTaken: sAttempts.length,
        averagePercent,
        badges,
      };
    });

    // Sort by total cumulative score desc, then averagePercent desc, then name asc
    entries.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.averagePercent - a.averagePercent;
    });

    // Attach ranks
    entries = entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    res.json(entries);
  });

  // Leaderboard Management endpoint: Reset scores
  app.post("/api/leaderboard/reset", (req, res) => {
    const { target } = req.body; // 'all' or specific semester
    if (target === "all") {
      db.attempts = [];
      // unassign or reset completedAt tags
      db.assignments.forEach(a => delete a.completedAt);
    } else {
      const qIdsToReset = db.quizzes.filter(q => q.semester === target).map(q => q.id);
      db.attempts = db.attempts.filter(at => !qIdsToReset.includes(at.quizId));
      db.assignments.forEach(a => {
        if (qIdsToReset.includes(a.quizId)) {
          delete a.completedAt;
        }
      });
    }

    // Reset student streaks too
    db.users.forEach(u => {
      if (u.role === "STUDENT") u.streak = 0;
    });

    saveDB(db);
    res.json({ success: true, message: "Leaderboard entries reset successfully" });
  });

  // Student Settings Updates (Profile & settings)
  app.post("/api/users/profile", (req, res) => {
    const { studentId, name, email, password, avatar } = req.body;
    const user = db.users.find(u => u.id === studentId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) {
      const emailExists = db.users.some(u => u.id !== studentId && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }
    if (password) user.passwordHash = password;
    if (avatar !== undefined) user.avatar = avatar;

    saveDB(db);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        streak: user.streak,
        createdAt: user.createdAt
      }
    });
  });

  // Vite routing configurations
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduQuiz server running on http://0.0.0.0:${PORT} in env: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: EduQuiz server startup crashed:", err);
});
