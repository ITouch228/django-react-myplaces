import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./auth-pages.css";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !username.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/");
    } catch {
      setError("Неверное имя пользователя или пароль. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">📍</div>
          <p className="auth-eyebrow">Твоя личная карта впечатлений</p>
          <h1>С возвращением</h1>
          <p>Войди, чтобы продолжить собирать любимые места.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-username">Имя пользователя</label>
            <div className="auth-input-wrap">
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => { setUsername(event.target.value); setError(""); }}
                placeholder="Имя пользователя"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Пароль</label>
            <div className="auth-input-wrap">
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                placeholder="Пароль"
                required
                disabled={loading}
              />
            </div>
          </div>
          {error && <div role="alert" className="auth-alert">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading || !username.trim() || !password}>
            {loading ? <><span className="auth-spinner" aria-hidden="true" /> Входим...</> : "Войти"}
          </button>
          <p className="auth-switch">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </form>
      </section>
    </main>
  );
};
