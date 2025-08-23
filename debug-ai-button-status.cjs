/**
 * 调试AI解读按钮状态的脚本
 * 检查AI配置和recordId传递情况
 */

// 模拟前端AI配置检查
function checkAIConfig() {
  console.log('=== AI配置检查 ===');
  
  // 模拟默认配置
  const defaultConfig = {
    apiKey: 'dee444451bdf4232920a88ef430ce753.Z4SAbECrSnf5JMq7',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    modelName: 'GLM-4.5',
    maxTokens: 50000,
    temperature: 0.6,
    timeout: 120000,
    stream: true
  };
  
  console.log('默认AI配置:');
  console.log(JSON.stringify(defaultConfig, null, 2));
  
  // 验证配置
  const isValid = !!(defaultConfig.apiKey && defaultConfig.apiUrl && defaultConfig.modelName);
  console.log(`AI配置是否有效: ${isValid}`);
  
  return isValid;
}

// 检查数据库中的记录和AI解读状态
function checkRecordStatus() {
  try {
    const { getDB } = require('./server/database/index.cjs');
    const { dbManager } = require('./server/database/index.cjs');
    
    dbManager.init();
    const db = getDB();
    
    console.log('\n=== 数据库记录状态检查 ===');
    
    // 检查最近的历史记录
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
    
    console.log('\n最近的历史记录:');
    recentRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, name: ${record.name}, type: ${record.reading_type}, created: ${record.local_time}`);
      
      // 检查是否有对应的AI解读
      const aiRecord = db.prepare(`
        SELECT id, success FROM ai_interpretations
        WHERE analysis_id = ? AND user_id = (
          SELECT user_id FROM numerology_readings WHERE id = ?
        )
      `).get(record.id.toString(), record.id);
      
      if (aiRecord) {
        console.log(`     → 有AI解读记录 (ID: ${aiRecord.id}, success: ${aiRecord.success})`);
      } else {
        console.log(`     → 无AI解读记录`);
      }
    });
    
    // 检查AI解读记录
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
      LIMIT 5
    `).all();
    
    console.log('\n最近的AI解读记录:');
    aiRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, analysis_id: ${record.analysis_id}, type: ${record.analysis_type}, success: ${record.success}, created: ${record.local_time}`);
    });
    
    return { recentRecords, aiRecords };
    
  } catch (error) {
    console.error('检查数据库记录时发生错误:', error);
    return null;
  }
}

// 模拟AI解读按钮状态检查
function simulateButtonStatus(recordId, hasAIConfig) {
  console.log('\n=== AI解读按钮状态模拟 ===');
  
  const hasValidId = !!recordId;
  const isConfigValid = hasAIConfig;
  
  console.log(`recordId: ${recordId}`);
  console.log(`hasValidId: ${hasValidId}`);
  console.log(`isConfigValid: ${isConfigValid}`);
  
  // 模拟按钮禁用逻辑
  const isDisabled = !isConfigValid || !hasValidId;
  
  console.log(`按钮是否禁用: ${isDisabled}`);
  
  if (isDisabled) {
    console.log('禁用原因:');
    if (!isConfigValid) {
      console.log('  - AI配置无效');
    }
    if (!hasValidId) {
      console.log('  - 缺少有效的recordId');
    }
  } else {
    console.log('按钮应该可以点击');
  }
  
  return !isDisabled;
}

// 主函数
function debugAIButtonStatus() {
  console.log('=== AI解读按钮状态调试 ===\n');
  
  // 1. 检查AI配置
  const isAIConfigValid = checkAIConfig();
  
  // 2. 检查数据库记录
  const dbStatus = checkRecordStatus();
  
  if (dbStatus && dbStatus.recentRecords.length > 0) {
    // 3. 模拟最新记录的按钮状态
    const latestRecord = dbStatus.recentRecords[0];
    console.log(`\n=== 模拟最新记录 (ID: ${latestRecord.id}) 的按钮状态 ===`);
    
    const canClick = simulateButtonStatus(latestRecord.id, isAIConfigValid);
    
    console.log('\n=== 总结 ===');
    console.log(`最新记录: ${latestRecord.name} (${latestRecord.reading_type})`);
    console.log(`记录ID: ${latestRecord.id}`);
    console.log(`AI配置有效: ${isAIConfigValid}`);
    console.log(`AI解读按钮可点击: ${canClick}`);
    
    if (!canClick) {
      console.log('\n🔧 解决建议:');
      if (!isAIConfigValid) {
        console.log('1. 检查AI配置是否正确设置');
        console.log('2. 确认API密钥、URL和模型名称都已配置');
      }
      if (!latestRecord.id) {
        console.log('1. 检查分析结果保存逻辑');
        console.log('2. 确认recordId正确传递给AI解读按钮');
      }
    }
  } else {
    console.log('\n❌ 没有找到历史记录，请先进行分析');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    debugAIButtonStatus();
  } catch (error) {
    console.error('调试过程中发生错误:', error);
  }
}

module.exports = { debugAIButtonStatus };