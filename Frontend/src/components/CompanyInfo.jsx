import { useState, useEffect } from 'react';
import { companyProfileAPI } from '../services/api';
import { 
  Building2, MapPin, Phone, Mail, Globe, FileText, Banknote, Hash, 
  Info, Eye, ChevronDown, Printer, Download, Loader2 
} from 'lucide-react';

const CompanyInfo = ({ isDark }) => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    profile: true,
    commercial: true
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await companyProfileAPI.get();
        if (res.data) {
          setCompanyProfile(res.data);
        }
      } catch (err) {
        console.error('Şirket profili yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Tarayıcının PDF özelliğini kullan
    window.print();
  };

  // Yükleniyor
  if (loading) {
    return (
      <div className={`max-w-5xl mx-auto p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="text-center py-12">
          <Loader2 size={48} className={`mx-auto mb-4 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Eğer veri yoksa
  if (!companyProfile) {
    return (
      <div className={`max-w-5xl mx-auto p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="text-center py-12">
          <Building2 size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Henüz şirket bilgisi eklenmemiş
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Patron, Şirket Ayarları'ndan bilgileri ekleyebilir.
          </p>
        </div>
      </div>
    );
  }

  const { visibility } = companyProfile;

  // Collapsible Section Bileşeni
  const CollapsibleSection = ({ title, icon: Icon, isOpen, onToggle, children, gradient = "from-blue-500 to-cyan-500" }) => (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-5 flex items-center justify-between transition-all ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detaylı bilgiler</p>
          </div>
        </div>
        <ChevronDown size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            {children}
          </div>
        </div>
      )}
    </div>
  );

  // Info Field Bileşeni
  const InfoField = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
      <div className={`group p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
        <div className="flex items-center gap-2 mb-2">
          {Icon && (
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-600/50' : 'bg-white'}`}>
              <Icon size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
          )}
          <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        </div>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                <Building2 size={32} className="text-blue-500" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {companyProfile.unvan || 'Şirket Bilgileri'}
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Şirketimiz hakkında bilgiler
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                title="Yazdır"
              >
                <Printer size={18} />
                Yazdır
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                title="PDF olarak kaydet"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bilgilendirme */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
        <Info size={18} className="shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className={isDark ? 'text-blue-200/80' : 'text-blue-600/90'}>
            Bu sayfada şirket hakkında patron tarafından paylaşılan bilgileri görüntüleyebilirsiniz. 
            Bazı bilgiler gizli olarak işaretlenmiş olabilir ve sadece patronlar tarafından görülebilir.
          </p>
        </div>
      </div>

      {/* Şirket Profili */}
      <CollapsibleSection 
        title="Şirket Profili" 
        icon={Building2}
        gradient="from-blue-500 to-cyan-500"
        isOpen={openSections.profile}
        onToggle={() => toggleSection('profile')}
      >
        <div className="space-y-4">
          {/* Ünvan */}
          {visibility?.unvan && <InfoField label="Ünvan" value={companyProfile.unvan} icon={FileText} />}

          {/* Adresler */}
          {companyProfile.adresler?.filter(addr => addr.visible).length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adresler</p>
              </div>
              <div className="space-y-3">
                {companyProfile.adresler.filter(addr => addr.visible).map((addr) => (
                  <div key={addr.id} className={`group p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/60 border-slate-600 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <MapPin size={14} className="text-blue-500" />
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{addr.label}</p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {[addr.mahalle, addr.sokak, addr.binaNo].filter(Boolean).join(', ')}
                      <br />
                      {[addr.ilce, addr.il, addr.postaKodu].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vergi Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibility?.vergiDairesi && <InfoField label="Vergi Dairesi" value={companyProfile.vergiDairesi} icon={Banknote} />}
            {visibility?.vergiNo && <InfoField label="Vergi No" value={companyProfile.vergiNo} icon={Hash} />}
          </div>

          {/* Telefonlar */}
          {companyProfile.telefonlar?.filter(tel => tel.visible).length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Phone size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Telefon Numaraları</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {companyProfile.telefonlar.filter(tel => tel.visible).map((tel) => (
                  <div key={tel.id} className={`group p-3 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/60 border-slate-600 hover:border-green-500' : 'bg-white border-slate-200 hover:border-green-400'}`}>
                    <p className={`text-xs mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tel.label}</p>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-500" />
                      <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{tel.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Web Siteleri */}
          {companyProfile.websites?.filter(site => site.visible).length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Web Siteleri</p>
              </div>
              <div className="space-y-2">
                {companyProfile.websites.filter(site => site.visible).map((site) => (
                  <div key={site.id} className={`group p-3 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/60 border-slate-600 hover:border-purple-500' : 'bg-white border-slate-200 hover:border-purple-400'}`}>
                    <p className={`text-xs mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{site.label}</p>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-purple-500" />
                      <a href={`https://${site.value}`} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        {site.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E-postalar */}
          {companyProfile.emails?.filter(email => email.visible).length > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>E-posta Adresleri</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {companyProfile.emails.filter(email => email.visible).map((email) => (
                  <div key={email.id} className={`group p-3 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/60 border-slate-600 hover:border-orange-500' : 'bg-white border-slate-200 hover:border-orange-400'}`}>
                    <p className={`text-xs mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{email.label}</p>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-orange-500" />
                      <a href={`mailto:${email.value}`} className={`text-sm font-medium hover:underline ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        {email.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Ticari Bilgiler */}
      {(visibility?.mersisNo || visibility?.ticaretSicilNo || visibility?.ticaretOdasi || visibility?.odaSicilNo) && (
        <CollapsibleSection 
          title="Ticari Bilgiler" 
          icon={FileText}
          gradient="from-emerald-500 to-teal-500"
          isOpen={openSections.commercial}
          onToggle={() => toggleSection('commercial')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibility?.mersisNo && <InfoField label="Mersis No" value={companyProfile.mersisNo} icon={Hash} />}
            {visibility?.ticaretSicilNo && <InfoField label="Ticaret Sicil No" value={companyProfile.ticaretSicilNo} icon={Hash} />}
            {visibility?.ticaretOdasi && <InfoField label="Ticaret Odası" value={companyProfile.ticaretOdasi} icon={Building2} />}
            {visibility?.odaSicilNo && <InfoField label="Oda Sicil No" value={companyProfile.odaSicilNo} icon={Hash} />}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default CompanyInfo;
