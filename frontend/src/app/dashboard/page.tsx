"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get("/tenants/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setTenant(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!user && typeof window !== "undefined") {
    router.push("/login");
    return null;
  }

  const usage = tenant
    ? Math.round(((tenant.used_messages || 0) / Math.max(tenant.max_messages || 1, 1)) * 100)
    : 0;

  return (
    <div className="min-h-[100dvh] bg-void">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold tracking-tight text-text">
            AI Chat Bot
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.email}</span>
            <button onClick={logout} className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Кабинет</h1>
          <p className="text-muted mt-1">Управление аккаунтом и ботом</p>
        </div>

        {loading ? (
          <div className="text-muted">Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Usage Card */}
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted mb-1">Сообщений использовано</p>
              <p className="text-3xl font-bold text-text">
                {tenant?.used_messages || 0}
                <span className="text-lg text-muted font-normal">
                  {" "}/ {tenant?.max_messages || 0}
                </span>
              </p>
              <div className="mt-4 h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2">{usage}% от лимита</p>
            </div>

            {/* Plan Card */}
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted mb-1">Тариф</p>
              <p className="text-3xl font-bold text-text">{tenant?.tariff || "Free"}</p>
              <p className="text-sm text-muted mt-2">
                {tenant?.tariff === "Free"
                  ? "Базовый функционал"
                  : tenant?.tariff === "Pro"
                  ? "Расширенные возможности"
                  : "Полный доступ"}
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted mb-1">Статус бота</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span className="text-lg font-semibold text-text">Активен</span>
              </div>
              <p className="text-sm text-muted mt-2">Отвечает на входящие сообщения</p>
            </div>
          </div>
        )}

        {/* Integrations */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-text mb-4">Каналы</h2>
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex flex-wrap gap-3">
              {["WhatsApp", "Telegram", "Instagram", "VK"].map((ch) => (
                <span
                  key={ch}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated text-sm font-medium text-text"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
