import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from './routes';
import AppShell from '@/components/layout/AppShell';
import PageLoader from '@/components/ui/PageLoader';
import ProtectedRoute from './ProtectedRoute';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import BackToTop from '@/components/ui/BackToTop';
import FloatingContact from '@/components/ui/FloatingContact';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

import { useMe } from '@/hooks/useAuth';

function AuthSync() {
  useMe();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Standalone bare routes (landing, login, register, privacy) */}
            {routes
              .filter((r) => r.layout === 'bare')
              .map(({ path, element: Element }) => (
                <Route key={path} path={path} element={<Element />} />
              ))}

            {/* Persistent AppShell layout: preserves shell, mobile drawer, and topbar across routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              {routes
                .filter((r) => r.layout === 'app')
                .map(({ path, element: Element }) => (
                  <Route key={path} path={path} element={<Element />} />
                ))}
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
