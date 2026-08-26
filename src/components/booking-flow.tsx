"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityRule, Booking, Service } from "@/src/lib/domain";
import { demoAvailability, demoBookings } from "@/src/lib/demo-data";
import { getAvailableSlots } from "@/src/lib/availability";
import { createClient } from "@/src/lib/supabase/client";

type Props = { services: Service[]; availability?: AvailabilityRule[]; profileId?: string; bookings?: Booking[] };
type OccupiedBooking = Booking & { durationMinutes?: number };
type OccupiedSlot = { start_time: string; duration_minutes: number };

const weekdayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function datesForBooking(availability: AvailabilityRule[]) {
  const dates: string[] = [];
  const current = new Date();
  current.setHours(12, 0, 0, 0);
  for (let offset = 1; offset <= 21; offset += 1) {
    const candidate = new Date(current);
    candidate.setDate(current.getDate() + offset);
    if (availability.some((rule) => rule.weekday === candidate.getDay())) dates.push(candidate.toISOString().slice(0, 10));
  }
  return dates;
}

function slotsFor(date: string, service: Service | undefined, availability: AvailabilityRule[], bookings: OccupiedBooking[], services: Service[]) {
  if (!service) return [];
  const day = new Date(`${date}T12:00:00`).getDay();
  const rule = availability.find((item) => item.weekday === day);
  if (!rule) return [];
  return getAvailableSlots(rule, service.durationMinutes, bookings.filter((booking) => booking.date === date && booking.status !== "cancelled").map((booking) => ({ time: booking.time, durationMinutes: booking.durationMinutes ?? services.find((item) => item.id === booking.serviceId)?.durationMinutes ?? 30 })));
}

