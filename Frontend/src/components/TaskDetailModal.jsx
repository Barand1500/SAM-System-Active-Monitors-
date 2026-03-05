import { useState } from 'react';
import { 
  X, 
  Calendar,
  User,
  Flag,
  MessageSquare,
  Paperclip,
  Clock,
  CheckSquare,
  Plus,
  Send,
  Edit3,
  Trash2,
  AlertCircle,
  ChevronRight,
  History,
  MoreVertical
} from 'lucide-react';

const TaskDetailModal = ({ task, onClose, onUpdate, user, isDark }) => {
  const [activeTab, setActiveTab] = useState('details'); // details, comments, activity
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  // Mock alt görevler
  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Veritabanı şemasını tasarla', completed: true },
    { id: 2, title: 'API endpoint\'leri oluştur', completed: true },
    { id: 3, title: 'Frontend entegrasyonu', completed: false },
    { id: 4, title: 'Test senaryoları yaz', completed: false },
  ]);

  // Mock yorumlar
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { name: 'Ahmet Yılmaz', avatar: 'AY' },
      text: 'Bu görev öncelikli olarak tamamlanmalı.',
      createdAt: '2024-01-26T10:30:00'
    },
    {
      id: 2,
      author: { name: 'Ayşe Demir', avatar: 'AD' },
      text: 'Veritabanı şemasını tamamladım, PR\'ı açtım.',
      createdAt: '2024-01-26T14:15:00'
    }
  ]);

  // Mock aktivite geçmişi
  const activities = [
    { id: 1, type: 'created', user: 'Ahmet Yılmaz', date: '2024-01-25T09:00:00', detail: 'Görevi oluşturdu' },
    { id: 2, type: 'assigned', user: 'Ahmet Yılmaz', date: '2024-01-25T09:05:00', detail: 'Ayşe Demir\'e atadı' },
    { id: 3, type: 'status', user: 'Ayşe Demir', date: '2024-01-26T10:00:00', detail: 'Durumu "Devam Ediyor" olarak değiştirdi' },
    { id: 4, type: 'comment', user: 'Ahmet Yılmaz', date: '2024-01-26T10:30:00', detail: 'Yorum ekledi' },
    { id: 5, type: 'subtask', user: 'Ayşe Demir', date: '2024-01-26T14:00:00', detail: '"Veritabanı şemasını tasarla" alt görevini tamamladı' },
  ];

  const priorityConfig = {
    urgent: { label: 'Acil', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
    high: { label: 'Yüksek', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
    medium: { label: 'Orta', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
    low: { label: 'Düşük', color: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-400' },
  };

  const statusConfig = {
    pending: { label: 'Bekliyor', color: 'bg-slate-100 text-slate-700' },
    in_progress: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
    review: { label: 'İncelemede', color: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700' },
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { id: Date.now(), title: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: { name: `${user.firstName} ${user.lastName}`, avatar: `${user.firstName?.[0]}${user.lastName?.[0]}` },
        text: newComment,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl my-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[task.status]?.color}`}>
                  {statusConfig[task.status]?.label}
                </span>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
                  <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.dotColor}`} />
                  {priorityConfig[task.priority]?.label}
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={e => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full text-xl font-bold px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              ) : (
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-2 mx-6 mt-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
          {[
            { id: 'details', label: 'Detaylar', icon: Flag },
            { id: 'comments', label: 'Yorumlar', icon: MessageSquare, count: comments.length },
            { id: 'activity', label: 'Aktivite', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${activeTab === tab.id 
                            ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm') 
                            : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800')}`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Açıklama */}
              <div>
                <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Açıklama</h4>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ''}
                    onChange={e => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} resize-none`}
                  />
                ) : (
                  <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                    {task.description || 'Açıklama eklenmemiş.'}
                  </p>
                )}
              </div>

              {/* Bilgiler */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Atanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {task.assignedTo?.firstName?.[0]}{task.assignedTo?.lastName?.[0]}
                    </div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bitiş Tarihi</span>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Alt Görevler */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Alt Görevler ({completedSubtasks}/{subtasks.length})
                  </h4>
                  <span className={`text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    %{subtaskProgress}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className={`h-2 rounded-full mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {subtasks.map(subtask => (
                    <div 
                      key={subtask.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl group ${isDark ? 'bg-slate-900/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}
                    >
                      <button
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors
                                  ${subtask.completed 
                                    ? 'bg-indigo-500 border-indigo-500 text-white' 
                                    : (isDark ? 'border-slate-600 hover:border-indigo-500' : 'border-slate-300 hover:border-indigo-500')}`}
                      >
                        {subtask.completed && <CheckSquare size={14} />}
                      </button>
                      <span className={`flex-1 ${subtask.completed ? (isDark ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : (isDark ? 'text-white' : 'text-slate-700')}`}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Yeni Alt Görev */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={e => setNewSubtask(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddSubtask()}
                      placeholder="Yeni alt görev ekle..."
                      className={`flex-1 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ekler */}
              <div>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ekler</h4>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <Paperclip size={24} className={`mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Dosya eklemek için sürükleyin veya <span className="text-indigo-500 cursor-pointer">tıklayın</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Yorumlar */}
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium shrink-0">
                    {comment.author.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{comment.author.name}</span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{comment.text}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Henüz yorum yok</p>
                </div>
              )}

              {/* Yeni Yorum */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Yorum yaz..."
                    className={`flex-1 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'created' ? 'bg-emerald-100 text-emerald-600' :
                      activity.type === 'assigned' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'status' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'comment' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {activity.type === 'created' && <Flag size={14} />}
                      {activity.type === 'assigned' && <User size={14} />}
                      {activity.type === 'status' && <Clock size={14} />}
                      {activity.type === 'comment' && <MessageSquare size={14} />}
                      {activity.type === 'subtask' && <CheckSquare size={14} />}
                    </div>
                    {index < activities.length - 1 && (
                      <div className={`w-px h-12 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      <span className="font-medium">{activity.user}</span> {activity.detail}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
            <button
              onClick={() => setIsEditing(false)}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              İptal
            </button>
            <button
              onClick={() => {
                onUpdate && onUpdate(editedTask);
                setIsEditing(false);
              }}
              className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
