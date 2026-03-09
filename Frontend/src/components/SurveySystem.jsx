import { useState, useEffect } from 'react';
import {
  Plus, BarChart3, PieChart, CheckCircle2, X, Users, Clock,
  Vote, ChevronDown, ChevronUp, Eye, Trash2, Edit, Lock, Unlock,
  ListChecks, RadioTower, Star, TrendingUp, AlertCircle, GitBranch,
  ArrowRight, MessageSquare, Hash, Type, ThumbsUp, ThumbsDown
} from 'lucide-react';

const loadSurveys = () => {
  try {
    const saved = localStorage.getItem('sam_surveys');
    if (!saved) return defaultSurveys;
    const parsed = JSON.parse(saved);
    // Eski veri formatını yeni formata dönüştür
    return parsed.map(s => {
      if (s.questions) return s; // zaten yeni format
      return {
        ...s,
        questions: [{
          id: 'q1', text: s.title, type: s.type || 'single',
          options: (s.options || []).map(o => ({ id: o.id, text: o.text })),
          condition: null
        }],
        responses: (s.options || []).flatMap(o =>
          (o.votes || []).map(v => ({ userId: v.userId, answeredAt: v.votedAt, answers: { q1: o.id } }))
        )
      };
    });
  } catch { return defaultSurveys; }
};

const defaultSurveys = [
  {
    id: 1, title: 'Yeni Ofis Konumu Tercihi', description: 'Yeni ofis konumu için personelinizin tercihini öğrenin.',
    createdBy: 'patron', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    isActive: true, isAnonymous: false,
    questions: [
      { id: 'q1', text: 'Hangi konumu tercih edersiniz?', type: 'single', options: [
        { id: 'a', text: 'Levent' }, { id: 'b', text: 'Maslak' }, { id: 'c', text: 'Ataşehir' }, { id: 'd', text: 'Kadıköy' }
      ], condition: null },
      { id: 'q2', text: 'Ulaşım tercihiniz nedir?', type: 'single', options: [
        { id: 'e', text: 'Toplu taşıma' }, { id: 'f', text: 'Özel araç' }, { id: 'g', text: 'Servis' }
      ], condition: null },
      { id: 'q3', text: 'Maslak için hangi bina tercih edilmeli?', type: 'single', options: [
        { id: 'h', text: 'Sun Plaza' }, { id: 'i', text: 'Vadi İstanbul' }
      ], condition: { questionId: 'q1', optionId: 'b' } }
    ],
    responses: []
  },
  {
    id: 2, title: 'Haftalık Toplantı Günü', description: 'Haftalık ekip toplantısı için en uygun gün hangisi?',
    createdBy: 'patron', createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isActive: false, isAnonymous: true,
    questions: [
      { id: 'q1', text: 'Hangi gün tercih edersiniz?', type: 'single', options: [
        { id: 'a', text: 'Pazartesi' }, { id: 'b', text: 'Çarşamba' }, { id: 'c', text: 'Cuma' }
      ], condition: null }
    ],
    responses: [
      { userId: 'u1', answeredAt: new Date().toISOString(), answers: { q1: 'a' } },
      { userId: 'u2', answeredAt: new Date().toISOString(), answers: { q1: 'a' } },
      { userId: 'u3', answeredAt: new Date().toISOString(), answers: { q1: 'b' } },
      { userId: 'u4', answeredAt: new Date().toISOString(), answers: { q1: 'b' } },
      { userId: 'u5', answeredAt: new Date().toISOString(), answers: { q1: 'b' } },
      { userId: 'u6', answeredAt: new Date().toISOString(), answers: { q1: 'c' } },
    ]
  }
];

