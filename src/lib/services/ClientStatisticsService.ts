import { Prisma } from "@prisma/client";

type ClientMeasurement = Prisma.ClientMeasurementGetPayload<{}>;

export const getWeightProgress = (measurements: ClientMeasurement[]) => {
  return measurements.map((measurement) => ({
    x: measurement.measurementDate,
    y: measurement.weightKg,
  }));
};

export const getBodyFatProgress = (measurements: ClientMeasurement[]) => {
  return measurements.map((measurement) => ({
    x: measurement.measurementDate,
    y: measurement.bodyFatPercentage,
  }));
};

export const getCustomMetricProgress = (measurements: ClientMeasurement[], metricName: string) => {
  return measurements.map((measurement) => {
    const customMetrics = typeof measurement.customMetrics === 'string'
      ? JSON.parse(measurement.customMetrics)
      : (measurement.customMetrics || []) as { name: string; value: string }[];
    const metric = customMetrics.find((m: { name: string; value: string }) => m.name === metricName);
    return {
      x: measurement.measurementDate,
      y: metric ? parseFloat(metric.value) : null,
    };
  });
};
