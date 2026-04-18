import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

const Index = () => {
  const user = useAppStore((s) => s.user);
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
