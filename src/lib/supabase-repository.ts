import type { BookingRepository, BookingStatus } from "./domain";
import { getSupabaseAdmin } from "./supabase";

export function getSupabaseRepository(): BookingRepository | null {
  const client = getSupabaseAdmin();
  if (!client) return null;
  return {
    async listServices() {
      const { data, error } = await client.from("services").select("id,name,description,duration_minutes,price_label,active").eq("active", true).order("created_at");
      if (error) throw error;
      return (data ?? []).map((service) => ({ ...service, durationMinutes: service.duration_minutes, priceLabel: service.price_label }));
    },
    async listBookings(date) {
      let query = client.from("bookings").select("*").order("date").order("time");
      if (date) query = query.eq("date", date);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    async getAvailability() {
      const { data, error } = await client.from("availability_rules").select("weekday,start_time,end_time,break_start,break_end").order("weekday");
      if (error) throw error;
      return (data ?? []).map((rule) => ({ weekday: rule.weekday, start: rule.start_time, end: rule.end_time, breakStart: rule.break_start ?? undefined, breakEnd: rule.break_end ?? undefined }));
    },
    async createBooking(input) {
      const { data: service, error: serviceError } = await client.from("services").select("name").eq("id", input.serviceId).single();
      if (serviceError) throw serviceError;
      const { data, error } = await client.from("bookings").insert({ service_id: input.serviceId, service_name: service.name, date: input.date, time: input.time, client_name: input.clientName, phone: input.phone, comment: input.comment || null }).select("*").single();
      if (error) throw error;
      return { ...data, serviceId: data.service_id, serviceName: data.service_name, clientName: data.client_name, createdAt: data.created_at };
    },
    async updateBookingStatus(id, status: BookingStatus) {
      const { data, error } = await client.from("bookings").update({ status }).eq("id", id).select("*").maybeSingle();
      if (error) throw error;
      return data ? { ...data, serviceId: data.service_id, serviceName: data.service_name, clientName: data.client_name, createdAt: data.created_at } : null;
    },
  };
}

export type SupabaseRepository = NonNullable<ReturnType<typeof getSupabaseRepository>>;
