/**
 * Lightweight log server — zero external dependencies.
 * Writes log entries to /app/logs/app.jsonl (JSON Lines format).
 * 
 * Endpoints:
 *   POST /api/logs     — Append a log entry
 *   GET  /api/logs     — Retrieve all log entries
 *   DELETE /api/logs   — Clear the log file
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.jsonl');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '', 'utf-8');
}

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /api/logs — Append a log entry
  if (req.method === 'POST' && req.url === '/api/logs') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // GET /api/logs — Read all log entries
  if (req.method === 'GET' && req.url === '/api/logs') {
    try {
      const raw = fs.readFileSync(LOG_FILE, 'utf-8');
      const entries = raw
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(entries));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read logs' }));
    }
    return;
  }

  // DELETE /api/logs — Clear all logs
  if (req.method === 'DELETE' && req.url === '/api/logs') {
    fs.writeFileSync(LOG_FILE, '', 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: 'Logs cleared' }));
    return;
  }

  // 404 fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[LOG SERVER] Running on port ${PORT}`);
  console.log(`[LOG SERVER] Writing to ${LOG_FILE}`);
});
