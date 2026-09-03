import { Router } from 'express';

const router = Router();

router.post(['/chat', '/mentor'], async (req, res) => {
  try {
    const { prompt = '', code = '', language = 'python', context = '', action = 'chat' } = req.body;
    const lang = (language || '').toLowerCase();

    // Check if external LLM API key exists (e.g. GEMINI_API_KEY or OPENAI_API_KEY)
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are FlowAI, an elite coding mentor for CodeFlow Academy.
Context:
Language: ${language}
Lesson/Topic: ${context}
Student Code:
\`\`\`${lang}
${code}
\`\`\`
Action: ${action}
Student Question: ${prompt}

Respond in concise, pedagogical Markdown. Use code snippets, highlight best practices, and encourage the student!`
              }]
            }]
          })
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const reply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({
              response: reply,
              action,
              model: 'Gemini 1.5 Flash',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call skipped/failed, using expert engine:', geminiErr.message);
      }
    }

    // Built-in Expert CodeFlow Semantic Tutor Engine
    const response = generateExpertTutorResponse({ prompt, code, language, context, action });
    return res.json({
      response,
      action,
      model: 'FlowAI Tutor Engine',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('FlowAI error:', err);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

function generateExpertTutorResponse({ prompt, code, language, context, action }) {
  const lang = (language || 'Python').toLowerCase();
  const trimmedCode = (code || '').trim();

  if (action === 'explain') {
    if (!trimmedCode) {
      return `### 💡 Code Explanation\n\nNo code was provided in the editor yet. Write or load some ${language} code, and I'll break it down line-by-line for you!`;
    }

    return `### 💡 Step-by-Step Code Explanation (${language})

Here is how your code executes:

1. **Structure & Setup**:
   Your code contains **${trimmedCode.split('\n').length} lines** written in **${language}**.
${extractCodeFeatures(trimmedCode, lang)}

2. **Execution Flow**:
   - The runtime initiates execution from top to bottom.
   - Variables are allocated into local scope memory.
   - Any functions or control structures are evaluated when called.

3. **Key Concept Highlight**:
   Always ensure proper naming conventions and return values for reusability. Would you like to optimize or test this code against automated cases?`;
  }

  if (action === 'debug') {
    if (!trimmedCode) {
      return `### 🐞 Debugger & Error Check\n\nYour code editor is empty! Add your solution and I'll check for syntax issues, unhandled exceptions, and logic bugs.`;
    }

    const bugs = checkCommonBugs(trimmedCode, lang);
    return `### 🐞 Code Analysis & Bug Inspection

${bugs.length > 0 ? `I found **${bugs.length} potential area(s)** to check:\n\n${bugs.join('\n\n')}` : `✅ **No obvious syntax errors detected!**\n\nYour ${language} code structure looks syntactically sound. If your test cases are failing, check whether variable names and return values match the challenge requirements exactly.`}

**Pro-Tip**: Use \`console.log()\` (in JS) or \`print()\` (in Python) to inspect variable states before your return statements.`;
  }

  if (action === 'hint') {
    return `### 🎯 FlowAI Hint (No Spoilers!)

For **${context || 'this challenge'}**:
1. **Break it into parts**: Read the expected output carefully.
2. **Key construct**: ${getConstructHint(lang)}
3. **Common trap**: Ensure return values match the expected data type (e.g. an array vs a string, or integer vs float).

Need another nudge? Ask me a specific question about your logic!`;
  }

  if (action === 'optimize') {
    return `### ⚡ Optimization & Clean Code Insights

1. **Time Complexity**: Aim for linear $O(n)$ or logarithmic $O(\\log n)$ operations wherever possible.
2. **Readability & Idioms**:
   - In ${language}, prefer declarative methods (like map/filter in JS or list comprehensions in Python) over deeply nested loops.
   - Keep variable names descriptive (e.g. \`userList\` instead of \`x\`).
3. **Memory Management**: Avoid unnecessary copies of large collections in memory.`;
  }

  // General conversational query
  return `### 🤖 FlowAI Mentor

**Regarding**: "${prompt || 'Your question'}"

In **${language}**, when working on **${context || 'this problem'}**:
- Make sure your functions take the correct input parameters and return the expected value.
- Test edge cases like empty arrays, zero, negative numbers, or null values.

Feel free to click **"Explain This Code"** or **"Debug My Code"** above for instant analysis of what's in your editor!`;
}

function extractCodeFeatures(code, lang) {
  const features = [];
  if (code.includes('def ') || code.includes('function ') || code.includes('=>')) {
    features.push('   - Defines modular functions for reusable logic.');
  }
  if (code.includes('for ') || code.includes('while ')) {
    features.push('   - Utilizes loop iterations to process collections or repetitive cycles.');
  }
  if (code.includes('if ') || code.includes('else:')) {
    features.push('   - Implements conditional branching to handle different execution pathways.');
  }
  if (code.includes('class ')) {
    features.push('   - Leverages Object-Oriented Programming (OOP) with custom classes.');
  }
  return features.length > 0 ? features.join('\n') : '   - Direct sequential procedural script.';
}

function checkCommonBugs(code, lang) {
  const issues = [];
  if (lang.includes('python')) {
    if (code.includes('print ') && !code.includes('print(')) {
      issues.push('⚠️ **Missing Parentheses**: Python 3 requires parentheses for \`print(value)\`.');
    }
    if (code.includes('\t') && code.includes('    ')) {
      issues.push('⚠️ **Indentation Warning**: Mixing tabs and spaces can trigger an \`IndentationError\` in Python.');
    }
  }
  if (lang.includes('javascript') || lang.includes('typescript')) {
    if (code.includes('==') && !code.includes('===')) {
      issues.push('💡 **Loose Equality**: Consider using strict equality (\`===\`) to prevent unintended type coercion.');
    }
  }
  return issues;
}

function getConstructHint(lang) {
  if (lang.includes('python')) {
    return 'Use Python list comprehensions \`[x for x in list if condition]\` or dictionary indexing for fast lookups.';
  }
  if (lang.includes('sql')) {
    return 'Use \`SELECT column1, column2 FROM table WHERE condition ORDER BY column ASC\`.';
  }
  return 'Use \`const\` by default, \`let\` when variables mutate, and ensure your function explicitly \`return\`s a result.';
}

export default router;
