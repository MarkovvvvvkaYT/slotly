import type { Booking, BookingStatus } from "./domain";

type TelegramEventType = "booking.created" | "booking.status_changed";

type TelegramEventResult =
  | { sent: true; reason: "sent" }
  | { sent: false; reason: "not-configured" | "telegram-error" | "network-error" };

function eventPayload(booking: Booking, eventType: TelegramEventType) {
  const profileId = booking.profileId;
  if (!profileId) return null;
  const suffix = eventType === "booking.created" ? "" : `:${booking.status}`;
  return {
    eventKey: `${eventType}:${booking.id}${suffix}`,
    eventType,
    profileId,
    booking,
  };
}

async function sendEvent(booking: Booking, eventType: TelegramEventType): Promise<TelegramEventResult> {
  const url = process.env.TELEGRAM_BOT_INTERNAL_URL;
  const secret = process.env.TELEGRAM_INTERNAL_SECRET;
  const payload = eventPayload(booking, eventType);
  if (!url || !secret || !payload) return { sent: false, reason: "not-configured" };

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/api/internal/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Slotly-Internal-Secret": secret,
      },
      body: JSON.stringify(payload),
    });
    return response.ok ? { sent: true, reason: "sent" } : { sent: false, reason: "telegram-error" };
  } catch {
    return { sent: false, reason: "network-error" };
  }
}

export function notifyTelegram(booking: Booking) {
  return sendEvent(booking, "booking.created");
}

export function notifyTelegramStatus(booking: Booking & { status: BookingStatus }) {
  return sendEvent(booking, "booking.status_changed");
}
