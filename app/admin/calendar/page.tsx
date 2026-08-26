import { redirect } from "next/navigation";
import { ScheduleEditor } from "@/src/components/schedule-editor";
import { getOwnerData } from "@/src/lib/owner-data";
import { AdminNavigation } from "@/src/components/admin-navigation";
import { AdminPageHeader } from "@/src/components/admin-page-header";

export default async function CalendarPage() { const data = await getOwnerData(); if (!data) redirect("/login?next=/admin/calendar"); return <main className="specialist-theme min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><AdminPageHeader profileName={data.profile.name} profileUrl={data.demo ? "/" : `/p/${data.profile.slug}`} /><AdminNavigation current="/admin/calendar"/><ScheduleEditor initial={data.availability} demo={data.demo} /></div></main>; }
