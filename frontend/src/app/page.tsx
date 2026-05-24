import Link from "next/link";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    ai: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    rag: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    followup: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
      </svg>
    ),
    handoff: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    shield: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    crm: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  };
  return icons[type] || icons.ai;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-xl border-b border-ink-quaternary/30 z-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="text-lg font-semibold text-ink tracking-tight">
              AI Chat Bot
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-200">
                Возможности
              </a>
              <a href="#tariffs" className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-200">
                Тарифы
              </a>
              <Link href="/login" className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-200">
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-600 transition-all duration-200 hover:shadow-soft"
              >
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 gradient-mesh">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-semibold tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            7 дней бесплатно — без карты
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-ink tracking-tight mb-6 leading-[1.1]">
            Автоматизируйте продажи
            <br />
            <span className="text-primary">в мессенджерах</span>
          </h1>
          <p className="text-lg text-ink-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            ИИ-ассистент, который отвечает клиентам в WhatsApp и Telegram круглосуточно.
            Интеграция с CRM, база знаний, авто-дожим и умная передача менеджеру.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-primary text-white px-8 py-3 rounded-full font-medium text-base hover:bg-primary-600 transition-all duration-200 hover:shadow-soft"
            >
              Начать бесплатно
            </Link>
            <a
              href="#features"
              className="bg-surface-secondary text-ink px-8 py-3 rounded-full font-medium text-base border border-ink-quaternary/50 hover:bg-surface-tertiary transition-all duration-200"
            >
              Узнать больше
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "24/7", label: "Ответы клиентам" },
              { value: "<1с", label: "Скорость ответа" },
              { value: "100%", label: "Автоматизация" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-ink mb-1">{stat.value}</div>
                <div className="text-xs text-ink-tertiary font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink mb-4 tracking-tight">
              Всё, что нужно для продаж
            </h2>
            <p className="text-base text-ink-secondary max-w-lg mx-auto leading-relaxed">
              Полный цикл автоматизации: от первого сообщения до сделки в CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "ai", title: "ИИ-диалоги", desc: "Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний." },
              { icon: "rag", title: "RAG-база знаний", desc: "Загружайте документы, прайсы, инструкции. Бот отвечает по вашим материалам." },
              { icon: "followup", title: "Авто-дожим", desc: "Автоматические напоминания клиентам. Настраиваемое время, timezone, тексты." },
              { icon: "handoff", title: "Передача менеджеру", desc: "Умная эскалация: по агрессии, по запросу, по неуверенности ИИ." },
              { icon: "shield", title: "Анти-спам", desc: "Защита от флуда и матов. Настраиваемые лимиты и автоматическая блокировка." },
              { icon: "crm", title: "CRM + Аналитика", desc: "Интеграция с amoCRM и Битрикс24. Полная статистика по диалогам и конверсии." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-surface-secondary border border-transparent hover:border-ink-quaternary/40 transition-all duration-200 hover:shadow-micro"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-4">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3 className="text-base font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section id="tariffs" className="py-24 px-6 bg-surface-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink mb-4 tracking-tight">
              Прозрачные тарифы
            </h2>
            <p className="text-base text-ink-secondary max-w-lg mx-auto leading-relaxed">
              7 дней бесплатно на любом тарифе. Без привязки карты.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                name: "Старт",
                price: "2 900",
                features: [
                  "500 сообщений/мес",
                  "WhatsApp + Telegram",
                  "RAG-база знаний",
                  "Базовая аналитика",
                  "Email поддержка",
                ],
                popular: false,
              },
              {
                name: "Бизнес",
                price: "5 900",
                features: [
                  "2000 сообщений/мес",
                  "Все каналы",
                  "RAG + CRM интеграция",
                  "Авто-дожим",
                  "Умная передача менеджеру",
                  "Приоритетная поддержка",
                ],
                popular: true,
              },
              {
                name: "Про",
                price: "11 900",
                features: [
                  "5000 сообщений/мес",
                  "Все функции Бизнеса",
                  "Распознавание голоса",
                  "Кастомный system prompt",
                  "API доступ",
                  "Личный менеджер",
                ],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 transition-all duration-200 ${
                  plan.popular
                    ? "bg-ink text-white shadow-elevated ring-1 ring-ink"
                    : "bg-surface text-ink border border-ink-quaternary/40 hover:shadow-soft"
                }`}
              >
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className={`ml-1.5 text-sm ${plan.popular ? "text-white/60" : "text-ink-tertiary"}`}>
                    ₽/мес
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-white/70" : "text-primary"}`} />
                      <span className={`text-sm ${plan.popular ? "text-white/80" : "text-ink-secondary"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center w-full py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-white text-ink hover:bg-white/90"
                      : "bg-ink text-white hover:bg-ink/90"
                  }`}
                >
                  Выбрать тариф
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-ink-secondary mb-3">
              Нужна кастомная разработка ИИ-агента под ваши задачи?
            </p>
            <a
              href="https://t.me/your_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-700 transition-colors"
            >
              Обсудить индивидуальный проект
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-3 tracking-tight">
            Нужна помощь?
          </h2>
          <p className="text-sm text-ink-secondary mb-8">
            Наша команда на связи в Telegram и WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://t.me/your_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#0088cc] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </a>
            <a
              href="https://wa.me/79991234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25d366] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-ink-quaternary/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-ink-tertiary">
            © 2026 AI Chat Bot
          </span>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-ink-tertiary hover:text-ink-secondary transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-xs text-ink-tertiary hover:text-ink-secondary transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
