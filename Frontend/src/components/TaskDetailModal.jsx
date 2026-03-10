import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
  MoreVertical,
  Timer,
  Play,
  Github,
  Link,
  Check,
  Settings,
  Move
} from 'lucide-react';

const TaskDetailModal = ({ task, onClose, onUpdate, user, isDark, canManage = true }) => {
  const [activeTab, setActiveTab] = useState('details'); // details, comments, activity
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Canlı sayaç için timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ESC tuşu ile kapanma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Alt görevler (şimdilik local state)
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  
  // GitHub modal state
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubConfig, setGithubConfig] = useState({
    username: task.githubConfig?.username || '',
    repoUrl: task.githubConfig?.repoUrl || '',
    issueNumber: task.githubConfig?.issueNumber || '',
    autoSync: task.githubConfig?.autoSync || false
  });
  
  // Draggable modal state
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // ESC tuşu ile GitHub modal kapatma
  useEffect(() => {
    const handleGithubEscape = (e) => {
      if (e.key === 'Escape' && showGithubModal) {
        setShowGithubModal(false);
      }
    };
    if (showGithubModal) {
      document.addEventListener('keydown', handleGithubEscape);
      return () => document.removeEventListener('keydown', handleGithubEscape);
    }
  }, [showGithubModal]);

  // Dragging handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.modal-header')) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setModalPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Modal açıldığında pozisyonu sıfırla
  useEffect(() => {
    if (showGithubModal) {
      setModalPosition({ x: 0, y: 0 });
    }
  }, [showGithubModal]);

  // Yorumlar (şimdilik local state)
  const [comments, setComments] = useState(task.comments || []);

  // Aktivite geçmişi — görev verisinden oluştur
  const activities = [
    { id: 1, type: 'created', user: task.assignedBy ? `${task.assignedBy.firstName || ''} ${task.assignedBy.lastName || ''}`.trim() : 'Sistem', date: task.createdAt || new Date().toISOString(), detail: 'Görevi oluşturdu' },
    ...(task.assignedTo ? [{ id: 2, type: 'assigned', user: task.assignedBy ? `${task.assignedBy.firstName || ''} ${task.assignedBy.lastName || ''}`.trim() : 'Sistem', date: task.createdAt || new Date().toISOString(), detail: `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}'e atadı` }] : []),
    ...(task.status === 'completed' && task.completedAt ? [{ id: 3, type: 'status', user: task.assignedTo ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim() : 'Sistem', date: task.completedAt, detail: 'Durumu "Tamamlandı" olarak değiştirdi' }] : []),
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
      <div 
        className={`w-full max-w-3xl my-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
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
              {canManage && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Edit3 size={18} />
                </button>
              )}
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
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {(task.assignedTo.firstName || '?')[0]}{(task.assignedTo.lastName || '?')[0]}
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {task.assignedTo.firstName} {task.assignedTo.lastName}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Atanmadı</span>
                  )}
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bitiş Tarihi</span>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belirtilmemiş'}
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

              {/* GitHub Entegrasyonu */}
              <div>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Entegrasyonlar</h4>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${task.githubEnabled ? 'bg-slate-900 dark:bg-white' : isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <svg className={`w-5 h-5 ${task.githubEnabled ? 'text-white dark:text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>GitHub Entegrasyonu</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {task.githubEnabled ? 'Görev GitHub ile senkronize ediliyor' : 'GitHub entegrasyonu devre dışı'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowGithubModal(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        task.githubEnabled 
                          ? isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      <Settings size={16} />
                      {task.githubEnabled ? 'Yapılandır' : 'Aktifleştir'}
                    </button>
                  </div>
                  {task.githubEnabled && task.githubConfig && (
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <div className={`px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'}`}>
                            <span className="font-medium">Kullanıcı:</span> @{task.githubConfig.username}
                          </div>
                          {task.githubConfig.issueNumber && (
                            <div className={`px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'}`}>
                              <span className="font-medium">Issue:</span> {task.githubConfig.issueNumber}
                            </div>
                          )}
                          {task.githubConfig.autoSync && (
                            <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <Check size={12} className="inline mr-1" />
                              Otomatik Senkron
                            </div>
                          )}
                        </div>
                        {task.githubConfig.repoUrl && (
                          <a 
                            href={task.githubConfig.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1 text-xs hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                          >
                            <Link size={12} />
                            {task.githubConfig.repoUrl}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
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
              {/* Canlı Sayaç - Görev Süresi */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-indigo-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'} flex items-center justify-center`}>
                      <Timer size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Sayacı</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oluşturulmadan bu yana geçen süre</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {(() => {
                        const created = new Date(activities[0]?.date || task.createdAt);
                        const diffMs = currentTime - created;
                        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                        if (days > 0) return `${days}g ${hours}s ${mins}dk ${secs}sn`;
                        if (hours > 0) return `${hours}s ${mins}dk ${secs}sn`;
                        return `${mins}dk ${secs}sn`;
                      })()}
                    </p>
                    {task.status !== 'completed' && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Aktif</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Özet bilgi kartları */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className={`p-2.5 rounded-lg text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Toplam Aktivite</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{activities.length}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Katkıda Bulunan</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{[...new Set(activities.map(a => a.user))].length}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Son Güncelleme</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {(() => {
                        const last = activities[activities.length - 1];
                        if (!last) return '-';
                        const diffMs = currentTime - new Date(last.date);
                        const mins = Math.floor(diffMs / (1000 * 60));
                        const hrs = Math.floor(mins / 60);
                        const days = Math.floor(hrs / 24);
                        if (days > 0) return `${days} gün önce`;
                        if (hrs > 0) return `${hrs}s önce`;
                        if (mins > 0) return `${mins}dk önce`;
                        return 'Az önce';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aktivite Zaman Çizelgesi */}
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Detaylı Aktivite Geçmişi
                </h4>
              </div>
              {activities.map((activity, index) => {
                const elapsed = index > 0 ? (() => {
                  const prev = new Date(activities[index - 1].date);
                  const curr = new Date(activity.date);
                  const diffMs = curr - prev;
                  const mins = Math.floor(diffMs / (1000 * 60));
                  const hrs = Math.floor(mins / 60);
                  const days = Math.floor(hrs / 24);
                  if (days > 0) return `${days} gün ${hrs % 24} saat sonra`;
                  if (hrs > 0) return `${hrs} saat ${mins % 60} dk sonra`;
                  return `${mins} dk sonra`;
                })() : null;

                const activityTypeLabel = {
                  created: 'Görev Oluşturma',
                  assigned: 'Görev Atama',
                  status: 'Durum Değişikliği',
                  comment: 'Yorum',
                  subtask: 'Alt Görev'
                };

                return (
                  <div key={activity.id}>
                    {elapsed && (
                      <div className={`flex items-center gap-2 ml-4 mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                        <div className="w-px h-3 bg-current" />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          ⏱ {elapsed}
                        </span>
                        <div className="w-px h-3 bg-current" />
                      </div>
                    )}
                    <div className={`flex gap-4 p-3 rounded-xl ${isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50'} transition-colors`}>
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          activity.type === 'created' ? 'bg-emerald-100 text-emerald-600' :
                          activity.type === 'assigned' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'status' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'comment' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {activity.type === 'created' && <Flag size={16} />}
                          {activity.type === 'assigned' && <User size={16} />}
                          {activity.type === 'status' && <Clock size={16} />}
                          {activity.type === 'comment' && <MessageSquare size={16} />}
                          {activity.type === 'subtask' && <CheckSquare size={16} />}
                        </div>
                        {index < activities.length - 1 && (
                          <div className={`w-px h-6 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div className="pb-2 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                                activity.type === 'created' ? 'bg-emerald-100 text-emerald-700' :
                                activity.type === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                activity.type === 'status' ? 'bg-purple-100 text-purple-700' :
                                activity.type === 'comment' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {activityTypeLabel[activity.type] || activity.type}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="font-semibold">{activity.user}</span>{' '}
                              <span>{activity.detail}</span>
                            </p>
                          </div>
                          <span className={`text-xs shrink-0 ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {(() => {
                              const diffMs = currentTime - new Date(activity.date);
                              const mins = Math.floor(diffMs / (1000 * 60));
                              const hrs = Math.floor(mins / 60);
                              const days = Math.floor(hrs / 24);
                              if (days > 0) return `${days} gün önce`;
                              if (hrs > 0) return `${hrs}s önce`;
                              if (mins > 0) return `${mins}dk önce`;
                              return 'Az önce';
                            })()}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* GitHub Entegrasyon Modal */}
      {showGithubModal && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            ref={modalRef}
            onMouseDown={handleMouseDown}
            className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-300'} shadow-2xl ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{ 
              pointerEvents: 'auto',
              transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Modal Header - Draggable */}
            <div className={`modal-header p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} cursor-move select-none`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 dark:bg-white">
                    <Github size={24} className="text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        GitHub Entegrasyonu
                      </h3>
                      <Move size={16} className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Görev için GitHub ayarlarını yapılandırın
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGithubModal(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* GitHub Kullanıcı Adı */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <Github size={16} />
                    GitHub Kullanıcı Adı
                  </div>
                </label>
                <input
                  type="text"
                  value={githubConfig.username}
                  onChange={(e) => setGithubConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="örn: kullanici123"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              {/* Repository URL */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <Link size={16} />
                    Repository URL
                  </div>
                </label>
                <input
                  type="url"
                  value={githubConfig.repoUrl}
                  onChange={(e) => setGithubConfig(prev => ({ ...prev, repoUrl: e.target.value }))}
                  placeholder="https://github.com/kullanici/proje"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              {/* Issue Numarası */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <Flag size={16} />
                    Issue Numarası (Opsiyonel)
                  </div>
                </label>
                <input
                  type="text"
                  value={githubConfig.issueNumber}
                  onChange={(e) => setGithubConfig(prev => ({ ...prev, issueNumber: e.target.value }))}
                  placeholder="örn: #42"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              {/* Otomatik Senkronizasyon */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${githubConfig.autoSync ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <CheckSquare size={18} className={githubConfig.autoSync ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Otomatik Senkronizasyon
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Görev güncellemeleri otomatik olarak GitHub'a aktarılsın
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGithubConfig(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      githubConfig.autoSync ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      githubConfig.autoSync ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-3`}>
              <button
                onClick={() => {
                  setShowGithubModal(false);
                  setGithubConfig({
                    username: task.githubConfig?.username || '',
                    repoUrl: task.githubConfig?.repoUrl || '',
                    issueNumber: task.githubConfig?.issueNumber || '',
                    autoSync: task.githubConfig?.autoSync || false
                  });
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const isEnabled = !!(githubConfig.username && githubConfig.repoUrl);
                  const updated = { 
                    ...task, 
                    githubEnabled: isEnabled,
                    githubConfig: githubConfig 
                  };
                  onUpdate(task.id, updated);
                  setShowGithubModal(false);
                }}
                disabled={!githubConfig.username || !githubConfig.repoUrl}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  (!githubConfig.username || !githubConfig.repoUrl)
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                }`}
              >
                <Check size={18} />
                Kaydet ve Aktifleştir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TaskDetailModal;
