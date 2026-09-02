import { Router } from 'express';
import { execFile, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Create a temp directory for runner scripts
const TEMP_DIR = path.join(os.tmpdir(), 'codeflow_runner');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

router.post('/execute', authMiddleware, async (req, res) => {
  const { language, code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' });
  }

  const startTime = Date.now();

  // 1. PYTHON EXECUTION
  if (language === 'python') {
    const scriptPath = path.join(TEMP_DIR, `script_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);
    try {
      await fs.promises.writeFile(scriptPath, code, 'utf8');

      execFile('python', [scriptPath], { timeout: 6000, maxBuffer: 1024 * 512 }, async (err, stdout, stderr) => {
        try {
          await fs.promises.unlink(scriptPath);
        } catch (_) {}

        const duration = Date.now() - startTime;

        if (err) {
          if (err.killed) {
            return res.json({
              success: false,
              output: 'Execution timed out after 5 seconds.',
              duration,
            });
          }
          return res.json({
            success: false,
            output: stderr || err.message,
            duration,
          });
        }

        res.json({
          success: true,
          output: stdout || (stderr ? stderr : 'Code executed successfully (no output).'),
          duration,
        });
      });
    } catch (writeErr) {
      res.status(500).json({ error: 'Failed to write execution script' });
    }
    return;
  }

  // 2. JAVASCRIPT EXECUTION
  if (language === 'javascript') {
    const scriptPath = path.join(TEMP_DIR, `script_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
    try {
      await fs.promises.writeFile(scriptPath, code, 'utf8');

      execFile('node', [scriptPath], { timeout: 6000, maxBuffer: 1024 * 512 }, async (err, stdout, stderr) => {
        try {
          await fs.promises.unlink(scriptPath);
        } catch (_) {}

        const duration = Date.now() - startTime;

        if (err) {
          if (err.killed) {
            return res.json({
              success: false,
              output: 'Execution timed out after 5 seconds.',
              duration,
            });
          }
          return res.json({
            success: false,
            output: stderr || err.message,
            duration,
          });
        }

        res.json({
          success: true,
          output: stdout || (stderr ? stderr : 'Code executed successfully (no output).'),
          duration,
        });
      });
    } catch (writeErr) {
      res.status(500).json({ error: 'Failed to write execution script' });
    }
    return;
  }

  // 3. SQL EXECUTION
  if (language === 'sql') {
    try {
      // Execute in a transaction that rolls back to prevent destroying tables
      const client = await query('SELECT 1'); // test connection
      const sanitizedCode = code.trim();

      // If it's a SELECT query, run it directly
      if (sanitizedCode.toLowerCase().startsWith('select')) {
        const result = await query(sanitizedCode);
        const duration = Date.now() - startTime;

        if (result.rows.length === 0) {
          return res.json({
            success: true,
            output: 'Query returned 0 rows.',
            duration,
          });
        }

        // Format as clean ASCII table
        const headers = Object.keys(result.rows[0]);
        const headerRow = headers.join(' | ');
        const separator = headers.map((h) => '-'.repeat(h.length)).join('-|-');
        const rows = result.rows.map((r) => headers.map((h) => String(r[h] ?? 'NULL')).join(' | ')).join('\n');

        res.json({
          success: true,
          output: `${headerRow}\n${separator}\n${rows}\n\n(${result.rows.length} rows returned)`,
          duration,
        });
      } else {
        // Any other statement, run in transaction and roll back
        await query('BEGIN');
        const result = await query(sanitizedCode);
        await query('ROLLBACK');
        const duration = Date.now() - startTime;

        res.json({
          success: true,
          output: `Command executed successfully. ${result.rowCount || 0} rows affected (changes safely simulated in playground).`,
          duration,
        });
      }
    } catch (sqlErr) {
      const duration = Date.now() - startTime;
      res.json({
        success: false,
        output: `SQL Error: ${sqlErr.message}`,
        duration,
      });
    }
    return;
  }

  // Unsupported directly (HTML / CSS are rendered in frontend live preview)
  res.status(400).json({ error: `Direct execution not supported for ${language}` });
});

export default router;
