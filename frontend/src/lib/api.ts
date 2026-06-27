const API_BASE = ""; // same origin — nginx proxies /api and /webhook to backend

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

function formatError(err: any, status: number): string {
  if (typeof err === "string") return err;
  if (err?.detail) {
    const detail = err.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (item?.msg) return item.msg;
          return String(item);
        })
        .filter(Boolean);
      return messages.length ? messages.join("; ") : `HTTP ${status}`;
    }
  }
  if (err?.message) return err.message;
  if (err?.error) return err.error;
  return `HTTP ${status}`;
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

let onTokenRefreshed: ((token: string) => void) | null = null;
let onLoggedOut: (() => void) | null = null;

export function setAuthHandlers(
  onRefresh: (token: string) => void,
  onLogout: () => void
) {
  onTokenRefreshed = onRefresh;
  onLoggedOut = onLogout;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    onLoggedOut?.();
    throw new Error("Сессия завершена. Пожалуйста, войдите снова.");
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Refresh-Token": refreshToken,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatError(err, res.status));
    }

    const data: TokenResponse = await res.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    onTokenRefreshed?.(data.access_token);

    refreshQueue.forEach((q) => q.resolve(data.access_token));
    refreshQueue = [];
    return data.access_token;
  } catch (error) {
    refreshQueue.forEach((q) => q.reject(error));
    refreshQueue = [];
    onLoggedOut?.();
    throw error;
  } finally {
    isRefreshing = false;
  }
}

async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const makeRequest = async (tokenOverride?: string): Promise<Response> => {
    const token = tokenOverride ?? getAccessToken();
    const url = `${API_BASE}${path}`;
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

  let res = await makeRequest();

  if (res.status === 401 && getRefreshToken()) {
    try {
      const newToken = await refreshAccessToken();
      res = await makeRequest(newToken);
    } catch {
      throw new Error("Сессия завершена. Пожалуйста, войдите снова.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatError(err, res.status));
  }

  return res.json();
}

export const api = {
  get: <T = any>(path: string, options?: RequestInit) =>
    fetchJson<T>(path, { ...options, method: "GET" }),

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
        "X-Refresh-Token": getRefreshToken() || "",
      },
    }),

  refreshAccessToken,

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

    const makeRequest = async (tokenOverride?: string): Promise<Response> => {
      const token = tokenOverride ?? getAccessToken();
      return fetch("/api/v1/admin/knowledge", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
    };

    return makeRequest()
      .then(async (res) => {
        if (res.status === 401 && getRefreshToken()) {
          const newToken = await refreshAccessToken();
          res = await makeRequest(newToken);
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(formatError(err, res.status));
        }
        return res.json();
      })
      .catch((err) => {
        throw err;
      });
  },

  knowledgeDocs: () =>
    fetchJson<Array<{ id: number; filename: string; status: string; created_at: string }>>(
      "/api/v1/admin/knowledge"
    ),

  deleteKnowledgeDoc: (docId: number) =>
    fetchJson<{ status: string }>(`/api/v1/admin/knowledge/${docId}`, {
      method: "DELETE",
    }),

  generatePrompt: (data: Record<string, string>) =>
    fetchJson<{ system_prompt: string }>("/api/v1/admin/generate-prompt", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  followups: () =>
    fetchJson<{ followup_enabled: boolean; scenarios: Record<string, any> }>(
      "/api/v1/admin/followups"
    ),

  updateFollowups: (data: {
    followup_enabled: boolean;
    scenarios: Record<string, any>;
  }) =>
    fetchJson<{ status: string }>("/api/v1/admin/followups", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  registerWazzupWebhook: () =>
    fetchJson<{ status: string }>("/api/v1/admin/register-wazzup-webhook", {
      method: "POST",
    }),

  dialogStages: () =>
    fetchJson<
      Array<{
        id: number;
        name: string;
        label: string;
        system_prompt: string | null;
        order_index: number;
        is_start: boolean;
        is_end: boolean;
        created_at: string;
      }>
    >("/api/v1/admin/dialog-stages"),

  seedDialogStages: () =>
    fetchJson<{ status: string; created?: number }>(
      "/api/v1/admin/dialog-stages/seed",
      { method: "POST" }
    ),

  createDialogStage: (data: Record<string, any>) =>
    fetchJson<{ id: number }>("/api/v1/admin/dialog-stages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateDialogStage: (stageId: number, data: Record<string, any>) =>
    fetchJson<{ id: number }>(`/api/v1/admin/dialog-stages/${stageId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteDialogStage: (stageId: number) =>
    fetchJson<{ status: string }>(`/api/v1/admin/dialog-stages/${stageId}`, {
      method: "DELETE",
    }),
};
