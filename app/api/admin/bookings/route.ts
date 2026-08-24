import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/lib/supabase/server";

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "cancelled"]) });

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Необходим вход" }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  const { data, error } = await supabase.from("bookings").update({ status: parsed.data.status }).eq("id", parsed.data.id).select("id,status").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  return NextResponse.json({ status: data.status });
}
