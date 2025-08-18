import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
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
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">创建账户</CardTitle>
          <p className="text-gray-600">加入神机阁，开启您的命理之旅</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                label="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="请输入您的邮箱"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                type="password"
                label="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入您的密码（不少于6位）"
                className="pl-10"
              />
              <Lock className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                type="password"
                label="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="请再次输入密码"
                className="pl-10"
              />
              <Lock className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册账户'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账户？
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium ml-1">
                立即登录
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;