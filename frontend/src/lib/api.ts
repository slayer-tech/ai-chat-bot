const API_BASE = "";  // same origin — nginx proxies /api and /webhook to backend

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  tenant_id: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  company_name: string;
  inn?: string;
  timezone?: string;
  tariff_id?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DashboardStats {
  tenant_id: number;
  total_messages: number;
  used_messages: number;
  left_messages: number;
  handoffs_count: number;
  spam_blocked_count: number;
  unique_users_7d: number;
  unique_users_30d: number;
  unique_users_90d: number;
}

async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T = any>(path: string, options?: RequestInit) => fetchJson<T>(path, { ...options, method: "GET" }),

  register: (data: RegisterPayload) =>
    fetchJson<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    fetchJson<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchJson<{ status: string }>("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "X-Refresh-Token": localStorage.getItem("refresh_token") || "",
      },
    }),

  dashboard: () => fetchJson<DashboardStats>("/api/v1/admin/dashboard"),

  settings: () => fetchJson<Record<string, any>>("/api/v1/admin/settings"),

  updateSettings: (data: Record<string, any>) =>
    fetchJson<Record<string, any>>("/api/v1/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadKnowledge: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return fetch("/api/v1/admin/knowledge", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }
      return res.json();
    });
  },

  knowledgeDocs: () => fetchJson<Array<{ id: number; filename: string; status: string; created_at: string }>>("/api/v1/admin/knowledge"),

  deleteKnowledgeDoc: (docId: number) => fetchJson<{ status: string }>(`/api/v1/admin/knowledge/${docId}`, { method: "DELETE" }),

  generatePrompt: (data: Record<string, string>) =>
    fetchJson<{ system_prompt: string }>("/api/v1/admin/generate-prompt", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  followups: () => fetchJson<{ followup_enabled: boolean; scenarios: Record<string, any> }>("/api/v1/admin/followups"),

  updateFollowups: (data: { followup_enabled: boolean; scenarios: Record<string, any> }) =>
    fetchJson<{ status: string }>("/api/v1/admin/followups", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  registerWazzupWebhook: () =>
    fetchJson<{ status: string }>("/api/v1/admin/register-wazzup-webhook", {
      method: "POST",
    }),

  dialogStages: () =>
    fetchJson<Array<{ id: number; name: string; label: string; system_prompt: string | null; order_index: number; is_start: boolean; is_end: boolean; created_at: string }>>("/api/v1/admin/dialog-stages"),

  seedDialogStages: () =>
    fetchJson<{ status: string; created?: number }>("/api/v1/admin/dialog-stages/seed", { method: "POST" }),

  createDialogStage: (data: Record<string, any>) =>
    fetchJson<{ id: number }>("/api/v1/admin/dialog-stages", { method: "POST", body: JSON.stringify(data) }),

  updateDialogStage: (stageId: number, data: Record<string, any>) =>
    fetchJson<{ id: number }>(`/api/v1/admin/dialog-stages/${stageId}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteDialogStage: (stageId: number) =>
    fetchJson<{ status: string }>(`/api/v1/admin/dialog-stages/${stageId}`, { method: "DELETE" }),
};
