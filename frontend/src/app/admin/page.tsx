"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

/* ─── Types ─── */
interface Tenant {
  id: number;
  name: string;
  email: string;
  tariff: string;
  messages: number;
  status: "active" | "paused";
  lastActive: string;
  channels: string[];
}

interface ActivityItem {
  id: number;
  action: string;
  target: string;
  detail: string;
  time: string;
  type: "user" | "system" | "alert" | "billing";
}

/* ─── Mock data ─── */
const tenants: Tenant[] = [
  { id: 1, name: "ООО СтройМастер", email: "admin@stroymaster.ru", tariff: "Pro", messages: 1247, status: "active", lastActive: "2 мин назад", channels: ["WhatsApp", "Telegram"] },
  { id: 2, name: "ИП Кузнецова", email: "elena.k@mail.ru", tariff: "Business", messages: 8934, status: "active", lastActive: "15 мин назад", channels: ["WhatsApp", "Instagram", "VK"] },
  { id: 3, name: "МедЦентр Плюс", email: "info@medplus.ru", tariff: "Pro", messages: 562, status: "paused", lastActive: "3 ч назад", channels: ["Telegram"] },
  { id: 4, name: "AutoService Pro", email: "service@auto.pro", tariff: "Pro", messages: 3421, status: "active", lastActive: "1 ч назад", channels: ["WhatsApp", "MAX"] },
  { id: 5, name: "BeautyLab", email: "hello@beautylab.ru", tariff: "Business", messages: 7891, status: "active", lastActive: "5 мин назад", channels: ["Instagram", "Telegram", "VK"] },
  { id: 6, name: "IT Консалтинг", email: "consult@it.ru", tariff: "Pro", messages: 128, status: "paused", lastActive: "2 дня назад", channels: ["WhatsApp"] },
];

const activity: ActivityItem[] = [
  { id: 1, action: "Новый пользователь", target: "ООО СтройМастер", detail: "Зарегистрировался через WhatsApp. Подключён канал. Первое сообщение отправлено 2 минуты назад.", time: "2 мин назад", type: "user" },
  { id: 2, action: "Смена тарифа", target: "BeautyLab → Business", detail: "Пользователь оплатил Business. Активированы API и White-label.", time: "15 мин назад", type: "billing" },
  { id: 3, action: "Бот остановлен", target: "МедЦентр Плюс", detail: "Администратор вручную остановил бота в 14:32. Причина: техническое обслуживание.", time: "3 ч назад", type: "system" },
  { id: 4, action: "Превышен лимит", target: "IT Консалтинг", detail: "Использовано 128 из 100 сообщений. Бот автоматически приостановлен.", time: "2 дня назад", type: "alert" },
  { id: 5, action: "Пополнение баланса", target: "ИП Кузнецова", detail: "+2 900 ₽ через СБП. Тариф Pro продлён до 15.07.2025.", time: "1 день назад", type: "billing" },
  { id: 6, action: "Новый канал", target: "AutoService Pro", detail: "Подключён канал MAX. Настройка webhook завершена успешно.", time: "4 ч назад", type: "user" },
  { id: 7, action: "Ошибка интеграции", target: "BeautyLab → CRM", detail: "Не удалось отправить лид в amoCRM. Токен истёк. Требуется обновление.", time: "5 ч назад", type: "alert" },
  { id: 8, action: "Авто-рассылка", target: "ИП Кузнецова", detail: "Отправлено 47 персонализированных предложений. Конверсия 12%.", time: "6 ч назад", type: "system" },
];

const hourlyMessages = [
  { hour: "00", count: 45 },
  { hour: "04", count: 12 },
  { hour: "08", count: 89 },
  { hour: "12", count: 156 },
  { hour: "16", count: 134 },
  { hour: "20", count: 98 },
];

const maxMessages = Math.max(...hourlyMessages.map((d) => d.count));

/* ─── Components ─── */
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="card p-6">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">{label}</p>
      <p className="text-4xl font-bold text-text font-mono">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${accent ? "bg-accent animate-pulse" : "bg-muted"}`} />
        <span className="text-xs text-text-secondary">{sub}</span>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const [open, setOpen] = useState(false);
  const typeColor =
    item.type === "alert"
      ? "bg-accent"
      : item.type === "billing"
      ? "bg-emerald-500"
      : item.type === "system"
      ? "bg-blue-500"
      : "bg-white/20";

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 py-4 px-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-text truncate">{item.action}</p>
            <span className="text-xs text-muted shrink-0">{item.time}</span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 truncate">{item.target}</p>
        </div>
        <svg
          className={`w-4 h-4 text-muted shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 pl-11">
          <p className="text-xs text-text-secondary leading-relaxed">{item.detail}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function AdminPage() {
  const { user, logout, token, role, isLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "paused">("all");

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (!isLoading && role && role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [role, isLoading, router]);

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === "all" ? true : t.status === tab;
    return matchesSearch && matchesTab;
  });

  const totalMessages = tenants.reduce((s, t) => s + t.messages, 0);
  const activeBots = tenants.filter((t) => t.status === "active").length;
  const totalRevenue = tenants.reduce((s, t) => s + (t.tariff === "Business" ? 9900 : 2900), 0);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-void flex items-center justify-center">
        <div className="text-muted">Загрузка...</div>
      </div>
    );
  }

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
            <button onClick={logout} className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Всего тенантов" value={String(tenants.length)} sub={`${activeBots} активных`} accent />
          <StatCard label="Всего сообщений" value={totalMessages.toLocaleString()} sub="за все время" />
          <StatCard label="Доход / мес" value={`${totalRevenue.toLocaleString()} ₽`} sub={`${tenants.filter((t) => t.tariff === "Business").length} Business`} />
          <StatCard label="Активных ботов" value={String(activeBots)} sub={`из ${tenants.length}`} accent />
        </div>

        {/* Analytics row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-10">
          {/* Message volume chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-text">Сообщения по часам</h2>
              <span className="text-xs text-muted">Последние 24 ч</span>
            </div>
            <div className="flex items-end gap-3 h-40">
              {hourlyMessages.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative">
                    <div
                      className="w-full rounded-t-lg bg-accent/20 hover:bg-accent/40 transition-colors"
                      style={{ height: `${(d.count / maxMessages) * 120}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted font-mono">{d.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel distribution */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-text mb-6">Каналы</h2>
            <div className="space-y-4">
              {["WhatsApp", "Telegram", "Instagram", "VK", "MAX"].map((ch) => {
                const count = tenants.filter((t) => t.channels.includes(ch)).length;
                const pct = Math.round((count / tenants.length) * 100);
                return (
                  <div key={ch}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary">{ch}</span>
                      <span className="text-muted font-mono">{count}</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                      <div
                        className="bg-accent h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Tenants table */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-text">Все тенанты</h2>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg bg-white/[0.03] border border-border p-0.5">
                    {(["all", "active", "paused"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          tab === t ? "bg-accent text-white" : "text-muted hover:text-text"
                        }`}
                      >
                        {t === "all" ? "Все" : t === "active" ? "Активные" : "Остановлены"}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск..."
                    className="input-premium text-sm py-2.5 px-4 max-w-[180px]"
                  />
                </div>
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
                            t.tariff === "Business" ? "bg-accent-soft text-accent" : "bg-white/[0.04] text-text-secondary"
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
                {filtered.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted">Ничего не найдено</div>
                )}
              </div>
            </div>
          </div>

          {/* Activity + Quick actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-base font-semibold text-text">Активность</h2>
                <span className="text-xs text-muted">{activity.length} событий</span>
              </div>
              <div>
                {activity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="card p-5">
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
