import React, { useState, useEffect } from 'react';
import { Calendar, Star, BookOpen, Sparkles, User, BarChart3, Zap, TrendingUp, Loader2, Clock, Target, Heart, DollarSign, Activity, Crown, Compass, Moon, Sun, Hexagon, Layers, Eye, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { localApi } from '../lib/localApi';

interface CompleteYijingAnalysisProps {
  question: string;
  userId?: string;
  divinationMethod?: string;
}

const CompleteYijingAnalysis: React.FC<CompleteYijingAnalysisProps> = ({ 
  question, 
  userId = 'user123', 
  divinationMethod = 'time' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // 卦象颜色配置
  const hexagramColors: { [key: string]: string } = {
    '乾': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    '坤': 'bg-brown-100 text-brown-800 border-brown-300',
    '震': 'bg-green-100 text-green-800 border-green-300',
    '巽': 'bg-blue-100 text-blue-800 border-blue-300',
    '坎': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    '离': 'bg-red-100 text-red-800 border-red-300',
    '艮': 'bg-gray-100 text-gray-800 border-gray-300',
    '兑': 'bg-purple-100 text-purple-800 border-purple-300'
  };

  // 五行颜色配置
  const elementColors: { [key: string]: string } = {
    '金': '#fbbf24', // 金色
    '木': '#22c55e', // 绿色
    '水': '#3b82f6', // 蓝色
    '火': '#ef4444', // 红色
    '土': '#a3a3a3'  // 灰色
  };

  // 问题类型颜色配置
  const questionTypeColors: { [key: string]: string } = {
    '事业发展': 'bg-blue-100 text-blue-800 border-blue-300',
    '感情婚姻': 'bg-pink-100 text-pink-800 border-pink-300',
    '财运投资': 'bg-green-100 text-green-800 border-green-300',
    '健康养生': 'bg-orange-100 text-orange-800 border-orange-300',
    '综合运势': 'bg-purple-100 text-purple-800 border-purple-300'
  };

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const yijingData = {
          question: question,
          user_id: userId,
          divination_method: divinationMethod
        };

        const yijingResponse = await localApi.analysis.yijing(yijingData);

        if (yijingResponse.error) {
          throw new Error(yijingResponse.error.message || '易经分析失败');
        }

        const analysisResult = yijingResponse.data?.analysis;
        if (!analysisResult) {
          throw new Error('分析结果为空');
        }

        setAnalysisData(analysisResult);
      } catch (err) {
        console.error('获取分析数据出错:', err);
        setError(err instanceof Error ? err.message : '分析数据获取失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    if (question) {
      fetchAnalysisData();
    }
  }, [question, userId, divinationMethod]);

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <Card className="chinese-card-decoration border-2 border-yellow-400 p-8">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-2">正在进行专业易经占卜</h3>
            <p className="text-red-600">请稍候，正在为您起卦分析...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <Card className="chinese-card-decoration border-2 border-red-400 p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">占卜失败</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重新占卜
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <Card className="chinese-card-decoration border-2 border-yellow-400 p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">数据获取异常</h3>
            <p className="text-red-600">未能获取到完整的分析数据，请重新提交占卜</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染卦象卡片
  const renderHexagramCard = (hexagram: any, title: string, isMain: boolean = false) => {
    if (!hexagram) return null;

    return (
      <Card className={`chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 ${
        isMain ? 'border-yellow-400 bg-yellow-50' : 'border-yellow-400'
      }`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className={`text-lg font-bold chinese-text-shadow ${
            isMain ? 'text-red-800' : 'text-red-800'
          }`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-2">{hexagram.symbol || hexagram}</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {hexagram.name || hexagram}
            </div>
            {hexagram.number && (
              <div className="text-sm text-gray-600 mb-2">第{hexagram.number}卦</div>
            )}
            <div className="text-sm text-gray-700 mb-3">
              {hexagram.meaning || '卦象含义'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染八卦信息
  const renderTrigramInfo = (trigram: any, position: string) => {
    if (!trigram) return null;

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2">{position}</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">卦名：</span>
            <span className="font-medium">{trigram.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">性质：</span>
            <span className="font-medium">{trigram.nature}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">属性：</span>
            <span className="font-medium">{trigram.attribute}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">五行：</span>
            <span 
              className="font-medium px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: elementColors[trigram.element] + '20',
                color: elementColors[trigram.element]
              }}
            >
              {trigram.element}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染动爻分析
  const renderChangingLinesAnalysis = (analysis: any) => {
    if (!analysis || !analysis.detailed_analysis) return null;

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-bold text-yellow-800 mb-2">动爻分析方法</h4>
          <p className="text-yellow-700">{analysis.method}</p>
          <p className="text-yellow-600 text-sm mt-1">{analysis.overall_guidance}</p>
        </div>
        
        {analysis.detailed_analysis.map((line: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-bold text-gray-800">{line.line_position}</h5>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                line.line_nature === '阳爻' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {line.line_nature}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">位置含义：</span>
                <span className="text-gray-600">{line.position_meaning}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">爻辞：</span>
                <span className="text-gray-600">{line.line_text}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">象传：</span>
                <span className="text-gray-600">{line.line_image}</span>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <span className="font-medium text-blue-800">实用指导：</span>
                <span className="text-blue-700">{line.practical_guidance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* 标题和基本信息 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader className="text-center">
            <CardTitle className="text-red-800 text-3xl font-bold chinese-text-shadow flex items-center justify-center space-x-2">
              <Hexagon className="h-8 w-8" />
              <span>易经占卜分析报告</span>
              <Hexagon className="h-8 w-8" />
            </CardTitle>
            <div className="flex justify-center space-x-6 mt-4 text-red-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{analysisData.analysis_date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{new Date(analysisData.basic_info.divination_data.divination_time).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {/* 占卜信息 */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-2">占卜信息</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-red-700"><span className="font-medium">问题：</span>{analysisData.basic_info.divination_data.question}</p>
                    <p className="text-red-700"><span className="font-medium">方法：</span>{analysisData.basic_info.divination_data.method}</p>
                  </div>
                  <div>
                    <p className="text-red-700"><span className="font-medium">问题类型：</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        questionTypeColors[analysisData.dynamic_guidance.question_analysis.type] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {analysisData.dynamic_guidance.question_analysis.type}
                      </span>
                    </p>
                    <p className="text-red-700"><span className="font-medium">关注重点：</span>{analysisData.dynamic_guidance.question_analysis.focus}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 卦象信息 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 本卦 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-red-800 chinese-text-shadow flex items-center space-x-2">
              <Star className="h-6 w-6" />
              <span>本卦</span>
            </h3>
            {renderHexagramCard({
              name: analysisData.basic_info.hexagram_info.main_hexagram,
              symbol: analysisData.basic_info.hexagram_info.main_hexagram_symbol,
              number: analysisData.basic_info.hexagram_info.main_hexagram_number,
              meaning: analysisData.detailed_analysis.hexagram_analysis.primary_meaning.split(' - ')[1]
            }, '本卦', true)}
            
            {/* 八卦结构 */}
            <Card className="chinese-card-decoration border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-red-800 text-lg font-bold chinese-text-shadow flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>八卦结构</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {renderTrigramInfo(analysisData.basic_info.hexagram_info.hexagram_structure.upper_trigram, '上卦')}
                  {renderTrigramInfo(analysisData.basic_info.hexagram_info.hexagram_structure.lower_trigram, '下卦')}
                </div>
                <div className="mt-4 bg-red-50 p-3 rounded-lg">
                  <h5 className="font-bold text-red-800 mb-2">八卦组合分析</h5>
                  <p className="text-red-700 text-sm">{analysisData.detailed_analysis.hexagram_analysis.trigram_analysis}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 变卦 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-red-800 chinese-text-shadow flex items-center space-x-2">
              <Shuffle className="h-6 w-6" />
              <span>变卦</span>
            </h3>
            {analysisData.basic_info.hexagram_info.changing_hexagram !== '无' ? (
              renderHexagramCard({
                name: analysisData.basic_info.hexagram_info.changing_hexagram,
                symbol: analysisData.basic_info.hexagram_info.changing_hexagram_symbol,
                meaning: analysisData.detailed_analysis.changing_hexagram_analysis.meaning
              }, '变卦')
            ) : (
              <Card className="chinese-card-decoration border-2 border-gray-400">
                <CardContent className="text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <h4 className="text-gray-800 font-bold mb-2">无变卦</h4>
                  <p className="text-gray-600">静卦主静，事态稳定</p>
                </CardContent>
              </Card>
            )}
            
            {/* 变化分析 */}
            <Card className="chinese-card-decoration border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-red-800 text-lg font-bold chinese-text-shadow flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>变化分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-red-800 mb-2">转化洞察</h5>
                    <p className="text-red-700 text-sm">{analysisData.detailed_analysis.changing_hexagram_analysis.transformation_insight}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-red-800 mb-2">变化指导</h5>
                    <p className="text-red-700 text-sm">{analysisData.detailed_analysis.changing_hexagram_analysis.guidance}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-red-800 mb-2">时机把握</h5>
                    <p className="text-red-700 text-sm">{analysisData.detailed_analysis.changing_hexagram_analysis.timing}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 卦辞象传 */}
        <Card className="chinese-card-decoration border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span>卦辞象传</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-red-800 mb-2">彖传（卦辞）</h4>
                <p className="text-red-700 leading-relaxed">{analysisData.detailed_analysis.hexagram_analysis.judgment}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">象传（卦象）</h4>
                <p className="text-red-700 leading-relaxed">{analysisData.detailed_analysis.hexagram_analysis.image}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 动爻分析 */}
        {analysisData.detailed_analysis.changing_lines_analysis && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span>动爻分析</span>
              </CardTitle>
              <p className="text-red-600 mt-2">动爻数量：{analysisData.detailed_analysis.changing_lines_analysis.changing_lines_count}爻</p>
            </CardHeader>
            <CardContent>
              {renderChangingLinesAnalysis(analysisData.detailed_analysis.changing_lines_analysis)}
            </CardContent>
          </Card>
        )}

        {/* 高级分析 */}
        {analysisData.detailed_analysis.advanced_analysis && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Eye className="h-6 w-6" />
                <span>高级分析</span>
              </CardTitle>
              <p className="text-red-600 mt-2">互卦、错卦、综卦深度解析</p>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* 互卦 */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center space-x-2">
                    <span>🔄</span>
                    <span>互卦 - {analysisData.detailed_analysis.advanced_analysis.inter_hexagram.name}</span>
                  </h4>
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-1">{analysisData.detailed_analysis.advanced_analysis.inter_hexagram.symbol}</div>
                    <div className="text-sm text-red-600">{analysisData.detailed_analysis.advanced_analysis.inter_hexagram.meaning}</div>
                  </div>
                  <p className="text-red-700 text-sm">{analysisData.detailed_analysis.advanced_analysis.inter_hexagram.analysis}</p>
                </div>
                
                {/* 错卦 */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>错卦 - {analysisData.detailed_analysis.advanced_analysis.opposite_hexagram.name}</span>
                  </h4>
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-1">{analysisData.detailed_analysis.advanced_analysis.opposite_hexagram.symbol}</div>
                    <div className="text-sm text-red-600">{analysisData.detailed_analysis.advanced_analysis.opposite_hexagram.meaning}</div>
                  </div>
                  <p className="text-red-700 text-sm">{analysisData.detailed_analysis.advanced_analysis.opposite_hexagram.analysis}</p>
                </div>
                
                {/* 综卦 */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center space-x-2">
                    <span>🔀</span>
                    <span>综卦 - {analysisData.detailed_analysis.advanced_analysis.reverse_hexagram.name}</span>
                  </h4>
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-1">{analysisData.detailed_analysis.advanced_analysis.reverse_hexagram.symbol}</div>
                    <div className="text-sm text-red-600">{analysisData.detailed_analysis.advanced_analysis.reverse_hexagram.meaning}</div>
                  </div>
                  <p className="text-red-700 text-sm">{analysisData.detailed_analysis.advanced_analysis.reverse_hexagram.analysis}</p>
                </div>
              </div>
              
              {/* 综合洞察 */}
              <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">四卦综合洞察</h4>
                <p className="text-red-700 text-sm leading-relaxed">{analysisData.detailed_analysis.advanced_analysis.comprehensive_insight}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 象数分析 */}
        {analysisData.detailed_analysis.numerology_analysis && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" />
                <span>象数分析</span>
              </CardTitle>
              <p className="text-red-600 mt-2">八卦数理与时间共振分析</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-red-800 mb-2">上卦数</h4>
                  <div className="text-2xl font-bold text-red-700 mb-1">{analysisData.detailed_analysis.numerology_analysis.upper_trigram_number.number}</div>
                  <div className="text-sm text-red-600">{analysisData.detailed_analysis.numerology_analysis.upper_trigram_number.meaning}</div>
                  <div className="text-xs text-red-500 mt-1">{analysisData.detailed_analysis.numerology_analysis.upper_trigram_number.influence}</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">下卦数</h4>
                  <div className="text-2xl font-bold text-red-700 mb-1">{analysisData.detailed_analysis.numerology_analysis.lower_trigram_number.number}</div>
                  <div className="text-sm text-red-600">{analysisData.detailed_analysis.numerology_analysis.lower_trigram_number.meaning}</div>
                  <div className="text-xs text-red-500 mt-1">{analysisData.detailed_analysis.numerology_analysis.lower_trigram_number.influence}</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-red-800 mb-2">组合能量</h4>
                  <div className="text-2xl font-bold text-red-700 mb-1">{analysisData.detailed_analysis.numerology_analysis.combined_energy.total}</div>
                  <div className="text-sm text-red-600">{analysisData.detailed_analysis.numerology_analysis.combined_energy.interpretation}</div>
                  <div className="text-xs text-red-500 mt-1">{analysisData.detailed_analysis.numerology_analysis.combined_energy.harmony}</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">时间共振</h4>
                  <div className="text-2xl font-bold text-red-700 mb-1">{analysisData.detailed_analysis.numerology_analysis.time_resonance.resonance_number}</div>
                  <div className="text-sm text-red-600">{analysisData.detailed_analysis.numerology_analysis.time_resonance.meaning}</div>
                  <div className="text-xs text-red-500 mt-1">{analysisData.detailed_analysis.numerology_analysis.time_resonance.interpretation}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 五行分析 */}
        {analysisData.detailed_analysis.hexagram_analysis.five_elements && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Compass className="h-6 w-6" />
                <span>五行分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3">五行属性</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">上卦五行：</span>
                        <span 
                          className="px-3 py-1 rounded font-medium"
                          style={{ 
                            backgroundColor: elementColors[analysisData.detailed_analysis.hexagram_analysis.five_elements.upper_element] + '20',
                            color: elementColors[analysisData.detailed_analysis.hexagram_analysis.five_elements.upper_element]
                          }}
                        >
                          {analysisData.detailed_analysis.hexagram_analysis.five_elements.upper_element}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">下卦五行：</span>
                        <span 
                          className="px-3 py-1 rounded font-medium"
                          style={{ 
                            backgroundColor: elementColors[analysisData.detailed_analysis.hexagram_analysis.five_elements.lower_element] + '20',
                            color: elementColors[analysisData.detailed_analysis.hexagram_analysis.five_elements.lower_element]
                          }}
                        >
                          {analysisData.detailed_analysis.hexagram_analysis.five_elements.lower_element}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3">五行关系</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">相互作用：</span>
                        <p className="text-gray-600 text-sm">{analysisData.detailed_analysis.hexagram_analysis.five_elements.relationship}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">平衡状态：</span>
                        <p className="text-gray-600 text-sm">{analysisData.detailed_analysis.hexagram_analysis.five_elements.balance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 时间分析 */}
        {analysisData.dynamic_guidance.time_analysis && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span>时间分析</span>
              </CardTitle>
              <p className="text-blue-600 mt-2">天时地利人和的时机把握</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                    <span>🌸</span>
                    <span>季节</span>
                  </h4>
                  <div className="text-lg font-bold text-green-700 mb-1">{analysisData.dynamic_guidance.time_analysis.season.name}</div>
                  <div className="text-sm text-green-600 mb-2">{analysisData.dynamic_guidance.time_analysis.season.energy}</div>
                  <div className="text-xs text-green-500">{analysisData.dynamic_guidance.time_analysis.season.advice}</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center space-x-2">
                    <span>⏰</span>
                    <span>时辰</span>
                  </h4>
                  <div className="text-lg font-bold text-orange-700 mb-1">{analysisData.dynamic_guidance.time_analysis.time_of_day.name}</div>
                  <div className="text-sm text-orange-600 mb-2">{analysisData.dynamic_guidance.time_analysis.time_of_day.energy}</div>
                  <div className="text-xs text-orange-500">{analysisData.dynamic_guidance.time_analysis.time_of_day.advice}</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2 flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>月相</span>
                  </h4>
                  <div className="text-lg font-bold text-purple-700 mb-1">{analysisData.dynamic_guidance.time_analysis.lunar_phase.name}</div>
                  <div className="text-sm text-purple-600 mb-2">{analysisData.dynamic_guidance.time_analysis.lunar_phase.energy}</div>
                  <div className="text-xs text-purple-500">{analysisData.dynamic_guidance.time_analysis.lunar_phase.advice}</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>能量状态</span>
                  </h4>
                  <div className="text-sm text-yellow-600 mb-2">{analysisData.dynamic_guidance.time_analysis.energy_state.overall}</div>
                  <div className="text-xs text-yellow-500">{analysisData.dynamic_guidance.time_analysis.energy_state.recommendation}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 专业指导 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 针对性指导 */}
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>针对性指导</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">专业分析</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{analysisData.dynamic_guidance.targeted_guidance}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">实用建议</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{analysisData.dynamic_guidance.practical_advice}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 易经智慧 */}
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>易经智慧</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">核心信息</h4>
                  <p className="text-red-700 font-medium">{analysisData.divination_wisdom.key_message}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">行动建议</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{analysisData.divination_wisdom.action_advice}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">时机把握</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{analysisData.divination_wisdom.timing_guidance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 哲学洞察 */}
        <Card className="chinese-card-decoration border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span>哲学洞察</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-6 rounded-lg">
              <p className="text-red-700 leading-relaxed text-center italic">
                {analysisData.divination_wisdom.philosophical_insight}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <Card className="chinese-card-decoration border-2 border-gray-300">
          <CardContent className="text-center py-6">
            <p className="text-gray-600 text-sm">
              本占卜分析基于传统易经理论，结合现代分析方法生成。
              易经占卜是中华传统文化的重要组成部分，仅供参考，不可过分依赖。
              人生的幸福需要通过自己的努力和智慧来创造。
            </p>
            <div className="mt-4 text-xs text-gray-500">
              占卜时间：{new Date().toLocaleString('zh-CN')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteYijingAnalysis;