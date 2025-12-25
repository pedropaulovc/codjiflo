import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/tests/helpers";
import userEvent from "@testing-library/user-event";
import { LoginScreen } from "./LoginScreen";
import { useAuthStore } from "../stores/useAuthStore";
import { BrowserRouter } from "react-router-dom";

// Mock fetch
global.fetch = vi.fn();

// Mock navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginScreen() {
  return render(
    <BrowserRouter>
      <LoginScreen />
    </BrowserRouter>
  );
}

describe("LoginScreen - Accessibility", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      error: null,
      isValidating: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("[AC-1.1.8] should have accessible input label", () => {
    renderLoginScreen();
    
    const label = screen.getByLabelText(/Personal Access Token/i);
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("id", "pat");
    
    const labelElement = screen.getByText("Personal Access Token", { selector: "label" });
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName).toBe("LABEL");
  });

  it("[AC-1.1.9] should announce errors via aria-live", async () => {
    const user = userEvent.setup();
    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "invalid_token");
    await user.click(button);

    await waitFor(() => {
      const errorElement = screen.getByText(/Invalid token format/i);
      expect(errorElement).toHaveAttribute("role", "alert");
      expect(errorElement).toHaveAttribute("aria-live", "polite");
    });
  });

  it("[AC-1.1.10] should manage focus on error", async () => {
    const user = userEvent.setup();
    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "invalid_token");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Invalid token format/i)).toBeInTheDocument();
    });

    // Input should still be accessible for correction
    expect(input).toBeVisible();
    expect(input).toBeEnabled();
  });

  it("should support keyboard navigation", async () => {
    renderLoginScreen();
    
    const input = screen.getByLabelText(/Personal Access Token/i);
    expect(input).toHaveFocus();
  });
});

describe("LoginScreen - Token Validation", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      error: null,
      isValidating: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("[AC-1.1.3] should validate token format - reject invalid prefix", async () => {
    const user = userEvent.setup();
    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "invalid_token");
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid token format/i)
      ).toBeInTheDocument();
    });
  });

  it("[AC-1.1.6] should show error when API validation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "ghp_invalidtoken123");
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Authentication failed. Please check your token./i)
      ).toBeInTheDocument();
    });
  });

  it("[AC-1.1.7] should handle network errors", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "ghp_validtoken123");
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Authentication failed. Please check your token./i)
      ).toBeInTheDocument();
    });
  });

  it("should clear error when user starts typing", async () => {
    const user = userEvent.setup();
    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    // Trigger error
    await user.type(input, "invalid_token");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Invalid token format/i)).toBeInTheDocument();
    });

    // Clear and type new value
    await user.clear(input);
    await user.type(input, "ghp_");

    await waitFor(() => {
      expect(screen.queryByText(/Invalid token format/i)).not.toBeInTheDocument();
    });
  });
});
