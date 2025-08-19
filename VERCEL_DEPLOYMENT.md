# Vercel 部署指南

本指南将帮助您将三算命项目部署到 Vercel 平台。

## 🚀 快速部署

### 1. 准备工作

确保您的项目已推送到 GitHub：
```bash
git add .
git commit -m "准备Vercel部署"
git push origin master
```

### 2. 连接 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您的 `suanming` 仓库
5. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=https://your-app-name.vercel.app
```

**生成 JWT Secret：**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. 数据库配置

由于 Vercel 不支持 SQLite 文件存储，您需要迁移到云数据库：

#### 选项 1: Vercel Postgres（推荐）
1. 在 Vercel 项目中添加 Postgres 数据库
2. 复制连接字符串到环境变量 `DATABASE_URL`
3. 修改数据库连接代码

#### 选项 2: PlanetScale
1. 注册 [PlanetScale](https://planetscale.com)
2. 创建数据库
3. 获取连接字符串
4. 添加到环境变量 `DATABASE_URL`

### 5. 部署

配置完成后，Vercel 会自动部署您的应用。

## 📁 项目结构说明

```
├── vercel.json          # Vercel 配置文件
├── .env.production      # 生产环境变量模板
├── src/                 # 前端代码
└── server/              # 后端 API
```

## 🔧 配置文件说明

### vercel.json
- 配置构建和路由规则
- 将 `/api/*` 路由到后端服务
- 其他路由指向前端应用

### 环境变量
- `NODE_ENV`: 设置为 production
- `JWT_SECRET`: JWT 令牌密钥
- `CORS_ORIGIN`: 允许的跨域来源
- `DATABASE_URL`: 数据库连接字符串（如使用云数据库）

## 🗄️ 数据库迁移

如果您选择使用云数据库，需要执行以下步骤：

### 1. 修改数据库连接

编辑 `server/database/index.cjs`：

```javascript
// 替换 SQLite 连接为 PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 2. 更新 SQL 语法

将 SQLite 语法转换为 PostgreSQL 语法：
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `TEXT` → `VARCHAR` 或 `TEXT`
- 日期时间处理差异

### 3. 运行迁移

在 Vercel 部署后，通过 API 端点初始化数据库：
```
POST https://your-app.vercel.app/api/init-database
```

## 🚨 常见问题

### 1. 构建失败
- 检查 `package.json` 中的 `vercel-build` 脚本
- 确保所有依赖都在 `dependencies` 中

### 2. API 路由不工作
- 检查 `vercel.json` 路由配置
- 确保后端文件路径正确

### 3. 数据库连接错误
- 验证环境变量设置
- 检查数据库连接字符串格式

### 4. CORS 错误
- 设置正确的 `CORS_ORIGIN` 环境变量
- 检查后端 CORS 配置

## 📊 性能优化

1. **启用缓存**：配置适当的缓存头
2. **压缩资源**：Vercel 自动启用 gzip
3. **CDN 加速**：静态资源自动通过 CDN 分发
4. **函数优化**：保持 API 函数轻量级

## 🔄 持续部署

Vercel 会自动监听 GitHub 仓库变化：
- 推送到 `master` 分支触发生产部署
- 推送到其他分支创建预览部署

## 📞 获取帮助

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 参考 [Vercel 文档](https://vercel.com/docs)

---

部署完成后，您的应用将在 `https://your-app-name.vercel.app` 可用！