import { CampaignRow } from './types';
import { logger } from './logger';

export class CSVParser {
  /**
   * Simple CSV parser for browsers/environments without external dependencies.
   * Handles basic CSV structure with headers.
   */
  static parse(csvText: string): CampaignRow[] {
    const start = performance.now();
    logger.info('CSV parse started');

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      logger.error('CSV parse failed', { reason: 'empty or missing data' });
      throw new Error('CSV file is empty or missing data.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Required fields check
    const required = ['date', 'campaign name', 'impressions', 'clicks', 'cost', 'conversions'];
    const missing = required.filter(r => !headers.includes(r));
    
    if (missing.length > 0) {
      logger.error('CSV validation failed', { missingColumns: missing.join(', ') });
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => headerMap[h] = i);

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      
      try {
        return {
          date: values[headerMap['date']],
          campaignName: values[headerMap['campaign name']],
          impressions: parseInt(values[headerMap['impressions']]) || 0,
          clicks: parseInt(values[headerMap['clicks']]) || 0,
          cost: parseFloat(values[headerMap['cost']]) || 0,
          conversions: parseFloat(values[headerMap['conversions']]) || 0,
        };
      } catch (e) {
        logger.error('Row parse error', { row: index + 1 });
        throw new Error(`Error parsing row ${index + 1}. Ensure all numeric fields are valid.`);
      }
    });

    const durationMs = Math.round(performance.now() - start);
    logger.success('CSV parsed successfully', { rowCount: rows.length, columnCount: headers.length }, durationMs);
    return rows;
  }
}
