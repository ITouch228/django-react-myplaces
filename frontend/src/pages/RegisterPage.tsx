import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 4) {
      setError("Пароль должен содержать минимум 4 символа");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register(username, password, email);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err.response as { data?: { message?: string } })?.data?.message
          : "Ошибка регистрации";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm">
      <div className="card" style={{ marginTop: 50 }}>
        <h2 className="text-center">Регистрация</h2>
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
            <label className="form-label">
              Электронная почта (опционально)
            </label>
            <input
              className="form-control"
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="form-group">
            <label className="form-label">Повторите пароль</label>
            <input
              className="form-control"
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-center text-muted" style={{ color: "red" }}>
              {error}
            </div>
          )}

          <div className="flex gap-10 mt-16">
            <button
              className="btn btn-success btn-block"
              type="submit"
              disabled={loading}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
            <Link
              to="/login"
              className="btn btn-secondary btn-block text-center"
            >
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
