"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 gradient-mesh">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-lg font-semibold text-ink tracking-tight">
            AI Chat Bot
          </Link>
          <h1 className="text-2xl font-semibold text-ink mt-8 mb-2 tracking-tight">
            Вход в аккаунт
          </h1>
          <p className="text-sm text-ink-secondary">
            Управляйте своим ИИ-ассистентом
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-ink-quaternary/40 p-8 shadow-soft">
          {error && (
            <div className="mb-5 p-3 bg-danger/5 text-danger rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="you@company.ru"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-full text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all duration-200 hover:shadow-soft"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-secondary">
              Ещё нет аккаунта?{" "}
              <Link href="/register" className="text-primary font-medium hover:text-primary-700 transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
