import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'info':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 border-l-4 ${getStyles()} animate-fade-in-down max-w-md`}>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 font-bold text-lg leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
