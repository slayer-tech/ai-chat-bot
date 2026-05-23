import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Chat Bot
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
                Возможности
              </a>
              <a href="#tariffs" className="text-slate-600 hover:text-slate-900 transition-colors">
                Тарифы
              </a>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            7 дней бесплатно — без привязки карты
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8">
            Автоматизируйте продажи
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              в мессенджерах
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            ИИ-ассистент, который отвечает клиентам в WhatsApp и Telegram 24/7.
            Интеграция с CRM, RAG-база знаний, авто-дожим и умная передача менеджеру.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5"
            >
              Начать бесплатно
            </Link>
            <a
              href="#features"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg"
            >
              Узнать больше
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-slate-600">Ответы клиентам</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="text-3xl font-bold text-indigo-600 mb-1">&lt;1с</div>
              <div className="text-slate-600">Скорость ответа</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="text-3xl font-bold text-violet-600 mb-1">100%</div>
              <div className="text-slate-600">Автоматизация</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Всё, что нужно для продаж
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Полный цикл автоматизации: от первого сообщения до сделки в CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "ИИ-диалоги",
                desc: "Естественные разговоры на русском. Понимает контекст, отвечает по базе знаний.",
                color: "blue",
              },
              {
                icon: "📚",
                title: "RAG-база знаний",
                desc: "Загружайте документы, прайсы, инструкции. Бот отвечает по вашим материалам.",
                color: "indigo",
              },
              {
                icon: "🔔",
                title: "Авто-дожим",
                desc: "Автоматические напоминания клиентам. Настраиваемое время, timezone, тексты.",
                color: "violet",
              },
              {
                icon: "🔄",
                title: "Передача менеджеру",
                desc: "Умная эскалация: по агрессии, по запросу, по неуверенности ИИ.",
                color: "rose",
              },
              {
                icon: "🛡️",
                title: "Анти-спам",
                desc: "Защита от флуда и матов. Настраиваемые лимиты и автоматическая блокировка.",
                color: "amber",
              },
              {
                icon: "📊",
                title: "CRM + Аналитика",
                desc: "Интеграция с amoCRM и Битрикс24. Полная статистика по диалогам и конверсии.",
                color: "emerald",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-slate-50 hover:bg-white rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section id="tariffs" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Прозрачные тарифы
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              7 дней бесплатно на любом тарифе. Без привязки карты.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Старт",
                price: "2 900",
                messages: 500,
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
                messages: 2000,
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
                messages: 5000,
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
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/25 scale-105"
                    : "bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`ml-2 ${
                      plan.popular ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    ₽/мес
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                          plan.popular ? "text-blue-200" : "text-blue-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className={
                          plan.popular ? "text-blue-50" : "text-slate-600"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center w-full py-3 rounded-full font-semibold transition-all ${
                    plan.popular
                      ? "bg-white text-blue-700 hover:bg-blue-50 hover:shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25"
                  }`}
                >
                  Выбрать тариф
                </Link>
              </div>
            ))}
          </div>

          {/* Custom dev */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              Нужна кастомная разработка ИИ-агента под ваши задачи?
            </p>
            <a
              href="https://t.me/your_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              Обсудить индивидуальный проект
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Нужна помощь?
          </h2>
          <p className="text-slate-600 mb-8">
            Наша команда на связи в Telegram и WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/your_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-3 rounded-full font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Написать в Telegram
            </a>
            <a
              href="https://wa.me/79991234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#25d366] hover:bg-[#128c7e] text-white px-6 py-3 rounded-full font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Написать в WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <span className="text-slate-500 text-sm">
            © 2026 AI Chat Bot. Все права защищены.
          </span>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-700 text-sm">
              Условия использования
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
