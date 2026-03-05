import { useState, useCallback } from 'react';
import { 
  LayoutGrid, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings2,
  X,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Widget tanımları
const WIDGET_DEFINITIONS = {
  stats: { id: 'stats', title: 'İstatistikler', icon: '📊', defaultSize: 'full' },
  tasks: { id: 'tasks', title: 'Son Görevler', icon: '📋', defaultSize: 'half' },
  timeTracker: { id: 'timeTracker', title: 'Mesai Durumu', icon: '⏰', defaultSize: 'half' },
  calendar: { id: 'calendar', title: 'Takvim', icon: '📅', defaultSize: 'half' },
  announcements: { id: 'announcements', title: 'Duyurular', icon: '📢', defaultSize: 'half' },
  activity: { id: 'activity', title: 'Son Aktiviteler', icon: '🔔', defaultSize: 'half' },
  leaves: { id: 'leaves', title: 'İzin Durumu', icon: '🏖️', defaultSize: 'third' },
  performance: { id: 'performance', title: 'Performans', icon: '📈', defaultSize: 'third' },
  team: { id: 'team', title: 'Ekip', icon: '👥', defaultSize: 'third' },
};

// Default layout
const DEFAULT_LAYOUT = [
  { widgetId: 'stats', visible: true, size: 'full', order: 0 },
  { widgetId: 'tasks', visible: true, size: 'half', order: 1 },
  { widgetId: 'timeTracker', visible: true, size: 'half', order: 2 },
  { widgetId: 'calendar', visible: true, size: 'half', order: 3 },
  { widgetId: 'announcements', visible: true, size: 'half', order: 4 },
  { widgetId: 'activity', visible: true, size: 'half', order: 5 },
  { widgetId: 'leaves', visible: true, size: 'third', order: 6 },
  { widgetId: 'performance', visible: true, size: 'third', order: 7 },
  { widgetId: 'team', visible: true, size: 'third', order: 8 },
];

const DashboardCustomizer = ({ isDark, onLayoutChange, onClose }) => {
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });
  
  const [draggedItem, setDraggedItem] = useState(null);

  // Widget görünürlüğünü değiştir
  const toggleVisibility = (widgetId) => {
    const newLayout = layout.map(item => 
      item.widgetId === widgetId ? { ...item, visible: !item.visible } : item
    );
    setLayout(newLayout);
  };

  // Widget boyutunu değiştir
  const changeSize = (widgetId, newSize) => {
    const newLayout = layout.map(item => 
      item.widgetId === widgetId ? { ...item, size: newSize } : item
    );
    setLayout(newLayout);
  };

  // Sürükle-bırak başlat
  const handleDragStart = (e, widgetId) => {
    setDraggedItem(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Sürükle-bırak üzerine
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Sürükle-bırak bırak
  const handleDrop = (e, targetWidgetId) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetWidgetId) return;

    const newLayout = [...layout];
    const draggedIndex = newLayout.findIndex(item => item.widgetId === draggedItem);
    const targetIndex = newLayout.findIndex(item => item.widgetId === targetWidgetId);

    // Sıraları değiştir
    const [draggedWidget] = newLayout.splice(draggedIndex, 1);
    newLayout.splice(targetIndex, 0, draggedWidget);

    // Sıra numaralarını güncelle
    newLayout.forEach((item, index) => {
      item.order = index;
    });

    setLayout(newLayout);
    setDraggedItem(null);
  };

  // Varsayılana dön
  const resetToDefault = () => {
    setLayout(DEFAULT_LAYOUT);
  };

  // Kaydet
  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    onLayoutChange?.(layout);
    onClose?.();
  };

  const sizeOptions = [
    { value: 'third', label: '1/3' },
    { value: 'half', label: '1/2' },
    { value: 'full', label: 'Tam' },
  ];

  // Sıralı widget listesi
  const sortedLayout = [...layout].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <LayoutGrid size={20} className="text-indigo-500" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Dashboard Özelleştirme
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Widget'ları sürükleyerek sıralayın
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Widget List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {sortedLayout.map((item) => {
              const widget = WIDGET_DEFINITIONS[item.widgetId];
              if (!widget) return null;

              return (
                <div
                  key={item.widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.widgetId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.widgetId)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-move ${
                    draggedItem === item.widgetId
                      ? 'opacity-50 scale-95'
                      : ''
                  } ${
                    item.visible
                      ? isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      : isDark ? 'bg-slate-800/50 opacity-50' : 'bg-slate-100/50 opacity-50'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className={`p-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <GripVertical size={18} />
                  </div>

                  {/* Icon */}
                  <span className="text-2xl">{widget.icon}</span>

                  {/* Title */}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      item.visible
                        ? isDark ? 'text-white' : 'text-slate-800'
                        : isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {widget.title}
                    </h4>
                  </div>

                  {/* Size Selector */}
                  <div className="flex items-center gap-1">
                    {sizeOptions.map(size => (
                      <button
                        key={size.value}
                        onClick={() => changeSize(item.widgetId, size.value)}
                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                          item.size === size.value
                            ? 'bg-indigo-500 text-white'
                            : isDark 
                              ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleVisibility(item.widgetId)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.visible
                        ? 'text-emerald-500 hover:bg-emerald-500/10'
                        : isDark 
                          ? 'text-slate-500 hover:bg-slate-600' 
                          : 'text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <button
            onClick={resetToDefault}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              isDark 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw size={16} />
            <span>Varsayılana Dön</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              İptal
            </button>
            <button
              onClick={saveLayout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 
                       text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Save size={16} />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout context hook
export const useDashboardLayout = () => {
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const getWidgetConfig = useCallback((widgetId) => {
    return layout.find(item => item.widgetId === widgetId);
  }, [layout]);

  const isWidgetVisible = useCallback((widgetId) => {
    const widget = layout.find(item => item.widgetId === widgetId);
    return widget?.visible ?? true;
  }, [layout]);

  const getWidgetSize = useCallback((widgetId) => {
    const widget = layout.find(item => item.widgetId === widgetId);
    return widget?.size ?? 'half';
  }, [layout]);

  const getSortedVisibleWidgets = useCallback(() => {
    return [...layout]
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);
  }, [layout]);

  const getSizeClass = useCallback((size) => {
    switch (size) {
      case 'third': return 'col-span-1';
      case 'half': return 'col-span-1 md:col-span-2';
      case 'full': return 'col-span-1 md:col-span-4';
      default: return 'col-span-1 md:col-span-2';
    }
  }, []);

  return {
    layout,
    setLayout,
    getWidgetConfig,
    isWidgetVisible,
    getWidgetSize,
    getSortedVisibleWidgets,
    getSizeClass,
  };
};

export { WIDGET_DEFINITIONS, DEFAULT_LAYOUT };
export default DashboardCustomizer;
