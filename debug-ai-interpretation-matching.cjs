const { getDB } = require('./server/database/index.cjs');

/**
 * 调试AI解读记录匹配问题
 * 检查历史记录与AI解读记录的ID匹配情况
 */
function debugAIInterpretationMatching() {
  try {
    // 初始化数据库连接
    const { dbManager } = require('./server/database/index.cjs');
    dbManager.init();
    const db = getDB();
    
    console.log('=== AI解读记录匹配调试 ===\n');
    
    // 1. 获取最近的历史记录
    console.log('1. 最近的历史记录:');
    const recentRecords = db.prepare(`
      SELECT 
        id,
        name,
        reading_type,
        created_at,
        datetime(created_at, 'localtime') as local_time
      FROM numerology_readings 
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    recentRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id} (${typeof record.id}), name: ${record.name}, type: ${record.reading_type}, created: ${record.local_time}`);
    });
    
    // 2. 获取所有AI解读记录
    console.log('\n2. 所有AI解读记录:');
    const aiRecords = db.prepare(`
      SELECT 
        id,
        analysis_id,
        analysis_type,
        success,
        created_at,
        datetime(created_at, 'localtime') as local_time
      FROM ai_interpretations 
      ORDER BY created_at DESC
    `).all();
    
    aiRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. AI_ID: ${record.id}, analysis_id: ${record.analysis_id} (${typeof record.analysis_id}), type: ${record.analysis_type}, success: ${record.success}, created: ${record.local_time}`);
    });
    
    // 3. 检查每个历史记录是否有对应的AI解读
    console.log('\n3. 历史记录与AI解读匹配检查:');
    recentRecords.forEach((record, index) => {
      const recordIdStr = record.id.toString();
      const recordIdNum = parseInt(record.id);
      
      // 尝试字符串匹配
      const aiByString = db.prepare(`
        SELECT id, analysis_id, success FROM ai_interpretations
        WHERE analysis_id = ?
      `).get(recordIdStr);
      
      // 尝试数字匹配
      const aiByNumber = db.prepare(`
        SELECT id, analysis_id, success FROM ai_interpretations
        WHERE analysis_id = ?
      `).get(recordIdNum);
      
      console.log(`  ${index + 1}. 历史记录 ${record.id}:`);
      console.log(`     - 字符串匹配 '${recordIdStr}': ${aiByString ? `找到 AI_ID=${aiByString.id}` : '未找到'}`);
      console.log(`     - 数字匹配 ${recordIdNum}: ${aiByNumber ? `找到 AI_ID=${aiByNumber.id}` : '未找到'}`);
      
      if (aiByString || aiByNumber) {
        const ai = aiByString || aiByNumber;
        console.log(`     → 有AI解读: analysis_id=${ai.analysis_id}, success=${ai.success}`);
      } else {
        console.log(`     → 无AI解读记录`);
      }
    });
    
    // 4. 检查AI解读记录是否有对应的历史记录
    console.log('\n4. AI解读记录与历史记录匹配检查:');
    aiRecords.forEach((aiRecord, index) => {
      const analysisIdStr = aiRecord.analysis_id.toString();
      const analysisIdNum = parseInt(aiRecord.analysis_id);
      
      // 尝试字符串匹配
      const historyByString = db.prepare(`
        SELECT id, name, reading_type FROM numerology_readings
        WHERE id = ?
      `).get(analysisIdStr);
      
      // 尝试数字匹配
      const historyByNumber = db.prepare(`
        SELECT id, name, reading_type FROM numerology_readings
        WHERE id = ?
      `).get(analysisIdNum);
      
      console.log(`  ${index + 1}. AI解读 analysis_id=${aiRecord.analysis_id}:`);
      console.log(`     - 字符串匹配 '${analysisIdStr}': ${historyByString ? `找到 ${historyByString.name} (${historyByString.reading_type})` : '未找到'}`);
      console.log(`     - 数字匹配 ${analysisIdNum}: ${historyByNumber ? `找到 ${historyByNumber.name} (${historyByNumber.reading_type})` : '未找到'}`);
      
      if (!historyByString && !historyByNumber) {
        console.log(`     → 孤立的AI解读记录，无对应历史记录`);
      }
    });
    
    // 5. 模拟前端API调用
    console.log('\n5. 模拟前端API调用:');
    const testIds = recentRecords.slice(0, 3).map(r => r.id);
    
    testIds.forEach(id => {
      const idStr = id.toString();
      console.log(`\n  测试ID: ${id} (string: '${idStr}')`);
      
      // 模拟API调用逻辑
      const aiRecord = db.prepare(`
        SELECT 
          ai.id,
          ai.analysis_id,
          ai.success,
          ai.content,
          ai.created_at,
          ai.model,
          ai.tokens_used,
          ai.error_message,
          nr.name,
          nr.reading_type
        FROM ai_interpretations ai
        LEFT JOIN numerology_readings nr ON ai.analysis_id = nr.id
        WHERE ai.analysis_id = ? AND ai.user_id = (
          SELECT user_id FROM numerology_readings WHERE id = ?
        )
      `).get(idStr, id);
      
      if (aiRecord) {
        console.log(`    ✅ API会返回: success=${aiRecord.success}, content长度=${aiRecord.content?.length || 0}`);
        console.log(`       关联记录: ${aiRecord.name} (${aiRecord.reading_type})`);
      } else {
        console.log(`    ❌ API会返回: 404 Not Found`);
      }
    });
    
    // 6. 总结
    console.log('\n=== 总结 ===');
    const totalHistory = recentRecords.length;
    const totalAI = aiRecords.length;
    const matchedCount = recentRecords.filter(record => {
      const recordIdStr = record.id.toString();
      const recordIdNum = parseInt(record.id);
      const aiByString = db.prepare(`SELECT id FROM ai_interpretations WHERE analysis_id = ?`).get(recordIdStr);
      const aiByNumber = db.prepare(`SELECT id FROM ai_interpretations WHERE analysis_id = ?`).get(recordIdNum);
      return aiByString || aiByNumber;
    }).length;
    
    console.log(`历史记录总数: ${totalHistory}`);
    console.log(`AI解读记录总数: ${totalAI}`);
    console.log(`匹配成功数: ${matchedCount}`);
    console.log(`匹配率: ${((matchedCount / totalHistory) * 100).toFixed(1)}%`);
    
    if (matchedCount === 0) {
      console.log('\n⚠️  没有任何匹配的记录，可能的原因:');
      console.log('1. AI解读记录的analysis_id与历史记录的id不匹配');
      console.log('2. 数据类型不一致（字符串 vs 数字）');
      console.log('3. AI解读记录被意外删除或损坏');
    } else if (matchedCount < totalHistory) {
      console.log(`\n⚠️  部分记录不匹配，${totalHistory - matchedCount}条历史记录没有AI解读`);
    } else {
      console.log('\n✅ 所有记录都有对应的AI解读');
    }
    
  } catch (error) {
    console.error('调试过程中发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    debugAIInterpretationMatching();
    console.log('\n✅ 调试完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 调试失败:', error);
    process.exit(1);
  }
}

module.exports = { debugAIInterpretationMatching };