"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    company: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        company_name: form.company,
        phone: form.phone,
      });
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-surface">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-text">
            AI Chat Bot
          </Link>
          <h1 className="text-[28px] font-semibold text-text mt-10 mb-2 tracking-tight">
            Регистрация
          </h1>
          <p className="text-base text-muted">
            7 дней бесплатно
          </p>
        </div>

        <div className="bento-card">
          {error && (
            <div className="mb-5 p-3 bg-red-500/5 text-red-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-premium"
                placeholder="you@company.ru"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Телефон</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-premium"
                placeholder="+7 999 123-45-67"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Название компании</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="input-premium"
                placeholder="ООО Ромашка"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Пароль</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-premium"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Повторите пароль</label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                className="input-premium"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? "Создание..." : "Создать аккаунт"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[15px] text-muted">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
