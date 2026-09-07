# 🚀 CodeFlow Academy

> **An elite, interactive, and gamified web platform for learning how to code, battling in real-time programming duels, and mastering software engineering.**

---

## 📖 What is CodeFlow Academy?

**CodeFlow Academy** is a modern coding school and developer platform built to make learning to code fun, visual, and practical. 

Instead of just watching passive videos or reading long textbooks, learners write real code in a built-in browser editor (Monaco Editor, the engine behind VS Code), step through variables visually, battle other coders in live speed duels, receive feedback from an AI mentor, practice mock interviews, and earn verifiable certificates.

---

## 🌟 Key Features Explained Simply

### 1. 🎓 Interactive Courses & Real Code Editor
* **Courses for All Levels**: Python, JavaScript, Algorithms, and PostgreSQL.
* **In-Browser Code Editor**: Uses the same editor as Microsoft Visual Studio Code with syntax highlighting, autocomplete, and error detection.
* **Instant Code Execution**: Run Python scripts, Node.js programs, or live HTML/CSS previews directly in your browser.

### 2. 🧠 FlowAI Mentor & "Roast My Code"
Your personal AI coding tutor, powered by Google Gemini (with an offline fallback so it always works zero-downtime):
* 💡 **Explain Code**: Breaks down any piece of code line by line in plain English.
* 🐞 **Debug & Check**: Finds logic errors, missing syntax, and anti-patterns.
* 🎯 **Smart Hints**: Gives nudges to help you solve problems yourself without spoiling the full answer.
* 🧐 **Deep Code Review**: Gives an in-depth audit with Cleanliness, Safety, and Scalability ratings out of 10.
* ⚡ **Big-O Complexity Auditor**: Calculates exact Time ($O$) and Space bounds for your code.
* 🔥 **Roast My Code**: A fun mode where the AI acts like a sarcastic senior architect roasting bad variable names and messy code—then gives you practical tips to fix it!

### 3. 🔍 Interactive Visual Code Execution (Memory Visualizer)
* **Step-by-Step Debugger**: Walk forwards (`>|`) and backwards (`|<`) through code execution line by line.
* **Live Memory Table**: Watch variables change values in real time.
* **Visual Array Slots**: See array boxes with pointers (`left`, `mid`, `right`, `i`) moving dynamically during searches and sorts.
* **Call Stack Inspector**: See how recursive functions (like Fibonacci) create and pop stack frames.

### 4. 🎯 AI Mock Technical Interviewer (`/interview`)
* Simulates real-world tech interviews at top companies.
* Choose your domain (**Frontend**, **Backend**, **Algorithms**) and level (**Junior**, **Mid**, **Senior FAANG**).
* Chat with Sarah (the AI interviewer) who speaks with realistic audio voice synthesis.
* Code on the live whiteboard and receive an instant **Hiring Evaluation Scorecard** with category ratings and a final verdict (*Strong Hire*, *Hire*, or *Needs Improvement*).

### 5. ⚔️ RPG-Style Branching Skill Tree (`/skill-tree`)
* An interactive visual constellation map connecting topics across Python, JavaScript, Algorithms, and Databases.
* Nodes have RPG states: **Locked** (padlock), **Unlocked** (pulsing glow), and **Mastered** (golden crest).
* Finish prerequisite nodes to unlock **Boss Challenge Trials** and earn massive XP.

### 6. ⚔️ Live Code Battles (`/battles`)
* Jump into fast-paced 1v1 coding duels.
* Battle against AI bots or real learners to see who can solve algorithmic problems with passing test cases first.
* Climb the global **Leaderboard** and earn XP.

### 7. 🤝 Live Collaborative Pair Programming Study Room
* Inside the **Code Playground**, click **Pair Code** to create an instant room code (e.g. `CF-8491`).
* Share the code with a friend or classmate to write, debug, and run code together in real time!

### 8. 🎧 Sensory Web Audio Engine & Focus Studio
* **Mechanical Keyboard Simulator**: Realistic *Thocky Cream*, *Clicky Blue*, or *Cyberpunk* keypress sounds synthesized via native Web Audio API (0ms latency, zero files to download).
* **Focus Audio**: Click the **Headphone** icon in the navigation bar to play synthesized ambient soundscapes (*Lo-Fi Synth*, *Cyberpunk Rain*, or *Alpha Waves*).
* **Pomodoro Timer**: Built-in 25m focus / 5m break timer with circular progress and singing bowl chimes.

### 9. 🌐 Dynamic Public Developer Profile & GitHub Dev Card (`/dev/:username`)
* A public showcase page accessible to anyone without logging in (e.g. `/dev/demo`).
* Shows level, rank badges, streak flames, verified certificates, and skill mastery bars.
* **GitHub README Embed**: Generates a dynamic SVG badge (`/api/public/badge/:username.svg`) that you can copy and paste directly into your GitHub profile!

