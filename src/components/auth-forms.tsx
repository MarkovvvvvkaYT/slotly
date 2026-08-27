"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="mt-4 block text-sm font-semibold">{label}<input {...props} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]" /></label>;
}

export function LoginForm() {
  const router = useRouter(); const params = useSearchParams();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const [telegramChallenge, setTelegramChallenge] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!telegramChallenge) return;
    const timer = window.setInterval(() => { void checkTelegram(); }, 3000);
    return () => window.clearInterval(timer);
    // Poll only while current challenge is active.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramChallenge]);

  function goToDestination(type?: unknown) {
    const requestedRole = params.get("role");
    const destination = params.get("next") || (requestedRole === "specialist" ? "/admin" : requestedRole === "customer" ? "/account" : type === "specialist" ? "/admin" : "/account");
    router.push(destination);
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const { data, error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) { setError("Неверный email или пароль"); setLoading(false); return; }
    const requestedRole = params.get("role");
    if (requestedRole === "specialist") {
      const onboarding = await fetch("/api/onboarding/specialist", { method: "POST" });
      if (!onboarding.ok) { setError("Не удалось открыть кабинет специалиста"); setLoading(false); return; }
    }
    const type = data.user?.user_metadata?.account_type;
    const destination = params.get("next") || (requestedRole === "specialist" ? "/admin" : requestedRole === "customer" ? "/account" : type === "specialist" ? "/admin" : "/account");
    if (destination.startsWith("/admin")) {
      const challengeResponse = await fetch("/api/auth/telegram/challenge", { method: "POST" });
      const challenge = await challengeResponse.json().catch(() => null);
      if (challengeResponse.ok && challenge?.required && challenge.id && challenge.url) {
        setTelegramChallenge({ id: String(challenge.challengeId), url: String(challenge.url) });
        setMessage("Откройте Telegram и подтвердите вход. При необходимости можно продолжить без подтверждения.");
        setLoading(false);
        return;
      }
    }
    goToDestination(type);
  }

  async function checkTelegram() {
    if (!telegramChallenge) return;
    setLoading(true); setError("");
    const response = await fetch(`/api/auth/telegram/challenge/${telegramChallenge.id}`);
    const data = await response.json().catch(() => null);
    if (response.ok && data?.status === "approved") return goToDestination("specialist");
    setError(data?.status === "rejected" ? "Вход отклонён в Telegram" : data?.status === "expired" ? "Запрос истёк" : "Подтверждение ещё не получено");
    setLoading(false);
  }

  return <form onSubmit={submit} className="mt-6"><Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /><Field label="Пароль" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" required minLength={6} autoComplete="current-password" />{error && <p role="alert" className="mt-4 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">{message}</p>}{telegramChallenge ? <div className="mt-6 grid gap-2"><a href={telegramChallenge.url} target="_blank" rel="noreferrer" className="focus-ring rounded-full bg-[var(--brand)] px-6 py-3.5 text-center font-bold text-white">Открыть Telegram</a><button type="button" onClick={() => void checkTelegram()} disabled={loading} className="focus-ring rounded-full border border-[var(--line)] px-6 py-3.5 font-bold disabled:opacity-60">{loading ? "Проверяем…" : "Я подтвердил вход"}</button></div> : <button disabled={loading} className="focus-ring mt-6 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60">{loading ? "Входим…" : "Войти"}</button>}</form>;
}

type AccountType = "customer" | "specialist";
export function RegisterForm() {
  const router = useRouter(); const params = useSearchParams(); const requestedType = params.get("role") === "specialist" ? "specialist" : params.get("role") === "customer" ? "customer" : null; const [accountType, setAccountType] = useState<AccountType>(requestedType ?? "customer");
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(""); setMessage(""); const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""); if (accountType === "specialist" && normalizedSlug.length < 3) { setError("Ссылка должна содержать минимум 3 латинских символа"); setLoading(false); return; } const { data, error: signUpError } = await createClient().auth.signUp({ email, password, options: { data: { display_name: name, slug: normalizedSlug || `client-${Date.now()}`, account_type: accountType } } }); if (signUpError) { setError(signUpError.message.includes("already") ? "Этот email уже зарегистрирован" : signUpError.message); setLoading(false); return; } if (data.session) { router.push(accountType === "specialist" ? "/admin" : "/account"); router.refresh(); } else { setMessage("Аккаунт создан. Проверьте почту и подтвердите email, затем войдите."); setLoading(false); } }
  return <form onSubmit={submit} className="mt-6">{requestedType ? <p className="rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{accountType === "customer" ? "Создаём личный кабинет клиента" : "Создаём кабинет специалиста"}</p> : <fieldset><legend className="text-sm font-semibold">Как вы будете пользоваться Slotly?</legend><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" role="radio" aria-checked={accountType === "customer"} onClick={() => setAccountType("customer")} className={`focus-ring rounded-xl border px-3 py-3 text-sm font-bold transition ${accountType === "customer" ? "border-[var(--accent)] bg-[var(--soft)] text-[var(--accent-dark)]" : "border-[var(--line)] text-[var(--muted)]"}`}>Я ищу услугу</button><button type="button" role="radio" aria-checked={accountType === "specialist"} onClick={() => setAccountType("specialist")} className={`focus-ring rounded-xl border px-3 py-3 text-sm font-bold transition ${accountType === "specialist" ? "border-[var(--brand)] bg-[var(--mint)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)]"}`}>Я оказываю услуги</button></div></fieldset>}<Field label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder={accountType === "customer" ? "Анна" : "Алина Воронова"} required minLength={2} autoComplete="name" />{accountType === "specialist" && <><Field label="Короткая ссылка" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="alina-voronova" required pattern="[A-Za-z0-9-]+" /><p className="mt-2 text-xs text-[var(--muted)]">Ваша публичная страница: /p/{slug || "ваш-slug"}</p></>}<Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /><Field label="Пароль" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" required minLength={6} autoComplete="new-password" />{error && <p role="alert" className="mt-4 rounded-xl bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[var(--brand)]">{message}</p>}<button disabled={loading} className="focus-ring mt-6 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60">{loading ? "Создаём…" : accountType === "customer" ? "Создать аккаунт клиента" : "Создать профиль специалиста"}</button></form>;
}
