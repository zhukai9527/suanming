import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, User, History, LogOut, Home, Stars } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('登出成功');
    } catch (error) {
      toast.error('登出失败');
    }
  };

  const navigationItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/analysis', label: '命理分析', icon: Sparkles, requireAuth: true },
    { path: '/history', label: '历史记录', icon: History, requireAuth: true },
    { path: '/profile', label: '个人档案', icon: User, requireAuth: true },
  ];

  return (
    <div className="min-h-screen relative">
      {/* 导航栏 */}
      <nav className="chinese-traditional-bg shadow-2xl border-b-4 border-yellow-400 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                {/* 品牌图标 */}
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-300 group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src="/traditional-chinese-bagua-eight-trigrams-black-gold.jpg" 
                    alt="神机阁"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </div>
                <span className="text-2xl font-bold text-yellow-200 font-serif chinese-text-shadow group-hover:text-yellow-100 transition-colors duration-300">神机阁</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              {navigationItems.map((item) => {
                if (item.requireAuth && !user) return null;
                
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 border-2 font-serif ${
                      isActive
                        ? 'text-red-800 chinese-golden-glow border-red-600 shadow-lg transform scale-105'
                        : 'text-yellow-200 hover:text-red-800 hover:chinese-golden-glow border-transparent hover:border-red-600 hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex items-center space-x-2 chinese-golden-glow text-red-800 border-2 border-red-600 hover:shadow-xl transition-all duration-300 font-serif"
                >
                  <LogOut className="h-5 w-5" />
                  <span>登出</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="outline" className="chinese-golden-glow text-red-800 border-2 border-red-600 hover:shadow-xl transition-all duration-300 font-serif">
                      登录
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="chinese-red-glow text-white border-2 border-yellow-400 hover:shadow-xl transition-all duration-300 font-serif">
                      注册
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* 主内容区装饰元素 */}
        <div className="absolute top-0 left-0 w-24 h-24 opacity-10 pointer-events-none">
          <img 
            src="/chinese_traditional_golden_ornate_frame.png" 
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
          <img 
            src="/chinese_traditional_golden_ornate_frame.png" 
            alt=""
            className="w-full h-full object-contain rotate-180"
          />
        </div>
        
        {children}
      </main>
      
      {/* 页脚装饰 */}
      <footer className="mt-16 py-8 border-t-2 border-yellow-400 mystical-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-600">
              <img 
                src="/traditional_chinese_gold_red_dragon_symbol.jpg" 
                alt="龙符"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <p className="text-red-700 font-medium font-serif">神机阁 - 传统智慧与现代科技的完美融合</p>
            <p className="text-red-600 text-sm mt-2">© 2025 AI命理分析平台 - Created by MiniMax Agent</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;