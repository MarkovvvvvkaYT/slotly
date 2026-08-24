import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/src/components/booking-flow";
import { getPublicProfile } from "@/src/lib/owner-data";

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) notFound();
  const { profile, services, availability } = data;
  return <main><nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 lg:px-8"><Link href="/" className="display text-2xl font-bold">Время<span className="text-[var(--accent)]">Есть</span></Link><Link href="/register" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold transition hover:border-[var(--accent)]">Создать свой профиль</Link></nav><section className="mx-auto max-w-5xl px-5 pb-12 pt-8 lg:px-8 lg:pt-16"><div className="max-w-2xl"><p className="eyebrow">{profile.eyebrow}</p><h1 className="display mt-3 text-5xl font-bold sm:text-7xl">{profile.name}</h1><p className="mt-6 text-lg leading-8 text-[var(--muted)]">{profile.description}</p>{profile.address && <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{profile.address}</p>}</div><div className="mt-12"><BookingFlow services={services} availability={availability} profileId={profile.id} /></div></section><footer className="mx-auto max-w-5xl px-5 py-8 text-sm text-[var(--muted)] lg:px-8">Страница создана в <Link href="/" className="font-bold text-[var(--accent)]">ВремяЕсть</Link></footer></main>;
}
