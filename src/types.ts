export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  avatar: string;
  streak: number;
  createdAt: string;
  isGuest?: boolean;
  isApproved?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  semester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  timeLimit: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  questionCount?: number;
  assignedCount?: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuestionBankItem {
  id: string;
  text: string;
  subject: string;
  options: string[];
  correctAnswer: number;
}

export interface Assignment {
  id: string;
  quizId: string;
  studentId: string;
  dueDate: string;
  assignedAt: string;
  completedAt?: string;
  quizTitle: string;
  quizSubject: string;
  quizSemester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  quizTimeLimit: number;
  studentName: string;
  questionCount: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  total: number;
  passed: boolean;
  answers: Record<string, number>;
  createdAt: string;
  quizTitle: string;
  quizSubject: string;
  quizSemester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  studentName: string;
}

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatar: string;
  totalScore: number;
  quizzesTaken: number;
  averagePercent: number;
  badges: string[];
  rank: number;
}

export interface Settings {
  activeSemester: "PRELIM" | "MIDTERM" | "PREFINALS" | "FINALS";
  leaderboardVisible: boolean;
  siteName: string;
  logoUrl?: string;
  mirrorToSupabase?: boolean;
}

export interface StudentQuestionSubmission {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  subject: string;
  options: string[];
  correctAnswer: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminFeedback?: string;
}

