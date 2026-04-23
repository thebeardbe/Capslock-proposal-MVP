import { WoWComparison, SignificantChange, WeeklyBrief } from './types';
import { logger } from './logger';

export class BriefGenerator {
  private static API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  private static ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  static async generate(comparison: WoWComparison, changes: SignificantChange[]): Promise<WeeklyBrief> {
    const start = performance.now();
    let summary = '';
    
    if (this.API_KEY) {
      try {
        logger.info('Gemini API call started', { model: 'gemini-1.5-flash' });
        summary = await this.fetchGeminiSummary(comparison, changes);
        logger.success('Gemini API call completed');
      } catch (e) {
        logger.error('Gemini API failed, falling back to template', { error: String(e) });
        summary = this.generateTemplateSummary(comparison, changes);
      }
    } else {
      logger.warn('No Gemini API key found, using template generator');
      summary = this.generateTemplateSummary(comparison, changes);
    }

    const recommendations = this.generateRecommendations(comparison, changes);
    const durationMs = Math.round(performance.now() - start);
    logger.success('Brief generation complete', { significantChanges: changes.length, recommendations: recommendations.length }, durationMs);

    return {
      overallWoW: comparison,
      significantChanges: changes,
      textualSummary: summary,
      tacticalRecommendations: recommendations
    };
  }

  private static async fetchGeminiSummary(comparison: WoWComparison, changes: SignificantChange[]): Promise<string> {
    const prompt = `
      Act as a senior performance marketer. Analyze this Week-over-Week (WoW) data and write a 2-3 paragraph brief for an account manager.
      
      OVERALL PERFORMANCE:
      - Spend: $${comparison.thisWeek.cost.toFixed(2)} (${comparison.deltas.cost.toFixed(1)}% WoW)
      - Conversions: ${comparison.thisWeek.conversions} (${comparison.deltas.conversions.toFixed(1)}% WoW)
      - CPA: $${comparison.thisWeek.cpa.toFixed(2)} (${comparison.deltas.cpa.toFixed(1)}% WoW)
      - CTR: ${comparison.thisWeek.ctr.toFixed(2)}% (${comparison.deltas.ctr.toFixed(1)}% WoW)

      SIGNIFICANT CHANGES:
      ${changes.map(c => `- ${c.campaignName}: ${c.metric} ${c.deltaPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(c.deltaPercent).toFixed(1)}%`).join('\n')}

      Focus on "what changed" and "why it matters". Be concise and professional.
    `;

    const response = await fetch(`${this.ENDPOINT}?key=${this.API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static generateTemplateSummary(comparison: WoWComparison, changes: SignificantChange[]): string {
    const costDir = comparison.deltas.cost > 0 ? 'increased' : 'decreased';
    const convDir = comparison.deltas.conversions > 0 ? 'up' : 'down';
    
    return `This week, total spend ${costDir} by ${Math.abs(comparison.deltas.cost).toFixed(1)}%, resulting in ${comparison.thisWeek.conversions} conversions (which is ${convDir} ${Math.abs(comparison.deltas.conversions).toFixed(1)}% WoW). The average CPA is currently $${comparison.thisWeek.cpa.toFixed(2)}. 
    
    We observed ${changes.length} significant campaign-level shifts that require attention, particularly around efficiency deltas in top-performing sets.`;
  }

  private static generateRecommendations(comparison: WoWComparison, changes: SignificantChange[]): string[] {
    const recs: string[] = [
      'Check top-performing campaign creative fatigue.',
      'Review daily budget pacing for the upcoming week.'
    ];

    if (comparison.deltas.cpa > 10) {
      recs.push('Audit landing page load times and tracking pixels for possible breakage.');
    }

    changes.forEach(c => {
      if (c.impact === 'negative') {
        recs.push(`Investigate ${c.campaignName} for sudden ${c.metric} performance drop.`);
      }
    });

    return recs.slice(0, 5);
  }
}
