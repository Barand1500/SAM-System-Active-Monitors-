import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  Briefcase,
  User,
  Users,
  Crown,
  AlertCircle,
  Check,
  Copy
} from 'lucide-react';

const RegisterPage = ({ onSwitchToLogin }) => {
  const { registerCompany, joinCompany } = useAuth();
  const [mode, setMode] = useState(null); // 'boss' veya 'employee'
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Patron için
    companyName: '',
    industry: '',
    // İşçi için
    companyCode: '',
    // Ortak
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBossRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerCompany(
        { name: formData.companyName, industry: formData.industry },
        { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          email: formData.email 
        }
      );
      setSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    setIsLoading(true);
    try {
      await joinCompany(formData.companyCode, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        position: formData.position
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Mod seçim ekranı
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Briefcase className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">İş Takip'e Katılın</h1>
            <p className="text-slate-500 mt-2">Nasıl kayıt olmak istiyorsunuz?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Patron Kartı */}
            <button
              onClick={() => setMode('boss')}
              className="p-8 bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500
                       transition-all hover:shadow-xl group text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl 
                            flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25
                            group-hover:scale-110 transition-transform">
                <Crown className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Şirket Sahibi</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Yeni bir şirket oluşturun ve çalışanlarınızı davet etmek için benzersiz bir şirket kodu alın.
              </p>
              <div className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                Şirket Oluştur
                <ArrowRight size={16} />
              </div>
            </button>

            {/* Çalışan Kartı */}
            <button
              onClick={() => setMode('employee')}
              className="p-8 bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500
                       transition-all hover:shadow-xl group text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl 
                            flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25
                            group-hover:scale-110 transition-transform">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Çalışan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Şirketinizin size verdiği kod ile mevcut bir şirkete katılın ve görevlerinizi takip etmeye başlayın.
              </p>
              <div className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                Şirkete Katıl
                <ArrowRight size={16} />
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Zaten hesabınız var mı?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Giriş Yapın
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Başarılı kayıt - Şirket kodu göster
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl 
                        flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
            <Check className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Şirketiniz Oluşturuldu!</h1>
          <p className="text-slate-500 mb-8">Çalışanlarınızı davet etmek için aşağıdaki kodu paylaşın</p>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
            <p className="text-sm text-slate-500 mb-3">Şirket Kodu</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-3xl font-bold text-indigo-600 tracking-widest">
                {success.company.companyCode}
              </code>
              <button
                onClick={() => copyToClipboard(success.company.companyCode)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Copy size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                     text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            Panele Git
          </button>
        </div>
      </div>
    );
  }

  // Patron kayıt formu
  if (mode === 'boss') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Geri
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl 
                            flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Crown className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Şirket Oluştur</h2>
                <p className="text-sm text-slate-500">Adım {step}/2</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleBossRegister}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Şirket Adı</label>
                    <div className="relative">
                      <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Şirketinizin adı"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sektör</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5
                               text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Sektör seçin</option>
                      <option value="technology">Teknoloji</option>
                      <option value="finance">Finans</option>
                      <option value="healthcare">Sağlık</option>
                      <option value="education">Eğitim</option>
                      <option value="retail">Perakende</option>
                      <option value="manufacturing">Üretim</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                             text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2
                             transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Devam Et
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Adınız"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ornek@sirket.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="En az 6 karakter"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 pr-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                        minLength={6}
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Şifrenizi tekrar girin"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                               text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2
                               transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Oluştur'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Çalışan kayıt formu
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <button
          onClick={() => setMode(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Geri
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl 
                          flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Şirkete Katıl</h2>
              <p className="text-sm text-slate-500">Çalışan kaydı</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmployeeRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şirket Kodu</label>
              <div className="relative">
                <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  placeholder="Örn: TPY2024X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400 uppercase tracking-wider
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Patronunuzun size verdiği 8 haneli kod</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Adınız"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@sirket.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Departman</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Seçin</option>
                  <option value="Yazılım">Yazılım</option>
                  <option value="Tasarım">Tasarım</option>
                  <option value="Pazarlama">Pazarlama</option>
                  <option value="İK">İnsan Kaynakları</option>
                  <option value="Finans">Finans</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pozisyon</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Ünvanınız"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 pr-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                       text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2
                       transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Katıl
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
