import { useState } from 'react';
import { 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users as UsersIcon
} from 'lucide-react';

const KanbanBoard = ({ tasks: initialTasks, users, isDark, canManage, onTaskClick, onUpdateTask }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    { id: 'pending', title: 'Bekleyen', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { id: 'in_progress', title: 'Devam Eden', icon: Zap, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'review', title: 'İncelemede', icon: AlertTriangle, gradient: 'from-purple-500 to-pink-500' },
    { id: 'completed', title: 'Tamamlanan', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
  ];

  const priorityConfig = {
    low: { label: 'Düşük', dot: 'bg-slate-400' },
    medium: { label: 'Orta', dot: 'bg-blue-500' },
    high: { label: 'Yüksek', dot: 'bg-amber-500' },
    urgent: { label: 'Acil', dot: 'bg-red-500' },
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? { ...t, status: columnId } : t));
      onUpdateTask?.(draggedTask.id, { status: columnId });
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => { setDraggedTask(null); setDragOverColumn(null); };

  const getColumnTasks = (columnId) => tasks.filter(t => t.status === columnId);

  const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
  const isDueToday = (d) => d && new Date(d).toDateString() === new Date().toDateString();

  const getAssignees = (task) => {
    if (Array.isArray(task.assignedTo)) return task.assignedTo;
    if (task.assignedTo) return [task.assignedTo];
    return [];
  };

  return (
    <div className="h-full">
      <div className="flex gap-5 h-full overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = getColumnTasks(column.id);
          const Icon = column.icon;
          const isDropTarget = dragOverColumn === column.id && draggedTask?.status !== column.id;

          return (
            <div 
              key={column.id} 
              className={`shrink-0 w-80 rounded-2xl flex flex-col transition-all duration-200 ${
                isDropTarget
                  ? isDark ? 'bg-indigo-500/10 ring-2 ring-indigo-500/50' : 'bg-indigo-50 ring-2 ring-indigo-300'
                  : isDark ? 'bg-slate-800/40' : 'bg-slate-50'
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${column.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {column.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 shadow-sm'
                    }`}>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                <div className={`mt-3 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div 
                    className={`h-full rounded-full bg-linear-to-r ${column.gradient} transition-all duration-500`}
                    style={{ width: `${tasks.length > 0 ? (columnTasks.length / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
                {columnTasks.map(task => {
                  const assignees = getAssignees(task);
                  const overdue = isOverdue(task.dueDate);
                  const dueToday = isDueToday(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick?.(task)}
                      className={`group rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200
                                ${isDark 
                                  ? 'bg-slate-800 hover:bg-slate-750 border-slate-700/60 hover:border-slate-600' 
                                  : 'bg-white hover:shadow-lg hover:shadow-slate-200/50 border-slate-200/80 hover:border-slate-300'}
                                ${draggedTask?.id === task.id ? 'opacity-40 scale-95 rotate-2' : 'hover:-translate-y-0.5'}
                                border`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.dot || 'bg-blue-500'}`} />
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {priorityConfig[task.priority]?.label || 'Orta'}
                          </span>
                        </div>
                        {task.taskType === 'group' && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${
                            isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-600'
                          }`}>
                            <UsersIcon size={10} />
                            Çoğul
                          </span>
                        )}
                      </div>

                      <h4 className={`font-semibold text-sm mb-1.5 leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {task.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              isDark ? 'bg-slate-700/80 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              #{tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+{task.tags.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        <div className="flex items-center">
                          {assignees.length > 0 ? (
                            <div className="flex -space-x-2">
                              {assignees.slice(0, 3).map((person, i) => (
                                <div 
                                  key={person.id || i} 
                                  className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-800"
                                  title={`${person.firstName} ${person.lastName}`}
                                >
                                  {person.firstName?.[0]}{person.lastName?.[0]}
                                </div>
                              ))}
                              {assignees.length > 3 && (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 ${
                                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                                }`}>+{assignees.length - 3}</div>
                              )}
                            </div>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Atanmadı</span>
                          )}
                        </div>

                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                            overdue 
                              ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                              : dueToday
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    isDropTarget 
                      ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5' 
                      : isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Icon size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Görev yok</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>Sürükleyip bırakın</p>
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