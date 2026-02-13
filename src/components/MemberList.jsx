import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Crown, Mail, MoreHorizontal } from 'lucide-react';

const MemberList = ({ members, roles }) => {
  const [expandedRoles, setExpandedRoles] = useState(roles.map(r => r.id));
  const [searchQuery, setSearchQuery] = useState('');

  // Group members by role
  const membersByRole = roles.map(role => ({
    ...role,
    members: members.filter(m => m.roleId === role.id)
  }));

  const toggleRole = (roleId) => {
    setExpandedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const filteredMembersByRole = membersByRole.map(role => ({
    ...role,
    members: role.members.filter(m => 
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(role => role.members.length > 0 || !searchQuery);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'busy': return 'Meşgul';
      case 'away': return 'Uzakta';
      default: return 'Çevrimdışı';
    }
  };

  return (
    <div className="w-72 bg-white/60 backdrop-blur-xl flex flex-col h-full border-l border-slate-200/60">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-800 font-semibold">
            Ekip Üyeleri
          </h2>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-semibold">
            {members.length}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Üye ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/80 text-sm text-slate-700 placeholder-slate-400
                     rounded-xl px-4 py-2.5 pl-10 border border-transparent
                     focus:border-indigo-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredMembersByRole.map((role) => (
          <div key={role.id} className="mb-4">
            {/* Role Header */}
            <button
              onClick={() => toggleRole(role.id)}
              className="flex items-center gap-2 w-full px-2 py-2 text-left group rounded-lg hover:bg-slate-100 transition-colors"
            >
              {expandedRoles.includes(role.id) ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span className="text-sm font-semibold text-slate-700">
                {role.name}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                {role.members.length}
              </span>
            </button>

            {/* Members */}
            {expandedRoles.includes(role.id) && (
              <div className="space-y-1 mt-1">
                {role.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-white hover:shadow-sm cursor-pointer group transition-all border border-transparent
                             hover:border-slate-200"
                  >
                    {/* Avatar with Status */}
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                        style={{ background: `linear-gradient(135deg, ${member.roleColor}, ${member.roleColor}cc)` }}
                      >
                        {member.displayName[0]}
                      </div>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
                                  ${getStatusColor(member.status)}`}
                      />
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-slate-700 font-medium truncate group-hover:text-slate-900 transition-colors">
                          {member.displayName}
                        </span>
                        {member.id === 1 && (
                          <Crown size={14} className="text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 truncate block">
                        {getStatusText(member.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* No Results */}
        {searchQuery && filteredMembersByRole.every(r => r.members.length === 0) && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Üye bulunamadı</p>
          </div>
        )}
      </div>

      {/* Online Count */}
      <div className="p-4 border-t border-slate-200/60 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-sm text-slate-600 font-medium">
              {members.filter(m => m.status === 'online').length} Çevrimiçi
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {members.filter(m => m.status !== 'online').length} Çevrimdışı
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
