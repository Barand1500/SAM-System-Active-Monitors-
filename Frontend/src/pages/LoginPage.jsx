import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  X
} from 'lucide-react';

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

// Şifre Değiştirme Modalı
const PasswordChangeModal = ({ currentPassword, onComplete, onSkip }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const { changePassword } = useAuth();

  const strength = getPasswordStrength(newPassword);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError('Yeni şifre giriniz');
      return;
    }
    setError('');
    setIsChanging(true);
    try {
      await changePassword(newPassword);
      onComplete();
    } catch (err) {
      setError(err.message || 'Şifre değiştirilemedi');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl 
                        flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hoş Geldiniz!</h2>
          <p className="text-slate-500 text-sm mt-1">İlk girişiniz için şifre ayarları</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Mevcut Şifre */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Şu anki şifreniz</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              readOnly
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-20
                       text-slate-800 font-mono tracking-wider"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                title={showCurrentPassword ? 'Gizle' : 'Göster'}
              >
                {showCurrentPassword ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-slate-400" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                title="Kopyala"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-400" />}
              </button>
            </div>
          </div>
          {copied && <p className="text-xs text-emerald-600 mt-1">Kopyalandı!</p>}
        </div>

        {/* Yeni Şifre */}
        <div className="border-t border-slate-100 pt-5">
          <p className="text-sm text-slate-600 mb-3">İsterseniz şifrenizi değiştirebilirsiniz</p>
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
            <div className="mt-3">
              <div className="flex gap-1 mb-1.5">
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

          {newPassword && (
            <button
              onClick={handleChangePassword}
              disabled={isChanging}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
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
          )}
        </div>

        <button
          onClick={onSkip}
          className="w-full mt-3 text-slate-500 hover:text-slate-700 font-medium py-2.5 text-sm transition-colors"
        >
          Şimdilik bu şifreyle devam et
        </button>
      </div>
    </div>
  );
};

const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const [formData, setFormData] = useState({
    companyCode: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Şifre değiştirme modalı state'i
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.companyCode, formData.email, formData.password);
      
      // mustChangePassword kontrolü
      if (result?.mustChangePassword) {
        setLoginPassword(formData.password);
        setShowPasswordModal(true);
      } else {
        addToast({ type: 'success', title: 'Giriş Başarılı', message: 'Hoş geldiniz!' });
      }
    } catch (err) {
      setError(err.message);
      addToast({ type: 'error', title: 'Giriş Hatası', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChangeComplete = () => {
    setShowPasswordModal(false);
    addToast({ type: 'success', title: 'Şifre Değiştirildi', message: 'Yeni şifreniz kaydedildi. Hoş geldiniz!' });
  };

  const handlePasswordChangeSkip = () => {
    setShowPasswordModal(false);
    addToast({ type: 'success', title: 'Giriş Başarılı', message: 'Hoş geldiniz!' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Şifre Değiştirme Modalı */}
      {showPasswordModal && (
        <PasswordChangeModal
          currentPassword={loginPassword}
          onComplete={handlePasswordChangeComplete}
          onSkip={handlePasswordChangeSkip}
        />
      )}

      {/* Sol Panel - Bilgi */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif elementler */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="text-white text-2xl font-bold">İş Takip</span>
          </div>
          <p className="text-white/70 mt-2">Profesyonel İş Yönetim Platformu</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Ekibinizi yönetin,<br/>
            işlerinizi takip edin.
          </h1>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Kolay Görev Atama</h3>
                <p className="text-white/70 text-sm">Çalışanlarınıza hızlıca görev atayın ve takip edin.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Ekip Yönetimi</h3>
                <p className="text-white/70 text-sm">Tüm ekibinizi tek bir platformda yönetin.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Şirket Kodu ile Erişim</h3>
                <p className="text-white/70 text-sm">Benzersiz şirket kodunuzla güvenli giriş.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2026 İş Takip. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Sağ Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Briefcase className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-800">İş Takip</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Hoş Geldiniz</h2>
            <p className="text-slate-500 mt-2">Hesabınıza giriş yapın!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Şirket Kodu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Şirket Kodu
              </label>
              <div className="relative">
                <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  placeholder="Örn: GZL2026X"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400 uppercase tracking-wider
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           transition-all"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Şirketinizin size verdiği 8 haneli kod</p>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@sirket.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           transition-all"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-12 pr-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                       text-white font-semibold py-3.5 rounded-xl
                       flex items-center justify-center gap-2 transition-all
                       disabled:opacity-70 disabled:cursor-not-allowed
                       shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Hesabınız yok mu?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Kayıt Olun
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
