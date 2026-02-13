import { createContext, useContext, useState, useCallback } from 'react';

// Türkçe çeviriler
const tr = {
  // Genel
  app_name: 'Görev Takip',
  loading: 'Yükleniyor...',
  save: 'Kaydet',
  cancel: 'İptal',
  delete: 'Sil',
  edit: 'Düzenle',
  add: 'Ekle',
  search: 'Ara',
  filter: 'Filtrele',
  all: 'Tümü',
  close: 'Kapat',
  confirm: 'Onayla',
  back: 'Geri',
  next: 'İleri',
  yes: 'Evet',
  no: 'Hayır',
  
  // Auth
  login: 'Giriş Yap',
  logout: 'Çıkış Yap',
  register: 'Kayıt Ol',
  email: 'E-posta',
  password: 'Şifre',
  confirm_password: 'Şifre Tekrar',
  first_name: 'Ad',
  last_name: 'Soyad',
  company_code: 'Şirket Kodu',
  company_name: 'Şirket Adı',
  position: 'Pozisyon',
  department: 'Departman',
  forgot_password: 'Şifremi Unuttum',
  new_company: 'Yeni Şirket Oluştur',
  join_company: 'Mevcut Şirkete Katıl',
  
  // Dashboard
  overview: 'Genel Bakış',
  tasks: 'Görevler',
  my_tasks: 'Görevlerim',
  all_tasks: 'Tüm Görevler',
  kanban: 'Kanban',
  calendar: 'Takvim',
  time_tracker: 'Mesai',
  reports: 'Raporlar',
  employees: 'Çalışanlar',
  leaves: 'İzinler',
  announcements: 'Duyurular',
  settings: 'Ayarlar',
  
  // Görevler
  task_title: 'Görev Başlığı',
  task_description: 'Görev Açıklaması',
  task_status: 'Durum',
  task_priority: 'Öncelik',
  due_date: 'Bitiş Tarihi',
  assignee: 'Atanan Kişi',
  created_at: 'Oluşturulma',
  new_task: 'Yeni Görev',
  add_task: 'Görev Ekle',
  edit_task: 'Görevi Düzenle',
  delete_task: 'Görevi Sil',
  complete_task: 'Tamamla',
  
  // Durum
  status_pending: 'Bekliyor',
  status_in_progress: 'Devam Ediyor',
  status_review: 'İncelemede',
  status_completed: 'Tamamlandı',
  
  // Öncelik
  priority_low: 'Düşük',
  priority_medium: 'Orta',
  priority_high: 'Yüksek',
  priority_urgent: 'Acil',
  
  // Mesai
  clock_in: 'Mesai Başlat',
  clock_out: 'Mesai Bitir',
  break_start: 'Molaya Çık',
  break_end: 'Moladan Dön',
  working: 'Çalışıyor',
  on_break: 'Molada',
  total_hours: 'Toplam Saat',
  weekly_report: 'Haftalık Rapor',
  
  // İzinler
  leave_request: 'İzin Talebi',
  leave_type: 'İzin Türü',
  start_date: 'Başlangıç',
  end_date: 'Bitiş',
  leave_reason: 'Sebep',
  leave_annual: 'Yıllık İzin',
  leave_sick: 'Hastalık İzni',
  leave_personal: 'Mazeret İzni',
  leave_maternity: 'Doğum İzni',
  leave_approved: 'Onaylandı',
  leave_pending: 'Bekliyor',
  leave_rejected: 'Reddedildi',
  
  // Bildirimler
  notifications: 'Bildirimler',
  mark_all_read: 'Tümünü Okundu İşaretle',
  no_notifications: 'Bildirim yok',
  push_notifications: 'Push Bildirimleri',
  enable_notifications: 'Bildirimleri Aç',
  
  // Raporlar
  daily_report: 'Günlük Rapor',
  weekly_report: 'Haftalık Rapor',
  monthly_report: 'Aylık Rapor',
  task_statistics: 'Görev İstatistikleri',
  employee_performance: 'Çalışan Performansı',
  department_stats: 'Departman İstatistikleri',
  
  // Tema
  dark_mode: 'Koyu Mod',
  light_mode: 'Açık Mod',
  
  // Mesajlar
  success_saved: 'Başarıyla kaydedildi',
  success_deleted: 'Başarıyla silindi',
  success_updated: 'Başarıyla güncellendi',
  error_generic: 'Bir hata oluştu',
  error_required: 'Bu alan zorunludur',
  error_invalid_email: 'Geçersiz e-posta adresi',
  confirm_delete: 'Silmek istediğinize emin misiniz?',
  
  // Aktivite
  activity_log: 'Aktivite Logu',
  recent_activity: 'Son Aktiviteler',
  
  // Dosya
  file_upload: 'Dosya Yükle',
  drag_drop_files: 'Dosyaları sürükleyin veya tıklayın',
  max_file_size: 'Maksimum dosya boyutu',
  uploaded_files: 'Yüklenen Dosyalar',
  
  // Proje
  projects: 'Projeler',
  new_project: 'Yeni Proje',
  project_name: 'Proje Adı',
  project_description: 'Proje Açıklaması',
  project_members: 'Proje Üyeleri',
  project_progress: 'İlerleme',
  
  // Etiketler
  tags: 'Etiketler',
  add_tag: 'Etiket Ekle',
  
  // Zaman
  today: 'Bugün',
  yesterday: 'Dün',
  this_week: 'Bu Hafta',
  this_month: 'Bu Ay',
  minutes_ago: 'dakika önce',
  hours_ago: 'saat önce',
  days_ago: 'gün önce',
};

