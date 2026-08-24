import type { Booking } from "./domain";

export async function notifyTelegram(booking: Booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { sent: false, reason: "not-configured" as const };

  const text = [
    "Новая запись в Slotly",
    `${booking.serviceName} · ${booking.date} в ${booking.time}`,
    `Клиент: ${booking.clientName}`,
    `Телефон: ${booking.phone}`,
    booking.comment ? `Комментарий: ${booking.comment}` : "",
    `Номер: ${booking.reference}`,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return { sent: response.ok, reason: response.ok ? "sent" as const : "telegram-error" as const };
  } catch {
    return { sent: false, reason: "network-error" as const };
  }
}
