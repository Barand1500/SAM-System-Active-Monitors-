import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { users as initialUsers, announcements as initialAnnouncements, notifications, departments } from '../data/mockData';
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
  Palmtree,
  X,
  Edit,
  Trash2,
  MoreVertical,
  Pin,
  Send,
  Mail,
  Phone,
  User,
  Upload,
  Paperclip,
  Volume2,
  VolumeX,
  CalendarClock,
  FolderPlus,
  Palette,
  Shield,
  UserCog,
  Sparkles,
  Award,
  Star,
  Lightbulb,
  Zap,
  Tag,
  Languages,
  Code,
  Layers,
  XCircle,
  Headphones,
  FolderOpen,
  Vote,
  Contact
} from 'lucide-react';

// Yeni bileşenleri import et
import TimeTracker from '../components/TimeTracker';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import ReportsPage from '../components/ReportsPage';
import LeaveRequestSystem from '../components/LeaveRequestSystem';
import TaskDetailModal from '../components/TaskDetailModal';
import NotificationCenter from '../components/NotificationCenter';
import SupportSystem from '../components/SupportSystem';
import CustomerCRM from '../components/CustomerCRM';
import FileSharing from '../components/FileSharing';
import SurveySystem from '../components/SurveySystem';

// LocalStorage helpers
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Başlangıç görevleri
const initialTasks = [
  {
    id: 1,
    title: 'Kullanıcı giriş sayfası tasarımı',
    description: 'Modern ve kullanıcı dostu bir giriş sayfası tasarlanacak',
    status: 'completed',
    priority: 'high',
    assignedTo: { id: 5, firstName: 'Zeynep', lastName: 'Arslan', position: 'UI/UX Designer', department: 'Tasarım' },
    assignedBy: { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz' },
    department: 'Tasarım',
    dueDate: '2024-02-10',
    createdAt: '2024-02-01',
    completedAt: '2024-02-09',
    estimatedHours: 8,
    actualHours: 6,
    tags: ['UI', 'Tasarım']
  },
  {
    id: 2,
    title: 'API entegrasyonu',
    description: 'Backend servisleri ile frontend bağlantısı kurulacak',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 4, firstName: 'Ali', lastName: 'Öztürk', position: 'Backend Developer', department: 'Yazılım' },
    assignedBy: { id: 2, firstName: 'Mehmet', lastName: 'Kaya' },
    department: 'Yazılım',
    dueDate: '2024-02-15',
    createdAt: '2024-02-05',
    completedAt: null,
    estimatedHours: 20,
    actualHours: 12,
    tags: ['Backend', 'API']
  },
  {
    id: 3,
    title: 'Dashboard komponenti',
    description: 'Ana dashboard ekranı için React komponenti geliştirilecek',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: { id: 3, firstName: 'Ayşe', lastName: 'Demir', position: 'Frontend Developer', department: 'Yazılım' },
    assignedBy: { id: 2, firstName: 'Mehmet', lastName: 'Kaya' },
    department: 'Yazılım',
    dueDate: '2024-02-18',
    createdAt: '2024-02-08',
    completedAt: null,
    estimatedHours: 16,
    actualHours: 8,
    tags: ['Frontend', 'React']
  }
];

