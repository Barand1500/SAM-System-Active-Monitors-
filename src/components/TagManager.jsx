import { useState, useCallback } from 'react';
import { 
  Tag, 
  Plus, 
  X, 
  Search,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';

// Etiket yönetimi bileşeni
const TagManager = ({ isDark, selectedTags = [], onTagsChange, showManager = false }) => {
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('taskTags');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Bug', color: '#ef4444' },
      { id: '2', name: 'Feature', color: '#10b981' },
      { id: '3', name: 'Urgent', color: '#f97316' },
      { id: '4', name: 'Design', color: '#8b5cf6' },
      { id: '5', name: 'Backend', color: '#3b82f6' },
      { id: '6', name: 'Frontend', color: '#ec4899' },
      { id: '7', name: 'Documentation', color: '#6b7280' },
      { id: '8', name: 'Testing', color: '#14b8a6' },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#6b7280'
  ];

  const saveTags = (newTags) => {
    setTags(newTags);
    localStorage.setItem('taskTags', JSON.stringify(newTags));
  };

  // Etiket ekle
  const handleAddTag = () => {
    if (newTagName.trim()) {
      if (editingTag) {
        const updated = tags.map(t => 
          t.id === editingTag.id ? { ...t, name: newTagName, color: newTagColor } : t
        );
        saveTags(updated);
      } else {
        const newTag = {
          id: Date.now().toString(),
          name: newTagName.trim(),
          color: newTagColor
        };
        saveTags([...tags, newTag]);
      }
      setNewTagName('');
      setNewTagColor('#6366f1');
      setShowNewTag(false);
      setEditingTag(null);
    }
  };

  // Etiket sil
  const handleDeleteTag = (tagId) => {
    saveTags(tags.filter(t => t.id !== tagId));
    if (selectedTags.includes(tagId)) {
      onTagsChange?.(selectedTags.filter(id => id !== tagId));
    }
  };

  // Etiket seç/kaldır
  const toggleTag = (tagId) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange?.(newSelected);
  };

  // Filtrelenmiş etiketler
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Seçili Etiketler */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => toggleTag(tag.id)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Etiket Seçici */}
      {showManager && (
        <div className={`rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
          {/* Arama */}
          <div className={`p-3 border-b ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Etiket ara..."
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg ${
                  isDark 
                    ? 'bg-slate-600 text-white placeholder-slate-400' 
                    : 'bg-slate-50 text-slate-700 placeholder-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
          </div>

          {/* Etiket Listesi */}
          <div className="max-h-48 overflow-y-auto p-2">
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTags.includes(tag.id)
                    ? isDark ? 'bg-slate-600' : 'bg-indigo-50'
                    : isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-50'
                }`}
                onClick={() => toggleTag(tag.id)}
              >
                <span 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className={`flex-1 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {tag.name}
                </span>
                {selectedTags.includes(tag.id) && (
                  <Check size={16} className="text-indigo-500" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTag(tag);
                    setNewTagName(tag.name);
                    setNewTagColor(tag.color);
                    setShowNewTag(true);
                  }}
                  className={`p-1 rounded ${isDark ? 'hover:bg-slate-500' : 'hover:bg-slate-200'}`}
                >
                  <Edit2 size={12} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTag(tag.id);
                  }}
                  className={`p-1 rounded ${isDark ? 'hover:bg-slate-500' : 'hover:bg-slate-200'}`}
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            ))}

            {filteredTags.length === 0 && (
              <p className={`text-center py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Etiket bulunamadı
              </p>
            )}
          </div>

          {/* Yeni Etiket */}
          {showNewTag ? (
            <div className={`p-3 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Etiket adı"
                  className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                    isDark 
                      ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                      : 'bg-slate-50 text-slate-700 placeholder-slate-400 border-slate-200'
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newTagColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewTag(false);
                    setEditingTag(null);
                    setNewTagName('');
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                    isDark 
                      ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  İptal
                </button>
                <button
                  onClick={handleAddTag}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {editingTag ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewTag(true)}
              className={`w-full p-3 border-t flex items-center justify-center gap-2 text-sm ${
                isDark 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-600' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus size={16} />
              Yeni Etiket
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Etiket badge bileşeni (görev kartlarında kullanmak için)
export const TagBadge = ({ tag, isDark, small = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-white font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
};

// Etiket listesi bileşeni
export const TagList = ({ tagIds = [], isDark, maxShow = 3 }) => {
  const [tags] = useState(() => {
    const saved = localStorage.getItem('taskTags');
    return saved ? JSON.parse(saved) : [];
  });

  const visibleTags = tagIds.slice(0, maxShow).map(id => tags.find(t => t.id === id)).filter(Boolean);
  const remainingCount = tagIds.length - maxShow;

  if (visibleTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map(tag => (
        <TagBadge key={tag.id} tag={tag} isDark={isDark} small />
      ))}
      {remainingCount > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
        }`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// Etiket seçici toggle butonu
export const TagSelectorButton = ({ isDark, selectedCount = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
        selectedCount > 0
          ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30'
          : isDark 
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <Tag size={16} />
      <span className="text-sm font-medium">
        {selectedCount > 0 ? `${selectedCount} Etiket` : 'Etiket'}
      </span>
    </button>
  );
};

export default TagManager;
