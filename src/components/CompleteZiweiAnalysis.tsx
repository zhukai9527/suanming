import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Star, BookOpen, Sparkles, User, BarChart3, Zap, TrendingUp, Loader2, Clock, Target, Heart, DollarSign, Activity, Crown, Compass, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { localApi } from '../lib/localApi';

interface CompleteZiweiAnalysisProps {
  birthDate: {
    date: string;
    time: string;
    name?: string;
    gender?: string;
  };
  analysisData?: any; // 可选的预先分析的数据
}

const CompleteZiweiAnalysis: React.FC<CompleteZiweiAnalysisProps> = ({ birthDate, analysisData: propAnalysisData }) => {
  const [isLoading, setIsLoading] = useState(!propAnalysisData);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(propAnalysisData || null);

  // 四化飞星详细解释
  const sihuaExplanations = {
    '化禄': {
      concept: '化禄是四化之首，主财禄、享受、缘分',
      influence: '增强星曜的正面能量，带来财运、人缘和享受，代表得到、收获和满足',
      application: '化禄星所在宫位通常是您的幸运领域，容易获得成功和满足感',
      timing: '大限或流年遇化禄，主该时期财运亨通，事业顺利，人际关系和谐'
    },
    '化权': {
      concept: '化权主权力、地位、能力的发挥',
      influence: '增强星曜的权威性和主导力，带来领导机会、权力地位和成就感',
      application: '化权星所在宫位是您容易掌控和发挥影响力的领域',
      timing: '大限或流年遇化权，主该时期权力增长，地位提升，能力得到认可'
    },
    '化科': {
      concept: '化科主名声、学业、贵人和文书',
      influence: '增强星曜的声誉和学习能力，带来名声、考试运和贵人相助',
      application: '化科星所在宫位是您容易获得名声和学习成就的领域',
      timing: '大限或流年遇化科，主该时期名声远播，学业有成，贵人运旺'
    },
    '化忌': {
      concept: '化忌主阻碍、困扰、执着和变化',
      influence: '增强星曜的负面特质，带来阻碍、烦恼，但也促使变化和成长',
      application: '化忌星所在宫位需要特别注意，容易遇到挫折，但也是成长的机会',
      timing: '大限或流年遇化忌，主该时期需谨慎行事，可能有变动，但危机中有转机'
    }
  };

  // 大限宫位解释
  const majorPeriodPalaceExplanations: { [key: string]: { focus: string; opportunities: string; challenges: string; advice: string } } = {
    '命宫': {
      focus: '个人发展、性格展现、人生方向',
      opportunities: '自我提升、个人魅力增强、人生新方向的确立',
      challenges: '可能面临身份转换、性格调整的压力',
      advice: '专注于自我完善，建立正确的人生观和价值观'
    },
    '兄弟宫': {
      focus: '人际关系、合作伙伴、朋友圈子',
      opportunities: '结交新朋友、建立合作关系、团队协作成功',
      challenges: '可能与朋友产生分歧、合作关系不稳定',
      advice: '重视友情，学会与人合作，建立良好的人际网络'
    },
    '夫妻宫': {
      focus: '婚姻感情、配偶关系、合作伙伴',
      opportunities: '感情生活美满、婚姻幸福、合作成功',
      challenges: '可能面临感情波折、婚姻考验',
      advice: '用心经营感情，学会包容和理解，重视沟通'
    },
    '子女宫': {
      focus: '子女教育、创造力、部属关系',
      opportunities: '子女有成就、创意发挥、领导能力提升',
      challenges: '子女教育问题、创意受阻、管理困难',
      advice: '关注子女成长，发挥创造潜能，培养领导才能'
    },
    '财帛宫': {
      focus: '财运发展、理财能力、物质享受',
      opportunities: '财运亨通、投资获利、物质生活改善',
      challenges: '可能面临财务压力、投资风险',
      advice: '谨慎理财，稳健投资，避免过度消费'
    },
    '疾厄宫': {
      focus: '健康状况、意外灾厄、身体调养',
      opportunities: '身体健康改善、疾病康复、养生有成',
      challenges: '可能面临健康问题、意外事故',
      advice: '注重健康养生，定期体检，避免过度劳累'
    },
    '迁移宫': {
      focus: '外出发展、环境变化、人际拓展',
      opportunities: '外出发展顺利、环境改善、人脉扩展',
      challenges: '可能面临环境适应问题、外出不利',
      advice: '积极适应环境变化，把握外出发展机会'
    },
    '交友宫': {
      focus: '朋友关系、社交活动、人脉建立',
      opportunities: '朋友相助、社交成功、人脉广阔',
      challenges: '可能遇到损友、社交困扰',
      advice: '慎选朋友，积极参与社交活动，建立良好人脉'
    },
    '事业宫': {
      focus: '事业发展、工作状况、社会地位',
      opportunities: '事业成功、升职加薪、地位提升',
      challenges: '可能面临工作压力、事业瓶颈',
      advice: '专注事业发展，提升专业能力，把握机遇'
    },
    '田宅宫': {
      focus: '不动产、居住环境、家庭财产',
      opportunities: '置业成功、居住环境改善、家产增加',
      challenges: '可能面临房产问题、居住不稳',
      advice: '谨慎投资房产，改善居住环境，重视家庭和谐'
    },
    '福德宫': {
      focus: '精神享受、兴趣爱好、内心满足',
      opportunities: '精神富足、兴趣发展、内心平静',
      challenges: '可能面临精神压力、兴趣受阻',
      advice: '培养健康兴趣，追求精神满足，保持心理平衡'
    },
    '父母宫': {
      focus: '父母关系、长辈缘分、权威关系',
      opportunities: '父母健康、长辈相助、权威认可',
      challenges: '可能面临长辈健康问题、权威冲突',
      advice: '孝顺父母，尊重长辈，处理好权威关系'
    }
  };

  // 主星详细解释
  const starExplanations: { [key: string]: { nature: string; personality: string; career: string; fortune: string } } = {
    '紫微': {
      nature: '帝王星，紫微斗数中的主星之首',
      personality: '具有领导才能，天生贵气，自尊心强，喜欢受人尊敬，有组织管理能力',
      career: '适合担任领导职务，在政府机关、大企业或自主创业方面有优势',
      fortune: '一生多贵人相助，财运稳定，晚年富贵'
    },
    '天机': {
      nature: '智慧星，主聪明机智',
      personality: '思维敏捷，善于策划，喜欢思考，具有很强的分析能力和应变能力',
      career: '适合从事需要智慧的工作，如咨询、策划、教育、科研等',
      fortune: '财运起伏较大，需要通过智慧理财，中年后财运渐佳'
    },
    '太阳': {
      nature: '光明星，主权威和名声',
      personality: '性格开朗，光明磊落，具有正义感，喜欢帮助他人，有很强的表现欲',
      career: '适合公职、教育、传媒等需要权威性和影响力的工作',
      fortune: '财运与名声相关，通过正当途径获得财富，中年发达'
    },
    '武曲': {
      nature: '财星，主财富和意志力',
      personality: '意志坚强，执行力强，重视物质，有很强的赚钱能力和理财观念',
      career: '适合金融、投资、工程、技术等需要专业技能的工作',
      fortune: '天生财运佳，善于理财投资，一生不缺钱财'
    },
    '天同': {
      nature: '福星，主享受和人缘',
      personality: '性格温和，人缘好，喜欢享受生活，有很强的亲和力和包容心',
      career: '适合服务业、娱乐业、餐饮业等需要人际交往的工作',
      fortune: '财运平稳，多通过人脉关系获得财富，晚年享福'
    },
    '廉贞': {
      nature: '囚星，主感情和艺术',
      personality: '感情丰富，有艺术天分，追求完美，但情绪波动较大，容易钻牛角尖',
      career: '适合艺术、设计、娱乐、美容等创意性工作',
      fortune: '财运与感情和创意相关，需要发挥艺术才能获得财富'
    },
    '天府': {
      nature: '库星，主稳重和积累',
      personality: '稳重可靠，有很强的组织能力，善于积累，注重安全感',
      career: '适合管理、行政、金融、房地产等稳定性工作',
      fortune: '财运稳定，善于积累财富，一生衣食无忧'
    },
    '太阴': {
      nature: '母星，主细腻和直觉',
      personality: '细腻敏感，直觉力强，善于照顾他人，但有时过于敏感和多疑',
      career: '适合教育、医疗、服务、文艺等需要细心和耐心的工作',
      fortune: '财运与女性或家庭相关，通过细心经营获得财富'
    },
    '贪狼': {
      nature: '欲望星，主多才多艺',
      personality: '多才多艺，善于交际，欲望强烈，喜欢新鲜事物，但容易三心二意',
      career: '适合销售、娱乐、旅游、外贸等需要交际能力的工作',
      fortune: '财运多变，机会很多，但需要专注才能获得稳定财富'
    },
    '巨门': {
      nature: '暗星，主口才和分析',
      personality: '口才好，分析力强，善于发现问题，但有时过于挑剔和多疑',
      career: '适合律师、记者、教师、研究等需要口才和分析能力的工作',
      fortune: '财运需要通过专业技能获得，中年后财运较佳'
    },
    '天相': {
      nature: '印星，主忠诚和协调',
      personality: '忠诚可靠，协调能力强，善于辅助他人，但有时缺乏主见',
      career: '适合秘书、助理、公务员、顾问等辅助性工作',
      fortune: '财运稳定，多通过辅助他人获得财富，一生平稳'
    },
    '天梁': {
      nature: '寿星，主正直和长者风范',
      personality: '正直善良，有长者风范，喜欢帮助他人，具有很强的责任感',
      career: '适合教育、公益、医疗、宗教等需要奉献精神的工作',
      fortune: '财运与德行相关，通过正当途径获得财富，晚年富足'
    },
    '七杀': {
      nature: '将星，主冲劲和开拓',
      personality: '冲劲十足，勇于开拓，不怕困难，但有时过于冲动和急躁',
      career: '适合军警、体育、创业、销售等需要冲劲的工作',
      fortune: '财运起伏较大，需要通过努力奋斗获得财富'
    },
    '破军': {
      nature: '耗星，主变化和创新',
      personality: '喜欢变化，勇于创新，不满足现状，但有时过于冲动和破坏性',
      career: '适合创新、改革、艺术、科技等需要突破的工作',
      fortune: '财运变化很大，需要通过创新获得财富，晚年较佳'
    }
  };

  // 星曜颜色配置
  const starColors: { [key: string]: string } = {
    '紫微': 'bg-purple-100 text-purple-800 border-purple-300',
    '天机': 'bg-blue-100 text-blue-800 border-blue-300',
    '太阳': 'bg-orange-100 text-orange-800 border-orange-300',
    '武曲': 'bg-gray-100 text-gray-800 border-gray-300',
    '天同': 'bg-green-100 text-green-800 border-green-300',
    '廉贞': 'bg-red-100 text-red-800 border-red-300',
    '天府': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    '太阴': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    '贪狼': 'bg-pink-100 text-pink-800 border-pink-300',
    '巨门': 'bg-slate-100 text-slate-800 border-slate-300',
    '天相': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    '天梁': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    '七杀': 'bg-rose-100 text-rose-800 border-rose-300',
    '破军': 'bg-amber-100 text-amber-800 border-amber-300'
  };

  // 吉星煞星颜色配置
  const luckyStarColors = 'bg-green-50 text-green-700 border-green-200';
  const unluckyStarColors = 'bg-red-50 text-red-700 border-red-200';

  // 宫位强度颜色
  const strengthColors: { [key: string]: string } = {
    '旺': 'text-green-600 bg-green-50',
    '得地': 'text-blue-600 bg-blue-50',
    '平': 'text-yellow-600 bg-yellow-50',
    '不得地': 'text-orange-600 bg-orange-50',
    '陷': 'text-red-600 bg-red-50'
  };

  // 五行局颜色
  const wuxingJuColors: { [key: string]: string } = {
    '水二局': 'text-blue-700 bg-blue-100',
    '木三局': 'text-green-700 bg-green-100',
    '金四局': 'text-gray-700 bg-gray-100',
    '土五局': 'text-yellow-700 bg-yellow-100',
    '火六局': 'text-red-700 bg-red-100'
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

        const ziweiResponse = await localApi.analysis.ziwei(birthData);

        if (ziweiResponse.error) {
          throw new Error(ziweiResponse.error.message || '紫微斗数分析失败');
        }

        const analysisResult = ziweiResponse.data?.analysis;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Card className="chinese-card-decoration border-2 border-purple-400 p-8">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-800 mb-2">正在进行专业紫微斗数分析</h3>
            <p className="text-purple-600">请稍候，正在排盘并生成您的详细命理报告...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Card className="chinese-card-decoration border-2 border-purple-400 p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">数据获取异常</h3>
            <p className="text-purple-600">未能获取到完整的分析数据，请重新提交分析</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染宫位卡片
  const renderPalaceCard = (palaceName: string, palace: any) => {
    if (!palace) return null;

    return (
      <Card key={palaceName} className="chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 border-purple-400 min-h-[280px] w-full">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-purple-800 text-lg font-bold chinese-text-shadow">
            {palaceName}
          </CardTitle>
          <div className="flex justify-center items-center space-x-2">
            <span className="text-purple-600 text-sm">{palace.position}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${strengthColors[palace.strength] || 'text-gray-600 bg-gray-50'}`}>
              {palace.strength}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 主星 */}
          {palace.main_stars && palace.main_stars.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-purple-800 mb-2">主星</h5>
              <div className="flex flex-wrap gap-1">
                {palace.main_stars.map((star: string, index: number) => (
                  <span key={index} className={`px-2 py-1 rounded text-xs font-medium border ${starColors[star] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {star}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 吉星 */}
          {palace.lucky_stars && palace.lucky_stars.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-green-800 mb-2">吉星</h5>
              <div className="flex flex-wrap gap-1">
                {palace.lucky_stars.map((star: string, index: number) => (
                  <span key={index} className={`px-2 py-1 rounded text-xs font-medium border ${luckyStarColors}`}>
                    {star}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 煞星 */}
          {palace.unlucky_stars && palace.unlucky_stars.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-red-800 mb-2">煞星</h5>
              <div className="flex flex-wrap gap-1">
                {palace.unlucky_stars.map((star: string, index: number) => (
                  <span key={index} className={`px-2 py-1 rounded text-xs font-medium border ${unluckyStarColors}`}>
                    {star}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 宫位解读 */}
          {palace.interpretation && (
            <div className="border-t pt-2">
              <p className="text-xs text-gray-700 leading-relaxed">{palace.interpretation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 渲染格局卡片
  const renderPatternCard = (pattern: any) => {
    const levelColors = {
      'excellent': 'bg-green-100 text-green-800 border-green-300',
      'good': 'bg-blue-100 text-blue-800 border-blue-300',
      'fair': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'weak': 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Card key={pattern.name} className="chinese-card-decoration hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-purple-800 text-lg font-bold">{pattern.name}</CardTitle>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${levelColors[pattern.level] || levelColors.fair}`}>
              {pattern.level === 'excellent' ? '优秀' : pattern.level === 'good' ? '良好' : pattern.level === 'fair' ? '一般' : '较弱'}
            </span>
          </div>
          <p className="text-purple-600 text-sm">{pattern.type === 'major' ? '主要格局' : pattern.type === 'wealth' ? '财富格局' : pattern.type === 'career' ? '事业格局' : pattern.type === 'relationship' ? '感情格局' : '四化格局'}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-700">{pattern.description}</p>
          <div className="border-t pt-2">
            <h5 className="text-xs font-semibold text-purple-800 mb-1">影响</h5>
            <p className="text-xs text-gray-600">{pattern.influence}</p>
          </div>
          <div className="border-t pt-2">
            <h5 className="text-xs font-semibold text-purple-800 mb-1">建议</h5>
            <p className="text-xs text-gray-600">{pattern.advice}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* 标题和基本信息 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-purple-400">
          <CardHeader className="text-center">
            <CardTitle className="text-purple-800 text-3xl font-bold chinese-text-shadow flex items-center justify-center space-x-2">
              <Crown className="h-8 w-8" />
              <span>{analysisData.basic_info?.personal_data?.name || '用户'}的专业紫微斗数命理分析报告</span>
              <Crown className="h-8 w-8" />
            </CardTitle>
            <div className="flex justify-center space-x-6 mt-4 text-purple-700">
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
            <div className="text-center space-y-4">
              {/* 八字信息 */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-800 mb-2">八字信息</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-700">年柱：{analysisData.basic_info?.bazi_info?.year}</p>
                    <p className="text-purple-700">月柱：{analysisData.basic_info?.bazi_info?.month}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">日柱：{analysisData.basic_info?.bazi_info?.day}</p>
                    <p className="text-purple-700">时柱：{analysisData.basic_info?.bazi_info?.hour}</p>
                  </div>
                </div>
              </div>
              
              {/* 五行局和命宫 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                  <h4 className="font-bold text-indigo-800 mb-2">五行局</h4>
                  <div className={`inline-block px-3 py-2 rounded-lg font-bold ${wuxingJuColors[analysisData.basic_info?.wuxing_ju?.type] || 'text-gray-700 bg-gray-100'}`}>
                    {analysisData.basic_info?.wuxing_ju?.type}
                  </div>
                  <p className="text-indigo-700 text-sm mt-2">{analysisData.basic_info?.wuxing_ju?.description}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-800 mb-2">命宫位置</h4>
                  <div className="text-2xl font-bold text-blue-800 mb-2">
                    {analysisData.basic_info?.ming_gong_position?.branch}
                  </div>
                  <p className="text-blue-700 text-sm">{analysisData.basic_info?.ming_gong_position?.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 命宫主星信息 */}
        {analysisData.ziwei_analysis?.ming_gong_stars && analysisData.ziwei_analysis.ming_gong_stars.length > 0 && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Star className="h-6 w-6" />
                <span>命宫主星详解</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">命宫在{analysisData.ziwei_analysis?.ming_gong}，主星决定了您的基本性格和人生走向</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisData.ziwei_analysis.ming_gong_stars.map((star: string, index: number) => {
                  const explanation = starExplanations[star];
                  return (
                    <div key={index} className="bg-white p-6 rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`px-4 py-2 rounded-lg font-bold text-lg border-2 ${starColors[star] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {star}
                        </div>
                        {explanation && (
                          <span className="text-purple-600 font-medium">{explanation.nature}</span>
                        )}
                      </div>
                      
                      {explanation && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-blue-800 mb-2 flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>性格特质</span>
                            </h5>
                            <p className="text-blue-700 text-sm">{explanation.personality}</p>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center space-x-1">
                              <Target className="h-4 w-4" />
                              <span>事业方向</span>
                            </h5>
                            <p className="text-green-700 text-sm">{explanation.career}</p>
                          </div>
                          
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>财运特点</span>
                            </h5>
                            <p className="text-yellow-700 text-sm">{explanation.fortune}</p>
                          </div>
                        </div>
                      )}
                      
                      {!explanation && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-600 text-sm">此星曜的详细解释正在完善中...</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* 主星组合解读 */}
                {analysisData.ziwei_analysis.ming_gong_stars.length > 1 && (
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>主星组合特色</span>
                    </h4>
                    <p className="text-purple-700">
                      您的命宫有{analysisData.ziwei_analysis.ming_gong_stars.join('、')}同宫，这种组合使您兼具了多种星曜的特质。
                      {analysisData.ziwei_analysis.ming_gong_stars.length === 2 ? 
                        '双星同宫往往能够互补优势，但也需要平衡不同星曜的能量。' : 
                        '多星同宫的格局较为复杂，需要综合各星曜的特质来理解您的性格。'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 十二宫位详解 */}
        <Card className="chinese-card-decoration border-2 border-purple-400">
          <CardHeader>
            <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
              <Compass className="h-6 w-6" />
              <span>十二宫位详解</span>
            </CardTitle>
            <p className="text-purple-600 mt-2">紫微斗数将人生分为十二个宫位，每个宫位代表不同的人生领域</p>
          </CardHeader>
          <CardContent>
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
              {analysisData.ziwei_analysis?.twelve_palaces && Object.entries(analysisData.ziwei_analysis.twelve_palaces).map(([palaceName, palace]) => 
                renderPalaceCard(palaceName, palace)
              )}
            </div>
          </CardContent>
        </Card>

        {/* 四化飞星 */}
        {analysisData.ziwei_analysis?.si_hua && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Sparkles className="h-6 w-6" />
                <span>四化飞星</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">根据{analysisData.ziwei_analysis.si_hua.year_stem}年干的四化飞星分析</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 四化概述 */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">四化飞星概述</h4>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    四化飞星是紫微斗数的核心理论，由{analysisData.ziwei_analysis.si_hua.year_stem}年干所化出。
                    四化分别是化禄（财禄）、化权（权力）、化科（名声）、化忌（阻碍），
                    它们会影响相应星曜的能量表现，是判断吉凶和时机的重要依据。
                  </p>
                </div>
                
                {/* 四化详解 */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* 化禄 */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">💰</span>
                      <div>
                        <h4 className="font-bold text-green-800 text-lg">化禄 - {analysisData.ziwei_analysis.si_hua.hua_lu.star}</h4>
                        <p className="text-green-600 text-sm">{sihuaExplanations['化禄'].concept}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-green-800">影响：</span>
                        <span className="text-green-700">{sihuaExplanations['化禄'].influence}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">应用：</span>
                        <span className="text-green-700">{sihuaExplanations['化禄'].application}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">时机：</span>
                        <span className="text-green-700">{sihuaExplanations['化禄'].timing}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 化权 */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">👑</span>
                      <div>
                        <h4 className="font-bold text-blue-800 text-lg">化权 - {analysisData.ziwei_analysis.si_hua.hua_quan.star}</h4>
                        <p className="text-blue-600 text-sm">{sihuaExplanations['化权'].concept}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">影响：</span>
                        <span className="text-blue-700">{sihuaExplanations['化权'].influence}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">应用：</span>
                        <span className="text-blue-700">{sihuaExplanations['化权'].application}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">时机：</span>
                        <span className="text-blue-700">{sihuaExplanations['化权'].timing}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 化科 */}
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">🎓</span>
                      <div>
                        <h4 className="font-bold text-yellow-800 text-lg">化科 - {analysisData.ziwei_analysis.si_hua.hua_ke.star}</h4>
                        <p className="text-yellow-600 text-sm">{sihuaExplanations['化科'].concept}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-yellow-800">影响：</span>
                        <span className="text-yellow-700">{sihuaExplanations['化科'].influence}</span>
                      </div>
                      <div>
                        <span className="font-medium text-yellow-800">应用：</span>
                        <span className="text-yellow-700">{sihuaExplanations['化科'].application}</span>
                      </div>
                      <div>
                        <span className="font-medium text-yellow-800">时机：</span>
                        <span className="text-yellow-700">{sihuaExplanations['化科'].timing}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 化忌 */}
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="font-bold text-red-800 text-lg">化忌 - {analysisData.ziwei_analysis.si_hua.hua_ji.star}</h4>
                        <p className="text-red-600 text-sm">{sihuaExplanations['化忌'].concept}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-red-800">影响：</span>
                        <span className="text-red-700">{sihuaExplanations['化忌'].influence}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-800">应用：</span>
                        <span className="text-red-700">{sihuaExplanations['化忌'].application}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-800">时机：</span>
                        <span className="text-red-700">{sihuaExplanations['化忌'].timing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 大限分析 */}
        {analysisData.ziwei_analysis?.major_periods && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>大限分析</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">{analysisData.ziwei_analysis.major_periods.wuxing_ju}，起运年龄{analysisData.ziwei_analysis.major_periods.start_age}岁</p>
            </CardHeader>
            <CardContent>
              {/* 当前大限 */}
              {analysisData.ziwei_analysis.major_periods.current_period && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <h4 className="font-bold text-purple-800 mb-2">当前大限</h4>
                  <p className="text-purple-700 font-medium">{analysisData.ziwei_analysis.major_periods.current_period.description}</p>
                </div>
              )}
              
              {/* 所有大限 */}
              <div className="space-y-4">
                <h4 className="font-bold text-purple-800 mb-3">十二大限详解</h4>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {analysisData.ziwei_analysis.major_periods.all_periods?.map((period: any, index: number) => {
                    const explanation = majorPeriodPalaceExplanations[period.palace_name] || {
                      focus: '该宫位的重点领域',
                      opportunities: '潜在的发展机会',
                      challenges: '可能面临的挑战',
                      advice: '建议关注的方向'
                    };
                    
                    return (
                      <div key={index} className={`p-5 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                        period.is_current 
                          ? 'bg-purple-100 border-purple-300 shadow-lg ring-2 ring-purple-200' 
                          : 'bg-white border-gray-200 hover:border-purple-200'
                      }`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-purple-800 text-lg">第{period.period_number}大限</span>
                          <span className="text-sm text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">{period.age_range}</span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-gray-800">{period.palace_branch}宫</span>
                            <span className="text-gray-600">（{period.palace_name}）</span>
                          </div>
                          {period.is_current && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-medium">当前大限</span>
                              <span className="text-xs text-purple-600">正在经历</span>
                            </div>
                          )}
                          {!period.is_current && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              index < analysisData.ziwei_analysis.major_periods.all_periods?.findIndex((p: any) => p.is_current) 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {index < analysisData.ziwei_analysis.major_periods.all_periods?.findIndex((p: any) => p.is_current) ? '已过' : '未来'}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-indigo-800">重点领域：</span>
                            <p className="text-indigo-700 mt-1">{explanation.focus}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-800">发展机会：</span>
                            <p className="text-green-700 mt-1">{explanation.opportunities}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-orange-800">注意事项：</span>
                            <p className="text-orange-700 mt-1">{explanation.challenges}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-800">建议方向：</span>
                            <p className="text-blue-700 mt-1">{explanation.advice}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 格局判定 */}
        {analysisData.detailed_analysis?.life_guidance?.pattern_analysis && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <BookOpen className="h-6 w-6" />
                <span>格局判定</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-purple-600">检测到{analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_count}个格局</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'very_strong' ? 'bg-green-100 text-green-800' :
                  analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'strong' ? 'bg-blue-100 text-blue-800' :
                  analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'very_strong' ? '极强' :
                   analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'strong' ? '强' :
                   analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'moderate' ? '中等' :
                   analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_strength === 'fair' ? '一般' : '较弱'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* 格局指导 */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                <h4 className="font-bold text-purple-800 mb-2">格局总评</h4>
                <p className="text-purple-700">{analysisData.detailed_analysis.life_guidance.pattern_analysis.pattern_guidance}</p>
              </div>
              
              {/* 具体格局 */}
              {analysisData.detailed_analysis.life_guidance.pattern_analysis.detected_patterns && (
                <div className="grid lg:grid-cols-2 gap-4">
                  {analysisData.detailed_analysis.life_guidance.pattern_analysis.detected_patterns.map((pattern: any) => 
                    renderPatternCard(pattern)
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 流年分析 */}
        {analysisData.detailed_analysis?.timing_analysis?.liu_nian_analysis && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span>流年分析</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">{analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.year_ganzhi}年运势分析</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 流年四化 */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-bold text-purple-800 mb-3">流年四化</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-green-800 font-medium">{analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.liu_nian_sihua.hua_lu.star}</div>
                      <div className="text-xs text-green-600">化禄</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-blue-800 font-medium">{analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.liu_nian_sihua.hua_quan.star}</div>
                      <div className="text-xs text-blue-600">化权</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-yellow-800 font-medium">{analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.liu_nian_sihua.hua_ke.star}</div>
                      <div className="text-xs text-yellow-600">化科</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                      <div className="text-red-800 font-medium">{analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.liu_nian_sihua.hua_ji.star}</div>
                      <div className="text-xs text-red-600">化忌</div>
                    </div>
                  </div>
                </div>
                
                {/* 年度重点 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">年度机会</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      {analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.year_opportunities?.map((opportunity: string, index: number) => (
                        <li key={index}>• {opportunity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-2">注意事项</h4>
                    <ul className="text-orange-700 text-sm space-y-1">
                      {analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.year_challenges?.map((challenge: string, index: number) => (
                        <li key={index}>• {challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* 重点领域 */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">年度重点领域</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.detailed_analysis.timing_analysis.liu_nian_analysis.year_focus_areas?.map((area: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 专业分析模块 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 个性分析 */}
          {analysisData.detailed_analysis?.personality_analysis && (
            <Card className="chinese-card-decoration border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="text-purple-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>个性分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">性格概述</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.personality_analysis.overview}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">核心特质</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.personality_analysis.core_traits}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">优势特长</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.personality_analysis.strengths}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">需要注意</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.personality_analysis.challenges}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 事业分析 */}
          {analysisData.detailed_analysis?.career_analysis && (
            <Card className="chinese-card-decoration border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="text-purple-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>事业分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">事业潜力</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.career_analysis.career_potential}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">适合行业</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.career_analysis.suitable_industries}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">领导风格</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.career_analysis.leadership_style}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">发展建议</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.career_analysis.career_advice}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 财富分析 */}
          {analysisData.detailed_analysis?.wealth_analysis && (
            <Card className="chinese-card-decoration border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="text-purple-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>财富分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">财运潜力</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.wealth_analysis.wealth_potential}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">赚钱方式</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.wealth_analysis.earning_style}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">投资倾向</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.wealth_analysis.investment_tendency}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">理财建议</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.wealth_analysis.financial_advice}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 感情分析 */}
          {analysisData.detailed_analysis?.relationship_analysis && (
            <Card className="chinese-card-decoration border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="text-purple-800 text-xl font-bold chinese-text-shadow flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>感情分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">婚姻运势</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.relationship_analysis.marriage_fortune}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">配偶特质</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.relationship_analysis.spouse_characteristics}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">感情模式</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.relationship_analysis.relationship_pattern}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-800 mb-2">感情建议</h4>
                  <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.relationship_analysis.relationship_advice}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 人生指导 */}
        {analysisData.detailed_analysis?.life_guidance && (
          <Card className="chinese-card-decoration border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="text-purple-800 text-2xl font-bold chinese-text-shadow flex items-center space-x-2">
                <Sparkles className="h-6 w-6" />
                <span>人生指导</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">人生目标</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.life_purpose}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">核心价值观</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.core_values}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">发展方向</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.development_direction}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">精神成长</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.spiritual_growth}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">人生课题</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.life_lessons}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-800 mb-2">总体指导</h4>
                    <p className="text-gray-700 text-sm">{analysisData.detailed_analysis.life_guidance.overall_guidance}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析说明 */}
        <Card className="chinese-card-decoration border-2 border-gray-300">
          <CardContent className="text-center py-6">
            <p className="text-gray-600 text-sm">
              本分析报告基于传统紫微斗数理论，结合现代分析方法生成。
              紫微斗数是中华传统命理学的重要组成部分，仅供参考，不可过分依赖。
              人生的幸福需要通过自己的努力和智慧来创造。
            </p>
            <div className="mt-4 text-xs text-gray-500">
              分析时间：{analysisData.analysis_date ? new Date(analysisData.analysis_date).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteZiweiAnalysis;