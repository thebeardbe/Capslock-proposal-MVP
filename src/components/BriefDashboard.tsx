import React from 'react';
import { WeeklyBrief } from '../domain/types';
import { MetricCard } from './MetricCard';

interface BriefDashboardProps {
  brief: WeeklyBrief;
}

export const BriefDashboard: React.FC<BriefDashboardProps> = ({ brief }) => {
  const { overallWoW, textualSummary, tacticalRecommendations, significantChanges } = brief;

  const handleCopy = () => {
    navigator.clipboard.writeText(textualSummary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="brief-dashboard animate-fade-in">
      <div className="metric-grid">
        <MetricCard 
          label="Ad Spend" 
          value={overallWoW.thisWeek.cost.toFixed(2)} 
          delta={overallWoW.deltas.cost} 
          prefix="$" 
        />
        <MetricCard 
          label="Conversions" 
          value={overallWoW.thisWeek.conversions} 
          delta={overallWoW.deltas.conversions} 
        />
        <MetricCard 
          label="Cost Per Acquisition" 
          value={overallWoW.thisWeek.cpa.toFixed(2)} 
          delta={overallWoW.deltas.cpa} 
          prefix="$" 
          reverseColor 
        />
        <MetricCard 
          label="Click-Through Rate" 
          value={overallWoW.thisWeek.ctr.toFixed(2)} 
          delta={overallWoW.deltas.ctr} 
          suffix="%" 
        />
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Weekly Brief</h2>
          <button className="copy-btn" onClick={handleCopy}>Copy Summary</button>
        </div>
        <p style={{ lineHeight: 1.6, color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
          {textualSummary}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Tactical Checks</h3>
          <ul style={{ listStyle: 'none' }}>
            {tacticalRecommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--primary)' }}>•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Significant Shifts</h3>
          {significantChanges.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No major campaign shifts detected.</p>
          ) : (
            significantChanges.map((change, i) => (
              <div key={i} style={{ padding: '0.75rem 0', borderBottom: i < significantChanges.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{change.campaignName}</span>
                  <span className={change.impact === 'negative' ? 'delta-down' : 'delta-up'}>
                    {change.deltaPercent > 0 ? '+' : ''}{change.deltaPercent.toFixed(1)}% {change.metric}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
