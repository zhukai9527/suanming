import React, { useState, useEffect } from 'react';
import { Brain, Loader2, Sparkles, AlertCircle, CheckCircle, Settings, RefreshCw, Eye, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChineseButton } from './ChineseButton';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from './ChineseCard';
import { cn } from '../../lib/utils';
import { 
  requestAIInterpretation, 
  saveAIInterpretation, 
  getAIInterpretation,
  AIInterpretationResult,
  AIInterpretationRequest,
  convertAnalysisToMarkdown
} from '../../services/aiInterpretationService';
import { getAIConfig, validateAIConfig, getPromptTemplate } from '../../config/aiConfig';
import { toast } from 'sonner';

interface AIInterpretationButtonProps {
  analysisData?: any; // 分析数据对象（可选）
  analysisMarkdown?: string; // 直接传递的MD内容（可选）
  analysisType: 'bazi' | 'ziwei' | 'yijing';
  analysisId?: string; // 用于缓存解读结果
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showConfigButton?: boolean; // 是否显示配置按钮
  onConfigClick?: () => void; // 配置按钮点击回调
  onAIInterpretationClick?: () => void; // AI解读按钮点击回调（可选，用于自定义行为）
}

const AIInterpretationButton: React.FC<AIInterpretationButtonProps> = ({
  analysisData,
  analysisMarkdown,
  analysisType,
  analysisId,
  className,
  variant = 'default',
  size = 'md',
  showConfigButton = true,
  onConfigClick,
  onAIInterpretationClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<AIInterpretationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(false);

  const [requestStartTime, setRequestStartTime] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>(''); // 流式内容

  // 检查AI配置是否有效
  useEffect(() => {
    const config = getAIConfig();
    setIsConfigValid(validateAIConfig(config));
  }, []);

  // 生成唯一的分析ID，包含分析数据的时间戳
  const generateAnalysisId = () => {
    if (analysisId) {
      return analysisId;
    }
    
    // 尝试从分析数据中提取时间戳
    let timestamp = '';
    if (analysisData) {
      // 检查多种可能的时间戳字段
      const timeFields = [
        analysisData.created_at,
        analysisData.timestamp,
        analysisData.analysis_time,
        analysisData.basic_info?.created_at,
        analysisData.basic_info?.timestamp,
        analysisData.basic_info?.analysis_time
      ];
      
      for (const field of timeFields) {
        if (field) {
          timestamp = new Date(field).getTime().toString();
          break;
        }
      }
      
      // 如果没有找到时间戳，使用数据的哈希值作为标识
      if (!timestamp) {
        const dataString = JSON.stringify(analysisData);
        // 使用简单的哈希算法替代btoa，避免Unicode字符问题
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
          const char = dataString.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 转换为32位整数
        }
        timestamp = Math.abs(hash).toString(36).slice(0, 16); // 使用36进制表示
      }
    }
    
    return `${analysisType}-${timestamp || Date.now()}`;
  };
  
  const uniqueAnalysisId = generateAnalysisId();

  // 加载已保存的解读结果
  useEffect(() => {
    const loadSavedInterpretation = async () => {
      if (uniqueAnalysisId) {
        const savedInterpretation = await getAIInterpretation(uniqueAnalysisId);
        if (savedInterpretation) {
          setInterpretation(savedInterpretation);
        }
      }
    };
    
    loadSavedInterpretation();
  }, [uniqueAnalysisId]);

  // 处理AI解读请求
  const handleAIInterpretation = async () => {
    if (!isConfigValid) {
      toast.error('AI配置不完整，请先配置API设置');
      if (onConfigClick) {
        onConfigClick();
      }
      return;
    }

    if (!analysisData && !analysisMarkdown) {
      toast.error('没有可解读的分析数据');
      return;
    }

    setIsLoading(true);
    setRequestStartTime(Date.now());
    
    // 获取用户配置的AI设置
    const currentConfig = getAIConfig();
    

    
    try {
      const request: AIInterpretationRequest = {
        analysisType,
        analysisContent: analysisMarkdown || analysisData, // 优先使用MD字符串
        onStreamUpdate: currentConfig.stream ? (content: string) => {
          setStreamingContent(content);
          setShowResult(true); // 开始流式输出时就显示结果区域
        } : undefined
      };



      const result = await requestAIInterpretation(request);
      
      if (result.success) {
        setInterpretation(result);
        setShowResult(true);
        setStreamingContent(''); // 清空流式内容，使用最终结果
        
        // 保存解读结果
        if (uniqueAnalysisId) {
          try {
            await saveAIInterpretation(uniqueAnalysisId, result, analysisType);
          } catch (saveError) {
            // 保存失败不影响用户体验，静默处理
          }
        }
        
        toast.success('AI解读完成');
      } else {
        toast.error(`AI解读失败: ${result.error}`);
        setStreamingContent(''); // 清空流式内容
      }
    } catch (error: any) {
      toast.error(`解读过程出错: ${error.message || '未知错误'}`);
      setStreamingContent(''); // 清空流式内容
    } finally {
      setIsLoading(false);
      setRequestStartTime(null);
    }
  };

  // 重新解读
  const handleReinterpret = () => {
    setInterpretation(null);
    setShowResult(false);
    handleAIInterpretation();
  };

  // 获取分析类型显示名称
  const getAnalysisTypeName = (type: string) => {
    const names = {
      'bazi': '八字',
      'ziwei': '紫微斗数',
      'yijing': '易经'
    };
    return names[type as keyof typeof names] || '命理';
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* AI解读按钮区域 */}
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <ChineseButton
          variant="outline"
          size="md"
          onClick={() => {
            if (onAIInterpretationClick) {
              onAIInterpretationClick();
            }
            if (interpretation) {
              setShowResult(!showResult);
            } else if (!onAIInterpretationClick) {
              handleAIInterpretation();
            }
          }}
          disabled={isLoading || (!isConfigValid && !interpretation)}
          className={cn(
            'min-h-[40px] px-3 sm:px-6 text-xs sm:text-sm flex-shrink-0',
            !isConfigValid && !interpretation && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Eye className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="text-xs sm:text-sm">
            {isLoading 
              ? 'AI解读中...' 
              : interpretation 
                ? (showResult ? '隐藏解读' : 'AI解读')
                : 'AI解读'
            }
          </span>
        </ChineseButton>

        {/* 重新解读按钮 */}
        {interpretation && (
          <ChineseButton
            variant="outline"
            size="md"
            onClick={handleReinterpret}
            disabled={isLoading}
            className="min-h-[40px] px-3 sm:px-4 flex items-center space-x-1 flex-shrink-0"
          >
            <RefreshCw className={cn('h-3 w-3 sm:h-4 sm:w-4', isLoading && 'animate-spin')} />
            <span className="text-xs sm:text-sm">重新解读</span>
          </ChineseButton>
        )}

        {/* 配置按钮 */}
        {showConfigButton && onConfigClick && (
          <ChineseButton
            variant="ghost"
            size="md"
            onClick={onConfigClick}
            className="min-h-[40px] px-3 sm:px-4 flex items-center space-x-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">配置</span>
          </ChineseButton>
        )}
      </div>

      {/* 配置提示 */}
      {!isConfigValid && !interpretation && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">需要配置AI设置</p>
            <p className="text-xs mt-1">请先配置API Key、API地址等信息才能使用AI解读功能</p>
          </div>
        </div>
      )}



      {/* AI解读结果显示 */}
      {(interpretation || streamingContent) && showResult && (
        <ChineseCard className="w-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <ChineseCardHeader>
            <ChineseCardTitle className="flex items-center space-x-2 text-purple-800">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              <span>AI智能解读 - {getAnalysisTypeName(analysisType)}</span>
              {isLoading && streamingContent && (
                <span className="ml-2 text-sm font-normal text-purple-600">正在生成中...</span>
              )}
            </ChineseCardTitle>
            {interpretation && (
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <span>解读时间: {new Date(interpretation.timestamp).toLocaleString('zh-CN')}</span>
                {interpretation.model && <span>模型: {interpretation.model}</span>}
                {interpretation.tokensUsed && <span>消耗Token: {interpretation.tokensUsed}</span>}
              </div>
            )}
          </ChineseCardHeader>
          <ChineseCardContent>
            {interpretation && !interpretation.success ? (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">解读失败</p>
                  <p className="text-xs mt-1">{interpretation.error}</p>
                </div>
              </div>
            ) : (
              <div className="w-full prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800 prose-table:text-gray-800 prose-th:text-gray-900 prose-td:text-gray-800 break-words">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // 自定义表格样式
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="border border-gray-300 px-4 py-2 text-gray-800" {...props} />
                    ),
                    // 自定义标题样式
                    h1: ({node, ...props}) => (
                      <h1 className="text-2xl font-bold text-purple-800 mb-4 mt-6 border-b border-purple-200 pb-2" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-xl font-semibold text-purple-700 mb-3 mt-5" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-lg font-medium text-purple-600 mb-2 mt-4" {...props} />
                    ),
                    // 自定义列表样式
                    ul: ({node, ...props}) => (
                      <ul className="list-disc list-inside space-y-1 my-3 text-gray-800" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="list-decimal list-inside space-y-1 my-3 text-gray-800" {...props} />
                    ),
                    // 自定义段落样式
                    p: ({node, ...props}) => (
                      <p className="mb-3 leading-relaxed text-gray-800" {...props} />
                    ),
                    // 自定义强调样式
                    strong: ({node, ...props}) => (
                      <strong className="font-semibold text-purple-800" {...props} />
                    ),
                    em: ({node, ...props}) => (
                      <em className="italic text-purple-700" {...props} />
                    ),
                    // 自定义代码块样式
                     code: ({node, ...props}: any) => {
                       const isInline = !props.className?.includes('language-');
                       return isInline ? (
                         <code className="bg-gray-100 text-purple-800 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                       ) : (
                         <code className="block bg-gray-100 text-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                       );
                     },
                    // 自定义引用样式
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-purple-300 pl-4 py-2 my-4 bg-purple-50 text-gray-800 italic" {...props} />
                    )
                  }}
                >
                  {streamingContent || interpretation?.content || ''}
                </ReactMarkdown>
                {isLoading && streamingContent && (
                  <span className="inline-block w-2 h-5 bg-purple-600 animate-pulse ml-1"></span>
                )}
              </div>
            )}
          </ChineseCardContent>
        </ChineseCard>
      )}
    </div>
  );
};

export default AIInterpretationButton;