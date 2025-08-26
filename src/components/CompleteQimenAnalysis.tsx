import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Hexagon, Clock, MapPin, Star, Compass, Target, TrendingUp, AlertTriangle, Calendar, BookOpen, Sparkles, User, BarChart3, Zap, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { BackToTop } from './ui/BackToTop';
import DownloadButton from './ui/DownloadButton';
import AIInterpretationButton from './ui/AIInterpretationButton';
import AIConfigModal from './ui/AIConfigModal';

interface QimenAnalysisProps {
  analysis: any;
  className?: string;
  recordId?: number;
}

const CompleteQimenAnalysis: React.FC<QimenAnalysisProps> = ({ analysis, className, recordId }) => {
  const [showAIConfig, setShowAIConfig] = useState(false);
  
  if (!analysis) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500 font-chinese">暂无奇门遁甲分析数据</p>
      </div>
    );
  }

  // 从后端返回的嵌套结构中提取数据
  const qimenPan = analysis?.detailed_analysis?.qimen_pan;
  const yongShenAnalysis = analysis?.detailed_analysis?.yongshen_analysis;
  const patterns = analysis?.detailed_analysis?.pattern_analysis;
  const prediction = analysis?.prediction_result;
  const timeInfo = analysis?.basic_info?.qimen_info;
  const basicInfo = analysis?.basic_info;
  const guidance = analysis?.guidance;

  // 用神类型中文映射 - 移到组件级别
  const yongShenNameMap = {
    'rigan': '日干（求测人）',
    'self': '自身',
    'spouse': '配偶',
    'matchmaker': '媒人',
    'wealth': '财运',
    'capital': '资本',
    'opportunity': '机会',
    'illness': '疾病',
    'doctor': '医生',
    'medicine': '药物',
    'lawsuit': '官司',
    'judge': '法官',
    'opponent': '对手',
    'job': '工作',
    'company': '公司',
    'process': '过程',
    'matter': '事情',
    'result': '结果',
    'favorability': '有利度',
    'strength': '力量强度',
    'timing': '时机评估',
    'recommendation': '建议',
    // 用神分析详细字段中文映射
    'element': '天干',
    'position': '宫位',
    'palaceName': '宫位名称',
    'wangshui': '旺衰',
    'wangshuiScore': '旺衰评分',
    'palaceRelation': '宫位关系',
    'palaceHarmony': '宫位和谐度',
    'seasonalInfluence': '季节影响',
    'seasonalScore': '季节评分',
    'totalScore': '综合评分',
    'status': '状态',
    'description': '详细描述',
    // 构成要素字段中文映射
    'qi': '奇',
    'star': '星',
    'door': '门',
    'god': '神',
    // 时机相关字段中文映射
    'bestTime': '最佳时机',
    'avoidTime': '避免时机',
    'score': '评分',
    'factors': '影响因素',
    'analysis': '详细分析',
    'zhifuAnalysis': '值符分析',
    'zhishiAnalysis': '值使分析',
    'hourAnalysis': '时辰分析',
    'seasonAnalysis': '节气分析',
    'yindunAnalysis': '阴阳遁分析',
    // 基础信息字段中文映射
    'method': '占卜方法',
    'zhifu': '值符',
    'zhishi': '值使',
    'season': '季节',
    'daymaster': '日主',
    'dayMaster': '日主',
    'jieqi': '节气',
    'yuan': '元',
    'jushu': '局数',
    'yindun': '阴阳遁',
    'ganzhi': '干支',
    'year': '年',
    'month': '月',
    'day': '日',
    'hour': '时',
    'gan': '干',
    'zhi': '支',
    // 奇门盘字段中文映射
    'palace': '宫位',
    'wuxing': '五行',
    // 财运相关字段
    'profit': '利润',
    'investment': '投资',
    'money': '金钱',
    'finance': '财务',
    'business': '生意',
    'career': '事业',
    'work': '工作',
    'success': '成功',
    'failure': '失败',
    'risk': '风险',
    'challenge': '挑战',
    'advantage': '优势',
    'disadvantage': '劣势',
    // 用神分析字段（移除重复项）
    'helper': '帮助者',
    'obstacle': '阻碍',
    // 五行分析字段（移除重复项）
    // 时机分析字段（移除重复项）
    'unfavorable': '不利',
    'neutral': '中性',
    // 其他常见字段
    'true': '是',
    'false': '否',
    'unknown': '未知',
    'good': '好',
    'bad': '差',
    'excellent': '极佳',
    'poor': '很差',
    'average': '一般',
    // 感情相关字段
    'relationship': '感情关系',
    'marriage_palace': '婚姻宫',
    'relationship_door': '感情门',
    'love': '爱情',
    'marriage': '婚姻',
    'partner': '伴侣',
    'emotion': '情感',
    'affection': '感情',
    'romance': '浪漫',
    'compatibility': '相配度',
    'harmony': '和谐度',
    'conflict': '冲突',
    'separation': '分离',
    'reunion': '复合',
    'commitment': '承诺',
    'trust': '信任',
    'loyalty': '忠诚'
  };

  const getYongShenName = (key: string) => {
    return yongShenNameMap[key] || key;
  };

  // 用神分析值的中文映射
  const getChineseValue = (key: string, value: any) => {
    // 旺衰状态映射
    const wangshuiMap = {
      '旺': '旺',
      '相': '相', 
      '休': '休',
      '囚': '囚',
      '死': '死'
    };
    
    // 状态映射
    const statusMap = {
      '很强': '很强',
      '较强': '较强',
      '一般': '一般',
      '较弱': '较弱',
      '很弱': '很弱'
    };
    
    // 布尔值映射
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    
    // 数组类型处理
    if (Array.isArray(value)) {
      return value.join('、');
    }
    
    // 数值处理 - 将小数转换为整数
    if (typeof value === 'number') {
      if (key.includes('score') || key.includes('度') || key === 'favorability' || key === 'wangshuiScore' || key === 'seasonalScore' || key === 'totalScore') {
        return Math.round(value).toString();
      }
      return value.toString();
    }
    
    // 对象类型处理
    if (typeof value === 'object' && value !== null) {
      // 如果是时机对象，特殊处理 - 简化显示
      if (key === 'timing' && typeof value === 'object') {
        try {
          // 提取关键信息进行简化显示
          const timing = value.timing || '未知';
          const score = value.score ? Math.round(value.score) : '';
          const recommendation = value.recommendation || '';
          
          // 构建简洁的显示文本
          let result = timing;
          if (score) {
            result += `（${score}分）`;
          }
          if (recommendation && recommendation !== timing) {
            result += ` - ${recommendation}`;
          }
          
          return result;
        } catch (error) {
          console.error('时机对象处理错误:', error, value);
          return '时机评估信息异常';
        }
      }
      
      // 其他对象类型，尝试格式化显示
      try {
        const entries = Object.entries(value).map(([k, v]) => {
          const chineseKey = getYongShenName(k);
          if (Array.isArray(v)) {
            return `${chineseKey}：${v.join('、')}`;
          } else if (typeof v === 'object' && v !== null) {
            const subEntries = Object.entries(v).map(([subK, subV]) => {
              const subChineseKey = getYongShenName(subK);
              // 处理嵌套对象中的数值
              if (typeof subV === 'number' && (subK.includes('score') || subK.includes('度') || subK === 'favorability')) {
                return `${subChineseKey}：${Math.round(subV)}`;
              }
              return `${subChineseKey}：${String(subV)}`;
            });
            return `${chineseKey}：${subEntries.join('；')}`;
          } else {
            // 处理直接数值
            if (typeof v === 'number' && (k.includes('score') || k.includes('度') || k === 'favorability')) {
              return `${chineseKey}：${Math.round(v)}`;
            }
            return `${chineseKey}：${String(v)}`;
          }
        });
        return entries.join('，');
      } catch (e) {
        console.error('对象处理错误:', e, value);
        return JSON.stringify(value, null, 2);
      }
    }
    
    // 特定字段的值映射
    if (key === 'wangshui' && wangshuiMap[value]) {
      return wangshuiMap[value];
    }
    
    if (key === 'status' && statusMap[value]) {
      return statusMap[value];
    }
    
    return String(value);
  };

  // 渲染专业奇门盘九宫格（参考传统专业样式）
  const renderQimenPan = () => {
    if (!qimenPan || !qimenPan.dipan) return null;

    // 传统奇门盘布局：巽离坎/震中乾/兑坤艮
    const gridPositions = [
      [3, 8, 0], // 上排：巽四宫、离九宫、坎一宫
      [2, 4, 5], // 中排：震三宫、中五宫、乾六宫
      [6, 1, 7]  // 下排：兑七宫、坤二宫、艮八宫
    ];
    
    const palaceNames = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'];
    const palaceNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const palaceElements = ['水', '土', '木', '木', '土', '金', '金', '土', '火'];
    
    // 地支对应
    const palaceZhi = ['子', '未', '卯', '辰', '戊', '戌', '酉', '丑', '午'];
    
    // 获取宫位颜色
    const getPalaceColor = (palaceIndex: number, palace: any) => {
      const isCenter = palaceIndex === 4;
      if (isCenter) return 'bg-yellow-100 border-yellow-400';
      
      // 根据九星设置颜色
      const starColors = {
        '天蓬': 'bg-blue-50 border-blue-300',
        '天任': 'bg-green-50 border-green-300', 
        '天冲': 'bg-red-50 border-red-300',
        '天辅': 'bg-purple-50 border-purple-300',
        '天英': 'bg-orange-50 border-orange-300',
        '天芮': 'bg-gray-50 border-gray-300',
        '天柱': 'bg-indigo-50 border-indigo-300',
        '天心': 'bg-pink-50 border-pink-300',
        '天禽': 'bg-yellow-50 border-yellow-300'
      };
      
      return starColors[palace?.star] || 'bg-gray-50 border-gray-300';
    };
    
    // 获取门的颜色
    const getDoorColor = (door: string) => {
      const doorColors = {
        '休门': 'text-blue-600',
        '生门': 'text-green-600',
        '伤门': 'text-red-600',
        '杜门': 'text-gray-600',
        '景门': 'text-orange-600',
        '死门': 'text-black',
        '惊门': 'text-purple-600',
        '开门': 'text-yellow-600'
      };
      return doorColors[door] || 'text-gray-600';
    };
    
    // 获取神的颜色
    const getGodColor = (god: string) => {
      const godColors = {
        '值符': 'text-red-700',
        '腾蛇': 'text-red-500',
        '太阴': 'text-blue-700',
        '六合': 'text-green-700',
        '白虎': 'text-gray-700',
        '玄武': 'text-black',
        '九地': 'text-yellow-700',
        '九天': 'text-purple-700'
      };
      return godColors[god] || 'text-gray-600';
    };

    return (
      <div className="space-y-6">
        {/* 四柱信息和基本信息 */}
        {timeInfo?.ganzhi && (
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 p-4 rounded-lg border border-red-200">
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-red-800">
                四柱：{timeInfo.ganzhi.year?.gan}{timeInfo.ganzhi.year?.zhi}年 {timeInfo.ganzhi.month?.gan}{timeInfo.ganzhi.month?.zhi}月 {timeInfo.ganzhi.day?.gan}{timeInfo.ganzhi.day?.zhi}日 {timeInfo.ganzhi.hour?.gan}{timeInfo.ganzhi.hour?.zhi}时
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-red-700">
                <div>节气：{timeInfo.jieqi || '未知'}</div>
                <div>元运：{timeInfo.yuan || '未知'}</div>
                <div>局数：{qimenPan?.yindun ? '阴遁' : '阳遁'}{qimenPan?.jushu || ''}局</div>
                <div>旬首：甲戌旬</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-red-700">
                <div>值符：{timeInfo.zhifu || '未知'}</div>
                <div>值使：{timeInfo.zhishi || '未知'}</div>
                <div>空亡：申酉</div>
              </div>
            </div>
          </div>
        )}

        {/* 专业九宫格奇门盘 */}
         <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto p-2 sm:p-4">
           <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 w-full">
             {gridPositions.map((row, rowIndex) =>
               row.map((palaceIndex, colIndex) => {
                 const palace = qimenPan.dipan[palaceIndex];
                 const isCenter = palaceIndex === 4;
                 const colorClass = getPalaceColor(palaceIndex, palace);
                 
                 return (
                   <div
                     key={`${rowIndex}-${colIndex}`}
                     className={cn(
                       'aspect-square border-2 relative flex flex-col justify-between',
                       'min-h-[70px] min-w-[70px] sm:min-h-[80px] sm:min-w-[80px] md:min-h-[90px] md:min-w-[90px]',
                       'p-0.5 sm:p-1 md:p-2',
                       colorClass,
                       isCenter && 'border-4 border-yellow-500 bg-yellow-200'
                     )}
                   >
                     {/* 顶部行：宫位信息 */}
                     <div className="flex justify-between items-start text-[10px] sm:text-xs leading-none">
                       <div className="text-red-800 font-bold">
                         <div className="text-[10px] sm:text-xs">{palaceNames[palaceIndex]}</div>
                         <div className="text-gray-600 text-[8px] sm:text-[10px]">{palaceNumbers[palaceIndex]}</div>
                       </div>
                       <div className="text-center">
                         <div className="text-blue-700 font-medium text-[10px] sm:text-xs">{palaceElements[palaceIndex]}</div>
                         <div className="text-gray-700 text-[8px] sm:text-[10px]">{palaceZhi[palaceIndex]}</div>
                       </div>
                     </div>
                     
                     {/* 中心区域：主要信息 */}
                     <div className="flex-1 flex flex-col justify-center items-center">
                       {/* 天干 - 最大最显眼 */}
                       {palace?.gan && (
                         <div className="text-black font-bold text-sm sm:text-lg md:text-xl">
                           {palace.gan}
                         </div>
                       )}
                       
                       {/* 九星 */}
                       {palace?.star && (
                         <div className="text-blue-700 font-bold text-[8px] sm:text-xs">
                           {palace.star}
                         </div>
                       )}
                     </div>
                     
                     {/* 底部行：门神信息 */}
                     <div className="flex justify-between items-end text-[8px] sm:text-xs font-bold">
                       {/* 左下角：八门 */}
                       <div>
                         {palace?.door && (
                           <div className={getDoorColor(palace.door)}>
                             {palace.door}
                           </div>
                         )}
                       </div>
                       
                       {/* 右下角：八神 */}
                       <div>
                         {palace?.god && (
                           <div className={getGodColor(palace.god)}>
                             {palace.god}
                           </div>
                         )}
                       </div>
                     </div>
                     
                     {/* 特殊标记 */}
                     {palace?.special && (
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                         <div className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                           {palace.special}
                         </div>
                       </div>
                     )}
                   </div>
                 );
               })
             )}
           </div>
         </div>
        
        {/* 颜色和符号说明 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-red-800 mb-3 text-center">奇门盘要素说明</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-red-700 mb-2">九星（天时）：</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-200 rounded mr-1"></span>天蓬（水）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-green-200 rounded mr-1"></span>天任（土）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-200 rounded mr-1"></span>天冲（木）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-purple-200 rounded mr-1"></span>天辅（木）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-orange-200 rounded mr-1"></span>天英（火）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-gray-200 rounded mr-1"></span>天芮（土）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-indigo-200 rounded mr-1"></span>天柱（金）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-pink-200 rounded mr-1"></span>天心（金）</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-200 rounded mr-1"></span>天禽（土）</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-red-700 mb-2">八门（人事）：</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-blue-600">休门（水）</div>
                <div className="text-green-600">生门（土）</div>
                <div className="text-red-600">伤门（木）</div>
                <div className="text-gray-600">杜门（木）</div>
                <div className="text-orange-600">景门（火）</div>
                <div className="text-black">死门（土）</div>
                <div className="text-purple-600">惊门（金）</div>
                <div className="text-yellow-600">开门（金）</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="font-semibold text-red-700 mb-2">八神（神煞）：</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-red-700">值符</div>
              <div className="text-red-500">腾蛇</div>
              <div className="text-blue-700">太阴</div>
              <div className="text-green-700">六合</div>
              <div className="text-gray-700">白虎</div>
              <div className="text-black">玄武</div>
              <div className="text-yellow-700">九地</div>
              <div className="text-purple-700">九天</div>
            </div>
          </div>
        </div>
        
        {/* 奇门盘解读要点 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-red-800 mb-3">奇门盘解读要点</h4>
          <div className="text-sm text-red-700 space-y-2">
            <div>• <strong>天干：</strong>位于宫位中央，代表事物的本质和核心</div>
            <div>• <strong>九星：</strong>位于天干下方，代表天时和自然规律</div>
            <div>• <strong>八门：</strong>位于左下角，代表人事活动和行动方式</div>
            <div>• <strong>八神：</strong>位于右下角，代表神煞和隐性因素</div>
            <div>• <strong>宫位：</strong>九宫代表不同的方位和领域</div>
            <div>• <strong>颜色：</strong>不同颜色代表不同的五行属性和吉凶性质</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染用神分析
  const renderYongShenAnalysis = () => {
    if (!yongShenAnalysis) return null;

    const renderYongShenItem = (key: string, value: any, bgColor: string, textColor: string) => {
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} className={`${bgColor} p-4 rounded-lg border-l-4 border-${textColor.split('-')[1]}-500`}>
            <div className={`font-bold ${textColor} mb-2`}>{getYongShenName(key)}</div>
            <div className="space-y-2">
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getYongShenName(subKey)}：</span>
                  <span className="text-red-700 font-medium">{getChineseValue(subKey, subValue)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        return (
          <div key={key} className={`${bgColor} p-3 rounded-lg border border-${textColor.split('-')[1]}-200`}>
            <div className={`font-medium ${textColor} mb-1`}>{getYongShenName(key)}</div>
            <div className="text-red-700 text-sm leading-relaxed">{getChineseValue(key, value)}</div>
          </div>
        );
      }
    };

    return (
      <div className="space-y-6">
        {/* 用神概述 */}
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
          <h4 className="font-bold text-red-800 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            用神概述
          </h4>
          <p className="text-red-700 leading-relaxed text-sm">
            用神是奇门遁甲分析的核心要素，代表与占卜问题相关的关键因素。通过分析用神在奇门盘中的状态、位置和相互关系，
            可以判断事情的发展趋势、成功概率和最佳时机。不同类型的问题对应不同的用神配置。
          </p>
        </div>

        {yongShenAnalysis.primary && Object.keys(yongShenAnalysis.primary).length > 0 && (
          <div>
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              主要用神分析
            </h4>
            <p className="text-red-600 text-sm mb-3">主要用神是与占卜问题直接相关的核心要素，其状态直接影响事情的成败。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(yongShenAnalysis.primary).map(([key, value]: [string, any]) => 
                renderYongShenItem(key, value, 'bg-red-50', 'text-red-700')
              )}
            </div>
          </div>
        )}

        {yongShenAnalysis.secondary && Object.keys(yongShenAnalysis.secondary).length > 0 && (
          <div>
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              次要用神分析
            </h4>
            <p className="text-red-600 text-sm mb-3">次要用神是影响事情发展的辅助因素，虽不是决定性的，但对结果有重要影响。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(yongShenAnalysis.secondary).map(([key, value]: [string, any]) => 
                renderYongShenItem(key, value, 'bg-blue-50', 'text-blue-700')
              )}
            </div>
          </div>
        )}

        {yongShenAnalysis.auxiliary && Object.keys(yongShenAnalysis.auxiliary).length > 0 && (
          <div>
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <Compass className="w-5 h-5 mr-2" />
              辅助用神分析
            </h4>
            <p className="text-red-600 text-sm mb-3">辅助用神提供额外的参考信息，有助于全面理解事情的发展环境和背景。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(yongShenAnalysis.auxiliary).map(([key, value]: [string, any]) => 
                renderYongShenItem(key, value, 'bg-green-50', 'text-green-700')
              )}
            </div>
          </div>
        )}

        {yongShenAnalysis.overall && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              用神综合评估
            </h4>
            <div className="text-red-700 leading-relaxed">
              {typeof yongShenAnalysis.overall === 'string' 
                ? (
                  <p className="text-lg">{yongShenAnalysis.overall}</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(yongShenAnalysis.overall).map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-purple-700">{getYongShenName(key)}：</span>
                          <span className="text-red-700 font-bold">
                            {key === 'favorability' ? `${Math.round(Number(value))}分` : getChineseValue(key, value)}
                          </span>
                        </div>
                        {key === 'favorability' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  Number(value) >= 70 ? 'bg-green-500' : 
                                  Number(value) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(Number(value), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染格局识别
  const renderPatterns = () => {
    if (!patterns || patterns.length === 0) return null;

    // 格局类型中文映射
    const patternTypeMap = {
      '三奇格局': '三奇格局（乙丙丁三奇的特殊组合）',
      '六仪格局': '六仪格局（戊己庚辛壬癸六仪的特殊组合）',
      '特殊格局': '特殊格局（罕见的吉凶组合）',
      '组合格局': '组合格局（多种要素的综合组合）',
      '飞宫格局': '飞宫格局（宫位之间的特殊关系）'
    };

    const getPatternTypeDescription = (type: string) => {
      return patternTypeMap[type] || type;
    };

    // 按吉凶程度分组
    const auspiciousPatterns = patterns.filter((p: any) => p.type === 'auspicious' || p.level === '吉' || p.level === '大吉');
    const neutralPatterns = patterns.filter((p: any) => p.level === '中');
    const inauspiciousPatterns = patterns.filter((p: any) => p.type === 'inauspicious' || p.level === '凶' || p.level === '大凶');

    const renderPatternGroup = (groupPatterns: any[], title: string, bgColor: string, borderColor: string, textColor: string) => {
      if (groupPatterns.length === 0) return null;
      
      return (
        <div className="mb-6">
          <h5 className={`font-bold ${textColor} mb-3 flex items-center`}>
            <Star className="w-4 h-4 mr-2" />
            {title}（{groupPatterns.length}个）
          </h5>
          <div className="space-y-3">
            {groupPatterns.map((pattern: any, index: number) => (
              <div key={index} className={`${bgColor} p-4 rounded-lg border-l-4 ${borderColor}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h6 className={`font-bold ${textColor} text-lg mb-1`}>{pattern.name}</h6>
                    <p className="text-sm text-gray-600">{getPatternTypeDescription(pattern.type)}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-bold',
                      pattern.type === 'auspicious' || pattern.level === '大吉' ? 'bg-green-200 text-green-800' :
                      pattern.level === '吉' ? 'bg-green-100 text-green-700' :
                      pattern.level === '中' ? 'bg-yellow-100 text-yellow-700' :
                      pattern.level === '凶' ? 'bg-red-100 text-red-700' :
                      pattern.type === 'inauspicious' || pattern.level === '大凶' ? 'bg-red-200 text-red-800' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {pattern.type === 'auspicious' ? '吉格' : pattern.type === 'inauspicious' ? '凶格' : pattern.level || '未知'}
                    </span>
                    {pattern.score && (
                      <div className={`text-xs mt-1 ${textColor}`}>
                        影响分数：{pattern.score > 0 ? '+' : ''}{pattern.score}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-red-700 leading-relaxed">
                    {pattern.description}
                  </p>
                  
                  {pattern.palaceName && (
                    <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                      <span className="font-medium text-gray-700">所在宫位：</span>
                      <span className="text-red-700">{pattern.palaceName}</span>
                    </div>
                  )}
                  
                  {pattern.elements && (
                    <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                      <span className="font-medium text-gray-700">构成要素：</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(pattern.elements).map(([key, value]) => (
                          <span key={key} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {getYongShenName(key)}：{String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pattern.influence && (
                    <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                      <span className="font-medium text-gray-700">影响：</span>
                      <span className="text-red-700">{pattern.influence}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* 格局概述 */}
        <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-bold text-red-800 mb-2">格局分析概述</h4>
          <p className="text-red-700 text-sm leading-relaxed">
            奇门遁甲格局是指奇门盘中特定要素的组合形式，反映了天时、地利、人和的综合状况。
            吉格表示有利因素，凶格表示不利因素。格局的数量和质量直接影响事情的成败概率。
          </p>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-green-600 font-bold text-lg">{auspiciousPatterns.length}</div>
              <div className="text-green-700 text-xs">吉利格局</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-yellow-600 font-bold text-lg">{neutralPatterns.length}</div>
              <div className="text-yellow-700 text-xs">中性格局</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-red-600 font-bold text-lg">{inauspiciousPatterns.length}</div>
              <div className="text-red-700 text-xs">不利格局</div>
            </div>
          </div>
        </div>

        {renderPatternGroup(auspiciousPatterns, '吉利格局', 'bg-green-50', 'border-green-500', 'text-green-700')}
        {renderPatternGroup(neutralPatterns, '中性格局', 'bg-yellow-50', 'border-yellow-500', 'text-yellow-700')}
        {renderPatternGroup(inauspiciousPatterns, '不利格局', 'bg-red-50', 'border-red-500', 'text-red-700')}
      </div>
    );
  };

  // 渲染预测结果
  const renderPrediction = () => {
    if (!prediction) return null;

    return (
      <div className="space-y-6">
        {/* 预测概述 */}
        <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="font-bold text-red-800 mb-2">预测结果概述</h4>
          <p className="text-red-700 text-sm leading-relaxed">
            基于奇门遁甲盘的综合分析，结合用神状态、格局组合、五行生克等因素，
            对所占问题的发展趋势和成功概率进行科学预测。
          </p>
        </div>

        {prediction.probability && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {prediction.probability}%
              </div>
              <div className="text-purple-700 text-lg font-medium">成功概率</div>
            </div>
            
            {/* 概率等级指示器 */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    prediction.probability >= 80 ? 'bg-green-500' : 
                    prediction.probability >= 60 ? 'bg-yellow-500' : 
                    prediction.probability >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(prediction.probability, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>极低</span>
                <span>较低</span>
                <span>中等</span>
                <span>较高</span>
                <span>极高</span>
              </div>
            </div>
            
            {/* 概率等级说明 */}
            <div className="mt-3 text-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                prediction.probability >= 80 ? 'bg-green-100 text-green-800' : 
                prediction.probability >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                prediction.probability >= 40 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
              }`}>
                {
                  prediction.probability >= 80 ? '成功概率极高' : 
                  prediction.probability >= 60 ? '成功概率较高' : 
                  prediction.probability >= 40 ? '成功概率中等' : '成功概率较低'
                }
              </span>
            </div>
          </div>
        )}

        {prediction.analysis && (
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              详细分析
            </h4>
            <div className="text-red-700 leading-relaxed">
              {typeof prediction.analysis === 'string' 
                ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-lg">{prediction.analysis}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(prediction.analysis).map(([key, value]) => {
                      // 预测分析术语中文映射
                      const analysisTermMap = {
                        'yongshen_status': '用神状态分析',
                        'pattern_influence': '格局影响分析',
                        'palace_analysis': '宫位分布分析',
                        'wuxing_balance': '五行平衡分析',
                        'timing_factors': '时机因素分析',
                        'overall_trend': '整体趋势分析',
                        'success_probability': '成功概率',
                        'risk_assessment': '风险评估',
                        'favorable_factors': '有利因素',
                        'unfavorable_factors': '不利因素',
                        'recommendations': '专业建议',
                        'timing_advice': '时机建议'
                      };
                      
                      const getChineseKey = (k: string) => {
                        return analysisTermMap[k] || k;
                      };
                      
                      return (
                        <div key={key} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-blue-700 text-base">{getChineseKey(key)}：</span>
                            <span className="text-red-700 text-right flex-1 ml-2">{String(value)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* 关键因素分析 */}
        {prediction.key_factors && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              关键影响因素
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(prediction.key_factors).map(([factor, impact]) => (
                <div key={factor} className="bg-white p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-700">{factor}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      String(impact).includes('有利') || String(impact).includes('吉') ? 'bg-green-100 text-green-700' :
                      String(impact).includes('不利') || String(impact).includes('凶') ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {String(impact)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {prediction.suggestions && prediction.suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              专业建议
            </h4>
            <div className="space-y-3">
              {prediction.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-red-700 leading-relaxed flex-1">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 时机建议 */}
        {prediction.timing_advice && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-bold text-red-800 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              时机建议
            </h4>
            <div className="text-red-700 leading-relaxed">
              {typeof prediction.timing_advice === 'string' 
                ? prediction.timing_advice 
                : (
                  <div className="space-y-2">
                    {Object.entries(prediction.timing_advice).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center bg-white bg-opacity-50 p-2 rounded">
                        <span className="font-medium">{getYongShenName(key)}：</span>
                        <span className="text-red-700">{getChineseValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8" id="qimen-analysis-content" data-export-content>
        
        {/* 下载按钮和AI解读按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 no-export" data-no-export>
          <div className="flex-1">
            <AIInterpretationButton
              analysisData={analysis}
              analysisType="qimen"
              recordId={recordId || analysis?.id}
              onConfigClick={() => setShowAIConfig(true)}
            />
          </div>
          <div className="flex-shrink-0">
            <DownloadButton
              analysisData={analysis}
              analysisType="qimen"
              userName={basicInfo?.divination_data?.question ? `奇门_${basicInfo.divination_data.question.substring(0, 10)}` : 'user'}
              targetElementId="qimen-analysis-content"
              className="sticky top-4 z-10"
            />
          </div>
        </div>
        {/* 页面标题 */}
        <Card className="chinese-card-decoration border-2 border-yellow-400">
          <CardHeader className="text-center">
            <CardTitle className="text-red-800 text-3xl font-bold chinese-text-shadow flex items-center justify-center">
              <Hexagon className="mr-3 h-8 w-8 text-yellow-600" />
              奇门遁甲分析报告
            </CardTitle>
            <p className="text-red-600 text-lg">专业奇门遁甲占卜分析</p>
          </CardHeader>
        </Card>

        {/* 占卜基本信息 */}
        {basicInfo && (
          <Card className="chinese-card-decoration border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-yellow-600" />
                占卜信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {basicInfo.divination_data?.question && (
                  <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      占卜问题
                    </h4>
                    <p className="text-red-700 text-lg leading-relaxed">{basicInfo.divination_data.question}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-red-800 mb-2">占卜方法</h4>
                    <p className="text-red-700">{basicInfo.divination_data?.method || '时家奇门'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-red-800 mb-2">起局时间</h4>
                    <p className="text-red-700">{new Date(basicInfo.divination_data?.divination_time).toLocaleString('zh-CN')}</p>
                  </div>
                  {basicInfo.divination_data?.lunar_info && (
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-red-800 mb-2">农历信息</h4>
                      <p className="text-red-700">{basicInfo.divination_data.lunar_info.description || '农历信息'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 时空信息 */}
        {timeInfo && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Clock className="mr-2 h-6 w-6 text-yellow-600" />
                时空信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 text-center">
                    <h4 className="font-bold text-red-800 mb-2">节气</h4>
                    <p className="text-red-700 text-xl font-bold">{timeInfo.jieqi || '未知'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 text-center">
                    <h4 className="font-bold text-red-800 mb-2">元</h4>
                    <p className="text-red-700 text-xl font-bold">{timeInfo.yuan || '未知'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 text-center">
                    <h4 className="font-bold text-red-800 mb-2">局数</h4>
                    <p className="text-red-700 text-xl font-bold">{timeInfo.jushu || qimenPan?.jushu || '未知'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 text-center">
                    <h4 className="font-bold text-red-800 mb-2">阴阳遁</h4>
                    <p className="text-red-700 text-xl font-bold">{timeInfo.yindun || (qimenPan?.yindun !== undefined ? (qimenPan.yindun ? '阴遁' : '阳遁') : '未知')}</p>
                  </div>
                </div>
                
                {timeInfo.ganzhi && (
                  <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      干支四柱
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center bg-red-50 p-3 rounded">
                        <div className="text-2xl font-bold text-red-600 mb-1">{timeInfo.ganzhi.year?.gan}{timeInfo.ganzhi.year?.zhi}</div>
                        <div className="text-sm text-red-700">年柱</div>
                      </div>
                      <div className="text-center bg-blue-50 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{timeInfo.ganzhi.month?.gan}{timeInfo.ganzhi.month?.zhi}</div>
                        <div className="text-sm text-blue-700">月柱</div>
                      </div>
                      <div className="text-center bg-green-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600 mb-1">{timeInfo.ganzhi.day?.gan}{timeInfo.ganzhi.day?.zhi}</div>
                        <div className="text-sm text-green-700">日柱</div>
                      </div>
                      <div className="text-center bg-purple-50 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{timeInfo.ganzhi.hour?.gan}{timeInfo.ganzhi.hour?.zhi}</div>
                        <div className="text-sm text-purple-700">时柱</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {(timeInfo.zhifu || timeInfo.zhishi) && (
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      值符值使
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {timeInfo.zhifu && (
                        <div className="text-center bg-orange-50 p-3 rounded">
                          <div className="text-xl font-bold text-orange-600 mb-1">{timeInfo.zhifu}</div>
                          <div className="text-sm text-orange-700">值符</div>
                        </div>
                      )}
                      {timeInfo.zhishi && (
                        <div className="text-center bg-orange-50 p-3 rounded">
                          <div className="text-xl font-bold text-orange-600 mb-1">{timeInfo.zhishi}</div>
                          <div className="text-sm text-orange-700">值使</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 奇门盘 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
              <Hexagon className="mr-2 h-6 w-6 text-yellow-600" />
              奇门遁甲盘
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
              {renderQimenPan()}

            </div>
          </CardContent>
        </Card>

        {/* 用神分析 */}
        {yongShenAnalysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Target className="mr-2 h-6 w-6 text-yellow-600" />
                用神分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {renderYongShenAnalysis()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 格局识别 */}
        {patterns && patterns.length > 0 && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-600" />
                格局识别
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {renderPatterns()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 预测结果 */}
        {prediction && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-yellow-600" />
                预测结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {renderPrediction()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 指导建议 */}
        {guidance && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Compass className="mr-2 h-6 w-6 text-yellow-600" />
                指导建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
            <div className="space-y-4">
              {guidance.key_message && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-600 font-chinese mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    核心信息
                  </h4>
                  <div className="text-gray-700 font-chinese text-lg">
                    {guidance.key_message}
                  </div>
                </div>
              )}
              
              {guidance.action_advice && guidance.action_advice.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-600 font-chinese mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    行动建议
                  </h4>
                  <ul className="space-y-2">
                    {guidance.action_advice.map((advice: string, index: number) => (
                      <li key={index} className="text-gray-700 font-chinese flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {guidance.timing_guidance && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-600 font-chinese mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    时机指导
                  </h4>
                  <div className="text-gray-700 font-chinese">
                    {typeof guidance.timing_guidance === 'string' 
                      ? guidance.timing_guidance 
                      : (
                        <div className="space-y-2">
                          {Object.entries(guidance.timing_guidance).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center bg-white bg-opacity-50 p-2 rounded">
                              <span className="font-medium">{getYongShenName(key)}：</span>
                              <span className="text-red-700">{getChineseValue(key, value)}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </div>
                </div>
              )}
              

              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {/* 五行分析 */}
        {analysis?.detailed_analysis?.wuxing_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Activity className="mr-2 h-6 w-6 text-yellow-600" />
                五行分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {/* 五行分析概述 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                  <h4 className="font-bold text-red-800 mb-2">五行分析概述</h4>
                  <p className="text-red-700 text-sm leading-relaxed">
                    五行分析是奇门遁甲的重要组成部分，通过分析奇门盘中五行要素的分布、强弱和相互关系，
                    判断各种力量的平衡状态，为预测和决策提供重要依据。
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-bold text-red-800 mb-3">五行生克关系分析</h4>
                  <div className="text-red-700 leading-relaxed">
                    {typeof analysis.detailed_analysis.wuxing_analysis === 'string' 
                      ? (
                        <p className="text-lg">{analysis.detailed_analysis.wuxing_analysis}</p>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(analysis.detailed_analysis.wuxing_analysis).map(([key, value]) => {
                            // 五行分析术语中文映射
                            const wuxingTermMap = {
                              'dominant': '主导五行',
                              'balance': '平衡状态',
                              'suggestions': '调和建议',
                              'strength': '五行强度',
                              'weakness': '五行弱点',
                              'harmony': '和谐程度',
                              'conflict': '冲突情况',
                              'support': '相生关系',
                              'restraint': '相克关系',
                              'seasonal_influence': '季节影响',
                              'overall_assessment': '综合评估'
                            };
                            
                            const getChineseTerm = (term: string) => {
                              return wuxingTermMap[term] || term;
                            };
                            
                            const getChineseValue = (val: any) => {
                              const valueMap = {
                                'balanced': '平衡',
                                'strong': '强旺',
                                'weak': '衰弱',
                                'excessive': '过旺',
                                'deficient': '不足',
                                'harmonious': '和谐',
                                'conflicting': '冲突',
                                'favorable': '有利',
                                'unfavorable': '不利',
                                'moderate': '适中',
                                'excellent': '极佳',
                                'poor': '较差',
                                'good': '良好',
                                'average': '一般'
                              };
                              
                              const strVal = String(val);
                              return valueMap[strVal] || strVal;
                            };
                            
                            return (
                              <div key={key} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-green-700 text-lg">{getChineseTerm(key)}</span>
                                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                    {getChineseValue(value)}
                                  </span>
                                </div>
                                {key === 'dominant' && (
                                  <p className="text-red-700 text-sm mt-2">
                                    当前奇门盘中{getChineseValue(value)}五行力量最为突出，主导整体格局的发展方向。
                                  </p>
                                )}
                                {key === 'balance' && (
                                  <p className="text-red-700 text-sm mt-2">
                                    五行之间的平衡状态为{getChineseValue(value)}，影响事情发展的稳定性和持续性。
                                  </p>
                                )}
                                {key === 'suggestions' && (
                                  <p className="text-red-700 text-sm mt-2">
                                    建议：{getChineseValue(value)}，以达到五行平衡，提升整体运势。
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 时机分析 */}
        {analysis?.detailed_analysis?.timing_analysis && (
          <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl font-bold chinese-text-shadow flex items-center">
                <Clock className="mr-2 h-6 w-6 text-yellow-600" />
                时机分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6">
                {/* 时机分析概述 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                  <h4 className="font-bold text-red-800 mb-2">时机分析概述</h4>
                  <p className="text-red-700 text-sm leading-relaxed">
                    时机分析是奇门遁甲预测的核心内容，通过分析天时、地利、人和等因素，
                    判断行动的最佳时机，为决策提供时间维度的指导。
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                  <h4 className="font-bold text-red-800 mb-3">最佳时机判断</h4>
                  <div className="text-red-700 leading-relaxed">
                    {typeof analysis.detailed_analysis.timing_analysis === 'string' 
                      ? (
                        <p className="text-lg">{analysis.detailed_analysis.timing_analysis}</p>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(analysis.detailed_analysis.timing_analysis).map(([key, value]) => {
                            // 时机分析术语中文映射
                            const timingTermMap = {
                              'season': '季节时机',
                              'favorability': '有利程度',
                              'notes': '详细说明',
                              'best_time': '最佳时机',
                              'avoid_time': '不宜时机',
                              'duration': '持续时间',
                              'intensity': '影响强度',
                              'stability': '稳定性',
                              'trend': '发展趋势',
                              'opportunity': '机会窗口',
                              'risk_level': '风险等级',
                              'success_rate': '成功率',
                              'timing_score': '时机评分',
                              'seasonal_influence': '季节影响',
                              'monthly_trend': '月度趋势',
                              'daily_guidance': '日常指导'
                            };
                            
                            const getChineseTerm = (term: string) => {
                              return timingTermMap[term] || term;
                            };
                            
                            const getChineseValue = (val: any) => {
                              const valueMap = {
                                'spring': '春季',
                                'summer': '夏季',
                                'autumn': '秋季',
                                'winter': '冬季',
                                'favorable': '有利',
                                'unfavorable': '不利',
                                'neutral': '中性',
                                'excellent': '极佳',
                                'good': '良好',
                                'average': '一般',
                                'poor': '较差',
                                'high': '高',
                                'medium': '中等',
                                'low': '低',
                                'stable': '稳定',
                                'unstable': '不稳定',
                                'rising': '上升',
                                'falling': '下降',
                                'immediate': '立即',
                                'soon': '近期',
                                'later': '稍后',
                                'long_term': '长期'
                              };
                              
                              const strVal = String(val);
                              return valueMap[strVal] || strVal;
                            };
                            
                            const getSeasonDescription = (season: string) => {
                              const descriptions = {
                                '春季': '万物复苏，生机勃勃，适合新的开始和发展',
                                '夏季': '阳气旺盛，活力充沛，适合积极行动和扩展',
                                '秋季': '收获季节，成果显现，适合总结和收获',
                                '冬季': '蛰伏养精，积蓄力量，适合规划和准备'
                              };
                              return descriptions[season] || '';
                            };
                            
                            return (
                              <div key={key} className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-indigo-700 text-lg">{getChineseTerm(key)}</span>
                                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                                    String(value).includes('有利') || String(value).includes('春季') || String(value).includes('good') || String(value).includes('favorable') 
                                      ? 'bg-green-200 text-green-800' 
                                      : String(value).includes('不利') || String(value).includes('poor') || String(value).includes('unfavorable')
                                      ? 'bg-red-200 text-red-800'
                                      : 'bg-indigo-200 text-indigo-800'
                                  }`}>
                                    {getChineseValue(value)}
                                  </span>
                                </div>
                                
                                {key === 'season' && (
                                  <div className="mt-2">
                                    <p className="text-red-700 text-sm">
                                      {getSeasonDescription(getChineseValue(value))}
                                    </p>
                                  </div>
                                )}
                                
                                {key === 'favorability' && (
                                  <div className="mt-2">
                                    <p className="text-red-700 text-sm">
                                      当前时机的有利程度为{getChineseValue(value)}，
                                      {String(value).includes('有利') || String(value).includes('favorable') 
                                        ? '建议抓住机会，积极行动' 
                                        : '建议谨慎观望，等待更好时机'
                                      }。
                                    </p>
                                  </div>
                                )}
                                
                                {key === 'notes' && (
                                  <div className="mt-2 bg-white bg-opacity-50 p-2 rounded">
                                    <p className="text-red-700 text-sm">
                                      <strong>详细说明：</strong>{getChineseValue(value)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析报告尾部 */}
        <Card className="chinese-card-decoration dragon-corner border-2 border-yellow-400">
          <CardContent className="text-center py-8">
            <div className="text-red-800">
              <p className="text-lg font-bold mb-2">专业奇门遁甲分析报告</p>
              <p className="text-sm">分析日期：{analysis.analysis_date ? new Date(analysis.analysis_date).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN')}</p>
              <p className="text-xs mt-4 text-red-600">
                本报告基于传统奇门遁甲理论，结合现代命理学研究成果，为您提供专业的占卜分析和人生指导。
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* 回到顶部按钮 */}
        <BackToTop />
        
        {/* AI配置模态框 */}
        <AIConfigModal
          isOpen={showAIConfig}
          onClose={() => setShowAIConfig(false)}
          onConfigSaved={() => {
            setShowAIConfig(false);
            // 可以在这里添加配置保存后的逻辑
          }}
        />
      </div>
    </div>
  );
};

export default CompleteQimenAnalysis;
