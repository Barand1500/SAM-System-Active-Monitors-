import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  StickyNote,
  X,
  Save,
  Trash2,
  Edit
} from 'lucide-react';

const loadPersonalNotes = () => {
  try {
    const saved = localStorage.getItem('sam_personal_notes');
    const data = saved ? JSON.parse(saved) : {};
    // Eski format (string) → yeni format (array) dönüşümü
    const migrated = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string') {
        migrated[key] = [{ id: Date.now(), text: val, createdAt: new Date().toISOString() }];
      } else {
        migrated[key] = val;
      }
    }
    return migrated;
  } catch { return {}; }
};

const CalendarView = ({ tasks, isDark, onTaskClick, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [personalNotes, setPersonalNotes] = useState(loadPersonalNotes);
  const [noteModal, setNoteModal] = useState(null); // dateStr or null
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    localStorage.setItem('sam_personal_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const dayNamesFull = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const days = [];
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonth.getDate() - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const getWeekDays = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      days.push({ date: dayDate, isCurrentMonth: true });
    }
    return days;
  };

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const isToday = (date) => new Date().toDateString() === date.toDateString();

  const prevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const openNoteModal = (dateStr, e) => {
    e.stopPropagation();
    setNoteText('');
    setEditingNoteId(null);
    setNoteModal(dateStr);
  };

  const saveNote = () => {
    if (!noteModal || !noteText.trim()) return;
    setPersonalNotes(prev => {
      const dateNotes = prev[noteModal] || [];
      if (editingNoteId) {
        return { ...prev, [noteModal]: dateNotes.map(n => n.id === editingNoteId ? { ...n, text: noteText.trim() } : n) };
      }
      return { ...prev, [noteModal]: [...dateNotes, { id: Date.now(), text: noteText.trim(), createdAt: new Date().toISOString() }] };
    });
    setNoteText('');
    setEditingNoteId(null);
  };

  const deleteNote = (noteId) => {
    if (!noteModal) return;
    setPersonalNotes(prev => {
      const dateNotes = (prev[noteModal] || []).filter(n => n.id !== noteId);
      if (dateNotes.length === 0) {
        const next = { ...prev };
        delete next[noteModal];
        return next;
      }
      return { ...prev, [noteModal]: dateNotes };
    });
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setNoteText('');
    }
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setNoteText('');
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    onAddTask?.(dateStr);
  };

  const days = view === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);

  const priorityColors = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500'
  };

  const statusColors = {
    pending: 'border-l-slate-400',
    in_progress: 'border-l-blue-500',
    review: 'border-l-purple-500',
    completed: 'border-l-emerald-500'
  };

  const getWeekRangeText = () => {
    const weekDays = getWeekDays(currentDate);
    const start = weekDays[0].date;
    const end = weekDays[6].date;
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {view === 'month' 
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : getWeekRangeText()
            }
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevPeriod}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              <ChevronLeft size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            <button 
              onClick={nextPeriod}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              <ChevronRight size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={goToToday}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${isDark ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            Bugün
          </button>
          <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${view === 'month' 
                          ? (isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 shadow-sm') 
                          : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
            >
              Ay
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${view === 'week' 
                          ? (isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 shadow-sm') 
                          : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
            >
              Hafta
            </button>
          </div>
        </div>
      </div>

      {/* Day Names */}
      <div className={`grid grid-cols-7 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        {(view === 'week' ? dayNamesFull : dayNames).map((day, i) => (
          <div key={i} className={`py-3 text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7`}>
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day.date);
          const today = isToday(day.date);
          const minH = view === 'week' ? 'min-h-52' : 'min-h-28';
          const dateStr = day.date.toISOString().split('T')[0];
          const noteList = personalNotes[dateStr] || [];
          const hasNote = noteList.length > 0;
          
          return (
            <div 
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`${minH} p-2 border-b border-r cursor-pointer transition-colors group
                        ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-indigo-50/30'}
                        ${!day.isCurrentMonth ? (isDark ? 'bg-slate-800/50' : 'bg-slate-50/50') : ''}
                        ${today ? (isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/50') : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                                ${today 
                                  ? 'bg-indigo-500 text-white' 
                                  : day.isCurrentMonth 
                                    ? (isDark ? 'text-white' : 'text-slate-800')
                                    : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                    {day.date.getDate()}
                  </div>
                  {hasNote && (
                    <button onClick={(e) => openNoteModal(dateStr, e)} title={`${noteList.length} not`}>
                      <div className="flex items-center gap-0.5">
                        <StickyNote size={12} className="text-amber-500" />
                        {noteList.length > 1 && <span className="text-[10px] font-bold text-amber-500">{noteList.length}</span>}
                      </div>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <div onClick={(e) => openNoteModal(dateStr, e)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-amber-100'}`}
                    title="Not ekle">
                    <StickyNote size={13} className={isDark ? 'text-amber-400' : 'text-amber-500'} />
                  </div>
                  {onAddTask && (
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-indigo-100'}`}>
                    <Plus size={14} className={isDark ? 'text-slate-400' : 'text-indigo-500'} />
                  </div>
                  )}
                </div>
              </div>

              {/* Kişisel not gösterimi */}
              {hasNote && (
                <div onClick={(e) => openNoteModal(dateStr, e)}
                  className={`text-xs p-1.5 rounded-md mb-1 truncate cursor-pointer ${isDark ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                  📝 {noteList[0].text}{noteList.length > 1 ? ` (+${noteList.length - 1})` : ''}
                </div>
              )}
              
              <div className="space-y-1">
                {dayTasks.slice(0, view === 'week' ? 5 : 3).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick?.(task); }}
                    className={`text-xs p-1.5 rounded-md truncate border-l-2 cursor-pointer transition-colors
                              ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}
                              ${statusColors[task.status]}`}
                  >
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > (view === 'week' ? 5 : 3) && (
                  <div className={`text-xs px-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    +{dayTasks.length - (view === 'week' ? 5 : 3)} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kişisel Not Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setNoteModal(null); setEditingNoteId(null); setNoteText(''); }}>
          <div onClick={e => e.stopPropagation()} className={`w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-amber-500" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Kişisel Notlar</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {new Date(noteModal + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button onClick={() => { setNoteModal(null); setEditingNoteId(null); setNoteText(''); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Mevcut notlar listesi */}
              {(personalNotes[noteModal] || []).length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(personalNotes[noteModal] || []).map(note => (
                    <div key={note.id} className={`p-3 rounded-xl border ${editingNoteId === note.id ? (isDark ? 'border-amber-500/50 bg-amber-500/5' : 'border-amber-300 bg-amber-50') : (isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50')}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm flex-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{note.text}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEditNote(note)}
                            className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                            <Edit size={13} />
                          </button>
                          <button onClick={() => deleteNote(note.id)}
                            className={`p-1 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Not ekleme/düzenleme alanı */}
              <div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder={editingNoteId ? "Notu düzenleyin..." : "Yeni not ekleyin... (Sadece siz görebilirsiniz)"}
                  rows={3}
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  {editingNoteId && (
                    <button onClick={cancelEdit}
                      className={`px-3 py-1.5 text-sm rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                      İptal
                    </button>
                  )}
                  <button onClick={saveNote}
                    disabled={!noteText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save size={14} /> {editingNoteId ? 'Güncelle' : 'Not Ekle'}
                  </button>
                </div>
              </div>

              {(personalNotes[noteModal] || []).length === 0 && (
                <p className={`text-center text-xs py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Bu tarih için henüz not eklenmemiş
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;