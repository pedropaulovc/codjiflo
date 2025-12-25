import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from '@/features/auth/components';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

// Placeholder components for scaffolding
const Dashboard = () => <div className="p-8 text-center"><h1>Dashboard</h1><p>Placeholder for S-1.2</p></div>;
const PullRequestView = () => <div className="p-8 text-center"><h1>Pull Request View</h1><p>Placeholder for S-1.2+</p></div>;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginScreen />
              </PublicOnlyRoute>
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
            path="/pr/:id"
            element={
              <ProtectedRoute>
                <PullRequestView />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
