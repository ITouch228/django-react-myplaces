/** Money is sent as a decimal string; JavaScript floats must not calculate totals. */
export function validateReceiptItem(item: { item_name: string; price: string; quantity: string | number }) {
  if (!item.item_name.trim()) return "Введите название позиции.";
  const price = item.price.trim();
  if (!/^(?:\d+)(?:\.\d{1,2})?$/.test(price)) return "Введите цену в рублях, максимум 2 знака после точки.";
  const integer = price.split(".")[0];
  if (integer.length > 8) return "Цена слишком велика.";
  const quantity = Number(item.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) {
    return "Количество должно быть целым числом от 1 до 100000.";
  }
  return null;
}

export function toReceiptItem(item: { item_name: string; price: string; quantity: string | number; rating: number | null }) {
  return {
    item_name: item.item_name.trim(),
    price: item.price.trim(),
    quantity: Number(item.quantity),
    rating: item.rating,
  };
}

export function displayMoney(value: string | number) {
  const [integer, fraction = ""] = String(value).split(".");
  const groups = integer.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  return `${groups},${fraction.padEnd(2, "0").slice(0, 2)}`;
}
