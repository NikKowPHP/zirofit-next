import { ChartDataService } from './ChartDataService';

describe('ChartDataService', () => {
  // Basic existence checks
  it('should exist', () => {
    expect(ChartDataService).toBeDefined();
  });

  it('should have formatProgressData method', () => {
    expect(ChartDataService.formatProgressData).toBeInstanceOf(Function);
  });

  it('should have formatActivityData method', () => {
    expect(ChartDataService.formatActivityData).toBeInstanceOf(Function);
  });

  // Progress data formatting tests
  describe('formatProgressData', () => {
    const sampleData = [
      { date: new Date('2025-01-01'), value: 75 },
      { date: new Date('2025-01-02'), value: 80 }
    ];

    it('should format progress data correctly', () => {
      const result = ChartDataService.formatProgressData(sampleData);
      expect(result).toEqual([
        { x: '2025-01-01', y: 75 },
        { x: '2025-01-02', y: 80 }
      ]);
    });

    it('should handle empty array', () => {
      const result = ChartDataService.formatProgressData([]);
      expect(result).toEqual([]);
    });

    it('should throw error for invalid input', () => {
      expect(() => ChartDataService.formatProgressData(null as any)).toThrow('Invalid input: expected array of ProgressDataPoint');
    });
  });

  // Activity data formatting tests
  describe('formatActivityData', () => {
    const sampleData = [
      { week: 1, count: 5 },
      { week: 2, count: 8 }
    ];

    it('should format activity data correctly', () => {
      const result = ChartDataService.formatActivityData(sampleData);
      expect(result).toEqual([
        { x: 'Week 1', y: 5 },
        { x: 'Week 2', y: 8 }
      ]);
    });

    it('should handle empty array', () => {
      const result = ChartDataService.formatActivityData([]);
      expect(result).toEqual([]);
    });

    it('should throw error for invalid input', () => {
      expect(() => ChartDataService.formatActivityData('invalid' as any)).toThrow('Invalid input: expected array of ActivityDataPoint');
    });
  });
});