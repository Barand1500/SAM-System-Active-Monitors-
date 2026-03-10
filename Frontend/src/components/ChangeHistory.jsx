import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditLogAPI } from '../services/api';
import { History, User, Calendar, Search, Filter, Download, Trash2, Clock, Edit, Plus, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Kullanıcı filtresi
    if (filterUser !== 'all') {
      filtered = filtered.filter(item => item.userId === filterUser);
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
        item.action,
        item.description,
        item.oldValue || '-',
        item.newValue || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `degisiklik_gecmisi_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <Plus size={14} className="text-emerald-500" />;
      case 'update': return <Edit size={14} className="text-blue-500" />;
      case 'delete': return <Trash2 size={14} className="text-red-500" />;
      default: return <History size={14} className="text-slate-500" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'create': return 'Oluşturma';
      case 'update': return 'Güncelleme';
      case 'delete': return 'Silme';
      default: return 'İşlem';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'profile': return 'Profil';
      case 'department': return 'Departman';
      case 'role': return 'Rol';
      case 'status': return 'Durum';
      case 'priority': return 'Öncelik';
      case 'task': return 'Görev';
      case 'company': return 'Şirket';
      default: return 'Diğer';
    }
  };

  const uniqueUsers = [...new Set(history.map(h => h.userId))];

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
              <option value="profile">Profil</option>
              <option value="department">Departman</option>
              <option value="role">Rol</option>
              <option value="status">Durum</option>
              <option value="priority">Öncelik</option>
              <option value="task">Görev</option>
              <option value="company">Şirket</option>
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
                    item.action === 'create'
                      ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : item.action === 'update'
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
                          item.action === 'create'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : item.action === 'update'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {getActionLabel(item.action)}
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
                            {item.oldValue}
                          </span>
                        </div>
                      )}
                      {item.newValue && (
                        <div>
                          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Yeni: 
                          </span>
                          <span className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {item.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
