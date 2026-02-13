import { useState } from 'react';
import { 
  Users, 
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  PenSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import TaskCard from './TaskCard';
import BlogPost from './BlogPost';

const MainContent = ({ workspace, tasks, taskLogs, onToggleMemberList, showMemberList }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Tümü', icon: Sparkles },
    { value: 'pending', label: 'Bekleyen', icon: Clock },
    { value: 'in_progress', label: 'Devam Eden', icon: TrendingUp },
    { value: 'review', label: 'İncelemede', icon: AlertCircle },
    { value: 'completed', label: 'Tamamlanan', icon: CheckCircle2 },
  ];

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  const stats = [
    { label: 'Devam Eden', count: tasks.filter(t => t.status === 'in_progress').length, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'İncelemede', count: tasks.filter(t => t.status === 'review').length, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    { label: 'Bekleyen', count: tasks.filter(t => t.status === 'pending').length, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-50' },
    { label: 'Tamamlanan', count: tasks.filter(t => t.status === 'completed').length, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{workspace?.name || 'Workspace'}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{workspace?.description || 'Ekip çalışma alanı'}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Görev ara..."
                className="w-64 bg-slate-100/80 text-sm text-slate-700 placeholder-slate-400
                         rounded-xl px-4 py-2.5 pl-10 border border-transparent
                         focus:border-indigo-300 focus:bg-white focus:w-80 transition-all"
              />
            </div>

            <button 
              onClick={onToggleMemberList}
              className={`p-2.5 rounded-xl transition-all ${
                showMemberList 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-slate-200/60">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${activeTab === 'tasks' 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            Görevler
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${activeTab === 'logs' 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            Günlükler
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'tasks' && (
            <>
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl
                           text-sm text-slate-600 hover:text-slate-800 transition-all
                           border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                  <Filter size={16} />
                  {statusOptions.find(s => s.value === filterStatus)?.label}
                  <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl
                                border border-slate-200 py-2 z-50 min-w-[180px] overflow-hidden">
                    {statusOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterStatus(option.value);
                            setShowFilters(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center gap-2
                                    ${filterStatus === option.value 
                                      ? 'bg-indigo-50 text-indigo-600' 
                                      : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Icon size={16} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all
                            ${viewMode === 'grid' 
                              ? 'bg-indigo-500 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all
                            ${viewMode === 'list' 
                              ? 'bg-indigo-500 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </>
          )}

          {/* New Button */}
          <button className="flex items-center gap-2 px-5 py-2.5 btn-primary
                           rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25">
            <Plus size={18} />
            {activeTab === 'tasks' ? 'Yeni Görev' : 'Yeni Günlük'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'tasks' ? (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.bg} rounded-2xl p-4 border border-slate-200/60`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm font-medium">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' 
              : 'space-y-4'}>
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 
                              shadow-lg border border-slate-200">
                  <PenSquare size={32} className="text-slate-400" />
                </div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">Görev Bulunamadı</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Bu filtreye uygun görev bulunmuyor. Yeni bir görev ekleyebilir veya filtreyi değiştirebilirsiniz.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Task Logs */}
            <div className="space-y-5">
              {taskLogs.map(log => (
                <BlogPost key={log.id} log={log} />
              ))}
            </div>

            {taskLogs.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 
                              shadow-lg border border-slate-200">
                  <PenSquare size={32} className="text-slate-400" />
                </div>
                <h3 className="text-slate-800 font-semibold text-lg mb-2">Henüz Günlük Yok</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  İlk günlüğünüzü oluşturun ve ekibinizle ilerlemenizi paylaşın.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent;
