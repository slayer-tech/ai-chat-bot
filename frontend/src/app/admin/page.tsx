"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

/* ─── Mock data for superadmin ─── */
const tenants = [
  { id: 1, name: "ООО СтройМастер", email: "admin@stroymaster.ru", tariff: "Pro", messages: 1247, status: "active", lastActive: "2 мин назад" },
  { id: 2, name: "ИП Кузнецова", email: "elena.k@mail.ru", tariff: "Business", messages: 8934, status: "active", lastActive: "15 мин назад" },
  { id: 3, name: "МедЦентр Плюс", email: "info@medplus.ru", tariff: "Pro", messages: 562, status: "paused", lastActive: "3 ч назад" },
  { id: 4, name: "AutoService Pro", email: "service@auto.pro", tariff: "Pro", messages: 3421, status: "active", lastActive: "1 ч назад" },
  { id: 5, name: "BeautyLab", email: "hello@beautylab.ru", tariff: "Business", messages: 7891, status: "active", lastActive: "5 мин назад" },
  { id: 6, name: "IT Консалтинг", email: "consult@it.ru", tariff: "Pro", messages: 128, status: "paused", lastActive: "2 дня назад" },
];

const activity = [
  { action: "Новый пользователь", target: "ООО СтройМастер", time: "2 мин назад" },
  { action: "Смена тарифа", target: "BeautyLab → Business", time: "15 мин назад" },
  { action: "Бот остановлен", target: "МедЦентр Плюс", time: "3 ч назад" },
  { action: "Превышен лимит", target: "IT Консалтинг", time: "2 дня назад" },
  { action: "Пополнение баланса", target: "ИП Кузнецова", time: "1 день назад" },
];

export default function AdminPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [token, router]);

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalMessages = tenants.reduce((s, t) => s + t.messages, 0);
  const activeBots = tenants.filter((t) => t.status === "active").length;
  const totalRevenue = tenants.reduce((s, t) => s + (t.tariff === "Business" ? 9900 : 2900), 0);

  return (
    <div className="min-h-[100dvh] bg-void">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-bold tracking-tight text-text">
              AI Chat Bot
            </Link>
            <span className="text-xs uppercase tracking-wider text-muted border-l border-border pl-6">
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">{user?.email}</span>
            <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text transition-colors">
              Кабинет
            </Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Super Dashboard</h1>
          <p className="text-sm text-muted mt-1">Обзор всех тенантов и метрик системы</p>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Всего тенантов</p>
            <p className="text-4xl font-bold text-text font-mono">{tenants.length}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-text-secondary">{activeBots} активных</span>
            </div>
          </div>
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Всего сообщений</p>
            <p className="text-4xl font-bold text-text font-mono">{totalMessages.toLocaleString()}</p>
            <p className="text-xs text-text-secondary mt-3">за все время</p>
          </div>
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Доход / мес</p>
            <p className="text-4xl font-bold text-text font-mono">{totalRevenue.toLocaleString()} ₽</p>
            <p className="text-xs text-text-secondary mt-3">{tenants.filter(t => t.tariff === "Business").length} Business</p>
          </div>
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Активных ботов</p>
            <p className="text-4xl font-bold text-text font-mono">{activeBots}</p>
            <p className="text-xs text-text-secondary mt-3">из {tenants.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Tenants table */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-text">Все тенанты</h2>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="input-premium text-sm py-2.5 px-4 max-w-xs"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-5 text-xs uppercase tracking-wider text-muted font-medium">Название</th>
                      <th className="py-3 px-5 text-xs uppercase tracking-wider text-muted font-medium">Тариф</th>
                      <th className="py-3 px-5 text-xs uppercase tracking-wider text-muted font-medium text-right">Сообщения</th>
                      <th className="py-3 px-5 text-xs uppercase tracking-wider text-muted font-medium">Статус</th>
                      <th className="py-3 px-5 text-xs uppercase tracking-wider text-muted font-medium">Активность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="text-sm font-medium text-text">{t.name}</p>
                          <p className="text-xs text-muted">{t.email}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.tariff === "Business"
                              ? "bg-accent-soft text-accent"
                              : "bg-white/[0.04] text-text-secondary"
                          }`}>
                            {t.tariff}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-sm text-text">
                          {t.messages.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${t.status === "active" ? "bg-accent" : "bg-muted"}`} />
                            <span className="text-xs text-text-secondary">
                              {t.status === "active" ? "Активен" : "Остановлен"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-muted">{t.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-5 border-b border-border">
                <h2 className="text-base font-semibold text-text">Активность</h2>
              </div>
              <div className="p-5 space-y-5">
                {activity.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-text">{item.action}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.target}</p>
                      <p className="text-xs text-muted mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card mt-4 p-5">
              <h2 className="text-base font-semibold text-text mb-4">Быстрые действия</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-sm text-text transition-colors">
                  Создать нового тенанта
                </button>
                <button className="w-full text-left px-4 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-sm text-text transition-colors">
                  Экспорт статистики
                </button>
                <button className="w-full text-left px-4 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-sm text-text transition-colors">
                  Настройки системы
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
