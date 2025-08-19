import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, User, History, LogOut, Home, Menu, X } from 'lucide-react';
import { ChineseButton } from './ui/ChineseButton';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('登出成功');
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast.error('登出失败');
    }
  };

  const navigationItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/analysis', label: '分析', icon: Sparkles, requireAuth: true },
    { path: '/history', label: '历史', icon: History, requireAuth: true },
    { path: '/profile', label: '档案', icon: User, requireAuth: true },
  ];

  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu:', !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* 导航栏 */}
      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl border-b-2 border-yellow-500 relative overflow-hidden z-[9998]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            {/* 品牌Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-600 group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src="/traditional-chinese-bagua-eight-trigrams-black-gold.jpg" 
                    alt="神机阁"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white font-chinese group-hover:text-gold-100 transition-colors duration-300">
                  神机阁
                </span>
              </Link>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => {
                if (item.requireAuth && !user) return null;
                
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm',
                      'border border-transparent hover:border-yellow-400',
                      isActive
                        ? 'text-yellow-100 bg-white/10 border-yellow-400 shadow-lg'
                        : 'text-white hover:text-yellow-100 hover:bg-white/10'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
              
              {user ? (
                <ChineseButton
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">登出</span>
                </ChineseButton>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <ChineseButton variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-red-600">
                      登录
                    </ChineseButton>
                  </Link>
                  <Link to="/register">
                    <ChineseButton variant="secondary" size="sm">
                      注册
                    </ChineseButton>
                  </Link>
                </div>
              )}
            </div>
            
            {/* 移动端汉堡菜单按钮 */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
                aria-label="切换菜单"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* 移动端菜单面板 */}
        <div className={cn(
          'md:hidden fixed top-16 left-0 right-0 z-[9999]',
          'bg-red-600/95 backdrop-blur-md border-t border-yellow-500/30',
          'transform transition-all duration-300 ease-in-out',
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 visible'
            : '-translate-y-2 opacity-0 invisible'
        )}>
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              if (item.requireAuth && !user) return null;
              
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                    'border border-transparent',
                    isActive
                      ? 'text-yellow-100 bg-white/15 border-yellow-400/50'
                      : 'text-white hover:text-yellow-100 hover:bg-white/10'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-white/20">
              {user ? (
                <ChineseButton
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full text-white border-white hover:bg-white hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  登出
                </ChineseButton>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={closeMobileMenu} className="block">
                    <ChineseButton variant="outline" className="w-full text-white border-white hover:bg-white hover:text-red-600">
                      登录
                    </ChineseButton>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="block">
                    <ChineseButton variant="secondary" className="w-full">
                      注册
                    </ChineseButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative min-h-[calc(100vh-200px)]">
        {/* 装饰元素 - 仅在桌面端显示 */}
        <div className="hidden lg:block absolute top-0 left-0 w-20 h-20 opacity-10 pointer-events-none">
          <img 
            src="/chinese_traditional_golden_ornate_frame.png" 
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        <div className="hidden lg:block absolute bottom-0 right-0 w-20 h-20 opacity-10 pointer-events-none">
          <img 
            src="/chinese_traditional_golden_ornate_frame.png" 
            alt=""
            className="w-full h-full object-contain rotate-180"
          />
        </div>
        
        {/* 点击遮罩层关闭移动端菜单 */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-[9997] md:hidden" 
            onClick={closeMobileMenu}
          />
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="mt-auto py-6 md:py-8 border-t border-red-200 bg-gradient-to-br from-yellow-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-500">
              <img 
                src="/traditional_chinese_gold_red_dragon_symbol.jpg" 
                alt="龙符"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
              />
            </div>
            <p className="text-red-600 font-medium font-chinese text-sm md:text-base">
              神机阁 - 传统智慧与现代科技的完美融合
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
              © 2025 AI命理分析平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;