import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Compass, Heart, BarChart3, BookOpen } from 'lucide-react';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: '八字命理',
      description: '基于传统八字学说，深度分析您的五行平衡、格局特点、四柱信息和人生走向',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    },
    {
      icon: Star,
      title: '紫微斗数',
      description: '通过星曜排布和十二宫位分析，揭示您的性格特质和命运走向',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    },
    {
      icon: Compass,
      title: '易经占卜',
      description: '运用梅花易数起卦法，解读卦象含义，为您的人生决策提供智慧指引',
      color: 'text-red-700',
      bgColor: 'chinese-golden-glow',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      link: '/analysis'
    }
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
                src="/traditional-chinese-bagua-eight-trigrams-black-gold.jpg" 
                alt="太极八卦"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            </div>
            
            <h1 className="text-display-xl font-bold text-red-600 mb-4 md:mb-6 font-chinese">
              神机阁
              <span className="block text-display-md text-yellow-600 mt-2">
                专业命理分析平台
              </span>
            </h1>
            <p className="text-body-xl text-gray-700 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-chinese px-4">
              融合传统命理智慧与现代AI技术，为您提供个性化、专业化的命理解读和人生指导
            </p>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative max-w-6xl mx-auto px-4">
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
            <ChineseCard key={index} variant="elevated" className="text-center sm:col-span-1 lg:col-span-1 last:sm:col-span-2 last:lg:col-span-1">
              <ChineseCardHeader>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg border-2 border-red-600">
                  <Icon className="h-6 w-6 md:h-7 md:w-7 text-red-800" />
                </div>
                <ChineseCardTitle className="text-red-600 text-heading-md font-bold font-chinese">{feature.title}</ChineseCardTitle>
              </ChineseCardHeader>
              <ChineseCardContent>
                <p className="text-gray-700 leading-relaxed font-chinese mb-4 text-body-md">{feature.description}</p>
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

      {/* CTA Section */}
      <ChineseCard variant="golden" className="text-center relative overflow-hidden mx-4">
        <ChineseCardContent className="py-8 md:py-12 relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-red-800">
            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-yellow-400" />
          </div>
          
          <h2 className="text-display-md font-bold mb-3 md:mb-4 font-chinese text-red-800">探索您的命运密码</h2>
            <p className="text-red-700 mb-6 md:mb-8 text-body-lg font-chinese leading-relaxed px-4">
            加入数万用户的选择，让AI帮您解读人生密码
          </p>
          {!user && (
            <Link to="/register">
              <ChineseButton variant="primary" size="lg" className="shadow-xl">
                立即开始
              </ChineseButton>
            </Link>
          )}
        </ChineseCardContent>
      </ChineseCard>
    </div>
  );
};

export default HomePage;