import Link from "next/link";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

const features = [
  { icon: BrainIcon, title: "ИИ-диалоги", desc: "Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний.", span: "col-span-1" },
  { icon: BookIcon, title: "RAG-база знаний", desc: "Загружайте документы, прайсы, инструкции. Бот отвечает по вашим материалам.", span: "col-span-1" },
  { icon: BellIcon, title: "Авто-дожим", desc: "Автоматические напоминания клиентам с настраиваемым таймингом.", span: "col-span-1" },
  { icon: UsersIcon, title: "Передача менеджеру", desc: "Умная эскалация по агрессии, запросу или неуверенности ИИ.", span: "col-span-1" },
  { icon: ShieldIcon, title: "Анти-спам", desc: "Защита от флуда и токсичности. Настраиваемые лимиты.", span: "col-span-1" },
  { icon: ChartIcon, title: "CRM + Аналитика", desc: "Интеграция с amoCRM и Битрикс24. Полная статистика по диалогам.", span: "col-span-1" },
];

const plans = [
  {
    name: "Старт",
    price: "2 900",
    desc: "Для старта автоматизации",
    features: ["500 сообщений/мес", "WhatsApp + Telegram", "RAG-база знаний", "Базовая аналитика", "Email поддержка"],
    highlight: false,
  },
  {
    name: "Бизнес",
    price: "5 900",
    desc: "Для растущего бизнеса",
    features: ["2000 сообщений/мес", "Все каналы", "RAG + CRM", "Авто-дожим", "Умная передача", "Приоритетная поддержка"],
    highlight: true,
  },
  {
    name: "Про",
    price: "11 900",
    desc: "Для максимальных результатов",
    features: ["5000 сообщений/мес", "Все функции Бизнеса", "Распознавание голоса", "Кастомный prompt", "API доступ", "Личный менеджер"],
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-void text-frost-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-void/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-lg font-bold tracking-tight text-frost-100">
              AI Chat Bot
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-void-400 hover:text-frost-100 transition-colors duration-300">
                Возможности
              </a>
              <a href="#tariffs" className="text-sm font-medium text-void-400 hover:text-frost-100 transition-colors duration-300">
                Тарифы
              </a>
              <Link href="/login" className="text-sm font-medium text-void-400 hover:text-frost-100 transition-colors duration-300">
                Войти
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2.5 px-6">
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 noise-overlay">
        {/* Aurora background */}
        <div className="absolute inset-0 bg-aurora opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
        
        {/* Orb glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-electric/20 rounded-full blur-[128px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-mint/10 rounded-full blur-[96px] animate-glow-pulse animation-delay-2000" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card mb-10 opacity-0 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span className="text-sm font-medium text-frost-200">7 дней бесплатно — без карты</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
            <span className="opacity-0 animate-fade-up animation-delay-100 inline-block">Автоматизируйте</span>{" "}
            <br className="hidden sm:block" />
            <span className="opacity-0 animate-fade-up animation-delay-200 inline-block text-gradient-electric">продажи</span>{" "}
            <span className="opacity-0 animate-fade-up animation-delay-300 inline-block">в мессенджерах</span>
          </h1>

          <p className="text-lg md:text-xl text-void-400 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-up animation-delay-400">
            ИИ-ассистент, который отвечает клиентам в WhatsApp и Telegram 24/7. 
            Интеграция с CRM, база знаний, авто-дожим и умная передача менеджеру.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up animation-delay-500">
            <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base">
              <ZapIcon className="w-5 h-5" />
              Начать бесплатно
            </Link>
            <a href="#features" className="btn-secondary inline-flex items-center justify-center gap-2 text-base">
              Узнать больше
            </a>
          </div>

          {/* Floating preview cards */}
          <div className="mt-24 relative max-w-4xl mx-auto opacity-0 animate-fade-up animation-delay-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-electric" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-frost-200">WhatsApp</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-void-800 flex-shrink-0 mt-0.5" />
                    <div className="bg-void-800/60 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-frost-300 max-w-[180px]">
                      Здравствуйте! Интересует стоимость доставки?
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-electric/20 rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-frost-200 max-w-[180px]">
                      Да, конечно! Куда нужна доставка?
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 animate-float-delayed md:mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-frost-200">Аналитика</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-void-400">
                    <span>Диалоги</span>
                    <span className="text-frost-200 font-medium">1,247</span>
                  </div>
                  <div className="h-1.5 bg-void-800 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-electric rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-void-400">
                    <span>Конверсия</span>
                    <span className="text-mint font-medium">+24%</span>
                  </div>
                  <div className="h-1.5 bg-void-800 rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-mint rounded-full" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 animate-float-slow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-rose" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-frost-200">Безопасность</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  <span className="text-xs text-mint font-medium">Защита активна</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-void-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-frost-100">0</div>
                    <div className="text-[10px] text-void-400 uppercase tracking-wider">Спам</div>
                  </div>
                  <div className="bg-void-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-frost-100">99.9%</div>
                    <div className="text-[10px] text-void-400 uppercase tracking-wider">Аптайм</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/[0.04] bg-void-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "24/7", label: "Работа бота" },
              { value: "<1с", label: "Скорость ответа" },
              { value: "100%", label: "Автоматизация" },
              { value: "152-ФЗ", label: "Соответствие" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-frost-100 mb-1">{stat.value}</div>
                <div className="text-xs text-void-500 uppercase tracking-widest font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-aurora opacity-30" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Всё, что нужно{" "}
              <span className="text-gradient-electric">для продаж</span>
            </h2>
            <p className="text-lg text-void-400 max-w-xl mx-auto">
              Полный цикл автоматизации от первого сообщения до сделки в CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group glass-card-hover p-7"
              >
                <div className="w-11 h-11 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center text-electric mb-5 group-hover:scale-110 transition-transform duration-500 ease-premium">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-frost-100 mb-2">{f.title}</h3>
                <p className="text-sm text-void-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-6xl mx-auto" />

      {/* Tariffs */}
      <section id="tariffs" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-aurora opacity-20" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Прозрачные{" "}
              <span className="text-gradient-electric">тарифы</span>
            </h2>
            <p className="text-lg text-void-400 max-w-xl mx-auto">
              7 дней бесплатно на любом тарифе. Без привязки карты.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 transition-all duration-500 ease-premium ${
                  plan.highlight
                    ? "bg-gradient-to-b from-void-800 to-void-900 border border-electric/20 shadow-glow-electric-sm"
                    : "glass-card-hover"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-electric text-void text-xs font-bold rounded-full">
                    Популярный
                  </div>
                )}
                <h3 className="text-lg font-semibold text-frost-100 mb-1">{plan.name}</h3>
                <p className="text-sm text-void-500 mb-5">{plan.desc}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-frost-100">{plan.price}</span>
                  <span className="ml-2 text-sm text-void-500">₽/мес</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-electric" : "text-void-500"}`} />
                      <span className="text-sm text-void-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    plan.highlight
                      ? "bg-electric text-void hover:shadow-glow-electric-sm hover:scale-[1.02]"
                      : "bg-void-800 text-frost-200 hover:bg-void-700 border border-void-700"
                  }`}
                >
                  Выбрать тариф
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora-strong" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric/10 rounded-full blur-[120px]" />
        
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Готовы автоматизировать{" "}
            <span className="text-gradient-electric">продажи?</span>
          </h2>
          <p className="text-lg text-void-400 mb-10">
            Начните бесплатно за 2 минуты. Настройка не требует программирования.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base">
              Начать бесплатно
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a href="https://t.me/your_support" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center justify-center gap-2 text-base">
              Написать в поддержку
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm font-semibold text-frost-100">
            AI Chat Bot
          </span>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-void-500 hover:text-frost-200 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-sm text-void-500 hover:text-frost-200 transition-colors">Условия использования</a>
          </div>
          <span className="text-xs text-void-600">© 2026</span>
        </div>
      </footer>
    </main>
  );
}
