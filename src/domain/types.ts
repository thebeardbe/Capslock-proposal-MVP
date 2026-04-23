export interface CampaignRow {
  date: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export interface MetricSummary {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

export interface WoWComparison {
  thisWeek: MetricSummary;
  lastWeek: MetricSummary;
  deltas: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    ctr: number;
    cpa: number;
  };
}

export interface SignificantChange {
  campaignName: string;
  metric: string;
  oldValue: number;
  newValue: number;
  deltaPercent: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface WeeklyBrief {
  overallWoW: WoWComparison;
  significantChanges: SignificantChange[];
  textualSummary: string;
  tacticalRecommendations: string[];
}
