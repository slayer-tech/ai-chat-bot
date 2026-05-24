import Link from "next/link";

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
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

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-void/70 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-base font-semibold tracking-tight text-text">
              AI Chat Bot
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted hover:text-text transition-colors duration-200">Возможности</a>
              <a href="#tariffs" className="text-sm text-muted hover:text-text transition-colors duration-200">Тарифы</a>
              <Link href="/login" className="text-sm text-muted hover:text-text transition-colors duration-200">Войти</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-5">
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-36 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.08] text-text mb-7">
            Автоматизируйте
            <br />
            продажи
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            ИИ-ассистент для WhatsApp, Telegram, Instagram, VK и Avito. 
            Отвечает клиентам мгновенно, интегрируется с CRM, работает 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary">
              Начать бесплатно
            </Link>
            <a href="#features" className="btn-secondary">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface rounded-3xl p-6 md:p-10">
            {/* Chat UI mock */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 pb-5 mb-5">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">AI Ассистент</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted">Онлайн</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-elevated flex-shrink-0 mt-0.5" />
                  <div className="bg-elevated rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-muted max-w-[240px]">
                    Здравствуйте! Интересует стоимость доставки в Москву?
                  </div>
                </div>
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-accent/15 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-text max-w-[240px]">
                    Добрый день! Доставка в Москву бесплатная при заказе от 3000 ₽. Стоимость заказа?
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-elevated flex-shrink-0 mt-0.5" />
                  <div className="bg-elevated rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-muted max-w-[240px]">
                    У меня 4500 ₽. Когда привезёте?
                  </div>
                </div>
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-accent/15 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-text max-w-[260px]">
                    Отлично! Оформляю заказ. Доставка завтра с 10:00 до 14:00. Подтвердите адрес?
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-subtle">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-elevated rounded-full">
                  <span className="text-sm text-muted flex-1">Введите сообщение...</span>
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-5">
              Всё, что нужно для продаж
            </h2>
            <p className="text-lg text-muted max-w-lg leading-relaxed">
              Полный цикл автоматизации от первого сообщения до сделки в CRM
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-24">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-4 tracking-tight">
                ИИ-диалоги на уровне человека
              </h3>
              <p className="text-base text-muted leading-relaxed mb-6">
                Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний. 
                Клиент не отличит бота от менеджера.
              </p>
              <p className="text-base text-muted leading-relaxed">
                RAG-база знаний позволяет загружать документы, прайсы и инструкции. 
                Бот отвечает только по вашим материалам, без галлюцинаций.
              </p>
            </div>
            <div className="bg-elevated rounded-3xl p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Понимание контекста диалога</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Ответы по загруженным документам</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Кастомный tone of voice</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Мгновенные ответы 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-24">
            <div className="order-2 md:order-1 bg-elevated rounded-3xl p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Автоматические напоминания</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Умная передача менеджеру по триггерам</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Защита от флуда и спама</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Интеграция с amoCRM и Битрикс24</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-4 tracking-tight">
                Авто-дожим и эскалация
              </h3>
              <p className="text-base text-muted leading-relaxed mb-6">
                Автоматические напоминания клиентам с настраиваемым таймингом. 
                Увеличивает конверсию на 40%.
              </p>
              <p className="text-base text-muted leading-relaxed">
                Умная передача менеджеру по агрессии, запросу или неуверенности ИИ. 
                Ни один важный клиент не потеряется.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-text mb-4 tracking-tight">
                Безопасность и аналитика
              </h3>
              <p className="text-base text-muted leading-relaxed mb-6">
                Защита от флуда, матов и токсичности. Настраиваемые лимиты и автоматическая блокировка.
              </p>
              <p className="text-base text-muted leading-relaxed">
                Полная статистика по диалогам, конверсии и эффективности. Интеграция с amoCRM и Битрикс24.
              </p>
            </div>
            <div className="bg-elevated rounded-3xl p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Защита от спама и флуда</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Соответствие 152-ФЗ</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Детальная аналитика по каналам</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-muted">Экспорт отчётов</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-5">
            Все каналы
          </h2>
          <p className="text-lg text-muted max-w-lg mx-auto mb-16 leading-relaxed">
            Подключайте любые мессенджеры и площадки. Единый интерфейс для всех диалогов.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {channels.map((ch) => (
              <span key={ch} className="text-lg md:text-xl font-medium text-muted px-6 py-3">
                {ch}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section id="tariffs" className="py-32 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-5">
              Тарифы
            </h2>
            <p className="text-lg text-muted max-w-lg mx-auto leading-relaxed">
              7 дней бесплатно на любом тарифе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Start */}
            <div className="pt-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-text mb-1">Старт</h3>
                <p className="text-sm text-muted">500 сообщений / мес</p>
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-semibold text-text tracking-tight">2 900</span>
                <span className="ml-2 text-base text-muted">₽/мес</span>
              </div>
              <ul className="space-y-4 mb-10">
                {["WhatsApp, Telegram, VK", "RAG-база знаний", "Базовая аналитика", "Email поддержка"].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=start" className="block text-center w-full py-3 rounded-full text-base font-semibold bg-elevated text-text hover:bg-elevated-hover transition-colors duration-200">
                Выбрать
              </Link>
            </div>

            {/* Business - highlighted */}
            <div className="bg-elevated rounded-3xl p-8">
              <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-6">
                Популярный
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-text mb-1">Бизнес</h3>
                <p className="text-sm text-muted">2 000 сообщений / мес</p>
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-semibold text-text tracking-tight">5 900</span>
                <span className="ml-2 text-base text-muted">₽/мес</span>
              </div>
              <ul className="space-y-4 mb-10">
                {["Все каналы + Avito", "RAG + CRM интеграция", "Авто-дожим", "Умная передача менеджеру", "Приоритетная поддержка"].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=business" className="block text-center w-full py-3 rounded-full text-base font-semibold bg-accent text-white hover:bg-accent-hover transition-colors duration-200">
                Выбрать
              </Link>
            </div>

            {/* Pro */}
            <div className="pt-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-text mb-1">Про</h3>
                <p className="text-sm text-muted">5 000 сообщений / мес</p>
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-semibold text-text tracking-tight">11 900</span>
                <span className="ml-2 text-base text-muted">₽/мес</span>
              </div>
              <ul className="space-y-4 mb-10">
                {["Все функции Бизнеса", "Распознавание голоса", "Кастомный system prompt", "API доступ", "Личный менеджер"].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=pro" className="block text-center w-full py-3 rounded-full text-base font-semibold bg-elevated text-text hover:bg-elevated-hover transition-colors duration-200">
                Выбрать
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6">
            Готовы начать?
          </h2>
          <p className="text-lg text-muted mb-10 leading-relaxed">
            Настройка занимает 2 минуты. Первые 7 дней бесплатно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-base font-semibold text-text">
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
