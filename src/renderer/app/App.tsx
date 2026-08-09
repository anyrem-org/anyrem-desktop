import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthGuard } from '../features/auth/components/AuthGuard';
import { useGoogleAuthListener, useSessionBootstrap } from '../features/auth/hooks/useAuth';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { useAuthStore } from '../features/auth/store/auth.store';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';
import { CategoryDetailPage } from '../features/categories/pages/CategoryDetailPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { NoteEditorPage } from '../features/notes/pages/NoteEditorPage';
import { QuickCreatePage } from '../features/quick-access/pages/QuickCreatePage';
import { QuickSearchPage } from '../features/quick-access/pages/QuickSearchPage';
import { SearchHomePage } from '../features/search/pages/SearchHomePage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { AppShell } from '../layouts/AppShell';

export default function App() {
  const navigate = useNavigate();
  useSessionBootstrap();
  useGoogleAuthListener();
  const authStatus = useAuthStore((state) => state.status);
  useEffect(() => window.desktop?.onNavigate(navigate), [navigate]);
  if (authStatus === 'initializing')
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fc] text-sm text-muted-foreground">
        Restoring session…
      </main>
    );
  return (
    <Routes>
      <Route path="/quick-search" element={<QuickSearchPage />} />
      <Route path="/quick-create" element={<QuickCreatePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/search" element={<SearchHomePage />} />
        <Route path="/notes/new" element={<NoteEditorPage />} />
        <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
        <Route path="/notes/:id" element={<NoteEditorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:id" element={<CategoryDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
