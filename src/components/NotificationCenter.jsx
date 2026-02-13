import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, X, Check, CheckCheck, Trash2, Settings, BellOff, BellRing } from 'lucide-react';

const NotificationCenter = ({ isDark }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    notificationPermission,
    requestPermission 
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const typeIcons = {
    task: '📋',
    leave: '🏖️',
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅'
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isDark 
            ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
            : 'bg-white/30 hover:bg-white/50 text-slate-600'
        } backdrop-blur-sm`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className={`absolute right-0 top-12 w-96 max-h-[500px] rounded-2xl shadow-2xl z-50 overflow-hidden ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Bildirimler
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                    title="Ayarlar"
                  >
                    <Settings size={16} />
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Tümünü okundu işaretle"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notificationPermission === 'granted' ? (
                        <BellRing size={18} className="text-emerald-500" />
                      ) : (
                        <BellOff size={18} className="text-slate-400" />
                      )}
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Push Bildirimleri
                      </span>
                    </div>
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={requestPermission}
                        className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        İzin Ver
                      </button>
                    )}
                    {notificationPermission === 'granted' && (
                      <span className="text-xs text-emerald-500 font-medium">Aktif</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Bell size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b transition-colors cursor-pointer ${
                      isDark 
                        ? `border-slate-700 ${notification.read ? 'bg-slate-800' : 'bg-slate-700/50'}` 
                        : `border-slate-100 ${notification.read ? 'bg-white' : 'bg-indigo-50/50'}`
                    } hover:${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{typeIcons[notification.type] || '📌'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold text-sm ${
                            isDark ? 'text-white' : 'text-slate-800'
                          } ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        {notification.message && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {notification.message}
                          </p>
                        )}
                        <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                          isDark ? 'hover:bg-slate-600 text-slate-500' : 'hover:bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={clearAll}
                  className={`w-full py-2 text-sm rounded-lg transition-colors ${
                    isDark 
                      ? 'text-slate-400 hover:bg-slate-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
