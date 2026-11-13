// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreatePlaceDialog, validatePlaceName } from "./CreatePlaceDialog";

afterEach(cleanup);

describe("place name validation", () => {
  it("rejects blank or oversized names", () => {
    expect(validatePlaceName("   ")).not.toBeNull();
    expect(validatePlaceName("a".repeat(201))).not.toBeNull();
    expect(validatePlaceName(" Кофейня ")).toBeNull();
  });
});

describe("create place dialog", () => {
  const coordinates = { lat: 55.7522, lng: 37.6156 };

  it("does not save an empty name", () => {
    const onSave = vi.fn();
    render(
      <CreatePlaceDialog coordinates={coordinates} pending={false} error={null} onClose={vi.fn()} onSave={onSave} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Сохранить место" }));
    expect(screen.getByRole("alert").textContent).toContain("Введите название");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("passes coordinates and optional address to the save handler", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CreatePlaceDialog coordinates={coordinates} pending={false} error={null} onClose={vi.fn()} onSave={onSave} />,
    );
    fireEvent.change(screen.getByLabelText("Название *"), { target: { value: "  Кофейня  " } });
    fireEvent.change(screen.getByLabelText("Адрес (необязательно)"), { target: { value: "  Арбат  " } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить место" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      name: "Кофейня", address: "Арбат", latitude: coordinates.lat, longitude: coordinates.lng,
    }));
  });

  it("closes without saving and displays the server error", () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <CreatePlaceDialog
        coordinates={coordinates}
        pending={false}
        error="Не удалось сохранить место."
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain("Не удалось сохранить");
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("disables buttons while saving", () => {
    render(
      <CreatePlaceDialog coordinates={coordinates} pending error={null} onClose={vi.fn()} onSave={vi.fn()} />,
    );
    expect((screen.getByRole("button", { name: "Сохраняем..." }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Отмена" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("closes on Escape when idle but not during an active save", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <CreatePlaceDialog coordinates={coordinates} pending={false} error={null} onClose={onClose} onSave={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    onClose.mockClear();
    rerender(
      <CreatePlaceDialog coordinates={coordinates} pending error={null} onClose={onClose} onSave={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("resets inputs when a different point is selected", () => {
    const { rerender } = render(
      <CreatePlaceDialog coordinates={coordinates} pending={false} error={null} onClose={vi.fn()} onSave={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("Название *"), { target: { value: "Кафе" } });
    rerender(
      <CreatePlaceDialog coordinates={{ lat: 51.5, lng: -0.12 }} pending={false} error={null} onClose={vi.fn()} onSave={vi.fn()} />,
    );
    expect((screen.getByLabelText("Название *") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("51.50000, -0.12000")).toBeTruthy();
  });

  it("requires a name of at most 200 characters", () => {
    const onSave = vi.fn();
    render(
      <CreatePlaceDialog coordinates={coordinates} pending={false} error={null} onClose={vi.fn()} onSave={onSave} />,
    );
    fireEvent.change(screen.getByLabelText("Название *"), { target: { value: "X".repeat(201) } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить место" }));
    expect(screen.getByRole("alert").textContent).toContain("200");
    expect(onSave).not.toHaveBeenCalled();
  });

});
