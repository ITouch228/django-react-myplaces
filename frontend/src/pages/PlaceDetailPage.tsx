import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckList } from "../components/Checks/CheckList";
import { CheckFormModal } from "../components/Modals/CheckFormModal";
import { CheckItemFormModal } from "../components/Modals/CheckItemFormModal";
import { useDeletePlace, usePlace } from "../hooks/usePlaces";
import type { Check, CheckItem } from "../types";

export const PlaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const placeId = Number(id);

  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [editingItem, setEditingItem] = useState<CheckItem | null>(null);
  const [activeCheckId, setActiveCheckId] = useState<number | null>(null);

  const { data: place, isLoading, error } = usePlace(placeId);

  const deletePlace = useDeletePlace();
  const navigate = useNavigate();

  const handleDeletePlace = async () => {
    if (!confirm(`Удалить место "${place?.name}" и все связанные чеки?`))
      return;
    try {
      await deletePlace.mutateAsync(placeId);
      navigate("/");
    } catch {
      alert("Ошибка удаления места");
    }
  };

  const handleAddItem = (checkId: number) => {
    setActiveCheckId(checkId);
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleEditItem = (item: CheckItem, checkId: number) => {
    setActiveCheckId(checkId);
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleEditCheck = (check: Check) => {
    setEditingCheck(check);
    setCheckModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
    setActiveCheckId(null);
  };

  const handleCloseCheckModal = () => {
    setCheckModalOpen(false);
    setEditingCheck(null);
  };

  if (isLoading)
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-text" style={{ width: "80%" }} />
      </div>
    );
  if (error)
    return (
      <div className="text-center text-muted mt-20">Ошибка загрузки места</div>
    );
  if (!place)
    return <div className="text-center text-muted mt-20">Место не найдено</div>;

  return (
    <div className="container animate-fade-in">
      <div className="flex-between mb-16 animate-slide-left">
        <Link to="/" className="btn btn-secondary btn-sm">
          ← На карту
        </Link>

        <h1 className="place-name">{place.name}</h1>

        <button
          className="btn btn-danger"
          onClick={handleDeletePlace}
          style={{ marginLeft: 12 }}
        >
          🗑 Удалить место
        </button>
      </div>

      {place.address && (
        <p className="place-address animate-fade-in delay-200">
          {place.address}
        </p>
      )}

      <div className="stats-bar animate-fade-in delay-300">
        <span className="stat">
          ⭐ <span className="stat-value">{place.avg_rating || "—"}</span>
        </span>
        <span className="stat">
          💰 <span className="stat-value">{place.avg_price || "—"} ₽</span>
        </span>
        <span className="stat">
          🧾 <span className="stat-value">{place.total_checks || 0}</span>
        </span>
      </div>

      <button
        className="btn btn-primary mt-16 mb-16 animate-fade-in delay-400 hover-scale"
        onClick={() => {
          setEditingCheck(null);
          setCheckModalOpen(true);
        }}
      >
        + Добавить чек
      </button>

      <div className="animate-fade-in delay-500">
        <CheckList
          checks={place.checks || []}
          onEditCheck={handleEditCheck}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
        />
      </div>

      <CheckFormModal
        key={`check-${editingCheck?.id ?? "new"}`}
        isOpen={checkModalOpen}
        onClose={handleCloseCheckModal}
        placeId={placeId}
        check={editingCheck}
      />

      <CheckItemFormModal
        key={`item-${editingItem?.id ?? "new"}`}
        checkId={activeCheckId!}
        placeId={placeId}
        isOpen={itemModalOpen}
        onClose={handleCloseItemModal}
        checkItem={editingItem}
      />
    </div>
  );
};
