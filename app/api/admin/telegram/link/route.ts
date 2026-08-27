import { NextResponse } from "next/server";
import { createChallengeToken, hashChallengeToken } from "@/src/lib/telegram-challenges";
import { createClient } from "@/src/lib/supabase/server";

const LINK_TTL_MS = 15 * 60 * 1000;

export async function POST() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim();
  if (!botUsername) return NextResponse.json({ error: "Telegram-бот ещё не настроен" }, { status: 503 });

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Профиль специалиста не найден" }, { status: 404 });

  const token = createChallengeToken();
  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();
  const { error } = await supabase.from("telegram_link_challenges").insert({
    profile_id: profile.id,
    token_hash: hashChallengeToken(token),
    expires_at: expiresAt,
  });
  if (error) return NextResponse.json({ error: "Не удалось создать ссылку привязки" }, { status: 400 });
  return NextResponse.json({
    url: `https://t.me/${botUsername}?start=link_${token}`,
    expiresAt,
  });
}
