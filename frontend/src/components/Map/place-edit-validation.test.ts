import { describe, expect, it } from "vitest";
import { getPlaceEditApiErrors, validatePlaceEdit } from "./place-edit-validation";

const valid = {
  name: "  Кофейня  ",
  address: "  Тверская  ",
  latitude: "55.7558",
  longitude: "37.6173",
};

describe("place edit validation", () => {
  it("trims text and converts valid coordinates", () => {
    expect(validatePlaceEdit(valid)).toEqual({
      errors: {},
      data: {
        name: "Кофейня",
        address: "Тверская",
        latitude: 55.7558,
        longitude: 37.6173,
      },
    });
  });

  it("allows zero, boundary coordinates and an empty address", () => {
    expect(validatePlaceEdit({ ...valid, address: "", latitude: "-90", longitude: "180" }).data).toEqual({
      name: "Кофейня", address: "", latitude: -90, longitude: 180,
    });
  });

  it("rejects invalid names and coordinate ranges", () => {
    const result = validatePlaceEdit({ ...valid, name: " ", latitude: "91", longitude: "-181" });
    expect(result.data).toBeUndefined();
    expect(result.errors.name).toContain("название");
    expect(result.errors.latitude).toContain("-90");
    expect(result.errors.longitude).toContain("-180");
  });

  it("rejects blank, nonnumeric and nonfinite coordinates", () => {
    expect(validatePlaceEdit({ ...valid, latitude: "", longitude: "NaN" }).data).toBeUndefined();
    expect(validatePlaceEdit({ ...valid, latitude: "Infinity", longitude: "1,2" }).data).toBeUndefined();
  });

  it("maps API field errors to relevant inputs", () => {
    expect(getPlaceEditApiErrors({
      response: { data: { name: ["Недопустимое название"], latitude: ["Неверное значение"] } },
    })).toEqual({
      fields: { name: "Недопустимое название", latitude: "Неверное значение" },
      general: null,
    });
  });

  it("explains unexpected API failures", () => {
    expect(getPlaceEditApiErrors(new Error("offline")).general).toContain("соединение");
  });
});
