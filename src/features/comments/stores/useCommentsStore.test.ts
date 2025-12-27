import { beforeEach, describe, expect, it } from "vitest";
import { useCommentsStore } from "./useCommentsStore";

describe("useCommentsStore", () => {
  beforeEach(() => {
    useCommentsStore.setState({
      threads: [],
      isLoading: false,
      error: null,
      announcement: "",
    });
  });

  it("adds a new thread when adding a comment on a new line", async () => {
    await useCommentsStore.getState().addComment({
      path: "src/example.ts",
      line: 10,
      side: "RIGHT",
      body: "New comment",
      position: 1,
    });

    const { threads, announcement } = useCommentsStore.getState();
    expect(threads).toHaveLength(1);
    expect(threads[0]?.comments[0]?.body).toBe("New comment");
    expect(announcement).toBe("Comment posted.");
  });

  it("appends comment to existing thread when same line and side", async () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "Initial comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    await useCommentsStore.getState().addComment({
      path: "src/example.ts",
      line: 10,
      side: "RIGHT",
      body: "Second comment on same line",
      position: 1,
    });

    const { threads, announcement } = useCommentsStore.getState();
    expect(threads).toHaveLength(1);
    expect(threads[0]?.comments).toHaveLength(2);
    expect(threads[0]?.comments[1]?.body).toBe("Second comment on same line");
    expect(announcement).toBe("Comment posted.");
  });

  it("appends a reply to an existing thread", async () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "Initial comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    await useCommentsStore.getState().addReply("thread-1", "Reply message");

    const { threads } = useCommentsStore.getState();
    expect(threads[0]?.comments).toHaveLength(2);
    expect(threads[0]?.comments[1]?.body).toBe("Reply message");
    expect(threads[0]?.comments[1]?.inReplyTo).toBe("comment-1");
  });

  it("edits a comment body and updates timestamp", async () => {
    const originalDate = new Date("2023-01-01");
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "Original body",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: originalDate,
              updatedAt: originalDate,
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    await useCommentsStore.getState().editComment("comment-1", "Updated body");

    const { threads, announcement } = useCommentsStore.getState();
    expect(threads[0]?.comments[0]?.body).toBe("Updated body");
    expect(threads[0]?.comments[0]?.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
    expect(announcement).toBe("Comment updated.");
  });

  it("toggles thread resolved state", () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "Comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    useCommentsStore.getState().toggleResolved("thread-1");
    expect(useCommentsStore.getState().threads[0]?.isResolved).toBe(true);

    useCommentsStore.getState().toggleResolved("thread-1");
    expect(useCommentsStore.getState().threads[0]?.isResolved).toBe(false);
  });

  it("deletes a comment and removes empty threads", async () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "Initial comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    await useCommentsStore.getState().deleteComment("comment-1");

    expect(useCommentsStore.getState().threads).toHaveLength(0);
    expect(useCommentsStore.getState().announcement).toBe("Comment deleted.");
  });

  it("deletes only the specified comment, keeping others", async () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [
            {
              id: "comment-1",
              body: "First comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
            {
              id: "comment-2",
              body: "Second comment",
              author: { id: "1", login: "you", avatarUrl: "https://example.com/1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              path: "src/example.ts",
              line: 10,
              side: "RIGHT",
              position: 1,
            },
          ],
        },
      ],
    });

    await useCommentsStore.getState().deleteComment("comment-1");

    const { threads } = useCommentsStore.getState();
    expect(threads).toHaveLength(1);
    expect(threads[0]?.comments).toHaveLength(1);
    expect(threads[0]?.comments[0]?.id).toBe("comment-2");
  });

  it("clears error state", () => {
    useCommentsStore.setState({ error: "Some error" });
    useCommentsStore.getState().clearError();
    expect(useCommentsStore.getState().error).toBeNull();
  });

  it("clears announcement", () => {
    useCommentsStore.setState({ announcement: "Comment posted." });
    useCommentsStore.getState().clearAnnouncement();
    expect(useCommentsStore.getState().announcement).toBe("");
  });

  it("resets store to initial state", () => {
    useCommentsStore.setState({
      threads: [
        {
          id: "thread-1",
          path: "src/example.ts",
          line: 10,
          side: "RIGHT",
          isResolved: false,
          comments: [],
        },
      ],
      isLoading: true,
      error: "Some error",
      announcement: "Some announcement",
    });

    useCommentsStore.getState().reset();

    const state = useCommentsStore.getState();
    expect(state.threads).toHaveLength(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.announcement).toBe("");
  });
});
