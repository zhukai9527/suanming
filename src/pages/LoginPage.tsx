import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
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
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">登录账户</CardTitle>
          <p className="text-gray-600">欢迎回到神机阁</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="请输入您的邮箱"
              className="pl-10"
            />
            <div className="relative">
              <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            
            <Input
              type="password"
              label="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入您的密码"
              className="pl-10"
            />
            <div className="relative">
              <Lock className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账户？
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;