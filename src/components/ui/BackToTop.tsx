import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BackToTopProps {
  className?: string;
  threshold?: number; // 滚动多少像素后显示按钮
}

const BackToTop: React.FC<BackToTopProps> = ({ 
  className,
  threshold = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        // 基础样式
        'fixed bottom-6 right-6 z-50',
        'w-12 h-12 rounded-full',
        'flex items-center justify-center',
        'transition-all duration-300 ease-in-out',
        'shadow-lg hover:shadow-xl',
        // 中国风配色
        'bg-red-600/80 hover:bg-red-700/90',
        'border-2 border-yellow-400/50 hover:border-yellow-300/70',
        'backdrop-blur-sm',
        // 动画效果
        'transform hover:scale-110 active:scale-95',
        'hover:-translate-y-1',
        className
      )}
      aria-label="回到顶部"
      title="回到顶部"
    >
      <ChevronUp 
        className="w-6 h-6 text-yellow-100 hover:text-yellow-50 transition-colors" 
      />
    </button>
  );
};

export default BackToTop;
export { BackToTop };