import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta: number;
  prefix?: string;
  suffix?: string;
  reverseColor?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, value, delta, prefix = '', suffix = '', reverseColor = false 
}) => {
  const isUp = delta > 0;
  const isNeutral = Math.abs(delta) < 0.1;
  
  // Logic for color: usually Up is Good (Green), but for CPA Up is Bad (Red)
  const isGood = reverseColor ? !isUp : isUp;
  const colorClass = isNeutral ? '' : (isGood ? 'delta-up' : 'delta-down');
  const deltaSymbol = isUp ? '↑' : '↓';

  return (
    <div className="metric-card animate-fade-in">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{prefix}{value}{suffix}</div>
      <div className={`metric-delta ${colorClass}`}>
        {!isNeutral && `${deltaSymbol} ${Math.abs(delta).toFixed(1)}% `}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>vs last week</span>
      </div>
    </div>
  );
};
