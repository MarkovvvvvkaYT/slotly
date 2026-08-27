"use client";

import { useEffect, useState } from "react";

type Connection = {
  username?: string | null;
  display_name?: string | null;
  linked_at?: string;
};

export function TelegramConnectionManager({ demo }: { demo: boolean }) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    if (demo) return;
    void fetch("/api/admin/telegram")
      .then((response) => response.json())
      .then((data) => setConnection(data.connection ?? null))
      .catch(() => setMessage("Не удалось загрузить статус Telegram"))
      .finally(() => setLoading(false));
  }, [demo]);

  async function createLink() {
    setMessage("");
    const response = await fetch("/api/admin/telegram/link", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(data.error ?? "Не удалось создать ссылку");
    setLinkUrl(data.url);
    setMessage("Откройте ссылку в Telegram в течение 15 минут");
  }

  async function disconnect() {
    setMessage("");
    const response = await fetch("/api/admin/telegram", { method: "DELETE" });
    if (!response.ok) return setMessage("Не удалось отвязать Telegram");
    setConnection(null);
    setLinkUrl("");
    setMessage("Telegram отвязан");
  }

  return <section className="surface mt-6 max-w-3xl p-6 sm:p-8">
    <p className="eyebrow">Уведомления и вход</p>
    <h2 className="display mt-2 text-3xl font-bold">Telegram для специалиста</h2>
    <p className="mt-3 text-sm text-[var(--muted)]">Получайте новые заявки, меняйте их статус кнопками и подтверждайте вход в кабинет.</p>
    {demo ? <p className="mt-5 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">В демо-режиме Telegram недоступен.</p> : loading ? <p className="mt-5 text-sm text-[var(--muted)]">Загружаем статус…</p> : connection ? <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3"><div><p className="font-bold">Подключён{connection.username ? ` @${connection.username}` : ""}</p><p className="mt-1 text-xs text-[var(--muted)]">Telegram будет первым вариантом подтверждения входа.</p></div><button type="button" onClick={() => void disconnect()} className="focus-ring rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-bold">Отвязать</button></div> : <button type="button" onClick={() => void createLink()} className="focus-ring mt-5 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white">Подключить Telegram</button>}
    {linkUrl && <a href={linkUrl} target="_blank" rel="noreferrer" className="focus-ring mt-4 block break-all rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">Открыть ссылку привязки</a>}
    {message && <p role="status" className="mt-4 text-sm font-semibold text-[var(--brand)]">{message}</p>}
  </section>;
}
