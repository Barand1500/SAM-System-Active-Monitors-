import { createContext, useContext, useState, useEffect } from 'react';
import { users, company } from '../data/mockData';

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

  // Şirket kodu ile giriş
  const login = async (companyCode, email, password) => {
    // Simülasyon - gerçek uygulamada API çağrısı yapılacak
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Şirket kodunu kontrol et
        if (companyCode.toUpperCase() !== company.companyCode) {
          reject({ message: 'Geçersiz şirket kodu!' });
          return;
        }

        // Kullanıcıyı bul
        const foundUser = users.find(
          u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!foundUser) {
          reject({ message: 'Kullanıcı bulunamadı!' });
          return;
        }

        // Demo için şifre kontrolü (gerçekte hash karşılaştırması yapılır)
        if (password !== '123456') {
          reject({ message: 'Hatalı şifre!' });
          return;
        }

        // Başarılı giriş
        setUser(foundUser);
        setCurrentCompany(company);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        localStorage.setItem('currentCompany', JSON.stringify(company));
        resolve(foundUser);
      }, 800);
    });
  };

  // Yeni şirket oluştur (Patron kaydı)
  const registerCompany = async (companyData, userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Şirket kodu oluştur
        const newCompanyCode = generateCompanyCode(companyData.name);
        
        const newCompany = {
          id: Date.now(),
          name: companyData.name,
          companyCode: newCompanyCode,
          description: companyData.description || '',
          industry: companyData.industry || '',
          createdAt: new Date().toISOString()
        };

        const newUser = {
          id: Date.now(),
          companyId: newCompany.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'boss',
          department: 'Yönetim',
          position: 'CEO',
          status: 'active',
          avatar: null
        };

        setUser(newUser);
        setCurrentCompany(newCompany);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('currentCompany', JSON.stringify(newCompany));
        // Kayıt defterine ekle
        const registry = JSON.parse(localStorage.getItem('sam_company_registry') || '{}');
        registry[newCompanyCode] = newCompany.id;
        localStorage.setItem('sam_company_registry', JSON.stringify(registry));
        resolve({ user: newUser, company: newCompany });
      }, 1000);
    });
  };

  // Şirket koduna katıl (İşçi kaydı)
  const joinCompany = async (companyCode, userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Şirket kodunu kontrol et
        if (companyCode.toUpperCase() !== company.companyCode) {
          reject({ message: 'Geçersiz şirket kodu!' });
          return;
        }

        const newUser = {
          id: Date.now(),
          companyId: company.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'employee',
          department: userData.department || 'Genel',
          position: userData.position || 'Çalışan',
          status: 'active',
          avatar: null
        };

        setUser(newUser);
        setCurrentCompany(company);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('currentCompany', JSON.stringify(company));
        resolve({ user: newUser, company });
      }, 1000);
    });
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

  const value = {
    user,
    company: currentCompany,
    isLoading,
    isAuthenticated: !!user,
    isBoss: user?.role === 'boss',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
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
