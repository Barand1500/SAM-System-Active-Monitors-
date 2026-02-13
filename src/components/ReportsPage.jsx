import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Award,
  Target,
  Zap
} from 'lucide-react';

const ReportsPage = ({ tasks, users, isDark }) => {
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // İstatistik hesaplamaları
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Departman bazlı görev dağılımı
  const departmentStats = [
    { name: 'Yazılım', tasks: 12, completed: 8, color: '#6366f1' },
    { name: 'Tasarım', tasks: 6, completed: 5, color: '#ec4899' },
    { name: 'Pazarlama', tasks: 4, completed: 3, color: '#f59e0b' },
    { name: 'İK', tasks: 3, completed: 2, color: '#10b981' },
  ];

  // Çalışan performansı
  const employeePerformance = users
    .filter(u => u.role === 'employee')
    .map(emp => {
      const empTasks = tasks.filter(t => t.assignedTo?.id === emp.id);
      const empCompleted = empTasks.filter(t => t.status === 'completed').length;
      return {
        ...emp,
        totalTasks: empTasks.length,
        completedTasks: empCompleted,
        rate: empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0
      };
    })
    .sort((a, b) => b.rate - a.rate);

  // Haftalık görev trendi (mock data)
  const weeklyTrend = [
    { day: 'Pzt', completed: 5, created: 3 },
    { day: 'Sal', completed: 3, created: 4 },
    { day: 'Çar', completed: 7, created: 5 },
    { day: 'Per', completed: 4, created: 6 },
    { day: 'Cum', completed: 6, created: 4 },
    { day: 'Cmt', completed: 2, created: 1 },
    { day: 'Paz', completed: 1, created: 2 },
  ];

  const maxWeeklyValue = Math.max(...weeklyTrend.map(d => Math.max(d.completed, d.created)));

  // Öncelik dağılımı
  const priorityDist = [
    { label: 'Acil', count: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
    { label: 'Yüksek', count: tasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
    { label: 'Orta', count: tasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
    { label: 'Düşük', count: tasks.filter(t => t.priority === 'low').length, color: '#94a3b8' },
  ];

  const totalPriority = priorityDist.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Raporlar & İstatistikler
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Şirket performansını analiz edin
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tarih Filtresi */}
          <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${dateRange === range 
                            ? 'bg-indigo-500 text-white' 
                            : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800')}`}
              >
                {range === 'week' ? 'Hafta' : range === 'month' ? 'Ay' : 'Yıl'}
              </button>
            ))}
          </div>

          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors
                           ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>
            <Download size={18} />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <ClipboardList size={24} className="text-indigo-600" />
            </div>
            <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <TrendingUp size={16} />
              +12%
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalTasks}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toplam Görev</p>
        </div>

        <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <TrendingUp size={16} />
              +8%
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{completedTasks}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tamamlanan</p>
        </div>

        <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
              <TrendingDown size={16} />
              -3%
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pendingTasks}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bekleyen</p>
        </div>

        <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target size={24} className="text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <TrendingUp size={16} />
              +5%
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{completionRate}%</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tamamlanma Oranı</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Haftalık Trend */}
        <div className={`col-span-2 rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Haftalık Görev Trendi</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tamamlanan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oluşturulan</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-4">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 h-40 items-end">
                  <div 
                    className="flex-1 bg-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${(day.completed / maxWeeklyValue) * 100}%` }}
                  />
                  <div 
                    className={`flex-1 rounded-t-lg transition-all ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}
                    style={{ height: `${(day.created / maxWeeklyValue) * 100}%` }}
                  />
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Öncelik Dağılımı - Donut Chart */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Öncelik Dağılımı</h3>
          
          {/* Simple donut representation */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {priorityDist.reduce((acc, item, index) => {
                const percentage = totalPriority > 0 ? (item.count / totalPriority) * 100 : 0;
                const offset = acc.offset;
                acc.elements.push(
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    strokeDashoffset={-offset * 2.51}
                    className="transition-all duration-500"
                  />
                );
                acc.offset += percentage;
                return acc;
              }, { elements: [], offset: 0 }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalTasks}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Görev</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {priorityDist.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</span>
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Departman Performansı */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Departman Performansı</h3>
          
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{dept.name}</span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {dept.completed}/{dept.tasks} görev
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(dept.completed / dept.tasks) * 100}%`,
                      backgroundColor: dept.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En İyi Performans */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Çalışan Performansı</h3>
            <Award size={20} className="text-amber-500" />
          </div>
          
          <div className="space-y-4">
            {employeePerformance.slice(0, 5).map((emp, index) => (
              <div key={emp.id} className="flex items-center gap-4">
                <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                  {emp.firstName?.[0]}{emp.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {emp.completedTasks}/{emp.totalTasks} görev tamamladı
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${emp.rate >= 80 ? 'text-emerald-500' : emp.rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    %{emp.rate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
