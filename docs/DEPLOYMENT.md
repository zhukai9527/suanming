# 部署指南

本文档详细说明如何将三算命平台部署到各种环境中。

## 目录

- [环境要求](#环境要求)
- [Supabase 配置](#supabase-配置)
- [前端部署](#前端部署)
  - [Vercel 部署](#vercel-部署)
  - [Netlify 部署](#netlify-部署)
  - [GitHub Pages 部署](#github-pages-部署)
  - [自托管部署](#自托管部署)
- [Edge Functions 部署](#edge-functions-部署)
- [环境变量配置](#环境变量配置)
- [域名配置](#域名配置)
- [SSL 证书](#ssl-证书)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

## 环境要求

### 开发环境
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0
- Git >= 2.0.0

### 生产环境
- 支持静态文件托管的服务器或CDN
- Supabase 项目 (后端服务)
- 域名 (可选)
- SSL 证书 (推荐)

## Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 创建新项目
3. 等待项目初始化完成
4. 记录项目URL和API密钥

### 2. 数据库设置

在 Supabase SQL 编辑器中执行以下SQL创建必要的表：

```sql
-- 创建用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建命理分析记录表
CREATE TABLE IF NOT EXISTS numerology_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('bazi', 'ziwei', 'yijing', 'wuxing')),
  name TEXT,
  birth_date DATE,
  birth_time TIME,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_place TEXT,
  input_data JSONB,
  results JSONB,
  analysis JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_numerology_readings_user_id ON numerology_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_numerology_readings_type ON numerology_readings(reading_type);
CREATE INDEX IF NOT EXISTS idx_numerology_readings_created_at ON numerology_readings(created_at DESC);

-- 启用行级安全策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_readings ENABLE ROW LEVEL SECURITY;

-- 用户资料访问策略
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 命理分析记录访问策略
CREATE POLICY "Users can view own readings" ON numerology_readings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings" ON numerology_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings" ON numerology_readings
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3. 认证设置

1. 在 Supabase 控制台中，转到 "Authentication" > "Settings"
2. 配置站点URL为你的域名
3. 启用邮箱确认 (可选)
4. 配置第三方登录提供商 (可选)

## 前端部署

### Vercel 部署

Vercel 是推荐的部署平台，提供优秀的性能和开发体验。

#### 自动部署 (推荐)

1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com) 并登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置环境变量：
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. 点击 "Deploy"

#### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 构建项目
npm run build

# 部署
vercel --prod
```

### Netlify 部署

#### 自动部署

1. 将代码推送到 GitHub 仓库
2. 访问 [Netlify](https://netlify.com) 并登录
3. 点击 "New site from Git"
4. 选择你的 GitHub 仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 配置环境变量
7. 点击 "Deploy site"

#### 手动部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 构建项目
npm run build

# 部署
netlify deploy --prod --dir=dist
```

### GitHub Pages 部署

1. 在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. 在 GitHub 仓库设置中配置 Secrets
3. 启用 GitHub Pages

### 自托管部署

#### 使用 Nginx

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录上传到服务器

3. 配置 Nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;
    
    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### 使用 Apache

1. 在 `dist` 目录创建 `.htaccess` 文件：
```apache
RewriteEngine On
RewriteBase /

# 处理 SPA 路由
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 静态资源缓存
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

## Edge Functions 部署

### 1. 准备 Edge Functions

在 Supabase 项目中创建以下 Edge Functions：

- `bazi-analyzer` - 八字命理分析
- `ziwei-analyzer` - 紫微斗数分析
- `yijing-analyzer` - 易经占卜分析
- `bazi-wuxing-analysis` - 五行分析
- `bazi-details` - 八字详细分析

### 2. 部署 Edge Functions

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 部署所有函数
supabase functions deploy

# 或部署单个函数
supabase functions deploy bazi-analyzer
```

### 3. 设置环境变量

```bash
# 为 Edge Functions 设置环境变量
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 环境变量配置

### 开发环境 (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 生产环境
根据部署平台配置相应的环境变量：

- **Vercel**: 在项目设置中添加环境变量
- **Netlify**: 在站点设置中添加环境变量
- **GitHub Actions**: 在仓库 Secrets 中添加
- **自托管**: 在构建脚本中设置

## 域名配置

### 1. DNS 设置

根据部署平台配置 DNS 记录：

- **Vercel**: 添加 CNAME 记录指向 `cname.vercel-dns.com`
- **Netlify**: 添加 CNAME 记录指向 Netlify 提供的域名
- **自托管**: 添加 A 记录指向服务器 IP

### 2. 自定义域名

在部署平台的控制台中添加自定义域名，并等待 DNS 传播完成。

## SSL 证书

大多数现代部署平台都会自动提供 SSL 证书：

- **Vercel**: 自动提供 Let's Encrypt 证书
- **Netlify**: 自动提供 Let's Encrypt 证书
- **GitHub Pages**: 支持自定义域名的 HTTPS

对于自托管，可以使用 Certbot 获取免费的 Let's Encrypt 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

## 监控和日志

### 1. 应用监控

推荐使用以下监控服务：

- **Vercel Analytics**: Vercel 内置分析
- **Google Analytics**: 网站流量分析
- **Sentry**: 错误监控和性能监控

### 2. Supabase 监控

在 Supabase 控制台中可以查看：
- API 使用情况
- 数据库性能
- Edge Functions 日志
- 认证统计

### 3. 日志配置

在生产环境中启用适当的日志级别：

```typescript
// 生产环境日志配置
if (import.meta.env.PROD) {
  console.log = () => {} // 禁用 console.log
  console.warn = () => {} // 禁用 console.warn
  // 保留 console.error 用于错误报告
}
```

## 故障排除

### 常见问题

#### 1. 构建失败

**问题**: 构建过程中出现错误

**解决方案**:
- 检查 Node.js 版本是否符合要求
- 清除缓存：`rm -rf node_modules package-lock.json && npm install`
- 检查环境变量是否正确配置

#### 2. 路由不工作

**问题**: SPA 路由在生产环境中不工作

**解决方案**:
- 确保服务器配置了正确的回退规则
- 检查 `vite.config.ts` 中的 base 配置

#### 3. API 调用失败

**问题**: 无法连接到 Supabase

**解决方案**:
- 检查环境变量是否正确
- 验证 Supabase URL 和 API 密钥
- 检查网络连接和 CORS 设置

#### 4. 认证问题

**问题**: 用户无法登录或注册

**解决方案**:
- 检查 Supabase 认证设置
- 验证站点 URL 配置
- 检查邮箱确认设置

### 性能优化

#### 1. 代码分割

```typescript
// 使用动态导入进行代码分割
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
```

#### 2. 图片优化

- 使用 WebP 格式
- 实现懒加载
- 使用 CDN 加速

#### 3. 缓存策略

```nginx
# Nginx 缓存配置
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 6M;
    add_header Cache-Control "public";
}
```

## 安全检查清单

- [ ] 启用 HTTPS
- [ ] 配置安全头
- [ ] 启用 Supabase RLS
- [ ] 验证环境变量安全
- [ ] 定期更新依赖
- [ ] 配置 CSP 策略
- [ ] 启用错误监控
- [ ] 设置备份策略

## 维护和更新

### 1. 定期更新

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 安全审计
npm audit
npm audit fix
```

### 2. 数据库维护

- 定期备份数据库
- 监控数据库性能
- 清理过期数据
- 优化查询性能

### 3. 监控和告警

设置适当的监控和告警机制：
- 应用错误率
- 响应时间
- 数据库连接
- 磁盘空间使用

---

如需更多帮助，请查看我们的 [FAQ](FAQ.md) 或在 GitHub Issues 中提问。