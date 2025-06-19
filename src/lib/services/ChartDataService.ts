interface ProgressDataPoint {
  date: Date;
  value: number;
}

interface ActivityDataPoint {
  week: number;
  count: number;
}

interface ChartReadyData {
  x: string | number;
  y: number;
}

export const ChartDataService = {
  formatProgressData(data: ProgressDataPoint[]): ChartReadyData[] {
    if (!Array.isArray(data)) {
      throw new Error('Invalid input: expected array of ProgressDataPoint');
    }
    return data.map(point => ({
      x: point.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      y: point.value
    }));
  },

  formatActivityData(data: ActivityDataPoint[]): ChartReadyData[] {
    if (!Array.isArray(data)) {
      throw new Error('Invalid input: expected array of ActivityDataPoint');
    }
    return data.map(point => ({
      x: `Week ${point.week}`,
      y: point.count
    }));
  }
};