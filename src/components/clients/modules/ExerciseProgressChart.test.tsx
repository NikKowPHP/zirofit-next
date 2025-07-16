
import { renderWithIntl, screen } from "../../../tests/test-utils";
import "@testing-library/jest-dom";
import ExerciseProgressChart from "./ExerciseProgressChart";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClientExerciseLog } from "@/app/clients/actions";

// Mock the charting library
jest.mock("react-chartjs-2", () => ({
  Line: (props: { data: any }) => {
    // We can use the data prop to verify calculations
    return (
      <canvas
        data-testid="mock-chart"
        data-chartdata={JSON.stringify(props.data)}
      />
    );
  },
}));

// Mock the EmptyState component to simplify testing
jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));

const mockLogs: ClientExerciseLog[] = [
  {
    id: "log1",
    clientId: "c1",
    exerciseId: "e1",
    logDate: new Date("2025-01-01"),
    sets: JSON.parse(
      '[{"reps": 10, "weight": 50}, {"reps": 8, "weight": 55}]',
    ) as any, // Total Volume: 500 + 440 = 940
    createdAt: new Date(),
    updatedAt: new Date(),
    exercise: {
      id: "e1",
      name: "Bench Press",
      muscleGroup: "Chest",
      equipment: "Barbell",
      description: null,
    },
  },
  {
    id: "log2",
    clientId: "c1",
    exerciseId: "e1",
    logDate: new Date("2025-01-08"),
    sets: JSON.parse(
      '[{"reps": 10, "weight": 55}, {"reps": 8, "weight": 60}]',
    ) as any, // Total Volume: 550 + 480 = 1030
    createdAt: new Date(),
    updatedAt: new Date(),
    exercise: {
      id: "e1",
      name: "Bench Press",
      muscleGroup: "Chest",
      equipment: "Barbell",
      description: null,
    },
  },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return renderWithIntl(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("ExerciseProgressChart", () => {
  it("renders the EmptyState component when there are fewer than 2 logs", () => {
    renderWithTheme(<ExerciseProgressChart logs={[mockLogs[0]]} />);
    expect(screen.getByText("Not Enough Data")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-chart")).not.toBeInTheDocument();
  });

  it("renders the chart when there are 2 or more logs", () => {
    renderWithTheme(<ExerciseProgressChart logs={mockLogs} />);
    expect(screen.queryByText("Not Enough Data")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
  });

  it("calculates total volume correctly for the chart data", () => {
    renderWithTheme(<ExerciseProgressChart logs={mockLogs} />);
    const chart = screen.getByTestId("mock-chart");
    const chartData = JSON.parse(chart.getAttribute("data-chartdata") || "{}");

    // Check dataset label
    expect(chartData.datasets[0].label).toBe("Total Volume (reps * weight)");

    // Check calculated y-values (total volume)
    const dataPoints = chartData.datasets[0].data;
    expect(dataPoints).toHaveLength(2);
    expect(dataPoints[0].y).toBe(940); // 10*50 + 8*55
    expect(dataPoints[1].y).toBe(1030); // 10*55 + 8*60
  });

  it("handles logs with sets that are not arrays or have non-numeric values", () => {
    const brokenLogs: any[] = [
      ...mockLogs,
      {
        id: "log3",
        logDate: new Date("2025-01-15"),
        sets: JSON.parse('[{"reps": "a", "weight": 60}]'), // non-numeric reps
        exercise: { name: "Bench Press" },
      },
      {
        id: "log4",
        logDate: new Date("2025-01-20"),
        sets: "not-an-array", // invalid sets type
        exercise: { name: "Bench Press" },
      },
    ];
    renderWithTheme(<ExerciseProgressChart logs={brokenLogs} />);
    const chart = screen.getByTestId("mock-chart");
    const chartData = JSON.parse(chart.getAttribute("data-chartdata") || "{}");
    const dataPoints = chartData.datasets[0].data;
    expect(dataPoints).toHaveLength(4);
    expect(dataPoints[0].y).toBe(940);
    expect(dataPoints[1].y).toBe(1030);
    expect(dataPoints[2].y).toBe(0); // 'a' * 60 should result in 0
    expect(dataPoints[3].y).toBe(0); // "not-an-array" should result in 0
  });
});