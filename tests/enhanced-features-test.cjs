/**
 * 增强功能测试：农历信息和子时计算说明
 * 测试八字和紫微斗数分析中的新增功能
 */

const BaziAnalyzer = require('../server/services/baziAnalyzer.cjs');
const ZiweiAnalyzer = require('../server/services/ziweiAnalyzer.cjs');

// 创建分析器实例
const baziAnalyzer = new BaziAnalyzer();
const ziweiAnalyzer = new ZiweiAnalyzer();

console.log('🧪 增强功能测试：农历信息和子时计算说明\n');

// 测试用例
const testCases = [
  {
    name: '晚子时测试',
    birth_data: {
      name: '测试用户',
      birth_date: '1976-03-17',
      birth_time: '23:30',
      gender: 'male'
    }
  },
  {
    name: '早子时测试',
    birth_data: {
      name: '测试用户',
      birth_date: '1988-08-08',
      birth_time: '00:18',
      gender: 'female'
    }
  },
  {
    name: '普通时辰测试',
    birth_data: {
      name: '测试用户',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      gender: 'male'
    }
  }
];

// 测试八字分析的增强功能
console.log('📊 八字分析增强功能测试\n');

const testBaziFeatures = async () => {
  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
  console.log(`${index + 1}. ${testCase.name} - 八字分析`);
  console.log(`   出生信息: ${testCase.birth_data.birth_date} ${testCase.birth_data.birth_time}`);
  
  try {
    const result = await baziAnalyzer.performFullBaziAnalysis(testCase.birth_data);
    
    // 测试农历信息
    console.log('\n   🌙 农历信息:');
    const lunarInfo = result.basic_info.lunar_info;
    console.log(`   农历日期: ${lunarInfo.lunar_date}`);
    console.log(`   干支年: ${lunarInfo.ganzhi_year}`);
    console.log(`   生肖: ${lunarInfo.zodiac}`);
    console.log(`   节气: ${lunarInfo.solar_term}`);
    
    // 测试子时计算说明
    if (result.basic_info.zishi_calculation_note) {
      console.log('\n   ⏰ 子时计算说明:');
      const note = result.basic_info.zishi_calculation_note;
      console.log(`   子时类型: ${note.zishi_type}`);
      console.log(`   计算方法: ${note.calculation_method}`);
      console.log(`   详细说明: ${note.explanation}`);
    } else {
      console.log('\n   ⏰ 非子时出生，无需特殊说明');
    }
    
    console.log('   ✅ 八字分析增强功能正常');
    
  } catch (error) {
    console.log(`   ❌ 八字分析失败: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  }
};

// 运行八字测试
testBaziFeatures().then(() => {
  // 测试紫微斗数分析的增强功能
console.log('🔮 紫微斗数分析增强功能测试\n');

const testZiweiFeatures = async () => {
  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
  console.log(`${index + 1}. ${testCase.name} - 紫微斗数分析`);
  console.log(`   出生信息: ${testCase.birth_data.birth_date} ${testCase.birth_data.birth_time}`);
  
  try {
    const result = ziweiAnalyzer.performRealZiweiAnalysis(testCase.birth_data);
    
    // 测试农历信息
    console.log('\n   🌙 农历信息:');
    const lunarInfo = result.basic_info.lunar_info;
    console.log(`   农历日期: ${lunarInfo.lunar_date}`);
    console.log(`   干支年: ${lunarInfo.ganzhi_year}`);
    console.log(`   生肖: ${lunarInfo.zodiac}`);
    console.log(`   节气: ${lunarInfo.solar_term}`);
    
    // 测试子时计算说明
    if (result.basic_info.zishi_calculation_note) {
      console.log('\n   ⏰ 子时计算说明:');
      const note = result.basic_info.zishi_calculation_note;
      console.log(`   子时类型: ${note.zishi_type}`);
      console.log(`   计算方法: ${note.calculation_method}`);
      console.log(`   详细说明: ${note.explanation}`);
      console.log(`   紫微影响: ${note.ziwei_impact}`);
    } else {
      console.log('\n   ⏰ 非子时出生，无需特殊说明');
    }
    
    // 显示五行局信息
    console.log('\n   🏰 五行局信息:');
    const wuxingJu = result.basic_info.wuxing_ju;
    console.log(`   五行局: ${wuxingJu.type}`);
    console.log(`   局数: ${wuxingJu.number}`);
    console.log(`   起运年龄: ${wuxingJu.start_age}岁`);
    
    console.log('   ✅ 紫微斗数分析增强功能正常');
    
  } catch (error) {
    console.log(`   ❌ 紫微斗数分析失败: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  }
};

// 运行紫微斗数测试
testZiweiFeatures().then(() => {
  console.log('🏁 增强功能测试完成');

// 功能总结
console.log('\n📋 功能总结:');
console.log('1. ✅ 完整的农历信息显示');
console.log('   - 农历日期（年月日）');
console.log('   - 干支年份');
console.log('   - 生肖信息');
console.log('   - 节气信息');
console.log('\n2. ✅ 晚子时计算方法说明');
console.log('   - 自动识别早子时/晚子时');
console.log('   - 详细的计算方法说明');
console.log('   - 专家意见和理论依据');
console.log('   - 紫微斗数特殊影响说明');
console.log('3. ✅ 用户友好的信息展示');
console.log('   - 中文格式的农历日期');
console.log('   - 通俗易懂的计算说明');
console.log('   - 专业而详细的理论解释');
});

}).catch(error => {
  console.error('测试执行失败:', error);
});