import { demoAvailability, demoBookings, demoProfile, demoServices } from "./demo-data";
import { filterCatalogProfiles, type CatalogFilters, type CatalogProfile, type ProfileCategory } from "./catalog";
import type { AvailabilityRule, Booking, Profile, Service } from "./domain";
import { isSupabaseConfigured } from "./supabase";
import { createClient } from "./supabase/server";
import { isPublicContentSafe } from "./content-safety";

export type OwnerData = { profile: Profile; services: Service[]; availability: AvailabilityRule[]; bookings: Booking[]; demo: boolean };

function demoOwnerData(): OwnerData {
  return { profile: { ...demoProfile, id: "demo-profile", isPublished: true }, services: demoServices, availability: demoAvailability, bookings: demoBookings, demo: true };
}

function mapBooking(row: Record<string, unknown>): Booking {
  return { id: String(row.id), profileId: String(row.profile_id), reference: String(row.reference), serviceId: String(row.service_id), serviceName: String(row.service_name), date: String(row.date), time: String(row.time).slice(0, 5), clientName: String(row.client_name), phone: String(row.phone), comment: row.comment ? String(row.comment) : undefined, status: row.status as Booking["status"], createdAt: String(row.created_at), deletedAt: row.deleted_at ? String(row.deleted_at) : undefined };
}

async function mediaUrl(path: string | null | undefined, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!path) return undefined;
  const { data } = await supabase.storage.from("profile-media").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
}

async function mapService(row: Record<string, unknown>, supabase?: Awaited<ReturnType<typeof createClient>>): Promise<Service> {
  const imagePath = row.image_path ? String(row.image_path) : undefined;
  return { id: String(row.id), profileId: String(row.profile_id), name: String(row.name), description: String(row.description ?? ""), durationMinutes: Number(row.duration_minutes), priceLabel: String(row.price_label ?? ""), category: String(row.category ?? "other"), imagePath: supabase && imagePath ? await mediaUrl(imagePath, supabase) : imagePath, active: Boolean(row.active) };
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
    supabase.from("services").select("*").eq("profile_id", profile.id).is("deleted_at", null).order("created_at"),
    supabase.from("availability_rules").select("*").eq("profile_id", profile.id).order("weekday"),
    supabase.from("bookings").select("*").eq("profile_id", profile.id).order("date").order("time"),
  ]);
  return {
    profile: { id: String(profile.id), userId, name: profile.name, slug: profile.slug, eyebrow: profile.eyebrow, description: profile.description, address: profile.address, phone: profile.phone, category: profile.category, city: profile.city, avatarPath: profile.avatar_path ?? undefined, coverPath: profile.cover_path ?? undefined, isPublished: profile.is_published },
    services: await Promise.all((serviceRows ?? []).map((row) => mapService(row, supabase))),
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
  if (!isPublicContentSafe(profile.name, profile.eyebrow, profile.description, profile.city, profile.address)) return null;
  const [{ data: serviceRows }, { data: availabilityRows }] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).eq("active", true).is("deleted_at", null).order("created_at"),
    supabase.from("availability_rules").select("*").eq("profile_id", profile.id).order("weekday"),
  ]);
  const [avatarPath, coverPath] = await Promise.all([mediaUrl(profile.avatar_path, supabase), mediaUrl(profile.cover_path, supabase)]);
  return {
    profile: { id: String(profile.id), userId: String(profile.user_id), name: profile.name, slug: profile.slug, eyebrow: profile.eyebrow, description: profile.description, address: profile.address, phone: profile.phone, category: profile.category, city: profile.city, avatarPath, coverPath, isPublished: true },
    services: (await Promise.all((serviceRows ?? []).map((row) => mapService(row, supabase)))).filter((service) => isPublicContentSafe(service.name, service.description)),
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
    .select("id,name,slug,category,city,description,avatar_path,cover_path,services(id,name,description,duration_minutes,price_label,category,active,image_path)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const catalog = (await Promise.all(data.map(async (row) => {
    if (!isPublicContentSafe(row.name, row.description, row.city)) return null;
    return {
      id: String(row.id), name: String(row.name), slug: String(row.slug), category: (row.category ?? "other") as ProfileCategory,
      city: String(row.city ?? ""), description: String(row.description ?? ""), avatarPath: await mediaUrl(row.avatar_path ? String(row.avatar_path) : undefined, supabase),
      coverPath: await mediaUrl(row.cover_path ? String(row.cover_path) : undefined, supabase), services: (await Promise.all(((row.services ?? []) as Record<string, unknown>[]).map((service) => mapService(service, supabase)))).filter((service) => service.active && isPublicContentSafe(service.name, service.description)),
    };
  }))).filter((profile) => profile !== null) as CatalogProfile[];
  return filterCatalogProfiles(catalog, filters);
}
