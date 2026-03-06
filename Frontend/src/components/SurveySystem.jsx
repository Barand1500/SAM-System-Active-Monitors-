import { useState, useEffect } from 'react';
import {
  Plus, BarChart3, PieChart, CheckCircle2, X, Users, Clock,
  Vote, ChevronDown, ChevronUp, Eye, Trash2, Edit, Lock, Unlock,
  ListChecks, RadioTower, Star, TrendingUp, AlertCircle
} from 'lucide-react';

const loadSurveys = () => {
  try {
    const saved = localStorage.getItem('sam_surveys');
    return saved ? JSON.parse(saved) : defaultSurveys;
  } catch { return defaultSurveys; }
};

const defaultSurveys = [
  {
    id: 1, title: 'Yeni Ofis Konumu Tercihi', description: 'Yeni ofis konumu için personelinizin tercihini öğrenin.',
    createdBy: 'patron', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    type: 'single', // single | multiple | rating
    isActive: true, isAnonymous: false,
    options: [
      { id: 'a', text: 'Levent', votes: [] },
      { id: 'b', text: 'Maslak', votes: [] },
      { id: 'c', text: 'Ataşehir', votes: [] },
      { id: 'd', text: 'Kadıköy', votes: [] },
    ]
  },
  {
    id: 2, title: 'Haftalık Toplantı Günü', description: 'Haftalık ekip toplantısı için en uygun gün hangisi?',
    createdBy: 'patron', createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'single', isActive: false, isAnonymous: true,
    options: [
      { id: 'a', text: 'Pazartesi', votes: [{ userId: 'u1', votedAt: new Date().toISOString() }, { userId: 'u2', votedAt: new Date().toISOString() }] },
      { id: 'b', text: 'Çarşamba', votes: [{ userId: 'u3', votedAt: new Date().toISOString() }, { userId: 'u4', votedAt: new Date().toISOString() }, { userId: 'u5', votedAt: new Date().toISOString() }] },
      { id: 'c', text: 'Cuma', votes: [{ userId: 'u6', votedAt: new Date().toISOString() }] },
    ]
  }
];

