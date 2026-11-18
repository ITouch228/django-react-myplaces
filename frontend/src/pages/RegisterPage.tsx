import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  extractRegistrationApiErrors,
  validateRegistration,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationValues,
} from "./registration-validation";
import "./auth-pages.css";

const initialValues: RegistrationValues = {
  username: "", email: "", password: "", confirmPassword: "",
};

export const RegisterPage = () => {
  const [values, setValues] = useState<RegistrationValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiErrors, setApiErrors] = useState<RegistrationErrors & { form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const errors = validateRegistration(values);
  const messageFor = (field: RegistrationField) =>
    (touched[field] || submitted) ? errors[field] || apiErrors[field] : undefined;

  const update = (field: RegistrationField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setTouched((previous) => ({ ...previous, [field]: true }));
    setApiErrors((previous) => ({ ...previous, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setApiErrors({});
    setLoading(true);
    try {
      await register(values.username.trim(), values.password, values.email.trim());
      navigate("/");
    } catch (error: unknown) {
      setApiErrors(extractRegistrationApiErrors(error));
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: RegistrationField,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => {
    const message = messageFor(name);
    const showValid = (touched[name] || submitted) && values[name].length > 0 && !errors[name] && !apiErrors[name];
    const isPassword = name === "password" || name === "confirmPassword";

    return (
      <div className="auth-field" key={name}>
        <label htmlFor={name}>{label}</label>
        <div className={`auth-input-wrap ${message ? "auth-input-wrap--error" : showValid ? "auth-input-wrap--valid" : ""}`}>
          <input
            id={name}
            type={isPassword && showPassword ? "text" : type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={values[name]}
            disabled={loading}
            aria-invalid={Boolean(message)}
            aria-describedby={message ? `${name}-hint` : undefined}
            onChange={(event) => update(name, event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, [name]: true }))}
          />
          {showValid && <span className="auth-field__valid" aria-hidden="true">✓</span>}
        </div>
        {message && <p className="auth-field__error" id={`${name}-hint`} role="status">{message}</p>}
      </div>
    );
  };

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">📍</div>
          <p className="auth-eyebrow">Твоя личная карта впечатлений</p>
          <h1>Создать аккаунт</h1>
          <p>Сохраняй любимые места, блюда и чеки в одном месте.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {field("username", "Имя пользователя", "text", "Как к тебе обращаться?", "username")}
          {field("email", "Электронная почта (необязательно)", "email", "name@example.com", "email")}
          {field("password", "Пароль", "password", "Минимум 5 символов", "new-password")}
          {field("confirmPassword", "Повторите пароль", "password", "Повторите пароль", "new-password")}
          <label className="auth-show-password">
            <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            Показать пароли
          </label>
          {apiErrors.form && <div className="auth-alert" role="alert">{apiErrors.form}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="auth-spinner" aria-hidden="true" /> Создаём аккаунт...</> : "Зарегистрироваться"}
          </button>
          <p className="auth-switch">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </form>
      </section>
    </main>
  );
};
