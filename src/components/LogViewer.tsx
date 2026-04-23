import React, { useState, useEffect } from 'react';
import { logger, LogEntry } from '../domain/logger';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ReadonlyArray<LogEntry>>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      const persisted = await logger.fetchPersistedLogs();
      setLogs(persisted);
    };
    fetchLogs();
    // Poll the server for new entries every 2 seconds
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const levelColor = (level: string) => {
    switch (level) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
      }}>
        System Logs
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Internal diagnostics — {logs.length} entries captured
      </p>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'info', 'success', 'warn', 'error'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '0.5rem',
              border: filter === level ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: filter === level ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: filter === level ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {level}
          </button>
        ))}

        <button
          onClick={() => { logger.clear(); setLogs([]); }}
          style={{
            marginLeft: 'auto',
            padding: '0.4rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'transparent',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Clear Logs
        </button>
      </div>

      {/* Log Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No log entries yet. Upload a CSV to generate activity.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.15s',
                }}>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span style={{
                      color: levelColor(entry.level),
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {entry.level}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-main)' }}>
                    {entry.event}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {entry.durationMs !== undefined ? `${entry.durationMs}ms` : '—'}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.meta ? JSON.stringify(entry.meta) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
