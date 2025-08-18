import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入路由
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';

// 导入中间件
import { errorHandler, requestLogger, corsOptions } from './middleware/auth.js';

// 导入数据库（确保数据库初始化）
import './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors(corsOptions));

// 请求解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use(requestLogger);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// 静态文件服务（用于前端构建文件）
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(frontendPath));
  
  // SPA路由处理
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在'
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 优雅关闭处理
const gracefulShutdown = (signal) => {
  console.log(`\n收到 ${signal} 信号，开始优雅关闭...`);
  
  server.close((err) => {
    if (err) {
      console.error('服务器关闭时发生错误:', err);
      process.exit(1);
    }
    
    console.log('服务器已关闭');
    process.exit(0);
  });
  
  // 强制关闭超时
  setTimeout(() => {
    console.error('强制关闭服务器');
    process.exit(1);
  }, 10000);
};

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`\n🚀 三算命本地服务器启动成功！`);
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`\n📚 API文档:`);
  console.log(`   认证相关: http://localhost:${PORT}/api/auth`);
  console.log(`   分析相关: http://localhost:${PORT}/api/analysis`);
  console.log(`   健康检查: http://localhost:${PORT}/health`);
  console.log(`\n💡 提示: 按 Ctrl+C 停止服务器\n`);
});

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

export default app;