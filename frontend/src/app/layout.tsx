import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Relay — ИИ-ассистент для бизнеса",
  description:
    "Автоматизируйте общение с клиентами. ИИ отвечает 24/7, обучается на ваших данных, конвертирует диалоги в сделки.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${onest.variable} dark`}>
      <body className={`${onest.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
