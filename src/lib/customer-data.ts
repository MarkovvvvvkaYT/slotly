import type { Booking } from "./domain";
import { isSupabaseConfigured } from "./supabase";
import { createClient } from "./supabase/server";

export async function getCustomerBookings(): Promise<Booking[] | null> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return null;
  const { data, error } = await supabase.from("bookings").select("*").eq("client_user_id", userId).order("date", { ascending: true }).order("time", { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) => ({ id: String(row.id), profileId: String(row.profile_id), reference: String(row.reference), serviceId: String(row.service_id), serviceName: String(row.service_name), date: String(row.date), time: String(row.time).slice(0, 5), clientName: String(row.client_name), phone: String(row.phone), comment: row.comment ? String(row.comment) : undefined, status: row.status as Booking["status"], createdAt: String(row.created_at) }));
}
