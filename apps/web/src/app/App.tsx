import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminGuard } from "../features/auth/AdminGuard";
import { HomePage } from "../pages/HomePage";
import { GalleryPage } from "../pages/GalleryPage";
import { DetailPage } from "../pages/DetailPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { EvolutionPage } from "../pages/EvolutionPage";
import { AboutPage } from "../pages/AboutPage";
import { LoginPage } from "../pages/admin/LoginPage";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { DrawingsAdminPage } from "../pages/admin/DrawingsAdminPage";
import { DrawingFormPage } from "../pages/admin/DrawingFormPage";
import { CollectionsAdminPage } from "../pages/admin/CollectionsAdminPage";
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dibujos" element={<GalleryPage />} />
          <Route path="dibujos/:slug" element={<DetailPage />} />
          <Route path="colecciones" element={<CollectionsPage />} />
          <Route path="favoritos" element={<GalleryPage favorites />} />
          <Route path="evolucion" element={<EvolutionPage />} />
          <Route path="sobre-mi" element={<AboutPage />} />
        </Route>
        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dibujos" element={<DrawingsAdminPage />} />
            <Route path="dibujos/nuevo" element={<DrawingFormPage />} />
            <Route path="dibujos/:id" element={<DrawingFormPage />} />
            <Route path="colecciones" element={<CollectionsAdminPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
