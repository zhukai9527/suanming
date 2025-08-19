import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface ChineseLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'chinese';
  text?: string;
  className?: string;
}

const ChineseLoading: React.FC<ChineseLoadingProps> = ({
  size = 'md',
  variant = 'chinese',
  text,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderSpinner = () => (
    <Loader2 className={cn(
      'animate-spin text-red-600',
      sizeClasses[size]
    )} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-red-600 rounded-full animate-pulse',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderChinese = () => (
    <div className="relative">
      <div className={cn(
        'border-4 border-red-200 border-t-red-600 rounded-full animate-spin',
        sizeClasses[size]
      )} />
      <Sparkles className={cn(
        'absolute inset-0 m-auto text-yellow-500 animate-pulse',
        size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'
      )} />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'chinese':
      default:
        return renderChinese();
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      className
    )}>
      {renderVariant()}
      {text && (
        <p className={cn(
          'text-gray-600 font-chinese',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

export { ChineseLoading };
export type { ChineseLoadingProps };