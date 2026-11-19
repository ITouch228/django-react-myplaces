// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CheckFormModal } from "./CheckFormModal";

const mocks = vi.hoisted(() => ({
  create: vi.fn(), update: vi.fn(),
}));
vi.mock("../../hooks/useChecks", () => ({
  useCreateCheck: () => ({ isPending: false, mutateAsync: mocks.create }),
  useUpdateCheck: () => ({ isPending: false, mutateAsync: mocks.update }),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("CheckFormModal receipt quantities", () => {
  it("submits exact unit prices and positive quantities", async () => {
    mocks.create.mockResolvedValue(undefined);
    render(<CheckFormModal placeId={7} isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Название"), { target: { value: "Кофе" } });
    fireEvent.change(screen.getByPlaceholderText("Цена за 1 шт."), { target: { value: "0.10" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Количество позиции 1" }), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      place: 7,
      items: [expect.objectContaining({ item_name: "Кофе", price: "0.10", quantity: 3 })],
    })));
  });

  it("rejects fractional quantity before submitting", () => {
    render(<CheckFormModal placeId={7} isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Название"), { target: { value: "Чай" } });
    fireEvent.change(screen.getByPlaceholderText("Цена за 1 шт."), { target: { value: "15.50" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Количество позиции 1" }), { target: { value: "2.5" } });
    const button = screen.getByRole("button", { name: "Создать" });
    fireEvent.submit(button.closest("form")!);
    expect(screen.getByRole("alert").textContent).toContain("Количество");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
