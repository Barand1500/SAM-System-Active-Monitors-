import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  User, Mail, Phone, Calendar, Briefcase, Building2, Award, Save, X, Upload, Edit3
} from 'lucide-react';
import { validateEmail, validatePhone, validateRequired } from '../utils/validation';

const UserProfile = ({ isDark }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem(`user_profile_${user?.id || 'default'}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Profil yüklenemedi:', e);
      }
    }
    // Varsayılan profil
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      birthDate: '',
      department: user?.department || '',
      position: user?.position || '',
      startDate: '',
      skills: [],
      bio: '',
      profilePhoto: null
    };
  });

  const [newSkill, setNewSkill] = useState('');
  const [photoPreview, setPhotoPreview] = useState(profile.profilePhoto);

  // Departmanlar listesi (localStorage'dan yükle)
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const depts = localStorage.getItem('sam_departments');
    if (depts) {
      try {
        setDepartments(JSON.parse(depts));
      } catch (e) {
        setDepartments([]);
      }
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Dosya Çok Büyük',
        message: 'Profil fotoğrafı en fazla 2MB olabilir',
        duration: 3000
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setProfile(prev => ({ ...prev, profilePhoto: base64 }));
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
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

  const handleSave = () => {
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
    setTimeout(() => {
      localStorage.setItem(`user_profile_${user?.id || 'default'}`, JSON.stringify(profile));
      setIsSaving(false);
      setIsEditing(false);
      addToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Profiliniz güncellendi',
        duration: 3000
      });
    }, 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Profili yeniden yükle
    const stored = localStorage.getItem(`user_profile_${user?.id || 'default'}`);
    if (stored) {
      try {
        const loaded = JSON.parse(stored);
        setProfile(loaded);
        setPhotoPreview(loaded.profilePhoto);
      } catch (e) {
        console.error('Profil yüklenemedi:', e);
      }
    }
  };

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
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Kısa biyografi (Opsiyonel)"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            ) : (
              <>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.firstName} {profile.lastName}
                </h2>
                {profile.position && (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.position}</p>
                )}
                {profile.bio && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{profile.bio}</p>
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
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.email || '-'}</p>
            )}
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

          {/* Doğum Günü */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Calendar size={14} />
              Doğum Günü
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => setProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('tr-TR') : '-'}
              </p>
            )}
          </div>

          {/* Başlangıç Tarihi */}
          <div>
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Calendar size={14} />
              İşe Başlama
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profile.startDate}
                onChange={(e) => setProfile(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile.startDate ? new Date(profile.startDate).toLocaleDateString('tr-TR') : '-'}
              </p>
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
                value={profile.department}
                onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="">Seçiniz</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.department || '-'}</p>
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
                placeholder="Ör: Frontend Developer"
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
              placeholder="Yetenek ekle (Ör: React, JavaScript)"
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
    </div>
  );
};

export default UserProfile;
