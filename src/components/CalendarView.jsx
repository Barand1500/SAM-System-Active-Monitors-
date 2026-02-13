import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User
} from 'lucide-react';

const CalendarView = ({ tasks, isDark, onTaskClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Haftanın hangi günü başlıyor (0=Pazar, 1=Pazartesi...)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];
    
    // Önceki aydan günler
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }
    
    // Mevcut ay günleri
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Sonraki aydan günler
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);

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

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              <ChevronLeft size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            <button 
              onClick={nextMonth}
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
                      ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
        {dayNames.map(day => (
          <div key={day} className={`py-3 text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day.date);
          const today = isToday(day.date);
          
          return (
            <div 
              key={index}
              onClick={() => onDateClick?.(day.date)}
              className={`min-h-28 p-2 border-b border-r cursor-pointer transition-colors
                        ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}
                        ${!day.isCurrentMonth ? (isDark ? 'bg-slate-800/50' : 'bg-slate-50/50') : ''}`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                            ${today 
                              ? 'bg-indigo-500 text-white' 
                              : day.isCurrentMonth 
                                ? (isDark ? 'text-white' : 'text-slate-800')
                                : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
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
                {dayTasks.length > 3 && (
                  <div className={`text-xs px-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    +{dayTasks.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
