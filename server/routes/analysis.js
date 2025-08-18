import express from 'express';
import { numerologyService } from '../services/numerologyService.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件
router.use(authenticateToken);

// 应用速率限制
router.use(rateLimit({ max: 50, windowMs: 15 * 60 * 1000 })); // 15分钟内最多50次请求

/**
 * 八字命理分析
 * POST /api/analysis/bazi
 */
router.post('/bazi', async (req, res, next) => {
  try {
    const { name, birthDate, birthTime, gender, birthPlace } = req.body;
    
    // 参数验证
    if (!birthDate) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '出生日期不能为空'
        }
      });
    }
    
    // 日期格式验证
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '日期格式应为YYYY-MM-DD'
        }
      });
    }
    
    // 时间格式验证（可选）
    if (birthTime) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(birthTime)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_TIME_FORMAT',
            message: '时间格式应为HH:MM'
          }
        });
      }
    }
    
    const result = await numerologyService.analyzeBazi(req.user.userId, {
      name,
      birthDate,
      birthTime,
      gender,
      birthPlace
    });
    
    res.json({
      data: result,
      message: '八字分析完成'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 紫微斗数分析
 * POST /api/analysis/ziwei
 */
router.post('/ziwei', async (req, res, next) => {
  try {
    const { name, birthDate, birthTime, gender, birthPlace } = req.body;
    
    // 参数验证
    if (!birthDate) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '出生日期不能为空'
        }
      });
    }
    
    // 日期格式验证
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '日期格式应为YYYY-MM-DD'
        }
      });
    }
    
    const result = await numerologyService.analyzeZiwei(req.user.userId, {
      name,
      birthDate,
      birthTime,
      gender,
      birthPlace
    });
    
    res.json({
      data: result,
      message: '紫微斗数分析完成'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 易经占卜分析
 * POST /api/analysis/yijing
 */
router.post('/yijing', async (req, res, next) => {
  try {
    const { question, method } = req.body;
    
    // 参数验证
    if (!question) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '占卜问题不能为空'
        }
      });
    }
    
    if (question.length > 200) {
      return res.status(400).json({
        error: {
          code: 'QUESTION_TOO_LONG',
          message: '问题长度不能超过200字符'
        }
      });
    }
    
    const result = await numerologyService.analyzeYijing(req.user.userId, {
      question,
      method: method || '梅花易数时间起卦法'
    });
    
    res.json({
      data: result,
      message: '易经占卜分析完成'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 五行分析
 * POST /api/analysis/wuxing
 */
router.post('/wuxing', async (req, res, next) => {
  try {
    const { name, birthDate, birthTime, gender } = req.body;
    
    // 参数验证
    if (!birthDate) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '出生日期不能为空'
        }
      });
    }
    
    // 日期格式验证
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '日期格式应为YYYY-MM-DD'
        }
      });
    }
    
    const result = await numerologyService.analyzeWuxing(req.user.userId, {
      name,
      birthDate,
      birthTime,
      gender
    });
    
    res.json({
      data: result,
      message: '五行分析完成'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取分析历史记录
 * GET /api/analysis/history
 */
router.get('/history', async (req, res, next) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;
    
    // 验证分析类型
    if (type && !['bazi', 'ziwei', 'yijing', 'wuxing'].includes(type)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TYPE',
          message: '无效的分析类型'
        }
      });
    }
    
    const history = await numerologyService.getReadingHistory(req.user.userId, type);
    
    // 简单的分页处理
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = history.slice(startIndex, endIndex);
    
    res.json({
      data: {
        readings: paginatedHistory,
        total: history.length,
        hasMore: endIndex < history.length
      },
      message: '获取分析历史成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取单个分析记录详情
 * GET /api/analysis/history/:id
 */
router.get('/history/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: '无效的记录ID'
        }
      });
    }
    
    const history = await numerologyService.getReadingHistory(req.user.userId);
    const reading = history.find(r => r.id === parseInt(id));
    
    if (!reading) {
      return res.status(404).json({
        error: {
          code: 'READING_NOT_FOUND',
          message: '分析记录不存在'
        }
      });
    }
    
    res.json({
      data: { reading },
      message: '获取分析记录成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 删除分析记录
 * DELETE /api/analysis/history/:id
 */
router.delete('/history/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: '无效的记录ID'
        }
      });
    }
    
    const success = await numerologyService.deleteReading(req.user.userId, parseInt(id));
    
    if (!success) {
      return res.status(404).json({
        error: {
          code: 'READING_NOT_FOUND',
          message: '分析记录不存在或无权删除'
        }
      });
    }
    
    res.json({
      message: '分析记录删除成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取用户分析统计信息
 * GET /api/analysis/stats
 */
router.get('/stats', async (req, res, next) => {
  try {
    const history = await numerologyService.getReadingHistory(req.user.userId);
    
    const stats = {
      total: history.length,
      byType: {
        bazi: history.filter(r => r.type === 'bazi').length,
        ziwei: history.filter(r => r.type === 'ziwei').length,
        yijing: history.filter(r => r.type === 'yijing').length,
        wuxing: history.filter(r => r.type === 'wuxing').length
      },
      recent: history.slice(0, 5).map(r => ({
        id: r.id,
        type: r.type,
        name: r.name,
        createdAt: r.createdAt
      }))
    };
    
    res.json({
      data: stats,
      message: '获取统计信息成功'
    });
  } catch (error) {
    next(error);
  }
});

export default router;