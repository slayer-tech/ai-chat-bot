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
  user: { email: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const tid = localStorage.getItem("tenant_id");
    const r = localStorage.getItem("role");
    const email = localStorage.getItem("user_email");
    if (access) {
      setToken(access);
      setTenantId(tid ? parseInt(tid) : null);
      setRole(r);
      if (email) setUser({ email });
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
    localStorage.setItem("user_email", email);
    setUser({ email });
    saveTokens(data);
    if (data.role === "superadmin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const register = async (email: string, password: string) => {
    const data = await api.register({
      email,
      password,
      company_name: email.split("@")[0],
    });
    localStorage.setItem("user_email", email);
    setUser({ email });
    saveTokens(data);
    router.push("/dashboard");
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("role");
    localStorage.removeItem("user_email");
    setToken(null);
    setTenantId(null);
    setRole(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, tenantId, role, user, isLoading, login, register, logout }}
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
