import { describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("./supabase", () => ({ isSupabaseConfigured: () => true }));

vi.mock("./supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const row = table === "profiles"
        ? { id: "profile-1", is_published: true }
        : table === "services"
          ? { id: "service-1", name: "Стрижка", profile_id: "profile-1", active: true, duration_minutes: 60 }
          : { start_time: "10:00", end_time: "19:00", break_start: null, break_end: null };
      const query = {
        eq: () => query,
        maybeSingle: async () => ({ data: row }),
        neq: async () => ({ data: [] }),
      };
      return {
        select: () => query,
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "booking-1", reference: "SL-ABC123", profile_id: "profile-1", service_id: "service-1", service_name: "Стрижка", date: "2099-04-12", time: "10:00", client_name: "Анна", phone: "+79991234567", status: "new", created_at: "2099-01-01" }, error: null }),
          }),
        }),
      };
    },
    rpc,
  }),
}));

import { createServerBooking } from "./server-bookings";

describe("createServerBooking", () => {
  it("loads occupied slots through the limited availability RPC", async () => {
    rpc.mockResolvedValue({ data: [], error: null });

    await createServerBooking({ profileId: "profile-1", serviceId: "service-1", date: "2099-04-12", time: "10:00", clientName: "Анна", phone: "+79991234567" });

    expect(rpc).toHaveBeenCalledWith("get_occupied_booking_slots", { p_date: "2099-04-12", p_profile_id: "profile-1" });
  });
});
