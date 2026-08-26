import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { routePaths } from "@/routes/routePaths";

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} state={{ from: location }} replace />;
  }
  return <Outlet />;
}
