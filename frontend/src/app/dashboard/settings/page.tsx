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

  // Dialog stages state (state machine)
  const [dialogStages, setDialogStages] = useState<Array<{
    id?: number;
    name: string;
    label: string;
    system_prompt: string;
    order_index: number;
    is_start: boolean;
    is_end: boolean;
  }>>([]);
  const [dialogStagesLoading, setDialogStagesLoading] = useState(true);
  const [dialogStagesSaved, setDialogStagesSaved] = useState(false);

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
    api
      .dialogStages()
      .then((res) => {
        const normalized = (res || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          label: s.label,
          system_prompt: s.system_prompt || "",
          order_index: s.order_index,
          is_start: s.is_start,
          is_end: s.is_end,
        }));
        setDialogStages(normalized);
      })
      .catch(() => {
        setDialogStages([]);
      })
      .finally(() => setDialogStagesLoading(false));
  }, [router]);

  const loadDocs = () => {
    api.knowledgeDocs().then(setDocs).catch(() => {});
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm("Удалить документ и все его чанки? Это необратимо.")) return;
    try {
      await api.deleteKnowledgeDoc(docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      alert("Ошибка удаления");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateSettings({
        anti_spam_enabled: settings.anti_spam_enabled ?? true,
        handoff_enabled: settings.handoff_enabled ?? true,
        wazzup_api_key: settings.wazzup_api_key || null,
        faq_items: faqItems.length > 0 ? faqItems : null,
        debounce_seconds: settings.debounce_seconds ?? 10,
        smart_delay_start: settings.smart_delay_start || null,
        smart_delay_end: settings.smart_delay_end || null,
        timezone: settings.timezone || "Europe/Moscow",
        voice_max_duration_seconds: settings.voice_max_duration_seconds ?? 120,
        dialog_message_limit: settings.dialog_message_limit || null,
        data_retention_days: settings.data_retention_days ?? 90,
        crm_type: settings.crm_type || null,
        crm_config: settings.crm_config || null,
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
      const res = await api.generatePrompt({ ...promptAnswers });
      setGeneratedPrompt(res.system_prompt);
      setSettings((s) => ({ ...s, system_prompt: res.system_prompt }));
    } catch (err: any) {
      alert(`Ошибка генерации: ${err.message}`);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSaveDialogStage = async (stage: typeof dialogStages[0], index: number) => {
    try {
      if (stage.id) {
        await api.updateDialogStage(stage.id, {
          name: stage.name,
          label: stage.label,
          system_prompt: stage.system_prompt,
          order_index: stage.order_index,
          is_start: stage.is_start,
          is_end: stage.is_end,
        });
      } else {
        const res = await api.createDialogStage({
          name: stage.name,
          label: stage.label,
          system_prompt: stage.system_prompt,
          order_index: stage.order_index,
          is_start: stage.is_start,
          is_end: stage.is_end,
        });
        setDialogStages((items) =>
          items.map((it, i) => (i === index ? { ...it, id: res.id } : it))
        );
      }
      setDialogStagesSaved(true);
      setTimeout(() => setDialogStagesSaved(false), 2000);
    } catch (err: any) {
      alert("Ошибка сохранения этапа: " + (err.message || "Unknown"));
    }
  };

  const handleDeleteDialogStage = async (stage: typeof dialogStages[0], index: number) => {
    if (!confirm("Удалить этап?")) return;
    try {
      if (stage.id) {
        await api.deleteDialogStage(stage.id);
      }
      setDialogStages((items) => items.filter((_, i) => i !== index));
    } catch (err: any) {
      alert("Ошибка удаления: " + (err.message || "Unknown"));
    }
  };

  const handleSeedDialogStages = async () => {
    try {
      const res = await api.seedDialogStages();
      if (res.status === "ok") {
        const stages = await api.dialogStages();
        const normalized = (stages || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          label: s.label,
          system_prompt: s.system_prompt || "",
          order_index: s.order_index,
          is_start: s.is_start,
          is_end: s.is_end,
        }));
        setDialogStages(normalized);
      } else if (res.status === "already_seeded") {
        alert("Стадии уже существуют. Обновите страницу.");
      }
    } catch (err: any) {
      alert("Ошибка создания стадий: " + (err.message || "Unknown"));
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
                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Промпт бота (можно редактировать вручную)</p>
                    <textarea
                      value={generatedPrompt}
                      onChange={(e) => {
                        setGeneratedPrompt(e.target.value);
                        setSettings((s) => ({ ...s, system_prompt: e.target.value }));
                      }}
                      rows={10}
                      className="w-full bg-void border border-border rounded-xl px-4 py-3 text-xs text-text font-mono resize-y focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={async () => {
                        setSaving(true);
                        try {
                          const res = await api.updateSettings({ system_prompt: generatedPrompt });
                          setSettings(res);
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch (e) {
                          alert("Ошибка сохранения промпта");
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="mt-3 btn-primary px-6"
                    >
                      {saving ? "Сохранение..." : "Сохранить промпт"}
                    </button>
                    {saved && <span className="text-sm text-green-400 ml-3">Сохранено!</span>}
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

              {/* ─── Dialog Stages (State Machine) ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">Этапы диалога (воронка)</h2>
                <p className="text-xs text-muted mb-4">
                  Управление стадиями разговора. Бот следует воронке от приветствия к записи. Каждая стадия имеет свои инструкции для LLM.
                </p>

                {dialogStagesLoading ? (
                  <p className="text-sm text-muted">Загрузка...</p>
                ) : dialogStages.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted">Стадии не созданы. Создайте дефолтные или добавьте вручную.</p>
                    <button onClick={handleSeedDialogStages} className="btn-primary px-4 py-2 text-sm">
                      ➕ Создать дефолтные стадии
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dialogStages.map((stage, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-muted">Имя (machine)</label>
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) =>
                                setDialogStages((items) =>
                                  items.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it))
                                )
                              }
                              placeholder="greeting"
                              className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted">Название</label>
                            <input
                              type="text"
                              value={stage.label}
                              onChange={(e) =>
                                setDialogStages((items) =>
                                  items.map((it, i) => (i === idx ? { ...it, label: e.target.value } : it))
                                )
                              }
                              placeholder="Приветствие"
                              className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted">Порядок</label>
                            <input
                              type="number"
                              value={stage.order_index}
                              onChange={(e) =>
                                setDialogStages((items) =>
                                  items.map((it, i) => (i === idx ? { ...it, order_index: parseInt(e.target.value) || 0 } : it))
                                )
                              }
                              className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text mt-1 focus:outline-none focus:border-accent transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted">Промпт для LLM (что делать на этой стадии)</label>
                          <textarea
                            value={stage.system_prompt}
                            onChange={(e) =>
                              setDialogStages((items) =>
                                items.map((it, i) => (i === idx ? { ...it, system_prompt: e.target.value } : it))
                              )
                            }
                            rows={3}
                            placeholder="Поздоровайся, представь клинику..."
                            className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors resize-y"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stage.is_start}
                              onChange={(e) =>
                                setDialogStages((items) =>
                                  items.map((it, i) => (i === idx ? { ...it, is_start: e.target.checked } : it))
                                )
                              }
                              className="accent-accent"
                            />
                            Стартовая
                          </label>
                          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stage.is_end}
                              onChange={(e) =>
                                setDialogStages((items) =>
                                  items.map((it, i) => (i === idx ? { ...it, is_end: e.target.checked } : it))
                                )
                              }
                              className="accent-accent"
                            />
                            Финальная
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSaveDialogStage(stage, idx)}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => handleDeleteDialogStage(stage, idx)}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-accent hover:bg-accent-soft/30 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setDialogStages((items) => [
                          ...items,
                          { name: "", label: "", system_prompt: "", order_index: items.length, is_start: false, is_end: false },
                        ])
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-white/[0.03] hover:text-text transition-colors"
                    >
                      + Добавить стадию
                    </button>
                  </div>
                )}

                {dialogStagesSaved && (
                  <div className="mt-4">
                    <span className="text-sm text-green-400">Сохранено!</span>
                  </div>
                )}
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
                    {Object.entries(followupScenarios)
                      .filter(([key]) => ["new_lead_30min", "no_answer_2h", "no_answer_24h", "inactive_n_days"].includes(key))
                      .map(([key, scenario]: [string, any]) => (
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
                            <label className="text-xs text-muted">
                              {key === "inactive_n_days" ? "Задержка (дней)" : "Задержка (минут)"}
                            </label>
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

              {/* ─── CRM Integration ─── */}
              <div className="card p-6">
                <h2 className="text-lg font-medium text-text mb-1">CRM интеграция</h2>
                <p className="text-xs text-muted mb-4">
                  При handoff бот автоматически создаст/обновит лид в CRM, добавит заметки и задачи.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Тип CRM</label>
                    <select
                      value={settings.crm_type || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, crm_type: e.target.value || null }))}
                      className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="">— Не подключено —</option>
                      <option value="amocrm">AmoCRM</option>
                      <option value="bitrix24">Bitrix24</option>
                    </select>
                  </div>
                  {settings.crm_type && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">
                          {settings.crm_type === "amocrm" ? "Base URL (https://xxx.amocrm.ru)" : "Webhook URL"}
                        </label>
                        <input
                          type="text"
                          value={settings.crm_config?.base_url || settings.crm_config?.webhook_url || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              crm_config: {
                                ...(s.crm_config || {}),
                                [s.crm_type === "amocrm" ? "base_url" : "webhook_url"]: e.target.value,
                              },
                            }))
                          }
                          placeholder={settings.crm_type === "amocrm" ? "https://company.amocrm.ru" : "https://company.bitrix24.ru/rest/1/..."}
                          className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">
                          {settings.crm_type === "amocrm" ? "Access Token" : "Webhook ключ не нужен (в URL)"}
                        </label>
                        {settings.crm_type === "amocrm" && (
                          <input
                            type="password"
                            value={settings.crm_config?.access_token || ""}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                crm_config: { ...(s.crm_config || {}), access_token: e.target.value },
                              }))
                            }
                            placeholder="Bearer токен из AmoCRM"
                            className="w-full bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted">ID воронки</label>
                          <input
                            type="text"
                            value={settings.crm_config?.pipeline_id || ""}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                crm_config: { ...(s.crm_config || {}), pipeline_id: e.target.value },
                              }))
                            }
                            placeholder="123"
                            className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted">ID этапа "В работе"</label>
                          <input
                            type="text"
                            value={settings.crm_config?.stage_handoff || ""}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                crm_config: { ...(s.crm_config || {}), stage_handoff: e.target.value },
                              }))
                            }
                            placeholder="142"
                            className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted">ID этапа "Успешно"</label>
                        <input
                          type="text"
                          value={settings.crm_config?.stage_success || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              crm_config: { ...(s.crm_config || {}), stage_success: e.target.value },
                            }))
                          }
                          placeholder="143"
                          className="w-full sm:w-40 bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Custom fields (JSON)</label>
                        <textarea
                          value={settings.crm_config?.custom_fields ? JSON.stringify(settings.crm_config.custom_fields, null, 2) : ""}
                          onChange={(e) => {
                            try {
                              const val = e.target.value.trim() ? JSON.parse(e.target.value) : null;
                              setSettings((s) => ({
                                ...s,
                                crm_config: { ...(s.crm_config || {}), custom_fields: val },
                              }));
                            } catch {
                              // ignore parse errors while typing
                            }
                          }}
                          placeholder={`{\n  "pozhelaniya": 12345,\n  "razmer": 12346\n}`}
                          rows={4}
                          className="w-full bg-void border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted mt-1 focus:outline-none focus:border-accent transition-colors font-mono"
                        />
                        <p className="text-xs text-muted mt-1">Ключ = название поля, значение = ID поля в CRM. LLM заполнит их из диалога.</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <button onClick={handleSave} disabled={saving} className="btn-primary px-6">
                    {saving ? "Сохранение..." : "Сохранить CRM"}
                  </button>
                  {saved && <span className="text-sm text-green-400">Сохранено!</span>}
                </div>
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Задержка перед ответом (секунды)
                  </label>
                  <p className="text-xs text-muted mb-2">
                    Если клиент пришлёт несколько сообщений подряд — бот подождёт это время и ответит на все сразу
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={settings.debounce_seconds ?? 10}
                    onChange={(e) => setSettings((s) => ({ ...s, debounce_seconds: parseInt(e.target.value) || 10 }))}
                    className="w-32 bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-text">
                    Макс. длительность голосового (сек)
                  </p>
                  <p className="text-xs text-muted mt-0.5 mb-2">
                    Если голосовое длиннее — бот передаст менеджеру
                  </p>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={settings.voice_max_duration_seconds ?? 120}
                    onChange={(e) => setSettings((s) => ({ ...s, voice_max_duration_seconds: parseInt(e.target.value) || 120 }))}
                    className="w-32 bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-text">
                    Лимит сообщений в диалоге
                  </p>
                  <p className="text-xs text-muted mt-0.5 mb-2">
                    Сколько сообщений может написать клиент до передачи менеджеру. Пусто — без лимита.
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.dialog_message_limit ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((s) => ({ ...s, dialog_message_limit: val ? parseInt(val) : null }));
                    }}
                    placeholder="Без лимита"
                    className="w-32 bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-text">
                    Срок хранения данных (дней)
                  </p>
                  <p className="text-xs text-muted mt-0.5 mb-2">
                    Через сколько дней после закрытия диалога удалять переписку (152-ФЗ / GDPR). Минимум 1 день.
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={settings.data_retention_days ?? 90}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 90;
                      setSettings((s) => ({ ...s, data_retention_days: val }));
                    }}
                    className="w-32 bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="mt-4">
                  <Toggle
                    label="Отправлять follow-up только в рабочее время"
                    description="Если выключено — фоллоу-апы приходят в любое время"
                    checked={!!(settings.smart_delay_start && settings.smart_delay_end)}
                    onChange={(v) => {
                      if (v) {
                        setSettings((s) => ({ ...s, smart_delay_start: "09:00", smart_delay_end: "21:00" }));
                      } else {
                        setSettings((s) => ({ ...s, smart_delay_start: null, smart_delay_end: null }));
                      }
                    }}
                  />
                  {!!(settings.smart_delay_start && settings.smart_delay_end) && (
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="time"
                        value={settings.smart_delay_start || "09:00"}
                        onChange={(e) => setSettings((s) => ({ ...s, smart_delay_start: e.target.value }))}
                        className="bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                      />
                      <span className="text-muted">—</span>
                      <input
                        type="time"
                        value={settings.smart_delay_end || "21:00"}
                        onChange={(e) => setSettings((s) => ({ ...s, smart_delay_end: e.target.value }))}
                        className="bg-void border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                      />
                      <span className="text-xs text-muted">({settings.timezone || "Europe/Moscow"})</span>
                    </div>
                  )}
                </div>

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
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted">{d.status}</span>
                          <button
                            onClick={() => handleDeleteDoc(d.id)}
                            className="text-xs text-accent hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/[0.05]"
                            title="Удалить"
                          >
                            ✕
                          </button>
                        </div>
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
