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
    <main className="min-h-screen flex items-center justify-center px-6 py-12 gradient-mesh">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-lg font-semibold text-ink tracking-tight">
            AI Chat Bot
          </Link>
          <h1 className="text-2xl font-semibold text-ink mt-8 mb-2 tracking-tight">
            Регистрация
          </h1>
          <p className="text-sm text-ink-secondary">
            7 дней бесплатно — без привязки карты
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
              <label className="block text-sm font-medium text-ink mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="you@company.ru"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Телефон</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="+7 999 123-45-67"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Название компании</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="ООО Ромашка"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Пароль</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-quaternary/50 bg-surface-secondary text-ink text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Повторите пароль</label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
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
              {loading ? "Создание..." : "Создать аккаунт"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-secondary">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary-700 transition-colors">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
