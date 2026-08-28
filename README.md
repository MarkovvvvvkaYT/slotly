# Slotly

Slotly — веб-сервис онлайн-записи для независимых специалистов и локальных сервисов. Клиент выбирает услугу и свободное время на публичной странице, а владелец управляет профилем, расписанием и заявками в личном кабинете.

## Возможности

- публичный каталог и страницы специалистов `/p/<slug>`;
- регистрация, вход и защищённый кабинет владельца;
- управление услугами, ценами, длительностью и публикацией;
- настройка рабочих часов и перерывов;
- запись клиента без регистрации и серверная проверка конфликтов слотов;
- статусы заявок: новая, подтверждена, отменена;
- привязка Telegram для уведомлений;
- demo-режим без Supabase.

## Стек

Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres, Auth, RLS), Tailwind CSS 4, Zod, Vitest.

## Архитектура

- `app/` — страницы и API routes;
- `app/p/[slug]/` — публичные профили;
- `app/admin/` — кабинет владельца;
- `src/components/` — интерфейсные компоненты;
- `src/lib/` — доменная логика и Supabase-клиенты;
- `supabase/migrations/` — схема и политики RLS.

Без Supabase используются данные `src/lib/demo-data.ts`, записи хранятся в памяти процесса. С Supabase включается многопользовательский режим с изоляцией данных владельцев.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Для demo-режима оставьте Supabase-переменные пустыми. Основные маршруты: `/`, `/register`, `/login`, `/admin`.

Для Supabase создайте проект, выполните миграции из `supabase/migrations/` и заполните `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Проверки

```bash
npm run test
npm run lint
npm run build
```

## Связанный проект

- [Slotly Telegram Bot](https://github.com/MarkovvvvvkaYT/slotly-telegram-bot) — уведомления и управление заявками в Telegram.

## Лицензия

Проект распространяется без отдельной публичной лицензии.
