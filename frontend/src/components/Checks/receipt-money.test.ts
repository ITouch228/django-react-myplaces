import { describe, expect, it } from "vitest";
import { displayMoney, toReceiptItem, validateReceiptItem } from "./receipt-money";

const item = { item_name: "Кофе", price: "0.10", quantity: "3", rating: 5 };

describe("receipt item money and quantity", () => {
  it("keeps decimal amounts as strings in the API payload", () => {
    expect(toReceiptItem(item)).toEqual({
      item_name: "Кофе", price: "0.10", quantity: 3, rating: 5,
    });
    expect(validateReceiptItem(item)).toBeNull();
  });

  it("rejects zero, fractional and oversized quantities", () => {
    for (const quantity of ["0", "2.5", "-1", "100001", ""]) {
      expect(validateReceiptItem({ ...item, quantity })).toContain("Количество");
    }
  });

  it("rejects malformed unit prices and excess precision", () => {
    for (const price of ["", "-1", "NaN", "1.001", "12,34", "abc", "123456789.00"]) {
      expect(validateReceiptItem({ ...item, price })).not.toBeNull();
    }
  });

  it("rejects an empty item name", () => {
    expect(validateReceiptItem({ ...item, item_name: "  " })).toContain("название");
  });

  it("formats server totals without doing any arithmetic", () => {
    expect(displayMoney("451.50")).toMatch(/451,50/);
  });
});
