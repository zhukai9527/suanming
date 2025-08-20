// 易经随机性算法测试
// 验证优化后的起卦算法随机性和分布均匀性

const YijingAnalyzer = require('../server/services/yijingAnalyzer.cjs');

// 创建分析器实例
const analyzer = new YijingAnalyzer();

// 测试随机性分布
function testRandomnessDistribution() {
  console.log('=== 易经起卦随机性分布测试 ===\n');
  
  const testCount = 1000;
  const results = {
    upperTrigrams: {},
    lowerTrigrams: {},
    changingLines: {},
    hexagrams: {}
  };
  
  // 初始化统计对象
  for (let i = 1; i <= 8; i++) {
    results.upperTrigrams[i] = 0;
    results.lowerTrigrams[i] = 0;
  }
  for (let i = 1; i <= 6; i++) {
    results.changingLines[i] = 0;
  }
  
  console.log(`进行${testCount}次起卦测试...`);
  
  // 执行测试
  for (let i = 0; i < testCount; i++) {
    const currentTime = new Date(Date.now() + i * 1000); // 每次间隔1秒
    const userId = `test_user_${i % 100}`; // 模拟不同用户
    
    const result = analyzer.generateHexagramByTime(currentTime, userId);
    
    // 统计上卦
    results.upperTrigrams[result.upperTrigram]++;
    
    // 统计下卦
    results.lowerTrigrams[result.lowerTrigram]++;
    
    // 统计动爻
    if (result.changingLines && result.changingLines.length > 0) {
      results.changingLines[result.changingLines[0]]++;
    }
    
    // 统计卦象
    const hexName = analyzer.getHexagramInfo(result.mainHex).name;
    results.hexagrams[hexName] = (results.hexagrams[hexName] || 0) + 1;
  }
  
  // 分析分布均匀性
  console.log('\n=== 分布统计结果 ===');
  
  // 上卦分布
  console.log('\n上卦分布:');
  const expectedTrigramCount = testCount / 8;
  let trigramVariance = 0;
  for (let i = 1; i <= 8; i++) {
    const count = results.upperTrigrams[i];
    const percentage = (count / testCount * 100).toFixed(1);
    const deviation = Math.abs(count - expectedTrigramCount);
    trigramVariance += deviation * deviation;
    console.log(`  ${i}: ${count}次 (${percentage}%) 偏差: ${deviation.toFixed(1)}`);
  }
  trigramVariance = Math.sqrt(trigramVariance / 8);
  console.log(`  上卦分布标准差: ${trigramVariance.toFixed(2)} (越小越均匀)`);
  
  // 下卦分布
  console.log('\n下卦分布:');
  let lowerTrigramVariance = 0;
  for (let i = 1; i <= 8; i++) {
    const count = results.lowerTrigrams[i];
    const percentage = (count / testCount * 100).toFixed(1);
    const deviation = Math.abs(count - expectedTrigramCount);
    lowerTrigramVariance += deviation * deviation;
    console.log(`  ${i}: ${count}次 (${percentage}%) 偏差: ${deviation.toFixed(1)}`);
  }
  lowerTrigramVariance = Math.sqrt(lowerTrigramVariance / 8);
  console.log(`  下卦分布标准差: ${lowerTrigramVariance.toFixed(2)}`);
  
  // 动爻分布
  console.log('\n动爻分布:');
  const expectedLineCount = testCount / 6;
  let lineVariance = 0;
  for (let i = 1; i <= 6; i++) {
    const count = results.changingLines[i];
    const percentage = (count / testCount * 100).toFixed(1);
    const deviation = Math.abs(count - expectedLineCount);
    lineVariance += deviation * deviation;
    console.log(`  第${i}爻: ${count}次 (${percentage}%) 偏差: ${deviation.toFixed(1)}`);
  }
  lineVariance = Math.sqrt(lineVariance / 6);
  console.log(`  动爻分布标准差: ${lineVariance.toFixed(2)}`);
  
  // 卦象分布（显示前10个最常见的）
  console.log('\n卦象分布 (前10个):');
  const sortedHexagrams = Object.entries(results.hexagrams)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  sortedHexagrams.forEach(([name, count]) => {
    const percentage = (count / testCount * 100).toFixed(1);
    console.log(`  ${name}: ${count}次 (${percentage}%)`);
  });
  
  // 评估随机性质量
  console.log('\n=== 随机性质量评估 ===');
  const avgVariance = (trigramVariance + lowerTrigramVariance + lineVariance) / 3;
  let quality = '优秀';
  if (avgVariance > 20) quality = '需要改进';
  else if (avgVariance > 15) quality = '一般';
  else if (avgVariance > 10) quality = '良好';
  
  console.log(`平均标准差: ${avgVariance.toFixed(2)}`);
  console.log(`随机性质量: ${quality}`);
  
  return {
    trigramVariance,
    lowerTrigramVariance,
    lineVariance,
    avgVariance,
    quality
  };
}

