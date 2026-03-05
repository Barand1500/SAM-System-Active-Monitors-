import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  Tag,
  Flag,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

const AdvancedSearch = ({ isDark, tasks = [], users = [], onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    tags: [],
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const statusOptions = [
    { value: 'pending', label: 'Bekliyor', color: 'bg-slate-400' },
    { value: 'in_progress', label: 'Devam Ediyor', color: 'bg-blue-500' },
    { value: 'review', label: 'İncelemede', color: 'bg-amber-500' },
    { value: 'completed', label: 'Tamamlandı', color: 'bg-emerald-500' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Düşük', color: 'bg-blue-400' },
    { value: 'medium', label: 'Orta', color: 'bg-amber-400' },
    { value: 'high', label: 'Yüksek', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Acil', color: 'bg-red-500' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'overdue', label: 'Gecikmiş' },
    { value: 'custom', label: 'Özel Tarih' },
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Bitiş Tarihi' },
    { value: 'createdAt', label: 'Oluşturma Tarihi' },
    { value: 'priority', label: 'Öncelik' },
    { value: 'title', label: 'Başlık' },
    { value: 'status', label: 'Durum' },
  ];

  // Tags from localStorage
  const tags = useMemo(() => {
    const saved = localStorage.getItem('taskTags');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Toggle array filter
  const toggleArrayFilter = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey].includes(value)
        ? prev[filterKey].filter(v => v !== value)
        : [...prev[filterKey], value]
    }));
  };

  // Filtreleri uygula
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Metin araması
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Durum filtresi
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status));
    }

    // Öncelik filtresi
    if (filters.priority.length > 0) {
      result = result.filter(task => filters.priority.includes(task.priority));
    }

    // Atanan kişi filtresi
    if (filters.assignee.length > 0) {
      result = result.filter(task => filters.assignee.includes(task.assigneeId));
    }

    // Etiket filtresi
    if (filters.tags.length > 0) {
      result = result.filter(task => 
        task.tags?.some(tagId => filters.tags.includes(tagId))
      );
    }

    // Tarih filtresi
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      
      result = result.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        
        switch (filters.dateRange) {
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return dueDate >= today && dueDate <= weekEnd;
          case 'month':
            const monthEnd = new Date(today);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            return dueDate >= today && dueDate <= monthEnd;
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'custom':
            if (filters.customStartDate && filters.customEndDate) {
              const start = new Date(filters.customStartDate);
              const end = new Date(filters.customEndDate);
              return dueDate >= start && dueDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Sıralama
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'createdAt':
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          aVal = priorityOrder[a.priority] ?? 4;
          bVal = priorityOrder[b.priority] ?? 4;
          break;
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'status':
          const statusOrder = { pending: 0, in_progress: 1, review: 2, completed: 3 };
          aVal = statusOrder[a.status] ?? 4;
          bVal = statusOrder[b.status] ?? 4;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    onFilterChange?.(result);
    return result;
  }, [tasks, searchQuery, filters, onFilterChange]);

  // Aktif filtre sayısı
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignee.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  // Filtreleri sıfırla
  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      tags: [],
      dateRange: 'all',
      customStartDate: '',
      customEndDate: '',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Arama ve Filtre Bar */}
      <div className="flex items-center gap-3">
        {/* Arama */}
        <div className="relative flex-1">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev ara..."
            className={`w-full pl-11 pr-4 py-3 rounded-xl ${
              isDark 
                ? 'bg-slate-700 text-white placeholder-slate-400' 
                : 'bg-white text-slate-700 placeholder-slate-400 border border-slate-200'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded ${
                isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'
              }`}
            >
              <X size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            </button>
          )}
        </div>

        {/* Filtre Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
            activeFilterCount > 0
              ? 'bg-indigo-500 text-white'
              : isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className="font-medium">Filtreler</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Sıfırla */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className={`p-3 rounded-xl transition-colors ${
              isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
            title="Filtreleri Sıfırla"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Sonuç Özeti */}
      <div className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <span>{filteredTasks.length} görev bulundu</span>
        <div className="flex items-center gap-2">
          <span>Sırala:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className={`px-2 py-1 rounded-lg text-sm ${
              isDark 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-white text-slate-700 border-slate-200'
            } border`}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Genişletilmiş Filtreler */}
      {showFilters && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Durum Filtresi */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Clock size={14} className="inline mr-1" /> Durum
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => toggleArrayFilter('status', status.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filters.status.includes(status.value)
                        ? 'bg-indigo-500 text-white'
                        : isDark 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${status.color}`} />
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Öncelik Filtresi */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Flag size={14} className="inline mr-1" /> Öncelik
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(priority => (
                  <button
                    key={priority.value}
                    onClick={() => toggleArrayFilter('priority', priority.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filters.priority.includes(priority.value)
                        ? 'bg-indigo-500 text-white'
                        : isDark 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${priority.color}`} />
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarih Filtresi */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Calendar size={14} className="inline mr-1" /> Tarih
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  isDark 
                    ? 'bg-slate-700 text-white border-slate-600' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                } border`}
              >
                {dateRangeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {filters.dateRange === 'custom' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-slate-700 text-white border-slate-600' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    } border`}
                  />
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-slate-700 text-white border-slate-600' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    } border`}
                  />
                </div>
              )}
            </div>

            {/* Atanan Kişi Filtresi */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <User size={14} className="inline mr-1" /> Atanan Kişi
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {users.slice(0, 6).map(user => (
                  <button
                    key={user.id}
                    onClick={() => toggleArrayFilter('assignee', user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filters.assignee.includes(user.id)
                        ? 'bg-indigo-500 text-white'
                        : isDark 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {user.firstName} {user.lastName?.[0]}.
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Etiket Filtresi */}
          {tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Tag size={14} className="inline mr-1" /> Etiketler
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleArrayFilter('tags', tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filters.tags.includes(tag.id)
                        ? 'ring-2 ring-offset-2 ring-indigo-500'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: tag.color, 
                      color: 'white' 
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
