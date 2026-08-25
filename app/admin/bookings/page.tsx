import { redirect } from "next/navigation";
import { AdminNavigation } from "@/src/components/admin-navigation";
import { BookingsManager } from "@/src/components/bookings-manager";
import { getOwnerData } from "@/src/lib/owner-data";
export default async function BookingsPage(){const data=await getOwnerData();if(!data)redirect("/login?next=/admin/bookings");return <main className="min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><AdminNavigation current="/admin/bookings"/><BookingsManager initial={data.bookings} demo={data.demo}/></div></main>}
