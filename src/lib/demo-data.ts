import type { AvailabilityRule, Booking, Profile, Service } from "./domain";

export const demoProfile: Profile = {
  name: "Алина Воронова",
  slug: "alina-voronova",
  eyebrow: "Студия ухода и макияжа",
  description: "Бережный уход, аккуратный образ и понятная запись без переписок туда-сюда.",
  address: "Новосибирск · Красный проспект, 42",
  phone: "+7 (913) 555-42-18",
};

export const demoServices: Service[] = [
  { id: "face", name: "Уход за лицом", description: "Диагностика, очищение и увлажнение под состояние кожи.", durationMinutes: 60, priceLabel: "2 800 ₽", active: true },
  { id: "makeup", name: "Макияж на событие", description: "Стойкий образ для встречи, съёмки или важного вечера.", durationMinutes: 90, priceLabel: "3 500 ₽", active: true },
  { id: "brows", name: "Брови и укладка", description: "Форма, окрашивание и лёгкая укладка без лишнего.", durationMinutes: 45, priceLabel: "1 600 ₽", active: true },
];

export const demoAvailability: AvailabilityRule[] = [
  { weekday: 1, start: "10:00", end: "19:00", breakStart: "14:00", breakEnd: "15:00" },
  { weekday: 2, start: "10:00", end: "19:00", breakStart: "14:00", breakEnd: "15:00" },
  { weekday: 3, start: "10:00", end: "19:00", breakStart: "14:00", breakEnd: "15:00" },
  { weekday: 4, start: "12:00", end: "20:00" },
  { weekday: 5, start: "10:00", end: "19:00", breakStart: "14:00", breakEnd: "15:00" },
];

const nextDate = (offset: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const demoBookings: Booking[] = [
  { id: "b-1001", reference: "VE-8421", serviceId: "makeup", serviceName: "Макияж на событие", date: nextDate(1), time: "12:00", clientName: "Мария К.", phone: "+7 (999) 123-45-67", comment: "Нужен образ к фотосессии", status: "confirmed", createdAt: new Date().toISOString() },
  { id: "b-1002", reference: "VE-8422", serviceId: "face", serviceName: "Уход за лицом", date: nextDate(1), time: "16:00", clientName: "Ольга С.", phone: "+7 (999) 765-43-21", status: "new", createdAt: new Date().toISOString() },
  { id: "b-1003", reference: "VE-8423", serviceId: "brows", serviceName: "Брови и укладка", date: nextDate(2), time: "11:00", clientName: "Ксения Л.", phone: "+7 (999) 111-22-33", status: "new", createdAt: new Date().toISOString() },
];

export function getLocalDate(offset = 1) {
  return nextDate(offset);
}
