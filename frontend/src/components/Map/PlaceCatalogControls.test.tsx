// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Place } from "../../types";
import { PlaceCatalogControls } from "./PlaceCatalogControls";

const place = {
  id: 1, name: "Кофейня", category: "cafe", visit_status: "want",
  is_favorite: false,
} as Place;
afterEach(cleanup);

describe("PlaceCatalogControls", () => {
  it("sends partial PATCH payloads for each catalog control", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PlaceCatalogControls place={place} pending={false} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Тип заведения"), { target: { value: "bar" } });
    fireEvent.change(screen.getByLabelText("Планы"), { target: { value: "visited" } });
    fireEvent.click(screen.getByRole("button", { name: "☆ В избранное" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(3));
    expect(onSave).toHaveBeenNthCalledWith(1, { category: "bar" });
    expect(onSave).toHaveBeenNthCalledWith(2, { visit_status: "visited" });
    expect(onSave).toHaveBeenNthCalledWith(3, { is_favorite: true });
  });

  it("disables controls during a pending request", () => {
    render(<PlaceCatalogControls place={place} pending onSave={vi.fn()} />);
    expect((screen.getByLabelText("Тип заведения") as HTMLSelectElement).disabled).toBe(true);
    expect((screen.getByLabelText("Планы") as HTMLSelectElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "☆ В избранное" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows an error when saving fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("offline"));
    render(<PlaceCatalogControls place={place} pending={false} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "☆ В избранное" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("Не удалось"));
  });
});
