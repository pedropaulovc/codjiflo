import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './features/auth/components';
import { useAuthStore } from './features/auth/stores/useAuthStore';
import { Dashboard, PullRequestView } from './pages';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public route that redirects if already authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pr/:owner/:repo/:number"
            element={
              <ProtectedRoute>
                <PullRequestView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
