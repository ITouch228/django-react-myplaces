// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Place } from "../../types";
import { EditPlaceDialog } from "./EditPlaceDialog";

const place = {
  id: 7, name: "Кофейня", address: "Тверская",
  latitude: 55.75, longitude: 37.62,
} as Place;

afterEach(cleanup);

describe("EditPlaceDialog", () => {
  it("shows saved values and submits validated changes", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditPlaceDialog place={place} pending={false} onClose={vi.fn()} onSave={onSave} />);
    expect((screen.getByLabelText("Название *") as HTMLInputElement).value).toBe("Кофейня");
    fireEvent.change(screen.getByLabelText("Название *"), { target: { value: "  Кафе  " } });
    fireEvent.change(screen.getByLabelText("Широта"), { target: { value: "56.1" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить изменения" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      name: "Кафе", address: "Тверская", latitude: 56.1, longitude: 37.62,
    }));
  });

  it("rejects invalid coordinates without calling the API", () => {
    const onSave = vi.fn();
    render(<EditPlaceDialog place={place} pending={false} onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Долгота"), { target: { value: "190" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить изменения" }));
    expect(screen.getByRole("alert").textContent).toContain("180");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps entered values on a failed save and displays an API error", async () => {
    const onSave = vi.fn().mockRejectedValue({
      response: { data: { name: ["Это название недопустимо"] } },
    });
    render(<EditPlaceDialog place={place} pending={false} onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Название *"), { target: { value: "Новое кафе" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить изменения" }));
    expect(await screen.findByText("Это название недопустимо")).toBeTruthy();
    expect((screen.getByLabelText("Название *") as HTMLInputElement).value).toBe("Новое кафе");
  });

  it("disables destructive actions while saving", () => {
    render(<EditPlaceDialog place={place} pending onClose={vi.fn()} onSave={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Сохраняем..." }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Отмена" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Закрыть форму" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("closes on Escape without sending changes", () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(<EditPlaceDialog place={place} pending={false} onClose={onClose} onSave={onSave} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
