import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useAddCheckItem, useUpdateCheckItem } from "../../hooks/useChecks";
import type { CheckItem } from "../../types";

interface CheckItemFormModalProps {
  checkId: number;
  placeId: number;
  isOpen: boolean;
  onClose: () => void;
  checkItem?: CheckItem | null;
}

export const CheckItemFormModal = ({
  checkId,
  placeId,
  isOpen,
  onClose,
  checkItem,
}: CheckItemFormModalProps) => {
  const [itemName, setItemName] = useState(checkItem?.item_name || "");
  const [price, setPrice] = useState(
    checkItem?.price ? String(checkItem.price) : "",
  );
  const [rating, setRating] = useState(checkItem?.rating || 5);

  const addItem = useAddCheckItem(placeId);
  const updateItem = useUpdateCheckItem(placeId);

  const isEdit = !!checkItem;
  const isLoading = addItem.isPending || updateItem.isPending;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const data = {
      item_name: itemName,
      price: parseFloat(price),
      rating,
    };

    try {
      if (isEdit && checkItem) {
        await updateItem.mutateAsync({ id: checkItem.id, data });
      } else {
        await addItem.mutateAsync({ checkId, ...data });
      }
      onClose();
    } catch {
      alert("Ошибка сохранения позиции");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title">
          {isEdit ? "Редактировать позицию" : "Добавить позицию"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название</label>
            <input
              className="form-control"
              type="text"
              placeholder="Название"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Цена</label>
            <input
              className="form-control"
              type="number"
              step="0.01"
              placeholder="Цена"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Оценка</label>
            <select
              className="form-control"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-10 mt-16">
            <button
              className="btn btn-success"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
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
