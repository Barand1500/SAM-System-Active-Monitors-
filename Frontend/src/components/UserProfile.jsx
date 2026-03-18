import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  User, Mail, Phone, Calendar, Briefcase, Building2, Award, Save, X, Upload, Edit3, Loader2,
  Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle
} from 'lucide-react';
import { validateEmail, validatePhone, validateRequired } from '../utils/validation';
import { userAPI, departmentAPI } from '../services/api';
import api from '../services/api';

// Helper: Backend dosya URL'sini tam adrese çevir
const getImageUrl = (path) => {
  if (!path) return null;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = API_URL.replace('/api', ''); // Remove /api
  if (path.startsWith('http')) return path; // Already full URL
  if (path.startsWith('/')) return baseUrl + path;
  return baseUrl + '/' + path;
};

const UserProfile = ({ isDark }) => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    position: '', departmentId: null, departmentName: '',
    skills: [], avatarUrl: null
  });

  const [newSkill, setNewSkill] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Şifre değiştirme state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

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

  const pwStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!currentPassword) { setPwError('Mevcut şifrenizi giriniz'); return; }
    if (!newPassword) { setPwError('Yeni şifre giriniz'); return; }
    if (newPassword !== confirmPassword) { setPwError('Yeni şifreler eşleşmiyor'); return; }
    setPwChanging(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwSuccess('Şifreniz başarıyla değiştirildi. Yeni şifreniz e-postanıza gönderildi.');
      addToast({ type: 'success', title: 'Başarılı', message: 'Şifreniz değiştirildi ve e-postanıza gönderildi.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Şifre değiştirilemedi';
      setPwError(msg);
    } finally {
      setPwChanging(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes] = await Promise.all([
        userAPI.get(user?.id),
        departmentAPI.list()
      ]);
      const u = userRes.data?.data || userRes.data;
      const depts = deptRes.data?.data || deptRes.data || [];
      setDepartments(Array.isArray(depts) ? depts : []);

      const skills = (u.UserSkills || []).map(s => s.name);
      const deptName = u.Department?.name || '';
      const avatarUrl = u.avatarUrl || u.avatar_url || null;
      setProfile({
        firstName: u.firstName || u.first_name || '',
        lastName: u.lastName || u.last_name || '',
        email: u.email || '',
        phone: u.phone || '',
        position: u.position || '',
        departmentId: u.departmentId || u.department_id || null,
        departmentName: deptName,
        skills,
        avatarUrl: avatarUrl
      });
      // Backend URL'sini ekleyerek full path oluştur
      setPhotoPreview(getImageUrl(avatarUrl));
    } catch (err) {
      console.error('Profil yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) fetchProfile(); }, [user?.id]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Dosya Çok Büyük',
        message: 'Profil fotoğrafı en fazla 5MB olabilir',
        duration: 3000
      });
      return;
    }

    // Dosya türü kontrolü
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      addToast({
        type: 'error',
        title: 'Geçersiz Dosya',
        message: 'Sadece resim dosyaları yüklenebilir (jpg, png, gif, webp)',
        duration: 3000
      });
      return;
    }

    try {
      // Önce preview göster
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Hemen dosyayı upload et
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await userAPI.uploadAvatar(user.id, formData);
      
      // Profile state'ini güncelle
      const newAvatarUrl = response.data.avatarUrl;
      setProfile(prev => ({
        ...prev,
        avatarUrl: newAvatarUrl
      }));

      // PhotoPreview'u backend URL'si ile güncelle
      setPhotoPreview(getImageUrl(newAvatarUrl));

      // AuthContext + Dashboard sidebar'daki avatarı da güncelle
      updateProfile({ avatarUrl: newAvatarUrl });
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: newAvatarUrl } }));

      addToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Profil fotoğrafı yüklendi',
        duration: 2000
      });
    } catch (err) {
      console.error('Fotoğraf yükleme hatası:', err);
      addToast({
        type: 'error',
        title: 'Hata',
        message: 'Fotoğraf yüklenirken bir hata oluştu',
        duration: 3000
      });
      // Preview'ı geri al
      setPhotoPreview(getImageUrl(profile.avatarUrl) || null);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      addToast({
        type: 'warning',
        title: 'Dikkat',
        message: 'Bu yetenek zaten ekli',
        duration: 2000
      });
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = async () => {
    // Validasyon
    const errors = [];

    if (!profile.firstName || !profile.lastName) {
      errors.push('Ad ve soyad gereklidir');
    }

    if (profile.email) {
      const emailValidation = validateEmail(profile.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.error);
      }
    }

    if (profile.phone) {
      const phoneValidation = validatePhone(profile.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error);
      }
    }

    if (errors.length > 0) {
      addToast({
        type: 'error',
        title: 'Doğrulama Hatası',
        message: errors[0],
        duration: 4000
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        position: profile.position,
        departmentId: profile.departmentId || null
      };

      await userAPI.update(user.id, updateData);
      await userAPI.updateSkills(user.id, profile.skills);
      
      // AuthContext'teki user bilgisini güncelle (sidebar, header vs.)
      updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        position: profile.position,
        departmentId: profile.departmentId
      });
      
      setIsEditing(false);
      addToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Profiliniz güncellendi',
        duration: 3000
      });
    } catch (err) {
      console.error('Profil güncellenemedi:', err);
      addToast({
        type: 'error',
        title: 'Hata',
        message: 'Profil güncellenirken bir hata oluştu',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        
        {/* Profil Kartı */}
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="relative">
              {/* Profil Fotoğrafı */}
              <div className={`w-32 h-32 rounded-2xl border-4 overflow-hidden ${isDark ? 'bg-slate-700 border-slate-800' : 'bg-white border-white'}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                  <Upload size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
            
            <div className="print:hidden">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  <Edit3 size={18} />
                  Düzenle
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    <X size={18} />
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* İsim ve Biyografi */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Ad"
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Soyad"
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.firstName} {profile.lastName}
                </h2>
                {profile.position && (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.position}</p>
                )}
                {profile.departmentName && (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.departmentName}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bilgiler */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Kişisel Bilgiler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Mail size={14} />
              Email
            </label>
            <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.email || '-'}</p>
          </div>

          {/* Telefon */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Phone size={14} />
              Telefon
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0555 555 55 55"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.phone || '-'}</p>
            )}
          </div>

          {/* Departman */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Building2 size={14} />
              Departman
            </label>
            {isEditing ? (
              <select
                value={profile.departmentId || ''}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const dept = departments.find(d => d.id === id);
                  setProfile(prev => ({ ...prev, departmentId: id, departmentName: dept?.name || '' }));
                }}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="">Seçiniz</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.departmentName || '-'}</p>
            )}
          </div>

          {/* Pozisyon */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Briefcase size={14} />
              Pozisyon/Ünvan
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.position}
                onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Ör: Yazılım Geliştirici"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.position || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Yetenekler */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Award size={20} />
            Yetenekler & Uzmanlıklar
          </h3>
        </div>
        
        {isEditing && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Yetenek ekle (Ör: Proje Yönetimi, Grafik Tasarım)"
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Ekle
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.skills.length > 0 ? (
            profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isEditing ? 'Yeteneklerinizi ekleyin' : 'Henüz yetenek eklenmemiş'}
            </p>
          )}
        </div>
      </div>

      {/* Şifre Değiştirme */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
        <button
          onClick={() => { setShowPasswordSection(!showPasswordSection); setPwError(''); setPwSuccess(''); }}
          className="w-full flex items-center justify-between"
        >
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <KeyRound size={20} />
            Şifre Değiştir
          </h3>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {showPasswordSection ? 'Gizle' : 'Göster'}
          </span>
        </button>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-md">
            {pwError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-sm">{pwError}</p>
              </div>
            )}
            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <p className="text-emerald-600 text-sm">{pwSuccess}</p>
              </div>
            )}

            {/* Mevcut Şifre */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mevcut Şifre</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className={`w-full rounded-xl px-4 py-3 pl-11 pr-12 border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Yeni Şifre */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Yeni Şifre</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Yeni şifreniz"
                  className={`w-full rounded-xl px-4 py-3 pl-11 pr-12 border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.level ? pwStrength.color : isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${pwStrength.level <= 1 ? 'text-red-500' : pwStrength.level === 2 ? 'text-orange-500' : pwStrength.level === 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    Şifre Gücü: {pwStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Yeni Şifre Tekrar */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  className={`w-full rounded-xl px-4 py-3 pl-11 pr-12 border ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pwChanging}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwChanging ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <KeyRound size={18} />
                  Şifremi Değiştir
                </>
              )}
            </button>

            <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Yeni şifreniz e-posta adresinize de gönderilecektir.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
