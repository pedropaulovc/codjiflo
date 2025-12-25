import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for scaffolding
const LoginScreen = () => <div className="p-8 text-center"><h1>Login Screen</h1><p>Placeholder for S-1.1</p></div>;
const Dashboard = () => <div className="p-8 text-center"><h1>Dashboard</h1><p>Placeholder for S-1.2</p></div>;
const PullRequestView = () => <div className="p-8 text-center"><h1>Pull Request View</h1><p>Placeholder for S-1.2+</p></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pr/:id" element={<PullRequestView />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
