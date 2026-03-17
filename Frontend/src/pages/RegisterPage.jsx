import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { 
  Building2, 
  Mail, 
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Users,
  Crown,
  AlertCircle,
  Check,
  Copy,
  Hash,
  CreditCard,
  User,
  CheckCircle2
} from 'lucide-react';

// TC Kimlik doğrulama algoritması
const validateTCKimlik = (tc) => {
  if (!tc || tc.length !== 11) return { valid: false, message: 'TC Kimlik numarası 11 haneli olmalıdır' };
  if (!/^\d{11}$/.test(tc)) return { valid: false, message: 'TC Kimlik numarası sadece rakamlardan oluşmalıdır' };
  if (tc[0] === '0') return { valid: false, message: 'TC Kimlik numarası 0 ile başlayamaz' };
  
  const digits = tc.split('').map(Number);
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  if ((sum1 - sum2) % 10 !== digits[9]) return { valid: false, message: 'Geçersiz TC Kimlik numarası' };
  
  const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (totalSum % 10 !== digits[10]) return { valid: false, message: 'Geçersiz TC Kimlik numarası' };
  
  return { valid: true };
};

// Vergi numarası doğrulama
const validateVergiNo = (vn) => {
  if (!vn || vn.length !== 10) return { valid: false, message: 'Vergi numarası 10 haneli olmalıdır' };
  if (!/^\d{10}$/.test(vn)) return { valid: false, message: 'Vergi numarası sadece rakamlardan oluşmalıdır' };
  return { valid: true };
};

