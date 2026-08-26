import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });

  const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return NextResponse.json({ created: false });

  const { data: userData } = await supabase.auth.getUser();
  const metadata = userData.user?.user_metadata ?? {};
  const name = typeof metadata.display_name === "string" && metadata.display_name.trim() ? metadata.display_name.trim().slice(0, 120) : "Новый специалист";
  const requestedSlug = typeof metadata.slug === "string" ? metadata.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") : "";
  const slug = requestedSlug.length >= 3 ? requestedSlug : `profile-${userId.slice(0, 8)}`;
  let { data: profile, error: profileError } = await supabase.from("profiles").insert({ user_id: userId, name, slug }).select("id").single();
  if (profileError?.code === "23505") {
    const fallbackSlug = `${slug}-${userId.slice(0, 6)}`;
    ({ data: profile, error: profileError } = await supabase.from("profiles").insert({ user_id: userId, name, slug: fallbackSlug }).select("id").single());
  }
  if (profileError || !profile) return NextResponse.json({ error: "Не удалось создать кабинет специалиста" }, { status: 400 });
  const defaults = [1, 2, 3, 4, 5].map((weekday) => ({ profile_id: profile.id, weekday, start_time: "10:00", end_time: "19:00", break_start: "14:00", break_end: "15:00" }));
  await supabase.from("availability_rules").insert(defaults);
  return NextResponse.json({ created: true });
}
