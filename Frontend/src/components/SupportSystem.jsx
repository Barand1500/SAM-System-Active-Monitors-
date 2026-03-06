import { useState, useEffect } from 'react';
import {
  Plus, Phone, Building2, User, Tag, AlertCircle, Clock,
  Eye, UserPlus, CheckCircle2, X, ChevronRight, MessageSquare,
  Send, Search, Filter, Headphones, LogOut, FileText,
  AlertTriangle, Info, Wrench, HelpCircle, BarChart3
} from 'lucide-react';
import { supportTickets as initialTickets } from '../data/mockData';

const loadTickets = () => {
  try {
    const saved = localStorage.getItem('sam_support_tickets');
    return saved ? JSON.parse(saved) : initialTickets;
  } catch { return initialTickets; }
};

const SupportSystem = ({ user, isBoss, canManage, isDark }) => {
  const [tickets, setTickets] = useState(loadTickets);
  const [view, setView] = useState('pool'); // pool | create | resolved
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => { localStorage.setItem('sam_support_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(Date.now()), 30000); return () => clearInterval(t); }, []);

  const categories = [
    { id: 'technical', label: 'Teknik Sorun', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'complaint', label: 'Şikayet', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'info', label: 'Bilgi Talebi', icon: Info, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    { id: 'fault', label: 'Arıza', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'other', label: 'Diğer', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  const priorities = [
    { id: 'low', label: 'Düşük', color: 'bg-slate-400', text: 'text-slate-600' },
    { id: 'medium', label: 'Orta', color: 'bg-blue-500', text: 'text-blue-600' },
    { id: 'high', label: 'Yüksek', color: 'bg-amber-500', text: 'text-amber-600' },
    { id: 'urgent', label: 'Acil', color: 'bg-red-500', text: 'text-red-600' },
  ];

  const statuses = {
    new: { label: 'Yeni', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-100' },
    assigned: { label: 'Alındı', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
    resolved: { label: 'Çözüldü', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-100' },
  };

  // Time helpers
  const formatElapsed = (isoDate) => {
    const diff = currentTime - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa ${mins % 60} dk`;
    const days = Math.floor(hours / 24);
    return `${days} gün ${hours % 24} sa`;
  };

  const getUrgencyColor = (isoDate) => {
    const hours = (currentTime - new Date(isoDate).getTime()) / 3600000;
    if (hours < 1) return isDark ? 'border-emerald-500/40' : 'border-emerald-300';
    if (hours < 4) return isDark ? 'border-amber-500/40' : 'border-amber-300';
    return isDark ? 'border-red-500/40' : 'border-red-300';
  };

  // Actions
  const createTicket = (data) => {
    const newTicket = {
      id: Date.now(),
      ...data,
      status: 'new',
      createdBy: { id: user.id, firstName: user.firstName, lastName: user.lastName },
      createdAt: new Date().toISOString(),
      assignee: null,
      assignedAt: null,
      helpers: [],
      viewers: [],
      history: [{ type: 'created', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }],
      notes: [],
      resolution: null,
      resolvedAt: null
    };
    setTickets(prev => [newTicket, ...prev]);
    setView('pool');
  };

  const viewTicket = (ticket) => {
    const already = ticket.viewers.some(v => v.userId === user.id);
    if (!already) {
      setTickets(prev => prev.map(t => t.id === ticket.id ? {
        ...t,
        viewers: [...t.viewers, { userId: user.id, viewedAt: new Date().toISOString() }],
        history: [...t.history, { type: 'viewed', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }]
      } : t));
    }
    setSelectedTicket(ticket);
  };

  const claimTicket = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'assigned',
      assignee: { id: user.id, firstName: user.firstName, lastName: user.lastName, assignedAt: new Date().toISOString() },
      assignedAt: new Date().toISOString(),
      history: [...t.history, { type: 'assigned', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }]
    } : t));
  };

  const leaveTicket = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'new',
      assignee: null,
      assignedAt: null,
      history: [...t.history, { type: 'left', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }]
    } : t));
    setSelectedTicket(null);
  };

  const helpTicket = (ticketId) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      if (t.helpers.some(h => h.id === user.id)) return t;
      return {
        ...t,
        helpers: [...t.helpers, { id: user.id, firstName: user.firstName, lastName: user.lastName, joinedAt: new Date().toISOString() }],
        history: [...t.history, { type: 'helper_joined', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }]
      };
    }));
  };

  const addNote = (ticketId, text) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      notes: [...t.notes, { id: Date.now(), userId: user.id, userName: `${user.firstName} ${user.lastName}`, text, at: new Date().toISOString() }]
    } : t));
  };

  const resolveTicket = (ticketId, resolutionText) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'resolved',
      resolution: resolutionText,
      resolvedAt: new Date().toISOString(),
      history: [...t.history, { type: 'resolved', userId: user.id, userName: `${user.firstName} ${user.lastName}`, at: new Date().toISOString() }]
    } : t));
    setSelectedTicket(null);
  };

  // Filtering
  const poolTickets = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  const filteredPool = poolTickets.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.callerName.toLowerCase().includes(q) || t.callerCompany.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const stats = {
    total: tickets.length,
    open: poolTickets.length,
    resolved: resolvedTickets.length,
    avgResolveTime: resolvedTickets.length > 0
      ? Math.round(resolvedTickets.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000, 0) / resolvedTickets.length)
      : 0
  };

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  // ─── CREATE FORM ─────────────────────────
  const CreateForm = () => {
    const [form, setForm] = useState({
      callerName: '', callerPhone: '', callerCompany: '',
      subject: '', description: '', priority: 'medium', category: 'technical'
    });
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.callerName.trim() || !form.subject.trim() || !form.description.trim()) return;
      createTicket(form);
    };
    return (
      <form onSubmit={handleSubmit} className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni Destek Talebi Oluştur</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Arayan Kişi *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required value={form.callerName} onChange={e => setForm(p => ({...p, callerName: e.target.value}))}
                placeholder="Ad Soyad" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Telefon</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={form.callerPhone} onChange={e => setForm(p => ({...p, callerPhone: e.target.value}))}
                placeholder="+90 5XX XXX XXXX" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required value={form.callerCompany} onChange={e => setForm(p => ({...p, callerCompany: e.target.value}))}
                placeholder="Şirket adı" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
        </div>
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Konu / Başlık *</label>
          <input type="text" required value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}
            placeholder="Kısa özet" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detaylı Açıklama *</label>
          <textarea required value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
            rows={4} placeholder="Sorunu detaylı olarak açıklayınız..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Öncelik</label>
            <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}
              className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`}>
              {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kategori</label>
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
              className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setView('pool')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            İptal
          </button>
          <button type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            Destek Talebi Oluştur
          </button>
        </div>
      </form>
    );
  };

  // ─── TICKET CARD ─────────────────────────
  const TicketCard = ({ ticket }) => {
    const cat = categories.find(c => c.id === ticket.category) || categories[4];
    const pri = priorities.find(p => p.id === ticket.priority);
    const st = statuses[ticket.status];
    const CatIcon = cat.icon;
    const isAssigned = ticket.status === 'assigned';

    return (
      <div
        onClick={() => viewTicket(ticket)}
        className={`${cardClass} rounded-2xl border-l-4 ${getUrgencyColor(ticket.createdAt)} cursor-pointer hover:shadow-lg transition-all p-5 space-y-3`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
              <CatIcon size={18} className={cat.color} />
            </div>
            <div className="min-w-0">
              <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.subject}</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.callerCompany} — {ticket.callerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bgLight} ${st.textColor}`}>{st.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${pri.color}`}>{pri.label}</span>
          </div>
        </div>
        {/* Description preview */}
        <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.description}</p>
        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Timer */}
            <span className={`flex items-center gap-1 font-medium ${
              (currentTime - new Date(ticket.createdAt).getTime()) > 14400000
                ? 'text-red-500'
                : (currentTime - new Date(ticket.createdAt).getTime()) > 3600000
                  ? 'text-amber-500'
                  : isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <Clock size={13} /> {formatElapsed(ticket.createdAt)}
            </span>
            {/* Viewers */}
            <span className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Eye size={13} /> {ticket.viewers.length}
            </span>
            {/* Helpers */}
            {ticket.helpers.length > 0 && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <UserPlus size={13} /> {ticket.helpers.length}
              </span>
            )}
          </div>
          {isAssigned && ticket.assignee && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <User size={12} /> {ticket.assignee.firstName} {ticket.assignee.lastName}
              <span className="opacity-60">· {formatElapsed(ticket.assignedAt)}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  // ─── TICKET DETAIL MODAL ────────────────
  const TicketDetail = () => {
    const t = tickets.find(tk => tk.id === selectedTicket?.id);
    if (!t) return null;
    const [noteText, setNoteText] = useState('');
    const [resolveText, setResolveText] = useState('');
    const [showResolve, setShowResolve] = useState(false);
    const cat = categories.find(c => c.id === t.category) || categories[4];
    const pri = priorities.find(p => p.id === t.priority);
    const isMine = t.assignee?.id === user.id;
    const isHelper = t.helpers.some(h => h.id === user.id);
    const CatIcon = cat.icon;

    const historyIcons = {
      created: { icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Oluşturdu' },
      viewed: { icon: Eye, color: 'text-slate-500', bg: 'bg-slate-100', label: 'İnceledi' },
      assigned: { icon: User, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Görevi Aldı' },
      left: { icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Görevden Ayrıldı' },
      helper_joined: { icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-100', label: 'Yardıma Geldi' },
      resolved: { icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Çözdü' },
    };

    const handleAddNote = () => {
      if (!noteText.trim()) return;
      addNote(t.id, noteText.trim());
      setNoteText('');
    };

    const handleResolve = () => {
      if (!resolveText.trim()) return;
      resolveTicket(t.id, resolveText.trim());
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border ${cardClass} shadow-2xl`}>
          {/* Header */}
          <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-white'} p-6 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center`}>
                  <CatIcon size={22} className={cat.color} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.subject}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statuses[t.status].bgLight} ${statuses[t.status].textColor}`}>{statuses[t.status].label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${pri.color}`}>{pri.label}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{t.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={20} />
              </button>
            </div>
            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {t.status === 'new' && (
                <button onClick={() => claimTicket(t.id)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 flex items-center gap-1.5">
                  <User size={15} /> Görevi Al
                </button>
              )}
              {t.status === 'assigned' && !isMine && !isHelper && (
                <button onClick={() => helpTicket(t.id)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center gap-1.5">
                  <UserPlus size={15} /> Yardım Et
                </button>
              )}
              {isMine && t.status === 'assigned' && (
                <>
                  <button onClick={() => setShowResolve(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Tamamla
                  </button>
                  <button onClick={() => leaveTicket(t.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <LogOut size={15} /> Görevden Ayrıl
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Resolve form */}
            {showResolve && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Çözüm Notu</h4>
                <textarea value={resolveText} onChange={e => setResolveText(e.target.value)}
                  rows={3} placeholder="Sorunu nasıl çözdüğünüzü açıklayınız..."
                  className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none mb-3`} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowResolve(false)} className={`px-4 py-2 text-sm rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>İptal</button>
                  <button onClick={handleResolve} disabled={!resolveText.trim()}
                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                    Tamamla ve Raporla
                  </button>
                </div>
              </div>
            )}

            {/* Caller Info */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <User size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Arayan</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.callerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Telefon</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.callerPhone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Şirket</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.callerCompany}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Detaylı Açıklama</h4>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.description}</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <Clock size={16} className={`mx-auto mb-1 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Boşta Süresi</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatElapsed(t.createdAt)}</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <Eye size={16} className={`mx-auto mb-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>İnceleyen</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.viewers.length} kişi</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <UserPlus size={16} className={`mx-auto mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Yardımcı</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.helpers.length} kişi</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <User size={16} className={`mx-auto mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Atanan</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Yok'}</p>
              </div>
            </div>

            {/* Assignee work time */}
            {t.assignee && t.status === 'assigned' && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-200'} flex items-center justify-center`}>
                  <User size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t.assignee.firstName} {t.assignee.lastName} bu görev üzerinde çalışıyor</p>
                  <p className={`text-xs ${isDark ? 'text-blue-400/60' : 'text-blue-500'}`}>Çalışma süresi: {formatElapsed(t.assignedAt)}</p>
                </div>
              </div>
            )}

            {/* Helpers list */}
            {t.helpers.length > 0 && (
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Yardımcılar</h4>
                <div className="flex flex-wrap gap-2">
                  {t.helpers.map(h => (
                    <span key={h.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
                      <UserPlus size={12} /> {h.firstName} {h.lastName}
                      <span className="opacity-60">· katılım {formatElapsed(h.joinedAt)} önce</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {t.resolution && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                <h4 className={`text-sm font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  <CheckCircle2 size={15} /> Çözüm
                </h4>
                <p className={`text-sm ${isDark ? 'text-purple-200/80' : 'text-purple-800'}`}>{t.resolution}</p>
                {t.resolvedAt && <p className={`text-xs mt-1 ${isDark ? 'text-purple-400/50' : 'text-purple-500'}`}>Çözüm süresi: {formatElapsed(t.createdAt).replace(formatElapsed(t.createdAt), (() => {
                  const diff = new Date(t.resolvedAt) - new Date(t.createdAt);
                  const h = Math.floor(diff / 3600000);
                  const m = Math.floor((diff % 3600000) / 60000);
                  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
                })())}</p>}
              </div>
            )}

            {/* Activity Timeline */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Aktivite Geçmişi</h4>
              <div className="space-y-0">
                {t.history.map((h, i) => {
                  const hi = historyIcons[h.type] || historyIcons.created;
                  const HIcon = hi.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-lg ${hi.bg} flex items-center justify-center shrink-0`}>
                          <HIcon size={14} className={hi.color} />
                        </div>
                        {i < t.history.length - 1 && <div className={`w-0.5 flex-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="font-medium">{h.userName}</span> {hi.label.toLowerCase()}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(h.at).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes / Comments */}
            {t.status !== 'resolved' && (
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notlar</h4>
                {t.notes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {t.notes.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{n.userName}</span>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(n.at).toLocaleString('tr-TR')}</span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder="Not ekle..."
                    className={`flex-1 ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
                  <button onClick={handleAddNote} disabled={!noteText.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── RESOLVED LIST ──────────────────────
  const ResolvedList = () => (
    <div className="space-y-4">
      {/* Boss stats */}
      {canManage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam', value: stats.total, color: 'from-slate-500 to-slate-600', icon: FileText },
            { label: 'Açık', value: stats.open, color: 'from-amber-500 to-orange-600', icon: Clock },
            { label: 'Çözülen', value: stats.resolved, color: 'from-emerald-500 to-teal-600', icon: CheckCircle2 },
            { label: 'Ort. Çözüm', value: `${stats.avgResolveTime} sa`, color: 'from-indigo-500 to-purple-600', icon: BarChart3 },
          ].map((s, i) => {
            const SIcon = s.icon;
            return (
              <div key={i} className={`${cardClass} rounded-2xl border p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <SIcon size={18} className="text-white" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
              </div>
            );
          })}
        </div>
      )}
      {/* Resolved tickets */}
      {resolvedTickets.length === 0 ? (
        <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
          <CheckCircle2 size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Henüz çözülen talep yok</p>
        </div>
      ) : (
        resolvedTickets.map(t => {
          const cat = categories.find(c => c.id === t.category) || categories[4];
          const CIcon = cat.icon;
          const resolveDiff = new Date(t.resolvedAt) - new Date(t.createdAt);
          const rHours = Math.floor(resolveDiff / 3600000);
          const rMins = Math.floor((resolveDiff % 3600000) / 60000);
          const resolveTime = rHours > 0 ? `${rHours} sa ${rMins} dk` : `${rMins} dk`;
          return (
            <div key={t.id} onClick={() => viewTicket(t)}
              className={`${cardClass} rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center`}>
                    <CIcon size={18} className={cat.color} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.subject}</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.callerCompany} — {t.callerName}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
                  Çözüm: {resolveTime}
                </span>
              </div>
              {t.resolution && (
                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="font-medium">Çözüm: </span>{t.resolution}
                </p>
              )}
              <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Çözen: <span className="font-medium">{t.assignee?.firstName} {t.assignee?.lastName}</span></span>
                {t.helpers.length > 0 && <span>Yardımcılar: {t.helpers.map(h => `${h.firstName} ${h.lastName}`).join(', ')}</span>}
                <span>{new Date(t.resolvedAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // ─── MAIN RENDER ────────────────────────
  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className={`inline-flex rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {[
            { id: 'pool', label: 'Destek Havuzu', icon: Headphones, count: poolTickets.length },
            { id: 'resolved', label: 'Çözülenler', icon: CheckCircle2, count: resolvedTickets.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
              }`}>
              <tab.icon size={16} />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                view === tab.id ? 'bg-white/20' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setView('create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
          <Plus size={18} /> Yeni Destek
        </button>
      </div>

      {/* Filters (pool view) */}
      {view === 'pool' && (
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Talep, kişi veya şirket ara..."
              className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className={`${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
            <option value="all">Tüm Öncelikler</option>
            {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className={`${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
            <option value="all">Tüm Kategoriler</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      )}

      {/* Content */}
      {view === 'create' && <CreateForm />}
      {view === 'pool' && (
        filteredPool.length === 0 ? (
          <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
            <Headphones size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Havuzda destek talebi yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPool.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )
      )}
      {view === 'resolved' && <ResolvedList />}

      {/* Detail Modal */}
      {selectedTicket && <TicketDetail />}
    </div>
  );
};

export default SupportSystem;
