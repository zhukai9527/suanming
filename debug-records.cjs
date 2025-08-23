const { getDB } = require('./server/database/index.cjs');
const { dbManager } = require('./server/database/index.cjs');

try {
  dbManager.init();
  const db = getDB();
  
  console.log('=== 最近的分析记录 ===');
  const recent = db.prepare('SELECT id, name, reading_type, created_at FROM numerology_readings ORDER BY created_at DESC LIMIT 5').all();
  console.log(`总共 ${recent.length} 条分析记录`);
  recent.forEach((r, i) => {
    console.log(`${i+1}. ID: ${r.id}, 名称: ${r.name}, 类型: ${r.reading_type}, 创建时间: ${r.created_at}`);
  });
  
  console.log('\n=== AI解读记录 ===');
  const ai = db.prepare('SELECT id, reading_id, created_at FROM ai_interpretations ORDER BY created_at DESC LIMIT 5').all();
  console.log(`总共 ${ai.length} 条AI解读记录`);
  ai.forEach((r, i) => {
    console.log(`${i+1}. AI_ID: ${r.id}, reading_id: ${r.reading_id}, 创建时间: ${r.created_at}`);
  });
  
  console.log('\n=== 检查最新记录的AI解读状态 ===');
  if (recent.length > 0) {
    const latestRecord = recent[0];
    const hasAI = db.prepare('SELECT COUNT(*) as count FROM ai_interpretations WHERE reading_id = ?').get(latestRecord.id);
    console.log(`最新记录 ID: ${latestRecord.id} (${latestRecord.reading_type}) 是否有AI解读: ${hasAI.count > 0 ? '是' : '否'}`);
  }
  
} catch (error) {
  console.error('调试失败:', error);
} finally {
  process.exit(0);
}