import Link from "next/link";

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const channels = ["WhatsApp", "Telegram", "Instagram", "VK", "Avito"];

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-void/60 backdrop-blur-2xl">
        <div className="max-w-content mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-[15px] font-semibold tracking-tight text-text">
              AI Chat Bot
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted hover:text-text transition-colors duration-200">Возможности</a>
              <a href="#tariffs" className="text-sm text-muted hover:text-text transition-colors duration-200">Тарифы</a>
              <Link href="/login" className="text-sm text-muted hover:text-text transition-colors duration-200">Войти</Link>
              <Link href="/register" className="bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — left aligned, massive type */}
      <section className="pt-36 pb-40 md:pt-52 md:pb-52 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tight leading-[1.05] text-text max-w-4xl">
            ИИ-ассистент для продаж
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mt-8 mb-10 leading-relaxed">
            Отвечает клиентам в WhatsApp, Telegram, Instagram, VK и Avito. 
            Менее секунды на ответ. Интеграция с CRM. Работает 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn-primary">
              Начать бесплатно
            </Link>
            <a href="#features" className="btn-secondary">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Features — full width sections, no cards */}
      <section id="features" className="py-40 md:py-52 px-6 bg-surface">
        <div className="max-w-content mx-auto">
          <div className="mb-32">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text max-w-2xl">
              Автоматизация от первого сообщения до сделки
            </h2>
          </div>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-32">
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                Диалоги как у человека
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Естественные разговоры на русском. Понимает контекст, помнит историю диалога, 
                отвечает по базе знаний. Клиент не отличит от менеджера.
              </p>
            </div>
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                База знаний
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Загружайте документы, прайсы, инструкции. Бот отвечает только по вашим материалам. 
                Без галлюцинаций и выдумок.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-32">
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                Авто-дожим
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Автоматические напоминания клиентам с настраиваемым таймингом. 
                Увеличивает конверсию на 40%.
              </p>
            </div>
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                Передача менеджеру
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Умная эскалация по агрессии, запросу или неуверенности ИИ. 
                Ни один важный клиент не потеряется.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                Защита от спама
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Настраиваемые лимиты и автоматическая блокировка флуда, 
                матов и токсичности. Соответствие 152-ФЗ.
              </p>
            </div>
            <div className="pt-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-5 tracking-tight">
                CRM и аналитика
              </h3>
              <p className="text-[17px] text-muted leading-relaxed max-w-md">
                Интеграция с amoCRM и Битрикс24. Полная статистика 
                по диалогам, конверсии и эффективности.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Channels — simple text row */}
      <section className="py-40 md:py-52 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6">
            Все каналы
          </h2>
          <p className="text-lg text-muted max-w-lg mb-16 leading-relaxed">
            Единый интерфейс для всех мессенджеров и площадок
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {channels.map((ch) => (
              <span key={ch} className="text-xl md:text-2xl font-medium text-muted">
                {ch}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs — horizontal list, not cards */}
      <section id="tariffs" className="py-40 md:py-52 px-6 bg-surface">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6">
            Тарифы
          </h2>
          <p className="text-lg text-muted max-w-lg mb-20 leading-relaxed">
            7 дней бесплатно на любом тарифе
          </p>

          <div className="space-y-6">
            {/* Business — highlighted */}
            <div className="bg-elevated rounded-3xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-semibold text-text">Бизнес</h3>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">Рекомендуем</span>
                  </div>
                  <p className="text-muted mb-4">2 000 сообщений в месяц. Все каналы, CRM, авто-дожим, умная передача.</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                    <span>Все каналы + Avito</span>
                    <span>RAG + CRM</span>
                    <span>Авто-дожим</span>
                    <span>Приоритетная поддержка</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-text">5 900 ₽</div>
                    <div className="text-sm text-muted">/ мес</div>
                  </div>
                  <Link href="/register?plan=business" className="btn-primary whitespace-nowrap">
                    Выбрать
                  </Link>
                </div>
              </div>
            </div>

            {/* Start */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-6 border-t border-subtle">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text mb-2">Старт</h3>
                <p className="text-muted text-sm">500 сообщений. WhatsApp, Telegram, VK. База знаний.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-2xl font-semibold text-text">2 900 ₽</div>
                <Link href="/register?plan=start" className="text-accent font-medium hover:text-accent-hover transition-colors">
                  Выбрать <ArrowIcon />
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-6 border-t border-subtle">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text mb-2">Про</h3>
                <p className="text-muted text-sm">5 000 сообщений. Голос, API, кастомный prompt, личный менеджер.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-2xl font-semibold text-text">11 900 ₽</div>
                <Link href="/register?plan=pro" className="text-accent font-medium hover:text-accent-hover transition-colors">
                  Выбрать <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 md:py-52 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6 max-w-2xl">
            Готовы начать?
          </h2>
          <p className="text-lg text-muted mb-10 max-w-lg leading-relaxed">
            Настройка занимает 2 минуты. Первые 7 дней бесплатно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
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
      <footer className="py-10 px-6 bg-surface">
        <div className="max-w-content mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
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
