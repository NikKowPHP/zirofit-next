import { renderHook, act } from "@testing-library/react";
import { useTheme, ThemeProvider } from "./ThemeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ThemeContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should have light theme as default", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    expect(result.current.theme).toBe("light");
  });

  it("should toggle theme from light to dark", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe("dark");
  });

  it("should toggle theme from dark to light", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    // First toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    // Second toggle back to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe("light");
  });

  it("should save theme preference to localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    act(() => {
      result.current.toggleTheme();
    });
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should load initial theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    expect(result.current.theme).toBe("dark");
  });
});
