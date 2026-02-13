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
  User
} from 'lucide-react';

// Yeni bileşenleri import et
import TimeTracker from '../components/TimeTracker';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import ReportsPage from '../components/ReportsPage';
import LeaveRequestSystem from '../components/LeaveRequestSystem';
import TaskDetailModal from '../components/TaskDetailModal';
import NotificationCenter from '../components/NotificationCenter';

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
  const { user, company, logout, isBoss, isManager } = useAuth();
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
  const openTaskModal = (task = null) => {
    setEditingTask(task);
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
            <button 
              onClick={() => openTaskModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl
                       shadow-lg shadow-indigo-500/25 transition-all">
              <Plus size={18} />
              Yeni Görev
            </button>
          )}

          {canManage && activeTab === 'employees' && (
            <button 
              onClick={() => openEmployeeModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl
                       shadow-lg shadow-indigo-500/25 transition-all">
              <UserPlus size={18} />
              Çalışan Ekle
            </button>
          )}

          {canManage && activeTab === 'announcements' && (
            <button 
              onClick={() => openAnnouncementModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl
                       shadow-lg shadow-indigo-500/25 transition-all">
              <Megaphone size={18} />
              Yeni Duyuru
            </button>
          )}
        </div>

        {/* İçerik */}
        {activeTab === 'overview' && <OverviewTab tasks={tasks} employees={employees} canManage={canManage} isDark={isDark} user={user} onAddTask={() => openTaskModal()} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} employees={employees} canManage={canManage} isDark={isDark} onTaskClick={handleTaskClick} onUpdateTask={updateTask} onDeleteTask={deleteTask} onEditTask={openTaskModal} user={user} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={tasks} isDark={isDark} onTaskClick={handleTaskClick} onUpdateTask={updateTask} />}
        {activeTab === 'calendar' && <CalendarView tasks={tasks} isDark={isDark} onTaskClick={handleTaskClick} />}
        {activeTab === 'timetracker' && <TimeTracker user={user} isDark={isDark} />}
        {activeTab === 'reports' && canManage && <ReportsPage tasks={tasks} users={employees} isDark={isDark} />}
        {activeTab === 'employees' && canManage && <EmployeesTab employees={employees} tasks={tasks} isDark={isDark} onEdit={openEmployeeModal} onDelete={deleteEmployee} />}
        {activeTab === 'leaves' && <LeaveRequestSystem user={user} isBoss={isBoss} isDark={isDark} />}
        {activeTab === 'announcements' && <AnnouncementsTab announcements={announcementsList} canManage={canManage} isDark={isDark} onEdit={openAnnouncementModal} onDelete={deleteAnnouncement} onUpdate={updateAnnouncement} />}
        {activeTab === 'settings' && <SettingsTab isDark={isDark} />}
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
        />
      )}

      {/* Görev Ekleme/Düzenleme Modal */}
      {showTaskModal && (
        <TaskFormModal 
          task={editingTask}
          employees={employees}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={(data) => {
            if (editingTask) {
              updateTask(editingTask.id, data);
            } else {
              addTask(data);
            }
            setShowTaskModal(false);
            setEditingTask(null);
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
const TaskFormModal = ({ task, employees, onClose, onSave, isDark }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    department: task?.department || 'Yazılım',
    dueDate: task?.dueDate || '',
    assignedTo: task?.assignedTo || null,
    estimatedHours: task?.estimatedHours || 0,
    tags: task?.tags || []
  });

  const activeEmployees = employees.filter(e => e.role !== 'boss' && e.status === 'active');

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
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Görev açıklaması..."
                rows={3}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
              />
            </div>

            {/* 2 Kolon */}
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

              {/* Durum */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Durum
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="pending">Bekliyor</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="review">İncelemede</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>
            </div>

            {/* 2 Kolon */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Çalışan Ata */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Görevi Ata
              </label>
              <select
                value={form.assignedTo?.id || ''}
                onChange={(e) => {
                  const emp = activeEmployees.find(emp => emp.id === parseInt(e.target.value));
                  setForm(prev => ({ 
                    ...prev, 
                    assignedTo: emp ? { id: emp.id, firstName: emp.firstName, lastName: emp.lastName, position: emp.position, department: emp.department } : null 
                  }));
                }}
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="">Atanmadı</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahmini Süre */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tahmini Süre (Saat)
              </label>
              <input
                type="number"
                value={form.estimatedHours}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                min="0"
                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
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
const EmployeeFormModal = ({ employee, onClose, onSave, isDark }) => {
  const [form, setForm] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || 'employee',
    department: employee?.department || 'Yazılım',
    position: employee?.position || '',
    status: employee?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    onSave(form);
  };

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
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                >
                  <option value="employee">Çalışan</option>
                  <option value="manager">Yönetici</option>
                </select>
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
const AnnouncementFormModal = ({ announcement, onClose, onSave, isDark }) => {
  const [form, setForm] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'normal',
    isPinned: announcement?.isPinned || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {announcement ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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
                <option value="normal">Normal</option>
                <option value="important">Önemli</option>
                <option value="urgent">Acil</option>
              </select>
            </div>

            {/* Sabitle */}
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="w-5 h-5 rounded border-2 text-indigo-500 focus:ring-indigo-500"
              />
              <Pin size={16} />
              <span className="text-sm font-medium">Duyuruyu Sabitle</span>
            </label>
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
const TasksTab = ({ tasks, employees, canManage, isDark, onTaskClick, onUpdateTask, onDeleteTask, onEditTask, user }) => {
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

// ===== ÇALIŞANLAR TAB =====
const EmployeesTab = ({ employees, tasks, isDark, onEdit, onDelete }) => {
  const displayEmployees = employees.filter(u => u.role !== 'boss');

  return (
    <div className="space-y-6">
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
