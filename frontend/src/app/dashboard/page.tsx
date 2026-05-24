"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

/* ─── Paywall Modal ─── */
function PaywallModal({
  open,
  onClose,
  type,
}: {
  open: boolean;
  onClose: () => void;
  type: "limit" | "feature";
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <div className="card-shell">
          <div className="card-core p-8">
            {type === "limit" ? (
              <>
                <h3 className="text-xl font-semibold text-text mb-2">
                  Лимит сообщений исчерпан
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  На тарифе Free доступно 100 сообщений в месяц. Перейдите на Pro — 
                  безлимит и три канала.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-text mb-2">
                  Доступно на Pro
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  Интеграция с CRM и API доступны только на платных тарифах.
                </p>
              </>
            )}
            <div className="space-y-3">
              <Link href="/pricing" className="btn-primary w-full text-center">
                Смотреть тарифы
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-muted hover:text-text transition-colors"
              >
                Позже
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function DashboardPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paywall, setPaywall] = useState<{ open: boolean; type: "limit" | "feature" }>({
    open: false,
    type: "limit",
  });

  useEffect(() => {
    if (!token) return;
    api
      .get("/tenants/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setTenant(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!tenant) return;
    const usage = tenant.used_messages || 0;
    const limit = tenant.max_messages || 100;
    if (usage >= limit) {
      setPaywall({ open: true, type: "limit" });
    }
  }, [tenant]);

  if (!user && typeof window !== "undefined") {
    router.push("/login");
    return null;
  }

  const usage = tenant
    ? Math.round(((tenant.used_messages || 0) / Math.max(tenant.max_messages || 1, 1)) * 100)
    : 0;

  return (
    <div className="min-h-[100dvh] bg-void">
      <PaywallModal
        open={paywall.open}
        onClose={() => setPaywall({ ...paywall, open: false })}
        type={paywall.type}
      />

      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold tracking-tight text-text">
            Relay
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Кабинет</h1>
          <p className="text-muted mt-1 text-sm">Управление аккаунтом и ботом</p>
        </div>

        {loading ? (
          <div className="text-muted">Загрузка...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card-shell">
                <div className="card-core p-6">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Сообщений</p>
                  <p className="text-3xl font-bold text-text">
                    {tenant?.used_messages || 0}
                    <span className="text-lg text-muted font-normal ml-1">
                      / {tenant?.max_messages || 0}
                    </span>
                  </p>
                  <div className="mt-4 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">{usage}% от лимита</p>
                </div>
              </div>

              <div className="card-shell">
                <div className="card-core p-6">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Тариф</p>
                  <p className="text-3xl font-bold text-text">{tenant?.tariff || "Free"}</p>
                  <p className="text-sm text-muted mt-2">
                    {tenant?.tariff === "Free"
                      ? "Базовый функционал"
                      : tenant?.tariff === "Pro"
                      ? "Расширенные возможности"
                      : "Полный доступ"}
                  </p>
                </div>
              </div>

              <div className="card-shell">
                <div className="card-core p-6">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Статус</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-lg font-semibold text-text">Активен</span>
                  </div>
                  <p className="text-sm text-muted mt-2">Отвечает на сообщения</p>
                </div>
              </div>
            </div>

            {/* Channels */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-text mb-4">Каналы</h2>
              <div className="card-shell">
                <div className="card-core p-6">
                  <div className="flex flex-wrap gap-3">
                    {["WhatsApp", "Telegram", "Instagram", "VK"].map((ch) => (
                      <span
                        key={ch}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] text-sm font-medium text-text border border-border"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-text mb-4">Быстрые действия</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPaywall({ open: true, type: "feature" })}
                  className="btn-secondary text-sm"
                >
                  Подключить CRM
                </button>
                <Link href="/pricing" className="btn-primary text-sm">
                  Сменить тариф
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
