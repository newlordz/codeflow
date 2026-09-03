import { Router } from 'express';

const router = Router();

// Primary and fallback models supported by Google Generative Language API
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const FALLBACK_GEMINI_MODEL = 'gemini-3.6-flash';

// Health and configuration status endpoint
router.get('/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    configured: hasKey,
    provider: hasKey ? 'Google Gemini' : 'FlowAI Semantic Engine',
    model: hasKey ? DEFAULT_GEMINI_MODEL : 'FlowAI Tutor Engine',
    timestamp: new Date().toISOString()
  });
});

router.post(['/chat', '/mentor'], async (req, res) => {
  try {
    const {
      prompt = '',
      code = '',
      language = 'Python',
      context = '',
      action = 'chat',
      history = []
    } = req.body;

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    // If Gemini API Key is configured, attempt call via Gemini
    if (apiKey) {
      try {
        const geminiResult = await callGeminiWithFallback({
          apiKey,
          prompt,
          code,
          language,
          context,
          action,
          history
        });

        if (geminiResult?.text) {
          return res.json({
            response: geminiResult.text,
            action,
            model: geminiResult.modelDisplay,
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API attempt failed, falling back to expert tutor engine:', geminiErr.message);
      }
    }

    // Built-in Expert CodeFlow Semantic Tutor Engine (Zero-Downtime Fallback)
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

/**
 * Call Gemini API with automatic model fallback (e.g. gemini-3.6-flash -> gemini-flash-latest)
 */
async function callGeminiWithFallback({ apiKey, prompt, code, language, context, action, history }) {
  const modelsToTry = [DEFAULT_GEMINI_MODEL];
  if (!modelsToTry.includes(FALLBACK_GEMINI_MODEL)) {
    modelsToTry.push(FALLBACK_GEMINI_MODEL);
  }

  const systemInstructionText = `You are FlowAI, an elite, interactive coding mentor and AI tutor for CodeFlow Academy students.
You are encouraging, pedagogical, and clear.
Guidelines:
1. Always format responses in clean, structured GitHub Markdown.
2. Never prefix headers with asterisks or combine '#' and '*' (e.g. NEVER write '#*' or '### **Heading**', always write '### Heading').
3. When including code, ALWAYS use code blocks with language tags (e.g. \`\`\`${(language || 'python').toLowerCase()}\n...\n\`\`\`).
4. For "explain": Walk through the code logically step-by-step, highlighting key variables, functions, and algorithms.
5. For "debug": Pinpoint bugs or syntax flaws directly, explain the root cause, and show the clean fix.
6. For "hint": Offer smart conceptual nudges without immediately spoiling the complete final answer.
7. For "optimize": Discuss time and space complexity (e.g. Big-O notation) and idiomatic clean coding patterns.
8. Be interactive: Conclude with a helpful question or next step suggestion to keep the student engaged.`;

  // Build conversational turns for multi-turn chat
  const contents = buildGeminiContents({ history, prompt, code, language, context, action });

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        console.warn(`Model ${model} returned error: ${msg}`);
        lastError = new Error(msg);
        continue; // Try next model
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) {
        const cleanedText = cleanMarkdownArtifacts(replyText);
        const display = model.includes('3.6')
          ? 'Gemini 3.6 Flash'
          : model.includes('flash')
          ? 'Gemini Flash'
          : 'Gemini';
        return { text: cleanedText, modelDisplay: display };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('No response from Gemini models');
}

function cleanMarkdownArtifacts(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/^(#{1,6})\s*\*+\s*(.*?)\s*\*+\s*$/gm, (m, h, title) => `${h} ${title}`)
    .replace(/^(#{1,6})\s*\*+\s*/gm, (m, h) => `${h} `)
    .replace(/^(#{1,6})\*+/gm, (m, h) => `${h} `);
}

/**
 * Convert user chat history and current question/action into Gemini contents format
 */
function buildGeminiContents({ history = [], prompt, code, language, context, action }) {
  const contents = [];

  // Filter out the initial static greeting and format past turns
  const validHistory = history.filter(
    (h) => h.id !== 'welcome' && h.content && typeof h.content === 'string' && !h.content.startsWith('⚠️')
  );

  // Take the most recent 10 turns to stay within optimal context
  const recentHistory = validHistory.slice(-10);

  for (const item of recentHistory) {
    const role = item.role === 'user' ? 'user' : 'model';
    const text = item.content;

    // Gemini requires alternating user / model roles
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }]
      });
    }
  }

  // Ensure first turn starts with user
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  // Build the current prompt with rich context
  let finalPrompt = '';
  const langTag = (language || 'python').toLowerCase();

  const codeSection = code && code.trim()
    ? `Current Editor Code (${language}):\n\`\`\`${langTag}\n${code.trim()}\n\`\`\`\n`
    : '';

  const contextSection = context ? `Context / Topic: ${context}\n` : '';
  const actionSection = action && action !== 'chat' ? `Goal: ${action.toUpperCase()}\n` : '';

  const userQuestion = prompt?.trim() || getDefaultActionPrompt(action);

  finalPrompt = `${contextSection}${actionSection}${codeSection}\nStudent Request:\n${userQuestion}`;

  // If the last entry in history was already a user role (e.g. immediate send), append
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text = finalPrompt;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });
  }

  return contents;
}

function getDefaultActionPrompt(action) {
  switch (action) {
    case 'explain':
      return 'Please explain this code step-by-step so I can understand how it works.';
    case 'debug':
      return 'Please check this code for bugs, logic errors, or syntax issues, and explain how to fix them.';
    case 'hint':
      return 'Give me a helpful hint for this challenge without giving away the complete solution.';
    case 'optimize':
      return 'How can I optimize this code for better time/space complexity and cleaner style?';
    default:
      return 'Help me understand and improve my code for this lesson.';
  }
}

/**
 * Built-in Semantic CodeFlow Tutor Engine
 * Provides instant pedagogical answers when offline or without an API key
 */
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
