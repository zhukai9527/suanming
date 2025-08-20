# 神机阁 - AI命理分析平台

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/your-repo/shenjige-numerology)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-6.0.1-646CFF.svg)](https://vitejs.dev/)

一个纯AI生成的中华传统命理分析平台，提供八字命理、紫微斗数、易经占卜等专业分析服务。

## ✨ 核心功能

### 🔮 命理分析服务
- 🎯 **八字命理分析** - 四柱排盘、五行分析、格局判断、大运流年
- 🌟 **紫微斗数分析** - 星盘排布、十二宫位、四化飞星、详细解读
- 🔮 **易经占卜分析** - 梅花易数、卦象解读、人生指导

### 💡 智能特性
- 🧠 **AI增强分析** - 个性化理财建议、事业发展指导、现代职业建议
- 📊 **星曜强度解释** - 旺、得地、平、不得地、陷的详细说明
- 🎨 **命宫位置详解** - 五行属性、深层含义、性格影响分析

### 🛠️ 系统功能
- 👤 **完整用户系统** - 注册登录、个人资料、分析历史
- 📱 **响应式设计** - 完美支持桌面端、平板和移动端
- 🎨 **中国风UI** - 传统文化与现代设计的完美融合
- 🔒 **数据安全** - JWT认证、SQLite本地存储、隐私保护

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-repo/ai-numerology-refactored.git
cd ai-numerology-refactored

# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 启动开发服务器

```bash
# 启动后端服务器 (端口 3001)
npm run server

# 启动前端开发服务器 (端口 5173)
npm run dev
```

### 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3001/api

## 🏗️ 项目架构 (v3.0)

### 架构特点

- **分离关注点**: 分析计算与历史记录存储完全分离
- **API去重**: 防止重复调用的请求去重机制
- **性能优化**: useMemo缓存和useEffect依赖优化
- **错误隔离**: 历史记录保存失败不影响分析功能
- **智能增强**: AI驱动的个性化分析和现代化建议
- **用户体验**: 详细的星曜强度解释和命宫位置分析

### 技术栈

**前端技术**
- React 18.3.1 + TypeScript 5.6.2
- Vite 6.0.1 (构建工具)
- Tailwind CSS 3.4.16 (中国风主题)
- React Router 6 (路由管理)
- Radix UI (组件库)
- React Hook Form + Zod (表单验证)
- Recharts (数据可视化)
- Lucide React (图标库)

**后端技术**
- Node.js + Express 4.18.2
- Better-SQLite3 12.2.0 (数据库)
- JWT + bcryptjs (身份认证)
- Helmet (安全中间件)
- CORS (跨域处理)
- 分层架构设计

**开发工具**
- ESLint + TypeScript ESLint (代码检查)
- Concurrently (并发运行)
- Nodemon (开发热重载)
- PNPM 9.0.0 (包管理器)

### 目录结构

```
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── lib/               # 工具库
│   ├── contexts/          # React Context
│   └── types/             # TypeScript类型
├── server/                # 后端源码
│   ├── routes/            # API路由
│   ├── services/          # 业务服务
│   ├── middleware/        # 中间件
│   └── database/          # 数据库配置
├── docs/                  # 项目文档
└── public/                # 静态资源
```

## 🔄 v3.0 重构亮点

### 解决的核心问题

1. **重复历史记录**: 一次分析产生多条记录 → 确保每次只产生1条记录
2. **架构耦合**: 分析与存储混合 → 完全分离，职责清晰
3. **性能问题**: 重复渲染和API调用 → 优化减少60%+重复调用
4. **时间显示**: 时区问题 → 统一ISO时间戳和本地化显示
5. **分析深度**: 基础解释不够详细 → AI增强的个性化分析
6. **用户体验**: 术语难懂 → 详细的星曜强度和命宫位置解释

### 版本对比

| 方面 | v1.0 (初版) | v2.0 (重构) | v3.0 (当前) |
|------|-------------|-------------|-------------|
| 分析接口 | 分析+存储耦合 | 纯分析计算 | AI增强分析 |
| 历史记录 | 自动存储 | 专门接口存储 | 优化存储 |
| 重复记录 | 3-5条/次 | 1条/次 | 1条/次 |
| API调用 | 频繁重复 | 去重优化 | 智能缓存 |
| 错误处理 | 耦合失败 | 隔离容错 | 全面容错 |
| 分析深度 | 基础解释 | 标准分析 | AI个性化 |
| 用户体验 | 术语晦涩 | 改进显示 | 详细解释 |

## 📚 文档

- [API文档](docs/API.md) - 详细的API接口说明
- [本地部署指南](docs/LOCAL_DEPLOYMENT.md) - 本地化部署和运行说明
- [更新日志](CHANGELOG.md) - 版本更新记录

## 🧪 测试

```bash
# 运行前端测试
npm run test

# 运行后端测试
cd server && npm run test

# 运行端到端测试
npm run test:e2e
```

## 🚀 部署

### 生产环境部署

```bash
# 构建前端
npm run build

# 启动生产服务器
npm run start
```

详细部署说明请参考 [本地部署指南](docs/LOCAL_DEPLOYMENT.md)。

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢所有贡献者的辛勤工作
- 感谢开源社区提供的优秀工具和库
- 感谢中华传统文化的深厚底蕴

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-repo/shenjige-numerology)
- 问题反馈: [GitHub Issues](https://github.com/your-repo/shenjige-numerology/issues)
- 邮箱: contact@shenjige.com

---

**神机阁** - 传承千年智慧，拥抱现代科技 🌟
