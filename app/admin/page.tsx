import { redirect } from "next/navigation";
import { AdminDashboard } from "@/src/components/admin-dashboard";
import { getOwnerData } from "@/src/lib/owner-data";
import { AdminPageHeader } from "@/src/components/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getOwnerData();
  if (!data) redirect("/login?next=/admin");
  return <main className="specialist-theme min-h-screen bg-[var(--paper)]"><div className="mx-auto max-w-6xl px-5 py-5 lg:px-8"><AdminPageHeader profileName={data.profile.name} profileUrl={data.demo ? "/" : `/p/${data.profile.slug}`} /></div><AdminDashboard initialBookings={data.bookings} initialServices={data.services} profile={data.profile} demo={data.demo} /></main>;
}
