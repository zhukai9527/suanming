# Koyeb 部署指南

本指南将帮助您将三算命项目部署到 Koyeb 平台。

## 🚀 部署步骤

### 1. 准备工作

确保您的代码已推送到 GitHub 仓库的 `master` 分支。

### 2. 注册 Koyeb 账号

1. 访问 [Koyeb官网](https://www.koyeb.com/)
2. 注册免费账号
3. 验证邮箱

### 3. 创建新应用

1. 登录 Koyeb 控制台
2. 点击 "Create App"
3. 选择 "GitHub" 作为部署源
4. 授权 Koyeb 访问您的 GitHub 仓库
5. 选择您的项目仓库
6. 选择 `master` 分支

### 4. 配置部署设置

#### 基本设置
- **App Name**: `suanming-app`（或您喜欢的名称）
- **Service Name**: `suanming-backend`
- **Instance Type**: `Nano` (免费套餐)
- **Port**: `8000`

#### 构建设置
- **Build Command**: `npm ci`
- **Run Command**: `npm start`

#### 环境变量
在 Koyeb 控制台中添加以下环境变量：

```
NODE_ENV=production
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here
```

**重要**: 请将 `JWT_SECRET` 替换为一个安全的随机字符串！

#### 持久化存储
1. 在 "Volumes" 部分添加存储卷
2. **Name**: `sqlite-data`
3. **Mount Path**: `/app/data`
4. **Size**: `1GB`

### 5. 部署应用

1. 检查所有配置
2. 点击 "Deploy"
3. 等待部署完成（通常需要 3-5 分钟）

### 6. 获取应用URL

部署完成后，Koyeb 会提供一个类似这样的URL：
```
https://your-app-name-your-org.koyeb.app
```

### 7. 更新前端配置

1. 复制您的 Koyeb 应用 URL
2. 更新 `src/lib/localApi.ts` 中的 API URL：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://your-actual-app-url.koyeb.app/api' : 'http://localhost:3001/api');
```

3. 提交并推送更改

### 8. 验证部署

访问以下端点验证部署是否成功：

- **健康检查**: `https://your-app-url.koyeb.app/api/health`
- **API根路径**: `https://your-app-url.koyeb.app/api`

## 🔧 故障排除

### 常见问题

#### 1. 应用启动失败
- 检查环境变量是否正确设置
- 查看 Koyeb 日志中的错误信息
- 确保 `package.json` 中的 `start` 脚本正确

#### 2. 数据库连接问题
- 确保持久化存储卷已正确配置
- 检查 `/app/data` 目录权限
- 查看数据库初始化日志

#### 3. CORS 错误
- 在服务器配置中添加您的前端域名到 CORS 白名单
- 更新 `server/index.cjs` 中的 CORS 配置

### 查看日志

在 Koyeb 控制台中：
1. 进入您的应用
2. 点击 "Logs" 标签
3. 查看实时日志输出

## 📊 监控和维护

### 健康检查

Koyeb 会自动监控您的应用健康状态：
- **端点**: `/api/health`
- **检查间隔**: 10秒
- **超时时间**: 5秒

### 数据备份

定期备份您的 SQLite 数据库：
1. 在 Koyeb 控制台中访问您的应用
2. 使用 "Terminal" 功能连接到容器
3. 复制 `/app/data/numerology.db` 文件

### 扩展和升级

如需更多资源：
1. 在 Koyeb 控制台中选择更大的实例类型
2. 增加存储卷大小
3. 配置自动扩展规则

## 💰 费用说明

**免费套餐包含**：
- 512MB RAM
- 100GB 带宽/月
- 1个应用
- 基础支持

**注意**: 超出免费额度后会产生费用，请监控使用情况。

## 🔗 有用链接

- [Koyeb 文档](https://www.koyeb.com/docs)
- [Koyeb 定价](https://www.koyeb.com/pricing)
- [Koyeb 支持](https://www.koyeb.com/support)

## 🆘 获取帮助

如果遇到问题：
1. 查看 Koyeb 官方文档
2. 检查应用日志
3. 联系 Koyeb 支持团队
4. 在项目 GitHub 仓库中创建 Issue

---

**部署成功后，您的三算命应用就可以在全球范围内访问了！** 🎉