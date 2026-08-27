import React, { useState } from 'react';
import { ERPProvider } from './context/ERPContext';
import { ApplicationShell } from './components/layout/ApplicationShell';
import { LoginPage } from './pages/LoginPage';

export const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in to present demo shell immediately

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <ApplicationShell />;
};

export function App() {
  return (
    <ERPProvider>
      <AppContent />
    </ERPProvider>
  );
}

export default App;
