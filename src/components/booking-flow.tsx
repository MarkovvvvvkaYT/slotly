"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [customerEmail, setCustomerEmail] = useState("");
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

  useEffect(() => {
    let active = true;
    void createClient().auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      setCustomerEmail(data.user.email ?? "");
      const displayName = data.user.user_metadata?.display_name;
      if (typeof displayName === "string" && displayName.trim()) setName((value) => value || displayName);
    });
    return () => { active = false; };
  }, []);

  function chooseDate(date: string) { setSelectedDate(date); setSelectedTime(""); }
  function nextStep() {
    setError("");
    if (step === 1 && !selectedService) return setError("Выберите услугу");
    if (step === 2 && !selectedTime) return setError("Выберите свободное время");
    setStep((value) => Math.min(3, value + 1) as 1 | 2 | 3);
  }
  async function submit() {
    if (submitting || !name.trim() || !phone.trim()) {
      if (!name.trim() || !phone.trim()) setError("Укажите имя и телефон для подтверждения записи");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, serviceId: selectedService, date: selectedDate, time: selectedTime, clientName: name, phone, comment }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Не удалось создать запись");
      setReference(result.reference);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Проверьте данные и попробуйте ещё раз");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return <section className="mx-auto max-w-4xl rounded-2xl border border-[#dce2ef] bg-white p-8 text-center shadow-[0_6px_16px_rgb(20_39_85_/_0.08)] sm:p-14"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8efff] text-2xl font-bold text-[#1754d1]">✓</span><h2 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Запись подтверждена</h2><p className="mx-auto mt-3 max-w-md leading-7 text-[#626671]">{name}, мы сохранили запись на {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в {selectedTime}. Номер — <strong className="text-[#17191f]">{reference}</strong>.</p><button onClick={() => window.location.reload()} className="focus-ring mt-7 rounded-lg border border-[#cbd4e6] px-4 py-2.5 text-sm font-bold text-[#1754d1] transition hover:border-[#1754d1]">Создать ещё одну запись</button></section>;
  }

  return (
    <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#dce2ef] bg-white shadow-[0_6px_16px_rgb(20_39_85_/_0.08)]" aria-label="Онлайн-запись">
      <header className="border-b border-[#e7eaf0] px-6 py-6 sm:px-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-[#1754d1]">Онлайн-запись</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">Выберите удобное время</h2>
          </div>
          <span className="shrink-0 rounded-full bg-[#f1f5ff] px-3 py-1.5 text-sm font-semibold text-[#1754d1]">Шаг {step} из 3</span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e5ebf8]"><div className="h-full rounded-full bg-[#1754d1] transition-[width] duration-200 ease-out" style={{ width: `${(step / 3) * 100}%` }} /></div>
      </header>

      <div className="p-6 sm:p-10">
        {step === 1 && <div><h3 className="text-lg font-bold">Что хотите сделать?</h3><p className="mt-1 text-sm text-[#626671]">Выберите одну услугу, затем найдём свободное время.</p><div role="radiogroup" aria-label="Выбор услуги" className="mt-6 grid gap-3">{services.map((item) => <button key={item.id} role="radio" aria-checked={selectedService === item.id} onClick={() => setSelectedService(item.id)} className={`focus-ring flex items-center gap-4 rounded-xl border p-3 text-left transition ${selectedService === item.id ? "border-[#1754d1] bg-[#f3f6ff]" : "border-[#dfe3ea] hover:border-[#97afe6]"}`}><span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#e8edf8] bg-cover bg-center text-lg font-bold text-[#1754d1]" style={item.imagePath ? { backgroundImage: `url("${item.imagePath}")` } : undefined}>{item.imagePath ? <span className="sr-only">Фото услуги {item.name}</span> : item.name.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-3"><strong className="truncate">{item.name}</strong><strong className="shrink-0 text-sm">{item.priceLabel}</strong></span><span className="mt-1 block truncate text-sm text-[#626671]">{item.durationMinutes} минут{item.description ? ` · ${item.description}` : ""}</span></span></button>)}</div>{services.length === 0 && <p className="mt-5 rounded-xl bg-[#fff4e8] p-4 text-sm text-[#8d4b14]">У специалиста пока нет доступных услуг.</p>}</div>}

        {step === 2 && <div><h3 className="text-lg font-bold">Когда вам удобно?</h3><div role="radiogroup" aria-label="Выбор даты" className="mt-5 flex gap-2 overflow-x-auto pb-2">{dates.map((date) => { const parsed = new Date(`${date}T12:00:00`); const active = date === selectedDate; return <button key={date} role="radio" aria-checked={active} onClick={() => chooseDate(date)} className={`focus-ring min-w-16 rounded-lg border px-3 py-3 text-center transition ${active ? "border-[#1754d1] bg-[#1754d1] text-white" : "border-[#dfe3ea] bg-white hover:border-[#97afe6]"}`}><span className="block text-xs uppercase opacity-75">{weekdayNames[parsed.getDay()]}</span><strong className="mt-1 block text-xl">{parsed.getDate()}</strong><span className="block text-xs opacity-75">{monthNames[parsed.getMonth()]}</span></button>; })}</div><p className="mt-8 text-sm font-semibold text-[#4e5460]">Свободное время</p><div role="radiogroup" aria-label="Выбор времени" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((time) => <button key={time} role="radio" aria-checked={selectedTime === time} onClick={() => setSelectedTime(time)} className={`focus-ring rounded-lg border px-3 py-3 text-sm font-bold transition ${selectedTime === time ? "border-[#1754d1] bg-[#1754d1] text-white" : "border-[#dfe3ea] bg-white hover:border-[#97afe6]"}`}>{time}</button>)}</div>{slots.length === 0 && <p className="mt-4 rounded-xl bg-[#fff4e8] p-4 text-sm text-[#8d4b14]">На эту дату свободных окон нет. Выберите другой день.</p>}</div>}

        {step === 3 && <div><h3 className="text-lg font-bold">Контакты для подтверждения</h3>{customerEmail ? <p className="mt-3 rounded-xl bg-[#f3f6ff] px-4 py-3 text-sm font-semibold text-[#1754d1]">Вы вошли как {customerEmail}. Запись появится в <Link href="/account" className="underline">личном кабинете</Link>.</p> : <p className="mt-3 rounded-xl bg-[#f3f6ff] px-4 py-3 text-sm text-[#4e5460]">Можно записаться как гость или <Link href="/login?next=/account" className="font-bold text-[#1754d1] underline">войти как клиент</Link>, чтобы видеть запись в личном кабинете.</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Имя<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Анна" className="focus-ring mt-2 w-full rounded-lg border border-[#d7dce5] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#1754d1]" /></label><label className="text-sm font-semibold">Телефон<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 (___) ___-__-__" className="focus-ring mt-2 w-full rounded-lg border border-[#d7dce5] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#1754d1]" /></label></div><label className="mt-4 block text-sm font-semibold">Комментарий <span className="font-normal text-[#626671]">необязательно</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например, приду на макияж к фотосессии" rows={3} className="focus-ring mt-2 w-full resize-none rounded-lg border border-[#d7dce5] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#1754d1]" /></label><div className="mt-6 rounded-xl bg-[#f4f6fa] p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-[#626671]">{service?.name}</span><strong className="text-right">{service?.priceLabel}</strong></div><div className="mt-2 flex justify-between gap-4"><span className="text-[#626671]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span><strong>{selectedTime}</strong></div></div></div>}

        {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#a33c2e]">{error}</p>}
        <div className="mt-8 flex flex-wrap justify-between gap-3"><button onClick={() => setStep((value) => Math.max(1, value - 1) as 1 | 2 | 3)} disabled={step === 1 || submitting} className="focus-ring rounded-lg px-4 py-3 text-sm font-bold text-[#626671] transition hover:text-[#17191f] disabled:invisible">← Назад</button>{step < 3 ? <button onClick={nextStep} className="focus-ring rounded-lg bg-[#1754d1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103e9d]">Продолжить →</button> : <button disabled={submitting} onClick={submit} className="focus-ring rounded-lg bg-[#1754d1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103e9d] disabled:cursor-wait disabled:opacity-60">{submitting ? "Сохраняем…" : "Подтвердить запись"}</button>}</div>
      </div>
    </section>
  );
}
