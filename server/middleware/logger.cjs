// 请求日志记录中间件

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // 记录请求开始
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ` +
      `${statusColor}${res.statusCode}\x1b[0m - ${duration}ms - ${req.ip}`
    );
    
    // 记录慢请求
    if (duration > 1000) {
      console.warn(`⚠️  慢请求警告: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  
  next();
};

// 获取状态码颜色
function getStatusColor(statusCode) {
  if (statusCode >= 500) return '\x1b[31m'; // 红色
  if (statusCode >= 400) return '\x1b[33m'; // 黄色
  if (statusCode >= 300) return '\x1b[36m'; // 青色
  if (statusCode >= 200) return '\x1b[32m'; // 绿色
  return '\x1b[0m'; // 默认
}

// API访问日志记录
const apiLogger = (req, res, next) => {
  // 记录API调用详情
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    userId: req.user?.id || null
  };
  
  // 在开发环境下记录请求体（排除敏感信息）
  if (process.env.NODE_ENV === 'development' && req.body) {
    const sanitizedBody = { ...req.body };
    // 移除敏感字段
    delete sanitizedBody.password;
    delete sanitizedBody.password_hash;
    delete sanitizedBody.token;
    
    if (Object.keys(sanitizedBody).length > 0) {
      logData.body = sanitizedBody;
    }
  }
  
  console.log('API调用:', JSON.stringify(logData, null, 2));
  next();
};

// 错误日志记录
const errorLogger = (error, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || null
    }
  };
  
  console.error('错误日志:', JSON.stringify(errorLog, null, 2));
  next(error);
};

module.exports = {
  requestLogger,
  apiLogger,
  errorLogger
};