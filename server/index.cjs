const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { dbManager } = require('./database/index.cjs');

// 导入路由
const authRoutes = require('./routes/auth.cjs');
const analysisRoutes = require('./routes/analysis.cjs');
const historyRoutes = require('./routes/history.cjs');
const profileRoutes = require('./routes/profile.cjs');

// 导入中间件
const { errorHandler } = require('./middleware/errorHandler.cjs');
const { requestLogger } = require('./middleware/logger.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化数据库
try {
  dbManager.init();
  console.log('数据库连接成功');
} catch (error) {
  console.error('数据库连接失败:', error);
  process.exit(1);
}

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // 允许Koyeb域名、localhost和环境变量指定的域名
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:4173',
          process.env.CORS_ORIGIN
        ].filter(Boolean);
        
        // 允许所有.koyeb.app域名
        if (!origin || origin.endsWith('.koyeb.app') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true, // 开发环境允许所有域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API健康检查端点（用于Koyeb监控）
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);

// 静态文件服务 (用于生产环境)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // SPA路由处理 - 只处理非API请求
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(); // 让后续的404处理器处理API请求
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在'
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`📊 数据库文件: ${path.resolve('./numerology.db')}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 健康检查: http://0.0.0.0:${PORT}/api/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，开始优雅关闭...');
  server.close(() => {
    console.log('HTTP服务器已关闭');
    dbManager.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，开始优雅关闭...');
  server.close(() => {
    console.log('HTTP服务器已关闭');
    dbManager.close();
    process.exit(0);
  });
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  dbManager.close();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
});

module.exports = app;