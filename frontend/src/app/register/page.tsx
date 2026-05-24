"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-void relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(255,107,91,0.06),transparent)]" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-xl font-bold tracking-tight text-text">
            AI Chat Bot
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-text">
            Регистрация
          </h1>
          <p className="mt-2 text-sm text-muted">Начните за 30 секунд</p>
        </div>

        <div className="card">
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email
                </label>
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
                <label className="block text-sm font-medium text-text mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium"
                  required
                />
                <p className="mt-1.5 text-xs text-muted">Минимум 6 символов</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Повторите пароль
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-accent bg-accent-soft/10 border border-accent/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Создание..." : "Создать аккаунт"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted">3 дня бесплатно</p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
