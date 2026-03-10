import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
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
      
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Giriş başarısız!';
      throw { message: errorMsg };
    }
  };

  // Yeni şirket oluştur (Patron kaydı) - Backend API'ye bağlı
  const registerCompany = async (companyData, userData) => {
    try {
      const response = await api.post('/auth/register-company', {
        company: {
          name: companyData.name,
          industry: companyData.industry || ''
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

      return { user, company: backendCompany };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Şirket kaydı başarısız!';
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

      return { user, company: backendCompany };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Şirket kaydı başarısız!';
      throw { message: errorMsg };
    }
  };

  // Çıkış yap
  const logout = () => {
    setUser(null);
    setCurrentCompany(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
  };

  // Şirket bilgilerini güncelle
  const updateCompany = (updates) => {
    setCurrentCompany(prev => {
      const oldCode = prev?.companyCode;
      const updated = { ...prev, ...updates };
      localStorage.setItem('currentCompany', JSON.stringify(updated));

      // Şirket kodu değiştiyse kayıt defterini güncelle
      if (updates.companyCode && updates.companyCode !== oldCode) {
        const registry = JSON.parse(localStorage.getItem('sam_company_registry') || '{}');
        if (oldCode && registry[oldCode] === updated.id) {
          delete registry[oldCode];
        }
        registry[updates.companyCode] = updated.id;
        localStorage.setItem('sam_company_registry', JSON.stringify(registry));
      }

      return updated;
    });
  };

  // Şirket kodu müsaitlik kontrolü
  const checkCompanyCodeAvailability = (code) => {
    if (!code) return { available: false, reason: 'empty' };
    const upperCode = code.toUpperCase();
    // Mevcut şirketin kendi kodu ise müsait say
    if (currentCompany?.companyCode === upperCode) return { available: true };
    // Mock verideki şirket kodu
    if (company.companyCode === upperCode) return { available: false, reason: 'taken' };
    // Kayıt defterindeki diğer şirketler
    const registry = JSON.parse(localStorage.getItem('sam_company_registry') || '{}');
    if (registry[upperCode] && registry[upperCode] !== currentCompany?.id) {
      return { available: false, reason: 'taken' };
    }
    return { available: true };
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
  const updateUserRoles = (targetUserId, newRoles) => {
    if (!userRoles.includes('boss')) return; // sadece patron
    const employees = JSON.parse(localStorage.getItem('app_employees') || '[]');
    const updated = employees.map(emp =>
      emp.id === targetUserId ? { ...emp, roles: newRoles, role: newRoles[0] || 'employee' } : emp
    );
    localStorage.setItem('app_employees', JSON.stringify(updated));
    // Eğer kendi rollerimizi güncelliyorsak
    if (user?.id === targetUserId) {
      const updatedUser = { ...user, roles: newRoles, role: newRoles[0] || 'employee' };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
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
