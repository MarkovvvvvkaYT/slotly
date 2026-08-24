import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/src/components/auth-forms";

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="display text-2xl font-bold">Время<span className="text-[var(--accent)]">Есть</span></Link><div className="surface mt-8 p-7 sm:p-9"><p className="eyebrow">Для владельцев</p><h1 className="display mt-2 text-4xl font-bold">Войти в кабинет</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Управляйте услугами и заявками своего профиля.</p><Suspense fallback={<div className="mt-6 h-48 animate-pulse rounded-2xl bg-[#f5f7f2]" />}><LoginForm /></Suspense></div><p className="mt-5 text-center text-sm text-[var(--muted)]">Ещё нет профиля? <Link href="/register" className="font-bold text-[var(--accent)] hover:underline">Создать бесплатно</Link></p></div></main>;
}