// Ana Dashboard bileşeni
const Dashboard = () => {
  const { user, company, logout, isBoss, isManager, isEmployee, userRoles } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Ana state'ler - LocalStorage ile senkronize
  const [tasks, setTasks] = useState(() => loadFromStorage('app_tasks', initialTasks));
  const [employees, setEmployees] = useState(() => loadFromStorage('app_employees', initialUsers));
  const [announcementsList, setAnnouncementsList] = useState(() => loadFromStorage('app_announcements', initialAnnouncements));
  
  // Modal state'leri
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [calendarDate, setCalendarDate] = useState(null);
  const [showBulkEmployeeModal, setShowBulkEmployeeModal] = useState(false);

  // LocalStorage'a kaydet
  useEffect(() => {
    saveToStorage('app_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('app_employees', employees);
  }, [employees]);

  useEffect(() => {
    saveToStorage('app_announcements', announcementsList);
  }, [announcementsList]);

  const canManage = isBoss || isManager;

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks', label: canManage ? 'Tüm Görevler' : 'Görevlerim', icon: ClipboardList },
    ...(!canManage ? [{ id: 'pool', label: 'Havuz', icon: Layers }] : []),
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays },
    ...(!isBoss ? [{ id: 'timetracker', label: 'Mesai', icon: Timer }] : []),
    ...(canManage ? [{ id: 'reports', label: 'Raporlar', icon: BarChart3 }] : []),
    ...(canManage ? [{ id: 'employees', label: 'Çalışanlar', icon: Users }] : []),
    { id: 'leaves', label: 'İzinler', icon: Palmtree },
    { id: 'support', label: 'Destek', icon: Headphones },
    ...(canManage ? [{ id: 'crm', label: 'Müşteriler', icon: Contact }] : []),
    { id: 'files', label: 'Dosyalar', icon: FolderOpen },
    { id: 'surveys', label: 'Anketler', icon: Vote },
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

  // CRUD Fonksiyonları
  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      assignedBy: { id: user.id, firstName: user.firstName, lastName: user.lastName },
      completedAt: null,
      actualHours: 0
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const leaveTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: null, taskType: 'group', status: 'pending' } : t));
  };

  const claimTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      assignedTo: { id: user.id, firstName: user.firstName, lastName: user.lastName, position: user.position, department: user.department },
      taskType: 'single'
    } : t));
  };

  const addEmployee = (empData) => {
    const newEmployee = {
      ...empData,
      id: Date.now(),
      companyId: company?.id || 1,
      status: 'active',
      avatar: null
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (empId, updates) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, ...updates } : e));
  };

  const deleteEmployee = (empId) => {
    setEmployees(prev => prev.filter(e => e.id !== empId));
  };

  const addAnnouncement = (annData) => {
    const newAnn = {
      ...annData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: { id: user.id, firstName: user.firstName, lastName: user.lastName }
    };
    setAnnouncementsList(prev => [newAnn, ...prev]);
  };

  const updateAnnouncement = (annId, updates) => {
    setAnnouncementsList(prev => prev.map(a => a.id === annId ? { ...a, ...updates } : a));
  };

  const deleteAnnouncement = (annId) => {
    setAnnouncementsList(prev => prev.filter(a => a.id !== annId));
  };

  // Görev Ekleme Modal
  const openTaskModal = (task = null, date = null) => {
    setEditingTask(task);
    setCalendarDate(date);
    setShowTaskModal(true);
  };

  // Çalışan Ekleme Modal
  const openEmployeeModal = (emp = null) => {
    setEditingEmployee(emp);
    setShowEmployeeModal(true);
  };

  // Duyuru Ekleme Modal
  const openAnnouncementModal = (ann = null) => {
    setEditingAnnouncement(ann);
    setShowAnnouncementModal(true);
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
              <NotificationCenter isDark={isDark} />

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
                    <button 
                      onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tab Navigasyonu - Modern */}
        <div className="mb-6 sm:mb-8 space-y-3">
          <div className="relative group">
            {/* Sol gradient mask */}
            <div className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-l-2xl transition-opacity ${isDark ? 'bg-gradient-to-r from-slate-900/90 to-transparent' : 'bg-gradient-to-r from-slate-50/90 to-transparent'}`} style={{ opacity: 0 }} id="tab-fade-left" />
            {/* Sağ gradient mask */}
            <div className={`absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-r-2xl transition-opacity ${isDark ? 'bg-gradient-to-l from-slate-900/90 to-transparent' : 'bg-gradient-to-l from-slate-50/90 to-transparent'}`} id="tab-fade-right" />
            
            <div
              className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl overflow-x-auto scroll-smooth
                ${isDark 
                  ? 'bg-slate-800/60 border-slate-700/40 shadow-lg shadow-black/20' 
                  : 'bg-white/70 border-slate-200/60 shadow-lg shadow-slate-200/50'}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={(e) => {
                const el = e.currentTarget;
                const fadeL = document.getElementById('tab-fade-left');
                const fadeR = document.getElementById('tab-fade-right');
                if (fadeL) fadeL.style.opacity = el.scrollLeft > 8 ? '1' : '0';
                if (fadeR) fadeR.style.opacity = el.scrollLeft < el.scrollWidth - el.clientWidth - 8 ? '1' : '0';
              }}
            >
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-[1.02]'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                      }`}
                  >
                    <Icon size={17} className={isActive ? 'drop-shadow-sm' : ''} />
                    <span className="hidden md:inline text-[13px]">{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50 md:hidden" />
                    )}
                  </button>
                );
              })}
              {/* CSS to hide scrollbar for webkit */}
              <style>{`.scroll-smooth::-webkit-scrollbar { display: none; }`}</style>
            </div>
          </div>

          {/* Aksiyon butonları - tab altında sağa hizalı */}
          {canManage && (activeTab === 'tasks' || activeTab === 'employees' || activeTab === 'announcements') && (
            <div className="flex justify-end">
              {activeTab === 'tasks' && (
                <button
                  onClick={() => openTaskModal()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600
                           hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl
                           shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus size={17} />
                  <span className="hidden sm:inline">Yeni Görev</span>
                </button>
              )}
              {activeTab === 'employees' && (
                <button
                  onClick={() => openEmployeeModal()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600
                           hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl
                           shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <UserPlus size={17} />
                  <span className="hidden sm:inline">Çalışan Ekle</span>
                </button>
              )}
              {activeTab === 'announcements' && (
                <button
                  onClick={() => openAnnouncementModal()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600
                           hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl
                           shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Megaphone size={17} />
                  <span className="hidden sm:inline">Yeni Duyuru</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* İçerik */}
        {activeTab === 'overview' && <OverviewTab tasks={tasks} employees={employees} canManage={canManage} isDark={isDark} user={user} onAddTask={() => openTaskModal()} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} employees={employees} canManage={canManage} isDark={isDark} onTaskClick={handleTaskClick} onUpdateTask={updateTask} onDeleteTask={deleteTask} onEditTask={openTaskModal} user={user} onLeaveTask={leaveTask} />}
        {activeTab === 'pool' && !canManage && <PoolTab tasks={tasks} user={user} isDark={isDark} onClaimTask={claimTask} onTaskClick={handleTaskClick} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={tasks} isDark={isDark} canManage={canManage} onTaskClick={handleTaskClick} onUpdateTask={updateTask} />}
        {activeTab === 'calendar' && <CalendarView tasks={tasks} isDark={isDark} onTaskClick={handleTaskClick} onAddTask={canManage ? (date) => openTaskModal(null, date) : undefined} />}
        {activeTab === 'timetracker' && <TimeTracker user={user} isDark={isDark} />}
        {activeTab === 'reports' && canManage && <ReportsPage tasks={tasks} users={employees} isDark={isDark} departments={departments} />}
        {activeTab === 'employees' && canManage && <EmployeesTab employees={employees} tasks={tasks} isDark={isDark} onEdit={openEmployeeModal} onDelete={deleteEmployee} onBulkAdd={() => setShowBulkEmployeeModal(true)} />}
        {activeTab === 'leaves' && <LeaveRequestSystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'support' && <SupportSystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'crm' && canManage && <CustomerCRM user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'files' && <FileSharing user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'surveys' && <SurveySystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'announcements' && <AnnouncementsTab announcements={announcementsList} canManage={canManage} isDark={isDark} onEdit={openAnnouncementModal} onDelete={deleteAnnouncement} onUpdate={updateAnnouncement} departments={departments} />}
        {activeTab === 'settings' && <SettingsTab isDark={isDark} isBoss={isBoss} canManage={canManage} />}
      </div>

      {/* Görev Detay Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            updateTask(selectedTask.id, updatedTask);
            setSelectedTask(null);
          }}
          user={user}
          isDark={isDark}
          canManage={canManage}
        />
      )}

      {/* Görev Ekleme/Düzenleme Modal */}
      {showTaskModal && (
        <TaskFormModal 
          task={editingTask}
          employees={employees}
          defaultDate={calendarDate}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); setCalendarDate(null); }}
          onSave={(data) => {
            if (editingTask) {
              updateTask(editingTask.id, data);
            } else {
              addTask(data);
            }
            setShowTaskModal(false);
            setEditingTask(null);
            setCalendarDate(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Toplu Çalışan Ekleme Modal */}
      {showBulkEmployeeModal && (
        <BulkEmployeeModal
          departments={departments}
          onClose={() => setShowBulkEmployeeModal(false)}
          onSave={(empList) => {
            empList.forEach(emp => addEmployee(emp));
            setShowBulkEmployeeModal(false);
          }}
          isDark={isDark}
        />
      )}

      {/* Çalışan Ekleme/Düzenleme Modal */}
      {showEmployeeModal && (
        <EmployeeFormModal 
          employee={editingEmployee}
          onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null); }}
          onSave={(data) => {
            if (editingEmployee) {
              updateEmployee(editingEmployee.id, data);
            } else {
              addEmployee(data);
            }
            setShowEmployeeModal(false);
            setEditingEmployee(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Duyuru Ekleme/Düzenleme Modal */}
      {showAnnouncementModal && (
        <AnnouncementFormModal 
          announcement={editingAnnouncement}
          departments={departments}
          onClose={() => { setShowAnnouncementModal(false); setEditingAnnouncement(null); }}
          onSave={(data) => {
            if (editingAnnouncement) {
              updateAnnouncement(editingAnnouncement.id, data);
            } else {
              addAnnouncement(data);
            }
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
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

// ===== GÖREV FORM MODAL =====
const TaskFormModal = ({ task, employees, defaultDate, onClose, onSave, isDark }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: 'pending',
    department: task?.department || 'Yazılım',
    dueDate: task?.dueDate || defaultDate || '',
    assignedTo: task?.assignedTo ? (Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo]) : [],
    tags: task?.tags || [],
    taskType: task?.taskType || 'single',
    attachments: task?.attachments || []
  });

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [suggestedEmployees, setSuggestedEmployees] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);

  const activeEmployees = employees.filter(e => e.role !== 'boss' && e.status === 'active');

  const filteredEmployees = activeEmployees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.position}`.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  // Açıklamadan anahtar kelime algılama ve çalışan önerme
  const analyzeDescription = (text) => {
    if (!text || text.length < 3) {
      setSuggestedEmployees([]);
      setMatchedKeywords([]);
      return;
    }

    const lowerText = text.toLowerCase();
    const allSkillKeywords = {};

    // Tüm SKILL_CATEGORIES'den keyword haritası oluştur
    Object.entries(SKILL_CATEGORIES).forEach(([category, skills]) => {
      skills.forEach(skill => {
        allSkillKeywords[skill.toLowerCase()] = { name: skill, category };
      });
    });

    // Ek anahtar kelimeler (açıklamada geçebilecek eş anlamlılar)
    const aliasMap = {
      'frontend': ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
      'backend': ['Node.js', 'Python', 'Java', 'C#', '.NET', 'PHP', 'Go', 'Express.js', 'Django'],
      'veritabanı': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'SQLite'],
      'database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'SQLite'],
      'tasarım': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX'],
      'design': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX'],
      'mobil': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS'],
      'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS'],
      'uygulama': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      'devops': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD', 'Linux'],
      'sunucu': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Linux', 'Node.js'],
      'server': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Linux', 'Node.js'],
      'api': ['Node.js', 'Python', 'Express.js', 'Django', 'FastAPI'],
      'web': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'JavaScript'],
      'arayüz': ['React', 'Vue.js', 'Figma', 'UI/UX', 'HTML', 'CSS'],
      'logo': ['Photoshop', 'Illustrator', 'Figma'],
      'grafik': ['Photoshop', 'Illustrator', 'Figma', 'After Effects'],
      'animasyon': ['After Effects', 'CSS'],
      'çeviri': ['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca'],
      'tercüme': ['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca'],
      'ingilizce': ['İngilizce'],
      'almanca': ['Almanca'],
      'fransızca': ['Fransızca'],
      'ispanyolca': ['İspanyolca'],
      'yönetim': ['Proje Yönetimi', 'Agile', 'Scrum', 'Liderlik'],
      'proje': ['Proje Yönetimi', 'Agile', 'Scrum', 'JIRA'],
      'toplantı': ['Proje Yönetimi', 'Liderlik', 'Sunum', 'İletişim'],
      'sunum': ['Sunum', 'İletişim', 'Liderlik'],
    };

    const detectedSkills = new Set();
    const keywords = [];

    // Direkt skill isimlerini ara
    Object.entries(allSkillKeywords).forEach(([keyword, info]) => {
      // Kısa keyword'ler için tam kelime eşleşmesi, uzunlar için kısmi
      const pattern = keyword.length <= 3
        ? new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        : new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (pattern.test(lowerText)) {
        detectedSkills.add(info.name);
        keywords.push(info.name);
      }
    });

    // Alias'ları ara
    Object.entries(aliasMap).forEach(([alias, relatedSkills]) => {
      if (lowerText.includes(alias)) {
        relatedSkills.forEach(s => detectedSkills.add(s));
        if (!keywords.includes(alias)) keywords.push(alias);
      }
    });

    if (detectedSkills.size === 0) {
      setSuggestedEmployees([]);
      setMatchedKeywords([]);
      return;
    }

    setMatchedKeywords([...new Set(keywords)]);

    // Çalışanları puanla
    const scored = activeEmployees.map(emp => {
      const empSkills = emp.skills || [];
      let score = 0;
      const matched = [];

      empSkills.forEach(skill => {
        if (detectedSkills.has(skill.name)) {
          const levelScore = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          score += (levelScore[skill.level] || 1);
          matched.push(skill);
        }
      });

      return { ...emp, score, matchedSkills: matched };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

    setSuggestedEmployees(scored.slice(0, 5));
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, description: val }));
    analyzeDescription(val);
  };

  const toggleAssignee = (emp) => {
    const empData = { id: emp.id, firstName: emp.firstName, lastName: emp.lastName, position: emp.position, department: emp.department };
    setForm(prev => {
      const exists = prev.assignedTo.some(a => a.id === emp.id);
      return {
        ...prev,
        assignedTo: exists
          ? prev.assignedTo.filter(a => a.id !== emp.id)
          : [...prev.assignedTo, empData]
      };
    });
  };

  const removeAssignee = (empId) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(a => a.id !== empId)
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const newAttachments = files
      .filter(f => f.size <= maxSize)
      .map(f => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        type: f.type,
        file: f
      }));
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  };

  const removeAttachment = (attachId) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attachId) }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {task ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">

            {/* Görev Tipi - Tekil / Çoğul */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Görev Tipi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, taskType: 'single' }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    form.taskType === 'single'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={18} className={form.taskType === 'single' ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`font-semibold text-sm ${form.taskType === 'single' ? 'text-indigo-600' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Tekil Görev
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sadece atanan kişiler görür
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, taskType: 'group' }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    form.taskType === 'group'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                      : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={18} className={form.taskType === 'group' ? 'text-purple-500' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`font-semibold text-sm ${form.taskType === 'group' ? 'text-purple-600' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Çoğul Görev
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Herkes görür, katılabilir
                  </p>
                </button>
              </div>
            </div>

            {/* Başlık */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Görev Başlığı *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Görev başlığını girin..."
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Açıklama
              </label>
              <textarea
                value={form.description}
                onChange={handleDescriptionChange}
                placeholder="Görev açıklaması yazın... (örn: React ile frontend geliştirme, Figma tasarım, Node.js API)"
                rows={3}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
              />

              {/* Akıllı Öneri Paneli */}
              {suggestedEmployees.length > 0 && (
                <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      Önerilen Çalışanlar
                    </span>
                    <span className={`text-xs ${isDark ? 'text-amber-400/60' : 'text-amber-500/70'}`}>
                      — yeteneklerine göre
                    </span>
                  </div>

                  {/* Algılanan anahtar kelimeler */}
                  {matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {matchedKeywords.map(kw => (
                        <span key={kw} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Zap size={10} />
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Önerilen çalışanlar */}
                  <div className="space-y-2">
                    {suggestedEmployees.map(emp => {
                      const isAlreadyAssigned = form.assignedTo.some(a => a.id === emp.id);
                      return (
                        <div
                          key={emp.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                            isAlreadyAssigned
                              ? isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
                              : isDark ? 'hover:bg-slate-700/50 border border-transparent' : 'hover:bg-white border border-transparent'
                          }`}
                          onClick={() => !isAlreadyAssigned && toggleAssignee(emp)}
                        >
                          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {emp.position}
                              </span>
                              {isAlreadyAssigned && (
                                <span className="text-xs text-emerald-500 font-medium">✓ Atandı</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {emp.matchedSkills.map(skill => {
                                const catColors = SKILL_CATEGORY_COLORS[skill.category] || SKILL_CATEGORY_COLORS['Frontend'];
                                const levelInfo = SKILL_LEVELS.find(l => l.value === skill.level);
                                return (
                                  <span
                                    key={skill.name}
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${catColors.bg} ${catColors.text}`}
                                  >
                                    {skill.name}
                                    <span className="opacity-60 text-[10px]">{levelInfo?.icon}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={14} className="text-amber-400" />
                            <span className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{emp.score}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Belge Ekleme */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Belge Ekle
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  isDark ? 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
                onClick={() => document.getElementById('task-file-input').click()}
              >
                <FileText size={24} className={`mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Dosya yüklemek için tıklayın veya sürükleyin
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  Maks. 10MB
                </p>
                <input
                  id="task-file-input"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Yüklenen dosyalar */}
              {form.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.attachments.map(att => (
                    <div key={att.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-indigo-500 flex-shrink-0" />
                        <span className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{att.name}</span>
                        <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({formatFileSize(att.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2 Kolon - Öncelik & Departman */}
            <div className="grid grid-cols-2 gap-4">
              {/* Öncelik */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Öncelik
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>

              {/* Teslim Tarihi */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Teslim Tarihi
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Departman */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Departman
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Çalışan Ata - Multi Select */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Görevi Ata
              </label>

              {/* Seçilen kişiler */}
              {form.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.assignedTo.map(person => (
                    <span
                      key={person.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                        isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {person.firstName} {person.lastName}
                      <button
                        type="button"
                        onClick={() => removeAssignee(person.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown tetikleyici */}
              <div
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {form.assignedTo.length === 0 ? 'Çalışan seçin...' : `${form.assignedTo.length} kişi seçildi`}
                </span>
                <ChevronDown size={18} className={`transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown listesi */}
              {showAssigneeDropdown && (
                <div className={`absolute z-10 w-full mt-1 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl shadow-xl overflow-hidden`}>
                  {/* Arama */}
                  <div className={`p-2 border-b ${isDark ? 'border-slate-600' : 'border-slate-100'}`}>
                    <div className="relative">
                      <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        placeholder="İsim ara..."
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg ${isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-800 placeholder-slate-400'} border-none focus:ring-1 focus:ring-indigo-500`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className={`p-3 text-sm text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Çalışan bulunamadı</div>
                    ) : (
                      filteredEmployees.map(emp => {
                        const isSelected = form.assignedTo.some(a => a.id === emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => toggleAssignee(emp)}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                              isSelected
                                ? isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
                                : isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500'
                                : isDark ? 'border-slate-500' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {emp.position} • {emp.department}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </form>

        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                     hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            {task ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== ÇALIŞAN FORM MODAL =====
// Yetenek kategorileri ve önceden tanımlı yetenekler
const SKILL_CATEGORIES = {
  'Frontend': ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Svelte', 'jQuery'],
  'Backend': ['Node.js', 'Python', 'Java', 'C#', '.NET', 'PHP', 'Go', 'Ruby', 'Django', 'Express.js', 'Spring Boot', 'FastAPI'],
  'Veritabanı': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'SQLite', 'Oracle', 'SQL Server'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Linux', 'Git', 'Jenkins', 'Terraform'],
  'Tasarım': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Sketch', 'InVision', 'After Effects'],
  'Mobil': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS', 'Xamarin'],
  'Dil': ['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'Arapça', 'Rusça', 'Çince', 'Japonca', 'Korece', 'İtalyanca', 'Portekizce'],
  'Yönetim': ['Proje Yönetimi', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Liderlik', 'İletişim', 'Sunum']
};

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Başlangıç', color: 'slate', icon: '●' },
  { value: 'intermediate', label: 'Orta', color: 'blue', icon: '●●' },
  { value: 'advanced', label: 'İleri', color: 'purple', icon: '●●●' },
  { value: 'expert', label: 'Uzman', color: 'amber', icon: '●●●●' }
];

const SKILL_CATEGORY_COLORS = {
  'Frontend': { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  'Backend': { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  'Veritabanı': { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  'DevOps': { bg: 'bg-cyan-100 dark:bg-cyan-500/15', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  'Tasarım': { bg: 'bg-pink-100 dark:bg-pink-500/15', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
  'Mobil': { bg: 'bg-violet-100 dark:bg-violet-500/15', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  'Dil': { bg: 'bg-teal-100 dark:bg-teal-500/15', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  'Yönetim': { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' }
};

const EmployeeFormModal = ({ employee, onClose, onSave, isDark }) => {
  const [form, setForm] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || 'employee',
    roles: employee?.roles || (employee?.role ? [employee.role] : ['employee']),
    department: employee?.department || 'Yazılım',
    position: employee?.position || '',
    status: employee?.status || 'active',
    skills: employee?.skills || []
  });

  const [skillCategory, setSkillCategory] = useState('Frontend');
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');

  const availableSkills = (SKILL_CATEGORIES[skillCategory] || []).filter(
    s => !form.skills.some(fs => fs.name === s) && s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const addSkill = (skillName) => {
    if (form.skills.some(s => s.name === skillName)) return;
    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, { name: skillName, category: skillCategory, level: selectedLevel }]
    }));
    setSkillSearch('');
  };

  const addCustomSkill = () => {
    const name = customSkill.trim();
    if (!name || form.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, { name, category: skillCategory, level: selectedLevel }]
    }));
    setCustomSkill('');
  };

  const removeSkill = (skillName) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s.name !== skillName) }));
  };

  const updateSkillLevel = (skillName, newLevel) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.name === skillName ? { ...s, level: newLevel } : s)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    onSave(form);
  };

  const getLevelInfo = (level) => SKILL_LEVELS.find(l => l.value === level) || SKILL_LEVELS[1];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {employee ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
            {/* Ad Soyad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ad *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ad"
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Soyad *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Soyad"
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  required
                />
              </div>
            </div>

            {/* E-posta ve Telefon */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  E-posta *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ornek@sirket.com"
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Telefon
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+90 5XX XXX XXXX"
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Rol ve Departman */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Roller
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'manager', label: 'Yönetici', icon: '👔' },
                    { value: 'employee', label: 'Çalışan', icon: '👤' },
                  ].map(roleOpt => {
                    const isChecked = form.roles.includes(roleOpt.value);
                    return (
                      <label key={roleOpt.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                          isChecked
                            ? (isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-400 bg-indigo-50')
                            : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')
                        }`}>
                        <input type="checkbox" checked={isChecked}
                          onChange={() => {
                            setForm(prev => {
                              let newRoles;
                              if (isChecked) {
                                newRoles = prev.roles.filter(r => r !== roleOpt.value);
                                if (newRoles.length === 0) newRoles = ['employee'];
                              } else {
                                newRoles = [...prev.roles, roleOpt.value];
                              }
                              return { ...prev, roles: newRoles, role: newRoles[0] };
                            });
                          }}
                          className="w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-sm">{roleOpt.icon}</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{roleOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Departman
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pozisyon ve Durum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Pozisyon
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Frontend Developer"
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Durum
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="active">Aktif</option>
                  <option value="on_leave">İzinli</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>

            {/* ===== YETENEK YÖNETİMİ ===== */}
            <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} pt-5`}>
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-amber-500" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yetenekler & Diller</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {form.skills.length} yetenek
                </span>
              </div>

              {/* Mevcut yetenekler */}
              {form.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map(skill => {
                      const catColors = SKILL_CATEGORY_COLORS[skill.category] || SKILL_CATEGORY_COLORS['Frontend'];
                      const levelInfo = getLevelInfo(skill.level);
                      return (
                        <div
                          key={skill.name}
                          className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm ${catColors.bg} ${catColors.text} transition-all`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${catColors.dot}`} />
                          <span className="font-medium">{skill.name}</span>
                          <select
                            value={skill.level}
                            onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                            className="bg-transparent text-xs border-none outline-none cursor-pointer opacity-70 hover:opacity-100"
                          >
                            {SKILL_LEVELS.map(l => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.name)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kategori ve seviye seçici */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kategori</label>
                  <select
                    value={skillCategory}
                    onChange={(e) => { setSkillCategory(e.target.value); setSkillSearch(''); }}
                    className={`w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  >
                    {Object.keys(SKILL_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat === 'Dil' ? '🌐 ' + cat : cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Seviye</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className={`w-full text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  >
                    {SKILL_LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.icon} {l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Yetenek arama / ekleme */}
              <div className="relative mb-3">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder={`${skillCategory} yeteneklerinde ara...`}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                />
              </div>

              {/* Hazır yetenekler listesi */}
              <div className="flex flex-wrap gap-2 mb-3">
                {availableSkills.slice(0, 12).map(skillName => (
                  <button
                    key={skillName}
                    type="button"
                    onClick={() => addSkill(skillName)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border transition-all hover:scale-105 ${
                      isDark
                        ? 'border-slate-600 text-slate-300 hover:border-amber-500 hover:text-amber-300 hover:bg-amber-500/10'
                        : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Plus size={14} />
                    {skillName}
                  </button>
                ))}
                {availableSkills.length === 0 && !skillSearch && (
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bu kategorideki tüm yetenekler eklendi</p>
                )}
              </div>

              {/* Özel yetenek ekleme */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  placeholder="Özel yetenek ekle..."
                  className={`flex-1 text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  disabled={!customSkill.trim()}
                  className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                     hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            {employee ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== DUYURU FORM MODAL =====
const AnnouncementFormModal = ({ announcement, onClose, onSave, isDark, departments: deptList }) => {
  const [form, setForm] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'normal',
    isPinned: announcement?.isPinned || false,
    targetDepartment: announcement?.targetDepartment || 'all',
    soundNotification: announcement?.soundNotification !== undefined ? announcement.soundNotification : true,
    eventDate: announcement?.eventDate || '',
    attachments: announcement?.attachments || []
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024;
    const newAttachments = files
      .filter(f => f.size <= maxSize)
      .map(f => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        type: f.type
      }));
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  };

  const removeAttachment = (id) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {announcement ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
            {/* Başlık */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Başlık *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Duyuru başlığı..."
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                required
              />
            </div>

            {/* İçerik */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                İçerik *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Duyuru içeriği..."
                rows={4}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
                required
              />
            </div>

            {/* Hedef Departman + Öncelik */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Hedef Departman
                </label>
                <select
                  value={form.targetDepartment}
                  onChange={(e) => setForm(prev => ({ ...prev, targetDepartment: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="all">Tüm Departmanlar</option>
                  {(deptList || []).map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Öncelik
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Önemli</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>
            </div>

            {/* Etkinlik / Toplantı Tarihi */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <CalendarClock size={14} className="inline mr-1" />
                Etkinlik / Toplantı Tarihi (Opsiyonel)
              </label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm(prev => ({ ...prev, eventDate: e.target.value }))}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
            </div>

            {/* Dosya Ekle */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Dosya Ekle
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  isDark ? 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
                onClick={() => document.getElementById('ann-file-input').click()}
              >
                <Upload size={24} className={`mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dosya seçmek için tıklayın</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Maks. 10MB</p>
                <input id="ann-file-input" type="file" multiple className="hidden" onChange={handleFileChange} />
              </div>
              {form.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.attachments.map(att => (
                    <div key={att.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className="flex items-center gap-2">
                        <Paperclip size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{att.name}</span>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatFileSize(att.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(att.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sabitle + Ses Bildirimi */}
            <div className="flex items-center gap-6">
              <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) => setForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 text-indigo-500 focus:ring-indigo-500"
                />
                <Pin size={16} />
                <span className="text-sm font-medium">Sabitle</span>
              </label>

              <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={form.soundNotification}
                  onChange={(e) => setForm(prev => ({ ...prev, soundNotification: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 text-indigo-500 focus:ring-indigo-500"
                />
                {form.soundNotification ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-sm font-medium">Ses Bildirimi</span>
              </label>
            </div>
          </div>
        </form>

        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                     hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            {announcement ? 'Güncelle' : 'Yayınla'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== GENEL BAKIŞ TAB =====

// ===== TOPLU ÇALIŞAN EKLEME MODAL =====
const BulkEmployeeModal = ({ departments, onClose, onSave, isDark }) => {
  const [rows, setRows] = useState([
    { firstName: '', lastName: '', email: '', phone: '', department: departments[0]?.name || '', position: '' }
  ]);

  const addRow = () => {
    setRows(prev => [...prev, { firstName: '', lastName: '', email: '', phone: '', department: departments[0]?.name || '', position: '' }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.firstName.trim() && r.lastName.trim() && r.email.trim());
    if (validRows.length === 0) return;
    const empList = validRows.map(r => ({
      ...r,
      id: Date.now() + Math.random(),
      role: 'employee',
      status: 'active',
      password: '123456'
    }));
    onSave(empList);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Toplu Çalışan Ekle</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Birden fazla çalışan aynı anda ekleyin</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Çalışan #{index + 1}</span>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(index)} className="ml-auto p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                      <X size={16} className="text-red-500" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Ad *"
                    value={row.firstName}
                    onChange={(e) => updateRow(index, 'firstName', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Soyad *"
                    value={row.lastName}
                    onChange={(e) => updateRow(index, 'lastName', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    required
                  />
                  <input
                    type="email"
                    placeholder="E-posta *"
                    value={row.email}
                    onChange={(e) => updateRow(index, 'email', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={row.phone}
                    onChange={(e) => updateRow(index, 'phone', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                  <select
                    value={row.department}
                    onChange={(e) => updateRow(index, 'department', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Pozisyon"
                    value={row.position}
                    onChange={(e) => updateRow(index, 'position', e.target.value)}
                    className={`${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className={`mt-4 w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2
                      ${isDark ? 'border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'}`}
          >
            <Plus size={16} />
            Yeni Satır Ekle
          </button>
        </form>

        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {rows.filter(r => r.firstName.trim() && r.lastName.trim()).length} çalışan eklenecek
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={`px-6 py-2.5 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}>
              İptal
            </button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              Tümünü Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== GENEL BAKIŞ TAB =====
const OverviewTab = ({ tasks, employees, canManage, isDark, user, onAddTask }) => {
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id);
  const displayTasks = canManage ? tasks : myTasks;

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

  const recentTasks = displayTasks.slice(0, 5);

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
              ? `Bugün şirketinizde ${tasks.filter(t => t.status !== 'completed').length} aktif görev var.`
              : `Bugün ${myTasks.filter(t => t.status !== 'completed').length} tamamlanmamış göreviniz var.`
            }
          </p>
          {canManage && (
            <button 
              onClick={onAddTask}
              className="mt-4 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Hızlı Görev Ekle
            </button>
          )}
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
            {tasks.length === 0 && canManage && (
              <button onClick={onAddTask} className="text-sm text-indigo-500 font-medium hover:text-indigo-600 flex items-center gap-1">
                <Plus size={14} />
                Ekle
              </button>
            )}
          </div>
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {recentTasks.length > 0 ? recentTasks.map(task => (
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
            )) : (
              <div className="p-8 text-center">
                <ClipboardList size={32} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz görev yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Yaklaşan Teslimler */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} overflow-hidden`}>
          <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yaklaşan Teslimler</h3>
            <Calendar size={18} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {displayTasks.filter(t => t.dueDate && t.status !== 'completed').slice(0, 4).length > 0 ? 
              displayTasks.filter(t => t.dueDate && t.status !== 'completed').slice(0, 4).map(task => (
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
            )) : (
              <div className="p-8 text-center">
                <Calendar size={32} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Yaklaşan teslim yok</p>
              </div>
            )}
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
              const deptEmployees = employees.filter(e => e.department === dept.name);
              return (
                <div key={dept.id} className={`${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dept.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{deptTasks.length}</span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{deptEmployees.length} çalışan</span>
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

// ===== GÖREVLER TAB =====
const TasksTab = ({ tasks, employees, canManage, isDark, onTaskClick, onUpdateTask, onDeleteTask, onEditTask, user, onLeaveTask }) => {
  const [filter, setFilter] = useState('all');
  const [showMenu, setShowMenu] = useState(null);

  const displayTasks = canManage 
    ? tasks 
    : tasks.filter(t => t.assignedTo?.id === user?.id);

  const filteredTasks = filter === 'all' 
    ? displayTasks 
    : displayTasks.filter(t => t.status === filter);

  const handleStatusChange = (taskId, newStatus) => {
    onUpdateTask(taskId, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    });
    setShowMenu(null);
  };

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
            className={`${isDark ? 'bg-slate-800 border-slate-700/60 hover:bg-slate-700/50' : 'bg-white border-slate-200/60 hover:shadow-lg'} rounded-2xl border p-5 transition-all`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 cursor-pointer" onClick={() => onTaskClick && onTaskClick(task)}>
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
                
                {!canManage && task.status !== 'completed' && (
                  <button 
                    onClick={() => onLeaveTask && onLeaveTask(task.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                              ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <LogOut size={14} />
                    Görevden Ayrıl
                  </button>
                )}

                {canManage && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(showMenu === task.id ? null : task.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <MoreVertical size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                    
                    {showMenu === task.id && (
                      <div className={`absolute right-0 top-full mt-1 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl shadow-xl py-1 z-10 min-w-[160px]`}>
                        <button
                          onClick={() => { onEditTask(task); setShowMenu(null); }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Edit size={14} />
                          Düzenle
                        </button>
                        <div className={`border-t ${isDark ? 'border-slate-600' : 'border-slate-100'} my-1`} />
                        <button
                          onClick={() => handleStatusChange(task.id, 'pending')}
                          className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          Bekliyor
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          Devam Ediyor
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          Tamamlandı
                        </button>
                        <div className={`border-t ${isDark ? 'border-slate-600' : 'border-slate-100'} my-1`} />
                        <button
                          onClick={() => { onDeleteTask(task.id); setShowMenu(null); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
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
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {canManage ? 'Yeni bir görev oluşturmak için "Yeni Görev" butonuna tıklayın.' : 'Bu filtreye uygun görev bulunmuyor.'}
          </p>
        </div>
      )}
    </div>
  );
};

// ===== HAVUZ TAB =====
const PoolTab = ({ tasks, user, isDark, onClaimTask, onTaskClick }) => {
  const poolTasks = tasks.filter(t => 
    t.taskType === 'group' && 
    (!t.assignedTo || (Array.isArray(t.assignedTo) && t.assignedTo.length === 0))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Havuzu</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Açık olan çoğul görevleri buradan üstlenebilirsiniz
        </p>
      </div>

      <div className="grid gap-4">
        {poolTasks.map(task => (
          <div 
            key={task.id} 
            className={`${isDark ? 'bg-slate-800 border-slate-700/60 hover:bg-slate-700/50' : 'bg-white border-slate-200/60 hover:shadow-lg'} rounded-2xl border p-5 transition-all`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 cursor-pointer" onClick={() => onTaskClick?.(task)}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h3>
                  <PriorityBadge priority={task.priority} />
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Çoğul</span>
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Calendar size={14} />
                      {task.dueDate}
                    </div>
                  )}
                  {task.department && (
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{task.department}</span>
                  )}
                  {task.assignedBy && (
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Oluşturan: {task.assignedBy.firstName} {task.assignedBy.lastName}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onClaimTask(task.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 
                         text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm"
              >
                <UserPlus size={16} />
                Üstlen
              </button>
            </div>
          </div>
        ))}
      </div>

      {poolTasks.length === 0 && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Layers size={28} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Havuz Boş</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Şu an üstlenebileceğiniz görev bulunmuyor.
          </p>
        </div>
      )}
    </div>
  );
};

// ===== ÇALIŞANLAR TAB =====
const EmployeesTab = ({ employees, tasks, isDark, onEdit, onDelete, onBulkAdd }) => {
  const displayEmployees = employees.filter(u => u.role !== 'boss');

  return (
    <div className="space-y-6">
      {/* Toplu Ekle Butonu */}
      <div className="flex justify-end">
        <button
          onClick={onBulkAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
        >
          <FolderPlus size={18} />
          Toplu Çalışan Ekle
        </button>
      </div>
      {displayEmployees.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayEmployees.map(emp => {
            const empTasks = tasks.filter(t => t.assignedTo?.id === emp.id);
            const completedTasks = empTasks.filter(t => t.status === 'completed').length;
            
            return (
              <div key={emp.id} className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-5 transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.firstName} {emp.lastName}</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.position || 'Pozisyon belirtilmedi'}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                        ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                                          emp.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 
                                          'bg-slate-100 text-slate-600'}`}>
                          {emp.status === 'active' ? 'Aktif' : emp.status === 'on_leave' ? 'İzinli' : 'Pasif'}
                        </span>
                        {(emp.roles || [emp.role]).filter(Boolean).map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {r === 'manager' ? 'Yönetici' : r === 'boss' ? 'Patron' : 'Çalışan'}
                          </span>
                        ))}
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emp.department}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEdit(emp)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <Edit size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                    <button 
                      onClick={() => onDelete(emp.id)}
                      className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors`}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Mail size={14} />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                  {emp.phone && (
                    <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Phone size={14} />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                {/* Yetenekler */}
                {emp.skills && emp.skills.length > 0 && (
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Award size={14} className="text-amber-500" />
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yetenekler</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {emp.skills.slice(0, 6).map(skill => {
                        const catColors = SKILL_CATEGORY_COLORS[skill.category] || SKILL_CATEGORY_COLORS['Frontend'];
                        return (
                          <span
                            key={skill.name}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${catColors.bg} ${catColors.text}`}
                            title={`${skill.name} - ${SKILL_LEVELS.find(l => l.value === skill.level)?.label || skill.level}`}
                          >
                            <div className={`w-1 h-1 rounded-full ${catColors.dot}`} />
                            {skill.name}
                          </span>
                        );
                      })}
                      {emp.skills.length > 6 && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          +{emp.skills.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
      ) : (
        <div className="text-center py-12">
          <div className={`w-16 h-16 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Users size={28} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Çalışan Bulunamadı</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Yeni çalışan eklemek için "Çalışan Ekle" butonuna tıklayın.
          </p>
        </div>
      )}
    </div>
  );
};

// ===== DUYURULAR TAB =====
const AnnouncementsTab = ({ announcements, canManage, isDark, onEdit, onDelete, onUpdate }) => {
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-4">
      {sortedAnnouncements.length > 0 ? sortedAnnouncements.map(ann => (
        <div key={ann.id} className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border overflow-hidden
                                    ${ann.isPinned ? 'border-amber-500/50' : (isDark ? 'border-slate-700/60' : 'border-slate-200/60')}`}>
          {ann.isPinned && (
            <div className={`${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} px-4 py-2 border-b ${isDark ? 'border-amber-800' : 'border-amber-100'} flex items-center gap-2`}>
              <Pin size={14} className="text-amber-600" />
              <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Sabitlenmiş Duyuru</span>
            </div>
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{ann.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ann.content}</p>
              </div>
              <div className="flex items-center gap-2">
                {ann.priority === 'urgent' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">Acil</span>
                )}
                {ann.priority === 'important' && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">Önemli</span>
                )}
                {canManage && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onUpdate(ann.id, { isPinned: !ann.isPinned })}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <Pin size={16} className={ann.isPinned ? 'text-amber-500' : (isDark ? 'text-slate-400' : 'text-slate-500')} />
                    </button>
                    <button 
                      onClick={() => onEdit(ann)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <Edit size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                    <button 
                      onClick={() => onDelete(ann.id)}
                      className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors`}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs">
                {ann.createdBy?.firstName?.[0]}{ann.createdBy?.lastName?.[0]}
              </div>
              <span>{ann.createdBy?.firstName} {ann.createdBy?.lastName}</span>
              <span>•</span>
              <span>{ann.createdAt}</span>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-12">
          <div className={`w-16 h-16 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Megaphone size={28} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </div>
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Duyuru Bulunamadı</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {canManage ? 'Yeni duyuru eklemek için "Yeni Duyuru" butonuna tıklayın.' : 'Henüz duyuru yayınlanmamış.'}
          </p>
        </div>
      )}
    </div>
  );
};

// ===== AYARLAR TAB =====
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#78716c', '#0f172a'
];

const ColorPicker = ({ value, onChange, isDark }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`w-11 h-11 rounded-xl border-2 transition-all hover:scale-105 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
        style={{ backgroundColor: value }}
        title="Renk seçin"
      />
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className={`absolute right-0 top-full mt-2 z-50 p-4 rounded-2xl shadow-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} style={{ width: '240px' }}>
            <p className={`text-xs font-semibold mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hazır Renkler</p>
            <div className="grid grid-cols-10 gap-1.5 mb-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { onChange(color); setCustomColor(color); }}
                  className={`w-5 h-5 rounded-md transition-all hover:scale-125 ${value === color ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Özel Renk</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); onChange(e.target.value); }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomColor(v);
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
                  }}
                  className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  maxLength={7}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full mt-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Tamam
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SettingsTab = ({ isDark, isBoss, canManage }) => {
  const { user, company, updateCompany, checkCompanyCodeAvailability } = useAuth();

  // Mevcut kodu parçalara ayır
  const parseExistingCode = (code) => {
    if (!code || code.length < 8) return { prefix: '', year: '', suffix: '' };
    return {
      prefix: code.slice(0, 3),
      year: code.slice(3, 7),
      suffix: code.slice(7)
    };
  };

  // Şirket adından kısaltma üret (ilk 3 büyük harf)
  const generatePrefix = (name) => {
    if (!name) return '';
    const letters = name.toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').replace(/[ÇĞİÖŞÜ]/g, c => ({ 'Ç':'C','Ğ':'G','İ':'I','Ö':'O','Ş':'S','Ü':'U' })[c] || '');
    return letters.slice(0, 3);
  };

  const existingParts = parseExistingCode(company?.companyCode || '');

  // Company editing
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [codePrefix, setCodePrefix] = useState(existingParts.prefix || generatePrefix(company?.name || ''));
  const [codeYear, setCodeYear] = useState(existingParts.year || new Date().getFullYear().toString());
  const [codeSuffix, setCodeSuffix] = useState(existingParts.suffix || '');
  const [companyDesc, setCompanyDesc] = useState(company?.description || '');
  const [companyIndustry, setCompanyIndustry] = useState(company?.industry || '');
  const [companyPhone, setCompanyPhone] = useState(company?.phone || '');
  const [companyAddress, setCompanyAddress] = useState(company?.address || '');
  const [codeError, setCodeError] = useState('');
  const [companySaved, setCompanySaved] = useState(false);
  const [codeAvailability, setCodeAvailability] = useState(null); // null | 'checking' | 'available' | 'taken'

  // Birleşik kod
  const companyCode = `${codePrefix}${codeYear}${codeSuffix}`;

  // Şirket adı değişince prefix otomatik güncelle
  const handleCompanyNameChange = (val) => {
    setCompanyName(val);
    setCodePrefix(generatePrefix(val));
    setCompanySaved(false);
  };

  // Company code part validation
  const validateCompanyCode = () => {
    if (codePrefix.length < 2) return 'Şirket kısaltması en az 2 harf olmalıdır';
    if (codePrefix.length > 4) return 'Şirket kısaltması en fazla 4 harf olabilir';
    if (!/^[A-Z]+$/.test(codePrefix)) return 'Kısaltma sadece harf (A-Z) içermelidir';
    if (!/^\d{4}$/.test(codeYear)) return 'Yıl 4 haneli olmalıdır';
    if (!codeSuffix) return 'Özel kod boş bırakılamaz';
    if (codeSuffix.length > 4) return 'Özel kod en fazla 4 karakter olabilir';
    if (!/^[A-Z0-9]+$/.test(codeSuffix)) return 'Özel kod sadece harf ve rakam içermelidir';
    return '';
  };

  // Debounced availability check
  useEffect(() => {
    const err = validateCompanyCode();
    setCodeError(err);
    if (err) {
      setCodeAvailability(null);
      return;
    }
    const fullCode = `${codePrefix}${codeYear}${codeSuffix}`;
    if (fullCode === company?.companyCode) {
      setCodeAvailability(null);
      return;
    }
    setCodeAvailability('checking');
    const timer = setTimeout(() => {
      const result = checkCompanyCodeAvailability(fullCode);
      setCodeAvailability(result.available ? 'available' : 'taken');
    }, 500);
    return () => clearTimeout(timer);
  }, [codePrefix, codeYear, codeSuffix]);

  const saveCompanyInfo = () => {
    const err = validateCompanyCode();
    if (err) { setCodeError(err); return; }
    if (codeAvailability === 'taken') return;
    updateCompany({
      name: companyName.trim(),
      companyCode,
      description: companyDesc.trim(),
      industry: companyIndustry.trim(),
      phone: companyPhone.trim(),
      address: companyAddress.trim()
    });
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2500);
  };

  // Department Management
  const [deptList, setDeptList] = useState(() => loadFromStorage('sam_departments', departments));
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#6366f1');
  const [editingDept, setEditingDept] = useState(null);

  // Priority Management
  const defaultPriorities = [
    { id: 'low', label: 'Düşük', color: '#94a3b8' },
    { id: 'medium', label: 'Orta', color: '#3b82f6' },
    { id: 'high', label: 'Yüksek', color: '#f59e0b' },
    { id: 'urgent', label: 'Acil', color: '#ef4444' },
  ];
  const [priorityList, setPriorityList] = useState(() => loadFromStorage('sam_priorities', defaultPriorities));
  const [newPriorityLabel, setNewPriorityLabel] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#6366f1');
  const [editingPriority, setEditingPriority] = useState(null);

  // Save to localStorage on changes
  useEffect(() => { saveToStorage('sam_departments', deptList); }, [deptList]);
  useEffect(() => { saveToStorage('sam_priorities', priorityList); }, [priorityList]);

  const addDepartment = () => {
    if (!newDeptName.trim()) return;
    setDeptList(prev => [...prev, { id: Date.now(), name: newDeptName.trim(), color: newDeptColor, employeeCount: 0 }]);
    setNewDeptName('');
    setNewDeptColor('#6366f1');
  };

  const removeDepartment = (id) => {
    setDeptList(prev => prev.filter(d => d.id !== id));
  };

  const updateDepartment = (id, updates) => {
    setDeptList(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setEditingDept(null);
  };

  const addPriority = () => {
    if (!newPriorityLabel.trim()) return;
    const id = newPriorityLabel.trim().toLowerCase().replace(/\s+/g, '_');
    setPriorityList(prev => [...prev, { id, label: newPriorityLabel.trim(), color: newPriorityColor }]);
    setNewPriorityLabel('');
    setNewPriorityColor('#6366f1');
  };

  const removePriority = (id) => {
    setPriorityList(prev => prev.filter(p => p.id !== id));
  };

  const updatePriority = (id, updates) => {
    setPriorityList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingPriority(null);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profil Bilgileri */}
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

      {/* Şirket Bilgileri - Sadece Boss */}
      {isBoss && (
      <div className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Şirket Bilgileri</h3>
          {companySaved && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={14} /> Kaydedildi
            </span>
          )}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket Adı</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-2.5`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sektör</label>
              <input
                type="text"
                value={companyIndustry}
                onChange={(e) => { setCompanyIndustry(e.target.value); setCompanySaved(false); }}
                placeholder="Teknoloji, Finans, Sağlık..."
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5`}
              />
            </div>
          </div>

          {/* Şirket Kodu */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Şirket Kodu Oluşturucu</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Kısaltma */}
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Şirket Kısaltması</label>
                <input
                  type="text"
                  value={codePrefix}
                  onChange={(e) => { setCodePrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)); setCompanySaved(false); }}
                  maxLength={4}
                  placeholder="ABC"
                  className={`w-full font-mono text-lg tracking-widest font-bold text-center ${
                    isDark ? 'bg-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 text-slate-800 placeholder-slate-300'
                  } border ${codeError && codePrefix.length < 2 ? 'border-red-500' : isDark ? 'border-slate-600' : 'border-slate-200'} rounded-xl px-3 py-3`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>2-4 harf</p>
              </div>
              {/* Yıl */}
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Yıl</label>
                <input
                  type="text"
                  value={codeYear}
                  onChange={(e) => { setCodeYear(e.target.value.replace(/\D/g, '').slice(0, 4)); setCompanySaved(false); }}
                  maxLength={4}
                  placeholder="2026"
                  className={`w-full font-mono text-lg tracking-widest font-bold text-center ${
                    isDark ? 'bg-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 text-slate-800 placeholder-slate-300'
                  } border ${codeError && !/^\d{4}$/.test(codeYear) ? 'border-red-500' : isDark ? 'border-slate-600' : 'border-slate-200'} rounded-xl px-3 py-3`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>4 rakam</p>
              </div>
              {/* Özel Kod */}
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Özel Kod</label>
                <input
                  type="text"
                  value={codeSuffix}
                  onChange={(e) => { setCodeSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)); setCompanySaved(false); }}
                  maxLength={4}
                  placeholder="X1"
                  className={`w-full font-mono text-lg tracking-widest font-bold text-center ${
                    isDark ? 'bg-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 text-slate-800 placeholder-slate-300'
                  } border ${codeError && !codeSuffix ? 'border-red-500' : isDark ? 'border-slate-600' : 'border-slate-200'} rounded-xl px-3 py-3`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>1-4 karakter</p>
              </div>
            </div>

            {/* Birleşik Kod Önizleme */}
            <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl border ${
              codeError
                ? isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                : codeAvailability === 'taken'
                  ? isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                  : codeAvailability === 'available'
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex-1">
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oluşan Şirket Kodu:</p>
                <p className={`font-mono text-xl tracking-[0.3em] font-bold ${
                  codeError || codeAvailability === 'taken'
                    ? isDark ? 'text-red-400' : 'text-red-600'
                    : codeAvailability === 'available'
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>{codePrefix || '___'}</span>
                  <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>{codeYear || '____'}</span>
                  <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{codeSuffix || '_'}</span>
                </p>
              </div>
              {/* Müsaitlik göstergesi */}
              {!codeError && companyCode !== company?.companyCode && (
                <div>
                  {codeAvailability === 'checking' && (
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {codeAvailability === 'available' && (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  )}
                  {codeAvailability === 'taken' && (
                    <XCircle size={24} className="text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Durum mesajları */}
            {codeError && (
              <p className={`mt-2 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{codeError}</p>
            )}
            {!codeError && codeAvailability === 'available' && (
              <p className={`mt-2 text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                ✓ Bu şirket kodu müsait
              </p>
            )}
            {!codeError && codeAvailability === 'taken' && (
              <p className={`mt-2 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                ✗ Bu şirket kodu başka bir şirket tarafından kullanılıyor
              </p>
            )}

            {/* Bilgi kutusu */}
            <div className={`mt-2.5 flex items-start gap-2.5 p-3 rounded-xl ${
              isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
            }`}>
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  Şirket kodu yapısı: Kısaltma + Yıl + Özel Kod
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Şirket kodu, çalışanların giriş yapması için kullanılır. Değiştirirseniz tüm çalışanlara yeni kodu bildirmeniz gerekir.
                </p>
                <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>• Kısaltma: Şirket adından türetilir (2-4 harf)</span>
                  <span>• Yıl: 4 haneli yıl</span>
                  <span>• Özel Kod: 1-4 karakter (A-Z, 0-9)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Açıklama</label>
            <textarea
              value={companyDesc}
              onChange={(e) => { setCompanyDesc(e.target.value); setCompanySaved(false); }}
              rows={2}
              placeholder="Şirket hakkında kısa bilgi..."
              className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5 resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Telefon</label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => { setCompanyPhone(e.target.value); setCompanySaved(false); }}
                placeholder="+90 212 555 0000"
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adres</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => { setCompanyAddress(e.target.value); setCompanySaved(false); }}
                placeholder="İstanbul, Türkiye"
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5`}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Rol: <span className="font-medium">{user?.position}</span>
            </span>
            <button
              onClick={saveCompanyInfo}
              disabled={!!codeError || codeAvailability === 'taken' || codeAvailability === 'checking'}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Şirket Bilgilerini Kaydet
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Admin Paneli - Sadece Boss */}
      {isBoss && (
        <>
          {/* Departman Yönetimi */}
          <div className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-6`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Departman Yönetimi</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Departmanları ekleyin, düzenleyin veya kaldırın</p>
              </div>
            </div>

            {/* Ekleme */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Yeni departman adı..."
                className={`flex-1 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
              />
              <ColorPicker value={newDeptColor} onChange={setNewDeptColor} isDark={isDark} />
              <button
                onClick={addDepartment}
                className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center gap-1"
              >
                <Plus size={16} />
                Ekle
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2">
              {deptList.map(dept => (
                <div key={dept.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  {editingDept === dept.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        defaultValue={dept.name}
                        className={`flex-1 ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-lg px-3 py-1.5 text-sm`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateDepartment(dept.id, { name: e.target.value });
                          if (e.key === 'Escape') setEditingDept(null);
                        }}
                        autoFocus
                      />
                      <ColorPicker value={dept.color} onChange={(c) => updateDepartment(dept.id, { color: c })} isDark={isDark} />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingDept(dept.id)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
                          <Edit size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        </button>
                        <button onClick={() => removeDepartment(dept.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Öncelik Yönetimi */}
          <div className={`${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60'} rounded-2xl border p-6`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Öncelik Yönetimi</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Görev öncelik seviyelerini yönetin</p>
              </div>
            </div>

            {/* Ekleme */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newPriorityLabel}
                onChange={(e) => setNewPriorityLabel(e.target.value)}
                placeholder="Yeni öncelik adı..."
                className={`flex-1 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                onKeyDown={(e) => e.key === 'Enter' && addPriority()}
              />
              <ColorPicker value={newPriorityColor} onChange={setNewPriorityColor} isDark={isDark} />
              <button
                onClick={addPriority}
                className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1"
              >
                <Plus size={16} />
                Ekle
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2">
              {priorityList.map(priority => (
                <div key={priority.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  {editingPriority === priority.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        defaultValue={priority.label}
                        className={`flex-1 ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-lg px-3 py-1.5 text-sm`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updatePriority(priority.id, { label: e.target.value });
                          if (e.key === 'Escape') setEditingPriority(null);
                        }}
                        autoFocus
                      />
                      <ColorPicker value={priority.color} onChange={(c) => updatePriority(priority.id, { color: c })} isDark={isDark} />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: priority.color }} />
                        <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{priority.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingPriority(priority.id)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
                          <Edit size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        </button>
                        <button onClick={() => removePriority(priority.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl
                       hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

// ===== YARDIMCI COMPONENTLER =====

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
