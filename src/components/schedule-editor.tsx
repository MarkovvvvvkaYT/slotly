"use client";
import { useState } from "react";
import type { AvailabilityRule } from "@/src/lib/domain";
const names = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];
type Row = {
  weekday: number;
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
};
export function ScheduleEditor({
  initial,
  demo,
}: {
  initial: AvailabilityRule[];
  demo: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    names.map((_, weekday) => {
      const rule = initial.find((x) => x.weekday === weekday);
      return {
        weekday,
        enabled: Boolean(rule),
        start: rule?.start ?? "10:00",
        end: rule?.end ?? "19:00",
        breakStart: rule?.breakStart ?? "",
        breakEnd: rule?.breakEnd ?? "",
      };
    }),
  );
  const [message, setMessage] = useState("");
  const edit = (index: number, patch: Partial<Row>) =>
    setRows((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  async function save() {
    if (demo) return setMessage("В демо-режиме изменения не сохраняются");
    const r = await fetch("/api/admin/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: rows }),
    });
    setMessage(
      r.ok
        ? "Расписание сохранено"
        : "Проверьте границы рабочего дня и перерыва",
    );
  }
  return (
    <section className="surface max-w-5xl p-6 sm:p-8">
      <p className="eyebrow">Рабочая неделя</p>
      <h1 className="display mt-2 text-4xl font-bold">Расписание и часы</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Свободные окна автоматически учитывают длительность услуг и перерывы.
      </p>
      <div className="mt-8 space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.weekday}
            className="grid gap-3 rounded-xl border border-[var(--line)] p-4 sm:grid-cols-[160px_repeat(4,1fr)]"
          >
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => edit(index, { enabled: e.target.checked })}
              />
              {names[row.weekday]}
            </label>
            {row.enabled && (
              <>
                <label className="text-xs text-[var(--muted)]">
                  Начало
                  <input
                    type="time"
                    value={row.start}
                    onChange={(e) => edit(index, { start: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
                  />
                </label>
                <label className="text-xs text-[var(--muted)]">
                  Конец
                  <input
                    type="time"
                    value={row.end}
                    onChange={(e) => edit(index, { end: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
                  />
                </label>
                <label className="text-xs text-[var(--muted)]">
                  Перерыв с
                  <input
                    type="time"
                    value={row.breakStart}
                    onChange={(e) =>
                      edit(index, { breakStart: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
                  />
                </label>
                <label className="text-xs text-[var(--muted)]">
                  Перерыв до
                  <input
                    type="time"
                    value={row.breakEnd}
                    onChange={(e) => edit(index, { breakEnd: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
                  />
                </label>
              </>
            )}
          </div>
        ))}
      </div>
      {message && (
        <p
          role="status"
          className="mt-5 text-sm font-semibold text-[var(--brand)]"
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={save}
        className="focus-ring mt-7 rounded-full bg-[var(--brand)] px-6 py-3 font-bold text-white"
      >
        Сохранить расписание
      </button>
    </section>
  );
}
