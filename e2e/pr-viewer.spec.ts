import { test, expect } from "@playwright/test";

test.describe("PR Viewer Flow (S-1.2, S-1.3, S-1.4, S-1.5)", () => {
  // Mock PR data
  const mockPR = {
    id: 1,
    number: 123,
    title: "Add new feature: Button component",
    body: "## Summary\n\nThis PR adds a new Button component.\n\n- Feature 1\n- Feature 2",
    state: "open",
    merged: false,
    draft: false,
    user: {
      id: 1,
      login: "testuser",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    head: { ref: "feature/button", sha: "abc123" },
    base: { ref: "main", sha: "def456" },
    html_url: "https://github.com/test/repo/pull/123",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-02T15:00:00Z",
  };

  const mockFiles = [
    {
      filename: "src/components/Button.tsx",
      status: "added",
      additions: 50,
      deletions: 0,
      changes: 50,
      patch:
        "@@ -0,0 +1,20 @@\n+import React from 'react';\n+\n+interface ButtonProps {\n+  label: string;\n+}\n+\n+export function Button({ label }: ButtonProps) {\n+  return <button>{label}</button>;\n+}",
    },
    {
      filename: "src/index.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      changes: 1,
      patch: "@@ -1,3 +1,4 @@\n export { App } from './App';\n+export { Button } from './components/Button';",
    },
    {
      filename: "src/old-file.ts",
      status: "removed",
      additions: 0,
      deletions: 10,
      changes: 10,
      patch: "@@ -1,10 +0,0 @@\n-// Old code\n-const unused = true;",
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Set up authentication via addInitScript (runs BEFORE any page load)
    // This ensures Zustand hydrates with auth state already in localStorage
    await page.addInitScript(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: { token: "ghp_testtoken123", isAuthenticated: true },
          version: 0,
        })
      );
    });

    // Mock GitHub API endpoints
    await page.route("https://api.github.com/repos/test/repo/pulls/123", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPR),
      });
    });

    await page.route("https://api.github.com/repos/test/repo/pulls/123/files", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockFiles),
      });
    });
  });

  test("Complete PR viewing journey", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /View Pull Request/i })).toBeVisible();

    // Enter PR URL
    const input = page.getByLabel(/GitHub Pull Request URL/i);
    await input.fill("https://github.com/test/repo/pull/123");

    // Submit form
    await page.getByRole("button", { name: /Load Pull Request/i }).click();

    // [S-1.2] Verify PR metadata is displayed
    await expect(page).toHaveURL(/.*\/pr\/test\/repo\/123/);

    // [AC-1.2.1] Title is displayed
    await expect(page.getByRole("heading", { level: 1, name: /Add new feature: Button component/i })).toBeVisible();

    // [AC-1.2.3] Author is displayed
    await expect(page.getByText("testuser")).toBeVisible();

    // [AC-1.2.4] State badge is displayed
    await expect(page.getByText("Open")).toBeVisible();

    // [AC-1.2.5] Branches are displayed
    await expect(page.getByText("feature/button")).toBeVisible();
    await expect(page.getByText("main")).toBeVisible();

    // [AC-1.2.2] Description is rendered as markdown
    await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();

    // [AC-1.2.6] Link to GitHub exists
    await expect(page.getByRole("link", { name: /View on GitHub/i })).toHaveAttribute(
      "href",
      "https://github.com/test/repo/pull/123"
    );
  });

  test("File list displays correctly", async ({ page }) => {
    await page.goto("/pr/test/repo/123");

    // Wait for page to load - check the diff heading as a stable indicator
    await expect(page.getByRole("heading", { name: "src/components/Button.tsx" })).toBeVisible({ timeout: 20000 });

    // [S-1.3] Wait for files to load
    // [AC-1.3.1] All files are listed - use navigation context to be specific
    const fileNav = page.getByRole("navigation", { name: /Changed files/i });
    await expect(fileNav.getByText("src/components/Button.tsx")).toBeVisible({ timeout: 10000 });
    await expect(fileNav.getByText("src/index.ts")).toBeVisible({ timeout: 5000 });
    await expect(fileNav.getByText("src/old-file.ts")).toBeVisible({ timeout: 5000 });

    // [AC-1.3.3] Stats are displayed
    await expect(page.getByText("+50")).toBeVisible();
    await expect(page.getByText("−10")).toBeVisible();
  });

  test("Diff view renders correctly", async ({ page }) => {
    await page.goto("/pr/test/repo/123");

    // Wait for content to load - check the diff view heading
    await expect(page.getByRole("heading", { name: "src/components/Button.tsx" })).toBeVisible();

    // [S-1.4] First file should be selected by default
    const diffRegion = page.getByRole("region", { name: /Diff content/i });
    await expect(diffRegion).toBeVisible();

    // [AC-1.4.1] Code is displayed
    await expect(page.getByText(/import React from/)).toBeVisible();
  });

  test("Keyboard navigation works", async ({ page }) => {
    await page.goto("/pr/test/repo/123");

    // Wait for PR page to load - check the diff heading
    await expect(page.getByRole("heading", { name: "src/components/Button.tsx" })).toBeVisible({ timeout: 30000 });

    // Wait for the file navigation to be fully loaded
    const fileNav = page.getByRole("navigation", { name: /Changed files/i });
    await expect(fileNav).toBeVisible({ timeout: 10000 });

    // First file should be selected
    const firstFile = page.getByRole("button", { name: /Button\.tsx/i });
    await expect(firstFile).toHaveAttribute("aria-selected", "true", { timeout: 10000 });

    // Focus on the page body to ensure keyboard events work
    await page.locator("body").click();
    await page.waitForTimeout(100);

    // [AC-1.5.1] Press j to go to next file
    await page.keyboard.press("j");

    // Second file should be selected - wait for the state change
    const secondFile = page.getByRole("button", { name: /index\.ts/i });
    await expect(secondFile).toHaveAttribute("aria-selected", "true", { timeout: 10000 });

    // [AC-1.5.1] Press k to go to previous file
    await page.keyboard.press("k");
    await expect(firstFile).toHaveAttribute("aria-selected", "true", { timeout: 10000 });
  });

  test("Shortcuts modal opens with ? button", async ({ page }) => {
    await page.goto("/pr/test/repo/123");

    // Wait for PR page to load - check the diff heading
    await expect(page.getByRole("heading", { name: "src/components/Button.tsx" })).toBeVisible({ timeout: 30000 });

    // Wait for the shortcuts button to be visible
    const shortcutsButton = page.getByRole("button", { name: /Show keyboard shortcuts/i });
    await expect(shortcutsButton).toBeVisible({ timeout: 10000 });

    // [AC-1.5.4] Click the shortcuts button to open modal
    await shortcutsButton.click();

    // Modal should be visible
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Keyboard Shortcuts")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Next file")).toBeVisible();

    // Close modal by clicking the Close button
    await page.getByRole("button", { name: /Close/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("Error handling for invalid PR URL", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Wait for page to be fully loaded
    await expect(page.getByRole("heading", { name: /View Pull Request/i })).toBeVisible({ timeout: 15000 });

    // Wait for hydration
    await page.waitForTimeout(1000);

    // Enter invalid URL
    const input = page.getByLabel(/GitHub Pull Request URL/i);
    await input.fill("https://gitlab.com/owner/repo/pull/123");

    // Wait a moment for form state to update
    await page.waitForTimeout(500);

    // Submit form - use force to avoid element detachment issues
    const submitButton = page.getByRole("button", { name: /Load Pull Request/i });
    await submitButton.click({ force: true });

    // Should show error message
    await expect(page.getByText(/Invalid GitHub PR URL/i)).toBeVisible({ timeout: 10000 });
  });

  test("Error handling for 404 PR", async ({ page }) => {
    // Mock 404 response
    await page.route("https://api.github.com/repos/test/repo/pulls/999", (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Not Found" }),
      });
    });

    await page.route("https://api.github.com/repos/test/repo/pulls/999/files", (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Not Found" }),
      });
    });

    await page.goto("/pr/test/repo/999");

    // Should show error message (use first() since error may appear in multiple places)
    await expect(page.getByText(/Pull request not found/i).first()).toBeVisible();
  });
});
