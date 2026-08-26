import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/src/components/auth-forms";

export default function LoginPage() {
  return <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="display text-2xl font-bold">Slot<span className="text-[var(--accent)]">ly</span></Link><div className="surface mt-8 p-7 sm:p-9"><p className="eyebrow">Ваш Slotly</p><h1 className="display mt-2 text-4xl font-bold">Войти в аккаунт</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Откройте свои записи или кабинет специалиста.</p><Suspense fallback={<div className="mt-6 h-48 animate-pulse rounded-2xl bg-[var(--mint)]" />}><LoginForm /></Suspense></div><p className="mt-5 text-center text-sm text-[var(--muted)]">Ещё нет аккаунта? <Link href="/register" className="font-bold text-[var(--accent)] hover:underline">Создать</Link></p></div></main>;
}
