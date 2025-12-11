import { Card } from './Card';
import { X, AlertCircle, CheckCircle2, Info, Clock } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface NotificationCardProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationCard({
  type = 'info',
  title,
  message,
  onDismiss,
  action,
  className = '',
  ...props
}: NotificationCardProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    warning: <Clock className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  const bgColors = {
    info: 'bg-blue-50 border-blue-500',
    success: 'bg-green-50 border-green-500',
    warning: 'bg-yellow-50 border-yellow-500',
    error: 'bg-red-50 border-red-500',
  };

  return (
    <Card
      static
      className={`${bgColors[type]} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-sm text-gray-700">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-[#4FC3F7] hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

