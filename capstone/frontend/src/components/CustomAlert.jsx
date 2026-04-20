import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function CustomAlert({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      iconBg: 'bg-green-500/30',
      glow: 'shadow-green-500/50'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      iconBg: 'bg-red-500/30',
      glow: 'shadow-red-500/50'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/30',
      glow: 'shadow-yellow-500/50'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/30',
      glow: 'shadow-blue-500/50'
    }
  };

  const { icon: Icon, bg, border, text, iconBg, glow } = config[type];

  return (
    <div className="fixed top-24 right-4 z-[9999] animate-slide-in">
      <div 
        className={`${bg} ${border} border-2 rounded-2xl p-6 shadow-2xl ${glow} backdrop-blur-lg min-w-[320px] max-w-md`}
        style={{ 
          animation: 'slideIn 0.5s ease-out, pulse 2s ease-in-out infinite',
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      >
        <div className="flex items-start gap-4">
          <div className={`${iconBg} rounded-full p-3 animate-bounce`}>
            <Icon className={`w-6 h-6 ${text}`} />
          </div>
          <div className="flex-1">
            <p className={`${text} font-semibold text-lg leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${text} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${text.replace('text-', 'bg-')} animate-progress`}
            style={{ animation: `progress ${duration}ms linear` }}
          />
        </div>
      </div>
    </div>
  );
}
