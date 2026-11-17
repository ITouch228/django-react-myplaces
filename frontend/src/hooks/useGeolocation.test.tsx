// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useGeolocation } from "./useGeolocation";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useGeolocation", () => {
  it("does not ask for geolocation permission until explicitly requested", () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("isSecureContext", true);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    renderHook(() => useGeolocation());
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("explains why an HTTP LAN page cannot request geolocation", async () => {
    vi.stubGlobal("isSecureContext", false);
    const { result } = renderHook(() => useGeolocation());
    await act(async () => {
      expect(await result.current.requestPosition()).toBeNull();
    });
    expect(result.current.error).toContain("HTTPS");
    expect(result.current.isLocating).toBe(false);
  });

  it("returns coordinates after granting browser permission", async () => {
    vi.stubGlobal("isSecureContext", true);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: (pos: GeolocationPosition) => void) =>
          success({ coords: { latitude: 55.75, longitude: 37.62 } } as GeolocationPosition),
      },
    });
    const { result } = renderHook(() => useGeolocation());
    await act(async () => {
      expect(await result.current.requestPosition()).toEqual([55.75, 37.62]);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.position).toEqual([55.75, 37.62]);
  });
});