// İngilizce çeviriler
const en = {
  // General
  app_name: 'Task Tracker',
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  all: 'All',
  close: 'Close',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  yes: 'Yes',
  no: 'No',
  
  // Auth
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  confirm_password: 'Confirm Password',
  first_name: 'First Name',
  last_name: 'Last Name',
  company_code: 'Company Code',
  company_name: 'Company Name',
  position: 'Position',
  department: 'Department',
  forgot_password: 'Forgot Password',
  new_company: 'Create New Company',
  join_company: 'Join Existing Company',
  
  // Dashboard
  overview: 'Overview',
  tasks: 'Tasks',
  my_tasks: 'My Tasks',
  all_tasks: 'All Tasks',
  kanban: 'Kanban',
  calendar: 'Calendar',
  time_tracker: 'Time Tracker',
  reports: 'Reports',
  employees: 'Employees',
  leaves: 'Leaves',
  announcements: 'Announcements',
  settings: 'Settings',
  
  // Tasks
  task_title: 'Task Title',
  task_description: 'Task Description',
  task_status: 'Status',
  task_priority: 'Priority',
  due_date: 'Due Date',
  assignee: 'Assignee',
  created_at: 'Created At',
  new_task: 'New Task',
  add_task: 'Add Task',
  edit_task: 'Edit Task',
  delete_task: 'Delete Task',
  complete_task: 'Complete',
  
  // Status
  status_pending: 'Pending',
  status_in_progress: 'In Progress',
  status_review: 'In Review',
  status_completed: 'Completed',
  
  // Priority
  priority_low: 'Low',
  priority_medium: 'Medium',
  priority_high: 'High',
  priority_urgent: 'Urgent',
  
  // Time Tracker
  clock_in: 'Clock In',
  clock_out: 'Clock Out',
  break_start: 'Start Break',
  break_end: 'End Break',
  working: 'Working',
  on_break: 'On Break',
  total_hours: 'Total Hours',
  weekly_report: 'Weekly Report',
  
  // Leaves
  leave_request: 'Leave Request',
  leave_type: 'Leave Type',
  start_date: 'Start Date',
  end_date: 'End Date',
  leave_reason: 'Reason',
  leave_annual: 'Annual Leave',
  leave_sick: 'Sick Leave',
  leave_personal: 'Personal Leave',
  leave_maternity: 'Maternity Leave',
  leave_approved: 'Approved',
  leave_pending: 'Pending',
  leave_rejected: 'Rejected',
  
  // Notifications
  notifications: 'Notifications',
  mark_all_read: 'Mark All Read',
  no_notifications: 'No notifications',
  push_notifications: 'Push Notifications',
  enable_notifications: 'Enable Notifications',
  
  // Reports
  daily_report: 'Daily Report',
  weekly_report: 'Weekly Report',
  monthly_report: 'Monthly Report',
  task_statistics: 'Task Statistics',
  employee_performance: 'Employee Performance',
  department_stats: 'Department Statistics',
  
  // Theme
  dark_mode: 'Dark Mode',
  light_mode: 'Light Mode',
  
  // Messages
  success_saved: 'Successfully saved',
  success_deleted: 'Successfully deleted',
  success_updated: 'Successfully updated',
  error_generic: 'An error occurred',
  error_required: 'This field is required',
  error_invalid_email: 'Invalid email address',
  confirm_delete: 'Are you sure you want to delete?',
  
  // Activity
  activity_log: 'Activity Log',
  recent_activity: 'Recent Activity',
  
  // Files
  file_upload: 'File Upload',
  drag_drop_files: 'Drag and drop files or click',
  max_file_size: 'Maximum file size',
  uploaded_files: 'Uploaded Files',
  
  // Projects
  projects: 'Projects',
  new_project: 'New Project',
  project_name: 'Project Name',
  project_description: 'Project Description',
  project_members: 'Project Members',
  project_progress: 'Progress',
  
  // Tags
  tags: 'Tags',
  add_tag: 'Add Tag',
  
  // Time
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  this_month: 'This Month',
  minutes_ago: 'minutes ago',
  hours_ago: 'hours ago',
  days_ago: 'days ago',
};

const translations = { tr, en };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'tr';
  });

  // Dil değiştir
  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, []);

  // Çeviri al
  const t = useCallback((key, params = {}) => {
    let text = translations[language][key] || translations['tr'][key] || key;
    
    // Parametre değiştirme {param}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }, [language]);

  // Dil listesi
  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const value = {
    language,
    changeLanguage,
    t,
    languages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
