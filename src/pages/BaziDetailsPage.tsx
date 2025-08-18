import React, { useState } from 'react';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import CompleteBaziAnalysis from '../components/CompleteBaziAnalysis';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BirthData {
  date: string;
  time: string;
  name?: string;
  gender?: string;
}

const BaziDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [birthData, setBirthData] = useState<BirthData>({
    date: '',
    time: '12:00',
    name: user?.name || '',
    gender: 'male'
  });

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setBirthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyze = () => {
    if (!birthData.date) {
      toast.error('请选择您的出生日期');
      return;
    }

    if (!birthData.time) {
      toast.error('请选择您的出生时间');
      return;
    }

    setShowAnalysis(true);
    toast.success('开始进行专业八字分析...');
  };

  const handleBack = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
    } else {
      navigate('/analysis');
    }
  };

  const handleReset = () => {
    setBirthData({
      date: '',
      time: '12:00',
      name: user?.name || '',
      gender: 'male'
    });
    setShowAnalysis(false);
  };

  // 如果显示分析结果，直接渲染CompleteBaziAnalysis组件
  if (showAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
        {/* 顶部导航栏 */}
        <div className="bg-white shadow-sm border-b border-yellow-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回设置</span>
              </Button>
              
              <div className="text-center">
                <h1 className="text-xl font-bold text-red-800">专业八字命理分析</h1>
                <p className="text-sm text-red-600">
                  {birthData.name} • {birthData.date} • {birthData.time}
                </p>
              </div>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                重新分析
              </Button>
            </div>
          </div>
        </div>
        
        {/* 分析结果 */}
        <CompleteBaziAnalysis birthDate={birthData} />
      </div>
    );
  }

  // 显示输入表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回分析页面</span>
          </Button>
        </div>

        {/* 主标题 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400 mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-red-800 text-3xl font-bold chinese-text-shadow">
              专业八字命理分析
            </CardTitle>
            <p className="text-red-600 mt-2">
              基于传统四柱八字理论，为您提供精准的命理分析和人生指导
            </p>
          </CardHeader>
        </Card>

        {/* 输入表单 */}
        <Card className="chinese-card-decoration border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-xl font-bold chinese-text-shadow text-center">
              请输入您的出生信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-8">
              <div className="space-y-6">
                {/* 姓名输入 */}
                <div className="space-y-2">
                  <label className="flex items-center text-red-800 font-semibold">
                    <User className="h-5 w-5 mr-2 text-yellow-600" />
                    姓名（可选）
                  </label>
                  <input
                    type="text"
                    value={birthData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:border-red-400 focus:outline-none transition-colors bg-white"
                  />
                </div>

                {/* 性别选择 */}
                <div className="space-y-2">
                  <label className="flex items-center text-red-800 font-semibold">
                    <User className="h-5 w-5 mr-2 text-yellow-600" />
                    性别
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={birthData.gender === 'male'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-700">男性</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={birthData.gender === 'female'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-700">女性</span>
                    </label>
                  </div>
                </div>

                {/* 出生日期 */}
                <div className="space-y-2">
                  <label className="flex items-center text-red-800 font-semibold">
                    <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                    出生日期 *
                  </label>
                  <input
                    type="date"
                    value={birthData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:border-red-400 focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* 出生时间 */}
                <div className="space-y-2">
                  <label className="flex items-center text-red-800 font-semibold">
                    <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                    出生时间 *
                  </label>
                  <input
                    type="time"
                    value={birthData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:border-red-400 focus:outline-none transition-colors bg-white"
                    required
                  />
                  <p className="text-sm text-red-600">
                    请尽量提供准确的出生时间，这对八字分析的准确性非常重要
                  </p>
                </div>

                {/* 分析按钮 */}
                <div className="pt-6">
                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    开始专业八字分析
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <Card className="chinese-card-decoration border-2 border-yellow-400 mt-8">
          <CardContent className="p-6">
            <div className="text-center text-red-700">
              <h3 className="font-bold text-lg mb-4">专业八字分析包含</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-yellow-300">
                  <div className="font-semibold mb-1">🏛️ 四柱详解</div>
                  <div>年月日时柱专业解释</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-300">
                  <div className="font-semibold mb-1">⚡ 五行分析</div>
                  <div>五行旺衰与平衡调理</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-300">
                  <div className="font-semibold mb-1">🌟 格局判定</div>
                  <div>命理格局与发展方向</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-300">
                  <div className="font-semibold mb-1">📅 大运流年</div>
                  <div>未来六年详细预测</div>
                </div>
              </div>
              <p className="text-xs mt-4 text-red-600">
                本分析基于传统四柱八字理论，结合现代命理学研究成果，为您提供专业准确的命理指导
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BaziDetailsPage;