const express = require('express');
const { getDB } = require('../database/index.cjs');
const { authenticate } = require('../middleware/auth.cjs');
const { AppError, asyncHandler } = require('../middleware/errorHandler.cjs');

const router = express.Router();

// 获取用户档案
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDB();
  
  const profile = db.prepare(`
    SELECT 
      id,
      username,
      full_name,
      birth_date,
      birth_time,
      birth_location,
      gender,
      avatar_url,
      created_at,
      updated_at
    FROM user_profiles 
    WHERE user_id = ?
  `).get(req.user.id);
  
  if (!profile) {
    // 如果档案不存在，创建一个空档案
    const insertProfile = db.prepare(
      'INSERT INTO user_profiles (user_id) VALUES (?)'
    );
    const result = insertProfile.run(req.user.id);
    
    const newProfile = db.prepare(`
      SELECT 
        id,
        username,
        full_name,
        birth_date,
        birth_time,
        birth_location,
        gender,
        avatar_url,
        created_at,
        updated_at
      FROM user_profiles 
      WHERE id = ?
    `).get(result.lastInsertRowid);
    
    return res.json({
      data: {
        profile: {
          ...newProfile,
          user_id: req.user.id
        }
      }
    });
  }
  
  res.json({
    data: {
      profile: {
        ...profile,
        user_id: req.user.id
      }
    }
  });
}));

// 更新用户档案
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const {
    username,
    full_name,
    birth_date,
    birth_time,
    birth_location,
    gender
  } = req.body;
  
  // 验证性别字段
  if (gender && !['male', 'female'].includes(gender)) {
    throw new AppError('性别字段只能是 male 或 female', 400, 'INVALID_GENDER');
  }
  
  // 验证出生日期格式
  if (birth_date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birth_date)) {
      throw new AppError('出生日期格式应为 YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT');
    }
    
    // 验证日期是否有效
    const date = new Date(birth_date);
    if (isNaN(date.getTime())) {
      throw new AppError('无效的出生日期', 400, 'INVALID_DATE');
    }
  }
  
  // 验证出生时间格式
  if (birth_time) {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birth_time)) {
      throw new AppError('出生时间格式应为 HH:MM', 400, 'INVALID_TIME_FORMAT');
    }
  }
  
  const db = getDB();
  
  // 检查档案是否存在
  const existingProfile = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.user.id);
  
  if (!existingProfile) {
    // 创建新档案
    const insertProfile = db.prepare(`
      INSERT INTO user_profiles (
        user_id, username, full_name, birth_date, birth_time, birth_location, gender
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertProfile.run(
      req.user.id,
      username || null,
      full_name || null,
      birth_date || null,
      birth_time || null,
      birth_location || null,
      gender || null
    );
    
    const newProfile = db.prepare(`
      SELECT 
        id,
        username,
        full_name,
        birth_date,
        birth_time,
        birth_location,
        gender,
        avatar_url,
        created_at,
        updated_at
      FROM user_profiles 
      WHERE id = ?
    `).get(result.lastInsertRowid);
    
    return res.json({
      data: {
        profile: {
          ...newProfile,
          user_id: req.user.id
        }
      }
    });
  }
  
  // 更新现有档案
  const updateProfile = db.prepare(`
    UPDATE user_profiles SET
      username = COALESCE(?, username),
      full_name = COALESCE(?, full_name),
      birth_date = COALESCE(?, birth_date),
      birth_time = COALESCE(?, birth_time),
      birth_location = COALESCE(?, birth_location),
      gender = COALESCE(?, gender)
    WHERE user_id = ?
  `);
  
  updateProfile.run(
    username,
    full_name,
    birth_date,
    birth_time,
    birth_location,
    gender,
    req.user.id
  );
  
  // 获取更新后的档案
  const updatedProfile = db.prepare(`
    SELECT 
      id,
      username,
      full_name,
      birth_date,
      birth_time,
      birth_location,
      gender,
      avatar_url,
      created_at,
      updated_at
    FROM user_profiles 
    WHERE user_id = ?
  `).get(req.user.id);
  
  res.json({
    data: {
      profile: {
        ...updatedProfile,
        user_id: req.user.id
      }
    }
  });
}));

// 上传头像
router.post('/avatar', authenticate, asyncHandler(async (req, res) => {
  const { avatar_url } = req.body;
  
  if (!avatar_url) {
    throw new AppError('头像URL不能为空', 400, 'MISSING_AVATAR_URL');
  }
  
  // 简单的URL格式验证
  try {
    new URL(avatar_url);
  } catch (error) {
    throw new AppError('无效的头像URL格式', 400, 'INVALID_AVATAR_URL');
  }
  
  const db = getDB();
  
  // 检查档案是否存在
  const existingProfile = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.user.id);
  
  if (!existingProfile) {
    // 创建新档案
    const insertProfile = db.prepare(
      'INSERT INTO user_profiles (user_id, avatar_url) VALUES (?, ?)'
    );
    insertProfile.run(req.user.id, avatar_url);
  } else {
    // 更新头像
    const updateAvatar = db.prepare(
      'UPDATE user_profiles SET avatar_url = ? WHERE user_id = ?'
    );
    updateAvatar.run(avatar_url, req.user.id);
  }
  
  res.json({
    data: {
      message: '头像更新成功',
      avatar_url: avatar_url
    }
  });
}));

// 删除用户档案
router.delete('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDB();
  
  const deleteProfile = db.prepare('DELETE FROM user_profiles WHERE user_id = ?');
  const result = deleteProfile.run(req.user.id);
  
  if (result.changes === 0) {
    throw new AppError('用户档案不存在', 404, 'PROFILE_NOT_FOUND');
  }
  
  res.json({
    data: {
      message: '用户档案删除成功'
    }
  });
}));

module.exports = router;