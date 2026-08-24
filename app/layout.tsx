import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ВремяЕсть — запись без переписок",
  description: "Простая онлайн-запись для специалистов и небольших сервисов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
