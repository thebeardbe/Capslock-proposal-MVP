/**
 * Centralized logging service for the Weekly Brief MVP.
 * Tracks upload events, parsing results, analysis duration, and errors.
 * Spec requirement: Section F.3 — Event Logging, Metadata, Privacy.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  meta?: Record<string, string | number | boolean>;
  durationMs?: number;
}

const LOG_SERVER_URL = '/api/logs';

class Logger {
  private logs: LogEntry[] = [];

  private createEntry(level: LogLevel, event: string, meta?: Record<string, string | number | boolean>, durationMs?: number): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...(meta && { meta }),
      ...(durationMs !== undefined && { durationMs }),
    };
    this.logs.push(entry);
    this.print(entry);
    this.persist(entry);
    return entry;
  }

  info(event: string, meta?: Record<string, string | number | boolean>) {
    return this.createEntry('info', event, meta);
  }

  warn(event: string, meta?: Record<string, string | number | boolean>) {
    return this.createEntry('warn', event, meta);
  }

  error(event: string, meta?: Record<string, string | number | boolean>) {
    return this.createEntry('error', event, meta);
  }

  success(event: string, meta?: Record<string, string | number | boolean>, durationMs?: number) {
    return this.createEntry('success', event, meta, durationMs);
  }

  /** Returns all collected log entries (read-only). */
  getAll(): ReadonlyArray<LogEntry> {
    return this.logs;
  }

  /** Fetches persisted logs from the server. */
  async fetchPersistedLogs(): Promise<LogEntry[]> {
    try {
      const res = await fetch(LOG_SERVER_URL);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  /** Clears both in-memory and persisted logs. */
  async clear() {
    this.logs = [];
    try {
      await fetch(LOG_SERVER_URL, { method: 'DELETE' });
    } catch {
      // Server may be unreachable, fail silently
    }
  }

  /** Persists a single entry to the log server (fire-and-forget). */
  private persist(entry: LogEntry) {
    try {
      fetch(LOG_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {}); // fire-and-forget
    } catch {
      // Fail silently if server is down
    }
  }

  private print(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const duration = entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : '';
    const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';

    switch (entry.level) {
      case 'error':
        console.error(`${prefix} ${entry.event}${duration}${metaStr}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${entry.event}${duration}${metaStr}`);
        break;
      case 'success':
        console.log(`%c${prefix} ${entry.event}${duration}${metaStr}`, 'color: #10b981');
        break;
      default:
        console.log(`${prefix} ${entry.event}${duration}${metaStr}`);
    }
  }
}

/** Singleton logger instance used across the application. */
export const logger = new Logger();
