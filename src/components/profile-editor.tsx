"use client";

import { useState } from "react";
import { profileCategories } from "@/src/lib/catalog";
import type { Profile } from "@/src/lib/domain";
import { ProfileMediaUpload } from "./profile-media-upload";

export function ProfileEditor({ profile, demo }: { profile: Profile; demo: boolean }) {
  const [form, setForm] = useState({ name: profile.name, eyebrow: profile.eyebrow, description: profile.description, category: profile.category ?? "other", city: profile.city ?? "", address: profile.address, phone: profile.phone, slug: profile.slug });
  const [message, setMessage] = useState(""); const [avatarPath, setAvatarPath] = useState(profile.avatarPath); const [coverPath, setCoverPath] = useState(profile.coverPath);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    if (demo) return setMessage("В демо-режиме изменения не сохраняются");
    const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, avatarPath, coverPath }) });
    setMessage(response.ok ? "Профиль сохранён" : "Не удалось сохранить профиль");
  }
  const field = (key: keyof typeof form, label: string, multiline = false) => <label className="block text-sm font-semibold">{label}{multiline ? <textarea value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} rows={5} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 font-normal outline-none" /> : <input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 font-normal outline-none" />}</label>;
  return <form onSubmit={save} className="surface max-w-3xl p-6 sm:p-8"><p className="eyebrow">Публичная страница</p><h1 className="display mt-2 text-4xl font-bold">Профиль специалиста</h1><div className="mt-8 grid gap-4 sm:grid-cols-2"><ProfileMediaUpload userId={profile.userId} kind="avatar" path={avatarPath} demo={demo} onUploaded={setAvatarPath} /><ProfileMediaUpload userId={profile.userId} kind="cover" path={coverPath} demo={demo} onUploaded={setCoverPath} /></div><div className="mt-8 grid gap-5 sm:grid-cols-2">{field("name", "Имя или название")}{field("slug", "Адрес страницы")}{field("city", "Город")}<label className="block text-sm font-semibold">Категория<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 font-normal outline-none">{profileCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>{field("phone", "Телефон")}{field("address", "Адрес")}</div><div className="mt-5">{field("eyebrow", "Короткая специализация")}</div><div className="mt-5">{field("description", "О себе", true)}</div>{message && <p role="status" className="mt-5 text-sm font-semibold text-[var(--brand)]">{message}</p>}<button className="focus-ring mt-7 rounded-full bg-[var(--brand)] px-6 py-3 font-bold text-white">Сохранить изменения</button></form>;
}
