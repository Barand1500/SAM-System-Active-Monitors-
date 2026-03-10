import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { departmentAPI, taskStatusAPI, taskPriorityAPI, companyProfileAPI, roleAPI } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import BaseModal from './BaseModal';
import { logChange } from './ChangeHistory';
import {
  Building2, Plus, Edit, Trash2, CheckCircle2, Shield, ChevronDown,
  Phone, Mail, Globe, MapPin, FileText, Banknote, Hash, Users,
  AlertTriangle, Tag, Palette, Crown, UserCog, ClipboardList, Pipette,
  Eye, EyeOff, Info, GripVertical, Settings, CheckSquare, Briefcase,
  BarChart3, Megaphone, Calendar, Printer, Download, Loader2
} from 'lucide-react';
import { 
  validateEmail, 
  validatePhone, 
  validateTaxNumber, 
  validateMersisNumber, 
  validateTradeRegistryNumber, 
  validateURL, 
  validateRequired 
} from '../utils/validation';
import { PERMISSIONS, PERMISSION_LABELS } from '../utils/rbac';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Hazır Renkler
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9',
];

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
const CollapsibleSection = ({ isDark, title, subtitle, icon: Icon, gradient, children, defaultOpen = false, headerActions = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} overflow-hidden`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
        className={`w-full flex items-center justify-between p-5 transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
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
        <div className="flex items-center gap-2">
          {headerActions && (
            <div className="print:hidden" onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
          <ChevronDown size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
        </div>
      </div>
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

// Yetki Grubu Bileşeni - Modernize
const PermissionGroup = ({ title, icon: Icon, permissions, selectedPermissions, onToggle, onToggleAll, isDark, color = 'blue' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const allSelected = permissions.every(p => selectedPermissions.includes(p));
  const someSelected = permissions.some(p => selectedPermissions.includes(p));
  const selectedCount = permissions.filter(p => selectedPermissions.includes(p)).length;

  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', lightBg: 'bg-blue-50', darkBg: 'bg-blue-500/10', darkBorder: 'border-blue-500/30' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', lightBg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', darkBorder: 'border-emerald-500/30' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', lightBg: 'bg-purple-50', darkBg: 'bg-purple-500/10', darkBorder: 'border-purple-500/30' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', lightBg: 'bg-orange-50', darkBg: 'bg-orange-500/10', darkBorder: 'border-orange-500/30' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', lightBg: 'bg-rose-50', darkBg: 'bg-rose-500/10', darkBorder: 'border-rose-500/30' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', lightBg: 'bg-cyan-50', darkBg: 'bg-cyan-500/10', darkBorder: 'border-cyan-500/30' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', lightBg: 'bg-amber-50', darkBg: 'bg-amber-500/10', darkBorder: 'border-amber-500/30' },
  };
  const cc = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${cc.bg} flex items-center justify-center`}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedCount}/{permissions.length} yetki seçili
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? cc.darkBg + ' ' + cc.text : cc.lightBg + ' ' + cc.text}`}>
              {selectedCount}
            </span>
          )}
          <ChevronDown size={18} className={`transition-transform ${isExpanded ? '' : '-rotate-90'} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={`p-4 pt-0 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <div className="flex items-center justify-end gap-2 mb-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleAll(permissions, true); }}
              disabled={allSelected}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                allSelected
                  ? isDark ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isDark ? cc.darkBg + ' text-' + color + '-300 hover:bg-' + color + '-500/20' : cc.lightBg + ' ' + cc.text + ' hover:bg-' + color + '-100'
              }`}
            >
              ✓ Tümünü Seç
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleAll(permissions, false); }}
              disabled={!someSelected}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                !someSelected
                  ? isDark ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              ✕ Temizle
            </button>
          </div>
          <div className="space-y-1.5">
            {permissions.map(permKey => (
              <label
                key={permKey}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${
                  selectedPermissions.includes(permKey)
                    ? isDark ? cc.darkBg + ' border ' + cc.darkBorder : cc.lightBg + ' border ' + cc.border
                    : isDark ? 'hover:bg-slate-700/50 border border-transparent' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permKey)}
                    onChange={() => onToggle(permKey)}
                    className="w-4 h-4 rounded border-2 cursor-pointer transition-all checked:bg-gradient-to-br checked:from-blue-500 checked:to-blue-600 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                </div>
                <span className={`flex-1 text-sm font-medium transition-colors ${
                  selectedPermissions.includes(permKey)
                    ? isDark ? 'text-white' : 'text-slate-900'
                    : isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'
                }`}>
                  {PERMISSION_LABELS[permKey] || permKey}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== ANA BİLEŞEN =====
const AdminPanel = ({ isDark, departments: initialDepartments }) => {
  const { company, updateCompany } = useAuth();
  const { addToast } = useNotification();
  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // ===== ŞİRKET PROFİLİ =====
  const defaultProfile = {
    unvan: '',
    adresler: [],
    vergiDairesi: '',
    vergiNo: '',
    telefonlar: [],
    websites: [],
    emails: [],
    mersisNo: '',
    ticaretSicilNo: '',
    ticaretOdasi: '',
    odaSicilNo: '',
    visibility: {
      unvan: true,
      vergiDairesi: false,
      vergiNo: false,
      mersisNo: false,
      ticaretSicilNo: false,
      ticaretOdasi: true,
      odaSicilNo: false,
    }
  };
  const [companyProfile, setCompanyProfile] = useState(defaultProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Şirket profilini API'den yükle
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await companyProfileAPI.get();
        if (res.data) {
          setCompanyProfile({ ...defaultProfile, ...res.data });
        }
      } catch (err) {
        console.error('Şirket profili yüklenemedi:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Print & PDF fonksiyonları - Gelişmiş versiyon
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintableCompanyProfile();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Şirket Profili - ${companyProfile.unvan || 'Bilgi Yok'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.6;
            }
            .header {
              border-bottom: 4px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              font-size: 28px;
              margin-bottom: 8px;
            }
            .header .subtitle {
              color: #64748b;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #f1f5f9;
              padding: 12px 16px;
              border-left: 4px solid #3b82f6;
              font-size: 16px;
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 16px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 12px 24px;
              margin-bottom: 16px;
            }
            .info-label {
              color: #64748b;
              font-weight: 500;
              font-size: 14px;
            }
            .info-value {
              color: #1e293b;
              font-weight: 400;
              font-size: 14px;
            }
            .list-item {
              padding: 10px;
              background: #f8fafc;
              border-radius: 6px;
              margin-bottom: 8px;
              border-left: 3px solid #3b82f6;
            }
            .list-item-title {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 4px;
              font-size: 14px;
            }
            .list-item-content {
              color: #475569;
              font-size: 13px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="footer">
            <p>Bu belge ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} tarihinde oluşturulmuştur.</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generatePrintableCompanyProfile = () => {
    let html = `
      <div class="header">
        <h1>${companyProfile.unvan || 'Şirket Bilgisi Yok'}</h1>
        <p class="subtitle">Şirket Profil Bilgileri</p>
      </div>
    `;

    // Temel Bilgiler
    if (companyProfile.unvan || companyProfile.vergiDairesi || companyProfile.vergiNo) {
      html += `
        <div class="section">
          <div class="section-title">📋 Temel Bilgiler</div>
          <div class="info-grid">
            ${companyProfile.unvan ? `<div class="info-label">Ünvan:</div><div class="info-value">${companyProfile.unvan}</div>` : ''}
            ${companyProfile.vergiDairesi ? `<div class="info-label">Vergi Dairesi:</div><div class="info-value">${companyProfile.vergiDairesi}</div>` : ''}
            ${companyProfile.vergiNo ? `<div class="info-label">Vergi No:</div><div class="info-value">${companyProfile.vergiNo}</div>` : ''}
            ${companyProfile.mersisNo ? `<div class="info-label">MERSİS No:</div><div class="info-value">${companyProfile.mersisNo}</div>` : ''}
            ${companyProfile.ticaretSicilNo ? `<div class="info-label">Ticaret Sicil No:</div><div class="info-value">${companyProfile.ticaretSicilNo}</div>` : ''}
            ${companyProfile.kepAdresi ? `<div class="info-label">KEP Adresi:</div><div class="info-value">${companyProfile.kepAdresi}</div>` : ''}
          </div>
        </div>
      `;
    }

    // Adresler
    if (companyProfile.adresler?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">📍 Adresler</div>
      `;
      companyProfile.adresler.forEach(addr => {
        const addrParts = [addr.mahalle, addr.sokak, addr.binaNo, addr.ilce, addr.il, addr.postaKodu].filter(Boolean);
        html += `
          <div class="list-item">
            <div class="list-item-title">${addr.label || 'Adres'}</div>
            <div class="list-item-content">${addrParts.join(', ') || 'Bilgi yok'}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // Telefonlar
    if (companyProfile.telefonlar?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">📞 Telefon Numaraları</div>
      `;
      companyProfile.telefonlar.forEach(tel => {
        if (tel.value) {
          html += `
            <div class="list-item">
              <div class="list-item-title">${tel.label || 'Telefon'}</div>
              <div class="list-item-content">${tel.value}</div>
            </div>
          `;
        }
      });
      html += `</div>`;
    }

    // Emailler
    if (companyProfile.emails?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">✉️ E-posta Adresleri</div>
      `;
      companyProfile.emails.forEach(email => {
        if (email.value) {
          html += `
            <div class="list-item">
              <div class="list-item-title">${email.label || 'E-posta'}</div>
              <div class="list-item-content">${email.value}</div>
            </div>
          `;
        }
      });
      html += `</div>`;
    }

    // Websiteler
    if (companyProfile.websites?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">🌐 Web Siteleri</div>
      `;
      companyProfile.websites.forEach(site => {
        if (site.value) {
          html += `
            <div class="list-item">
              <div class="list-item-title">${site.label || 'Website'}</div>
              <div class="list-item-content">${site.value}</div>
            </div>
          `;
        }
      });
      html += `</div>`;
    }

    // Banka/Finans Bilgileri
    if (companyProfile.ibanlar?.length > 0 || companyProfile.sermaye) {
      html += `
        <div class="section">
          <div class="section-title">💰 Finans Bilgileri</div>
          <div class="info-grid">
            ${companyProfile.sermaye ? `<div class="info-label">Sermaye:</div><div class="info-value">${companyProfile.sermaye}</div>` : ''}
          </div>
      `;
      if (companyProfile.ibanlar?.length > 0) {
        companyProfile.ibanlar.forEach(iban => {
          if (iban.value) {
            html += `
              <div class="list-item">
                <div class="list-item-title">${iban.label || 'IBAN'}</div>
                <div class="list-item-content">${iban.value}</div>
              </div>
            `;
          }
        });
      }
      html += `</div>`;
    }

    return html;
  };

  const handleExportPDF = () => {
    // PDF için aynı print fonksiyonunu kullan (browser'ın "PDF olarak kaydet" özelliği)
    handlePrint();
  };

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

  const saveProfile = async () => {
    // Validasyon kontrolleri
    const errors = [];

    // Email validasyonu
    if (companyProfile.emails && companyProfile.emails.length > 0) {
      companyProfile.emails.forEach((email, idx) => {
        if (email.value) {
          const validation = validateEmail(email.value);
          if (!validation.isValid) {
            errors.push(`Email ${idx + 1}: ${validation.error}`);
          }
        }
      });
    }

    // Telefon validasyonu
    if (companyProfile.telefonlar && companyProfile.telefonlar.length > 0) {
      companyProfile.telefonlar.forEach((tel, idx) => {
        if (tel.value) {
          const validation = validatePhone(tel.value);
          if (!validation.isValid) {
            errors.push(`Telefon ${idx + 1}: ${validation.error}`);
          }
        }
      });
    }

    // Website validasyonu
    if (companyProfile.websites && companyProfile.websites.length > 0) {
      companyProfile.websites.forEach((site, idx) => {
        if (site.value) {
          const validation = validateURL(site.value);
          if (!validation.isValid) {
            errors.push(`Website ${idx + 1}: ${validation.error}`);
          }
        }
      });
    }

    // Vergi numarası validasyonu
    if (companyProfile.vergiNo) {
      const validation = validateTaxNumber(companyProfile.vergiNo);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    // Mersis numarası validasyonu
    if (companyProfile.mersisNo) {
      const validation = validateMersisNumber(companyProfile.mersisNo);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    // Ticaret sicil numarası validasyonu
    if (companyProfile.ticaretSicilNo) {
      const validation = validateTradeRegistryNumber(companyProfile.ticaretSicilNo);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    // Hata varsa göster
    if (errors.length > 0) {
      addToast({
        type: 'error',
        title: 'Doğrulama Hatası',
        message: errors[0], // İlk hatayı göster
        duration: 5000
      });
      return;
    }

    // Kaydet - API'ye gönder
    try {
      await companyProfileAPI.update(companyProfile);
      setProfileSaved(true);
      addToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Şirket profili kaydedildi',
        duration: 3000
      });
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error('Şirket profili kaydedilemedi:', err);
      addToast({
        type: 'error',
        title: 'Hata',
        message: 'Şirket profili kaydedilemedi',
        duration: 5000
      });
    }
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
    const itemTypeNames = {
      adresler: 'adresi',
      telefonlar: 'telefon numarasını',
      emails: 'email adresini',
      websites: 'website adresini'
    };

    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Silme Onayı',
      message: `Bu ${itemTypeNames[listKey] || 'öğeyi'} silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        setCompanyProfile(prev => ({
          ...prev,
          [listKey]: prev[listKey].filter(item => item.id !== id)
        }));
        setProfileSaved(false);
        addToast({
          type: 'success',
          title: 'Silindi',
          message: `${itemTypeNames[listKey]?.charAt(0).toUpperCase() + itemTypeNames[listKey]?.slice(1)} başarıyla silindi`,
          duration: 2000
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
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

  // Tümünü göster/gizle
  const toggleAllVisibility = (listKey, visible) => {
    setCompanyProfile(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item => ({ ...item, visible }))
    }));
    setProfileSaved(false);
    addToast({
      type: 'info',
      title: 'Güncellendi',
      message: `Tüm öğeler ${visible ? 'görünür' : 'gizli'} olarak ayarlandı`,
      duration: 2000
    });
  };

  // ===== DEPARTMAN YÖNETİMİ =====
  const [deptList, setDeptList] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#6366f1');
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.list();
      setDeptList(res.data);
    } catch (err) {
      console.error('Departman yükleme hatası:', err);
    }
  }, []);

  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      const res = await departmentAPI.create({ name: newDeptName.trim(), color: newDeptColor });
      setDeptList(prev => [...prev, res.data]);
      logChange('department', 'create', `Yeni departman eklendi: ${newDeptName.trim()}`, null, newDeptName.trim(), newDeptName.trim());
      setNewDeptName('');
      setNewDeptColor('#6366f1');
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Departman eklenemedi', duration: 3000 });
    }
  };
  const removeDepartment = (id) => {
    const dept = deptList.find(d => d.id === id);
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Departman Sil',
      message: `"${dept?.name}" departmanını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await departmentAPI.delete(id);
          setDeptList(prev => prev.filter(d => d.id !== id));
          logChange('department', 'delete', `Departman silindi: ${dept?.name}`, dept?.name, null, dept?.name);
          addToast({ type: 'success', title: 'Silindi', message: 'Departman başarıyla silindi', duration: 2000 });
        } catch (err) {
          addToast({ type: 'error', title: 'Hata', message: 'Departman silinemedi', duration: 3000 });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };
  const updateDepartment = async (id, updates) => { 
    const oldDept = deptList.find(d => d.id === id);
    try {
      await departmentAPI.update(id, updates);
      setDeptList(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); 
      if (updates.name && oldDept?.name !== updates.name) {
        logChange('department', 'update', `Departman adı değiştirildi`, oldDept?.name, updates.name, oldDept?.name);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Departman güncellenemedi', duration: 3000 });
    }
    setEditingDept(null); 
  };

  // ===== ÖNCELİK YÖNETİMİ =====
  const [priorityList, setPriorityList] = useState([]);
  const [newPriorityLabel, setNewPriorityLabel] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#6366f1');
  const [editingPriority, setEditingPriority] = useState(null);

  const fetchPriorities = useCallback(async () => {
    try {
      const res = await taskPriorityAPI.list();
      setPriorityList(res.data.map(p => ({ ...p, label: p.name })));
    } catch (err) {
      console.error('Öncelik yükleme hatası:', err);
    }
  }, []);

  const addPriority = async () => {
    if (!newPriorityLabel.trim()) return;
    try {
      const res = await taskPriorityAPI.create({ name: newPriorityLabel.trim(), color: newPriorityColor, orderNo: priorityList.length });
      setPriorityList(prev => [...prev, { ...res.data, label: res.data.name }]);
      setNewPriorityLabel('');
      setNewPriorityColor('#6366f1');
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Öncelik eklenemedi', duration: 3000 });
    }
  };
  const removePriority = (id) => {
    const priority = priorityList.find(p => p.id === id);
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Öncelik Sil',
      message: `"${priority?.label}" önceliğini silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await taskPriorityAPI.delete(id);
          setPriorityList(prev => prev.filter(p => p.id !== id));
          logChange('priority', 'delete', `Öncelik silindi: ${priority?.label}`, priority?.label, null, priority?.label);
          addToast({ type: 'success', title: 'Silindi', message: 'Öncelik başarıyla silindi', duration: 2000 });
        } catch (err) {
          addToast({ type: 'error', title: 'Hata', message: 'Öncelik silinemedi', duration: 3000 });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };
  const updatePriority = async (id, updates) => {
    try {
      const apiUpdates = { ...updates };
      if (updates.label) { apiUpdates.name = updates.label; delete apiUpdates.label; }
      await taskPriorityAPI.update(id, apiUpdates);
      setPriorityList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Öncelik güncellenemedi', duration: 3000 });
    }
    setEditingPriority(null);
  };

  // ===== ROL YÖNETİMİ =====
  const defaultRoles = [
    { id: 'boss', label: 'Patron', color: '#f59e0b', permissions: ['all'] },
    { id: 'manager', label: 'Yönetici', color: '#6366f1', permissions: ['manage_tasks', 'manage_employees', 'view_reports'] },
    { id: 'employee', label: 'Çalışan', color: '#10b981', permissions: ['view_tasks', 'update_own_tasks'] },
  ];
  const [roleList, setRoleList] = useState([]);
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#6366f1');
  const [editingRole, setEditingRole] = useState(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState(null);
  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await roleAPI.list();
      const roles = res.data.map(r => ({
        id: r.id,
        roleKey: r.roleKey || r.role_key,
        label: r.label,
        color: r.color,
        permissions: r.permissions || [],
      }));
      setRoleList(roles.length > 0 ? roles : defaultRoles);
    } catch {
      setRoleList(defaultRoles);
    }
  }, []);

  const addRole = async () => {
    if (!newRoleLabel.trim()) return;
    try {
      const res = await roleAPI.create({ label: newRoleLabel.trim(), color: newRoleColor, permissions: [] });
      setRoleList(prev => [...prev, {
        id: res.data.id,
        roleKey: res.data.roleKey || res.data.role_key,
        label: res.data.label,
        color: res.data.color,
        permissions: res.data.permissions || [],
      }]);
      setNewRoleLabel('');
      setNewRoleColor('#6366f1');
    } catch {
      addToast({ type: 'error', title: 'Hata', message: 'Rol eklenemedi', duration: 3000 });
    }
  };
  const removeRole = (id) => {
    const role = roleList.find(r => r.id === id);
    if (role && ['boss', 'manager', 'employee'].includes(role.roleKey || role.id)) {
      addToast({
        type: 'error',
        title: 'Silinemez',
        message: 'Varsayılan roller silinemez',
        duration: 3000
      });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Rol Sil',
      message: `"${role?.label}" rolünü silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await roleAPI.delete(id);
          setRoleList(prev => prev.filter(r => r.id !== id));
          logChange('role', 'delete', `Rol silindi: ${role?.label}`, role?.label, null, role?.label);
          addToast({
            type: 'success',
            title: 'Silindi',
            message: 'Rol başarıyla silindi',
            duration: 2000
          });
        } catch {
          addToast({ type: 'error', title: 'Hata', message: 'Rol silinemedi', duration: 3000 });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };
  const updateRole = async (id, updates) => {
    try {
      await roleAPI.update(id, updates);
      setRoleList(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch {
      addToast({ type: 'error', title: 'Hata', message: 'Rol güncellenemedi', duration: 3000 });
    }
    setEditingRole(null);
  };
  
  const openRolePermissionsModal = (role) => {
    setEditingRolePermissions({ ...role, permissions: role.permissions || [] });
    setShowRolePermissionsModal(true);
  };
  
  const saveRolePermissions = async () => {
    if (editingRolePermissions) {
      try {
        await roleAPI.update(editingRolePermissions.id, { permissions: editingRolePermissions.permissions });
        setRoleList(prev => prev.map(r => 
          r.id === editingRolePermissions.id 
            ? { ...r, permissions: editingRolePermissions.permissions }
            : r
        ));
      
        logChange(
          'role',
          'update',
          `"${editingRolePermissions.label}" rolünün yetkileri güncellendi`,
          'Eski yetkiler',
          'Yeni yetkiler',
          editingRolePermissions.label
        );
      
        addToast({
          type: 'success',
          title: 'Kaydedildi',
          message: 'Rol yetkileri güncellendi',
          duration: 2000
        });
      } catch {
        addToast({ type: 'error', title: 'Hata', message: 'Yetkiler güncellenemedi', duration: 3000 });
      }
      
      setShowRolePermissionsModal(false);
      setEditingRolePermissions(null);
    }
  };
  
  const togglePermission = (permissionKey) => {
    setEditingRolePermissions(prev => {
      const permissions = prev.permissions || [];
      const hasPermission = permissions.includes(permissionKey);
      
      return {
        ...prev,
        permissions: hasPermission
          ? permissions.filter(p => p !== permissionKey)
          : [...permissions, permissionKey]
      };
    });
  };
  
  const toggleAllPermissions = (permissions, add) => {
    setEditingRolePermissions(prev => {
      const currentPermissions = prev.permissions || [];
      
      if (add) {
        const newPermissions = [...new Set([...currentPermissions, ...permissions])];
        return { ...prev, permissions: newPermissions };
      } else {
        return {
          ...prev,
          permissions: currentPermissions.filter(p => !permissions.includes(p))
        };
      }
    });
  };

  // ===== DURUM YÖNETİMİ =====
  const [statusList, setStatusList] = useState([]);
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#6366f1');
  const [editingStatus, setEditingStatus] = useState(null);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await taskStatusAPI.list();
      setStatusList(res.data.map(s => ({ ...s, label: s.name })));
    } catch (err) {
      console.error('Durum yükleme hatası:', err);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchDepartments(), fetchStatuses(), fetchPriorities(), fetchRoles()]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchDepartments, fetchStatuses, fetchPriorities, fetchRoles]);

  const addStatus = async () => {
    if (!newStatusLabel.trim()) return;
    try {
      const res = await taskStatusAPI.create({ name: newStatusLabel.trim(), color: newStatusColor, orderNo: statusList.length });
      setStatusList(prev => [...prev, { ...res.data, label: res.data.name }]);
      logChange('status', 'create', `Yeni durum eklendi: ${newStatusLabel.trim()}`, null, newStatusLabel.trim(), newStatusLabel.trim());
      setNewStatusLabel('');
      setNewStatusColor('#6366f1');
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Durum eklenemedi', duration: 3000 });
    }
  };
  const removeStatus = (id) => {
    const status = statusList.find(s => s.id === id);
    if (status?.isDefault) {
      addToast({
        type: 'error',
        title: 'Silinemez',
        message: 'Varsayılan durumlar silinemez',
        duration: 3000
      });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Durum Sil',
      message: `"${status?.label}" durumunu silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await taskStatusAPI.delete(id);
          setStatusList(prev => prev.filter(s => s.id !== id));
          logChange('status', 'delete', `Durum silindi: ${status?.label}`, status?.label, null, status?.label);
          addToast({ type: 'success', title: 'Silindi', message: 'Durum başarıyla silindi', duration: 2000 });
        } catch (err) {
          addToast({ type: 'error', title: 'Hata', message: 'Durum silinemedi', duration: 3000 });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };
  const updateStatus = async (id, updates) => {
    try {
      const apiUpdates = { ...updates };
      if (updates.label) { apiUpdates.name = updates.label; delete apiUpdates.label; }
      await taskStatusAPI.update(id, apiUpdates);
      setStatusList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) {
      addToast({ type: 'error', title: 'Hata', message: 'Durum güncellenemedi', duration: 3000 });
    }
    setEditingStatus(null);
  };

  // ===== DRAG & DROP CONFIGURATION =====
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDepartmentDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDeptList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRoleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setRoleList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        roleAPI.reorder(newItems.map(r => r.id)).catch(() => {});
        return newItems;
      });
    }
  };

  const handleStatusDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setStatusList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        taskStatusAPI.reorder(newItems.map((s, i) => ({ id: s.id, orderNo: i }))).catch(() => {});
        return newItems;
      });
    }
  };

  const handlePriorityDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPriorityList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        taskPriorityAPI.reorder(newItems.map((p, i) => ({ id: p.id, orderNo: i }))).catch(() => {});
        return newItems;
      });
    }
  };

  // ===== RENDER HELPERS =====
  // ===== SORTABLE LIST ITEM COMPONENT =====
  const SortableListItem = ({ item, isEditing, onEdit, onUpdate, onRemove, onEditPermissions = null, isProtected = false, isDark }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} ${isDragging ? 'shadow-lg z-50' : ''}`}
      >
        {/* Drag Handle */}
        {!isEditing && (
          <div
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing p-1 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <GripVertical size={16} />
          </div>
        )}

        <div className="flex-1 flex items-center justify-between">
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
                {onEditPermissions && (
                  <button 
                    onClick={() => onEditPermissions(item)} 
                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
                    title="Yetkileri Düzenle"
                  >
                    <Settings size={14} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                  </button>
                )}
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
      </div>
    );
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Şirket Ayarları</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Şirket bilgileri, departmanlar, roller, durumlar ve öncelikleri yönetin</p>
        </div>
      </div>

      {/* ===== ŞİRKET PROFİLİ ===== */}
      <CollapsibleSection 
        isDark={isDark} 
        title="Şirket Profili" 
        subtitle="Ünvan, adresler, iletişim ve ticari bilgiler" 
        icon={Building2} 
        gradient="from-blue-500 to-cyan-500" 
        defaultOpen={true}
        headerActions={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              title="Yazdır"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105"
              title="PDF olarak kaydet"
            >
              <Download size={16} />
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Görünürlük Bilgilendirmesi */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Info size={16} className="shrink-0" />
            <p className="text-sm">
              <Eye size={14} className="inline mx-0.5 text-emerald-500" /> <strong>Yeşil</strong> = Herkes görebilir, 
              <EyeOff size={14} className="inline mx-0.5 text-slate-400" /> <strong>Gri</strong> = Sadece patronlar görebilir
            </p>
          </div>

          {/* Ünvan */}
          <ProfileField label="Ünvan" icon={FileText} value={companyProfile.unvan} field="unvan" placeholder="Şirket ünvanı..." showVisibility={true} />

          {/* Dinamik Adresler */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <MapPin size={14} /> Adresler
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('adresler', true)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Göster"
                >
                  <Eye size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('adresler', false)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Gizle"
                >
                  <EyeOff size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => addDynamicItem('adresler')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={14} /> Adres Ekle
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('telefonlar', true)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Göster"
                >
                  <Eye size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('telefonlar', false)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Gizle"
                >
                  <EyeOff size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => addDynamicItem('telefonlar')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={14} /> Telefon Ekle
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('websites', true)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Göster"
                >
                  <Eye size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('websites', false)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Gizle"
                >
                  <EyeOff size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => addDynamicItem('websites')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={14} /> Web Sitesi Ekle
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('emails', true)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Göster"
                >
                  <Eye size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllVisibility('emails', false)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                  title="Tümünü Gizle"
                >
                  <EyeOff size={12} /> Tümü
                </button>
                <button
                  type="button"
                  onClick={() => addDynamicItem('emails')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={14} /> E-posta Ekle
                </button>
              </div>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDepartmentDragEnd}>
          <SortableContext items={deptList.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {deptList.map(dept => (
                <SortableListItem
                  key={dept.id}
                  item={dept}
                  isEditing={editingDept === dept.id}
                  onEdit={setEditingDept}
                  onUpdate={updateDepartment}
                  onRemove={removeDepartment}
                  isDark={isDark}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CollapsibleSection>

      {/* ===== ROL YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Rol Yönetimi" subtitle="Kullanıcı rollerini yönetin" icon={Crown} gradient="from-amber-500 to-orange-500">
        {renderAddForm({
          value: newRoleLabel, setValue: setNewRoleLabel,
          color: newRoleColor, setColor: setNewRoleColor,
          onAdd: addRole, placeholder: 'Yeni rol adı...',
          buttonColor: 'bg-amber-500 hover:bg-amber-600'
        })}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRoleDragEnd}>
          <SortableContext items={roleList.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {roleList.map(role => (
                <SortableListItem
                  key={role.id}
                  item={role}
                  isEditing={editingRole === role.id}
                  onEdit={setEditingRole}
                  onUpdate={updateRole}
                  onRemove={removeRole}
                  onEditPermissions={openRolePermissionsModal}
                  isProtected={['boss', 'manager', 'employee'].includes(role.id)}
                  isDark={isDark}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CollapsibleSection>

      {/* ===== DURUM YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Durum Yönetimi" subtitle="Görev durumlarını ekleyin ve düzenleyin" icon={ClipboardList} gradient="from-emerald-500 to-teal-500">
        {renderAddForm({
          value: newStatusLabel, setValue: setNewStatusLabel,
          color: newStatusColor, setColor: setNewStatusColor,
          onAdd: addStatus, placeholder: 'Yeni durum adı...',
          buttonColor: 'bg-emerald-500 hover:bg-emerald-600'
        })}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStatusDragEnd}>
          <SortableContext items={statusList.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {statusList.map(status => (
                <SortableListItem
                  key={status.id}
                  item={status}
                  isEditing={editingStatus === status.id}
                  onEdit={setEditingStatus}
                  onUpdate={updateStatus}
                  onRemove={removeStatus}
                  isProtected={status.isDefault}
                  isDark={isDark}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CollapsibleSection>

      {/* ===== ÖNCELİK YÖNETİMİ ===== */}
      <CollapsibleSection isDark={isDark} title="Öncelik Yönetimi" subtitle="Görev öncelik seviyelerini yönetin" icon={Shield} gradient="from-amber-500 to-red-500">
        {renderAddForm({
          value: newPriorityLabel, setValue: setNewPriorityLabel,
          color: newPriorityColor, setColor: setNewPriorityColor,
          onAdd: addPriority, placeholder: 'Yeni öncelik adı...',
          buttonColor: 'bg-amber-500 hover:bg-amber-600'
        })}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePriorityDragEnd}>
          <SortableContext items={priorityList.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {priorityList.map(priority => (
                <SortableListItem
                  key={priority.id}
                  item={priority}
                  isEditing={editingPriority === priority.id}
                  onEdit={setEditingPriority}
                  onUpdate={updatePriority}
                  onRemove={removePriority}
                  isDark={isDark}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CollapsibleSection>

      {/* ===== ROL YETKİLERİ MODAL ===== */}
      <BaseModal
        isOpen={showRolePermissionsModal}
        onClose={() => setShowRolePermissionsModal(false)}
        title={editingRolePermissions ? `${editingRolePermissions.label} - Yetki Yönetimi` : 'Yetki Yönetimi'}
        isDark={isDark}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowRolePermissionsModal(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              İptal
            </button>
            <button
              onClick={saveRolePermissions}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Kaydet
            </button>
          </>
        }
      >
        {editingRolePermissions && (
          <div className="space-y-6">
            {/* Rol Bilgisi */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: editingRolePermissions.color }} />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingRolePermissions.label}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {(editingRolePermissions.permissions || []).length} yetki seçili
                  </p>
                </div>
              </div>
            </div>

            {/* Yetki Grupları */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {/* Görev Yönetimi */}
              <PermissionGroup
                title="Görev Yönetimi"
                icon={CheckSquare}
                color="blue"
                permissions={[
                  PERMISSIONS.TASK_VIEW_ALL,
                  PERMISSIONS.TASK_VIEW_OWN,
                  PERMISSIONS.TASK_VIEW_TEAM,
                  PERMISSIONS.TASK_CREATE,
                  PERMISSIONS.TASK_EDIT_ALL,
                  PERMISSIONS.TASK_EDIT_OWN,
                  PERMISSIONS.TASK_DELETE_ALL,
                  PERMISSIONS.TASK_DELETE_OWN,
                  PERMISSIONS.TASK_ASSIGN
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Çalışan Yönetimi */}
              <PermissionGroup
                title="Çalışan Yönetimi"
                icon={Users}
                color="emerald"
                permissions={[
                  PERMISSIONS.EMPLOYEE_VIEW_ALL,
                  PERMISSIONS.EMPLOYEE_VIEW_TEAM,
                  PERMISSIONS.EMPLOYEE_CREATE,
                  PERMISSIONS.EMPLOYEE_EDIT_ALL,
                  PERMISSIONS.EMPLOYEE_EDIT_OWN,
                  PERMISSIONS.EMPLOYEE_DELETE,
                  PERMISSIONS.EMPLOYEE_MANAGE_ROLES
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Departman Yönetimi */}
              <PermissionGroup
                title="Departman Yönetimi"
                icon={Briefcase}
                color="purple"
                permissions={[
                  PERMISSIONS.DEPARTMENT_VIEW,
                  PERMISSIONS.DEPARTMENT_CREATE,
                  PERMISSIONS.DEPARTMENT_EDIT,
                  PERMISSIONS.DEPARTMENT_DELETE,
                  PERMISSIONS.DEPARTMENT_MANAGE
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* İzin Yönetimi */}
              <PermissionGroup
                title="İzin Yönetimi"
                icon={Calendar}
                color="orange"
                permissions={[
                  PERMISSIONS.LEAVE_VIEW_ALL,
                  PERMISSIONS.LEAVE_VIEW_OWN,
                  PERMISSIONS.LEAVE_VIEW_TEAM,
                  PERMISSIONS.LEAVE_CREATE,
                  PERMISSIONS.LEAVE_APPROVE,
                  PERMISSIONS.LEAVE_REJECT
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Rapor Yönetimi */}
              <PermissionGroup
                title="Rapor Yönetimi"
                icon={BarChart3}
                color="cyan"
                permissions={[
                  PERMISSIONS.REPORT_VIEW_BASIC,
                  PERMISSIONS.REPORT_VIEW_ADVANCED,
                  PERMISSIONS.REPORT_VIEW_FINANCIAL,
                  PERMISSIONS.REPORT_EXPORT
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Şirket Yönetimi */}
              <PermissionGroup
                title="Şirket Yönetimi"
                icon={Building2}
                color="rose"
                permissions={[
                  PERMISSIONS.COMPANY_VIEW_INFO,
                  PERMISSIONS.COMPANY_EDIT_INFO,
                  PERMISSIONS.COMPANY_SETTINGS
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Sistem Yönetimi */}
              <PermissionGroup
                title="Sistem Yönetimi"
                icon={Shield}
                color="amber"
                permissions={[
                  PERMISSIONS.SYSTEM_ADMIN,
                  PERMISSIONS.SYSTEM_LOGS,
                  PERMISSIONS.SYSTEM_BACKUP
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Duyuru Yönetimi */}
              <PermissionGroup
                title="Duyuru Yönetimi"
                icon={Megaphone}
                color="blue"
                permissions={[
                  PERMISSIONS.ANNOUNCEMENT_VIEW,
                  PERMISSIONS.ANNOUNCEMENT_CREATE,
                  PERMISSIONS.ANNOUNCEMENT_EDIT_ALL,
                  PERMISSIONS.ANNOUNCEMENT_DELETE
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />

              {/* Dosya Yönetimi */}
              <PermissionGroup
                title="Dosya Yönetimi"
                icon={FileText}
                color="emerald"
                permissions={[
                  PERMISSIONS.FILE_VIEW_ALL,
                  PERMISSIONS.FILE_VIEW_OWN,
                  PERMISSIONS.FILE_VIEW_TEAM,
                  PERMISSIONS.FILE_UPLOAD,
                  PERMISSIONS.FILE_DELETE_ALL,
                  PERMISSIONS.FILE_DELETE_OWN
                ]}
                selectedPermissions={editingRolePermissions.permissions || []}
                onToggle={togglePermission}
                onToggleAll={toggleAllPermissions}
                isDark={isDark}
              />
            </div>
          </div>
        )}
      </BaseModal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Sil"
        cancelText="İptal"
        isDark={isDark}
      />
    </div>
  );
};

export default AdminPanel;
