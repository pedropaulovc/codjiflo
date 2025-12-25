import { test, expect } from "@playwright/test";

test.describe("CodjiFlo App", () => {
  test("should display the main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /codjiflo/i })).toBeVisible();
  });

  test("should display the description", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/code review tool for power users/i)).toBeVisible();
  });
});
