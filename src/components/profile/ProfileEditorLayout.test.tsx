import React from "react";
import { renderWithIntl as render, screen, fireEvent, waitFor } from "../../../tests/test-utils";
import "@testing-library/jest-dom";
import ProfileEditorLayout from "./ProfileEditorLayout";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("section=core-info"),
  usePathname: () => "/profile/edit",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock lazy-loaded section components
jest.mock("./sections/CoreInfoEditor", () => {
  const MockCoreInfoEditor = () => <div>Core Info Editor</div>;
  MockCoreInfoEditor.displayName = "CoreInfoEditor";
  return MockCoreInfoEditor;
});
jest.mock("./sections/BrandingEditor", () => {
  const MockBrandingEditor = () => <div>Branding Editor</div>;
  MockBrandingEditor.displayName = "BrandingEditor";
  return MockBrandingEditor;
});

const mockInitialData = {
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  profile: {
    id: "p1",
    services: [],
    testimonials: [],
    transformationPhotos: [],
    externalLinks: [],
    socialLinks: [],
    benefits: [],
  },
} as any;

describe("ProfileEditorLayout", () => {
  it("renders the sidebar and the default section", async () => {
    render(<ProfileEditorLayout initialData={mockInitialData} />);

    // Check if sidebar is rendered
    expect(screen.getByText("Profile Sections")).toBeInTheDocument();
    expect(screen.getByText("Core Info")).toBeInTheDocument();
    expect(screen.getByText("Branding")).toBeInTheDocument();

    // Check if the default section (Core Info) is rendered
    expect(await screen.findByText("Core Info Editor")).toBeInTheDocument();
  });

  it("changes the displayed section when a sidebar item is clicked", async () => {
    render(<ProfileEditorLayout initialData={mockInitialData} />);

    // Initially, Core Info is shown
    expect(await screen.findByText("Core Info Editor")).toBeInTheDocument();
    expect(screen.queryByText("Branding Editor")).not.toBeInTheDocument();

    // Click on the "Branding" button in the sidebar
    fireEvent.click(screen.getByText("Branding"));

    // Wait for the new section to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Branding Editor")).toBeInTheDocument();
    });

    // The old section should no longer be visible
    expect(screen.queryByText("Core Info Editor")).not.toBeInTheDocument();
  });
});