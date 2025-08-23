const { getDB } = require('./server/database/index.cjs');

/**
 * 调试重复记录问题的脚本
 * 检查是否存在AI解读后创建新历史记录的情况
 */
function debugDuplicateRecords() {
  try {
    // 初始化数据库连接
    const { dbManager } = require('./server/database/index.cjs');
    dbManager.init();
    const db = getDB();
    
    console.log('=== 调试重复记录问题 ===\n');
    
    // 1. 检查最近的历史记录
    console.log('1. 最近的历史记录 (按创建时间排序):');
    const recentRecords = db.prepare(`
      SELECT 
        id,
        name,
        reading_type,
        created_at,
        datetime(created_at, 'localtime') as local_time
      FROM numerology_readings 
      ORDER BY created_at DESC
      LIMIT 20
    `).all();
    
    recentRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, name: ${record.name}, type: ${record.reading_type}, created: ${record.local_time}`);
    });
    
    // 2. 检查AI解读记录
    console.log('\n2. AI解读记录:');
    const aiRecords = db.prepare(`
      SELECT 
        id,
        analysis_id,
        analysis_type,
        created_at,
        datetime(created_at, 'localtime') as local_time
      FROM ai_interpretations 
      ORDER BY created_at DESC
    `).all();
    
    aiRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, analysis_id: ${record.analysis_id}, type: ${record.analysis_type}, created: ${record.local_time}`);
    });
    
    // 3. 分析可能的重复模式
    console.log('\n3. 分析重复模式:');
    
    // 按名称和类型分组，查找可能的重复记录
    const duplicateGroups = db.prepare(`
      SELECT 
        name,
        reading_type,
        COUNT(*) as count,
        GROUP_CONCAT(id) as ids,
        GROUP_CONCAT(datetime(created_at, 'localtime')) as times
      FROM numerology_readings 
      GROUP BY name, reading_type
      HAVING COUNT(*) > 1
      ORDER BY count DESC, MAX(created_at) DESC
      LIMIT 10
    `).all();
    
    if (duplicateGroups.length > 0) {
      console.log('  发现可能的重复记录组:');
      duplicateGroups.forEach((group, index) => {
        console.log(`    ${index + 1}. ${group.name} (${group.reading_type}): ${group.count}条记录`);
        console.log(`       IDs: ${group.ids}`);
        console.log(`       创建时间: ${group.times}`);
      });
    } else {
      console.log('  未发现明显的重复记录组');
    }
    
    // 4. 检查时间相近的记录
    console.log('\n4. 检查时间相近的记录 (5分钟内):');
    const closeTimeRecords = db.prepare(`
      SELECT 
        r1.id as id1,
        r1.name as name1,
        r1.reading_type as type1,
        r1.created_at as time1,
        r2.id as id2,
        r2.name as name2,
        r2.reading_type as type2,
        r2.created_at as time2,
        ABS(strftime('%s', r1.created_at) - strftime('%s', r2.created_at)) as time_diff_seconds
      FROM numerology_readings r1
      JOIN numerology_readings r2 ON r1.id < r2.id
      WHERE r1.name = r2.name 
        AND r1.reading_type = r2.reading_type
        AND ABS(strftime('%s', r1.created_at) - strftime('%s', r2.created_at)) <= 300
      ORDER BY time_diff_seconds ASC
      LIMIT 10
    `).all();
    
    if (closeTimeRecords.length > 0) {
      console.log('  发现时间相近的相似记录:');
      closeTimeRecords.forEach((pair, index) => {
        console.log(`    ${index + 1}. ${pair.name1} (${pair.type1}):`);
        console.log(`       记录1: ID ${pair.id1}, 时间: ${pair.time1}`);
        console.log(`       记录2: ID ${pair.id2}, 时间: ${pair.time2}`);
        console.log(`       时间差: ${pair.time_diff_seconds}秒`);
      });
    } else {
      console.log('  未发现时间相近的相似记录');
    }
    
    // 5. 检查AI解读与历史记录的关联情况
    console.log('\n5. AI解读与历史记录关联分析:');
    
    // 数字ID关联
    const numericMatches = db.prepare(`
      SELECT 
        ai.id as ai_id,
        ai.analysis_id,
        ai.analysis_type,
        nr.id as record_id,
        nr.name,
        nr.reading_type,
        datetime(ai.created_at, 'localtime') as ai_time,
        datetime(nr.created_at, 'localtime') as record_time
      FROM ai_interpretations ai
      JOIN numerology_readings nr ON ai.analysis_id = nr.id AND ai.user_id = nr.user_id
      ORDER BY ai.created_at DESC
    `).all();
    
    console.log(`  数字ID成功关联: ${numericMatches.length}条`);
    numericMatches.forEach((match, index) => {
      console.log(`    ${index + 1}. AI记录${match.ai_id} → 历史记录${match.record_id} (${match.name}, ${match.reading_type})`);
      console.log(`       AI创建: ${match.ai_time}, 记录创建: ${match.record_time}`);
    });
    
    // 字符串ID（无法关联）
    const stringIdRecords = db.prepare(`
      SELECT 
        ai.id as ai_id,
        ai.analysis_id,
        ai.analysis_type,
        datetime(ai.created_at, 'localtime') as ai_time
      FROM ai_interpretations ai
      LEFT JOIN numerology_readings nr ON ai.analysis_id = nr.id AND ai.user_id = nr.user_id
      WHERE nr.id IS NULL
      ORDER BY ai.created_at DESC
    `).all();
    
    console.log(`\n  字符串ID无法关联: ${stringIdRecords.length}条`);
    stringIdRecords.forEach((record, index) => {
      console.log(`    ${index + 1}. AI记录${record.ai_id}, analysis_id: ${record.analysis_id}, type: ${record.analysis_type}`);
      console.log(`       创建时间: ${record.ai_time}`);
    });
    
    // 6. 总结分析
    console.log('\n=== 问题分析总结 ===');
    
    const totalRecords = recentRecords.length;
    const totalAI = aiRecords.length;
    const duplicateCount = duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);
    
    console.log(`历史记录总数: ${totalRecords}`);
    console.log(`AI解读记录总数: ${totalAI}`);
    console.log(`可能的重复记录: ${duplicateCount}条`);
    console.log(`成功关联的AI解读: ${numericMatches.length}条`);
    console.log(`无法关联的AI解读: ${stringIdRecords.length}条`);
    
    if (stringIdRecords.length > 0) {
      console.log('\n⚠️  发现问题:');
      console.log('   - 存在无法关联到历史记录的AI解读');
      console.log('   - 这些AI解读使用了字符串ID，不对应任何历史记录');
      console.log('   - 可能的原因：AI解读时没有正确的recordId');
    }
    
    if (duplicateGroups.length > 0) {
      console.log('\n⚠️  发现重复记录:');
      console.log('   - 存在相同名称和类型的多条历史记录');
      console.log('   - 可能的原因：用户多次提交相同的分析请求');
    }
    
  } catch (error) {
    console.error('调试过程中发生错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  debugDuplicateRecords();
}

module.exports = { debugDuplicateRecords };