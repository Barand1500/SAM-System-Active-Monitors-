import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  AlertCircle
} from 'lucide-react';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    companyCode: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.companyCode, formData.email, formData.password);
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="min-h-screen flex">
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
            işlerinizi takip edin
          </h1>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Kolay Görev Atama</h3>
                <p className="text-white/70 text-sm">Çalışanlarınıza hızlıca görev atayın ve takip edin</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Ekip Yönetimi</h3>
                <p className="text-white/70 text-sm">Tüm ekibinizi tek bir platformda yönetin</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Şirket Kodu ile Erişim</h3>
                <p className="text-white/70 text-sm">Benzersiz şirket kodunuzla güvenli giriş</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2024 İş Takip. Tüm hakları saklıdır.
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
            <p className="text-slate-500 mt-2">Hesabınıza giriş yapın</p>
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
                  placeholder="Örn: TPY2024X"
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
                E-posta Adresi
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

          {/* Demo Bilgiler */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-indigo-800 font-medium text-sm mb-2">Demo Giriş Bilgileri:</p>
            <div className="text-xs text-indigo-600 space-y-1">
              <p><span className="font-semibold">Şirket Kodu:</span> TPY2024X</p>
              <p><span className="font-semibold">Patron:</span> patron@techpro.com</p>
              <p><span className="font-semibold">Çalışan:</span> ayse@techpro.com</p>
              <p><span className="font-semibold">Şifre:</span> 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