const SurveySystem = ({ user, isBoss, canManage, isDark }) => {
  const [surveys, setSurveys] = useState(loadSurveys);
  const [view, setView] = useState('list');
  const [statsId, setStatsId] = useState(null);
  const [voteFormSurveyId, setVoteFormSurveyId] = useState(null);

  useEffect(() => { localStorage.setItem('sam_surveys', JSON.stringify(surveys)); }, [surveys]);

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  const userId = user?.id || user?.username || 'unknown';
  const activeSurveys = surveys.filter(s => s.isActive && new Date(s.expiresAt) > new Date());
  const expiredSurveys = surveys.filter(s => !s.isActive || new Date(s.expiresAt) <= new Date());

  const hasResponded = (survey) => survey.responses.some(r => r.userId === userId);

  const submitResponse = (surveyId, answers) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId || hasResponded(s)) return s;
      return { ...s, responses: [...s.responses, { userId, answeredAt: new Date().toISOString(), answers }] };
    }));
  };

  const deleteSurvey = (id) => setSurveys(prev => prev.filter(s => s.id !== id));
  const closeSurvey = (id) => setSurveys(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));

  // ─── CREATE FORM ─────────────
  const CreateSurveyForm = () => {
    const [form, setForm] = useState({
      title: '', description: '', isAnonymous: false, durationDays: 7,
      questions: [{ id: 'q1', text: '', type: 'single', options: [{ id: 'o1', text: '' }, { id: 'o2', text: '' }], condition: null }]
    });

    const addQuestion = () => {
      const qid = 'q' + Date.now();
      setForm(p => ({
        ...p, questions: [...p.questions, {
          id: qid, text: '', type: 'single',
          options: [{ id: 'o' + Date.now(), text: '' }, { id: 'o' + (Date.now() + 1), text: '' }],
          condition: null
        }]
      }));
    };

    const removeQuestion = (qid) => {
      if (form.questions.length <= 1) return;
      setForm(p => ({
        ...p,
        questions: p.questions.filter(q => q.id !== qid).map(q =>
          q.condition?.questionId === qid ? { ...q, condition: null } : q
        )
      }));
    };

    const updateQuestion = (qid, updates) => {
      setForm(p => ({ ...p, questions: p.questions.map(q => q.id === qid ? { ...q, ...updates } : q) }));
    };

    const addOption = (qid) => {
      setForm(p => ({
        ...p, questions: p.questions.map(q =>
          q.id === qid ? { ...q, options: [...q.options, { id: 'o' + Date.now(), text: '' }] } : q)
      }));
    };

    const removeOption = (qid, oid) => {
      setForm(p => ({
        ...p, questions: p.questions.map(q => {
          if (q.id !== qid || q.options.length <= 2) return q;
          return { ...q, options: q.options.filter(o => o.id !== oid) };
        }).map(q => {
          if (q.condition?.optionId === oid) return { ...q, condition: null };
          return q;
        })
      }));
    };

    const updateOption = (qid, oid, text) => {
      setForm(p => ({
        ...p, questions: p.questions.map(q =>
          q.id === qid ? { ...q, options: q.options.map(o => o.id === oid ? { ...o, text } : o) } : q)
      }));
    };

    const setCondition = (qid, condQuestionId, condOptionId) => {
      setForm(p => ({
        ...p, questions: p.questions.map(q =>
          q.id === qid ? { ...q, condition: condQuestionId ? { questionId: condQuestionId, optionId: condOptionId } : null } : q)
      }));
    };

    const submit = () => {
      const validQs = form.questions.filter(q => {
        if (!q.text.trim()) return false;
        if (q.type === 'text' || q.type === 'rating' || q.type === 'yesno') return true;
        return q.options.filter(o => o.text.trim()).length >= 2;
      });
      if (!form.title.trim() || validQs.length === 0) return;
      const newSurvey = {
        id: Date.now(), title: form.title.trim(), description: form.description.trim(),
        createdBy: user?.name || user?.username || 'patron',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + form.durationDays * 86400000).toISOString(),
        isActive: true, isAnonymous: form.isAnonymous,
        questions: validQs.map(q => ({
          ...q, text: q.text.trim(),
          options: q.options.filter(o => o.text.trim()).map(o => ({ ...o, text: o.text.trim() }))
        })),
        responses: []
      };
      setSurveys(prev => [newSurvey, ...prev]);
      setView('list');
    };

    // Önceki soruların listesi (koşul için)
    const getPreviousQuestions = (currentIdx) => form.questions.slice(0, currentIdx);

    return (
      <div className={`${cardClass} rounded-2xl border p-6 space-y-5`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni Anket Oluştur</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Anket Başlığı *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Anket başlığı..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Açıklama</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Kısa açıklama..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm`} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Süre (gün)</label>
            <input type="number" min={1} max={90} value={form.durationDays}
              onChange={e => setForm(p => ({ ...p, durationDays: parseInt(e.target.value) || 7 }))}
              className={`w-24 ${inputClass} border rounded-xl px-3 py-2 text-sm`} />
          </div>
          <label className={`flex items-center gap-2 cursor-pointer mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input type="checkbox" checked={form.isAnonymous}
              onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm">Anonim Oylama</span>
            {form.isAnonymous ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-emerald-500" />}
          </label>
        </div>

        {/* Sorular */}
        <div className="space-y-4">
          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Sorular</label>
          {form.questions.map((q, qIdx) => {
            const prevQs = getPreviousQuestions(qIdx);
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>Soru {qIdx + 1}</span>
                  <div className="flex items-center gap-2">
                    <select value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value })}
                      className={`text-xs px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <option value="single">Tek Seçim</option>
                      <option value="multiple">Çoklu Seçim</option>
                      <option value="text">Yazılı Cevap</option>
                      <option value="rating">Puan (1-5)</option>
                      <option value="yesno">Evet / Hayır</option>
                    </select>
                    {form.questions.length > 1 && (
                      <button onClick={() => removeQuestion(q.id)}
                        className={`p-1 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Koşullu soru */}
                {qIdx > 0 && (
                  <div className={`mb-3 p-2.5 rounded-lg ${q.condition ? (isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200') : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <GitBranch size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Koşul:</span>
                      <select value={q.condition?.questionId || ''} onChange={e => {
                        const cqId = e.target.value;
                        if (!cqId) { setCondition(q.id, null, null); return; }
                        const cq = form.questions.find(x => x.id === cqId);
                        setCondition(q.id, cqId, cq?.options[0]?.id || '');
                      }}
                        className={`text-xs px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <option value="">Koşulsuz (her zaman göster)</option>
                        {prevQs.filter(pq => pq.type === 'single' || pq.type === 'multiple').map((pq, pi) => <option key={pq.id} value={pq.id}>Soru {form.questions.indexOf(pq) + 1}: {pq.text || '(soru)'} cevabına bağlı</option>)}
                      </select>
                      {q.condition?.questionId && (
                        <>
                          <ArrowRight size={12} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                          <select value={q.condition.optionId} onChange={e => setCondition(q.id, q.condition.questionId, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                            {form.questions.find(x => x.id === q.condition.questionId)?.options.filter(o => o.text.trim()).map((o, i) =>
                              <option key={o.id} value={o.id}>{o.text}</option>
                            )}
                          </select>
                          <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>seçilirse göster</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <input type="text" value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Soru metni..." className={`w-full ${inputClass} border rounded-xl px-4 py-2.5 text-sm mb-3`} />

                {/* Tip bilgisi */}
                {q.type === 'text' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-slate-600/30' : 'bg-blue-50'}`}>
                    <Type size={14} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Katılımcılar yazılı cevap verecek</span>
                  </div>
                )}
                {q.type === 'rating' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-slate-600/30' : 'bg-amber-50'}`}>
                    <Star size={14} className="text-amber-500" />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Katılımcılar 1-5 arası puan verecek</span>
                    <div className="flex gap-0.5 ml-2">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                )}
                {q.type === 'yesno' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-slate-600/30' : 'bg-emerald-50'}`}>
                    <ThumbsUp size={14} className="text-emerald-500" />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Katılımcılar Evet veya Hayır seçecek</span>
                  </div>
                )}

                {(q.type === 'single' || q.type === 'multiple') && (
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <input type="text" value={opt.text}
                        onChange={e => updateOption(q.id, opt.id, e.target.value)}
                        placeholder={`Seçenek ${oIdx + 1}`}
                        className={`flex-1 ${inputClass} border rounded-lg px-3 py-1.5 text-sm`} />
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(q.id, opt.id)}
                          className={`p-1 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <button onClick={() => addOption(q.id)}
                      className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <Plus size={13} /> Seçenek Ekle
                    </button>
                    <label className={`flex items-center gap-1.5 cursor-pointer text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <input type="checkbox" checked={q.hasOther || false}
                        onChange={e => updateQuestion(q.id, { hasOther: e.target.checked })}
                        className="w-3.5 h-3.5 rounded accent-indigo-600" />
                      "Diğer" seçeneği ekle
                    </label>
                  </div>
                </div>
                )}
              </div>
            );
          })}
          <button onClick={addQuestion}
            className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}>
            <Plus size={16} /> Soru Ekle
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

  // ─── VOTE FORM ─────────────
  const VoteForm = ({ survey, onClose }) => {
    const [answers, setAnswers] = useState({});
    const [otherTexts, setOtherTexts] = useState({});
    const [step, setStep] = useState(0);

    const visibleQuestions = survey.questions.filter(q => {
      if (!q.condition) return true;
      const parentAnswer = answers[q.condition.questionId];
      if (Array.isArray(parentAnswer)) return parentAnswer.includes(q.condition.optionId);
      return parentAnswer === q.condition.optionId;
    });

    const currentQ = visibleQuestions[step];
    if (!currentQ) return null;

    const selectOption = (optId) => {
      if (currentQ.type === 'multiple') {
        setAnswers(prev => {
          const cur = prev[currentQ.id] || [];
          return { ...prev, [currentQ.id]: cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId] };
        });
      } else {
        setAnswers(prev => ({ ...prev, [currentQ.id]: optId }));
      }
    };

    const canNext = () => {
      const a = answers[currentQ.id];
      if (currentQ.type === 'text') return a && a.trim().length > 0;
      if (currentQ.type === 'rating') return a && a >= 1 && a <= 5;
      if (currentQ.type === 'yesno') return a === 'yes' || a === 'no';
      if (a === '__other__') return (otherTexts[currentQ.id] || '').trim().length > 0;
      if (Array.isArray(a)) return a.length > 0;
      return !!a;
    };

    const isLast = step >= visibleQuestions.length - 1;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-lg rounded-3xl border ${cardClass} shadow-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{survey.title}</h3>
            <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={18} /></button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-5">
            {visibleQuestions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-indigo-500' : isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            ))}
          </div>

          <div className="mb-2">
            <span className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Soru {step + 1} / {visibleQuestions.length}</span>
            {currentQ.condition && (
              <span className={`ml-2 text-xs flex items-center gap-1 inline-flex ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <GitBranch size={11} /> Koşullu soru
              </span>
            )}
          </div>
          <p className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentQ.text}</p>
          <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {currentQ.type === 'multiple' ? 'Birden fazla seçenek işaretleyebilirsiniz' : 
             currentQ.type === 'text' ? 'Cevabınızı yazın' :
             currentQ.type === 'rating' ? '1-5 arası puan verin' :
             currentQ.type === 'yesno' ? 'Evet veya Hayır seçin' :
             'Bir seçenek seçin'}
          </p>

          {/* Yazılı Cevap */}
          {currentQ.type === 'text' && (
            <div className="mb-5">
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                placeholder="Cevabınızı buraya yazın..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>
          )}

          {/* Puan (Rating) */}
          {currentQ.type === 'rating' && (
            <div className="flex items-center justify-center gap-3 mb-5 py-4">
              {[1,2,3,4,5].map(val => (
                <button key={val} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
                  className="transition-all hover:scale-110">
                  <Star size={36} className={`transition-colors ${(answers[currentQ.id] || 0) >= val ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          )}

          {/* Evet / Hayır */}
          {currentQ.type === 'yesno' && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: 'yes' }))}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[currentQ.id] === 'yes'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30'
                    : isDark ? 'border-slate-600 text-slate-300 hover:border-emerald-500/50' : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}>
                <ThumbsUp size={20} /> Evet
              </button>
              <button onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: 'no' }))}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[currentQ.id] === 'no'
                    ? 'border-red-500 bg-red-500/10 text-red-600 ring-1 ring-red-500/30'
                    : isDark ? 'border-slate-600 text-slate-300 hover:border-red-500/50' : 'border-slate-200 text-slate-600 hover:border-red-300'
                }`}>
                <ThumbsDown size={20} /> Hayır
              </button>
            </div>
          )}

          {/* Seçenekli (single/multiple) */}
          {(currentQ.type === 'single' || currentQ.type === 'multiple') && (
          <div className="space-y-2 mb-5">
            {currentQ.options.map((opt, i) => {
              const selected = currentQ.type === 'multiple'
                ? (answers[currentQ.id] || []).includes(opt.id)
                : answers[currentQ.id] === opt.id;
              return (
                <button key={opt.id} onClick={() => selectOption(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selected ? 'bg-indigo-500 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.text}</span>
                  {selected && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
                </button>
              );
            })}
            {currentQ.hasOther && (() => {
              const isOtherSelected = answers[currentQ.id] === '__other__';
              return (
                <div>
                  <button onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: '__other__' }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isOtherSelected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isOtherSelected ? 'bg-indigo-500 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>✎</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Diğer</span>
                    {isOtherSelected && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
                  </button>
                  {isOtherSelected && (
                    <input
                      type="text"
                      value={otherTexts[currentQ.id] || ''}
                      onChange={e => setOtherTexts(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                      placeholder="Cevabınızı yazın..."
                      autoFocus
                      className={`w-full mt-2 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
                    />
                  )}
                </div>
              );
            })()}
          </div>
          )}

          <div className="flex justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                Geri
              </button>
            ) : <div />}
            {isLast ? (
              <button onClick={() => {
                // __other__ cevaplarını gerçek metinle değiştir
                const finalAnswers = { ...answers };
                for (const [qId, val] of Object.entries(finalAnswers)) {
                  if (val === '__other__') {
                    finalAnswers[qId] = `other:${(otherTexts[qId] || '').trim()}`;
                  }
                }
                submitResponse(survey.id, finalAnswers); onClose();
              }} disabled={!canNext()}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg disabled:opacity-50">
                Gönder
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg disabled:opacity-50">
                Sonraki
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── STATISTICS VIEW ─────────────
  const StatsView = ({ survey, onClose }) => {
    const total = survey.responses.length;
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border ${cardClass} shadow-2xl`}>
          <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-white'} p-6 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>İstatistikler: {survey.title}</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {total} katılımcı · {survey.isAnonymous ? 'Anonim' : 'Açık'} · {survey.createdBy} tarafından
                </p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20} /></button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Genel bilgi */}
            <div className={`grid grid-cols-3 gap-3`}>
              {[
                { label: 'Toplam Katılım', value: total, icon: Users, color: 'text-indigo-500' },
                { label: 'Soru Sayısı', value: survey.questions.length, icon: Hash, color: 'text-purple-500' },
                { label: 'Koşullu Soru', value: survey.questions.filter(q => q.condition).length, icon: GitBranch, color: 'text-amber-500' },
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <stat.icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Her soru için detay */}
            {survey.questions.map((q, qIdx) => {
              const qResponses = survey.responses.filter(r => r.answers[q.id] !== undefined);
              const qTotal = qResponses.length;

              const typeLabel = q.type === 'single' ? 'Tek seçim' : q.type === 'multiple' ? 'Çoklu seçim' : q.type === 'text' ? 'Yazılı cevap' : q.type === 'rating' ? 'Puan' : q.type === 'yesno' ? 'Evet/Hayır' : q.type;

              return (
                <div key={q.id} className={`p-5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>S{qIdx + 1}</span>
                    {q.condition && <GitBranch size={12} className="text-amber-500" />}
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{typeLabel} · {qTotal} yanıt</span>
                  </div>
                  <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{q.text}</h4>

                  {/* Yazılı cevap istatistikleri */}
                  {q.type === 'text' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {qResponses.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz cevap yok</p>
                      ) : qResponses.map((r, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                          "{r.answers[q.id]}"
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating istatistikleri */}
                  {q.type === 'rating' && (() => {
                    const ratings = qResponses.map(r => r.answers[q.id]).filter(v => typeof v === 'number');
                    const avg = ratings.length > 0 ? (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1) : 0;
                    const distribution = [1,2,3,4,5].map(v => ({ value: v, count: ratings.filter(r => r === v).length }));
                    const maxC = Math.max(...distribution.map(d => d.count), 1);
                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(v => <Star key={v} size={20} className={`${parseFloat(avg) >= v ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />)}
                          </div>
                          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{avg}</span>
                          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 5</span>
                        </div>
                        <div className="space-y-1.5">
                          {distribution.reverse().map(d => (
                            <div key={d.value} className="flex items-center gap-2">
                              <span className={`text-xs w-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d.value}</span>
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              <div className={`flex-1 h-4 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${maxC > 0 ? (d.count / maxC) * 100 : 0}%` }} />
                              </div>
                              <span className={`text-xs w-6 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Evet/Hayır istatistikleri */}
                  {q.type === 'yesno' && (() => {
                    const yesCount = qResponses.filter(r => r.answers[q.id] === 'yes').length;
                    const noCount = qResponses.filter(r => r.answers[q.id] === 'no').length;
                    const yesPct = qTotal > 0 ? Math.round((yesCount / qTotal) * 100) : 0;
                    const noPct = qTotal > 0 ? Math.round((noCount / qTotal) * 100) : 0;
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                          <ThumbsUp size={24} className="mx-auto mb-1 text-emerald-500" />
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{yesPct}%</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evet ({yesCount})</p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                          <ThumbsDown size={24} className="mx-auto mb-1 text-red-500" />
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{noPct}%</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hayır ({noCount})</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Seçenekli (single/multiple) Bar chart */}
                  {(q.type === 'single' || q.type === 'multiple') && (() => {
                    const otherResponses = qResponses.filter(r => {
                      const a = r.answers[q.id];
                      return typeof a === 'string' && a.startsWith('other:');
                    });
                    const normalResponses = qResponses.filter(r => {
                      const a = r.answers[q.id];
                      return !(typeof a === 'string' && a.startsWith('other:'));
                    });
                    const optionCounts = (q.options || []).map(opt => {
                      const count = normalResponses.filter(r => {
                        const a = r.answers[q.id];
                        return Array.isArray(a) ? a.includes(opt.id) : a === opt.id;
                      }).length;
                      return { ...opt, count };
                    });
                    if (otherResponses.length > 0) {
                      optionCounts.push({ id: '__other__', text: 'Diğer', count: otherResponses.length });
                    }
                    optionCounts.sort((a, b) => b.count - a.count);
                    const maxCount = Math.max(...optionCounts.map(o => o.count), 1);
                    return (
                      <div>
                        <div className="space-y-2.5">
                          {optionCounts.map((opt, i) => {
                            const pct = qTotal > 0 ? Math.round((opt.count / qTotal) * 100) : 0;
                            const barWidth = maxCount > 0 ? (opt.count / maxCount) * 100 : 0;
                            return (
                              <div key={opt.id}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{opt.text}</span>
                                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pct}% <span className={`font-normal text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({opt.count})</span></span>
                                </div>
                                <div className={`w-full h-6 rounded-lg overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                  <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {qTotal > 0 && (
                          <div className="flex items-center gap-4 mt-4 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {optionCounts.filter(o => o.count > 0).map((opt, i) => (
                                <span key={opt.id} className="flex items-center gap-1 text-xs" style={{ color: COLORS[i % COLORS.length] }}>
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                  {opt.text} ({Math.round((opt.count / qTotal) * 100)}%)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {otherResponses.length > 0 && (
                          <div className="mt-3">
                            <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Diğer cevaplar:</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {otherResponses.map((r, i) => (
                                <div key={i} className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                                  "{r.answers[q.id].replace('other:', '')}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── SURVEY CARD ─────────────
  const SurveyCard = ({ survey }) => {
    const isExpired = !survey.isActive || new Date(survey.expiresAt) <= new Date();
    const responded = hasResponded(survey);
    const total = survey.responses.length;
    const daysLeft = Math.max(0, Math.ceil((new Date(survey.expiresAt) - new Date()) / 86400000));
    const condCount = survey.questions.filter(q => q.condition).length;

    // ilk sorunun sonuçları göstermek için
    const firstQ = survey.questions[0];
    const firstQResponses = survey.responses.filter(r => r.answers[firstQ?.id] !== undefined);
    const firstQTotal = firstQResponses.length;

    return (
      <>
        <div className={`${cardClass} rounded-2xl border overflow-hidden transition-all`}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  {condCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <GitBranch size={10} /> {condCount} koşullu
                    </span>
                  )}
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{survey.questions.length} soru</span>
                </div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{survey.title}</h3>
                {survey.description && <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{survey.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setStatsId(survey.id)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`} title="İstatistikler">
                  <BarChart3 size={16} />
                </button>
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
              <span className="flex items-center gap-1"><Users size={12} /> {total} katılım</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {isExpired ? 'Süre doldu' : `${daysLeft} gün kaldı`}
              </span>
              <span>{survey.createdBy}</span>
            </div>

            {/* İlk sorunun sonuçları (önizleme) */}
            {(responded || isExpired) && firstQ && (
              <div className="space-y-1.5 mb-3">
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{firstQ.text}</p>
                
                {/* Rating önizleme */}
                {firstQ.type === 'rating' && (() => {
                  const ratings = firstQResponses.map(r => r.answers[firstQ.id]).filter(v => typeof v === 'number');
                  const avg = ratings.length > 0 ? (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1) : 0;
                  return (
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(v => <Star key={v} size={14} className={`${parseFloat(avg) >= v ? 'text-amber-400 fill-amber-400' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />)}
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{avg}/5</span>
                    </div>
                  );
                })()}

                {/* Evet/Hayır önizleme */}
                {firstQ.type === 'yesno' && (() => {
                  const yesCount = firstQResponses.filter(r => r.answers[firstQ.id] === 'yes').length;
                  const yesPct = firstQTotal > 0 ? Math.round((yesCount / firstQTotal) * 100) : 0;
                  return (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <ThumbsUp size={14} className="text-emerald-500" /> {yesPct}% Evet · <ThumbsDown size={14} className="text-red-500" /> {100 - yesPct}% Hayır
                    </div>
                  );
                })()}

                {/* Yazılı cevap önizleme */}
                {firstQ.type === 'text' && (
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{firstQTotal} yazılı cevap</p>
                )}

                {/* Seçenekli önizleme */}
                {(firstQ.type === 'single' || firstQ.type === 'multiple') && (firstQ.options || []).map(opt => {
                  const count = firstQResponses.filter(r => {
                    const a = r.answers[firstQ.id];
                    return Array.isArray(a) ? a.includes(opt.id) : a === opt.id;
                  }).length;
                  const pct = firstQTotal > 0 ? Math.round((count / firstQTotal) * 100) : 0;
                  const isMyVote = survey.responses.find(r => r.userId === userId)?.answers[firstQ.id] === opt.id;
                  const maxVotes = Math.max(...firstQ.options.map(o => firstQResponses.filter(r => { const a = r.answers[firstQ.id]; return Array.isArray(a) ? a.includes(o.id) : a === o.id; }).length));
                  const isMax = count === maxVotes && maxVotes > 0;
                  return (
                    <div key={opt.id} className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <div className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-500 ${
                        isMax ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30' : isDark ? 'bg-slate-600/50' : 'bg-slate-200'
                      }`} style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {isMyVote && <CheckCircle2 size={13} className="text-emerald-500" />}
                          <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.text}</span>
                        </div>
                        <span className={`text-xs font-bold ${isMax ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
                {survey.questions.length > 1 && (
                  <button onClick={() => setStatsId(survey.id)}
                    className={`text-xs font-medium flex items-center gap-1 mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    Tüm sonuçları gör ({survey.questions.length} soru) <ChevronDown size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Vote button */}
            {!isExpired && !responded && (
              <button onClick={() => setVoteFormSurveyId(survey.id)}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
                Oy Kullan
              </button>
            )}
            {responded && !isExpired && (
              <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <CheckCircle2 size={14} /> Oyunuz kaydedildi
              </p>
            )}
          </div>
        </div>
      </>
    );
  };

  const statsSurvey = surveys.find(s => s.id === statsId);

  // ─── MAIN ─────────────────
  return (
    <div className="space-y-5">
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

      {statsSurvey && <StatsView survey={statsSurvey} onClose={() => setStatsId(null)} />}
      {voteFormSurveyId && (() => {
        const voteSurvey = surveys.find(s => s.id === voteFormSurveyId);
        return voteSurvey ? <VoteForm survey={voteSurvey} onClose={() => setVoteFormSurveyId(null)} /> : null;
      })()}
    </div>
  );
};

export default SurveySystem;
