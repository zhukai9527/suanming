import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseInput } from '../components/ui/ChineseInput';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('登录失败：' + error.message);
      } else {
        toast.success('登录成功！');
        navigate('/');
      }
    } catch (error) {
      toast.error('登录过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <ChineseCard variant="elevated" className="w-full max-w-md relative z-10">
        <ChineseCardHeader className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-yellow-500">
            <LogIn className="h-7 w-7 text-yellow-400" />
          </div>
          <ChineseCardTitle className="text-2xl md:text-3xl text-red-600 font-chinese">登录账户</ChineseCardTitle>
          <p className="text-gray-600 font-chinese mt-2">欢迎回到神机阁</p>
        </ChineseCardHeader>
        <ChineseCardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <ChineseInput
                type="email"
                label="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="请输入您的邮箱"
                variant="bordered"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <ChineseInput
                type="password"
                label="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入您的密码"
                variant="bordered"
                className="pl-10"
              />
              <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <ChineseButton
              type="submit"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </ChineseButton>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-chinese">
              还没有账户？
              <Link to="/register" className="text-red-600 hover:text-red-700 font-medium ml-1 transition-colors duration-200">
                立即注册
              </Link>
            </p>
          </div>
        </ChineseCardContent>
      </ChineseCard>
    </div>
  );
};

export default LoginPage;