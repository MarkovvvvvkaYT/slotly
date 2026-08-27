import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { id } = await context.params;
  const { data, error } = await supabase
    .from("telegram_login_challenges")
    .select("id,status,expires_at,decided_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Запрос входа не найден" }, { status: 404 });
  const status = data.status === "pending" && new Date(data.expires_at).getTime() <= Date.now() ? "expired" : data.status;
  return NextResponse.json({ id: data.id, status, expiresAt: data.expires_at, decidedAt: data.decided_at });
}
