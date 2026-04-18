import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
