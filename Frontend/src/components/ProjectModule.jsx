import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  X, 
  Calendar, 
  Users, 
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { projectAPI } from '../services/api';

const ProjectModule = ({ isDark, tasks = [], users = [] }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
    '#f97316', '#eab308', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6b7280'
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.list();
      const data = res.data?.data || res.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Projeler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // Proje oluştur/düzenle
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await projectAPI.update(editingProject.id, projectData);
      } else {
        await projectAPI.create(projectData);
      }
      await fetchProjects();
      setShowNewProjectModal(false);
      setEditingProject(null);
    } catch (err) {
      console.error('Proje kaydedilemedi:', err);
    }
  };

  // Proje sil
  const handleDeleteProject = async (projectId) => {
    if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
      try {
        await projectAPI.delete(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setActiveMenu(null);
      } catch (err) {
        console.error('Proje silinemedi:', err);
      }
    }
  };

  // Proje istatistikleri
  const getProjectStats = (project) => {
    const taskIds = (project.taskIds || []);
    const projectTasks = tasks.filter(t => taskIds.includes(t.id));
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    const total = projectTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, progress };
  };

  // Kalan gün hesapla
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
            <FolderKanban size={24} className="text-indigo-500" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Projeler
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {projects.length} aktif proje
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                   text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Plus size={18} />
          <span className="font-medium">Yeni Proje</span>
        </button>
      </div>

      {/* Proje Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const stats = getProjectStats(project);
          const daysRemaining = getDaysRemaining(project.endDate || project.end_date);
          const memberList = project.ProjectMembers || project.members || [];
          
          return (
            <div
              key={project.id}
              className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden
                         border-t-4 transition-all hover:shadow-xl cursor-pointer`}
              style={{ borderTopColor: project.color }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {project.name}
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === project.id ? null : project.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      <MoreVertical size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                    
                    {activeMenu === project.id && (
                      <div className={`absolute right-0 top-10 w-40 rounded-xl shadow-xl z-10 overflow-hidden ${
                        isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setShowNewProjectModal(true);
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                            isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Edit2 size={14} />
                          Düzenle
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 ${
                            isDark ? 'hover:bg-slate-600' : 'hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={14} />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* İlerleme çubuğu */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>İlerleme</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      {stats.progress}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <Target size={16} className="mx-auto mb-1 text-blue-500" />
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Görev</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{stats.total}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <CheckCircle2 size={16} className="mx-auto mb-1 text-emerald-500" />
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tamamlanan</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{stats.completed}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    {daysRemaining > 0 ? (
                      <Clock size={16} className="mx-auto mb-1 text-amber-500" />
                    ) : (
                      <AlertCircle size={16} className="mx-auto mb-1 text-red-500" />
                    )}
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kalan</p>
                    <p className={`font-semibold ${daysRemaining <= 0 ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : isDark ? 'text-white' : 'text-slate-700'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} gün` : 'Gecikti'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Users size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <div className="flex -space-x-2">
                      {memberList.slice(0, 3).map((member, i) => {
                        const u = member.User || member;
                        const initials = u.first_name ? u.first_name[0] : (i + 1);
                        return (
                          <div
                            key={member.userId || member.id || i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 
                                     border-2 border-white dark:border-slate-800 flex items-center justify-center"
                          >
                            <span className="text-white text-xs font-bold">{initials}</span>
                          </div>
                        );
                      })}
                      {memberList.length > 3 && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                      ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                          +{memberList.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Calendar size={12} />
                    <span>{(project.endDate || project.end_date) ? new Date(project.endDate || project.end_date).toLocaleDateString('tr-TR') : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proje yoksa */}
      {projects.length === 0 && (
        <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <FolderKanban size={64} className="mx-auto mb-4 opacity-30" />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
            Henüz proje yok
          </h3>
          <p className="mb-4">İlk projenizi oluşturarak başlayın</p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Proje Oluştur
          </button>
        </div>
      )}

      {/* Yeni/Düzenle Proje Modal */}
      {showNewProjectModal && (
        <ProjectModal
          isDark={isDark}
          project={editingProject}
          colors={colors}
          users={users}
          onSave={handleSaveProject}
          onClose={() => {
            setShowNewProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Proje Detay Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isDark={isDark}
          project={selectedProject}
          tasks={tasks.filter(t => (selectedProject.taskIds || []).includes(t.id))}
          onClose={() => setSelectedProject(null)}
        />
      )}
      </>
      )}
    </div>
  );
};

// Proje Modal Bileşeni
const ProjectModal = ({ isDark, project, colors, users, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || colors[0],
    startDate: project?.startDate || project?.start_date || new Date().toISOString().split('T')[0],
    endDate: project?.endDate || project?.end_date || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {project ? 'Projeyi Düzenle' : 'Yeni Proje'}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Proje Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Proje adı girin"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Proje açıklaması"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Renk
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Başlangıç
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Bitiş
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
                       text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {project ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Proje Detay Modal
const ProjectDetailModal = ({ isDark, project, tasks, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div 
          className="h-2 rounded-t-2xl" 
          style={{ backgroundColor: project.color }}
        />
        <div className={`p-6`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {project.name}
              </h2>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {project.description}
              </p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <X size={24} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            </button>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Proje İlerlemesi</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {tasks.length > 0 
                  ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
                  : 0}%
              </span>
            </div>
            <div className={`h-3 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%`,
                  backgroundColor: project.color 
                }}
              />
            </div>
          </div>

          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Görevler ({tasks.length})
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Bu projede henüz görev yok
              </p>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-xl flex items-center gap-3 ${
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  }`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Clock size={18} className="text-amber-500" />
                  )}
                  <span className={`flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                  <ChevronRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModule;
