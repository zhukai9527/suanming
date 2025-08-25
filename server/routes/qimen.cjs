// 奇门遁甲API路由
// 提供奇门遁甲相关的RESTful接口

const express = require('express');
const QimenAnalyzer = require('../services/qimenAnalyzer.cjs');
const inputValidator = require('../utils/inputValidator.cjs');
const logger = require('../middleware/logger.cjs');

const router = express.Router();
const qimenAnalyzer = new QimenAnalyzer();

/**
 * @route POST /api/qimen/calculate
 * @desc 奇门遁甲起局计算
 * @access Public
 */
router.post('/calculate', async (req, res) => {
  try {
    const { timeInfo, options = {} } = req.body;
    
    // 输入验证
    if (!timeInfo || !timeInfo.datetime) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要的时间信息',
          details: 'datetime字段是必需的'
        }
      });
    }
    
    // 验证时间格式
    const datetime = new Date(timeInfo.datetime);
    if (isNaN(datetime.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIME',
          message: '时间格式不正确',
          details: '请使用ISO 8601格式的时间字符串'
        }
      });
    }
    
    // 计算奇门盘
    const qimenPan = qimenAnalyzer.calculator.calculateQimenPan(datetime);
    
    // 构建响应数据
    const response = {
      success: true,
      data: {
        timeInfo: {
          datetime: timeInfo.datetime,
          timezone: timeInfo.timezone || 'Asia/Shanghai',
          ganzhi: {
            year: `${qimenPan.timeInfo.year.gan}${qimenPan.timeInfo.year.zhi}`,
            month: `${qimenPan.timeInfo.month.gan}${qimenPan.timeInfo.month.zhi}`,
            day: `${qimenPan.timeInfo.day.gan}${qimenPan.timeInfo.day.zhi}`,
            hour: `${qimenPan.timeInfo.hour.gan}${qimenPan.timeInfo.hour.zhi}`
          },
          jieqi: qimenPan.timeInfo.jieqi,
          yuan: qimenPan.timeInfo.yuan,
          jushu: qimenPan.timeInfo.jushu,
          yindun: qimenPan.timeInfo.yindun ? '阴遁' : '阳遁'
        },
        qimenPan: {
          dipan: qimenPan.dipan.map((item, index) => ({
            palace: index + 1,
            palaceName: qimenAnalyzer.getPalaceName(index),
            direction: qimenAnalyzer.getDirection(index),
            ganzhi: item.ganzhi,
            star: item.star,
            door: item.door,
            god: item.god
          })),
          tianpan: qimenPan.tianpan.map((item, index) => ({
            palace: index + 1,
            palaceName: qimenAnalyzer.getPalaceName(index),
            direction: qimenAnalyzer.getDirection(index),
            ganzhi: item.ganzhi,
            star: item.star,
            door: item.door,
            god: item.god
          })),
          zhifu: qimenPan.zhifu,
          zhishi: qimenPan.zhishi
        },
        method: options.method || '时家奇门'
      }
    };
    
    logger.info('奇门起局成功', {
      datetime: timeInfo.datetime,
      jushu: qimenPan.timeInfo.jushu,
      yindun: qimenPan.timeInfo.yindun
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('奇门起局失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: '奇门盘计算失败',
        details: error.message
      }
    });
  }
});

/**
 * @route POST /api/qimen/analyze
 * @desc 奇门遁甲格局分析
 * @access Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { qimenPan, analysisOptions = {} } = req.body;
    
    // 输入验证
    if (!qimenPan || !qimenPan.dipan || !qimenPan.tianpan) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少奇门盘数据',
          details: '需要提供完整的奇门盘信息'
        }
      });
    }
    
    // 格局分析
    const patterns = qimenAnalyzer.patternAnalyzer.analyzePatterns(qimenPan);
    
    // 构建响应数据
    const response = {
      success: true,
      data: {
        patterns: patterns.map(pattern => ({
          name: pattern.name,
          type: pattern.type,
          level: pattern.level,
          score: pattern.score,
          palace: pattern.palace,
          description: pattern.description
        })),
        summary: {
          totalPatterns: patterns.length,
          favorablePatterns: patterns.filter(p => ['吉', '大吉'].includes(p.level)).length,
          unfavorablePatterns: patterns.filter(p => ['凶', '大凶'].includes(p.level)).length,
          neutralPatterns: patterns.filter(p => ['中', '平'].includes(p.level)).length
        },
        analysisOptions: {
          includePatterns: analysisOptions.includePatterns !== false,
          includeYongshen: analysisOptions.includeYongshen !== false,
          detailLevel: analysisOptions.detailLevel || 'standard'
        }
      }
    };
    
    logger.info('奇门格局分析成功', {
      patternsCount: patterns.length,
      detailLevel: analysisOptions.detailLevel
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('奇门格局分析失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: '格局分析失败',
        details: error.message
      }
    });
  }
});

/**
 * @route POST /api/qimen/predict
 * @desc 奇门遁甲预测生成
 * @access Public
 */
