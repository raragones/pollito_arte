import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { LoadingState } from "../../components/States";
export function AdminGuard() {
  const state = useAsync(api.me, []);
  if (state.loading) return <LoadingState />;
  return state.data ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
