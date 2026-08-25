import { redirect } from "next/navigation";
import { ScheduleEditor } from "@/src/components/schedule-editor";
import { getOwnerData } from "@/src/lib/owner-data";
import { AdminNavigation } from "@/src/components/admin-navigation";

export default async function CalendarPage() { const data = await getOwnerData(); if (!data) redirect("/login?next=/admin/calendar"); return <main className="min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><AdminNavigation current="/admin/calendar"/><ScheduleEditor initial={data.availability} demo={data.demo} /></div></main>; }
