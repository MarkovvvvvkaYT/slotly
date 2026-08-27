import { NextResponse } from "next/server";
import { createChallengeToken, hashChallengeToken } from "@/src/lib/telegram-challenges";
import { createClient } from "@/src/lib/supabase/server";

const DELETE_TTL_MS = 10 * 60 * 1000;

export async function POST() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim();
  if (!botUsername) return NextResponse.json({ error: "Telegram недоступен" }, { status: 503 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Профиль специалиста не найден" }, { status: 400 });
  const { data: connection } = await supabase.from("telegram_connections").select("id").eq("profile_id", profile.id).is("revoked_at", null).maybeSingle();
  if (!connection) return NextResponse.json({ error: "Сначала подключите Telegram в профиле" }, { status: 400 });
  const token = createChallengeToken();
  const expiresAt = new Date(Date.now() + DELETE_TTL_MS).toISOString();
  const { data: challenge, error } = await supabase.from("telegram_account_delete_challenges").insert({ user_id: userId, profile_id: profile.id, token_hash: hashChallengeToken(token), expires_at: expiresAt }).select("id").single();
  if (error || !challenge) return NextResponse.json({ error: "Не удалось создать подтверждение" }, { status: 500 });
  return NextResponse.json({ id: challenge.id, url: `https://t.me/${botUsername}?start=delete_${token}`, expiresAt });
}
