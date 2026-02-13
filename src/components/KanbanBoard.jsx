import { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  User,
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  GripVertical
} from 'lucide-react';

const KanbanBoard = ({ tasks: initialTasks, users, isDark, canManage, onTaskClick }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'pending', title: 'Bekleyen', color: 'slate', bg: isDark ? 'bg-slate-800/50' : 'bg-slate-100' },
    { id: 'in_progress', title: 'Devam Eden', color: 'blue', bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50' },
    { id: 'review', title: 'İncelemede', color: 'purple', bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50' },
    { id: 'completed', title: 'Tamamlanan', color: 'emerald', bg: isDark ? 'bg-emerald-900/20' : 'bg-emerald-50' },
  ];

  const priorityColors = {
    low: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    high: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  };

  const priorityLabels = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil'
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      setTasks(prev => prev.map(t => 
        t.id === draggedTask.id ? { ...t, status: columnId } : t
      ));
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const getColumnTasks = (columnId) => tasks.filter(t => t.status === columnId);

  return (
    <div className="h-full">
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <div 
              key={column.id} 
              className={`flex-shrink-0 w-80 rounded-2xl ${column.bg} p-4 flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {column.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}>
                    {columnTasks.length}
                  </span>
                </div>
                {canManage && (
                  <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-white'}`}>
                    <Plus size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onTaskClick?.(task)}
                    className={`rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all
                              ${isDark ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:shadow-md'}
                              ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''}
                              border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                  >
                    {/* Priority & Menu */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                        {priorityLabels[task.priority]}
                      </span>
                      <button className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                        <MoreHorizontal size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>

                    {/* Description preview */}
                    {task.description && (
                      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {task.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      {/* Assignee */}
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                          </div>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {task.assignedTo.firstName}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Atanmadı</span>
                      )}

                      {/* Due date */}
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {columnTasks.length === 0 && (
                  <div className={`rounded-xl border-2 border-dashed p-6 text-center 
                                ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Görev yok
                    </p>
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

export default KanbanBoard;
