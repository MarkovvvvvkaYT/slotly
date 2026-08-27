import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const profileSchema = z.object({
  isPublished: z.boolean().optional(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  eyebrow: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(32).optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,48}$/).optional(),
  category: z.enum(["beauty", "barbers", "education", "sport", "photo", "consulting", "repair", "other"]).optional(),
  avatarPath: z.string().max(240).nullable().optional(),
  coverPath: z.string().max(240).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, "Передайте данные профиля");

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  if (parsed.data.isPublished) {
    const { data: profile } = await supabase.from("profiles").select("id,name,description,city,phone").eq("user_id", userId).maybeSingle();
    const { count: activeServices } = profile ? await supabase.from("services").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).eq("active", true).is("deleted_at", null) : { count: 0 };
    if (!profile?.name || !profile.description || !profile.city || !profile.phone || !activeServices) return NextResponse.json({ error: "Перед публикацией заполните профиль, контакты и добавьте хотя бы одну услугу" }, { status: 400 });
  }
  const update = {
    ...(parsed.data.isPublished !== undefined ? { is_published: parsed.data.isPublished } : {}),
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
    ...(parsed.data.eyebrow !== undefined ? { eyebrow: parsed.data.eyebrow } : {}),
    ...(parsed.data.city !== undefined ? { city: parsed.data.city } : {}),
    ...(parsed.data.address !== undefined ? { address: parsed.data.address } : {}),
    ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
    ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
    ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
    ...(parsed.data.avatarPath !== undefined ? { avatar_path: parsed.data.avatarPath } : {}),
    ...(parsed.data.coverPath !== undefined ? { cover_path: parsed.data.coverPath } : {}),
  };
  const { data, error } = await supabase.from("profiles").update(update).eq("user_id", userId).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: { isPublished: data.is_published, name: data.name, slug: data.slug, category: data.category, city: data.city, avatarPath: data.avatar_path, coverPath: data.cover_path } });
}
