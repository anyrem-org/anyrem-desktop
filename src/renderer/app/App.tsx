import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { AuthGuard } from '../features/auth/components/AuthGuard';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';
import { CategoryDetailPage } from '../features/categories/pages/CategoryDetailPage';
import { GraphPage } from '../features/graph/pages/GraphPage';
import { NoteDetailPage } from '../features/notes/pages/NoteDetailPage';
import { NoteEditorPage } from '../features/notes/pages/NoteEditorPage';
import { SearchHomePage } from '../features/search/pages/SearchHomePage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { QuickCreatePage } from '../features/quick-access/pages/QuickCreatePage';
import { QuickSearchPage } from '../features/quick-access/pages/QuickSearchPage';
import { useSessionBootstrap } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../features/auth/store/auth.store';

export default function App() {
  const navigate = useNavigate();
  useSessionBootstrap();
  const authStatus = useAuthStore((state) => state.status);
  useEffect(() => window.desktop?.onNavigate(navigate), [navigate]);
  if (authStatus === 'initializing') return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] text-sm text-muted-foreground">Restoring session…</main>;
  return <Routes><Route path="/quick-search" element={<QuickSearchPage/>}/><Route path="/quick-create" element={<QuickCreatePage/>}/><Route path="/login" element={<LoginPage/>}/><Route element={<AuthGuard><AppShell/></AuthGuard>}><Route path="/" element={<DashboardPage/>}/><Route path="/search" element={<SearchHomePage/>}/><Route path="/notes/new" element={<NoteEditorPage/>}/><Route path="/notes/:id/edit" element={<NoteEditorPage/>}/><Route path="/notes/:id" element={<NoteDetailPage/>}/><Route path="/categories" element={<CategoriesPage/>}/><Route path="/categories/:id" element={<CategoryDetailPage/>}/><Route path="/graph" element={<GraphPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>;
}