export function BookingFlow({ services, availability = demoAvailability, profileId, bookings = demoBookings }: Props) {
  const dates = useMemo(() => datesForBooking(availability), [availability]);
  const [selectedService, setSelectedService] = useState(services[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [occupiedBookings, setOccupiedBookings] = useState(bookings);
  const service = services.find((item) => item.id === selectedService);
  const slots = slotsFor(selectedDate, service, availability, occupiedBookings, services);

  useEffect(() => {
    if (!profileId || !selectedDate) return;
    let active = true;
    async function loadOccupiedSlots() {
      const { data, error: loadError } = await createClient().rpc("get_occupied_booking_slots", { p_profile_id: profileId, p_date: selectedDate });
      if (loadError || !active) return;
      setOccupiedBookings(((data ?? []) as OccupiedSlot[]).map((item) => ({ id: `${selectedDate}-${item.start_time}`, profileId, reference: "", serviceId: "", serviceName: "", date: selectedDate, time: String(item.start_time).slice(0, 5), clientName: "", phone: "", status: "new", createdAt: "", durationMinutes: Number(item.duration_minutes) })));
    }
    void loadOccupiedSlots();
    return () => { active = false; };
  }, [profileId, selectedDate]);

  function chooseDate(date: string) { setSelectedDate(date); setSelectedTime(""); }
  function nextStep() { setError(""); if (step === 1 && !selectedService) return setError("Выберите услугу"); if (step === 2 && !selectedTime) return setError("Выберите свободное время"); setStep((value) => Math.min(3, value + 1) as 1 | 2 | 3); }
  async function submit() {
    if (submitting) return;
    setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, serviceId: selectedService, date: selectedDate, time: selectedTime, clientName: name, phone, comment }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Не удалось создать запись");
      setReference(result.reference);
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Проверьте данные и попробуйте ещё раз"); } finally { setSubmitting(false); }
  }

  if (reference) return <div className="surface mx-auto max-w-3xl p-8 text-center sm:p-14"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mint)] text-3xl text-[var(--accent)]">✓</span><p className="eyebrow mt-7">Готово</p><h2 className="display mt-3 text-4xl font-bold">Время забронировано</h2><p className="mx-auto mt-4 max-w-md leading-7 text-[var(--muted)]">{name}, мы сохранили вашу запись на {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в {selectedTime}. Номер записи — <strong className="text-[var(--ink)]">{reference}</strong>.</p><button onClick={() => window.location.reload()} className="focus-ring mt-8 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold transition hover:border-[var(--accent)]">Создать ещё одну запись</button></div>;

  return <div className="surface mx-auto max-w-4xl overflow-hidden"><div className="border-b border-[var(--line)] px-6 py-6 sm:px-10"><div className="flex items-center justify-between"><div><p className="eyebrow">Записаться онлайн</p><h2 className="display mt-2 text-3xl font-bold sm:text-4xl">Найдите своё окно</h2></div><span className="text-sm font-bold text-[var(--muted)]">{step} <span className="font-normal">из</span> 3</span></div><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#edf1ed]"><div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${(step / 3) * 100}%` }} /></div></div><div className="p-6 sm:p-10">
    {step === 1 && <div><p className="font-bold">Что хотите сделать?</p><div role="radiogroup" aria-label="Выбор услуги" className="mt-5 grid gap-3">{services.map((item) => <button key={item.id} role="radio" aria-checked={selectedService === item.id} onClick={() => setSelectedService(item.id)} className={`focus-ring rounded-2xl border p-4 text-left transition ${selectedService === item.id ? "border-[var(--accent)] bg-[var(--soft)]" : "border-[var(--line)] hover:border-[var(--brand)]"}`}><span className="flex items-center justify-between"><span className="font-bold">{item.name}</span><span className="text-sm font-semibold">{item.priceLabel}</span></span><span className="mt-1 block text-sm text-[var(--muted)]">{item.durationMinutes} минут · {item.description}</span></button>)}</div></div>}
    {step === 2 && <div><p className="font-bold">Когда вам удобно?</p><div role="radiogroup" aria-label="Выбор даты" className="mt-5 flex gap-2 overflow-x-auto pb-2">{dates.map((date) => { const parsed = new Date(`${date}T12:00:00`); const active = date === selectedDate; return <button key={date} role="radio" aria-checked={active} onClick={() => chooseDate(date)} className={`focus-ring min-w-18 rounded-2xl border px-3 py-3 text-center transition ${active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] bg-[var(--card)] hover:border-[var(--accent)]"}`}><span className="block text-xs uppercase opacity-70">{weekdayNames[parsed.getDay()]}</span><strong className="mt-1 block text-xl">{parsed.getDate()}</strong><span className="block text-xs opacity-70">{monthNames[parsed.getMonth()]}</span></button>; })}</div><p className="mt-8 text-sm font-semibold text-[var(--muted)]">Свободное время</p><div role="radiogroup" aria-label="Выбор времени" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((time) => <button key={time} role="radio" aria-checked={selectedTime === time} onClick={() => setSelectedTime(time)} className={`focus-ring rounded-xl border px-3 py-3 text-sm font-bold transition ${selectedTime === time ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] hover:border-[var(--accent)]"}`}>{time}</button>)}</div>{slots.length === 0 && <p className="mt-4 rounded-xl bg-[var(--soft)] p-4 text-sm text-[var(--accent-dark)]">На эту дату свободных окон нет. Выберите другой день.</p>}</div>}
    {step === 3 && <div><p className="font-bold">Куда отправить подтверждение?</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Имя<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Анна" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]" /></label><label className="text-sm font-semibold">Телефон<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 (___) ___-__-__" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]" /></label></div><label className="mt-4 block text-sm font-semibold">Комментарий <span className="font-normal text-[var(--muted)]">необязательно</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например, прийду на макияж к фотосессии" rows={3} className="focus-ring mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]" /></label><div className="mt-6 rounded-2xl bg-[#f5f7f2] p-4 text-sm"><div className="flex justify-between"><span className="text-[var(--muted)]">{service?.name}</span><strong>{service?.priceLabel}</strong></div><div className="mt-2 flex justify-between"><span className="text-[var(--muted)]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span><strong>{selectedTime}</strong></div></div></div>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}
    <div className="mt-8 flex flex-wrap justify-between gap-3"><button onClick={() => setStep((value) => Math.max(1, value - 1) as 1 | 2 | 3)} disabled={step === 1 || submitting} className="focus-ring rounded-full px-5 py-3 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--ink)] disabled:invisible">← Назад</button>{step < 3 ? <button onClick={nextStep} className="focus-ring rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-white transition hover:bg-[var(--accent-dark)]">Продолжить <span aria-hidden>→</span></button> : <button disabled={submitting} onClick={submit} className="focus-ring rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-60">{submitting ? "Сохраняем…" : "Подтвердить запись"}</button>}</div>
  </div></div>;
}
