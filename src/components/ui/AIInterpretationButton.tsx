import React, { useState, useEffect } from 'react';
import { Brain, Loader2, Sparkles, AlertCircle, CheckCircle, Settings, RefreshCw, Eye, X } from 'lucide-react';
import { ChineseButton } from './ChineseButton';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from './ChineseCard';
import { cn } from '../../lib/utils';
import { 
  requestAIInterpretation, 
  saveAIInterpretation, 
  getAIInterpretation,
  AIInterpretationResult,
  AIInterpretationRequest 
} from '../../services/aiInterpretationService';
import { getAIConfig, validateAIConfig, getPromptTemplate } from '../../config/aiConfig';
import { toast } from 'sonner';

interface AIInterpretationButtonProps {
  analysisData: any;
  analysisType: 'bazi' | 'ziwei' | 'yijing';
  analysisId?: string; // 用于缓存解读结果
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showConfigButton?: boolean; // 是否显示配置按钮
  onConfigClick?: () => void; // 配置按钮点击回调
}

const AIInterpretationButton: React.FC<AIInterpretationButtonProps> = ({
  analysisData,
  analysisType,
  analysisId,
  className,
  variant = 'default',
  size = 'md',
  showConfigButton = true,
  onConfigClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<AIInterpretationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>(''); // 流式内容

  // 检查AI配置是否有效
  useEffect(() => {
    const config = getAIConfig();
    setIsConfigValid(validateAIConfig(config));
  }, []);

  // 加载已保存的解读结果
  useEffect(() => {
    if (analysisId) {
      const savedInterpretation = getAIInterpretation(analysisId);
      if (savedInterpretation) {
        setInterpretation(savedInterpretation);
      }
    }
  }, [analysisId]);

  // 处理AI解读请求
  const handleAIInterpretation = async () => {
    if (!isConfigValid) {
      toast.error('AI配置不完整，请先配置API设置');
      if (onConfigClick) {
        onConfigClick();
      }
      return;
    }

    if (!analysisData) {
      toast.error('没有可解读的分析数据');
      return;
    }

    setIsLoading(true);
    setRequestStartTime(Date.now());
    
    // 获取用户配置的AI设置
    const currentConfig = getAIConfig();
    
    setDebugInfo({
      status: '开始请求',
      startTime: new Date().toLocaleString(),
      config: {
        apiUrl: currentConfig.apiUrl,
        modelName: currentConfig.modelName,
        maxTokens: currentConfig.maxTokens,
        temperature: currentConfig.temperature,
        timeout: currentConfig.timeout,
        apiKeyLength: currentConfig.apiKey?.length || 0
      },
      analysisType,
      analysisDataSize: JSON.stringify(analysisData).length
    });
    
    try {
      const request: AIInterpretationRequest = {
        analysisType,
        analysisContent: analysisData,
        onStreamUpdate: currentConfig.stream ? (content: string) => {
          setStreamingContent(content);
          setShowResult(true); // 开始流式输出时就显示结果区域
        } : undefined
      };

      // 获取提示词用于调试显示
      const analysisMarkdown = typeof request.analysisContent === 'string' 
        ? request.analysisContent 
        : JSON.stringify(request.analysisContent, null, 2);
      
      const promptTemplate = getPromptTemplate(request.analysisType);
      const fullPrompt = promptTemplate.replace('{analysisContent}', analysisMarkdown);
      
      // 生成curl命令用于调试
      const requestBody = {
        model: currentConfig.modelName,
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: currentConfig.maxTokens,
        temperature: currentConfig.temperature
      };
      
      const curlCommand = `curl -X POST "${currentConfig.apiUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${currentConfig.apiKey.substring(0, 10)}..." \\
  -d '${JSON.stringify(requestBody, null, 2).replace(/'/g, "'\"'\"'")}'`;
      
      setDebugInfo(prev => ({
        ...prev,
        status: '发送请求中',
        requestTime: new Date().toLocaleString(),
        apiParams: {
          model: currentConfig.modelName,
          maxTokens: currentConfig.maxTokens,
          temperature: currentConfig.temperature,
          promptLength: fullPrompt.length,
          promptPreview: fullPrompt.substring(0, 300) + '...',
          fullPrompt: fullPrompt, // 完整的prompt用于调试
          requestBody: JSON.stringify(requestBody, null, 2),
          curlCommand: curlCommand
        }
      }));

      const result = await requestAIInterpretation(request);
      
      const endTime = Date.now();
      const duration = requestStartTime ? endTime - requestStartTime : 0;
      
      console.log('🐛 调试时间计算 (成功):', {
        requestStartTime,
        endTime,
        duration,
        durationSeconds: duration / 1000
      });
      
      setDebugInfo(prev => ({
        ...prev,
        status: result.success ? '请求成功' : '请求失败',
        endTime: new Date().toLocaleString(),
        duration: `${duration}ms (${(duration / 1000).toFixed(1)}秒)`,
        result: {
          success: result.success,
          contentLength: result.content?.length || 0,
          error: result.error,
          model: result.model,
          tokensUsed: result.tokensUsed,
          actualDuration: duration,
          startTime: requestStartTime,
          endTime: endTime
        }
      }));
      
      if (result.success) {
        console.log('AI解读成功，结果:', result);
        setInterpretation(result);
        setShowResult(true);
        setStreamingContent(''); // 清空流式内容，使用最终结果
        
        // 保存解读结果
        if (analysisId) {
          saveAIInterpretation(analysisId, result);
        }
        
        toast.success(`AI解读完成，耗时${duration}ms`);
      } else {
        console.error('AI解读失败:', result.error);
        toast.error(`AI解读失败: ${result.error}`);
        setStreamingContent(''); // 清空流式内容
      }
    } catch (error: any) {
      const endTime = Date.now();
      const duration = requestStartTime ? endTime - requestStartTime : 0;
      
      console.log('🐛 调试时间计算:', {
        requestStartTime,
        endTime,
        duration,
        durationSeconds: duration / 1000
      });
      
      setDebugInfo(prev => ({
        ...prev,
        status: '请求异常',
        endTime: new Date().toLocaleString(),
        duration: `${duration}ms (${(duration / 1000).toFixed(1)}秒)`,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 500),
          actualDuration: duration,
          startTime: requestStartTime,
          endTime: endTime
        }
      }));
      
      console.error('AI解读出错:', error);
      toast.error(`解读过程出错: ${error.message || '未知错误'}`);
      setStreamingContent(''); // 清空流式内容
    } finally {
      setIsLoading(false);
      // 不要立即清除requestStartTime，保留用于调试
      // setRequestStartTime(null);
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
    <div className={cn('space-y-4', className)}>
      {/* AI解读按钮区域 */}
      <div className="flex items-center space-x-2">
        <ChineseButton
          variant="outline"
          size="md"
          onClick={interpretation ? () => setShowResult(!showResult) : handleAIInterpretation}
          disabled={isLoading || (!isConfigValid && !interpretation)}
          className={cn(
            'px-3 sm:px-6 text-xs sm:text-sm',
            !isConfigValid && !interpretation && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Eye className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="hidden sm:inline">
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
            size={size}
            onClick={handleReinterpret}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            <span className="text-xs">重新解读</span>
          </ChineseButton>
        )}

        {/* 配置按钮 */}
        {showConfigButton && onConfigClick && (
          <ChineseButton
            variant="ghost"
            size={size}
            onClick={onConfigClick}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-3 w-3" />
            <span className="text-xs">配置</span>
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

      {/* 调试信息 */}
       {debugInfo && (
         <div className="text-xs text-gray-500 p-3 bg-gray-100 rounded border">
           <div className="flex justify-between items-center mb-2">
             <div className="font-bold">🔍 AI解读调试信息</div>
             <button
               onClick={() => setDebugInfo(null)}
               className="text-gray-400 hover:text-gray-600 p-1"
               title="清除调试信息"
             >
               <X className="h-3 w-3" />
             </button>
           </div>
          <div className="space-y-1">
            <div><strong>状态:</strong> {debugInfo.status}</div>
            <div><strong>开始时间:</strong> {debugInfo.startTime}</div>
            {debugInfo.endTime && <div><strong>结束时间:</strong> {debugInfo.endTime}</div>}
            {debugInfo.duration && <div><strong>耗时:</strong> {debugInfo.duration}</div>}
            <div><strong>分析类型:</strong> {debugInfo.analysisType}</div>
            <div><strong>数据大小:</strong> {debugInfo.analysisDataSize} 字符</div>
            
            {debugInfo.config && (
               <details className="mt-2">
                 <summary className="cursor-pointer font-medium">配置信息</summary>
                 <div className="ml-2 mt-1 space-y-1">
                   <div><strong>API地址:</strong> {debugInfo.config.apiUrl}</div>
                   <div><strong>模型:</strong> {debugInfo.config.modelName}</div>
                   <div><strong>最大Token:</strong> {debugInfo.config.maxTokens}</div>
                   <div><strong>温度:</strong> {debugInfo.config.temperature}</div>
                   <div><strong>超时:</strong> {debugInfo.config.timeout}ms</div>
                   <div><strong>API Key长度:</strong> {debugInfo.config.apiKeyLength}</div>
                 </div>
               </details>
             )}
             
             {debugInfo.apiParams && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">API调用参数</summary>
                  <div className="ml-2 mt-1 space-y-1">
                    <div><strong>模型:</strong> {debugInfo.apiParams.model}</div>
                    <div><strong>最大Token:</strong> {debugInfo.apiParams.maxTokens}</div>
                    <div><strong>温度:</strong> {debugInfo.apiParams.temperature}</div>
                    <div><strong>Prompt长度:</strong> {debugInfo.apiParams.promptLength} 字符</div>
                    <div><strong>Prompt预览:</strong></div>
                    <pre className="text-xs mt-1 p-2 bg-white rounded border whitespace-pre-wrap max-h-32 overflow-y-auto">{debugInfo.apiParams.promptPreview}</pre>
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">查看完整Prompt</summary>
                      <pre className="text-xs mt-1 p-2 bg-white rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">{debugInfo.apiParams.fullPrompt}</pre>
                    </details>
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">查看请求体JSON</summary>
                      <pre className="text-xs mt-1 p-2 bg-white rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">{debugInfo.apiParams.requestBody}</pre>
                    </details>
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium text-blue-600">🔧 API调用指令 (curl)</summary>
                      <div className="mt-1">
                        <div className="text-xs text-gray-600 mb-1">复制以下命令到终端执行以手动测试API:</div>
                        <pre className="text-xs p-2 bg-black text-green-400 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">{debugInfo.apiParams.curlCommand}</pre>
                        <button 
                          onClick={() => navigator.clipboard.writeText(debugInfo.apiParams.curlCommand)}
                          className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          复制curl命令
                        </button>
                      </div>
                    </details>
                  </div>
                </details>
              )}
            
            {debugInfo.result && (
               <details className="mt-2">
                 <summary className="cursor-pointer font-medium">响应信息</summary>
                 <div className="ml-2 mt-1 space-y-1">
                   <div><strong>成功:</strong> {debugInfo.result.success ? '是' : '否'}</div>
                   <div><strong>内容长度:</strong> {debugInfo.result.contentLength}</div>
                   <div><strong>使用模型:</strong> {debugInfo.result.model || 'N/A'}</div>
                   <div><strong>消耗Token:</strong> {debugInfo.result.tokensUsed || 'N/A'}</div>
                   {debugInfo.result.error && <div><strong>错误:</strong> {debugInfo.result.error}</div>}
                   <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                     <div><strong>时间调试:</strong></div>
                     <div>开始时间戳: {debugInfo.result.startTime}</div>
                     <div>结束时间戳: {debugInfo.result.endTime}</div>
                     <div>实际耗时: {debugInfo.result.actualDuration}ms</div>
                   </div>
                 </div>
               </details>
             )}
            
            {debugInfo.error && (
               <details className="mt-2">
                 <summary className="cursor-pointer font-medium text-red-600">错误详情</summary>
                 <div className="ml-2 mt-1 space-y-1 text-red-600">
                   <div><strong>错误类型:</strong> {debugInfo.error.name}</div>
                   <div><strong>错误信息:</strong> {debugInfo.error.message}</div>
                   {debugInfo.error.stack && (
                     <div><strong>堆栈:</strong> <pre className="text-xs mt-1 whitespace-pre-wrap">{debugInfo.error.stack}</pre></div>
                   )}
                   <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-black">
                     <div><strong>时间调试:</strong></div>
                     <div>开始时间戳: {debugInfo.error.startTime}</div>
                     <div>结束时间戳: {debugInfo.error.endTime}</div>
                     <div>实际耗时: {debugInfo.error.actualDuration}ms</div>
                   </div>
                 </div>
               </details>
             )}
          </div>
        </div>
      )}

      {/* AI解读结果显示 */}
      {(interpretation || streamingContent) && showResult && (
        <ChineseCard className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
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
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {streamingContent || interpretation?.content}
                  {isLoading && streamingContent && (
                    <span className="inline-block w-2 h-5 bg-purple-600 animate-pulse ml-1"></span>
                  )}
                </div>
              </div>
            )}
          </ChineseCardContent>
        </ChineseCard>
      )}
    </div>
  );
};

export default AIInterpretationButton;