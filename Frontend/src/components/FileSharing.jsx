import { useState, useEffect, useRef } from 'react';
import {
  Upload, Download, Trash2, FolderOpen, File, FileText, Image, Film,
  Music, Archive, Search, Plus, X, Share2, Users, User, Clock,
  HardDrive, Eye, Filter, Grid, List, ChevronRight, FolderPlus,
  Folder, BookOpen, Camera, Code, Database, Globe, Heart, Home,
  Inbox, Layers, Mail, Map, Monitor, Package, Palette, Shield, Star, Zap
} from 'lucide-react';

const FOLDER_ICONS = [
  { id: 'folder', label: 'Klasör', Icon: FolderOpen },
  { id: 'star', label: 'Yıldız', Icon: Star },
  { id: 'heart', label: 'Kalp', Icon: Heart },
  { id: 'book', label: 'Kitap', Icon: BookOpen },
  { id: 'camera', label: 'Kamera', Icon: Camera },
  { id: 'code', label: 'Kod', Icon: Code },
  { id: 'database', label: 'Veritabanı', Icon: Database },
  { id: 'globe', label: 'Dünya', Icon: Globe },
  { id: 'home', label: 'Ev', Icon: Home },
  { id: 'inbox', label: 'Gelen', Icon: Inbox },
  { id: 'layers', label: 'Katman', Icon: Layers },
  { id: 'mail', label: 'Posta', Icon: Mail },
  { id: 'map', label: 'Harita', Icon: Map },
  { id: 'monitor', label: 'Ekran', Icon: Monitor },
  { id: 'package', label: 'Paket', Icon: Package },
  { id: 'palette', label: 'Palet', Icon: Palette },
  { id: 'shield', label: 'Kalkan', Icon: Shield },
  { id: 'zap', label: 'Şimşek', Icon: Zap },
  { id: 'users', label: 'Kullanıcılar', Icon: Users },
  { id: 'archive', label: 'Arşiv', Icon: Archive },
];

const FOLDER_COLORS = [
  { id: 'amber', label: 'Sarı', class: 'text-amber-500' },
  { id: 'blue', label: 'Mavi', class: 'text-blue-500' },
  { id: 'emerald', label: 'Yeşil', class: 'text-emerald-500' },
  { id: 'red', label: 'Kırmızı', class: 'text-red-500' },
  { id: 'purple', label: 'Mor', class: 'text-purple-500' },
  { id: 'pink', label: 'Pembe', class: 'text-pink-500' },
  { id: 'cyan', label: 'Turkuaz', class: 'text-cyan-500' },
  { id: 'orange', label: 'Turuncu', class: 'text-orange-500' },
  { id: 'indigo', label: 'İndigo', class: 'text-indigo-500' },
  { id: 'slate', label: 'Gri', class: 'text-slate-500' },
];

const getFolderIconComponent = (iconId) => {
  const found = FOLDER_ICONS.find(i => i.id === iconId);
  return found ? found.Icon : FolderOpen;
};

const getFolderColorClass = (colorId) => {
  const found = FOLDER_COLORS.find(c => c.id === colorId);
  return found ? found.class : 'text-amber-500';
};

const FILE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-500' },
  doc: { icon: FileText, color: 'text-blue-500' },
  docx: { icon: FileText, color: 'text-blue-500' },
  xls: { icon: FileText, color: 'text-emerald-500' },
  xlsx: { icon: FileText, color: 'text-emerald-500' },
  ppt: { icon: FileText, color: 'text-orange-500' },
  pptx: { icon: FileText, color: 'text-orange-500' },
  png: { icon: Image, color: 'text-purple-500' },
  jpg: { icon: Image, color: 'text-purple-500' },
  jpeg: { icon: Image, color: 'text-purple-500' },
  gif: { icon: Image, color: 'text-purple-500' },
  mp4: { icon: Film, color: 'text-pink-500' },
  mp3: { icon: Music, color: 'text-cyan-500' },
  zip: { icon: Archive, color: 'text-amber-500' },
  rar: { icon: Archive, color: 'text-amber-500' },
};

const getFileIcon = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || { icon: File, color: 'text-slate-500' };
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const loadFiles = () => {
  try {
    const saved = localStorage.getItem('sam_shared_files');
    return saved ? JSON.parse(saved) : defaultFiles;
  } catch { return defaultFiles; }
};

const loadFolders = () => {
  try {
    const saved = localStorage.getItem('sam_file_folders');
    return saved ? JSON.parse(saved) : defaultFolders;
  } catch { return defaultFolders; }
};

const defaultFolders = [
  { id: 'root', name: 'Ana Dizin', parentId: null, icon: 'folder', color: 'amber' },
  { id: 'reports', name: 'Raporlar', parentId: 'root', icon: 'book', color: 'blue' },
  { id: 'templates', name: 'Şablonlar', parentId: 'root', icon: 'layers', color: 'purple' },
  { id: 'media', name: 'Medya', parentId: 'root', icon: 'camera', color: 'pink' },
];

