import { NextResponse } from "next/server";
import { notifyTelegram } from "../../../src/lib/telegram";
import { createServerBooking } from "../../../src/lib/server-bookings";
import { bookingSchema } from "../../../src/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте данные" }, { status: 400 });
    }
    const booking = await createServerBooking(parsed.data);
    await notifyTelegram(booking);
    return NextResponse.json({ reference: booking.reference, booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать запись";
    return NextResponse.json({ error: message }, { status: message.includes("занят") ? 409 : 400 });
  }
}
