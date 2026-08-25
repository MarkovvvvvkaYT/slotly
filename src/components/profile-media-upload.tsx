"use client";

import { useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

type Kind = "avatar" | "cover";
type Props = { userId?: string; kind: Kind; path?: string; demo: boolean; onUploaded: (path: string) => void };

async function compressImage(file: File, kind: Kind) {
  const source = await createImageBitmap(file);
  const maxWidth = kind === "avatar" ? 720 : 1600;
  const scale = Math.min(1, maxWidth / source.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
  if (!blob) throw new Error("Не удалось обработать изображение");
  return blob;
}

export function ProfileMediaUpload({ userId, kind, path, demo, onUploaded }: Props) {
  const input = useRef<HTMLInputElement>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const label = kind === "avatar" ? "Аватар" : "Обложка";
  async function upload(file?: File) {
    if (!file) return; setMessage("");
    if (demo) return setMessage("Загрузка доступна после регистрации");
    if (!userId) return setMessage("Не найден владелец профиля");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) return setMessage("Поддерживаются JPEG, PNG или WebP до 3 МБ");
    setBusy(true);
    try { const image = await compressImage(file, kind); const target = `${userId}/${kind}-${Date.now()}.webp`; const { error } = await createClient().storage.from("profile-media").upload(target, image, { contentType: "image/webp", upsert: false }); if (error) throw error; onUploaded(target); setMessage("Изображение загружено"); }
    catch { setMessage("Не удалось загрузить изображение"); } finally { setBusy(false); }
  }
  return <div className="rounded-xl border border-dashed border-[var(--line)] p-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--soft)] font-bold text-[var(--accent)]">{kind === "avatar" ? "A" : "▧"}</div><div><p className="text-sm font-bold">{label}</p><p className="text-xs text-[var(--muted)]">JPEG, PNG или WebP · до 3 МБ</p></div></div>{path && <p className="mt-3 break-all text-xs text-[var(--muted)]">Файл загружен</p>}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} /><button type="button" disabled={busy} onClick={() => input.current?.click()} className="focus-ring mt-4 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold disabled:opacity-50">{busy ? "Загрузка…" : path ? "Заменить" : "Загрузить"}</button>{message && <p role="status" className="mt-3 text-xs font-semibold text-[var(--brand)]">{message}</p>}</div>;
}
