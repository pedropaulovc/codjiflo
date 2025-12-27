import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "./time";

describe("formatTimeAgo", () => {
  it("returns just now for recent dates", () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe("just now");
  });

  it("returns singular minute for 1 minute ago", () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    expect(formatTimeAgo(oneMinuteAgo)).toBe("1 minute ago");
  });

  it("returns minutes for short durations", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("returns singular hour for 1 hour ago", () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneHourAgo)).toBe("1 hour ago");
  });

  it("returns hours for longer durations", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe("2 hours ago");
  });

  it("returns singular day for 1 day ago", () => {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneDayAgo)).toBe("1 day ago");
  });

  it("returns days for durations less than 30 days", () => {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(fifteenDaysAgo)).toBe("15 days ago");
  });

  it("returns singular month for 1 month ago", () => {
    const oneMonthAgo = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneMonthAgo)).toBe("1 month ago");
  });

  it("returns months for durations less than 12 months", () => {
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(sixMonthsAgo)).toBe("6 months ago");
  });

  it("returns singular year for 1 year ago", () => {
    const oneYearAgo = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(oneYearAgo)).toBe("1 year ago");
  });

  it("returns years for very long durations", () => {
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(threeYearsAgo)).toBe("3 years ago");
  });
});
