import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ActivityLogProvider } from './context/ActivityLogContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ToastContainer from './components/ToastContainer';
import { OfflineIndicator } from './components/MobileNavigation';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

// Şifre güç hesaplama
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 4) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { level: 1, label: 'Çok Zayıf', color: 'bg-red-500' };
  if (score === 2) return { level: 2, label: 'Zayıf', color: 'bg-orange-500' };
  if (score === 3) return { level: 3, label: 'Orta', color: 'bg-yellow-500' };
  if (score === 4) return { level: 4, label: 'Güçlü', color: 'bg-emerald-500' };
  return { level: 5, label: 'Çok Güçlü', color: 'bg-emerald-600' };
};

// Şifre Değiştirme Modalı — uygulama içinde gösterilir
const PasswordChangeModal = () => {
  const { changePassword } = useAuth();
  const { addToast } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Mevcut şifrenizi giriniz');
      return;
    }
    if (!newPassword) {
      setError('Yeni şifre giriniz');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      addToast({ type: 'success', title: 'Şifre Değiştirildi', message: 'Yeni şifreniz başarıyla kaydedildi.' });
    } catch (err) {
      setError(err.message || 'Şifre değiştirilemedi');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl 
                        flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Şifrenizi Değiştirin</h2>
          <p className="text-slate-500 text-sm mt-1">İlk girişiniz olduğu için şifrenizi güncellemeniz gerekmektedir</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mevcut Şifre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mevcut Şifreniz</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="E-posta ile gelen şifrenizi girin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12
                         text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Yeni Şifre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12
                         text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Güç göstergesi */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= strength.level ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  strength.level <= 1 ? 'text-red-500' :
                  strength.level === 2 ? 'text-orange-500' :
                  strength.level === 3 ? 'text-yellow-600' :
                  'text-emerald-600'
                }`}>
                  Şifre Gücü: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Yeni Şifre Onay */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre (Tekrar)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 pl-11 pr-12
                         text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                         ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-slate-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                     text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2
                     transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70"
          >
            {isChanging ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Şifremi Değiştir
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Ana App içeriği
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isDark } = useTheme();
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'register'
  const [loginPrefill, setLoginPrefill] = useState(null); // { email, companyCode }

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
    return (
      <>
        {user?.mustChangePassword && <PasswordChangeModal />}
        <Dashboard />
      </>
    );
  }

  // Giriş yapmamış kullanıcı için Login/Register
  if (authMode === 'login') {
    return <LoginPage prefill={loginPrefill} onSwitchToRegister={() => { setLoginPrefill(null); setAuthMode('register'); }} />;
  }

  return <RegisterPage onSwitchToLogin={(prefillData) => { setLoginPrefill(prefillData || null); setAuthMode('login'); }} />;
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
