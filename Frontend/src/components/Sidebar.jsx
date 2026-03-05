import { useState } from 'react';
import { 
  Plus, 
  Sparkles,
  Settings
} from 'lucide-react';

const Sidebar = ({ workspaces, activeWorkspace, onWorkspaceSelect }) => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="w-20 sidebar-gradient flex flex-col items-center py-6 gap-3">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center
                      shadow-lg backdrop-blur-sm">
          <Sparkles className="text-white" size={24} />
        </div>
      </div>

      {/* Workspace Icons */}
      <div className="flex-1 flex flex-col items-center gap-2 w-full px-3">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="relative group w-full">
            <button
              onClick={() => onWorkspaceSelect(workspace)}
              onMouseEnter={() => setHoveredId(workspace.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full aspect-square rounded-2xl flex items-center justify-center 
                         font-bold text-lg transition-all duration-300 relative overflow-hidden
                         ${activeWorkspace?.id === workspace.id
                           ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                           : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'}`}
            >
              {workspace.icon}
              
              {/* Active indicator */}
              {activeWorkspace?.id === workspace.id && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 
                              bg-white rounded-full shadow-lg" />
              )}
            </button>

            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 
                          bg-slate-900 text-white text-sm rounded-xl whitespace-nowrap 
                          opacity-0 group-hover:opacity-100 pointer-events-none 
                          transition-all duration-200 shadow-xl z-50
                          translate-x-2 group-hover:translate-x-0">
              <p className="font-semibold">{workspace.name}</p>
              <p className="text-xs text-slate-400">{workspace.memberCount} üye</p>
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 
                            bg-slate-900 rotate-45" />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-10 h-px bg-white/20 my-2" />

      {/* Add Workspace */}
      <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center
                       text-white/60 hover:text-white hover:bg-emerald-500/80 
                       transition-all duration-300 group">
        <Plus size={22} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Settings */}
      <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center
                       text-white/60 hover:text-white hover:bg-white/20 
                       transition-all duration-300">
        <Settings size={20} />
      </button>
    </div>
  );
};

export default Sidebar;
