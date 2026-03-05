import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Timer, 
  Bell, 
  Menu,
  X,
  Kanban,
  CalendarDays,
  BarChart3,
  Palmtree,
  Settings,
  LogOut
} from 'lucide-react';

const MobileNavigation = ({ isDark, activeTab, setActiveTab, isBoss, isManager, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const canManage = isBoss || isManager;

  // Alt menü öğeleri (mobilde her zaman görünür)
  const bottomNavItems = [
    { id: 'overview', label: 'Ana', icon: LayoutDashboard },
    { id: 'tasks', label: 'Görevler', icon: ClipboardList },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'timetracker', label: 'Mesai', icon: Timer },
    { id: 'menu', label: 'Menü', icon: Menu, isMenu: true },
  ];

  // Tam menü öğeleri
  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks', label: canManage ? 'Tüm Görevler' : 'Görevlerim', icon: ClipboardList },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays },
    { id: 'timetracker', label: 'Mesai', icon: Timer },
    ...(canManage ? [{ id: 'reports', label: 'Raporlar', icon: BarChart3 }] : []),
    { id: 'leaves', label: 'İzinler', icon: Palmtree },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleNavClick = (item) => {
    if (item.isMenu) {
      setShowMenu(true);
    } else {
      setActiveTab(item.id);
    }
  };

  const handleMenuClick = (id) => {
    setActiveTab(id);
    setShowMenu(false);
  };

  return (
    <>
      {/* Bottom Navigation - Mobilde görünür */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 md:hidden ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } border-t safe-area-bottom`}>
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isMenu && activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-indigo-500'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-12 h-0.5 bg-indigo-500 rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full Screen Menu Modal */}
      {showMenu && (
        <div className={`fixed inset-0 z-50 md:hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Menü
            </h2>
            <button
              onClick={() => setShowMenu(false)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            >
              <X size={24} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    isActive
                      ? isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          } safe-area-bottom`}>
            <button
              onClick={() => {
                setShowMenu(false);
                onLogout?.();
              }}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl ${
                isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'
              }`}
            >
              <LogOut size={20} />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {/* Safe Area Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
};

// PWA Install Prompt Component
export const PWAInstallPrompt = ({ isDark }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Listen for PWA install prompt
  useState(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if already installed or dismissed
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={`fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-80 z-50 
                    rounded-2xl shadow-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl 
                      flex items-center justify-center text-white text-xl">
          📱
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Uygulamayı Yükle
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Ana ekrana ekleyerek daha hızlı erişin
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
        >
          <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDismiss}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${
            isDark 
              ? 'bg-slate-700 text-slate-300' 
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          Daha Sonra
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 
                   text-white rounded-xl text-sm font-medium"
        >
          Yükle
        </button>
      </div>
    </div>
  );
};

// Offline Indicator Component
export const OfflineIndicator = ({ isDark }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium">
      Çevrimdışı moddasınız - Bazı özellikler kısıtlı olabilir
    </div>
  );
};

export default MobileNavigation;
