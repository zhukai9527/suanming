import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Star, BookOpen, Sparkles, User, BarChart3, Zap, TrendingUp, Loader2, Clock, Target, Heart, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { localApi } from '../lib/localApi';

interface CompleteBaziAnalysisProps {
  birthDate: {
    date: string;
    time: string;
    name?: string;
    gender?: string;
  };
  analysisData?: any; // 可选的预先分析的数据
}

const CompleteBaziAnalysis: React.FC<CompleteBaziAnalysisProps> = ({ birthDate, analysisData: propAnalysisData }) => {
  const [isLoading, setIsLoading] = useState(!propAnalysisData);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(propAnalysisData || null);

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

  // 十神颜色配置
  const tenGodColors: { [key: string]: string } = {
    '正官': 'bg-blue-100 text-blue-800 border-blue-300',
    '七杀': 'bg-red-100 text-red-800 border-red-300',
    '正财': 'bg-green-100 text-green-800 border-green-300',
    '偏财': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    '正印': 'bg-purple-100 text-purple-800 border-purple-300',
    '偏印': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    '食神': 'bg-pink-100 text-pink-800 border-pink-300',
    '伤官': 'bg-orange-100 text-orange-800 border-orange-300',
    '比肩': 'bg-gray-100 text-gray-800 border-gray-300',
    '劫财': 'bg-slate-100 text-slate-800 border-slate-300',
    '日主': 'bg-amber-100 text-amber-800 border-amber-300'
  };

  useEffect(() => {
    // 如果已经有分析数据，直接使用
    if (propAnalysisData) {
      setAnalysisData(propAnalysisData);
      setIsLoading(false);
      return;
    }

    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const birthData = {
          name: birthDate.name || '用户',
          birth_date: birthDate.date,
          birth_time: birthDate.time,
          gender: birthDate.gender || 'male'
        };

        const baziResponse = await localApi.analysis.bazi(birthData);

        if (baziResponse.error) {
          throw new Error(baziResponse.error.message || '八字分析失败');
        }

        const analysisResult = baziResponse.data?.analysis;
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

    if (birthDate?.date && !propAnalysisData) {
      fetchAnalysisData();
    }
  }, [birthDate?.date, birthDate?.time, birthDate?.name, birthDate?.gender, propAnalysisData]);

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <Card className="chinese-card-decoration border-2 border-yellow-400 p-8">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-2">正在进行专业八字分析</h3>
            <p className="text-red-600">请稍候，正在生成您的详细命理报告...</p>
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
            <h3 className="text-xl font-bold text-red-800 mb-2">分析失败</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重新分析
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
            <p className="text-red-600">未能获取到完整的分析数据，请重新提交分析</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染四柱信息卡片
  const renderPillarCard = (pillar: any, pillarName: string, description: string) => {
    if (!pillar) return null;

    return (
      <Card className="chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-red-800 text-lg font-bold chinese-text-shadow">
            {pillarName}
          </CardTitle>
          <p className="text-red-600 text-xs">{description}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-800 mb-2">
              {pillar.stem}{pillar.branch}
            </div>
            <div className="flex justify-center space-x-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${tenGodColors[pillar.ten_god] || 'bg-gray-100 text-gray-800'}`}>
                {pillar.ten_god}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                {pillar.element}
              </span>
            </div>
          </div>
          
          {pillar.hidden_stems && pillar.hidden_stems.length > 0 && (
            <div className="border-t pt-2">
              <h5 className="text-xs font-semibold text-red-800 mb-1">地支藏干</h5>
              <div className="flex flex-wrap gap-1">
                {pillar.hidden_stems.map((stem: string, index: number) => (
                  <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    {stem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 渲染五行雷达图
  const renderWuxingRadar = () => {
    if (!analysisData.wuxing_analysis?.element_distribution) return null;

    const elements = analysisData.wuxing_analysis.element_distribution;
    const radarData = Object.entries(elements).map(([element, count]) => ({
      element,
      value: count as number,
      fullMark: 6
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#dc2626" />
          <PolarAngleAxis 
            dataKey="element" 
            tick={{ fill: '#dc2626', fontSize: 14, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 6]} 
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

  // 渲染五行分布卡片
  const renderElementCards = () => {
    if (!analysisData.wuxing_analysis?.element_distribution) return null;

    const elements = analysisData.wuxing_analysis.element_distribution;
    const total = Object.values(elements).reduce((sum: number, count: any) => sum + (typeof count === 'number' ? count : 0), 0) as number;

    return (
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(elements).map(([element, count]) => {
          const numCount = typeof count === 'number' ? count : 0;
          const percentage = total > 0 ? Math.round((numCount / total) * 100) : 0;
          const strength = numCount >= 3 ? '旺' : numCount >= 2 ? '中' : '弱';
          
          return (
            <Card key={element} className="text-center hover:shadow-xl transition-all duration-300 chinese-card-decoration border-2 border-yellow-400">
              <CardContent className="p-4">
                <div className="text-3xl mb-2">{elementSymbols[element]}</div>
                <h3 className="font-bold text-red-800 text-lg mb-2 chinese-text-shadow">{element}</h3>
                <div className="text-2xl font-bold text-yellow-600 mb-1">{numCount}</div>
                <div className="text-sm text-gray-600 mb-2">{percentage}%</div>
                <div className={`text-sm font-medium mb-2 ${
                  strength === '旺' ? 'text-green-600' : 
                  strength === '中' ? 'text-yellow-600' : 'text-orange-600'
                }`}>
                  {strength}
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: elementColors[element]
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* 标题和基本信息 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader className="text-center">
            <CardTitle className="text-red-800 text-3xl font-bold chinese-text-shadow">
              {analysisData.basic_info?.personal_data?.name || '用户'}的专业八字命理分析报告
            </CardTitle>
            <div className="flex justify-center space-x-6 mt-4 text-red-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{analysisData.basic_info?.personal_data?.birth_date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{analysisData.basic_info?.personal_data?.birth_time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{analysisData.basic_info?.personal_data?.gender === 'male' ? '男性' : analysisData.basic_info?.personal_data?.gender === 'female' ? '女性' : analysisData.basic_info?.personal_data?.gender}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800 mb-4">
                八字：{analysisData.basic_info?.bazi_chart?.complete_chart}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-2">日主信息</h4>
                  <p className="text-red-700">
                    日主：{analysisData.basic_info?.bazi_chart?.day_master}（{analysisData.basic_info?.bazi_chart?.day_master_element}）
                  </p>
                  <p className="text-red-700">
                    旺衰：{analysisData.basic_info?.bazi_chart?.element_strength?.strength_level}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-red-800 mb-2">用神分析</h4>
                  <p className="text-red-700 text-sm">
                    {analysisData.basic_info?.bazi_chart?.element_strength?.use_god_analysis?.analysis}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 四柱详细信息 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
              四柱详细信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-4 gap-6 mb-6">
              {renderPillarCard(analysisData.basic_info?.bazi_chart?.year_pillar, '年柱', '祖辈与早年运势')}
              {renderPillarCard(analysisData.basic_info?.bazi_chart?.month_pillar, '月柱', '父母与青年运势')}
              {renderPillarCard(analysisData.basic_info?.bazi_chart?.day_pillar, '日柱', '自身与配偶')}
              {renderPillarCard(analysisData.basic_info?.bazi_chart?.hour_pillar, '时柱', '子女与晚年运势')}
            </div>
          </CardContent>
        </Card>

        {/* 四柱详细解释 */}
        {analysisData.basic_info?.pillar_interpretations && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-yellow-600" />
                四柱专业解释
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <span className="mr-2">🏛️</span>年柱解释
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.basic_info.pillar_interpretations.year_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <span className="mr-2">🌟</span>月柱解释
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.basic_info.pillar_interpretations.month_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <span className="mr-2">💎</span>日柱解释
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.basic_info.pillar_interpretations.day_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <span className="mr-2">🌅</span>时柱解释
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.basic_info.pillar_interpretations.hour_pillar}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 五行能量分布 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
              五行能量分布分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderElementCards()}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                  <h4 className="font-bold text-red-800 mb-4 text-center">五行平衡雷达图</h4>
                  {renderWuxingRadar()}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-bold text-red-800 mb-2">五行平衡分析</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.wuxing_analysis?.balance_analysis}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">个性特质</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.wuxing_analysis?.personality_traits}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">改善建议</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.wuxing_analysis?.improvement_suggestions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 格局分析 */}
        {analysisData.geju_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-600" />
                格局分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-red-800 mb-2">格局类型</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-purple-600">
                          {analysisData.geju_analysis.pattern_type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {analysisData.geju_analysis.pattern_strength}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-bold text-red-800 mb-2">格局特征</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.geju_analysis.characteristics}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-red-800 mb-2">适合职业</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.geju_analysis.career_path}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-bold text-red-800 mb-2">人生意义</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.geju_analysis.life_meaning}
                      </p>
                    </div>
                  </div>
                </div>
                {analysisData.geju_analysis.development_strategy && (
                  <div className="mt-4 bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-bold text-red-800 mb-2">发展策略</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.geju_analysis.development_strategy}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 大运流年分析 */}
        {analysisData.dayun_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-yellow-600" />
                大运流年分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-bold text-red-800 mb-2">起运信息</h4>
                    <p className="text-red-700">起运年龄：{analysisData.dayun_analysis.start_luck_age}岁</p>
                    <p className="text-red-700">当前年龄：{analysisData.dayun_analysis.current_age}岁</p>
                    {analysisData.dayun_analysis.current_dayun && (
                      <p className="text-red-700">
                        当前大运：{analysisData.dayun_analysis.current_dayun.ganzhi}
                        （{analysisData.dayun_analysis.current_dayun.start_age}-{analysisData.dayun_analysis.current_dayun.end_age}岁）
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">大运影响</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.dayun_analysis.dayun_influence}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">流年分析</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {analysisData.dayun_analysis.yearly_fortune}
                    </p>
                  </div>
                </div>
                
                {/* 大运序列 */}
                {analysisData.dayun_analysis.dayun_sequence && (
                  <div className="mb-6">
                    <h4 className="font-bold text-red-800 mb-4 text-center">八步大运序列</h4>
                    <div className="grid md:grid-cols-4 gap-3">
                      {analysisData.dayun_analysis.dayun_sequence.map((dayun: any, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border-2 ${
                          analysisData.dayun_analysis.current_dayun && 
                          dayun.ganzhi === analysisData.dayun_analysis.current_dayun.ganzhi 
                            ? 'bg-yellow-100 border-yellow-400' 
                            : 'bg-white border-gray-300'
                        }`}>
                          <div className="text-center">
                            <div className="font-bold text-red-800">{dayun.ganzhi}</div>
                            <div className="text-sm text-red-600">{dayun.start_age}-{dayun.end_age}岁</div>
                            <div className={`text-xs px-2 py-1 rounded mt-1 ${tenGodColors[dayun.ten_god] || 'bg-gray-100 text-gray-800'}`}>
                              {dayun.ten_god}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-bold text-red-800 mb-2">未来展望</h4>
                  <p className="text-red-700 leading-relaxed text-sm">
                    {analysisData.dayun_analysis.future_outlook}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 详细流年分析 */}
        {analysisData.dayun_analysis?.detailed_yearly_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Calendar className="mr-2 h-6 w-6 text-yellow-600" />
                详细流年分析（未来六年）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-6">
                  {analysisData.dayun_analysis.detailed_yearly_analysis.map((yearData: any, index: number) => (
                    <div key={index} className="bg-white p-6 rounded-lg border-2 border-yellow-300 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-red-800 text-xl">
                          {yearData.year}年（{yearData.age}岁）{yearData.year_ganzhi}
                        </h4>
                        <div className="flex space-x-2">
                          <span className={`text-sm px-3 py-1 rounded-full ${tenGodColors[yearData.year_ten_god] || 'bg-gray-100 text-gray-800'}`}>
                            {yearData.year_ten_god}
                          </span>
                          <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-300">
                            {yearData.dayun_period}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-3">
                          <div className="border-l-4 border-blue-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <Target className="h-4 w-4 mr-1" />整体运势
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.overall_fortune}</p>
                          </div>
                          <div className="border-l-4 border-green-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <BarChart3 className="h-4 w-4 mr-1" />事业运势
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.career_fortune}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="border-l-4 border-yellow-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />财运分析
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.wealth_fortune}</p>
                          </div>
                          <div className="border-l-4 border-pink-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <Heart className="h-4 w-4 mr-1" />感情运势
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.relationship_fortune}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="border-l-4 border-purple-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <Activity className="h-4 w-4 mr-1" />健康提醒
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.health_fortune}</p>
                          </div>
                          <div className="border-l-4 border-orange-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm flex items-center">
                              <Sparkles className="h-4 w-4 mr-1" />关键建议
                            </h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.key_advice}</p>
                          </div>
                        </div>
                      </div>
                      
                      {yearData.monthly_highlights && yearData.monthly_highlights.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-yellow-200">
                          <h5 className="font-semibold text-red-800 text-sm mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />月度重点
                          </h5>
                          <div className="grid md:grid-cols-2 gap-2">
                            {yearData.monthly_highlights.map((highlight: string, hIndex: number) => (
                              <p key={hIndex} className="text-red-700 text-xs bg-yellow-50 p-2 rounded">• {highlight}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 专业人生指导 */}
        {analysisData.life_guidance && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-yellow-600" />
                专业人生指导
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-bold text-red-800 mb-2">事业发展</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.career_development}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-red-800 mb-2">财富管理</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.wealth_management}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                      <h4 className="font-bold text-red-800 mb-2">感情婚姻</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.marriage_relationships}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-red-800 mb-2">健康养生</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.health_wellness}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold text-red-800 mb-2">个人发展</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.personal_development}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                      <h4 className="font-bold text-red-800 mb-2">综合总结</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.life_guidance.overall_summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 现代应用建议 */}
        {analysisData.modern_applications && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Zap className="mr-2 h-6 w-6 text-yellow-600" />
                现代应用建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-bold text-red-800 mb-2">生活方式建议</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.modern_applications.lifestyle_recommendations}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-red-800 mb-2">职业策略</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.modern_applications.career_strategies}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-red-800 mb-2">人际关系建议</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.modern_applications.relationship_advice}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-bold text-red-800 mb-2">决策时机</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {analysisData.modern_applications.decision_making}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析报告尾部 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardContent className="text-center py-8">
            <div className="text-red-800">
              <p className="text-lg font-bold mb-2">专业八字命理分析报告</p>
              <p className="text-sm">分析日期：{analysisData.analysis_date ? new Date(analysisData.analysis_date).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN')}</p>
              <p className="text-xs mt-4 text-red-600">
                本报告基于传统四柱八字理论，结合现代命理学研究成果，为您提供专业的命理分析和人生指导。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteBaziAnalysis;