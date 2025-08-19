import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localApi } from '../lib/localApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import { toast } from 'sonner';
import { Sparkles, Star, Compass, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { UserProfile, AnalysisRequest, NumerologyReading } from '../types';

type AnalysisType = 'bazi' | 'ziwei' | 'yijing';

const AnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('bazi');
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    gender: 'male' as 'male' | 'female',
    birth_place: '',
    question: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const response = await localApi.profiles.get();
      if (response.data && response.data.profile) {
        const data = response.data.profile;
        setProfile(data);
        setFormData({
          name: data.full_name || '',
          birth_date: data.birth_date || '',
          birth_time: data.birth_time || '',
          gender: data.gender || 'male',
          birth_place: data.birth_location || '',
          question: ''
        });
      }
    } catch (error) {
      console.error('加载档案失败:', error);
    }
  };

  const handleAnalysis = async () => {
    if (!user) return;
    
    // 根据分析类型验证必要参数
    if (analysisType === 'yijing') {
      if (!formData.question) {
        toast.error('请填写占卜问题');
        return;
      }
    } else {
      if (!formData.name || !formData.birth_date) {
        toast.error('请填写姓名和出生日期');
        return;
      }
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const birthData = {
        name: formData.name,
        birth_date: formData.birth_date,
        birth_time: formData.birth_time,
        gender: formData.gender,
        birth_place: formData.birth_place
      };

      let response;
      
      // 根据分析类型调用相应的API
      switch (analysisType) {
        case 'bazi':
          response = await localApi.analysis.bazi(birthData);
          break;
        case 'ziwei':
          response = await localApi.analysis.ziwei(birthData);
          break;
        case 'yijing':
          const yijingData = {
            question: formData.question,
            user_id: user.id,
            divination_method: 'time'
          };
          response = await localApi.analysis.yijing(yijingData);
          break;
        default:
          throw new Error(`不支持的分析类型: ${analysisType}`);
      }

      const { data, error } = response;

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error.message);
      }

      // 后端返回格式: { data: { record_id, analysis } }
      setAnalysisResult({
        type: analysisType,
        data: data.analysis
      });
      toast.success('分析完成！');
    } catch (error: any) {
      console.error('分析失败:', error);
      toast.error('分析失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const analysisTypes = [
    {
      type: 'bazi' as AnalysisType,
      title: '八字命理',
      description: '基于传统八字学说，分析五行平衡、格局特点、四柱信息',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      type: 'ziwei' as AnalysisType,
      title: '紫微斗数',
      description: '通过星曜排布和十二宫位分析性格命运',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'yijing' as AnalysisType,
      title: '易经占卜',
      description: '运用梅花易数起卦法，解读卦象含义，指导人生决策',
      icon: Compass,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 分析类型选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择分析类型</CardTitle>
          <p className="text-gray-600">选择您感兴趣的命理分析方式</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {analysisTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = analysisType === type.type;
              return (
                <div
                  key={type.type}
                  onClick={() => setAnalysisType(type.type)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? `${type.borderColor} ${type.bgColor}` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-6 w-6 ${isSelected ? type.color : 'text-gray-400'}`} />
                    <h3 className={`font-medium ${isSelected ? type.color : 'text-gray-700'}`}>
                      {type.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 分析表单 */}
      <Card>
        <CardHeader>
          <CardTitle>填写分析信息</CardTitle>
          <p className="text-gray-600">
            {profile ? '已从您的档案中自动填充，您可以修改' : '请填写以下信息进行分析'}
          </p>
        </CardHeader>
        <CardContent>
          {analysisType === 'yijing' ? (
            // 易经占卜表单
            <div className="mb-6">
              <Input
                label="占卜问题 *"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="请输入您希望占卜的具体问题，如：我的事业发展如何？"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 提示：问题越具体，占卜结果越准确。可以询问事业、感情、财运、健康等方面的问题。
              </p>
            </div>
          ) : (
            // 八字和紫微表单
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Input
                    label="姓名 *"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="请输入真实姓名"
                  />
                  <User className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <Select
                  label="性别 *"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                  options={[
                    { value: 'male', label: '男性' },
                    { value: 'female', label: '女性' }
                  ]}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Input
                    type="date"
                    label="出生日期 *"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    required
                  />
                  <Calendar className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <Input
                  type="time"
                  label="出生时间"
                  value={formData.birth_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_time: e.target.value }))}
                  placeholder="选填，但强烈建议填写"
                />
              </div>

              {analysisType !== 'ziwei' && (
                <div className="mb-6">
                  <div className="relative">
                    <Input
                      label="出生地点"
                      value={formData.birth_place}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_place: e.target.value }))}
                      placeholder="如：北京市朝阳区（选填）"
                    />
                    <MapPin className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            onClick={handleAnalysis}
            disabled={loading || (analysisType === 'yijing' ? !formData.question : (!formData.name || !formData.birth_date))}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                开始{analysisTypes.find(t => t.type === analysisType)?.title}分析
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 分析结果 */}
      {analysisResult && (
        <AnalysisResultDisplay 
          analysisResult={analysisResult}
          analysisType={analysisType}
          birthDate={(analysisType === 'bazi' || analysisType === 'ziwei') ? {
            date: formData.birth_date,
            time: formData.birth_time
          } : undefined}
          question={analysisType === 'yijing' ? formData.question : undefined}
          userId={user?.id}
          divinationMethod="time"
        />
      )}
    </div>
  );
};

export default AnalysisPage;