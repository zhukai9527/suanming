import React from 'react';
import { cn } from '../../lib/utils';
import { FileX, Search, Inbox, AlertCircle } from 'lucide-react';
import { ChineseButton } from './ChineseButton';

interface ChineseEmptyProps {
  type?: 'default' | 'search' | 'data' | 'error';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ChineseEmpty: React.FC<ChineseEmptyProps> = ({
  type = 'default',
  title,
  description,
  action,
  className
}) => {
  const iconMap = {
    default: Inbox,
    search: Search,
    data: FileX,
    error: AlertCircle
  };

  const defaultTitles = {
    default: '暂无数据',
    search: '未找到相关内容',
    data: '暂无记录',
    error: '加载失败'
  };

  const defaultDescriptions = {
    default: '这里还没有任何内容',
    search: '请尝试其他关键词或调整筛选条件',
    data: '您还没有创建任何记录',
    error: '数据加载出现问题，请稍后重试'
  };

  const colorMap = {
    default: 'text-gray-400',
    search: 'text-blue-400',
    data: 'text-yellow-400',
    error: 'text-red-400'
  };

  const Icon = iconMap[type];
  const displayTitle = title || defaultTitles[type];
  const displayDescription = description || defaultDescriptions[type];
  const iconColor = colorMap[type];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {/* 图标 */}
      <div className="mb-4">
        <Icon className={cn('h-16 w-16', iconColor)} />
      </div>
      
      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-chinese">
        {displayTitle}
      </h3>
      
      {/* 描述 */}
      <p className="text-gray-600 mb-6 max-w-sm font-chinese leading-relaxed">
        {displayDescription}
      </p>
      
      {/* 操作按钮 */}
      {action && (
        <ChineseButton
          variant={type === 'error' ? 'primary' : 'secondary'}
          onClick={action.onClick}
        >
          {action.label}
        </ChineseButton>
      )}
    </div>
  );
};

export { ChineseEmpty };
export type { ChineseEmptyProps };