import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  Download,
  Trash2,
  Eye,
  Link,
  FolderOpen
} from 'lucide-react';

const FileUploadSystem = ({ isDark, onFilesChange, existingFiles = [], maxFiles = 10, maxSize = 10 }) => {
  const [files, setFiles] = useState(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Dosya türü ikonları
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <FileImage size={24} className="text-emerald-500" />;
    if (type.startsWith('video/')) return <FileVideo size={24} className="text-purple-500" />;
    if (type.startsWith('audio/')) return <FileAudio size={24} className="text-amber-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText size={24} className="text-red-500" />;
    return <File size={24} className="text-blue-500" />;
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dosya doğrulama
  const validateFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `Dosya boyutu ${maxSize}MB'dan büyük olamaz` };
    }
    return { valid: true };
  };

  // Dosya yükleme simülasyonu
  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: Math.round(progress) }));
      }
    }, 200);
  };

  // Dosya ekleme
  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid && files.length + validFiles.length < maxFiles) {
        const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
        const fileData = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          file: file
        };
        validFiles.push(fileData);
        simulateUpload(fileId);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  }, [files, maxFiles, onFilesChange]);

  // Sürükle-bırak handler'ları
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Dosya silme
  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Dosya indirme
  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Sürükle-bırak alanı */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                   ${isDragging 
                     ? 'border-indigo-500 bg-indigo-500/10' 
                     : isDark 
                       ? 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50' 
                       : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                   }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                       ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Upload size={28} className={isDragging ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-500'} />
        </div>
        
        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
          {isDragging ? 'Dosyaları buraya bırakın' : 'Dosya yüklemek için tıklayın veya sürükleyin'}
        </p>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Maksimum {maxFiles} dosya, her biri en fazla {maxSize}MB
        </p>
      </div>

      {/* Yüklenen dosyalar listesi */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Yüklenen Dosyalar ({files.length}/{maxFiles})
            </h4>
            {files.length > 1 && (
              <button
                onClick={() => {
                  setFiles([]);
                  onFilesChange?.([]);
                  setUploadProgress({});
                }}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'
                }`}
              >
                Tümünü Sil
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Dosya ikonu */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-slate-600' : 'bg-white'
                }`}>
                  {getFileIcon(file.type)}
                </div>

                {/* Dosya bilgileri */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatFileSize(file.size)}
                    </span>
                    {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                      <span className="text-xs text-indigo-500">
                        Yükleniyor... {uploadProgress[file.id]}%
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                    <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Aksiyon butonları */}
                <div className="flex items-center gap-1">
                  {file.type.startsWith('image/') && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                      }`}
                      title="Önizle"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => downloadFile(file)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                    }`}
                    title="İndir"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                    }`}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Görüntü önizleme modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={previewFile.url}
              alt={previewFile.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <p className="text-white text-center mt-2">{previewFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Dosya badge bileşeni (görev kartlarında kullanmak için)
export const FileBadge = ({ fileCount, isDark }) => {
  if (!fileCount || fileCount === 0) return null;
  
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
      isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
    }`}>
      <FolderOpen size={12} />
      <span>{fileCount} dosya</span>
    </div>
  );
};

export default FileUploadSystem;
