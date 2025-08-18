import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建数据库连接
const dbPath = path.join(__dirname, '..', 'numerology.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    birth_date DATE,
    birth_time TIME,
    birth_place TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建分析记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reading_type TEXT NOT NULL CHECK (reading_type IN ('bazi', 'ziwei', 'yijing', 'wuxing')),
    name TEXT,
    birth_date DATE,
    birth_time TIME,
    gender TEXT CHECK (gender IN ('male', 'female')),
    birth_place TEXT,
    input_data TEXT,
    results TEXT,
    analysis TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 创建索引
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id);
  CREATE INDEX IF NOT EXISTS idx_readings_type ON readings(reading_type);
  CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
`);

// 数据库操作函数
export const dbOperations = {
  // 用户相关操作
  createUser: db.prepare(`
    INSERT INTO users (email, password, full_name, birth_date, birth_time, birth_place, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  
  getUserById: db.prepare('SELECT id, email, full_name, birth_date, birth_time, birth_place, gender, created_at FROM users WHERE id = ?'),
  
  updateUser: db.prepare(`
    UPDATE users 
    SET full_name = ?, birth_date = ?, birth_time = ?, birth_place = ?, gender = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  // 分析记录相关操作
  createReading: db.prepare(`
    INSERT INTO readings (user_id, reading_type, name, birth_date, birth_time, gender, birth_place, input_data, results, analysis)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  getReadingsByUserId: db.prepare(`
    SELECT * FROM readings 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `),
  
  getReadingsByUserIdAndType: db.prepare(`
    SELECT * FROM readings 
    WHERE user_id = ? AND reading_type = ?
    ORDER BY created_at DESC
  `),
  
  getReadingById: db.prepare('SELECT * FROM readings WHERE id = ?'),
  
  deleteReading: db.prepare('DELETE FROM readings WHERE id = ? AND user_id = ?'),
  
  // 统计信息
  getUserReadingCount: db.prepare('SELECT COUNT(*) as count FROM readings WHERE user_id = ?'),
  
  getReadingCountByType: db.prepare('SELECT reading_type, COUNT(*) as count FROM readings WHERE user_id = ? GROUP BY reading_type')
};

// 优雅关闭数据库连接
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db;