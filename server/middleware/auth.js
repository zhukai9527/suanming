import { authService } from '../services/authService.js';

/**
 * JWT认证中间件
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '缺少访问令牌'
      }
    });
  }
  
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: '无效的访问令牌'
      }
    });
  }
};

/**
 * 可选认证中间件（用于可选登录的接口）
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = authService.verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // 忽略token验证错误，继续执行
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  
  // 数据库错误
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败'
      }
    });
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的访问令牌'
      }
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: '访问令牌已过期'
      }
    });
  }
  
  // 默认错误
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || '内部服务器错误'
    }
  });
};

/**
 * 请求日志中间件
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${new Date().toISOString()} - ${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
};

/**
 * 输入验证中间件
 */
export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: error.details[0].message
        }
      });
    }
    
    next();
  };
};

/**
 * 速率限制中间件（简单实现）
 */
const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100, // 最大请求数
    message = '请求过于频繁，请稍后再试'
  } = options;
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      // 重置计数
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message
        }
      });
    }
    
    record.count++;
    next();
  };
};

/**
 * CORS中间件配置
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // 开发环境允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};