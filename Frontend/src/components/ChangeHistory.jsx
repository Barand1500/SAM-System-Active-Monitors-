import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditLogAPI } from '../services/api';
import { History, User, Calendar, Search, Filter, Download, Trash2, Clock, Edit, Plus, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TYPE_LABELS = {
  profile: 'Profil',
  department: 'Departman',
  role: 'Rol',
  status: 'Durum',
  priority: 'Öncelik',
  task: 'Görev',
  tasklist: 'Görev Listesi',
  taskcomment: 'Görev Yorumu',
  tasklog: 'Görev Logu',
  taskpriority: 'Görev Önceliği',
  taskstatus: 'Görev Durumu',
  company: 'Şirket',
  survey: 'Anket',
  contact: 'Kişi',
  tag: 'Etiket',
  setting: 'Ayar',
  dashboard: 'Panel',
  automation: 'Otomasyon',
  automationrule: 'Otomasyon Kuralı',
  notification: 'Bildirim',
  personalnote: 'Kişisel Not',
  recurringtask: 'Tekrarlayan Görev',
  file: 'Dosya',
  report: 'Rapor',
  sms: 'SMS',
  ticket: 'Destek Talebi',
  customer: 'Müşteri',
  project: 'Proje',
  workspace: 'Çalışma Alanı',
  user: 'Kullanıcı',
  attendance: 'Mesai',
  leave: 'İzin',
  auth: 'Kimlik Doğrulama',
  system: 'Sistem'
};

const CORE_FILTER_TYPES = ['task', 'leave', 'survey', 'ticket', 'department', 'attendance'];

const HIDDEN_AUDIT_KEYS = new Set([
  'companyId', 'company_id',
  'createdAt', 'created_at',
  'updatedAt', 'updated_at',
  'deletedAt', 'deleted_at',
  'ipAddress', 'ip_address',
  '__v'
]);

const ChangeHistory = ({ isDark }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterUser, history]);

  const normalizeType = (type) => {
    const rawType = String(type || '').toLowerCase();
    if (!rawType) return '';

    const base = rawType.split('_')[0].replace(/-/g, '');

    if (['task', 'tasklist', 'taskcomment', 'tasklog', 'taskpriority', 'taskstatus', 'recurringtask'].includes(base)) {
      return 'task';
    }

    if (['ticket', 'supportticket'].includes(base)) return 'ticket';
    if (['leave'].includes(base)) return 'leave';
    if (['survey', 'surveyquestion', 'surveyresponse'].includes(base)) return 'survey';
    if (['department'].includes(base)) return 'department';
    if (['attendance'].includes(base)) return 'attendance';

    if (TYPE_LABELS[base]) return base;
    return base || rawType;
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await auditLogAPI.list({ limit: 500 });
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data.map(item => ({
        ...item,
        timestamp: item.created_at || item.createdAt || item.timestamp
      })) : []);
    } catch (err) {
      console.error('Geçmiş yüklenemedi:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tip filtresi
    if (filterType !== 'all') {
      filtered = filtered.filter(item => normalizeType(item.type) === filterType);
    }

    // Kullanıcı filtresi
    if (filterUser !== 'all') {
      filtered = filtered.filter(item => String(item.userId) === String(filterUser));
    }

    setFilteredHistory(filtered);
  };

  const clearHistory = async () => {
    if (confirm('Tüm geçmişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await auditLogAPI.clear();
        setHistory([]);
        setFilteredHistory([]);
      } catch (err) {
        console.error('Geçmiş temizlenemedi:', err);
      }
    }
  };

  const exportHistory = () => {
    const csv = [
      ['Tarih', 'Kullanıcı', 'İşlem', 'Açıklama', 'Eski Değer', 'Yeni Değer'],
      ...filteredHistory.map(item => [
        format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        item.userName,
        getActionLabel(item.action),
        item.description,
        formatAuditValue(item.oldValue),
        formatAuditValue(item.newValue)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `degisiklik_gecmisi_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  const getActionIcon = (action) => {
    const normalized = String(action || '').toLowerCase();
    switch (normalized) {
      case 'create': return <Plus size={14} className="text-emerald-500" />;
      case 'update': return <Edit size={14} className="text-blue-500" />;
      case 'delete': return <Trash2 size={14} className="text-red-500" />;
      default: return <History size={14} className="text-slate-500" />;
    }
  };

  const getActionLabel = (action) => {
    const normalized = String(action || '').toLowerCase();
    switch (normalized) {
      case 'create': return 'Oluşturma';
      case 'update': return 'Güncelleme';
      case 'delete': return 'Silme';
      default: return 'İşlem';
    }
  };

  const getCriticalCategory = (item) => {
    const type = normalizeType(item?.type);
    const text = `${item?.description || ''} ${item?.entity || ''} ${item?.type || ''}`.toLowerCase();

    if (
      text.includes('auth') ||
      text.includes('login') ||
      text.includes('giriş') ||
      text.includes('şifre') ||
      text.includes('password') ||
      text.includes('token') ||
      text.includes('oturum')
    ) {
      return 'Güvenlik';
    }

    if (
      type === 'role' ||
      text.includes('yetki') ||
      text.includes('permission') ||
      text.includes('authorize') ||
      text.includes('rol')
    ) {
      return 'Yetki';
    }

    const contentTypes = new Set([
      'task', 'tasklist', 'taskcomment', 'tasklog', 'taskpriority', 'taskstatus',
      'survey', 'announcement', 'project', 'customer', 'ticket', 'file',
      'personalnote', 'contact', 'tag', 'dashboard', 'setting', 'report',
      'notification', 'recurringtask', 'sms', 'leave', 'attendance', 'department'
    ]);
    if (contentTypes.has(type)) {
      return 'İçerik';
    }

    return 'Sistem';
  };

  const getCategoryBadgeClasses = (category) => {
    if (category === 'Güvenlik') {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300';
    }
    if (category === 'Yetki') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    }
    if (category === 'İçerik') {
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300';
    }
    return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
  };

  const getTypeLabel = (type) => {
    const normalized = normalizeType(type);
    if (TYPE_LABELS[normalized]) return TYPE_LABELS[normalized];

    if (!normalized) return 'Diğer';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getFieldLabel = (fieldKey) => {
    const labels = {
      id: 'ID',
      Id: 'ID',
      answers: 'Yanıtlar',
      answer: 'Yanıt',
      title: 'Başlık',
      name: 'Ad',
      Name: 'Ad',
      description: 'Açıklama',
      Description: 'Açıklama',
      content: 'İçerik',
      subject: 'Konu',
      note: 'Not',
      email: 'E-posta',
      phone: 'Telefon',
      mobile: 'Cep Telefonu',
      address: 'Adres',
      city: 'Şehir',
      country: 'Ülke',
      role: 'Rol',
      firstName: 'Ad',
      lastName: 'Soyad',
      fullName: 'Ad Soyad',
      userName: 'Kullanıcı',
      status: 'Durum',
      isActive: 'Aktif Mi',
      isRead: 'Okundu Mu',
      isDefault: 'Varsayılan Mı',
      IsDefault: 'Varsayılan Mı',
      color: 'Renk',
      orderNo: 'Sıra',
      dueDate: 'Son Teslim Tarihi',
      DueDate: 'Son Teslim Tarihi',
      startDate: 'Başlangıç Tarihi',
      StartDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      EndDate: 'Bitiş Tarihi',
      createdAt: 'Oluşturulma Tarihi',
      updatedAt: 'Güncellenme Tarihi',
      CreatedAt: 'Oluşturulma Tarihi',
      UpdatedAt: 'Güncellenme Tarihi',
      estimatedHours: 'Tahmini Süre (Saat)',
      actualHours: 'Harcanan Süre (Saat)',
      progressPercent: 'İlerleme (%)',
      statusId: 'Durum',
      priorityId: 'Öncelik',
      roleId: 'Rol',
      userId: 'Kullanıcı',
      creatorId: 'Oluşturan',
      companyId: 'Şirket',
      workspaceId: 'Çalışma Alanı',
      projectId: 'Proje',
      departmentId: 'Departman',
      taskListId: 'Görev Listesi',
      type: 'Tür',
      activeLayoutId: 'Aktif Düzen',
      activeLayoutName: 'Aktif Düzen Adı',
      layoutCount: 'Düzen Sayısı',
      taskTemplateCount: 'Görev Şablonu Sayısı',
      widgetSizeGroups: 'Widget Boyut Grubu',
      widgetOrderGroups: 'Widget Sıralama Grubu',
      'Dashboard layouts': 'Panel Düzenleri',
      'Active layout': 'Aktif Düzen',
      'Task templates': 'Görev Şablonları',
      'Dashboard widget sizes': 'Panel Widget Boyutları',
      'Dashboard widget order': 'Panel Widget Sıralaması',
      Company: 'Şirket',
      'Company id': 'Şirket',
      'User id': 'Kullanıcı',
      Status: 'Durum'
    };

    if (/^\d+$/.test(String(fieldKey || ''))) {
      return `Soru ${fieldKey}`;
    }

    if (labels[fieldKey]) return labels[fieldKey];

    if (String(fieldKey || '').endsWith('Id') && String(fieldKey || '').length > 2) {
      const withoutId = String(fieldKey).slice(0, -2);
      return getFieldLabel(withoutId);
    }

    if (String(fieldKey || '').endsWith('_id') && String(fieldKey || '').length > 3) {
      const withoutId = String(fieldKey).slice(0, -3);
      return getFieldLabel(withoutId);
    }

    // CamelCase/snake_case anahtarları daha okunur hale getir
    const normalized = String(fieldKey || '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();

    if (!normalized) return String(fieldKey || '');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const formatEnumValue = (value) => {
    const map = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      canceled: 'İptal Edildi',
      cancelled: 'İptal Edildi',
      active: 'Aktif',
      inactive: 'Pasif',
      open: 'Açık',
      closed: 'Kapalı',
      done: 'Tamamlandı',
      completed: 'Tamamlandı',
      in_progress: 'Devam Ediyor',
      inprogress: 'Devam Ediyor',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük',
      urgent: 'Acil',
      yes: 'Evet',
      no: 'Hayır',
      true: 'Evet',
      false: 'Hayır',
      boss: 'Patron',
      manager: 'Yönetici',
      employee: 'Çalışan',
      task: 'Görev',
      leave: 'İzin',
      ticket: 'Destek Talebi',
      announcement: 'Duyuru',
      project: 'Proje',
      department: 'Departman'
    };

    const normalized = String(value).toLowerCase();
    return map[normalized] || null;
  };

  const formatFieldValue = (fieldKey, value) => {
    if (value === null || value === undefined || value === '') return '-';

    const key = String(fieldKey || '').toLowerCase();

    if (Array.isArray(value)) {
      if (value.length === 0) return '-';

      if (value.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
        const labels = value
          .map((item) => item.name || item.title || item.text || item.subject || item.id)
          .filter(Boolean)
          .slice(0, 3)
          .map((item) => String(item));

        const head = labels.join(', ');
        const suffix = value.length > 3 ? ` +${value.length - 3} kayıt` : '';
        return head ? `${head}${suffix}` : `${value.length} kayıt`;
      }

      return value
        .map((item) => formatFieldValue(fieldKey, item))
        .filter(Boolean)
        .join(', ');
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined && v !== '');

      if (entries.length === 0) return '-';

      return entries
        .map(([k, v]) => `${getFieldLabel(k)}: ${formatFieldValue(k, v)}`)
        .join(', ');
    }

    if (key === 'companyid' || key === 'company_id') {
      const currentCompanyId = user?.company_id || user?.companyId;
      if (currentCompanyId && String(value) === String(currentCompanyId)) {
        return 'Kendi şirketiniz';
      }
      return `Şirket #${value}`;
    }

    if (key === 'userid' || key === 'user_id' || key === 'creatorid' || key === 'createdby') {
      const foundUser = history.find((h) => String(h.userId) === String(value));
      if (foundUser?.userName) {
        return `${foundUser.userName} (#${value})`;
      }
      return `Kullanıcı #${value}`;
    }

    if (key.endsWith('id')) {
      return `#${value}`;
    }

    if (typeof value === 'boolean') {
      return value ? 'Evet' : 'Hayır';
    }

    if (typeof value === 'number') {
      if (key.includes('count') || key.includes('group')) return `${value} adet`;
      if (fieldKey.toLowerCase().includes('percent')) return `${value}%`;
      if (fieldKey.toLowerCase().includes('hour')) return `${value} saat`;
      return String(value);
    }

    const enumValue = formatEnumValue(value);
    if (enumValue) return enumValue;

    if (key.includes('date') || key.includes('at')) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        const hasTime = /t\d{2}:\d{2}:\d{2}/i.test(String(value));
        return format(date, hasTime ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy', { locale: tr });
      }
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return formatFieldValue(fieldKey, parsed);
        } catch {
          // JSON değilse normal string olarak devam et
        }
      }
      return value.replace(/_/g, ' ');
    }

    return String(value);
  };

  const parseLegacyKeyValueString = (rawValue) => {
    const text = String(rawValue || '').trim();
    if (!text || !text.includes(':')) return null;

    const segments = text.split(',').map(part => part.trim()).filter(Boolean);
    if (segments.length === 0) return null;

    const obj = {};
    for (const segment of segments) {
      const separatorIndex = segment.indexOf(':');
      if (separatorIndex < 1) return null;

      const key = segment.slice(0, separatorIndex).trim();
      const value = segment.slice(separatorIndex + 1).trim();
      if (!key) return null;
      obj[key] = value;
    }

    return Object.keys(obj).length > 0 ? obj : null;
  };

  const formatAuditValue = (rawValue) => {
    if (!rawValue) return '-';

    try {
      const parsed = JSON.parse(rawValue);

      const isDashboardSummary =
        parsed && typeof parsed === 'object' &&
        ('layoutCount' in parsed || 'activeLayoutId' in parsed || 'widgetSizeGroups' in parsed || 'widgetOrderGroups' in parsed);

      if (isDashboardSummary) {
        const parts = [];
        const layoutCount = parsed.layoutCount ?? 0;
        const templateCount = parsed.taskTemplateCount ?? 0;
        const widgetSizeGroups = parsed.widgetSizeGroups ?? 0;
        const widgetOrderGroups = parsed.widgetOrderGroups ?? 0;

        parts.push(`Toplam ${layoutCount} düzen var`);

        if (parsed.activeLayoutName) {
          parts.push(`aktif düzen: ${parsed.activeLayoutName}`);
        } else if (parsed.activeLayoutId) {
          parts.push(`aktif düzen ID: #${parsed.activeLayoutId}`);
        }

        parts.push(`${templateCount} görev şablonu tanımlı`);
        parts.push(`${widgetSizeGroups} widget boyut ayarı grubu`);
        parts.push(`${widgetOrderGroups} widget sıralama ayarı grubu`);

        return parts.join(' • ');
      }

      return Object.entries(parsed)
        .filter(([k, v]) => !HIDDEN_AUDIT_KEYS.has(k) && v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${getFieldLabel(k)}: ${formatFieldValue(k, v)}`)
        .join(' • ') || '-';
    } catch {
      const legacyParsed = parseLegacyKeyValueString(rawValue);
      if (legacyParsed) {
        const legacyKeys = Object.keys(legacyParsed).map((k) => String(k).toLowerCase());
        const isLegacyDashboardPayload = legacyKeys.some((k) =>
          k.includes('dashboard layouts') ||
          k.includes('active layout') ||
          k.includes('dashboard widget sizes') ||
          k.includes('dashboard widget order')
        );

        if (isLegacyDashboardPayload) {
          const layoutRaw = legacyParsed['Dashboard layouts'];
          const activeLayout = legacyParsed['Active layout'];
          const templateRaw = legacyParsed['Task templates'];

          let layoutCount = 0;
          if (typeof layoutRaw === 'string' && layoutRaw.trim()) {
            layoutCount = layoutRaw.split('ID:').length - 1;
          }

          const templateCount = templateRaw && templateRaw !== '-' ? 1 : 0;
          const safeActive = activeLayout && activeLayout !== '-' ? activeLayout : 'belirtilmemiş';

          return `Panel ayarları güncellendi • Toplam ${layoutCount} düzen var • Aktif düzen: ${safeActive} • ${templateCount} şablon bilgisi var`;
        }

        return Object.entries(legacyParsed)
          .filter(([k, v]) => !HIDDEN_AUDIT_KEYS.has(k) && v !== null && v !== undefined && v !== '')
          .map(([k, v]) => `${getFieldLabel(k)}: ${formatFieldValue(k, v)}`)
          .join(' • ') || '-';
      }

      const raw = String(rawValue);
      return raw === '[object Object]' ? 'Detay okunamıyor' : raw;
    }
  };

  const uniqueUsers = [...new Set(history.map(h => h.userId))];
  const availableTypes = CORE_FILTER_TYPES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
              <History size={24} className="text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Değişiklik Geçmişi
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Tüm sistem değişikliklerini görüntüleyin
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportHistory}
              disabled={filteredHistory.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800 disabled:text-slate-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-400'
              } disabled:cursor-not-allowed`}
            >
              <Download size={18} />
              Dışa Aktar
            </button>
            {user?.role === 'boss' && (
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ara..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Tip Filtresi */}
          <div className="relative">
            <Filter size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Tüm İşlemler</option>
              {availableTypes.map(typeKey => (
                <option key={typeKey} value={typeKey}>{getTypeLabel(typeKey)}</option>
              ))}
            </select>
          </div>

          {/* Kullanıcı Filtresi */}
          <div className="relative">
            <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Tüm Kullanıcılar</option>
              {uniqueUsers.map(userId => {
                const item = history.find(h => h.userId === userId);
                return <option key={userId} value={userId}>{item?.userName || userId}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} p-6`}>
        <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {filteredHistory.length} kayıt bulundu
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className={`mx-auto mb-4 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yükleniyor...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchTerm || filterType !== 'all' || filterUser !== 'all'
                ? 'İlgili kriterlerde kayıt bulunamadı'
                : 'Henüz değişiklik kaydı yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item, idx) => (
              (() => {
                const normalizedAction = String(item.action || '').toLowerCase();
                const criticalCategory = getCriticalCategory(item);
                return (
              <div
                key={idx}
                className={`flex gap-4 p-4 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-slate-700/50 hover:bg-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    normalizedAction === 'create'
                      ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : normalizedAction === 'update'
                        ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                        : isDark ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    {getActionIcon(item.action)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.userName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {getTypeLabel(item.type)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          normalizedAction === 'create'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : normalizedAction === 'update'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {getActionLabel(item.action)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadgeClasses(criticalCategory)}`}>
                          {criticalCategory}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.description}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock size={14} />
                      {format(new Date(item.timestamp), 'dd MMM HH:mm', { locale: tr })}
                    </div>
                  </div>

                  {/* Değişiklik Detayları */}
                  {(item.oldValue || item.newValue) && (
                    <div className={`mt-2 pt-2 border-t text-xs grid grid-cols-2 gap-3 ${
                      isDark ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      {item.oldValue && (
                        <div>
                          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Eski: 
                          </span>
                          <span className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {formatAuditValue(item.oldValue)}
                          </span>
                        </div>
                      )}
                      {item.newValue && (
                        <div>
                          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Yeni: 
                          </span>
                          <span className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {formatAuditValue(item.newValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to log changes (export for use in other components)
export const logChange = async (type, action, description, oldValue = null, newValue = null, entity = null) => {
  try {
    await auditLogAPI.create({ type, action, description, oldValue, newValue, entity });
  } catch (err) {
    console.error('Değişiklik kaydedilemedi:', err);
  }
};

export default ChangeHistory;
