import { useState, useEffect } from 'react';
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
  Award,
  Target,
  User,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { reportAPI } from '../services/api';

const ReportsPage = ({ tasks, users, isDark, departments = [] }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [taskTrends, setTaskTrends] = useState({ totalTrend: '0%', completedTrend: '0%' });
  const [personAttendance, setPersonAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const employees = users.filter(u => u.role !== 'boss');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [trendRes, trendsRes] = await Promise.all([
          reportAPI.weeklyTrend(),
          reportAPI.taskTrends()
        ]);
        if (Array.isArray(trendRes.data)) setWeeklyTrend(trendRes.data);
        if (trendsRes.data) setTaskTrends(trendsRes.data);
      } catch (e) {
        console.error('Rapor verileri yüklenemedi:', e);
      }
    };
    loadReportData();
  }, []);

  useEffect(() => {
    const loadPersonAttendance = async () =>{
      if (!selectedPerson) {
        setPersonAttendance(null);
        return;
      }
      
      try {
        setAttendanceLoading(true);
        const res = await reportAPI.userAttendance(selectedPerson);
        setPersonAttendance(res.data);
      } catch (e) {
        console.error('Mesai verileri yüklenemedi:', e);
        setPersonAttendance(null);
      } finally {
        setAttendanceLoading(false);
      }
    };
    loadPersonAttendance();
  }, [selectedPerson]);

  // ===== GENEL RAPOR =====
  const renderGeneralReport = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const deptStats = departments.map(dept => {
      const deptTasks = tasks.filter(t => t.department === dept.name);
      const deptCompleted = deptTasks.filter(t => t.status === 'completed').length;
      return {
        name: dept.name,
        color: dept.color,
        total: deptTasks.length,
        completed: deptCompleted,
        rate: deptTasks.length > 0 ? Math.round((deptCompleted / deptTasks.length) * 100) : 0
      };
    });

    const priorityDist = [
      { label: 'Acil', count: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
      { label: 'Yüksek', count: tasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
      { label: 'Orta', count: tasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
      { label: 'Düşük', count: tasks.filter(t => t.priority === 'low').length, color: '#94a3b8' },
    ];
    const totalPriority = priorityDist.reduce((sum, p) => sum + p.count, 0);

    const maxWeeklyValue = Math.max(1, ...weeklyTrend.map(d => Math.max(d.completed, d.created)));

    const employeePerformance = employees
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

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Görev', value: totalTasks, icon: ClipboardList, color: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-600', trend: taskTrends.totalTrend, up: !taskTrends.totalTrend?.startsWith('-') },
            { label: 'Tamamlanan', value: completedTasks, icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600', trend: taskTrends.completedTrend, up: !taskTrends.completedTrend?.startsWith('-') },
            { label: 'Bekleyen', value: pendingTasks, icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600', trend: '', up: false },
            { label: 'Tamamlanma', value: `${completionRate}%`, icon: Target, color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600', trend: '', up: true },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} className={stat.iconColor} />
                  </div>
                  {stat.trend && (
                    <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
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
            <div className="flex items-end justify-between h-48 gap-4">
              {weeklyTrend.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 h-40 items-end">
                    <div className="flex-1 bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${(day.completed / maxWeeklyValue) * 100}%` }} />
                    <div className={`flex-1 rounded-t-lg transition-all ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} style={{ height: `${(day.created / maxWeeklyValue) * 100}%` }} />
                  </div>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
            <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Öncelik Dağılımı</h3>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {priorityDist.reduce((acc, item, index) => {
                  const percentage = totalPriority > 0 ? (item.count / totalPriority) * 100 : 0;
                  const offset = acc.offset;
                  acc.elements.push(
                    <circle key={index} cx="50" cy="50" r="40" fill="none" stroke={item.color} strokeWidth="20"
                      strokeDasharray={`${percentage * 2.51} 251`} strokeDashoffset={-offset * 2.51} />
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
              {priorityDist.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
            <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Departman Performansı</h3>
            <div className="space-y-4">
              {deptStats.map((dept, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{dept.name}</span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{dept.completed}/{dept.total} (%{dept.rate})</span>
                  </div>
                  <div className={`h-2.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dept.rate}%`, backgroundColor: dept.color }} />
                  </div>
                </div>
              ))}
              {deptStats.length === 0 && (
                <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Departman verisi bulunamadı</p>
              )}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Çalışan Sıralaması</h3>
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
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.firstName} {emp.lastName}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.completedTasks}/{emp.totalTasks} görev</p>
                  </div>
                  <p className={`font-bold ${emp.rate >= 80 ? 'text-emerald-500' : emp.rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>%{emp.rate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== KİŞİ RAPORU =====
  const renderPersonReport = () => {
    const person = employees.find(e => e.id === Number(selectedPerson));
    
    if (!selectedPerson || !person) {
      return (
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Çalışan Seçin</label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className={`w-full max-w-md ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">-- Çalışan seçin --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.department}</option>
              ))}
            </select>
          </div>
          <div className="text-center py-16">
            <User size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rapor görmek için bir çalışan seçin</p>
          </div>
        </div>
      );
    }

    const personTasks = tasks.filter(t => t.assignedTo?.id === person.id);
    const completed = personTasks.filter(t => t.status === 'completed').length;
    const inProgress = personTasks.filter(t => t.status === 'in_progress').length;
    const pending = personTasks.filter(t => t.status === 'pending').length;
    const rate = personTasks.length > 0 ? Math.round((completed / personTasks.length) * 100) : 0;

    const overdueTasks = personTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    });

    const priorityCounts = {
      urgent: personTasks.filter(t => t.priority === 'urgent').length,
      high: personTasks.filter(t => t.priority === 'high').length,
      medium: personTasks.filter(t => t.priority === 'medium').length,
      low: personTasks.filter(t => t.priority === 'low').length,
    };

    return (
      <div className="space-y-6">
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          className={`w-full max-w-md ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500`}
        >
          <option value="">-- Çalışan seçin --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.department}</option>
          ))}
        </select>

        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {person.firstName[0]}{person.lastName[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold">{person.firstName} {person.lastName}</h3>
              <p className="text-white/70">{person.position || person.department} &bull; {person.department}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Toplam', value: personTasks.length, cls: 'text-indigo-500' },
            { label: 'Tamamlanan', value: completed, cls: 'text-emerald-500' },
            { label: 'Devam Eden', value: inProgress, cls: 'text-blue-500' },
            { label: 'Bekleyen', value: pending, cls: 'text-amber-500' },
            { label: 'Geciken', value: overdueTasks.length, cls: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-4 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border- slate-200'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Tamamlanma Oranı</h3>
            <span className={`text-2xl font-bold ${rate >= 80 ? 'text-emerald-500' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>%{rate}</span>
          </div>
          <div className={`h-4 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${rate}%` }} />
          </div>
        </div>

        {/* Mesai Bilgileri */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border-indigo-200'} border`}>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-indigo-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Mesai Çalışma Bilgileri (Son 30 Gün)</h3>
          </div>
          
          {attendanceLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yü

kleniyor...</p>
            </div>
          ) : personAttendance && personAttendance.stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Toplam Gün', value: personAttendance.stats.totalDays, icon: Calendar, color: 'text-indigo-500' },
                  { label: 'Zamanında', value: personAttendance.stats.onTimeDays, icon: CheckCircle2, color: 'text-emerald-500' },
                  { label: 'Geç Kalan', value: personAttendance.stats.lateDays, icon: Clock, color: 'text-amber-500' },
                  { label: 'Geç Kalma', value: `%${personAttendance.stats.latePercent}`, icon: BarChart3, color: 'text-red-500' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`rounded-xl p-4 text-center ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                      <Icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Çalışma Süreleri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toplam Çalışma:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{personAttendance.stats.totalWorkTime.text}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ortalama/Gün:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{personAttendance.stats.averageWorkTime.text}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mola Süreleri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toplam Mola:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{personAttendance.stats.totalBreakTime.text}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ortalama/Gün:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{personAttendance.stats.averageBreakTime.text}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Son Mesai Kayıtları</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {personAttendance.attendances.slice(0, 10).map((att, idx) => (
                    <div key={att.id} className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50/80'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${att.isLate ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {att.isLate ? 'GEÇ' : 'ZAMANINDA'}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {new Date(att.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {att.workDuration ? att.workDuration.text : 'Devam ediyor'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          Giriş: {new Date(att.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {att.checkOut && (
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Çıkış: {new Date(att.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {att.breakCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                            {att.breakCount} mola
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Clock size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Mesai bilgisi bulunamadı
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Öncelik Dağılımı</h3>
            <div className="space-y-3">
              {[
                { label: 'Acil', count: priorityCounts.urgent, color: '#ef4444' },
                { label: 'Yüksek', count: priorityCounts.high, color: '#f59e0b' },
                { label: 'Orta', count: priorityCounts.medium, color: '#3b82f6' },
                { label: 'Düşük', count: priorityCounts.low, color: '#94a3b8' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full" style={{ width: `${personTasks.length > 0 ? (p.count / personTasks.length) * 100 : 0}%`, backgroundColor: p.color }} />
                    </div>
                    <span className={`font-medium text-sm w-6 text-right ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Son Görevler</h3>
            <div className="space-y-3">
              {personTasks.slice(0, 5).map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.dueDate || 'Tarih yok'}</p>
                  </div>
                  <span className={`ml-3 px-2 py-0.5 rounded-md text-xs font-medium
                    ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-600'}`}>
                    {task.status === 'completed' ? 'Bitti' : task.status === 'in_progress' ? 'Devam' : 'Bekliyor'}
                  </span>
                </div>
              ))}
              {personTasks.length === 0 && (
                <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Görev bulunamadı</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== DEPARTMAN RAPORU =====
  const renderProjectReport = () => {
    const filteredDepts = selectedDepartment === 'all' 
      ? departments 
      : departments.filter(d => d.name === selectedDepartment);

    return (
      <div className="space-y-6">
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={`w-full max-w-md ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500`}
        >
          <option value="all">Tüm Departmanlar</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        {filteredDepts.map(dept => {
          const deptTasks = tasks.filter(t => t.department === dept.name);
          const deptEmployees = users.filter(u => u.department === dept.name && u.role !== 'boss');
          const completed = deptTasks.filter(t => t.status === 'completed').length;
          const inProgress = deptTasks.filter(t => t.status === 'in_progress').length;
          const pending = deptTasks.filter(t => t.status === 'pending').length;
          const rate = deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0;

          const overdue = deptTasks.filter(t => {
            if (!t.dueDate || t.status === 'completed') return false;
            return new Date(t.dueDate) < new Date();
          }).length;

          return (
            <div key={dept.id} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
              <div className="p-6" style={{ background: `linear-gradient(135deg, ${dept.color}22, ${dept.color}08)` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: dept.color + '22' }}>
                      <Briefcase size={24} style={{ color: dept.color }} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{dept.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{deptEmployees.length} çalışan &bull; {deptTasks.length} görev</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${rate >= 80 ? 'text-emerald-500' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>%{rate}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tamamlanma</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Tamamlanan', value: completed, color: 'text-emerald-500' },
                    { label: 'Devam Eden', value: inProgress, color: 'text-blue-500' },
                    { label: 'Bekleyen', value: pending, color: 'text-amber-500' },
                    { label: 'Geciken', value: overdue, color: 'text-red-500' },
                  ].map((s, i) => (
                    <div key={i} className={`text-center p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>İlerleme</span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{completed}/{deptTasks.length}</span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'} overflow-hidden`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rate}%`, backgroundColor: dept.color }} />
                  </div>
                </div>

                <h4 className={`font-medium mb-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Departman Çalışanları</h4>
                <div className="space-y-2">
                  {deptEmployees.map(emp => {
                    const empTasks = deptTasks.filter(t => t.assignedTo?.id === emp.id);
                    const empCompleted = empTasks.filter(t => t.status === 'completed').length;
                    const empRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;
                    return (
                      <div key={emp.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.firstName} {emp.lastName}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{empCompleted}/{empTasks.length} görev</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${empRate >= 80 ? 'text-emerald-500' : empRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>%{empRate}</span>
                      </div>
                    );
                  })}
                  {deptEmployees.length === 0 && (
                    <p className={`text-sm text-center py-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bu departmanda çalışan yok</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Raporlar & İstatistikler
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Şirket performansını analiz edin
          </p>
        </div>

        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors
                         ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>
          <Download size={18} />
          Rapor İndir
        </button>
      </div>

      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { id: 'general', label: 'Genel Rapor', icon: BarChart3 },
          { id: 'person', label: 'Kişi Raporu', icon: User },
          { id: 'project', label: 'Departman Raporu', icon: Briefcase },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${activeTab === tab.id 
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                          : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800')}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && renderGeneralReport()}
      {activeTab === 'person' && renderPersonReport()}
      {activeTab === 'project' && renderProjectReport()}
    </div>
  );
};

export default ReportsPage;
