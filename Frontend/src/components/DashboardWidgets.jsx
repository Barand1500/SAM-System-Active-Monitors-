import { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Activity,
  Bell,
  Plus,
  Calendar,
  Target,
  Zap,
  ListTodo,
  UserCheck,
  Flag,
  CalendarClock
} from 'lucide-react';

// Widget: Görev İstatistikleri
export const TaskStatsWidget = ({ tasks, isDark }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Görev İstatistikleri
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Genel durum
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <CheckSquare size={20} className="text-white" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Toplam Görev</span>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tamamlanan</span>
          <span className="font-bold text-emerald-500">{completedTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Devam Eden</span>
          <span className="font-bold text-blue-500">{inProgressTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bekleyen</span>
          <span className="font-bold text-amber-500">{pendingTasks}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600/30">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tamamlanma Oranı</span>
          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{completionRate}%</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Widget: Haftalık Çalışma Saatleri
export const WeeklyHoursWidget = ({ isDark }) => {
  const hours = 42; // Bu gerçek veriyle değiştirilecek
  const target = 40;
  const percentage = Math.round((hours / target) * 100);

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bu Hafta
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Çalışılan saat
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Clock size={20} className="text-white" />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{hours}</span>
        <span className={`text-lg font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>/ {target} saat</span>
      </div>

      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs">
        {percentage >= 100 ? (
          <span className="text-emerald-500 font-medium">✓ Hedef aşıldı!</span>
        ) : (
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Kalan: {target - hours} saat
          </span>
        )}
      </div>
    </div>
  );
};

// Widget: Yaklaşan Görevler
export const UpcomingTasksWidget = ({ tasks, isDark, onTaskClick }) => {
  const today = new Date();
  const upcoming = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) > today && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return isDark ? 'text-slate-400' : 'text-slate-600';
    }
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Yaklaşan Görevler
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Önümüzdeki görevler
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <Calendar size={20} className="text-white" />
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle size={32} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Yaklaşan görev yok
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((task => (
            <button
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 ${getPriorityColor(task.priority)}`}>
                  <Target size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </button>
          )))}
        </div>
      )}
    </div>
  );
};

