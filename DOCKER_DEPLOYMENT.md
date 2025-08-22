# Docker 部署指南

本指南将帮助您使用 Docker 部署神机阁项目。

## 🐳 Docker 部署优势

- **环境一致性**: 确保开发、测试、生产环境完全一致
- **快速部署**: 一键启动整个应用栈
- **资源隔离**: 容器化运行，避免环境冲突
- **易于扩展**: 支持水平扩展和负载均衡
- **版本管理**: 支持镜像版本控制和回滚

## 📋 前置要求

确保您的系统已安装：
- [Docker](https://docs.docker.com/get-docker/) (版本 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (版本 2.0+)

## 🚀 快速开始

### 方法一：使用 Docker Compose（推荐）

1. **克隆项目**
```bash
git clone https://github.com/your-username/suanming.git
cd suanming
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（重要：修改 JWT_SECRET）
nano .env
```

3. **启动应用**
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

4. **访问应用**
- 应用地址: http://localhost:8000
- API 健康检查: http://localhost:8000/api/health

### 方法二：使用 Docker 命令

1. **构建镜像**
```bash
docker build -t suanming-app .
```

2. **运行容器**
```bash
docker run -d \
  --name suanming-app \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -v suanming-data:/app/data \
  suanming-app
```

## 🔧 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `NODE_ENV` | 运行环境 | `production` | 是 |
| `PORT` | 应用端口 | `8000` | 是 |
| `JWT_SECRET` | JWT 密钥 | - | **是** |

### 数据持久化

应用使用 SQLite 数据库，数据存储在 `/app/data` 目录：
- **Docker Compose**: 自动创建 `suanming-data` 卷
- **Docker 命令**: 需要手动挂载卷 `-v suanming-data:/app/data`

### 健康检查

容器内置健康检查：
- **检查端点**: `/api/health`
- **检查间隔**: 30秒
- **超时时间**: 10秒
- **重试次数**: 3次

## 📊 管理命令

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec suanming-app sh

# 重新构建镜像
docker-compose build --no-cache

# 更新并重启
docker-compose pull && docker-compose up -d
```

### Docker 命令

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs -f suanming-app

# 进入容器
docker exec -it suanming-app sh

# 停止容器
docker stop suanming-app

# 删除容器
docker rm suanming-app

# 查看镜像
docker images
```

## 🔍 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看详细日志
docker-compose logs suanming-app

# 检查容器状态
docker-compose ps
```

#### 2. 端口被占用
```bash
# 检查端口占用
netstat -tulpn | grep 8000

# 修改端口映射
# 在 docker-compose.yml 中修改 ports: "8001:8000"
```

#### 3. 数据库初始化失败
```bash
# 进入容器检查
docker-compose exec suanming-app sh

# 手动初始化数据库
node server/scripts/initDatabase.cjs
```

#### 4. 构建失败
```bash
# 清理构建缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 日志分析

```bash
# 查看实时日志
docker-compose logs -f --tail=100

# 查看特定时间段日志
docker-compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T12:00:00"

# 导出日志到文件
docker-compose logs > app.log 2>&1
```

## 🚀 生产环境部署

### 1. 安全配置

```bash
# 生成强密码
openssl rand -base64 32

# 设置环境变量
export JWT_SECRET="your-generated-secret"
```

### 2. 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. HTTPS 配置

```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

### 4. 监控和备份

```bash
# 数据库备份
docker-compose exec suanming-app cp /app/data/numerology.db /app/data/backup-$(date +%Y%m%d).db

# 定期备份脚本
#!/bin/bash
BACKUP_DIR="/backup/suanming"
mkdir -p $BACKUP_DIR
docker-compose exec suanming-app cp /app/data/numerology.db $BACKUP_DIR/numerology-$(date +%Y%m%d-%H%M%S).db
```

## 📈 性能优化

### 1. 资源限制

```yaml
# docker-compose.yml
services:
  suanming-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. 多阶段构建优化

```dockerfile
# 优化后的 Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
RUN mkdir -p /app/data
EXPOSE 8000
CMD ["node", "server/index.cjs"]
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t suanming-app .
    
    - name: Run tests
      run: docker run --rm suanming-app npm test
    
    - name: Deploy to production
      run: |
        docker save suanming-app | gzip > suanming-app.tar.gz
        # 部署到生产服务器
```

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Node.js Docker 最佳实践](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [项目 GitHub 仓库](https://github.com/your-username/suanming)

## 🆘 获取帮助

如果遇到问题：
1. 查看本文档的故障排除部分
2. 检查 Docker 和应用日志
3. 在项目 GitHub 仓库创建 Issue
4. 联系开发团队

---

**部署成功后，您的神机阁应用就可以通过 Docker 容器稳定运行了！** 🎉