import { Toaster } from "@/components/ui/toaster.jsx"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client.js'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound.jsx';
import { AuthProvider, useAuth } from '@/lib/AuthContext.jsx';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado e não estiver na página de cadastro,
  // poderíamos redirecionar para login. Mas como as rotas são definidas abaixo,
  // vamos deixar o roteamento normal acontecer e proteger as rotas internamente 
  // ou criar um componente ProtectedRoute.
  // 
  // Para simplificar, vou alterar o layout das rotas abaixo.

  // Render the main app
  return (
    <Routes>
      <Route path="/Login" element={<Pages.Login />} />
      <Route path="/Cadastro" element={<Pages.Cadastro />} />
      <Route path="/reset-password" element={<Pages.ResetPassword />} />

      <Route path="/" element={
        <ProtectedRoute>
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        </ProtectedRoute>
      } />

      {Object.entries(Pages).map(([path, Page]) => {
        if (path === 'Login' || path === 'Cadastro' || path === 'ResetPassword') return null;

        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

// Componente para proteger rotas privadas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return null;

  if (!isAuthenticated) {
    // Redireciona para login e salva a localização atual para retornar depois
    return <Navigate to="/Login" replace />;
  }

  return children;
};




function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
