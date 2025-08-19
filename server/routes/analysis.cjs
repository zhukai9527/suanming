const express = require('express');
const { getDB } = require('../database/index.cjs');
const { authenticate } = require('../middleware/auth.cjs');
const { AppError, asyncHandler } = require('../middleware/errorHandler.cjs');

// 导入分析服务
const BaziAnalyzer = require('../services/baziAnalyzer.cjs');
const YijingAnalyzer = require('../services/yijingAnalyzer.cjs');
const ZiweiAnalyzer = require('../services/ziweiAnalyzer.cjs');

const router = express.Router();

// 初始化分析器
const baziAnalyzer = new BaziAnalyzer();
const yijingAnalyzer = new YijingAnalyzer();
const ziweiAnalyzer = new ZiweiAnalyzer();

// 八字分析接口
router.post('/bazi', authenticate, asyncHandler(async (req, res) => {
  const { birth_data } = req.body;
  
  // 输入验证
  if (!birth_data || !birth_data.name || !birth_data.birth_date) {
    throw new AppError('缺少必要参数：姓名和出生日期', 400, 'MISSING_BIRTH_DATA');
  }
  
  // 验证出生日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birth_data.birth_date)) {
    throw new AppError('出生日期格式应为 YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT');
  }
  
  // 验证出生时间格式（如果提供）
  if (birth_data.birth_time) {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birth_data.birth_time)) {
      throw new AppError('出生时间格式应为 HH:MM', 400, 'INVALID_TIME_FORMAT');
    }
  }
  
  try {
    // 执行八字分析（纯分析，不存储历史记录）
    const analysisResult = await baziAnalyzer.performFullBaziAnalysis(birth_data);
    
    // 只返回分析结果，不存储历史记录
    res.json({
      data: {
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error('八字分析错误:', error);
    throw new AppError('八字分析过程中发生错误', 500, 'BAZI_ANALYSIS_ERROR');
  }
}));

