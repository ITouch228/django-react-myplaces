import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AccountMenu } from "../Account/AccountMenu";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Загрузка...</div>;
  return user ? (
    <>
      <AccountMenu />
      <Outlet />
    </>
  ) : <Navigate to="/login" replace />;
};
