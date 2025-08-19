import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ChineseToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const ChineseToast: React.FC<ChineseToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className
}) => {
  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  };

  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div className={cn(
      'flex items-start p-4 rounded-lg border shadow-lg',
      'animate-in slide-in-from-top-2 duration-300',
      colors.bg,
      colors.border,
      className
    )}>
      {/* 图标 */}
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5', colors.icon)} />
      </div>
      
      {/* 内容 */}
      <div className="ml-3 flex-1">
        {title && (
          <h4 className={cn(
            'text-sm font-semibold font-chinese mb-1',
            colors.title
          )}>
            {title}
          </h4>
        )}
        <p className={cn(
          'text-sm font-chinese leading-relaxed',
          colors.message
        )}>
          {message}
        </p>
      </div>
      
      {/* 关闭按钮 */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 ml-4 p-1 rounded-md hover:bg-white/50 transition-colors',
            colors.icon
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export { ChineseToast };
export type { ChineseToastProps };