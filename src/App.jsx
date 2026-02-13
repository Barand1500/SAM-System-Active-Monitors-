import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

// Ana App içeriği
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'register'

  // Yükleme ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapmış kullanıcı için Dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Giriş yapmamış kullanıcı için Login/Register
  if (authMode === 'login') {
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
