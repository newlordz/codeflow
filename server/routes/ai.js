import { Router } from 'express';

const router = Router();

// Primary and fallback models supported by Google Generative Language API
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const FALLBACK_GEMINI_MODEL = 'gemini-1.5-flash';

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
8. For "review": Provide a formal Code Review audit with scores: Code Cleanliness (/10), Safety & Edge Cases (/10), Scalability (/10), followed by constructive suggestions and a refactored clean version.
9. For "complexity": Provide a rigorous Big-O Time & Space Complexity analysis. State the Worst Case O(...), Best Case Ω(...), and Space Complexity. Explain why line by line, point out the primary bottleneck loop/recursion, and show how to optimize it.
10. For "roast": Deliver a hilarious, witty, lighthearted "Gordon Ramsay of Coding / Sarcastic Senior Architect" roast of the code! Roast bad variable names, repetitive code, inefficient nested loops, lack of comments or ridiculous over-engineering. Keep it humorous, entertaining, and punchy, but conclude with a short respectful "How to Redeem Yourself" section.
11. Be interactive: Conclude with a helpful question or next step suggestion to keep the student engaged.`;

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
        signal: AbortSignal.timeout(25000)
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
    case 'review':
      return 'Please perform an in-depth code review with quality scores, edge-case analysis, and refactoring tips.';
    case 'complexity':
      return 'Calculate and explain the exact Big-O Time and Space complexity for this code with tight mathematical bounds.';
    case 'roast':
      return 'Roast my code with sarcastic humor like a grumpy senior tech lead, but give me actionable redemption tips!';
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

  if (action === 'review') {
    if (!trimmedCode) {
      return `### 🧐 Deep Code Review\n\nNo code found in the editor! Paste your code to receive a comprehensive multi-factor quality audit.`;
    }
    const lineCount = trimmedCode.split('\n').length;
    const hasLoops = trimmedCode.includes('for') || trimmedCode.includes('while');
    const hasFunctions = trimmedCode.includes('def') || trimmedCode.includes('function') || trimmedCode.includes('=>');
    const cleanScore = Math.min(9, Math.max(6, Math.floor(10 - (lineCount > 50 ? 2 : 0) - (hasLoops ? 0 : 1))));

    return `### 🧐 FlowAI Code Review Audit
**Target Language**: ${language} | **Module**: ${context || 'General'}

#### 📊 Code Quality Scorecard
| Metric | Rating | Status |
| :--- | :--- | :--- |
| **Cleanliness & Idioms** | **${cleanScore}/10** | ${cleanScore >= 8 ? '🌟 Excellent' : '🔧 Good, can polish'} |
| **Safety & Error Handling** | **7/10** | ⚠️ Add parameter guards for null/empty values |
| **Scalability & Big-O** | **${hasLoops ? '7.5/10' : '9/10'}** | ${hasLoops ? 'Check loop termination conditions' : 'Linear / constant operations'} |

---

#### 🔍 Critical Observations
1. **Modularity**: ${hasFunctions ? 'Good job encapsulating operations inside functions for reusability.' : 'Consider wrapping your logic into a dedicated function for testing and clean exports.'}
2. **Naming Conventions**: Keep identifier names semantic (e.g. \`targetItem\` instead of single-character variables).
3. **Defensive Programming**: Validate incoming inputs against undefined, NaN, or out-of-bounds boundary values before indexing.

#### 💡 Refactoring Recommendation
Ensure return types are explicit and consistent across all execution branches.`;
  }

  if (action === 'complexity') {
    if (!trimmedCode) {
      return `### ⚡ Big-O Complexity Auditor\n\nWrite or paste some code to compute its Time and Space complexity!`;
    }
    const forCount = (trimmedCode.match(/for\s+/g) || []).length;
    const whileCount = (trimmedCode.match(/while\s+/g) || []).length;
    const totalLoops = forCount + whileCount;
    let timeComp = 'O(1)';
    let spaceComp = 'O(1)';

    if (totalLoops === 1) {
      timeComp = 'O(n)';
    } else if (totalLoops >= 2) {
      timeComp = 'O(n²)';
    }
    if (trimmedCode.includes('.push') || trimmedCode.includes('.append') || trimmedCode.includes('[x for') || trimmedCode.includes('new Array')) {
      spaceComp = 'O(n)';
    }

    return `### ⚡ Big-O Complexity Analysis
**Language**: ${language}

#### ⏱️ Mathematical Bounds
- **Time Complexity (Worst Case)**: \`${timeComp}\`
  - *Reasoning*: Detected ${totalLoops === 0 ? 'no loops; execution occurs in constant sequential cycles' : totalLoops === 1 ? '1 main loop iterating over the dataset of size n' : `${totalLoops} loop constructs which may yield quadratic operations in the worst case`}.
- **Auxiliary Space Complexity**: \`${spaceComp}\`
  - *Reasoning*: ${spaceComp === 'O(1)' ? 'No significant auxiliary data structures allocated in memory.' : 'Dynamic collections grow proportionally with input size.'}

---

#### 🚀 Optimization Hotspots
${totalLoops > 1 ? '- **Nested Iteration**: Investigate if a Hash Map / Set lookup can reduce quadratic `O(n²)` down to linear `O(n)`.' : '- **Constant Overhead**: Your operations are already well-bounded. Keep memory allocations close to the point of use.'}
- **Cache Locality**: Access arrays sequentially to maximize hardware CPU L1/L2 cache utilization.`;
  }

  if (action === 'roast') {
    if (!trimmedCode) {
      return `### 🔥 Roast My Code\n\n*Looking at an empty editor...*\n\n"You know what's worse than bad code? **NO CODE AT ALL!** What am I supposed to roast, the invisible whitespace? Type something first!"`;
    }
    const lines = trimmedCode.split('\n').length;
    const hasConsole = trimmedCode.includes('console.log') || trimmedCode.includes('print');
    
    return `### 🔥 Roast My Code: Senior Architect Edition
*"Oh boy... let's see what we're deploying to production today."*

${lines > 25 ? `1. **The Great Wall of Code**: ${lines} lines for this? Homer's Odyssey was shorter than your function.` : '1. **Brevity or Laziness?**: This code is shorter than a tweet, yet somehow still manages to raise my blood pressure.'}
${hasConsole ? `2. **Print-Driven Development**: Look at those debug statements! I see you use \`print\` / \`console.log\` like sonar in a submarine. Have you heard of a debugger, or do you just like spamming terminal stdout?` : `2. **Silent But Deadly**: Zero log statements and zero error checks. You really trust your users that much? Courageous, or just wildly reckless.`}
3. **Variable Names**: If I showed this to our CI/CD pipeline, the server would probably crash out of sheer embarrassment.

---

#### 🏆 How to Redeem Yourself (Constructive Fix)
- Extract multi-step calculations into pure single-responsibility helper functions.
- Add typed boundary assertions or explicit error handling.
- Don't worry — everyone starts here. Now refactor it and prove me wrong! 😉`;
  }

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
