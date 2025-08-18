import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Star, BookOpen, Sparkles, User, BarChart3, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ComprehensiveBaziAnalysisProps {
  analysisResult: any;
}

const ComprehensiveBaziAnalysis: React.FC<ComprehensiveBaziAnalysisProps> = ({ analysisResult }) => {
  // 安全获取数据的辅助函数
  const safeGet = (obj: any, path: string, defaultValue: any = '暂无数据') => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    return current || defaultValue;
  };

  // 处理新的数据结构: { type: 'bazi', data: analysisResult }
  const data = analysisResult?.data || analysisResult;
  
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

  // 生成五行雷达图数据
  const generateRadarData = () => {
    const elementDistribution = safeGet(data, 'wuxing_analysis.element_distribution', { '木': 1, '火': 1, '土': 2, '金': 2, '水': 2 }) as Record<string, number>;
    const total = Object.values(elementDistribution).reduce((a, b) => a + (Number(b) || 0), 0);
    
    return Object.entries(elementDistribution).map(([element, count]) => ({
      element,
      value: total > 0 ? Math.round(((Number(count) || 0) / total) * 100) : 20,
      fullMark: 100
    }));
  };

  // 生成五行统计卡片数据
  const generateElementCards = () => {
    const elementDistribution = safeGet(data, 'wuxing_analysis.element_distribution', { '木': 1, '火': 1, '土': 2, '金': 2, '水': 2 }) as Record<string, number>;
    const total = Object.values(elementDistribution).reduce((a, b) => a + (Number(b) || 0), 0);
    
    return Object.entries(elementDistribution).map(([element, count]) => {
      const percentage = total > 0 ? Math.round(((Number(count) || 0) / total) * 100) : 20;
      let strength = '中';
      if (percentage >= 30) strength = '旺';
      else if (percentage <= 10) strength = '弱';
      
      return {
        element,
        count: Number(count) || 0,
        percentage,
        strength
      };
    });
  };

  // 生成四柱信息
  const generatePillarInfo = () => {
    const baziChart = safeGet(data, 'basic_info.bazi_chart', {});
    return {
      year: {
        tiangan: safeGet(baziChart, 'year_pillar.stem', '甲'),
        dizhi: safeGet(baziChart, 'year_pillar.branch', '子'),
        tianganWuxing: getElementFromStem(safeGet(baziChart, 'year_pillar.stem', '甲')),
        dizhiWuxing: getBranchElement(safeGet(baziChart, 'year_pillar.branch', '子')),
        tianganYinYang: getYinYangFromStem(safeGet(baziChart, 'year_pillar.stem', '甲')),
        dizhiYinYang: getYinYangFromBranch(safeGet(baziChart, 'year_pillar.branch', '子')),
        combination: safeGet(baziChart, 'year_pillar.stem', '甲') + safeGet(baziChart, 'year_pillar.branch', '子')
      },
      month: {
        tiangan: safeGet(baziChart, 'month_pillar.stem', '乙'),
        dizhi: safeGet(baziChart, 'month_pillar.branch', '丑'),
        tianganWuxing: getElementFromStem(safeGet(baziChart, 'month_pillar.stem', '乙')),
        dizhiWuxing: getBranchElement(safeGet(baziChart, 'month_pillar.branch', '丑')),
        tianganYinYang: getYinYangFromStem(safeGet(baziChart, 'month_pillar.stem', '乙')),
        dizhiYinYang: getYinYangFromBranch(safeGet(baziChart, 'month_pillar.branch', '丑')),
        combination: safeGet(baziChart, 'month_pillar.stem', '乙') + safeGet(baziChart, 'month_pillar.branch', '丑')
      },
      day: {
        tiangan: safeGet(baziChart, 'day_pillar.stem', '丙'),
        dizhi: safeGet(baziChart, 'day_pillar.branch', '寅'),
        tianganWuxing: getElementFromStem(safeGet(baziChart, 'day_pillar.stem', '丙')),
        dizhiWuxing: getBranchElement(safeGet(baziChart, 'day_pillar.branch', '寅')),
        tianganYinYang: getYinYangFromStem(safeGet(baziChart, 'day_pillar.stem', '丙')),
        dizhiYinYang: getYinYangFromBranch(safeGet(baziChart, 'day_pillar.branch', '寅')),
        combination: safeGet(baziChart, 'day_pillar.stem', '丙') + safeGet(baziChart, 'day_pillar.branch', '寅')
      },
      hour: {
        tiangan: safeGet(baziChart, 'hour_pillar.stem', '丁'),
        dizhi: safeGet(baziChart, 'hour_pillar.branch', '卯'),
        tianganWuxing: getElementFromStem(safeGet(baziChart, 'hour_pillar.stem', '丁')),
        dizhiWuxing: getBranchElement(safeGet(baziChart, 'hour_pillar.branch', '卯')),
        tianganYinYang: getYinYangFromStem(safeGet(baziChart, 'hour_pillar.stem', '丁')),
        dizhiYinYang: getYinYangFromBranch(safeGet(baziChart, 'hour_pillar.branch', '卯')),
        combination: safeGet(baziChart, 'hour_pillar.stem', '丁') + safeGet(baziChart, 'hour_pillar.branch', '卯')
      }
    };
  };

  // 辅助函数：获取天干五行
  const getElementFromStem = (stem: string): string => {
    const stemElements: { [key: string]: string } = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };
    return stemElements[stem] || '土';
  };

  // 辅助函数：获取地支五行
  const getBranchElement = (branch: string): string => {
    const branchElements: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchElements[branch] || '土';
  };

  // 辅助函数：获取天干阴阳
  const getYinYangFromStem = (stem: string): string => {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem) ? '阳' : '阴';
  };

  // 辅助函数：获取地支阴阳
  const getYinYangFromBranch = (branch: string): string => {
    const yangBranches = ['子', '寅', '辰', '午', '申', '戌'];
    return yangBranches.includes(branch) ? '阳' : '阴';
  };

  // 渲染雷达图
  const renderRadarChart = () => {
    const radarData = generateRadarData();

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
    const elementData = generateElementCards();

    return (
      <div className="grid grid-cols-5 gap-4">
        {elementData.map((item) => (
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
            <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="grid grid-cols-2 gap-2 text-sm">
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

  const personalData = safeGet(data, 'basic_info.personal_data', {});
  const baziChart = safeGet(data, 'basic_info.bazi_chart', {});
  const pillarInfo = generatePillarInfo();

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

      {/* 八字概览 */}
      <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
            八字概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-red-800 chinese-text-shadow mb-4">
                {safeGet(baziChart, 'complete_chart', '甲子 乙丑 丙寅 丁卯')}
              </h3>
              <p className="text-red-600 text-lg mb-4">
                {personalData.name ? `${personalData.name} ` : ''}出生日期：{personalData.birth_date || '未知'} {personalData.birth_time || '未知'}
              </p>
              <p className="text-red-700 leading-relaxed">
                {safeGet(data, 'life_guidance.overall_summary', '根据您的八字，显示出独特的命理特征...')}
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
                {safeGet(baziChart, 'day_master', '丙')}
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className={`px-4 py-2 rounded-lg border-2 ${wuxingColors[getElementFromStem(safeGet(baziChart, 'day_master', '丙'))]}`}>
                  <span className="font-bold">五行：{getElementFromStem(safeGet(baziChart, 'day_master', '丙'))}</span>
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 ${yinyangColors[getYinYangFromStem(safeGet(baziChart, 'day_master', '丙'))]}`}>
                  <span className="font-bold">阴阳：{getYinYangFromStem(safeGet(baziChart, 'day_master', '丙'))}</span>
                </div>
                <div className="px-4 py-2 rounded-lg border-2 bg-indigo-50 border-indigo-300 text-indigo-700">
                  <span className="font-bold">格局：{safeGet(data, 'geju_analysis.pattern_type', '正格')}</span>
                </div>
              </div>
              <p className="text-red-700 leading-relaxed">
                {safeGet(data, 'wuxing_analysis.personality_traits', '您的日主特征体现了独特的性格魅力...')}
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
            {[pillarInfo.year, pillarInfo.month, pillarInfo.day, pillarInfo.hour].map((pillar, index) => 
              renderPillarCard(pillar, index)
            )}
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
                  {safeGet(data, 'wuxing_analysis.balance_analysis', '您的五行分布显示了独特的能量特征...')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-red-800 mb-2">调和建议</h4>
                <p className="text-red-700 leading-relaxed">
                  {safeGet(data, 'wuxing_analysis.improvement_suggestions', '建议通过特定的方式来平衡五行能量...')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 格局分析与建议 */}
      <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-yellow-600" />
            格局分析与人生指导
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-bold text-red-800 mb-2">格局特征</h4>
                <p className="text-red-700 leading-relaxed">
                  {safeGet(data, 'geju_analysis.characteristics', '您的八字格局显示了独特的命理特征...')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-bold text-red-800 mb-2">事业发展</h4>
                <p className="text-red-700 leading-relaxed">
                  {safeGet(data, 'life_guidance.career_development', '在事业发展方面，您适合...')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                <h4 className="font-bold text-red-800 mb-2">感情婚姻</h4>
                <p className="text-red-700 leading-relaxed">
                  {safeGet(data, 'life_guidance.marriage_relationships', '在感情方面，您的特点是...')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-bold text-red-800 mb-2">健康养生</h4>
                <p className="text-red-700 leading-relaxed">
                  {safeGet(data, 'life_guidance.health_wellness', '健康方面需要注意...')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveBaziAnalysis;