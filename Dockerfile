# 使用官方Node.js运行时作为基础镜像
FROM node:20-alpine

# 更换Alpine镜像源为清华大学
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

# Install python and build tools for native modules
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# --- Puppeteer 相关的配置和安装 ---
# 阻止 puppeteer 自动下载 Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
# 安装 Chromium 浏览器
RUN apk add --no-cache chromium
# 设置 puppeteer 查找浏览器的路径
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# --- Puppeteer 相关的配置和安装 ---

# 复制package.json和package-lock.json
COPY package.json package-lock.json ./

# 设置npm镜像源
RUN npm config set registry https://registry.npmmirror.com

# 强制清理npm缓存
RUN npm cache clean --force

# 安装所有依赖（包括开发依赖用于构建前端）
RUN npm ci

# 复制应用代码
COPY . .

# 构建前端
RUN npm run build:prod

# 清理开发依赖，只保留生产依赖
RUN npm ci --omit=dev

# 创建数据目录用于SQLite数据库
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8000

# 暴露端口
EXPOSE 8000

# 启动应用（数据库初始化在应用启动时自动进行）
CMD ["node", "server/index.cjs"]