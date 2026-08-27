import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

async function ownerProfile() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return { supabase, userId: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  return { supabase, userId, profile };
}

export async function GET() {
  const { supabase, profile } = await ownerProfile();
  if (!profile) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data, error } = await supabase
    .from("telegram_connections")
    .select("id,telegram_user_id,chat_id,username,display_name,linked_at,last_seen_at")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Не удалось загрузить связь Telegram" }, { status: 400 });
  return NextResponse.json({ connection: data ?? null });
}

export async function DELETE() {
  const { supabase, profile } = await ownerProfile();
  if (!profile) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { error } = await supabase
    .from("telegram_connections")
    .update({ revoked_at: new Date().toISOString() })
    .eq("profile_id", profile.id)
    .is("revoked_at", null);
  if (error) return NextResponse.json({ error: "Не удалось отвязать Telegram" }, { status: 400 });
  return NextResponse.json({ disconnected: true });
}
