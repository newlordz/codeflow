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

    const coursesCount = await client.query('SELECT COUNT(*) FROM courses');
    if (parseInt(coursesCount.rows[0].count) === 0) {
      console.log('Database has 0 courses. Seeding initial curriculum...');
      const defaultCourses = [
        {
          title: 'Python Mastery',
          description: 'Master Python from fundamentals to advanced concepts. Learn variables, data structures, OOP, file handling, and build real-world projects.',
          language: 'Python', level: 'Beginner', icon: 'terminal',
          duration: '42 lessons · 8 weeks', lessons_count: 5, order_num: 1,
        },
        {
          title: 'Web Development Bootcamp',
          description: 'Build modern, responsive websites from scratch. Learn HTML5, CSS3, JavaScript, and responsive design principles.',
          language: 'JavaScript', level: 'Intermediate', icon: 'language',
          duration: '36 lessons · 7 weeks', lessons_count: 5, order_num: 2,
        },
        {
          title: 'AI & Machine Learning Foundations',
          description: 'Dive into the world of artificial intelligence. Understand neural networks, data modeling, supervised learning, and build practical AI applications.',
          language: 'Python', level: 'Advanced', icon: 'smart_toy',
          duration: '28 lessons · 6 weeks', lessons_count: 5, order_num: 3,
        },
        {
          title: 'React & Modern Frontend',
          description: 'Learn React from the ground up. Master components, hooks, state management, routing, and modern frontend architecture.',
          language: 'JavaScript', level: 'Intermediate', icon: 'code_blocks',
          duration: '32 lessons · 6 weeks', lessons_count: 5, order_num: 4,
        },
        {
          title: 'Data Structures & Algorithms',
          description: 'Master the building blocks of efficient programming. Learn arrays, linked lists, trees, graphs, sorting algorithms, and ace technical interviews.',
          language: 'Multi', level: 'Advanced', icon: 'account_tree',
          duration: '40 lessons · 8 weeks', lessons_count: 5, order_num: 5,
        },
        {
          title: 'SQL & Database Design',
          description: 'Learn to design, query, and optimize databases. Master SQL from basic SELECT statements to complex joins, subqueries, and database indexing.',
          language: 'SQL', level: 'Beginner', icon: 'storage',
          duration: '24 lessons · 5 weeks', lessons_count: 5, order_num: 6,
        },
      ];

      for (const course of defaultCourses) {
        const cRes = await client.query(
          `INSERT INTO courses (title, description, language, level, icon, duration, lessons_count, order_num, enrolled_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [course.title, course.description, course.language, course.level, course.icon, course.duration, course.lessons_count, course.order_num, 142]
        );
        const cId = cRes.rows[0].id;
        await client.query(
          `INSERT INTO lessons (course_id, title, description, content, duration, order_num, xp_reward)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            cId,
            `Introduction to ${course.title}`,
            `Get started with the fundamentals of ${course.title} and explore core syntax and workflows.`,
            `# Welcome to ${course.title}\n\nIn this lesson, you will learn the fundamental principles and structure of ${course.language}.\n\n## Learning Objectives\n- Understand syntax fundamentals\n- Learn key patterns\n- Execute interactive examples in the Code Playground`,
            '15 min',
            1,
            50
          ]
        );
      }
      console.log('Initial curriculum auto-seeded successfully!');
    }

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
