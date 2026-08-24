import Link from "next/link";
import { BookingFlow } from "@/src/components/booking-flow";
import { demoProfile, demoServices } from "@/src/lib/demo-data";

const serviceIcons = ["✦", "◌", "⌁"];

export default function HomePage() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <Link href="/" className="display text-2xl font-bold tracking-tight">Slot<span className="text-[var(--accent)]">ly</span></Link>
        <div className="flex items-center gap-5 text-sm font-semibold text-[var(--muted)]">
          <a href="#services" className="hidden transition hover:text-[var(--ink)] sm:block">Услуги</a>
          <a href="#how" className="hidden transition hover:text-[var(--ink)] sm:block">Как это работает</a>
          <Link href="/register" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 transition hover:border-[var(--accent)]">Создать свой профиль</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-18 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-18">
        <div>
          <p className="eyebrow mb-5">{demoProfile.eyebrow}</p>
          <h1 className="display max-w-2xl text-5xl font-bold leading-[0.98] sm:text-7xl">Красивый образ начинается с <span className="text-[var(--accent)]">свободного времени.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">{demoProfile.description} Выберите услугу и удобное окно — подтверждение займёт меньше минуты.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#book" className="focus-ring rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-white shadow-[0_12px_28px_rgba(207,91,61,0.2)] transition hover:bg-[var(--accent-dark)]">Выбрать время <span aria-hidden>→</span></a>
            <span className="text-sm text-[var(--muted)]">Без регистрации и звонков</span>
          </div>
          <div className="mt-12 flex gap-8 border-t border-[var(--line)] pt-6 text-sm">
            <div><strong className="block text-2xl">5 лет</strong><span className="text-[var(--muted)]">в профессии</span></div>
            <div><strong className="block text-2xl">4.9/5</strong><span className="text-[var(--muted)]">средняя оценка</span></div>
            <div><strong className="block text-2xl">10:00–20:00</strong><span className="text-[var(--muted)]">пн–пт</span></div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-2 -top-4 h-28 w-28 rounded-full bg-[#f2d4aa] blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] bg-[#dcece2] p-5 sm:p-8">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-[#b7cfc0]" aria-label="Абстрактная иллюстрация студии">
              <div className="relative h-full bg-[radial-gradient(circle_at_70%_20%,#f5e6c9_0_12%,transparent_13%),linear-gradient(145deg,#b7cfc0,#88a898)]">
                <div className="absolute bottom-0 left-[12%] h-[72%] w-[58%] rounded-t-[50%] bg-[#f4d2b5]" />
                <div className="absolute bottom-[23%] left-[26%] h-[43%] w-[37%] rounded-[50%] bg-[#bf785e]" />
                <div className="absolute left-[36%] top-[25%] h-4 w-4 rounded-full bg-[#17231f]" />
                <div className="absolute left-[58%] top-[27%] h-4 w-4 rounded-full bg-[#17231f]" />
                <div className="absolute bottom-[29%] left-[41%] h-2 w-14 rounded-full bg-[#a8442b]" />
                <div className="absolute right-[8%] top-[10%] h-40 w-20 rounded-full border-8 border-white/40" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm backdrop-blur">
              <span className="font-semibold">Ближайшее окно</span><span className="font-bold text-[var(--accent)]">Завтра · 12:00</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-5 py-18 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Выберите своё</p><h2 className="display text-4xl font-bold sm:text-5xl">Услуги и цены</h2></div><p className="max-w-xs text-sm leading-6 text-[var(--muted)]">Никаких скрытых условий. Длительность и стоимость видны сразу.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{demoServices.map((service, index) => <article key={service.id} className="surface p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1d33260d]"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mint)] text-xl text-[var(--accent)]">{serviceIcons[index]}</span><h3 className="mt-7 text-xl font-bold">{service.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[var(--muted)]">{service.description}</p><div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 text-sm"><span className="text-[var(--muted)]">{service.durationMinutes} минут</span><strong>{service.priceLabel}</strong></div></article>)}</div>
      </section>

      <section id="book" className="mx-auto max-w-6xl px-5 py-18 lg:px-8"><BookingFlow services={demoServices} /></section>

      <section id="how" className="bg-[#e9f0e9] px-5 py-18 lg:px-8"><div className="mx-auto max-w-6xl"><p className="eyebrow mb-3">Всё просто</p><h2 className="display max-w-2xl text-4xl font-bold sm:text-5xl">Три шага — и время уже за вами.</h2><div className="mt-10 grid gap-8 md:grid-cols-3">{[["01", "Выберите услугу", "Поймёте длительность и стоимость до записи."], ["02", "Найдите удобное окно", "Календарь показывает только свободное время."], ["03", "Оставьте контакты", "Мы подтвердим запись и не потеряем её в чате."]].map(([number, title, text]) => <div key={number} className="border-t border-[#b9cdbd] pt-5"><span className="text-sm font-bold text-[var(--accent)]">{number}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-2 leading-6 text-[var(--muted)]">{text}</p></div>)}</div></div></section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--muted)] lg:px-8"><span>© 2026 Slotly</span><span>{demoProfile.address} · {demoProfile.phone}</span></footer>
    </main>
  );
}
