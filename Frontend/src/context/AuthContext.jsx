import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from '../services/api';
import { userAPI } from '../services/api';
import { connectRealtime, disconnectRealtime } from '../services/realtime';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // LocalStorage'dan kullanıcı bilgisini kontrol et
    const savedUser = localStorage.getItem('currentUser');
    const savedCompany = localStorage.getItem('currentCompany');
    
    if (savedUser && savedCompany) {
      setUser(JSON.parse(savedUser));
      setCurrentCompany(JSON.parse(savedCompany));
    }
    setIsLoading(false);
  }, []);

  // Şirket kodu ile giriş - Backend API'ye bağlı
  const login = async (companyCode, email, password) => {
    try {
      const response = await api.post('/auth/login', {
        companyCode,
        email,
        password
      });
      
      const { token, user, company: backendCompany } = response.data;
      
      // LocalStorage'a kaydet
      localStorage.setItem('auth_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentCompany', JSON.stringify(backendCompany));
      
      // State'i güncelle
      setUser(user);
      setCurrentCompany(backendCompany);

      // Bildirim sistemini tetikle
      window.dispatchEvent(new Event('auth:login'));
      
      return user;
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      throw { message: errorMsg };
    }
  };

  // Yeni şirket oluştur (Patron kaydı) - Backend API'ye bağlı
  const registerCompany = async (companyData, userData) => {
    try {
      const response = await api.post('/auth/register-company', {
        company: {
          name: companyData.name,
          industry: companyData.industry || '',
          companyType: companyData.companyType || 'gercek',
          tcNo: companyData.tcNo || null,
          vergiNo: companyData.vergiNo || null,
          vergiDairesi: companyData.vergiDairesi || null
        },
        admin: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password  // Frontend'den password gelmeli
        }
      });

      const { token, user, company: backendCompany } = response.data;

      // LocalStorage'a kaydet
      localStorage.setItem('auth_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentCompany', JSON.stringify(backendCompany));

      // State'i güncelle
      setUser(user);
      setCurrentCompany(backendCompany);

      // Bildirim sistemini tetikle
      window.dispatchEvent(new Event('auth:login'));

      return { user, company: backendCompany };
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, 'Şirket kaydı tamamlanamadı. Lütfen bilgileri kontrol edin.');
      throw { message: errorMsg };
    }
  };

  // Şirket koduna katıl (İşçi kaydı) - Backend API'ye bağlı
  const joinCompany = async (companyCode, userData) => {
    try {
      const response = await api.post('/auth/join-company', {
        company_code: companyCode,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        department: userData.department || 'Genel',
        position: userData.position || 'Çalışan',
        role: 'employee'
      });

      const { token, user, company: backendCompany } = response.data;

      // LocalStorage'a kaydet
      localStorage.setItem('auth_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentCompany', JSON.stringify(backendCompany));

      // State'i güncelle
      setUser(user);
      setCurrentCompany(backendCompany);

      // Bildirim sistemini tetikle
      window.dispatchEvent(new Event('auth:login'));

      return { user, company: backendCompany };
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, 'Şirkete katılım tamamlanamadı. Lütfen bilgileri kontrol edin.');
      throw { message: errorMsg };
    }
  };

  // Çıkış yap
  const logout = () => {
    disconnectRealtime();
    setUser(null);
    setCurrentCompany(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
  };

  // API interceptor'dan gelen 401 olayını dinle
  useEffect(() => {
    const handleForceLogout = () => {
      disconnectRealtime();
      setUser(null);
      setCurrentCompany(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && user?.id && currentCompany?.id) {
      connectRealtime({ companyId: currentCompany.id, userId: user.id, token });
    }

    return () => {
      disconnectRealtime();
    };
  }, [user?.id, currentCompany?.id]);

  // Şirket bilgilerini güncelle
  const updateCompany = async (updates) => {
    const oldCode = currentCompany?.companyCode;
    const updated = { ...currentCompany, ...updates };
    localStorage.setItem('currentCompany', JSON.stringify(updated));
    setCurrentCompany(updated);

    // Şirket kodu değiştiyse backend'e kaydet
    if (updates.companyCode && updates.companyCode !== oldCode) {
      try {
        await api.put('/auth/update-company-code', { companyCode: updates.companyCode });
      } catch (e) {
        console.error('Şirket kodu güncellenemedi:', e);
      }
    }
  };

  // Şirket kodu müsaitlik kontrolü
  const checkCompanyCodeAvailability = async (code) => {
    if (!code) return { available: false, reason: 'empty' };
    const upperCode = code.toUpperCase();
    // Mevcut şirketin kendi kodu ise müsait say
    if (currentCompany?.companyCode === upperCode) return { available: true };
    try {
      const res = await api.get('/auth/check-company-code', {
        params: { code: upperCode, currentCompanyId: currentCompany?.id }
      });
      return res.data;
    } catch {
      return { available: true };
    }
  };

  // Şirket kodu oluştur (Yapısal: Kısaltma + Yıl + Özel Kod)
  const generateCompanyCode = (companyName) => {
    // Şirket adından kısaltma (ilk 3 büyük harf)
    const letters = (companyName || 'SAM').toUpperCase()
      .replace(/[^A-ZÇĞİÖŞÜ]/g, '')
      .replace(/[ÇĞİÖŞÜ]/g, c => ({ 'Ç':'C','Ğ':'G','İ':'I','Ö':'O','Ş':'S','Ü':'U' })[c] || '');
    const prefix = letters.slice(0, 3) || 'SAM';
    // Yıl
    const year = new Date().getFullYear().toString();
    // Rastgele 2 karakterlik özel kod
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 2; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}${year}${suffix}`;
  };

  // Multi-role desteği: roles dizisi varsa onu kullan, yoksa tekil role'den türet
  const getUserRoles = (u) => {
    if (!u) return [];
    if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles;
    return u.role ? [u.role] : ['employee'];
  };

  const userRoles = getUserRoles(user);

  // Kullanıcıya rol ata (sadece patron yapabilir)
  const updateUserRoles = async (targetUserId, newRoles) => {
    if (!userRoles.includes('boss')) return;
    try {
      await userAPI.update(targetUserId, { roles: newRoles, role: newRoles[0] || 'employee' });
      // Eğer kendi rollerimizi güncelliyorsak
      if (user?.id === targetUserId) {
        const updatedUser = { ...user, roles: newRoles, role: newRoles[0] || 'employee' };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Rol güncellenemedi:', e);
    }
  };

  // Profil bilgilerini güncelle (ad, soyad, avatar vs.)
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    company: currentCompany,
    isLoading,
    isAuthenticated: !!user,
    isBoss: userRoles.includes('boss'),
    isManager: userRoles.includes('manager'),
    isEmployee: userRoles.includes('employee'),
    userRoles,
    updateUserRoles,
    updateProfile,
    login,
    logout,
    updateCompany,
    registerCompany,
    joinCompany,
    checkCompanyCodeAvailability
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
