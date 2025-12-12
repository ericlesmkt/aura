"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((state) => [...state, { id, message, type }]);

    // Auto-remove após 3 segundos
    setTimeout(() => {
      setToasts((state) => state.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* CONTAINER DOS TOASTS (FIXO NO TOPO) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[90%] md:max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
                pointer-events-auto flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-5 duration-300
                ${toast.type === 'success' ? 'bg-[#121212]/90 border-green-500/30 text-green-500' : ''}
                ${toast.type === 'error' ? 'bg-[#121212]/90 border-red-500/30 text-red-500' : ''}
                ${toast.type === 'info' ? 'bg-[#121212]/90 border-[#ffd000]/30 text-[#ffd000]' : ''}
            `}
          >
            <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle size={20} />}
                {toast.type === 'error' && <AlertTriangle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
            </div>
            <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition">
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);