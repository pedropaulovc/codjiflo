import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should show login screen when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("heading", { name: /Connect to GitHub/i })).toBeVisible();
  });

  test("should display PAT input field with accessible label", async ({ page }) => {
    await page.goto("/login");
    const input = page.getByLabel(/Personal Access Token/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("should show Connect button that is disabled when input is empty", async ({ page }) => {
    await page.goto("/login");
    const button = page.getByRole("button", { name: /Connect/i });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  });

  test("should enable Connect button when token is entered", async ({ page }) => {
    await page.goto("/login");
    const input = page.getByLabel(/Personal Access Token/i);
    await input.fill("ghp_testtoken");

    const button = page.getByRole("button", { name: /Connect/i });
    await expect(button).not.toBeDisabled();
  });

  test("should show token format help text", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/ghp_/)).toBeVisible();
    await expect(page.getByText(/github_pat_/)).toBeVisible();
  });

  test("should show link to generate new token on GitHub", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: /Generate a new token/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://github.com/settings/tokens");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("should show error for invalid token format", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid token format
    await page.getByLabel(/Personal Access Token/i).fill("invalid_token");
    await page.getByRole("button", { name: /Connect/i }).click();

    // Should show format error
    const error = page.getByTestId("auth-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/Invalid token format/i);
  });

  test("should redirect protected routes to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should redirect PR routes to login when not authenticated", async ({ page }) => {
    await page.goto("/pr/123");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should have focus management - error is focusable", async ({ page }) => {
    await page.goto("/login");

    // Trigger an error
    await page.getByLabel(/Personal Access Token/i).fill("invalid_token");
    await page.getByRole("button", { name: /Connect/i }).click();

    // The error element should be present
    const error = page.getByTestId("auth-error");
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute("role", "alert");
    await expect(error).toHaveAttribute("aria-live", "polite");
  });

  test("should have authenticated state persist on reload", async ({ page }) => {
    await page.goto("/login");

    // Manually set authenticated state in localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            token: "ghp_testtoken",
            user: { login: "testuser", id: 1, avatar_url: "url", name: "Test" },
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    });

    // Reload the page
    await page.reload();
    await page.goto("/dashboard");

    // Should show dashboard
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });

  test("should redirect from login to dashboard if already authenticated", async ({ page }) => {
    // Set authenticated state
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            token: "ghp_testtoken",
            user: { login: "testuser", id: 1, avatar_url: "url", name: "Test" },
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    });

    // Try to go to login
    await page.goto("/login");

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
