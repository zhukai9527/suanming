// 本地API客户端，替换Supabase

const API_BASE_URL = 'http://localhost:3001/api';

// 存储token的key
const TOKEN_KEY = 'numerology_token';

// API响应类型
interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// 用户类型
export interface User {
  id: number;
  email: string;
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: 'male' | 'female';
  createdAt: string;
}

// 认证响应类型
interface AuthResponse {
  user: User;
  token: string;
}

// 分析记录类型
export interface Reading {
  id: number;
  type: 'bazi' | 'ziwei' | 'yijing' | 'wuxing';
  name?: string;
  birthDate?: string;
  birthTime?: string;
  gender?: 'male' | 'female';
  birthPlace?: string;
  status: string;
  createdAt: string;
  results?: any;
  analysis?: any;
}

class LocalApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  // 获取存储的token
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  // 设置token
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  // 清除token
  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
  
  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || { code: 'UNKNOWN_ERROR', message: '请求失败' } };
      }
      
      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: '网络连接失败，请检查本地服务器是否启动'
        }
      };
    }
  }
  
  // 认证相关方法
  auth = {
    // 用户注册
    signUp: async (userData: {
      email: string;
      password: string;
      fullName?: string;
      birthDate?: string;
      birthTime?: string;
      birthPlace?: string;
      gender?: 'male' | 'female';
    }): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.data?.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    },
    
    // 用户登录
    signInWithPassword: async (credentials: {
      email: string;
      password: string;
    }): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.request<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.data?.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    },
    
    // 用户登出
    signOut: async (): Promise<ApiResponse> => {
      const response = await this.request('/auth/signout', {
        method: 'POST',
      });
      
      this.clearToken();
      return response;
    },
    
    // 获取当前用户
    getUser: async (): Promise<ApiResponse<{ user: User }>> => {
      return await this.request<{ user: User }>('/auth/user');
    },
    
    // 验证token
    verifyToken: async (token?: string): Promise<ApiResponse<{ user: User; valid: boolean }>> => {
      return await this.request<{ user: User; valid: boolean }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: token || this.getToken() }),
      });
    },
    
    // 更新用户信息
    updateUser: async (userData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
      return await this.request<{ user: User }>('/auth/user', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },
    
    // 监听认证状态变化（模拟Supabase的onAuthStateChange）
    onAuthStateChange: (callback: (event: string, session: { user: User } | null) => void) => {
      // 简单实现：检查token是否存在
      const checkAuth = async () => {
        const token = this.getToken();
        if (token) {
          const response = await this.auth.verifyToken(token);
          if (response.data?.valid && response.data.user) {
            callback('SIGNED_IN', { user: response.data.user });
          } else {
            this.clearToken();
            callback('SIGNED_OUT', null);
          }
        } else {
          callback('SIGNED_OUT', null);
        }
      };
      
      // 立即检查一次
      checkAuth();
      
      // 返回取消订阅的函数
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // 本地实现不需要取消订阅
            }
          }
        }
      };
    }
  };
  
  // 分析功能相关方法
  functions = {
    // 调用分析函数
    invoke: async (functionName: string, options: { body: any }): Promise<ApiResponse> => {
      const endpointMap: { [key: string]: string } = {
        'bazi-analyzer': '/analysis/bazi',
        'ziwei-analyzer': '/analysis/ziwei',
        'yijing-analyzer': '/analysis/yijing',
        'bazi-wuxing-analysis': '/analysis/wuxing',
        'bazi-details': '/analysis/bazi',
        'reading-history': '/analysis/history'
      };
      
      const endpoint = endpointMap[functionName];
      if (!endpoint) {
        return {
          error: {
            code: 'FUNCTION_NOT_FOUND',
            message: `未知的分析函数: ${functionName}`
          }
        };
      }
      
      // 特殊处理历史记录请求
      if (functionName === 'reading-history') {
        if (options.body.action === 'delete') {
          return await this.request(`${endpoint}/${options.body.readingId}`, {
            method: 'DELETE'
          });
        } else {
          const queryParams = new URLSearchParams();
          if (options.body.type) queryParams.append('type', options.body.type);
          if (options.body.limit) queryParams.append('limit', options.body.limit.toString());
          if (options.body.offset) queryParams.append('offset', options.body.offset.toString());
          
          return await this.request(`${endpoint}?${queryParams.toString()}`);
        }
      }
      
      return await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(options.body),
      });
    }
  };
  
  // 数据库操作（模拟Supabase的数据库操作）
  from = (table: string) => {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            // 根据表名和操作类型调用相应的API
            if (table === 'user_profiles') {
              return await this.auth.getUser();
            }
            return { data: null, error: null };
          }
        }),
        order: (column: string, options?: { ascending: boolean }) => ({
          limit: (count: number) => ({
            async all() {
              if (table === 'numerology_readings') {
                const response = await this.functions.invoke('reading-history', {
                  body: { limit: count }
                });
                return { data: response.data?.readings || [], error: response.error };
              }
              return { data: [], error: null };
            }
          })
        })
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              if (table === 'user_profiles') {
                return await this.auth.updateUser(data);
              }
              return { data: null, error: null };
            }
          })
        })
      }),
      
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            // 插入操作通常通过分析API完成
            return { data: null, error: null };
          }
        })
      })
    };
  };
}

// 创建全局实例
export const localApi = new LocalApiClient();

// 导出兼容Supabase的接口
export const supabase = localApi;

// 默认导出
export default localApi;