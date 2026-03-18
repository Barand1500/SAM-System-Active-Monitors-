import { useState, useEffect } from 'react';
import {
  Plus, Phone, Building2, User, Tag, AlertCircle, Clock,
  Eye, UserPlus, CheckCircle2, X, ChevronRight, MessageSquare,
  Send, Search, Filter, Headphones, LogOut, FileText,
  AlertTriangle, Info, Wrench, HelpCircle, BarChart3,
  MapPin, ArrowLeft, Save, Loader2, RotateCcw, History
} from 'lucide-react';
import { supportTicketAPI, contactAPI } from '../services/api';

// Backend ↔ Frontend durum eşleştirmeleri
const STATUS_FROM_BACKEND = { open: 'new', in_progress: 'assigned', waiting_customer: 'assigned', resolved: 'resolved', closed: 'resolved' };
const STATUS_TO_BACKEND = { new: 'open', assigned: 'in_progress', resolved: 'resolved' };
const PRIORITY_FROM_BACKEND = { critical: 'urgent', high: 'high', medium: 'medium', low: 'low' };
const PRIORITY_TO_BACKEND = { urgent: 'critical', high: 'high', medium: 'medium', low: 'low' };

const backendToFrontendTicket = (t) => ({
  id: t.id,
  subject: t.title,
  description: t.description,
  status: STATUS_FROM_BACKEND[t.status] || 'new',
  priority: PRIORITY_FROM_BACKEND[t.priority] || 'medium',
  category: t.category || 'other',
  callerName: t.callerName || '',
  callerPhone: t.callerPhone || '',
  callerCompany: t.callerCompany || '',
  callerAddress: t.callerAddress,
  createdBy: t.creator ? { id: t.creator.id, firstName: t.creator.firstName, lastName: t.creator.lastName } : null,
  createdAt: t.createdAt || t.created_at,
  assignee: t.assignee ? { id: t.assignee.id, firstName: t.assignee.firstName, lastName: t.assignee.lastName } : null,
  assignedAt: t.updatedAt || t.updated_at,
  resolution: t.resolution,
  resolvedAt: t.resolvedAt || t.resolved_at || (t.status === 'resolved' ? (t.updatedAt || t.updated_at) : null),
  reopenCount: t.reopenCount || t.reopen_count || 0,
  notes: (t.TicketMessages || []).map(m => ({
    id: m.id,
    userId: m.userId,
    userName: m.User ? `${m.User.firstName} ${m.User.lastName}` : 'Bilinmeyen',
    text: m.messageText,
    at: m.createdAt || m.created_at
  })),
  helpers: [],
  viewers: [],
  history: []
});

const defaultContacts = [];

const formatPhoneNumber = (value) => {
  const raw = value.replace(/\D/g, '');
  const d = raw.startsWith('0') ? raw : '0' + raw;
  let f = '';
  for (let i = 0; i < d.length && i < 11; i++) {
    if (i === 4 || i === 7 || i === 9) f += ' ';
    f += d[i];
  }
  return f.trim();
};

