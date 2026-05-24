"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { api, DashboardStats } from "../../lib/api";

function NavItem({ icon, label, active }: { icon: JSX.Element; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-primary-50 text-primary"
          : "text-ink-secondary hover:bg-surface-secondary hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function StatCard({ label, value, subtext, subcolor = "text-ink-tertiary" }: { label: string; value: string | number; subtext: string; subcolor?: string }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-ink-quaternary/40">
      <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-semibold text-ink mb-1">{value}</div>
      <div className={`text-xs font-medium ${subcolor}`}>{subtext}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { logout, token } = useAuth();
  const [botPaused, setBotPaused] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .dashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const totalMessages = (stats?.used_messages ?? 0) + (stats?.left_messages ?? 0) || 2000;
  const usagePercent = Math.min(((stats?.used_messages ?? 0) / totalMessages) * 100, 100);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-surface border-r border-ink-quaternary/30 z-40">
        <div className="p-5">
          <Link href="/" className="text-base font-semibold text-ink tracking-tight">
            AI Chat Bot
          </Link>
        </div>
        <nav className="px-3 space-y-0.5">
          <NavItem
            active
            label="Дашборд"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
          />
          <NavItem
            label="Диалоги"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            }
          />
          <NavItem
            label="Настройки бота"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <NavItem
            label="Аналитика"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
          />
          <NavItem
            label="Профиль"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all duration-200 w-full mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Выйти
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-56 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Дашборд</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBotPaused(!botPaused)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                botPaused
                  ? "bg-success text-white hover:bg-success/90"
                  : "bg-danger text-white hover:bg-danger/90"
              }`}
            >
              {botPaused ? "▶ Возобновить" : "⏸ Остановить"}
            </button>
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              А
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Сообщений осталось"
            value={loading ? "—" : stats?.left_messages ?? 0}
            subtext={`из ${stats?.used_messages ?? 0} использовано`}
            subcolor="text-success"
          />
          <StatCard
            label="Всего сообщений"
            value={loading ? "—" : stats?.total_messages ?? 0}
            subtext={`${stats?.unique_users_7d ?? 0} уникальных за 7 дней`}
          />
          <StatCard
            label="Передано менеджеру"
            value={loading ? "—" : stats?.handoffs_count ?? 0}
            subtext="handoff"
          />
          <StatCard
            label="Баланс"
            value="0 ₽"
            subtext="Пополнить"
            subcolor="text-primary"
          />
        </div>

        {/* Tariff info */}
        <div className="bg-surface rounded-2xl p-6 border border-ink-quaternary/40 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink mb-1">Тариф: Бизнес</h2>
              <p className="text-sm text-ink-secondary mb-4">2000 сообщений/мес · CRM · Авто-дожим</p>
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-ink-secondary font-medium">Использовано</span>
                  <span className="text-ink font-semibold">
                    {stats?.used_messages ?? 0} / {totalMessages}
                  </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>
            <button className="bg-surface-secondary hover:bg-surface-tertiary text-ink px-5 py-2 rounded-full text-sm font-medium border border-ink-quaternary/40 transition-all duration-200 ml-4">
              Сменить тариф
            </button>
          </div>
        </div>

        {/* Bot status */}
        <div className="bg-surface rounded-2xl p-6 border border-ink-quaternary/40">
          <h2 className="text-base font-semibold text-ink mb-4">Статус бота</h2>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${botPaused ? "bg-danger" : "bg-success animate-pulse"}`} />
            <span className="text-sm text-ink-secondary font-medium">
              {botPaused ? "Бот остановлен" : "Бот активен и отвечает клиентам"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
