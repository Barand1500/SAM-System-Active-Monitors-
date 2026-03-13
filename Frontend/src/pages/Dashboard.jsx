import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logger from '../utils/logger';

import { userAPI, announcementAPI, departmentAPI, notificationAPI, taskAPI, dashboardSettingAPI, smsAPI, roleAPI } from '../services/api';
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
  Contact,
  History,
  GripVertical,
  Settings2,
  Layout,
  CheckSquare,
  Activity,
  ListTodo,
  UserCheck,
  Flag,
  PieChart,
  Trophy,
  BookTemplate
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
import AdminPanel from '../components/AdminPanel';
import CompanyInfo from '../components/CompanyInfo';
import UserProfile from '../components/UserProfile';
import ChangeHistory, { logChange } from '../components/ChangeHistory';
import BaseModal from '../components/BaseModal';
import { 
  TaskStatsWidget, 
  WeeklyHoursWidget, 
  UpcomingTasksWidget, 
  TeamPerformanceWidget, 
  RecentActivitiesWidget, 
  NotificationSummaryWidget,
  PendingTasksWidget,
  MyTasksWidget,
  PriorityTasksWidget,
  DeadlineWidget,
  QuickStatsWidget,
  CompletionRateWidget,
  TopContributorsWidget,
  DepartmentPerformanceWidget,
  WeeklySummaryWidget,
  TaskDistributionWidget
} from '../components/DashboardWidgets';

// LocalStorage helpers (cache + API sync)
const DASHBOARD_KEYS = ['dashboard_layouts', 'active_layout_id', 'task_templates'];

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

// Dashboard ayarlarını API'ye toplu kaydet (debounced)
let dashboardSaveTimer = null;
const saveDashboardToAPI = () => {
  clearTimeout(dashboardSaveTimer);
  dashboardSaveTimer = setTimeout(() => {
    try {
      const settings = {};
      for (const key of DASHBOARD_KEYS) {
        const val = localStorage.getItem(key);
        if (val) settings[key] = JSON.parse(val);
      }
      // Layout-specific widget orders/sizes
      const layouts = settings['dashboard_layouts'] || [];
      for (const l of layouts) {
        const orderKey = `dashboard_widget_order_${l.id}`;
        const sizesKey = `dashboard_widget_sizes_${l.id}`;
        const order = localStorage.getItem(orderKey);
        const sizes = localStorage.getItem(sizesKey);
        if (order) settings[orderKey] = JSON.parse(order);
        if (sizes) settings[sizesKey] = JSON.parse(sizes);
      }
      dashboardSettingAPI.update(settings).catch(() => {});
    } catch {}
  }, 1000);
};

// Başlangıç görevleri (fallback)
const initialTasks = [];

// Backend task → Frontend task format dönüştürücü
// DB'de Türkçe karakter olmadan kaydedilmiş olabilir, her iki hali de ekle
const STATUS_MAP = { 
  'Beklemede': 'pending', 'Devam Ediyor': 'in_progress', 'İncelemede': 'review', 'Incelemede': 'review',
  'Tamamlandı': 'completed', 'Tamamlandi': 'completed', 'İptal Edildi': 'cancelled', 'Iptal Edildi': 'cancelled'
};
const PRIORITY_MAP = { 
  'Düşük': 'low', 'Dusuk': 'low', 'Normal': 'medium', 
  'Yüksek': 'high', 'Yuksek': 'high', 'Acil': 'urgent' 
};
const STATUS_REVERSE = { 'pending': 'Beklemede', 'in_progress': 'Devam Ediyor', 'review': 'İncelemede', 'completed': 'Tamamlandı' };
const PRIORITY_REVERSE = { 'low': 'Düşük', 'medium': 'Normal', 'high': 'Yüksek', 'urgent': 'Acil' };

const backendToFrontendTask = (bt) => {
  const assignee = bt.TaskAssignments?.[0]?.User || null;
  return {
    id: bt.id,
    title: bt.title,
    description: bt.description || '',
    status: bt.TaskStatus ? (STATUS_MAP[bt.TaskStatus.name] || 'pending') : 'pending',
    priority: bt.TaskPriority ? (PRIORITY_MAP[bt.TaskPriority.name] || 'medium') : 'medium',
    assignedTo: assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : null,
    assignedBy: bt.creator ? { id: bt.creator.id, firstName: bt.creator.firstName, lastName: bt.creator.lastName } : null,
    department: '',
    dueDate: bt.dueDate || null,
    createdAt: bt.createdAt ? new Date(bt.createdAt).toISOString().split('T')[0] : null,
    completedAt: bt.completedAt ? new Date(bt.completedAt).toISOString().split('T')[0] : null,
    estimatedHours: bt.estimatedHours || 0,
    actualHours: bt.actualHours || 0,
    tags: [],
    taskType: bt.type || 'task',
    _statusId: bt.statusId || bt.TaskStatus?.id,
    _priorityId: bt.priorityId || bt.TaskPriority?.id,
    _taskListId: bt.taskListId,
  };
};

// Helper: Backend dosya URL'sini tam adrese çevir
const getImageUrl = (imgPath) => {
  if (!imgPath) return null;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = API_URL.replace('/api', '');
  if (imgPath.startsWith('http')) return imgPath;
  if (imgPath.startsWith('/')) return baseUrl + imgPath;
  return baseUrl + '/' + imgPath;
};

