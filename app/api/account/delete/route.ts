import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type DeleteInput = { password?: string; challengeId?: string };

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) return NextResponse.json({ error: "Email аккаунта не найден" }, { status: 400 });
  let input: DeleteInput = {};
  try { input = await request.json() as DeleteInput; } catch { /* empty body is invalid below */ }

  if (typeof input.password === "string" && input.password.length > 0) {
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: input.password });
    if (error) return NextResponse.json({ error: "Неверный пароль" }, { status: 403 });
  } else if (typeof input.challengeId === "string" && input.challengeId.length > 0) {
    const { data: challenge } = await supabase.from("telegram_account_delete_challenges").select("status,expires_at").eq("id", input.challengeId).eq("user_id", userId).maybeSingle();
    if (!challenge || challenge.status !== "approved" || new Date(challenge.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "Подтверждение Telegram не получено или истекло" }, { status: 403 });
  } else {
    return NextResponse.json({ error: "Подтвердите удаление паролем или Telegram" }, { status: 400 });
  }

  const botUrl = process.env.TELEGRAM_BOT_INTERNAL_URL;
  const internalSecret = process.env.TELEGRAM_INTERNAL_SECRET;
  if (!botUrl || !internalSecret) return NextResponse.json({ error: "Удаление аккаунта временно недоступно" }, { status: 503 });
  const deletion = await fetch(`${botUrl.replace(/\/$/, "")}/api/internal/account-delete`, { method: "POST", headers: { "Content-Type": "application/json", "X-Slotly-Internal-Secret": internalSecret }, body: JSON.stringify({ userId }) });
  if (!deletion.ok) return NextResponse.json({ error: "Не удалось удалить аккаунт" }, { status: 500 });
  await supabase.auth.signOut();
  return NextResponse.json({ deleted: true });
}
