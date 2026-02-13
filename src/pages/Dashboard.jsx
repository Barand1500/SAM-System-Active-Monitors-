import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { tasks, users, announcements, notifications, departments } from '../data/mockData';
import { 
  LayoutDashboard,
  Users,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  Copy,
  Megaphone,
  UserPlus,
  BarChart3,
  Target,
  Crown,
  Briefcase,
  Sun,
  Moon,
  Kanban,
  CalendarDays,
  Timer,
  FileText,
  Palmtree
} from 'lucide-react';

// Yeni bileşenleri import et
import TimeTracker from '../components/TimeTracker';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import ReportsPage from '../components/ReportsPage';
import LeaveRequestSystem from '../components/LeaveRequestSystem';
import TaskDetailModal from '../components/TaskDetailModal';

// Ana Dashboard bileşeni
const Dashboard = () => {
  const { user, company, logout, isBoss, isManager } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const canManage = isBoss || isManager;

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks', label: canManage ? 'Tüm Görevler' : 'Görevlerim', icon: ClipboardList },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays },
    { id: 'timetracker', label: 'Mesai', icon: Timer },
    ...(canManage ? [{ id: 'reports', label: 'Raporlar', icon: BarChart3 }] : []),
    ...(canManage ? [{ id: 'employees', label: 'Çalışanlar', icon: Users }] : []),
    { id: 'leaves', label: 'İzinler', icon: Palmtree },
    { id: 'announcements', label: 'Duyurular', icon: Megaphone },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const copyCompanyCode = () => {
    navigator.clipboard.writeText(company?.companyCode || '');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'}`}>
      {/* Üst Bar */}
      <header className={`${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Briefcase className="text-white" size={20} />
              </div>
              <div>
                <h1 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{company?.name}</h1>
                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Kod: {company?.companyCode}</span>
                  <button 
                    onClick={copyCompanyCode}
                    className={`p-1 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded transition-colors`}
                    title="Kodu kopyala"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-amber-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                title={isDark ? 'Açık Mod' : 'Koyu Mod'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Arama */}
              <div className="relative hidden md:block">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Görev, çalışan ara..."
                  className={`w-64 ${isDark ? 'bg-slate-700/80 text-white placeholder-slate-500' : 'bg-slate-100/80 text-slate-700 placeholder-slate-400'}
                           text-sm rounded-xl px-4 py-2.5 pl-10 border border-transparent
                           focus:border-indigo-400 ${isDark ? 'focus:bg-slate-700' : 'focus:bg-white'} transition-all`}
                />
              </div>

              {/* Bildirimler */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <Bell size={20} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 top-full mt-2 w-80 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl border overflow-hidden z-50`}>
                    <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirimler</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b transition-colors cursor-pointer
                                    ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-50 hover:bg-slate-50'}
                                    ${!notif.isRead ? (isDark ? 'bg-indigo-900/20' : 'bg-indigo-50/50') : ''}`}
                        >
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{notif.title}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{notif.content}</p>
                          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{notif.createdAt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Kullanıcı Menüsü */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.firstName} {user?.lastName}</p>
                    <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isBoss && <Crown size={10} className="text-amber-500" />}
                      {user?.position}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`hidden md:block ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 top-full mt-2 w-56 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl border py-2 z-50`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.firstName} {user?.lastName}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                      <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium
                                      ${isBoss ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {isBoss ? <Crown size={10} /> : null}
                        {isBoss ? 'Patron' : isManager ? 'Yönetici' : 'Çalışan'}
                      </span>
                    </div>
                    <button className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Settings size={16} />
                      Hesap Ayarları
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigasyonu */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-1 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} overflow-x-auto`}>
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                            ${activeTab === item.id 
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                              : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')}`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {canManage && activeTab === 'tasks' && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                             hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl
                             shadow-lg shadow-indigo-500/25 transition-all">
              <Plus size={18} />
              Yeni Görev
            </button>
          )}

          {canManage && activeTab === 'employees' && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                             hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl
                             shadow-lg shadow-indigo-500/25 transition-all">
              <UserPlus size={18} />
              Çalışan Davet Et
            </button>
          )}
        </div>

        {/* İçerik */}
        {activeTab === 'overview' && <OverviewTab canManage={canManage} isDark={isDark} />}
        {activeTab === 'tasks' && <TasksTab canManage={canManage} isDark={isDark} onTaskClick={handleTaskClick} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={tasks} isDark={isDark} onTaskClick={handleTaskClick} />}
        {activeTab === 'calendar' && <CalendarView tasks={tasks} isDark={isDark} />}
        {activeTab === 'timetracker' && <TimeTracker user={user} isDark={isDark} />}
        {activeTab === 'reports' && canManage && <ReportsPage tasks={tasks} users={users} isDark={isDark} />}
        {activeTab === 'employees' && canManage && <EmployeesTab isDark={isDark} />}
        {activeTab === 'leaves' && <LeaveRequestSystem user={user} isBoss={isBoss} isDark={isDark} />}
        {activeTab === 'announcements' && <AnnouncementsTab canManage={canManage} isDark={isDark} />}
        {activeTab === 'settings' && <SettingsTab isDark={isDark} />}
      </div>

      {/* Görev Detay Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => console.log('Task updated:', updatedTask)}
          user={user}
          isDark={isDark}
        />
      )}

      {/* Click outside to close menus */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => { setShowNotifications(false); setShowUserMenu(false); }}
        />
      )}
    </div>
  );
};

