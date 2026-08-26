import { redirect } from "next/navigation";
import { AdminNavigation } from "@/src/components/admin-navigation";
import { AdminPageHeader } from "@/src/components/admin-page-header";
import { ServicesManager } from "@/src/components/services-manager";
import { getOwnerData } from "@/src/lib/owner-data";
export default async function ServicesPage(){const data=await getOwnerData();if(!data)redirect("/login?next=/admin/services");return <main className="min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><AdminPageHeader profileName={data.profile.name} profileUrl={data.demo ? "/" : `/p/${data.profile.slug}`} /><AdminNavigation current="/admin/services"/><ServicesManager initial={data.services} demo={data.demo}/></div></main>}
