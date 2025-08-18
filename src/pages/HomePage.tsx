import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Compass, Heart, BarChart3, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
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
      <div className="text-center space-y-8 relative">
        <div className="relative">
          {/* 传统中式背景装饰 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 chinese-red-glow rounded-full opacity-30 blur-3xl"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 chinese-golden-glow rounded-full opacity-20 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* 太极符号装饰 */}
            <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-600">
              <img 
                src="/traditional-chinese-bagua-eight-trigrams-black-gold.jpg" 
                alt="太极八卦"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-red-800 mb-6 chinese-text-shadow font-serif">
              神机阁
              <span className="block text-3xl md:text-4xl text-yellow-600 mt-2 chinese-text-shadow">
                AI智能命理分析
              </span>
            </h1>
            <p className="text-xl text-red-700 max-w-3xl mx-auto leading-relaxed font-medium">
              融合传统命理智慧与现代AI技术，为您提供个性化、专业化的命理解读和人生指导
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
          {user ? (
            <Link to="/analysis">
              <Button size="lg" className="w-full sm:w-auto chinese-red-glow text-white hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
                <Sparkles className="mr-2 h-5 w-5" />
                开始分析
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto chinese-golden-glow text-red-800 hover:shadow-xl transition-all duration-300 border-2 border-red-600">
                  <Heart className="mr-2 h-5 w-5" />
                  免费注册
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-yellow-500 text-red-700 hover:bg-yellow-50 hover:shadow-lg transition-all duration-300">
                  登录账户
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 relative justify-center max-w-6xl mx-auto">
        {/* 装饰元素 - 调整为更适合3列布局的位置 */}
        <div className="absolute -left-12 top-1/4 w-20 h-20 opacity-20 pointer-events-none hidden md:block">
          <img 
            src="/chinese_traditional_red_gold_auspicious_cloud_pattern.jpg" 
            alt=""
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="absolute -right-12 bottom-1/4 w-20 h-20 opacity-20 pointer-events-none hidden md:block">
          <img 
            src="/chinese_traditional_red_gold_auspicious_cloud_pattern.jpg" 
            alt=""
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="text-center hover:shadow-2xl transition-all duration-300 chinese-card-decoration dragon-corner transform hover:scale-105">
              <CardHeader>
                <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-red-600`}>
                  <Icon className={`h-6 w-6 text-red-800`} />
                </div>
                <CardTitle className={`${feature.color} text-2xl font-bold font-serif chinese-text-shadow`}>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 leading-relaxed font-medium mb-4">{feature.description}</p>
                {user && (
                  <Link to={feature.link}>
                    <Button className="w-full chinese-golden-glow text-red-800 hover:shadow-lg transition-all duration-300 border border-red-600">
                      立即体验
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="chinese-traditional-bg text-white text-center dragon-corner relative overflow-hidden">
        <CardContent className="py-12 relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-3 border-yellow-300">
            <Sparkles className="w-8 h-8 text-red-800" />
          </div>
          
          <h2 className="text-4xl font-bold mb-4 chinese-text-shadow font-serif">探索您的命运密码</h2>
          <p className="text-red-100 mb-8 text-lg font-medium leading-relaxed">
            加入数万用户的选择，让AI帮您解读人生密码
          </p>
          {!user && (
            <Link to="/register">
              <Button variant="outline" size="lg" className="chinese-golden-glow text-red-800 border-3 border-yellow-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                立即开始
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;