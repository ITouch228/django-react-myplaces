import React, { useState, useEffect } from "react";
import { api, setAuthToken, removeAuthToken } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import type { ReactNode } from "react";
import type { User } from "../types";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя при загрузке контекста
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAuthToken(token);
      api
        .get("/api/user/")
        .then((res) => setUser(res.data))
        .catch(() => {
          removeAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Регистрация с автологином (бэкенд возвращает токены сразу)
  const register = async (
    username: string,
    password: string,
    email?: string,
  ) => {
    const response = await api.post("/api/register/", {
      username,
      password,
      email,
    });
    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setAuthToken(access);
    const userRes = await api.get("/api/user/");
    setUser(userRes.data);
  };

  // Вход с получением токенов и пользователя
  const login = async (username: string, password: string) => {
    const response = await api.post("/api/token/", { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setAuthToken(access);
    const userRes = await api.get("/api/user/");
    setUser(userRes.data);
  };

  // Выход с удалением токенов и пользователя
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
