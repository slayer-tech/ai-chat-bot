import Link from "next/link";

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const channels = [
  { name: "WhatsApp", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  )},
  { name: "Telegram", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  )},
  { name: "Instagram", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
  )},
  { name: "VK", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.624 10.857 4 8.673 4 8.233c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.491 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z"/></svg>
  )},
  { name: "Avito", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { name: "MAX", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  )},
];

export default function Home() {
  return (
    <main className="min-h-screen bg-void overflow-x-hidden">
      {/* Navbar — liquid glass */}
      <nav className="fixed top-0 w-full z-50 liquid-glass">
        <div className="max-w-content mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-[15px] font-semibold tracking-tight text-text">
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

      {/* Hero — cinematic center */}
      <section className="relative pt-40 pb-32 md:pt-56 md:pb-44 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,106,247,0.12),transparent)]" />
        <div className="relative max-w-content mx-auto text-center">
          <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] font-semibold tracking-tighter leading-[1.05] text-text max-w-5xl mx-auto">
            ИИ-ассистент, который продаёт за вас
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mt-8 mb-10 leading-relaxed">
            WhatsApp, Telegram, Instagram, VK, Avito и MAX. Ответ за доли секунды. Интеграция с CRM. Работает 24/7.
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

      {/* Channels — infinite marquee */}
      <section className="py-10 border-y border-white/[0.04]">
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...channels, ...channels].map((ch, i) => (
              <div key={i} className="flex items-center gap-3 mx-8">
                <span className="text-muted">{ch.icon}</span>
                <span className="text-lg font-medium text-muted">{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — gapless bento grid */}
      <section id="features" className="py-32 md:py-48 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-16 max-w-2xl">
            Всё, что нужно для продаж
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid-flow-dense">
            {/* Large card — AI Dialogues */}
            <div className="bento-card md:col-span-2 md:row-span-2 group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02] h-full flex flex-col">
                <h3 className="text-2xl font-semibold text-text mb-3">ИИ-диалоги</h3>
                <p className="text-muted leading-relaxed mb-6 max-w-sm">
                  Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний. Клиент не отличит от менеджера.
                </p>
                <div className="mt-auto bg-void/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-elevated flex-shrink-0" />
                    <div className="bg-elevated rounded-xl rounded-tl-sm px-3 py-2 text-xs text-muted">Здравствуйте. Интересует доставка?</div>
                  </div>
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-accent/15 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-text">Добрый день. Да, бесплатная от 3000 ₽</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small — RAG */}
            <div className="bento-card group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">RAG-база знаний</h3>
                <p className="text-sm text-muted leading-relaxed">Загружайте документы, прайсы, инструкции. Без галлюцинаций.</p>
              </div>
            </div>

            {/* Small — Follow-up */}
            <div className="bento-card group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">Авто-дожим</h3>
                <p className="text-sm text-muted leading-relaxed">Автоматические напоминания. Конверсия +40%.</p>
              </div>
            </div>

            {/* Small — Handoff */}
            <div className="bento-card group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">Передача менеджеру</h3>
                <p className="text-sm text-muted leading-relaxed">Умная эскалация по триггерам. Ни один клиент не потеряется.</p>
              </div>
            </div>

            {/* Wide — CRM */}
            <div className="bento-card md:col-span-2 group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02] flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text mb-2">CRM и аналитика</h3>
                  <p className="text-muted leading-relaxed">amoCRM и Битрикс24. Полная статистика по диалогам и конверсии.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-void/60 rounded-xl px-4 py-3 text-center min-w-[80px]">
                    <div className="text-xl font-semibold text-text">1,247</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-1">Диалоги</div>
                  </div>
                  <div className="bg-void/60 rounded-xl px-4 py-3 text-center min-w-[80px]">
                    <div className="text-xl font-semibold text-accent">+24%</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-1">Конверсия</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tariffs — bento */}
      <section id="tariffs" className="py-32 md:py-48 px-6 bg-surface">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6">
            Тарифы
          </h2>
          <p className="text-lg text-muted max-w-lg mb-16 leading-relaxed">
            7 дней бесплатно на любом тарифе
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid-flow-dense">
            {/* Business — large */}
            <div className="bento-card md:col-span-2 md:row-span-2 group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02] h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-text">Бизнес</h3>
                  <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">Рекомендуем</span>
                </div>
                <p className="text-muted mb-2">2 000 сообщений в месяц</p>
                <div className="text-4xl font-semibold text-text mb-8">5 900 ₽<span className="text-lg text-muted font-normal">/мес</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Все каналы + Avito + MAX","RAG + CRM интеграция","Авто-дожим","Умная передача менеджеру","Приоритетная поддержка"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted">
                      <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=business" className="btn-primary w-full justify-center">
                  Выбрать Бизнес
                </Link>
              </div>
            </div>

            {/* Start */}
            <div className="bento-card group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <h3 className="text-xl font-semibold text-text mb-2">Старт</h3>
                <p className="text-muted text-sm mb-4">500 сообщений</p>
                <div className="text-3xl font-semibold text-text mb-6">2 900 ₽<span className="text-sm text-muted font-normal">/мес</span></div>
                <Link href="/register?plan=start" className="text-accent font-medium hover:text-accent-hover transition-colors text-sm">
                  Выбрать <ArrowIcon />
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="bento-card group">
              <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <h3 className="text-xl font-semibold text-text mb-2">Про</h3>
                <p className="text-muted text-sm mb-4">5 000 сообщений</p>
                <div className="text-3xl font-semibold text-text mb-6">11 900 ₽<span className="text-sm text-muted font-normal">/мес</span></div>
                <Link href="/register?plan=pro" className="text-accent font-medium hover:text-accent-hover transition-colors text-sm">
                  Выбрать <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text mb-6 max-w-3xl mx-auto">
            Готовы начать?
          </h2>
          <p className="text-lg text-muted mb-10 max-w-lg mx-auto leading-relaxed">
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
      <footer className="py-10 px-6 bg-surface border-t border-white/[0.04]">
        <div className="max-w-content mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[15px] font-semibold text-text">AI Chat Bot</span>
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
