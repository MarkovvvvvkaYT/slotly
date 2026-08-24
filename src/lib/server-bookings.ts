import { demoAvailability } from "./demo-data";
import type { BookingInput } from "./domain";
import { getDemoRepository } from "./repository";
import { isPastSlot } from "./validation";

export async function createServerBooking(input: BookingInput) {
  const date = new Date(`${input.date}T12:00:00`);
  const rule = demoAvailability.find((item) => item.weekday === date.getDay());
  if (!rule) throw new Error("В этот день записи нет");
  if (isPastSlot(input.date, input.time)) throw new Error("Нельзя выбрать время в прошлом");
  const repository = getDemoRepository();
  const bookings = await repository.listBookings(input.date);
  if (bookings.some((booking) => booking.time === input.time && booking.status !== "cancelled")) throw new Error("Этот слот уже занят");
  return repository.createBooking(input);
}
