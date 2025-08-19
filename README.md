# 神机阁 - AI命理分析平台

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/ai-numerology-refactored)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)

一个纯AI生成的中华传统命理分析平台，提供八字命理、紫微斗数、易经占卜等专业分析服务。

## ✨ 核心功能

- 🎯 **八字命理分析** - 四柱排盘、五行分析、格局判断
- 🌟 **紫微斗数分析** - 星盘排布、十二宫位、四化飞星
- 🔮 **易经占卜分析** - 梅花易数、卦象解读、人生指导
- 👤 **用户系统** - 注册登录、个人资料、历史记录
- 📱 **响应式设计** - 支持桌面端和移动端
- 🎨 **中国风UI** - 传统文化与现代设计的完美融合

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

## 🏗️ 项目架构 (v2.0)

### 架构特点

- **分离关注点**: 分析计算与历史记录存储完全分离
- **API去重**: 防止重复调用的请求去重机制
- **性能优化**: useMemo缓存和useEffect依赖优化
- **错误隔离**: 历史记录保存失败不影响分析功能

### 技术栈

**前端**
- React 18.3.1 + TypeScript
- Tailwind CSS (中国风主题)
- Vite (构建工具)
- React Router (路由管理)

**后端**
- Node.js + Express
- SQLite (数据库)
- JWT (身份认证)
- 分层架构设计

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

## 🔄 v2.0 重构亮点

### 解决的核心问题

1. **重复历史记录**: 一次分析产生多条记录 → 确保每次只产生1条记录
2. **架构耦合**: 分析与存储混合 → 完全分离，职责清晰
3. **性能问题**: 重复渲染和API调用 → 优化减少60%+重复调用
4. **时间显示**: 时区问题 → 统一ISO时间戳和本地化显示

### 架构对比

| 方面 | v1.0 (重构前) | v2.0 (重构后) |
|------|---------------|---------------|
| 分析接口 | 分析+存储耦合 | 纯分析计算 |
| 历史记录 | 自动存储 | 专门接口存储 |
| 重复记录 | 3-5条/次 | 1条/次 |
| API调用 | 频繁重复 | 去重优化 |
| 错误处理 | 耦合失败 | 隔离容错 |

## 📚 文档

- [API文档](docs/API.md) - 详细的API接口说明
- [开发指南](docs/DEVELOPMENT.md) - 开发环境设置和最佳实践
- [部署指南](docs/DEPLOYMENT.md) - 生产环境部署说明
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

详细部署说明请参考 [部署指南](docs/DEPLOYMENT.md)。

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

- 项目主页: [GitHub Repository](https://github.com/your-repo/ai-numerology-refactored)
- 问题反馈: [GitHub Issues](https://github.com/your-repo/ai-numerology-refactored/issues)
- 邮箱: your-email@example.com

---

**三算命** - 传承千年智慧，拥抱现代科技 🌟
