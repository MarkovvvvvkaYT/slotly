import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/src/components/auth-forms";
import { ThemeToggle } from "@/src/components/theme-toggle";

export default function RegisterPage() {
  return <main id="main-content" className="min-h-screen px-5 py-6 sm:py-10"><div className="mx-auto flex max-w-md justify-end"><ThemeToggle /></div><div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center"><div className="w-full"><Link href="/" className="display text-2xl font-bold">Slot<span className="text-[var(--accent)]">ly</span></Link><div className="surface mt-8 p-7 sm:p-9"><p className="eyebrow">Старт за 2 минуты</p><h1 className="display mt-2 text-4xl font-bold">Создать аккаунт</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Клиентский кабинет и кабинет специалиста разделены по сценарию входа.</p><Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-[var(--soft)]" />}><RegisterForm /></Suspense></div><p className="mt-5 text-center text-sm text-[var(--muted)]">Уже есть аккаунт? <Link href="/login" className="font-bold text-[var(--accent)] hover:underline">Войти</Link></p></div></div></main>;
}
