import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ActivityLogProvider } from './context/ActivityLogContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ToastContainer from './components/ToastContainer';
import { OfflineIndicator } from './components/MobileNavigation';

// Ana App içeriği
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'register'

  // Yükleme ekranı
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Yükleniyor...</p>
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

// Toast Container Wrapper
const ToastWrapper = () => {
  const { isDark } = useTheme();
  return <ToastContainer isDark={isDark} />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <ActivityLogProvider>
            <AuthProvider>
              <OfflineIndicator />
              <AppContent />
              <ToastWrapper />
            </AuthProvider>
          </ActivityLogProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