const SurveySystem = ({ user, isBoss, canManage, isDark }) => {
  const [surveys, setSurveys] = useState(loadSurveys);
  const [view, setView] = useState('list'); // list | create | results
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [expandedSurvey, setExpandedSurvey] = useState(null);

  useEffect(() => { localStorage.setItem('sam_surveys', JSON.stringify(surveys)); }, [surveys]);

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  const userId = user?.id || user?.username || 'unknown';
  const activeSurveys = surveys.filter(s => s.isActive && new Date(s.expiresAt) > new Date());
  const expiredSurveys = surveys.filter(s => !s.isActive || new Date(s.expiresAt) <= new Date());

  const hasVoted = (survey) => {
    return survey.options.some(o => o.votes.some(v => v.userId === userId));
  };

  const vote = (surveyId, optionId) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      if (hasVoted(s)) return s; // zaten oy vermiş
      return {
        ...s,
        options: s.options.map(o => o.id === optionId
          ? { ...o, votes: [...o.votes, { userId, votedAt: new Date().toISOString() }] }
          : o
        )
      };
    }));
  };

  const deleteSurvey = (id) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
  };

  const closeSurvey = (id) => {
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
  };

  const getTotalVotes = (survey) => survey.options.reduce((sum, o) => sum + o.votes.length, 0);

  // ─── CREATE FORM ─────────────
  const CreateSurveyForm = () => {
    const [form, setForm] = useState({
      title: '', description: '', type: 'single',
      isAnonymous: false, durationDays: 7,
      options: [{ id: '1', text: '' }, { id: '2', text: '' }]
    });

    const addOption = () => {
      setForm(p => ({ ...p, options: [...p.options, { id: String(Date.now()), text: '' }] }));
    };

    const removeOption = (id) => {
      if (form.options.length <= 2) return;
      setForm(p => ({ ...p, options: p.options.filter(o => o.id !== id) }));
    };

    const submit = () => {
      if (!form.title.trim() || form.options.filter(o => o.text.trim()).length < 2) return;
      const newSurvey = {
        id: Date.now(),
        title: form.title.trim(),
        description: form.description.trim(),
        createdBy: user?.name || user?.username || 'patron',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + form.durationDays * 86400000).toISOString(),
        type: form.type,
        isActive: true,
        isAnonymous: form.isAnonymous,
        options: form.options.filter(o => o.text.trim()).map(o => ({ ...o, text: o.text.trim(), votes: [] }))
      };
      setSurveys(prev => [newSurvey, ...prev]);
      setView('list');
    };

    return (
      <div className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni Anket Oluştur</h3>
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Anket Başlığı *</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Anket başlığını girin..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Açıklama</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder="Kısa açıklama..."
            className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm resize-none`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Anket Tipi</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className={`w-full ${inputClass} border rounded-xl px-3 py-2.5 text-sm`}>
              <option value="single">Tek Seçim</option>
              <option value="multiple">Çoklu Seçim</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Süre (gün)</label>
            <input type="number" min={1} max={90} value={form.durationDays}
              onChange={e => setForm(p => ({ ...p, durationDays: parseInt(e.target.value) || 7 }))}
              className={`w-full ${inputClass} border rounded-xl px-3 py-2.5 text-sm`} />
          </div>
          <div className="flex items-end">
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input type="checkbox" checked={form.isAnonymous}
                onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))}
                className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-sm">Anonim Oylama</span>
              {form.isAnonymous ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-emerald-500" />}
            </label>
          </div>
        </div>
        {/* Seçenekler  */}
        <div>
          <label className={`block text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Seçenekler *</label>
          <div className="space-y-2">
            {form.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <input type="text" value={opt.text}
                  onChange={e => setForm(p => ({ ...p, options: p.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o) }))}
                  placeholder={`Seçenek ${idx + 1}`}
                  className={`flex-1 ${inputClass} border rounded-xl px-3 py-2 text-sm`} />
                {form.options.length > 2 && (
                  <button onClick={() => removeOption(opt.id)}
                    className={`p-1.5 rounded-xl ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption}
            className={`mt-2 flex items-center gap-1 text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
            <Plus size={16} /> Seçenek Ekle
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => setView('list')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            İptal
          </button>
          <button onClick={submit}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            Anketi Yayınla
          </button>
        </div>
      </div>
    );
  };

  // ─── RESULT BAR ─────────────
  const ResultBar = ({ option, total, isMax, voted }) => {
    const pct = total > 0 ? Math.round((option.votes.length / total) * 100) : 0;
    return (
      <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
        <div className={`absolute left-0 top-0 h-full rounded-xl transition-all duration-500 ${
          isMax ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30' : isDark ? 'bg-slate-600/50' : 'bg-slate-200'
        }`} style={{ width: `${pct}%` }} />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {voted && <CheckCircle2 size={16} className="text-emerald-500" />}
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{option.text}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{option.votes.length} oy</span>
            <span className={`text-sm font-bold ${isMax ? 'text-indigo-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{pct}%</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── SURVEY CARD ─────────────
  const SurveyCard = ({ survey }) => {
    const isExpired = !survey.isActive || new Date(survey.expiresAt) <= new Date();
    const voted = hasVoted(survey);
    const total = getTotalVotes(survey);
    const maxVotes = Math.max(...survey.options.map(o => o.votes.length));
    const isExpanded = expandedSurvey === survey.id;
    const daysLeft = Math.max(0, Math.ceil((new Date(survey.expiresAt) - new Date()) / 86400000));

    return (
      <div className={`${cardClass} rounded-2xl border overflow-hidden transition-all`}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isExpired ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">Bitti</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Aktif</span>
                )}
                {survey.isAnonymous && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Lock size={10} /> Anonim
                  </span>
                )}
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {survey.type === 'single' ? 'Tek Seçim' : 'Çoklu Seçim'}
                </span>
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{survey.title}</h3>
              {survey.description && <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{survey.description}</p>}
            </div>
            <div className="flex items-center gap-1">
              {isBoss && (
                <>
                  {!isExpired && (
                    <button onClick={() => closeSurvey(survey.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`} title="Anketi kapat">
                      <Lock size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteSurvey(survey.id)}
                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`} title="Anketi sil">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-4 mb-4 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1"><Users size={12} /> {total} oy</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {isExpired ? 'Süre doldu' : `${daysLeft} gün kaldı`}
            </span>
            <span>{survey.createdBy} tarafından oluşturuldu</span>
          </div>

          {/* Vote or results */}
          {!isExpired && !voted ? (
            <div className="space-y-2">
              {survey.options.map((opt, idx) => (
                <button key={opt.id} onClick={() => vote(survey.id, opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isDark ? 'border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {survey.options.map(opt => {
                const isMax = opt.votes.length === maxVotes && maxVotes > 0;
                const isMyVote = opt.votes.some(v => v.userId === userId);
                return <ResultBar key={opt.id} option={opt} total={total} isMax={isMax} voted={isMyVote} />;
              })}
            </div>
          )}

          {voted && !isExpired && (
            <p className={`mt-3 text-xs flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <CheckCircle2 size={14} /> Oyunuz kaydedildi
            </p>
          )}
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
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Anket & Oylama</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {activeSurveys.length} aktif anket · {expiredSurveys.length} tamamlanmış
          </p>
        </div>
        {isBoss && view === 'list' && (
          <button onClick={() => setView('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            <Plus size={18} /> Anket Oluştur
          </button>
        )}
        {!isBoss && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            <AlertCircle size={14} /> Sadece yöneticiler anket oluşturabilir
          </div>
        )}
      </div>

      {view === 'create' && isBoss ? <CreateSurveyForm /> : (
        <>
          {/* Active surveys */}
          {activeSurveys.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <RadioTower size={15} className="text-emerald-500" /> Aktif Anketler
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeSurveys.map(s => <SurveyCard key={s.id} survey={s} />)}
              </div>
            </div>
          )}

          {/* Expired surveys */}
          {expiredSurveys.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <BarChart3 size={15} className="text-slate-400" /> Tamamlanan Anketler
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {expiredSurveys.map(s => <SurveyCard key={s.id} survey={s} />)}
              </div>
            </div>
          )}

          {activeSurveys.length === 0 && expiredSurveys.length === 0 && (
            <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
              <Vote size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Henüz anket oluşturulmamış</p>
              {isBoss && <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>İlk anketi siz oluşturun!</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SurveySystem;
