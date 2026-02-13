import { useState, useMemo } from 'react';
import { useActivityLog, ACTIVITY_TYPES } from '../context/ActivityLogContext';
import { 
  Activity, 
  Filter, 
  Calendar, 
  User, 
  X, 
  ChevronDown,
  Trash2,
  Clock,
  RefreshCw
} from 'lucide-react';

const ActivityLogPanel = ({ isDark, userId = null }) => {
  const { activities, getRecentActivities, clearActivities } = useActivityLog();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Tarih formatla
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dakika önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filtreleme
  const filteredActivities = useMemo(() => {
    let result = userId 
      ? activities.filter(a => a.userId === userId) 
      : activities;

    // Tip filtresi
    if (filter !== 'all') {
      const filterMap = {
        'tasks': [ACTIVITY_TYPES.TASK_CREATED, ACTIVITY_TYPES.TASK_UPDATED, ACTIVITY_TYPES.TASK_COMPLETED, ACTIVITY_TYPES.TASK_DELETED, ACTIVITY_TYPES.TASK_ASSIGNED, ACTIVITY_TYPES.STATUS_CHANGED],
        'comments': [ACTIVITY_TYPES.COMMENT_ADDED],
        'files': [ACTIVITY_TYPES.FILE_UPLOADED],
        'leaves': [ACTIVITY_TYPES.LEAVE_REQUESTED, ACTIVITY_TYPES.LEAVE_APPROVED, ACTIVITY_TYPES.LEAVE_REJECTED],
        'attendance': [ACTIVITY_TYPES.TIME_CLOCK_IN, ACTIVITY_TYPES.TIME_CLOCK_OUT, ACTIVITY_TYPES.BREAK_START, ACTIVITY_TYPES.BREAK_END],
        'auth': [ACTIVITY_TYPES.USER_LOGIN, ACTIVITY_TYPES.USER_LOGOUT],
      };
      result = result.filter(a => filterMap[filter]?.includes(a.type));
    }

    // Tarih filtresi
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        result = result.filter(a => new Date(a.timestamp) >= startDate);
      }
    }

    return result;
  }, [activities, filter, dateRange, userId]);

  // Aktivite renklerini belirle
  const getActivityColor = (type) => {
    if (type.includes('completed') || type.includes('approved')) return 'text-emerald-500';
    if (type.includes('deleted') || type.includes('rejected')) return 'text-red-500';
    if (type.includes('created') || type.includes('clock_in')) return 'text-blue-500';
    if (type.includes('updated') || type.includes('changed')) return 'text-amber-500';
    return 'text-slate-500';
  };

  const filterOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'tasks', label: 'Görevler' },
    { value: 'comments', label: 'Yorumlar' },
    { value: 'files', label: 'Dosyalar' },
    { value: 'leaves', label: 'İzinler' },
    { value: 'attendance', label: 'Mesai' },
    { value: 'auth', label: 'Giriş/Çıkış' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Son 7 Gün' },
    { value: 'month', label: 'Son 30 Gün' },
  ];

  return (
    <div className={`rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <Activity size={20} className="text-indigo-500" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Aktivite Logu
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {filteredActivities.length} aktivite
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-indigo-500 text-white' 
                  : isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter size={16} />
              <span className="text-sm">Filtrele</span>
            </button>
            
            {activities.length > 0 && (
              <button
                onClick={clearActivities}
                className={`p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-slate-700 text-red-400 hover:bg-red-500/20' 
                    : 'bg-slate-100 text-red-500 hover:bg-red-50'
                }`}
                title="Tümünü Temizle"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filtreler */}
        {showFilters && (
          <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Aktivite Tipi
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDark 
                      ? 'bg-slate-600 text-white border-slate-500' 
                      : 'bg-white text-slate-700 border-slate-200'
                  } border`}
                >
                  {filterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tarih Aralığı
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDark 
                      ? 'bg-slate-600 text-white border-slate-500' 
                      : 'bg-white text-slate-700 border-slate-200'
                  } border`}
                >
                  {dateRangeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aktivite Listesi */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Activity size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`p-4 transition-colors ${
                  isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* İkon */}
                  <div className={`text-2xl shrink-0`}>
                    {activity.icon}
                  </div>
                  
                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {activity.userName && (
                        <span className={`font-semibold ${getActivityColor(activity.type)}`}>
                          {activity.userName}
                        </span>
                      )}{' '}
                      {activity.message}
                    </p>
                    <div className={`flex items-center gap-2 mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock size={12} />
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>

                  {/* Timeline noktası */}
                  {index < filteredActivities.length - 1 && (
                    <div className={`absolute left-[2.35rem] top-12 w-0.5 h-full ${
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length >= 50 && (
        <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} text-center`}>
          <button
            className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
          >
            Daha fazla göster
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPanel;
