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
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: { token: "ghp_testtoken123", isAuthenticated: true },
          version: 0,
        })
      );
    });

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

    await expect(page.getByText("Please add a quick note about this flag.")).toBeVisible();

    await page.getByText("const added = true;").hover();
    await page.getByRole("button", { name: "Add comment" }).first().click();

    const editor = page.getByLabel("Add comment");
    await editor.fill("Adding a new inline comment.");
    await page.getByRole("button", { name: "Comment" }).click();

    await expect(page.getByText("Adding a new inline comment.")).toBeVisible();
  });
});
