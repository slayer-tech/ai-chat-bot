"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function Navbar() {
  const scrolled = useScrolled();
  const { user } = useAuth();

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-text">
          AI Chat Bot
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Кабинет
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-text hover:text-accent transition-colors">
                Вход
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">
                Начать
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.08),transparent)]" />
      <div className="max-w-6xl mx-auto px-6 w-full py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-6">Для бизнеса любого масштаба</p>
            <h1 className="heading-1 mb-8">
              ИИ-ассистент, который{" "}
              <span className="text-accent">продаёт</span> за вас
            </h1>
            <p className="body-large mb-10 max-w-lg">
              Подключите к WhatsApp, Telegram, Instagram и другим каналам. ИИ отвечает клиентам,
              отвечает на вопросы, записывает на приём — пока вы занимаетесь бизнесом.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary">
                Попробовать бесплатно
              </Link>
              <a href="#how" className="btn-secondary">
                Как это работает
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-2xl border border-border shadow-xl shadow-black/[0.04] p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm">AI Ассистент</span>
                <span className="ml-auto text-xs text-muted bg-accent-soft text-accent px-2 py-0.5 rounded-full font-medium">Online</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-accent text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                    Здравствуйте! Меня интересует стоимость ваших услуг
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-elevated text-text text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                    Добрый день! У нас три тарифа — от 0 до 2900 р/мес. Рассказать подробнее?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-accent text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[60%]">
                    Да, интересует Pro
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-elevated text-text text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                    Отличный выбор! Pro включает неограниченные сообщения, Telegram, WhatsApp, Instagram и интеграцию с CRM. Записать вас на демо?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      num: "01",
      title: "Отвечает вместо вас",
      desc: "Подключите к любому каналу — WhatsApp, Telegram, Instagram, VK. ИИ мгновенно отвечает на вопросы клиентов 24 часа в сутки, 7 дней в неделю.",
    },
    {
      num: "02",
      title: "Учится на ваших данных",
      desc: "Загрузите базу знаний — прайс-листы, FAQ, инструкции. Ассистент будет отвечать точно в вашем стиле, ссылаясь на реальные данные.",
    },
    {
      num: "03",
      title: "Конвертирует в сделки",
      desc: "Не просто отвечает — ведёт диалог к цели. Записывает на приём, собирает контакты, передаёт горячих лидов вам или в CRM.",
    },
  ];

  return (
    <section id="how" className="py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-20">
          <p className="section-label mb-4">Возможности</p>
          <h2 className="heading-2 max-w-2xl">
            Всё, что нужно для автоматизации общения с клиентами
          </h2>
        </div>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[120px_1fr] gap-8 md:gap-16 py-12 border-t border-border group hover:bg-elevated/30 transition-colors duration-300 -mx-6 px-6"
            >
              <span className="text-5xl font-bold text-border group-hover:text-accent/20 transition-colors duration-300">
                {item.num}
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-text">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed max-w-xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Channels() {
  const channels = [
    { name: "WhatsApp", color: "#25d366" },
    { name: "Telegram", color: "#229ed9" },
    { name: "Instagram", color: "#e4405f" },
    { name: "VK", color: "#4a76a8" },
    { name: "Avito", color: "#96c93d" },
    { name: "Email", color: "#ea4335" },
  ];

  return (
    <section className="py-24 border-t border-border bg-elevated/30">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="section-label mb-4">Каналы</p>
        <h2 className="heading-2 mb-16">Одна платформа — все каналы</h2>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          {channels.map((ch) => (
            <div key={ch.name} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
              <span className="text-lg font-medium text-text">{ch.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tariffs() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "навсегда",
      features: ["100 сообщений / мес", "1 канал", "Базовая аналитика", "Email поддержка"],
      cta: "Начать",
      href: "/register",
      highlight: false,
    },
    {
      name: "Pro",
      price: "2 900",
      period: "/ мес",
      features: ["Безлимитные сообщения", "3 канала", "Расширенная аналитика", "Приоритетная поддержка", "Интеграция с CRM"],
      cta: "Выбрать Pro",
      href: "/register",
      highlight: true,
    },
    {
      name: "Business",
      price: "9 900",
      period: "/ мес",
      features: ["Безлимитные сообщения", "Все каналы", "Полная аналитика", "Персональный менеджер", "API доступ", "White-label"],
      cta: "Связаться",
      href: "/register",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Тарифы</p>
          <h2 className="heading-2 max-w-xl mx-auto">
            Прозрачные цены, без скрытых платежей
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlight
                  ? "bg-text text-white border-text scale-[1.02] shadow-2xl shadow-black/10"
                  : "bg-white border-border hover:border-border-hover"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Популярный
                  </span>
                </div>
              )}
              <h3 className={`text-lg font-semibold mb-2 ${plan.highlight ? "text-white/70" : "text-muted"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-text"}`}>
                  {plan.price}
                </span>
                <span className={plan.highlight ? "text-white/50" : "text-muted"}>₽{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-accent" : "text-accent"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={plan.highlight ? "text-white/80" : "text-text-secondary"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-elevated text-text hover:bg-elevated-hover"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="heading-1 mb-6">Начните за 5 минут</h2>
        <p className="body-large mb-10">
          Бесплатный тариф без ограничений по времени. Подключите первый канал и увидите, как ИИ общается с вашими клиентами.
        </p>
        <Link href="/register" className="btn-primary text-lg px-10 py-4">
          Создать аккаунт бесплатно
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-muted">AI Chat Bot</span>
        <div className="flex gap-8">
          <a href="#" className="text-sm text-muted hover:text-text transition-colors">Политика конфиденциальности</a>
          <a href="#" className="text-sm text-muted hover:text-text transition-colors">Условия использования</a>
        </div>
        <span className="text-sm text-muted">2025</span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Channels />
      <Tariffs />
      <CTA />
      <Footer />
    </>
  );
}
