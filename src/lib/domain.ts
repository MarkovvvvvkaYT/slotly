export type BookingStatus = "new" | "confirmed" | "cancelled";

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  active: boolean;
};

export type AvailabilityRule = {
  weekday: number;
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
};

export type Booking = {
  id: string;
  reference: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  comment?: string;
  status: BookingStatus;
  createdAt: string;
};

export type Profile = {
  name: string;
  slug: string;
  eyebrow: string;
  description: string;
  address: string;
  phone: string;
};

export type BookingInput = {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  comment?: string;
};

export type BookingRepository = {
  listServices(): Promise<Service[]>;
  listBookings(date?: string): Promise<Booking[]>;
  getAvailability(): Promise<AvailabilityRule[]>;
  createBooking(input: BookingInput): Promise<Booking>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null>;
};
