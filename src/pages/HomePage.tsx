import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Compass, Hexagon, Heart, BarChart3, BookOpen, Shield, Zap, Users, Award, Brain, TrendingUp } from 'lucide-react';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: '八字命理',
      description: '基于传统八字学说，深度分析您的五行平衡、格局特点、四柱信息和人生走向。结合精确节气计算，提供更准确的时间定位',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    },
    {
      icon: Star,
      title: '紫微斗数',
      description: '通过星曜排布和十二宫位分析，揭示您的性格特质和命运走向。采用星曜亮度算法和四化飞星系统，分析更加精准',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    },
    {
      icon: Compass,
      title: '易经占卜',
      description: '运用梅花易数起卦法，解读卦象含义，为您的人生决策提供智慧指引。使用高质量随机数生成，确保卦象的准确性',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    },
    {
      icon: Hexagon,
      title: '奇门遁甲',
      description: '古代帝王之学，通过时空奇门盘分析事物发展趋势。结合九星八门八神布局，为重要决策提供战略指导',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    }
  ];

  const advantages = [
    {
      icon: Brain,
      title: 'AI智能分析',
      description: '融合人工智能技术，提供个性化推荐和智能分析，让传统命理更加精准'
    },
    {
      icon: Shield,
      title: '专业可靠',
      description: '基于传统命理典籍，结合现代算法优化，确保分析结果的专业性和准确性'
    },
    {
      icon: Zap,
      title: '高效便捷',
      description: '智能缓存技术，响应速度提升60-80%，为您提供流畅的使用体验'
    },
    {
      icon: TrendingUp,
      title: '趋势对比',
      description: '支持历史分析对比，追踪命理变化趋势，为人生规划提供数据支持'
    }
  ];

  const stats = [
    { number: '10+', label: '核心算法模块', description: '涵盖八字、紫微、易经全方位分析' },
    { number: '99%', label: '计算准确率', description: '基于传统典籍和现代优化算法' },
    { number: '24/7', label: '全天候服务', description: '随时随地获得专业命理指导' },
    { number: '100%', label: '隐私保护', description: '严格保护用户个人信息安全' }
  ];

  return (
    <div className="space-y-16 relative">
      {/* 页面装饰性背景元素 */}
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
          className="w-full h-full object-contain rotate-90"
        />
      </div>
      
      {/* Hero Section */}
      <div className="text-center space-y-6 md:space-y-8 relative">
        <div className="relative">
          {/* 传统中式背景装饰 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 md:w-80 md:h-80 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* 太极符号装饰 */}
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-600">
              <img 
                src="/traditional_chinese_gold_red_dragon_symbol.jpg" 
                alt="神机阁"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            </div>
            
            <h1 className="text-display-xl font-bold text-red-600 mb-4 md:mb-6 font-chinese">
              神机阁
              <span className="block text-display-md text-yellow-600 mt-2">
                专业命理分析平台
              </span>
            </h1>
            <p className="text-body-xl text-gray-700 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-chinese px-4 mb-6">
              融合传统命理智慧与现代AI技术，为您提供个性化、专业化的命理解读和人生指导
            </p>
            <div className="max-w-4xl mx-auto px-4">
              <p className="text-body-md text-gray-600 leading-relaxed font-chinese mb-4">
                神机阁是一个专业的命理分析平台，采用模块化架构设计，集成了10余个核心算法模块。
                我们基于传统命理典籍，结合现代计算技术，为用户提供准确、专业的命理分析服务。
              </p>
              <p className="text-body-md text-gray-600 leading-relaxed font-chinese">
                平台支持八字命理、紫微斗数、易经占卜三大主要分析方式，
                并融入AI智能推荐、历史趋势对比等现代化功能，让古老的命理智慧焕发新的活力。
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center relative z-10 px-4">
          {user ? (
            <Link to="/analysis" className="w-full sm:w-auto">
              <ChineseButton size="lg" className="w-full">
                <Sparkles className="mr-2 h-5 w-5" />
                开始分析
              </ChineseButton>
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto">
                <ChineseButton variant="secondary" size="lg" className="w-full">
                  <Heart className="mr-2 h-5 w-5" />
                  免费注册
                </ChineseButton>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <ChineseButton variant="outline" size="lg" className="w-full">
                  登录账户
                </ChineseButton>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative max-w-7xl mx-auto px-4">
        {/* 装饰元素 - 仅在大屏幕显示 */}
        <div className="absolute -left-12 top-1/4 w-16 h-16 opacity-15 pointer-events-none hidden xl:block">
          <img 
            src="/chinese_traditional_red_gold_auspicious_cloud_pattern.jpg" 
            alt=""
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="absolute -right-12 bottom-1/4 w-16 h-16 opacity-15 pointer-events-none hidden xl:block">
          <img 
            src="/chinese_traditional_red_gold_auspicious_cloud_pattern.jpg" 
            alt=""
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <ChineseCard key={index} variant="elevated" className="text-center h-full flex flex-col">
              <ChineseCardHeader>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg border-2 border-red-600">
                  <Icon className="h-6 w-6 md:h-7 md:w-7 text-red-800" />
                </div>
                <ChineseCardTitle className="text-red-600 text-heading-md font-bold font-chinese">{feature.title}</ChineseCardTitle>
              </ChineseCardHeader>
              <ChineseCardContent className="flex-1 flex flex-col">
                <p className="text-gray-700 leading-relaxed font-chinese mb-4 text-body-md flex-1">{feature.description}</p>
                {user && (
                  <Link to={feature.link}>
                    <ChineseButton variant="secondary" className="w-full">
                      立即体验
                    </ChineseButton>
                  </Link>
                )}
              </ChineseCardContent>
            </ChineseCard>
          );
        })}
      </div>

      {/* 项目优势 Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display-lg font-bold text-red-600 mb-4 font-chinese">平台优势</h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto font-chinese">
            结合传统智慧与现代技术，为您提供更准确、更便捷的命理分析体验
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <ChineseCard key={index} variant="bordered" className="text-center hover:shadow-lg transition-shadow">
                <ChineseCardContent className="py-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-heading-sm font-bold text-gray-800 mb-2 font-chinese">{advantage.title}</h3>
                  <p className="text-body-sm text-gray-600 leading-relaxed font-chinese">{advantage.description}</p>
                </ChineseCardContent>
              </ChineseCard>
            );
          })}
        </div>
      </div>

      {/* 统计数据 Section */}
      <div className="bg-gradient-to-r from-red-50 to-yellow-50 py-16 mx-4 rounded-2xl border border-red-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-lg font-bold text-red-600 mb-4 font-chinese">平台数据</h2>
            <p className="text-body-lg text-gray-600 max-w-2xl mx-auto font-chinese">
              用数据说话，展现我们的专业实力和服务品质
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-display-xl font-bold text-red-600 mb-2 font-chinese">{stat.number}</div>
                <div className="text-heading-sm font-semibold text-gray-800 mb-2 font-chinese">{stat.label}</div>
                <div className="text-body-sm text-gray-600 font-chinese">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 技术特色 Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display-lg font-bold text-red-600 mb-4 font-chinese">技术特色</h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto font-chinese">
            采用先进的技术架构，确保分析结果的准确性和系统的稳定性
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ChineseCard variant="elevated" className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-heading-md font-bold text-gray-800 mb-3 font-chinese">AI智能优化</h3>
                <ul className="space-y-2 text-body-sm text-gray-600 font-chinese">
                  <li>• 个性化推荐算法，根据用户行为提供定制化建议</li>
                  <li>• 机器学习模型优化，持续提升分析准确度</li>
                  <li>• 智能缓存机制，响应速度提升60-80%</li>
                  <li>• 用户行为分析，提供更贴心的服务体验</li>
                </ul>
              </div>
            </div>
          </ChineseCard>
          
          <ChineseCard variant="elevated" className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-heading-md font-bold text-gray-800 mb-3 font-chinese">算法精进</h3>
                <ul className="space-y-2 text-body-sm text-gray-600 font-chinese">
                  <li>• 精确节气计算，考虑地理位置因素</li>
                  <li>• 星曜亮度算法，优化紫微斗数分析精度</li>
                  <li>• 高质量随机数生成，确保易经卦象准确性</li>
                  <li>• 历史数据对比分析，追踪命理变化趋势</li>
                </ul>
              </div>
            </div>
          </ChineseCard>
        </div>
      </div>

      {/* CTA Section */}
      <ChineseCard variant="golden" className="text-center relative overflow-hidden mx-4">
        <ChineseCardContent className="py-12 md:py-16 relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-red-800">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
          </div>
          
          <h2 className="text-display-lg font-bold mb-4 md:mb-6 font-chinese text-red-800">开启您的命理之旅</h2>
          <p className="text-red-700 mb-4 text-body-lg font-chinese leading-relaxed px-4 max-w-3xl mx-auto">
            融合千年命理智慧与现代AI技术，为您提供专业、准确、个性化的命理分析服务
          </p>
          <p className="text-red-600 mb-8 text-body-md font-chinese px-4 max-w-2xl mx-auto">
            立即体验八字命理、紫微斗数、易经占卜三大分析系统，探索属于您的人生密码
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <>
                <Link to="/register">
                  <ChineseButton variant="primary" size="lg" className="shadow-xl w-full sm:w-auto">
                    <Heart className="mr-2 h-5 w-5" />
                    免费注册体验
                  </ChineseButton>
                </Link>
                <Link to="/analysis">
                  <ChineseButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    <BookOpen className="mr-2 h-5 w-5" />
                    了解更多
                  </ChineseButton>
                </Link>
              </>
            ) : (
              <Link to="/analysis">
                <ChineseButton variant="primary" size="lg" className="shadow-xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  开始专业分析
                </ChineseButton>
              </Link>
            )}
          </div>

        </ChineseCardContent>
      </ChineseCard>
    </div>
  );
};

export default HomePage;