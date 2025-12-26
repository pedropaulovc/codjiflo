import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "./time";

describe("formatTimeAgo", () => {
  it("returns just now for recent dates", () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe("just now");
  });

  it("returns minutes for short durations", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("returns hours for longer durations", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe("2 hours ago");
  });
});
