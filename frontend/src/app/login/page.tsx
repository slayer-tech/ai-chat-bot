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
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-aurora opacity-60" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-electric/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-mint/5 rounded-full blur-[96px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-lg font-bold tracking-tight text-frost-100">
            AI Chat Bot
          </Link>
          <h1 className="text-2xl font-bold text-frost-100 mt-8 mb-2 tracking-tight">
            Вход в аккаунт
          </h1>
          <p className="text-sm text-void-500">
            Управляйте своим ИИ-ассистентом
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-5 p-3 bg-rose/5 border border-rose/10 text-rose rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-frost-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                placeholder="you@company.ru"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-frost-200 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-3 disabled:opacity-50"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-void-500">
              Ещё нет аккаунта?{" "}
              <Link href="/register" className="text-electric font-medium hover:text-electric-300 transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
