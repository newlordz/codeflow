import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);

const poolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:botsio212nyc@localhost:5432/codeflow',
};

if (process.env.DATABASE_URL && (isProduction || process.env.DATABASE_URL.includes('railway') || process.env.DATABASE_URL.includes('rlwy.net'))) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar TEXT DEFAULT NULL,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_active DATE DEFAULT NULL,
        theme VARCHAR(10) DEFAULT 'dark',
        xp INTEGER DEFAULT 0,
        bio TEXT DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        language VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        icon VARCHAR(100) DEFAULT 'terminal',
        thumbnail TEXT DEFAULT NULL,
        duration VARCHAR(100) DEFAULT NULL,
        enrolled_count INTEGER DEFAULT 0,
        lessons_count INTEGER DEFAULT 0,
        order_num INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        content TEXT NOT NULL,
        video_url TEXT DEFAULT NULL,
        transcript TEXT DEFAULT '',
        order_num INTEGER DEFAULT 0,
        duration VARCHAR(50) DEFAULT '10 min',
        type VARCHAR(50) DEFAULT 'lesson'
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER DEFAULT NULL,
        completed_at TIMESTAMPTZ DEFAULT NULL,
        UNIQUE(user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS user_courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMPTZ DEFAULT NOW(),
        progress REAL DEFAULT 0,
        UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        difficulty VARCHAR(50) NOT NULL,
        questions JSONB NOT NULL DEFAULT '[]',
        time_limit INTEGER DEFAULT 600,
        passing_score INTEGER DEFAULT 70
      );

      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        score INTEGER NOT NULL DEFAULT 0,
        passed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        answers JSONB DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        issued_at TIMESTAMPTZ DEFAULT NOW(),
        certificate_url TEXT DEFAULT NULL,
        score INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        link VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        response TEXT DEFAULT NULL,
        answered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        email VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS streak_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
      );

      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS headline VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(255) DEFAULT '';
    `);

    const defaultPassword = await bcrypt.hash('password123', 10);

    const demoCheck = await client.query('SELECT id FROM users WHERE email = $1', ['demo@codeflow.com']);
    if (demoCheck.rows.length === 0) {
      console.log('Seeding demo student account (demo@codeflow.com)...');
      await client.query(
        `INSERT INTO users (username, full_name, email, password, role, streak, longest_streak, xp, bio, headline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'demostudent',
          'Demo Learner',
          'demo@codeflow.com',
          defaultPassword,
          'student',
          7,
          10,
          1450,
          'Aspiring full-stack engineer and programming enthusiast exploring CodeFlow.',
          'Full-Stack Developer Learner'
        ]
      );
    } else {
      await client.query('UPDATE users SET password = $1 WHERE email = $2', [defaultPassword, 'demo@codeflow.com']);
    }

    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['admin@codeflow.com']);
    if (adminCheck.rows.length === 0) {
      console.log('Seeding administrator account (admin@codeflow.com)...');
      await client.query(
        `INSERT INTO users (username, full_name, email, password, role, streak, longest_streak, xp, bio, headline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'admin',
          'Platform Administrator',
          'admin@codeflow.com',
          defaultPassword,
          'admin',
          15,
          20,
          3500,
          'Lead administrator and curriculum director at CodeFlow Academy.',
          'Platform Administrator'
        ]
      );
    } else {
      await client.query("UPDATE users SET role = 'admin' WHERE email = 'admin@codeflow.com'");
    }

    const defaultCourses = [
      {
        title: 'Python Mastery',
        description: 'Master Python from fundamentals to advanced concepts. Learn variables, data structures, OOP, file handling, and build real-world projects.',
        language: 'Python', level: 'Beginner', icon: 'terminal',
        duration: '42 lessons · 8 weeks', lessons_count: 6, order_num: 1,
        lessons: [
          { title: 'Welcome to Python', description: 'Introduction to Python and why it is the most popular language.', content: '# Welcome to Python\n\nPython is a high-level, interpreted programming language known for its clean, readable syntax.\n\n## First Program\n```python\nprint("Hello, CodeFlow!")\n```\n\nRun this in the Code Playground to test execution!', duration: '15 min', xp: 50 },
          { title: 'Variables & Data Types', description: 'Learn numbers, strings, booleans, and type conversion.', content: '# Variables & Data Types\n\nVariables store data in memory without manual memory management.\n\n```python\nname = "Alice"\nage = 24\nheight = 5.9\nis_student = True\n\nprint(f"{name} is {age} years old.")\n```', duration: '20 min', xp: 60 },
          { title: 'Control Flow (If/Else)', description: 'Master conditionals, logical operators, and branching.', content: '# Control Flow\n\nControl which code executes based on true/false conditions.\n\n```python\nscore = 88\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelse:\n    print("Keep practicing!")\n```', duration: '20 min', xp: 60 },
          { title: 'Loops & Iterations', description: 'Repeat operations with for and while loops.', content: '# Loops & Iterations\n\n```python\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(f"I love {fruit}!")\n```', duration: '25 min', xp: 70 },
          { title: 'Functions & Scope', description: 'Write reusable, modular code with parameters and return values.', content: '# Functions & Scope\n\n```python\ndef calculate_area(width, height):\n    """Calculates rectangular area"""\n    return width * height\n\nprint(calculate_area(5, 10))\n```', duration: '25 min', xp: 70 },
          { title: 'Object-Oriented Programming', description: 'Classes, objects, methods, and inheritance in Python.', content: '# Object-Oriented Programming (OOP)\n\n```python\nclass Developer:\n    def __init__(self, name, language):\n        self.name = name\n        self.language = language\n\n    def code(self):\n        return f"{self.name} is writing {self.language}!"\n\ndev = Developer("Enoch", "Python")\nprint(dev.code())\n```', duration: '30 min', xp: 80 },
        ]
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Build modern, responsive websites from scratch. Learn HTML5, CSS3, JavaScript, and responsive design principles.',
        language: 'JavaScript', level: 'Intermediate', icon: 'language',
        duration: '36 lessons · 7 weeks', lessons_count: 5, order_num: 2,
        lessons: [
          { title: 'Modern HTML5 & Semantic Elements', description: 'Master semantic layout tags, forms, and accessibility.', content: '# Modern HTML5\n\nSemantic markup improves SEO, readability, and accessibility.\n\n```html\n<header>\n  <h1>CodeFlow Academy</h1>\n  <nav><a href="/">Home</a></nav>\n</header>\n<main>\n  <article>\n    <h2>Semantic HTML</h2>\n    <p>Always use semantic elements!</p>\n  </article>\n</main>\n```', duration: '20 min', xp: 50 },
          { title: 'CSS3 Styling & Flexbox', description: 'Layout modern interfaces with flexible box layouts.', content: '# CSS3 Flexbox\n\n```css\n.container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n```', duration: '25 min', xp: 60 },
          { title: 'CSS Grid & Responsive Design', description: 'Two-dimensional grid layouts and mobile media queries.', content: '# CSS Grid & Media Queries\n\n```css\n.grid-layout {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1rem;\n}\n```', duration: '25 min', xp: 60 },
          { title: 'JavaScript DOM Manipulation', description: 'Select elements, listen to events, and update the UI.', content: '# DOM Manipulation\n\n```javascript\nconst btn = document.querySelector("#btn");\nbtn.addEventListener("click", () => {\n  document.body.classList.toggle("dark");\n});\n```', duration: '30 min', xp: 70 },
          { title: 'Modern Async JavaScript & APIs', description: 'Promises, fetch, async/await, and REST APIs.', content: '# Async JavaScript & Fetch API\n\n```javascript\nasync function loadUsers() {\n  const res = await fetch("/api/users");\n  const users = await res.json();\n  console.log(users);\n}\n```', duration: '30 min', xp: 80 },
        ]
      },
      {
        title: 'AI & Machine Learning Foundations',
        description: 'Dive into the world of artificial intelligence. Understand neural networks, data modeling, supervised learning, and build practical AI applications.',
        language: 'Python', level: 'Advanced', icon: 'smart_toy',
        duration: '28 lessons · 6 weeks', lessons_count: 5, order_num: 3,
        lessons: [
          { title: 'Introduction to AI & Machine Learning', description: 'Core concepts: Supervised vs Unsupervised vs Reinforcement learning.', content: '# Intro to AI & Machine Learning\n\nMachine learning is the study of algorithms that improve automatically through experience and data.', duration: '20 min', xp: 50 },
          { title: 'Python for Data Science (NumPy & Pandas)', description: 'Matrix operations and dataframe manipulations.', content: '# NumPy & Pandas\n\n```python\nimport numpy as np\n\ndata = np.array([1, 2, 3, 4, 5])\nprint("Mean:", np.mean(data))\nprint("Std:", np.std(data))\n```', duration: '25 min', xp: 60 },
          { title: 'Supervised Learning & Linear Regression', description: 'Predict continuous numerical outcomes from input features.', content: '# Supervised Learning\n\n```python\n# Linear model: y = mx + b\ndef predict(x, weight, bias):\n    return weight * x + bias\n```', duration: '30 min', xp: 70 },
          { title: 'Neural Networks & Deep Learning', description: 'Neurons, weights, activation functions, and backpropagation.', content: '# Neural Networks Architecture\n\nLayers of artificial neurons process features and learn complex patterns.', duration: '35 min', xp: 80 },
          { title: 'Evaluating Models & Avoiding Overfitting', description: 'Precision, recall, train/test split, and regularization.', content: '# Model Evaluation\n\nAlways evaluate model accuracy on an unseen validation dataset to prevent overfitting.', duration: '30 min', xp: 80 },
        ]
      },
      {
        title: 'React & Modern Frontend',
        description: 'Learn React from the ground up. Master components, hooks, state management, routing, and modern frontend architecture.',
        language: 'JavaScript', level: 'Intermediate', icon: 'code_blocks',
        duration: '32 lessons · 6 weeks', lessons_count: 5, order_num: 4,
        lessons: [
          { title: 'React Fundamentals & JSX Syntax', description: 'Declarative component architecture and JSX.', content: '# React Fundamentals\n\n```jsx\nexport function Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n```', duration: '20 min', xp: 50 },
          { title: 'Component State with useState', description: 'Track dynamic values and trigger UI re-renders.', content: '# useState Hook\n\n```jsx\nconst [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n```', duration: '25 min', xp: 60 },
          { title: 'Side Effects with useEffect', description: 'Data fetching, subscriptions, and DOM side effects.', content: '# useEffect Hook\n\n```jsx\nuseEffect(() => {\n  document.title = `Clicked ${count} times`;\n}, [count]);\n```', duration: '25 min', xp: 60 },
          { title: 'Client-side Routing with React Router', description: 'Build lightning-fast single page web applications.', content: '# React Router\n\n```jsx\n<Routes>\n  <Route path="/" element={<Home />} />\n  <Route path="/courses" element={<Courses />} />\n</Routes>\n```', duration: '30 min', xp: 70 },
          { title: 'Building Custom Hooks', description: 'Extract reusable component logic into custom hooks.', content: '# Custom Hooks\n\n```jsx\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  // Listen to resize\n  return width;\n}\n```', duration: '30 min', xp: 80 },
        ]
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Master the building blocks of efficient programming. Learn arrays, linked lists, trees, graphs, sorting algorithms, and ace technical interviews.',
        language: 'Multi', level: 'Advanced', icon: 'account_tree',
        duration: '40 lessons · 8 weeks', lessons_count: 5, order_num: 5,
        lessons: [
          { title: 'Big-O Notation & Complexity Analysis', description: 'Time and space complexity of computer algorithms.', content: '# Big-O Notation\n\n- O(1): Constant time\n- O(log n): Binary search\n- O(n): Linear scan\n- O(n log n): Efficient sorting\n- O(n^2): Nested loops', duration: '20 min', xp: 50 },
          { title: 'Arrays & Dynamic Arrays', description: 'Contiguous memory, indexing, and amortized insertion.', content: '# Arrays & Vectors\n\nFast O(1) random index access with O(n) insertions and deletions.', duration: '25 min', xp: 60 },
          { title: 'Linked Lists & Stacks', description: 'Node-based structures, pointer manipulation, and LIFO ordering.', content: '# Stacks (LIFO)\n\n```python\nstack = []\nstack.append(1) # Push\ntop = stack.pop() # Pop\n```', duration: '25 min', xp: 60 },
          { title: 'Binary Search Trees & Traversal', description: 'Hierarchical data structures, DFS, and BFS search.', content: '# Binary Search Trees\n\nIn-order traversal of a BST yields elements in sorted order.', duration: '30 min', xp: 70 },
          { title: 'Dynamic Programming & Memoization', description: 'Break complex problems into overlapping subproblems.', content: '# Dynamic Programming\n\n```python\n# Fibonacci with memoization\ndef fib(n, memo={}):\n    if n <= 1: return n\n    if n not in memo:\n        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)\n    return memo[n]\n```', duration: '35 min', xp: 80 },
        ]
      },
      {
        title: 'SQL & Database Design',
        description: 'Learn to design, query, and optimize databases. Master SQL from basic SELECT statements to complex joins, subqueries, and database indexing.',
        language: 'SQL', level: 'Beginner', icon: 'storage',
        duration: '24 lessons · 5 weeks', lessons_count: 5, order_num: 6,
        lessons: [
          { title: 'Relational Database Fundamentals', description: 'Tables, rows, columns, primary keys, and foreign keys.', content: '# Relational Databases\n\nDatabases organize information into tables with strictly typed schemas and relations.', duration: '20 min', xp: 50 },
          { title: 'SELECT Queries, Filtering & Ordering', description: 'SELECT, WHERE, LIKE, IN, and ORDER BY clauses.', content: '# SQL SELECT\n\n```sql\nSELECT title, duration \nFROM courses \nWHERE level = \'Beginner\' \nORDER BY order_num ASC;\n```', duration: '25 min', xp: 60 },
          { title: 'SQL Joins (INNER, LEFT, RIGHT)', description: 'Combine data across multiple related tables.', content: '# SQL Joins\n\n```sql\nSELECT u.username, c.title\nFROM user_courses uc\nJOIN users u ON uc.user_id = u.id\nJOIN courses c ON uc.course_id = c.id;\n```', duration: '30 min', xp: 70 },
          { title: 'Aggregations & GROUP BY', description: 'COUNT, SUM, AVG, MAX, MIN, and HAVING filters.', content: '# Aggregations\n\n```sql\nSELECT language, COUNT(*) as course_count\nFROM courses\nGROUP BY language\nHAVING COUNT(*) > 0;\n```', duration: '25 min', xp: 60 },
          { title: 'Indexes & Query Optimization', description: 'B-Tree indexes, execution plans, and performance tuning.', content: '# Indexes & Performance\n\n```sql\nCREATE INDEX idx_courses_level ON courses(level);\nEXPLAIN ANALYZE SELECT * FROM courses WHERE level = \'Beginner\';\n```', duration: '30 min', xp: 80 },
        ]
      },
    ];

    for (const course of defaultCourses) {
      const existing = await client.query('SELECT id FROM courses WHERE title = $1', [course.title]);
      let cId;
      if (existing.rows.length === 0) {
        const cRes = await client.query(
          `INSERT INTO courses (title, description, language, level, icon, duration, lessons_count, order_num, enrolled_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [course.title, course.description, course.language, course.level, course.icon, course.duration, course.lessons.length, course.order_num, 142]
        );
        cId = cRes.rows[0].id;
      } else {
        cId = existing.rows[0].id;
      }

      // Check lessons count for this course
      const lCount = await client.query('SELECT COUNT(*) FROM lessons WHERE course_id = $1', [cId]);
      if (parseInt(lCount.rows[0].count) < course.lessons.length) {
        for (let i = 0; i < course.lessons.length; i++) {
          const l = course.lessons[i];
          const lCheck = await client.query('SELECT id FROM lessons WHERE course_id = $1 AND title = $2', [cId, l.title]);
          if (lCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO lessons (course_id, title, description, content, duration, order_num, xp_reward)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [cId, l.title, l.description, l.content, l.duration, i + 1, l.xp]
            );
          }
        }
      }
    }
    console.log('All 6 courses and multi-lesson curriculum verified and synchronized!');

    const demoUser = await client.query('SELECT id FROM users WHERE email = $1', ['demo@codeflow.com']);
    if (demoUser.rows.length > 0) {
      const demoId = demoUser.rows[0].id;
      const firstCourses = await client.query('SELECT id FROM courses ORDER BY order_num ASC LIMIT 2');
      for (const c of firstCourses.rows) {
        const enCheck = await client.query('SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2', [demoId, c.id]);
        if (enCheck.rows.length === 0) {
          await client.query('INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)', [demoId, c.id]);
        }
      }
    }

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
