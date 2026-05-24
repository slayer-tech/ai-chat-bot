"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect, useState, useRef } from "react";

/* ─── UTILS ─── */
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

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ─── NAV ─── */
function Nav() {
  const scrolled = useScrolled();
  const { token } = useAuth();

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3"
          : "py-5"
      }`}
    >
      <div
        className={`mx-auto max-w-fit flex items-center gap-1 px-2 py-2 transition-all duration-500 ${
          scrolled
            ? "glass rounded-full"
            : "bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="px-5 py-2 text-sm font-bold tracking-tight text-text"
        >
          Relay
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-4 py-2 text-sm text-muted hover:text-text transition-colors duration-200">
            Продукт
          </a>
          <a href="#pricing" className="px-4 py-2 text-sm text-muted hover:text-text transition-colors duration-200">
            Тарифы
          </a>
          <a href="#how" className="px-4 py-2 text-sm text-muted hover:text-text transition-colors duration-200">
            Как работает
          </a>
        </div>
        <div className="pl-2 border-l border-white/[0.06]">
          {token ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
              Кабинет
            </Link>
          ) : (
            <Link href="/register" className="btn-primary text-sm py-2 px-5">
              Начать
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-32 pb-24"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,107,91,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,107,91,0.04),transparent_50%)]" />

      {/* Mesh noise texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div
          className={`transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="eyebrow mb-8 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Для бизнеса любого масштаба
          </p>
        </div>

        <h1
          className={`heading-hero mb-8 transition-all duration-1000 delay-100 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          ИИ ведёт переговоры,{" "}
          <span className="text-accent">пока вы строите бизнес</span>
        </h1>

        <p
          className={`body-large max-w-2xl mx-auto mb-12 transition-all duration-1000 delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Подключите к WhatsApp, Telegram, Instagram. ИИ отвечает клиентам круглосуточно, 
          записывает на приём, собирает контакты — а вы занимаетесь ростом.
        </p>

        <div
          className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-300 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link href="/register" className="btn-primary">
            Попробовать бесплатно
            <span className="ml-1 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
              →
            </span>
          </Link>
          <a href="#how" className="btn-secondary">
            Посмотреть, как работает
          </a>
        </div>

        {/* Trust micro-line */}
        <p
          className={`mt-8 text-xs text-muted transition-all duration-1000 delay-500 ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          Без карты. Настройка за 3 минуты.
        </p>
      </div>
    </section>
  );
}

/* ─── TRUST BAR ─── */
function TrustBar() {
  const channels = [
    { name: "WhatsApp", color: "#25d366" },
    { name: "Telegram", color: "#229ed9" },
    { name: "Instagram", color: "#e4405f" },
    { name: "VK", color: "#4a76a8" },
    { name: "Avito", color: "#96c93d" },
    { name: "Email", color: "#ea4335" },
  ];

  const row = (
    <>
      {channels.map((ch) => (
        <div key={ch.name} className="flex items-center gap-3 px-8">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
          <span className="text-base font-medium text-text-secondary whitespace-nowrap">
            {ch.name}
          </span>
        </div>
      ))}
    </>
  );

  return (
    <section className="py-16 border-y border-border overflow-hidden">
      <div className="flex animate-marquee">
        {row}
        {row}
      </div>
    </section>
  );
}

/* ─── BENTO FEATURES ─── */
function FeaturesBento() {
  const { ref, inView } = useInView<HTMLElement>();

  const cards = [
    {
      span: "md:col-span-2 md:row-span-2",
      title: "Отвечает вместо вас",
      body: "Подключите к любому каналу. ИИ мгновенно отвечает на вопросы 24/7. Клиенты не ждут — они получают ответ сразу.",
      metric: "0",
      metricLabel: "минут ожидания",
    },
    {
      span: "md:col-span-1 md:row-span-1",
      title: "Учится на ваших данных",
      body: "Загрузите прайс-листы, FAQ, инструкции. Ассистент отвечает в вашем стиле.",
    },
    {
      span: "md:col-span-1 md:row-span-1",
      title: "Конвертирует в лиды",
      body: "Записывает на приём, собирает телефоны, передаёт горячих клиентов в CRM.",
    },
    {
      span: "md:col-span-1 md:row-span-1",
      title: "Аналитика диалогов",
      body: "Смотрите, что спрашивают клиенты. Находите слабые места в продажах.",
    },
    {
      span: "md:col-span-2 md:row-span-1",
      title: "Масштабируется под вас",
      body: "От соло-предпринимателя до сети из 20 точек. Один аккаунт — все каналы.",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-32 md:py-48 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className={`mb-20 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="eyebrow mb-4">Возможности</p>
          <h2 className="heading-section max-w-2xl">
            Всё для автоматизации общения с клиентами
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px] grid-flow-dense">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`${card.span} transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <div className="card-shell h-full">
                <div className="card-core h-full p-8 flex flex-col justify-between group hover:bg-elevated-hover transition-colors duration-500">
                  <div>
                    <h3 className="text-xl font-semibold text-text mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                  {card.metric && (
                    <div className="mt-6">
                      <span className="text-5xl font-bold text-accent tracking-tight">
                        {card.metric}
                      </span>
                      <p className="text-xs text-muted mt-1">{card.metricLabel}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const { ref, inView } = useInView<HTMLElement>();

  const steps = [
    {
      num: "01",
      title: "Подключите канал",
      desc: "WhatsApp, Telegram, Instagram, VK — выберите, где общаетесь с клиентами. Интеграция занимает две минуты.",
    },
    {
      num: "02",
      title: "Загрузите знания",
      desc: "Прайс-листы, услуги, расписание, ответы на частые вопросы. ИИ выучит ваш бизнес.",
    },
    {
      num: "03",
      title: "ИИ работает за вас",
      desc: "Отвечает клиентам, записывает на приём, передаёт сложные случаи вам. Круглосуточно.",
    },
  ];

  return (
    <section id="how" ref={ref} className="py-32 md:py-48 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div
            className={`transition-all duration-1000 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="eyebrow mb-4">Как это работает</p>
            <h2 className="heading-section mb-8">
              Настройка за три минуты
            </h2>
            <p className="body-large">
              Не нужно разбираться в коде. Не нужно ждать неделю. 
              Подключите канал — и ИИ уже отвечает первым клиентам.
            </p>
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`py-10 border-t border-border group hover:bg-white/[0.01] transition-all duration-500 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className="flex gap-8">
                  <span className="text-4xl font-bold text-border group-hover:text-accent/20 transition-colors duration-500 shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function PricingSection() {
  const { ref, inView } = useInView<HTMLElement>();

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
      features: ["Безлимитные сообщения", "3 канала", "CRM-интеграция", "Приоритетная поддержка", "Расширенная аналитика"],
      cta: "Выбрать Pro",
      href: "/register",
      highlight: true,
    },
    {
      name: "Business",
      price: "9 900",
      period: "/ мес",
      features: ["Безлимитные сообщения", "Все каналы", "API доступ", "White-label", "Персональный менеджер"],
      cta: "Связаться",
      href: "/register",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-32 md:py-48 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="eyebrow mb-4 justify-center">Тарифы</p>
          <h2 className="heading-section max-w-xl mx-auto">
            Прозрачные цены, без скрытых платежей
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <div
                className={`card-shell h-full ${plan.highlight ? "ring-1 ring-accent/20" : ""}`}
              >
                <div
                  className={`card-core h-full p-8 flex flex-col ${
                    plan.highlight ? "bg-accent-soft/5" : ""
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      Популярный
                    </span>
                  )}
                  <p className="text-sm text-muted mb-1">{plan.name}</p>
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
                    href={plan.href}
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
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} className="py-32 md:py-48 px-6 border-t border-border">
      <div
        className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="heading-section mb-6">
          Начните за три минуты
        </h2>
        <p className="body-large mb-10">
          Бесплатный тариф без ограничений по времени. Подключите первый канал и увидите, 
          как ИИ общается с вашими клиентами.
        </p>
        <Link href="/register" className="btn-primary text-lg px-10 py-4">
          Создать аккаунт
          <span className="ml-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
            →
          </span>
        </Link>
        <p className="mt-6 text-xs text-muted">Без карты. Без обязательств.</p>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <span className="text-lg font-bold tracking-tight text-text">Relay</span>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              ИИ-ассистент, который ведёт переговоры за вас.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Продукт</p>
            <div className="space-y-3">
              <a href="#features" className="block text-sm text-text-secondary hover:text-text transition-colors">Возможности</a>
              <a href="#pricing" className="block text-sm text-text-secondary hover:text-text transition-colors">Тарифы</a>
              <a href="#how" className="block text-sm text-text-secondary hover:text-text transition-colors">Как работает</a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Компания</p>
            <div className="space-y-3">
              <span className="block text-sm text-muted">О нас</span>
              <span className="block text-sm text-muted">Контакты</span>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Правовое</p>
            <div className="space-y-3">
              <span className="block text-sm text-muted">Политика конфиденциальности</span>
              <span className="block text-sm text-muted">Условия использования</span>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted">Relay, 2025</span>
          <span className="text-xs text-muted">Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function Home() {
  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <Nav />
      <Hero />
      <TrustBar />
      <FeaturesBento />
      <HowItWorks />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
