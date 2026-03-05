import { useNotification } from '../context/NotificationContext';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContainer = ({ isDark }) => {
  const { toasts, removeToast } = useNotification();

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const colors = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500'
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border-l-4 ${colors[toast.type]} 
                     p-4 flex items-start gap-3 animate-slide-in min-w-[300px]`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="shrink-0 mt-0.5">
            {icons[toast.type]}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {toast.title}
              </h4>
            )}
            {toast.message && (
              <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`shrink-0 p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
