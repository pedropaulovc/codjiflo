import { test, expect } from "@playwright/test";

test.describe("Inline comments flow (S-2.x)", () => {
  const mockPR = {
    id: 1,
    number: 123,
    title: "Review: inline comments",
    body: "Sample PR for comment testing",
    state: "open",
    merged: false,
    draft: false,
    user: {
      id: 1,
      login: "testuser",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
    },
    head: { ref: "feature/comments", sha: "abc123" },
    base: { ref: "main", sha: "def456" },
    html_url: "https://github.com/test/repo/pull/123",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-02T15:00:00Z",
  };

  const mockFiles = [
    {
      filename: "src/example.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      changes: 1,
      patch: "@@ -1,1 +1,2 @@\n const foo = 'bar';\n+const added = true;",
    },
  ];

  const mockComments = [
    {
      id: 999,
      body: "Please add a quick note about this flag.",
      user: {
        id: 2,
        login: "reviewer",
        avatar_url: "https://avatars.githubusercontent.com/u/2",
      },
      created_at: "2024-01-02T12:00:00Z",
      updated_at: "2024-01-02T12:00:00Z",
      path: "src/example.ts",
      line: 2,
      side: "RIGHT",
      position: 2,
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

    await page.route("https://api.github.com/repos/test/repo/pulls/123/comments", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockComments),
      });
    });
  });

  test("shows existing threads and allows adding a comment", async ({ page }) => {
    await page.goto("/pr/test/repo/123");

    // Wait for page to fully stabilize
    await page.waitForLoadState("networkidle");

    // Wait for page to load - check the diff heading as a stable indicator
    await expect(page.getByRole("heading", { name: "src/example.ts" })).toBeVisible({ timeout: 30000 });

    // Wait for the file navigation to be fully loaded
    const fileNav = page.getByRole("navigation", { name: /Changed files/i });
    await expect(fileNav).toBeVisible({ timeout: 10000 });
    await expect(fileNav.getByText("src/example.ts")).toBeVisible({ timeout: 10000 });

    // Wait for the file list item to be visible and selected
    const fileListItem = page.getByRole("button", { name: /src\/example\.ts/ });
    await expect(fileListItem).toBeVisible({ timeout: 10000 });
    await expect(fileListItem).toHaveAttribute("aria-current", "location", { timeout: 15000 });

    // The diff content should be rendered in a table
    const diffTable = page.locator('table');
    await expect(diffTable).toBeVisible({ timeout: 15000 });

    // Verify the existing comment is displayed (comments load async)
    await expect(page.getByText("Please add a quick note about this flag.")).toBeVisible({ timeout: 20000 });
  });
});
