import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localApi } from '../lib/localApi';
import { ChineseButton } from '../components/ui/ChineseButton';
import { ChineseInput } from '../components/ui/ChineseInput';
import { ChineseSelect } from '../components/ui/ChineseSelect';
import { ChineseCard, ChineseCardContent, ChineseCardHeader, ChineseCardTitle } from '../components/ui/ChineseCard';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import { toast } from 'sonner';
import { Sparkles, Star, Compass, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { UserProfile, AnalysisRequest, NumerologyReading } from '../types';
import { cn } from '../lib/utils';

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
    question: '财运'
  });
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 使用useMemo缓存birthDate对象，避免重复渲染导致useEffect重复执行
  const memoizedBirthDate = useMemo(() => {
    if (analysisType === 'bazi' || analysisType === 'ziwei') {
      return {
        date: formData.birth_date,
        time: formData.birth_time,
        name: formData.name,
        gender: formData.gender
      };
    }
    return undefined;
  }, [analysisType, formData.birth_date, formData.birth_time, formData.name, formData.gender]);

  useEffect(() => {
    loadProfile();
  }, [user]);

  // 切换分析类型时清空分析结果
  useEffect(() => {
    setAnalysisResult(null);
  }, [analysisType]);

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
          question: '财运'
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

      // 后端返回格式: { data: { analysis } }
      const analysisData = data.analysis;
      
      setAnalysisResult({
        type: analysisType,
        data: analysisData
      });
      
      // 分析完成后，保存历史记录
      try {
        const inputData = analysisType === 'yijing' ? 
          { question: formData.question, divination_method: 'time' } :
          {
            name: formData.name,
            birth_date: formData.birth_date,
            birth_time: formData.birth_time,
            birth_place: formData.birth_place,
            gender: formData.gender
          };
        
        await localApi.analysis.saveHistory(analysisType, analysisData, inputData);
        console.log('历史记录保存成功');
      } catch (historyError: any) {
        console.error('保存历史记录失败:', historyError);
        // 历史记录保存失败不影响分析结果显示
      }
      
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
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300'
    },
    {
      type: 'ziwei' as AnalysisType,
      title: '紫微斗数',
      description: '通过星曜排布和十二宫位分析性格命运',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300'
    },
    {
      type: 'yijing' as AnalysisType,
      title: '易经占卜',
      description: '运用梅花易数起卦法，解读卦象含义，指导人生决策',
      icon: Compass,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 md:space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 font-chinese mb-2">命理分析</h1>
        <p className="text-gray-600 font-chinese">选择分析方式，探索您的命运密码</p>
      </div>

      {/* 分析类型选择 */}
      <ChineseCard variant="elevated">
        <ChineseCardHeader>
          <ChineseCardTitle className="text-red-600 font-chinese">选择分析类型</ChineseCardTitle>
          <p className="text-gray-600 font-chinese">选择您感兴趣的命理分析方式</p>
        </ChineseCardHeader>
        <ChineseCardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = analysisType === type.type;
              return (
                <div
                  key={type.type}
                  onClick={() => setAnalysisType(type.type)}
                  className={cn(
                    'p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    'hover:shadow-md active:scale-95',
                    isSelected 
                      ? `${type.borderColor} ${type.bgColor} shadow-md` 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isSelected ? type.bgColor : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        isSelected ? type.color : 'text-gray-400'
                      )} />
                    </div>
                    <h3 className={cn(
                      'font-semibold font-chinese text-lg',
                      isSelected ? type.color : 'text-gray-700'
                    )}>
                      {type.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-chinese leading-relaxed">{type.description}</p>
                </div>
              );
            })}
          </div>
        </ChineseCardContent>
      </ChineseCard>

      {/* 分析表单 */}
      <ChineseCard variant="bordered">
        <ChineseCardHeader>
          <ChineseCardTitle className="text-red-600 font-chinese">填写分析信息</ChineseCardTitle>
          <p className="text-gray-600 font-chinese">
            {profile ? '已从您的档案中自动填充，您可以修改' : '请填写以下信息进行分析'}
          </p>
        </ChineseCardHeader>
        <ChineseCardContent>
          {analysisType === 'yijing' ? (
            // 易经占卜表单
            <div className="mb-6">
              <ChineseInput
                label="占卜问题"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="请输入您希望占卜的具体问题，如：我的事业发展如何？"
                required
                variant="filled"
                helperText="💡 提示：问题越具体，占卜结果越准确。可以询问事业、感情、财运、健康等方面的问题。"
              />
            </div>
          ) : (
            // 八字和紫微表单
            <>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div className="relative">
                  <ChineseInput
                    label="姓名"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="请输入真实姓名"
                    variant="filled"
                    className="pr-10"
                  />
                  <User className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <ChineseSelect
                  label="性别"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                  options={[
                    { value: 'male', label: '男性' },
                    { value: 'female', label: '女性' }
                  ]}
                  required
                  variant="filled"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div className="relative">
                  <ChineseInput
                    type="date"
                    label="出生日期"
                    value={formData.birth_date}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 验证日期格式：YYYY-MM-DD，确保年份是4位数字
                      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        return; // 不更新状态，保持原值
                      }
                      setFormData(prev => ({ ...prev, birth_date: value }));
                    }}
                    min="1900-01-01"
                    max="2100-12-31"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_time: e.target.value }))}
                  helperText="选填，但强烈建议填写以提高准确性"
                  variant="filled"
                />
              </div>

              {analysisType !== 'ziwei' && (
                <div className="mb-6">
                  <div className="relative">
                    <ChineseInput
                      label="出生地点"
                      value={formData.birth_place}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_place: e.target.value }))}
                      placeholder="如：北京市朝阳区（选填）"
                      variant="filled"
                      className="pr-10"
                      helperText="选填，用于更精确的地理位置分析"
                    />
                    <MapPin className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </>
          )}

          <ChineseButton
            onClick={handleAnalysis}
            disabled={loading || (analysisType === 'yijing' ? !formData.question : (!formData.name || !formData.birth_date))}
            className="w-full mt-6"
            size="lg"
            variant="primary"
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
          </ChineseButton>
        </ChineseCardContent>
      </ChineseCard>

      {/* 分析结果 */}
      {analysisResult && (
        <AnalysisResultDisplay 
          analysisResult={analysisResult}
          analysisType={analysisType}
          birthDate={memoizedBirthDate}
          question={analysisType === 'yijing' ? formData.question : undefined}
          userId={user?.id?.toString()}
          divinationMethod="time"
        />
      )}
    </div>
  );
};

export default AnalysisPage;