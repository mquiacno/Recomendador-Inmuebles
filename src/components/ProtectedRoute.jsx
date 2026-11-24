import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Card, Skeleton } from "./ui";

export function ProtectedRoute() {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-4 px-4 py-12" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
