import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbOperations } from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const authService = {
  /**
   * 用户注册
   */
  async signUp(userData) {
    const { email, password, fullName, birthDate, birthTime, birthPlace, gender } = userData;
    
    try {
      // 检查用户是否已存在
      const existingUser = dbOperations.getUserByEmail.get(email);
      if (existingUser) {
        throw new Error('用户已存在');
      }
      
      // 密码加密
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // 创建用户
      const result = dbOperations.createUser.run(
        email,
        hashedPassword,
        fullName || null,
        birthDate || null,
        birthTime || null,
        birthPlace || null,
        gender || null
      );
      
      // 获取创建的用户信息
      const user = dbOperations.getUserById.get(result.lastInsertRowid);
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          birthDate: user.birth_date,
          birthTime: user.birth_time,
          birthPlace: user.birth_place,
          gender: user.gender,
          createdAt: user.created_at
        },
        token
      };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('邮箱已被注册');
      }
      throw error;
    }
  },
  
  /**
   * 用户登录
   */
  async signIn(email, password) {
    try {
      // 查找用户
      const user = dbOperations.getUserByEmail.get(email);
      if (!user) {
        throw new Error('邮箱或密码错误');
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('邮箱或密码错误');
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          birthDate: user.birth_date,
          birthTime: user.birth_time,
          birthPlace: user.birth_place,
          gender: user.gender,
          createdAt: user.created_at
        },
        token
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * 验证JWT token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('无效的token');
    }
  },
  
  /**
   * 获取用户信息
   */
  async getUserById(userId) {
    try {
      const user = dbOperations.getUserById.get(userId);
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        birthDate: user.birth_date,
        birthTime: user.birth_time,
        birthPlace: user.birth_place,
        gender: user.gender,
        createdAt: user.created_at
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * 更新用户信息
   */
  async updateUser(userId, userData) {
    const { fullName, birthDate, birthTime, birthPlace, gender } = userData;
    
    try {
      // 检查用户是否存在
      const existingUser = dbOperations.getUserById.get(userId);
      if (!existingUser) {
        throw new Error('用户不存在');
      }
      
      // 更新用户信息
      dbOperations.updateUser.run(
        fullName || existingUser.full_name,
        birthDate || existingUser.birth_date,
        birthTime || existingUser.birth_time,
        birthPlace || existingUser.birth_place,
        gender || existingUser.gender,
        userId
      );
      
      // 返回更新后的用户信息
      return await this.getUserById(userId);
    } catch (error) {
      throw error;
    }
  }
};