// Ana Dashboard bileşeni
const Dashboard = () => {
  const { user, company, logout, isBoss, isManager, isEmployee, userRoles } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  
  // Kullanıcı avatar'ını yükle
  useEffect(() => {
    const loadAvatar = async () => {
      if (!user?.id) return;
      try {
        const res = await userAPI.get(user.id);
        const u = res.data?.data || res.data;
        const avatar = u?.avatarUrl || u?.avatar_url;
        if (avatar) setUserAvatarUrl(getImageUrl(avatar));
      } catch (err) {
        // Avatar yüklenemezse sessizce devam et
      }
    };
    loadAvatar();

    // Avatar güncellendiğinde yeniden yükle
    const handleAvatarUpdate = (e) => {
      if (e.detail?.avatarUrl) {
        setUserAvatarUrl(getImageUrl(e.detail.avatarUrl));
      } else {
        loadAvatar();
      }
    };
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdate);
  }, [user?.id]);

  // Ana state'ler - LocalStorage ile senkronize
  const [tasks, setTasks] = useState([]);
  const [statusIdMap, setStatusIdMap] = useState({});   // { 'pending': 1, 'in_progress': 2, ... }
  const [priorityIdMap, setPriorityIdMap] = useState({}); // { 'low': 1, 'medium': 2, ... }
  const [defaultTaskListId, setDefaultTaskListId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  // Modal state'leri
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [calendarDate, setCalendarDate] = useState(null);
  const [showBulkEmployeeModal, setShowBulkEmployeeModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsHistory, setSmsHistory] = useState([]);
  const [smsGroups, setSmsGroups] = useState([]);
  
  // Görev Şablonları State
  const [taskTemplates, setTaskTemplates] = useState(() => loadFromStorage('task_templates', []));
  
  // Dashboard Layouts State
  const [dashboardLayouts, setDashboardLayouts] = useState(() => loadFromStorage('dashboard_layouts', [
    { id: 1, name: 'Varsayılan', isDefault: true, createdAt: new Date().toISOString() }
  ]));
  const [activeLayoutId, setActiveLayoutId] = useState(() => loadFromStorage('active_layout_id', 1));

  // LocalStorage'a kaydet (UI tercihleri) + API sync
  
  useEffect(() => {
    saveToStorage('task_templates', taskTemplates);
    saveDashboardToAPI();
  }, [taskTemplates]);
  
  useEffect(() => {
    saveToStorage('dashboard_layouts', dashboardLayouts);
    saveDashboardToAPI();
  }, [dashboardLayouts]);
  
  useEffect(() => {
    saveToStorage('active_layout_id', activeLayoutId);
    saveDashboardToAPI();
  }, [activeLayoutId]);

  // API'den dashboard ayarlarını yükle (ilk mount)
  useEffect(() => {
    dashboardSettingAPI.get().then(res => {
      const settings = res.data;
      if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
        // State'leri güncelle
        if (settings['dashboard_layouts']) setDashboardLayouts(settings['dashboard_layouts']);
        if (settings['active_layout_id']) setActiveLayoutId(settings['active_layout_id']);
        if (settings['task_templates']) setTaskTemplates(settings['task_templates']);
      }
    }).catch(() => {});
  }, []);

  // Backend API'den veri çek (Component mount olduğunda)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Kullanıcıları Backend'den çek
        const usersRes = await userAPI.list();
        if (usersRes.data?.data || usersRes.data) {
          const userData = usersRes.data.data || usersRes.data;
          const mapped = (Array.isArray(userData) ? userData : []).map(u => ({
            ...u,
            skills: u.UserSkills || u.skills || [],
            roles: u.roles || (u.role ? [u.role] : ['employee'])
          }));
          setEmployees(mapped);
        }
        logger.success('DATA-LOAD', `${employees.length} çalışan yüklendi`);
      } catch (err) {
        logger.error('DATA-LOAD', 'Çalışanlar yüklenirken hata', err);
      }

      try {
        // Duyuruları Backend'den çek
        const announcementsRes = await announcementAPI.list();
        if (announcementsRes.data?.data || announcementsRes.data) {
          const announcementData = announcementsRes.data.data || announcementsRes.data;
          setAnnouncementsList(Array.isArray(announcementData) ? announcementData : []);
        }
        logger.success('DATA-LOAD', 'Duyurular yüklendi');
      } catch (err) {
        logger.error('DATA-LOAD', 'Duyurular yüklenirken hata', err);
      }

      try {
        // Departmanları Backend'den çek
        const deptRes = await departmentAPI.list();
        const deptData = deptRes.data?.data || deptRes.data;
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        }
        logger.success('DATA-LOAD', 'Departmanlar yüklendi');
      } catch (err) {
        logger.error('DATA-LOAD', 'Departmanlar yüklenirken hata', err);
      }

      try {
        // Rolleri Backend'den çek
        const rolesRes = await roleAPI.list();
        const rolesData = rolesRes.data?.data || rolesRes.data;
        if (Array.isArray(rolesData)) {
          setAvailableRoles(rolesData.filter(r => (r.roleKey || r.role_key || r.id) !== 'boss'));
        }
      } catch (err) {
        console.error('Rolleri yüklerken hata:', err);
      }

      try {
        // Görevleri Backend'den çek
        const tasksRes = await taskAPI.list();
        const taskData = tasksRes.data?.data || tasksRes.data;
        if (Array.isArray(taskData)) {
          setTasks(taskData.map(backendToFrontendTask));
        }
        logger.success('DATA-LOAD', `${taskData?.length || 0} görev yüklendi`);
      } catch (err) {
        logger.error('DATA-LOAD', 'Görevler yüklenirken hata', err);
      }

      try {
        // Task config (status/priority ID'leri, varsayılan taskListId)
        const configRes = await taskAPI.getConfig();
        const config = configRes.data;
        if (config.statuses) {
          const sMap = {};
          config.statuses.forEach(s => {
            const key = STATUS_MAP[s.name];
            if (key) sMap[key] = s.id;
          });
          setStatusIdMap(sMap);
        }
        if (config.priorities) {
          const pMap = {};
          config.priorities.forEach(p => {
            const key = PRIORITY_MAP[p.name];
            if (key) pMap[key] = p.id;
          });
          setPriorityIdMap(pMap);
        }
        if (config.defaultTaskListId) setDefaultTaskListId(config.defaultTaskListId);
      } catch (err) {
        console.error('❤😂😂😂👍😁 Task config yüklerken hata:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
      }

      try {
        const [groupsRes, historyRes] = await Promise.all([
          smsAPI.listGroups(),
          smsAPI.listHistory(),
        ]);
        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
        setSmsGroups(groups.map(g => ({
          ...g,
          memberIds: g.memberIds || g.member_ids || [],
        })));
        const history = Array.isArray(historyRes.data) ? historyRes.data : [];
        setSmsHistory(history.map(h => ({
          ...h,
          sentAt: h.sentAt || h.sent_at || h.created_at || h.createdAt,
          sendTo: h.sendTo || h.send_to || 'all',
          templateUsed: h.templateUsed || h.template_used || null,
          recipients: h.recipients || [],
        })));
      } catch (err) {
        console.error('SMS verileri yüklerken hata:', err);
      }
    };

    loadData();
  }, []); // Sadece component mount olduğunda çalış

  // Otomatik yenilenme için polling (her 30 saniyede bir)
  useEffect(() => {
    const refreshTasks = async () => {
      try {
        const tasksRes = await taskAPI.list();
        const taskData = tasksRes.data?.data || tasksRes.data;
        if (Array.isArray(taskData)) {
          setTasks(taskData.map(backendToFrontendTask));
        }
      } catch (err) {
        console.error('Görevler otomatik yenilenirken hata:', err);
      }
    };

    const interval = setInterval(refreshTasks, 30000); // 30 saniye
    return () => clearInterval(interval);
  }, []);

  const canManage = isBoss || isManager;

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks', label: canManage ? 'Tüm Görevler' : 'Görevlerim', icon: ClipboardList },
    ...(!isBoss ? [{ id: 'pool', label: 'Havuz', icon: Layers }] : []),
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
  ];



  const copyCompanyCode = () => {
    navigator.clipboard.writeText(company?.companyCode || '');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // CRUD Fonksiyonları - Backend API bağlantılı
  const addEmployee = async (empData) => {
    try {
      const res = await userAPI.create(empData);
      const raw = res.data.data || res.data;
      const newEmp = { ...raw, skills: raw.UserSkills || raw.skills || [], roles: raw.roles || (raw.role ? [raw.role] : ['employee']) };
      setEmployees(prev => [...prev, newEmp]);
    } catch (err) {
      console.error('Çalışan eklerken hata:', err);
      const newEmployee = {
        ...empData,
        id: Date.now(),
        companyId: company?.id || 1,
        status: 'active',
        avatar: null
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
  };

  const updateEmployee = async (empId, updates) => {
    try {
      const res = await userAPI.update(empId, updates);
      const raw = res.data.data || res.data;
      const updated = { ...raw, skills: raw.UserSkills || raw.skills || [], roles: raw.roles || (raw.role ? [raw.role] : ['employee']) };
      setEmployees(prev => prev.map(e => e.id === empId ? { ...e, ...updated } : e));
    } catch (err) {
      console.error('Çalışan güncellerken hata:', err);
      setEmployees(prev => prev.map(e => e.id === empId ? { ...e, ...updates } : e));
    }
  };

  const deleteEmployee = async (empId) => {
    try {
      await userAPI.delete(empId);
      setEmployees(prev => prev.filter(e => e.id !== empId));
    } catch (err) {
      console.error('Çalışan silerken hata:', err);
      setEmployees(prev => prev.filter(e => e.id !== empId));
    }
  };

  const addAnnouncement = async (annData) => {
    try {
      const res = await announcementAPI.create(annData);
      const newAnn = res.data.data || res.data;
      setAnnouncementsList(prev => [newAnn, ...prev]);
    } catch (err) {
      console.error('Duyuru eklerken hata:', err);
      const newAnn = {
        ...annData,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: { id: user.id, firstName: user.firstName, lastName: user.lastName }
      };
      setAnnouncementsList(prev => [newAnn, ...prev]);
    }
  };

  const updateAnnouncement = async (annId, updates) => {
    try {
      await announcementAPI.update(annId, updates);
      setAnnouncementsList(prev => prev.map(a => a.id === annId ? { ...a, ...updates } : a));
    } catch (err) {
      console.error('Duyuru güncellerken hata:', err);
      setAnnouncementsList(prev => prev.map(a => a.id === annId ? { ...a, ...updates } : a));
    }
  };

  const deleteAnnouncement = async (annId) => {
    try {
      await announcementAPI.delete(annId);
      setAnnouncementsList(prev => prev.filter(a => a.id !== annId));
    } catch (err) {
      console.error('Duyuru silerken hata:', err);
      setAnnouncementsList(prev => prev.filter(a => a.id !== annId));
    }
  };

  // Task CRUD - Backend API bağlantılı
  const addTask = async (taskData) => {
    let currentTaskListId = defaultTaskListId;
    let currentStatusIdMap = statusIdMap;
    let currentPriorityIdMap = priorityIdMap;

    // Config yoksa yüklemeyi dene, ama başarısız olsa bile devam et (backend varsayılanları seçecek)
    if (!currentTaskListId || !Object.keys(currentStatusIdMap).length || !Object.keys(currentPriorityIdMap).length) {
      console.warn('Task config henüz yüklenmedi, yeniden yükleniyor...');
      try {
        const configRes = await taskAPI.getConfig();
        const config = configRes.data;
        if (config.statuses && config.statuses.length > 0) {
          const sMap = {};
          config.statuses.forEach(s => { const key = STATUS_MAP[s.name]; if (key) sMap[key] = s.id; });
          currentStatusIdMap = sMap;
          setStatusIdMap(sMap);
        }
        if (config.priorities && config.priorities.length > 0) {
          const pMap = {};
          config.priorities.forEach(p => { const key = PRIORITY_MAP[p.name]; if (key) pMap[key] = p.id; });
          currentPriorityIdMap = pMap;
          setPriorityIdMap(pMap);
        }
        if (config.defaultTaskListId) {
          currentTaskListId = config.defaultTaskListId;
          setDefaultTaskListId(config.defaultTaskListId);
        }
      } catch (err) {
        console.warn('Config yüklenemedi, varsayılanlarla devam ediliyor:', err);
        // Config yüklenemese bile devam et, backend varsayılanları seçecek
      }
    }

    try {
      // Minimal payload - sadece zorunlu alanlar, backend varsayılanları bulacak
      const payload = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate || null,
        startDate: taskData.startDate || null,
        estimatedHours: taskData.estimatedHours || null,
        type: taskData.taskType === 'group' ? 'task' : 'task',
      };

      // Eğer config yüklendiyse ID'leri ekle (opsiyonel)
      if (currentTaskListId) {
        payload.taskListId = currentTaskListId;
      }
      if (Object.keys(currentStatusIdMap).length) {
        payload.statusId = currentStatusIdMap[taskData.status] || currentStatusIdMap['pending'] || Object.values(currentStatusIdMap)[0];
      }
      if (Object.keys(currentPriorityIdMap).length) {
        payload.priorityId = currentPriorityIdMap[taskData.priority] || currentPriorityIdMap['medium'] || Object.values(currentPriorityIdMap)[0];
      }

      console.log('📤 Görev payload:', payload, '(Config yüklü:', !!currentTaskListId, ')');
      const res = await taskAPI.create(payload);
      const created = res.data?.data || res.data;
      // Atama varsa (assignedTo dizi veya tekil obje olabilir)
      const assignees = Array.isArray(taskData.assignedTo) ? taskData.assignedTo : (taskData.assignedTo ? [taskData.assignedTo] : []);
      for (const assignee of assignees) {
        if (assignee?.id) {
          try { await taskAPI.assign(created.id, assignee.id); } catch {}
        }
      }
      // Listeyi yeniden çek
      const tasksRes = await taskAPI.list();
      const taskList = tasksRes.data?.data || tasksRes.data;
      if (Array.isArray(taskList)) {
        setTasks(taskList.map(backendToFrontendTask));
        console.log('✅ Görevler yenilendi:', taskList.length);
      }
      // Dashboard layoutlarını da yenile
      try {
        const res = await dashboardSettingAPI.get();
        if (res.data && res.data['dashboard_layouts']) {
          setDashboardLayouts(res.data['dashboard_layouts']);
        }
      } catch (err) {
        console.log('Dashboard settings yenilenemedi:', err);
      }
    } catch (err) {
      console.error('Görev eklerken hata:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
      console.error('Detaylı hata:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        error: errorMsg,
        payload: err.config?.data,
        response: err.response?.data
      });
      
      // Kullanıcıya backend'den gelen açıklayıcı mesajı göster
      alert(`❌ ${errorMsg}\n\n💡 Lütfen sistem yöneticisine bildirin.`);
      return;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const payload = {};
      if (updates.title) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status) payload.statusId = statusIdMap[updates.status];
      if (updates.priority) payload.priorityId = priorityIdMap[updates.priority];
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
      if (updates.estimatedHours !== undefined) payload.estimatedHours = updates.estimatedHours;
      if (updates.status === 'completed') payload.completedAt = new Date();
      await taskAPI.update(taskId, payload);
      // Görevleri yeniden çek
      const tasksRes = await taskAPI.list();
      const taskList = tasksRes.data?.data || tasksRes.data;
      if (Array.isArray(taskList)) {
        setTasks(taskList.map(backendToFrontendTask));
        console.log('✅ Görevler güncellendi');
      }
    } catch (err) {
      console.error('Görev güncellerken hata:', err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      // Görevleri yeniden çek
      const tasksRes = await taskAPI.list();
      const taskList = tasksRes.data?.data || tasksRes.data;
      if (Array.isArray(taskList)) {
        setTasks(taskList.map(backendToFrontendTask));
        console.log('✅ Görevler silindi ve yenilendi');
      }
    } catch (err) {
      console.error('Görev silerken hata:', err);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const leaveTask = async (taskId) => {
    try {
      await taskAPI.unassign(taskId, user.id);
      // Görevleri yeniden çek
      const tasksRes = await taskAPI.list();
      const taskList = tasksRes.data?.data || tasksRes.data;
      if (Array.isArray(taskList)) {
        setTasks(taskList.map(backendToFrontendTask));
        console.log('✅ Görevden ayrıldı, liste yenilendi');
      }
    } catch (err) {
      console.error('Görevden ayrılırken hata:', err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: null, taskType: 'group', status: 'pending' } : t));
    }
  };

  const claimTask = async (taskId) => {
    try {
      await taskAPI.assign(taskId, user.id);
      // Görevleri yeniden çek
      const tasksRes = await taskAPI.list();
      const taskList = tasksRes.data?.data || tasksRes.data;
      if (Array.isArray(taskList)) {
        setTasks(taskList.map(backendToFrontendTask));
        console.log('✅ Görev üstlenildi, liste yenilendi');
      }
    } catch (err) {
      console.error('Görev üstlenirken hata:', err);
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        assignedTo: { id: user.id, firstName: user.firstName, lastName: user.lastName, position: user.position, department: user.department },
        taskType: 'single'
      } : t));
    }
  };

  // ===== GÖREV ŞABLONU FONKSİYONLARI =====
  
  // Şablon Kaydet
  const saveAsTemplate = (templateData) => {
    const newTemplate = {
      id: Date.now(),
      name: templateData.name,
      description: templateData.description,
      priority: templateData.priority,
      department: templateData.department,
      taskType: templateData.taskType,
      tags: templateData.tags || [],
      createdAt: new Date().toISOString()
    };
    setTaskTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };
  
  // Şablon Sil
  const deleteTemplate = (templateId) => {
    setTaskTemplates(prev => prev.filter(t => t.id !== templateId));
  };
  
  // Şablon Güncelle
  const updateTemplate = (templateId, updates) => {
    setTaskTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t));
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
  
  // Görev Tarihi Güncelle (Calendar Drag & Drop için)
  const updateTaskDate = async (taskId, newDate) => {
    try {
      await updateTask(taskId, { dueDate: newDate });
    } catch (err) {
      console.error('Görev tarihi güncellenirken hata:', err);
    }
  };
  
  // ===== DASHBOARD LAYOUT FONKSİYONLARI =====
  
  const createNewLayout = (name) => {
    const newLayout = {
      id: Date.now(),
      name,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    setDashboardLayouts(prev => [...prev, newLayout]);
    setActiveLayoutId(newLayout.id);
    // Widget order'ı bu layout için kopyala
    const currentOrder = localStorage.getItem('dashboard_widget_order');
    localStorage.setItem(`dashboard_widget_order_${newLayout.id}`, currentOrder || '[]');
    saveDashboardToAPI();
    return newLayout;
  };
  
  const deleteLayout = (layoutId) => {
    const layout = dashboardLayouts.find(l => l.id === layoutId);
    if (layout?.isDefault) {
      alert('Varsayılan layout silinemez!');
      return;
    }
    setDashboardLayouts(prev => prev.filter(l => l.id !== layoutId));
    if (activeLayoutId === layoutId) {
      const defaultLayout = dashboardLayouts.find(l => l.isDefault);
      setActiveLayoutId(defaultLayout?.id || dashboardLayouts[0]?.id);
    }
    localStorage.removeItem(`dashboard_widget_order_${layoutId}`);
    saveDashboardToAPI();
  };
  
  const switchLayout = (layoutId) => {
    setActiveLayoutId(layoutId);
    saveDashboardToAPI();
  };
  
  const renameLayout = (layoutId, newName) => {
    setDashboardLayouts(prev => prev.map(l => 
      l.id === layoutId ? { ...l, name: newName } : l
    ));
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
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
                    {userAvatarUrl ? (
                      <img src={userAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                    )}
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
                    {!isBoss && (
                      <button 
                        onClick={() => { setActiveTab('companyInfo'); setShowUserMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <Building2 size={16} />
                        Şirket Bilgileri
                      </button>
                    )}
                    {isBoss && (
                      <button 
                        onClick={() => { setActiveTab('admin'); setShowUserMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <Building2 size={16} />
                        Şirket Ayarları
                      </button>
                    )}
                    {(isBoss || canManage) && (
                      <button 
                        onClick={() => { setActiveTab('history'); setShowUserMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <History size={16} />
                        Değişiklik Geçmişi
                      </button>
                    )}
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
                    className={`relative flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-[1.02]'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                      }`}
                  >
                    <Icon size={16} className={isActive ? 'drop-shadow-sm' : ''} />
                    <span className="hidden md:inline text-[12px]">{item.label}</span>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSmsModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600
                             hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl
                             shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Send size={17} />
                    <span className="hidden sm:inline">SMS Gönder</span>
                  </button>
                  <button
                    onClick={() => openAnnouncementModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600
                             hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl
                             shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Megaphone size={17} />
                    <span className="hidden sm:inline">Yeni Duyuru</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* İçerik */}
        {activeTab === 'overview' && <OverviewTab tasks={tasks} employees={employees} departments={departments} canManage={canManage} isDark={isDark} user={user} onAddTask={() => openTaskModal()} dashboardLayouts={dashboardLayouts} activeLayoutId={activeLayoutId} onCreateLayout={createNewLayout} onDeleteLayout={deleteLayout} onSwitchLayout={switchLayout} onRenameLayout={renameLayout} onSettingsChange={saveDashboardToAPI} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} employees={employees} canManage={canManage} isDark={isDark} onTaskClick={handleTaskClick} onUpdateTask={updateTask} onDeleteTask={deleteTask} onEditTask={openTaskModal} user={user} onLeaveTask={leaveTask} />}
        {activeTab === 'pool' && !canManage && <PoolTab tasks={tasks} user={user} isDark={isDark} onClaimTask={claimTask} onTaskClick={handleTaskClick} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={tasks} isDark={isDark} canManage={canManage} onTaskClick={handleTaskClick} onUpdateTask={updateTask} />}
        {activeTab === 'calendar' && <CalendarView tasks={tasks} isDark={isDark} onTaskClick={handleTaskClick} onAddTask={canManage ? (date) => openTaskModal(null, date) : undefined} onUpdateTaskDate={updateTaskDate} />}
        {activeTab === 'timetracker' && <TimeTracker user={user} isDark={isDark} />}
        {activeTab === 'reports' && canManage && <ReportsPage tasks={tasks} users={employees} isDark={isDark} departments={departments} />}
        {activeTab === 'employees' && canManage && <EmployeesTab employees={employees} tasks={tasks} isDark={isDark} onEdit={openEmployeeModal} onDelete={deleteEmployee} onBulkAdd={() => setShowBulkEmployeeModal(true)} />}
        {activeTab === 'leaves' && <LeaveRequestSystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'support' && <SupportSystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'crm' && canManage && <CustomerCRM user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'files' && <FileSharing user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'surveys' && <SurveySystem user={user} isBoss={isBoss} canManage={canManage} isDark={isDark} />}
        {activeTab === 'announcements' && <AnnouncementsTab announcements={announcementsList} canManage={canManage} isDark={isDark} onEdit={openAnnouncementModal} onDelete={deleteAnnouncement} onUpdate={updateAnnouncement} departments={departments} />}
        {activeTab === 'companyInfo' && <CompanyInfo isDark={isDark} />}
        {activeTab === 'admin' && isBoss && <AdminPanel isDark={isDark} departments={departments} />}
        {activeTab === 'history' && (isBoss || canManage) && <ChangeHistory isDark={isDark} />}
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
          departments={departments}
          defaultDate={calendarDate}
          taskTemplates={taskTemplates}
          onSaveTemplate={saveAsTemplate}
          onDeleteTemplate={deleteTemplate}
          onUpdateTemplate={updateTemplate}
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
          departments={departments}
          availableRoles={availableRoles}
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

      {/* SMS Gönderme Modal */}
      {showSmsModal && (
        <SmsModal
          employees={employees}
          isDark={isDark}
          smsHistory={smsHistory}
          smsGroups={smsGroups}
          onGroupsChange={setSmsGroups}
          onGroupCreate={async (group) => {
            try {
              const res = await smsAPI.createGroup(group);
              setSmsGroups(prev => [...prev, res.data]);
            } catch { /* toast varsa gösterilir */ }
          }}
          onGroupDelete={async (groupId) => {
            try {
              await smsAPI.deleteGroup(groupId);
              setSmsGroups(prev => prev.filter(g => g.id !== groupId));
            } catch { /* */ }
          }}
          onClose={() => setShowSmsModal(false)}
          onSend={async (smsData) => {
            try {
              const res = await smsAPI.send(smsData);
              setSmsHistory(prev => [res.data, ...prev]);
              return true;
            } catch {
              return false;
            }
          }}
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
const TaskFormModal = ({ task, employees, departments, defaultDate, taskTemplates, onSaveTemplate, onDeleteTemplate, onUpdateTemplate, onClose, onSave, isDark }) => {
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
  
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');

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
  
  // ===== ŞABLON FONKSİYONLARI =====
  
  // Şablonu forma uygula
  const applyTemplate = (template) => {
    setForm(prev => ({
      ...prev,
      description: template.description || '',
      priority: template.priority || 'medium',
      department: template.department || 'Yazılım',
      taskType: template.taskType || 'single',
      tags: template.tags || []
    }));
    setSelectedTemplate(template);
  };
  
  // Mevcut formu şablon olarak kaydet
  const saveCurrentAsTemplate = () => {
    if (!templateName.trim()) {
      alert('Lütfen şablon adı girin!');
      return;
    }
    const templateData = {
      name: templateName,
      description: form.description,
      priority: form.priority,
      department: form.department,
      taskType: form.taskType,
      tags: form.tags
    };
    onSaveTemplate(templateData);
    setTemplateName('');
    alert('Şablon kaydedildi! ✅');
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

            {/* ŞABLON SEÇİCİ - Sadece yeni görev oluştururken göster */}
            {!task && taskTemplates && taskTemplates.length > 0 && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <BookTemplate size={18} className="text-purple-500" />
                  <label className={`text-sm font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    Şablon Kullan
                  </label>
                </div>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = taskTemplates.find(t => t.id === Number(e.target.value));
                    if (template) applyTemplate(template);
                  }}
                  className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-800'} border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                >
                  <option value="">Şablon seçin...</option>
                  {taskTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} • {template.department} • {template.priority}
                    </option>
                  ))}
                </select>
                {selectedTemplate && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      ✓ Şablon uygulandı: {selectedTemplate.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTemplateManager(true)}
                      className={`ml-auto text-xs ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} underline`}
                    >
                      Şablonları Yönet
                    </button>
                  </div>
                )}
              </div>
            )}

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

        {/* Modal Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          {/* Şablon Kaydetme Alanı - Sadece yeni görev oluştururken */}
          {!task && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Şablon adı girin..."
                  className={`flex-1 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={saveCurrentAsTemplate}
                  disabled={!templateName.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    templateName.trim()
                      ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookTemplate size={16} />
                  Şablon Kaydet
                </button>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Bu görevin ayarlarını şablon olarak kaydedip sonra tekrar kullanabilirsiniz
              </p>
            </div>
          )}
          
          {/* Ana Butonlar */}
          <div className="flex gap-3">
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
      
      {/* Şablon Yönetim Modalı */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col`}>
            <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <BookTemplate size={20} className="text-purple-500" />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Görev Şablonları
                </h3>
              </div>
              <button onClick={() => setShowTemplateManager(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {taskTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <BookTemplate size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Henüz şablon yok
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {taskTemplates.map(template => (
                    <div key={template.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {template.name}
                          </h4>
                          {template.description && (
                            <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
                              {template.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                              {template.department}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              template.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' :
                              template.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
                              template.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                            }`}>
                              {template.priority === 'urgent' ? 'Acil' : 
                               template.priority === 'high' ? 'Yüksek' : 
                               template.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                              {template.taskType === 'single' ? 'Tekil' : 'Çoğul'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              applyTemplate(template);
                              setShowTemplateManager(false);
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-emerald-500/20 text-emerald-400' : 'hover:bg-emerald-100 text-emerald-600'} transition-colors`}
                            title="Şablonu Uygula"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${template.name}" şablonunu silmek istediğinizden emin misiniz?`)) {
                                onDeleteTemplate(template.id);
                              }
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'} transition-colors`}
                            title="Şablonu Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={() => setShowTemplateManager(false)}
                className={`w-full py-2.5 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} font-semibold rounded-xl transition-colors`}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
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

const EmployeeFormModal = ({ employee, departments, availableRoles = [], onClose, onSave, isDark }) => {
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
                  {(availableRoles.length > 0
                    ? availableRoles.map(r => ({
                        value: r.roleKey || r.role_key || r.label?.toLowerCase(),
                        label: r.label,
                        icon: (r.roleKey || r.role_key) === 'manager' ? '👔' : '👤',
                        color: r.color
                      }))
                    : [
                        { value: 'manager', label: 'Yönetici', icon: '👔' },
                        { value: 'employee', label: 'Çalışan', icon: '👤' },
                      ]
                  ).map(roleOpt => {
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
// ===== SORTABLE WIDGET WRAPPER =====
const SortableWidget = ({ id, children, isDark, onRemove, size, onResize }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Boyut class'ları
  const sizeClasses = {
    small: 'col-span-1',      // 1 sütun (1/3)
    medium: 'md:col-span-2',  // 2 sütun (2/3)
    large: 'md:col-span-3',   // 3 sütun (tam genişlik)
  };

  const [resizeMenuOpen, setResizeMenuOpen] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${sizeClasses[size] || sizeClasses.medium}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onRemove(id)}
          className={`p-1.5 rounded-lg transition-all ${
            isDark ? 'bg-red-900/50 hover:bg-red-800 text-red-300' : 'bg-red-50 hover:bg-red-100 text-red-600 shadow-md'
          }`}
          title="Kaldır"
        >
          <X size={16} />
        </button>
        <div
          {...attributes}
          {...listeners}
          className={`p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-500 shadow-md'
          }`}
          title="Sürükle"
        >
          <GripVertical size={16} />
        </div>
      </div>
      
      {/* Resize Handle - Sağ taraf */}
      <div className="absolute right-0 top-0 bottom-0 w-8 opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center justify-center">
        <div className="relative">
          <button
            onClick={() => setResizeMenuOpen(!resizeMenuOpen)}
            className={`p-1.5 rounded-l-lg transition-all ${
              isDark ? 'bg-blue-900/50 hover:bg-blue-800 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-md'
            }`}
            title="Boyutlandır"
          >
            <Settings2 size={16} />
          </button>
          
          {resizeMenuOpen && (
            <div className={`absolute right-full top-0 mr-1 rounded-lg shadow-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } overflow-hidden min-w-[140px]`}>
              <button
                onClick={() => {
                  onResize(id, 'small');
                  setResizeMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  size === 'small' 
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current rounded"></div>
                  Küçük (1/3)
                </div>
              </button>
              <button
                onClick={() => {
                  onResize(id, 'medium');
                  setResizeMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  size === 'medium' 
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 border-2 border-current rounded"></div>
                  Orta (2/3)
                </div>
              </button>
              <button
                onClick={() => {
                  onResize(id, 'large');
                  setResizeMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  size === 'large' 
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-4 border-2 border-current rounded"></div>
                  Büyük (Tam)
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

// ===== OVERVIEW TAB =====
const OverviewTab = ({ tasks, employees, departments, canManage, isDark, user, onAddTask, dashboardLayouts, activeLayoutId, onCreateLayout, onDeleteLayout, onSwitchLayout, onRenameLayout, onSettingsChange }) => {
  const myTasks = tasks.filter(t => t.assignedTo?.id == user?.id);
  const displayTasks = canManage ? tasks : myTasks;
  
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingLayoutId, setEditingLayoutId] = useState(null);
  const [editingLayoutName, setEditingLayoutName] = useState('');
  
  const activeLayout = dashboardLayouts.find(l => l.id === activeLayoutId);

  const getDefaultWidgetIds = () => ['task-stats', 'weekly-hours', 'upcoming-tasks', 'team-performance', 'recent-activities', 'notifications'];

  // Widget customization state
  const allAvailableWidgets = [
    { id: 'task-stats', component: 'TaskStatsWidget', title: 'Görev İstatistikleri', icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
    { id: 'weekly-hours', component: 'WeeklyHoursWidget', title: 'Bu Hafta', icon: Clock, color: 'from-purple-500 to-pink-500' },
    { id: 'upcoming-tasks', component: 'UpcomingTasksWidget', title: 'Yaklaşan Görevler', icon: Calendar, color: 'from-amber-500 to-orange-500' },
    { id: 'team-performance', component: 'TeamPerformanceWidget', title: 'Takım Performansı', icon: Users, color: 'from-emerald-500 to-teal-500' },
    { id: 'recent-activities', component: 'RecentActivitiesWidget', title: 'Son Aktiviteler', icon: Activity, color: 'from-indigo-500 to-purple-500' },
    { id: 'notifications', component: 'NotificationSummaryWidget', title: 'Bildirimler', icon: Bell, color: 'from-red-500 to-pink-500' },
    { id: 'pending-tasks', component: 'PendingTasksWidget', title: 'Bekleyen Görevler', icon: ListTodo, color: 'from-amber-500 to-orange-500' },
    { id: 'my-tasks', component: 'MyTasksWidget', title: 'Benim Görevlerim', icon: UserCheck, color: 'from-cyan-500 to-blue-500' },
    { id: 'priority-tasks', component: 'PriorityTasksWidget', title: 'Öncelikli Görevler', icon: Flag, color: 'from-red-500 to-pink-500' },
    { id: 'deadline-tasks', component: 'DeadlineWidget', title: 'Son Tarih Yaklaşanlar', icon: CalendarClock, color: 'from-orange-500 to-red-500' },
    { id: 'quick-stats', component: 'QuickStatsWidget', title: 'Hızlı İstatistikler', icon: BarChart3, color: 'from-teal-500 to-emerald-500' },
    { id: 'completion-rate', component: 'CompletionRateWidget', title: 'Tamamlanma Oranı', icon: PieChart, color: 'from-green-500 to-emerald-500' },
    { id: 'top-contributors', component: 'TopContributorsWidget', title: 'En Aktif Kullanıcılar', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
    { id: 'department-performance', component: 'DepartmentPerformanceWidget', title: 'Departman Performansı', icon: Briefcase, color: 'from-violet-500 to-purple-500' },
    { id: 'weekly-summary', component: 'WeeklySummaryWidget', title: 'Haftalık Özet', icon: CalendarClock, color: 'from-pink-500 to-rose-500' },
    { id: 'task-distribution', component: 'TaskDistributionWidget', title: 'Görev Dağılımı', icon: Target, color: 'from-indigo-500 to-blue-500' },
  ];

  const defaultWidgets = allAvailableWidgets.slice(0, 6); // İlk 6 widget varsayılan

  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem(`dashboard_widget_order_${activeLayoutId}`);
    return saved ? JSON.parse(saved) : getDefaultWidgetIds();
  });

  // Widget boyutlarını state olarak tut
  const [widgetSizes, setWidgetSizes] = useState(() => {
    const saved = localStorage.getItem(`dashboard_widget_sizes_${activeLayoutId}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Layout değiştiğinde veya API'den veri geldiğinde widget state'ini güncelle
  useEffect(() => {
    const savedOrder = localStorage.getItem(`dashboard_widget_order_${activeLayoutId}`);
    setWidgetOrder(savedOrder ? JSON.parse(savedOrder) : getDefaultWidgetIds());
    const savedSizes = localStorage.getItem(`dashboard_widget_sizes_${activeLayoutId}`);
    setWidgetSizes(savedSizes ? JSON.parse(savedSizes) : {});
  }, [activeLayoutId]);

  const [activeId, setActiveId] = useState(null);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [showReplaceWidgetModal, setShowReplaceWidgetModal] = useState(false);
  const [selectedWidgetToAdd, setSelectedWidgetToAdd] = useState(null);

  // Widget boyutunu değiştir
  const handleResizeWidget = (widgetId, newSize) => {
    const updatedSizes = { ...widgetSizes, [widgetId]: newSize };
    setWidgetSizes(updatedSizes);
    localStorage.setItem(`dashboard_widget_sizes_${activeLayoutId}`, JSON.stringify(updatedSizes));
    onSettingsChange?.();
  };

  // Widget boyutu al (varsayılan: 'medium')
  const getWidgetSize = (widgetId) => {
    return widgetSizes[widgetId] || 'medium';
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(`dashboard_widget_order_${activeLayoutId}`, JSON.stringify(newOrder));
        onSettingsChange?.();
        return newOrder;
      });
    }

    setActiveId(null);
  };

  const resetWidgetOrder = () => {
    const defaultOrder = getDefaultWidgetIds();
    setWidgetOrder(defaultOrder);
    localStorage.setItem(`dashboard_widget_order_${activeLayoutId}`, JSON.stringify(defaultOrder));
    onSettingsChange?.();
  };

  const handleAddWidget = (widgetId) => {
    // Zaten ekliyse uyarı göster
    if (widgetOrder.includes(widgetId)) {
      addToast({ type: 'warning', title: 'Uyarı', message: 'Bu widget zaten eklenmiş!' });
      return;
    }

    // 6'dan azsa direkt ekle
    if (widgetOrder.length < 6) {
      const newOrder = [...widgetOrder, widgetId];
      setWidgetOrder(newOrder);
      localStorage.setItem(`dashboard_widget_order_${activeLayoutId}`, JSON.stringify(newOrder));
      onSettingsChange?.();
      setShowAddWidgetModal(false);
      addToast({ type: 'success', title: 'Başarılı', message: 'Widget eklendi!' });
    } else {
      // 6 varsa değiştirme modalı aç
      setSelectedWidgetToAdd(widgetId);
      setShowAddWidgetModal(false);
      setShowReplaceWidgetModal(true);
    }
  };

  const handleReplaceWidget = (oldWidgetId) => {
    const newOrder = widgetOrder.map(id => id === oldWidgetId ? selectedWidgetToAdd : id);
    setWidgetOrder(newOrder);
    localStorage.setItem(`dashboard_widget_order_${activeLayoutId}`, JSON.stringify(newOrder));
    onSettingsChange?.();
    setShowReplaceWidgetModal(false);
    setSelectedWidgetToAdd(null);
    addToast({ type: 'success', title: 'Başarılı', message: 'Widget değiştirildi!' });
  };

  const handleRemoveWidget = (widgetId) => {
    if (widgetOrder.length <= 1) {
      addToast({ type: 'warning', title: 'Uyarı', message: 'En az 1 widget olmalı!' });
      return;
    }
    const newOrder = widgetOrder.filter(id => id !== widgetId);
    setWidgetOrder(newOrder);
    localStorage.setItem(`dashboard_widget_order_${activeLayoutId}`, JSON.stringify(newOrder));
    onSettingsChange?.();
    addToast({ type: 'success', title: 'Başarılı', message: 'Widget kaldırıldı!' });
  };

  const renderWidget = (widgetId) => {
    const widget = allAvailableWidgets.find(w => w.id === widgetId);
    if (!widget) return null;

    const widgetProps = {
      tasks,
      employees,
      isDark,
      user,
      onTaskClick: (task) => console.log('Task clicked:', task),
    };

    switch (widget.component) {
      case 'TaskStatsWidget':
        return <TaskStatsWidget tasks={tasks} isDark={isDark} />;
      case 'WeeklyHoursWidget':
        return <WeeklyHoursWidget isDark={isDark} />;
      case 'UpcomingTasksWidget':
        return <UpcomingTasksWidget tasks={displayTasks} isDark={isDark} onTaskClick={widgetProps.onTaskClick} />;
      case 'TeamPerformanceWidget':
        return <TeamPerformanceWidget employees={employees} tasks={tasks} isDark={isDark} />;
      case 'RecentActivitiesWidget':
        return <RecentActivitiesWidget isDark={isDark} />;
      case 'NotificationSummaryWidget':
        return <NotificationSummaryWidget isDark={isDark} />;
      case 'PendingTasksWidget':
        return <PendingTasksWidget tasks={tasks} isDark={isDark} onTaskClick={widgetProps.onTaskClick} />;
      case 'MyTasksWidget':
        return <MyTasksWidget tasks={tasks} user={user} isDark={isDark} onTaskClick={widgetProps.onTaskClick} />;
      case 'PriorityTasksWidget':
        return <PriorityTasksWidget tasks={tasks} isDark={isDark} onTaskClick={widgetProps.onTaskClick} />;
      case 'DeadlineWidget':
        return <DeadlineWidget tasks={tasks} isDark={isDark} onTaskClick={widgetProps.onTaskClick} />;
      case 'QuickStatsWidget':
        return <QuickStatsWidget tasks={tasks} isDark={isDark} />;
      case 'CompletionRateWidget':
        return <CompletionRateWidget tasks={tasks} isDark={isDark} />;
      case 'TopContributorsWidget':
        return <TopContributorsWidget tasks={tasks} employees={employees} isDark={isDark} />;
      case 'DepartmentPerformanceWidget':
        return <DepartmentPerformanceWidget tasks={tasks} employees={employees} isDark={isDark} />;
      case 'WeeklySummaryWidget':
        return <WeeklySummaryWidget tasks={tasks} isDark={isDark} />;
      case 'TaskDistributionWidget':
        return <TaskDistributionWidget tasks={tasks} employees={employees} isDark={isDark} />;
      default:
        return null;
    }
  };

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

      {/* Dashboard Layout Yönetimi */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Layers size={18} className="text-purple-500" />
            </div>
            <div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard Düzeni</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {activeLayout?.name || 'Varsayılan'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLayoutModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            <Plus size={14} />
            Yeni Düzen
          </button>
        </div>
        
        {/* Layout Listesi */}
        <div className="flex flex-wrap gap-2">
          {dashboardLayouts.map(layout => (
            <div key={layout.id} className="relative group">
              <button
                onClick={() => layout.id !== activeLayoutId && onSwitchLayout(layout.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  layout.id === activeLayoutId
                    ? isDark ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-purple-500 text-white shadow-lg'
                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {layout.name}
                {layout.isDefault && <span className="ml-1 text-xs opacity-60">★</span>}
              </button>
              {!layout.isDefault && layout.id === activeLayoutId && (
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLayoutId(layout.id);
                      setEditingLayoutName(layout.name);
                      setShowLayoutModal(true);
                    }}
                    className={`p-1 rounded-lg ${isDark ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    title="Yeniden adlandır"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`"${layout.name}" düzenini silmek istediğinizden emin misiniz?`)) {
                        onDeleteLayout(layout.id);
                      }
                    }}
                    className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    title="Sil"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Widgets - Customizable with Drag & Drop */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout size={20} className="text-blue-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Panolar</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
              Sürükle & Bırak
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              {widgetOrder.length}/6
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddWidgetModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              title="Widget ekle"
            >
              <Plus size={14} />
              Ekle
            </button>
            <button
              onClick={resetWidgetOrder}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              title="Varsayılan düzene sıfırla"
            >
              <Settings2 size={14} />
              Sıfırla
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgetOrder.map((widgetId) => (
                <SortableWidget 
                  key={widgetId} 
                  id={widgetId} 
                  isDark={isDark} 
                  onRemove={handleRemoveWidget}
                  size={getWidgetSize(widgetId)}
                  onResize={handleResizeWidget}
                >
                  {renderWidget(widgetId)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Widget Ekleme Modalı */}
      <BaseModal
        isOpen={showAddWidgetModal}
        onClose={() => setShowAddWidgetModal(false)}
        title="Widget Ekle"
        isDark={isDark}
      >
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Eklemek istediğiniz widget'ı seçin {widgetOrder.length >= 6 && '(Maksimum 6 widget, seçtiğiniz widget ile değiştirilecek)'}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allAvailableWidgets.map(widget => {
              const Icon = widget.icon;
              const isAlreadyAdded = widgetOrder.includes(widget.id);
              return (
                <button
                  key={widget.id}
                  onClick={() => !isAlreadyAdded && handleAddWidget(widget.id)}
                  disabled={isAlreadyAdded}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isAlreadyAdded
                      ? isDark ? 'bg-slate-700/30 border-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                      : isDark ? 'bg-slate-700/50 border-slate-600 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${widget.color} shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {widget.title}
                      </h4>
                      {isAlreadyAdded && (
                        <span className="text-xs text-emerald-500 font-medium">✓ Eklenmiş</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </BaseModal>

      {/* Widget Değiştirme Modalı */}
      <BaseModal
        isOpen={showReplaceWidgetModal}
        onClose={() => {
          setShowReplaceWidgetModal(false);
          setSelectedWidgetToAdd(null);
        }}
        title="Hangi Widget ile Değiştirmek İstersiniz?"
        isDark={isDark}
      >
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Maksimum 6 widget ekleyebilirsiniz. Değiştirmek istediğiniz widget'ı seçin:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {widgetOrder.map(widgetId => {
              const widget = allAvailableWidgets.find(w => w.id === widgetId);
              if (!widget) return null;
              const Icon = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => handleReplaceWidget(widget.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isDark ? 'bg-slate-700/50 border-slate-600 hover:border-red-500' : 'bg-white border-slate-200 hover:border-red-500 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${widget.color} shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {widget.title}
                      </h4>
                      <span className="text-xs text-red-500 font-medium">Bunu değiştir</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </BaseModal>

      {/* Layout Yönetim Modalı */}
      <BaseModal
        isOpen={showLayoutModal}
        onClose={() => {
          setShowLayoutModal(false);
          setNewLayoutName('');
          setEditingLayoutId(null);
          setEditingLayoutName('');
        }}
        title={editingLayoutId ? 'Düzeni Yeniden Adlandır' : 'Yeni Dashboard Düzeni'}
        isDark={isDark}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Düzen Adı
            </label>
            <input
              type="text"
              value={editingLayoutId ? editingLayoutName : newLayoutName}
              onChange={(e) => editingLayoutId ? setEditingLayoutName(e.target.value) : setNewLayoutName(e.target.value)}
              placeholder="Örn: Proje Yönetimi, Finans Görünümü..."
              className={`w-full px-4 py-2 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              autoFocus
            />
          </div>
          
          {!editingLayoutId && (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Yeni düzen, mevcut widget düzeninizin bir kopyasıyla oluşturulacak. Daha sonra istediğiniz gibi özelleştirebilirsiniz.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowLayoutModal(false);
                setNewLayoutName('');
                setEditingLayoutId(null);
                setEditingLayoutName('');
              }}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              İptal
            </button>
            <button
              onClick={() => {
                if (editingLayoutId) {
                  if (editingLayoutName.trim()) {
                    onRenameLayout(editingLayoutId, editingLayoutName.trim());
                    setShowLayoutModal(false);
                    setEditingLayoutId(null);
                    setEditingLayoutName('');
                  }
                } else {
                  if (newLayoutName.trim()) {
                    onCreateLayout(newLayoutName.trim());
                    setShowLayoutModal(false);
                    setNewLayoutName('');
                  }
                }
              }}
              disabled={editingLayoutId ? !editingLayoutName.trim() : !newLayoutName.trim()}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                (editingLayoutId ? !editingLayoutName.trim() : !newLayoutName.trim())
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25'
              }`}
            >
              {editingLayoutId ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </BaseModal>

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
                      {task.assignedTo?.firstName && task.assignedTo?.lastName ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Atanmadı'}
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
    : tasks.filter(t => t.assignedTo?.id == user?.id);

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
                  {task.assignedTo && task.assignedTo.firstName && task.assignedTo.lastName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                        {(task.assignedTo.firstName || '?')[0]}{(task.assignedTo.lastName || '?')[0]}
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{task.assignedTo.firstName || ''} {task.assignedTo.lastName || ''}</span>
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
    !t.assignedTo && t.status !== 'completed'
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const allEmployees = employees.filter(u => u.role !== 'boss');
  const departments = [...new Set(allEmployees.map(e => e.department).filter(Boolean))];
  
  const displayEmployees = allEmployees.filter(emp => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.position} ${emp.department}`.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
    if (roleFilter !== 'all') {
      const roles = emp.roles || [emp.role];
      if (!roles.includes(roleFilter)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Üst Bar: Filtreler + Toplu Ekle */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Çalışan ara (isim, e-posta, pozisyon)..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-indigo-400`}
            />
          </div>
          <button
            onClick={onBulkAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <FolderPlus size={18} />
            Toplu Çalışan Ekle
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="on_leave">İzinli</option>
            <option value="inactive">Pasif</option>
          </select>
          <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
            <option value="all">Tüm Departmanlar</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
            <option value="all">Tüm Roller</option>
            <option value="manager">Yönetici</option>
            <option value="employee">Çalışan</option>
          </select>
          {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || roleFilter !== 'all') && (
            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDepartmentFilter('all'); setRoleFilter('all'); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}>
              Filtreleri Temizle
            </button>
          )}
          <span className={`ml-auto text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {displayEmployees.length} / {allEmployees.length} çalışan
          </span>
        </div>
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

const CollapsibleSection = ({ isDark, title, subtitle, icon: Icon, gradient, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

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
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile'); // profile | company

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
    const timer = setTimeout(async () => {
      const result = await checkCompanyCodeAvailability(fullCode);
      setCodeAvailability(result.available ? 'available' : 'taken');
    }, 500);
    return () => clearTimeout(timer);
  }, [codePrefix, codeYear, codeSuffix]);

  const saveCompanyInfo = async () => {
    const err = validateCompanyCode();
    if (err) { setCodeError(err); return; }
    if (codeAvailability === 'taken') return;
    await updateCompany({
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

  return (
    <div className="space-y-6">
      {/* Sekme Başlıkları */}
      <div className={`flex gap-2 p-1.5 rounded-xl ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-100 border border-slate-200'}`}>
        <button
          onClick={() => setActiveSettingsTab('profile')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeSettingsTab === 'profile'
              ? isDark
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-blue-600 shadow-md'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <User size={18} />
            Profil Bilgilerim
          </div>
        </button>
        {isBoss && (
          <button
            onClick={() => setActiveSettingsTab('company')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeSettingsTab === 'company'
                ? isDark
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-blue-600 shadow-md'
                : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 size={18} />
              Şirket SAM Bilgisi
            </div>
          </button>
        )}
      </div>

      {/* Sekme İçerikleri */}
      {activeSettingsTab === 'profile' && (
        <UserProfile isDark={isDark} />
      )}

      {activeSettingsTab === 'company' && isBoss && (
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

// ===== SMS GÖNDERME MODAL =====
const SMS_TEMPLATES = [
  { id: 1, title: 'Toplantı Hatırlatma', message: 'Sayın çalışanımız, yarın saat {saat} tarihinde {konu} konulu toplantımız bulunmaktadır. Katılımınız önemlidir.' },
  { id: 2, title: 'Maaş Bildirimi', message: 'Sayın {isim}, {ay} ayı maaşınız hesabınıza yatırılmıştır. İyi günler dileriz.' },
  { id: 3, title: 'İzin Onayı', message: 'Sayın {isim}, {tarih1} - {tarih2} tarihleri arasındaki izin talebiniz onaylanmıştır.' },
  { id: 4, title: 'İzin Reddi', message: 'Sayın {isim}, {tarih1} - {tarih2} tarihleri arasındaki izin talebiniz uygun görülmemiştir. Detaylar için yöneticinizle görüşünüz.' },
  { id: 5, title: 'Acil Duyuru', message: 'DİKKAT: {mesaj}. Tüm çalışanlarımızın bilgisine sunulur.' },
  { id: 6, title: 'Doğum Günü Kutlama', message: 'Doğum gününüz kutlu olsun {isim}! Nice mutlu ve sağlıklı yıllara. 🎂' },
  { id: 7, title: 'Görev Atama', message: 'Sayın {isim}, size yeni bir görev atanmıştır: "{gorev}". Detaylar için SAM sistemini kontrol ediniz.' },
  { id: 8, title: 'Genel Bilgilendirme', message: 'Değerli çalışanlarımız, {mesaj}. Bilgilerinize sunarız.' },
];

const GROUP_EMOJIS = ['👥', '💼', '🏢', '⚙️', '📊', '🎯', '🔧', '📱', '💡', '🎨', '📋', '🏆', '🌟', '🔑', '📦', '🛡️', '🚀', '❤️', '🎓', '✅'];

const SmsModal = ({ employees, isDark, smsHistory, smsGroups = [], onGroupsChange, onGroupCreate, onGroupDelete, onClose, onSend }) => {
  const [activeView, setActiveView] = useState('compose'); // compose | history | groups
  const [sendTo, setSendTo] = useState('all'); // all | selected | group
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  // Grup oluşturma
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('👥');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');

  // ESC tuşu ile kapanma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const activeEmployees = employees.filter(e => e.role !== 'boss' && e.status === 'active');
  const filteredEmployees = activeEmployees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.department} ${emp.position}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEmployee = (emp) => {
    setSelectedEmployees(prev =>
      prev.find(e => e.id === emp.id)
        ? prev.filter(e => e.id !== emp.id)
        : [...prev, emp]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(prev => prev.length === activeEmployees.length ? [] : [...activeEmployees]);
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;
    const groupData = {
      name: newGroupName.trim(),
      emoji: newGroupEmoji,
      memberIds: newGroupMembers.map(m => m.id),
    };
    await onGroupCreate?.(groupData);
    setNewGroupName('');
    setNewGroupEmoji('👥');
    setNewGroupMembers([]);
    setShowGroupForm(false);
  };

  const deleteGroup = async (groupId) => {
    await onGroupDelete?.(groupId);
    if (selectedGroup === groupId) setSelectedGroup(null);
  };

  const selectGroupForSend = (group) => {
    setSendTo('group');
    setSelectedGroup(group.id);
    const members = activeEmployees.filter(e => group.memberIds.includes(e.id));
    setSelectedEmployees(members);
  };

  const toggleGroupMember = (emp) => {
    setNewGroupMembers(prev =>
      prev.find(e => e.id === emp.id)
        ? prev.filter(e => e.id !== emp.id)
        : [...prev, emp]
    );
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setMessage(template.message);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    let recipients;
    if (sendTo === 'all') {
      recipients = activeEmployees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));
    } else if (sendTo === 'group') {
      const group = smsGroups.find(g => g.id === selectedGroup);
      if (!group) return;
      recipients = activeEmployees
        .filter(e => group.memberIds.includes(e.id))
        .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));
    } else {
      recipients = selectedEmployees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));
    }
    if (recipients.length === 0) return;

    setSending(true);
    const success = await onSend({
      message: message.trim(),
      recipients,
      sendTo,
      templateUsed: SMS_TEMPLATES.find(t => t.id === selectedTemplate)?.title || null,
    });
    setSending(false);
    if (success !== false) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setMessage('');
        setSelectedTemplate(null);
        setSelectedEmployees([]);
        setSelectedGroup(null);
        setSendTo('all');
      }, 2000);
    }
  };

  const charCount = message.length;
  const smsCount = Math.max(1, Math.ceil(charCount / 160));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay - Tıklamada kapanmaz */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Modal Container - propagation durduruluyor */}
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Send size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SMS Gönder</h2>
              <p className="text-emerald-100 text-xs">Çalışanlarınıza toplu veya tekli SMS gönderin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/20 rounded-lg p-0.5">
              <button
                onClick={() => setActiveView('compose')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === 'compose' ? 'bg-white text-emerald-700' : 'text-white/80 hover:text-white'}`}
              >
                Yeni SMS
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === 'history' ? 'bg-white text-emerald-700' : 'text-white/80 hover:text-white'}`}
              >
                Geçmiş ({smsHistory.length})
              </button>
              <button
                onClick={() => setActiveView('groups')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === 'groups' ? 'bg-white text-emerald-700' : 'text-white/80 hover:text-white'}`}
              >
                Gruplar ({smsGroups.length})
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {activeView === 'compose' ? (
            <div className="p-6 space-y-5">
              {/* Success */}
              {showSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                  <CheckCircle2 size={22} className="text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-800">SMS Başarıyla Gönderildi!</p>
                    <p className="text-sm text-emerald-600">Mesajınız alıcılara iletildi.</p>
                  </div>
                </div>
              )}

              {/* Alıcı Seçimi */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users size={15} className="inline mr-1.5 -mt-0.5" />
                  Alıcılar
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setSendTo('all')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      sendTo === 'all'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : isDark ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Users size={16} className="inline mr-1.5 -mt-0.5" />
                    Herkese Gönder ({activeEmployees.length} kişi)
                  </button>
                  <button
                    onClick={() => setSendTo('selected')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      sendTo === 'selected'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : isDark ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <User size={16} className="inline mr-1.5 -mt-0.5" />
                    Seçili Kişilere ({selectedEmployees.length})
                  </button>
                  {smsGroups.length > 0 && (
                    <button
                      onClick={() => setSendTo('group')}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                        sendTo === 'group'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : isDark ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Users size={16} className="inline mr-1.5 -mt-0.5" />
                      Gruba Gönder
                    </button>
                  )}
                </div>

                {/* Kişi Seçimi Paneli */}
                {sendTo === 'selected' && (
                  <div className={`rounded-xl border-2 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative flex-1">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          placeholder="Çalışan ara..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                        />
                      </div>
                      <button
                        onClick={selectAll}
                        className="px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {selectedEmployees.length === activeEmployees.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredEmployees.map(emp => {
                        const isSelected = selectedEmployees.find(e => e.id === emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => toggleEmployee(emp)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? isDark ? 'bg-emerald-900/40 border border-emerald-600' : 'bg-emerald-50 border border-emerald-300'
                                : isDark ? 'hover:bg-gray-600' : 'hover:bg-white'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-emerald-500 border-emerald-500' : isDark ? 'border-gray-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {emp.department} · {emp.position}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {filteredEmployees.length === 0 && (
                        <p className={`text-center text-sm py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Çalışan bulunamadı</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Grup Seçimi Paneli */}
                {sendTo === 'group' && (
                  <div className={`rounded-xl border-2 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} p-3`}>
                    <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Grup seçin:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {smsGroups.map(group => {
                        const memberCount = activeEmployees.filter(e => group.memberIds.includes(e.id)).length;
                        return (
                          <div
                            key={group.id}
                            onClick={() => selectGroupForSend(group)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                              selectedGroup === group.id
                                ? isDark ? 'bg-emerald-900/40 border border-emerald-600' : 'bg-emerald-50 border border-emerald-300'
                                : isDark ? 'hover:bg-gray-600' : 'hover:bg-white'
                            }`}
                          >
                            <span className="text-xl">{group.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{group.name}</p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{memberCount} kişi</p>
                            </div>
                            {selectedGroup === group.id && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Şablon Seçimi */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <FileText size={15} className="inline mr-1.5 -mt-0.5" />
                  Hazır Şablonlar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SMS_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className={`p-2.5 rounded-xl text-xs font-medium border-2 text-left transition-all hover:scale-[1.02] ${
                        selectedTemplate === t.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : isDark ? 'border-gray-600 text-gray-300 hover:border-emerald-500/50 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesaj Alanı */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Mail size={15} className="inline mr-1.5 -mt-0.5" />
                  Mesaj İçeriği
                </label>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setSelectedTemplate(null); }}
                  rows={4}
                  placeholder="SMS mesajınızı yazın veya yukarıdan bir şablon seçin..."
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {'{isim}, {tarih}, {saat}, {konu}, {mesaj}'} gibi değişkenler kullanabilirsiniz
                  </p>
                  <p className={`text-xs ${charCount > 160 ? 'text-amber-500 font-medium' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {charCount} karakter · {smsCount} SMS
                  </p>
                </div>
              </div>

              {/* Gönder Butonu */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  İptal
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || (sendTo === 'selected' && selectedEmployees.length === 0) || (sendTo === 'group' && !selectedGroup)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 
                           text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl 
                           transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send size={16} />
                  {sendTo === 'all' ? `Herkese Gönder (${activeEmployees.length})` : sendTo === 'group' ? `Gruba Gönder` : `Gönder (${selectedEmployees.length} kişi)`}
                </button>
              </div>
            </div>
          ) : activeView === 'history' ? (
            /* SMS Geçmişi */
            <div className="p-6">
              {smsHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Mail size={28} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  </div>
                  <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Henüz SMS gönderilmemiş</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gönderdiğiniz SMS'ler burada listelenecektir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smsHistory.map(sms => (
                    <div key={sms.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                            <Send size={14} className="text-white" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {sms.sendTo === 'all' ? 'Tüm Çalışanlar' : `${sms.recipients.length} Kişi`}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(sms.sentAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {sms.templateUsed && (
                          <span className={`px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                            {sms.templateUsed}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{sms.message}</p>
                      {sms.sendTo === 'selected' && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sms.recipients.slice(0, 5).map((r, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              {r.name}
                            </span>
                          ))}
                          {sms.recipients.length > 5 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              +{sms.recipients.length - 5} kişi
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Gruplar */
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users size={15} className="inline mr-1.5 -mt-0.5" />
                  SMS Grupları
                </h3>
                <button
                  onClick={() => setShowGroupForm(!showGroupForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {showGroupForm ? <X size={14} /> : <Plus size={14} />}
                  {showGroupForm ? 'İptal' : 'Yeni Grup'}
                </button>
              </div>

              {/* Grup Oluşturma Formu */}
              {showGroupForm && (
                <div className={`rounded-xl border-2 p-4 space-y-3 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Grup Adı</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="Grup adını girin..."
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Emoji Seç</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GROUP_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewGroupEmoji(emoji)}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                            newGroupEmoji === emoji
                              ? 'bg-emerald-500 ring-2 ring-emerald-400 scale-110'
                              : isDark ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-200 bg-white'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Üyeler ({newGroupMembers.length} seçildi)</label>
                    <div className="relative mb-2">
                      <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="Çalışan ara..."
                        value={groupSearchTerm}
                        onChange={e => setGroupSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {activeEmployees
                        .filter(emp => {
                          const term = groupSearchTerm.toLowerCase();
                          return !term || `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term) || emp.department?.toLowerCase().includes(term);
                        })
                        .map(emp => {
                          const isSelected = newGroupMembers.find(e => e.id === emp.id);
                          return (
                            <div
                              key={emp.id}
                              onClick={() => toggleGroupMember(emp)}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? isDark ? 'bg-emerald-900/40 border border-emerald-600' : 'bg-emerald-50 border border-emerald-300'
                                  : isDark ? 'hover:bg-gray-600' : 'hover:bg-white'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : isDark ? 'border-gray-500' : 'border-gray-300'}`}>
                                {isSelected && <CheckCircle2 size={10} className="text-white" />}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{emp.firstName} {emp.lastName}</span>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>· {emp.department}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <button
                    onClick={createGroup}
                    disabled={!newGroupName.trim() || newGroupMembers.length === 0}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Grup Oluştur
                  </button>
                </div>
              )}

              {/* Grup Listesi */}
              {smsGroups.length === 0 && !showGroupForm ? (
                <div className="text-center py-8">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Users size={24} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  </div>
                  <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Henüz grup oluşturulmamış</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gruplar oluşturarak toplu SMS gönderimini kolaylaştırın</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {smsGroups.map(group => {
                    const memberCount = activeEmployees.filter(e => group.memberIds.includes(e.id)).length;
                    return (
                      <div key={group.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-2xl">{group.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{group.name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{memberCount} üye · {new Date(group.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <button
                          onClick={() => { selectGroupForSend(group); setActiveView('compose'); }}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Bu gruba SMS gönder"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Grubu sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
