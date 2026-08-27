import type { Booking } from "./domain";
import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyTelegram, notifyTelegramStatus } from "./telegram-events";

const booking: Booking = {
  id: "booking-1",
  profileId: "profile-1",
  reference: "SL-ABC123",
  serviceId: "service-1",
  serviceName: "Консультация",
  date: "2099-04-12",
  time: "10:00",
  clientName: "Анна",
  phone: "+7 999 123-45-67",
  comment: "Онлайн",
  status: "new",
  createdAt: "2099-04-01T10:00:00.000Z",
};

describe("telegram event forwarding", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("forwards a booking event to the bot internal endpoint", async () => {
    process.env.TELEGRAM_BOT_INTERNAL_URL = "https://bot.example.com";
    process.env.TELEGRAM_INTERNAL_SECRET = "shared-secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));

    await expect(notifyTelegram(booking)).resolves.toEqual({ sent: true, reason: "sent" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://bot.example.com/api/internal/events",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Slotly-Internal-Secret": "shared-secret",
        }),
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      eventKey: "booking.created:booking-1",
      eventType: "booking.created",
      profileId: "profile-1",
      booking,
    });
  });

  it("uses status-specific event keys", async () => {
    process.env.TELEGRAM_BOT_INTERNAL_URL = "https://bot.example.com";
    process.env.TELEGRAM_INTERNAL_SECRET = "shared-secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));

    await expect(notifyTelegramStatus({ ...booking, status: "confirmed" })).resolves.toEqual({ sent: true, reason: "sent" });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      eventKey: "booking.status_changed:booking-1:confirmed",
      eventType: "booking.status_changed",
    });
  });

  it("does not fail booking flow when bot is not configured", async () => {
    delete process.env.TELEGRAM_BOT_INTERNAL_URL;
    delete process.env.TELEGRAM_INTERNAL_SECRET;

    await expect(notifyTelegram(booking)).resolves.toEqual({ sent: false, reason: "not-configured" });
  });

  it("does not throw when bot network call fails", async () => {
    process.env.TELEGRAM_BOT_INTERNAL_URL = "https://bot.example.com";
    process.env.TELEGRAM_INTERNAL_SECRET = "shared-secret";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(notifyTelegram(booking)).resolves.toEqual({ sent: false, reason: "network-error" });
  });
});
