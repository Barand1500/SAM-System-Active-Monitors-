import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Plus, Edit, Trash2, CheckCircle2, Shield, ChevronDown,
  Phone, Mail, Globe, MapPin, FileText, Banknote, Hash, Users,
  AlertTriangle, Tag, Palette, Crown, UserCog, ClipboardList, Pipette,
  Eye, EyeOff, Info
} from 'lucide-react';

// Hazır Renkler
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9',
];

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Telefon formatlaması (0XXX XXX XX XX)
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
};

// ===== YARDIMCI BİLEŞENLER =====
const CollapsibleSection = ({ isDark, title, subtitle, icon: Icon, gradient, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

const ColorPicker = ({ value, onChange, isDark }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert('Tarayıcınız renk damlalığı özelliğini desteklemiyor. Chrome/Edge kullanmayı deneyin.');
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
      setCustomColor(result.sRGBHex);
    } catch (e) {
      // Kullanıcı iptal etti veya hata oluştu
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
        style={{ backgroundColor: value }}
        title="Renk seçin"
      />
      {showPicker && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowPicker(false)} />
          <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[101] p-3 rounded-xl shadow-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} style={{ width: '240px' }}>
            <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hazır Renkler</p>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { onChange(color); setCustomColor(color); }}
                  className={`w-5 h-5 rounded-md transition-all hover:scale-110 ${value === color ? 'ring-2 ring-indigo-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className={`pt-2.5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Özel Renk</p>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); onChange(e.target.value); }}
                  className="w-8 h-8 rounded-md cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomColor(v);
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
                  }}
                  className={`flex-1 text-[11px] font-mono px-2 py-1.5 rounded-md border ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  maxLength={7}
                />
              </div>
              <button
                type="button"
                onClick={handleEyeDropper}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-xs font-medium transition-all ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
              >
                <Pipette size={13} />
                <span>Damlalık</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== ANA BİLEŞEN =====
const AdminPanel = ({ isDark, departments: initialDepartments }) => {
  const { company, updateCompany } = useAuth();
  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  // ===== ŞİRKET PROFİLİ =====
  const [companyProfile, setCompanyProfile] = useState(() => loadFromStorage('sam_company_profile', {
    unvan: 'GÜZEL İÇ VE DIŞ TİCARET LİMİTED ŞİRKETİ',
    adresler: [
      { id: 1, label: 'Merkez', mahalle: 'Yeni Emek', sokak: 'Yıldırım Beyazıt Cad.', binaNo: '130A', ilce: 'Kepez', il: 'Antalya', postaKodu: '', visible: true },
      { id: 2, label: 'Teknopark', mahalle: '2000 Evler', sokak: 'Üniversite Alanı (Küme Evleri)', binaNo: 'Dış Kapı No:13 İç Kapı No:131', ilce: 'Merkez', il: 'Nevşehir', postaKodu: '', visible: false },
    ],
    vergiDairesi: 'Antalya Kurumlar',
    vergiNo: '9250508945',
    telefonlar: [
      { id: 1, label: 'Merkez Sabit', value: '0850 885 11 60', visible: true },
      { id: 2, label: 'Merkez GSM (7/24)', value: '0543 885 11 60', visible: true },
      { id: 3, label: 'Teknopark Sabit', value: '0850 885 12 60', visible: false },
      { id: 4, label: 'Teknopark GSM (7/24)', value: '0540 885 12 60', visible: false },
    ],
    websites: [
      { id: 1, label: 'Ana Site', value: 'www.guzelteknoloji.com', visible: true },
    ],
    emails: [
      { id: 1, label: 'Genel', value: 'bilgi@guzelteknoloji.com', visible: true },
    ],
    mersisNo: '0925050894500018',
    ticaretSicilNo: '99725',
    ticaretOdasi: 'ANTALYA TİCARET VE SANAYİ ODASI',
    odaSicilNo: '101039',
    visibility: {
      unvan: true,
      vergiDairesi: false,
      vergiNo: false,
      mersisNo: false,
      ticaretSicilNo: false,
      ticaretOdasi: true,
      odaSicilNo: false,
    }
  }));
  const [profileSaved, setProfileSaved] = useState(false);

  const updateProfile = (field, value) => {
    setCompanyProfile(prev => ({ ...prev, [field]: value }));
    setProfileSaved(false);
  };

  const toggleVisibility = (field) => {
    setCompanyProfile(prev => ({
      ...prev,
      visibility: { ...prev.visibility, [field]: !prev.visibility[field] }
    }));
    setProfileSaved(false);
  };

  const saveProfile = () => {
    saveToStorage('sam_company_profile', companyProfile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Dinamik liste yardımcıları
  const addDynamicItem = (listKey) => {
    let newItem = { id: Date.now(), label: '', visible: true };
    
    if (listKey === 'adresler') {
      newItem = { id: Date.now(), label: '', mahalle: '', sokak: '', binaNo: '', ilce: '', il: '', postaKodu: '', visible: true };
    } else if (listKey === 'telefonlar' || listKey === 'emails' || listKey === 'websites') {
      newItem = { id: Date.now(), label: '', value: '', visible: true };
    }
    
    setCompanyProfile(prev => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), newItem]
    }));
    setProfileSaved(false);
  };

  const removeDynamicItem = (listKey, id) => {
    setCompanyProfile(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter(item => item.id !== id)
    }));
    setProfileSaved(false);
  };

  const updateDynamicItem = (listKey, id, field, val) => {
    // Telefon formatlaması
    if (listKey === 'telefonlar' && field === 'value') {
      val = formatPhone(val);
    }
    
    setCompanyProfile(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
    setProfileSaved(false);
  };

  const toggleItemVisibility = (listKey, id) => {
    setCompanyProfile(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    }));
    setProfileSaved(false);
  };

  // ===== DEPARTMAN YÖNETİMİ =====
  const [deptList, setDeptList] = useState(() => loadFromStorage('sam_departments', initialDepartments));
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#6366f1');
  const [editingDept, setEditingDept] = useState(null);

  useEffect(() => { saveToStorage('sam_departments', deptList); }, [deptList]);

  const addDepartment = () => {
    if (!newDeptName.trim()) return;
    setDeptList(prev => [...prev, { id: Date.now(), name: newDeptName.trim(), color: newDeptColor, employeeCount: 0 }]);
    setNewDeptName('');
    setNewDeptColor('#6366f1');
  };
  const removeDepartment = (id) => setDeptList(prev => prev.filter(d => d.id !== id));
  const updateDepartment = (id, updates) => { setDeptList(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); setEditingDept(null); };

  // ===== ÖNCELİK YÖNETİMİ =====
  const defaultPriorities = [
    { id: 'low', label: 'Düşük', color: '#94a3b8' },
    { id: 'medium', label: 'Orta', color: '#3b82f6' },
    { id: 'high', label: 'Yüksek', color: '#f59e0b' },
    { id: 'urgent', label: 'Acil', color: '#ef4444' },
  ];
  const [priorityList, setPriorityList] = useState(() => loadFromStorage('sam_priorities', defaultPriorities));
  const [newPriorityLabel, setNewPriorityLabel] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#6366f1');
  const [editingPriority, setEditingPriority] = useState(null);

  useEffect(() => { saveToStorage('sam_priorities', priorityList); }, [priorityList]);

  const addPriority = () => {
    if (!newPriorityLabel.trim()) return;
    const id = newPriorityLabel.trim().toLowerCase().replace(/\s+/g, '_');
    setPriorityList(prev => [...prev, { id, label: newPriorityLabel.trim(), color: newPriorityColor }]);
    setNewPriorityLabel('');
    setNewPriorityColor('#6366f1');
  };
  const removePriority = (id) => setPriorityList(prev => prev.filter(p => p.id !== id));
  const updatePriority = (id, updates) => { setPriorityList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); setEditingPriority(null); };

  // ===== ROL YÖNETİMİ =====
  const defaultRoles = [
    { id: 'boss', label: 'Patron', color: '#f59e0b', permissions: ['all'] },
    { id: 'manager', label: 'Yönetici', color: '#6366f1', permissions: ['manage_tasks', 'manage_employees', 'view_reports'] },
    { id: 'employee', label: 'Çalışan', color: '#10b981', permissions: ['view_tasks', 'update_own_tasks'] },
  ];
  const [roleList, setRoleList] = useState(() => loadFromStorage('sam_roles', defaultRoles));
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#6366f1');
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => { saveToStorage('sam_roles', roleList); }, [roleList]);

  const addRole = () => {
    if (!newRoleLabel.trim()) return;
    const id = newRoleLabel.trim().toLowerCase().replace(/\s+/g, '_');
    setRoleList(prev => [...prev, { id, label: newRoleLabel.trim(), color: newRoleColor, permissions: [] }]);
    setNewRoleLabel('');
    setNewRoleColor('#6366f1');
  };
  const removeRole = (id) => {
    if (['boss', 'manager', 'employee'].includes(id)) return;
    setRoleList(prev => prev.filter(r => r.id !== id));
  };
  const updateRole = (id, updates) => { setRoleList(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r)); setEditingRole(null); };

  // ===== DURUM YÖNETİMİ =====
  const defaultStatuses = [
    { id: 'pending', label: 'Bekliyor', color: '#94a3b8', order: 1 },
    { id: 'in_progress', label: 'Devam Ediyor', color: '#3b82f6', order: 2 },
    { id: 'review', label: 'İncelemede', color: '#8b5cf6', order: 3 },
    { id: 'completed', label: 'Tamamlandı', color: '#10b981', order: 4 },
    { id: 'cancelled', label: 'İptal', color: '#ef4444', order: 5 },
  ];
  const [statusList, setStatusList] = useState(() => loadFromStorage('sam_statuses', defaultStatuses));
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#6366f1');
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => { saveToStorage('sam_statuses', statusList); }, [statusList]);

  const addStatus = () => {
    if (!newStatusLabel.trim()) return;
    const id = newStatusLabel.trim().toLowerCase().replace(/\s+/g, '_');
    setStatusList(prev => [...prev, { id, label: newStatusLabel.trim(), color: newStatusColor, order: prev.length + 1 }]);
    setNewStatusLabel('');
    setNewStatusColor('#6366f1');
  };
  const removeStatus = (id) => {
    if (['pending', 'in_progress', 'completed'].includes(id)) return;
    setStatusList(prev => prev.filter(s => s.id !== id));
  };
  const updateStatus = (id, updates) => { setStatusList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); setEditingStatus(null); };

  // ===== RENDER HELPERS =====
  const renderListItem = ({ item, isEditing, onEdit, onUpdate, onRemove, isProtected = false }) => (
    <div key={item.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            defaultValue={item.label || item.name}
            className={`flex-1 ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-lg px-3 py-1.5 text-sm`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUpdate(item.id, item.label !== undefined ? { label: e.target.value } : { name: e.target.value });
              if (e.key === 'Escape') onEdit(null);
            }}
            autoFocus
          />
          <ColorPicker value={item.color} onChange={(c) => onUpdate(item.id, { color: c })} isDark={isDark} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label || item.name}</span>
            {isProtected && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>Varsayılan</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(item.id)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
              <Edit size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            </button>
            {!isProtected && (
              <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                <Trash2 size={14} className="text-red-500" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderAddForm = ({ value, setValue, color, setColor, onAdd, placeholder, buttonColor = 'bg-indigo-500 hover:bg-indigo-600' }) => (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 ${inputClass} border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
      />
      <ColorPicker value={color} onChange={setColor} isDark={isDark} />
      <button
        onClick={onAdd}
        className={`px-4 py-2.5 ${buttonColor} text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1`}
      >
        <Plus size={16} />
        Ekle
      </button>
    </div>
  );

  // ===== VISIBILITY TOGGLE =====
  const VisibilityToggle = ({ field, label }) => {
    const isVisible = companyProfile.visibility?.[field];
    return (
      <button
        type="button"
        onClick={() => toggleVisibility(field)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          isVisible 
            ? isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
        title={isVisible ? `${label} - Çalışanlar görebilir` : `${label} - Çalışanlar göremez (sadece patron)`}
      >
        {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
        <span>{isVisible ? 'Görünür' : 'Gizli'}</span>
      </button>
    );
  };

  // ===== FIELD HELPER =====
  const ProfileField = ({ label, icon: FieldIcon, value, field, placeholder, type = 'text', showVisibility = false }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <FieldIcon size={13} />
          {label}
        </label>
        {showVisibility && <VisibilityToggle field={field} label={label} />}
      </div>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => updateProfile(field, e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => updateProfile(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Şirket Ayarları</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket bilgileri, departmanlar, roller, durumlar ve öncelikleri yönetin</p>
        </div>
      </div>

      {/* ===== ŞİRKET PROFİLİ ===== */}
      <CollapsibleSection isDark={isDark} title="Şirket Profili" subtitle="Ünvan, adresler, iletişim ve ticari bilgiler" icon={Building2} gradient="from-blue-500 to-cyan-500" defaultOpen={true}>
        <div className="space-y-5">
          {/* Görünürlük Bilgilendirmesi */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Info size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold mb-1.5">👁️ Görünürlük Kontrolleri</p>
              <p className={isDark ? 'text-blue-200/80' : 'text-blue-600/90'}>
                Her alanın ve her kaydın yanındaki <Eye size={14} className="inline mx-0.5 text-emerald-500" /> simgesine tıklayarak 
                o bilginin çalışanlar tarafından görülüp görülmeyeceğini belirleyebilirsiniz. 
                <span className="font-semibold"><Eye size={14} className="inline mx-0.5 text-emerald-500" /> Yeşil</span> = Herkes görebilir, 
                <span className="font-semibold"><EyeOff size={14} className="inline mx-0.5 text-slate-400" /> Gri</span> = Sadece patronlar görebilir.
              </p>
              <p className={`text-xs mt-2 ${isDark ? 'text-blue-300/70' : 'text-blue-600/70'}`}>
                💡 <strong>Örnek:</strong> "Merkez Adres" herkese açık, "Özel Ofis" sadece patronlara görünür yapabilirsiniz. 
                Her telefon, adres, email ve web sitesi için ayrı ayrı kontrol edebilirsiniz.
              </p>
            </div>
          </div>

          {/* Ünvan */}
          <ProfileField label="Ünvan" icon={FileText} value={companyProfile.unvan} field="unvan" placeholder="Şirket ünvanı..." showVisibility={true} />

          {/* Dinamik Adresler */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <MapPin size={14} /> Adresler
              </p>
              <button
                type="button"
                onClick={() => addDynamicItem('adresler')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} /> Adres Ekle
              </button>
            </div>
            <div className="space-y-4">
              {companyProfile.adresler.map((addr) => (
                <div key={addr.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-600' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={addr.label}
                      onChange={(e) => updateDynamicItem('adresler', addr.id, 'label', e.target.value)}
                      placeholder="Adres Adı (ör. Merkez, Şube, Depo...)"
                      className={`flex-1 ${inputClass} border rounded-lg px-3 py-2 text-sm font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleItemVisibility('adresler', addr.id)}
                      className={`p-2 rounded-lg transition-all ${addr.visible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                      title={addr.visible ? 'Çalışanlar görebilir' : 'Çalışanlar göremez (sadece patron)'}
                    >
                      {addr.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDynamicItem('adresler', addr.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mahalle</label>
                      <input
                        type="text"
                        value={addr.mahalle}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'mahalle', e.target.value)}
                        placeholder="ör. Yeni Emek"
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sokak / Cadde</label>
                      <input
                        type="text"
                        value={addr.sokak}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'sokak', e.target.value)}
                        placeholder="ör. Atatürk Cad."
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bina No / Diğer</label>
                      <input
                        type="text"
                        value={addr.binaNo}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'binaNo', e.target.value)}
                        placeholder="ör. No: 42, Kat: 3, Daire: 5"
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>İlçe</label>
                      <input
                        type="text"
                        value={addr.ilce}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'ilce', e.target.value)}
                        placeholder="ör. Kepez"
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>İl / Şehir</label>
                      <input
                        type="text"
                        value={addr.il}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'il', e.target.value)}
                        placeholder="ör. Antalya"
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Posta Kodu (Opsiyonel)</label>
                      <input
                        type="text"
                        value={addr.postaKodu}
                        onChange={(e) => updateDynamicItem('adresler', addr.id, 'postaKodu', e.target.value)}
                        placeholder="ör. 07070"
                        maxLength={5}
                        className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {companyProfile.adresler.length === 0 && (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz adres eklenmedi</p>
              )}
            </div>
          </div>

          {/* Vergi Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField label="Vergi Dairesi" icon={Banknote} value={companyProfile.vergiDairesi} field="vergiDairesi" placeholder="Vergi dairesi..." showVisibility={true} />
            <ProfileField label="Vergi No" icon={Hash} value={companyProfile.vergiNo} field="vergiNo" placeholder="Vergi numarası..." showVisibility={true} />
          </div>

          {/* Dinamik Telefonlar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Phone size={14} /> Telefon Numaraları
              </p>
              <button
                type="button"
                onClick={() => addDynamicItem('telefonlar')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} /> Telefon Ekle
              </button>
            </div>
            <div className="space-y-2">
              {companyProfile.telefonlar.map((tel) => (
                <div key={tel.id} className={`flex gap-2 items-center p-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-white'}`}>
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={tel.label}
                      onChange={(e) => updateDynamicItem('telefonlar', tel.id, 'label', e.target.value)}
                      placeholder="ör. Sabit, GSM..."
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={tel.value}
                      onChange={(e) => updateDynamicItem('telefonlar', tel.id, 'value', e.target.value)}
                      placeholder="0XXX XXX XX XX"
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItemVisibility('telefonlar', tel.id)}
                    className={`p-2 rounded-lg transition-all shrink-0 ${tel.visible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                    title={tel.visible ? 'Çalışanlar görebilir' : 'Çalışanlar göremez (sadece patron)'}
                  >
                    {tel.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDynamicItem('telefonlar', tel.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              ))}
              {companyProfile.telefonlar.length === 0 && (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz telefon eklenmedi</p>
              )}
            </div>
          </div>

          {/* Dinamik Web Siteleri */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Globe size={14} /> Web Siteleri
              </p>
              <button
                type="button"
                onClick={() => addDynamicItem('websites')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} /> Web Sitesi Ekle
              </button>
            </div>
            <div className="space-y-2">
              {companyProfile.websites.map((site) => (
                <div key={site.id} className={`flex gap-2 items-center p-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-white'}`}>
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={site.label}
                      onChange={(e) => updateDynamicItem('websites', site.id, 'label', e.target.value)}
                      placeholder="ör. Ana Site, Blog..."
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={site.value}
                      onChange={(e) => updateDynamicItem('websites', site.id, 'value', e.target.value)}
                      placeholder="www.example.com"
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItemVisibility('websites', site.id)}
                    className={`p-2 rounded-lg transition-all shrink-0 ${site.visible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                    title={site.visible ? 'Çalışanlar görebilir' : 'Çalışanlar göremez (sadece patron)'}
                  >
                    {site.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDynamicItem('websites', site.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              ))}
              {companyProfile.websites.length === 0 && (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz web sitesi eklenmedi</p>
              )}
            </div>
          </div>

          {/* Dinamik E-postalar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Mail size={14} /> E-posta Adresleri
              </p>
              <button
                type="button"
                onClick={() => addDynamicItem('emails')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} /> E-posta Ekle
              </button>
            </div>
            <div className="space-y-2">
              {companyProfile.emails.map((email) => (
                <div key={email.id} className={`flex gap-2 items-center p-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-white'}`}>
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={email.label}
                      onChange={(e) => updateDynamicItem('emails', email.id, 'label', e.target.value)}
                      placeholder="ör. Genel, Destek..."
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email.value}
                      onChange={(e) => updateDynamicItem('emails', email.id, 'value', e.target.value)}
                      placeholder="bilgi@example.com"
                      className={`w-full ${inputClass} border rounded-lg px-3 py-2 text-sm`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItemVisibility('emails', email.id)}
                    className={`p-2 rounded-lg transition-all shrink-0 ${email.visible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                    title={email.visible ? 'Çalışanlar görebilir' : 'Çalışanlar göremez (sadece patron)'}
                  >
                    {email.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDynamicItem('emails', email.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              ))}
              {companyProfile.emails.length === 0 && (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz e-posta eklenmedi</p>
              )}
            </div>
          </div>

          {/* Ticari Bilgiler */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <p className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <FileText size={14} /> Ticari Bilgiler
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileField label="Mersis No" icon={Hash} value={companyProfile.mersisNo} field="mersisNo" placeholder="Mersis numarası..." showVisibility={true} />
              <ProfileField label="Ticaret Sicil Numarası" icon={Hash} value={companyProfile.ticaretSicilNo} field="ticaretSicilNo" placeholder="Sicil no..." showVisibility={true} />
              <ProfileField label="Ticaret Odası" icon={Building2} value={companyProfile.ticaretOdasi} field="ticaretOdasi" placeholder="Ticaret odası..." showVisibility={true} />
              <ProfileField label="Oda Sicil Numarası" icon={Hash} value={companyProfile.odaSicilNo} field="odaSicilNo" placeholder="Oda sicil no..." showVisibility={true} />
            </div>
          </div>

          {/* Kaydet */}
          <div className="flex items-center justify-end gap-3">
            {profileSaved && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={14} /> Kaydedildi
              </span>
            )}
            <button
              onClick={saveProfile}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Şirket Bilgilerini Kaydet
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ===== DEPARTMAN YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Departman Yönetimi" subtitle="Departmanları ekleyin, düzenleyin veya kaldırın" icon={Building2} gradient="from-indigo-500 to-purple-500">
        {renderAddForm({
          value: newDeptName, setValue: setNewDeptName,
          color: newDeptColor, setColor: setNewDeptColor,
          onAdd: addDepartment, placeholder: 'Yeni departman adı...'
        })}
        <div className="space-y-2">
          {deptList.map(dept => renderListItem({
            item: dept, isEditing: editingDept === dept.id,
            onEdit: setEditingDept, onUpdate: updateDepartment, onRemove: removeDepartment
          }))}
        </div>
      </CollapsibleSection>

      {/* ===== ROL YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Rol Yönetimi" subtitle="Kullanıcı rollerini yönetin" icon={Crown} gradient="from-amber-500 to-orange-500">
        {renderAddForm({
          value: newRoleLabel, setValue: setNewRoleLabel,
          color: newRoleColor, setColor: setNewRoleColor,
          onAdd: addRole, placeholder: 'Yeni rol adı...',
          buttonColor: 'bg-amber-500 hover:bg-amber-600'
        })}
        <div className="space-y-2">
          {roleList.map(role => renderListItem({
            item: role, isEditing: editingRole === role.id,
            onEdit: setEditingRole, onUpdate: updateRole, onRemove: removeRole,
            isProtected: ['boss', 'manager', 'employee'].includes(role.id)
          }))}
        </div>
      </CollapsibleSection>

      {/* ===== DURUM YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Durum Yönetimi" subtitle="Görev durumlarını ekleyin ve düzenleyin" icon={ClipboardList} gradient="from-emerald-500 to-teal-500">
        {renderAddForm({
          value: newStatusLabel, setValue: setNewStatusLabel,
          color: newStatusColor, setColor: setNewStatusColor,
          onAdd: addStatus, placeholder: 'Yeni durum adı...',
          buttonColor: 'bg-emerald-500 hover:bg-emerald-600'
        })}
        <div className="space-y-2">
          {statusList.map(status => renderListItem({
            item: status, isEditing: editingStatus === status.id,
            onEdit: setEditingStatus, onUpdate: updateStatus, onRemove: removeStatus,
            isProtected: ['pending', 'in_progress', 'completed'].includes(status.id)
          }))}
        </div>
      </CollapsibleSection>

      {/* ===== ÖNCELİK YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Öncelik Yönetimi" subtitle="Görev öncelik seviyelerini yönetin" icon={Shield} gradient="from-amber-500 to-red-500">
        {renderAddForm({
          value: newPriorityLabel, setValue: setNewPriorityLabel,
          color: newPriorityColor, setColor: setNewPriorityColor,
          onAdd: addPriority, placeholder: 'Yeni öncelik adı...',
          buttonColor: 'bg-amber-500 hover:bg-amber-600'
        })}
        <div className="space-y-2">
          {priorityList.map(priority => renderListItem({
            item: priority, isEditing: editingPriority === priority.id,
            onEdit: setEditingPriority, onUpdate: updatePriority, onRemove: removePriority
          }))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default AdminPanel;
