"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export function AdminSignOut() {
  const router = useRouter();
  async function signOut() { await createClient().auth.signOut(); router.push("/login"); router.refresh(); }
  return <button type="button" onClick={signOut} className="focus-ring rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">Выйти</button>;
}
