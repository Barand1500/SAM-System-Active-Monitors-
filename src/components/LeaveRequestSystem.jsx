import { useState } from 'react';
import { 
  Calendar,
  Plus,
  Check,
  X,
  Clock,
  Sun,
  Briefcase,
  Heart,
  GraduationCap,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  User,
  Filter
} from 'lucide-react';

const LeaveRequestSystem = ({ user, isBoss, isDark }) => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [newRequest, setNewRequest] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // İzin türleri
  const leaveTypes = [
    { id: 'annual', label: 'Yıllık İzin', icon: Sun, color: 'text-amber-500', bgColor: 'bg-amber-100' },
    { id: 'sick', label: 'Hastalık İzni', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-100' },
    { id: 'personal', label: 'Mazeret İzni', icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: 'education', label: 'Eğitim İzni', icon: GraduationCap, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  ];

  // Mock izin talepleri
  const [requests, setRequests] = useState([
    {
      id: 1,
      employeeId: 2,
      employeeName: 'Ayşe Demir',
      employeeAvatar: 'AD',
      type: 'annual',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      days: 5,
      reason: 'Aile ziyareti için yıllık izin talep ediyorum.',
      status: 'pending',
      createdAt: '2024-01-25',
    },
    {
      id: 2,
      employeeId: 3,
      employeeName: 'Mehmet Kaya',
      employeeAvatar: 'MK',
      type: 'sick',
      startDate: '2024-01-28',
      endDate: '2024-01-30',
      days: 3,
      reason: 'Grip nedeniyle doktor raporu aldım.',
      status: 'approved',
      createdAt: '2024-01-27',
      approvedBy: 'Ahmet Yılmaz',
      approvedAt: '2024-01-27'
    },
    {
      id: 3,
      employeeId: 4,
      employeeName: 'Zeynep Arslan',
      employeeAvatar: 'ZA',
      type: 'personal',
      startDate: '2024-02-10',
      endDate: '2024-02-10',
      days: 1,
      reason: 'Özel bir işim için günlük izin talep ediyorum.',
      status: 'rejected',
      createdAt: '2024-01-26',
      rejectedBy: 'Ahmet Yılmaz',
      rejectedAt: '2024-01-26',
      rejectionReason: 'Bu tarihte önemli bir toplantı var, lütfen başka bir gün talep edin.'
    },
  ]);

  // İzin bakiyeleri
  const leaveBalance = {
    annual: { total: 14, used: 5, remaining: 9 },
    sick: { total: 10, used: 3, remaining: 7 },
    personal: { total: 5, used: 2, remaining: 3 },
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <Clock size={12} />
            Beklemede
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            <Check size={12} />
            Onaylandı
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <X size={12} />
            Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'approved', approvedBy: user.firstName, approvedAt: new Date().toISOString().split('T')[0] } : r
    ));
  };

  const handleReject = (id) => {
    const reason = prompt('Red sebebi girin:');
    if (reason) {
      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'rejected', rejectedBy: user.firstName, rejectedAt: new Date().toISOString().split('T')[0], rejectionReason: reason } : r
      ));
    }
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const start = new Date(newRequest.startDate);
    const end = new Date(newRequest.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const request = {
      id: Date.now(),
      employeeId: user.id,
      employeeName: `${user.firstName} ${user.lastName}`,
      employeeAvatar: `${user.firstName?.[0]}${user.lastName?.[0]}`,
      ...newRequest,
      days,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRequests(prev => [request, ...prev]);
    setShowNewRequest(false);
    setNewRequest({ type: 'annual', startDate: '', endDate: '', reason: '' });
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            İzin Yönetimi
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBoss ? 'Çalışan izin taleplerini yönetin' : 'İzin taleplerinizi buradan takip edin'}
          </p>
        </div>

        {!isBoss && (
          <button 
            onClick={() => setShowNewRequest(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Plus size={20} />
            Yeni İzin Talebi
          </button>
        )}
      </div>

      {/* Çalışan için: İzin Bakiyesi */}
      {!isBoss && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(leaveBalance).map(([type, balance]) => {
            const leaveType = leaveTypes.find(lt => lt.id === type);
            const Icon = leaveType?.icon || Sun;
            return (
              <div key={type} className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${leaveType?.bgColor} flex items-center justify-center`}>
                    <Icon size={20} className={leaveType?.color} />
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{leaveType?.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{balance.remaining}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kalan Gün</p>
                  </div>
                  <div className={`text-right text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <p>{balance.used} kullanıldı</p>
                    <p>{balance.total} toplam</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtre */}
      <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'pending', label: 'Bekleyen' },
          { id: 'approved', label: 'Onaylanan' },
          { id: 'rejected', label: 'Reddedilen' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${filter === f.id 
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                        : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800')}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Talepler Listesi */}
      <div className="space-y-4">
        {filteredRequests.map(request => {
          const leaveType = leaveTypes.find(lt => lt.id === request.type);
          const Icon = leaveType?.icon || Sun;
          
          return (
            <div 
              key={request.id} 
              className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {request.employeeAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{request.employeeName}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={leaveType?.color} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{leaveType?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {new Date(request.startDate).toLocaleDateString('tr-TR')} - {new Date(request.endDate).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-sm font-medium text-indigo-500">({request.days} gün)</span>
                      </div>
                    </div>
                    <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{request.reason}</p>

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <AlertCircle size={16} className="text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">Red Sebebi:</p>
                          <p className="text-sm text-red-600 dark:text-red-300">{request.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isBoss && request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(request.id)}
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleReject(request.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Talep: {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                </span>
                {request.approvedAt && (
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {request.approvedBy} tarafından {new Date(request.approvedAt).toLocaleDateString('tr-TR')} tarihinde onaylandı
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Henüz izin talebi bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Yeni Talep Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
            <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni İzin Talebi</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>İzin talebinizi oluşturun</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              {/* İzin Türü */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  İzin Türü
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {leaveTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewRequest(prev => ({ ...prev, type: type.id }))}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors
                                  ${newRequest.type === type.id 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                                    : (isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300')}`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center`}>
                          <Icon size={20} className={type.color} />
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tarihler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={newRequest.startDate}
                    onChange={e => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={newRequest.endDate}
                    onChange={e => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newRequest.startDate}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Açıklama
                </label>
                <textarea
                  required
                  rows={3}
                  value={newRequest.reason}
                  onChange={e => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="İzin talebinizin sebebini açıklayın..."
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewRequest(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Talep Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestSystem;