### 10. 🏆 Verified Certificates & Proof of Skill
* Complete a course track and pass the final quiz with 70%+ to generate an official certificate.
* Each certificate has a unique ID and a public verification link (`/verify/:id`) that employers can inspect.

---

## 📁 Project Architecture & Folder Guide

```text
academy/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CodeEditor.jsx     # Monaco code editor with mechanical audio integration
│   │   │   ├── CodeVisualizer.jsx # Step-by-step memory & call stack debugger
│   │   │   ├── FlowAIMentor.jsx   # Slide-over AI mentor drawer with review & roast modes
│   │   │   ├── FocusStudio.jsx    # Lo-Fi ambient audio generator & Pomodoro timer
│   │   │   ├── Navbar.jsx         # Header navigation with profile, audio, and streak badges
│   │   │   └── Sidebar.jsx        # Navigation sidebar with Skill Tree & Interview links
│   │   ├── pages/              # Main route views
│   │   │   ├── Courses.jsx        # Course catalog
│   │   │   ├── Lesson.jsx         # Interactive lesson viewer with editor and tests
│   │   │   ├── CodePlayground.jsx # Full-featured sandbox with live pair coding & visualizer
│   │   │   ├── CodeBattles.jsx    # 1v1 PvP and bot programming duels
│   │   │   ├── SkillTree.jsx      # RPG constellation skill graph
│   │   │   ├── MockInterview.jsx  # AI technical interview room & scorecard
│   │   │   ├── PublicProfile.jsx  # Public vanity developer card & GitHub badge preview
│   │   │   ├── Certificates.jsx   # Earned credentials
│   │   │   └── Leaderboard.jsx    # Global developer rankings
│   │   └── utils/
│   │       ├── soundEngine.js     # Native Web Audio synthesizer (keyboard & ambient sounds)
│   │       └── challengeRunner.js # In-browser test runner engine
│   └── package.json            # Frontend dependencies
│
├── server/                     # Backend API (Node.js + Express + PostgreSQL)
│   ├── routes/
│   │   ├── ai.js                  # Gemini AI integration + zero-downtime offline tutor
│   │   ├── interview.js           # Mock interview problem generator & scorecard evaluator
│   │   ├── collab.js              # Real-time pair programming room coordinator
│   │   ├── publicProfile.js       # Public vanity profile endpoint & SVG badge generator
│   │   ├── runner.js              # Native code execution runner (Python & Node.js)
│   │   ├── battles.js             # Battle arena challenge bank & matchmaking
│   │   ├── courses.js             # Course catalog & enrollment
│   │   ├── lessons.js             # Lesson contents & progress tracking
│   │   └── auth.js                # JWT user authentication & password hashing
│   ├── curriculum.js           # Default course tracks, lessons, starter code & tests
│   ├── db.js                   # PostgreSQL database connection pool & schema setup
│   ├── index.js                # Main Express server entrypoint
│   └── package.json            # Backend dependencies
│
├── start.bat                   # 1-Click launcher script for Windows
├── stop.bat                    # 1-Click shutdown script for Windows
├── package.json                # Root package manager (runs concurrent dev servers)
└── README.md                   # You are here!
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18** + **Vite** | Blazing fast user interface and component rendering |
| **Styling** | **Tailwind CSS** + **Framer Motion** | Dark glassmorphism theme and smooth animations |
| **Code Editor** | **@monaco-editor/react** | Industry-standard IDE code editing experience |
| **Sound Synthesis** | **Web Audio API** | 100% native synthesizer for mechanical clicks and Lo-Fi |
| **Backend API** | **Node.js** + **Express** | RESTful API server and request routing |
| **Database** | **PostgreSQL** | User accounts, course progress, certificates, and streaks |
| **AI Intelligence**| **Google Gemini API** | Natural language mentoring, code review, and mock interviews |

---

## 🚀 How to Run the Project

### Option 1: The Easiest Way (Windows 1-Click)
1. Simply double-click **`start.bat`** in the project root folder.
2. The launcher will automatically check dependencies, start the backend on port `3001`, start the frontend on port `5173`, and open the website in your default browser.

### Option 2: Command Line (Manual)
1. **Install dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start both backend and frontend together:**
   ```bash
   npm run dev
   ```
3. Open your browser to: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Demo Accounts

You can log in immediately using these pre-seeded demo accounts:

| Role | Email | Password | What You Can Access |
| :--- | :--- | :--- | :--- |
| **Student** | `demo@codeflow.com` | `password123` | Courses, Battles, Playground, Interviews, Skill Tree, Certificates |
| **Admin** | `admin@codeflow.com` | `password123` | Full student platform + Admin analytics, course editor, user management |

---

## 🛑 How to Stop the Servers

* **Windows**: Double-click **`stop.bat`** to instantly shut down both background servers.
* **Terminal**: Press `Ctrl + C` in your command terminal.

---

## 📄 License
This project is open-source and created for educational excellence. Happy coding! 🚀
