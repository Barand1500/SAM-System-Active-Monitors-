// RBAC System - Role-Based Access Control
// Rol tabanlı erişim kontrol sistemi

export const PERMISSIONS = {
  // Görev İzinleri
  TASK_VIEW_ALL: 'task_view_all',
  TASK_VIEW_OWN: 'task_view_own',
  TASK_VIEW_TEAM: 'task_view_team',
  TASK_CREATE: 'task_create',
  TASK_EDIT_ALL: 'task_edit_all',
  TASK_EDIT_OWN: 'task_edit_own',
  TASK_DELETE_ALL: 'task_delete_all',
  TASK_DELETE_OWN: 'task_delete_own',
  TASK_ASSIGN: 'task_assign',
  
  // Çalışan İzinleri
  EMPLOYEE_VIEW_ALL: 'employee_view_all',
  EMPLOYEE_VIEW_TEAM: 'employee_view_team',
  EMPLOYEE_CREATE: 'employee_create',
  EMPLOYEE_EDIT_ALL: 'employee_edit_all',
  EMPLOYEE_EDIT_OWN: 'employee_edit_own',
  EMPLOYEE_DELETE: 'employee_delete',
  EMPLOYEE_MANAGE_ROLES: 'employee_manage_roles',
  
  // Departman İzinleri
  DEPARTMENT_VIEW: 'department_view',
  DEPARTMENT_CREATE: 'department_create',
  DEPARTMENT_EDIT: 'department_edit',
  DEPARTMENT_DELETE: 'department_delete',
  DEPARTMENT_MANAGE: 'department_manage',
  
  // İzin İzinleri
  LEAVE_VIEW_ALL: 'leave_view_all',
  LEAVE_VIEW_OWN: 'leave_view_own',
  LEAVE_VIEW_TEAM: 'leave_view_team',
  LEAVE_APPROVE: 'leave_approve',
  LEAVE_REJECT: 'leave_reject',
  LEAVE_CREATE: 'leave_create',
  
  // Rapor İzinleri
  REPORT_VIEW_BASIC: 'report_view_basic',
  REPORT_VIEW_ADVANCED: 'report_view_advanced',
  REPORT_VIEW_FINANCIAL: 'report_view_financial',
  REPORT_EXPORT: 'report_export',
  
  // Şirket İzinleri
  COMPANY_VIEW_INFO: 'company_view_info',
  COMPANY_EDIT_INFO: 'company_edit_info',
  COMPANY_SETTINGS: 'company_settings',
  
  // Sistem İzinleri
  SYSTEM_ADMIN: 'system_admin',
  SYSTEM_LOGS: 'system_logs',
  SYSTEM_BACKUP: 'system_backup',
  
  // Duyuru İzinleri
  ANNOUNCEMENT_VIEW: 'announcement_view',
  ANNOUNCEMENT_CREATE: 'announcement_create',
  ANNOUNCEMENT_EDIT_ALL: 'announcement_edit_all',
  ANNOUNCEMENT_DELETE: 'announcement_delete',
  
  // Destek İzinleri
  SUPPORT_VIEW_ALL: 'support_view_all',
  SUPPORT_VIEW_OWN: 'support_view_own',
  SUPPORT_VIEW_TEAM: 'support_view_team',
  SUPPORT_CREATE: 'support_create',
  SUPPORT_RESPOND: 'support_respond',
  SUPPORT_CLOSE: 'support_close',
  
  // CRM İzinleri
  CRM_VIEW: 'crm_view',
  CRM_CREATE: 'crm_create',
  CRM_EDIT: 'crm_edit',
  CRM_DELETE: 'crm_delete',
  
  // Dosya İzinleri
  FILE_VIEW_ALL: 'file_view_all',
  FILE_VIEW_OWN: 'file_view_own',
  FILE_VIEW_TEAM: 'file_view_team',
  FILE_UPLOAD: 'file_upload',
  FILE_DELETE_ALL: 'file_delete_all',
  FILE_DELETE_OWN: 'file_delete_own',
};

