import { useState, useEffect } from 'react';
import {
  Plus, Search, Building2, User, Phone, Mail, Clock,
  Edit, Trash2, X, ChevronRight, FileText, Headphones,
  MapPin, Globe, Tag, Filter, Eye, Users, CreditCard, Plane, ChevronDown
} from 'lucide-react';

const TYPE_META = {
  gercek:  { label: 'Gerçek Kişi', color: 'from-emerald-500 to-teal-600', icon: User, short: 'GK' },
  tuzel:   { label: 'Tüzel Kişi', color: 'from-indigo-500 to-purple-600', icon: Building2, short: 'TK' },
  yabanci: { label: 'Yabancı', color: 'from-amber-500 to-orange-600', icon: Plane, short: 'YB' },
};

const fmtPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
};

const fmtTC = (v) => {
  return v.replace(/\D/g, '').slice(0, 11);
};

const fmtVergiNo = (v) => {
  return v.replace(/\D/g, '').slice(0, 10);
};

const loadCustomers = () => {
  try {
    const saved = localStorage.getItem('sam_customers');
    return saved ? JSON.parse(saved) : defaultCustomers;
  } catch { return defaultCustomers; }
};

const defaultCustomers = [
  {
    id: 1, type: 'tuzel', company: 'Mega Holding A.Ş.', contactName: 'Ali Vural', email: 'ali@megaholding.com',
    phones: ['0532 999 11 22'], addresses: [{ label: 'Merkez', value: 'İstanbul, Levent' }], sector: 'Finans',
    notes: 'Büyük müşteri, öncelikli destek.', tags: ['VIP', 'Kurumsal'],
    vergiDairesi: 'Beşiktaş VD', vergiNo: '1234567890', parentId: null,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 2, type: 'gercek', company: '', contactName: 'Selin Koç', email: 'selin@datasoft.com',
    phones: ['0545 333 44 55'], addresses: [{ label: 'Ev', value: 'Ankara, Çankaya' }], sector: 'Teknoloji',
    notes: 'Yazılım lisans yenileme Mart ayında.', tags: ['Teknoloji'],
    tcNo: '12345678901', parentId: 1,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 3, type: 'yabanci', company: 'ABC Logistics', contactName: 'John Smith', email: 'john@abclog.com',
    phones: ['0555 666 77 88'], addresses: [{ label: 'Ofis', value: 'İzmir, Alsancak' }], sector: 'Lojistik',
    notes: '', tags: ['Lojistik'], passportNo: 'US12345678', parentId: null,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const CustomerCRM = ({ user, isBoss, canManage, isDark }) => {
  const [customers, setCustomers] = useState(loadCustomers);
  const [view, setView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { localStorage.setItem('sam_customers', JSON.stringify(customers)); }, [customers]);

  const getTicketsForCustomer = (name) => {
    try {
      const tickets = JSON.parse(localStorage.getItem('sam_support_tickets') || '[]');
      return tickets.filter(t => t.callerCompany?.toLowerCase() === name.toLowerCase() || t.callerName?.toLowerCase() === name.toLowerCase());
    } catch { return []; }
  };

  const sectors = [...new Set(customers.map(c => c.sector).filter(Boolean))];
  const displayName = (c) => c.type === 'tuzel' ? c.company : c.contactName;
  const getSubCustomers = (parentId) => customers.filter(c => c.parentId === parentId);
  const getParent = (parentId) => customers.find(c => c.id === parentId);

  const filtered = customers.filter(c => {
    if (filterSector !== 'all' && c.sector !== filterSector) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (c.company || '').toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phones || []).some(p => p.includes(q));
    }
    return true;
  });

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  const saveCustomer = (data) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...data } : c));
    } else {
      setCustomers(prev => [{ ...data, id: Date.now(), createdAt: new Date().toISOString(), tags: data.tags || [] }, ...prev]);
    }
    setView('list');
    setEditingCustomer(null);
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.map(c => c.parentId === id ? { ...c, parentId: null } : c).filter(c => c.id !== id));
    setSelectedCustomer(null);
    setView('list');
  };

  // ─── FORM ─────────────────
  const CustomerForm = () => {
    const [form, setForm] = useState(() => {
      if (editingCustomer) return { ...editingCustomer, phones: editingCustomer.phones || [editingCustomer.phone || ''], addresses: editingCustomer.addresses || (editingCustomer.address ? [{ label: 'Adres', value: editingCustomer.address }] : [{ label: '', value: '' }]) };
      return { type: 'gercek', company: '', contactName: '', email: '', phones: [''], addresses: [{ label: '', value: '' }], sector: '', notes: '', tags: [], tcNo: '', vergiDairesi: '', vergiNo: '', passportNo: '', parentId: null };
    });
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
      if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
        setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
        setTagInput('');
      }
    };

    const updatePhone = (i, val) => {
      const phones = [...form.phones];
      phones[i] = fmtPhone(val);
      setForm(p => ({ ...p, phones }));
    };

    const updateAddress = (i, field, val) => {
      const addresses = [...form.addresses];
      addresses[i] = { ...addresses[i], [field]: val };
      setForm(p => ({ ...p, addresses }));
    };

    const meta = TYPE_META[form.type];
    const possibleParents = customers.filter(c => c.id !== editingCustomer?.id);

    const canSubmit = () => {
      if (form.type === 'tuzel') return form.company.trim() && form.contactName.trim();
      return form.contactName.trim();
    };

    return (
      <div className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
        </h3>

        {/* Müşteri Tipi Seçimi */}
        <div>
          <label className={`block text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Müşteri Tipi</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(TYPE_META).map(([key, m]) => (
              <button key={key} type="button" onClick={() => setForm(p => ({ ...p, type: key }))}
                className={`p-3 rounded-xl border-2 text-center transition-all ${form.type === key
                  ? `border-transparent bg-gradient-to-br ${m.color} text-white shadow-lg`
                  : isDark ? 'border-slate-600 hover:border-slate-500 text-slate-400' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                <m.icon size={22} className="mx-auto mb-1" />
                <span className="text-sm font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Şirket - Tüzel: zorunlu, Gerçek/Yabancı: opsiyonel */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Şirket Adı {form.type === 'tuzel' ? '*' : '(Opsiyonel)'}
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                placeholder="Şirket adı" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>

          {/* Kişi adı */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {form.type === 'tuzel' ? 'Yetkili Kişi *' : 'Ad Soyad *'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
                placeholder="Ad Soyad" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>E-posta</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ornek@sirket.com" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>

          {/* Sektör */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sektör</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
                placeholder="Teknoloji, Finans..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
          </div>

          {/* TC - sadece Gerçek */}
          {form.type === 'gercek' && (
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>TC Kimlik No</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.tcNo || ''} onChange={e => setForm(p => ({ ...p, tcNo: fmtTC(e.target.value) }))}
                  placeholder="11 haneli TC No" maxLength={11} className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
              </div>
            </div>
          )}

          {/* Vergi bilgileri - sadece Tüzel */}
          {form.type === 'tuzel' && (
            <>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vergi Dairesi</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={form.vergiDairesi || ''} onChange={e => setForm(p => ({ ...p, vergiDairesi: e.target.value }))}
                    placeholder="Vergi dairesi adı" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vergi Numarası</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={form.vergiNo || ''} onChange={e => setForm(p => ({ ...p, vergiNo: fmtVergiNo(e.target.value) }))}
                    placeholder="10 haneli Vergi No" maxLength={10} className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
                </div>
              </div>
            </>
          )}

          {/* Pasaport - sadece Yabancı */}
          {form.type === 'yabanci' && (
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pasaport Numarası</label>
              <div className="relative">
                <Plane size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.passportNo || ''} onChange={e => setForm(p => ({ ...p, passportNo: e.target.value.toUpperCase().slice(0, 20) }))}
                  placeholder="Pasaport numarası" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
              </div>
            </div>
          )}

          {/* Üst Müşteri */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Üst Müşteri (Bağlı olduğu)</label>
            <select value={form.parentId || ''} onChange={e => setForm(p => ({ ...p, parentId: e.target.value ? Number(e.target.value) : null }))}
              className={`w-full ${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
              <option value="">Yok</option>
              {possibleParents.map(c => <option key={c.id} value={c.id}>{displayName(c)}</option>)}
            </select>
          </div>
        </div>

        {/* Telefonlar */}
        <div>
          <label className={`block text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Telefon Numaraları</label>
          <div className="space-y-2">
            {form.phones.map((ph, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={ph} onChange={e => updatePhone(i, e.target.value)}
                    placeholder="0XXX XXX XX XX" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
                </div>
                {form.phones.length > 1 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, phones: p.phones.filter((_, idx) => idx !== i) }))}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"><X size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm(p => ({ ...p, phones: [...p.phones, ''] }))}
              className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
              <Plus size={14} /> Telefon Ekle
            </button>
          </div>
        </div>

        {/* Adresler */}
        <div>
          <label className={`block text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Adresler</label>
          <div className="space-y-3">
            {form.addresses.map((addr, i) => (
              <div key={i} className={`p-3 rounded-xl border ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={addr.label} onChange={e => updateAddress(i, 'label', e.target.value)}
                    placeholder="Etiket (Ev, İş, Merkez...)" className={`w-36 ${inputClass} border rounded-lg px-3 py-2 text-sm`} />
                  {form.addresses.length > 1 && (
                    <button type="button" onClick={() => setForm(p => ({ ...p, addresses: p.addresses.filter((_, idx) => idx !== i) }))}
                      className="ml-auto p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X size={14} /></button>
                  )}
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={addr.value} onChange={e => updateAddress(i, 'value', e.target.value)}
                    placeholder="Adres detayı..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm(p => ({ ...p, addresses: [...p.addresses, { label: '', value: '' }] }))}
              className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
              <Plus size={14} /> Adres Ekle
            </button>
          </div>
        </div>

        {/* Notlar */}
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notlar</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} placeholder="Müşteri hakkında notlar..."
            className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`} />
        </div>

        {/* Etiketler */}
        <div>
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

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { setView('list'); setEditingCustomer(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            İptal
          </button>
          <button type="button" onClick={() => { if (canSubmit()) saveCustomer(form); }}
            disabled={!canSubmit()}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50">
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
    const relatedTickets = getTicketsForCustomer(c.company || c.contactName);
    const subCustomers = getSubCustomers(c.id);
    const parent = c.parentId ? getParent(c.parentId) : null;
    const meta = TYPE_META[c.type] || TYPE_META.gercek;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border ${cardClass} shadow-2xl`}>
          <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-white'} p-6 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {displayName(c).charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{displayName(c)}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${meta.color} text-white`}>{meta.label}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {c.type === 'tuzel' ? c.contactName : c.company || ''}{c.sector ? ` · ${c.sector}` : ''}
                  </p>
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
            <div className={`space-y-3 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              {(c.phones || []).map((ph, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Phone size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ph}</p>
                </div>
              ))}
              {c.email && (
                <div className="flex items-center gap-2">
                  <Mail size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.email}</p>
                </div>
              )}
              {(c.addresses || []).filter(a => a.value).map((addr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <MapPin size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <div>
                    {addr.label && <span className={`text-xs font-semibold mr-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>[{addr.label}]</span>}
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{addr.value}</span>
                  </div>
                </div>
              ))}
              {c.sector && (
                <div className="flex items-center gap-2">
                  <Globe size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.sector}</p>
                </div>
              )}
            </div>

            {/* Type-specific fields */}
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50/80'}`}>
              {c.type === 'gercek' && c.tcNo && (
                <div><p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TC Kimlik No</p><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.tcNo}</p></div>
              )}
              {c.type === 'tuzel' && (
                <>
                  {c.vergiDairesi && <div><p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Vergi Dairesi</p><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.vergiDairesi}</p></div>}
                  {c.vergiNo && <div><p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Vergi No</p><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.vergiNo}</p></div>}
                </>
              )}
              {c.type === 'yabanci' && c.passportNo && (
                <div><p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Pasaport No</p><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.passportNo}</p></div>
              )}
            </div>

            {/* Parent customer */}
            {parent && (
              <div className={`p-3 rounded-xl flex items-center gap-2 cursor-pointer ${isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'bg-indigo-50 hover:bg-indigo-100'}`}
                onClick={() => setSelectedCustomer(parent)}>
                <ChevronRight size={14} className="text-indigo-500" />
                <span className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Üst Müşteri: <strong>{displayName(parent)}</strong></span>
              </div>
            )}

            {/* Sub customers */}
            {subCustomers.length > 0 && (
              <div>
                <h4 className={`text-sm font-semibold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Users size={15} /> Alt Müşteriler ({subCustomers.length})
                </h4>
                <div className="space-y-1.5">
                  {subCustomers.map(sc => {
                    const sm = TYPE_META[sc.type] || TYPE_META.gercek;
                    return (
                      <div key={sc.id} onClick={() => setSelectedCustomer(sc)}
                        className={`p-2.5 rounded-xl flex items-center gap-2 cursor-pointer ${isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${sm.color} flex items-center justify-center text-white text-xs font-bold`}>{sm.short}</div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{displayName(sc)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Şirket, kişi, e-posta veya telefon ara..."
                className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className={`${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
              <option value="all">Tüm Tipler</option>
              <option value="gercek">Gerçek Kişi</option>
              <option value="tuzel">Tüzel Kişi</option>
              <option value="yabanci">Yabancı</option>
            </select>
            {sectors.length > 0 && (
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                className={`${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
                <option value="all">Tüm Sektörler</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
              <Building2 size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Müşteri bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => {
                const ticketCount = getTicketsForCustomer(c.company || c.contactName).length;
                const meta = TYPE_META[c.type] || TYPE_META.gercek;
                const subs = getSubCustomers(c.id);
                return (
                  <div key={c.id} onClick={() => setSelectedCustomer(c)}
                    className={`${cardClass} rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-bold shrink-0`}>
                        {displayName(c).charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{displayName(c)}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r ${meta.color} text-white shrink-0`}>{meta.short}</span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {c.type === 'tuzel' ? c.contactName : c.company || c.sector || ''}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs space-y-1 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {c.phones?.[0] && <p className="flex items-center gap-1.5"><Phone size={12} /> {c.phones[0]}</p>}
                      {c.sector && <p className="flex items-center gap-1.5"><Globe size={12} /> {c.sector}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {subs.length > 0 && (
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Users size={12} /> {subs.length}
                          </span>
                        )}
                        {ticketCount > 0 && (
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Headphones size={12} /> {ticketCount}
                          </span>
                        )}
                      </div>
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
