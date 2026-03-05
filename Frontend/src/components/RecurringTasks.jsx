import { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  X, 
  Calendar, 
  Clock,
  Trash2,
  Edit2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from 'lucide-react';

const RecurringTasks = ({ isDark, onCreateTask }) => {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('recurringTemplates');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Haftalık Toplantı',
        description: 'Pazartesi sabah ekip toplantısı',
        frequency: 'weekly',
        dayOfWeek: 1, // Pazartesi
        time: '09:00',
        priority: 'medium',
        assigneeId: null,
        isActive: true,
        lastRun: null,
        nextRun: getNextRun('weekly', 1, '09:00'),
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Aylık Rapor',
        description: 'Aylık performans raporunun hazırlanması',
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '10:00',
        priority: 'high',
        assigneeId: null,
        isActive: true,
        lastRun: null,
        nextRun: getNextRun('monthly', 1, '10:00'),
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const frequencies = [
    { value: 'daily', label: 'Her Gün' },
    { value: 'weekly', label: 'Her Hafta' },
    { value: 'biweekly', label: 'İki Haftada Bir' },
    { value: 'monthly', label: 'Her Ay' },
  ];

  const weekDays = [
    { value: 0, label: 'Pazar' },
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
  ];

  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('recurringTemplates', JSON.stringify(newTemplates));
  };

  // Template kaydet
  const handleSave = (templateData) => {
    if (editingTemplate) {
      const updated = templates.map(t => 
        t.id === editingTemplate.id ? { ...t, ...templateData, nextRun: calculateNextRun(templateData) } : t
      );
      saveTemplates(updated);
    } else {
      const newTemplate = {
        id: Date.now().toString(),
        ...templateData,
        isActive: true,
        lastRun: null,
        nextRun: calculateNextRun(templateData),
        createdAt: new Date().toISOString()
      };
      saveTemplates([...templates, newTemplate]);
    }
    setShowModal(false);
    setEditingTemplate(null);
  };

  // Template sil
  const handleDelete = (id) => {
    if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      saveTemplates(templates.filter(t => t.id !== id));
      setActiveMenu(null);
    }
  };

  // Aktif/Pasif toggle
  const toggleActive = (id) => {
    const updated = templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );
    saveTemplates(updated);
  };

  // Şimdi çalıştır
  const runNow = (template) => {
    if (onCreateTask) {
      onCreateTask({
        title: template.title,
        description: template.description,
        priority: template.priority,
        assigneeId: template.assigneeId,
        dueDate: new Date().toISOString(),
        isRecurring: true,
        recurringTemplateId: template.id
      });
      
      // Son çalışma zamanını güncelle
      const updated = templates.map(t => 
        t.id === template.id 
          ? { ...t, lastRun: new Date().toISOString(), nextRun: calculateNextRun(t) } 
          : t
      );
      saveTemplates(updated);
    }
  };

  // Sonraki çalışma tarihini formatla
  const formatNextRun = (nextRun) => {
    if (!nextRun) return 'Belirsiz';
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return 'Gecikmiş';
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours > 0 ? `${hours} saat sonra` : 'Yakında';
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} gün sonra`;
    }
    return date.toLocaleDateString('tr-TR');
  };

  const getFrequencyLabel = (freq) => {
    return frequencies.find(f => f.value === freq)?.label || freq;
  };

  return (
    <div className={`rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Repeat size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Tekrarlayan Görevler
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {templates.filter(t => t.isActive).length} aktif şablon
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 
                     text-white rounded-xl hover:shadow-lg transition-all text-sm"
          >
            <Plus size={16} />
            <span className="font-medium">Şablon Ekle</span>
          </button>
        </div>
      </div>

      {/* Template Listesi */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {templates.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Repeat size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz şablon yok</p>
          </div>
        ) : (
          templates.map((template) => (
            <div 
              key={template.id}
              className={`p-4 transition-colors ${
                template.isActive 
                  ? isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                  : isDark ? 'bg-slate-700/30 opacity-60' : 'bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleActive(template.id)}
                  className={`mt-1 w-10 h-6 rounded-full transition-colors relative ${
                    template.isActive 
                      ? 'bg-purple-500' 
                      : isDark ? 'bg-slate-600' : 'bg-slate-300'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      template.isActive ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {template.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      template.priority === 'high' 
                        ? 'bg-red-100 text-red-600' 
                        : template.priority === 'medium'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}>
                      {template.priority === 'high' ? 'Yüksek' : template.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  
                  {template.description && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Repeat size={14} />
                      <span>{getFrequencyLabel(template.frequency)}</span>
                      {template.frequency === 'weekly' && (
                        <span>• {weekDays.find(d => d.value === template.dayOfWeek)?.label}</span>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock size={14} />
                      <span>{template.time}</span>
                    </div>

                    <div className={`flex items-center gap-1 ${
                      template.isActive 
                        ? 'text-purple-500' 
                        : isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <Calendar size={14} />
                      <span>Sonraki: {formatNextRun(template.nextRun)}</span>
                    </div>
                  </div>
                </div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-1">
                  {template.isActive && (
                    <button
                      onClick={() => runNow(template)}
                      className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      title="Şimdi Çalıştır"
                    >
                      <Play size={18} />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                      }`}
                    >
                      <MoreVertical size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </button>

                    {activeMenu === template.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className={`absolute right-0 top-10 w-36 rounded-xl shadow-xl z-20 overflow-hidden ${
                          isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                        }`}>
                          <button
                            onClick={() => {
                              setEditingTemplate(template);
                              setShowModal(true);
                              setActiveMenu(null);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                              isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Edit2 size={14} />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 ${
                              isDark ? 'hover:bg-slate-600' : 'hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={14} />
                            Sil
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Modal */}
      {showModal && (
        <TemplateModal
          isDark={isDark}
          template={editingTemplate}
          frequencies={frequencies}
          weekDays={weekDays}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Sonraki çalışmayı hesapla
function getNextRun(frequency, dayValue, time) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    const currentDay = now.getDay();
    let daysUntil = dayValue - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
      daysUntil += 7;
    }
    next.setDate(next.getDate() + daysUntil);
  } else if (frequency === 'monthly') {
    next.setDate(dayValue);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next.toISOString();
}

function calculateNextRun(template) {
  return getNextRun(
    template.frequency, 
    template.frequency === 'weekly' ? template.dayOfWeek : template.dayOfMonth || 1,
    template.time
  );
}

// Template Modal
const TemplateModal = ({ isDark, template, frequencies, weekDays, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    frequency: template?.frequency || 'weekly',
    dayOfWeek: template?.dayOfWeek ?? 1,
    dayOfMonth: template?.dayOfMonth || 1,
    time: template?.time || '09:00',
    priority: template?.priority || 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {template ? 'Şablonu Düzenle' : 'Yeni Şablon'}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Görev Başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tekrar
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                {frequencies.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Gün
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-700'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {weekDays.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ayın Günü
                </label>
                <select
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-700'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Saat
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 
                       text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {template ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTasks;
