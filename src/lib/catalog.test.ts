import { describe, expect, it } from "vitest";
import { filterCatalogProfiles, profileCategories, type CatalogProfile } from "./catalog";

const profiles: CatalogProfile[] = [
  { id: "1", name: "Алина Воронова", slug: "alina", category: "beauty", city: "Новосибирск", description: "Макияж", services: [{ id: "makeup", name: "Свадебный макияж", description: "", durationMinutes: 90, priceLabel: "3 500 ₽", active: true }] },
  { id: "2", name: "Илья Котов", slug: "ilya", category: "sport", city: "Омск", description: "Тренер", services: [{ id: "training", name: "Персональная тренировка", description: "", durationMinutes: 60, priceLabel: "2 000 ₽", active: true }] },
];

describe("filterCatalogProfiles", () => {
  it("finds a published specialist by an active service name", () => {
    expect(filterCatalogProfiles(profiles, { query: "свадебный" }).map((profile) => profile.slug)).toEqual(["alina"]);
  });

  it("combines a controlled category with a city filter", () => {
    expect(filterCatalogProfiles(profiles, { category: "sport", city: "омск" }).map((profile) => profile.slug)).toEqual(["ilya"]);
  });

  it("exposes the agreed MVP category set", () => {
    expect(profileCategories.map((category) => category.value)).toEqual(["beauty", "barbers", "education", "sport", "photo", "consulting", "repair", "other"]);
  });
});
