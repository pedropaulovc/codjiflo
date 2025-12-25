import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "./tests/helpers";
import App from "./App";
import { useAuthStore } from "./features/auth/stores/useAuthStore";

// Reset the auth store before each test
beforeEach(() => {
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    errorMessage: null,
  });
  localStorage.clear();
});

describe("App", () => {
  it("redirects to login screen when not authenticated", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Connect to GitHub/i })).toBeInTheDocument();
  });

  it("shows Dashboard when authenticated", () => {
    useAuthStore.setState({
      token: "ghp_testtoken",
      user: { login: "testuser", id: 1, avatar_url: "url", name: "Test" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      errorMessage: null,
    });

    render(<App />);
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
  });

  it("renders Dashboard placeholder text when authenticated", () => {
    useAuthStore.setState({
      token: "ghp_testtoken",
      user: { login: "testuser", id: 1, avatar_url: "url", name: "Test" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      errorMessage: null,
    });

    render(<App />);
    expect(screen.getByText(/Placeholder for S-1.2/i)).toBeInTheDocument();
  });
});
