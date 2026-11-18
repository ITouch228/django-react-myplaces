import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import "./account-menu.css";

/** Available on every authenticated screen, independent of the map layers. */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
    // Prevent showing a previous user's private data from React Query cache.
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-menu__trigger"
        aria-label={`Аккаунт: ${user.username}`}
        aria-haspopup="menu"
        aria-controls="account-menu-popover"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account-menu__avatar" aria-hidden="true">{user.username.charAt(0).toLocaleUpperCase()}</span>
        <span className="account-menu__username" title={user.username}>{user.username}</span>
        <span className={`account-menu__chevron ${open ? "account-menu__chevron--open" : ""}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="account-menu__popover" id="account-menu-popover" role="menu" aria-label="Меню аккаунта">
          <div className="account-menu__identity">
            <strong>{user.username}</strong>
            <span>{user.email || "Личный аккаунт"}</span>
          </div>
          <div className="account-menu__placeholder" aria-disabled="true">
            <span aria-hidden="true">⚙</span> Настройки
            <small>Скоро</small>
          </div>
          <button type="button" role="menuitem" className="account-menu__logout" onClick={handleLogout}>
            <span aria-hidden="true">↪</span> Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
}