const CreateForm = ({ contacts, setContacts, onCreateTicket, onCancel, isDark, inputClass, cardClass, priorities, categories }) => {
  const [step, setStep] = useState('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [ncName, setNcName] = useState('');
  const [ncCompany, setNcCompany] = useState('');
  const [ncAddresses, setNcAddresses] = useState([]);
  const [addrSearch, setAddrSearch] = useState('');
  const [addrName, setAddrName] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrNeighborhood, setAddrNeighborhood] = useState('');
  const [addrQuarter, setAddrQuarter] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('technical');

  const allAddresses = contacts.flatMap(c =>
    c.addresses.map(a => ({ ...a, contactName: c.name, contactCompany: c.company }))
  );

  const filteredAddresses = addrSearch.trim()
    ? allAddresses.filter(a => {
        const q = addrSearch.toLowerCase();
        return [a.name, a.city, a.district, a.neighborhood, a.quarter, a.buildingInfo]
          .some(field => (field || '').toLowerCase().includes(q));
      })
    : [];

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    setPhoneInput(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length >= 4) {
      setSearchResults(contacts.filter(c => c.phone.replace(/\D/g, '').includes(digits)));
    } else {
      setSearchResults([]);
    }
    setSelectedContact(null);
  };

  const selectContact = (contact) => {
    setSelectedContact(contact);
    setPhoneInput(contact.phone);
    if (contact.addresses.length > 0) setSelectedAddress(contact.addresses[0]);
    setStep('ticket');
  };

  const goNewContact = () => {
    setNcName('');
    setNcCompany('');
    setNcAddresses([]);
    setStep('new_contact');
  };

  const saveNewContact = async () => {
    if (!ncName.trim()) return;
    try {
      const res = await contactAPI.create({ name: ncName.trim(), phone: phoneInput, company: ncCompany.trim(), addresses: ncAddresses });
      const newC = res.data;
      setContacts(prev => [...prev, newC]);
      setSelectedContact(newC);
      if (newC.addresses && newC.addresses.length > 0) setSelectedAddress(newC.addresses[0]);
      setStep('ticket');
    } catch (err) {
      console.error('Kişi kaydedilemedi:', err);
    }
  };

  const resetAddrForm = () => {
    setAddrSearch(''); setAddrName(''); setAddrCity(''); setAddrDistrict('');
    setAddrNeighborhood(''); setAddrQuarter(''); setAddrBuilding('');
  };

  const selectSearchAddr = (a) => {
    setAddrName(a.name || ''); setAddrCity(a.city || ''); setAddrDistrict(a.district || '');
    setAddrNeighborhood(a.neighborhood || ''); setAddrQuarter(a.quarter || '');
    setAddrBuilding(a.buildingInfo || ''); setAddrSearch('');
  };

  const saveAddress = async () => {
    const addr = {
      id: Date.now(), name: addrName.trim(), city: addrCity.trim(), district: addrDistrict.trim(),
      neighborhood: addrNeighborhood.trim(), quarter: addrQuarter.trim(), buildingInfo: addrBuilding.trim()
    };
    if (step === 'new_contact') {
      setNcAddresses(prev => [...prev, addr]);
    } else if (selectedContact) {
      const updatedAddresses = [...selectedContact.addresses, addr];
      const updated = { ...selectedContact, addresses: updatedAddresses };
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? updated : c));
      setSelectedContact(updated);
      setSelectedAddress(addr);
      try {
        await contactAPI.update(selectedContact.id, { addresses: updatedAddresses });
      } catch (err) {
        console.error('Adres güncellenemedi:', err);
      }
    }
    setShowAddressForm(false);
    resetAddrForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    onCreateTicket({
      callerName: selectedContact.name, callerPhone: selectedContact.phone,
      callerCompany: selectedContact.company, callerAddress: selectedAddress,
      contactId: selectedContact.id, subject: subject.trim(), description: description.trim(),
      priority, category
    });
  };

  const renderAddressForm = () => (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'} space-y-3`}>
      <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <MapPin size={15} className="inline mr-1.5" /> Adres Ekle
      </h4>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={addrSearch} onChange={e => setAddrSearch(e.target.value)}
          placeholder="Adres ara..." className={`w-full ${inputClass} border rounded-xl px-4 py-2 pl-9 text-sm`} />
        {filteredAddresses.length > 0 && addrSearch && (
          <div className={`absolute z-10 w-full mt-1 rounded-xl border shadow-lg max-h-40 overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
            {filteredAddresses.map((a, i) => (
              <button key={i} type="button" onClick={() => selectSearchAddr(a)}
                className={`w-full text-left px-4 py-2.5 text-sm border-b last:border-b-0 ${isDark ? 'hover:bg-slate-700 text-slate-300 border-slate-700' : 'hover:bg-slate-50 text-slate-700 border-slate-100'}`}>
                <span className="font-medium">{a.name || 'Adres'}</span>
                <span className="text-xs opacity-70 ml-2">{[a.quarter, a.neighborhood, a.district, a.city].filter(Boolean).join(', ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input type="text" value={addrName} onChange={e => setAddrName(e.target.value)}
        placeholder="Adres Adı (ör: Merkez Ofis)" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
      <div className="grid grid-cols-2 gap-3">
        <input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)}
          placeholder="İl" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
        <input type="text" value={addrDistrict} onChange={e => setAddrDistrict(e.target.value)}
          placeholder="İlçe" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
        <input type="text" value={addrNeighborhood} onChange={e => setAddrNeighborhood(e.target.value)}
          placeholder="Semt" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
        <input type="text" value={addrQuarter} onChange={e => setAddrQuarter(e.target.value)}
          placeholder="Mahalle" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
      </div>
      <input type="text" value={addrBuilding} onChange={e => setAddrBuilding(e.target.value)}
        placeholder="Bina Bilgisi / Adres Tarifi" className={`w-full ${inputClass} border rounded-xl px-4 py-2 text-sm`} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setShowAddressForm(false); resetAddrForm(); }}
          className={`px-4 py-2 text-sm rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-100'}`}>
          İptal
        </button>
        <button type="button" onClick={saveAddress} disabled={!addrCity.trim()}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">
          <Save size={14} /> Kaydet
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
      <div className="flex items-center gap-2 mb-2">
        {step !== 'phone' && (
          <button type="button" onClick={() => setStep('phone')}
            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ArrowLeft size={18} />
          </button>
        )}
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {step === 'phone' ? 'Destek Talebi Oluştur' : step === 'new_contact' ? 'Yeni Müşteri Kaydı' : 'Talep Bilgileri'}
        </h3>
      </div>

      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Arayan Telefon Numarası *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={phoneInput} onChange={e => handlePhoneChange(e.target.value)}
                placeholder="0XXX XXX XX XX" maxLength={14}
                className={`w-full ${inputClass} border rounded-xl px-4 py-3 pl-10 text-base font-mono tracking-wider`} />
            </div>
          </div>
          {phoneInput.replace(/\D/g, '').length >= 4 && (
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                <>
                  <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <CheckCircle2 size={14} className="inline mr-1" /> {searchResults.length} kayıt bulundu
                  </p>
                  {searchResults.map(c => (
                    <button key={c.id} type="button" onClick={() => selectContact(c)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-700/50 border-slate-600 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.name}</p>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Building2 size={13} className="inline mr-1" />{c.company}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                            <Phone size={12} className="inline mr-1" />{c.phone}
                            {c.addresses.length > 0 && <span className="ml-3"><MapPin size={12} className="inline mr-1" />{c.addresses.length} adres</span>}
                          </p>
                        </div>
                        <ChevronRight size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    <AlertCircle size={14} className="inline mr-1.5" /> Numara bulunamadı
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/60' : 'text-amber-600'}`}>
                    Bu numaraya ait kayıt sistemde yok. Yeni kayıt oluşturabilirsiniz.
                  </p>
                  <button type="button" onClick={goNewContact}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700">
                    <UserPlus size={15} /> Yeni Kayıt Oluştur
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button type="button" onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              İptal
            </button>
          </div>
        </div>
      )}

      {step === 'new_contact' && (
        <div className="space-y-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} flex items-center gap-2`}>
            <Phone size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{phoneInput}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ad Soyad *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={ncName} onChange={e => setNcName(e.target.value)}
                  placeholder="Ad Soyad" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={ncCompany} onChange={e => setNcCompany(e.target.value)}
                  placeholder="Şirket adı" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 pl-9 text-sm`} />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MapPin size={14} className="inline mr-1" /> Adresler
              </label>
              {!showAddressForm && (
                <button type="button" onClick={() => setShowAddressForm(true)}
                  className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <Plus size={13} /> Adres Ekle
                </button>
              )}
            </div>
            {ncAddresses.length > 0 && (
              <div className="space-y-2 mb-3">
                {ncAddresses.map((a, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{a.name || 'Adres'}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {[a.quarter, a.neighborhood, a.district, a.city].filter(Boolean).join(', ')}
                      </p>
                      {a.buildingInfo && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{a.buildingInfo}</p>}
                    </div>
                    <button type="button" onClick={() => setNcAddresses(prev => prev.filter((_, idx) => idx !== i))}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showAddressForm && renderAddressForm()}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setStep('phone')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              Geri
            </button>
            <button type="button" onClick={saveNewContact} disabled={!ncName.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-1.5">
              <Save size={15} /> Kaydet ve Devam Et
            </button>
          </div>
        </div>
      )}

      {step === 'ticket' && selectedContact && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedContact.name}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedContact.company && <><Building2 size={13} className="inline mr-1" />{selectedContact.company} · </>}
                  <Phone size={13} className="inline mr-1" />{selectedContact.phone}
                </p>
              </div>
              <button type="button" onClick={() => { setStep('phone'); setSelectedContact(null); setSelectedAddress(null); }}
                className={`text-xs px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                Değiştir
              </button>
            </div>
          </div>

          {selectedContact.addresses.length > 0 && (
            <div>
              <label className={`block text-sm mb-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MapPin size={13} className="inline mr-1" /> Adres Seç
              </label>
              <div className="space-y-2">
                {selectedContact.addresses.map(addr => (
                  <button key={addr.id} type="button" onClick={() => setSelectedAddress(addr)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedAddress?.id === addr.id
                        ? isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-400 bg-indigo-50'
                        : isDark ? 'border-slate-600 bg-slate-700/30 hover:border-slate-500' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{addr.name || 'Adres'}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {[addr.quarter, addr.neighborhood, addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>
                    {addr.buildingInfo && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{addr.buildingInfo}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showAddressForm ? (
            <button type="button" onClick={() => setShowAddressForm(true)}
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Plus size={13} /> Yeni Adres Ekle
            </button>
          ) : renderAddressForm()}

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Konu / Başlık *</label>
            <input type="text" required value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Kısa özet" className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detaylı Açıklama *</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)}
              rows={4} placeholder="Sorunu detaylı olarak açıklayınız..."
              className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Öncelik</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`}>
                {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              İptal
            </button>
            <button type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
              Destek Talebi Oluştur
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const SupportSystem = ({ user, isBoss, canManage, isDark }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pool');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [contacts, setContacts] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await supportTicketAPI.list();
      setTickets((res.data || []).map(backendToFrontendTicket));
    } catch (err) {
      console.error('Ticket yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { contactAPI.list().then(res => setContacts(res.data || [])).catch(() => {}); }, []);
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
    if (!isoDate) return '–';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '–';
    
    const diff = currentTime - date.getTime();
    if (diff < 0) return 'Az önce';
    
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins} dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa ${mins % 60} dk`;
    const days = Math.floor(hours / 24);
    return `${days} gün ${hours % 24} sa`;
  };

  const getUrgencyColor = (isoDate) => {
    if (!isoDate) return isDark ? 'border-gray-500/40' : 'border-gray-300';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isDark ? 'border-gray-500/40' : 'border-gray-300';
    
    const hours = (currentTime - date.getTime()) / 3600000;
    if (hours < 0) return isDark ? 'border-gray-500/40' : 'border-gray-300';
    if (hours < 1) return isDark ? 'border-emerald-500/40' : 'border-emerald-300';
    if (hours < 4) return isDark ? 'border-amber-500/40' : 'border-amber-300';
    return isDark ? 'border-red-500/40' : 'border-red-300';
  };

  // Actions
  const createTicket = async (data) => {
    try {
      await supportTicketAPI.create({
        title: data.subject,
        description: data.description,
        priority: PRIORITY_TO_BACKEND[data.priority] || data.priority,
        category: data.category,
        callerName: data.callerName,
        callerPhone: data.callerPhone,
        callerCompany: data.callerCompany,
        callerAddress: data.callerAddress,
      });
      await fetchTickets();
      setView('pool');
    } catch (err) {
      console.error('Ticket oluşturma hatası:', err);
    }
  };

  const viewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const claimTicket = async (ticketId) => {
    try {
      await supportTicketAPI.assign(ticketId, user.id);
      await supportTicketAPI.updateStatus(ticketId, { status: 'in_progress' });
      await fetchTickets();
    } catch (err) {
      console.error('Ticket alma hatası:', err);
    }
  };

  const leaveTicket = async (ticketId) => {
    try {
      await supportTicketAPI.update(ticketId, { assignedTo: null });
      await supportTicketAPI.updateStatus(ticketId, { status: 'open' });
      await fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Ticket bırakma hatası:', err);
    }
  };

  const helpTicket = (ticketId) => {
    // Yardımcı özelliği henüz backend'de yok, lokal çalışıyor
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      if (t.helpers.some(h => h.id === user.id)) return t;
      return {
        ...t,
        helpers: [...t.helpers, { id: user.id, firstName: user.firstName, lastName: user.lastName, joinedAt: new Date().toISOString() }],
      };
    }));
  };

  const addNote = async (ticketId, text) => {
    try {
      await supportTicketAPI.addMessage(ticketId, { messageText: text, isInternal: true });
      await fetchTickets();
    } catch (err) {
      console.error('Not ekleme hatası:', err);
    }
  };

  const resolveTicket = async (ticketId, resolutionText) => {
    try {
      await supportTicketAPI.updateStatus(ticketId, { status: 'resolved', resolution: resolutionText });
      await fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Ticket çözme hatası:', err);
    }
  };

  const reopenTicket = async (ticketId, reopenReason) => {
    try {
      await supportTicketAPI.reopen(ticketId, { reopenReason });
      await fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Ticket tekrar açma hatası:', err);
    }
  };

  const fetchResolutionHistory = async (ticketId) => {
    try {
      const res = await supportTicketAPI.getResolutionHistory(ticketId);
      return res.data || [];
    } catch (err) {
      console.error('Geçmiş yükleme hatası:', err);
      return [];
    }
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
      ? Math.round(resolvedTickets.reduce((sum, t) => {
          const resolved = new Date(t.resolvedAt);
          const created = new Date(t.createdAt);
          if (isNaN(resolved.getTime()) || isNaN(created.getTime())) return sum;
          return sum + (resolved - created) / 3600000;
        }, 0) / resolvedTickets.length)
      : 0
  };

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

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
            {ticket.reopenCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                {ticket.reopenCount}x
              </span>
            )}
          </div>
        </div>
        {/* Description preview */}
        <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.description}</p>
        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Timer */}
            <span className={`flex items-center gap-1 font-medium ${
              (() => {
                const created = new Date(ticket.createdAt);
                if (isNaN(created.getTime())) return isDark ? 'text-slate-400' : 'text-slate-500';
                const elapsed = currentTime - created.getTime();
                if (elapsed > 14400000) return 'text-red-500';
                if (elapsed > 3600000) return 'text-amber-500';
                return isDark ? 'text-emerald-400' : 'text-emerald-600';
              })()
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
    const [showReopen, setShowReopen] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [resolutionHistory, setResolutionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
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

    const handleReopen = () => {
      reopenTicket(t.id, reopenReason.trim() || null);
    };

    const loadHistory = async () => {
      if (showHistory) { setShowHistory(false); return; }
      setHistoryLoading(true);
      const h = await fetchResolutionHistory(t.id);
      setResolutionHistory(h);
      setShowHistory(true);
      setHistoryLoading(false);
    };

    const fmtDuration = (seconds) => {
      if (!seconds || seconds <= 0) return '–';
      const mins = Math.floor(seconds / 60);
      if (mins < 1) return 'Az önce';
      if (mins < 60) return `${mins} dk`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} sa ${mins % 60} dk`;
      const days = Math.floor(hrs / 24);
      return `${days} gün ${hrs % 24} sa`;
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
                    {t.reopenCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                        <RotateCcw size={10} className="inline mr-1" />{t.reopenCount}x açıldı
                      </span>
                    )}
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
              {t.status === 'resolved' && (
                <>
                  <button onClick={() => setShowReopen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 flex items-center gap-1.5">
                    <RotateCcw size={15} /> Tekrar Aç
                  </button>
                  <button onClick={loadHistory} disabled={historyLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 ${showHistory ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {historyLoading ? <Loader2 size={15} className="animate-spin" /> : <History size={15} />}
                    Geçmiş {t.reopenCount > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${showHistory ? 'bg-white/20' : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>{t.reopenCount}</span>}
                  </button>
                </>
              )}
              {t.reopenCount > 0 && t.status !== 'resolved' && (
                <button onClick={loadHistory} disabled={historyLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 ${showHistory ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {historyLoading ? <Loader2 size={15} className="animate-spin" /> : <History size={15} />}
                  Geçmiş <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${showHistory ? 'bg-white/20' : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>{t.reopenCount}</span>
                </button>
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

            {/* Reopen form */}
            {showReopen && (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Talebi Tekrar Aç</h4>
                <p className={`text-xs mb-3 ${isDark ? 'text-amber-300/60' : 'text-amber-600'}`}>Mevcut çözüm geçmişe kaydedilecek ve talep tekrar destek havuzuna düşecektir.</p>
                <textarea value={reopenReason} onChange={e => setReopenReason(e.target.value)}
                  rows={2} placeholder="Tekrar açma sebebini yazabilirsiniz (opsiyonel)..."
                  className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none mb-3`} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowReopen(false)} className={`px-4 py-2 text-sm rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>İptal</button>
                  <button onClick={handleReopen}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-700">
                    Tekrar Aç
                  </button>
                </div>
              </div>
            )}

            {/* Resolution History */}
            {showHistory && (
              <div className={`rounded-xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'}`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-indigo-500/20' : 'border-indigo-200'} flex items-center gap-2`}>
                  <History size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                  <h4 className={`font-semibold text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Çözüm Geçmişi</h4>
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>{resolutionHistory.length}</span>
                </div>
                {resolutionHistory.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Henüz geçmiş çözüm kaydı yok</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {resolutionHistory.map((h, i) => (
                      <div key={h.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>{h.cycleNumber || h.cycle_number}</span>
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{i + 1}. Çözüm Döngüsü</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
                            {fmtDuration(h.durationSeconds || h.duration_seconds)}
                          </span>
                        </div>
                        {/* Resolution */}
                        {h.resolution && (
                          <div className={`mb-3 p-3 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Çözüm</p>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{h.resolution}</p>
                          </div>
                        )}
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Çözen</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {h.resolver ? `${h.resolver.firstName} ${h.resolver.lastName}` : '–'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Çözüm Tarihi</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {h.resolvedAt || h.resolved_at ? new Date(h.resolvedAt || h.resolved_at).toLocaleString('tr-TR') : '–'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tekrar Açan</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                              {h.reopener ? `${h.reopener.firstName} ${h.reopener.lastName}` : '–'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tekrar Açılma</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {h.reopenedAt || h.reopened_at ? new Date(h.reopenedAt || h.reopened_at).toLocaleString('tr-TR') : '–'}
                            </p>
                          </div>
                        </div>
                        {/* Reopen Reason */}
                        {(h.reopenReason || h.reopen_reason) && (
                          <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Tekrar Açma Sebebi</p>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{h.reopenReason || h.reopen_reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Caller Info */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} space-y-3`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {t.callerAddress && (
                <div className="flex items-start gap-2 pt-2 border-t border-dashed" style={{borderColor: isDark ? '#475569' : '#e2e8f0'}}>
                  <MapPin size={16} className={`mt-0.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Adres {t.callerAddress.name && `(${t.callerAddress.name})`}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {[t.callerAddress.quarter, t.callerAddress.neighborhood, t.callerAddress.district, t.callerAddress.city].filter(Boolean).join(', ')}
                    </p>
                    {t.callerAddress.buildingInfo && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.callerAddress.buildingInfo}</p>}
                  </div>
                </div>
              )}
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
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.status === 'resolved' ? 'Toplam Süre' : 'Boşta Süresi'}</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.status === 'resolved' && t.resolvedAt ? (() => {
                  const rd = new Date(t.resolvedAt);
                  const cd = new Date(t.createdAt);
                  if (isNaN(rd.getTime()) || isNaN(cd.getTime())) return '–';
                  const diff = rd - cd;
                  if (diff < 0) return '–';
                  const mins = Math.floor(diff / 60000);
                  if (mins < 1) return 'Az önce';
                  if (mins < 60) return `${mins} dk`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs} sa ${mins % 60} dk`;
                  const days = Math.floor(hrs / 24);
                  return `${days} gün ${hrs % 24} sa`;
                })() : formatElapsed(t.createdAt)}</p>
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
                {t.resolvedAt && <p className={`text-xs mt-1 ${isDark ? 'text-purple-400/50' : 'text-purple-500'}`}>Çözüm süresi: {(() => {
                  const rd = new Date(t.resolvedAt);
                  const cd = new Date(t.createdAt);
                  if (isNaN(rd.getTime()) || isNaN(cd.getTime())) return '–';
                  const diff = rd - cd;
                  if (diff < 0) return '–';
                  const h = Math.floor(diff / 3600000);
                  const m = Math.floor((diff % 3600000) / 60000);
                  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
                })()}</p>}
              </div>
            )}

            {/* Activity Timeline */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Aktivite Geçmişi</h4>
              <div className="space-y-0">
                {t.history.map((h, i, arr) => {
                  const hi = historyIcons[h.type] || historyIcons.created;
                  const HIcon = hi.icon;
                  
                  const prevDate = i > 0 ? arr[i - 1]?.at : null;
                  const curDate = h?.at;
                  const prevTime = prevDate ? new Date(prevDate) : null;
                  const curTime = curDate ? new Date(curDate) : null;
                  
                  const elapsedFromPrev = (prevTime && curTime && !isNaN(prevTime.getTime()) && !isNaN(curTime.getTime()) && curTime >= prevTime) 
                    ? curTime - prevTime 
                    : 0;
                  
                  const fmtElapsed = (ms) => {
                    if (!ms || ms < 0) return null;
                    const mins = Math.floor(ms / 60000);
                    if (mins < 1) return 'anında';
                    if (mins < 60) return `${mins} dk sonra`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs} sa ${mins % 60} dk sonra`;
                    const days = Math.floor(hrs / 24);
                    return `${days} gün ${hrs % 24} sa sonra`;
                  };
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-lg ${hi.bg} flex items-center justify-center shrink-0`}>
                          <HIcon size={14} className={hi.color} />
                        </div>
                        {i < arr.length - 1 && <div className={`w-0.5 flex-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="font-medium">{h.userName}</span> {hi.label.toLowerCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {curTime && !isNaN(curTime.getTime()) ? curTime.toLocaleString('tr-TR') : '–'}
                          </p>
                          {i > 0 && elapsedFromPrev > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                              {fmtElapsed(elapsedFromPrev)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {t.status === 'resolved' && t.resolvedAt && (
                <div className={`mt-2 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                  <Clock size={15} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                  <span className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    Toplam çözüm süresi: {(() => {
                      const resolvedDate = new Date(t.resolvedAt);
                      const createdDate = new Date(t.createdAt);
                      if (isNaN(resolvedDate.getTime()) || isNaN(createdDate.getTime())) return '–';
                      
                      const diff = resolvedDate - createdDate;
                      if (diff < 0) return '–';
                      
                      const mins = Math.floor(diff / 60000);
                      if (mins < 60) return `${mins} dakika`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs} saat ${mins % 60} dakika`;
                      const days = Math.floor(hrs / 24);
                      return `${days} gün ${hrs % 24} saat`;
                    })()}
                  </span>
                </div>
              )}
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
          const resolvedDate = new Date(t.resolvedAt);
          const createdDate = new Date(t.createdAt);
          const validDates = !isNaN(resolvedDate.getTime()) && !isNaN(createdDate.getTime());
          const resolveDiff = validDates ? resolvedDate - createdDate : 0;
          const rHours = Math.floor(resolveDiff / 3600000);
          const rMins = Math.floor((resolveDiff % 3600000) / 60000);
          const resolveTime = !validDates ? '–' : rHours > 0 ? `${rHours} sa ${rMins} dk` : `${rMins} dk`;
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
              {t.reopenCount > 0 && (
                <div className={`flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                  <RotateCcw size={12} /> {t.reopenCount} kez tekrar açıldı
                </div>
              )}
              {t.resolution && (
                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="font-medium">Çözüm: </span>{t.resolution}
                </p>
              )}
              <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Çözen: <span className="font-medium">{t.assignee?.firstName} {t.assignee?.lastName}</span></span>
                {t.helpers.length > 0 && <span>Yardımcılar: {t.helpers.map(h => `${h.firstName} ${h.lastName}`).join(', ')}</span>}
                <span>{t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString('tr-TR') : new Date(t.createdAt).toLocaleDateString('tr-TR')}</span>
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
      {view === 'create' && <CreateForm contacts={contacts} setContacts={setContacts} onCreateTicket={createTicket} onCancel={() => setView('pool')} isDark={isDark} inputClass={inputClass} cardClass={cardClass} priorities={priorities} categories={categories} />}
      {view === 'pool' && (
        loading ? (
          <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
            <Loader2 size={40} className={`mx-auto mb-3 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yükleniyor...</p>
          </div>
        ) : filteredPool.length === 0 ? (
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
