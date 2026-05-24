"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { api, DashboardStats } from "../../lib/api";

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Chat Bot
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Дашборд
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Диалоги
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Настройки бота
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Аналитика
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Профиль
          </a>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors mt-4"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Дашборд</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBotPaused(!botPaused)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                botPaused
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
            >
              {botPaused ? "▶ Возобновить бота" : "⏸ Остановить бота"}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              А
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Сообщений осталось</div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? "—" : stats?.left_messages ?? 0}
            </div>
            <div className="text-sm text-emerald-600 mt-1">
              из {stats?.used_messages ?? 0} использовано
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Всего сообщений</div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? "—" : stats?.total_messages ?? 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {stats?.unique_users_7d ?? 0} уникальных за 7 дней
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Передано менеджеру</div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? "—" : stats?.handoffs_count ?? 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">handoff</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Баланс</div>
            <div className="text-3xl font-bold text-slate-900">0 ₽</div>
            <button className="text-sm text-blue-600 hover:text-blue-700 mt-1 font-medium">
              Пополнить
            </button>
          </div>
        </div>

        {/* Tariff info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Тариф: Бизнес</h2>
              <p className="text-slate-600">2000 сообщений/мес · CRM · Авто-дожим</p>
              <div className="mt-4 w-full max-w-md">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Использовано</span>
                  <span className="text-slate-900 font-medium">
                    {stats?.used_messages ?? 0} / {((stats?.used_messages ?? 0) + (stats?.left_messages ?? 0)) || 2000}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((stats?.used_messages ?? 0) /
                          ((stats?.used_messages ?? 0) + (stats?.left_messages ?? 0) || 1)) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-full font-medium transition-colors">
              Сменить тариф
            </button>
          </div>
        </div>

        {/* Bot status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Статус бота</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${botPaused ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`}></div>
            <span className="text-slate-700 font-medium">
              {botPaused ? "Бот остановлен" : "Бот активен и отвечает клиентам"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
