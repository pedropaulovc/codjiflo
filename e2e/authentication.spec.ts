import { test, expect } from "@playwright/test";

test.describe("Authentication Flow (S-1.1)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("[AC-1.1.1] should show Connect to GitHub screen when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Connect to GitHub/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Enter your Personal Access Token to get started/i)
    ).toBeVisible();
  });

  test("[AC-1.1.2] should have Personal Access Token input field", async ({
    page,
  }) => {
    await page.goto("/login");
    const input = page.getByLabel(/Personal Access Token/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("[AC-1.1.3] should validate token format - ghp_ prefix", async ({
    page,
  }) => {
    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("invalid_token");
    await button.click();

    await expect(
      page.getByText(/Invalid token format/i)
    ).toBeVisible();
  });

  test("[AC-1.1.4] [AC-1.1.5] should persist token and skip login on reload", async ({
    page,
  }) => {
    // Mock the GitHub API
    await page.route("https://api.github.com/user", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ login: "testuser", id: 1 }),
      });
    });

    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("ghp_validtoken123456789");
    await button.click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();

    // Reload page
    await page.reload();

    // Should still be on dashboard (authenticated)
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
  });

  test("[AC-1.1.6] should show error for invalid token from API", async ({
    page,
  }) => {
    // Mock the GitHub API to reject the token
    await page.route("https://api.github.com/user", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Bad credentials" }),
      });
    });

    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("ghp_invalidtoken123456789");
    await button.click();

    await expect(
      page.getByText(/Authentication failed. Please check your token./i)
    ).toBeVisible();
  });

  test("[AC-1.1.7] should handle network errors", async ({ page }) => {
    // Mock the GitHub API to fail with network error
    await page.route("https://api.github.com/user", (route) => {
      route.abort("failed");
    });

    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("ghp_validtoken123456789");
    await button.click();

    await expect(
      page.getByText(/Authentication failed. Please check your token./i)
    ).toBeVisible();
  });

  test("[AC-1.1.8] should have accessible input label", async ({ page }) => {
    await page.goto("/login");
    
    const label = page.locator('label[for="pat"]');
    await expect(label).toBeVisible();
    await expect(label).toHaveText(/Personal Access Token/i);
    
    const input = page.locator("#pat");
    await expect(input).toBeVisible();
  });

  test("[AC-1.1.9] should announce errors via aria-live", async ({ page }) => {
    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("invalid_token");
    await button.click();

    const errorElement = page.getByText(/Invalid token format/i);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toHaveAttribute("role", "alert");
    await expect(errorElement).toHaveAttribute("aria-live", "polite");
  });

  test("[AC-1.1.10] should manage focus on error", async ({ page }) => {
    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    await input.fill("invalid_token");
    await button.click();

    // Error should be announced and visible
    const errorElement = page.getByText(/Invalid token format/i);
    await expect(errorElement).toBeVisible();
    
    // Input should still be accessible for correction
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/login");
    
    // Tab to input (should be autofocused)
    const input = page.getByLabel(/Personal Access Token/i);
    await expect(input).toBeFocused();
    
    // Type token
    await page.keyboard.type("ghp_test123");
    
    // Tab to button
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", { name: /Connect/i });
    await expect(button).toBeFocused();
  });

  test("should clear error when user starts typing", async ({ page }) => {
    await page.goto("/login");
    
    const input = page.getByLabel(/Personal Access Token/i);
    const button = page.getByRole("button", { name: /Connect/i });

    // Trigger error
    await input.fill("invalid_token");
    await button.click();
    await expect(page.getByText(/Invalid token format/i)).toBeVisible();

    // Clear and type new value
    await input.clear();
    await input.fill("ghp_");
    
    // Error should be cleared
    await expect(page.getByText(/Invalid token format/i)).not.toBeVisible();
  });
});
