import { PrismaClient } from "@prisma/client";

type ClientMeasurement = PrismaClient["clientMeasurement"];

export const getWeightProgress = (measurements: ClientMeasurement[]) => {
  return measurements.map((measurement) => ({
    x: measurement.sessionDate,
    y: measurement.weightKg,
  }));
};

export const getBodyFatProgress = (measurements: ClientMeasurement[]) => {
  return measurements.map((measurement) => ({
    x: measurement.sessionDate,
    y: measurement.bodyFatPercentage,
  }));
};

export const getCustomMetricProgress = (measurements: ClientMeasurement[], metricName: string) => {
  return measurements.map((measurement) => {
    const customMetrics = JSON.parse(measurement.customMetrics || "[]");
    const metric = customMetrics.find((m: { name: string; value: string }) => m.name === metricName);
    return {
      x: measurement.sessionDate,
      y: metric ? parseFloat(metric.value) : null,
    };
  });
};