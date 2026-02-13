import { createContext, useContext, useState, useCallback } from 'react';

const ActivityLogContext = createContext();

// Aktivite tipleri
const ACTIVITY_TYPES = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  TASK_ASSIGNED: 'task_assigned',
  COMMENT_ADDED: 'comment_added',
  FILE_UPLOADED: 'file_uploaded',
  STATUS_CHANGED: 'status_changed',
  LEAVE_REQUESTED: 'leave_requested',
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  TIME_CLOCK_IN: 'time_clock_in',
  TIME_CLOCK_OUT: 'time_clock_out',
  BREAK_START: 'break_start',
  BREAK_END: 'break_end',
};

// Aktivite mesajları
const getActivityMessage = (type, data = {}) => {
  const messages = {
    [ACTIVITY_TYPES.TASK_CREATED]: `"${data.taskTitle}" görevi oluşturuldu`,
    [ACTIVITY_TYPES.TASK_UPDATED]: `"${data.taskTitle}" görevi güncellendi`,
    [ACTIVITY_TYPES.TASK_COMPLETED]: `"${data.taskTitle}" görevi tamamlandı`,
    [ACTIVITY_TYPES.TASK_DELETED]: `"${data.taskTitle}" görevi silindi`,
    [ACTIVITY_TYPES.TASK_ASSIGNED]: `"${data.taskTitle}" görevi ${data.assigneeName}'a atandı`,
    [ACTIVITY_TYPES.COMMENT_ADDED]: `"${data.taskTitle}" görevine yorum eklendi`,
    [ACTIVITY_TYPES.FILE_UPLOADED]: `"${data.fileName}" dosyası yüklendi`,
    [ACTIVITY_TYPES.STATUS_CHANGED]: `"${data.taskTitle}" durumu "${data.newStatus}" olarak değiştirildi`,
    [ACTIVITY_TYPES.LEAVE_REQUESTED]: `${data.leaveType} izni talep edildi`,
    [ACTIVITY_TYPES.LEAVE_APPROVED]: `${data.userName} kullanıcısının izin talebi onaylandı`,
    [ACTIVITY_TYPES.LEAVE_REJECTED]: `${data.userName} kullanıcısının izin talebi reddedildi`,
    [ACTIVITY_TYPES.USER_LOGIN]: `Sisteme giriş yapıldı`,
    [ACTIVITY_TYPES.USER_LOGOUT]: `Sistemden çıkış yapıldı`,
    [ACTIVITY_TYPES.TIME_CLOCK_IN]: `Mesaiye giriş yapıldı`,
    [ACTIVITY_TYPES.TIME_CLOCK_OUT]: `Mesaiden çıkış yapıldı`,
    [ACTIVITY_TYPES.BREAK_START]: `Molaya çıkıldı`,
    [ACTIVITY_TYPES.BREAK_END]: `Moladan dönüldü`,
  };
  return messages[type] || 'Bilinmeyen aktivite';
};

// Aktivite ikonları
const getActivityIcon = (type) => {
  const icons = {
    [ACTIVITY_TYPES.TASK_CREATED]: '📋',
    [ACTIVITY_TYPES.TASK_UPDATED]: '✏️',
    [ACTIVITY_TYPES.TASK_COMPLETED]: '✅',
    [ACTIVITY_TYPES.TASK_DELETED]: '🗑️',
    [ACTIVITY_TYPES.TASK_ASSIGNED]: '👤',
    [ACTIVITY_TYPES.COMMENT_ADDED]: '💬',
    [ACTIVITY_TYPES.FILE_UPLOADED]: '📎',
    [ACTIVITY_TYPES.STATUS_CHANGED]: '🔄',
    [ACTIVITY_TYPES.LEAVE_REQUESTED]: '🏖️',
    [ACTIVITY_TYPES.LEAVE_APPROVED]: '✅',
    [ACTIVITY_TYPES.LEAVE_REJECTED]: '❌',
    [ACTIVITY_TYPES.USER_LOGIN]: '🔐',
    [ACTIVITY_TYPES.USER_LOGOUT]: '🚪',
    [ACTIVITY_TYPES.TIME_CLOCK_IN]: '⏰',
    [ACTIVITY_TYPES.TIME_CLOCK_OUT]: '🏠',
    [ACTIVITY_TYPES.BREAK_START]: '☕',
    [ACTIVITY_TYPES.BREAK_END]: '💼',
  };
  return icons[type] || '📌';
};

export const ActivityLogProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activityLog');
    return saved ? JSON.parse(saved) : [];
  });

  // Aktivite ekleme
  const logActivity = useCallback((type, data = {}, userId = null, userName = null) => {
    const activity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      data,
      message: getActivityMessage(type, data),
      icon: getActivityIcon(type),
      userId,
      userName,
      timestamp: new Date().toISOString(),
    };

    setActivities(prev => {
      const updated = [activity, ...prev].slice(0, 500); // Max 500 aktivite
      localStorage.setItem('activityLog', JSON.stringify(updated));
      return updated;
    });

    return activity;
  }, []);

  // Aktiviteleri filtreleme
  const getActivitiesByType = useCallback((type) => {
    return activities.filter(a => a.type === type);
  }, [activities]);

  // Kullanıcıya göre filtreleme
  const getActivitiesByUser = useCallback((userId) => {
    return activities.filter(a => a.userId === userId);
  }, [activities]);

  // Tarihe göre filtreleme
  const getActivitiesByDateRange = useCallback((startDate, endDate) => {
    return activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }, [activities]);

  // Son X aktivite
  const getRecentActivities = useCallback((count = 10) => {
    return activities.slice(0, count);
  }, [activities]);

  // Tüm aktiviteleri temizle
  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem('activityLog');
  }, []);

  const value = {
    activities,
    logActivity,
    getActivitiesByType,
    getActivitiesByUser,
    getActivitiesByDateRange,
    getRecentActivities,
    clearActivities,
    ACTIVITY_TYPES,
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};

export { ACTIVITY_TYPES };
export default ActivityLogContext;
