import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCreateCheck, useUpdateCheck } from "../../hooks/useChecks";
import type { Check } from "../../types";

interface CheckFormModalProps {
  placeId: number;
  isOpen: boolean;
  onClose: () => void;
  check?: Check | null;
}

export const CheckFormModal = ({
  placeId,
  isOpen,
  onClose,
  check,
}: CheckFormModalProps) => {
  const [visitedAt, setVisitedAt] = useState(
    check?.visited_at || new Date().toISOString().split("T")[0],
  );
  const [comment, setComment] = useState(check?.comment || "");
  const [items, setItems] = useState(
    check?.items.map((item) => ({
      item_name: item.item_name,
      price: String(item.price),
      rating: item.rating || 5,
    })) || [{ item_name: "", price: "", rating: 5 }],
  );

  const createCheck = useCreateCheck();
  const updateCheck = useUpdateCheck();
  const isEdit = !!check;
  const isLoading = createCheck.isPending || updateCheck.isPending;

  const addItem = () => {
    setItems([...items, { item_name: "", price: "", rating: 5 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items
      .filter((i) => i.item_name.trim() && i.price)
      .map((i) => ({
        item_name: i.item_name.trim(),
        price: parseFloat(i.price),
        rating: i.rating,
      }));

    if (!validItems.length) {
      alert("Добавьте хотя бы одну позицию");
      return;
    }

    const data = {
      visited_at: visitedAt,
      comment,
      items: validItems,
    };

    try {
      if (isEdit && check) {
        await updateCheck.mutateAsync({ id: check.id, data });
      } else {
        await createCheck.mutateAsync({
          place: placeId,
          ...data,
        });
      }
      onClose();
    } catch {
      alert("Ошибка сохранения чека");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {isEdit ? "Редактировать чек" : "Новый чек"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Дата посещения</label>
            <input
              className="form-control"
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Комментарий</label>
            <textarea
              className="form-control"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <h4 className="mb-8">Позиции</h4>
          {items.map((item, idx) => (
            <div key={idx} className="item-row">
              <input
                className="form-control item-name"
                placeholder="Название"
                value={item.item_name}
                onChange={(e) => updateItem(idx, "item_name", e.target.value)}
                required
              />
              <input
                className="form-control item-price"
                type="number"
                step="0.01"
                placeholder="Цена"
                value={item.price}
                onChange={(e) => updateItem(idx, "price", e.target.value)}
                required
              />
              <select
                className="form-control item-rating"
                value={item.rating}
                onChange={(e) =>
                  updateItem(idx, "rating", Number(e.target.value))
                }
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => removeItem(idx)}
              >
                ×
              </button>
            </div>
          ))}

          <button
            className="btn btn-secondary btn-sm mt-4"
            type="button"
            onClick={addItem}
          >
            + Добавить позицию
          </button>

          <div className="flex gap-10 mt-16">
            <button
              className="btn btn-success"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onClose}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
