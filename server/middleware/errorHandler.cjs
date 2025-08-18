// 错误处理中间件

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // SQLite错误处理
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const message = '数据已存在，请检查输入';
    error = new AppError(message, 400, 'DUPLICATE_ENTRY');
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    const message = '关联数据不存在';
    error = new AppError(message, 400, 'FOREIGN_KEY_CONSTRAINT');
  }

  // JWT错误处理
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的访问令牌';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = '访问令牌已过期';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // 验证错误处理
  if (err.name === 'ValidationError') {
    const message = '输入数据验证失败';
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // 默认错误响应
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_ERROR';
  const message = error.isOperational ? error.message : '服务器内部错误';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

// 异步错误捕获包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404错误处理
const notFound = (req, res, next) => {
  const error = new AppError(`请求的资源 ${req.originalUrl} 不存在`, 404, 'NOT_FOUND');
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound
};