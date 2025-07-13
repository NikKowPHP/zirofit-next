// src/components/clients/ClientDetailView.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClientDetailView from "./ClientDetailView";

// Mock lazy-loaded components
jest.mock("./modules/ClientStatistics", () => {
  const MockComponent = () => <div>Client Statistics Content</div>;
  MockComponent.displayName = "ClientStatistics";
  return MockComponent;
});
jest.mock("./modules/ManageClientMeasurements", () => {
  const MockComponent = () => <div>Manage Measurements Content</div>;
  MockComponent.displayName = "ManageClientMeasurements";
  return MockComponent;
});
jest.mock("./modules/ManageClientProgressPhotos", () => {
  const MockComponent = () => <div>Manage Photos Content</div>;
  MockComponent.displayName = "ManageClientProgressPhotos";
  return MockComponent;
});
jest.mock("./modules/ManageClientSessionLogs", () => {
  const MockComponent = () => <div>Manage Logs Content</div>;
  MockComponent.displayName = "ManageClientSessionLogs";
  return MockComponent;
});

const mockClient = {
  id: "1",
  name: "Test Client",
  measurements: [],
  progressPhotos: [],
  sessionLogs: [],
} as any;

describe("ClientDetailView", () => {
  it("renders tabs and default content", async () => {
    render(<ClientDetailView client={mockClient} />);
    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByText("Measurements")).toBeInTheDocument();
    expect(screen.getByText("Progress Photos")).toBeInTheDocument();
    expect(screen.getByText("Session Logs")).toBeInTheDocument();

    // Default tab is Statistics, wait for it to appear
    expect(
      await screen.findByText("Client Statistics Content"),
    ).toBeInTheDocument();
  });

  it("switches to the correct tab when clicked", async () => {
    render(<ClientDetailView client={mockClient} />);

    // Click on the "Measurements" tab
    fireEvent.click(screen.getByText("Measurements"));

    // Check if the content for the measurements tab is now visible
    expect(await screen.findByText("Manage Measurements Content")).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByText("Client Statistics Content"),
      ).not.toBeInTheDocument();
    });

    // Click on the "Session Logs" tab
    fireEvent.click(screen.getByText("Session Logs"));
    expect(await screen.findByText("Manage Logs Content")).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByText("Manage Measurements Content"),
      ).not.toBeInTheDocument();
    });
  });
});