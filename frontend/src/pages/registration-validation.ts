export interface RegistrationValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegistrationField = keyof RegistrationValues;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const username = values.username.trim();
  const email = values.email.trim();
  if (!username) errors.username = "Введите имя пользователя.";
  else if (username.length < 3) errors.username = "Имя должно содержать минимум 3 символа.";
  else if (username.length > 150) errors.username = "Имя не должно превышать 150 символов.";
  else if (!/^[\p{L}\p{N}_@.+-]+$/u.test(username)) {
    errors.username = "Используйте буквы, цифры и символы @ . + - _.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный адрес электронной почты.";
  }
  if (values.password.length < 5) errors.password = "Пароль должен быть длиннее 4 символов.";
  if (!values.confirmPassword) errors.confirmPassword = "Повторите пароль.";
  else if (values.password !== values.confirmPassword) errors.confirmPassword = "Пароли не совпадают.";
  return errors;
}

export function extractRegistrationApiErrors(error: unknown): RegistrationErrors & { form?: string } {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return { form: "Не удалось зарегистрироваться. Проверьте соединение и попробуйте снова." };
  }
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return { form: "Ошибка регистрации. Попробуйте ещё раз." };
  }
  const data = response.data;
  if (!data || typeof data !== "object") {
    return { form: "Ошибка регистрации. Попробуйте ещё раз." };
  }
  const messages: RegistrationErrors & { form?: string } = {};
  for (const [key, raw] of Object.entries(data)) {
    const message = Array.isArray(raw) ? raw.map(String).join(" ") : typeof raw === "string" ? raw : "";
    if (!message) continue;
    if (key === "username" || key === "email" || key === "password" || key === "confirmPassword") {
      messages[key] = message;
    } else if (key === "non_field_errors" || key === "detail" || key === "message") {
      messages.form = message;
    }
  }
  return Object.keys(messages).length ? messages : { form: "Ошибка регистрации. Проверьте данные." };
}
