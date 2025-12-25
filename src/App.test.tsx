import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "./tests/helpers";
import App from "./App";
import { useAuthStore } from "./features/auth/stores/useAuthStore";

describe("App", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      error: null,
      isValidating: false,
    });
    localStorage.clear();
  });

  it("redirects unauthenticated users to login", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /Connect to GitHub/i })
    ).toBeInTheDocument();
  });

  it("shows dashboard when authenticated", () => {
    useAuthStore.setState({
      token: "ghp_test123",
      isAuthenticated: true,
      error: null,
      isValidating: false,
    });

    render(<App />);
    // Dashboard now shows "View Pull Request" heading and PR URL input
    expect(
      screen.getByRole("heading", { name: /View Pull Request/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/GitHub Pull Request URL/i)).toBeInTheDocument();
  });

  it("authenticated users cannot access login page", () => {
    useAuthStore.setState({
      token: "ghp_test123",
      isAuthenticated: true,
      error: null,
      isValidating: false,
    });

    window.history.pushState({}, "", "/login");
    render(<App />);

    expect(
      screen.queryByRole("heading", { name: /Connect to GitHub/i })
    ).not.toBeInTheDocument();
    // Should redirect to dashboard with "View Pull Request" heading
    expect(
      screen.getByRole("heading", { name: /View Pull Request/i })
    ).toBeInTheDocument();
  });
});
