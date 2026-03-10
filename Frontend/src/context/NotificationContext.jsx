import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState('default');
  const loadedRef = useRef(false);

  // Backend'den bildirimlerı yükle
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        const res = await notificationAPI.list();
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          setNotifications(data.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content || n.message,
            type: n.type || 'info',
            isRead: n.isRead || n.is_read || false,
            createdAt: n.createdAt || n.created_at
          })));
        }
      } catch (e) {
        console.error('Bildirimler yüklenemedi:', e);
      }
    };
    loadNotifications();
  }, []);

  // Tarayıcı bildirim izni iste
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  // Push notification gönder
  const sendPushNotification = useCallback((title, options = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }, [permission]);

  // Toast bildirimi ekle
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info', // success, error, warning, info
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Otomatik kaldır
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Uygulama içi bildirim ekle
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Toast da göster
    addToast({
      title: notification.title,
      message: notification.content,
      type: notification.type || 'info'
    });

    // Push notification da gönder
    if (notification.push !== false) {
      sendPushNotification(notification.title, {
        body: notification.content,
        tag: notification.id
      });
    }

    return newNotification;
  }, [addToast, sendPushNotification]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    try { await notificationAPI.markRead(id); } catch {}
  }, []);

  // Tümünü okundu olarak işaretle
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    try { await notificationAPI.markAllRead(); } catch {}
  }, []);

  // Bildirimi sil
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Tüm bildirimleri temizle
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Görev bildirimleri
  const notifyTaskAssigned = (task, assignee) => {
    addNotification({
      title: 'Yeni Görev Atandı',
      content: `"${task.title}" görevi ${assignee.firstName} ${assignee.lastName}'a atandı.`,
      type: 'task',
      taskId: task.id
    });
  };

  const notifyTaskUpdated = (task) => {
    addNotification({
      title: 'Görev Güncellendi',
      content: `"${task.title}" görevi güncellendi.`,
      type: 'task',
      taskId: task.id
    });
  };

  const notifyTaskDueSoon = (task) => {
    addNotification({
      title: 'Görev Süresi Yaklaşıyor',
      content: `"${task.title}" görevinin süresi yaklaşıyor!`,
      type: 'warning',
      taskId: task.id
    });
  };

  const notifyLeaveRequest = (request, action) => {
    addNotification({
      title: action === 'approved' ? 'İzin Onaylandı' : action === 'rejected' ? 'İzin Reddedildi' : 'Yeni İzin Talebi',
      content: action === 'new' 
        ? `${request.employeeName} izin talebinde bulundu.`
        : `İzin talebiniz ${action === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
      type: action === 'approved' ? 'success' : action === 'rejected' ? 'error' : 'info'
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      toasts,
      unreadCount,
      permission,
      requestPermission,
      addNotification,
      addToast,
      removeToast,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      sendPushNotification,
      notifyTaskAssigned,
      notifyTaskUpdated,
      notifyTaskDueSoon,
      notifyLeaveRequest
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
