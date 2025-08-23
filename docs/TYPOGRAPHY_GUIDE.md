# 神机阁字体规范指南

## 📖 概述

本指南定义了神机阁项目的统一字体规范系统，旨在解决项目中字体大小混乱的问题，建立一致的视觉层次和用户体验。

## 🎯 设计原则

1. **语义化命名** - 使用语义化的类名，如 `text-heading-lg` 而不是 `text-2xl`
2. **响应式优先** - 所有字体规范都考虑了移动端适配
3. **可访问性** - 确保足够的对比度和可读性
4. **一致性** - 统一的行高、字重和字间距规范
5. **中文优化** - 专门为中文内容优化的字体栈

## 📏 字体规范系统

### 🏆 显示级标题 (Display)
用于首页主标题和重要页面的超大标题

```css
.text-display-xl  /* 56px - 首页主标题 */
.text-display-lg  /* 48px - 重要页面标题 */
.text-display-md  /* 40px - 次要页面标题 */
```

**使用场景：**
- 首页 Hero 区域主标题
- 重要功能页面的主标题
- 营销页面的大标题

### 📝 标题系列 (Heading)
用于页面内容的层次化标题

```css
.text-heading-xl  /* 32px - H1 标题 */
.text-heading-lg  /* 28px - H2 标题 */
.text-heading-md  /* 24px - H3 标题 */
.text-heading-sm  /* 20px - H4 标题 */
.text-heading-xs  /* 18px - H5 标题 */
```

**使用场景：**
- 页面主标题 (H1)
- 章节标题 (H2-H3)
- 卡片标题 (H4-H5)
- 组件内部标题

### 📄 正文系列 (Body)
用于页面的主要内容文字

```css
.text-body-xl     /* 18px - 重要描述文字 */
.text-body-lg     /* 16px - 标准正文 (默认) */
.text-body-md     /* 14px - 次要正文 */
.text-body-sm     /* 12px - 辅助信息 */
```

**使用场景：**
- 重要的介绍文字 (body-xl)
- 标准正文内容 (body-lg)
- 卡片描述文字 (body-md)
- 提示信息、时间戳 (body-sm)

### 🏷️ 标签系列 (Label)
用于表单标签和小标签

```css
.text-label-lg    /* 14px - 表单标签 */
.text-label-md    /* 12px - 小标签 */
.text-label-sm    /* 11px - 微小标签 */
```

**使用场景：**
- 表单字段标签
- 状态标签
- 分类标签
- 徽章文字

### 🔘 按钮系列 (Button)
用于按钮内的文字

```css
.text-button-lg   /* 16px - 大按钮 */
.text-button-md   /* 14px - 标准按钮 */
.text-button-sm   /* 12px - 小按钮 */
```

**使用场景：**
- 主要操作按钮 (button-lg)
- 标准按钮 (button-md)
- 次要按钮和图标按钮 (button-sm)

## 🎨 字体族规范

### 中文字体栈
```css
.font-chinese
/* 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', 'Noto Sans SC', 'STHeiti', 'WenQuanYi Micro Hei', sans-serif */
```

### 中文衬线字体
```css
.font-chinese-serif
/* 'Noto Serif SC', 'STSong', 'SimSun', '宋体', serif */
```

### 英文字体
```css
.font-english
/* 'Inter', 'Helvetica Neue', 'Arial', sans-serif */
```

### 数字字体
```css
.font-numeric
/* 确保数字对齐的等宽字体 */
```

## 📱 响应式规范

所有字体规范都内置了响应式适配：

- **移动端 (≤768px)**: 字体大小适当缩小
- **超小屏 (≤480px)**: 进一步优化字体大小
- **桌面端 (>768px)**: 使用标准字体大小

## 🔧 使用方法

### 1. HTML 中使用
```html
<!-- 页面主标题 -->
<h1 class="text-heading-xl font-chinese text-red-600">神机阁</h1>

<!-- 卡片标题 -->
<h3 class="text-heading-sm font-chinese">八字命理</h3>

<!-- 正文内容 -->
<p class="text-body-lg font-chinese">这是标准正文内容</p>

<!-- 按钮文字 -->
<button class="text-button-md font-chinese">立即分析</button>
```

### 2. React 组件中使用
```jsx
// 推荐：使用语义化类名
<ChineseCardTitle className="text-heading-md font-chinese">
  十二宫位详解
</ChineseCardTitle>

// 避免：使用数字类名
<ChineseCardTitle className="text-xl">
  十二宫位详解
</ChineseCardTitle>
```

