import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localApi } from '../lib/localApi';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { ChineseEmpty } from '../components/ui/ChineseEmpty';
import { ChineseLoading } from '../components/ui/ChineseLoading';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import DownloadButton from '../components/ui/DownloadButton';
import { toast } from 'sonner';
import { History, Calendar, User, Sparkles, Star, Compass, Eye, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { NumerologyReading } from '../types';
import { cn } from '../lib/utils';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<NumerologyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<NumerologyReading | null>(null);
  const [viewingResult, setViewingResult] = useState(false);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 安全地从input_data中获取值的辅助函数
  const getInputDataValue = (inputData: string | any, key: string, defaultValue: any = null) => {
    try {
      if (!inputData) return defaultValue;
      
      // 如果已经是对象，直接返回
      if (typeof inputData === 'object') {
        return inputData[key] || defaultValue;
      }
      
      // 如果是字符串，尝试解析JSON
      if (typeof inputData === 'string') {
        const parsed = JSON.parse(inputData);
        return parsed[key] || defaultValue;
      }
      
      return defaultValue;
    } catch (error) {
      // 解析input_data失败
      return defaultValue;
    }
  };

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await localApi.history.getAll({ limit: 1000 });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const historyData = response.data || [];
      
      // 数据转换适配器：将旧格式转换为新格式
      const processedData = historyData.map((reading: any) => {
        // 如果有 analysis 字段，直接使用
        if (reading.analysis) {
          return reading;
        }
        
        // 如果只有 results 字段，转换为新格式
        if (reading.results) {
          return {
            ...reading,
            analysis: {
              [reading.reading_type]: {
                [`${reading.reading_type}_analysis`]: reading.results
              },
              metadata: {
                analysis_time: reading.created_at,
                version: '1.0',
                analysis_type: reading.reading_type,
                migrated_from_results: true
              }
            }
          };
        }
        
        return reading;
      });

      setReadings(processedData);
    } catch (error: any) {
      toast.error('加载历史记录失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [user, loadHistory]);

  const handleDeleteReading = async (readingId: string) => {
    if (!confirm('确定要删除这条分析记录吗？')) {
      return;
    }

    try {
      const response = await localApi.history.delete(readingId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setReadings(prev => prev.filter(r => r.id !== readingId));
      if (selectedReading?.id === readingId) {
        setSelectedReading(null);
        setViewingResult(false);
      }
      toast.success('删除成功');
    } catch (error: any) {
      toast.error('删除失败：' + (error.message || '未知错误'));
    }
  };

  const handleViewReading = (reading: NumerologyReading) => {
    setSelectedReading(reading);
    setViewingResult(true);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'bazi': return Sparkles;
      case 'ziwei': return Star;
      case 'yijing': return Compass;
      default: return History;
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'bazi': return 'text-red-600 bg-red-50';
      case 'ziwei': return 'text-yellow-600 bg-yellow-50';
      case 'yijing': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'bazi': return '八字命理';
      case 'ziwei': return '紫微斗数';
      case 'yijing': return '易经占卜';
      default: return '未知类型';
    }
  };

  // 分页相关计算
  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReadings = readings.slice(startIndex, endIndex);

  // 分页处理函数
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (viewingResult && selectedReading) {
    return (
      <div className="space-y-6" id="history-analysis-content" data-export-content>
        <div className="flex items-center justify-between no-export" data-no-export>
          <ChineseButton
            variant="outline"
            onClick={() => setViewingResult(false)}
          >
            ← 返回列表
          </ChineseButton>
          <div className="text-right">
            <h2 className="text-xl font-semibold font-chinese text-red-600">{selectedReading.name} 的{getAnalysisTypeName(selectedReading.reading_type)}</h2>
            <p className="text-gray-600 font-chinese">{new Date(selectedReading.created_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
        

        <AnalysisResultDisplay 
          analysisResult={selectedReading.analysis}
          analysisType={selectedReading.reading_type as 'bazi' | 'ziwei' | 'yijing'}
          birthDate={selectedReading.reading_type !== 'yijing' ? {
            date: selectedReading.birth_date || '',
            time: selectedReading.birth_time || '12:00',
            name: selectedReading.name || '',
            gender: selectedReading.gender || 'male'
          } : undefined}
          question={selectedReading.reading_type === 'yijing' ? 
            getInputDataValue(selectedReading.input_data, 'question', '综合运势如何？') : undefined}
          userId={selectedReading.user_id?.toString()}
          divinationMethod={selectedReading.reading_type === 'yijing' ? 
            getInputDataValue(selectedReading.input_data, 'divination_method', 'time') : undefined}
          preAnalysisData={selectedReading.analysis}
        />

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 font-chinese mb-2">历史记录</h1>
        <p className="text-gray-600 font-chinese">
          查看您之前的所有命理分析记录
          {readings.length > 0 && (
            <span className="ml-2 text-sm">
              （共 {readings.length} 条记录{totalPages > 1 && `，第 ${currentPage}/${totalPages} 页`}）
            </span>
          )}
        </p>
      </div>
      
      <ChineseCard variant="elevated">
        <ChineseCardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <History className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <ChineseCardTitle className="text-red-600 font-chinese">分析记录</ChineseCardTitle>
              <p className="text-gray-600 font-chinese">您的命理分析历史</p>
            </div>
          </div>
        </ChineseCardHeader>
        <ChineseCardContent>
          {loading ? (
             <ChineseLoading
               size="lg"
               variant="chinese"
               text="正在加载历史记录..."
               className="py-16"
             />
          ) : readings.length === 0 ? (
            <ChineseEmpty
              type="data"
              title="暂无分析记录"
              description="您还没有进行过任何命理分析"
              action={{
                label: '立即开始分析',
                onClick: () => window.location.href = '/analysis'
              }}
            />
          ) : (
            <div className="grid gap-4">
              {currentReadings.map((reading) => {
                const Icon = getAnalysisTypeIcon(reading.reading_type);
                const colorClass = getAnalysisTypeColor(reading.reading_type);
                
                return (
                  <ChineseCard key={reading.id} variant="bordered" className="hover:shadow-lg transition-all duration-200">
                    <ChineseCardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 font-chinese">
                              {reading.name || '未知姓名'} - {getAnalysisTypeName(reading.reading_type)}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="font-chinese">{new Date(reading.created_at).toLocaleString('zh-CN')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span className="font-chinese">
                                  {reading.reading_type === 'yijing' 
                                    ? `问题：${getInputDataValue(reading.input_data, 'question', '综合运势').substring(0, 20)}${getInputDataValue(reading.input_data, 'question', '').length > 20 ? '...' : ''}` 
                                    : reading.birth_date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-center flex-wrap gap-2">
                          <ChineseButton
                            variant="outline"
                            size="md"
                            onClick={() => handleViewReading(reading)}
                            className="min-h-[40px] px-2 sm:px-6 text-xs sm:text-sm flex-shrink-0"
                          >
                            <Eye className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">查看</span>
                          </ChineseButton>

                          <DownloadButton
                            analysisData={{
                              ...(reading.analysis || reading.results),
                              created_at: reading.created_at
                            }}
                            analysisType={reading.reading_type as 'bazi' | 'ziwei' | 'yijing'}
                            userName={reading.name}
                            className="min-h-[40px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm flex-shrink-0"
                          />

                          <ChineseButton
                            variant="ghost"
                            size="md"
                            onClick={() => handleDeleteReading(reading.id)}
                            className="min-h-[40px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm ml-1">删除</span>
                          </ChineseButton>
                        </div>
                      </div>
                    </ChineseCardContent>
                  </ChineseCard>
                );
              })}
            </div>
          )}
          
          {/* 分页组件 */}
          {readings.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200">
              <ChineseButton
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>上一页</span>
              </ChineseButton>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 显示逻辑：始终显示第1页、最后一页、当前页及其前后各1页
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 1;
                  
                  if (!showPage) {
                    // 显示省略号
                    if (page === 2 && currentPage > 4) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 3) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <ChineseButton
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "min-w-[40px] h-10",
                        currentPage === page && "bg-red-600 text-white hover:bg-red-700"
                      )}
                    >
                      {page}
                    </ChineseButton>
                  );
                })}
              </div>
              
              <ChineseButton
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>下一页</span>
                <ChevronRight className="h-4 w-4" />
              </ChineseButton>
            </div>
          )}
        </ChineseCardContent>
      </ChineseCard>
      
      
    </div>
  );
};

export default HistoryPage;