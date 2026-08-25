import { describe, expect, it } from "vitest";
import { doesBookingOverlap, getAvailableSlots } from "./availability";

describe("booking availability", () => {
  it("rejects a slot that overlaps an existing longer service", () => {
    expect(doesBookingOverlap("10:30", 60, [{ time: "10:00", durationMinutes: 90 }])).toBe(true);
  });

  it("does not offer a slot whose service would cross a break", () => {
    expect(getAvailableSlots({ start: "10:00", end: "14:00", breakStart: "12:00", breakEnd: "13:00" }, 90, [])).toEqual(["10:00", "10:30"]);
  });
});
