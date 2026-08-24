import { describe, expect, it } from "vitest";
import { POST } from "../../../../app/api/bookings/route";

describe("POST /api/bookings", () => {
  it("rejects invalid input", async () => {
    const response = await POST(new Request("http://localhost/api/bookings", { method: "POST", body: JSON.stringify({}) }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBeTruthy();
  });
});
