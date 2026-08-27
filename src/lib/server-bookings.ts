import { demoAvailability } from "./demo-data";
import type { Booking, BookingInput } from "./domain";
import { isSupabaseConfigured } from "./supabase";
import { createClient } from "./supabase/server";
import { getDemoRepository } from "./repository";
import { isPastSlot } from "./validation";
import { getAvailableSlots } from "./availability";

function mapBooking(row: Record<string, unknown>): Booking {
  return { id: String(row.id), profileId: row.profile_id ? String(row.profile_id) : undefined, reference: String(row.reference), serviceId: String(row.service_id), serviceName: String(row.service_name), date: String(row.date), time: String(row.time).slice(0, 5), clientName: String(row.client_name), phone: String(row.phone), comment: row.comment ? String(row.comment) : undefined, status: row.status as Booking["status"], createdAt: String(row.created_at), deletedAt: row.deleted_at ? String(row.deleted_at) : undefined };
}

export async function createServerBooking(input: BookingInput) {
  if (isPastSlot(input.date, input.time)) throw new Error("Нельзя выбрать время в прошлом");

  if (isSupabaseConfigured()) {
    if (!input.profileId) throw new Error("Профиль не найден");
    const supabase = await createClient();
    const { data: claims } = typeof supabase.auth?.getClaims === "function" ? await supabase.auth.getClaims() : { data: null };
    const clientUserId = claims?.claims?.sub ? String(claims.claims.sub) : null;
    const [{ data: profile }, { data: service }] = await Promise.all([
      supabase.from("profiles").select("id,is_published").eq("id", input.profileId).eq("is_published", true).maybeSingle(),
      supabase.from("services").select("id,name,profile_id,active,duration_minutes").eq("id", input.serviceId).eq("profile_id", input.profileId).eq("active", true).is("deleted_at", null).maybeSingle(),
    ]);
    if (!profile || !service) throw new Error("Услуга или профиль недоступны");
    const [{ data: rule }, { data: bookingRows, error: bookingError }] = await Promise.all([
      supabase.from("availability_rules").select("start_time,end_time,break_start,break_end").eq("profile_id", input.profileId).eq("weekday", new Date(`${input.date}T12:00:00`).getDay()).maybeSingle(),
      supabase.rpc("get_occupied_booking_slots", { p_profile_id: input.profileId, p_date: input.date }),
    ]);
    if (!rule) throw new Error("В этот день записи нет");
    if (bookingError) throw new Error("Не удалось проверить занятость времени");
    const available = getAvailableSlots({ start: String(rule.start_time).slice(0, 5), end: String(rule.end_time).slice(0, 5), breakStart: rule.break_start ? String(rule.break_start).slice(0, 5) : undefined, breakEnd: rule.break_end ? String(rule.break_end).slice(0, 5) : undefined }, Number(service.duration_minutes), ((bookingRows ?? []) as { start_time: string; duration_minutes: number }[]).map((booking) => ({ time: String(booking.start_time).slice(0, 5), durationMinutes: Number(booking.duration_minutes) })));
    if (!available.includes(input.time)) throw new Error("Этот слот уже занят");
    const { data, error } = await supabase.from("bookings").insert({ profile_id: input.profileId, service_id: input.serviceId, service_name: service.name, date: input.date, time: input.time, client_name: input.clientName, phone: input.phone, comment: input.comment || null, client_user_id: clientUserId }).select("*").single();
    if (error) {
      if (error.code === "23505") throw new Error("Этот слот уже занят");
      throw error;
    }
    return mapBooking(data);
  }

  const date = new Date(`${input.date}T12:00:00`);
  if (!demoAvailability.some((item) => item.weekday === date.getDay())) throw new Error("В этот день записи нет");
  const repository = getDemoRepository();
  const bookings = await repository.listBookings(input.date);
  if (bookings.some((booking) => booking.time === input.time && booking.status !== "cancelled")) throw new Error("Этот слот уже занят");
  return repository.createBooking(input);
}
