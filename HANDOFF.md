# Slotly handoff

## Состояние

- Репозиторий: `D:\Projects\Portfolio\projects\slotly`
- Production: https://slotly-online.vercel.app/
- Ветка: `master`
- Последний commit: `5282562 Harden deleted service booking guard`
- Стек: Next.js 16 App Router, TypeScript, Supabase, Tailwind v4, Vitest.

## Что реализовано

- Единый визуальный стиль для consumer/public и specialist/admin поверх адаптивных light/dark токенов.
- Темная тема с более глубоким синим акцентом, читаемыми кнопками, карточками, выбранными услугами и hero-блоком.
- Публичный профиль с загруженными avatar/cover и service images.
- Полное редактирование услуг: название, описание, категория, цена, длительность, активность и фото.
- Soft-delete услуг через `services.deleted_at`; удаленные услуги не показываются в кабинете, каталоге и записи.
- Клиентские аккаунты и отдельный specialist onboarding для существующей auth identity.
- Клиентский кабинет `/account` и specialist dashboard `/admin`.
- Корзина заявок: soft-delete через `bookings.deleted_at`, восстановление в течение 7 дней, защита от восстановления в занятый слот.
- API ownership checks для операций специалиста.

## Supabase migrations в production

- `customer_profile_separation`
- `specialist_onboarding_policy`
- `booking_trash`
- `service_trash`
- `service_trash_rls`

Последняя проверка migration list подтверждала наличие всех этих миграций в проекте `qofbmetdnyayevsgujxr`.

## Проверки

- `npm run lint` — pass.
- `npm run test` — 6 файлов, 12 тестов pass.
- `npm run build` — pass, 19 маршрутов.
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- Production smoke `/`, `/p/markovvvvvkayt`, `/admin/services`, `/admin/bookings` — HTTP 200.

## Важные ограничения

- Корзина заявок блокирует восстановление после 7 дней, но автоматическая физическая очистка просроченных строк пока не добавлена. Это единственный известный P2 перед более строгим production SaaS-релизом.
- Supabase `auth.users.email` уникален: один email не создает две независимые auth-записи. Текущая модель использует одну identity и specialist onboarding.
- `supabase/.temp/` — локальные служебные файлы Supabase, не добавлять в git.

## Следующий рекомендуемый шаг

Добавить scheduled cleanup для `bookings.deleted_at` старше 7 дней и покрыть удаление/восстановление услуг и заявок E2E-тестами.
