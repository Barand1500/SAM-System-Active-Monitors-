import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  LayoutDashboard, 
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Plus,
  Bell,
  Search
} from 'lucide-react';

const ChannelList = ({ workspace, currentUser }) => {
  const [expandedCategories, setExpandedCategories] = useState(['main', 'management']);
  const [activeMenu, setActiveMenu] = useState('tasks');

  const menuItems = [
    {
      id: 'main',
      name: 'Ana Menü',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'tasks', name: 'Görevler', icon: FileText, badge: 5, active: true },
        { id: 'logs', name: 'Günlükler', icon: MessageSquare, badge: 2 },
      ]
    },
    {
      id: 'management',
      name: 'Yönetim',
      items: [
        { id: 'calendar', name: 'Takvim', icon: Calendar, badge: null },
        { id: 'analytics', name: 'Analitik', icon: BarChart3, badge: null },
      ]
    },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-64 bg-white/60 backdrop-blur-xl flex flex-col h-full border-r border-slate-200/60">
      {/* Workspace Header */}
      <div className="p-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center
                        text-white font-bold shadow-lg shadow-indigo-500/25">
            {workspace?.icon || 'W'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-slate-800 font-semibold truncate">{workspace?.name || 'Workspace'}</h2>
            <p className="text-xs text-slate-500">{workspace?.memberCount || 0} üye</p>
          </div>
          <ChevronDown size={18} className="text-slate-400" />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full bg-slate-100/80 text-sm text-slate-700 placeholder-slate-400
                     rounded-xl px-4 py-2.5 pl-10 border border-transparent
                     focus:border-indigo-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {menuItems.map((category) => (
          <div key={category.id} className="mb-4">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center gap-2 w-full px-2 py-2 text-left group"
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {category.name}
              </span>
            </button>

            {/* Menu Items */}
            {expandedCategories.includes(category.id) && (
              <div className="space-y-1 mt-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                                transition-all duration-200 group
                                ${item.active || activeMenu === item.id
                                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                                  : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Icon size={18} className={item.active || activeMenu === item.id 
                        ? 'text-indigo-500' 
                        : 'text-slate-400 group-hover:text-slate-600'} 
                      />
                      <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                                      ${item.active || activeMenu === item.id
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-200 text-slate-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Quick Add */}
        <button className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl
                         text-slate-500 hover:text-indigo-600 hover:bg-indigo-50
                         transition-all duration-200 border-2 border-dashed border-slate-200
                         hover:border-indigo-300">
          <Plus size={18} />
          <span className="text-sm font-medium">Yeni Kategori</span>
        </button>
      </div>

      {/* User Panel */}
      <div className="p-4 border-t border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <div className="avatar-ring">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: `linear-gradient(135deg, ${currentUser?.roleColor || '#6366f1'}, #8b5cf6)` }}
            >
              {currentUser?.displayName?.[0] || 'U'}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-sm font-semibold truncate">{currentUser?.displayName || 'User'}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                currentUser?.status === 'online' ? 'bg-emerald-500' : 
                currentUser?.status === 'busy' ? 'bg-red-500' :
                currentUser?.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <p className="text-slate-500 text-xs capitalize">{currentUser?.status || 'offline'}</p>
            </div>
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
