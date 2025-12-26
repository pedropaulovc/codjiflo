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
});
