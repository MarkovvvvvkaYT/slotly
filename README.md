# ВремяЕсть

«ВремяЕсть» — сервис онлайн-записи для небольших специалистов: репетиторов, мастеров, фотографов, студий и локальных сервисов.

> Запись, которая не теряется.

## Что уже работает

- публичная страница специалиста с услугами и ценами;
- мобильный календарь со свободными слотами;
- запись без регистрации;
- серверная валидация имени, телефона, даты и конфликта слота;
- экран подтверждения с номером записи;
- демо-админка со статусами «новая», «подтверждена», «отменена»;
- Supabase migration с RLS;
- необязательные уведомления в Telegram.

По умолчанию проект запускается в demo-режиме: данные берутся из `src/lib/demo-data.ts`, а созданные записи живут в памяти процесса. Это удобно для портфолио и не требует ключей или бюджета.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Админка доступна по адресу `/admin`.

Проверки:

```bash
npm run test
npm run lint
npm run build
```

## Подключение Supabase

1. Создайте проект на бесплатном тарифе Supabase.
2. Выполните SQL из `supabase/migrations/20260824000100_initial_schema.sql`.
3. Скопируйте `.env.example` в `.env.local`.
4. Заполните `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` только на сервере/Vercel.

Service role key нельзя добавлять в клиентский код или публиковать в репозитории. Демо-версия приложения не требует этих переменных.

## Telegram

Создайте бота через BotFather и укажите `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. Уведомление отправляется после сохранения записи; если Telegram не настроен или временно недоступен, сама запись не теряется.

## Структура

- `app/page.tsx` — публичная страница;
- `src/components/booking-flow.tsx` — клиентский booking flow;
- `app/admin/page.tsx` — демо-админка;
- `app/api/bookings/route.ts` — серверный endpoint;
- `src/lib/repository.ts` — demo repository;
- `src/lib/supabase-repository.ts` — Supabase adapter;
- `supabase/migrations/` — схема и RLS;
- `docs/PORTFOLIO.md` — описание проекта для портфолио.
