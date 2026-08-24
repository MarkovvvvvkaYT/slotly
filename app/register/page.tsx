import Link from "next/link";
import { RegisterForm } from "@/src/components/auth-forms";

export default function RegisterPage() {
  return <main className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="display text-2xl font-bold">Slot<span className="text-[var(--accent)]">ly</span></Link><div className="surface mt-8 p-7 sm:p-9"><p className="eyebrow">Старт за 2 минуты</p><h1 className="display mt-2 text-4xl font-bold">Создать свой профиль</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Получите личную страницу, услуги и админ-панель для заявок.</p><RegisterForm /></div><p className="mt-5 text-center text-sm text-[var(--muted)]">Уже есть профиль? <Link href="/login" className="font-bold text-[var(--accent)] hover:underline">Войти</Link></p></div></main>;
}
