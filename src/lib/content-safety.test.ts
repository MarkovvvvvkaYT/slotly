import { describe, expect, it } from "vitest";
import { isPublicContentSafe } from "./content-safety";

describe("public content safety", () => {
  it("allows ordinary specialist copy", () => {
    expect(isPublicContentSafe("Бережный уход и запись онлайн")).toBe(true);
  });

  it("hides clearly harmful public copy without deleting source data", () => {
    expect(isPublicContentSafe("Устраиваю массовые поджоги усов")).toBe(false);
    expect(isPublicContentSafe("Консультация по уходу", "оружие")).toBe(false);
  });
});
