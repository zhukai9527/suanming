import React, { useState } from 'react';
import { Calendar, Clock, Star, BookOpen, Sparkles, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { localApi } from '../lib/localApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// 生辰八字详情数据接口 - 匹配后端返回结构
interface PillarInfo {
  tiangan: string;
  dizhi: string;
  tianganWuxing: string;
  dizhiWuxing: string;
  tianganYinYang: string;
  dizhiYinYang: string;
  combination: string;
  pillarName: string;
  shengxiao?: string;
  tianganMeaning?: string;
  dizhiMeaning?: string;
}

interface BaziApiResponse {
  baziDetails: {
    year: PillarInfo;
    month: PillarInfo;
    day: PillarInfo;
    hour: PillarInfo;
  };
  rizhu: {
    tiangan: string;
    wuxing: string;
    yinyang: string;
    description: string;
    meaning?: string;
  };
  summary: {
    fullBazi: string;
    birthInfo: {
      solarDate: string;
      birthTime: string;
      year: number;
      month: number;
      day: number;
      hour: number;
    };
    pillars: PillarInfo[];
  };
  interpretation: {
    overall: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  };
}

const BaziDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [baziData, setBaziData] = useState<BaziApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 五行颜色配置
  const wuxingColors: { [key: string]: string } = {
    '木': 'text-green-600 bg-green-50 border-green-300',
    '火': 'text-red-600 bg-red-50 border-red-300',
    '土': 'text-yellow-600 bg-yellow-50 border-yellow-300',
    '金': 'text-gray-600 bg-gray-50 border-gray-300',
    '水': 'text-blue-600 bg-blue-50 border-blue-300'
  };

  // 阴阳颜色配置
  const yinyangColors: { [key: string]: string } = {
    '阳': 'text-orange-600 bg-orange-50 border-orange-300',
    '阴': 'text-purple-600 bg-purple-50 border-purple-300'
  };

  // 获取八字详细信息
  const fetchBaziDetails = async () => {
    if (!birthDate) {
      toast.error('请选择您的出生日期');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用本地API
      const response = await localApi.functions.invoke('bazi-details', {
        body: {
          birthDate,
          birthTime
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.data) {
        setBaziData(response.data.data);
        toast.success('八字详情分析完成！');
      } else {
        throw new Error('排盘结果为空');
      }
    } catch (err: any) {
      console.error('八字排盘错误:', err);
      setError(err.message || '分析失败，请稍后重试');
      toast.error('分析失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染四柱信息卡片
  const renderPillarCard = (pillar: PillarInfo | null | undefined, index: number) => {
    // 防护性检查：确保 pillar 对象存在
    if (!pillar) {
      return (
        <Card key={index} className="chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">柱信息加载中...</p>
          </CardContent>
        </Card>
      );
    }

    const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
    const pillarDescriptions = [
      '代表祖辈与早年运势',
      '代表父母与青年运势',
      '代表自身与配偶',
      '代表子女与晚年运势'
    ];

    return (
      <Card key={index} className="chinese-card-decoration hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
        <CardHeader className="text-center">
          <CardTitle className="text-red-800 text-xl font-bold chinese-text-shadow">
            {pillarNames[index] || '未知柱'}
          </CardTitle>
          <p className="text-red-600 text-sm">{pillarDescriptions[index] || '描述加载中'}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 天干地支大显示 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-800 chinese-text-shadow mb-2">
              {pillar?.combination || '未知'}
            </div>
            <div className="text-sm text-gray-600">
              {pillar?.tiangan || '未知'} ({pillar?.tianganYinYang || '未知'}) + {pillar?.dizhi || '未知'} ({pillar?.dizhiYinYang || '未知'})
            </div>
          </div>

          {/* 天干信息 */}
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg p-3">
            <h4 className="font-bold text-red-700 mb-2">天干：{pillar?.tiangan || '未知'}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`px-2 py-1 rounded border ${pillar?.tianganWuxing && wuxingColors[pillar.tianganWuxing] ? wuxingColors[pillar.tianganWuxing] : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                五行：{pillar?.tianganWuxing || '未知'}
              </div>
              <div className={`px-2 py-1 rounded border ${pillar?.tianganYinYang && yinyangColors[pillar.tianganYinYang] ? yinyangColors[pillar.tianganYinYang] : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                阴阳：{pillar?.tianganYinYang || '未知'}
              </div>
            </div>
          </div>

          {/* 地支信息 */}
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-lg p-3">
            <h4 className="font-bold text-red-700 mb-2">地支：{pillar?.dizhi || '未知'}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`px-2 py-1 rounded border ${pillar?.dizhiWuxing && wuxingColors[pillar.dizhiWuxing] ? wuxingColors[pillar.dizhiWuxing] : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                五行：{pillar?.dizhiWuxing || '未知'}
              </div>
              <div className={`px-2 py-1 rounded border ${pillar?.dizhiYinYang && yinyangColors[pillar.dizhiYinYang] ? yinyangColors[pillar.dizhiYinYang] : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                阴阳：{pillar?.dizhiYinYang || '未知'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 relative">
      {/* 页面装饰背景 */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <img 
          src="/chinese_traditional_golden_ornate_frame.png" 
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute top-20 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <img 
          src="/chinese_traditional_golden_ornate_frame.png" 
          alt=""
          className="w-full h-full object-contain rotate-180"
        />
      </div>

      {/* 标题区域 */}
      <div className="text-center space-y-4 relative z-10">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-3 border-red-600">
          <BookOpen className="w-8 h-8 text-red-800" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-red-800 chinese-text-shadow font-serif">
          生辰八字
          <span className="block text-lg text-yellow-600 mt-2 font-normal">
            详细展示您的四柱信息与命理特征
          </span>
        </h1>
      </div>

      {/* 输入区域 */}
      <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-yellow-600" />
            输入您的出生信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                出生日期 *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                出生时间
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-800"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button 
              onClick={fetchBaziDetails}
              disabled={isLoading || !birthDate}
              size="lg"
              className="w-full chinese-red-glow text-white hover:shadow-xl transition-all duration-300 border-2 border-yellow-400"
            >
              {isLoading ? (
                <>加载中...</>
              ) : (
                <>
                  <Star className="mr-2 h-5 w-5" />
                  开始八字详情
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-400 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <Card className="chinese-card-decoration border-2 border-yellow-400">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-red-700 text-lg font-medium">正在进行八字排盘分析...</p>
              <p className="text-red-600 text-sm">请稍候，这需要一些时间来计算您的详细八字信息</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 八字详情结果 */}
      {baziData && !isLoading && (
        <div className="space-y-8">
          {/* 八字概览 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
                八字概览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-red-800 chinese-text-shadow mb-4">
                    {baziData.summary?.fullBazi || '未知'}
                  </h3>
                  <p className="text-red-600 text-lg mb-4">
                    出生日期：{baziData.summary?.birthInfo?.solarDate || '未知'} {baziData.summary?.birthInfo?.birthTime || '未知'}
                  </p>
                  <p className="text-red-700 leading-relaxed">
                    {baziData.interpretation?.overall || '暂无详细分析'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 日主信息 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <User className="mr-2 h-6 w-6 text-yellow-600" />
                日主信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-red-800 chinese-text-shadow mb-4">
                    {baziData.rizhu?.tiangan || '未知'}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-lg border-2 ${baziData.rizhu?.wuxing ? wuxingColors[baziData.rizhu.wuxing] || 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-300'}`}>
                      <span className="font-bold">五行：{baziData.rizhu?.wuxing || '未知'}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 ${baziData.rizhu?.yinyang ? yinyangColors[baziData.rizhu.yinyang] || 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-300'}`}>
                      <span className="font-bold">阴阳：{baziData.rizhu?.yinyang || '未知'}</span>
                    </div>
                  </div>
                  <p className="text-red-700 leading-relaxed">
                    {baziData.rizhu?.description || '暂无详细描述'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 四柱详细信息 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow text-center">
                四柱详细信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {baziData?.baziDetails ? [
                  baziData.baziDetails.year, 
                  baziData.baziDetails.month, 
                  baziData.baziDetails.day, 
                  baziData.baziDetails.hour
                ].map((pillar, index) => 
                  renderPillarCard(pillar, index)
                ) : (
                  <div className="col-span-full text-center text-red-600 py-8">
                    四柱数据加载中...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 命理解释 */}
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-yellow-600" />
                命理解释
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="space-y-4">
                  {baziData.interpretation && Object.entries(baziData.interpretation).map(([key, value], index) => {
                    if (key === 'overall') return null; // 已在概览中显示
                    const titles: { [key: string]: string } = {
                      yearPillar: '年柱解释',
                      monthPillar: '月柱解释', 
                      dayPillar: '日柱解释',
                      hourPillar: '时柱解释'
                    };
                    return (
                      <div key={key} className="flex items-start space-x-3 p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-red-800 font-bold text-sm">{index}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-red-800 mb-1">{titles[key] || '说明'}</h4>
                          <p className="text-red-700 font-medium">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BaziDetailsPage;