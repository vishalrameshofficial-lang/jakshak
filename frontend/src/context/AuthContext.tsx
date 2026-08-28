import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import api from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsPreset: (role: Role) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: "demo-user-id",
    email: "operator@jalrakshak.in",
    name: "Regional Operator (Zone 4)",
    role: "OPERATOR"
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("jal_rakshak_token") || "demo-token");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("jal_rakshak_token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (e) {
          // Keep default demo user for SIH demo resilience
        }
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("jal_rakshak_token", res.data.token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsPreset = async (role: Role): Promise<boolean> => {
    let email = "operator@jalrakshak.in";
    let name = "Regional Operator (Zone 4)";
    if (role === "ADMIN") {
      email = "admin@jalrakshak.in";
      name = "SIH Chief Administrator";
    } else if (role === "VIEWER") {
      email = "viewer@jalrakshak.in";
      name = "Community Inspector";
    }

    const success = await login(email, "sih2026demo");
    if (!success) {
      // Fallback local setting for seamless demo experience
      const mockUser: User = { id: `${role.toLowerCase()}-id`, email, name, role };
      setUser(mockUser);
      setToken("demo-preset-token");
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jal_rakshak_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsPreset, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
