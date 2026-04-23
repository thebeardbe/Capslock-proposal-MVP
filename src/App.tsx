import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { BriefDashboard } from './components/BriefDashboard';
import { CSVParser } from './domain/parser';
import { WoWAggregator } from './domain/aggregator';
import { BriefGenerator } from './domain/briefGenerator';
import { WeeklyBrief } from './domain/types';
import './index.css';

const App: React.FC = () => {
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (csvText: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Parse CSV
      const rows = CSVParser.parse(csvText);
      
      // 2. Aggregate Data
      const comparison = WoWAggregator.aggregate(rows);
      const changes = WoWAggregator.findSignificantChanges(rows);
      
      // 3. Generate Brief
      const generatedBrief = await BriefGenerator.generate(comparison, changes);
      
      setBrief(generatedBrief);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
  };

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