const RegisterPage = ({ onSwitchToLogin }) => {
  const { registerCompany, joinCompany } = useAuth();
  const [mode, setMode] = useState(null); // null | 'boss' | 'employee'
  const [companyType, setCompanyType] = useState('gercek'); // 'gercek' | 'tuzel'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldChecking, setFieldChecking] = useState({});
  
  const [formData, setFormData] = useState({
    // Gerçek kişi
    firstName: '',
    lastName: '',
    tcNo: '',
    // Tüzel kişi
    companyName: '',
    vergiNo: '',
    vergiDairesi: '',
    // Ortak
    email: '',
    // Çalışan
    companyCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // E-posta müsaitlik kontrolü
  const checkEmailAvailability = async (email) => {
    if (!email || !isValidEmail(email)) {
      setFieldErrors(prev => ({ ...prev, email: null }));
      return;
    }
    setFieldChecking(prev => ({ ...prev, email: true }));
    try {
      const res = await apiClient.get('/auth/check-email', { params: { email: email.trim() } });
      if (!res.data.available) {
        setFieldErrors(prev => ({ ...prev, email: 'Bu e-posta adresi zaten kayıtlı' }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: null }));
      }
    } catch { setFieldErrors(prev => ({ ...prev, email: null })); }
    finally { setFieldChecking(prev => ({ ...prev, email: false })); }
  };

  // Şirket adı müsaitlik kontrolü
  const checkCompanyName = async (name) => {
    if (!name || !name.trim()) {
      setFieldErrors(prev => ({ ...prev, companyName: null }));
      return;
    }
    setFieldChecking(prev => ({ ...prev, companyName: true }));
    try {
      const res = await apiClient.get('/auth/check-company-name', { params: { name: name.trim() } });
      if (!res.data.available) {
        setFieldErrors(prev => ({ ...prev, companyName: 'Bu şirket adı zaten kullanımda' }));
      } else {
        setFieldErrors(prev => ({ ...prev, companyName: null }));
      }
    } catch { setFieldErrors(prev => ({ ...prev, companyName: null })); }
    finally { setFieldChecking(prev => ({ ...prev, companyName: false })); }
  };

  // Form doğrulama
  const validateBossForm = () => {
    const errors = {};
    
    if (companyType === 'gercek') {
      if (!formData.firstName.trim()) errors.firstName = 'Ad zorunludur';
      if (!formData.lastName.trim()) errors.lastName = 'Soyad zorunludur';
      
      const tcResult = validateTCKimlik(formData.tcNo);
      if (!tcResult.valid) errors.tcNo = tcResult.message;
    } else {
      if (!formData.companyName.trim()) errors.companyName = 'Şirket adı zorunludur';
      
      const vnResult = validateVergiNo(formData.vergiNo);
      if (!vnResult.valid) errors.vergiNo = vnResult.message;
      
      if (!formData.vergiDairesi.trim()) errors.vergiDairesi = 'Vergi dairesi zorunludur';

      if (!formData.firstName.trim()) errors.firstName = 'Ad zorunludur';
      if (!formData.lastName.trim()) errors.lastName = 'Soyad zorunludur';
    }
    
    if (!formData.email.trim()) errors.email = 'E-posta adresi zorunludur';
    else if (!isValidEmail(formData.email)) errors.email = 'Geçerli bir e-posta adresi giriniz';
    
    if (fieldErrors.email) errors.email = fieldErrors.email;
    if (fieldErrors.companyName) errors.companyName = fieldErrors.companyName;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmployeeForm = () => {
    const errors = {};
    
    if (!formData.companyCode.trim()) errors.companyCode = 'Şirket kodu zorunludur';
    else if (formData.companyCode.trim().length < 6) errors.companyCode = 'Geçerli bir şirket kodu giriniz';
    
    if (!formData.firstName.trim()) errors.firstName = 'Ad zorunludur';
    if (!formData.lastName.trim()) errors.lastName = 'Soyad zorunludur';
    
    if (!formData.email.trim()) errors.email = 'E-posta adresi zorunludur';
    else if (!isValidEmail(formData.email)) errors.email = 'Geçerli bir e-posta adresi giriniz';
    
    if (fieldErrors.email) errors.email = fieldErrors.email;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Şirket sahibi kayıt
  const handleBossRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateBossForm()) return;
    
    setIsLoading(true);
    try {
      const companyPayload = {
        companyType,
        tcNo: companyType === 'gercek' ? formData.tcNo : null,
        vergiNo: companyType === 'tuzel' ? formData.vergiNo : null,
        vergiDairesi: companyType === 'tuzel' ? formData.vergiDairesi : null,
        name: companyType === 'tuzel' ? formData.companyName : null
      };
      
      const adminPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      const result = await registerCompany(companyPayload, adminPayload);
      setSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Çalışan kayıt
  const handleEmployeeRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmployeeForm()) return;
    
    setIsLoading(true);
    try {
      const result = await joinCompany(formData.companyCode, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      setSuccess({ ...result, isEmployee: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Field hata göstergesi
  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    );
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

  // Başarılı kayıt ekranı
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl 
                        flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
            <Check className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {success.isEmployee ? 'Şirkete Katıldınız!' : 'Şirketiniz Oluşturuldu!'}
          </h1>
          <p className="text-slate-500 mb-6">
            Giriş şifreniz e-posta adresinize gönderildi.
          </p>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-4">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Mail size={18} className="text-indigo-500" />
              <p className="text-sm text-slate-600">
                <span className="font-medium">{formData.email}</span> adresini kontrol edin
              </p>
            </div>
            <p className="text-xs text-slate-400">Şifreniz e-posta ile gönderildi. Bu şifre ile giriş yapabilirsiniz.</p>
          </div>

          {!success.isEmployee && success.company && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <p className="text-sm text-slate-500 mb-3">Şirket Kodu</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl font-bold text-indigo-600 tracking-widest">
                  {success.company.companyCode || success.company.company_code}
                </code>
                <button
                  onClick={() => copyToClipboard(success.company.companyCode || success.company.company_code)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Kopyala"
                >
                  <Copy size={20} className="text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3">Bu kodu çalışanlarınızla paylaşarak onları davet edebilirsiniz.</p>
            </div>
          )}

          <button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                     text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  // Şirket Sahibi - Kayıt Formu
  if (mode === 'boss') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <button
            onClick={() => { setMode(null); setError(''); setFieldErrors({}); }}
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
                <p className="text-sm text-slate-500">Şirket sahibi kaydı</p>
              </div>
            </div>

            {/* Gerçek / Tüzel Seçimi */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setCompanyType('gercek'); setError(''); setFieldErrors({}); }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                  ${companyType === 'gercek' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <User size={16} />
                Gerçek Kişi
              </button>
              <button
                type="button"
                onClick={() => { setCompanyType('tuzel'); setError(''); setFieldErrors({}); }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                  ${companyType === 'tuzel' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Building2 size={16} />
                Tüzel Kişi
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleBossRegister} className="space-y-4">
              {companyType === 'gercek' ? (
                <>
                  {/* Gerçek Kişi Formu */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Adınız"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.firstName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      <FieldError error={fieldErrors.firstName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.lastName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      <FieldError error={fieldErrors.lastName} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">TC Kimlik No</label>
                    <div className="relative">
                      <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.tcNo}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setFormData(prev => ({ ...prev, tcNo: val }));
                          if (fieldErrors.tcNo) setFieldErrors(prev => ({ ...prev, tcNo: null }));
                        }}
                        placeholder="11 haneli TC Kimlik No"
                        maxLength={11}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.tcNo ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      {formData.tcNo.length === 11 && validateTCKimlik(formData.tcNo).valid && (
                        <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                    <FieldError error={fieldErrors.tcNo} />
                  </div>
                </>
              ) : (
                <>
                  {/* Tüzel Kişi Formu */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Şirket Adı</label>
                    <div className="relative">
                      <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        onBlur={() => checkCompanyName(formData.companyName)}
                        placeholder="Şirketinizin adı"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.companyName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      {fieldChecking.companyName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <FieldError error={fieldErrors.companyName} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Numarası</label>
                    <div className="relative">
                      <Hash size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.vergiNo}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData(prev => ({ ...prev, vergiNo: val }));
                          if (fieldErrors.vergiNo) setFieldErrors(prev => ({ ...prev, vergiNo: null }));
                        }}
                        placeholder="10 haneli Vergi No"
                        maxLength={10}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.vergiNo ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      {formData.vergiNo.length === 10 && validateVergiNo(formData.vergiNo).valid && (
                        <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                    <FieldError error={fieldErrors.vergiNo} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Dairesi</label>
                    <div className="relative">
                      <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="vergiDairesi"
                        value={formData.vergiDairesi}
                        onChange={handleChange}
                        placeholder="Örn: Kadıköy Vergi Dairesi"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.vergiDairesi ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                    </div>
                    <FieldError error={fieldErrors.vergiDairesi} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Yetkili Adı</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Adınız"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.firstName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      <FieldError error={fieldErrors.firstName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Yetkili Soyadı</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                                 text-slate-800 placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                 ${fieldErrors.lastName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                      />
                      <FieldError error={fieldErrors.lastName} />
                    </div>
                  </div>
                </>
              )}

              {/* E-posta - her iki tipte de */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => checkEmailAvailability(formData.email)}
                    placeholder="ornek@sirket.com"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                             text-slate-800 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                             ${fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                  />
                  {fieldChecking.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <FieldError error={fieldErrors.email} />
                <p className="text-xs text-slate-400 mt-1.5">Şifreniz bu adrese gönderilecektir</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                         text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2
                         transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Kayıt Ol
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Çalışan Kayıt Formu
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <button
          onClick={() => { setMode(null); setError(''); setFieldErrors({}); }}
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
                  placeholder="Örn: GZL2026X"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400 uppercase tracking-wider
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           ${fieldErrors.companyCode ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                />
              </div>
              <FieldError error={fieldErrors.companyCode} />
              <p className="text-xs text-slate-400 mt-1.5">Patronunuzun size verdiği şirket kodu</p>
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
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           ${fieldErrors.firstName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                />
                <FieldError error={fieldErrors.firstName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           ${fieldErrors.lastName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                />
                <FieldError error={fieldErrors.lastName} />
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
                  onBlur={() => checkEmailAvailability(formData.email)}
                  placeholder="ornek@sirket.com"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 pl-12
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           ${fieldErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                />
                {fieldChecking.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <FieldError error={fieldErrors.email} />
              <p className="text-xs text-slate-400 mt-1.5">Şifreniz bu adrese gönderilecektir</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                       text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2
                       transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 mt-2"
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
