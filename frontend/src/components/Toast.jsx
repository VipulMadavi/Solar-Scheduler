import { useState, useEffect, createContext, useContext } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ message, type, onClose }) {
    const styles = {
        info: "bg-slate-800 border-slate-600 text-slate-100",
        success: "bg-green-900/90 border-green-700 text-green-100",
        error: "bg-red-900/90 border-red-700 text-red-100",
        warning: "bg-yellow-900/90 border-yellow-700 text-yellow-100"
    };

    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        error: <AlertCircle size={18} />,
        warning: <AlertCircle size={18} />
    };

    return (
        <div className={`
      pointer-events-auto
      flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg 
      animate-in slide-in-from-right duration-300
      ${styles[type]}
    `}>
            {icons[type]}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition">
                <X size={16} />
            </button>
        </div>
    );
}

export const useToast = () => useContext(ToastContext);
