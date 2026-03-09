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
  ChevronRight,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';

const STORAGE_KEY = 'sam_timetracker';

const loadTrackerState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);
    // Tarihleri Date objesine çevir
    if (data.checkInTime) data.checkInTime = new Date(data.checkInTime);
    if (data.breakStartTime) data.breakStartTime = new Date(data.breakStartTime);
    if (data.workLogs) data.workLogs = data.workLogs.map(l => ({ ...l, time: new Date(l.time) }));
    if (data.breakLogs) data.breakLogs = data.breakLogs.map(l => ({
      ...l,
      startTime: new Date(l.startTime),
      endTime: l.endTime ? new Date(l.endTime) : null
    }));
    // Bugünün tarihini kontrol et - farklı güne ait veriyse sıfırla
    const today = new Date().toDateString();
    if (data.savedDate !== today) return null;
    return data;
  } catch { return null; }
};

const TimeTracker = ({ user, isDark }) => {
  const savedState = loadTrackerState();
  const [isWorking, setIsWorking] = useState(savedState?.isWorking || false);
  const [isOnBreak, setIsOnBreak] = useState(savedState?.isOnBreak || false);
  const [checkInTime, setCheckInTime] = useState(savedState?.checkInTime || null);
  const [breakStartTime, setBreakStartTime] = useState(savedState?.breakStartTime || null);
  const [totalBreakTime, setTotalBreakTime] = useState(savedState?.totalBreakTime || 0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakLogs, setBreakLogs] = useState(savedState?.breakLogs || []);
  const [workLogs, setWorkLogs] = useState(savedState?.workLogs || []);
  const [weeklyLogs, setWeeklyLogs] = useState([
    { date: '2024-02-12', checkIn: '09:00', checkOut: '18:15', breakMinutes: 60, totalHours: 8.25 },
    { date: '2024-02-11', checkIn: '08:45', checkOut: '17:30', breakMinutes: 45, totalHours: 8.0 },
    { date: '2024-02-10', checkIn: '09:15', checkOut: '18:00', breakMinutes: 60, totalHours: 7.75 },
    { date: '2024-02-09', checkIn: '09:00', checkOut: '17:45', breakMinutes: 45, totalHours: 8.0 },
    { date: '2024-02-08', checkIn: '08:30', checkOut: '17:30', breakMinutes: 60, totalHours: 8.0 },
  ]);

  // localStorage'a kaydet
  useEffect(() => {
    const data = {
      isWorking, isOnBreak, totalBreakTime, breakLogs, workLogs,
      checkInTime: checkInTime?.toISOString() || null,
      breakStartTime: breakStartTime?.toISOString() || null,
      savedDate: new Date().toDateString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [isWorking, isOnBreak, checkInTime, breakStartTime, totalBreakTime, breakLogs, workLogs]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatTimeShort = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime) => {
    if (!startTime) return '00:00:00';
    const diff = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatMinutesToText = (mins) => {
    if (mins < 1) return 'az önce';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} saat ${m} dk`;
    if (h > 0) return `${h} saat`;
    return `${m} dk`;
  };

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsWorking(true);
    setTotalBreakTime(0);
    setBreakLogs([]);
    setWorkLogs([{ id: Date.now(), type: 'checkin', time: now, message: `Mesaiye giriş yapıldı` }]);
  };

  const handleCheckOut = () => {
    const now = new Date();
    setWorkLogs(prev => [...prev, { id: Date.now(), type: 'checkout', time: now, message: `Mesaiden çıkış yapıldı` }]);
    setIsWorking(false);
    setCheckInTime(null);
    setIsOnBreak(false);
  };

  const handleBreakToggle = () => {
    if (isOnBreak) {
      const now = new Date();
      const breakDurationSec = Math.floor((now - breakStartTime) / 1000);
      const breakDuration = Math.floor(breakDurationSec / 60);
      setTotalBreakTime(prev => prev + breakDuration);
      setBreakLogs(prev => [...prev, {
        id: Date.now(),
        startTime: breakStartTime,
        endTime: now,
        duration: breakDuration,
        durationSeconds: breakDurationSec
      }]);
      // Çalışma geçmişinden önceki mola başlangıcını bul ve aradaki çalışma süresini hesapla
      const lastWorkStart = workLogs.filter(l => l.type === 'checkin' || l.type === 'break_end').pop();
      const workDurationBeforeBreak = lastWorkStart ? Math.floor((breakStartTime - lastWorkStart.time) / 1000 / 60) : 0;
      setWorkLogs(prev => [...prev, { 
        id: Date.now(), 
        type: 'break_end', 
        time: now, 
        breakDuration: breakDuration,
        workDurationBefore: workDurationBeforeBreak,
        message: `Moladan dönüldü (${formatMinutesToText(breakDuration)} mola verildi)` 
      }]);
      setIsOnBreak(false);
      setBreakStartTime(null);
    } else {
      const now = new Date();
      // Mola öncesi çalışma süresini hesapla
      const lastEvent = workLogs.filter(l => l.type === 'checkin' || l.type === 'break_end').pop();
      const workDuration = lastEvent ? Math.floor((now - lastEvent.time) / 1000 / 60) : 0;
      setWorkLogs(prev => [...prev, { 
        id: Date.now(), 
        type: 'break_start', 
        time: now, 
        workDurationBefore: workDuration,
        message: `Mola verildi (${formatMinutesToText(workDuration)} çalışıldı)` 
      }]);
      setBreakStartTime(now);
      setIsOnBreak(true);
    }
  };

  const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.totalHours, 0);
  const avgDaily = (weeklyTotal / weeklyLogs.length).toFixed(1);

  const getNetWorkTime = () => {
    if (!checkInTime) return '0s 0dk';
    const totalSeconds = Math.floor((currentTime - checkInTime) / 1000);
    const currentBreakMins = isOnBreak ? Math.floor((currentTime - breakStartTime) / 1000 / 60) : 0;
    const breakSeconds = (totalBreakTime + currentBreakMins) * 60;
    const netSeconds = Math.max(0, totalSeconds - breakSeconds);
    const h = Math.floor(netSeconds / 3600);
    const m = Math.floor((netSeconds % 3600) / 60);
    return `${h}s ${m}dk`;
  };

  const getTotalBreakDisplay = () => {
    let total = totalBreakTime;
    if (isOnBreak && breakStartTime) {
      total += Math.floor((currentTime - breakStartTime) / 1000 / 60);
    }
    return `${total} dk`;
  };

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

              {/* Net Çalışma & Mola Özeti */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-white/60 text-xs">Net Çalışma</p>
                  <p className="text-base font-semibold">{getNetWorkTime()}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-white/60 text-xs">Toplam Mola</p>
                  <p className="text-base font-semibold">{getTotalBreakDisplay()}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-white/60 text-xs">Mola Sayısı</p>
                  <p className="text-base font-semibold">{breakLogs.length}{isOnBreak ? '+1' : ''}</p>
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

      {/* Bugünkü Zaman Çizelgesi */}
      {isWorking && workLogs.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bugünkü Zaman Çizelgesi</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                Çalışma: {getNetWorkTime()}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                Mola: {getTotalBreakDisplay()}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-0">
            {workLogs.map((log, index) => (
              <div key={log.id} className="flex gap-3">
                {/* Zaman çizgisi */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    log.type === 'checkin' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    log.type === 'checkout' ? 'bg-red-100 dark:bg-red-900/30' :
                    log.type === 'break_start' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {log.type === 'checkin' && <LogIn size={14} className="text-emerald-600" />}
                    {log.type === 'checkout' && <LogOut size={14} className="text-red-600" />}
                    {log.type === 'break_start' && <Coffee size={14} className="text-amber-600" />}
                    {log.type === 'break_end' && <Play size={14} className="text-blue-600" />}
                  </div>
                  {index < workLogs.length - 1 && (
                    <div className={`w-0.5 h-8 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  )}
                  {index === workLogs.length - 1 && isOnBreak && (
                    <div className={`w-0.5 h-8 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  )}
                </div>
                {/* İçerik */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {log.message}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-mono font-bold ${
                          log.type === 'checkin' ? 'text-emerald-600' :
                          log.type === 'checkout' ? 'text-red-500' :
                          log.type === 'break_start' ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>
                          Saat {formatTimeShort(log.time)}
                        </span>
                        {log.type === 'break_start' && log.workDurationBefore > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            Öncesinde {formatMinutesToText(log.workDurationBefore)} çalışıldı
                          </span>
                        )}
                        {log.type === 'break_end' && log.breakDuration !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                            {formatMinutesToText(log.breakDuration)} mola kullanıldı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Aktif Mola Gösterimi */}
            {isOnBreak && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center animate-pulse">
                    <Coffee size={14} className="text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium text-amber-600`}>
                    Şu an molada...
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-amber-600">
                      {formatDuration(breakStartTime)} süredir molada
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mola Özeti Tablosu */}
      {isWorking && breakLogs.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Coffee size={18} className="text-amber-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Mola Detayları</h3>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-lg ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              {breakLogs.length} mola • Toplam {totalBreakTime} dk
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {breakLogs.map((log, index) => (
              <div key={log.id} className={`p-4 flex items-center justify-between hover:${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>#{index + 1}</span>
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {formatTimeShort(log.startTime)}
                      <ArrowRight size={12} className={`inline mx-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      {formatTimeShort(log.endTime)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Saat {formatTimeShort(log.startTime)}'de mola verildi, {formatTimeShort(log.endTime)}'de dönüldü
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                  {log.duration} dk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
