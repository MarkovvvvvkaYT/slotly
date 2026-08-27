import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyTelegramStatus } from "@/src/lib/telegram";
import { createClient } from "@/src/lib/supabase/server";

const updateSchema = z.object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "cancelled"]).optional(), action: z.enum(["delete", "restore"]).optional() }).refine((value) => Boolean(value.status) !== Boolean(value.action), "Укажите действие");

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", String(claims.claims.sub)).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Профиль специалиста не найден" }, { status: 404 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректное действие" }, { status: 400 });
  if (parsed.data.action === "delete") {
    const { data, error } = await supabase.from("bookings").update({ deleted_at: new Date().toISOString() }).eq("id", parsed.data.id).eq("profile_id", profile.id).is("deleted_at", null).select("id,deleted_at").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Заявка уже находится в корзине или не найдена" }, { status: 404 });
    return NextResponse.json({ deletedAt: data.deleted_at });
  }
  if (parsed.data.action === "restore") {
    const { data, error } = await supabase.from("bookings").update({ deleted_at: null }).eq("id", parsed.data.id).eq("profile_id", profile.id).gte("deleted_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).select("id,deleted_at").maybeSingle();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Это время уже занято другой заявкой" : error.message }, { status: error.code === "23505" ? 409 : 400 });
    if (!data) return NextResponse.json({ error: "Срок хранения заявки истёк" }, { status: 410 });
    return NextResponse.json({ deletedAt: data.deleted_at });
  }
  const { data, error } = await supabase.from("bookings").update({ status: parsed.data.status }).eq("id", parsed.data.id).eq("profile_id", profile.id).is("deleted_at", null).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  await notifyTelegramStatus({
    id: String(data.id),
    profileId: profile.id,
    reference: String(data.reference),
    serviceId: String(data.service_id),
    serviceName: String(data.service_name),
    date: String(data.date),
    time: String(data.time).slice(0, 5),
    clientName: String(data.client_name),
    phone: String(data.phone),
    comment: data.comment ? String(data.comment) : undefined,
    status: data.status as "new" | "confirmed" | "cancelled",
    createdAt: String(data.created_at),
    deletedAt: data.deleted_at ? String(data.deleted_at) : undefined,
  });
  return NextResponse.json({ status: data.status });
}
