"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-void">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-xl font-bold tracking-tight text-text">
            AI Chat Bot
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-text">Вход в аккаунт</h1>
          <p className="mt-2 text-muted text-sm">Введите данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="input-premium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-premium"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Создать
          </Link>
        </p>
      </div>
    </div>
  );
}
