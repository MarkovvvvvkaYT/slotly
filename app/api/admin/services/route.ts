import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const serviceSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).default(""), durationMinutes: z.coerce.number().int().min(15).max(480), priceLabel: z.string().trim().max(40).default(""), imagePath: z.string().trim().max(240).nullable().optional() });

async function ownerProfile() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return { supabase, profile: null };
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  return { supabase, profile };
}

export async function POST(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const parsed = serviceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Проверьте данные услуги" }, { status: 400 });
  const { data, error } = await supabase.from("services").insert({ profile_id: profile.id, name: parsed.data.name, description: parsed.data.description, duration_minutes: parsed.data.durationMinutes, price_label: parsed.data.priceLabel, image_path: parsed.data.imagePath ?? null }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ service: { id: data.id, profileId: data.profile_id, name: data.name, description: data.description, durationMinutes: data.duration_minutes, priceLabel: data.price_label, imagePath: data.image_path ?? undefined, active: data.active } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const body = await request.json() as { id?: string; active?: boolean; imagePath?: string | null };
  if (!body.id || (typeof body.active !== "boolean" && typeof body.imagePath !== "string" && body.imagePath !== null)) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const updates = typeof body.active === "boolean" ? { active: body.active } : { image_path: body.imagePath };
  const { data, error } = await supabase.from("services").update(updates).eq("id", body.id).eq("profile_id", profile.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  return NextResponse.json({ active: data.active, imagePath: data.image_path ?? undefined });
}

// Services are kept for booking history; removing one hides it from the catalog.
export async function DELETE(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { data, error } = await supabase.from("services").update({ active: false }).eq("id", body.id).eq("profile_id", profile.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
