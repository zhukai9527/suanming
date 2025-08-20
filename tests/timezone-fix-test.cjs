// 易经占卜时区修复测试
// 测试时间算法是否正确使用用户当地时间

const YijingAnalyzer = require('../server/services/yijingAnalyzer.cjs');

// 创建分析器实例
const analyzer = new YijingAnalyzer();

// 测试数据
const testCases = [
  {
    name: '使用当地时间测试',
    inputData: {
      question: '今日运势如何？',
      user_id: 'test_user_1',
      divination_method: 'time',
      local_time: '2024-01-15T14:30:00+08:00', // 北京时间下午2:30
      user_timezone: 'Asia/Shanghai'
    }
  },
  {
    name: '使用时区信息测试',
    inputData: {
      question: '事业发展如何？',
      user_id: 'test_user_2',
      divination_method: 'time',
      user_timezone: 'America/New_York'
    }
  },
  {
    name: '兜底服务器时间测试',
    inputData: {
      question: '财运如何？',
      user_id: 'test_user_3',
      divination_method: 'time'
      // 不提供时区和当地时间，应该使用服务器时间
    }
  }
];

// 运行测试
function runTests() {
  console.log('=== 易经占卜时区修复测试 ===\n');
  
  testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log('输入数据:', JSON.stringify(testCase.inputData, null, 2));
    
    try {
      const result = analyzer.performYijingAnalysis(testCase.inputData);
      
      console.log('✅ 分析成功');
      console.log('占卜时间:', result.basic_info.divination_data.divination_time);
      console.log('主卦:', result.basic_info.hexagram_info.main_hexagram);
      console.log('变卦:', result.basic_info.hexagram_info.changing_hexagram);
      console.log('动爻:', result.basic_info.hexagram_info.changing_lines);
      
    } catch (error) {
      console.log('❌ 分析失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  });
}

// 时间对比测试
function timeComparisonTest() {
  console.log('=== 时间对比测试 ===\n');
  
  const baseQuestion = '测试时间差异';
  const userId = 'time_test_user';
  
  // 测试不同时间的起卦结果
  const times = [
    '2024-01-15T08:00:00+08:00', // 北京时间早上8点
    '2024-01-15T14:00:00+08:00', // 北京时间下午2点
    '2024-01-15T20:00:00+08:00', // 北京时间晚上8点
  ];
  
  times.forEach((time, index) => {
    console.log(`时间 ${index + 1}: ${time}`);
    
    const inputData = {
      question: baseQuestion,
      user_id: userId,
      divination_method: 'time',
      local_time: time,
      user_timezone: 'Asia/Shanghai'
    };
    
    try {
      const result = analyzer.performYijingAnalysis(inputData);
      console.log('主卦:', result.basic_info.hexagram_info.main_hexagram);
      console.log('动爻位置:', result.basic_info.hexagram_info.changing_lines[0]);
      console.log('时辰分析:', result.dynamic_guidance.time_analysis.time_of_day.name);
      
    } catch (error) {
      console.log('❌ 分析失败:', error.message);
    }
    
    console.log('\n' + '-'.repeat(30) + '\n');
  });
}

// 执行测试
if (require.main === module) {
  runTests();
  timeComparisonTest();
  
  console.log('测试完成！');
  console.log('\n注意事项:');
  console.log('1. 检查不同时间的起卦结果是否不同');
  console.log('2. 验证时辰分析是否正确对应输入时间');
  console.log('3. 确认时区处理是否正确');
}

module.exports = { runTests, timeComparisonTest };