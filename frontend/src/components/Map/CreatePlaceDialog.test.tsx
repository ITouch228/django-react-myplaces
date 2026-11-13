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
});
