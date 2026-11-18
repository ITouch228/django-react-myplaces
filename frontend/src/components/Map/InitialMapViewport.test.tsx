// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { Place } from "../../types";

const mocks = vi.hoisted(() => ({
  setView: vi.fn(),
  fitBounds: vi.fn(),
  events: {} as Record<string, (() => void) | undefined>,
}));

vi.mock("react-leaflet", () => ({
  useMap: () => ({ setView: mocks.setView, fitBounds: mocks.fitBounds }),
  useMapEvents: (events: Record<string, () => void>) => {
    mocks.events = events;
  },
}));

import { InitialMapViewport } from "./InitialMapViewport";
import { getSavedPlaceCoordinates } from "./saved-place-coordinates";

const place = (id: number, latitude: number, longitude: number) =>
  ({ id, latitude, longitude }) as Place;

beforeEach(() => {
  mocks.setView.mockReset();
  mocks.fitBounds.mockReset();
  mocks.events = {};
});
afterEach(cleanup);

describe("initial map viewport", () => {
  it("ignores invalid stored coordinates", () => {
    expect(getSavedPlaceCoordinates([
      place(1, 55.75, 37.62),
      place(2, Number.NaN, 42),
      place(3, 100, 50),
    ])).toEqual([[55.75, 37.62]]);
  });

  it("centers one saved place without waiting for GPS", () => {
    render(<InitialMapViewport places={[place(1, 55.75, 37.62)]} position={null} manualTargetActive={false} />);
    expect(mocks.setView).toHaveBeenCalledWith([55.75, 37.62], 15, { animate: false });
    expect(mocks.fitBounds).not.toHaveBeenCalled();
  });

  it("fits the bounds of multiple saved places", () => {
    render(<InitialMapViewport places={[place(1, 55.75, 37.62), place(2, 59.93, 30.32)]} position={null} manualTargetActive={false} />);
    expect(mocks.fitBounds).toHaveBeenCalledOnce();
    expect(mocks.fitBounds.mock.calls[0][1]).toEqual({
      padding: [42, 42], maxZoom: 15, animate: false,
    });
  });

  it("prefers a late GPS result once, without repeatedly moving the map", () => {
    const places = [place(1, 55.75, 37.62)];
    const view = render(<InitialMapViewport places={places} position={null} manualTargetActive={false} />);
    view.rerender(<InitialMapViewport places={places} position={[51.5, -0.12]} manualTargetActive={false} />);
    expect(mocks.setView).toHaveBeenCalledTimes(2);
    expect(mocks.setView).toHaveBeenLastCalledWith([51.5, -0.12], 15, { animate: false });
    view.rerender(<InitialMapViewport places={places} position={[51.5, -0.12]} manualTargetActive={false} />);
    expect(mocks.setView).toHaveBeenCalledTimes(2);
  });

  it("does not override the map after a user drag", () => {
    const places = [place(1, 55.75, 37.62)];
    const view = render(<InitialMapViewport places={places} position={null} manualTargetActive={false} />);
    mocks.events.dragstart?.();
    view.rerender(<InitialMapViewport places={places} position={[51.5, -0.12]} manualTargetActive={false} />);
    expect(mocks.setView).toHaveBeenCalledTimes(1);
  });

  it("does not interfere with explicit navigation", () => {
    render(<InitialMapViewport places={[place(1, 55.75, 37.62)]} position={[51.5, -0.12]} manualTargetActive />);
    expect(mocks.setView).not.toHaveBeenCalled();
    expect(mocks.fitBounds).not.toHaveBeenCalled();
  });
});
