import React from 'react';
import { cn } from '../../lib/utils';

interface ChineseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ChineseButton = React.forwardRef<HTMLButtonElement, ChineseButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-chinese font-medium',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
      'active:scale-95 hover-lift',
    ];

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-red-600 to-red-700 !text-white',
        'border border-red-600',
        'shadow-lg hover:shadow-xl',
        'hover:scale-105 active:scale-95 hover:!text-white',
        'focus:ring-red-500',
        'relative overflow-hidden',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%]',
        'before:transition-transform before:duration-700',
      ],
      secondary: [
        'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900',
        'border border-yellow-500',
        'shadow-lg hover:shadow-xl',
        'hover:scale-105 active:scale-95',
        'focus:ring-yellow-500',
      ],
      outline: [
        'bg-transparent text-red-600',
        'border-2 border-red-600',
        'hover:bg-red-600 hover:text-white',
        'focus:ring-red-500',
      ],
      ghost: [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100 hover:text-red-600',
        'focus:ring-gray-500',
      ],
    };

    const sizeClasses = {
      sm: [
      'px-3 py-1.5 text-button-sm rounded-md',
      'min-h-[36px]', // 移动端友好的最小高度
    ],
    md: [
      'px-6 py-2.5 text-button-md rounded-lg',
      'min-h-[44px]', // 移动端友好的最小高度
    ],
    lg: [
      'px-8 py-3 text-button-lg rounded-xl',
      'min-h-[52px]', // 移动端友好的最小高度
    ],
    };

    // 移动端响应式调整
    const responsiveClasses = [
      'md:hover:scale-105', // 只在桌面端启用悬停缩放
      'active:scale-95', // 所有设备都有点击反馈
      'touch-manipulation', // 优化触摸体验
    ];

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ChineseButton.displayName = 'ChineseButton';

export { ChineseButton };
export type { ChineseButtonProps };