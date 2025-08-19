import React from 'react';
import { cn } from '../../lib/utils';

interface ChineseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'bordered' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

const ChineseInput = React.forwardRef<HTMLInputElement, ChineseInputProps>(
  ({ className, label, error, helperText, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = [
      'w-full font-chinese transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
    ];

    const variantClasses = {
      default: [
        'bg-white border border-gray-300',
        'hover:border-red-400 focus:border-red-500 focus:ring-red-500/20',
        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
      ],
      bordered: [
        'bg-transparent border-2 border-red-300',
        'hover:border-red-500 focus:border-red-600 focus:ring-red-500/20',
        error ? 'border-red-500 focus:border-red-600 focus:ring-red-500/20' : '',
      ],
      filled: [
        'bg-red-50 border border-red-200',
        'hover:bg-red-100 hover:border-red-300',
        'focus:bg-white focus:border-red-500 focus:ring-red-500/20',
        error ? 'bg-red-100 border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
      ],
    };

    const sizeClasses = {
      sm: [
        'px-3 py-2 text-body-md rounded-md',
        'min-h-[36px]', // 移动端友好
      ],
      md: [
        'px-4 py-2.5 text-body-lg rounded-lg',
        'min-h-[44px]', // 移动端友好
      ],
      lg: [
        'px-5 py-3 text-body-xl rounded-xl',
        'min-h-[52px]', // 移动端友好
      ],
    };

    // 移动端响应式调整
    const responsiveClasses = [
      'touch-manipulation', // 优化触摸体验
      'max-md:text-base', // 移动端字体调整
    ];

    return (
      <div className="w-full">
        {/* 标签 */}
        {label && (
          <label className="block text-label-lg font-medium text-gray-700 mb-2 font-chinese">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* 输入框 */}
        <div className="relative">
          <input
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              responsiveClasses,
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* 错误状态图标 */}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* 错误信息或帮助文本 */}
        {(error || helperText) && (
          <div className="mt-1.5">
            {error ? (
              <p className="text-body-sm text-red-600 font-chinese">{error}</p>
            ) : (
              helperText && (
                <p className="text-body-sm text-gray-500 font-chinese">{helperText}</p>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);

ChineseInput.displayName = 'ChineseInput';

export { ChineseInput };
export type { ChineseInputProps };