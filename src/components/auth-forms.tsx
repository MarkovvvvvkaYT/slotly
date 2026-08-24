"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="mt-4 block text-sm font-semibold">{label}<input {...props} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]" /></label>;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) { setError("Неверный email или пароль"); setLoading(false); return; }
    router.push(params.get("next") || "/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="mt-6"><Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /><Field label="Пароль" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" required minLength={6} autoComplete="current-password" />{error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}<button disabled={loading} className="focus-ring mt-6 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60">{loading ? "Входим…" : "Войти"}</button></form>;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (normalizedSlug.length < 3) { setError("Slug должен содержать минимум 3 латинских символа"); setLoading(false); return; }
    const { data, error: signUpError } = await createClient().auth.signUp({ email, password, options: { data: { display_name: name, slug: normalizedSlug } } });
    if (signUpError) { setError(signUpError.message.includes("already") ? "Этот email уже зарегистрирован" : signUpError.message); setLoading(false); return; }
    if (data.session) { router.push("/admin"); router.refresh(); } else { setMessage("Профиль создан. Проверьте почту и подтвердите email, затем войдите."); setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-6"><Field label="Как вас представить?" value={name} onChange={(event) => setName(event.target.value)} placeholder="Алина Воронова" required minLength={2} autoComplete="name" /><Field label="Короткая ссылка" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="alina-voronova" required pattern="[A-Za-z0-9-]+" /><p className="mt-2 text-xs text-[var(--muted)]">Ваша публичная страница: /p/{slug || "ваш-slug"}</p><Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /><Field label="Пароль" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" required minLength={6} autoComplete="new-password" />{error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[#387354]">{message}</p>}<button disabled={loading} className="focus-ring mt-6 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60">{loading ? "Создаём…" : "Создать профиль"}</button></form>;
}
