import { redirect } from "next/navigation";
import { ProfileEditor } from "@/src/components/profile-editor";
import { getOwnerData } from "@/src/lib/owner-data";
import { AdminNavigation } from "@/src/components/admin-navigation";
import { AdminPageHeader } from "@/src/components/admin-page-header";
import { TelegramConnectionManager } from "@/src/components/telegram-connection-manager";

export default async function ProfilePage() {
  const data = await getOwnerData();
  if (!data) redirect("/login?next=/admin/profile");
  return <main className="specialist-theme min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><AdminPageHeader profileName={data.profile.name} profileUrl={data.demo ? "/" : `/p/${data.profile.slug}`} /><AdminNavigation current="/admin/profile"/><ProfileEditor profile={data.profile} demo={data.demo} /><TelegramConnectionManager demo={data.demo} /></div></main>;
}
