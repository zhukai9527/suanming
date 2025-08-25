import React, { useState, useEffect } from 'react';
import { ChineseInput } from './ChineseInput';
import { ChineseSelect } from './ChineseSelect';
import { ChineseButton } from './ChineseButton';
import { Lightbulb, RefreshCw } from 'lucide-react';

interface YijingQuestionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

// 问题分类和预设问题数据
const questionCategories = {
  career: {
    name: '事业发展',
    icon: '💼',
    questions: [
      '我的事业发展前景如何？',
      '现在是否适合换工作？',
      '我应该选择哪个职业方向？',
      '创业的时机是否成熟？',
      '如何提升我的职场竞争力？',
      '我的工作能力能否得到认可？',
      '是否应该接受这个工作机会？',
      '我的事业何时能有突破？'
    ]
  },
  love: {
    name: '感情婚姻',
    icon: '💕',
    questions: [
      '我的感情运势如何？',
      '现在的恋情能否修成正果？',
      '我何时能遇到真爱？',
      '这段感情是否值得继续？',
      '如何改善我们的关系？',
      '我应该主动表白吗？',
      '婚姻生活会幸福吗？',
      '如何处理感情中的矛盾？'
    ]
  },
  wealth: {
    name: '财运投资',
    icon: '💰',
    questions: [
      '我的财运发展如何？',
      '这项投资是否明智？',
      '如何改善我的财务状况？',
      '现在适合创业吗？',
      '我的理财方向是否正确？',
      '何时能实现财务自由？',
      '这个商业机会值得把握吗？',
      '如何增加我的收入来源？'
    ]
  },
  health: {
    name: '健康养生',
    icon: '🏥',
    questions: [
      '我的健康状况如何？',
      '如何改善我的身体状况？',
      '这个治疗方案是否有效？',
      '我需要注意哪些健康问题？',
      '如何调理我的身心状态？',
      '什么运动最适合我？',
      '我的饮食习惯需要调整吗？',
      '如何预防疾病的发生？'
    ]
  },
  study: {
    name: '学业考试',
    icon: '📚',
    questions: [
      '我的学习成绩能否提升？',
      '这次考试能否顺利通过？',
      '应该选择哪个专业方向？',
      '如何提高学习效率？',
      '是否应该继续深造？',
      '我的学习方法是否正确？',
      '何时是最佳的考试时机？',
      '如何克服学习中的困难？'
    ]
  },
  family: {
    name: '家庭生活',
    icon: '🏠',
    questions: [
      '我的家庭关系如何？',
      '如何处理家庭矛盾？',
      '子女教育应该注意什么？',
      '如何改善与父母的关系？',
      '家庭财务规划是否合理？',
      '搬家的时机是否合适？',
      '如何营造和谐的家庭氛围？',
      '家人的健康状况如何？'
    ]
  },
  general: {
    name: '综合运势',
    icon: '🔮',
    questions: [
      '我的整体运势如何？',
      '近期需要注意什么？',
      '如何把握人生机遇？',
      '我的人生方向是否正确？',
      '如何化解当前的困境？',
      '什么时候运势会好转？',
      '我应该如何规划未来？',
      '如何提升我的整体运势？'
    ]
  }
};

export const YijingQuestionSelector: React.FC<YijingQuestionSelectorProps> = ({
  value,
  onChange,
  className,
  label = '占卜问题',
  placeholder = '请输入您要占卜的问题'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [showPresets, setShowPresets] = useState<boolean>(true);

  // 分类选项
  const categoryOptions = Object.entries(questionCategories).map(([key, category]) => ({
    value: key,
    label: `${category.icon} ${category.name}`
  }));

  // 当选择分类时，更新问题选项
  const questionOptions = selectedCategory && questionCategories[selectedCategory as keyof typeof questionCategories]
    ? questionCategories[selectedCategory as keyof typeof questionCategories].questions.map((question, index) => ({
        value: question,
        label: question
      }))
    : [];

  // 处理分类选择
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedQuestion('');
    // 选择分类后自动显示预设问题
    if (category) {
      setShowPresets(true);
    }
  };

  // 处理预设问题选择
  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    onChange(question);
  };

  // 随机选择问题
  const handleRandomQuestion = () => {
    const allQuestions = Object.values(questionCategories).flatMap(category => category.questions);
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    onChange(randomQuestion);
    setSelectedQuestion(randomQuestion);
    
    // 找到对应的分类
    const categoryKey = Object.entries(questionCategories).find(([_, category]) => 
      category.questions.includes(randomQuestion)
    )?.[0];
    if (categoryKey) {
      setSelectedCategory(categoryKey);
    }
  };

  // 切换预设问题显示
  const togglePresets = () => {
    setShowPresets(!showPresets);
  };

  return (
    <div className={className}>
      {/* 预设问题选择区域 */}
      <div className="mb-6 space-y-4">
        {/* 控制按钮 */}
        <div className="flex items-center space-x-3">
          <ChineseButton
            variant="outline"
            size="sm"
            onClick={togglePresets}
            className="flex items-center space-x-2"
          >
            <Lightbulb className="h-4 w-4" />
            <span>{showPresets ? '隐藏预设问题' : '选择预设问题'}</span>
          </ChineseButton>
          
          <ChineseButton
            variant="outline"
            size="sm"
            onClick={handleRandomQuestion}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>随机问题</span>
          </ChineseButton>
        </div>

        {/* 预设问题选择界面 */}
        {showPresets && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              选择问题类别和预设问题
            </h4>
            
            {/* 分类选择 */}
            <div className="mb-4">
              <ChineseSelect
                label="问题类别"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={[
                  { value: '', label: '请选择问题类别' },
                  ...categoryOptions
                ]}
variant="default"
                className="mb-3 [&_select]:!bg-blue-50 [&_select]:!border-blue-200 [&_select:hover]:!bg-blue-100 [&_select:focus]:!bg-white [&_select:focus]:!border-blue-500 [&_select:focus]:!ring-blue-500/20"
              />
            </div>

            {/* 预设问题选择 */}
            {selectedCategory && questionOptions.length > 0 && (
              <div className="mb-4">
                <ChineseSelect
                  label="预设问题"
                  value={selectedQuestion}
                  onChange={(e) => handleQuestionSelect(e.target.value)}
                  options={[
                    { value: '', label: '请选择预设问题' },
                    ...questionOptions
                  ]}
                  variant="filled"
                />
              </div>
            )}

            {/* 快速选择按钮 */}
            {selectedCategory && questionOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-amber-700 font-medium">或点击快速选择：</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {questionOptions.slice(0, 6).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionSelect(option.value)}
                      className="text-left p-2 text-sm bg-white hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors duration-200 text-amber-800 hover:text-amber-900"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 主要问题输入框 */}
      <ChineseInput
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        variant="filled"
        helperText="💡 提示：问题越具体，占卜结果越准确。您可以使用预设问题或自行输入。"
      />


    </div>
  );
};

export default YijingQuestionSelector;