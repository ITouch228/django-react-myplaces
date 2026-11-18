import { describe, expect, it } from "vitest";
import { extractRegistrationApiErrors, validateRegistration } from "./registration-validation";

const valid = {
  username: "person_01",
  email: "",
  password: "abcde",
  confirmPassword: "abcde",
};

describe("register form validation", () => {
  it("rejects short passwords and mismatched confirmation", () => {
    const errors = validateRegistration({ ...valid, password: "abcd", confirmPassword: "other" });
    expect(errors.password).toBe("Пароль должен быть длиннее 4 символов.");
    expect(errors.confirmPassword).toBe("Пароли не совпадают.");
  });

  it("accepts a matching password and optional empty email", () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it("rejects invalid email and username", () => {
    const errors = validateRegistration({ ...valid, username: " ", email: "not an email" });
    expect(errors.username).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it("parses Django REST Framework field errors", () => {
    const errors = extractRegistrationApiErrors({
      response: {
        data: {
          username: ["Пользователь с таким именем уже существует."],
          non_field_errors: ["Проверьте данные."],
        },
      },
    });
    expect(errors.username).toContain("уже существует");
    expect(errors.form).toBe("Проверьте данные.");
  });

  it("provides a safe message for network errors", () => {
    expect(extractRegistrationApiErrors(new Error("Network Error")).form).toContain("соединение");
  });
});
