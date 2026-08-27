import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/src/components/booking-flow";
import { SlotlyLogo } from "@/src/components/slotly-logo";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { getCategoryLabel } from "@/src/lib/catalog";
import { getPublicProfile } from "@/src/lib/owner-data";

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) notFound();

  const { profile, services, availability, bookings } = data;
  const location = [profile.city, profile.address].filter(Boolean).join(" · ") || "Онлайн";

  return (
    <main className="public-profile-theme min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <nav className="border-b border-[var(--line)] bg-[var(--paper)]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <SlotlyLogo className="text-[#1754d1]" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/register?role=customer" className="focus-ring hidden rounded-lg bg-[#1754d1] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#103e9d] sm:inline-flex">
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-8 lg:px-8 lg:pt-12">
        <div className="grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] lg:grid-cols-[1.03fr_.97fr]">
          <div className="flex min-h-[280px] flex-col justify-between p-7 sm:p-8">
            <div>
              <div className="flex items-center gap-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#d9dfea] bg-[#edf2ff] bg-cover bg-center text-xl font-bold text-[#1754d1]"
                  style={profile.avatarPath ? { backgroundImage: `url("${profile.avatarPath}")` } : undefined}
                >
                  {profile.avatarPath ? <span className="sr-only">Аватар {profile.name}</span> : profile.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1754d1]">{getCategoryLabel(profile.category ?? "other")} · {location}</p>
                  <h1 className="mt-1 text-balance text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{profile.name}</h1>
                </div>
              </div>
              {profile.description && profile.description !== "Расскажите клиентам, чем вы можете помочь." && <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[#52565f] sm:text-lg">{profile.description}</p>}
            </div>
            <div className="mt-7 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-[#e8efff] px-3 py-1.5 font-semibold text-[#1754d1]">Принимает онлайн</span>
              <span className="rounded-full bg-[#f3f3f0] px-3 py-1.5 font-medium text-[#545861]">{services.length} {services.length === 1 ? "услуга" : "услуг"}</span>
            </div>
          </div>
          <div
            className="relative min-h-[280px] bg-[#e9e4dc] bg-cover bg-center"
            style={profile.coverPath ? { backgroundImage: `url("${profile.coverPath}")` } : undefined}
          >
            {!profile.coverPath && (
              <div className="absolute inset-0 flex items-end bg-[#e9eef9] p-7">
                <span className="rounded-xl bg-white/85 px-4 py-3 text-sm font-semibold text-[#1754d1] shadow-[0_5px_8px_rgb(23_84_209_/_0.12)]">Выберите удобное окно</span>
              </div>
            )}
            {profile.coverPath && <div className="absolute inset-0 bg-[#14244e]/10" />}
          </div>
        </div>

        <div className="mt-12">
          <BookingFlow services={services} availability={availability} profileId={profile.id} bookings={bookings} />
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 text-sm text-[var(--muted)] lg:px-8">
          <span>Онлайн-запись через Slotly</span>
          <Link href="/" className="font-semibold text-[#1754d1]">На главную</Link>
        </div>
      </footer>
    </main>
  );
}
