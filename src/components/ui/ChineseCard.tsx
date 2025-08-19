import React from 'react';
import { cn } from '../../lib/utils';

interface ChineseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'golden';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ChineseCard = React.forwardRef<HTMLDivElement, ChineseCardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseClasses = [
      'relative',
      'transition-all duration-300 ease-in-out',
      'font-chinese hover-lift animate-fade-in-up',
    ];

    const variantClasses = {
      default: [
        'bg-white/90 backdrop-blur-sm',
        'border border-paper-300',
        'rounded-lg',
        'shadow-chinese-sm hover:shadow-chinese',
      ],
      elevated: [
        'bg-white/95 backdrop-blur-md',
        'border border-cinnabar-200',
        'rounded-xl',
        'shadow-chinese hover:shadow-chinese-md',
        'hover:-translate-y-1',
      ],
      bordered: [
        'bg-paper-50/80 backdrop-blur-sm',
        'border-2 border-cinnabar-300',
        'rounded-lg',
        'shadow-paper',
        // 传统边框装饰
        'before:absolute before:inset-2',
        'before:border before:border-gold-300/50',
        'before:rounded-md before:pointer-events-none',
      ],
      golden: [
        'bg-gold-gradient',
        'border-2 border-gold-600',
        'rounded-xl',
        'shadow-gold hover:shadow-gold',
        'text-ink-900',
        // 金色光晕效果
        'before:absolute before:inset-0',
        'before:bg-gradient-to-br before:from-white/20 before:to-transparent',
        'before:rounded-xl before:pointer-events-none',
      ],
    };

    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // 移动端响应式调整
    const responsiveClasses = [
      // 移动端减少内边距
      'max-md:p-4',
      // 移动端优化圆角
      'max-md:rounded-lg',
    ];

    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChineseCard.displayName = 'ChineseCard';

// 卡片标题组件
interface ChineseCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ChineseCardHeader = React.forwardRef<HTMLDivElement, ChineseCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex flex-col space-y-1.5',
          'pb-4 mb-4',
          'border-b border-cinnabar-200',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChineseCardHeader.displayName = 'ChineseCardHeader';

// 卡片标题文字组件
interface ChineseCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const ChineseCardTitle = React.forwardRef<HTMLParagraphElement, ChineseCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={cn(
          'text-heading-md font-semibold leading-none tracking-tight',
          'text-cinnabar-500',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

ChineseCardTitle.displayName = 'ChineseCardTitle';

// 卡片描述组件
interface ChineseCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const ChineseCardDescription = React.forwardRef<HTMLParagraphElement, ChineseCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        className={cn(
          'text-body-md text-ink-500',
          'font-chinese',
          'leading-relaxed',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </p>
    );
  }
);

ChineseCardDescription.displayName = 'ChineseCardDescription';

// 卡片内容组件
interface ChineseCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ChineseCardContent = React.forwardRef<HTMLDivElement, ChineseCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'text-ink-900',
          'leading-relaxed',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChineseCardContent.displayName = 'ChineseCardContent';

// 卡片底部组件
interface ChineseCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ChineseCardFooter = React.forwardRef<HTMLDivElement, ChineseCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center',
          'pt-4 mt-4',
          'border-t border-paper-300',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChineseCardFooter.displayName = 'ChineseCardFooter';

export {
  ChineseCard,
  ChineseCardHeader,
  ChineseCardTitle,
  ChineseCardDescription,
  ChineseCardContent,
  ChineseCardFooter,
};

export type {
  ChineseCardProps,
  ChineseCardHeaderProps,
  ChineseCardTitleProps,
  ChineseCardDescriptionProps,
  ChineseCardContentProps,
  ChineseCardFooterProps,
};