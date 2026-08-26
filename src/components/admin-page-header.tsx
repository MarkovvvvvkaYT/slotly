import Link from "next/link";
import { SlotlyLogo } from "@/src/components/slotly-logo";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { AdminSignOut } from "@/src/components/admin-sign-out";

export function AdminPageHeader({ profileName, profileUrl }: { profileName: string; profileUrl: string }) {
  return <header className="mb-8 border-b border-[var(--line)] pb-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><SlotlyLogo /><span className="hidden border-l border-[var(--line)] pl-4 text-sm text-[var(--muted)] sm:block">Панель · {profileName}</span></div><div className="flex items-center gap-2"><ThemeToggle /><Link href={profileUrl} className="focus-ring rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-bold transition hover:border-[var(--brand)]">Открыть страницу</Link><AdminSignOut /></div></div></header>;
}
