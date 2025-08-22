const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.db = null;
    // 生产环境使用持久化存储路径，开发环境使用本地路径
    this.dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/numerology.db'
      : path.join(__dirname, '../../numerology.db');
    this.schemaPath = path.join(__dirname, 'schema.sql');
    
    // 输出数据库配置信息
    console.log(`🗄️ 数据库路径: ${this.dbPath}`);
    console.log(`🌍 运行环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 数据库文件: ${path.basename(this.dbPath)}`);
  }

  // 初始化数据库连接
  init() {
    try {
      // 确保数据库目录存在
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 创建数据库目录: ${dbDir}`);
      } else {
        console.log(`📁 数据库目录已存在: ${dbDir}`);
      }
      
      // 创建或连接到SQLite数据库
      this.db = new Database(this.dbPath);
      
      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      // 设置WAL模式以提高并发性能
      this.db.pragma('journal_mode = WAL');
      
      // 初始化数据库结构
      this.initializeSchema();
      
      console.log('数据库初始化成功');
      return this.db;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  // 初始化数据库结构
  initializeSchema() {
    try {
      const schema = fs.readFileSync(this.schemaPath, 'utf8');
      
      // 直接执行整个schema文件
      this.db.exec(schema);
      
      console.log('数据库结构初始化完成');
    } catch (error) {
      console.error('数据库结构初始化失败:', error);
      throw error;
    }
  }

  // 获取数据库实例
  getDatabase() {
    if (!this.db) {
      this.init();
    }
    return this.db;
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('数据库连接已关闭');
    }
  }

  // 执行事务
  transaction(callback) {
    const db = this.getDatabase();
    const transaction = db.transaction(callback);
    return transaction;
  }

  // 备份数据库
  backup(backupPath) {
    try {
      const db = this.getDatabase();
      db.backup(backupPath);
      console.log(`数据库备份成功: ${backupPath}`);
    } catch (error) {
      console.error('数据库备份失败:', error);
      throw error;
    }
  }

  // 清理过期会话
  cleanupExpiredSessions() {
    try {
      const db = this.getDatabase();
      const stmt = db.prepare('DELETE FROM user_sessions WHERE expires_at < ?');
      const result = stmt.run(new Date().toISOString());
      console.log(`清理了 ${result.changes} 个过期会话`);
      return result.changes;
    } catch (error) {
      console.error('清理过期会话失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const dbManager = new DatabaseManager();

// 导出数据库管理器和便捷方法
module.exports = {
  dbManager,
  getDB: () => dbManager.getDatabase(),
  closeDB: () => dbManager.close(),
  transaction: (callback) => dbManager.transaction(callback),
  backup: (path) => dbManager.backup(path),
  cleanupSessions: () => dbManager.cleanupExpiredSessions()
};

// 进程退出时自动关闭数据库
process.on('exit', () => {
  dbManager.close();
});

process.on('SIGINT', () => {
  dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  dbManager.close();
  process.exit(0);
});