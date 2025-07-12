import { render, screen } from "@testing-library/react";
import DashboardContent from "./DashboardContent";

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: true,
  })),
}));

describe("DashboardContent", () => {
  it("should render all skeleton components when loading", () => {
    render(<DashboardContent />);

    expect(screen.getByTestId("skeleton-at-a-glance")).toBeInTheDocument();
    expect(
      screen.getByTestId("skeleton-profile-checklist"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-activity-feed")).toBeInTheDocument();
  });
});