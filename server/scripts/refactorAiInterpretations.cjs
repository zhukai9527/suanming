const { getDB } = require('../database/index.cjs');

/**
 * 重构AI解读记录表，建立与分析报告记录的正确1对1关系
 * 消除字符串analysis_id，使用正确的外键关联
 */
function refactorAiInterpretations() {
  const db = getDB();
  
  try {
    console.log('=== 开始重构AI解读记录表 ===\n');
    
    // 开始事务
    db.exec('BEGIN TRANSACTION');
    
    // 1. 分析现有数据
    console.log('1. 分析现有数据...');
    const allAI = db.prepare(`
      SELECT id, analysis_id, analysis_type, content, model, tokens_used, 
             success, error_message, created_at, updated_at, user_id
      FROM ai_interpretations
      ORDER BY created_at DESC
    `).all();
    
    console.log(`总AI解读记录: ${allAI.length}`);
    
    const stringIds = allAI.filter(r => typeof r.analysis_id === 'string');
    const numericIds = allAI.filter(r => typeof r.analysis_id === 'number');
    
    console.log(`字符串ID记录: ${stringIds.length}`);
    console.log(`数字ID记录: ${numericIds.length}`);
    
    if (stringIds.length === 0) {
      console.log('没有需要重构的字符串ID记录');
      db.exec('ROLLBACK');
      return;
    }
    
    // 2. 创建新的临时表
    console.log('\n2. 创建新的AI解读表结构...');
    db.exec(`
      CREATE TABLE ai_interpretations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reading_id INTEGER NOT NULL, -- 直接关联到numerology_readings表的id
        content TEXT NOT NULL,
        model TEXT,
        tokens_used INTEGER,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reading_id) REFERENCES numerology_readings(id) ON DELETE CASCADE,
        UNIQUE(reading_id) -- 确保1对1关系
      )
    `);
    
    // 3. 迁移数字ID记录（如果有的话）
    if (numericIds.length > 0) {
      console.log(`\n3. 迁移 ${numericIds.length} 条数字ID记录...`);
      const insertStmt = db.prepare(`
        INSERT INTO ai_interpretations_new 
        (user_id, reading_id, content, model, tokens_used, success, error_message, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const record of numericIds) {
        // 验证关联的记录是否存在
        const readingExists = db.prepare(
          'SELECT id FROM numerology_readings WHERE id = ? AND user_id = ?'
        ).get(record.analysis_id, record.user_id);
        
        if (readingExists) {
          insertStmt.run(
            record.user_id,
            record.analysis_id,
            record.content,
            record.model,
            record.tokens_used,
            record.success,
            record.error_message,
            record.created_at,
            record.updated_at
          );
          console.log(`  迁移记录: AI_ID=${record.id} -> reading_id=${record.analysis_id}`);
        } else {
          console.log(`  跳过无效记录: AI_ID=${record.id}, analysis_id=${record.analysis_id} (关联记录不存在)`);
        }
      }
    }
    
    // 4. 处理字符串ID记录 - 删除无效记录
    console.log(`\n4. 处理 ${stringIds.length} 条字符串ID记录...`);
    console.log('这些记录使用了临时生成的字符串ID，无法建立正确的关联关系，将被删除:');
    
    stringIds.forEach((record, index) => {
      console.log(`  ${index + 1}. AI_ID=${record.id}, analysis_id="${record.analysis_id}", type=${record.analysis_type}`);
    });
    
    // 5. 删除旧表，重命名新表
    console.log('\n5. 更新表结构...');
    db.exec('DROP TABLE ai_interpretations');
    db.exec('ALTER TABLE ai_interpretations_new RENAME TO ai_interpretations');
    
    // 6. 重新创建索引
    console.log('6. 重新创建索引...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_user_id ON ai_interpretations(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_reading_id ON ai_interpretations(reading_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_created_at ON ai_interpretations(created_at DESC)');
    
    // 7. 重新创建触发器
    console.log('7. 重新创建触发器...');
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_ai_interpretations_timestamp 
        AFTER UPDATE ON ai_interpretations
        FOR EACH ROW
        BEGIN
          UPDATE ai_interpretations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
    `);
    
    // 提交事务
    db.exec('COMMIT');
    
    // 8. 验证结果
    console.log('\n=== 重构完成 ===');
    const newCount = db.prepare('SELECT COUNT(*) as count FROM ai_interpretations').get();
    console.log(`新表记录数: ${newCount.count}`);
    
    const sampleRecords = db.prepare(`
      SELECT ai.id, ai.reading_id, ai.user_id, nr.name, nr.reading_type
      FROM ai_interpretations ai
      JOIN numerology_readings nr ON ai.reading_id = nr.id
      LIMIT 5
    `).all();
    
    console.log('\n示例关联记录:');
    sampleRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. AI_ID=${record.id} -> reading_id=${record.reading_id} (${record.name}, ${record.reading_type})`);
    });
    
    console.log('\n✅ AI解读记录表重构成功!');
    console.log('现在AI解读记录与分析报告记录建立了正确的1对1关系');
    
  } catch (error) {
    // 回滚事务
    try {
      db.exec('ROLLBACK');
    } catch (rollbackError) {
      console.error('回滚失败:', rollbackError);
    }
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const { dbManager } = require('../database/index.cjs');
    dbManager.init();
    refactorAiInterpretations();
    console.log('\n🎉 重构完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 重构失败:', error);
    process.exit(1);
  }
}

module.exports = { refactorAiInterpretations };