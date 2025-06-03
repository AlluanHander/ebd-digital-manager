
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";

// Pages
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/classes" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Gerenciamento de Classes</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {JSON.parse(localStorage.getItem('ebd_current_user') || '{}')?.type === 'professor' ? 'Presença' : 'Presença Geral'}
              </h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/announcements" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Avisos</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/birthdays" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Aniversários</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/visitors" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Visitantes</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventário</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Relatórios</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Cadastros</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Calendário</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h1>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
