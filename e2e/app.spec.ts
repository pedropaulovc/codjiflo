import { test, expect } from "@playwright/test";

test.describe("CodjiFlo App - Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state before each test
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
  });

  test("should redirect to dashboard and show heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });

  test("should display placeholder description", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Placeholder for S-1.2/i)).toBeVisible();
  });
});
