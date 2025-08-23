const { getDB } = require('../database/index.cjs');

/**
 * 迁移ai_interpretations表，将analysis_id字段从INTEGER改为TEXT
 * 这样可以支持字符串类型的analysis_id
 */
function migrateAiInterpretationsTable() {
  const db = getDB();
  
  try {
    console.log('开始迁移ai_interpretations表...');
    
    // 检查表是否存在
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_interpretations'"
    ).get();
    
    if (!tableExists) {
      console.log('ai_interpretations表不存在，跳过迁移');
      return;
    }
    
    // 检查analysis_id字段的类型
    const columnInfo = db.prepare("PRAGMA table_info(ai_interpretations)").all();
    const analysisIdColumn = columnInfo.find(col => col.name === 'analysis_id');
    
    if (analysisIdColumn && analysisIdColumn.type === 'TEXT') {
      console.log('analysis_id字段已经是TEXT类型，无需迁移');
      return;
    }
    
    // 开始事务
    db.exec('BEGIN TRANSACTION');
    
    // 1. 创建新的临时表
    db.exec(`
      CREATE TABLE ai_interpretations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        analysis_id TEXT NOT NULL,
        analysis_type TEXT NOT NULL CHECK (analysis_type IN ('bazi', 'ziwei', 'yijing')),
        content TEXT NOT NULL,
        model TEXT,
        tokens_used INTEGER,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // 2. 复制数据到新表（将INTEGER转换为TEXT）
    db.exec(`
      INSERT INTO ai_interpretations_new 
      (id, user_id, analysis_id, analysis_type, content, model, tokens_used, success, error_message, created_at, updated_at)
      SELECT 
        id, user_id, CAST(analysis_id AS TEXT), analysis_type, content, model, tokens_used, success, error_message, created_at, updated_at
      FROM ai_interpretations
    `);
    
    // 3. 删除旧表
    db.exec('DROP TABLE ai_interpretations');
    
    // 4. 重命名新表
    db.exec('ALTER TABLE ai_interpretations_new RENAME TO ai_interpretations');
    
    // 5. 重新创建索引
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_user_id ON ai_interpretations(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_analysis_id ON ai_interpretations(analysis_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_interpretations_created_at ON ai_interpretations(created_at DESC)');
    
    // 提交事务
    db.exec('COMMIT');
    
    console.log('ai_interpretations表迁移完成');
    
  } catch (error) {
    // 回滚事务
    try {
      db.exec('ROLLBACK');
    } catch (rollbackError) {
      console.error('回滚失败:', rollbackError);
    }
    
    console.error('迁移失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    migrateAiInterpretationsTable();
    console.log('迁移成功完成');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

module.exports = { migrateAiInterpretationsTable };