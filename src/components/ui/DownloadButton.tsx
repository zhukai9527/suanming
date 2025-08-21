import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, FileImage, File, Loader2, ChevronDown } from 'lucide-react';
import { ChineseButton } from './ChineseButton';
import { cn } from '../../lib/utils';

export type DownloadFormat = 'markdown' | 'pdf' | 'png';

interface DownloadButtonProps {
  analysisData: any;
  analysisType: 'bazi' | 'ziwei' | 'yijing';
  userName?: string;
  onDownload?: (format: DownloadFormat) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  analysisData,
  analysisType,
  userName,
  onDownload,
  className,
  disabled = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<DownloadFormat | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatOptions = [
    {
      format: 'markdown' as DownloadFormat,
      label: 'Markdown文档',
      icon: FileText,
      description: '结构化文本格式，便于编辑',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      format: 'pdf' as DownloadFormat,
      label: 'PDF文档',
      icon: File,
      description: '专业格式，便于打印和分享',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      format: 'png' as DownloadFormat,
      label: 'PNG图片',
      icon: FileImage,
      description: '高清图片格式，便于保存',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    }
  ];

  const handleDownload = async (format: DownloadFormat) => {
    if (disabled || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadingFormat(format);
      setShowDropdown(false);

      if (onDownload) {
        await onDownload(format);
      } else {
        // 默认下载逻辑
        await defaultDownload(format);
      }
    } catch (error) {
      console.error('下载失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsDownloading(false);
      setDownloadingFormat(null);
    }
  };

  const defaultDownload = async (format: DownloadFormat) => {
    try {
      // 获取认证token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('请先登录');
      }

      // 获取正确的API基础URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.DEV ? 'http://localhost:3001/api' : 
         (window.location.hostname.includes('koyeb.app') ? `${window.location.origin}/api` : `${window.location.origin}/api`));

      // 调用后端下载API
      const response = await fetch(`${API_BASE_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          analysisData,
          analysisType,
          format,
          userName
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `下载失败 (${response.status})`);
      }

      // 获取文件名（从响应头或生成默认名称）
      const contentDisposition = response.headers.get('Content-Disposition');
      // 生成与后端一致的文件名格式：分析类型_用户名_日期_时间（使用分析记录创建时间）
      // 优先使用分析记录的创建时间，如果没有则使用当前时间
      let analysisDate;
      if (analysisData.created_at) {
        analysisDate = new Date(analysisData.created_at);
      } else if (analysisData.basic_info?.created_at) {
        analysisDate = new Date(analysisData.basic_info.created_at);
      } else {
        // 如果没有创建时间，使用当前时间作为备用
        analysisDate = new Date();
      }
      
      const year = analysisDate.getFullYear();
      const month = String(analysisDate.getMonth() + 1).padStart(2, '0');
      const day = String(analysisDate.getDate()).padStart(2, '0');
      const hour = String(analysisDate.getHours()).padStart(2, '0');
      const minute = String(analysisDate.getMinutes()).padStart(2, '0');
      const second = String(analysisDate.getSeconds()).padStart(2, '0');
      
      const dateStr = `${year}-${month}-${day}`;
      const timeStr = `${hour}${minute}${second}`;
      let filename = `${getAnalysisTypeLabel()}_${userName || 'user'}_${dateStr}_${timeStr}.${format === 'markdown' ? 'md' : format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*?)\1/);
        if (filenameMatch && filenameMatch[2]) {
          filename = decodeURIComponent(filenameMatch[2]);
        }
      }

      // 创建blob并下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      // 显示成功提示
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success(`${format.toUpperCase()}文件下载成功`);
      }
      
    } catch (error) {
      console.error('下载失败:', error);
      
      // 显示错误提示
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error(error instanceof Error ? error.message : '下载失败，请重试');
      }
      
      throw error;
    }
  };

  const getAnalysisTypeLabel = () => {
    switch (analysisType) {
      case 'bazi': return '八字命理';
      case 'ziwei': return '紫微斗数';
      case 'yijing': return '易经占卜';
      default: return '命理';
    }
  };

  const getFormatLabel = (format: DownloadFormat) => {
    switch (format) {
      case 'markdown': return 'Markdown';
      case 'pdf': return 'PDF';
      case 'png': return 'PNG';
      default: return format.toUpperCase();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* 主下载按钮 */}
      <div className="flex items-center space-x-2">
        <ChineseButton
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled || isDownloading}
          variant="secondary"
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-lg"
        >
          {isDownloading ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="font-medium hidden sm:inline">
            {isDownloading ? `正在生成${getFormatLabel(downloadingFormat!)}...` : '下载'}
          </span>
          <ChevronDown className={cn(
            'h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200',
            showDropdown ? 'rotate-180' : ''
          )} />
        </ChineseButton>
      </div>

      {/* 使用Portal渲染弹出层到body，脱离父容器限制 */}
      {showDropdown && createPortal(
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-[999998] bg-black bg-opacity-20" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* 弹出层 - 固定定位到屏幕中央 */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[999999] max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">选择下载格式</h3>
              <p className="text-xs text-gray-600 mt-1">{getAnalysisTypeLabel()}分析结果</p>
            </div>
            
            <div className="p-2">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isCurrentlyDownloading = isDownloading && downloadingFormat === option.format;
                
                return (
                  <button
                    key={option.format}
                    onClick={() => handleDownload(option.format)}
                    disabled={disabled || isDownloading}
                    className={cn(
                      'w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                      option.bgColor,
                      'border border-transparent hover:border-gray-300',
                      disabled || isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      option.bgColor.replace('hover:', '').replace('bg-', 'bg-').replace('-50', '-100')
                    )}>
                      {isCurrentlyDownloading ? (
                        <Loader2 className={cn('h-5 w-5 animate-spin', option.color)} />
                      ) : (
                        <Icon className={cn('h-5 w-5', option.color)} />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={cn('font-medium text-sm', option.color)}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                    
                    {isCurrentlyDownloading && (
                      <div className="text-xs text-gray-500">
                        生成中...
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-500 text-center">
                💡 提示：PDF和PNG格式包含完整的视觉设计，Markdown格式便于编辑
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default DownloadButton;