// Genel Bakış Tab
const OverviewTab = ({ canManage, isDark }) => {
  const { user } = useAuth();
  
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id);
  const stats = canManage ? [
    { label: 'Toplam Görev', value: tasks.length, icon: ClipboardList, color: 'from-indigo-500 to-purple-500', bg: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50' },
    { label: 'Devam Eden', value: tasks.filter(t => t.status === 'in_progress').length, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
    { label: 'Bekleyen', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-orange-500', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' },
    { label: 'Tamamlanan', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50' },
  ] : [
    { label: 'Görevlerim', value: myTasks.length, icon: ClipboardList, color: 'from-indigo-500 to-purple-500', bg: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50' },
    { label: 'Devam Eden', value: myTasks.filter(t => t.status === 'in_progress').length, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
    { label: 'Bekleyen', value: myTasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-orange-500', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' },
    { label: 'Tamamlanan', value: myTasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50' },
  ];

  const recentTasks = canManage ? tasks.slice(0, 5) : myTasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hoş Geldin Mesajı */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Hoş geldin, {user?.firstName}! 👋</h2>
          <p className="text-white/80">
            {canManage 
              ? 'Bugün şirketinizde 3 aktif görev var. İşleri takip etmeye devam edin.'
              : `Bugün ${myTasks.filter(t => t.status !== 'completed').length} tamamlanmamış göreviniz var.`
            }
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bg} rounded-2xl p-5 border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</span>
              </div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Son Görevler */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} overflow-hidden`}>
          <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Son Görevler</h3>
            <button className="text-sm text-indigo-500 font-medium hover:text-indigo-600">Tümünü Gör</button>
          </div>
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {recentTasks.map(task => (
              <div key={task.id} className={`p-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Atanmadı'}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yaklaşan Teslimler */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} overflow-hidden`}>
          <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yaklaşan Teslimler</h3>
            <Calendar size={18} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {tasks.filter(t => t.dueDate && t.status !== 'completed').slice(0, 4).map(task => (
              <div key={task.id} className={`p-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>
                    <p className={`text-sm flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock size={14} />
                      {task.dueDate}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Çalışan Dağılımı - Sadece Patron için */}
      {canManage && (
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} p-6`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Departman Görev Dağılımı</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {departments.map(dept => {
              const deptTasks = tasks.filter(t => t.department === dept.name);
              return (
                <div key={dept.id} className={`${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dept.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{deptTasks.length}</span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{dept.employeeCount} çalışan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Görevler Tab
const TasksTab = ({ canManage, isDark, onTaskClick }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const displayTasks = canManage 
    ? tasks 
    : tasks.filter(t => t.assignedTo?.id === user?.id);

  const filteredTasks = filter === 'all' 
    ? displayTasks 
    : displayTasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'pending', label: 'Bekleyen' },
          { value: 'in_progress', label: 'Devam Eden' },
          { value: 'review', label: 'İncelemede' },
          { value: 'completed', label: 'Tamamlanan' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${filter === f.value 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                        : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200')}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Görev Listesi */}
      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => onTaskClick && onTaskClick(task)}
            className={`${isDark ? 'bg-slate-800 border-slate-700/60 hover:bg-slate-700/50' : 'bg-white border-slate-200/60 hover:shadow-lg'} rounded-2xl border p-5 transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h3>
                  <PriorityBadge priority={task.priority} />
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                        {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                    </div>
                  ) : (
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Atanmadı</span>
                  )}
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Calendar size={14} />
                      {task.dueDate}
                    </div>
                  )}

                  <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>•</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{task.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                {canManage && !task.assignedTo && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowAssignModal(true); }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Ata
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <ClipboardList size={28} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Bulunamadı</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bu filtreye uygun görev bulunmuyor.</p>
        </div>
      )}

      {/* Atama Modal */}
      {showAssignModal && (
        <AssignModal 
          task={selectedTask} 
          onClose={() => { setShowAssignModal(false); setSelectedTask(null); }}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Çalışanlar Tab (Sadece Patron)
const EmployeesTab = ({ isDark }) => {
  const employees = users.filter(u => u.role !== 'boss');

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => {
          const empTasks = tasks.filter(t => t.assignedTo?.id === emp.id);
          const completedTasks = empTasks.filter(t => t.status === 'completed').length;
          
          return (
            <div key={emp.id} className={`${isDark ? 'bg-slate-800 border-slate-700/60 hover:bg-slate-700/50' : 'bg-white border-slate-200/60 hover:shadow-lg'} rounded-2xl border p-5 transition-all`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.firstName} {emp.lastName}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                                      emp.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 
                                      'bg-slate-100 text-slate-600'}`}>
                      {emp.status === 'active' ? 'Aktif' : emp.status === 'on_leave' ? 'İzinli' : 'Pasif'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emp.department}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} grid grid-cols-3 gap-2 text-center`}>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{empTasks.length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toplam</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{empTasks.filter(t => t.status === 'in_progress').length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aktif</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-500">{completedTasks}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Biten</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Duyurular Tab
const AnnouncementsTab = ({ canManage, isDark }) => {
  return (
    <div className="space-y-4">
      {canManage && (
        <button className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2
                         ${isDark 
                           ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400' 
                           : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-500 hover:text-indigo-600'}`}>
          <Plus size={20} />
          Yeni Duyuru Ekle
        </button>
      )}

      {announcements.map(ann => (
        <div key={ann.id} className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border overflow-hidden
                                    ${ann.isPinned ? 'border-amber-500/50' : (isDark ? 'border-slate-700/60' : 'border-slate-200/60')}`}>
          {ann.isPinned && (
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-b border-amber-100 dark:border-amber-800 flex items-center gap-2">
              <Target size={14} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Sabitlenmiş Duyuru</span>
            </div>
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{ann.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ann.content}</p>
              </div>
              {ann.priority === 'urgent' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">Acil</span>
              )}
              {ann.priority === 'important' && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">Önemli</span>
              )}
            </div>
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs">
                {ann.createdBy.firstName[0]}{ann.createdBy.lastName[0]}
              </div>
              <span>{ann.createdBy.firstName} {ann.createdBy.lastName}</span>
              <span>•</span>
              <span>{ann.createdAt}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Ayarlar Tab
const SettingsTab = ({ isDark }) => {
  const { user, company } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-6`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Profil Bilgileri</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ad</label>
              <input
                type="text"
                defaultValue={user?.firstName}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-2.5`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Soyad</label>
              <input
                type="text"
                defaultValue={user?.lastName}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-2.5`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>E-posta</label>
            <input
              type="email"
              defaultValue={user?.email}
              className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-2.5`}
            />
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-6`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Şirket Bilgileri</h3>
        <div className="space-y-3 text-sm">
          <div className={`flex justify-between py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Şirket Adı</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{company?.name}</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Şirket Kodu</span>
            <code className="text-indigo-500 font-mono font-medium">{company?.companyCode}</code>
          </div>
          <div className="flex justify-between py-2">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Rolünüz</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.position}</span>
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                       hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

// Görev Atama Modal
const AssignModal = ({ task, onClose, isDark }) => {
  const employees = users.filter(u => u.role === 'employee' && u.status === 'active');
  const [selected, setSelected] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-md overflow-hidden shadow-2xl`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Ata</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task?.title}</p>
        </div>

        <div className="p-6 max-h-80 overflow-y-auto">
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Görevi atamak istediğiniz çalışanı seçin:</p>
          <div className="space-y-2">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelected(emp.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                          ${selected === emp.id 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                            : (isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300')}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-medium">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.firstName} {emp.lastName}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.position} • {emp.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}
          >
            İptal
          </button>
          <button
            disabled={!selected}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                     hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ata
          </button>
        </div>
      </div>
    </div>
  );
};

// Durum Badge
const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Bekliyor', bg: 'bg-slate-100', text: 'text-slate-600' },
    in_progress: { label: 'Devam Ediyor', bg: 'bg-blue-100', text: 'text-blue-700' },
    review: { label: 'İncelemede', bg: 'bg-purple-100', text: 'text-purple-700' },
    completed: { label: 'Tamamlandı', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled: { label: 'İptal', bg: 'bg-red-100', text: 'text-red-700' },
  };

  const { label, bg, text } = config[status] || config.pending;

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

// Öncelik Badge
const PriorityBadge = ({ priority }) => {
  const config = {
    low: { label: 'Düşük', bg: 'bg-slate-100', text: 'text-slate-600' },
    medium: { label: 'Orta', bg: 'bg-blue-100', text: 'text-blue-700' },
    high: { label: 'Yüksek', bg: 'bg-amber-100', text: 'text-amber-700' },
    urgent: { label: 'Acil', bg: 'bg-red-100', text: 'text-red-700' },
  };

  const { label, bg, text } = config[priority] || config.medium;

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

export default Dashboard;
