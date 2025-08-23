const { getDB } = require('./server/database/index.cjs');

/**
 * 清理重复记录的脚本
 * 保留每组重复记录中最新的一条，删除其他重复记录
 * 重新关联AI解读记录到保留的记录
 */
function cleanupDuplicateRecords() {
  try {
    // 初始化数据库连接
    const { dbManager } = require('./server/database/index.cjs');
    dbManager.init();
    const db = getDB();
    
    console.log('=== 开始清理重复记录 ===\n');
    
    // 开始事务
    db.exec('BEGIN TRANSACTION');
    
    try {
      // 1. 找出所有重复记录组
      console.log('1. 识别重复记录组...');
      const duplicateGroups = db.prepare(`
        SELECT 
          name,
          reading_type,
          user_id,
          COUNT(*) as count,
          GROUP_CONCAT(id ORDER BY created_at DESC) as ids,
          MAX(id) as keep_id
        FROM numerology_readings 
        GROUP BY name, reading_type, user_id
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `).all();
      
      console.log(`找到 ${duplicateGroups.length} 个重复记录组`);
      
      let totalDuplicates = 0;
      let totalDeleted = 0;
      let aiRecordsUpdated = 0;
      
      // 2. 处理每个重复组
      for (const group of duplicateGroups) {
        const ids = group.ids.split(',').map(id => parseInt(id));
        const keepId = group.keep_id; // 保留最新的记录
        const deleteIds = ids.filter(id => id !== keepId);
        
        totalDuplicates += (group.count - 1);
        
        console.log(`\n处理组: ${group.name} (${group.reading_type})`);
        console.log(`  总记录: ${group.count}条`);
        console.log(`  保留记录: ID ${keepId}`);
        console.log(`  删除记录: ${deleteIds.join(', ')}`);
        
        // 3. 更新AI解读记录的关联
        for (const deleteId of deleteIds) {
          const aiRecords = db.prepare(`
            SELECT id FROM ai_interpretations
            WHERE analysis_id = ? AND user_id = ?
          `).all(deleteId.toString(), group.user_id);
          
          if (aiRecords.length > 0) {
            console.log(`  发现 ${aiRecords.length} 条AI解读记录需要重新关联`);
            
            // 检查目标记录是否已有AI解读
            const existingAI = db.prepare(`
              SELECT id FROM ai_interpretations
              WHERE analysis_id = ? AND user_id = ?
            `).get(keepId.toString(), group.user_id);
            
            if (existingAI) {
              console.log(`  目标记录已有AI解读，删除重复的AI解读记录`);
              // 删除重复的AI解读记录
              const deleteAI = db.prepare(`
                DELETE FROM ai_interpretations
                WHERE analysis_id = ? AND user_id = ?
              `);
              deleteAI.run(deleteId.toString(), group.user_id);
            } else {
              console.log(`  重新关联AI解读记录到保留的记录`);
              // 更新AI解读记录的analysis_id
              const updateAI = db.prepare(`
                UPDATE ai_interpretations
                SET analysis_id = ?
                WHERE analysis_id = ? AND user_id = ?
              `);
              const result = updateAI.run(keepId.toString(), deleteId.toString(), group.user_id);
              aiRecordsUpdated += result.changes;
            }
          }
        }
        
        // 4. 删除重复的历史记录
        if (deleteIds.length > 0) {
          const deleteStmt = db.prepare(`
            DELETE FROM numerology_readings
            WHERE id IN (${deleteIds.map(() => '?').join(',')})
          `);
          const result = deleteStmt.run(...deleteIds);
          totalDeleted += result.changes;
          console.log(`  删除了 ${result.changes} 条重复记录`);
        }
      }
      
      // 5. 清理无法关联的AI解读记录
      console.log('\n5. 清理无法关联的AI解读记录...');
      const orphanedAI = db.prepare(`
        SELECT ai.id, ai.analysis_id, ai.analysis_type
        FROM ai_interpretations ai
        LEFT JOIN numerology_readings nr ON ai.analysis_id = nr.id AND ai.user_id = nr.user_id
        WHERE nr.id IS NULL
      `).all();
      
      if (orphanedAI.length > 0) {
        console.log(`发现 ${orphanedAI.length} 条无法关联的AI解读记录`);
        orphanedAI.forEach(record => {
          console.log(`  AI记录 ${record.id}: analysis_id=${record.analysis_id}, type=${record.analysis_type}`);
        });
        
        // 删除无法关联的AI解读记录
        const deleteOrphanedAI = db.prepare(`
          DELETE FROM ai_interpretations
          WHERE id IN (${orphanedAI.map(() => '?').join(',')})
        `);
        const result = deleteOrphanedAI.run(...orphanedAI.map(r => r.id));
        console.log(`删除了 ${result.changes} 条无法关联的AI解读记录`);
      } else {
        console.log('没有发现无法关联的AI解读记录');
      }
      
      // 提交事务
      db.exec('COMMIT');
      
      // 6. 输出清理结果
      console.log('\n=== 清理完成 ===');
      console.log(`处理的重复组: ${duplicateGroups.length}`);
      console.log(`总重复记录: ${totalDuplicates}`);
      console.log(`删除的记录: ${totalDeleted}`);
      console.log(`更新的AI解读: ${aiRecordsUpdated}`);
      console.log(`删除的孤立AI解读: ${orphanedAI.length}`);
      
      // 7. 验证清理结果
      console.log('\n=== 验证清理结果 ===');
      const remainingDuplicates = db.prepare(`
        SELECT COUNT(*) as count
        FROM (
          SELECT name, reading_type, user_id, COUNT(*) as cnt
          FROM numerology_readings 
          GROUP BY name, reading_type, user_id
          HAVING COUNT(*) > 1
        )
      `).get();
      
      console.log(`剩余重复记录组: ${remainingDuplicates.count}`);
      
      const totalRecords = db.prepare(`
        SELECT COUNT(*) as count FROM numerology_readings
      `).get();
      
      console.log(`当前历史记录总数: ${totalRecords.count}`);
      
      const totalAI = db.prepare(`
        SELECT COUNT(*) as count FROM ai_interpretations
      `).get();
      
      console.log(`当前AI解读记录总数: ${totalAI.count}`);
      
      const matchedAI = db.prepare(`
        SELECT COUNT(*) as count
        FROM ai_interpretations ai
        JOIN numerology_readings nr ON ai.analysis_id = nr.id AND ai.user_id = nr.user_id
      `).get();
      
      console.log(`成功关联的AI解读: ${matchedAI.count}`);
      console.log(`AI解读关联率: ${((matchedAI.count / totalAI.count) * 100).toFixed(1)}%`);
      
    } catch (error) {
      // 回滚事务
      db.exec('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('清理过程中发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    cleanupDuplicateRecords();
    console.log('\n✅ 数据清理成功完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据清理失败:', error);
    process.exit(1);
  }
}

module.exports = { cleanupDuplicateRecords };