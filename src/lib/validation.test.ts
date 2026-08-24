import { describe, expect, it } from "vitest";
import { bookingSchema, isPastSlot } from "./validation";

describe("bookingSchema", () => {
  it("accepts a complete booking", () => {
    expect(bookingSchema.safeParse({ serviceId: "face", date: "2099-04-12", time: "10:00", clientName: "Анна", phone: "+7 (999) 123-45-67" }).success).toBe(true);
  });

  it("rejects an invalid phone", () => {
    expect(bookingSchema.safeParse({ serviceId: "face", date: "2099-04-12", time: "10:00", clientName: "Анна", phone: "123" }).success).toBe(false);
  });
});

describe("isPastSlot", () => {
  it("detects a slot in the past", () => {
    expect(isPastSlot("2025-01-01", "10:00", new Date("2025-01-01T11:00:00"))).toBe(true);
    expect(isPastSlot("2099-01-01", "10:00", new Date("2025-01-01T11:00:00"))).toBe(false);
  });
});
