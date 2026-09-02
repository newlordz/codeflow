export const defaultCourses = [
  // ==========================================
  // PYTHON TRACK
  // ==========================================
  {
    title: 'Python Foundations: Zero to Code',
    description: 'Start your coding journey with Python. Learn syntax, variables, data structures, conditional logic, and interactive problem solving.',
    language: 'Python', level: 'Beginner', icon: 'terminal',
    duration: '35 lessons · 6 weeks', order_num: 1,
    lessons: [
      { title: 'Welcome to Python & Code Playground', description: 'Understand how Python executes and write your first program.', content: '# Welcome to Python\n\nPython is known for its elegant, readable syntax.\n\n```python\nprint("Hello, World!")\n```', duration: '15 min', xp: 50 },
      { title: 'Variables & Data Types', description: 'Integers, floats, strings, booleans, and dynamic typing.', content: '# Variables & Data Types\n\n```python\nusername = "developer"\nage = 22\nrating = 4.9\nis_active = True\n```', duration: '20 min', xp: 50 },
      { title: 'Control Flow & Logic Branching', description: 'If, elif, else statements and comparison operators.', content: '# Control Flow\n\n```python\nscore = 85\nif score >= 80:\n    print("Great job!")\n```', duration: '20 min', xp: 60 },
      { title: 'Loops & Iterations', description: 'For loops, while loops, range, and sequence iteration.', content: '# Loops\n\n```python\nfor i in range(5):\n    print(f"Step {i}")\n```', duration: '25 min', xp: 60 },
      { title: 'Functions & Scope', description: 'Define functions, pass parameters, and return calculated values.', content: '# Functions\n\n```python\ndef greet(name):\n    return f"Welcome, {name}!"\n```', duration: '25 min', xp: 70 },
    ]
  },
  {
    title: 'Python Mastery: Data Structures & OOP',
    description: 'Master advanced Python paradigms including lists, dictionaries, classes, inheritance, file handling, and real-world automation.',
    language: 'Python', level: 'Intermediate', icon: 'terminal',
    duration: '42 lessons · 8 weeks', order_num: 2,
    lessons: [
      { title: 'Lists, Tuples & Comprehensions', description: 'List comprehensions, slicing, and tuple unpacking.', content: '# List Comprehensions\n\n```python\nsquares = [x**2 for x in range(10) if x % 2 == 0]\n```', duration: '25 min', xp: 60 },
      { title: 'Dictionaries & Set Operations', description: 'Hash maps, key lookups, and set mathematical operations.', content: '# Dictionaries & Sets\n\n```python\nuser = {"name": "Alex", "role": "admin"}\nunique_ids = {1, 2, 3, 3, 4}\n```', duration: '25 min', xp: 60 },
      { title: 'Object-Oriented Programming (OOP)', description: 'Classes, constructors, methods, and encapsulation.', content: '# OOP in Python\n\n```python\nclass Student:\n    def __init__(self, name):\n        self.name = name\n```', duration: '30 min', xp: 70 },
      { title: 'Inheritance & Polymorphism', description: 'Extending base classes and overriding behaviors.', content: '# Inheritance\n\n```python\nclass Admin(Student):\n    pass\n```', duration: '30 min', xp: 70 },
      { title: 'File Handling & JSON Parsing', description: 'Read and write local files safely with context managers.', content: '# File I/O\n\n```python\nwith open("data.json", "r") as f:\n    pass\n```', duration: '30 min', xp: 80 },
    ]
  },
  {
    title: 'AI & Deep Learning Foundations in Python',
    description: 'Build practical machine learning systems. Work with NumPy, Pandas, neural network architectures, and evaluate AI predictive models.',
    language: 'Python', level: 'Advanced', icon: 'smart_toy',
    duration: '28 lessons · 6 weeks', order_num: 3,
    lessons: [
      { title: 'NumPy & Vectorized Matrix Operations', description: 'High-performance multi-dimensional array math.', content: '# NumPy\n\n```python\nimport numpy as np\na = np.array([[1, 2], [3, 4]])\n```', duration: '25 min', xp: 70 },
      { title: 'Pandas for Data Modeling', description: 'DataFrames, data cleaning, and statistical transformations.', content: '# Pandas DataFrames\n\n```python\nimport pandas as pd\n```', duration: '30 min', xp: 70 },
      { title: 'Supervised Learning & Gradient Descent', description: 'Cost functions, loss minimization, and linear regression.', content: '# Gradient Descent\n\nMinimizing model error across training batches.', duration: '35 min', xp: 80 },
      { title: 'Neural Network Architecture', description: 'Layers, activation functions (ReLU, Sigmoid), and backpropagation.', content: '# Neural Networks\n\nFeedforward and backprop equations.', duration: '40 min', xp: 90 },
      { title: 'Production Inference & Model Validation', description: 'Cross-validation, train/test split, and deployment.', content: '# Model Validation\n\nEvaluating accuracy, precision, and recall.', duration: '35 min', xp: 90 },
    ]
  },

  // ==========================================
  // JAVASCRIPT TRACK
  // ==========================================
  {
    title: 'JavaScript Essentials & Web Basics',
    description: 'Learn the language of the web. Master variables, functions, events, and dynamic DOM manipulation from the ground up.',
    language: 'JavaScript', level: 'Beginner', icon: 'language',
    duration: '30 lessons · 5 weeks', order_num: 4,
    lessons: [
      { title: 'Introduction to JavaScript & Variables', description: 'Let, const, data types, and console logging.', content: '# JavaScript Basics\n\n```javascript\nlet score = 100;\nconst appName = "CodeFlow";\n```', duration: '15 min', xp: 50 },
      { title: 'Conditionals & Ternary Operators', description: 'If/else statements and modern ternary syntax.', content: '# Conditionals\n\n```javascript\nconst status = score >= 50 ? "pass" : "retry";\n```', duration: '20 min', xp: 50 },
      { title: 'Functions & Arrow Functions', description: 'Function declarations vs ES6 arrow functions.', content: '# Arrow Functions\n\n```javascript\nconst add = (a, b) => a + b;\n```', duration: '25 min', xp: 60 },
      { title: 'DOM Manipulation & Selectors', description: 'Query elements and alter content dynamically.', content: '# DOM Manipulation\n\n```javascript\nconst el = document.querySelector("#title");\nel.textContent = "Updated!";\n```', duration: '25 min', xp: 60 },
      { title: 'Event Listeners & User Input', description: 'Handle clicks, keyboard input, and form submissions.', content: '# Event Listeners\n\n```javascript\nbutton.addEventListener("click", () => alert("Clicked!"));\n```', duration: '30 min', xp: 70 },
    ]
  },
  {
    title: 'Modern JavaScript ES6+ & React Bootcamp',
    description: 'Build high-performance web applications using modern JavaScript, React components, state management, and API integrations.',
    language: 'JavaScript', level: 'Intermediate', icon: 'code_blocks',
    duration: '36 lessons · 7 weeks', order_num: 5,
    lessons: [
      { title: 'ES6+ Destructuring & Spread Operators', description: 'Modern object and array restructuring patterns.', content: '# ES6+ Patterns\n\n```javascript\nconst { name, ...rest } = user;\n```', duration: '25 min', xp: 60 },
      { title: 'Promises, Async/Await & Fetch', description: 'Consume REST APIs asynchronously without callback hell.', content: '# Async/Await\n\n```javascript\nconst res = await fetch("/api/courses");\nconst data = await res.json();\n```', duration: '30 min', xp: 70 },
      { title: 'React Components & JSX Syntax', description: 'Reusable UI components and functional rendering.', content: '# React Components\n\n```jsx\nexport function Card({ title }) {\n  return <div className="card">{title}</div>;\n}\n```', duration: '30 min', xp: 70 },
      { title: 'React Hooks: useState & useEffect', description: 'Manage local state and trigger side-effects cleanly.', content: '# React Hooks\n\n```jsx\nconst [count, setCount] = useState(0);\n```', duration: '30 min', xp: 80 },
      { title: 'Component Architecture & Routing', description: 'Single Page App navigation with React Router.', content: '# React Router\n\nClient-side navigation without full page reloads.', duration: '35 min', xp: 80 },
    ]
  },
  {
    title: 'Full-Stack Node.js Architecture & Microservices',
    description: 'Design production-grade backends with Node.js, Express, async event loop optimization, WebSockets, and scalable microservices.',
    language: 'JavaScript', level: 'Advanced', icon: 'code_blocks',
    duration: '32 lessons · 6 weeks', order_num: 6,
    lessons: [
      { title: 'Node.js Event Loop & Non-Blocking I/O', description: 'Libuv, task queues, microtasks, and thread pools.', content: '# Node.js Architecture\n\nDeep dive into the single-threaded event loop.', duration: '30 min', xp: 80 },
      { title: 'Production Express & Middleware Pipelines', description: 'Routing, error handling, rate limiting, and CORS.', content: '# Express Middleware\n\n```javascript\napp.use((req, res, next) => { next(); });\n```', duration: '30 min', xp: 80 },
      { title: 'JWT Authentication & Security Best Practices', description: 'Stateless token issuance, refresh tokens, and hashing.', content: '# Secure Auth\n\nProtecting APIs from CSRF, XSS, and injection attacks.', duration: '35 min', xp: 90 },
      { title: 'Real-Time Communication with WebSockets', description: 'Bi-directional live sockets for chat and notifications.', content: '# WebSockets\n\nInstant real-time data streaming.', duration: '35 min', xp: 90 },
      { title: 'Microservices & Containerization', description: 'Decoupling services, Docker containers, and load balancing.', content: '# Microservices\n\nBuilding resilient, distributed service architectures.', duration: '40 min', xp: 100 },
    ]
  },

  // ==========================================
  // TYPESCRIPT TRACK
  // ==========================================
  {
    title: 'TypeScript Basics for JavaScript Devs',
    description: 'Write bug-free code with static types. Master type annotations, interfaces, union types, and compiler configuration.',
    language: 'TypeScript', level: 'Beginner', icon: 'code_blocks',
    duration: '24 lessons · 4 weeks', order_num: 7,
    lessons: [
      { title: 'Why TypeScript & Setup', description: 'Compile-time checking and installing tsc.', content: '# TypeScript Setup\n\n```bash\nnpm install -D typescript\n```', duration: '15 min', xp: 50 },
      { title: 'Primitive Types & Type Inference', description: 'string, number, boolean, any, and unknown.', content: '# Type Annotations\n\n```typescript\nlet username: string = "alex";\n```', duration: '20 min', xp: 50 },
      { title: 'Interfaces & Custom Types', description: 'Define shapes for data objects and contracts.', content: '# Interfaces\n\n```typescript\ninterface User { id: string; name: string; }\n```', duration: '25 min', xp: 60 },
      { title: 'Union & Literal Types', description: 'Combining types and restricting values.', content: '# Union Types\n\n```typescript\ntype Status = "pending" | "approved" | "rejected";\n```', duration: '25 min', xp: 60 },
      { title: 'Typing Functions & Callbacks', description: 'Parameter types, return types, and optional args.', content: '# Typed Functions\n\n```typescript\nfunction sum(a: number, b: number): number { return a + b; }\n```', duration: '25 min', xp: 70 },
    ]
  },
  {
    title: 'Modern React & Next.js with Strict TypeScript',
    description: 'Level up your frontend engineering. Build type-safe React applications and Next.js full-stack systems with end-to-end typing.',
    language: 'TypeScript', level: 'Intermediate', icon: 'code_blocks',
    duration: '32 lessons · 6 weeks', order_num: 8,
    lessons: [
      { title: 'Typing React Props & Component Children', description: 'React.FC, PropsWithChildren, and DOM event types.', content: '# React Props Typing\n\n```typescript\ntype ButtonProps = { label: string; onClick: () => void; };\n```', duration: '25 min', xp: 60 },
      { title: 'Typing Hooks: useState, useRef, useReducer', description: 'Strict typing across component state.', content: '# Typing Hooks\n\n```typescript\nconst [data, setData] = useState<User | null>(null);\n```', duration: '30 min', xp: 70 },
      { title: 'Generic Components in React', description: 'Build reusable table and list components with generics.', content: '# Generic Components\n\n```typescript\nfunction List<T>({ items }: { items: T[] }) { /* ... */ }\n```', duration: '30 min', xp: 70 },
      { title: 'Next.js App Router & Server Actions', description: 'Type-safe server functions and API route handlers.', content: '# Next.js Server Actions\n\nEnd-to-end typed server actions.', duration: '35 min', xp: 80 },
      { title: 'Zod Validation & Runtime Type Safety', description: 'Parse API payloads and guarantee runtime schemas.', content: '# Zod Schemas\n\n```typescript\nimport { z } from "zod";\nconst UserSchema = z.object({ email: z.string().email() });\n```', duration: '35 min', xp: 80 },
    ]
  },
  {
    title: 'Enterprise TypeScript & System Design Patterns',
    description: 'Master advanced type wizardry: conditional types, mapped types, template literal types, and enterprise architectural patterns.',
    language: 'TypeScript', level: 'Advanced', icon: 'code_blocks',
    duration: '35 lessons · 7 weeks', order_num: 9,
    lessons: [
      { title: 'Advanced Generics & Constraints', description: 'Extends constraints, multiple type parameters, and defaults.', content: '# Generics Mastery\n\n```typescript\nfunction merge<T extends object, U extends object>(a: T, b: U): T & U { return { ...a, ...b }; }\n```', duration: '30 min', xp: 80 },
      { title: 'Conditional Types & Infer Keyword', description: 'Pattern matching and extracting nested types.', content: '# Conditional Types\n\n```typescript\ntype ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;\n```', duration: '35 min', xp: 90 },
      { title: 'Mapped Types & Key Remapping', description: 'Transform object types dynamically with keyof.', content: '# Mapped Types\n\n```typescript\ntype Readonly<T> = { readonly [P in keyof T]: T[P] };\n```', duration: '35 min', xp: 90 },
      { title: 'Template Literal Types', description: 'String pattern matching and event name construction.', content: '# Template Literal Types\n\n```typescript\ntype Event = `on${Capitalize<string>}`;\n```', duration: '35 min', xp: 90 },
      { title: 'Architectural Patterns & Monorepos', description: 'Domain-Driven Design, repository pattern, and strict tsconfig.', content: '# Enterprise Architecture\n\nBuilding maintainable multi-package TypeScript workspaces.', duration: '40 min', xp: 100 },
    ]
  },

  // ==========================================
  // SQL & DATABASES TRACK
  // ==========================================
  {
    title: 'SQL Fundamentals & Relational Queries',
    description: 'Learn the fundamentals of database querying. Master SELECT, filtering, sorting, aggregations, and table modifications.',
    language: 'SQL', level: 'Beginner', icon: 'storage',
    duration: '24 lessons · 5 weeks', order_num: 10,
    lessons: [
      { title: 'Relational Database Concepts', description: 'Tables, records, fields, and relational models.', content: '# Relational Concepts\n\nData organized into structured, relational tables.', duration: '15 min', xp: 50 },
      { title: 'SELECT & Column Projection', description: 'Fetch specific columns, aliases, and DISTINCT rows.', content: '# SELECT Query\n\n```sql\nSELECT username, email FROM users;\n```', duration: '20 min', xp: 50 },
      { title: 'Filtering Rows with WHERE', description: 'Comparison operators, AND, OR, NOT, IN, and LIKE.', content: '# WHERE Filters\n\n```sql\nSELECT * FROM courses WHERE level = \'Beginner\';\n```', duration: '25 min', xp: 60 },
      { title: 'Sorting & Limiting Results', description: 'ORDER BY ASC/DESC, LIMIT, and pagination OFFSET.', content: '# ORDER BY\n\n```sql\nSELECT * FROM users ORDER BY xp DESC LIMIT 10;\n```', duration: '20 min', xp: 60 },
      { title: 'Inserting, Updating & Deleting Data', description: 'INSERT INTO, UPDATE SET, and DELETE FROM.', content: '# Data Manipulation (DML)\n\n```sql\nINSERT INTO notes (title, content) VALUES (\'Idea\', \'Note text\');\n```', duration: '25 min', xp: 70 },
    ]
  },
  {
    title: 'Database Design, Normalization & Complex Joins',
    description: 'Design robust relational schemas. Learn table normalization (1NF-3NF), multi-table joins, subqueries, and database indexing.',
    language: 'SQL', level: 'Intermediate', icon: 'storage',
    duration: '28 lessons · 6 weeks', order_num: 11,
    lessons: [
      { title: 'Schema Design & Normalization (1NF - 3NF)', description: 'Eliminate data redundancy and design primary/foreign keys.', content: '# Normalization\n\nDesigning relational schemas without data duplication.', duration: '25 min', xp: 60 },
      { title: 'Multi-Table Joins (INNER, LEFT, FULL)', description: 'Connect rows across interrelated database entities.', content: '# SQL Joins\n\n```sql\nSELECT u.username, c.title\nFROM user_courses uc\nJOIN users u ON uc.user_id = u.id\nJOIN courses c ON uc.course_id = c.id;\n```', duration: '30 min', xp: 70 },
      { title: 'Aggregations & GROUP BY / HAVING', description: 'COUNT, SUM, AVG, and filtering grouped datasets.', content: '# Aggregations\n\n```sql\nSELECT language, COUNT(*) FROM courses GROUP BY language;\n```', duration: '25 min', xp: 70 },
      { title: 'Subqueries & Common Table Expressions (CTEs)', description: 'Nested SELECT queries and WITH clause readability.', content: '# CTEs in SQL\n\n```sql\nWITH top_students AS (\n  SELECT id, xp FROM users WHERE xp > 1000\n)\nSELECT * FROM top_students;\n```', duration: '30 min', xp: 80 },
      { title: 'Transactions & ACID Guarantees', description: 'BEGIN, COMMIT, ROLLBACK, and isolation levels.', content: '# Transactions\n\nEnsuring financial and state consistency across multi-step mutations.', duration: '30 min', xp: 80 },
    ]
  },
  {
    title: 'High-Performance SQL Tuning & Distributed DBs',
    description: 'Optimize queries for millions of rows. Master query execution plans (EXPLAIN), B-Tree & GIN indexes, partitioning, and replication.',
    language: 'SQL', level: 'Advanced', icon: 'storage',
    duration: '30 lessons · 6 weeks', order_num: 12,
    lessons: [
      { title: 'Understanding EXPLAIN ANALYZE', description: 'Analyze sequential scans, index scans, and buffer hits.', content: '# Query Planning\n\n```sql\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = \'test@example.com\';\n```', duration: '30 min', xp: 80 },
      { title: 'Index Strategies: B-Tree, Hash & GIN', description: 'Multi-column composite indexes and partial indexes.', content: '# Indexes\n\n```sql\nCREATE INDEX idx_user_courses ON user_courses(user_id, course_id);\n```', duration: '35 min', xp: 90 },
      { title: 'Table Partitioning by Range & Hash', description: 'Split large multi-million row tables into partitions.', content: '# Partitioning\n\nImproving read and maintenance speeds on gigantic tables.', duration: '35 min', xp: 90 },
      { title: 'Concurrency Control & Row Locking (MVCC)', description: 'Row-level locks, FOR UPDATE, deadlocks, and MVCC.', content: '# Concurrency & Locks\n\nHandling simultaneous write transactions without corrupting balances.', duration: '35 min', xp: 90 },
      { title: 'Read Replicas, Sharding & Distributed SQL', description: 'Scale database architectures horizontally across regions.', content: '# Distributed Databases\n\nHigh availability, replication lag, and distributed consensus.', duration: '40 min', xp: 100 },
    ]
  },

  // ==========================================
  // C++ TRACK
  // ==========================================
  {
    title: 'C++ Fundamentals & Modern Systems Syntax',
    description: 'Dive into compiled systems programming. Master C++ syntax, memory layout, pointers, references, and the standard library.',
    language: 'C++', level: 'Beginner', icon: 'code_blocks',
    duration: '32 lessons · 6 weeks', order_num: 13,
    lessons: [
      { title: 'C++ Compilers & "Hello World"', description: 'GCC/Clang setup, header files, and compiling code.', content: '# C++ Setup\n\n```cpp\n#include <iostream>\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}\n```', duration: '20 min', xp: 50 },
      { title: 'Variables, Types & Namespaces', description: 'Integral types, floating point, auto keyword, and std.', content: '# Variables in C++\n\nExplicit typing and modern type inference.', duration: '20 min', xp: 50 },
      { title: 'Pointers & Memory Addresses', description: 'Demystify pointer dereferencing, addresses, and nullptr.', content: '# Pointers\n\n```cpp\nint value = 42;\nint* ptr = &value;\nstd::cout << *ptr << std::endl;\n```', duration: '30 min', xp: 60 },
      { title: 'References & Pass-by-Reference', description: 'Safe aliasing and avoiding expensive copies in functions.', content: '# References\n\n```cpp\nvoid increment(int& num) { num++; }\n```', duration: '25 min', xp: 60 },
      { title: 'Arrays & std::vector Basics', description: 'Fixed size C-style arrays vs dynamic std::vector.', content: '# Vectors\n\n```cpp\n#include <vector>\nstd::vector<int> numbers = {1, 2, 3};\n```', duration: '25 min', xp: 70 },
    ]
  },
  {
    title: 'Data Structures & Algorithms in Modern C++',
    description: 'Implement high-performance data structures in C++. Master STL containers, custom dynamic memory management, and graph algorithms.',
    language: 'C++', level: 'Intermediate', icon: 'account_tree',
    duration: '40 lessons · 8 weeks', order_num: 14,
    lessons: [
      { title: 'STL Containers: Vector, List, Map & Set', description: 'Internal complexity tradeoffs of STL collections.', content: '# STL Containers\n\nO(1) vector access vs O(log n) std::map lookups.', duration: '30 min', xp: 70 },
      { title: 'Dynamic Memory & RAII Principles', description: 'New, delete, constructors, destructors, and RAII.', content: '# RAII\n\nResource Acquisition Is Initialization: automatic resource cleanup.', duration: '30 min', xp: 70 },
      { title: 'Custom Linked Lists & Binary Search Trees', description: 'Build pointer-based nodes and tree balancing.', content: '# BST in C++\n\nCustom node structures and pointer manipulation.', duration: '35 min', xp: 80 },
      { title: 'Sorting Algorithms & Custom Comparators', description: 'std::sort, QuickSort, MergeSort, and lambda comparators.', content: '# Sorting\n\n```cpp\nstd::sort(vec.begin(), vec.end(), [](int a, int b) { return a > b; });\n```', duration: '30 min', xp: 80 },
      { title: 'Graph Traversal: BFS & DFS in C++', description: 'Adjacency lists, shortest paths, and Dijkstra’s algorithm.', content: '# Graph Algorithms\n\nPriority queues and minimum spanning trees.', duration: '40 min', xp: 90 },
    ]
  },
  {
    title: 'High-Performance & Concurrent Systems in C++',
    description: 'Write mission-critical low-latency C++. Learn smart pointers, move semantics, multithreading, atomic operations, and cache locality.',
    language: 'C++', level: 'Advanced', icon: 'account_tree',
    duration: '36 lessons · 7 weeks', order_num: 15,
    lessons: [
      { title: 'Smart Pointers (unique_ptr & shared_ptr)', description: 'Modern memory management without leaks or double-frees.', content: '# Smart Pointers\n\n```cpp\nauto ptr = std::make_unique<Data>();\n```', duration: '30 min', xp: 80 },
      { title: 'Move Semantics & R-Value References', description: 'std::move, move constructors, and zero-copy transfers.', content: '# Move Semantics\n\nTransferring resource ownership without data copying.', duration: '35 min', xp: 90 },
      { title: 'Multithreading with std::thread & Mutexes', description: 'Thread creation, joins, mutex locks, and condition variables.', content: '# Concurrency\n\n```cpp\n#include <thread>\n#include <mutex>\nstd::mutex mtx;\n```', duration: '35 min', xp: 90 },
      { title: 'Lock-Free Programming & std::atomic', description: 'Memory ordering, compare-and-swap (CAS), and atomic operations.', content: '# Lock-Free Systems\n\nUltra-low latency data exchange between CPU cores.', duration: '40 min', xp: 100 },
      { title: 'Cache Locality, SIMD & Performance Profiling', description: 'CPU cache line optimization, vectorization, and profilers.', content: '# Hardware Alignment\n\nMaximizing CPU throughput with cache-friendly layouts.', duration: '40 min', xp: 100 },
    ]
  },

  // ==========================================
  // GO (GOLANG) TRACK
  // ==========================================
  {
    title: 'Go Language Fundamentals & Clean Syntax',
    description: 'Learn Google’s language for scalable cloud engineering. Master Go syntax, strong typing, structs, pointers, and interfaces.',
    language: 'Go', level: 'Beginner', icon: 'code_blocks',
    duration: '22 lessons · 4 weeks', order_num: 16,
    lessons: [
      { title: 'Go Philosophy & "Hello World"', description: 'The Go compiler, formatting with gofmt, and packages.', content: '# Welcome to Go\n\n```go\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, Go!")\n}\n```', duration: '15 min', xp: 50 },
      { title: 'Variables, Constants & Multiple Returns', description: 'Short declaration operator (:=) and error patterns.', content: '# Variables in Go\n\n```go\ncount := 42\nname := "CodeFlow"\n```', duration: '20 min', xp: 50 },
      { title: 'Control Flow: If, For & Switch', description: 'The single loop keyword (for) and expressive switch statements.', content: '# Control Flow\n\nIn Go, all loops are written with `for`.', duration: '20 min', xp: 60 },
      { title: 'Structs, Methods & Pointers', description: 'Define custom data structures and attach receiver methods.', content: '# Structs\n\n```go\ntype User struct {\n    ID   string\n    Name string\n}\n```', duration: '25 min', xp: 60 },
      { title: 'Slices, Maps & Range Loops', description: 'Dynamic slices, make() allocation, and hash maps.', content: '# Slices & Maps\n\n```go\nscores := map[string]int{"Alice": 95}\n```', duration: '25 min', xp: 70 },
    ]
  },
  {
    title: 'Go Microservices & High-Concurrency APIs',
    description: 'Harness the power of Go’s concurrency model. Learn Goroutines, channels, synchronization, and build blazingly fast REST APIs.',
    language: 'Go', level: 'Intermediate', icon: 'code_blocks',
    duration: '30 lessons · 6 weeks', order_num: 17,
    lessons: [
      { title: 'Goroutines & Lightweight Threading', description: 'Launch thousands of concurrent routines with minimal overhead.', content: '# Goroutines\n\n```go\ngo doWork()\n```', duration: '25 min', xp: 70 },
      { title: 'Channels & Channel Synchronization', description: 'Safe communication between threads without mutex locks.', content: '# Channels\n\n```go\nch := make(chan int)\ngo func() { ch <- 42 }()\nval := <-ch\n```', duration: '30 min', xp: 70 },
      { title: 'Select Statements & Context Cancellation', description: 'Multiplex channel events and handle request timeouts.', content: '# Select & Context\n\n`context.WithTimeout` for reliable network calls.', duration: '30 min', xp: 80 },
      { title: 'Interfaces & Clean Polymorphism', description: 'Implicit interface satisfaction and testing mocks.', content: '# Go Interfaces\n\nDuck typing done right with zero inheritance.', duration: '30 min', xp: 80 },
      { title: 'Writing REST APIs with net/http', description: 'Production HTTP server routing, JSON encoding, and middleware.', content: '# HTTP Server\n\n```go\nhttp.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {\n    w.Write([]byte("ok"))\n})\n```', duration: '35 min', xp: 80 },
    ]
  },
  {
    title: 'Distributed Systems & Cloud-Native Go',
    description: 'Architect distributed systems in Go. Master gRPC, protocol buffers, worker pools, distributed tracing, and container deployment.',
    language: 'Go', level: 'Advanced', icon: 'code_blocks',
    duration: '34 lessons · 7 weeks', order_num: 18,
    lessons: [
      { title: 'gRPC & Protocol Buffers in Go', description: 'High-speed binary RPC communication between microservices.', content: '# gRPC in Go\n\nCompiling proto definitions into Go structs and services.', duration: '35 min', xp: 80 },
      { title: 'Worker Pools & Pipeline Concurrency', description: 'Bounded concurrency patterns to prevent memory exhaustion.', content: '# Worker Pools\n\nDistributing workload across a fixed pool of goroutines.', duration: '35 min', xp: 90 },
      { title: 'Distributed Tracing & OpenTelemetry', description: 'Propagate trace IDs across distributed Go services.', content: '# Observability\n\nTracing requests across multi-service topologies.', duration: '35 min', xp: 90 },
      { title: 'Resilience: Rate Limiting & Circuit Breakers', description: 'Protect downstream services under heavy production load.', content: '# Resilience Patterns\n\nToken bucket rate limiters and circuit breakers in Go.', duration: '40 min', xp: 90 },
      { title: 'Production Cloud Deployment & Dockerization', description: 'Multi-stage scratch Docker builds creating tiny 15MB binaries.', content: '# Cloud Native Go\n\nCompiling static Go binaries for Kubernetes and Docker.', duration: '40 min', xp: 100 },
    ]
  }
];
