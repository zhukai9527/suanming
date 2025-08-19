# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 安装pnpm
RUN npm install -g pnpm@9.0.0

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prod

# 复制应用代码
COPY . .

# 创建数据目录用于SQLite数据库
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8000

# 暴露端口
EXPOSE 8000

# 初始化数据库并启动应用
CMD ["sh", "-c", "pnpm run db:init && pnpm start"]