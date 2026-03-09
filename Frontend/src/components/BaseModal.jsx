import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * BaseModal - Tüm modaller için temel component
 * - ESC tuşu ile kapanma
 * - X butonu ile kapanma
 * - Overlay tıklamasında KAPANMAZ
 * - Scroll lock
 */
const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  isDark,
  size = 'md', // sm, md, lg, xl, full
  showCloseButton = true,
  headerActions = null,
  footer = null,
  className = ''
}) => {
  // ESC tuşu ile kapanma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body scroll'u kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
    full: 'sm:max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 sm:p-4 overflow-y-auto">
      {/* Modal Container - Mobile'da full screen, desktop'ta ortalanmış */}
      <div 
        className={`w-full ${sizeClasses[size]} sm:my-8 min-h-screen sm:min-h-0 sm:rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()} // Overlay'e tıklamayı engelle
      >
        {/* Header */}
        {(title || showCloseButton || headerActions) && (
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {title}
                </h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerActions}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  aria-label="Kapat"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-end gap-3`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
