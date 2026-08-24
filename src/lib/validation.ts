import { z } from "zod";

export const bookingSchema = z.object({
  profileId: z.string().uuid().optional(),
  serviceId: z.string().min(1, "Выберите услугу"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите корректную дату"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Выберите время"),
  clientName: z.string().trim().min(2, "Введите имя").max(80, "Слишком длинное имя"),
  phone: z.string().trim().regex(/^[+\d][\d ()-]{8,22}$/, "Введите корректный телефон"),
  comment: z.string().trim().max(500, "Комментарий слишком длинный").optional().or(z.literal("")),
});

export type BookingPayload = z.infer<typeof bookingSchema>;

export function isPastSlot(date: string, time: string, now = new Date()) {
  const slot = new Date(`${date}T${time}:00`);
  return Number.isNaN(slot.getTime()) || slot.getTime() <= now.getTime();
}
