import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localApi } from '../lib/localApi';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import { toast } from 'sonner';
import { History, Calendar, User, Sparkles, Star, Compass, Eye, Trash2 } from 'lucide-react';
import { NumerologyReading } from '../types';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<NumerologyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<NumerologyReading | null>(null);
  const [viewingResult, setViewingResult] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await localApi.history.getAll();

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
      console.error('加载历史记录失败:', error);
      toast.error('加载历史记录失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

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
      console.error('删除失败:', error);
      toast.error('删除失败：' + (error.message || '未知错误'));
    }
  };

  const handleViewReading = (reading: NumerologyReading) => {
    setSelectedReading(reading);
    setViewingResult(true);
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
      case 'bazi': return 'text-purple-600 bg-purple-50';
      case 'ziwei': return 'text-blue-600 bg-blue-50';
      case 'yijing': return 'text-green-600 bg-green-50';
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

  if (viewingResult && selectedReading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setViewingResult(false)}
          >
            ← 返回列表
          </Button>
          <div className="text-right">
            <h2 className="text-xl font-semibold">{selectedReading.name} 的{getAnalysisTypeName(selectedReading.reading_type)}</h2>
            <p className="text-gray-600">{new Date(selectedReading.created_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
        
        <AnalysisResultDisplay 
          analysisResult={selectedReading.analysis}
          analysisType={selectedReading.reading_type as 'bazi' | 'ziwei' | 'yijing'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>历史记录</CardTitle>
              <p className="text-gray-600">查看您之前的所有命理分析记录</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      ) : readings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分析记录</h3>
            <p className="text-gray-600 mb-6">您还没有进行过任何命理分析</p>
            <Button onClick={() => window.location.href = '/analysis'}>
              <Sparkles className="mr-2 h-4 w-4" />
              立即开始分析
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {readings.map((reading) => {
            const Icon = getAnalysisTypeIcon(reading.reading_type);
            const colorClass = getAnalysisTypeColor(reading.reading_type);
            
            return (
              <Card key={reading.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {reading.name || '未知姓名'} 的{getAnalysisTypeName(reading.reading_type)}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(reading.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{reading.birth_date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReading(reading)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReading(reading.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;