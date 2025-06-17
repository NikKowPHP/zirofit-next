import { ChartDataService } from './ChartDataService';

describe('ChartDataService', () => {
  it('should exist', () => {
    expect(ChartDataService).toBeDefined();
  });

  it('should have formatProgressData method', () => {
    expect(ChartDataService.formatProgressData).toBeInstanceOf(Function);
  });

  it('should have formatActivityData method', () => {
    expect(ChartDataService.formatActivityData).toBeInstanceOf(Function);
  });
});