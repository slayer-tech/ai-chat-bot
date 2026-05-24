"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function PricingPage() {
  const { token } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "навсегда",
      desc: "Для знакомства с продуктом",
      features: ["100 сообщений / мес", "1 канал связи", "Базовая аналитика", "Email поддержка"],
      cta: "Начать",
      href: "/register",
      highlight: false,
    },
    {
      name: "Pro",
      price: "2 900",
      period: "/ мес",
      desc: "Для растущего бизнеса",
      features: ["Безлимитные сообщения", "3 канала связи", "Интеграция с CRM", "Приоритетная поддержка", "Расширенная аналитика"],
      cta: "Выбрать Pro",
      href: "/register",
      highlight: true,
    },
    {
      name: "Business",
      price: "9 900",
      period: "/ мес",
      desc: "Для крупных команд",
      features: ["Безлимитные сообщения", "Все каналы связи", "Доступ к API", "White-label", "Персональный менеджер"],
      cta: "Связаться",
      href: "/register",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-void">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold tracking-tight text-text">
            Relay
          </Link>
          <div className="flex items-center gap-4">
            {token ? (
              <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
                Кабинет
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted hover:text-text transition-colors">
                  Вход
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-5">
                  Начать
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <p className="eyebrow mb-4 justify-center">Тарифы</p>
          <h1 className="heading-hero mb-6">
            Прозрачные цены
          </h1>
          <p className="body-large max-w-xl mx-auto">
            Никаких скрытых платежей. Меняйте тариф в любой момент.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative ${plan.highlight ? "md:-mt-4 md:mb-4" : ""}`}
            >
              <div className={`card-shell h-full ${plan.highlight ? "ring-1 ring-accent/20" : ""}`}>
                <div className={`card-core h-full p-8 flex flex-col ${plan.highlight ? "bg-accent-soft/5" : ""}`}>
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      Популярный
                    </span>
                  )}
                  <p className="text-sm text-muted mb-1">{plan.name}</p>
                  <p className="text-xs text-muted mb-6">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-text">{plan.price}</span>
                    <span className="text-sm text-muted">₽ {plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-sm text-text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={token ? "/dashboard" : plan.href}
                    className={`block text-center w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 ease-spring ${
                      plan.highlight
                        ? "bg-accent text-white hover:bg-accent-hover"
                        : "bg-white/[0.03] text-text border border-border hover:bg-white/[0.06]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ micro-section */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-text mb-8 text-center">Вопросы</h2>
          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h3 className="text-base font-semibold text-text mb-2">Можно ли сменить тариф?</h3>
              <p className="text-sm text-text-secondary">Да, в любой момент из кабинета. Деньги пересчитаются пропорционально.</p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-base font-semibold text-text mb-2">Есть ли пробный период?</h3>
              <p className="text-sm text-text-secondary">Free-тариф работает без ограничений по времени. Это полноценный способ протестировать продукт.</p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-base font-semibold text-text mb-2">Нужна ли карта?</h3>
              <p className="text-sm text-text-secondary">Нет. Регистрация и использование Free-тарифа не требуют карты.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
