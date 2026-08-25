import { demoAvailability, demoBookings, demoProfile, demoServices } from "./demo-data";
import { filterCatalogProfiles, type CatalogFilters, type CatalogProfile, type ProfileCategory } from "./catalog";
import type { AvailabilityRule, Booking, Profile, Service } from "./domain";
import { isSupabaseConfigured } from "./supabase";
import { createClient } from "./supabase/server";

export type OwnerData = { profile: Profile; services: Service[]; availability: AvailabilityRule[]; bookings: Booking[]; demo: boolean };

function demoOwnerData(): OwnerData {
  return { profile: { ...demoProfile, id: "demo-profile", isPublished: true }, services: demoServices, availability: demoAvailability, bookings: demoBookings, demo: true };
}

function mapService(row: Record<string, unknown>): Service {
  return { id: String(row.id), profileId: String(row.profile_id), name: String(row.name), description: String(row.description ?? ""), durationMinutes: Number(row.duration_minutes), priceLabel: String(row.price_label ?? ""), active: Boolean(row.active) };
}

function mapBooking(row: Record<string, unknown>): Booking {
  return { id: String(row.id), profileId: String(row.profile_id), reference: String(row.reference), serviceId: String(row.service_id), serviceName: String(row.service_name), date: String(row.date), time: String(row.time).slice(0, 5), clientName: String(row.client_name), phone: String(row.phone), comment: row.comment ? String(row.comment) : undefined, status: row.status as Booking["status"], createdAt: String(row.created_at) };
}

async function mediaUrl(path: string | null | undefined, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!path) return undefined;
  const { data } = await supabase.storage.from("profile-media").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
}

export async function getOwnerData(): Promise<OwnerData | null> {
  if (!isSupabaseConfigured()) return demoOwnerData();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (profileError || !profile) return null;
  const [{ data: serviceRows }, { data: availabilityRows }, { data: bookingRows }] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).order("created_at"),
    supabase.from("availability_rules").select("*").eq("profile_id", profile.id).order("weekday"),
    supabase.from("bookings").select("*").eq("profile_id", profile.id).order("date").order("time"),
  ]);
  return {
    profile: { id: String(profile.id), userId, name: profile.name, slug: profile.slug, eyebrow: profile.eyebrow, description: profile.description, address: profile.address, phone: profile.phone, category: profile.category, city: profile.city, avatarPath: profile.avatar_path ?? undefined, coverPath: profile.cover_path ?? undefined, isPublished: profile.is_published },
    services: (serviceRows ?? []).map(mapService),
    availability: (availabilityRows ?? []).map((row) => ({ weekday: Number(row.weekday), start: String(row.start_time).slice(0, 5), end: String(row.end_time).slice(0, 5), breakStart: row.break_start ? String(row.break_start).slice(0, 5) : undefined, breakEnd: row.break_end ? String(row.break_end).slice(0, 5) : undefined })),
    bookings: (bookingRows ?? []).map(mapBooking),
    demo: false,
  };
}

export async function getPublicProfile(slug: string): Promise<OwnerData | null> {
  if (!isSupabaseConfigured()) return slug === demoProfile.slug ? demoOwnerData() : null;
  const supabase = await createClient();
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error || !profile) return null;
  const [{ data: serviceRows }, { data: availabilityRows }] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).eq("active", true).order("created_at"),
    supabase.from("availability_rules").select("*").eq("profile_id", profile.id).order("weekday"),
  ]);
  const [avatarPath, coverPath] = await Promise.all([mediaUrl(profile.avatar_path, supabase), mediaUrl(profile.cover_path, supabase)]);
  return {
    profile: { id: String(profile.id), userId: String(profile.user_id), name: profile.name, slug: profile.slug, eyebrow: profile.eyebrow, description: profile.description, address: profile.address, phone: profile.phone, category: profile.category, city: profile.city, avatarPath, coverPath, isPublished: true },
    services: (serviceRows ?? []).map(mapService),
    availability: (availabilityRows ?? []).map((row) => ({ weekday: Number(row.weekday), start: String(row.start_time).slice(0, 5), end: String(row.end_time).slice(0, 5), breakStart: row.break_start ? String(row.break_start).slice(0, 5) : undefined, breakEnd: row.break_end ? String(row.break_end).slice(0, 5) : undefined })),
    bookings: [],
    demo: false,
  };
}

export async function getCatalogProfiles(filters: CatalogFilters = {}): Promise<CatalogProfile[]> {
  const demoCatalog: CatalogProfile[] = [{ id: "demo-profile", name: demoProfile.name, slug: demoProfile.slug, category: (demoProfile.category ?? "other") as ProfileCategory, city: demoProfile.city ?? "", description: demoProfile.description, services: demoServices }];
  if (!isSupabaseConfigured()) return filterCatalogProfiles(demoCatalog, filters);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,slug,category,city,description,avatar_path,cover_path,services(id,name,description,duration_minutes,price_label,active)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const catalog = await Promise.all(data.map(async (row) => ({
    id: String(row.id), name: String(row.name), slug: String(row.slug), category: (row.category ?? "other") as ProfileCategory,
    city: String(row.city ?? ""), description: String(row.description ?? ""), avatarPath: await mediaUrl(row.avatar_path ? String(row.avatar_path) : undefined, supabase),
    coverPath: await mediaUrl(row.cover_path ? String(row.cover_path) : undefined, supabase), services: ((row.services ?? []) as Record<string, unknown>[]).map(mapService).filter((service) => service.active),
  })));
  return filterCatalogProfiles(catalog, filters);
}