// Widget: Takım Performansı
export const TeamPerformanceWidget = ({ employees, tasks, isDark }) => {
  const topPerformers = employees
    .map(emp => ({
      ...emp,
      completedTasks: tasks.filter(t => t.assignee?.id === emp.id && t.status === 'completed').length,
      totalTasks: tasks.filter(t => t.assignee?.id === emp.id).length
    }))
    .filter(emp => emp.totalTasks > 0)
    .sort((a, b) => b.completedTasks - a.completedTasks)
    .slice(0, 5);

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Takım Performansı
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            En aktif çalışanlar
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
          <Users size={20} className="text-white" />
        </div>
      </div>

      {topPerformers.length === 0 ? (
        <div className="text-center py-6">
          <Users size={32} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Veri yok
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topPerformers.map((emp, idx) => (
            <div key={emp.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                idx === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                  : idx === 1
                    ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800'
                    : idx === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {emp.firstName} {emp.lastName}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {emp.completedTasks} / {emp.totalTasks} görev
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-500">
                  {emp.totalTasks > 0 ? Math.round((emp.completedTasks / emp.totalTasks) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Widget: Son Aktiviteler
export const RecentActivitiesWidget = ({ isDark }) => {
  const activities = JSON.parse(localStorage.getItem('sam_change_history') || '[]').slice(0, 5);

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Son Aktiviteler
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Güncel değişiklikler
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
          <Activity size={20} className="text-white" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Activity size={32} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Henüz aktivite yok
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activity.description}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {activity.userName} • {new Date(activity.timestamp).toLocaleString('tr-TR', { 
                  day: 'numeric', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Widget: Bildirim Özeti
export const NotificationSummaryWidget = ({ isDark }) => {
  const unreadCount = 3; // Bu gerçek veriyle değiştirilecek
  
  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bildirimler
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Okunmamış bildirimler
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl relative">
          <Bell size={20} className="text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      <div className="text-center py-8">
        <div className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {unreadCount}
        </div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Okunmamış bildirim
        </p>
      </div>
    </div>
  );
};

// Widget: Hızlı Görev Ekleme
export const QuickTaskAddWidget = ({ isDark, onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onAddTask?.(taskTitle.trim());
      setTaskTitle('');
    }
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Plus size={20} className="text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Hızlı Görev Ekle
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Anında görev oluştur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Görev başlığını yazın..."
          className={`w-full px-4 py-3 rounded-lg border ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        />
        <button
          type="submit"
          disabled={!taskTitle.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap size={18} />
          Hızlı Ekle
        </button>
      </form>
    </div>
  );
};

// Widget: Bekleyen Görevler
export const PendingTasksWidget = ({ tasks, isDark, onTaskClick }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bekleyen Görevler
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {pendingTasks.length} görev bekliyor
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <ListTodo size={20} className="text-white" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {pendingTasks.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <ListTodo size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Bekleyen görev yok</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              } cursor-pointer transition-all`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-1`}>
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Widget: Benim Görevlerim
export const MyTasksWidget = ({ tasks, user, isDark, onTaskClick }) => {
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id && t.status !== 'completed').slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress': return { text: 'Devam Ediyor', color: 'bg-blue-500' };
      case 'pending': return { text: 'Bekliyor', color: 'bg-amber-500' };
      default: return { text: 'Bilinmiyor', color: 'bg-slate-500' };
    }
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Benim Görevlerim
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {myTasks.length} aktif görev
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
          <UserCheck size={20} className="text-white" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {myTasks.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <UserCheck size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aktif göreviniz yok</p>
          </div>
        ) : (
          myTasks.map(task => {
            const statusInfo = getStatusBadge(task.status);
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={`p-3 rounded-lg border ${
                  isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-1`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    {statusInfo.text}
                  </span>
                  {task.dueDate && (
                    <span className="text-slate-500">
                      {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Widget: Öncelikli Görevler
export const PriorityTasksWidget = ({ tasks, isDark, onTaskClick }) => {
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 5);

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Öncelikli Görevler
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {highPriorityTasks.length} yüksek öncelikli
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
          <Flag size={20} className="text-white" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {highPriorityTasks.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Flag size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Yüksek öncelikli görev yok</p>
          </div>
        ) : (
          highPriorityTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`p-3 rounded-lg border border-red-500/20 ${
                isDark ? 'bg-red-950/30 hover:bg-red-950/50' : 'bg-red-50 hover:bg-red-100'
              } cursor-pointer transition-all`}
            >
              <div className="flex items-start gap-2 mb-2">
                <Flag size={14} className="text-red-500 mt-0.5 shrink-0" />
                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-2`}>
                  {task.title}
                </h4>
              </div>
              <div className="flex items-center justify-between text-xs ml-5">
                <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700'}`}>
                  {task.status === 'in_progress' ? 'Devam Ediyor' : task.status === 'pending' ? 'Bekliyor' : task.status}
                </span>
                {task.dueDate && (
                  <span className="text-slate-500">
                    {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Widget: Son Tarih Yaklaşanlar
export const DeadlineWidget = ({ tasks, isDark, onTaskClick }) => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingDeadlines = tasks
    .filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getDaysUntil = (date) => {
    const diff = new Date(date) - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Yarın';
    return `${days} gün`;
  };

  const getUrgencyColor = (date) => {
    const days = Math.ceil((new Date(date) - today) / (1000 * 60 * 60 * 24));
    if (days <= 1) return 'text-red-500 bg-red-500/10';
    if (days <= 3) return 'text-amber-500 bg-amber-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6 min-h-[320px] flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Son Tarih Yaklaşanlar
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Sonraki 7 gün
          </p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
          <CalendarClock size={20} className="text-white" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {upcomingDeadlines.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <CalendarClock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Yaklaşan son tarih yok</p>
          </div>
        ) : (
          upcomingDeadlines.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              } cursor-pointer transition-all`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-1 flex-1`}>
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getUrgencyColor(task.dueDate)}`}>
                  {getDaysUntil(task.dueDate)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={12} />
                <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
