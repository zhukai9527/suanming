import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';
import { User, Calendar, MapPin, Save } from 'lucide-react';
import { UserProfile } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    gender: 'male' as 'male' | 'female',
    username: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          birth_date: data.birth_date || '',
          birth_time: data.birth_time || '',
          birth_location: data.birth_location || '',
          gender: data.gender || 'male',
          username: data.username || ''
        });
      }
    } catch (error: any) {
      console.error('加载档案失败:', error);
      toast.error('加载档案失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const profileData = {
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      let result;
      if (profile) {
        // 更新现有档案
        result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
      } else {
        // 创建新档案
        result = await supabase
          .from('user_profiles')
          .insert([{
            ...profileData,
            created_at: new Date().toISOString()
          }])
          .select()
          .maybeSingle();
      }

      if (result.error) {
        throw result.error;
      }

      setProfile(result.data);
      toast.success('档案保存成功！');
    } catch (error: any) {
      console.error('保存档案失败:', error);
      toast.error('保存档案失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>个人档案</CardTitle>
              <p className="text-gray-600">完善您的个人信息，获得更精准的命理分析</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="姓名 *"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                placeholder="请输入您的真实姓名"
              />
              
              <Input
                label="用户名"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名（可选）"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="date"
                  label="出生日期 *"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  required
                />
                <Calendar className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <Input
                type="time"
                label="出生时间"
                value={formData.birth_time}
                onChange={(e) => handleInputChange('birth_time', e.target.value)}
                placeholder="选填，但强烈建议填写"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="性别 *"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={[
                  { value: 'male', label: '男性' },
                  { value: 'female', label: '女性' }
                ]}
                required
              />
              
              <div className="relative">
                <Input
                  label="出生地点"
                  value={formData.birth_location}
                  onChange={(e) => handleInputChange('birth_location', e.target.value)}
                  placeholder="如：北京市朝阳区"
                />
                <MapPin className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">温馨提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 姓名和出生日期是必填项，对命理分析至关重要</li>
                <li>• 出生时间越精确，分析结果越准确</li>
                <li>• 出生地点有助于更精准的时间校正</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? '保存中...' : '保存档案'}
            </Button>
          </form>

          {profile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                最后更新：{new Date(profile.updated_at).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;