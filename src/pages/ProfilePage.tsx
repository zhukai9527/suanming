import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { localApi } from '../lib/localApi';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseInput } from '../components/ui/ChineseInput';
import { ChineseSelect } from '../components/ui/ChineseSelect';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import { toast } from 'sonner';
import { User, Calendar, MapPin, Save } from 'lucide-react';
import { UserProfile } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await localApi.profiles.get();
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data && response.data.profile) {
        const data = response.data.profile;
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
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [user, loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const profileData = {
        ...formData
      };

      const result = await localApi.profiles.update(profileData);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data && result.data.profile) {
        setProfile(result.data.profile);
      }
      toast.success('档案保存成功！即将跳转到分析页面...');
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigate('/analysis');
      }, 1500);
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 font-chinese mb-2">个人档案</h1>
        <p className="text-gray-600 font-chinese">完善您的个人信息，获得更精准的命理分析</p>
      </div>
      
      <ChineseCard variant="elevated">
        <ChineseCardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <ChineseCardTitle className="text-red-600 font-chinese">基本信息</ChineseCardTitle>
              <p className="text-gray-600 font-chinese">请填写准确的个人信息</p>
            </div>
          </div>
        </ChineseCardHeader>
        <ChineseCardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <ChineseInput
                label="姓名"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                placeholder="请输入您的真实姓名"
                variant="filled"
              />
              
              <ChineseInput
                label="用户名"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名（可选）"
                variant="filled"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="relative">
                <ChineseInput
                  type="date"
                  label="出生日期"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  required
                  variant="filled"
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <ChineseInput
                type="time"
                label="出生时间"
                value={formData.birth_time}
                onChange={(e) => handleInputChange('birth_time', e.target.value)}
                helperText="选填，但强烈建议填写以提高分析准确性"
                variant="filled"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <ChineseSelect
                label="性别"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={[
                  { value: 'male', label: '男性' },
                  { value: 'female', label: '女性' }
                ]}
                required
                variant="filled"
              />
              
              <div className="relative">
                <ChineseInput
                  label="出生地点"
                  value={formData.birth_location}
                  onChange={(e) => handleInputChange('birth_location', e.target.value)}
                  placeholder="如：北京市朝阳区"
                  variant="filled"
                  className="pr-10"
                  helperText="选填，用于更精确的地理位置分析"
                />
                <MapPin className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 font-chinese">温馨提示</h4>
              <ul className="text-sm text-red-700 space-y-1 font-chinese">
                <li>• 姓名和出生日期是必填项，对命理分析至关重要</li>
                <li>• 出生时间越精确，分析结果越准确</li>
                <li>• 出生地点有助于更精准的时间校正</li>
              </ul>
            </div>

            <ChineseButton
              type="submit"
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? '保存中...' : '保存档案'}
            </ChineseButton>
          </form>

          {profile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 font-chinese">
                最后更新：{new Date(profile.updated_at).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </ChineseCardContent>
      </ChineseCard>
    </div>
  );
};

export default ProfilePage;