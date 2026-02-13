import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Play,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const priorityConfig = {
    low: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Düşük' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Orta' },
    high: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', label: 'Yüksek' },
    urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Acil' },
  };

  const statusConfig = {
    pending: { icon: Circle, bg: 'bg-slate-100', text: 'text-slate-600', label: 'Bekliyor' },
    in_progress: { icon: Clock, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Devam Ediyor' },
    review: { icon: Eye, bg: 'bg-violet-100', text: 'text-violet-600', label: 'İncelemede' },
    completed: { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Tamamlandı' },
  };

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  // Calculate days until deadline
  const deadline = new Date(task.deadline);
  const today = new Date();
  const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 2 && daysUntil >= 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      onClick={onClick}
      className="card-hover bg-white rounded-2xl p-5 cursor-pointer border border-slate-200/60
                 shadow-sm hover:shadow-xl group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Status & Priority */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${status.bg} ${status.text}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priority.bg} ${priority.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
          </div>
          
          <h3 className="text-slate-800 font-semibold text-base mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h3>
        </div>

        {/* Actions */}
        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 
                         opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {/* Target Role */}
      <div className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: `${task.targetRoleColor}15`,
            color: task.targetRoleColor,
          }}
        >
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: task.targetRoleColor }}
          />
          {task.targetRole}
        </span>
      </div>

      {/* Video Preview */}
      {task.videoUrl && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 flex items-center gap-3
                        border border-slate-200/60 hover:border-red-200 transition-colors group/video">
            <div className="w-10 h-10 gradient-danger rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Play size={18} className="text-white ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 font-medium truncate">Video Açıklaması</p>
              <p className="text-xs text-slate-400">YouTube / Loom</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover/video:text-red-500 transition-colors" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {/* Left - Assignee & Deadline */}
        <div className="flex items-center gap-3">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold
                          gradient-primary shadow-sm">
              {task.assignedTo[0]}
            </div>
            <span className="text-xs text-slate-600 font-medium">{task.assignedTo.split(' ')[0]}</span>
          </div>

          {/* Deadline */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
                        ${isOverdue 
                          ? 'bg-red-50 text-red-600' 
                          : isUrgent 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-slate-50 text-slate-500'}`}>
            {isOverdue ? (
              <AlertTriangle size={12} />
            ) : (
              <Calendar size={12} />
            )}
            <span>
              {isOverdue 
                ? `${Math.abs(daysUntil)} gün gecikti` 
                : daysUntil === 0 
                  ? 'Bugün' 
                  : `${formatDate(task.deadline)}`}
            </span>
          </div>
        </div>

        {/* Right - Comments & Attachments */}
        <div className="flex items-center gap-2">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
              <MessageSquare size={14} />
              <span className="text-xs font-medium">{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
              <Paperclip size={14} />
              <span className="text-xs font-medium">{task.attachments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
