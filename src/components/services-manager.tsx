"use client";

import { useState } from "react";
import type { Service } from "@/src/lib/domain";

type ServiceForm = { name: string; description: string; durationMinutes: string; priceLabel: string };
const emptyForm: ServiceForm = { name: "", description: "", durationMinutes: "60", priceLabel: "" };

export function ServicesManager({ initial, demo }: { initial: Service[]; demo: boolean }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateForm(patch: Partial<ServiceForm>) { setForm((value) => ({ ...value, ...patch })); }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setMessage(""); setSaving(true);
    if (demo) {
      setItems((items) => [...items, { id: `demo-${Date.now()}`, ...form, durationMinutes: Number(form.durationMinutes), active: true }]);
      setForm(emptyForm); setMessage("Услуга добавлена в демо-режиме"); setSaving(false); return;
    }
    try {
      const response = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Не удалось добавить услугу");
      setItems((items) => [...items, result.service]); setForm(emptyForm); setMessage("Услуга опубликована в кабинете");
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Не удалось добавить услугу"); } finally { setSaving(false); }
  }

  async function toggle(service: Service) {
    setError("");
    if (demo) { setItems((items) => items.map((item) => item.id === service.id ? { ...item, active: !item.active } : item)); return; }
    const response = await fetch("/api/admin/services", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: service.id, active: !service.active }) });
    if (!response.ok) { setError("Не удалось обновить услугу"); return; }
    setItems((items) => items.map((item) => item.id === service.id ? { ...item, active: !item.active } : item));
  }

  return <section className="surface max-w-5xl p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Предложение клиентам</p><h1 className="display mt-2 text-4xl font-bold">Услуги</h1></div><p className="text-sm text-[var(--muted)]">{items.filter((item) => item.active).length} из {items.length} опубликовано</p></div>{message && <p role="status" className="mt-6 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">{message}</p>}{error && <p role="alert" className="mt-6 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}<div className="mt-7 space-y-3">{items.length ? items.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5"><div><div className="flex items-center gap-2"><h2 className="font-bold">{item.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.active ? "bg-[var(--mint)] text-[var(--brand)]" : "bg-[var(--soft)] text-[var(--accent-dark)]"}`}>{item.active ? "Опубликована" : "Скрыта"}</span></div><p className="mt-2 text-sm text-[var(--muted)]">{item.durationMinutes} мин · {item.priceLabel || "Цена по запросу"}{item.description ? ` · ${item.description}` : ""}</p></div><button type="button" aria-pressed={item.active} onClick={() => toggle(item)} className="focus-ring rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-bold transition hover:border-[var(--brand)]">{item.active ? "Скрыть" : "Опубликовать"}</button></article>) : <p className="rounded-2xl bg-[var(--paper)] p-6 text-sm text-[var(--muted)]">Добавьте первую услугу — она появится на вашей публичной странице.</p>}</div><form onSubmit={add} className="mt-8 border-t border-[var(--line)] pt-7"><div><h2 className="text-lg font-bold">Новая услуга</h2><p className="mt-1 text-sm text-[var(--muted)]">Клиент увидит название, длительность и цену до записи.</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Название<input required minLength={2} value={form.name} onChange={(event) => updateForm({ name: event.target.value })} placeholder="Например, экспресс-макияж" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none" /></label><label className="text-sm font-semibold">Цена<input value={form.priceLabel} onChange={(event) => updateForm({ priceLabel: event.target.value })} placeholder="Например, 2 500 ₽" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none" /></label><label className="text-sm font-semibold">Длительность, минут<input type="number" min="15" max="480" step="15" required value={form.durationMinutes} onChange={(event) => updateForm({ durationMinutes: event.target.value })} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none" /></label><label className="text-sm font-semibold">Короткое описание<input value={form.description} onChange={(event) => updateForm({ description: event.target.value })} placeholder="Что входит в услугу" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none" /></label></div><button disabled={saving} className="focus-ring mt-6 rounded-full bg-[var(--brand)] px-6 py-3 font-bold text-[var(--paper)] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">{saving ? "Сохраняем…" : "Добавить услугу"}</button></form></section>;
}
