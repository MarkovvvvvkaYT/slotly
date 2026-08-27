import { NextResponse } from "next/server";
import { createChallengeToken, hashChallengeToken } from "@/src/lib/telegram-challenges";
import { createClient } from "@/src/lib/supabase/server";

const LOGIN_TTL_MS = 10 * 60 * 1000;

export async function POST() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim();
  if (!botUsername) return NextResponse.json({ required: false });

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (!profile) return NextResponse.json({ required: false });
  const { data: connection, error: connectionError } = await supabase
    .from("telegram_connections")
    .select("id")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .maybeSingle();
  if (connectionError || !connection) return NextResponse.json({ required: false });

  const token = createChallengeToken();
  const expiresAt = new Date(Date.now() + LOGIN_TTL_MS).toISOString();
  const { data: challenge, error } = await supabase.from("telegram_login_challenges").insert({
    user_id: userId,
    profile_id: profile.id,
    token_hash: hashChallengeToken(token),
    expires_at: expiresAt,
  }).select("id").single();
  if (error || !challenge) return NextResponse.json({ required: false });
  return NextResponse.json({
    required: true,
    challengeId: challenge.id,
    url: `https://t.me/${botUsername}?start=login_${token}`,
    expiresAt,
  });
}
