import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const categories = [
  "beauty",
  "barbers",
  "education",
  "sport",
  "photo",
  "consulting",
  "repair",
  "other",
] as const;
const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).default(""),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  priceLabel: z.string().trim().max(40).default(""),
  category: z.enum(categories).default("other"),
  imagePath: z.string().trim().max(240).nullable().optional(),
});

const updateSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
    priceLabel: z.string().trim().max(40).optional(),
    category: z.enum(categories).optional(),
    imagePath: z.string().trim().max(240).nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).some((key) => key !== "id"), {
    message: "Укажите изменения услуги",
  });

type ServiceRow = {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_label: string | null;
  category: string;
  image_path: string | null;
  active: boolean;
};

function serializeService(data: ServiceRow) {
  return {
    id: data.id,
    profileId: data.profile_id,
    name: data.name,
    description: data.description ?? "",
    durationMinutes: data.duration_minutes,
    priceLabel: data.price_label ?? "",
    category: data.category,
    imagePath: data.image_path ?? undefined,
    active: data.active,
  };
}

async function ownerProfile() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return { supabase, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return { supabase, profile };
}

export async function POST(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile)
    return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const parsed = serviceSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Проверьте данные услуги" },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from("services")
    .insert({
      profile_id: profile.id,
      name: parsed.data.name,
      description: parsed.data.description,
      duration_minutes: parsed.data.durationMinutes,
      price_label: parsed.data.priceLabel,
      category: parsed.data.category,
      image_path: parsed.data.imagePath ?? null,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(
    { service: serializeService(data as ServiceRow) },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile)
    return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Проверьте данные услуги" },
      { status: 400 },
    );
  const { id, durationMinutes, imagePath, priceLabel, ...rest } = parsed.data;
  const updates = {
    ...rest,
    ...(priceLabel !== undefined ? { price_label: priceLabel } : {}),
    ...(durationMinutes !== undefined
      ? { duration_minutes: durationMinutes }
      : {}),
    ...(imagePath !== undefined ? { image_path: imagePath } : {}),
  };
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .eq("profile_id", profile.id)
    .select("*")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  return NextResponse.json({ service: serializeService(data as ServiceRow) });
}

// Services are kept for booking history; removing one hides it from the catalog.
export async function DELETE(request: Request) {
  const { supabase, profile } = await ownerProfile();
  if (!profile)
    return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const body = (await request.json()) as { id?: string };
  if (!body.id)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { data, error } = await supabase
    .from("services")
    .update({ active: false })
    .eq("id", body.id)
    .eq("profile_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
