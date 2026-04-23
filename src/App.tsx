import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { BriefDashboard } from './components/BriefDashboard';
import { LogViewer } from './components/LogViewer';
import { CSVParser } from './domain/parser';
import { WoWAggregator } from './domain/aggregator';
import { BriefGenerator } from './domain/briefGenerator';
import { WeeklyBrief } from './domain/types';
import { logger } from './domain/logger';
import './index.css';

type ProgressState = 'idle' | 'parsing' | 'aggregating' | 'generating' | 'complete';

const mockFiles = [
  { name: "Client 1", file: "google_ads_daily_performance_client_1.csv" },
  { name: "Client 2", file: "google_ads_daily_performance_client_2.csv" },
  { name: "Client 3", file: "google_ads_daily_performance_client_3.csv" },
  { name: "Client 4", file: "google_ads_daily_performance_client_4.csv" },
  { name: "Client 5", file: "google_ads_daily_performance_client_5.csv" },
  { name: "Version 3", file: "google_ads_daily_performance_v3.csv" },
];

const App: React.FC = () => {
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [progress, setProgress] = useState<ProgressState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleRunMock = async (filename: string) => {
    try {
      setProgress('parsing');
      setError(null);
      const res = await fetch(`/${filename}`);
      if (!res.ok) throw new Error(`Could not load ${filename}`);
      const text = await res.text();
      // Directly call handleUpload with the fetched text
      handleUpload(text);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load mock file.");
      setProgress('idle');
    }
  };

  const handleUpload = async (csvText: string) => {
    setProgress('parsing');
    setError(null);
    const pipelineStart = performance.now();
    logger.info('Pipeline started: file upload received');
    
    try {
      // 1. Parse CSV
      const rows = CSVParser.parse(csvText);
      
      // 2. Aggregate Data
      setProgress('aggregating');
      logger.info('Aggregation started');
      const comparison = WoWAggregator.aggregate(rows);
      const changes = WoWAggregator.findSignificantChanges(rows);
      logger.success('Aggregation complete', { significantChanges: changes.length });
      
      // 3. Generate Brief
      setProgress('generating');
      const generatedBrief = await BriefGenerator.generate(comparison, changes);
      
      const totalMs = Math.round(performance.now() - pipelineStart);
      logger.success('Pipeline complete', { totalRows: rows.length }, totalMs);
      setProgress('complete');
      setBrief(generatedBrief);
    } catch (err: any) {
      logger.error('Pipeline failed', { error: err.message || 'Unknown error' });
      setError(err.message || 'An error occurred while processing the file.');
      setProgress('idle');
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
    setProgress('idle');
  };

  // Simple path-based routing (no library needed)
  const isLogPage = window.location.pathname === '/filip';

  if (isLogPage) {
    return (
      <div className="app-container">
        <LogViewer />
      </div>
    );
  }

  const getProgressPercentage = () => {
    switch (progress) {
      case 'idle': return 0;
      case 'parsing': return 20;
      case 'aggregating': return 40;
      case 'generating': return 85;
      case 'complete': return 100;
    }
  };

  const getProgressText = () => {
    switch (progress) {
      case 'idle': return '';
      case 'parsing': return 'Parsing CSV Data...';
      case 'aggregating': return 'Calculating Week-over-Week Metrics...';
      case 'generating': return 'Generating AI Insights (Gemini 3.1 Flash)...';
      case 'complete': return 'Brief Generation Complete!';
    }
  };

  return (
    <div className="app-container">
      {/* New CapsLock Themed Header */}
      <header className="top-header">
        <a href="/" className="logo-container">
          <img src="/logo.jpg" alt="CapsLock Logo" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
          <span>CapsLock</span>
        </a>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--brand-green)' }}>Home</span>
          <div className="dropdown">
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Test Examples <span style={{ fontSize: '0.7em' }}>▼</span>
            </span>
            <div className="dropdown-content">
              {mockFiles.map(m => (
                <div key={m.file} className="dropdown-item">
                  <button className="dropdown-btn" onClick={() => handleRunMock(m.file)}>
                    Run {m.name}
                  </button>
                  <a href={`/${m.file}`} download title="Download CSV" className="download-icon">
                    ↓
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', cursor: 'pointer' }}>CONTACT US &rarr;</div>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Services</h1>
        <p className="subtitle">Taking your business to the next level</p>
      </div>

      <main>
        {!brief ? (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <UploadZone onUpload={handleUpload} isLoading={progress !== 'idle' && progress !== 'complete'} />
            
            {progress !== 'idle' && (
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className="progress-status">
                  <span>{getProgressText()}</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--danger)', marginTop: '1rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="copy-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={handleReset}>
                Upload New File
              </button>
            </div>
            <BriefDashboard brief={brief} />
          </div>
        )}
      </main>

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>&copy; 2026 <a href="https://www.bunkens.be" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-blue)', textDecoration: 'none' }}>Filip Bunkens</a> made for CapsLock.</p>
      </footer>
    </div>
  );
};

export default App;
