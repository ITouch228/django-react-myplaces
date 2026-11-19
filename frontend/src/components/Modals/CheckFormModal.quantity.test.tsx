// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CheckFormModal } from "./CheckFormModal";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../hooks/useChecks", () => ({
  useCreateCheck: () => ({ mutateAsync: mocks.create, isPending: false }),
  useUpdateCheck: () => ({ mutateAsync: mocks.update, isPending: false }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("receipt quantity input", () => {
  it("includes quantity in the receipt payload", async () => {
    mocks.create.mockResolvedValue({ id: 7 });
    render(<CheckFormModal placeId={1} isOpen onClose={vi.fn()} />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText("Название"), { target: { value: "Чай" } });
    fireEvent.change(screen.getByPlaceholderText("Цена за единицу"), { target: { value: "120.50" } });
    fireEvent.change(screen.getByLabelText("Количество позиции 1"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      place: 1,
      items: [{ item_name: "Чай", price: 120.5, quantity: 3, rating: 5 }],
    })));
  });

  it("rejects invalid quantities before submission", () => {
    render(<CheckFormModal placeId={1} isOpen onClose={vi.fn()} />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText("Название"), { target: { value: "Чай" } });
    fireEvent.change(screen.getByPlaceholderText("Цена за единицу"), { target: { value: "120.50" } });
    fireEvent.change(screen.getByLabelText("Количество позиции 1"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    expect(mocks.create).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("количество");
  });
});
