import Link from "next/link";
import { AdminDashboard } from "@/src/components/admin-dashboard";
import { demoBookings, demoProfile, demoServices } from "@/src/lib/demo-data";

export default function AdminPage() {
  return <main className="min-h-screen bg-[#eef3ed]"><header className="border-b border-[var(--line)] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="display text-2xl font-bold">Время<span className="text-[var(--accent)]">Есть</span></Link><div className="flex items-center gap-4 text-sm"><span className="hidden text-[var(--muted)] sm:block">Панель {demoProfile.name}</span><Link href="/" className="rounded-full border border-[var(--line)] px-4 py-2 font-bold transition hover:border-[var(--accent)]">Открыть страницу ↗</Link></div></div></header><AdminDashboard initialBookings={demoBookings} services={demoServices} /></main>;
}