// Varsayılan Roller ve İzinleri
export const DEFAULT_ROLES = {
  boss: {
    id: 'boss',
    label: 'Patron',
    color: '#dc2626',
    permissions: Object.values(PERMISSIONS), // Tüm izinler
    protected: true,
    description: 'Sistem yöneticisi - Tam yetki',
  },
  
  manager: {
    id: 'manager',
    label: 'Yönetici',
    color: '#ea580c',
    permissions: [
      PERMISSIONS.TASK_VIEW_ALL,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT_ALL,
      PERMISSIONS.TASK_DELETE_ALL,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.EMPLOYEE_VIEW_ALL,
      PERMISSIONS.EMPLOYEE_VIEW_TEAM,
      PERMISSIONS.EMPLOYEE_EDIT_ALL,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.DEPARTMENT_MANAGE,
      PERMISSIONS.LEAVE_VIEW_ALL,
      PERMISSIONS.LEAVE_APPROVE,
      PERMISSIONS.LEAVE_REJECT,
      PERMISSIONS.REPORT_VIEW_ADVANCED,
      PERMISSIONS.REPORT_EXPORT,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.ANNOUNCEMENT_CREATE,
      PERMISSIONS.ANNOUNCEMENT_EDIT_ALL,
      PERMISSIONS.ANNOUNCEMENT_DELETE,
      PERMISSIONS.SUPPORT_VIEW_ALL,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.SUPPORT_CLOSE,
      PERMISSIONS.FILE_VIEW_ALL,
      PERMISSIONS.FILE_UPLOAD,
      PERMISSIONS.FILE_DELETE_ALL,
    ],
    protected: true,
    description: 'Departman yöneticisi - Geniş yetkiler',
  },
  
  hr: {
    id: 'hr',
    label: 'İnsan Kaynakları',
    color: '#0891b2',
    permissions: [
      PERMISSIONS.TASK_VIEW_ALL,
      PERMISSIONS.EMPLOYEE_VIEW_ALL,
      PERMISSIONS.EMPLOYEE_CREATE,
      PERMISSIONS.EMPLOYEE_EDIT_ALL,
      PERMISSIONS.EMPLOYEE_DELETE,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.LEAVE_VIEW_ALL,
      PERMISSIONS.LEAVE_APPROVE,
      PERMISSIONS.LEAVE_REJECT,
      PERMISSIONS.REPORT_VIEW_BASIC,
      PERMISSIONS.REPORT_EXPORT,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.ANNOUNCEMENT_CREATE,
      PERMISSIONS.SUPPORT_VIEW_ALL,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.FILE_VIEW_ALL,
      PERMISSIONS.FILE_UPLOAD,
    ],
    protected: false,
    description: 'İzin ve personel yönetimi',
  },
  
  accountant: {
    id: 'accountant',
    label: 'Muhasebe',
    color: '#16a34a',
    permissions: [
      PERMISSIONS.TASK_VIEW_OWN,
      PERMISSIONS.EMPLOYEE_VIEW_ALL,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.LEAVE_VIEW_OWN,
      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.REPORT_VIEW_FINANCIAL,
      PERMISSIONS.REPORT_VIEW_ADVANCED,
      PERMISSIONS.REPORT_EXPORT,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.SUPPORT_VIEW_OWN,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.FILE_VIEW_ALL,
      PERMISSIONS.FILE_UPLOAD,
    ],
    protected: false,
    description: 'Finansal raporlar ve muhasebe',
  },
  
  project_manager: {
    id: 'project_manager',
    label: 'Proje Yöneticisi',
    color: '#7c3aed',
    permissions: [
      PERMISSIONS.TASK_VIEW_ALL,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT_ALL,
      PERMISSIONS.TASK_DELETE_OWN,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.EMPLOYEE_VIEW_TEAM,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.LEAVE_VIEW_TEAM,
      PERMISSIONS.REPORT_VIEW_ADVANCED,
      PERMISSIONS.REPORT_EXPORT,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.ANNOUNCEMENT_CREATE,
      PERMISSIONS.SUPPORT_VIEW_TEAM,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.FILE_VIEW_TEAM,
      PERMISSIONS.FILE_UPLOAD,
      PERMISSIONS.FILE_DELETE_OWN,
    ],
    protected: false,
    description: 'Proje ve görev yönetimi',
  },
  
  team_lead: {
    id: 'team_lead',
    label: 'Ekip Lideri',
    color: '#2563eb',
    permissions: [
      PERMISSIONS.TASK_VIEW_TEAM,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT_OWN,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.EMPLOYEE_VIEW_TEAM,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.LEAVE_VIEW_TEAM,
      PERMISSIONS.REPORT_VIEW_BASIC,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.SUPPORT_VIEW_TEAM,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.FILE_VIEW_TEAM,
      PERMISSIONS.FILE_UPLOAD,
    ],
    protected: false,
    description: 'Takım görev yönetimi',
  },
  
  employee: {
    id: 'employee',
    label: 'Çalışan',
    color: '#64748b',
    permissions: [
      PERMISSIONS.TASK_VIEW_OWN,
      PERMISSIONS.TASK_EDIT_OWN,
      PERMISSIONS.EMPLOYEE_VIEW_OWN,
      PERMISSIONS.EMPLOYEE_EDIT_OWN,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.LEAVE_VIEW_OWN,
      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.COMPANY_VIEW_INFO,
      PERMISSIONS.ANNOUNCEMENT_VIEW,
      PERMISSIONS.SUPPORT_VIEW_OWN,
      PERMISSIONS.SUPPORT_CREATE,
      PERMISSIONS.FILE_VIEW_OWN,
      PERMISSIONS.FILE_UPLOAD,
      PERMISSIONS.FILE_DELETE_OWN,
    ],
    protected: true,
    description: 'Temel çalışan yetkileri',
  },
};

