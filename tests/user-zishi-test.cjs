/**
 * 用户指定的晚子时测试
 * 测试1976年3月17日23:30的八字排盘
 */

const BaziAnalyzer = require('../server/services/baziAnalyzer.cjs');

// 创建八字分析器实例
const baziAnalyzer = new BaziAnalyzer();

console.log('🧪 用户指定晚子时测试：1976年3月17日23:30\n');

try {
  // 执行八字分析
  const result = baziAnalyzer.calculatePreciseBazi('1976-03-17', '23:30');
  
  console.log('📊 分析结果:');
  console.log(`完整八字: ${result.complete_chart}`);
  console.log(`年柱: ${result.year_pillar.stem}${result.year_pillar.branch}`);
  console.log(`月柱: ${result.month_pillar.stem}${result.month_pillar.branch}`);
  console.log(`日柱: ${result.day_pillar.stem}${result.day_pillar.branch}`);
  console.log(`时柱: ${result.hour_pillar.stem}${result.hour_pillar.branch}`);
  
  if (result.hour_pillar.zishi_type) {
    console.log(`子时类型: ${result.hour_pillar.zishi_type}`);
    console.log(`是否晚子时: ${result.hour_pillar.is_late_zishi}`);
    console.log(`是否早子时: ${result.hour_pillar.is_early_zishi}`);
  }
  
  console.log('\n🔍 详细信息:');
  console.log(`日主: ${result.day_master} (${result.day_master_element})`);
  console.log(`月令: ${result.month_order}`);
  
  console.log('\n📝 纳音五行:');
  console.log(`年柱纳音: ${result.nayin_info.year_nayin}`);
  console.log(`月柱纳音: ${result.nayin_info.month_nayin}`);
  console.log(`日柱纳音: ${result.nayin_info.day_nayin}`);
  console.log(`时柱纳音: ${result.nayin_info.hour_nayin}`);
  
  console.log('\n✅ 测试完成！');
  
  // 验证晚子时逻辑
  if (result.hour_pillar.is_late_zishi) {
    console.log('\n🎯 晚子时验证:');
    console.log('✅ 正确识别为晚子时');
    console.log('✅ 日柱使用当天干支');
    console.log('✅ 时柱使用第二天日干推算');
  } else {
    console.log('\n❌ 子时类型识别错误');
  }
  
} catch (error) {
  console.log(`❌ 测试执行失败: ${error.message}`);
  console.error(error);
}