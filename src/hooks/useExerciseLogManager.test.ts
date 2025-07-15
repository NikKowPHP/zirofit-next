
import { renderHook, act } from "@testing-library/react";
import { useExerciseLogManager } from "./useExerciseLogManager";
import * as actions from "@/app/clients/actions/exercise-log-actions";
import { useFormState } from "react-dom";

// Mock the actions and react-dom hooks
jest.mock("@/app/clients/actions/exercise-log-actions", () => ({
  addExerciseLog: jest.fn(),
  updateExerciseLog: jest.fn(),
  deleteExerciseLog: jest.fn(),
  searchExercisesAction: jest.fn(),
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormState: jest.fn(),
}));

const mockUseFormState = useFormState as jest.Mock;
const mockSearchAction = actions.searchExercisesAction as jest.Mock;
const mockDeleteAction = actions.deleteExerciseLog as jest.Mock;

const mockInitialLogs = [
  {
    id: "1",
    logDate: new Date("2025-01-01"),
    exercise: { name: "Bench Press" },
  },
  {
    id: "2",
    logDate: new Date("2025-01-02"),
    exercise: { name: "Squat" },
  },
] as any[];

describe("useExerciseLogManager", () => {
  let addActionDispatch: jest.Mock;
  let updateActionDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    addActionDispatch = jest.fn();
    updateActionDispatch = jest.fn();

    // Setup mock for useFormState
    mockUseFormState.mockImplementation((action, initialState) => {
      if (action === actions.addExerciseLog) {
        return [{ success: false }, addActionDispatch];
      }
      if (action === actions.updateExerciseLog) {
        return [{ success: false }, updateActionDispatch];
      }
      return [initialState, jest.fn()];
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize with initial logs", () => {
    const { result } = renderHook(() =>
      useExerciseLogManager({
        initialExerciseLogs: mockInitialLogs,
        clientId: "c1",
      }),
    );
    expect(result.current.logs).toHaveLength(2);
  });

  it("should handle editing state correctly", () => {
    const { result } = renderHook(() =>
      useExerciseLogManager({
        initialExerciseLogs: mockInitialLogs,
        clientId: "c1",
      }),
    );

    act(() => {
      result.current.handleEdit(mockInitialLogs[0]);
    });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingLogId).toBe("1");

    act(() => {
      result.current.handleCancelEdit();
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingLogId).toBeNull();
  });

  it("should handle debounced search", async () => {
    mockSearchAction.mockResolvedValue({
      exercises: [{ id: "ex-1", name: "Deadlift" }],
    });
    const { result } = renderHook(() =>
      useExerciseLogManager({
        initialExerciseLogs: mockInitialLogs,
        clientId: "c1",
      }),
    );

    act(() => {
      result.current.setSearchQuery("dead");
    });

    expect(mockSearchAction).not.toHaveBeenCalled();

    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockSearchAction).toHaveBeenCalledWith("dead");
    expect(result.current.searchResults).toHaveLength(1);
    expect(result.current.searchResults[0].name).toBe("Deadlift");
  });

  it("should handle deleting a log", async () => {
    mockDeleteAction.mockResolvedValue({ success: true, deletedId: "1" });
    const { result } = renderHook(() =>
      useExerciseLogManager({
        initialExerciseLogs: mockInitialLogs,
        clientId: "c1",
      }),
    );

    await act(async () => {
      await result.current.handleDelete("1");
    });

    expect(mockDeleteAction).toHaveBeenCalledWith("1");
    expect(result.current.logs.find((log) => log.id === "1")).toBeUndefined();
  });
});