// 测试用户因子的影响
function testUserFactorImpact() {
  console.log('\n=== 用户因子影响测试 ===\n');
  
  const baseTime = new Date('2024-01-15T14:30:00');
  const userIds = ['user1', 'user2', 'user3', 'test123', '12345', null];
  
  console.log('相同时间，不同用户的起卦结果:');
  userIds.forEach(userId => {
    const result = analyzer.generateHexagramByTime(baseTime, userId);
    const hexInfo = analyzer.getHexagramInfo(result.mainHex);
    console.log(`  用户${userId || '匿名'}: ${hexInfo.name}卦 (${result.upperTrigram}-${result.lowerTrigram}) 动爻${result.changingLines[0]}`);
  });
  
  // 测试时间微小变化的影响
  console.log('\n相同用户，微小时间差异的起卦结果:');
  for (let i = 0; i < 5; i++) {
    const time = new Date(baseTime.getTime() + i * 1000); // 每次增加1秒
    const result = analyzer.generateHexagramByTime(time, 'test_user');
    const hexInfo = analyzer.getHexagramInfo(result.mainHex);
    console.log(`  +${i}秒: ${hexInfo.name}卦 (${result.upperTrigram}-${result.lowerTrigram}) 动爻${result.changingLines[0]}`);
  }
}

// 测试不同起卦方法的对比
function testDifferentMethods() {
  console.log('\n=== 不同起卦方法对比测试 ===\n');
  
  const currentTime = new Date();
  const userId = 'test_user';
  const question = '今日运势如何？';
  
  // 时间起卦法
  const timeResult = analyzer.generateHexagramByTime(currentTime, userId);
  const timeHex = analyzer.getHexagramInfo(timeResult.mainHex);
  console.log(`时间起卦法: ${timeHex.name}卦 动爻${timeResult.changingLines[0]}`);
  
  // 外应起卦法
  const plumResult = analyzer.generateHexagramByPlumBlossom(currentTime, question);
  const plumHex = analyzer.getHexagramInfo(plumResult.mainHex);
  console.log(`外应起卦法: ${plumHex.name}卦 动爻${plumResult.changingLines[0]}`);
  
  // 数字起卦法
  const numberResult = analyzer.generateHexagramByNumber(currentTime, userId);
  const numberHex = analyzer.getHexagramInfo(numberResult.mainHex);
  console.log(`数字起卦法: ${numberHex.name}卦 动爻${numberResult.changingLines[0]}`);
  
  // 金钱卦起卦法
  const coinResult = analyzer.generateHexagramByCoin();
  const coinHex = analyzer.getHexagramInfo(coinResult.mainHex);
  console.log(`金钱卦起卦法: ${coinHex.name}卦 动爻${coinResult.changingLines.join(',')}`);
}

// 性能测试
function performanceTest() {
  console.log('\n=== 性能测试 ===\n');
  
  const iterations = 10000;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const currentTime = new Date(Date.now() + i);
    const userId = `user_${i % 1000}`;
    analyzer.generateHexagramByTime(currentTime, userId);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`执行${iterations}次起卦耗时: ${totalTime}ms`);
  console.log(`平均每次起卦耗时: ${avgTime.toFixed(3)}ms`);
  console.log(`每秒可执行起卦次数: ${Math.floor(1000 / avgTime)}次`);
  
  let performanceRating = '优秀';
  if (avgTime > 1) performanceRating = '需要优化';
  else if (avgTime > 0.5) performanceRating = '一般';
  else if (avgTime > 0.1) performanceRating = '良好';
  
  console.log(`性能评级: ${performanceRating}`);
}

// 执行所有测试
function runAllTests() {
  const distributionResult = testRandomnessDistribution();
  testUserFactorImpact();
  testDifferentMethods();
  performanceTest();
  
  console.log('\n=== 测试总结 ===');
  console.log('1. 随机性分布测试完成，检查标准差是否在合理范围内');
  console.log('2. 用户因子影响测试完成，验证不同用户和时间的差异性');
  console.log('3. 不同起卦方法对比完成，确保各方法都能正常工作');
  console.log('4. 性能测试完成，验证算法效率');
  console.log('\n优化效果:');
  console.log('- 增加了秒级和毫秒级时间精度');
  console.log('- 改进了用户因子算法，增加了复杂性');
  console.log('- 使用数学常数和哈希函数提高分布均匀性');
  console.log('- 保持了传统梅花易数的核心理念');
  
  return distributionResult;
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testRandomnessDistribution,
  testUserFactorImpact,
  testDifferentMethods,
  performanceTest,
  runAllTests
};