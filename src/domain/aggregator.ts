import { CampaignRow, WoWComparison, MetricSummary, SignificantChange } from './types';

export class WoWAggregator {
  static aggregate(data: CampaignRow[]): WoWComparison {
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedData.length === 0) throw new Error('No data to aggregate.');

    const newestDate = new Date(sortedData[0].date);
    const midPoint = new Date(newestDate);
    midPoint.setDate(midPoint.getDate() - 7);
    const startPoint = new Date(midPoint);
    startPoint.setDate(startPoint.getDate() - 7);

    const thisWeekRows = data.filter(row => {
      const d = new Date(row.date);
      return d > midPoint && d <= newestDate;
    });

    const lastWeekRows = data.filter(row => {
      const d = new Date(row.date);
      return d > startPoint && d <= midPoint;
    });

    const thisWeek = this.calculateMetrics(thisWeekRows);
    const lastWeek = this.calculateMetrics(lastWeekRows);

    return {
      thisWeek,
      lastWeek,
      deltas: {
        impressions: this.calculateDelta(thisWeek.impressions, lastWeek.impressions),
        clicks: this.calculateDelta(thisWeek.clicks, lastWeek.clicks),
        cost: this.calculateDelta(thisWeek.cost, lastWeek.cost),
        conversions: this.calculateDelta(thisWeek.conversions, lastWeek.conversions),
        ctr: this.calculateDelta(thisWeek.ctr, lastWeek.ctr),
        cpa: this.calculateDelta(thisWeek.cpa, lastWeek.cpa),
      }
    };
  }

  private static calculateMetrics(rows: CampaignRow[]): MetricSummary {
    const totals = rows.reduce((acc, row) => ({
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      cost: acc.cost + row.cost,
      conversions: acc.conversions + row.conversions,
    }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
    const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0;

    return { ...totals, ctr, cpc, cpa };
  }

  private static calculateDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static findSignificantChanges(data: CampaignRow[]): SignificantChange[] {
    // Group by campaign and calculate WoW per campaign
    const campaigns = Array.from(new Set(data.map(r => r.campaignName)));
    const changes: SignificantChange[] = [];

    campaigns.forEach(name => {
      const campaignData = data.filter(r => r.campaignName === name);
      const comparison = this.aggregate(campaignData);

      // Heuristic: CPA increase > 20% with significant spend
      if (comparison.deltas.cpa > 20 && comparison.thisWeek.cost > 100) {
        changes.push({
          campaignName: name,
          metric: 'CPA',
          oldValue: comparison.lastWeek.cpa,
          newValue: comparison.thisWeek.cpa,
          deltaPercent: comparison.deltas.cpa,
          impact: 'negative'
        });
      }

      // Heuristic: Conversion drop > 15%
      if (comparison.deltas.conversions < -15 && comparison.lastWeek.conversions > 5) {
        changes.push({
          campaignName: name,
          metric: 'Conversions',
          oldValue: comparison.lastWeek.conversions,
          newValue: comparison.thisWeek.conversions,
          deltaPercent: comparison.deltas.conversions,
          impact: 'negative'
        });
      }
    });

    return changes;
  }
}
