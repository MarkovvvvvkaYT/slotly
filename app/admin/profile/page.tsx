import { redirect } from "next/navigation";
import { ProfileEditor } from "@/src/components/profile-editor";
import { getOwnerData } from "@/src/lib/owner-data";

export default async function ProfilePage() {
  const data = await getOwnerData();
  if (!data) redirect("/login?next=/admin/profile");
  return <main className="min-h-screen bg-[var(--paper)] px-5 py-10 lg:px-8"><div className="mx-auto max-w-6xl"><ProfileEditor profile={data.profile} demo={data.demo} /></div></main>;
}
