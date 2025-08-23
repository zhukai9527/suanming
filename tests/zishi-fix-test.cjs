/**
 * 早晚子时修正测试
 * 测试修正后的八字排盘对于早子时和晚子时的正确处理
 */

const BaziAnalyzer = require('../server/services/baziAnalyzer.cjs');

// 创建八字分析器实例
const baziAnalyzer = new BaziAnalyzer();

console.log('🧪 开始早晚子时修正测试\n');

// 测试用例：根据实际万年历数据验证
const testCases = [
  {
    name: '早子时测试',
    birth_date: '1988-08-08',
    birth_time: '00:18', // 早子时（00:00-01:00）
    expected: {
      description: '早子时：日柱和时柱都用当天',
      day_pillar: '甲午', // 根据万年历，1988年8月8日是甲午日
      hour_pillar: '甲子', // 甲日子时：甲子时
      zishi_type: '早子时'
    }
  },
  {
    name: '晚子时测试',
    birth_date: '1988-08-08',
    birth_time: '23:38', // 晚子时（23:00-24:00）
    expected: {
      description: '晚子时：日柱用当天，时柱用第二天日干推算',
      day_pillar: '甲午', // 日柱仍是当天的甲午
      hour_pillar: '丙子', // 时柱用第二天（乙未日）的日干推算：乙日子时是丙子时
      zishi_type: '晚子时'
    }
  },
  {
    name: '普通时辰测试',
    birth_date: '1988-08-08',
    birth_time: '12:30', // 午时
    expected: {
      description: '普通时辰：按传统方法处理',
      day_pillar: '甲午',
      hour_pillar: '庚午', // 甲日午时：庚午时
      zishi_type: null
    }
  }
];

// 执行测试
testCases.forEach((testCase, index) => {
  console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
  console.log(`   出生时间: ${testCase.birth_date} ${testCase.birth_time}`);
  console.log(`   预期: ${testCase.expected.description}`);
  
  try {
    // 执行八字分析
    const result = baziAnalyzer.calculatePreciseBazi(testCase.birth_date, testCase.birth_time);
    
    console.log('\n   📊 分析结果:');
    console.log(`   完整八字: ${result.complete_chart}`);
    console.log(`   日柱: ${result.day_pillar.stem}${result.day_pillar.branch}`);
    console.log(`   时柱: ${result.hour_pillar.stem}${result.hour_pillar.branch}`);
    
    if (result.hour_pillar.zishi_type) {
      console.log(`   子时类型: ${result.hour_pillar.zishi_type}`);
    }
    
    // 验证结果
    let isCorrect = true;
    
    if (testCase.expected.day_pillar) {
      const actualDayPillar = `${result.day_pillar.stem}${result.day_pillar.branch}`;
      if (actualDayPillar === testCase.expected.day_pillar) {
        console.log(`   ✅ 日柱正确: ${actualDayPillar}`);
      } else {
        console.log(`   ❌ 日柱错误: 期望 ${testCase.expected.day_pillar}，实际 ${actualDayPillar}`);
        isCorrect = false;
      }
    }
    
    if (testCase.expected.hour_pillar) {
      const actualHourPillar = `${result.hour_pillar.stem}${result.hour_pillar.branch}`;
      if (actualHourPillar === testCase.expected.hour_pillar) {
        console.log(`   ✅ 时柱正确: ${actualHourPillar}`);
      } else {
        console.log(`   ❌ 时柱错误: 期望 ${testCase.expected.hour_pillar}，实际 ${actualHourPillar}`);
        isCorrect = false;
      }
    }
    
    if (testCase.expected.zishi_type !== undefined) {
      if (result.hour_pillar.zishi_type === testCase.expected.zishi_type) {
        console.log(`   ✅ 子时类型正确: ${result.hour_pillar.zishi_type || '非子时'}`);
      } else {
        console.log(`   ❌ 子时类型错误: 期望 ${testCase.expected.zishi_type || '非子时'}，实际 ${result.hour_pillar.zishi_type || '非子时'}`);
        isCorrect = false;
      }
    }
    
    console.log(`\n   ${isCorrect ? '🎉 测试通过' : '💥 测试失败'}`);
    
  } catch (error) {
    console.log(`   ❌ 测试执行失败: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
});

console.log('🏁 早晚子时修正测试完成');

// 专家意见对比测试
console.log('\n📚 专家意见对比测试:');
console.log('根据搜索到的专家资料，1988年8月8日的两个测试用例应该产生不同的八字:');
console.log('- 早子时 00:18: 戊辰 庚申 乙未 丙子');
console.log('- 晚子时 23:38: 戊辰 庚申 乙未 戊子');
console.log('\n关键区别：晚子时的时柱天干应该用第二天的日干来推算，因此是戊子而不是丙子。');