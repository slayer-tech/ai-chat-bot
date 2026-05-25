"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, DashboardStats } from "@/lib/api";

/* ─── Paywall Modal ─── */
function PaywallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <div className="card p-8">
          <h3 className="text-xl font-semibold text-text mb-2">
            Лимит сообщений исчерпан
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            На текущем тарифе сообщения закончились. Перейдите на Pro — безлимит и три канала.
          </p>
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
  );
}

/* ─── Sidebar Nav ─── */
const navItems = [
  {
    label: "Дашборд",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    active: true,
  },
  {
    label: "Диалоги",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337L5.25 21l.82-3.488A8.215 8.215 0 013.75 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: "Настройки бота",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Аналитика",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Профиль",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

/* ─── Dashboard ─── */
export default function DashboardPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [botPaused, setBotPaused] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const localToken = localStorage.getItem("access_token");
    if (!localToken) {
      router.push("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    api
      .dashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!stats) return;
    if ((stats?.left_messages ?? 0) <= 0) {
      setPaywallOpen(true);
    }
  }, [stats]);

  if (!authorized) {
    return (
      <div className="min-h-[100dvh] bg-void flex items-center justify-center">
        <div className="text-muted">Загрузка...</div>
      </div>
    );
  }

  const total = (stats?.used_messages ?? 0) + (stats?.left_messages ?? 0);
  const usage = total > 0 ? Math.round(((stats?.used_messages ?? 0) / total) * 100) : 0;

  return (
    <div className="min-h-[100dvh] bg-void flex">
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-40 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-text">
            AI Chat Bot
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {navItems.map((item) => (
            <span
              key={item.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                item.active
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-white/[0.03] hover:text-text"
              }`}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft/30 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
        <Link href="/" className="text-base font-bold tracking-tight text-text">
          AI Chat Bot
        </Link>
        <button onClick={logout} className="text-sm text-accent">
          Выйти
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-10 pt-20 lg:pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Дашборд</h1>
            <p className="text-sm text-muted mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => setBotPaused(!botPaused)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              botPaused
                ? "bg-accent text-white hover:bg-accent-hover"
                : "bg-white/[0.05] text-text border border-border hover:bg-white/[0.08]"
            }`}
          >
            {botPaused ? "▶ Запустить бота" : "⏸ Остановить бота"}
          </button>
        </div>

        {loading ? (
          <div className="text-muted">Загрузка...</div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-2">Осталось сообщений</p>
                <p className="text-3xl font-bold text-text font-mono">
                  {stats?.left_messages ?? 0}
                </p>
                <p className="text-xs text-muted mt-2">
                  из {stats?.used_messages ?? 0} использовано
                </p>
              </div>
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-2">Всего сообщений</p>
                <p className="text-3xl font-bold text-text font-mono">
                  {stats?.total_messages ?? 0}
                </p>
                <p className="text-xs text-muted mt-2">
                  {stats?.unique_users_7d ?? 0} уникальных за 7 дней
                </p>
              </div>
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-2">Передано менеджеру</p>
                <p className="text-3xl font-bold text-text font-mono">
                  {stats?.handoffs_count ?? 0}
                </p>
                <p className="text-xs text-muted mt-2">handoff</p>
              </div>
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-2">Баланс</p>
                <p className="text-3xl font-bold text-text font-mono">0 ₽</p>
                <button className="text-xs text-accent hover:text-accent-hover mt-2 transition-colors">
                  Пополнить
                </button>
              </div>
            </div>

            {/* Tariff */}
            <div className="card p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Тариф</p>
                  <h2 className="text-xl font-semibold text-text mb-1">Pro</h2>
                  <p className="text-sm text-text-secondary">
                    Безлимитные сообщения · 3 канала · CRM
                  </p>
                  <div className="mt-4 w-full max-w-md">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted">Использовано</span>
                      <span className="text-text font-medium font-mono">
                        {stats?.used_messages ?? 0} / {total}
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(usage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="btn-secondary text-sm py-2 px-5 shrink-0"
                >
                  Сменить тариф
                </Link>
              </div>
            </div>

            {/* Bot status + Channels */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-4">Статус бота</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      botPaused ? "bg-muted" : "bg-accent animate-pulse"
                    }`}
                  />
                  <span className="text-sm font-medium text-text">
                    {botPaused
                      ? "Бот остановлен"
                      : "Бот активен и отвечает клиентам"}
                  </span>
                </div>
              </div>
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wider text-muted mb-4">Каналы</p>
                <div className="flex flex-wrap gap-2">
                  {["WhatsApp", "Telegram", "Instagram", "VK", "MAX"].map((ch) => (
                    <span
                      key={ch}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/[0.03] text-xs font-medium text-text-secondary border border-border"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
