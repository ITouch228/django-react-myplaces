import { useState } from "react";
import { CheckItemFormModal } from "../Modals/CheckItemFormModal";
import { useDeleteCheck, useDeleteCheckItem } from "../../hooks/useChecks";
import type { Check, CheckItem } from "../../types";

interface CheckListProps {
  checks: Check[];
  onEditCheck?: (check: Check) => void;
  onAddItem?: (checkId: number) => void;
  onEditItem?: (item: CheckItem, checkId: number) => void;
}

const CheckAccordion = ({
  check,
  onEditCheck,
  onAddItem,
  onEditItem,
}: {
  check: Check;
  onEditCheck?: (check: Check) => void;
  onAddItem?: (checkId: number) => void;
  onEditItem?: (item: CheckItem, checkId: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const deleteCheck = useDeleteCheck(check.place);
  const deleteItem = useDeleteCheckItem(check.place);

  const handleDeleteCheck = async () => {
    if (!confirm("Удалить чек?")) return;
    try {
      await deleteCheck.mutateAsync(check.id);
    } catch {
      alert("Ошибка удаления чека");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Удалить позицию?")) return;
    try {
      await deleteItem.mutateAsync(itemId);
    } catch {
      alert("Ошибка удаления позиции");
    }
  };

  return (
    <div className="check-item">
      <div
        className="check-item-header flex-between hover-lift"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-8">
          <strong>Чек #{check.id}</strong>
          <span className="text-muted text-sm">
            {new Date(check.visited_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
        <div className="flex gap-8">
          <span className="text-sm">💰 {check.total} ₽</span>
          <span className="text-sm">⭐ {check.avg_rating || "—"}</span>
          <span
            className={`text-sm text-muted check-arrow ${isOpen ? "open" : ""}`}
          >
            {isOpen ? "▲" : "▼"}
          </span>
          <button
            className="btn btn-warning btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditCheck?.(check);
            }}
          >
            Изменить
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCheck();
            }}
          >
            Удалить
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={`check-item-body ${isOpen ? "open" : ""}`}>
          {check.comment && (
            <p className="text-muted text-sm mt-4 mb-8">"{check.comment}"</p>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Оценка</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {check.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td>{item.price} ₽</td>
                  <td>{item.rating ? `⭐ ${item.rating}` : "—"}</td>
                  <td>
                    <div className="flex gap-4">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => onEditItem?.(item, check.id)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="btn btn-secondary btn-sm mt-10"
            onClick={() => {
              if (onAddItem) {
                onAddItem(check.id);
              } else {
                setIsAddItemOpen(true);
              }
            }}
          >
            + Добавить позицию
          </button>

          <CheckItemFormModal
            isOpen={isAddItemOpen}
            onClose={() => setIsAddItemOpen(false)}
            checkId={check.id}
            placeId={check.place}
          />
        </div>
      )}
    </div>
  );
};

export const CheckList = ({
  checks,
  onEditCheck,
  onAddItem,
  onEditItem,
}: CheckListProps) => {
  if (checks.length === 0)
    return <p className="text-muted">Нет чеков. Добавьте первый!</p>;

  const sorted = [...checks].sort(
    (a, b) =>
      new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
  );

  return (
    <div>
      <h3 className="mb-16">Все чеки ({checks.length})</h3>
      {sorted.map((check, index) => (
        <div
          key={check.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CheckAccordion
            check={check}
            onEditCheck={onEditCheck}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
          />
        </div>
      ))}
    </div>
  );
};
