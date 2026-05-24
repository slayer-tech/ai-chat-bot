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
};
