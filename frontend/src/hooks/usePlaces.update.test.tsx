// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Place } from "../types";

const mocks = vi.hoisted(() => ({ patch: vi.fn() }));
vi.mock("../api/api", () => ({ api: { patch: mocks.patch } }));

import { useUpdatePlace } from "./usePlaces";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useUpdatePlace", () => {
  it("PATCHes the existing place and refreshes detail/map query data", async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const previous = { id: 7, name: "Старое", address: "", latitude: 55.7, longitude: 37.6 } as Place;
    const updated = { ...previous, name: "Новое", latitude: 55.8 };
    client.setQueryData(["place", 7], previous);
    const invalidation = vi.spyOn(client, "invalidateQueries");
    mocks.patch.mockResolvedValue({ data: updated });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdatePlace(), { wrapper });
    const data = { name: "Новое", address: "", latitude: 55.8, longitude: 37.6 };

    await act(async () => {
      await result.current.mutateAsync({ id: 7, data });
    });

    expect(mocks.patch).toHaveBeenCalledWith("/api/places/7/", data);
    expect(client.getQueryData<Place>(["place", 7])?.name).toBe("Новое");
    await waitFor(() => {
      expect(invalidation).toHaveBeenCalledWith({ queryKey: ["place", 7] });
      expect(invalidation).toHaveBeenCalledWith({ queryKey: ["places"] });
    });
  });
});
