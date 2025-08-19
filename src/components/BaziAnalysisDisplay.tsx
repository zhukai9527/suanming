import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Star, BookOpen, Sparkles, User, BarChart3, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { localApi } from '../lib/localApi';

interface BaziAnalysisDisplayProps {
  birthDate: {
    date: string;
    time: string;
  };
}

interface BaziDetailsData {
  baziDetails: any;
  rizhu: any;
  summary: any;
  interpretation: any;
}

interface WuxingAnalysisData {
  bazi: any;
  wuxingCount: { [key: string]: number };
  wuxingPercentage: { [key: string]: number };
  wuxingWithStrength: Array<{ element: string; percentage: number; strength: string; count: number }>;
  radarData: Array<{ element: string; value: number; fullMark: number }>;
  balanceAnalysis: string;
  suggestions: string[];
  dominantElement: string;
  weakestElement: string;
  isBalanced: boolean;
}

const BaziAnalysisDisplay: React.FC<BaziAnalysisDisplayProps> = ({ birthDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baziDetailsData, setBaziDetailsData] = useState<BaziDetailsData | null>(null);
  const [wuxingAnalysisData, setWuxingAnalysisData] = useState<WuxingAnalysisData | null>(null);
  const [fullBaziAnalysisData, setFullBaziAnalysisData] = useState<any>(null);
  
  // 辅助方法
  const getBranchElement = (branch: string): string => {
    const branchElements: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchElements[branch] || '土';
  };
  
  const getStemYinYang = (stem: string): string => {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem) ? '阳' : '阴';
  };
  
  const getBranchYinYang = (branch: string): string => {
    const yangBranches = ['子', '寅', '辰', '午', '申', '戌'];
    return yangBranches.includes(branch) ? '阳' : '阴';
  };

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

  // 五行颜色样式配置
  const wuxingColors: { [key: string]: string } = {
    '木': 'text-green-600 bg-green-50 border-green-300',
    '火': 'text-red-600 bg-red-50 border-red-300',
    '土': 'text-yellow-600 bg-yellow-50 border-yellow-300',
    '金': 'text-gray-600 bg-gray-50 border-gray-300',
    '水': 'text-blue-600 bg-blue-50 border-blue-300'
  };

  // 阴阳颜色配置
  const yinyangColors: { [key: string]: string } = {
    '阳': 'text-orange-600 bg-orange-50 border-orange-300',
    '阴': 'text-purple-600 bg-purple-50 border-purple-300'
  };

  // 调用本地API
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const birthData = {
          name: '用户', // 默认名称
          birth_date: birthDate.date,
          birth_time: birthDate.time,
          gender: 'male' // 默认性别，后续可以从用户输入获取
        };

        // 调用八字分析API
        const baziResponse = await localApi.analysis.bazi(birthData);

        if (baziResponse.error) {
          throw new Error(baziResponse.error.message || '八字分析失败');
        }

        const analysisResult = baziResponse.data?.analysis;
        if (!analysisResult) {
          throw new Error('分析结果为空');
        }

        // 转换数据格式以适配现有的显示组件
        const baziChart = analysisResult.basic_info?.bazi_chart;
        const wuxingAnalysis = analysisResult.wuxing_analysis;
        
        if (baziChart) {
          // 构造八字详情数据
          const baziDetailsData = {
            baziDetails: {
              year: {
                tiangan: baziChart.year_pillar.stem,
                dizhi: baziChart.year_pillar.branch,
                tianganWuxing: baziChart.year_pillar.element,
                dizhiWuxing: getBranchElement(baziChart.year_pillar.branch),
                 tianganYinYang: getStemYinYang(baziChart.year_pillar.stem),
                 dizhiYinYang: getBranchYinYang(baziChart.year_pillar.branch),
                combination: `${baziChart.year_pillar.stem}${baziChart.year_pillar.branch}`,
                pillarName: '年柱'
              },
              month: {
                tiangan: baziChart.month_pillar.stem,
                dizhi: baziChart.month_pillar.branch,
                tianganWuxing: baziChart.month_pillar.element,
                dizhiWuxing: getBranchElement(baziChart.month_pillar.branch),
                 tianganYinYang: getStemYinYang(baziChart.month_pillar.stem),
                 dizhiYinYang: getBranchYinYang(baziChart.month_pillar.branch),
                combination: `${baziChart.month_pillar.stem}${baziChart.month_pillar.branch}`,
                pillarName: '月柱'
              },
              day: {
                tiangan: baziChart.day_pillar.stem,
                dizhi: baziChart.day_pillar.branch,
                tianganWuxing: baziChart.day_pillar.element,
                dizhiWuxing: getBranchElement(baziChart.day_pillar.branch),
                 tianganYinYang: getStemYinYang(baziChart.day_pillar.stem),
                 dizhiYinYang: getBranchYinYang(baziChart.day_pillar.branch),
                combination: `${baziChart.day_pillar.stem}${baziChart.day_pillar.branch}`,
                pillarName: '日柱'
              },
              hour: {
                tiangan: baziChart.hour_pillar.stem,
                dizhi: baziChart.hour_pillar.branch,
                tianganWuxing: baziChart.hour_pillar.element,
                dizhiWuxing: getBranchElement(baziChart.hour_pillar.branch),
                 tianganYinYang: getStemYinYang(baziChart.hour_pillar.stem),
                 dizhiYinYang: getBranchYinYang(baziChart.hour_pillar.branch),
                combination: `${baziChart.hour_pillar.stem}${baziChart.hour_pillar.branch}`,
                pillarName: '时柱'
              }
            },
            rizhu: {
              tiangan: baziChart.day_master,
              wuxing: baziChart.day_master_element,
              yinyang: getStemYinYang(baziChart.day_master),
              description: `日主${baziChart.day_master}，${baziChart.day_master_element}命`
            },
            summary: {
              fullBazi: baziChart.complete_chart,
              birthInfo: {
                solarDate: birthDate.date,
                birthTime: birthDate.time
              }
            },
            interpretation: {
              overall: wuxingAnalysis?.detailed_analysis || '八字分析结果'
            }
          };
          setBaziDetailsData(baziDetailsData);
        }
        
        if (wuxingAnalysis) {
          // 构造五行分析数据
          const elements = wuxingAnalysis.distribution || {};
          const total = Object.values(elements).reduce((sum: number, count: any) => sum + (typeof count === 'number' ? count : 0), 0) as number;
          
          const wuxingData = {
            bazi: baziChart,
            wuxingCount: elements,
            wuxingPercentage: Object.fromEntries(
              Object.entries(elements).map(([key, value]) => {
                const numValue = typeof value === 'number' ? value : 0;
                return [key, total > 0 ? Math.round((numValue / total) * 100) : 0];
              })
            ),
            wuxingWithStrength: Object.entries(elements).map(([element, count]) => {
              const numCount = typeof count === 'number' ? count : 0;
              return {
                element,
                count: numCount,
                percentage: total > 0 ? Math.round((numCount / total) * 100) : 0,
                strength: numCount >= 3 ? '旺' : numCount >= 2 ? '中' : '弱'
              };
            }),
            radarData: Object.entries(elements).map(([element, count]) => {
              const numCount = typeof count === 'number' ? count : 0;
              return {
                element,
                value: numCount,
                fullMark: 5
              };
            }),
            balanceAnalysis: wuxingAnalysis.detailed_analysis || '五行分析',
            suggestions: [wuxingAnalysis.improvement_suggestions || '建议保持平衡'],
            dominantElement: Object.entries(elements).reduce((a, b) => (elements[a[0]] as number) > (elements[b[0]] as number) ? a : b)[0],
            weakestElement: Object.entries(elements).reduce((a, b) => (elements[a[0]] as number) < (elements[b[0]] as number) ? a : b)[0],
            isBalanced: Math.max(...Object.values(elements) as number[]) - Math.min(...Object.values(elements) as number[]) <= 2
          };
          setWuxingAnalysisData(wuxingData);
        }
        
        // 设置完整分析数据 - 使用真实的后端分析结果
        setFullBaziAnalysisData({
          basic_info: analysisResult.basic_info || {},
          geju_analysis: analysisResult.geju_analysis || {},
          dayun_analysis: analysisResult.dayun_analysis || {},
          life_guidance: analysisResult.life_guidance || {},
          modern_applications: analysisResult.modern_applications || {}
        });
      } catch (err) {
        console.error('获取分析数据出错:', err);
        setError(err instanceof Error ? err.message : '分析数据获取失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    if (birthDate?.date) {
      fetchAnalysisData();
    }
  }, [birthDate]);

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <Card className="chinese-card-decoration border-2 border-yellow-400 p-8">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-2">正在分析您的八字命理</h3>
            <p className="text-red-600">请稍候，正在获取您的详细分析结果...</p>
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

  // 如果没有数据，显示错误
  if (!baziDetailsData || !wuxingAnalysisData || !fullBaziAnalysisData) {
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

  // 渲染雷达图
  const renderRadarChart = () => {
    if (!wuxingAnalysisData?.radarData) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={wuxingAnalysisData.radarData}>
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
    if (!wuxingAnalysisData?.wuxingWithStrength) return null;

    return (
      <div className="grid grid-cols-5 gap-4">
        {wuxingAnalysisData.wuxingWithStrength.map((item) => (
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
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
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

  // 渲染四柱信息卡片
  const renderPillarCard = (pillar: any, index: number) => {
    const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
    const pillarDescriptions = [
      '代表祖辈与早年运势',
      '代表父母与青年运势', 
      '代表自身与配偶',
      '代表子女与晚年运势'
    ];

    if (!pillar) return null;

    return (
      <Card key={index} className="chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
        <CardHeader className="text-center">
          <CardTitle className="text-red-800 text-xl font-bold chinese-text-shadow">
            {pillarNames[index]}
          </CardTitle>
          <p className="text-red-600 text-sm">{pillarDescriptions[index]}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 天干地支大显示 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-800 chinese-text-shadow mb-2">
              {pillar.combination}
            </div>
            <div className="text-sm text-gray-600">
              {pillar.tiangan} ({pillar.tianganYinYang}) + {pillar.dizhi} ({pillar.dizhiYinYang})
            </div>
          </div>

          {/* 天干信息 */}
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg p-3">
            <h4 className="font-bold text-red-700 mb-2">天干：{pillar.tiangan}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className={`px-2 py-1 rounded border ${wuxingColors[pillar.tianganWuxing]}`}>
                五行：{pillar.tianganWuxing}
              </div>
              <div className={`px-2 py-1 rounded border ${yinyangColors[pillar.tianganYinYang]}`}>
                阴阳：{pillar.tianganYinYang}
              </div>
            </div>
          </div>

          {/* 地支信息 */}
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-lg p-3">
            <h4 className="font-bold text-red-700 mb-2">地支：{pillar.dizhi}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className={`px-2 py-1 rounded border ${wuxingColors[pillar.dizhiWuxing]}`}>
                五行：{pillar.dizhiWuxing}
              </div>
              <div className={`px-2 py-1 rounded border ${yinyangColors[pillar.dizhiYinYang]}`}>
                阴阳：{pillar.dizhiYinYang}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 relative bg-gradient-to-br from-red-50 to-yellow-50 min-h-screen p-4">
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

      <div className="max-w-7xl mx-auto">
        {/* 八字概览 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
              八字命理综合分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-red-800 chinese-text-shadow mb-4">
                  {baziDetailsData?.summary?.fullBazi || '八字排盘'}
                </h3>
                <p className="text-red-600 text-lg mb-4">
                  出生日期：{birthDate.date} {birthDate.time}
                </p>
                <p className="text-red-700 leading-relaxed">
                  {baziDetailsData?.interpretation?.overall || '根据您的八字，显示出独特的命理特征。'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 日主信息 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
              <User className="mr-2 h-6 w-6 text-yellow-600" />
              日主信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-red-800 chinese-text-shadow mb-4">
                  {baziDetailsData?.rizhu?.tiangan || '未知'}
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className={`px-4 py-2 rounded-lg border-2 ${wuxingColors[baziDetailsData?.rizhu?.wuxing || '土']}`}>
                    <span className="font-bold">五行：{baziDetailsData?.rizhu?.wuxing || '未知'}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border-2 ${yinyangColors[baziDetailsData?.rizhu?.yinyang || '阳']}`}>
                    <span className="font-bold">阴阳：{baziDetailsData?.rizhu?.yinyang || '未知'}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg border-2 bg-indigo-50 border-indigo-300 text-indigo-700">
                    <span className="font-bold">日主</span>
                  </div>
                </div>
                <p className="text-red-700 leading-relaxed">
                  {baziDetailsData?.rizhu?.description || '日主特征体现了您的核心性格。'}
                </p>
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
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {baziDetailsData?.summary?.pillars?.map((pillar: any, index: number) => 
                renderPillarCard(pillar, index)
              )}
            </div>
            <div className="mt-6 space-y-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-bold text-red-800 mb-2">年柱解读</h4>
                <p className="text-red-700">{baziDetailsData?.interpretation?.yearPillar || '年柱代表祖辈与早年运势。'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-red-800 mb-2">月柱解读</h4>
                <p className="text-red-700">{baziDetailsData?.interpretation?.monthPillar || '月柱代表父母与青年运势。'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-bold text-red-800 mb-2">日柱解读</h4>
                <p className="text-red-700">{baziDetailsData?.interpretation?.dayPillar || '日柱代表自身与配偶。'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-bold text-red-800 mb-2">时柱解读</h4>
                <p className="text-red-700">{baziDetailsData?.interpretation?.hourPillar || '时柱代表子女与晚年运势。'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 五行能量分布 */}
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

        {/* 五行平衡雷达图 */}
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

        {/* 五行平衡分析 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
              <Zap className="mr-2 h-6 w-6 text-yellow-600" />
              五行平衡分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-bold text-red-800 mb-2">五行平衡状况</h4>
                  <p className="text-red-700 leading-relaxed">
                    {wuxingAnalysisData?.balanceAnalysis || '您的五行分布显示了独特的能量特征。'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-bold text-red-800 mb-2">调和建议</h4>
                  <div className="text-red-700 leading-relaxed">
                    {wuxingAnalysisData?.suggestions?.map((suggestion: string, index: number) => (
                      <p key={index} className="mb-2">• {suggestion}</p>
                    )) || <p>建议通过特定的方式来平衡五行能量。</p>}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-red-800 mb-2">五行特征总结</h4>
                  <p className="text-red-700 leading-relaxed">
                    您的主导元素是 <span className="font-bold">{wuxingAnalysisData?.dominantElement}</span>，
                    最弱元素是 <span className="font-bold">{wuxingAnalysisData?.weakestElement}</span>。
                    五行平衡状态：{wuxingAnalysisData?.isBalanced ? '较为均衡' : '需要调节'}。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 格局分析 */}
        {fullBaziAnalysisData && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-600" />
                格局分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                    <h4 className="font-bold text-red-800 mb-2">格局类型：{fullBaziAnalysisData.geju_analysis?.pattern_type}</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis?.characteristics}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">适宜发展路径</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis?.career_path}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-red-800 mb-2">人生含义</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis?.life_meaning}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 格局分析 */}
        {fullBaziAnalysisData?.geju_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-600" />
                格局分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-red-800 mb-2">格局类型</h4>
                    <p className="text-red-700 leading-relaxed">
                      <span className="font-semibold">{fullBaziAnalysisData.geju_analysis.pattern_type}</span>
                      （强度：{fullBaziAnalysisData.geju_analysis.pattern_strength}）
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">格局特征</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis.characteristics}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">适合职业</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis.career_path}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-red-800 mb-2">人生意义</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.geju_analysis.life_meaning}
                    </p>
                  </div>
                  {fullBaziAnalysisData.geju_analysis.development_strategy && (
                    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold text-red-800 mb-2">发展策略</h4>
                      <p className="text-red-700 leading-relaxed">
                        {fullBaziAnalysisData.geju_analysis.development_strategy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 四柱详细解释 */}
        {fullBaziAnalysisData?.basic_info?.pillar_interpretations && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-yellow-600" />
                四柱详细解释
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-red-800 mb-2">年柱解释</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {fullBaziAnalysisData.basic_info.pillar_interpretations.year_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">月柱解释</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {fullBaziAnalysisData.basic_info.pillar_interpretations.month_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">日柱解释</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {fullBaziAnalysisData.basic_info.pillar_interpretations.day_pillar}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-red-800 mb-2">时柱解释</h4>
                    <p className="text-red-700 leading-relaxed text-sm">
                      {fullBaziAnalysisData.basic_info.pillar_interpretations.hour_pillar}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 大运流年分析 */}
        {fullBaziAnalysisData?.dayun_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-yellow-600" />
                大运流年分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-bold text-red-800 mb-2">起运信息</h4>
                    <p className="text-red-700 leading-relaxed">
                      起运年龄：{fullBaziAnalysisData.dayun_analysis?.start_luck_age}岁
                    </p>
                    <p className="text-red-700 leading-relaxed">
                      当前大运：{fullBaziAnalysisData.dayun_analysis?.current_dayun?.ganzhi || '未起运'}
                      {fullBaziAnalysisData.dayun_analysis?.current_dayun && 
                        `（${fullBaziAnalysisData.dayun_analysis.current_dayun.start_age}-${fullBaziAnalysisData.dayun_analysis.current_dayun.end_age}岁）`
                      }
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">大运影响</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.dayun_analysis?.dayun_influence}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">流年分析</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.dayun_analysis?.yearly_fortune}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-red-800 mb-2">未来展望</h4>
                    <p className="text-red-700 leading-relaxed">
                      {fullBaziAnalysisData.dayun_analysis?.future_outlook}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 详细流年分析 */}
        {fullBaziAnalysisData?.dayun_analysis?.detailed_yearly_analysis && (
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
                  {fullBaziAnalysisData.dayun_analysis.detailed_yearly_analysis.map((yearData: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-2 border-yellow-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-red-800 text-lg">
                          {yearData.year}年（{yearData.age}岁）{yearData.year_ganzhi}
                        </h4>
                        <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                          {yearData.year_ten_god}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="border-l-4 border-blue-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">整体运势</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.overall_fortune}</p>
                          </div>
                          <div className="border-l-4 border-green-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">事业运势</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.career_fortune}</p>
                          </div>
                          <div className="border-l-4 border-yellow-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">财运分析</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.wealth_fortune}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="border-l-4 border-pink-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">感情运势</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.relationship_fortune}</p>
                          </div>
                          <div className="border-l-4 border-purple-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">健康提醒</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.health_fortune}</p>
                          </div>
                          <div className="border-l-4 border-orange-400 pl-3">
                            <h5 className="font-semibold text-red-800 text-sm">关键建议</h5>
                            <p className="text-red-700 text-xs leading-relaxed">{yearData.key_advice}</p>
                          </div>
                        </div>
                      </div>
                      {yearData.monthly_highlights && yearData.monthly_highlights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <h5 className="font-semibold text-red-800 text-sm mb-2">月度重点</h5>
                          <div className="space-y-1">
                            {yearData.monthly_highlights.map((highlight: string, hIndex: number) => (
                              <p key={hIndex} className="text-red-700 text-xs">• {highlight}</p>
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
        {fullBaziAnalysisData && (
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
                        {fullBaziAnalysisData.life_guidance?.career_development}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                      <h4 className="font-bold text-red-800 mb-2">感情婚姻</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.life_guidance?.marriage_relationships}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-red-800 mb-2">健康养生</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.life_guidance?.health_wellness}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold text-red-800 mb-2">财富管理</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.life_guidance?.wealth_guidance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 现代应用建议 */}
        {fullBaziAnalysisData?.modern_applications && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-yellow-600" />
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
                        {fullBaziAnalysisData.modern_applications.lifestyle_recommendations}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-red-800 mb-2">职业策略</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.modern_applications.career_strategies}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-red-800 mb-2">人际关系建议</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.modern_applications.relationship_advice}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-bold text-red-800 mb-2">决策时机</h4>
                      <p className="text-red-700 leading-relaxed text-sm">
                        {fullBaziAnalysisData.modern_applications.decision_making}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 人生指导建议 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-yellow-600" />
              人生指导建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-red-800 mb-2">性格特征</h4>
                  <p className="text-red-700 leading-relaxed">
                    {baziDetailsData?.rizhu?.meaning || '您的性格特征体现在日主的特质中。'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-red-800 mb-2">整体运势</h4>
                  <p className="text-red-700 leading-relaxed">
                    根据您的八字排盘分析，建议您在人生的不同阶段关注相应的发展重点。
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-bold text-red-800 mb-2">平衡发展</h4>
                  <p className="text-red-700 leading-relaxed">
                    结合五行分析和八字特征，建议您在生活中注重五行的平衡发展，
                    以达到身心健康和事业顺利的最佳状态。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BaziAnalysisDisplay;