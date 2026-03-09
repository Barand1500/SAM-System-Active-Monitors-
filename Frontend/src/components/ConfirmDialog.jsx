import BaseModal from './BaseModal';
import { AlertTriangle, Trash2, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * ConfirmDialog - Onay popup'ı
 * Silme, güncelleme gibi kritik işlemler için kullanılır
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'warning', // warning, danger, success, info
  isDark,
  isLoading = false
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      confirmBg: isDark ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600',
      confirmText: 'text-white'
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-500',
      confirmBg: isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600',
      confirmText: 'text-white'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      confirmBg: isDark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600',
      confirmText: 'text-white'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      confirmBg: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
      confirmText: 'text-white'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isDark={isDark}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Icon size={32} className={config.iconColor} />
        </div>

        {/* Title */}
        {title && (
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {title}
          </h3>
        )}

        {/* Message */}
        {message && (
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${config.confirmBg} ${config.confirmText} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'İşleniyor...' : confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmDialog;
