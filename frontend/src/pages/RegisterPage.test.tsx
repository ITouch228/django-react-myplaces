// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./RegisterPage";

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ register: mocks.register }),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-router-dom")>();
  return { ...original, useNavigate: () => mocks.navigate };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderPage = () => render(<MemoryRouter><RegisterPage /></MemoryRouter>);
const fillValidValues = () => {
  fireEvent.change(screen.getByLabelText("Имя пользователя"), { target: { value: "tester" } });
  fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "securePass42" } });
  fireEvent.change(screen.getByLabelText("Повторите пароль"), { target: { value: "securePass42" } });
};

describe("RegisterPage", () => {
  it("shows a password validation hint during input and clears it when corrected", () => {
    renderPage();
    const password = screen.getByLabelText("Пароль");
    fireEvent.change(password, { target: { value: "ab" } });
    fireEvent.blur(password);
    expect(screen.getByText("Пароль должен быть длиннее 4 символов.")).toBeTruthy();
    fireEvent.change(password, { target: { value: "abcde" } });
    expect(screen.queryByText("Пароль должен быть длиннее 4 символов.")).toBeNull();
  });

  it("shows mismatch as soon as confirmation has been touched", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "abcde" } });
    const confirmation = screen.getByLabelText("Повторите пароль");
    fireEvent.change(confirmation, { target: { value: "other" } });
    fireEvent.blur(confirmation);
    expect(screen.getByText("Пароли не совпадают.")).toBeTruthy();
  });

  it("does not send invalid data", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(mocks.register).not.toHaveBeenCalled();
    expect(screen.getByText("Введите имя пользователя.")).toBeTruthy();
  });

  it("renders backend field error and allows a correction", async () => {
    mocks.register.mockRejectedValueOnce({ response: { data: { username: ["Имя уже занято."] } } });
    renderPage();
    fillValidValues();
    fireEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(await screen.findByText("Имя уже занято.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Имя пользователя"), { target: { value: "new_name" } });
    expect(screen.queryByText("Имя уже занято.")).toBeNull();
  });

  it("registers and navigates when all values are valid", async () => {
    mocks.register.mockResolvedValue(undefined);
    renderPage();
    fillValidValues();
    fireEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    await waitFor(() => expect(mocks.register).toHaveBeenCalledWith("tester", "securePass42", ""));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/"));
  });
});
