import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatDate, formatRelative, daysBetween, MS_PER_DAY } from "./date";

describe("formatDate", () => {
  it("formats an ISO date string to en-US short format", () => {
    expect(formatDate("2026-06-15")).toBe("Jun 15, 2026");
  });

  it("formats first day of year correctly", () => {
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("formats last day of year correctly", () => {
    expect(formatDate("2026-12-31")).toBe("Dec 31, 2026");
  });
});

describe("daysBetween", () => {
  it("returns 1 when start and end are the same day", () => {
    expect(daysBetween("2026-09-01", "2026-09-01")).toBe(1);
  });

  it("returns 5 for a 5-day span (inclusive)", () => {
    expect(daysBetween("2026-09-01", "2026-09-05")).toBe(5);
  });

  it("handles month boundaries correctly", () => {
    expect(daysBetween("2026-01-29", "2026-02-02")).toBe(5);
  });
});

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns "Submitted today" when date is today', () => {
    const now = new Date("2026-06-15T12:00:00Z");
    vi.setSystemTime(now);
    expect(formatRelative("2026-06-15")).toBe("Submitted today");
  });

  it('returns "Submitted yesterday" when date is 1 day ago', () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(formatRelative("2026-06-14")).toBe("Submitted yesterday");
  });

  it('returns "Submitted X days ago" for 2–6 days ago', () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(formatRelative("2026-06-12")).toBe("Submitted 3 days ago");
  });

  it("returns a short date string for dates older than 7 days", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const result = formatRelative("2026-06-01");
    expect(result).toMatch(/Jun 1/);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe("MS_PER_DAY", () => {
  it("equals 86400000 milliseconds", () => {
    expect(MS_PER_DAY).toBe(86_400_000);
  });
});
