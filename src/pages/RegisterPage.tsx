import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseInput } from '../components/ui/ChineseInput';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { toast } from 'sonner';
import { Mail, Lock, UserPlus } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 6) {
      toast.error('密码长度不能少于6位');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error('注册失败：' + error.message);
      } else {
        toast.success('注册成功！欢迎加入神机阁');
        navigate('/profile'); // 引导到个人档案页面完善信息
      }
    } catch (error) {
      toast.error('注册过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-36 h-36 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-44 h-44 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <ChineseCard variant="elevated" className="w-full max-w-md relative z-10">
        <ChineseCardHeader className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-red-600">
            <UserPlus className="h-7 w-7 text-red-800" />
          </div>
          <ChineseCardTitle className="text-2xl md:text-3xl text-red-600 font-chinese">创建账户</ChineseCardTitle>
          <p className="text-gray-600 font-chinese mt-2">加入神机阁，开启您的命理之旅</p>
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
                placeholder="请输入您的密码（不少于6位）"
                variant="bordered"
                className="pl-10"
                helperText="密码长度不能少于6位"
              />
              <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <ChineseInput
                type="password"
                label="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="请再次输入密码"
                variant="bordered"
                className="pl-10"
                error={confirmPassword && password !== confirmPassword ? '两次输入的密码不一致' : undefined}
              />
              <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <ChineseButton
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册账户'}
            </ChineseButton>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-chinese">
              已有账户？
              <Link to="/login" className="text-red-600 hover:text-red-700 font-medium ml-1 transition-colors duration-200">
                立即登录
              </Link>
            </p>
          </div>
        </ChineseCardContent>
      </ChineseCard>
    </div>
  );
};

export default RegisterPage;