import { test, expect } from "@playwright/test";

test.describe("Authentication Flow (S-1.1)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("Complete authentication journey - successful login and session persistence", async ({
    page,
  }) => {
    // [AC-1.1.1] User sees "Connect to GitHub" screen when not authenticated
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Connect to GitHub/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Enter your Personal Access Token to get started/i)
    ).toBeVisible();

    // [AC-1.1.2] Personal Access Token input field exists
    const input = page.getByLabel(/Personal Access Token/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");

    // Mock the GitHub API for successful authentication
    await page.route("https://api.github.com/user", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ login: "testuser", id: 1 }),
      });
    });

    // Enter valid token and submit
    await input.fill("ghp_validtoken123456789");
    const button = page.getByRole("button", { name: /Connect/i });
    await button.click();

    // [AC-1.1.4] Should navigate to dashboard after successful auth
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /View Pull Request/i })
    ).toBeVisible();

    // [AC-1.1.5] Token persistence - reload should keep user authenticated
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /View Pull Request/i })
    ).toBeVisible();
  });

  test("Authentication error handling and accessibility", async ({ page }) => {
    await page.goto("/login");

    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    // [AC-1.1.3] Validate token format - invalid prefix
    await input.fill("invalid_token");
    await button.click();

    // [AC-1.1.6] Show clear error message
    const formatError = page.getByText(/Invalid token format/i);
    await expect(formatError).toBeVisible();

    // [AC-1.1.9] Error announced via aria-live
    await expect(formatError).toHaveAttribute("role", "alert");
    await expect(formatError).toHaveAttribute("aria-live", "polite");

    // Clear error when user starts typing again
    await input.clear();
    await input.fill("ghp_");
    await expect(formatError).not.toBeVisible();

    // [AC-1.1.7] Network/API error handling
    await page.route("https://api.github.com/user", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Bad credentials" }),
      });
    });

    await input.fill("ghp_invalidtoken123456789");
    await button.click();

    // Should show authentication failed error
    await expect(
      page.getByText(/Authentication failed. Please check your token./i)
    ).toBeVisible();

    // [AC-1.1.10] Input should remain accessible for correction
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });
});
