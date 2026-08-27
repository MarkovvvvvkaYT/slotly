"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Booking, BookingStatus, Profile, Service } from "@/src/lib/domain";

type Props = {
  initialBookings: Booking[];
  initialServices: Service[];
  profile: Profile;
  demo: boolean;
};

const statusText: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
};

const statusClass: Record<BookingStatus, string> = {
  new: "bg-[var(--soft)] text-[var(--accent-dark)]",
  confirmed: "bg-[var(--mint)] text-[var(--brand)]",
  cancelled: "bg-[#f3f4f6] text-[#626671]",
};

export function AdminDashboard({ initialBookings, initialServices, profile, demo }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(Boolean(profile.isPublished));
  const filtered = useMemo(() => bookings.filter((booking) => filter === "all" || booking.status === filter), [bookings, filter]);
  const counts = { all: bookings.length, new: bookings.filter((booking) => booking.status === "new").length, confirmed: bookings.filter((booking) => booking.status === "confirmed").length };
  const confirmationRate = counts.all ? Math.round((counts.confirmed / counts.all) * 100) : 0;
  const upcoming = bookings.filter((booking) => booking.status !== "cancelled" && booking.date >= new Date().toISOString().slice(0, 10)).length;
  const publicUrl = demo ? "/" : `/p/${profile.slug}`;
  const setupSteps = [
    { href: "/admin/profile", label: "Заполнить профиль", done: Boolean(profile.name && profile.description && profile.city && profile.phone) },
    { href: "/admin/services", label: "Добавить услугу", done: initialServices.some((service) => service.active) },
    { href: "/admin/profile", label: "Опубликовать страницу", done: published },
  ];

  async function changeStatus(id: string, status: BookingStatus) {
    setError("");
    if (!demo) {
      const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!response.ok) return setError("Не удалось обновить статус");
    }
    setBookings((items) => items.map((booking) => booking.id === id ? { ...booking, status } : booking));
  }

  async function togglePublished() {
    const next = !published;
    if (!demo) {
      const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: next }) });
      if (!response.ok) return setError("Не удалось изменить публикацию профиля");
    }
    setPublished(next);
    setNotice(next ? "Профиль опубликован" : "Профиль скрыт из каталога");
  }

  return <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div><p className="eyebrow mb-3">Рабочий стол владельца</p><h1 className="display text-4xl font-bold sm:text-5xl">Управляйте записью спокойно</h1><p className="mt-2 text-[var(--muted)]">{demo ? "Демо-режим · изменения сохраняются до перезагрузки" : "Заявки и услуги в одном месте"}</p></div>
      <button type="button" onClick={togglePublished} aria-pressed={published} className="focus-ring rounded-lg border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-bold transition hover:border-[var(--brand)]">{published ? "Скрыть профиль" : "Опубликовать профиль"}</button>
    </div>
    {notice && <p role="status" className="mb-5 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">{notice}</p>}
    {error && <p role="alert" className="mb-5 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}
    {setupSteps.some((step) => !step.done) && <section className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Первый запуск</p><h2 className="mt-2 text-xl font-bold">Подготовьте страницу к первой записи</h2></div><span className="rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">{setupSteps.filter((step) => step.done).length}/3 готово</span></div><div className="mt-5 grid gap-2 sm:grid-cols-3">{setupSteps.map((step) => <Link key={step.label} href={step.href} className={`focus-ring rounded-xl border px-4 py-3 text-sm font-bold transition ${step.done ? "border-[var(--line)] text-[var(--muted)] line-through" : "border-[var(--brand)] bg-[var(--soft)] text-[var(--brand)] hover:bg-[var(--mint)]"}`}>{step.done ? "Готово · " : "Далее · "}{step.label}</Link>)}</div></section>}
    <section aria-label="Основные показатели" className="grid gap-4 sm:grid-cols-3">
      {[["Все записи", counts.all, "all"], ["Нужно подтвердить", counts.new, "new"], ["Подтверждены", counts.confirmed, "confirmed"]].map(([label, value, key]) => <button type="button" key={key} onClick={() => setFilter(key as "all" | BookingStatus)} className={`focus-ring surface p-5 text-left transition ${filter === key ? "border-[var(--brand)] bg-[var(--soft)]" : "hover:border-[var(--brand)]"}`}><span className="text-sm text-[var(--muted)]">{label}</span><strong className="mt-3 block text-3xl">{value}</strong></button>)}
    </section>
    <section aria-label="Аналитика" className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label="Конверсия в подтверждение" value={`${confirmationRate}%`} note="от всех заявок" /><Metric label="Впереди" value={upcoming} note="актуальных записей" /><Metric label="Активные услуги" value={initialServices.filter((service) => service.active).length} note="видны клиентам" /></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
      <div className="surface overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-6"><h2 className="font-bold">Список записей</h2><span className="text-sm text-[var(--muted)]">Фильтр: {filter === "all" ? "все" : statusText[filter]}</span></div><div className="divide-y divide-[var(--line)]">{filtered.length ? filtered.map((booking) => <article key={booking.id} className="p-5 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-bold">{booking.time}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[booking.status]}`}>{statusText[booking.status]}</span></div><h3 className="mt-3 font-bold">{booking.clientName} · {booking.serviceName}</h3><p className="mt-1 text-sm text-[var(--muted)]">{booking.phone}{booking.comment ? ` · ${booking.comment}` : ""}</p></div><span className="text-xs text-[var(--muted)]">#{booking.reference}</span></div><div className="mt-4 flex flex-wrap gap-2">{booking.status === "new" && <button type="button" onClick={() => void changeStatus(booking.id, "confirmed")} className="focus-ring rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--accent-dark)]">Подтвердить</button>}{booking.status !== "cancelled" ? <button type="button" onClick={() => void changeStatus(booking.id, "cancelled")} className="focus-ring rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-[var(--brand)]">Отменить</button> : <button type="button" onClick={() => void changeStatus(booking.id, "new")} className="focus-ring rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-[var(--brand)]">Вернуть</button>}</div></article>) : <p className="p-8 text-center text-sm text-[var(--muted)]">Записей с такими фильтрами нет.</p>}</div></div>
      <aside className="space-y-5"><div className="surface p-6"><p className="eyebrow">Услуги</p><h2 className="mt-3 text-xl font-bold">Каталог и фотографии</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Изменяйте описание, категорию, стоимость, видимость и фото каждой услуги.</p><Link href="/admin/services" className="focus-ring mt-5 inline-flex rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-dark)]">Управлять услугами</Link></div><div className="surface bg-[var(--brand)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">Публичная страница</p><h2 className="mt-3 text-xl font-bold">Поделитесь ссылкой</h2><p className="mt-2 break-all text-sm leading-6 text-white/80">{publicUrl}</p><button type="button" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${publicUrl}`)} className="focus-ring mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[var(--brand)] transition hover:opacity-90">Скопировать ссылку</button></div></aside>
    </section>
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4"><p className="text-sm text-[var(--muted)]">{label}</p><strong className="mt-2 block text-2xl">{value}</strong><p className="mt-1 text-xs text-[var(--muted)]">{note}</p></div>;
}
