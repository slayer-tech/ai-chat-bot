"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, TokenResponse } from "./api";

interface AuthContextType {
  token: string | null;
  tenantId: number | null;
  role: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    company_name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const tid = localStorage.getItem("tenant_id");
    const r = localStorage.getItem("role");
    if (access) {
      setToken(access);
      setTenantId(tid ? parseInt(tid) : null);
      setRole(r);
    }
    setIsLoading(false);
  }, []);

  const saveTokens = (data: TokenResponse) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("tenant_id", String(data.tenant_id));
    localStorage.setItem("role", data.role);
    setToken(data.access_token);
    setTenantId(data.tenant_id);
    setRole(data.role);
  };

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    saveTokens(data);
    router.push("/dashboard");
  };

  const register = async (payload: {
    email: string;
    password: string;
    company_name: string;
    phone: string;
  }) => {
    const data = await api.register({
      email: payload.email,
      password: payload.password,
      company_name: payload.company_name,
      inn: payload.phone,
    });
    saveTokens(data);
    router.push("/dashboard");
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("role");
    setToken(null);
    setTenantId(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, tenantId, role, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
