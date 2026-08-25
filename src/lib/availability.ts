import type { AvailabilityRule } from "./domain";

type TimedBooking = { time: string; durationMinutes: number };

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

export function doesBookingOverlap(time: string, durationMinutes: number, bookings: TimedBooking[]) {
  const start = minutes(time);
  const end = start + durationMinutes;
  return bookings.some((booking) => start < minutes(booking.time) + booking.durationMinutes && end > minutes(booking.time));
}

export function getAvailableSlots(rule: Pick<AvailabilityRule, "start" | "end" | "breakStart" | "breakEnd">, durationMinutes: number, bookings: TimedBooking[]) {
  const slots: string[] = [];
  const start = minutes(rule.start);
  const end = minutes(rule.end);
  const breakStart = rule.breakStart ? minutes(rule.breakStart) : undefined;
  const breakEnd = rule.breakEnd ? minutes(rule.breakEnd) : undefined;
  for (let slot = start; slot + durationMinutes <= end; slot += 30) {
    const crossesBreak = breakStart !== undefined && breakEnd !== undefined && slot < breakEnd && slot + durationMinutes > breakStart;
    const value = `${String(Math.floor(slot / 60)).padStart(2, "0")}:${String(slot % 60).padStart(2, "0")}`;
    if (!crossesBreak && !doesBookingOverlap(value, durationMinutes, bookings)) slots.push(value);
  }
  return slots;
}
