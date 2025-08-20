// 紫微斗数算法优化测试
const ZiweiAnalyzer = require('../server/services/ziweiAnalyzer.cjs');

console.log('=== 紫微斗数算法优化测试 ===');
console.log('');

const analyzer = new ZiweiAnalyzer();

// 测试用例
const testCases = [
  {
    name: '1976年3月17日23:00 男性',
    birth_date: '1976-03-17',
    birth_time: '23:00',
    gender: 'male',
    expected: {
      nayin: '沙中土',
      wuxing_ju: '土五局'
    }
  },
  {
    name: '1990年1月15日14:30 女性',
    birth_date: '1990-01-15',
    birth_time: '14:30',
    gender: 'female',
    expected: {
      nayin: '大林木', // 1990年庚午年，纳音为大林木
      wuxing_ju: '木三局'
    }
  },
  {
    name: '2000年2月29日12:00 男性（闰年测试）',
    birth_date: '2000-02-29',
    birth_time: '12:00',
    gender: 'male',
    expected: {
      nayin: '白蜡金',
      wuxing_ju: '金四局'
    }
  },
  {
    name: '1984年甲子年测试',
    birth_date: '1984-06-15',
    birth_time: '10:30',
    gender: 'male',
    expected: {
      nayin: '海中金',
      wuxing_ju: '金四局'
    }
  }
];

console.log('🔍 开始测试五行局计算和星曜安星...');
console.log('');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  try {
    const result = analyzer.performRealZiweiAnalysis({
      name: '测试',
      birth_date: testCase.birth_date,
      birth_time: testCase.birth_time,
      gender: testCase.gender
    });
    
    // 测试五行局计算
    console.log('📊 五行局测试:');
    if (result.basic_info && result.basic_info.wuxing_ju) {
      const wuxingJu = result.basic_info.wuxing_ju;
      console.log(`  纳音: ${wuxingJu.nayin || '未计算'}`);
      console.log(`  五行局: ${wuxingJu.type}`);
      console.log(`  局数: ${wuxingJu.number}`);
      console.log(`  起运年龄: ${wuxingJu.start_age}岁`);
      
      // 验证结果
      if (testCase.expected.nayin && wuxingJu.nayin === testCase.expected.nayin) {
        console.log('  ✅ 纳音计算正确');
      } else if (testCase.expected.nayin) {
        console.log(`  ❌ 纳音计算错误，期望: ${testCase.expected.nayin}，实际: ${wuxingJu.nayin}`);
      }
      
      if (wuxingJu.type === testCase.expected.wuxing_ju) {
        console.log('  ✅ 五行局计算正确');
      } else {
        console.log(`  ❌ 五行局计算错误，期望: ${testCase.expected.wuxing_ju}，实际: ${wuxingJu.type}`);
      }
    } else {
      console.log('  ❌ 五行局计算失败');
    }
    
    // 测试星曜安星
    console.log('⭐ 星曜安星测试:');
    if (result.ziwei_analysis && result.ziwei_analysis.twelve_palaces) {
      const palaces = result.ziwei_analysis.twelve_palaces;
      const mingGong = palaces['命宫'];
      
      if (mingGong && mingGong.main_stars) {
        console.log(`  命宫主星: ${mingGong.main_stars.join(', ')}`);
        console.log(`  命宫位置: ${mingGong.position}`);
        
        // 统计十四主星分布
        const allMainStars = [];
        Object.values(palaces).forEach(palace => {
          if (palace.main_stars) {
            allMainStars.push(...palace.main_stars);
          }
        });
        
        const expectedMainStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
        const foundStars = expectedMainStars.filter(star => allMainStars.includes(star));
        
        console.log(`  十四主星完整性: ${foundStars.length}/14`);
        if (foundStars.length === 14) {
          console.log('  ✅ 十四主星安星完整');
        } else {
          const missingStars = expectedMainStars.filter(star => !allMainStars.includes(star));
          console.log(`  ⚠️ 缺少主星: ${missingStars.join(', ')}`);
        }
        
        // 检查重复星曜
        const starCounts = {};
        allMainStars.forEach(star => {
          starCounts[star] = (starCounts[star] || 0) + 1;
        });
        
        const duplicateStars = Object.entries(starCounts).filter(([star, count]) => count > 1);
        if (duplicateStars.length === 0) {
          console.log('  ✅ 无重复星曜');
        } else {
          console.log(`  ❌ 重复星曜: ${duplicateStars.map(([star, count]) => `${star}(${count}次)`).join(', ')}`);
        }
      } else {
        console.log('  ❌ 命宫主星计算失败');
      }
    } else {
      console.log('  ❌ 星曜安星失败');
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
  
  console.log('');
});

console.log('=== 专项算法测试 ===');
console.log('');

// 测试纳音五行计算
console.log('🧪 纳音五行计算测试:');
const nayinTests = [
  { stem: '甲', branch: '子', expected: '海中金' },
  { stem: '乙', branch: '丑', expected: '海中金' },
  { stem: '丙', branch: '辰', expected: '沙中土' },
  { stem: '庚', branch: '辰', expected: '白蜡金' },
  { stem: '壬', branch: '戌', expected: '大海水' }
];

nayinTests.forEach((test, index) => {
  const result = analyzer.calculateNayin(test.stem, test.branch);
  const isCorrect = result === test.expected;
  console.log(`${index + 1}. ${test.stem}${test.branch} → ${result} ${isCorrect ? '✅' : '❌'}`);
  if (!isCorrect) {
    console.log(`   期望: ${test.expected}`);
  }
});

console.log('');

// 测试紫微星定位
console.log('🌟 紫微星定位测试:');
const ziweiTests = [
  { day: 1, ju: 5, expected: '寅宫起初一，土五局逆数四位' },
  { day: 15, ju: 4, expected: '寅宫起十五，金四局逆数三位' },
  { day: 30, ju: 2, expected: '寅宫起三十，水二局逆数一位' }
];

ziweiTests.forEach((test, index) => {
  const position = analyzer.calculateZiweiStarPosition(test.day, test.ju);
  const branchName = analyzer.earthlyBranches[position];
  console.log(`${index + 1}. 初${test.day}日 ${test.ju}局 → ${branchName}宫(${position}) - ${test.expected}`);
});

console.log('');
console.log('=== 测试完成 ===');
console.log('');
console.log('📊 测试总结:');
console.log('- 五行局计算：基于纳音五行的传统算法');
console.log('- 星曜安星：十四主星的精确定位');
console.log('- 紫微定位：传统寅宫起初一算法');
console.log('- 算法完整性：覆盖北斗南斗星系');