import { describe, expect, it } from "vitest";
import { site } from "./site";

describe("site brand", () => {
  it("uses Slotly as the public product name", () => {
    expect(site.name).toBe("Slotly");
    expect(site.title).toBe("Slotly — запись без переписок");
  });
});
