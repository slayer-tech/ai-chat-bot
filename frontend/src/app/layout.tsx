import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-onest",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Chat Bot — Автоматизация продаж в мессенджерах",
  description: "ИИ-ассистент для WhatsApp и Telegram. Автоматические ответы, RAG, интеграция с CRM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${onest.variable} dark`}>
      <body className={`${onest.className} font-body`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
