# Slotly

Slotly — сервис онлайн-записи для небольших специалистов: репетиторов, мастеров, фотографов, студий и локальных сервисов.

> Запись, которая не теряется.

## Что уже работает

- публичная страница специалиста с услугами и ценами;
- регистрация владельца и защищённая личная админ-панель;
- публичная страница профиля `/p/<slug>` для каждого специалиста;
- создание, скрытие и публикация собственных услуг;
- мобильный календарь со свободными слотами;
- запись без регистрации;
- серверная валидация имени, телефона, даты и конфликта слота;
- экран подтверждения с номером записи;
- демо-админка со статусами «новая», «подтверждена», «отменена»;
- Supabase migration с RLS;
- необязательные уведомления в Telegram.

Без Supabase env проект запускается в demo-режиме: данные берутся из `src/lib/demo-data.ts`, а созданные записи живут в памяти процесса. С env приложение подключается к Supabase и становится multi-tenant: каждый зарегистрированный владелец видит только свой профиль и свои заявки.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Создайте профиль через `/register`, войдите через `/login`, затем админка доступна по адресу `/admin`. После публикации профиль получает публичную ссылку `/p/<slug>`.

Проверки:

```bash
npm run test
npm run lint
npm run build
```

## Подключение Supabase

1. Создайте проект на бесплатном тарифе Supabase.
2. Выполните SQL из `supabase/migrations/20260824000200_multitenant_auth.sql`.
3. Скопируйте `.env.example` в `.env.local`.
4. Заполните `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Service role key для этого MVP не нужен и не должен добавляться в клиентский код. После регистрации Supabase может попросить подтвердить email — это настраивается в Authentication → Providers → Email.

## Telegram

Slotly отправляет события нового бронирования и изменения статуса в отдельный `slotly-telegram-bot`. Укажите `TELEGRAM_BOT_USERNAME`, `TELEGRAM_BOT_INTERNAL_URL` и общий `TELEGRAM_INTERNAL_SECRET`. Сбой бота не отменяет запись.

## Структура

- `app/page.tsx` — публичная страница;
- `app/p/[slug]/page.tsx` — публичная страница владельца;
- `app/login` и `app/register` — auth flow;
- `src/components/booking-flow.tsx` — клиентский booking flow;
- `app/admin/page.tsx` — демо-админка;
- `app/api/bookings/route.ts` — серверный endpoint;
- `src/lib/repository.ts` — demo repository;
- `src/lib/owner-data.ts` — tenant-scoped server data;
- `src/lib/supabase/` — browser/server/proxy clients;
- `supabase/migrations/` — схема и RLS;
- `docs/PORTFOLIO.md` — описание проекта для портфолио.
