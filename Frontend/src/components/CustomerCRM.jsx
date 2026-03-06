import { useState, useEffect } from 'react';
import {
  Plus, Search, Building2, User, Phone, Mail, Clock,
  Edit, Trash2, X, ChevronRight, FileText, Headphones,
  MapPin, Globe, Star, Tag, Filter, Eye
} from 'lucide-react';

const loadCustomers = () => {
  try {
    const saved = localStorage.getItem('sam_customers');
    return saved ? JSON.parse(saved) : defaultCustomers;
  } catch { return defaultCustomers; }
};

const defaultCustomers = [
  {
    id: 1, company: 'Mega Holding A.Ş.', contactName: 'Ali Vural', email: 'ali@megaholding.com',
    phone: '+90 532 999 1122', address: 'İstanbul, Levent', sector: 'Finans',
    notes: 'Büyük müşteri, öncelikli destek.', rating: 5, tags: ['VIP', 'Kurumsal'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 2, company: 'DataSoft Bilişim', contactName: 'Selin Koç', email: 'selin@datasoft.com',
    phone: '+90 545 333 4455', address: 'Ankara, Çankaya', sector: 'Teknoloji',
    notes: 'Yazılım lisans yenileme Mart ayında.', rating: 4, tags: ['Teknoloji'],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 3, company: 'ABC Lojistik', contactName: 'Burak Şen', email: 'burak@abclojistik.com',
    phone: '+90 555 666 7788', address: 'İzmir, Alsancak', sector: 'Lojistik',
    notes: '', rating: 3, tags: ['Lojistik'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const CustomerCRM = ({ user, isBoss, canManage, isDark }) => {
  const [customers, setCustomers] = useState(loadCustomers);
  const [view, setView] = useState('list'); // list | detail | form
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');

  useEffect(() => { localStorage.setItem('sam_customers', JSON.stringify(customers)); }, [customers]);

  // Destek ticketlarını çek
  const getTicketsForCustomer = (companyName) => {
    try {
      const tickets = JSON.parse(localStorage.getItem('sam_support_tickets') || '[]');
      return tickets.filter(t => t.callerCompany?.toLowerCase() === companyName.toLowerCase());
    } catch { return []; }
  };

  const sectors = [...new Set(customers.map(c => c.sector).filter(Boolean))];

  const filtered = customers.filter(c => {
    if (filterSector !== 'all' && c.sector !== filterSector) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.company.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  const saveCustomer = (data) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...data } : c));
    } else {
      setCustomers(prev => [{ ...data, id: Date.now(), createdAt: new Date().toISOString(), tags: data.tags || [], rating: data.rating || 3 }, ...prev]);
    }
    setView('list');
    setEditingCustomer(null);
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setSelectedCustomer(null);
    setView('list');
  };

  // ─── FORM ─────────────────
  const CustomerForm = () => {
    const [form, setForm] = useState(editingCustomer || {
      company: '', contactName: '', email: '', phone: '', address: '', sector: '', notes: '', rating: 3, tags: []
    });
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
      if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
        setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
        setTagInput('');
      }
    };

    return (
      <div className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket Adı *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                placeholder="Şirket adı" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yetkili Kişi *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
                placeholder="Ad Soyad" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>E-posta</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ornek@sirket.com" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Telefon</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+90 5XX XXX XXXX" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adres</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Şehir, İlçe" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sektör</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
                placeholder="Teknoloji, Finans..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>
        </div>
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notlar</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} placeholder="Müşteri hakkında notlar..."
            className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`} />
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Puan</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                  className="p-0.5">
                  <Star size={20} className={s <= form.rating ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Etiketler</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle..." className={`flex-1 ${inputClass} border rounded-xl px-3 py-2 text-sm`} />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm">+</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                    {tag}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { setView('list'); setEditingCustomer(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            İptal
          </button>
          <button type="button" onClick={() => {
            if (!form.company.trim() || !form.contactName.trim()) return;
            saveCustomer(form);
          }}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            {editingCustomer ? 'Güncelle' : 'Müşteri Ekle'}
          </button>
        </div>
      </div>
    );
  };

  // ─── DETAIL ─────────────────
  const CustomerDetail = () => {
    if (!selectedCustomer) return null;
    const c = customers.find(cu => cu.id === selectedCustomer.id);
    if (!c) return null;
    const relatedTickets = getTicketsForCustomer(c.company);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border ${cardClass} shadow-2xl`}>
          <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-white'} p-6 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg`}>
                  {c.company.charAt(0)}
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.company}</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.contactName} · {c.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <>
                    <button onClick={() => { setEditingCustomer(c); setSelectedCustomer(null); setView('form'); }}
                      className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteCustomer(c.id)}
                      className={`p-2 rounded-xl ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedCustomer(null)}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Contact info */}
            <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              {[
                { icon: Phone, label: 'Telefon', value: c.phone },
                { icon: Mail, label: 'E-posta', value: c.email },
                { icon: MapPin, label: 'Adres', value: c.address },
                { icon: Globe, label: 'Sektör', value: c.sector },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <div>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Puan:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={s <= c.rating ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-slate-300'} />
                ))}
              </div>
            </div>
            {/* Tags */}
            {c.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map(tag => (
                  <span key={tag} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                    <Tag size={10} className="inline mr-1" />{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Notes */}
            {c.notes && (
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notlar</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.notes}</p>
              </div>
            )}
            {/* Related tickets */}
            <div>
              <h4 className={`text-sm font-semibold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Headphones size={15} /> Destek Geçmişi ({relatedTickets.length})
              </h4>
              {relatedTickets.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bu müşteriye ait destek talebi bulunamadı.</p>
              ) : (
                <div className="space-y-2">
                  {relatedTickets.map(t => (
                    <div key={t.id} className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.subject}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(t.createdAt).toLocaleDateString('tr-TR')} · {t.status === 'resolved' ? 'Çözüldü' : t.status === 'assigned' ? 'Alındı' : 'Yeni'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'resolved' ? 'bg-purple-100 text-purple-700' :
                        t.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{t.status === 'resolved' ? 'Çözüldü' : t.status === 'assigned' ? 'Alındı' : 'Yeni'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Created date */}
            <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Kayıt: {new Date(c.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─── MAIN ─────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Müşteri Yönetimi</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{customers.length} müşteri kayıtlı</p>
        </div>
        {canManage && (
          <button onClick={() => { setEditingCustomer(null); setView('form'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            <Plus size={18} /> Yeni Müşteri
          </button>
        )}
      </div>

      {view === 'form' ? <CustomerForm /> : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Şirket, kişi veya e-posta ara..."
                className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
            {sectors.length > 0 && (
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                className={`${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
                <option value="all">Tüm Sektörler</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Customer grid */}
          {filtered.length === 0 ? (
            <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
              <Building2 size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Müşteri bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => {
                const ticketCount = getTicketsForCustomer(c.company).length;
                return (
                  <div key={c.id} onClick={() => setSelectedCustomer(c)}
                    className={`${cardClass} rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0`}>
                        {c.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.company}</h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.contactName}</p>
                      </div>
                    </div>
                    <div className={`text-xs space-y-1 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {c.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {c.phone}</p>}
                      {c.sector && <p className="flex items-center gap-1.5"><Globe size={12} /> {c.sector}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} className={s <= c.rating ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-700' : 'text-slate-200'} />
                        ))}
                      </div>
                      {ticketCount > 0 && (
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Headphones size={12} /> {ticketCount}
                        </span>
                      )}
                    </div>
                    {c.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedCustomer && <CustomerDetail />}
    </div>
  );
};

export default CustomerCRM;