// İzin kontrol fonksiyonu
export const hasPermission = (userRole, permission) => {
  const role = DEFAULT_ROLES[userRole];
  if (!role) return false;
  
  // Boss her şeyi yapabilir
  if (userRole === 'boss') return true;
  
  return role.permissions.includes(permission);
};

// Çoklu izin kontrolü
export const hasAnyPermission = (userRole, permissions = []) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Tüm izinlere sahip mi
export const hasAllPermissions = (userRole, permissions = []) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// İzin grup kontrolü
export const canManageTasks = (userRole) => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT_ALL,
    PERMISSIONS.TASK_DELETE_ALL,
    PERMISSIONS.TASK_ASSIGN,
  ]);
};

export const canManageEmployees = (userRole) => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT_ALL,
    PERMISSIONS.EMPLOYEE_DELETE,
  ]);
};

export const canManageLeaves = (userRole) => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.LEAVE_REJECT,
  ]);
};

export const canViewReports = (userRole) => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.REPORT_VIEW_BASIC,
    PERMISSIONS.REPORT_VIEW_ADVANCED,
    PERMISSIONS.REPORT_VIEW_FINANCIAL,
  ]);
};

export const canManageCompany = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.COMPANY_SETTINGS);
};

export const canManageSystem = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.SYSTEM_ADMIN);
};

