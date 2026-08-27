import { describe, expect, it } from "vitest";
import { isProfileReadyForPublic, isPublicContentSafe } from "./content-safety";

describe("public content safety", () => {
  it("allows ordinary specialist copy", () => {
    expect(isPublicContentSafe("Бережный уход и запись онлайн")).toBe(true);
  });

  it("hides clearly harmful public copy without deleting source data", () => {
    expect(isPublicContentSafe("Устраиваю массовые поджоги усов")).toBe(false);
    expect(isPublicContentSafe("Консультация по уходу", "оружие")).toBe(false);
  });

  it("requires the same profile fields as publication", () => {
    expect(isProfileReadyForPublic({ name: "Алина", description: "Уход", city: "Омск", phone: "+7" })).toBe(true);
    expect(isProfileReadyForPublic({ name: "Test", description: "", city: "", phone: "" })).toBe(false);
  });
});
