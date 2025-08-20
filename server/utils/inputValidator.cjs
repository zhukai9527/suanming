// 输入验证工具类
// 提供统一的输入验证和错误处理机制

const { AppError } = require('../middleware/errorHandler.cjs');

class InputValidator {
  constructor() {
    // 预定义的验证规则
    this.validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      time: /^\d{2}:\d{2}$/,
      chineseName: /^[\u4e00-\u9fa5]{1,10}$/,
      englishName: /^[a-zA-Z\s]{1,50}$/,
      mixedName: /^[\u4e00-\u9fa5a-zA-Z\s]{1,50}$/,
      userId: /^[a-zA-Z0-9_-]{1,50}$/,
      question: /^[\u4e00-\u9fa5a-zA-Z0-9\s\?？！!，,。.；;：:]{1,200}$/
    };
    
    // 错误消息模板
    this.errorMessages = {
      required: '${field}不能为空',
      invalid_format: '${field}格式不正确',
      invalid_length: '${field}长度应在${min}-${max}个字符之间',
      invalid_range: '${field}应在${min}-${max}之间',
      invalid_date: '${field}不是有效的日期',
      invalid_time: '${field}不是有效的时间',
      invalid_gender: '性别只能是male或female',
      invalid_analysis_type: '分析类型只能是bazi、ziwei或yijing',
      invalid_divination_method: '起卦方法只能是time、plum_blossom、coin或number'
    };
  }

  /**
   * 验证必填字段
   * @param {any} value 值
   * @param {string} fieldName 字段名
   * @throws {AppError} 验证失败时抛出错误
   */
  validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw new AppError(
        this.formatErrorMessage('required', { field: fieldName }),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证字符串长度
   * @param {string} value 值
   * @param {string} fieldName 字段名
   * @param {number} min 最小长度
   * @param {number} max 最大长度
   * @throws {AppError} 验证失败时抛出错误
   */
  validateLength(value, fieldName, min = 0, max = Infinity) {
    if (typeof value !== 'string') {
      throw new AppError(
        `${fieldName}必须是字符串类型`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    if (value.length < min || value.length > max) {
      throw new AppError(
        this.formatErrorMessage('invalid_length', { field: fieldName, min, max }),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证数值范围
   * @param {number} value 值
   * @param {string} fieldName 字段名
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @throws {AppError} 验证失败时抛出错误
   */
  validateRange(value, fieldName, min, max) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new AppError(
        `${fieldName}必须是有效的数字`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    if (numValue < min || numValue > max) {
      throw new AppError(
        this.formatErrorMessage('invalid_range', { field: fieldName, min, max }),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证正则表达式
   * @param {string} value 值
   * @param {RegExp} pattern 正则表达式
   * @param {string} fieldName 字段名
   * @throws {AppError} 验证失败时抛出错误
   */
  validatePattern(value, pattern, fieldName) {
    if (!pattern.test(value)) {
      throw new AppError(
        this.formatErrorMessage('invalid_format', { field: fieldName }),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证邮箱格式
   * @param {string} email 邮箱
   * @throws {AppError} 验证失败时抛出错误
   */
  validateEmail(email) {
    this.validateRequired(email, '邮箱');
    this.validateLength(email, '邮箱', 5, 100);
    this.validatePattern(email, this.validationRules.email, '邮箱');
  }

  /**
   * 验证密码强度
   * @param {string} password 密码
   * @throws {AppError} 验证失败时抛出错误
   */
  validatePassword(password) {
    this.validateRequired(password, '密码');
    this.validateLength(password, '密码', 6, 50);
    
    // 检查密码复杂度
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      throw new AppError(
        '密码必须包含字母和数字',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证姓名
   * @param {string} name 姓名
   * @throws {AppError} 验证失败时抛出错误
   */
  validateName(name) {
    this.validateRequired(name, '姓名');
    this.validateLength(name, '姓名', 1, 50);
    
    // 允许中文、英文和空格
    if (!this.validationRules.mixedName.test(name)) {
      throw new AppError(
        '姓名只能包含中文、英文字母和空格',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证出生日期
   * @param {string} birthDate 出生日期 (YYYY-MM-DD)
   * @throws {AppError} 验证失败时抛出错误
   */
  validateBirthDate(birthDate) {
    this.validateRequired(birthDate, '出生日期');
    this.validatePattern(birthDate, this.validationRules.date, '出生日期');
    
    // 验证日期有效性
    const date = new Date(birthDate + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      throw new AppError(
        this.formatErrorMessage('invalid_date', { field: '出生日期' }),
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证日期范围（1800-2100）- 扩大范围支持更多历史日期
    const year = date.getFullYear();
    if (year < 1800 || year > 2100) {
      throw new AppError(
        '出生日期年份应在1800-2100年之间',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证不能是未来日期（允许今天）
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
    if (date > today) {
      throw new AppError(
        '出生日期不能是未来日期',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证月份和日期的合理性
    const [yearStr, monthStr, dayStr] = birthDate.split('-');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    if (month < 1 || month > 12) {
      throw new AppError(
        '月份应在1-12之间',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证每月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      throw new AppError(
        `${year}年${month}月只有${daysInMonth}天`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证特殊日期（如闰年）
    this.validateSpecialDates(birthDate);
  }

  /**
   * 验证出生时间
   * @param {string} birthTime 出生时间 (HH:MM)
   * @throws {AppError} 验证失败时抛出错误
   */
  validateBirthTime(birthTime) {
    if (!birthTime) return; // 出生时间是可选的
    
    this.validatePattern(birthTime, this.validationRules.time, '出生时间');
    
    const [hour, minute] = birthTime.split(':').map(Number);
    
    if (hour < 0 || hour > 23) {
      throw new AppError(
        '小时应在0-23之间',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    if (minute < 0 || minute > 59) {
      throw new AppError(
        '分钟应在0-59之间',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证性别
   * @param {string} gender 性别
   * @throws {AppError} 验证失败时抛出错误
   */
  validateGender(gender) {
    if (!gender) return; // 性别是可选的
    
    const validGenders = ['male', 'female', '男', '女'];
    if (!validGenders.includes(gender)) {
      throw new AppError(
        this.formatErrorMessage('invalid_gender'),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证占卜问题
   * @param {string} question 问题
   * @throws {AppError} 验证失败时抛出错误
   */
  validateQuestion(question) {
    this.validateRequired(question, '占卜问题');
    this.validateLength(question, '占卜问题', 2, 200);
    
    // 检查是否包含有效字符
    if (!this.validationRules.question.test(question)) {
      throw new AppError(
        '占卜问题包含无效字符',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证分析类型
   * @param {string} analysisType 分析类型
   * @throws {AppError} 验证失败时抛出错误
   */
  validateAnalysisType(analysisType) {
    const validTypes = ['bazi', 'ziwei', 'yijing'];
    if (!validTypes.includes(analysisType)) {
      throw new AppError(
        this.formatErrorMessage('invalid_analysis_type'),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证起卦方法
   * @param {string} method 起卦方法
   * @throws {AppError} 验证失败时抛出错误
   */
  validateDivinationMethod(method) {
    if (!method) return; // 起卦方法是可选的
    
    const validMethods = ['time', 'plum_blossom', 'coin', 'number'];
    if (!validMethods.includes(method)) {
      throw new AppError(
        this.formatErrorMessage('invalid_divination_method'),
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * 验证八字分析数据
   * @param {Object} birthData 出生数据
   * @throws {AppError} 验证失败时抛出错误
   */
  validateBaziData(birthData) {
    if (!birthData || typeof birthData !== 'object') {
      throw new AppError(
        '出生数据不能为空',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    this.validateName(birthData.name);
    this.validateBirthDate(birthData.birth_date);
    this.validateBirthTime(birthData.birth_time);
    this.validateGender(birthData.gender);
    
    // 验证出生地点（可选）
    if (birthData.birth_place) {
      this.validateLength(birthData.birth_place, '出生地点', 1, 100);
    }
  }

  /**
   * 验证易经分析数据
   * @param {Object} yijingData 易经数据
   * @throws {AppError} 验证失败时抛出错误
   */
  validateYijingData(yijingData) {
    if (!yijingData || typeof yijingData !== 'object') {
      throw new AppError(
        '易经数据不能为空',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    this.validateQuestion(yijingData.question);
    this.validateDivinationMethod(yijingData.divination_method);
    
    // 验证时区信息（可选）
    if (yijingData.user_timezone) {
      this.validateLength(yijingData.user_timezone, '用户时区', 3, 50);
    }
    
    // 验证当地时间（可选）
    if (yijingData.local_time) {
      const localTime = new Date(yijingData.local_time);
      if (isNaN(localTime.getTime())) {
        throw new AppError(
          '当地时间格式不正确',
          400,
          'VALIDATION_ERROR'
        );
      }
    }
  }

  /**
   * 验证分页参数
   * @param {Object} params 分页参数
   * @throws {AppError} 验证失败时抛出错误
   */
  validatePaginationParams(params) {
    if (params.page !== undefined) {
      this.validateRange(params.page, '页码', 1, 1000);
    }
    
    if (params.limit !== undefined) {
      this.validateRange(params.limit, '每页数量', 1, 100);
    }
  }

  /**
   * 安全地清理输入数据
   * @param {string} input 输入数据
   * @returns {string} 清理后的数据
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    // 移除潜在的危险字符
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // 移除script标签
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/javascript:/gi, '') // 移除javascript协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .trim();
  }

  /**
   * 批量清理对象中的字符串字段
   * @param {Object} obj 对象
   * @returns {Object} 清理后的对象
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * 格式化错误消息
   * @param {string} template 消息模板
   * @param {Object} params 参数
   * @returns {string} 格式化后的消息
   */
  formatErrorMessage(template, params = {}) {
    let message = this.errorMessages[template] || template;
    
    for (const [key, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
    
    return message;
  }

  /**
   * 验证特殊日期（如闰年2月29日）
   * @param {string} birthDate 出生日期
   * @throws {AppError} 验证失败时抛出错误
   */
  validateSpecialDates(birthDate) {
    const [yearStr, monthStr, dayStr] = birthDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    // 验证闰年2月29日
    if (month === 2 && day === 29) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (!isLeapYear) {
        throw new AppError(
          `${year}年不是闰年，2月没有29日`,
          400,
          'VALIDATION_ERROR'
        );
      }
    }
  }
  
  /**
   * 验证时区信息
   * @param {string} timezone 时区
   * @throws {AppError} 验证失败时抛出错误
   */
  validateTimezone(timezone) {
    if (!timezone) return;
    
    const validTimezones = [
      'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Tokyo',
      'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'UTC', 'GMT', 'CST', 'EST', 'PST'
    ];
    
    // 支持UTC偏移格式 (+08:00, -05:00等)
    const utcOffsetPattern = /^[+-]\d{2}:\d{2}$/;
    
    if (!validTimezones.includes(timezone) && !utcOffsetPattern.test(timezone)) {
      throw new AppError(
        '时区格式不正确，请使用标准时区名称或UTC偏移格式',
        400,
        'VALIDATION_ERROR'
      );
    }
  }
  
  /**
   * 验证IP地址
   * @param {string} ip IP地址
   * @throws {AppError} 验证失败时抛出错误
   */
  validateIP(ip) {
    if (!ip) return;
    
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Pattern.test(ip) && !ipv6Pattern.test(ip)) {
      throw new AppError(
        'IP地址格式不正确',
        400,
        'VALIDATION_ERROR'
      );
    }
  }
  
  /**
   * 验证用户代理字符串
   * @param {string} userAgent 用户代理
   * @throws {AppError} 验证失败时抛出错误
   */
  validateUserAgent(userAgent) {
    if (!userAgent) return;
    
    // 检查用户代理长度和基本格式
    if (userAgent.length > 500) {
      throw new AppError(
        '用户代理字符串过长',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 检查是否包含可疑内容
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        throw new AppError(
          '用户代理包含可疑内容',
          400,
          'VALIDATION_ERROR'
        );
      }
    }
  }
  
  /**
   * 验证文件上传
   * @param {Object} file 文件对象
   * @param {Array} allowedTypes 允许的文件类型
   * @param {number} maxSize 最大文件大小（字节）
   * @throws {AppError} 验证失败时抛出错误
   */
  validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
    if (!file) {
      throw new AppError(
        '文件不能为空',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证文件大小
    if (file.size > maxSize) {
      throw new AppError(
        `文件大小不能超过${Math.round(maxSize / 1024 / 1024)}MB`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证文件类型
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `文件类型不支持，只允许：${allowedTypes.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }
    
    // 验证文件名
    if (file.originalname) {
      const dangerousChars = /[<>:"/\\|?*]/;
      if (dangerousChars.test(file.originalname)) {
        throw new AppError(
          '文件名包含非法字符',
          400,
          'VALIDATION_ERROR'
        );
      }
    }
  }
  
  /**
   * 创建验证中间件
   * @param {Function} validationFn 验证函数
   * @returns {Function} Express中间件
   */
  createValidationMiddleware(validationFn) {
    return (req, res, next) => {
      try {
        // 验证请求头信息
        this.validateUserAgent(req.get('User-Agent'));
        this.validateIP(req.ip || req.connection.remoteAddress);
        
        // 清理输入数据
        req.body = this.sanitizeObject(req.body);
        req.query = this.sanitizeObject(req.query);
        req.params = this.sanitizeObject(req.params);
        
        // 执行验证
        validationFn.call(this, req.body, req.query, req.params);
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// 创建单例实例
const inputValidator = new InputValidator();

module.exports = {
  InputValidator,
  inputValidator
};