// İzin tanımları (UI için)
export const PERMISSION_LABELS = {
  [PERMISSIONS.TASK_VIEW_ALL]: 'Tüm görevleri görüntüleme',
  [PERMISSIONS.TASK_VIEW_OWN]: 'Kendi görevlerini görüntüleme',
  [PERMISSIONS.TASK_VIEW_TEAM]: 'Takım görevlerini görüntüleme',
  [PERMISSIONS.TASK_CREATE]: 'Görev oluşturma',
  [PERMISSIONS.TASK_EDIT_ALL]: 'Tüm görevleri düzenleme',
  [PERMISSIONS.TASK_EDIT_OWN]: 'Kendi görevlerini düzenleme',
  [PERMISSIONS.TASK_DELETE_ALL]: 'Tüm görevleri silme',
  [PERMISSIONS.TASK_DELETE_OWN]: 'Kendi görevlerini silme',
  [PERMISSIONS.TASK_ASSIGN]: 'Görev atama',
  
  [PERMISSIONS.EMPLOYEE_VIEW_ALL]: 'Tüm çalışanları görüntüleme',
  [PERMISSIONS.EMPLOYEE_VIEW_TEAM]: 'Takım çalışanlarını görüntüleme',
  [PERMISSIONS.EMPLOYEE_CREATE]: 'Çalışan ekleme',
  [PERMISSIONS.EMPLOYEE_EDIT_ALL]: 'Tüm çalışanları düzenleme',
  [PERMISSIONS.EMPLOYEE_EDIT_OWN]: 'Kendi profilini düzenleme',
  [PERMISSIONS.EMPLOYEE_DELETE]: 'Çalışan silme',
  [PERMISSIONS.EMPLOYEE_MANAGE_ROLES]: 'Rol yönetimi',
  
  [PERMISSIONS.DEPARTMENT_VIEW]: 'Departmanları görüntüleme',
  [PERMISSIONS.DEPARTMENT_CREATE]: 'Departman oluşturma',
  [PERMISSIONS.DEPARTMENT_EDIT]: 'Departman düzenleme',
  [PERMISSIONS.DEPARTMENT_DELETE]: 'Departman silme',
  [PERMISSIONS.DEPARTMENT_MANAGE]: 'Departman yönetimi',
  
  [PERMISSIONS.LEAVE_VIEW_ALL]: 'Tüm izinleri görüntüleme',
  [PERMISSIONS.LEAVE_VIEW_OWN]: 'Kendi izinlerini görüntüleme',
  [PERMISSIONS.LEAVE_VIEW_TEAM]: 'Takım izinlerini görüntüleme',
  [PERMISSIONS.LEAVE_APPROVE]: 'İzin onaylama',
  [PERMISSIONS.LEAVE_REJECT]: 'İzin reddetme',
  [PERMISSIONS.LEAVE_CREATE]: 'İzin talebi oluşturma',
  
  [PERMISSIONS.REPORT_VIEW_BASIC]: 'Temel raporlar',
  [PERMISSIONS.REPORT_VIEW_ADVANCED]: 'Gelişmiş raporlar',
  [PERMISSIONS.REPORT_VIEW_FINANCIAL]: 'Finansal raporlar',
  [PERMISSIONS.REPORT_EXPORT]: 'Rapor dışa aktarma',
  
  [PERMISSIONS.COMPANY_VIEW_INFO]: 'Şirket bilgilerini görüntüleme',
  [PERMISSIONS.COMPANY_EDIT_INFO]: 'Şirket bilgilerini düzenleme',
  [PERMISSIONS.COMPANY_SETTINGS]: 'Şirket ayarları',
  
  [PERMISSIONS.SYSTEM_ADMIN]: 'Sistem yönetimi',
  [PERMISSIONS.SYSTEM_LOGS]: 'Sistem günlükleri',
  [PERMISSIONS.SYSTEM_BACKUP]: 'Yedekleme işlemleri',
  
  [PERMISSIONS.ANNOUNCEMENT_VIEW]: 'Duyuruları görüntüleme',
  [PERMISSIONS.ANNOUNCEMENT_CREATE]: 'Duyuru oluşturma',
  [PERMISSIONS.ANNOUNCEMENT_EDIT_ALL]: 'Duyuru düzenleme',
  [PERMISSIONS.ANNOUNCEMENT_DELETE]: 'Duyuru silme',
  
  [PERMISSIONS.SUPPORT_VIEW_ALL]: 'Tüm destek taleplerini görüntüleme',
  [PERMISSIONS.SUPPORT_VIEW_OWN]: 'Kendi taleplerini görüntüleme',
  [PERMISSIONS.SUPPORT_VIEW_TEAM]: 'Takım taleplerini görüntüleme',
  [PERMISSIONS.SUPPORT_CREATE]: 'Destek talebi oluşturma',
  [PERMISSIONS.SUPPORT_RESPOND]: 'Taleplere yanıt verme',
  [PERMISSIONS.SUPPORT_CLOSE]: 'Talep kapatma',
  
  [PERMISSIONS.CRM_VIEW]: 'Müşterileri görüntüleme',
  [PERMISSIONS.CRM_CREATE]: 'Müşteri ekleme',
  [PERMISSIONS.CRM_EDIT]: 'Müşteri düzenleme',
  [PERMISSIONS.CRM_DELETE]: 'Müşteri silme',
  
  [PERMISSIONS.FILE_VIEW_ALL]: 'Tüm dosyaları görüntüleme',
  [PERMISSIONS.FILE_VIEW_OWN]: 'Kendi dosyalarını görüntüleme',
  [PERMISSIONS.FILE_VIEW_TEAM]: 'Takım dosyalarını görüntüleme',
  [PERMISSIONS.FILE_UPLOAD]: 'Dosya yükleme',
  [PERMISSIONS.FILE_DELETE_ALL]: 'Tüm dosyaları silme',
  [PERMISSIONS.FILE_DELETE_OWN]: 'Kendi dosyalarını silme',
};

export default {
  PERMISSIONS,
  DEFAULT_ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageTasks,
  canManageEmployees,
  canManageLeaves,
  canViewReports,
  canManageCompany,
  canManageSystem,
  PERMISSION_LABELS,
};