// 易经分析接口
router.post('/yijing', authenticate, asyncHandler(async (req, res) => {
  const { question, user_id, divination_method } = req.body;
  
  // 输入验证
  if (!question) {
    throw new AppError('缺少必要参数：占卜问题', 400, 'MISSING_QUESTION');
  }
  
  try {
    // 执行易经分析（纯分析，不存储历史记录）
    const analysisResult = yijingAnalyzer.performYijingAnalysis({
      question: question,
      user_id: user_id || req.user.id,
      divination_method: divination_method || 'time'
    });
    
    // 只返回分析结果，不存储历史记录
    res.json({
      data: {
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error('易经分析详细错误:', error);
    console.error('错误堆栈:', error.stack);
    throw new AppError(`易经分析过程中发生错误: ${error.message}`, 500, 'YIJING_ANALYSIS_ERROR');
  }
}));

// 紫微斗数分析接口
router.post('/ziwei', authenticate, asyncHandler(async (req, res) => {
  const { birth_data } = req.body;
  
  // 输入验证
  if (!birth_data || !birth_data.name || !birth_data.birth_date) {
    throw new AppError('缺少必要参数：姓名和出生日期', 400, 'MISSING_BIRTH_DATA');
  }
  
  // 验证出生日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birth_data.birth_date)) {
    throw new AppError('出生日期格式应为 YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT');
  }
  
  // 验证出生时间格式（如果提供）
  if (birth_data.birth_time) {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birth_data.birth_time)) {
      throw new AppError('出生时间格式应为 HH:MM', 400, 'INVALID_TIME_FORMAT');
    }
  }
  
  try {
    // 执行紫微斗数分析（纯分析，不存储历史记录）
    const analysisResult = ziweiAnalyzer.performRealZiweiAnalysis(birth_data);
    
    // 只返回分析结果，不存储历史记录
    res.json({
      data: {
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error('紫微斗数分析错误:', error);
    throw new AppError('紫微斗数分析过程中发生错误', 500, 'ZIWEI_ANALYSIS_ERROR');
  }
}));

// 历史记录存储接口
router.post('/save-history', authenticate, asyncHandler(async (req, res) => {
  const { analysis_type, analysis_data, input_data } = req.body;
  
  // 输入验证
  if (!analysis_type || !analysis_data) {
    throw new AppError('缺少必要参数：分析类型和分析数据', 400, 'MISSING_REQUIRED_DATA');
  }
  
  // 验证分析类型
  const validTypes = ['bazi', 'ziwei', 'yijing'];
  if (!validTypes.includes(analysis_type)) {
    throw new AppError('无效的分析类型', 400, 'INVALID_ANALYSIS_TYPE');
  }
  
  try {
    const db = getDB();
    
    // 根据分析类型准备不同的数据
    let name, birth_date, birth_time, birth_place, gender;
    
    if (analysis_type === 'yijing') {
      // 易经占卜：获取用户档案信息
      const getUserProfile = db.prepare('SELECT full_name FROM user_profiles WHERE user_id = ?');
      const userProfile = getUserProfile.get(req.user.id);
      name = userProfile?.full_name || '易经占卜用户';
      birth_date = null;
      birth_time = null;
      birth_place = null;
      gender = null;
    } else {
      // 八字和紫微：从输入数据中获取
      name = input_data?.name || '用户';
      birth_date = input_data?.birth_date || null;
      birth_time = input_data?.birth_time || null;
      birth_place = input_data?.birth_place || null;
      gender = input_data?.gender || null;
    }
    
    // 插入历史记录
    const insertReading = db.prepare(`
      INSERT INTO numerology_readings (
        user_id, reading_type, name, birth_date, birth_time, birth_place, gender,
        input_data, analysis, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertReading.run(
      req.user.id,
      analysis_type,
      name,
      birth_date,
      birth_time,
      birth_place,
      gender,
      JSON.stringify(input_data || {}),
      JSON.stringify(analysis_data),
      'completed',
      new Date().toISOString()
    );
    
    res.json({
      data: {
        record_id: result.lastInsertRowid,
        message: '历史记录保存成功'
      }
    });
  } catch (error) {
    console.error('保存历史记录错误:', error);
    throw new AppError('保存历史记录失败', 500, 'SAVE_HISTORY_ERROR');
  }
}));

// 综合分析接口（可选）
router.post('/comprehensive', authenticate, asyncHandler(async (req, res) => {
  const { birth_data, include_types } = req.body;
  
  // 输入验证
  if (!birth_data || !birth_data.name || !birth_data.birth_date) {
    throw new AppError('缺少必要参数：姓名和出生日期', 400, 'MISSING_BIRTH_DATA');
  }
  
  const analysisTypes = include_types || ['bazi', 'ziwei', 'yijing'];
  const results = {};
  
  try {
    // 根据请求的类型执行相应分析
    if (analysisTypes.includes('bazi')) {
      results.bazi = await baziAnalyzer.performFullBaziAnalysis(birth_data);
    }
    
    if (analysisTypes.includes('ziwei')) {
      results.ziwei = ziweiAnalyzer.performRealZiweiAnalysis(birth_data);
    }
    
    if (analysisTypes.includes('yijing')) {
      results.yijing = yijingAnalyzer.performYijingAnalysis({
        question: '人生运势综合占卜',
        user_id: req.user.id,
        birth_data: birth_data
      });
    }
    
    // 保存综合分析结果
    const db = getDB();
    const insertReading = db.prepare(`
      INSERT INTO numerology_readings (
        user_id, reading_type, name, birth_date, birth_time, birth_place, gender,
        input_data, analysis, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const comprehensiveResult = {
      analysis_type: 'comprehensive',
      analysis_date: new Date().toISOString().split('T')[0],
      included_types: analysisTypes,
      results: results
    };
    
    const result = insertReading.run(
      req.user.id,
      'comprehensive',
      birth_data.name,
      birth_data.birth_date,
      birth_data.birth_time || null,
      birth_data.birth_place || null,
      birth_data.gender || null,
      JSON.stringify({ birth_data, include_types: analysisTypes }),
      JSON.stringify(comprehensiveResult),
      'completed'
    );
    
    res.json({
      data: {
        record_id: result.lastInsertRowid,
        analysis: comprehensiveResult
      }
    });
  } catch (error) {
    console.error('综合分析错误:', error);
    throw new AppError('综合分析过程中发生错误', 500, 'COMPREHENSIVE_ANALYSIS_ERROR');
  }
}));

// 获取分析类型列表
router.get('/types', (req, res) => {
  res.json({
    data: {
      available_types: [
        {
          type: 'bazi',
          name: '八字命理',
          description: '基于出生年月日时的传统命理分析',
          required_fields: ['name', 'birth_date'],
          optional_fields: ['birth_time', 'gender', 'birth_place']
        },
        {
          type: 'ziwei',
          name: '紫微斗数',
          description: '紫微斗数排盘和命理分析',
          required_fields: ['name', 'birth_date'],
          optional_fields: ['birth_time', 'gender', 'birth_place']
        },
        {
          type: 'yijing',
          name: '易经占卜',
          description: '基于易经的占卜和指导',
          required_fields: ['name'],
          optional_fields: ['question', 'birth_date', 'birth_time', 'gender']
        },
        {
          type: 'comprehensive',
          name: '综合分析',
          description: '包含多种分析方法的综合报告',
          required_fields: ['name', 'birth_date'],
          optional_fields: ['birth_time', 'gender', 'birth_place', 'include_types']
        }
      ]
    }
  });
});

// 八字详细分析接口
router.post('/bazi-details', authenticate, asyncHandler(async (req, res) => {
  const { birthDate, birthTime } = req.body;
  
  // 输入验证
  if (!birthDate) {
    throw new AppError('缺少必要参数：出生日期', 400, 'MISSING_BIRTH_DATE');
  }
  
  try {
    // 构造birth_data对象
    const birthData = {
      name: '详细分析',
      birth_date: birthDate,
      birth_time: birthTime || '12:00',
      gender: 'male'
    };
    
    // 执行八字分析
    const analysisResult = await baziAnalyzer.performFullBaziAnalysis(birthData);
    
    res.json({
      data: {
        data: analysisResult
      }
    });
  } catch (error) {
    console.error('八字详细分析错误:', error);
    throw new AppError('八字详细分析过程中发生错误', 500, 'BAZI_DETAILS_ERROR');
  }
}));

// 八字五行分析接口
router.post('/bazi-wuxing', authenticate, asyncHandler(async (req, res) => {
  const { birthDate, birthTime } = req.body;
  
  // 输入验证
  if (!birthDate) {
    throw new AppError('缺少必要参数：出生日期', 400, 'MISSING_BIRTH_DATE');
  }
  
  try {
    // 构造birth_data对象
    const birthData = {
      name: '五行分析',
      birth_date: birthDate,
      birth_time: birthTime || '12:00',
      gender: 'male'
    };
    
    // 执行八字分析，提取五行部分
    const analysisResult = await baziAnalyzer.performFullBaziAnalysis(birthData);
    
    // 只返回五行相关的分析结果
    const wuxingResult = {
      wuxing_analysis: analysisResult.wuxing_analysis,
      basic_info: analysisResult.basic_info
    };
    
    res.json({
      data: {
        data: wuxingResult
      }
    });
  } catch (error) {
    console.error('八字五行分析错误:', error);
    throw new AppError('八字五行分析过程中发生错误', 500, 'BAZI_WUXING_ERROR');
  }
}));

// 验证分析数据格式
router.post('/validate', (req, res) => {
  const { birth_data, analysis_type } = req.body;
  const errors = [];
  
  if (!birth_data) {
    errors.push('缺少birth_data参数');
  } else {
    // 验证姓名
    if (!birth_data.name || birth_data.name.trim().length === 0) {
      errors.push('姓名不能为空');
    }
    
    // 验证出生日期（除易经外都需要）
    if (analysis_type !== 'yijing') {
      if (!birth_data.birth_date) {
        errors.push('出生日期不能为空');
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(birth_data.birth_date)) {
          errors.push('出生日期格式应为 YYYY-MM-DD');
        } else {
          const date = new Date(birth_data.birth_date);
          if (isNaN(date.getTime())) {
            errors.push('无效的出生日期');
          }
        }
      }
    }
    
    // 验证出生时间格式（如果提供）
    if (birth_data.birth_time) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(birth_data.birth_time)) {
        errors.push('出生时间格式应为 HH:MM');
      }
    }
    
    // 验证性别（如果提供）
    if (birth_data.gender && !['male', 'female', '男', '女'].includes(birth_data.gender)) {
      errors.push('性别字段只能是 male、female、男 或 女');
    }
  }
  
  res.json({
    data: {
      valid: errors.length === 0,
      errors: errors
    }
  });
});

module.exports = router;