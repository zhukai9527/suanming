# 开发指南

本文档为开发者提供详细的项目架构说明、开发流程和最佳实践。

## 目录

- [项目架构](#项目架构)
- [技术栈详解](#技术栈详解)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [组件开发](#组件开发)
- [状态管理](#状态管理)
- [API 集成](#api-集成)
- [测试策略](#测试策略)
- [性能优化](#性能优化)
- [调试技巧](#调试技巧)
- [贡献流程](#贡献流程)

## 项目架构

### 整体架构

```
三算命平台
├── 前端应用 (React + TypeScript)
│   ├── 用户界面层
│   ├── 业务逻辑层
│   ├── 数据访问层
│   └── 工具函数层
├── 后端服务 (Supabase)
│   ├── 数据库 (PostgreSQL)
│   ├── 认证服务
│   ├── Edge Functions
│   └── 实时订阅
└── 部署平台 (Vercel/Netlify)
    ├── CDN 加速
    ├── 自动部署
    └── 环境管理
```

### 前端架构

```
src/
├── components/          # 组件层
│   ├── ui/             # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   ├── Layout.tsx      # 布局组件
│   ├── AnalysisResultDisplay.tsx  # 业务组件
│   └── ErrorBoundary.tsx          # 错误边界
├── pages/              # 页面层
│   ├── HomePage.tsx    # 首页
│   ├── AnalysisPage.tsx # 分析页面
│   ├── HistoryPage.tsx # 历史记录
│   └── ProfilePage.tsx # 用户资料
├── contexts/           # 状态管理层
│   └── AuthContext.tsx # 认证上下文
├── hooks/              # 自定义Hook层
│   └── use-mobile.tsx  # 移动端检测
├── lib/                # 工具函数层
│   ├── supabase.ts     # Supabase客户端
│   └── utils.ts        # 通用工具
├── types/              # 类型定义层
│   └── index.ts        # TypeScript类型
└── data/               # 静态数据层
```

### 数据流架构

```
用户交互 → 组件状态 → Context/Hook → API调用 → Supabase → 数据库
    ↓         ↓          ↓         ↓        ↓        ↓
 UI更新 ← 状态更新 ← 数据处理 ← 响应处理 ← Edge Function ← 查询结果
```

## 技术栈详解

### 前端核心技术

#### React 18.3.1
- **并发特性**: 使用 Suspense 和 lazy loading
- **Hooks**: 优先使用函数组件和 Hooks
- **错误边界**: 实现全局错误处理

```typescript
// 示例：使用 Suspense 进行代码分割
import { Suspense, lazy } from 'react'

const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AnalysisPage />
    </Suspense>
  )
}
```

#### TypeScript
- **严格模式**: 启用所有严格类型检查
- **类型定义**: 为所有 API 响应定义类型
- **泛型使用**: 提高代码复用性

```typescript
// 示例：API 响应类型定义
interface BaziAnalysisResult {
  bazi: {
    year: string
    month: string
    day: string
    hour: string
  }
  wuxing: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  analysis: {
    character: string
    career: string
    wealth: string
    health: string
    relationships: string
  }
}
```

#### Tailwind CSS
- **实用优先**: 使用原子化 CSS 类
- **响应式设计**: 移动端优先的设计方法
- **自定义主题**: 中国风配色和字体

```typescript
// tailwind.config.js 自定义配置
module.exports = {
  theme: {
    extend: {
      colors: {
        'chinese-red': '#DC143C',
        'chinese-gold': '#FFD700',
        'chinese-black': '#2C2C2C'
      },
      fontFamily: {
        'chinese': ['Noto Sans SC', 'sans-serif']
      }
    }
  }
}
```

### 后端服务架构

#### Supabase
- **数据库**: PostgreSQL 关系型数据库
- **认证**: JWT 基础的用户认证
- **实时**: WebSocket 实时数据同步
- **Edge Functions**: Deno 运行时的服务端函数

```typescript
// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## 开发环境设置

### 1. 环境要求

```bash
# 检查 Node.js 版本
node --version  # >= 18.0.0

# 检查 pnpm 版本
pnpm --version  # >= 8.0.0

# 检查 Git 版本
git --version   # >= 2.0.0
```

### 2. 项目初始化

```bash
# 克隆项目
git clone https://github.com/patdelphi/suanming.git
cd suanming

# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

### 3. 开发服务器

```bash
# 启动开发服务器
pnpm dev

# 启动并打开浏览器
pnpm dev --open

# 指定端口
pnpm dev --port 3000
```

### 4. 开发工具配置

#### VS Code 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### VS Code 设置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 代码规范

### ESLint 配置

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
```

### 命名规范

```typescript
// 组件命名：PascalCase
const AnalysisResultDisplay: React.FC = () => {}

// Hook 命名：camelCase，以 use 开头
const useAuth = () => {}

// 常量命名：SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'

// 类型命名：PascalCase，接口以 I 开头（可选）
interface UserProfile {
  id: string
  name: string
}

// 枚举命名：PascalCase
enum AnalysisType {
  BAZI = 'bazi',
  ZIWEI = 'ziwei',
  YIJING = 'yijing'
}
```

### 文件组织规范

```typescript
// 导入顺序
// 1. React 相关
import React, { useState, useEffect } from 'react'

// 2. 第三方库
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// 3. 内部组件
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

// 4. 内部工具
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

// 5. 类型定义
import type { AnalysisResult } from '../../types'
```

## 组件开发

### 组件结构模板

```typescript
// components/ExampleComponent.tsx
import React from 'react'
import { cn } from '../../lib/utils'

// 组件属性接口
interface ExampleComponentProps {
  title: string
  description?: string
  variant?: 'default' | 'primary' | 'secondary'
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

// 组件实现
const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
  variant = 'default',
  className,
  children,
  onClick
}) => {
  return (
    <div 
      className={cn(
        'base-styles',
        {
          'variant-default': variant === 'default',
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary'
        },
        className
      )}
      onClick={onClick}
    >
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}

export default ExampleComponent
```

### UI 组件开发

使用 `class-variance-authority` 创建可变样式组件：

```typescript
// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## 状态管理

### Context 模式

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 自定义 Hooks

```typescript
// hooks/useAnalysis.ts
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface AnalysisParams {
  type: 'bazi' | 'ziwei' | 'yijing'
  data: any
}

export const useAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async ({ type, data }: AnalysisParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `${type}-analyzer`,
        { body: data }
      )
      
      if (error) throw error
      
      setResult(result)
      toast.success('分析完成')
    } catch (err) {
      const message = err instanceof Error ? err.message : '分析失败'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { analyze, loading, result, error }
}
```

## API 集成

### Supabase 客户端封装

```typescript
// lib/api.ts
import { supabase } from './supabase'
import type { AnalysisResult, UserProfile } from '../types'

export class ApiClient {
  // 用户相关
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  static async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 分析相关
  static async getAnalysisHistory(userId: string, type?: string) {
    let query = supabase
      .from('numerology_readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (type) {
      query = query.eq('reading_type', type)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async performAnalysis(type: string, data: any): Promise<AnalysisResult> {
    const { data: result, error } = await supabase.functions.invoke(
      `${type}-analyzer`,
      { body: data }
    )
    
    if (error) throw error
    return result
  }

  // 实时订阅
  static subscribeToAnalysisUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('analysis-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'numerology_readings',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}
```

### 错误处理

```typescript
// lib/error-handler.ts
import { toast } from 'sonner'

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error)
  
  if (error instanceof ApiError) {
    toast.error(error.message)
    return error
  }
  
  if (error instanceof Error) {
    toast.error(error.message)
    return new ApiError(error.message)
  }
  
  const fallbackError = new ApiError('未知错误')
  toast.error(fallbackError.message)
  return fallbackError
}

// 使用示例
try {
  await ApiClient.performAnalysis('bazi', data)
} catch (error) {
  handleApiError(error)
}
```

## 测试策略

### 单元测试

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '../lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('base', 'additional')).toBe('base additional')
      expect(cn('base', { 'conditional': true })).toBe('base conditional')
      expect(cn('base', { 'conditional': false })).toBe('base')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01')
      expect(formatDate(date)).toBe('2024年1月1日')
    })
  })
})
```

### 组件测试

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../components/ui/Button'

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

### E2E 测试

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="sign-in-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="sign-in-button"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
```

## 性能优化

### 代码分割

```typescript
// 路由级别的代码分割
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Suspense>
  )
}
```

### 组件优化

```typescript
// 使用 React.memo 优化组件渲染
import React, { memo, useMemo, useCallback } from 'react'

interface ExpensiveComponentProps {
  data: any[]
  onItemClick: (id: string) => void
}

const ExpensiveComponent = memo<ExpensiveComponentProps>(({ data, onItemClick }) => {
  // 使用 useMemo 缓存计算结果
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }))
  }, [data])

  // 使用 useCallback 缓存事件处理函数
  const handleClick = useCallback((id: string) => {
    onItemClick(id)
  }, [onItemClick])

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.processed}
        </div>
      ))}
    </div>
  )
})

function expensiveCalculation(item: any) {
  // 模拟昂贵的计算
  return item.value * Math.random()
}
```

### 图片优化

```typescript
// 图片懒加载组件
import React, { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className, 
  placeholder = '/placeholder.jpg' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease'
      }}
    />
  )
}
```

## 调试技巧

### React DevTools

```typescript
// 在开发环境中启用 React DevTools
if (import.meta.env.DEV) {
  // 为组件添加显示名称
  Component.displayName = 'ComponentName'
  
  // 添加调试信息
  console.log('Component rendered with props:', props)
}
```

### 错误边界

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 发送错误报告到监控服务
    if (import.meta.env.PROD) {
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>出现了一些问题</h2>
          <p>请刷新页面重试</p>
          {import.meta.env.DEV && (
            <details>
              <summary>错误详情</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
```

### 性能监控

```typescript
// lib/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  if (import.meta.env.DEV) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// 使用示例
measurePerformance('Data Processing', () => {
  // 执行数据处理逻辑
  processLargeDataSet(data)
})
```

## 贡献流程

### 1. 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发和测试
npm run dev
npm run test
npm run lint

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 推送分支
git push origin feature/new-feature

# 5. 创建 Pull Request
```

### 2. 提交信息规范

```
type(scope): description

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. Code Review 检查清单

- [ ] 代码符合项目规范
- [ ] 包含适当的测试
- [ ] 文档已更新
- [ ] 性能影响已评估
- [ ] 安全性已考虑
- [ ] 向后兼容性已确认
- [ ] UI/UX 符合设计规范

---

更多开发相关问题，请参考 [FAQ](FAQ.md) 或在 GitHub Issues 中讨论。