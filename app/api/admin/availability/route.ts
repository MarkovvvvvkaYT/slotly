import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const rule = z.object({ weekday: z.number().int().min(0).max(6), enabled: z.boolean(), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/), breakStart: z.string().regex(/^\d{2}:\d{2}$/).optional(), breakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional() });
const schema = z.object({ rules: z.array(rule).length(7) });

export async function PATCH(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректное расписание" }, { status: 400 });
  const supabase = await createClient(); const { data: claims } = await supabase.auth.getClaims(); const userId = claims?.claims?.sub ? String(claims.claims.sub) : null;
  if (!userId) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Профиль не найден" }, { status: 404 });
  const enabled = parsed.data.rules.filter((item) => item.enabled).map((item) => ({ ...item, breakStart: item.breakStart || undefined, breakEnd: item.breakEnd || undefined }));
  if (enabled.some((item) => Boolean(item.breakStart) !== Boolean(item.breakEnd) || item.start >= item.end || (item.breakStart && item.breakEnd && (item.breakStart >= item.breakEnd || item.breakStart < item.start || item.breakEnd > item.end)))) return NextResponse.json({ error: "Проверьте границы рабочего дня и перерыва" }, { status: 400 });
  const disabled = parsed.data.rules.filter((item) => !item.enabled).map((item) => item.weekday);
  if (disabled.length) { const { error } = await supabase.from("availability_rules").delete().eq("profile_id", profile.id).in("weekday", disabled); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); }
  if (enabled.length) { const { error } = await supabase.from("availability_rules").upsert(enabled.map((item) => ({ profile_id: profile.id, weekday: item.weekday, start_time: item.start, end_time: item.end, break_start: item.breakStart || null, break_end: item.breakEnd || null })), { onConflict: "profile_id,weekday" }); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); }
  return NextResponse.json({ ok: true });
}