router.post('/predict', async (req, res) => {
  try {
    const { qimenPan, question, querent, options = {} } = req.body;
    
    // 输入验证
    if (!qimenPan || !question) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数',
          details: '需要提供奇门盘数据和问题描述'
        }
      });
    }
    
    // 验证问题描述
    if (!question.description || question.description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUESTION',
          message: '问题描述不能为空',
          details: '请提供具体的问题描述'
        }
      });
    }
    
    if (question.description.length > 200) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'QUESTION_TOO_LONG',
          message: '问题描述过长',
          details: '问题描述不能超过200个字符'
        }
      });
    }
    
    // 选择用神
    const yongshen = qimenAnalyzer.yongShenAnalyzer.selectYongShen(
      question.description,
      querent,
      qimenPan
    );
    
    // 分析用神
    const yongShenAnalysis = qimenAnalyzer.yongShenAnalyzer.analyzeYongShen(
      yongshen,
      qimenPan
    );
    
    // 格局分析
    const patterns = qimenAnalyzer.patternAnalyzer.analyzePatterns(qimenPan);
    
    // 生成预测结果
    const prediction = qimenAnalyzer.predictionGenerator.generatePrediction(
      qimenPan,
      yongShenAnalysis,
      question.description,
      patterns
    );
    
    // 构建响应数据
    const response = {
      success: true,
      data: {
        question: {
          type: question.type || '其他',
          description: question.description,
          timeframe: question.timeframe || '近期'
        },
        yongshen: {
          primary: yongshen,
          analysis: yongShenAnalysis
        },
        prediction: {
          overall: prediction.overall,
          probability: prediction.probability,
          details: prediction.details,
          suggestions: prediction.suggestions,
          timing: prediction.timing
        },
        patterns: patterns.slice(0, 5), // 只返回前5个重要格局
        querent: querent ? {
          birthDate: querent.birthDate,
          gender: querent.gender
        } : null
      }
    };
    
    logger.info('奇门预测生成成功', {
      questionType: question.type,
      probability: prediction.probability,
      patternsCount: patterns.length
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('奇门预测生成失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PREDICTION_ERROR',
        message: '预测生成失败',
        details: error.message
      }
    });
  }
});

/**
 * @route GET /api/qimen/solar-terms
 * @desc 获取节气信息
 * @access Public
 */
router.get('/solar-terms', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // 验证年份
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_YEAR',
          message: '年份参数无效',
          details: '年份必须在1900-2100之间'
        }
      });
    }
    
    // 计算节气
    const solarTerms = qimenAnalyzer.solarTerms.calculateYearSolarTerms(yearNum);
    
    const response = {
      success: true,
      data: solarTerms.map(term => ({
        name: term.name,
        date: term.date.toISOString(),
        yindun: qimenAnalyzer.solarTerms.isYindunSeason(term.name),
        season: qimenAnalyzer.solarTerms.getSeasonByTerm(term.name),
        info: qimenAnalyzer.solarTerms.getSolarTermInfo(term.name)
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    logger.error('节气查询失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SOLAR_TERMS_ERROR',
        message: '节气查询失败',
        details: error.message
      }
    });
  }
});

/**
 * @route GET /api/qimen/yongshen
 * @desc 获取用神配置
 * @access Public
 */
router.get('/yongshen', async (req, res) => {
  try {
    const { type, gender } = req.query;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TYPE',
          message: '缺少问题类型参数',
          details: '请提供type参数'
        }
      });
    }
    
    // 模拟用神配置（实际应该从分析器获取）
    const yongShenConfig = {
      '婚姻': {
        primary: {
          self: gender === '男' ? '庚' : '乙',
          spouse: gender === '男' ? '乙' : '庚',
          matchmaker: '六合'
        },
        secondary: {
          marriage_palace: '兑宫',
          relationship_door: '休门'
        }
      },
      '求财': {
        primary: {
          wealth: '生门',
          capital: '戊',
          opportunity: '开门'
        },
        secondary: {
          wealth_palace: '艮宫',
          profit_star: '天任'
        }
      },
      '疾病': {
        primary: {
          illness: '天芮',
          doctor: '天心',
          medicine: '乙'
        },
        secondary: {
          health_palace: '坤宫',
          recovery_door: '生门'
        }
      }
    };
    
    const config = yongShenConfig[type] || {
      primary: {
        matter: '时干',
        result: '值使'
      },
      secondary: {}
    };
    
    res.json({
      success: true,
      data: config
    });
    
  } catch (error) {
    logger.error('用神查询失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'YONGSHEN_ERROR',
        message: '用神查询失败',
        details: error.message
      }
    });
  }
});

/**
 * @route POST /api/qimen/batch-calculate
 * @desc 批量奇门起局计算
 * @access Public
 */
router.post('/batch-calculate', async (req, res) => {
  try {
    const { timeList, options = {} } = req.body;
    
    // 输入验证
    if (!Array.isArray(timeList) || timeList.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '时间列表不能为空',
          details: 'timeList必须是非空数组'
        }
      });
    }
    
    if (timeList.length > 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: '批量请求数量过多',
          details: '单次批量请求不能超过10个时间点'
        }
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < timeList.length; i++) {
      try {
        const datetime = new Date(timeList[i]);
        if (isNaN(datetime.getTime())) {
          errors.push({
            index: i,
            datetime: timeList[i],
            error: '时间格式不正确'
          });
          continue;
        }
        
        const qimenPan = qimenAnalyzer.calculator.calculateQimenPan(datetime);
        
        results.push({
          index: i,
          datetime: timeList[i],
          qimenPan: {
            timeInfo: qimenPan.timeInfo,
            jushu: qimenPan.timeInfo.jushu,
            yindun: qimenPan.timeInfo.yindun ? '阴遁' : '阳遁',
            zhifu: qimenPan.zhifu,
            zhishi: qimenPan.zhishi
          }
        });
        
      } catch (error) {
        errors.push({
          index: i,
          datetime: timeList[i],
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: timeList.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    logger.error('批量计算失败', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_CALCULATION_ERROR',
        message: '批量计算失败',
        details: error.message
      }
    });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  logger.error('奇门API错误', error);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
    }
  });
});

module.exports = router;