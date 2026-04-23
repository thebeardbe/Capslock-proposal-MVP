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

const App: React.FC = () => {
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (csvText: string) => {
    setIsLoading(true);
    setError(null);
    const pipelineStart = performance.now();
    logger.info('Pipeline started: file upload received');
    
    try {
      // 1. Parse CSV
      const rows = CSVParser.parse(csvText);
      
      // 2. Aggregate Data
      logger.info('Aggregation started');
      const comparison = WoWAggregator.aggregate(rows);
      const changes = WoWAggregator.findSignificantChanges(rows);
      logger.success('Aggregation complete', { significantChanges: changes.length });
      
      // 3. Generate Brief
      const generatedBrief = await BriefGenerator.generate(comparison, changes);
      
      const totalMs = Math.round(performance.now() - pipelineStart);
      logger.success('Pipeline complete', { totalRows: rows.length }, totalMs);
      setBrief(generatedBrief);
    } catch (err: any) {
      logger.error('Pipeline failed', { error: err.message || 'Unknown error' });
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
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

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Autonomous Micro-Agency</h1>
        <p className="subtitle">Weekly Performance Brief MVP</p>
      </header>

      <main>
        {!brief ? (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <UploadZone onUpload={handleUpload} isLoading={isLoading} />
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
        <p>&copy; 2024 CapsLock. Internal Performance Analysis Tool.</p>
      </footer>
    </div>
  );
};

export default App;
