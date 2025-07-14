import { render, screen } from "@testing-library/react";
import DashboardContent from "./DashboardContent";
import { ThemeProvider } from "@/context/ThemeContext";
import useSWR from "swr";

jest.mock("swr");

const mockedUseSWR = useSWR as jest.Mock;

describe("DashboardContent", () => {
  it("should render all skeleton components when loading", () => {
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    render(
      <ThemeProvider>
        <DashboardContent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("skeleton-at-a-glance-stats")).toBeInTheDocument();
    expect(
      screen.getByTestId("skeleton-profile-checklist"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-activity-feed")).toBeInTheDocument();
  });

  it("should display an error message when data fetching fails", () => {
    mockedUseSWR.mockReturnValue({
      data: null,
      error: new Error("API Error"),
      isLoading: false,
    });

    render(
      <ThemeProvider>
        <DashboardContent />
      </ThemeProvider>,
    );

    expect(
      screen.getByText("Failed to load dashboard"),
    ).toBeInTheDocument();
  });

  it("should render the dashboard with data when fetching succeeds", () => {
    const mockData = {
      activeClients: 10,
      sessionsThisMonth: 25,
      pendingClients: 3,
      profile: {
        profilePhotoPath: "/photo.jpg",
        bannerImagePath: "/banner.jpg",
        aboutMe: "About me text",
        services: [{ id: "1" }],
        testimonials: [{ id: "1" }],
        benefits: [{ id: "1" }, { id: "2" }],
        transformationPhotos: [{ id: "1" }],
      },
      activityFeed: [],
      clientProgressData: [],
      monthlyActivityData: [],
    };

    mockedUseSWR.mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false,
    });

    render(
      <ThemeProvider>
        <DashboardContent />
      </ThemeProvider>,
    );

    // Assert that skeleton loaders are not present
    expect(
      screen.queryByTestId("skeleton-at-a-glance-stats"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("skeleton-profile-checklist"),
    ).not.toBeInTheDocument();

    // Assert that AtAGlanceStats is rendered with the correct props
    expect(screen.getByText("At a Glance")).toBeInTheDocument();
    expect(
      screen.getByText("Active Clients").nextElementSibling,
    ).toHaveTextContent("10");
    expect(
      screen.getByText("Sessions This Month").nextElementSibling,
    ).toHaveTextContent("25");
    expect(
      screen.getByText("Pending Clients").nextElementSibling,
    ).toHaveTextContent("3");
  });
});