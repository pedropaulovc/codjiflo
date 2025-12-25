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

describe("LoginScreen", () => {
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

  it("should render Connect to GitHub heading", () => {
    renderLoginScreen();
    expect(
      screen.getByRole("heading", { name: /Connect to GitHub/i })
    ).toBeInTheDocument();
  });

  it("should render PAT input field with accessible label", () => {
    renderLoginScreen();
    expect(screen.getByLabelText(/Personal Access Token/i)).toBeInTheDocument();
  });

  it("should have helper text about token format", () => {
    renderLoginScreen();
    expect(
      screen.getByText(/Your token must start with 'ghp_' or 'github_pat_'/i)
    ).toBeInTheDocument();
  });

  it("should disable button when input is empty", () => {
    renderLoginScreen();
    const button = screen.getByRole("button", { name: /Connect/i });
    expect(button).toBeDisabled();
  });

  it("should enable button when input has value", async () => {
    const user = userEvent.setup();
    renderLoginScreen();
    
    const input = screen.getByLabelText(/Personal Access Token/i);
    await user.type(input, "ghp_test123");
    
    const button = screen.getByRole("button", { name: /Connect/i });
    expect(button).not.toBeDisabled();
  });

  it("should show error for invalid token format", async () => {
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

    const errorElement = screen.getByText(/Invalid token format/i);
    expect(errorElement).toHaveAttribute("role", "alert");
    expect(errorElement).toHaveAttribute("aria-live", "polite");
  });

  it("should show error when API validation fails", async () => {
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

  it("should navigate to dashboard on successful authentication", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);
    const button = screen.getByRole("button", { name: /Connect/i });

    await user.type(input, "ghp_validtoken123");
    await user.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
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

    // Start typing again
    await user.clear(input);
    await user.type(input, "ghp_");

    await waitFor(() => {
      expect(screen.queryByText(/Invalid token format/i)).not.toBeInTheDocument();
    });
  });

  it("should show validating state", async () => {
    const user = userEvent.setup();
    // Make fetch hang to keep validating state
    vi.mocked(global.fetch).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    renderLoginScreen();

    const input = screen.getByLabelText(/Personal Access Token/i);

    await user.type(input, "ghp_validtoken123");
    
    const button = screen.getByRole("button", { name: /Connect/i });
    await user.click(button);

    // Button text should change to "Validating..." and be disabled
    await waitFor(() => {
      const validatingButton = screen.queryByRole("button", { name: /Validating/i });
      expect(validatingButton).toBeInTheDocument();
      expect(validatingButton).toBeDisabled();
    });
  });

  it("should have link to create token on GitHub", () => {
    renderLoginScreen();
    const link = screen.getByRole("link", { name: /Create one on GitHub/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/settings/tokens/new"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should focus on input field on mount", () => {
    renderLoginScreen();
    const input = screen.getByLabelText(/Personal Access Token/i);
    expect(input).toHaveFocus();
  });
});
