import { test, expect } from "@playwright/test";

test.describe("CodjiFlo App", () => {
  test("should redirect to dashboard and show heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });

  test("should display placeholder description", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Placeholder for S-1.2/i)).toBeVisible();
  });
});
