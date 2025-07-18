
import { renderWithIntl, screen } from "../../../../tests/test-utils";
import DashboardContent from "./DashboardContent";
import { ThemeProvider } from "@/context/ThemeContext";
import useSWR from "swr";

jest.mock("swr");

const mockedUseSWR = useSWR as jest.Mock;

describe("DashboardContent", () => {
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
    clientProgressData: [
      { x: "2025-01-01", y: 80 },
      { x: "2025-01-08", y: 79 },
    ],
    monthlyActivityData: [{ x: "Week 1", y: 5 }],
  };

  it("should render all skeleton components when loading without initialData", () => {
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithIntl(
      <ThemeProvider>
        <DashboardContent initialData={null} />
      </ThemeProvider>,
    );

    expect(
      screen.getByTestId("skeleton-at-a-glance-stats"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("skeleton-profile-checklist"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-activity-feed")).toBeInTheDocument();
  });

  it("should display an error message when data fetching fails and there's no initialData", () => {
    mockedUseSWR.mockReturnValue({
      data: null,
      error: new Error("API Error"),
      isLoading: false,
    });

    renderWithIntl(
      <ThemeProvider>
        <DashboardContent initialData={null} />
      </ThemeProvider>,
    );

    expect(screen.getByText("Failed to load dashboard")).toBeInTheDocument();
  });

  it("should render immediately with initialData without showing skeletons", () => {
    mockedUseSWR.mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false, // With fallbackData (from initialData), isLoading is false on first render
    });

    renderWithIntl(
      <ThemeProvider>
        <DashboardContent initialData={mockData} />
      </ThemeProvider>,
    );

    // Assert that skeleton loaders are NOT present
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

    // Assert translated chart titles are rendered
    expect(screen.getByText("Client Progress (Weight)")).toBeInTheDocument();
    expect(screen.getByText("Monthly Activity")).toBeInTheDocument();
  });
});