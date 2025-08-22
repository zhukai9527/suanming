import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Zap, BarChart3, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { localApi } from '../lib/localApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// 五行分析数据接口
interface WuxingElement {
  element: string;
  percentage: number;
  strength: string;
  count: number;
}

interface WuxingData {
  bazi: {
    year: { tiangan: string; dizhi: string };
    month: { tiangan: string; dizhi: string };
    day: { tiangan: string; dizhi: string };
    hour: { tiangan: string; dizhi: string };
  };
  wuxingCount: { [key: string]: number };
  wuxingPercentage: { [key: string]: number };
  wuxingWithStrength: WuxingElement[];
  radarData: Array<{ element: string; value: number; fullMark: number }>;
  balanceAnalysis: string;
  suggestions: string[];
  dominantElement: string;
  weakestElement: string;
  isBalanced: boolean;
}

const WuxingAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [analysisData, setAnalysisData] = useState<WuxingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 五行颜色配置
  const elementColors: { [key: string]: string } = {
    '木': '#22c55e', // 绿色
    '火': '#ef4444', // 红色
    '土': '#eab308', // 黄色
    '金': '#64748b', // 银色
    '水': '#3b82f6'  // 蓝色
  };

  // 五行符号配置
  const elementSymbols: { [key: string]: string } = {
    '木': '🌲',
    '火': '🔥',
    '土': '⛰️',
    '金': '⚡',
    '水': '💧'
  };

  // 进行五行分析
  const fetchWuxingAnalysis = async () => {
    if (!birthDate) {
      toast.error('请选择您的出生日期');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用本地API
      const response = await localApi.functions.invoke('bazi-wuxing-analysis', {
        body: {
          birthDate,
          birthTime
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.data) {
        setAnalysisData(response.data.data);
        toast.success('五行分析完成！');
      } else {
        throw new Error('分析结果为空');
      }
    } catch (err: any) {
      setError(err.message || '分析失败，请稍后重试');
      toast.error('分析失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染雷达图
  const renderRadarChart = () => {
    if (!analysisData?.radarData) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={analysisData.radarData}>
          <PolarGrid stroke="#dc2626" />
          <PolarAngleAxis 
            dataKey="element" 
            tick={{ fill: '#dc2626', fontSize: 14, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#b91c1c', fontSize: 12 }}
          />
          <Radar
            name="五行强度"
            dataKey="value"
            stroke="#dc2626"
            fill="rgba(220, 38, 38, 0.3)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // 渲染五行统计卡片
  const renderElementCards = () => {
    if (!analysisData?.wuxingWithStrength) return null;

    return (
      <div className="grid grid-cols-5 gap-4">
        {analysisData.wuxingWithStrength.map((item) => (
          <Card key={item.element} className="text-center hover:shadow-xl transition-all duration-300 chinese-card-decoration border-2 border-yellow-400">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">{elementSymbols[item.element]}</div>
              <h3 className="font-bold text-red-800 text-lg mb-2 chinese-text-shadow">{item.element}</h3>
              <div className="text-2xl font-bold text-yellow-600 mb-1">{item.percentage}%</div>
              <div className={`text-sm font-medium mb-2 ${
                item.strength === '旺' ? 'text-green-600' : 
                item.strength === '中' ? 'text-yellow-600' : 'text-orange-600'
              }`}>
                {item.strength}
              </div>
              <div 
                className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${item.percentage}%`, 
                    backgroundColor: elementColors[item.element]
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 relative">
      {/* 页面装饰背景 */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <img 
          src="/chinese_traditional_golden_ornate_frame.png" 
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute top-20 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <img 
          src="/chinese_traditional_golden_ornate_frame.png" 
          alt=""
          className="w-full h-full object-contain rotate-180"
        />
      </div>

      {/* 标题区域 */}
      <div className="text-center space-y-4 relative z-10">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-3 border-red-600">
          <BarChart3 className="w-8 h-8 text-red-800" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-red-800 chinese-text-shadow font-serif">
          五行分析
          <span className="block text-lg text-yellow-600 mt-2 font-normal">
            深度解析您的五行构成与能量平衡
          </span>
        </h1>
      </div>

      {/* 输入区域 */}
      <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-yellow-600" />
            输入您的出生信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                出生日期 *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                出生时间
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button 
              onClick={fetchWuxingAnalysis}
              disabled={isLoading || !birthDate}
              size="lg"
              className="w-full chinese-red-glow text-white hover:shadow-xl transition-all duration-300 border-2 border-yellow-400"
            >
              {isLoading ? (
                <>加载中...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  开始五行分析
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-400 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 分析结果 */}
      {analysisData && (
        <div className="space-y-8">
          {/* 五行统计卡片 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
                五行能量分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderElementCards()}
            </CardContent>
          </Card>

          {/* 雷达图 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
                五行平衡雷达图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {renderRadarChart()}
              </div>
            </CardContent>
          </Card>

          {/* 平衡分析 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Zap className="mr-2 h-6 w-6 text-yellow-600" />
                五行平衡分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <p className="text-red-700 leading-relaxed text-lg font-medium whitespace-pre-line">
                  {analysisData.balanceAnalysis}
                </p>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border-2 border-green-300">
                    <div className="text-2xl mb-2">{elementSymbols[analysisData.dominantElement]}</div>
                    <h4 className="font-bold text-green-700">最强元素</h4>
                    <p className="text-green-600">{analysisData.dominantElement}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-300">
                    <div className="text-2xl mb-2">{elementSymbols[analysisData.weakestElement]}</div>
                    <h4 className="font-bold text-orange-700">最弱元素</h4>
                    <p className="text-orange-600">{analysisData.weakestElement}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 改善建议 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-yellow-600" />
                五行调和建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-4">
                  {analysisData.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-800 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-red-700 font-medium">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WuxingAnalysisPage;