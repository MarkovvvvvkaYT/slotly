import { demoAvailability, demoBookings, demoServices } from "./demo-data";
import type { Booking, BookingInput, BookingRepository, BookingStatus, Service } from "./domain";

const bookingStore = [...demoBookings];

export function getDemoRepository(): BookingRepository {
  return {
    async listServices() { return demoServices.filter((service) => service.active); },
    async listBookings(date) { return bookingStore.filter((booking) => !date || booking.date === date); },
    async getAvailability() { return demoAvailability; },
    async createBooking(input: BookingInput) {
      const service = demoServices.find((item) => item.id === input.serviceId);
      if (!service) throw new Error("Услуга не найдена");
      const occupied = bookingStore.some((booking) => booking.date === input.date && booking.time === input.time && booking.status !== "cancelled");
      if (occupied) throw new Error("Этот слот уже занят");
      const booking: Booking = {
        id: `demo-${Date.now()}`,
        reference: `VE-${Math.floor(1000 + Math.random() * 8999)}`,
        serviceId: service.id,
        serviceName: service.name,
        date: input.date,
        time: input.time,
        clientName: input.clientName,
        phone: input.phone,
        comment: input.comment,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      bookingStore.push(booking);
      return booking;
    },
    async updateBookingStatus(id: string, status: BookingStatus) {
      const booking = bookingStore.find((item) => item.id === id);
      if (!booking) return null;
      booking.status = status;
      return booking;
    },
  };
}

export function getServices(): Service[] { return demoServices.filter((service) => service.active); }
