import pg from 'pg';
import bcrypt from 'bcryptjs';
import { initializeDatabase } from './db.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:botsio212nyc@localhost:5432/codeflow',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    await initializeDatabase();

    await client.query('DELETE FROM certificates');
    await client.query('DELETE FROM quiz_attempts');
    await client.query('DELETE FROM notes');
    await client.query('DELETE FROM questions');
    await client.query('DELETE FROM user_progress');
    await client.query('DELETE FROM user_courses');
    await client.query('DELETE FROM quizzes');
    await client.query('DELETE FROM lessons');
    await client.query('DELETE FROM streak_history');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM activities');
    await client.query('DELETE FROM courses');
    await client.query('DELETE FROM users');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminResult = await client.query(
      `INSERT INTO users (username, email, password, streak, longest_streak, xp) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['admin', 'admin@codeflow.com', hashedPassword, 12, 15, 2500]
    );
    const adminId = adminResult.rows[0].id;

    const demoResult = await client.query(
      `INSERT INTO users (username, email, password, streak, longest_streak, xp, bio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['demo', 'demo@codeflow.com', hashedPassword, 7, 10, 1200, 'Aspiring full-stack developer passionate about learning new technologies.']
    );
    const demoId = demoResult.rows[0].id;

    console.log('Created users');

    // Courses
    const courses = [
      {
        title: 'Python Mastery',
        description: 'Master Python from fundamentals to advanced concepts. Learn variables, data structures, OOP, file handling, and build real-world projects. Perfect for complete beginners who want to start their programming journey.',
        language: 'Python', level: 'Beginner', icon: 'terminal',
        duration: '42 lessons · 8 weeks', lessons_count: 42, order_num: 1,
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Build modern, responsive websites from scratch. Learn HTML5, CSS3, JavaScript, and responsive design principles. Create professional portfolio projects that will impress employers.',
        language: 'JavaScript', level: 'Intermediate', icon: 'language',
        duration: '36 lessons · 7 weeks', lessons_count: 36, order_num: 2,
      },
      {
        title: 'AI & Machine Learning Foundations',
        description: 'Dive into the world of artificial intelligence. Understand neural networks, data modeling, supervised and unsupervised learning, and build practical AI applications using Python.',
        language: 'Python', level: 'Advanced', icon: 'smart_toy',
        duration: '28 lessons · 6 weeks', lessons_count: 28, order_num: 3,
      },
      {
        title: 'React & Modern Frontend',
        description: 'Learn React from the ground up. Master components, hooks, state management, routing, and modern frontend architecture. Build single-page applications that scale.',
        language: 'JavaScript', level: 'Intermediate', icon: 'code_blocks',
        duration: '32 lessons · 6 weeks', lessons_count: 32, order_num: 4,
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Master the building blocks of efficient programming. Learn arrays, linked lists, trees, graphs, sorting algorithms, dynamic programming, and ace technical interviews.',
        language: 'Multi', level: 'Advanced', icon: 'account_tree',
        duration: '40 lessons · 8 weeks', lessons_count: 40, order_num: 5,
      },
      {
        title: 'SQL & Database Design',
        description: 'Learn to design, query, and optimize databases. Master SQL from basic SELECT statements to complex joins, subqueries, indexing, and database normalization.',
        language: 'SQL', level: 'Beginner', icon: 'storage',
        duration: '24 lessons · 5 weeks', lessons_count: 24, order_num: 6,
      },
    ];

    const courseIds = [];
    for (const course of courses) {
      const result = await client.query(
        `INSERT INTO courses (title, description, language, level, icon, duration, lessons_count, order_num, enrolled_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [course.title, course.description, course.language, course.level, course.icon, course.duration, course.lessons_count, course.order_num, Math.floor(Math.random() * 500) + 100]
      );
      courseIds.push(result.rows[0].id);
    }

    console.log('Created courses');

    // Lessons for each course
    const lessonData = {
      0: [
        ['Welcome to Python', 'Introduction to Python, its history, and why it is one of the most popular programming languages today.', `
# Welcome to Python

Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, Python has grown to become one of the most popular programming languages in the world.

## Why Learn Python?

- **Readable Syntax**: Python code reads almost like English, making it easy to learn
- **Versatile**: Used in web development, data science, AI, automation, and more
- **Large Community**: Millions of developers use Python daily
- **Rich Ecosystem**: Thousands of libraries and frameworks available

## Your First Python Program

\`\`\`python
print("Hello, World!")
\`\`\`

## Key Concepts You Will Learn

1. Variables and data types
2. Control flow (if/else, loops)
3. Functions and modules
4. Object-oriented programming
5. File handling
6. Working with libraries

Let us begin this exciting journey into the world of Python programming!
`, 'https://example.com/videos/python-welcome', 'Welcome to this Python course. In this lesson, we will cover what Python is, why it is so popular, and what you can expect to learn throughout this course. Python was created by Guido van Rossum in 1991 and has since become one of the most widely used programming languages. It is known for its clean, readable syntax that makes it perfect for beginners. Python is used in web development with frameworks like Django and Flask, in data science with libraries like Pandas and NumPy, in machine learning with TensorFlow and PyTorch, and in automation and scripting. By the end of this course, you will be able to write Python programs confidently and understand core programming concepts.'],

        ['Variables & Data Types', 'Learn about Python variables, strings, integers, floats, booleans, and how to work with different data types.', `
# Variables & Data Types

In Python, variables are containers for storing data values. Unlike many other languages, Python has no command for declaring a variable - a variable is created the moment you first assign a value to it.

## Variable Assignment

\`\`\`python
name = "Alice"
age = 25
height = 5.8
is_student = True
\`\`\`

## Python Data Types

- **str** (String): Text data - \`"Hello"\`, \`'Python'\`
- **int** (Integer): Whole numbers - \`42\`, \`-10\`, \`0\`
- **float** (Float): Decimal numbers - \`3.14\`, \`-0.5\`, \`1.0\`
- **bool** (Boolean): True or False - \`True\`, \`False\`
- **NoneType**: Represents no value - \`None\`

## Type Checking

\`\`\`python
print(type(name))     # <class 'str'>
print(type(age))      # <class 'int'>
print(type(height))   # <class 'float'>
\`\`\`

## String Operations

\`\`\`python
first = "Hello"
last = "World"
full = first + " " + last    # Concatenation
print(full.upper())           # HELLO WORLD
print(full.lower())           # hello world
print(len(full))              # 11
\`\`\`

> Practice creating variables of different types and printing them out!
`, '', 'In this lesson we cover variables and data types in Python. Variables are names that refer to values stored in memory. Python is dynamically typed, meaning you do not need to declare the type of a variable - it is inferred at runtime. The main data types are strings for text, integers for whole numbers, floats for decimal numbers, and booleans for true/false values. We also covered string operations like concatenation with the plus operator, and methods like upper and lower for case conversion.'],

        ['Control Flow', 'Master if/elif/else statements, comparison operators, and logical operators to make decisions in your code.', `
# Control Flow

Control flow allows your program to make decisions and execute different code based on conditions.

## Comparison Operators

\`\`\`python
x == y   # Equal to
x != y   # Not equal to
x > y    # Greater than
x < y    # Less than
x >= y   # Greater than or equal
x <= y   # Less than or equal
\`\`\`

## If/Elif/Else

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is {grade}")
\`\`\`

## Logical Operators

\`\`\`python
# and - both conditions must be True
if age >= 18 and has_license:
    print("You can drive")

# or - at least one condition must be True
if is_weekend or is_holiday:
    print("No work today!")

# not - inverts the condition
if not is_banned:
    print("Access granted")
\`\`\`

## Nested Conditions

\`\`\`python
if user.is_authenticated:
    if user.is_admin:
        print("Admin dashboard")
    else:
        print("User dashboard")
else:
    print("Please log in")
\`\`\`
`, '', 'Control flow in Python uses if, elif, and else statements to conditionally execute code. Comparison operators like equals, not equals, greater than, and less than create boolean expressions. Logical operators and, or, and not combine multiple conditions. The and operator requires both conditions to be true, or requires at least one, and not inverts a boolean value. Proper indentation is crucial in Python - each block must be consistently indented.'],

        ['Loops & Iterations', 'Learn for loops, while loops, range(), break, continue, and iterating over sequences.', `
# Loops & Iterations

Loops allow you to execute a block of code repeatedly. Python provides two main types: for loops and while loops.

## For Loops

\`\`\`python
# Iterate over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I like {fruit}")

# Using range()
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop, step)
for i in range(2, 10, 2):
    print(i)  # 2, 4, 6, 8
\`\`\`

## While Loops

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

## Break & Continue

\`\`\`python
# break - exits loop completely
for i in range(10):
    if i == 5:
        break
    print(i)

# continue - skips to next iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4
\`\`\`

## Enumerate

\`\`\`python
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
\`\`\`
`, '', 'Loops are fundamental constructs in programming that allow repetitive execution of code. Python has for loops which iterate over sequences like lists and strings, and while loops which continue as long as a condition is true. The range function generates sequences of numbers. Break exits the loop immediately while continue skips to the next iteration. The enumerate function is useful when you need both the index and value while iterating.'],

        ['Functions', 'Create reusable code blocks with functions. Learn parameters, return values, default arguments, and scope.', `
# Functions

Functions are reusable blocks of code that perform a specific task. They help organize code, avoid repetition, and make programs more maintainable.

## Defining Functions

\`\`\`python
def greet():
    print("Hello, World!")

greet()  # Call the function
\`\`\`

## Parameters & Arguments

\`\`\`python
def greet_person(name):
    print(f"Hello, {name}!")

greet_person("Alice")
greet_person("Bob")
\`\`\`

## Return Values

\`\`\`python
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8
\`\`\`

## Default Parameters

\`\`\`python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")           # Hello, Alice!
greet("Bob", "Hi")       # Hi, Bob!
\`\`\`

## Multiple Returns

\`\`\`python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 4, 1, 5, 9])
print(low, high)  # 1 9
\`\`\`

## Scope

\`\`\`python
x = 10  # Global variable

def my_func():
    y = 5  # Local variable
    print(x)  # Can access global
    print(y)

my_func()
# print(y)  # Error! y is local
\`\`\`
`, '', 'Functions in Python are defined using the def keyword. They can accept parameters, return values using the return statement, and have default parameter values. Functions help organize code into logical, reusable units. Python functions support multiple return values through tuple packing and unpacking. Variable scope in Python determines where a variable can be accessed - variables defined inside a function are local to that function, while those defined outside are global.'],

        ['Lists & Tuples', 'Work with ordered collections. Learn list methods, slicing, list comprehensions, and tuple immutability.', `
# Lists & Tuples

Lists and tuples are sequence types that can store collections of items.

## Lists

\`\`\`python
# Creating lists
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# Common methods
numbers.append(6)       # Add to end
numbers.insert(0, 0)    # Insert at index
numbers.remove(3)       # Remove first occurrence
popped = numbers.pop()  # Remove and return last
numbers.sort()          # Sort in place
\`\`\`

## List Slicing

\`\`\`python
items = [0, 1, 2, 3, 4, 5]
print(items[1:4])    # [1, 2, 3]
print(items[:3])     # [0, 1, 2]
print(items[3:])     # [3, 4, 5]
print(items[::-1])   # [5, 4, 3, 2, 1, 0]
\`\`\`

## List Comprehensions

\`\`\`python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

## Tuples

\`\`\`python
# Immutable sequences
point = (3, 4)
rgb = (255, 128, 0)

# Tuple unpacking
x, y = point
r, g, b = rgb
\`\`\`

> Lists are mutable, tuples are immutable. Use tuples for data that should not change.
`, '', 'Lists in Python are ordered, mutable collections. They support methods like append, insert, remove, pop, and sort. List slicing with colon notation allows you to extract sublists. List comprehensions provide a concise way to create lists based on existing sequences. Tuples are similar to lists but are immutable - once created, they cannot be modified. Tuple unpacking allows you to assign multiple variables from a tuple in one line.'],

        ['Dictionaries & Sets', 'Explore key-value pairs with dictionaries and unique collections with sets.', `
# Dictionaries & Sets

## Dictionaries

Dictionaries store key-value pairs and provide fast lookups.

\`\`\`python
# Creating dictionaries
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}

# Accessing values
print(person["name"])
print(person.get("email", "Not found"))

# Modifying
person["email"] = "alice@example.com"
person["age"] = 26
del person["city"]
\`\`\`

## Dictionary Methods

\`\`\`python
keys = person.keys()
values = person.values()
items = person.items()

for key, value in person.items():
    print(f"{key}: {value}")
\`\`\`

## Sets

\`\`\`python
# Unique, unordered collections
fruits = {"apple", "banana", "cherry"}

fruits.add("orange")
fruits.remove("banana")

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)  # Union: {1, 2, 3, 4, 5, 6}
print(a & b)  # Intersection: {3, 4}
print(a - b)  # Difference: {1, 2}
\`\`\`
`, '', 'Dictionaries in Python are mutable mappings of key-value pairs. They provide O(1) lookup time and are ideal for storing structured data. Keys must be immutable types like strings or numbers. The get method safely accesses values with a default. Sets are unordered collections of unique elements, useful for removing duplicates and performing mathematical set operations like union, intersection, and difference.'],

        ['File Handling', 'Read from and write to files. Learn about file modes, context managers, and working with different file formats.', `
# File Handling

Python makes it easy to read from and write to files.

## Opening Files

\`\`\`python
# Using context manager (recommended)
with open("file.txt", "r") as f:
    content = f.read()
\`\`\`

## File Modes

- \`"r"\` - Read (default)
- \`"w"\` - Write (overwrites)
- \`"a"\` - Append
- \`"r+"\` - Read and write

## Reading Files

\`\`\`python
with open("data.txt", "r") as f:
    all_content = f.read()         # Read entire file
    f.seek(0)                      # Go back to start
    lines = f.readlines()          # List of lines
    f.seek(0)
    for line in f:                 # Iterate line by line
        print(line.strip())
\`\`\`

## Writing Files

\`\`\`python
with open("output.txt", "w") as f:
    f.write("Hello, World!\\n")
    f.write("Second line")

with open("output.txt", "a") as f:
    f.write("\\nAppended line")
\`\`\`

## Working with JSON

\`\`\`python
import json

data = {"name": "Alice", "age": 25}

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

with open("data.json", "r") as f:
    loaded = json.load(f)
\`\`\`
`, '', 'File handling in Python uses the built-in open function. The with statement (context manager) automatically closes files after use, even if exceptions occur. File modes include r for reading, w for writing, and a for appending. The read method reads the entire file, readlines returns a list of lines, and iterating over the file object reads line by line. The JSON module provides dump and load for JSON serialization.']],
    };

    // Create lessons for Python course (index 0)
    for (const [i, lesson] of lessonData[0].entries()) {
      await client.query(
        `INSERT INTO lessons (course_id, title, description, content, video_url, transcript, order_num, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [courseIds[0], lesson[0], lesson[1], lesson[2], lesson[3], lesson[4], i + 1, '15 min']
      );
    }

    // Create generic lessons for remaining courses
    const otherLessonTemplates = [
      ['Introduction & Setup', 'Get started with the course, set up your development environment, and understand the roadmap.'],
      ['Core Concepts', 'Dive deep into the fundamental concepts that form the foundation of this technology.'],
      ['Building Blocks', 'Learn the essential building blocks you will use in every project.'],
      ['Working with Data', 'Understand how to work with and manipulate data effectively.'],
      ['Advanced Features', 'Explore advanced features and capabilities that set you apart.'],
      ['Best Practices', 'Learn industry best practices for writing clean, maintainable, and scalable code.'],
      ['Building a Project', 'Apply everything you have learned to build a real-world project from scratch.'],
      ['Testing & Debugging', 'Master the art of testing your code and debugging issues efficiently.'],
    ];

    const lessonContents = `
# {title}

Welcome to this lesson! Let us dive deep into {description}.

## Key Learning Objectives

1. Understand the core concepts at a fundamental level
2. Learn practical implementation techniques
3. Apply knowledge through hands-on exercises

## Theory

Understanding the theory behind {title} is essential for mastering this skill. Take time to grasp the fundamental principles before moving to practical application.

## Practice Exercise

\`\`\`
Try implementing what you have learned:
- Step 1: Set up your environment
- Step 2: Write the basic structure
- Step 3: Test your implementation
- Step 4: Refine and optimize
\`\`\`

## Summary

You have now learned about {title}. Practice is key to mastery - try building something small with what you have learned today.

> "The only way to learn programming is by writing code." - Anonymous
`;

    for (let c = 1; c < courseIds.length; c++) {
      for (let i = 0; i < otherLessonTemplates.length; i++) {
        const [title, desc] = otherLessonTemplates[i];
        const content = lessonContents.replace(/{title}/g, title).replace(/{description}/g, desc);
        await client.query(
          `INSERT INTO lessons (course_id, title, description, content, transcript, order_num, duration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [courseIds[c], title, desc, content, `In this lesson, we cover ${title.toLowerCase()}. ${desc}`, i + 1, `${10 + Math.floor(Math.random() * 15)} min`]
        );
      }
    }

    console.log('Created lessons');

    // Quizzes for each course
    const quizTemplates = [
      {
        title: 'Python Fundamentals Quiz',
        description: 'Test your knowledge of Python basics including variables, data types, control flow, and functions.',
        difficulty: 'easy',
        time_limit: 300,
        questions: [
          { question: 'What is the output of print(type(42))?', options: ['<class int>', '<class str>', '<class float>', '<class bool>'], correct: 0, explanation: '42 is an integer literal, so type() returns <class int>.' },
          { question: 'Which keyword is used to define a function in Python?', options: ['def', 'function', 'func', 'define'], correct: 0, explanation: 'The def keyword is used to define functions in Python.' },
          { question: 'What does the len() function do?', options: ['Returns the length of an object', 'Converts to lowercase', 'Creates a new list', 'Deletes an item'], correct: 0, explanation: 'len() returns the number of items in a sequence or collection.' },
          { question: 'Which of these is NOT a valid Python data type?', options: ['int', 'float', 'char', 'bool'], correct: 2, explanation: 'Python does not have a separate char type; single characters are just strings of length 1.' },
          { question: 'What is the output of: print("Hello" + " " + "World")?', options: ['Hello World', 'HelloWorld', 'Error', 'Hello+World'], correct: 0, explanation: 'The + operator concatenates strings, so "Hello" + " " + "World" produces "Hello World".' },
          { question: 'What does the append() method do on a list?', options: ['Adds an element to the end', 'Removes the last element', 'Sorts the list', 'Reverses the list'], correct: 0, explanation: 'append() adds a single element to the end of the list.' },
          { question: 'Which statement creates a tuple?', options: ['(1, 2, 3)', '[1, 2, 3]', '{1, 2, 3}', '<1, 2, 3>'], correct: 0, explanation: 'Tuples are created using parentheses (1, 2, 3).' },
          { question: 'What is the index of the first element in a Python list?', options: ['0', '1', '-1', 'first'], correct: 0, explanation: 'Python uses zero-based indexing, so the first element is at index 0.' },
          { question: 'What does the range(5) function produce?', options: ['0, 1, 2, 3, 4', '1, 2, 3, 4, 5', '0, 1, 2, 3, 4, 5', '5'], correct: 0, explanation: 'range(5) generates numbers from 0 to 4 (5 numbers total).' },
          { question: 'How do you create a dictionary in Python?', options: ['{"key": "value"}', '["key": "value"]', '("key": "value")', '<"key": "value">'], correct: 0, explanation: 'Dictionaries are created using curly braces with key-value pairs separated by colons.' },
        ],
      },
      {
        title: 'Web Development Challenge',
        description: 'Test your understanding of HTML, CSS, and JavaScript fundamentals for modern web development.',
        difficulty: 'intermediate',
        time_limit: 600,
        questions: [
          { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperTool Markup Logic', 'Home Tool Markup Language'], correct: 0, explanation: 'HTML stands for HyperText Markup Language.' },
          { question: 'Which CSS property controls the text size?', options: ['font-size', 'text-size', 'font-style', 'text-style'], correct: 0, explanation: 'The font-size property controls the size of text in CSS.' },
          { question: 'Which HTML tag is used to create a hyperlink?', options: ['<a>', '<link>', '<href>', '<url>'], correct: 0, explanation: 'The <a> (anchor) tag is used to create hyperlinks in HTML.' },
          { question: 'What is the correct way to declare a JavaScript variable?', options: ['let x = 5;', 'variable x = 5;', 'v x = 5;', 'int x = 5;'], correct: 0, explanation: 'In modern JavaScript, let is used to declare block-scoped variables.' },
          { question: 'Which CSS property is used for background color?', options: ['background-color', 'bgcolor', 'color-background', 'background'], correct: 0, explanation: 'background-color sets the background color of an element.' },
          { question: 'What does the === operator check in JavaScript?', options: ['Strict equality (value and type)', 'Assignment', 'Loose equality (value only)', 'Greater than or equal'], correct: 0, explanation: '=== checks both value and type equality without type coercion.' },
          { question: 'Which method adds an element to the end of an array in JavaScript?', options: ['push()', 'append()', 'add()', 'insert()'], correct: 0, explanation: 'The push() method adds one or more elements to the end of an array.' },
          { question: 'What is a CSS Flexbox used for?', options: ['Creating flexible layouts', 'Styling text', 'Adding animations', 'Database queries'], correct: 0, explanation: 'Flexbox is a CSS layout model designed for creating flexible, responsive layouts.' },
          { question: 'Which event occurs when a user clicks on an HTML element?', options: ['onclick', 'onchange', 'onmouseover', 'onkeydown'], correct: 0, explanation: 'The onclick event fires when an element is clicked.' },
          { question: 'What does DOM stand for?', options: ['Document Object Model', 'Data Object Model', 'Digital Orientation Model', 'Document Orientation Method'], correct: 0, explanation: 'DOM stands for Document Object Model, representing the structure of an HTML document.' },
        ],
      },
      {
        title: 'Machine Learning Mastery',
        description: 'Advanced quiz covering neural networks, supervised learning, and AI concepts.',
        difficulty: 'advanced',
        time_limit: 900,
        questions: [
          { question: 'What is supervised learning?', options: ['Training with labeled data', 'Training without labels', 'Self-learning algorithm', 'Random data learning'], correct: 0, explanation: 'Supervised learning uses labeled training data where the correct output is known.' },
          { question: 'What is a neural network inspired by?', options: ['The human brain', 'Computer circuits', 'Mathematical formulas', 'Database systems'], correct: 0, explanation: 'Neural networks are inspired by the structure and function of the human brain.' },
          { question: 'What is overfitting in machine learning?', options: ['Model performs well on training but poorly on new data', 'Model training too quickly', 'Model is too simple', 'Not enough training data'], correct: 0, explanation: 'Overfitting occurs when a model learns the training data too well, including noise, and fails to generalize.' },
          { question: 'What is the purpose of an activation function?', options: ['Introduce non-linearity', 'Speed up training', 'Reduce model size', 'Clean the data'], correct: 0, explanation: 'Activation functions introduce non-linearity, allowing neural networks to learn complex patterns.' },
          { question: 'What does CNN stand for?', options: ['Convolutional Neural Network', 'Complex Neural Network', 'Continuous Neural Network', 'Central Neural Network'], correct: 0, explanation: 'CNN stands for Convolutional Neural Network, commonly used for image processing.' },
          { question: 'What is gradient descent used for?', options: ['Optimizing model parameters', 'Data preprocessing', 'Feature selection', 'Model evaluation'], correct: 0, explanation: 'Gradient descent is an optimization algorithm used to minimize the loss function by adjusting model parameters.' },
          { question: 'What is a confusion matrix?', options: ['Summary of prediction results', 'Training data format', 'Model architecture diagram', 'Error log format'], correct: 0, explanation: 'A confusion matrix summarizes classification results showing true positives, false positives, true negatives, and false negatives.' },
          { question: 'What is transfer learning?', options: ['Using a pre-trained model for a new task', 'Moving data between servers', 'Converting model formats', 'Sharing models between users'], correct: 0, explanation: 'Transfer learning leverages knowledge from a pre-trained model on a new, related task.' },
          { question: 'What is the purpose of regularization?', options: ['Prevent overfitting', 'Speed up training', 'Increase model size', 'Clean the data'], correct: 0, explanation: 'Regularization techniques like L1 and L2 help prevent overfitting by adding penalty terms to the loss function.' },
          { question: 'What is backpropagation?', options: ['Algorithm for computing gradients', 'Data preprocessing technique', 'Model architecture design', 'Feature engineering method'], correct: 0, explanation: 'Backpropagation computes gradients of the loss function with respect to weights, enabling gradient descent optimization.' },
        ],
      },
      {
        title: 'React Development Quiz',
        description: 'Test your React knowledge including components, hooks, and state management.',
        difficulty: 'intermediate',
        time_limit: 600,
        questions: [
          { question: 'What is a React component?', options: ['A reusable piece of UI', 'A database table', 'A server function', 'A CSS file'], correct: 0, explanation: 'React components are reusable, independent pieces of UI that can be composed together.' },
          { question: 'What hook is used for state in functional components?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 0, explanation: 'useState is the hook used to add state to functional components.' },
          { question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'], correct: 0, explanation: 'JSX is a syntax extension that looks like HTML but is used in JavaScript/React code.' },
          { question: 'What is the virtual DOM?', options: ['A lightweight copy of the real DOM', 'A new HTML standard', 'A browser extension', 'A server-side technology'], correct: 0, explanation: 'The virtual DOM is a lightweight JavaScript representation of the actual DOM for efficient updates.' },
          { question: 'Which hook replaces componentDidMount?', options: ['useEffect with []', 'useState', 'useContext', 'useReducer'], correct: 0, explanation: 'useEffect with an empty dependency array runs once after the initial render, similar to componentDidMount.' },
          { question: 'What are props in React?', options: ['Data passed to components', 'Component state', 'CSS classes', 'Event handlers'], correct: 0, explanation: 'Props (properties) are data passed from parent to child components in React.' },
          { question: 'What is the purpose of keys in React lists?', options: ['Help React identify changed items', 'Encrypt the list data', 'Sort the list', 'Filter the list'], correct: 0, explanation: 'Keys help React identify which items have changed, been added, or removed in lists.' },
          { question: 'What does createContext provide?', options: ['Shared data across components', 'HTTP request handling', 'File system access', 'CSS styling'], correct: 0, explanation: 'Context provides a way to share data across the component tree without prop drilling.' },
          { question: 'How do you conditionally render in React?', options: ['Using ternary operators or &&', 'Using if statements only', 'Using CSS display property', 'Using server-side logic'], correct: 0, explanation: 'Conditional rendering in React uses JavaScript operators like ternary and logical &&.' },
          { question: 'What is Redux used for?', options: ['State management', 'CSS styling', 'API requests', 'Routing'], correct: 0, explanation: 'Redux is a state management library that provides a centralized store for application state.' },
        ],
      },
      {
        title: 'Algorithms & Data Structures',
        description: 'Challenge your understanding of algorithms, complexity analysis, and data structure implementations.',
        difficulty: 'advanced',
        time_limit: 900,
        questions: [
          { question: 'What is the time complexity of binary search?', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], correct: 0, explanation: 'Binary search has O(log n) time complexity because it halves the search space each iteration.' },
          { question: 'Which data structure uses LIFO?', options: ['Stack', 'Queue', 'Array', 'Linked List'], correct: 0, explanation: 'A stack follows Last In, First Out (LIFO) principle.' },
          { question: 'What is a hash table?', options: ['Key-value store with O(1) average lookup', 'A sorted array', 'A binary tree', 'A linked list'], correct: 0, explanation: 'Hash tables provide O(1) average-case lookup, insertion, and deletion using a hash function.' },
          { question: 'What is Big O notation used for?', options: ['Describing algorithm efficiency', 'Measuring memory size', 'Calculating network speed', 'Determining code style'], correct: 0, explanation: 'Big O notation describes how the runtime or space requirements grow as input size increases.' },
          { question: 'What traversal gives sorted order in a BST?', options: ['Inorder traversal', 'Preorder traversal', 'Postorder traversal', 'Level order traversal'], correct: 0, explanation: 'Inorder traversal of a Binary Search Tree visits nodes in sorted (ascending) order.' },
          { question: 'What is dynamic programming?', options: ['Breaking problems into overlapping subproblems', 'Runtime code generation', 'Dynamic type checking', 'Real-time programming'], correct: 0, explanation: 'Dynamic programming solves complex problems by breaking them into simpler overlapping subproblems and storing results.' },
          { question: 'Which sorting algorithm has O(n log n) average case?', options: ['Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'], correct: 0, explanation: 'Merge Sort consistently achieves O(n log n) time complexity by using a divide-and-conquer approach.' },
          { question: 'What is a graph represented by?', options: ['Vertices and edges', 'Rows and columns', 'Keys and values', 'Nodes and pointers only'], correct: 0, explanation: 'A graph consists of vertices (nodes) connected by edges.' },
          { question: 'What is recursion?', options: ['A function calling itself', 'A loop structure', 'A data type', 'An error handler'], correct: 0, explanation: 'Recursion is when a function calls itself to solve a problem by breaking it into smaller instances.' },
          { question: 'What does FIFO describe?', options: ['Queue behavior', 'Stack behavior', 'Array behavior', 'Tree behavior'], correct: 0, explanation: 'FIFO (First In, First Out) describes a queue data structure.' },
        ],
      },
      {
        title: 'SQL & Database Fundamentals',
        description: 'Test your SQL query writing skills and database design knowledge.',
        difficulty: 'easy',
        time_limit: 300,
        questions: [
          { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'Standard Question Language', 'Server Query Language'], correct: 0, explanation: 'SQL stands for Structured Query Language, the standard language for relational databases.' },
          { question: 'Which SQL statement is used to retrieve data?', options: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'], correct: 0, explanation: 'The SELECT statement is used to query and retrieve data from database tables.' },
          { question: 'What clause filters rows after grouping?', options: ['HAVING', 'WHERE', 'FILTER', 'GROUP'], correct: 0, explanation: 'HAVING filters grouped rows, while WHERE filters individual rows before grouping.' },
          { question: 'Which JOIN returns all rows from both tables?', options: ['FULL OUTER JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'], correct: 0, explanation: 'FULL OUTER JOIN returns all rows from both tables, with NULLs where no match exists.' },
          { question: 'What is a primary key?', options: ['Unique identifier for each row', 'A foreign key reference', 'An index', 'A table name'], correct: 0, explanation: 'A primary key uniquely identifies each row in a table and cannot contain NULL values.' },
          { question: 'What does INSERT INTO do?', options: ['Adds new rows to a table', 'Updates existing rows', 'Deletes rows', 'Creates a new table'], correct: 0, explanation: 'INSERT INTO adds new rows of data into a specified table.' },
          { question: 'What is normalization in databases?', options: ['Organizing data to reduce redundancy', 'Making data faster', 'Encrypting data', 'Backing up data'], correct: 0, explanation: 'Normalization organizes data to minimize redundancy and dependency by dividing tables and defining relationships.' },
          { question: 'What does COUNT(*) do?', options: ['Returns number of rows', 'Returns sum of values', 'Returns average', 'Returns maximum value'], correct: 0, explanation: 'COUNT(*) returns the total number of rows in the result set.' },
          { question: 'Which clause sorts query results?', options: ['ORDER BY', 'SORT BY', 'GROUP BY', 'ARRANGE BY'], correct: 0, explanation: 'ORDER BY sorts the result set by one or more columns, optionally ascending or descending.' },
          { question: 'What is a foreign key?', options: ['Reference to a primary key in another table', 'The main table key', 'A unique constraint', 'An auto-increment field'], correct: 0, explanation: 'A foreign key is a column that references the primary key of another table, establishing relationships.' },
        ],
      },
    ];

    for (let i = 0; i < quizTemplates.length; i++) {
      const quiz = quizTemplates[i];
      await client.query(
        `INSERT INTO quizzes (course_id, title, description, difficulty, questions, time_limit, passing_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [courseIds[i], quiz.title, quiz.description, quiz.difficulty, JSON.stringify(quiz.questions), quiz.time_limit, 70]
      );
    }

    console.log('Created quizzes');

    // Enroll demo user in first 3 courses
    for (let i = 0; i < 3; i++) {
      await client.query(
        'INSERT INTO user_courses (user_id, course_id, progress) VALUES ($1, $2, $3)',
        [demoId, courseIds[i], i === 0 ? 35 : i === 1 ? 20 : 5]
      );
    }

    // Demo user streak history
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      await client.query(
        'INSERT INTO streak_history (user_id, date, count) VALUES ($1, $2, $3)',
        [demoId, dateStr, 7 - i]
      );
    }

    // Admin streak history
    for (let i = 12; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      await client.query(
        'INSERT INTO streak_history (user_id, date, count) VALUES ($1, $2, $3)',
        [adminId, dateStr, 12 - i]
      );
    }

    // Demo activities
    const demoActivities = [
      ['lesson_completed', 'Completed "Variables & Data Types" lesson'],
      ['lesson_completed', 'Completed "Control Flow" lesson'],
      ['quiz_completed', 'Passed "Python Fundamentals Quiz" - Score: 85%'],
      ['enrolled', 'Enrolled in Web Development Bootcamp'],
      ['lesson_completed', 'Completed "Introduction & Setup" lesson'],
      ['streak', 'Day 7 streak achieved!'],
    ];

    for (const [action, desc] of demoActivities) {
      await client.query(
        'INSERT INTO activities (user_id, action, description) VALUES ($1, $2, $3)',
        [demoId, action, desc]
      );
    }

    // Demo notifications
    const demoNotifications = [
      ['Daily Streak!', 'You are on fire! 7-day streak achieved. Keep the momentum going!', 'streak'],
      ['Course Progress', 'You have completed 35% of Python Mastery. Great progress!', 'course'],
      ['New Course Available', 'Check out our new React & Modern Frontend course!', 'course'],
      ['Motivation', 'Every expert was once a beginner. Keep pushing forward!', 'motivation'],
      ['Quiz Available', 'A new quiz is ready for Python Mastery. Test your knowledge!', 'quiz'],
      ['Welcome!', 'Welcome to CodeFlow! Start your first course to begin learning.', 'info'],
    ];

    for (const [title, message, type] of demoNotifications) {
      await client.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [demoId, title, message, type]
      );
    }

    console.log('Database seeded successfully!');
    console.log('Demo credentials: demo@codeflow.com / password123');
    console.log('Admin credentials: admin@codeflow.com / password123');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
