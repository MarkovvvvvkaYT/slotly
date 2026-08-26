import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/src/components/auth-forms";

export default function RegisterPage() {
  return <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="display text-2xl font-bold">Slot<span className="text-[var(--accent)]">ly</span></Link><div className="surface mt-8 p-7 sm:p-9"><p className="eyebrow">Старт за 2 минуты</p><h1 className="display mt-2 text-4xl font-bold">Создать аккаунт</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Клиентский кабинет и кабинет специалиста разделены по сценарию входа.</p><Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-[var(--soft)]" />}><RegisterForm /></Suspense></div><p className="mt-5 text-center text-sm text-[var(--muted)]">Уже есть аккаунт? <Link href="/login" className="font-bold text-[var(--accent)] hover:underline">Войти</Link></p></div></main>;
}
