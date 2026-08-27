import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/src/lib/site";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  metadataBase: new URL("https://slotly-online.vercel.app"),
  icons: { icon: "/slotly-mark.png", apple: "/slotly-mark.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('slotly-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()" }} />
      </head>
      <body id="main-content"><a href="#main-content" className="skip-link">Перейти к содержанию</a>{children}</body>
    </html>
  );
}
