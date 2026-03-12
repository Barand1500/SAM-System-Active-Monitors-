import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auditLogAPI } from '../services/api';

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
  const [activities, setActivities] = useState([]);

  // API'den yükle (sadece giriş yapılmışsa)
  useEffect(() => {
    const load = async () => {
      // Token yoksa API çağrısı yapma (sonsuz döngü önlenir)
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const res = await auditLogAPI.list({ limit: 500 });
        const data = res.data?.data || res.data || [];
        setActivities(data.map(a => ({
          id: a.id,
          type: a.type || '',
          message: a.description || '',
          icon: getActivityIcon(a.type),
          userId: a.userId || a.user_id,
          userName: a.userName || a.user_name,
          timestamp: a.created_at || a.createdAt,
        })));
      } catch (err) {
        console.error('Aktivite logu yüklenemedi:', err);
      }
    };
    load();
  }, []);

  // Aktivite ekleme
  const logActivity = useCallback(async (type, data = {}, userId = null, userName = null) => {
    try {
      const res = await auditLogAPI.create({
        type,
        description: data.message || data.description || '',
        entity: data.entity || '',
      });
      const a = res.data;
      const activity = {
        id: a.id,
        type,
        message: a.description || '',
        icon: getActivityIcon(type),
        userId: a.userId || userId,
        userName: a.userName || userName,
        timestamp: a.created_at || a.createdAt,
      };
      setActivities(prev => [activity, ...prev].slice(0, 500));
      return activity;
    } catch (err) {
      console.error('Aktivite kaydedilemedi:', err);
    }
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
  const clearActivities = useCallback(async () => {
    try {
      await auditLogAPI.clear();
      setActivities([]);
    } catch (err) {
      console.error('Aktiviteler temizlenemedi:', err);
    }
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
