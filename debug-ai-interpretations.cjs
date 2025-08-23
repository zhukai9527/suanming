const { getDB } = require('./server/database/index.cjs');

/**
 * 调试AI解读记录与历史记录匹配问题的脚本
 */
function debugAIInterpretations() {
  try {
    // 初始化数据库连接
    const { dbManager } = require('./server/database/index.cjs');
    dbManager.init();
    const db = getDB();
    
    console.log('=== AI解读记录与历史记录匹配分析 ===\n');
    
    // 1. 查看所有AI解读记录
    console.log('1. 所有AI解读记录:');
    const aiInterpretations = db.prepare(`
      SELECT 
        id,
        analysis_id,
        analysis_type,
        created_at,
        success
      FROM ai_interpretations 
      ORDER BY created_at DESC
    `).all();
    
    console.log(`总共有 ${aiInterpretations.length} 条AI解读记录`);
    aiInterpretations.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, analysis_id: ${record.analysis_id}, type: ${record.analysis_type}, created: ${record.created_at}, success: ${record.success}`);
    });
    
    console.log('\n2. 所有历史记录:');
    const historyRecords = db.prepare(`
      SELECT 
        id,
        name,
        reading_type,
        created_at
      FROM numerology_readings 
      ORDER BY created_at DESC
    `).all();
    
    console.log(`总共有 ${historyRecords.length} 条历史记录`);
    historyRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, name: ${record.name}, type: ${record.reading_type}, created: ${record.created_at}`);
    });
    
    console.log('\n3. 匹配分析:');
    
    // 3.1 数字ID匹配分析
    console.log('\n3.1 数字ID匹配分析:');
    const numericMatches = [];
    const numericMismatches = [];
    
    aiInterpretations.forEach(ai => {
      const isNumeric = !isNaN(parseInt(ai.analysis_id)) && isFinite(ai.analysis_id);
      if (isNumeric) {
        const historyRecord = historyRecords.find(h => h.id.toString() === ai.analysis_id.toString());
        if (historyRecord) {
          numericMatches.push({ ai, history: historyRecord });
        } else {
          numericMismatches.push(ai);
        }
      }
    });
    
    console.log(`数字ID匹配成功: ${numericMatches.length} 条`);
    numericMatches.forEach((match, index) => {
      console.log(`  ${index + 1}. AI记录ID: ${match.ai.id}, analysis_id: ${match.ai.analysis_id} → 历史记录: ${match.history.name} (${match.history.reading_type})`);
    });
    
    console.log(`\n数字ID匹配失败: ${numericMismatches.length} 条`);
    numericMismatches.forEach((mismatch, index) => {
      console.log(`  ${index + 1}. AI记录ID: ${mismatch.id}, analysis_id: ${mismatch.analysis_id} (找不到对应的历史记录)`);
    });
    
    // 3.2 字符串ID分析
    console.log('\n3.2 字符串ID分析:');
    const stringIds = aiInterpretations.filter(ai => {
      const isNumeric = !isNaN(parseInt(ai.analysis_id)) && isFinite(ai.analysis_id);
      return !isNumeric;
    });
    
    console.log(`字符串ID记录: ${stringIds.length} 条`);
    stringIds.forEach((record, index) => {
      console.log(`  ${index + 1}. AI记录ID: ${record.id}, analysis_id: ${record.analysis_id}, type: ${record.analysis_type}`);
    });
    
    // 3.3 没有AI解读的历史记录
    console.log('\n3.3 没有AI解读的历史记录:');
    const recordsWithoutAI = [];
    
    historyRecords.forEach(history => {
      const hasAI = aiInterpretations.some(ai => {
        const isNumeric = !isNaN(parseInt(ai.analysis_id)) && isFinite(ai.analysis_id);
        if (isNumeric) {
          return ai.analysis_id.toString() === history.id.toString();
        }
        return false; // 字符串ID暂时不匹配
      });
      
      if (!hasAI) {
        recordsWithoutAI.push(history);
      }
    });
    
    console.log(`没有AI解读的历史记录: ${recordsWithoutAI.length} 条`);
    recordsWithoutAI.forEach((record, index) => {
      console.log(`  ${index + 1}. 历史记录ID: ${record.id}, name: ${record.name}, type: ${record.reading_type}, created: ${record.created_at}`);
    });
    
    // 4. 问题总结
    console.log('\n=== 问题总结 ===');
    console.log(`1. 总AI解读记录: ${aiInterpretations.length}`);
    console.log(`2. 总历史记录: ${historyRecords.length}`);
    console.log(`3. 数字ID匹配成功: ${numericMatches.length}`);
    console.log(`4. 数字ID匹配失败: ${numericMismatches.length}`);
    console.log(`5. 字符串ID记录: ${stringIds.length}`);
    console.log(`6. 没有AI解读的历史记录: ${recordsWithoutAI.length}`);
    
    // 5. 可能的问题原因
    console.log('\n=== 可能的问题原因 ===');
    if (numericMismatches.length > 0) {
      console.log('1. 数字ID不匹配问题:');
      console.log('   - AI解读记录的analysis_id指向不存在的历史记录');
      console.log('   - 可能是历史记录被删除，但AI解读记录仍然存在');
    }
    
    if (stringIds.length > 0) {
      console.log('2. 字符串ID问题:');
      console.log('   - 这些AI解读使用了生成的字符串ID（如"yijing-1234567890"）');
      console.log('   - 前端查询时无法找到对应的历史记录');
      console.log('   - 需要改进匹配逻辑或数据关联方式');
    }
    
    if (recordsWithoutAI.length > 0) {
      console.log('3. 历史记录缺少AI解读:');
      console.log('   - 这些记录可能是在AI解读功能实现之前创建的');
      console.log('   - 或者AI解读生成失败但历史记录保存成功');
    }
    
    console.log('\n=== 建议的解决方案 ===');
    console.log('1. 对于数字ID不匹配: 清理无效的AI解读记录');
    console.log('2. 对于字符串ID: 改进前端匹配逻辑，支持字符串ID查询');
    console.log('3. 对于缺少AI解读的历史记录: 可以提供重新生成AI解读的功能');
    
  } catch (error) {
    console.error('调试过程中发生错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  debugAIInterpretations();
}

module.exports = { debugAIInterpretations };