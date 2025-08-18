import express from 'express';
import { authService } from '../services/authService.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// 应用速率限制
router.use(rateLimit({ max: 20, windowMs: 15 * 60 * 1000 })); // 15分钟内最多20次请求

/**
 * 用户注册
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, fullName, birthDate, birthTime, birthPlace, gender } = req.body;
    
    // 基本验证
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '邮箱和密码不能为空'
        }
      });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_EMAIL',
          message: '邮箱格式不正确'
        }
      });
    }
    
    // 密码强度验证
    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'WEAK_PASSWORD',
          message: '密码长度至少6位'
        }
      });
    }
    
    const result = await authService.signUp({
      email,
      password,
      fullName,
      birthDate,
      birthTime,
      birthPlace,
      gender
    });
    
    res.status(201).json({
      data: result,
      message: '注册成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 用户登录
 * POST /api/auth/signin
 */
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '邮箱和密码不能为空'
        }
      });
    }
    
    const result = await authService.signIn(email, password);
    
    res.json({
      data: result,
      message: '登录成功'
    });
  } catch (error) {
    if (error.message.includes('邮箱或密码错误')) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: error.message
        }
      });
    }
    next(error);
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/user
 */
router.get('/user', authenticateToken, async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    
    res.json({
      data: { user },
      message: '获取用户信息成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 更新用户信息
 * PUT /api/auth/user
 */
router.put('/user', authenticateToken, async (req, res, next) => {
  try {
    const { fullName, birthDate, birthTime, birthPlace, gender } = req.body;
    
    const updatedUser = await authService.updateUser(req.user.userId, {
      fullName,
      birthDate,
      birthTime,
      birthPlace,
      gender
    });
    
    res.json({
      data: { user: updatedUser },
      message: '用户信息更新成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 验证token
 * POST /api/auth/verify
 */
router.post('/verify', async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token不能为空'
        }
      });
    }
    
    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);
    
    res.json({
      data: { user, valid: true },
      message: 'Token验证成功'
    });
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token无效或已过期'
      }
    });
  }
});

/**
 * 用户登出（客户端处理，服务端记录日志）
 * POST /api/auth/signout
 */
router.post('/signout', authenticateToken, async (req, res) => {
  try {
    // 这里可以添加登出日志记录
    console.log(`用户 ${req.user.userId} 于 ${new Date().toISOString()} 登出`);
    
    res.json({
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SIGNOUT_ERROR',
        message: '登出失败'
      }
    });
  }
});

/**
 * 刷新token（可选功能）
 * POST /api/auth/refresh
 */
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    
    // 生成新的token
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const newToken = jwt.default.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      data: {
        user,
        token: newToken
      },
      message: 'Token刷新成功'
    });
  } catch (error) {
    next(error);
  }
});

export default router;