### 3. CSS 中使用
```css
/* 自定义组件样式 */
.custom-title {
  @apply text-heading-lg font-chinese font-semibold;
  color: var(--cinnabar-500);
}
```

## 🎯 迁移指南

### 常见替换映射

| 旧类名 | 新类名 | 用途 |
|--------|--------|------|
| `text-3xl` | `text-display-md` | 页面主标题 |
| `text-2xl` | `text-heading-xl` | 大标题 |
| `text-xl` | `text-heading-lg` | 中标题 |
| `text-lg` | `text-heading-md` | 小标题 |
| `text-base` | `text-body-lg` | 标准正文 |
| `text-sm` | `text-body-md` | 次要正文 |
| `text-xs` | `text-body-sm` | 辅助信息 |

### 迁移步骤

1. **识别用途** - 确定文字的语义用途（标题、正文、标签等）
2. **选择规范** - 根据用途选择对应的字体规范
3. **添加字体族** - 确保添加 `font-chinese` 类
4. **测试响应式** - 在不同设备上测试显示效果

## ✅ 最佳实践

### ✅ 推荐做法

```html
<!-- 语义化命名 -->
<h1 class="text-display-lg font-chinese">神机阁</h1>
<h2 class="text-heading-xl font-chinese">命理分析</h2>
<p class="text-body-lg font-chinese">专业的命理分析服务</p>
<button class="text-button-md font-chinese">开始分析</button>

<!-- 数字内容使用数字字体 -->
<span class="text-body-lg font-numeric">2024</span>

<!-- 特殊标题使用衬线字体 -->
<h1 class="text-display-xl font-chinese-serif">神机阁</h1>
```

### ❌ 避免做法

```html
<!-- 避免：混用数字类名 -->
<h1 class="text-4xl">标题</h1>
<p class="text-lg">正文</p>

<!-- 避免：忘记添加字体族 -->
<h1 class="text-heading-xl">标题</h1>

<!-- 避免：不合适的字体大小组合 -->
<button class="text-xs">按钮</button> <!-- 太小 -->
<p class="text-3xl">正文</p> <!-- 太大 -->
```

## 🔍 常见问题

### Q: 什么时候使用 display 系列？
A: 仅用于首页主标题和重要页面的超大标题，不要在普通内容中使用。

### Q: 如何选择合适的字体大小？
A: 根据内容的重要性和层次选择：
- 页面标题 → heading 系列
- 正文内容 → body 系列  
- 表单标签 → label 系列
- 按钮文字 → button 系列

### Q: 移动端需要特殊处理吗？
A: 不需要，所有字体规范都内置了响应式适配。

### Q: 可以自定义字体大小吗？
A: 不推荐。如果确实需要，请先考虑是否可以使用现有规范，或者提出新的规范需求。

## 📊 字体规范对照表

| 类名 | 桌面端 | 移动端 | 行高 | 字重 | 用途 |
|------|--------|--------|------|------|------|
| `text-display-xl` | 56px | 40px | 1.1 | 800 | 首页主标题 |
| `text-display-lg` | 48px | 36px | 1.1 | 700 | 重要页面标题 |
| `text-display-md` | 40px | 32px | 1.2 | 700 | 次要页面标题 |
| `text-heading-xl` | 32px | 28px | 1.25 | 600 | H1 标题 |
| `text-heading-lg` | 28px | 24px | 1.3 | 600 | H2 标题 |
| `text-heading-md` | 24px | 20px | 1.35 | 600 | H3 标题 |
| `text-heading-sm` | 20px | 18px | 1.4 | 600 | H4 标题 |
| `text-heading-xs` | 18px | 16px | 1.4 | 600 | H5 标题 |
| `text-body-xl` | 18px | 16px | 1.6 | 400 | 重要描述 |
| `text-body-lg` | 16px | 16px | 1.6 | 400 | 标准正文 |
| `text-body-md` | 14px | 14px | 1.6 | 400 | 次要正文 |
| `text-body-sm` | 12px | 12px | 1.5 | 400 | 辅助信息 |
| `text-label-lg` | 14px | 14px | 1.4 | 500 | 表单标签 |
| `text-label-md` | 12px | 12px | 1.4 | 500 | 小标签 |
| `text-label-sm` | 11px | 11px | 1.4 | 500 | 微小标签 |
| `text-button-lg` | 16px | 16px | 1.4 | 600 | 大按钮 |
| `text-button-md` | 14px | 14px | 1.4 | 600 | 标准按钮 |
| `text-button-sm` | 12px | 12px | 1.4 | 600 | 小按钮 |

---

**更新日期**: 2024年12月
**版本**: 1.0.0
**维护者**: 神机阁开发团队