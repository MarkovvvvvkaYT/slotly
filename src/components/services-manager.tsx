"use client";

import { useState } from "react";
import { profileCategories, getCategoryLabel } from "@/src/lib/catalog";
import type { Service } from "@/src/lib/domain";
import { ProfileMediaUpload } from "./profile-media-upload";

type ServiceForm = {
  name: string;
  description: string;
  durationMinutes: string;
  priceLabel: string;
  category: string;
};
const emptyForm: ServiceForm = {
  name: "",
  description: "",
  durationMinutes: "60",
  priceLabel: "",
  category: "other",
};

function formFromService(service: Service): ServiceForm {
  return {
    name: service.name,
    description: service.description,
    durationMinutes: String(service.durationMinutes),
    priceLabel: service.priceLabel,
    category: service.category || "other",
  };
}

export function ServicesManager({
  initial,
  demo,
  userId,
}: {
  initial: Service[];
  demo: boolean;
  userId?: string;
}) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = items.find((item) => item.id === editingId);
  const updateForm = (patch: Partial<ServiceForm>) =>
    setForm((value) => ({ ...value, ...patch }));

  function startEditing(service: Service) {
    setError("");
    setMessage("");
    setEditingId(service.id);
    setForm(formFromService(service));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const payload = { ...form, durationMinutes: Number(form.durationMinutes) };
    try {
      if (demo) {
        if (editing)
          setItems((current) =>
            current.map((item) =>
              item.id === editing.id ? { ...item, ...payload } : item,
            ),
          );
        else
          setItems((current) => [
            ...current,
            { id: `demo-${Date.now()}`, ...payload, active: true },
          ]);
        setMessage(
          editing
            ? "Изменения услуги сохранены в демо-режиме"
            : "Услуга добавлена в демо-режиме",
        );
        resetForm();
        return;
      }
      const response = await fetch("/api/admin/services", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing ? { id: editing.id, ...payload } : payload,
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Не удалось сохранить услугу");
      const service = result.service as Service;
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === service.id ? service : item))
          : [...current, service],
      );
      setMessage(
        editing ? "Изменения услуги сохранены" : "Услуга добавлена в каталог",
      );
      resetForm();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Не удалось сохранить услугу",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateService(service: Service, patch: Partial<Service>) {
    setError("");
    if (demo) {
      setItems((current) =>
        current.map((item) =>
          item.id === service.id ? { ...item, ...patch } : item,
        ),
      );
      return;
    }
    const response = await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, ...patch }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Не удалось обновить услугу");
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === service.id ? (result.service as Service) : item,
      ),
    );
  }

  async function remove(service: Service) {
    if (!window.confirm(`Убрать услугу «${service.name}» из каталога?`)) return;
    setError("");
    if (demo) {
      setItems((current) => current.filter((item) => item.id !== service.id));
      return;
    }
    const response = await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id }),
    });
    if (!response.ok) return setError("Не удалось удалить услугу");
    setItems((current) => current.filter((item) => item.id !== service.id));
    if (editingId === service.id) resetForm();
    setMessage("Услуга удалена из каталога");
  }

  return (
    <section className="surface max-w-5xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Предложение клиентам</p>
          <h1 className="display mt-2 text-4xl font-bold">Услуги</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {items.filter((item) => item.active).length} из {items.length}{" "}
          опубликовано
        </p>
      </div>
      {message && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[var(--brand)]"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]"
        >
          {error}
        </p>
      )}
      <div className="mt-7 space-y-3">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:grid-cols-[1fr_auto] sm:p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{item.name}</h2>
                  <span className="rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-bold text-[var(--accent-dark)]">
                    {getCategoryLabel(item.category)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.active ? "bg-[var(--mint)] text-[var(--brand)]" : "bg-[var(--soft)] text-[var(--accent-dark)]"}`}
                  >
                    {item.active ? "Опубликована" : "Скрыта"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {item.durationMinutes} мин ·{" "}
                  {item.priceLabel || "Цена по запросу"}
                  {item.description ? ` · ${item.description}` : ""}
                </p>
                <div className="mt-4 max-w-xs">
                  <ProfileMediaUpload
                    userId={userId}
                    kind="service"
                    path={item.imagePath}
                    demo={demo}
                    onUploaded={(imagePath) =>
                      void updateService(item, { imagePath })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  className="focus-ring self-start rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-bold transition hover:border-[var(--brand)]"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  aria-pressed={item.active}
                  onClick={() =>
                    void updateService(item, { active: !item.active })
                  }
                  className="focus-ring self-start rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-bold transition hover:border-[var(--brand)]"
                >
                  {item.active ? "Скрыть" : "Опубликовать"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="focus-ring self-start rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--accent-dark)] transition hover:border-[var(--accent)]"
                >
                  Удалить
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-[var(--paper)] p-6 text-sm text-[var(--muted)]">
            Добавьте первую услугу — она появится на вашей публичной странице.
          </p>
        )}
      </div>
      <form onSubmit={save} className="mt-8 border-t border-[var(--line)] pt-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">
              {editing ? "Редактирование услуги" : "Новая услуга"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Клиент увидит название, категорию, длительность и цену до записи.
            </p>
          </div>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="focus-ring text-sm font-bold text-[var(--muted)] underline underline-offset-4"
            >
              Отменить редактирование
            </button>
          )}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Название
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              placeholder="Например, экспресс-макияж"
              className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none"
            />
          </label>
          <label className="text-sm font-semibold">
            Категория
            <select
              value={form.category}
              onChange={(event) => updateForm({ category: event.target.value })}
              className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none"
            >
              {profileCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Цена
            <input
              value={form.priceLabel}
              onChange={(event) =>
                updateForm({ priceLabel: event.target.value })
              }
              placeholder="Например, 2 500 ₽"
              className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none"
            />
          </label>
          <label className="text-sm font-semibold">
            Длительность, минут
            <input
              type="number"
              min="15"
              max="480"
              step="15"
              required
              value={form.durationMinutes}
              onChange={(event) =>
                updateForm({ durationMinutes: event.target.value })
              }
              className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none"
            />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Короткое описание
            <input
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
              placeholder="Что входит в услугу"
              className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 font-normal outline-none"
            />
          </label>
        </div>
        <button
          disabled={saving}
          className="focus-ring mt-6 rounded-full bg-[var(--brand)] px-6 py-3 font-bold text-[var(--paper)] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {saving
            ? "Сохраняем…"
            : editing
              ? "Сохранить изменения"
              : "Добавить услугу"}
        </button>
      </form>
    </section>
  );
}
