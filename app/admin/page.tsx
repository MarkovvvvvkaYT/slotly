import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/src/components/admin-dashboard";
import { getOwnerData } from "@/src/lib/owner-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getOwnerData();
  if (!data) redirect("/login?next=/admin");
  return <main className="min-h-screen bg-[#eef3ed]"><header className="border-b border-[var(--line)] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="display text-2xl font-bold">Время<span className="text-[var(--accent)]">Есть</span></Link><div className="flex items-center gap-4 text-sm"><span className="hidden text-[var(--muted)] sm:block">Панель {data.profile.name}</span><Link href={data.demo ? "/" : `/p/${data.profile.slug}`} className="rounded-full border border-[var(--line)] px-4 py-2 font-bold transition hover:border-[var(--accent)]">Открыть страницу ↗</Link></div></div></header><AdminDashboard initialBookings={data.bookings} initialServices={data.services} profile={data.profile} demo={data.demo} /></main>;
}
