import type { Service } from "./domain";

export const profileCategories = [
  { value: "beauty", label: "Красота" },
  { value: "barbers", label: "Барберы" },
  { value: "education", label: "Обучение" },
  { value: "sport", label: "Спорт" },
  { value: "photo", label: "Фото" },
  { value: "consulting", label: "Консультации" },
  { value: "repair", label: "Ремонт" },
  { value: "other", label: "Другое" },
] as const;

export type ProfileCategory = (typeof profileCategories)[number]["value"];

export type CatalogProfile = {
  id: string;
  name: string;
  slug: string;
  category: ProfileCategory;
  city: string;
  description: string;
  avatarPath?: string;
  coverPath?: string;
  services: Service[];
};

export type CatalogFilters = { query?: string; category?: string; city?: string; limit?: number };

function normalized(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("ru-RU") ?? "";
}

export function getCategoryLabel(category?: string) {
  return profileCategories.find((item) => item.value === category)?.label ?? "Другое";
}

export function filterCatalogProfiles(profiles: CatalogProfile[], filters: CatalogFilters) {
  const query = normalized(filters.query);
  const category = normalized(filters.category);
  const city = normalized(filters.city);
  const result = profiles.filter((profile) => {
    const matchesQuery = !query || [profile.name, profile.city, profile.category, getCategoryLabel(profile.category), ...profile.services.filter((service) => service.active).flatMap((service) => [service.name, service.description])].some((value) => normalized(value).includes(query));
    const matchesCategory = !category || profile.category === category || profile.services.some((service) => service.active && service.category === category);
    return matchesQuery && matchesCategory && (!city || normalized(profile.city).includes(city));
  });
  return filters.limit ? result.slice(0, filters.limit) : result;
}
