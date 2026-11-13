import { useState } from "react";
import { CheckItemFormModal } from "../Modals/CheckItemFormModal";
import { useDeleteCheck, useDeleteCheckItem } from "../../hooks/useChecks";
import type { Check, CheckItem } from "../../types";
import "./checks.css";

interface CheckListProps {
  checks: Check[];
  onEditCheck?: (check: Check) => void;
  onAddItem?: (checkId: number) => void;
  onEditItem?: (item: CheckItem, checkId: number) => void;
}

const money = (amount: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

function CheckCard({
  check,
  onEditCheck,
  onAddItem,
  onEditItem,
}: {
  check: Check;
  onEditCheck?: (check: Check) => void;
  onAddItem?: (checkId: number) => void;
  onEditItem?: (item: CheckItem, checkId: number) => void;
}) {
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
    <article className="receipt-card">
      <button
        type="button"
        className="receipt-card__summary"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls={`receipt-items-${check.id}`}
      >
        <span className="receipt-card__primary">
          <span className="receipt-card__date">
            {new Date(check.visited_at + "T00:00:00").toLocaleDateString("ru-RU", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <span className="receipt-card__subtitle">Чек №{check.id} · {check.items.length} позиций</span>
        </span>
        <span className="receipt-card__numbers">
          <strong>{money(check.total)} ₽</strong>
          <span>★ {check.avg_rating == null ? "Нет оценки" : check.avg_rating}</span>
        </span>
        <span className="receipt-card__chevron" aria-hidden="true">{isOpen ? "⌃" : "⌄"}</span>
      </button>

      {isOpen && (
        <div className="receipt-card__details" id={`receipt-items-${check.id}`}>
          {check.comment && <p className="receipt-card__comment">{check.comment}</p>}
          {check.items.length === 0 ? (
            <p className="receipt-card__no-items">В этом чеке пока нет позиций.</p>
          ) : (
            <div className="receipt-card__items">
              {check.items.map((item) => (
                <div className="receipt-card__item" key={item.id}>
                  <span className="receipt-card__item-name">{item.item_name}</span>
                  <span className="receipt-card__item-price">{money(item.price)} ₽</span>
                  <span className="receipt-card__item-rating">
                    {item.rating == null ? "Без оценки" : `★ ${item.rating}`}
                  </span>
                  <div className="receipt-card__item-actions">
                    <button type="button" title="Изменить позицию" aria-label={`Изменить ${item.item_name}`} onClick={() => onEditItem?.(item, check.id)}>✎</button>
                    <button type="button" title="Удалить позицию" aria-label={`Удалить ${item.item_name}`} onClick={() => handleDeleteItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="receipt-card__footer">
            <button
              type="button"
              className="receipt-card__add"
              onClick={() => onAddItem ? onAddItem(check.id) : setIsAddItemOpen(true)}
            >
              + Добавить позицию
            </button>
            <div className="receipt-card__footer-actions">
              <button type="button" onClick={() => onEditCheck?.(check)}>Изменить чек</button>
              <button type="button" className="receipt-card__delete" onClick={handleDeleteCheck}>Удалить</button>
            </div>
          </div>
          {!onAddItem && (
            <CheckItemFormModal
              isOpen={isAddItemOpen}
              onClose={() => setIsAddItemOpen(false)}
              checkId={check.id}
              placeId={check.place}
            />
          )}
        </div>
      )}
    </article>
  );
}

export const CheckList = ({ checks, onEditCheck, onAddItem, onEditItem }: CheckListProps) => {
  if (checks.length === 0) {
    return (
      <div className="receipts-empty">
        <span aria-hidden="true">🧾</span>
        <h3>Пока нет чеков</h3>
        <p>Добавь первый визит, чтобы сохранить блюда, цены и впечатления.</p>
      </div>
    );
  }

  const sorted = [...checks].sort((a, b) => b.visited_at.localeCompare(a.visited_at));

  return (
    <section className="receipts">
      <div className="receipts__heading">
        <h2>История посещений</h2>
        <span>{checks.length} чеков</span>
      </div>
      <div className="receipts__list">
        {sorted.map((check) => (
          <CheckCard
            key={check.id}
            check={check}
            onEditCheck={onEditCheck}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
          />
        ))}
      </div>
    </section>
  );
};
