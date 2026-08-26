import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth/auth.types";

interface ProtectedSectionProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

/**
 * Reusable route-level auth wrapper template.
 * Keep auth state consumption in hooks/context and keep access decisions at route boundaries.
 */
export function ProtectedSection({
  children,
  requireAuth = true,
  allowedRoles,
  fallbackPath = "/forbidden",
}: ProtectedSectionProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
