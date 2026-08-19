import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Неверные логин или пароль");
    }
  };

  return (
    <div className="container-sm">
      <div className="card" style={{ marginTop: 50 }}>
        <h2 className="text-center">Вход</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input
              className="form-control"
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-control"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-center text-muted" style={{ color: "red" }}>
              {error}
            </div>
          )}

          <div className="flex gap-10 mt-16">
            <button className="btn btn-primary btn-block" type="submit">
              Войти
            </button>
            <Link
              to="/register"
              className="btn btn-secondary btn-block text-center"
            >
              Регистрация
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
