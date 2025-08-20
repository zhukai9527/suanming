// 节气计算功能测试
// 验证新的精确节气算法是否正确工作

const SolarTermsCalculator = require('../server/utils/solarTerms.cjs');
const BaziAnalyzer = require('../server/services/baziAnalyzer.cjs');

// 创建实例
const solarTermsCalc = new SolarTermsCalculator();
const baziAnalyzer = new BaziAnalyzer();

// 测试用例
const testCases = [
  {
    name: '2024年立春前后测试',
    dates: [
      { date: '2024-02-03', time: '12:00', expected: '癸卯年' }, // 立春前
      { date: '2024-02-04', time: '18:00', expected: '甲辰年' }, // 立春后
    ]
  },
  {
    name: '2023年立春前后测试',
    dates: [
      { date: '2023-02-03', time: '12:00', expected: '壬寅年' }, // 立春前
      { date: '2023-02-04', time: '12:00', expected: '癸卯年' }, // 立春后
    ]
  },
  {
    name: '月柱节气测试',
    dates: [
      { date: '2024-03-05', time: '12:00', expected_month: '寅月' }, // 立春后，惊蛰前
      { date: '2024-03-06', time: '12:00', expected_month: '卯月' }, // 惊蛰后
      { date: '2024-04-04', time: '12:00', expected_month: '卯月' }, // 清明前
      { date: '2024-04-05', time: '12:00', expected_month: '辰月' }, // 清明后
    ]
  }
];

function runSolarTermsTests() {
  console.log('=== 节气计算功能测试 ===\n');
  
  // 测试1: 基本节气计算
  console.log('测试1: 2024年节气计算');
  const solarTerms2024 = solarTermsCalc.calculateYearSolarTerms(2024);
  console.log('2024年立春:', solarTerms2024[0].time.toLocaleString('zh-CN'));
  console.log('2024年春分:', solarTerms2024[3].time.toLocaleString('zh-CN'));
  console.log('2024年夏至:', solarTerms2024[9].time.toLocaleString('zh-CN'));
  console.log('2024年冬至:', solarTerms2024[21].time.toLocaleString('zh-CN'));
  console.log('');
  
  // 测试2: 年柱计算准确性
  console.log('测试2: 年柱计算准确性');
  testCases.forEach(testCase => {
    if (testCase.dates[0].expected) {
      console.log(`\n${testCase.name}:`);
      testCase.dates.forEach(testData => {
        const [year, month, day] = testData.date.split('-').map(Number);
        const [hour, minute] = testData.time.split(':').map(Number);
        
        const yearPillar = baziAnalyzer.calculateYearPillar(year, month, day, hour, minute);
        const actualYear = `${yearPillar.stem}${yearPillar.branch}年`;
        
        console.log(`  ${testData.date} ${testData.time}: ${actualYear} ${actualYear === testData.expected ? '✅' : '❌'}`);
        if (actualYear !== testData.expected) {
          console.log(`    期望: ${testData.expected}, 实际: ${actualYear}`);
        }
      });
    }
  });
  
  // 测试3: 月柱计算准确性
  console.log('\n测试3: 月柱计算准确性');
  testCases.forEach(testCase => {
    if (testCase.dates[0].expected_month) {
      console.log(`\n${testCase.name}:`);
      testCase.dates.forEach(testData => {
        const [year, month, day] = testData.date.split('-').map(Number);
        const [hour, minute] = testData.time.split(':').map(Number);
        
        const date = new Date(year, month - 1, day, hour, minute);
        const solarTermMonth = solarTermsCalc.getSolarTermMonth(date);
        const actualMonth = `${solarTermMonth.monthBranch}月`;
        
        console.log(`  ${testData.date} ${testData.time}: ${actualMonth} ${actualMonth === testData.expected_month ? '✅' : '❌'}`);
        if (actualMonth !== testData.expected_month) {
          console.log(`    期望: ${testData.expected_month}, 实际: ${actualMonth}`);
          console.log(`    节气: ${solarTermMonth.termName}`);
        }
      });
    }
  });
  
  // 测试4: 完整八字计算对比
  console.log('\n测试4: 完整八字计算对比');
  const testDate = '1990-01-15';
  const testTime = '14:30';
  
  try {
    const baziResult = baziAnalyzer.calculatePreciseBazi(testDate, testTime);
    console.log(`测试日期: ${testDate} ${testTime}`);
    console.log(`八字结果: ${baziResult.complete_chart}`);
    console.log(`日主: ${baziResult.day_master} (${baziResult.day_master_element})`);
    console.log('✅ 八字计算成功');
  } catch (error) {
    console.log('❌ 八字计算失败:', error.message);
  }
  
  // 测试5: 边界情况测试
  console.log('\n测试5: 边界情况测试');
  const boundaryCases = [
    { date: '2024-02-04', time: '16:26', desc: '2024年立春精确时间附近' },
    { date: '2023-02-04', time: '10:42', desc: '2023年立春精确时间附近' },
    { date: '2024-12-31', time: '23:59', desc: '年末边界' },
    { date: '2024-01-01', time: '00:01', desc: '年初边界' }
  ];
  
  boundaryCases.forEach(testCase => {
    try {
      const [year, month, day] = testCase.date.split('-').map(Number);
      const [hour, minute] = testCase.time.split(':').map(Number);
      
      const yearPillar = baziAnalyzer.calculateYearPillar(year, month, day, hour, minute);
      const monthPillar = baziAnalyzer.calculateMonthPillar(year, month, day, yearPillar.stemIndex, hour, minute);
      
      console.log(`  ${testCase.desc}: ${yearPillar.stem}${yearPillar.branch}年 ${monthPillar.stem}${monthPillar.branch}月 ✅`);
    } catch (error) {
      console.log(`  ${testCase.desc}: ❌ 错误 - ${error.message}`);
    }
  });
}

// 性能测试
function performanceTest() {
  console.log('\n=== 性能测试 ===');
  
  const iterations = 1000;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const year = 2000 + (i % 25);
    solarTermsCalc.calculateYearSolarTerms(year);
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`计算${iterations}次年度节气平均耗时: ${avgTime.toFixed(2)}ms`);
  console.log(`性能评估: ${avgTime < 10 ? '优秀' : avgTime < 50 ? '良好' : '需要优化'}`);
}

// 执行测试
if (require.main === module) {
  runSolarTermsTests();
  performanceTest();
  
  console.log('\n=== 测试完成 ===');
  console.log('\n注意事项:');
  console.log('1. 节气时间基于天文算法计算，可能与传统历书略有差异');
  console.log('2. 立春时间精确到分钟，提高了年柱判断的准确性');
  console.log('3. 月支基于节气交替，而非公历月份');
  console.log('4. 建议在实际使用中验证关键日期的计算结果');
}

module.exports = { runSolarTermsTests, performanceTest };