const defaultFiles = [
  {
    id: 1, name: 'Aylık Rapor - Aralık.pdf', size: 2457600, folderId: 'reports',
    uploadedBy: 'Mehmet Yılmaz', uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    sharedWith: ['all'], tags: ['rapor', 'aylık'], downloads: 12
  },
  {
    id: 2, name: 'Proje Planı.xlsx', size: 512000, folderId: 'root',
    uploadedBy: 'Ayşe Demir', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    sharedWith: ['all'], tags: ['plan'], downloads: 8
  },
  {
    id: 3, name: 'Logo.png', size: 184320, folderId: 'media',
    uploadedBy: 'patron', uploadedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    sharedWith: ['all'], tags: ['marka'], downloads: 24
  },
  {
    id: 4, name: 'İzin Formu Şablonu.docx', size: 62464, folderId: 'templates',
    uploadedBy: 'patron', uploadedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    sharedWith: ['all'], tags: ['şablon', 'izin'], downloads: 18
  },
];

const FileSharing = ({ user, isBoss, canManage, isDark }) => {
  const [files, setFiles] = useState(loadFiles);
  const [folders, setFolders] = useState(loadFolders);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [newFolderColor, setNewFolderColor] = useState('amber');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const fileInputRef = useRef(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => { localStorage.setItem('sam_shared_files', JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem('sam_file_folders', JSON.stringify(folders)); }, [folders]);

  useEffect(() => {
    try {
      const emps = JSON.parse(localStorage.getItem('app_employees') || '[]');
      setEmployees(emps);
    } catch { setEmployees([]); }
  }, []);

  const cardClass = isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/60';
  const inputClass = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  // Breadcrumb path
  const getBreadcrumb = () => {
    const path = [];
    let id = currentFolder;
    while (id) {
      const folder = folders.find(f => f.id === id);
      if (folder) { path.unshift(folder); id = folder.parentId; } else break;
    }
    return path;
  };

  const currentFiles = files.filter(f => {
    if (f.folderId !== currentFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const subFolders = folders.filter(f => f.parentId === currentFolder);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    const newFiles = uploadedFiles.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      size: file.size,
      folderId: currentFolder,
      uploadedBy: user?.name || user?.username || 'Kullanıcı',
      uploadedAt: new Date().toISOString(),
      sharedWith: ['all'],
      tags: [],
      downloads: 0
    }));
    setFiles(prev => [...newFiles, ...prev]);
    setShowUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const id = 'folder_' + Date.now();
    setFolders(prev => [...prev, { id, name: newFolderName.trim(), parentId: currentFolder, icon: newFolderIcon, color: newFolderColor }]);
    setNewFolderName('');
    setNewFolderIcon('folder');
    setNewFolderColor('amber');
    setShowNewFolder(false);
  };

  const deleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFile(null);
  };

  const deleteFolder = (folderId) => {
    // Klasördeki dosyaları ve alt klasörleri de sil
    const collectIds = (id) => {
      const children = folders.filter(f => f.parentId === id);
      return [id, ...children.flatMap(c => collectIds(c.id))];
    };
    const folderIds = collectIds(folderId);
    setFolders(prev => prev.filter(f => !folderIds.includes(f.id)));
    setFiles(prev => prev.filter(f => !folderIds.includes(f.folderId)));
  };

  const downloadFile = (file) => {
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f));
  };

  // Total storage used
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Dosya Paylaşımı</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {files.length} dosya · {formatSize(totalSize)} kullanılıyor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewFolder(true)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <FolderPlus size={16} /> Yeni Klasör
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            <Upload size={16} /> Dosya Yükle
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className={`${cardClass} rounded-2xl border p-4 space-y-3`}>
          <div className="flex items-center gap-3">
            {(() => { const IconComp = getFolderIconComponent(newFolderIcon); return <IconComp size={20} className={getFolderColorClass(newFolderColor)} />; })()}
            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Klasör adı..." autoFocus
              className={`flex-1 ${inputClass} border rounded-xl px-3 py-2 text-sm`} />
            <button onClick={createFolder} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl">Oluştur</button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); setNewFolderIcon('folder'); setNewFolderColor('amber'); }}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={18} /></button>
          </div>
          {/* Simge seçici */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Simge</label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_ICONS.map(fi => {
                const IconC = fi.Icon;
                return (
                  <button key={fi.id} onClick={() => setNewFolderIcon(fi.id)} title={fi.label}
                    className={`p-2 rounded-lg transition-all ${newFolderIcon === fi.id 
                      ? 'bg-indigo-500/20 ring-2 ring-indigo-500' 
                      : isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}>
                    <IconC size={16} className={newFolderIcon === fi.id ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                  </button>
                );
              })}
            </div>
          </div>
          {/* Renk seçici */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Renk</label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_COLORS.map(fc => (
                <button key={fc.id} onClick={() => setNewFolderColor(fc.id)} title={fc.label}
                  className={`w-7 h-7 rounded-full transition-all ${fc.class.replace('text-', 'bg-')} ${newFolderColor === fc.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                  style={newFolderColor === fc.id ? { ringOffsetColor: isDark ? '#1e293b' : '#fff' } : {}} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 text-sm">
          {getBreadcrumb().map((folder, i, arr) => (
            <span key={folder.id} className="flex items-center gap-1">
              <button onClick={() => setCurrentFolder(folder.id)}
                className={`hover:underline ${i === arr.length - 1 ? (isDark ? 'text-white font-semibold' : 'text-slate-800 font-semibold') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                {folder.name}
              </button>
              {i < arr.length - 1 && <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-300'} />}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Dosya ara..." className={`w-52 ${inputClass} border rounded-xl px-3 py-2 pl-9 text-sm`} />
          </div>
          <div className={`flex rounded-xl border ${isDark ? 'border-slate-600' : 'border-slate-200'} overflow-hidden`}>
            <button onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Grid size={16} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Folders */}
      {subFolders.length > 0 && (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-3`}>
          {subFolders.map(folder => {
            const FolderIcon = getFolderIconComponent(folder.icon);
            const folderColor = getFolderColorClass(folder.color);
            return (
              <div key={folder.id} onDoubleClick={() => setCurrentFolder(folder.id)}
                onClick={() => setCurrentFolder(folder.id)}
                className={`${cardClass} rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all group ${viewMode === 'list' ? 'flex items-center gap-3' : 'text-center'}`}>
                <FolderIcon size={viewMode === 'list' ? 20 : 32} className={`${folderColor} mx-auto group-hover:scale-110 transition-transform`} />
                <p className={`text-sm font-medium mt-1 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>{folder.name}</p>
                {canManage && folder.id !== 'root' && (
                  <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                    className={`${viewMode === 'list' ? 'ml-auto' : 'mt-1 mx-auto'} p-1 rounded opacity-0 group-hover:opacity-100 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Files */}
      {currentFiles.length === 0 && subFolders.length === 0 ? (
        <div className={`${cardClass} rounded-2xl border p-12 text-center`}>
          <FolderOpen size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bu klasör boş</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Dosya yükleyin veya yeni klasör oluşturun</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentFiles.map(file => {
            const { icon: FileIcon, color } = getFileIcon(file.name);
            return (
              <div key={file.id} onClick={() => setSelectedFile(file)}
                className={`${cardClass} rounded-2xl border p-4 cursor-pointer hover:shadow-lg transition-all group`}>
                <div className="text-center mb-3">
                  <FileIcon size={36} className={`${color} mx-auto`} />
                </div>
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                <div className={`flex items-center justify-between mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>{formatSize(file.size)}</span>
                  <span className="flex items-center gap-1"><Download size={10} /> {file.downloads}</span>
                </div>
                <p className={`text-xs mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {file.uploadedBy} · {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${cardClass} rounded-2xl border overflow-hidden divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {currentFiles.map(file => {
            const { icon: FileIcon, color } = getFileIcon(file.name);
            return (
              <div key={file.id} onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-4 p-4 cursor-pointer ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                <FileIcon size={24} className={color} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{file.uploadedBy}</p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatSize(file.size)}</span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Download size={12} /> {file.downloads}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* File detail modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl border ${cardClass} shadow-2xl p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => { const { icon: FileIcon, color } = getFileIcon(selectedFile.name); return <FileIcon size={28} className={color} />; })()}
                <div className="min-w-0">
                  <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedFile.name}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatSize(selectedFile.size)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={20} />
              </button>
            </div>
            <div className={`space-y-3 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{selectedFile.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {new Date(selectedFile.uploadedAt).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Download size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{selectedFile.downloads} indirme</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Share2 size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {selectedFile.sharedWith?.includes('all') ? 'Herkesle paylaşılıyor' : `${selectedFile.sharedWith?.length || 0} kişi ile paylaşılıyor`}
                </span>
              </div>
            </div>
            {selectedFile.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedFile.tags.map(tag => (
                  <span key={tag} className={`px-2 py-0.5 rounded-lg text-xs font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>{tag}</span>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-5">
              {(canManage || selectedFile.uploadedBy === (user?.name || user?.username)) && (
                <button onClick={() => deleteFile(selectedFile.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}`}>
                  <Trash2 size={16} /> Sil
                </button>
              )}
              <button onClick={() => { downloadFile(selectedFile); setSelectedFile(null); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
                <Download size={16} /> İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSharing;
