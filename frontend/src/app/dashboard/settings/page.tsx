"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

/* ─── Sidebar Nav (same as dashboard) ─── */
const navItems = [
  {
    label: "Дашборд",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Диалоги",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337L5.25 21l.82-3.488A8.215 8.215 0 013.75 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: "Настройки бота",
    href: "/dashboard/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    active: true,
  },
  {
    label: "Аналитика",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Профиль",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

/* ─── Toggle component ─── */
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-white/[0.08]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [docs, setDocs] = useState<Array<{ id: number; filename: string; status: string; created_at: string }>>([]);

  // Prompt generation state
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({
    company_name: "",
    company_description: "",
    services: "",
    target_audience: "",
    tone: "",
    faq: "",
    no_promise: "",
    contacts_hours: "",
    extra_instructions: "",
  });
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Follow-ups state
  const [followupsEnabled, setFollowupsEnabled] = useState(true);
  const [followupScenarios, setFollowupScenarios] = useState<Record<string, any>>({});
  const [followupsLoading, setFollowupsLoading] = useState(true);
  const [followupsSaved, setFollowupsSaved] = useState(false);

  // Webhook registration state
  const [registeringWebhook, setRegisteringWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  // FAQ state
  const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([]);

  useEffect(() => {
    const localToken = localStorage.getItem("access_token");
    if (!localToken) {
      router.push("/login");
      return;
    }
    setAuthorized(true);
    api
      .settings()
      .then((res) => {
        setSettings(res);
        if (res.system_prompt) setGeneratedPrompt(res.system_prompt);
        if (res.faq_items) setFaqItems(res.faq_items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    loadDocs();
    api
      .followups()
      .then((res) => {
        setFollowupsEnabled(res.followup_enabled);
        setFollowupScenarios(res.scenarios || {});
      })
      .catch(() => {})
      .finally(() => setFollowupsLoading(false));
  }, [router]);

  const loadDocs = () => {
    api.knowledgeDocs().then(setDocs).catch(() => {});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateSettings({
        anti_spam_enabled: settings.anti_spam_enabled ?? true,
        handoff_enabled: settings.handoff_enabled ?? true,
        wazzup_api_key: settings.wazzup_api_key || null,
        target_action: settings.target_action || null,
        faq_items: faqItems.length > 0 ? faqItems : null,
      });
      setSettings(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterWebhook = async () => {
    if (!settings.wazzup_api_key) {
      setWebhookResult("Сначала сохраните Wazzup API ключ");
      return;
    }
    setRegisteringWebhook(true);
    setWebhookResult(null);
    try {
      const res = await api.registerWazzupWebhook();
      setWebhookResult("Вебхук зарегистрирован: " + (res.status || "ok"));
    } catch (err: any) {
      setWebhookResult("Ошибка: " + (err.message || "Не удалось зарегистрировать"));
    } finally {
      setRegisteringWebhook(false);
    }
  };

  const handleSaveFollowups = async () => {
    try {
      await api.updateFollowups({
        followup_enabled: followupsEnabled,
        scenarios: followupScenarios,
      });
      setFollowupsSaved(true);
      setTimeout(() => setFollowupsSaved(false), 2000);
    } catch (e) {
      alert("Ошибка сохранения фоллоу-апов");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (docs.length >= 10) {
      setUploadResult("Ошибка: максимум 10 файлов");
      return;
    }
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await api.uploadKnowledge(file);
      if (res.error) {
        setUploadResult(`Ошибка: ${res.error}`);
      } else {
        setUploadResult(`Загружено: ${res.chunks} чанков`);
        loadDocs();
      }
    } catch (err: any) {
      setUploadResult(`Ошибка: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGeneratePrompt = async () => {
    if (!promptAnswers.company_name.trim()) {
      alert("Укажи название компании");
      return;
    }
    setGeneratingPrompt(true);
    try {
      const res = await api.generatePrompt({ ...promptAnswers, target_action: settings.target_action || "" });
      setGeneratedPrompt(res.system_prompt);
      setSettings((s) => ({ ...s, system_prompt: res.system_prompt }));
    } catch (err: any) {
      alert(`Ошибка генерации: ${err.message}`);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const surveyQuestions = [
    { key: "company_name", label: "Название компании", placeholder: "ООО Ромашка" },
    { key: "company_description", label: "Чем занимаетесь? (2-3 предложения)", placeholder: "Продаем цветы и доставляем по Москве" },
    { key: "services", label: "Какие услуги/товары предлагаете?", placeholder: "Букеты, композиции, подписка на цветы" },
    { key: "target_audience", label: "Кто ваш клиент?", placeholder: "Мужчины 25-45, дарят на 8 марта и ДР" },
    { key: "tone", label: "Тон общения", placeholder: "Дружелюбный, профессиональный, строгий" },
    { key: "no_promise", label: "Что бот НЕ должен обещать?", placeholder: "Скидки без согласования, доставку за 1 час" },
    { key: "contacts_hours", label: "Контакты и режим работы", placeholder: "+7 999 123-45-67, пн-пт 9:00-18:00" },
    { key: "extra_instructions", label: "Дополнительные инструкции (необязательно)", placeholder: "Всегда предлагай упаковку, не забудь про открытку" },
  ];

  if (!authorized) {
    return (
      <div className="min-h-[100dvh] bg-void flex items-center justify-center">
        <div className="text-muted">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-void flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-40 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-text">
            AI Chat Bot
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.active
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-white/[0.03] hover:text-text"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft/30 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
        <Link href="/" className="text-base font-bold tracking-tight text-text">
          AI Chat Bot
        </Link>
        <button onClick={logout} className="text-sm text-accent">
          Выйти
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-10 pt-20 lg:pt-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Настройки бота</h1>

          {loading ? (
            <div className="text-muted">Загрузка...</div>
          ) : (
            <>
              {/* ─── Bot Configuration Survey ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Настройка промпта бота</h2>
                <p className="text-xs text-muted mb-5">
                  Ответь на вопросы — AI сгенерирует идеальный system prompt для твоего бота
                </p>

                <div className="space-y-4">
                  {surveyQuestions.map((q) => (
                    <div key={q.key}>
                      <label className="block text-sm font-medium text-text mb-1.5">{q.label}</label>
                      <input
                        type="text"
                        value={promptAnswers[q.key]}
                        onChange={(e) =>
                          setPromptAnswers((a) => ({ ...a, [q.key]: e.target.value }))
                        }
                        placeholder={q.placeholder}
                        className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGeneratePrompt}
                  disabled={generatingPrompt}
                  className="mt-5 btn-primary px-6"
                >
                  {generatingPrompt ? "Генерация..." : "Сгенерировать промпт"}
                </button>

                {generatedPrompt && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Сгенерированный промпт</p>
                    <textarea
                      readOnly
                      value={generatedPrompt}
                      rows={8}
                      className="w-full bg-void border border-border rounded-xl px-4 py-3 text-xs text-text font-mono resize-none focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* ─── FAQ ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Частые вопросы и ответы</h2>
                <p className="text-xs text-muted mb-4">
                  Добавь пары вопрос-ответ — бот будет использовать их при ответах. Если загружаешь файлы в RAG — можно не заполнять.
                </p>

                <div className="space-y-3">
                  {faqItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted">Вопрос</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            setFaqItems((items) =>
                              items.map((it, i) => (i === idx ? { ...it, question: e.target.value } : it))
                            )
                          }
                          placeholder="Сколько стоит доставка?"
                          className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Ответ</label>
                        <input
                          type="text"
                          value={item.answer}
                          onChange={(e) =>
                            setFaqItems((items) =>
                              items.map((it, i) => (i === idx ? { ...it, answer: e.target.value } : it))
                            )
                          }
                          placeholder="Доставка по Москве 500₽, от 3000₽ — бесплатно"
                          className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setFaqItems((items) => [...items, { question: "", answer: "" }])}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-white/[0.03] hover:text-text transition-colors"
                  >
                    + Добавить вопрос
                  </button>
                  {faqItems.length > 0 && (
                    <button
                      onClick={() => setFaqItems((items) => items.slice(0, -1))}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-accent hover:bg-accent-soft/30 transition-colors"
                    >
                      Удалить последний
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <button onClick={handleSave} disabled={saving} className="btn-primary px-6">
                    {saving ? "Сохранение..." : "Сохранить FAQ"}
                  </button>
                  {saved && <span className="text-sm text-green-400">Сохранено!</span>}
                </div>
              </div>

              {/* ─── Follow-ups ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Авто-фоллоу апсы</h2>
                <p className="text-xs text-muted mb-4">
                  Автоматические напоминания клиентам если они не ответили
                </p>

                <Toggle
                  label="Включить авто-фоллоу апсы"
                  description="Бот будет сам отправлять follow-up сообщения"
                  checked={followupsEnabled}
                  onChange={setFollowupsEnabled}
                />

                {followupsLoading ? (
                  <div className="text-xs text-muted mt-4">Загрузка сценариев...</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {Object.entries(followupScenarios).map(([key, scenario]: [string, any]) => (
                      <div key={key} className="rounded-xl bg-white/[0.02] border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-text">{scenario.label || key}</p>
                          <button
                            onClick={() =>
                              setFollowupScenarios((s) => ({
                                ...s,
                                [key]: { ...s[key], enabled: !s[key]?.enabled },
                              }))
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              scenario.enabled ? "bg-accent" : "bg-white/[0.08]"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                scenario.enabled ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted">Задержка (минут)</label>
                            <input
                              type="number"
                              value={scenario.delay_minutes || 0}
                              onChange={(e) =>
                                setFollowupScenarios((s) => ({
                                  ...s,
                                  [key]: { ...s[key], delay_minutes: parseInt(e.target.value) || 0 },
                                }))
                              }
                              className="w-full bg-void border border-border rounded-lg px-3 py-1.5 text-sm text-text mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted">Текст (пусто = AI генерирует)</label>
                            <input
                              type="text"
                              value={scenario.text || ""}
                              onChange={(e) =>
                                setFollowupScenarios((s) => ({
                                  ...s,
                                  [key]: { ...s[key], text: e.target.value },
                                }))
                              }
                              placeholder="Авто-сообщение..."
                              className="w-full bg-void border border-border rounded-lg px-3 py-1.5 text-sm text-text placeholder:text-muted mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-5">
                  <button onClick={handleSaveFollowups} className="btn-primary px-6">
                    Сохранить фоллоу апсы
                  </button>
                  {followupsSaved && <span className="text-sm text-green-400">Сохранено!</span>}
                </div>
              </div>

              {/* ─── Integration + Target Action ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Интеграции и цель</h2>
                <p className="text-xs text-muted mb-4">
                  Настрой подключение к Wazzup и выбери целевое действие бота.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Wazzup API ключ</label>
                    <input
                      type="password"
                      value={settings.wazzup_api_key || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, wazzup_api_key: e.target.value }))}
                      placeholder="Bearer token от Wazzup"
                      className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Целевое действие бота</label>
                    <select
                      value={settings.target_action || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, target_action: e.target.value || null }))}
                      className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="">— Не задано —</option>
                      <option value="appointment">Запись (записать клиента)</option>
                      <option value="sale">Продажа (закрыть сделку)</option>
                      <option value="support">Ответы на вопросы (консультация)</option>
                    </select>
                    <p className="text-xs text-muted mt-1">
                      Когда цель достигнута — бот передаёт диалог менеджеру.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <button onClick={handleSave} disabled={saving} className="btn-primary px-6">
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                  {saved && <span className="text-sm text-green-400">Сохранено!</span>}
                  <button
                    onClick={handleRegisterWebhook}
                    disabled={registeringWebhook || !settings.wazzup_api_key}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-white/[0.03] hover:text-text transition-colors disabled:opacity-50"
                  >
                    {registeringWebhook ? "Регистрация..." : "Переподключить вебхук"}
                  </button>
                </div>
                {webhookResult && (
                  <p className={`text-xs mt-2 ${webhookResult.startsWith("Ошибка") || webhookResult.startsWith("Сначала") ? "text-accent" : "text-green-400"}`}>
                    {webhookResult}
                  </p>
                )}
              </div>

              {/* ─── Security Toggles ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Безопасность и эскалация</h2>
                <p className="text-xs text-muted mb-4">Включите нужные модули обработки диалогов</p>

                <Toggle
                  label="Анти-спам и защита от флуда"
                  description="Автоматически блокирует спамеров и флудеров"
                  checked={settings.anti_spam_enabled ?? true}
                  onChange={(v) => setSettings((s) => ({ ...s, anti_spam_enabled: v }))}
                />
                <Toggle
                  label="Smart Escalation / Handoff"
                  description="Автоматически переводит на оператора при необходимости"
                  checked={settings.handoff_enabled ?? true}
                  onChange={(v) => setSettings((s) => ({ ...s, handoff_enabled: v }))}
                />

                <div className="flex items-center gap-4 mt-5">
                  <button onClick={handleSave} disabled={saving} className="btn-primary px-6">
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                  {saved && <span className="text-sm text-green-400">Сохранено!</span>}
                </div>
              </div>

              {/* ─── Knowledge Base (RAG) ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">База знаний (RAG)</h2>
                <p className="text-xs text-muted mb-4">
                  Загрузи PDF, TXT или DOCX — бот будет отвечать по содержимому. Макс {docs.length}/10 файлов, до 10МБ каждый.
                </p>

                <label
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-border bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors ${
                    docs.length >= 10 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h6.879a2.25 2.25 0 011.59.659l2.871 2.871a2.25 2.25 0 01.659 1.59V17.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.25z" />
                  </svg>
                  <span className="text-sm text-text-secondary">
                    {uploading ? "Загрузка..." : docs.length >= 10 ? "Лимит файлов достигнут" : "Выбрать файл (PDF, TXT, DOCX)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleUpload}
                    disabled={uploading || docs.length >= 10}
                    className="hidden"
                  />
                </label>
                {uploadResult && (
                  <p className={`text-xs mt-2 ${uploadResult.startsWith("Ошибка") ? "text-accent" : "text-green-400"}`}>
                    {uploadResult}
                  </p>
                )}

                {docs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {docs.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white/[0.03]">
                        <span className="text-text truncate">{d.filename}</span>
                        <span className="text-xs text-muted ml-3 shrink-0">{d.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
