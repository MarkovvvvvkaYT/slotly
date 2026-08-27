"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountDeletionPanel({ demo, specialist = false }: { demo?: boolean; specialist?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState<{ id: string; url: string } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!challenge) return;
    const timer = window.setInterval(() => {
      void fetch(`/api/account/delete/challenge/${challenge.id}`).then((response) => response.json()).then((data) => {
        if (data.status === "approved") { window.clearInterval(timer); void deleteAccount(challenge.id); }
        if (data.status === "expired" || data.status === "rejected") { window.clearInterval(timer); setError("Подтверждение Telegram истекло или отклонено"); }
      });
    }, 2500);
    return () => window.clearInterval(timer);
    // deleteAccount intentionally uses current form state while challenge is active.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  async function deleteAccount(challengeId?: string) {
    if (!window.confirm("Удалить аккаунт и все связанные данные? Отменить это действие нельзя.")) return;
    setLoading(true); setError(""); setMessage("");
    const response = await fetch("/api/account/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(challengeId ? { challengeId } : { password }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error ?? "Не удалось удалить аккаунт"); setLoading(false); return; }
    router.push("/"); router.refresh();
  }

  async function requestTelegram() {
    setLoading(true); setError(""); setMessage("");
    const response = await fetch("/api/account/delete/challenge", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error ?? "Telegram недоступен"); setLoading(false); return; }
    setChallenge({ id: String(data.id), url: String(data.url) });
    setMessage("Подтвердите удаление в Telegram. Страница проверит ответ автоматически.");
    setLoading(false);
  }

  if (demo) return null;
  return <section className="surface mt-6 max-w-3xl border border-[var(--line)] p-6 sm:p-8">
    <p className="eyebrow">Опасная зона</p>
    <h2 className="display mt-2 text-3xl font-bold">Удалить аккаунт</h2>
    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Профиль, услуги и заявки будут удалены без возможности восстановления.</p>
    <label className="mt-5 block text-sm font-semibold">Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль для подтверждения" className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal" /></label>
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={loading || !password} onClick={() => void deleteAccount()} className="focus-ring rounded-full bg-[var(--accent-dark)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Удалить по паролю</button>{specialist && <button type="button" disabled={loading} onClick={() => void requestTelegram()} className="focus-ring rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold disabled:opacity-50">Подтвердить через Telegram</button>}</div>
    {challenge && <a href={challenge.url} target="_blank" rel="noreferrer" className="focus-ring mt-4 block rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">Открыть Telegram для подтверждения</a>}
    {message && <p role="status" className="mt-4 text-sm font-semibold text-[var(--brand)]">{message}</p>}{error && <p role="alert" className="mt-4 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}
  </section>;
}
