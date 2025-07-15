import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClientProgressChart from "./ClientProgressChart";
import { ThemeProvider } from "@/context/ThemeContext";

jest.mock("react-chartjs-2", () => ({
  Line: () => <canvas data-testid="mock-chart-line" />,
}));

describe("ClientProgressChart", () => {
  const testData = [
    { x: "2025-01-01", y: 65 },
    { x: "2025-01-08", y: 63 },
    { x: "2025-01-15", y: 64 },
  ];

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it("renders a canvas element for the chart", () => {
    renderWithProvider(<ClientProgressChart data={testData} />);
    expect(screen.getByTestId("chart-canvas")).toBeInTheDocument();
    // Also check for the mocked canvas
    expect(screen.getByTestId("mock-chart-line")).toBeInTheDocument();
  });

  it("displays the chart title when provided", () => {
    renderWithProvider(
      <ClientProgressChart data={testData} title="Client Progress" />,
    );
    expect(screen.getByText("Client Progress")).toBeInTheDocument();
  });

  it("does not display title when not provided", () => {
    renderWithProvider(<ClientProgressChart data={testData} />);
    expect(screen.queryByText("Client Progress")).not.toBeInTheDocument();
  });
});