# EduQuiz

EduQuiz is a comprehensive, full-stack educational assessment platform designed to bridge the gap between educators and students. Built with a modern tech stack, this application allows educators to create interactive quizzes, manage student enrollments, and track progress, while providing students with a seamless, engaging interface to take exams and review their performance.

## Key Features

The system is highly modular, split between a powerful **Admin Dashboard** and a streamlined **Student Dashboard**.

### 👩‍🏫 Admin Features (Educators)
- **Roster Management:** View, approve, and manage registered students.
- **Quiz Engine:** Create, edit, and publish timed quiz modules.
- **Question Bank:** Build a reusable repository of questions for easy quiz creation.
- **Grading & Reports:** View automated results, track student success rates, and analyze exam data.
- **Leaderboard Control:** Reset or toggle leaderboards for healthy competition.
- **Supabase Cloud Sync:** Advanced option to sync local database states directly to a remote Supabase PostgreSQL instance, providing backups, live mirroring, and database migrations.

### 🎓 Student Features
- **Assignment Dashboard:** View active assignments, pending tasks, and completed exams.
- **Exam Interface:** Clean, timed interface for taking active quizzes without distractions.
- **Performance Logs:** Track personal grades, attempt history, and feedback.
- **Class Leaderboard:** Check rankings based on assessment scores to see how you stack up against classmates.

## How It Works (The Process)

1. **Authentication:** 
   - New students can sign up and are placed in a 'Pending' state until approved by an administrator.
   - The primary educator logs in using the root admin credentials (`admin@eduquiz.com`).

2. **Quiz Creation:**
   - The admin first populates the **Question Bank** with relevant questions.
   - The admin then creates a new **Quiz**, pulling questions from the bank setting parameters like time limits and target semester.

3. **Taking Quizzes:**
   - Enrolled, approved students can log in and see their assigned quizzes.
   - During the quiz, they select answers and submit before the timer runs out. 
   - The system automatically grades the quiz in real-time.

4. **Data Management:**
   - By default, the system stores all data in a local JSON file (`database.json`), ensuring fast read/writes during standard operations.
   - The admin can open the **Supabase Sync** panel to safely deploy SQL schemas, migrate all local student and quiz data, and toggle live-mirroring to a remote PostgreSQL database.

## Technologies Used

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Express, Node.js, TypeScript
- **Database Architecture:** Local JSON Storage (Default) with optional live remote-sync to **Supabase (PostgreSQL)**
- **Icons & UI Details:** Lucide-React, CSS-based micro-animations

