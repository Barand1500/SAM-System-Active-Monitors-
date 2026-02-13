import { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Calendar,
  Timer,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const TimeTracker = ({ user, isDark }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weeklyLogs, setWeeklyLogs] = useState([
    { date: '2024-02-12', checkIn: '09:00', checkOut: '18:15', breakMinutes: 60, totalHours: 8.25 },
    { date: '2024-02-11', checkIn: '08:45', checkOut: '17:30', breakMinutes: 45, totalHours: 8.0 },
    { date: '2024-02-10', checkIn: '09:15', checkOut: '18:00', breakMinutes: 60, totalHours: 7.75 },
    { date: '2024-02-09', checkIn: '09:00', checkOut: '17:45', breakMinutes: 45, totalHours: 8.0 },
    { date: '2024-02-08', checkIn: '08:30', checkOut: '17:30', breakMinutes: 60, totalHours: 8.0 },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (startTime) => {
    if (!startTime) return '00:00:00';
    const diff = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = () => {
    setCheckInTime(new Date());
    setIsWorking(true);
    setTotalBreakTime(0);
  };

  const handleCheckOut = () => {
    setIsWorking(false);
    setCheckInTime(null);
    setIsOnBreak(false);
  };

  const handleBreakToggle = () => {
    if (isOnBreak) {
      const breakDuration = Math.floor((new Date() - breakStartTime) / 1000 / 60);
      setTotalBreakTime(prev => prev + breakDuration);
      setIsOnBreak(false);
      setBreakStartTime(null);
    } else {
      setBreakStartTime(new Date());
      setIsOnBreak(true);
    }
  };

  const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.totalHours, 0);
  const avgDaily = (weeklyTotal / weeklyLogs.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Ana Saat Kartı */}
      <div className={`rounded-3xl p-8 ${isDark ? 'bg-slate-800' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600'} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm">Bugün</p>
              <p className="text-lg font-medium">{currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold font-mono">{formatTime(currentTime)}</p>
            </div>
          </div>

          {isWorking ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Giriş Saati</p>
                  <p className="text-xl font-semibold">{checkInTime?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Çalışma Süresi</p>
                  <p className="text-xl font-semibold font-mono">{formatDuration(checkInTime)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBreakToggle}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                            ${isOnBreak 
                              ? 'bg-amber-500 hover:bg-amber-600' 
                              : 'bg-white/20 hover:bg-white/30'}`}
                >
                  <Coffee size={20} />
                  {isOnBreak ? 'Moladan Dön' : 'Mola Ver'}
                </button>
                <button
                  onClick={handleCheckOut}
                  className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 
                           bg-red-500/80 hover:bg-red-500 transition-all"
                >
                  <LogOut size={20} />
                  Çıkış Yap
                </button>
              </div>

              {isOnBreak && (
                <div className="bg-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Coffee size={18} className="animate-pulse" />
                    Mola Süresi
                  </span>
                  <span className="font-mono font-semibold">{formatDuration(breakStartTime)}</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 
                       bg-white text-indigo-600 hover:bg-white/90 transition-all text-lg"
            >
              <LogIn size={24} />
              Mesaiye Giriş Yap
            </button>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar size={16} className="text-indigo-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{weeklyLogs.length}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gün bu hafta</p>
        </div>

        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Timer size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{weeklyTotal}s</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toplam saat</p>
        </div>

        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp size={16} className="text-purple-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{avgDaily}s</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Günlük ort.</p>
        </div>
      </div>

      {/* Haftalık Kayıtlar */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bu Hafta</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {weeklyLogs.map((log, index) => (
            <div key={index} className={`p-4 flex items-center justify-between hover:${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} transition-colors`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center`}>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {new Date(log.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {log.checkIn} - {log.checkOut}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{log.totalHours} saat</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{log.breakMinutes} dk mola</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
