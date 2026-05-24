import Link from "next/link";

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

const channels = ["WhatsApp", "Telegram", "Instagram", "VK", "Avito"];

const features = [
  {
    title: "ИИ-диалоги",
    desc: "Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний. Клиент не отличит бота от человека.",
  },
  {
    title: "RAG-база знаний",
    desc: "Загружайте документы, прайсы, инструкции. Бот отвечает только по вашим материалам — без галлюцинаций.",
  },
  {
    title: "Авто-дожим",
    desc: "Автоматические напоминания клиентам. Настраиваемое время, timezone, тексты. Увеличивает конверсию на 40%.",
  },
  {
    title: "Передача менеджеру",
    desc: "Умная эскалация: по агрессии, по запросу, по неуверенности ИИ. Ни один важный клиент не потеряется.",
  },
  {
    title: "Анти-спам",
    desc: "Защита от флуда, матов и токсичности. Настраиваемые лимиты и автоматическая блокировка нарушителей.",
  },
  {
    title: "CRM + Аналитика",
    desc: "Интеграция с amoCRM и Битрикс24. Полная статистика по диалогам, конверсии и эффективности.",
  },
];

const plans = [
  {
    name: "Старт",
    price: "2 900",
    period: "₽/мес",
    messages: "500 сообщений",
    features: ["WhatsApp, Telegram, VK", "RAG-база знаний", "Базовая аналитика", "Email поддержка"],
    highlight: false,
  },
  {
    name: "Бизнес",
    price: "5 900",
    period: "₽/мес",
    messages: "2 000 сообщений",
    features: ["Все каналы + Avito", "RAG + CRM интеграция", "Авто-дожим", "Умная передача менеджеру", "Приоритетная поддержка"],
    highlight: true,
  },
  {
    name: "Про",
    price: "11 900",
    period: "₽/мес",
    messages: "5 000 сообщений",
    features: ["Все функции Бизнеса", "Распознавание голоса", "Кастомный system prompt", "API доступ", "Личный менеджер"],
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-void/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="text-[17px] font-semibold tracking-tight text-text">
              AI Chat Bot
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted hover:text-text transition-colors duration-200">Возможности</a>
              <a href="#tariffs" className="text-sm text-muted hover:text-text transition-colors duration-200">Тарифы</a>
              <Link href="/login" className="text-sm text-muted hover:text-text transition-colors duration-200">Войти</Link>
              <Link href="/register" className="bg-accent text-void text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-hover transition-colors duration-200">
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 md:pt-44 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-semibold tracking-tight leading-[1.1] text-text mb-6">
            Автоматизируйте
            <br />
            продажи в мессенджерах
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
            ИИ-ассистент, который отвечает клиентам круглосуточно.
            Интеграция с CRM, база знаний, авто-дожим и умная передача менеджеру.
          </p>
          <p className="text-sm text-muted mb-10">
            Поддержка: {channels.join(", ")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              Начать бесплатно
            </Link>
            <a href="#features" className="btn-secondary">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {[
              { value: "24/7", label: "Работа бота" },
              { value: "< 1 сек", label: "Скорость ответа" },
              { value: "6+", label: "Каналов" },
              { value: "152-ФЗ", label: "Соответствие" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[32px] md:text-[40px] font-semibold text-text tracking-tight">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 md:mb-28">
            <h2 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-text mb-4">
              Всё, что нужно для продаж
            </h2>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Полный цикл автоматизации от первого сообщения до сделки в CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
            {features.map((f, i) => (
              <div key={f.title} className="group">
                <h3 className="text-xl md:text-2xl font-semibold text-text mb-3 tracking-tight">{f.title}</h3>
                <p className="text-[17px] text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-20 md:py-28 px-6 bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-text mb-4">
            Все каналы в одном месте
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto mb-16">
            Подключайте любые мессенджеры и площадки. Единый интерфейс для всех диалогов.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {channels.map((ch) => (
              <div key={ch} className="flex items-center gap-3 px-6 py-3 bg-elevated rounded-full">
                <span className="text-[17px] font-medium text-text">{ch}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section id="tariffs" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 md:mb-28">
            <h2 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-text mb-4">
              Прозрачные тарифы
            </h2>
            <p className="text-lg text-muted max-w-xl mx-auto">
              7 дней бесплатно на любом тарифе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 ${
                  plan.highlight
                    ? "bg-elevated"
                    : "bg-surface"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-text mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted">{plan.messages}</p>
                </div>
                <div className="flex items-baseline mb-8">
                  <span className="text-[48px] font-semibold text-text tracking-tight">{plan.price}</span>
                  <span className="ml-2 text-lg text-muted">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-[15px] text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center w-full py-3 rounded-full text-[17px] font-semibold transition-colors duration-200 ${
                    plan.highlight
                      ? "bg-accent text-void hover:bg-accent-hover"
                      : "bg-elevated text-text hover:bg-void border border-subtle"
                  }`}
                >
                  Выбрать тариф
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-text mb-5">
            Готовы автоматизировать продажи?
          </h2>
          <p className="text-lg text-muted mb-10 max-w-lg mx-auto">
            Начните бесплатно за 2 минуты. Настройка не требует программирования.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              Начать бесплатно
              <ArrowIcon />
            </Link>
            <a href="https://t.me/your_support" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Написать в поддержку
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[15px] font-semibold text-text">
            AI Chat Bot
          </span>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-muted hover:text-text transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-sm text-muted hover:text-text transition-colors">Условия использования</a>
          </div>
          <span className="text-xs text-muted">© 2026</span>
        </div>
      </footer>
    </main>
  );
}
