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
        const newCompanyCode = generateCompanyCode();
        
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

  // Şirket kodu oluştur
  const generateCompanyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
    registerCompany,
    joinCompany
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
