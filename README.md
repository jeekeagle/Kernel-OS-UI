# Jeek's Digital Garden

个人数字花园 — 一个极简的写作与展示空间。

## 特性

- **SPA 架构** — 页面切换无刷新，流畅体验
- **Markdown 写作** — 写 `.md` 文件，自动渲染成页面
- **时间线布局** — 按年份组织文章，一目了然
- **幻灯片模式** — 文章可配套全屏演示
- **Bold Signal 主题** — 深色背景 + 橙色强调，专业有力

## 目录结构

```
├── index.html              # 首页（SPA 入口）
├── vercel.json             # Vercel 部署配置
│
├── assets/
│   ├── css/style.css       # 主样式
│   └── js/app.js           # 路由 + 交互逻辑
│
├── posts/                  # 短内容 / 笔记
│   ├── posts.json          # 文章索引
│   └── *.md                # Markdown 文件
│
├── articles/               # 长文章 / 深度内容
│   ├── articles.json       # 文章索引
│   └── *.md                # Markdown 文件
│
└── slides/                 # 幻灯片
    └── *.html              # 全屏演示文稿
```

## 如何写作

### 添加新文章

1. 在 `articles/` 创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2024-03-12
tag: 思考
description: 一句话简介
---

# 正文开始

内容写在这里...
```

2. 在 `articles/articles.json` 添加文件名：

```json
["your-article-slug"]
```

**完成！** 文章会自动出现在首页时间线。

### 添加幻灯片

1. 在 `slides/` 创建 HTML 文件
2. 文章中会自动显示幻灯片入口

## 部署

### Vercel（推荐）

1. 推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 自动部署完成

### 本地预览

```bash
# 方式一：Python
python -m http.server 8080

# 方式二：Node.js
npx serve .
```

然后打开 `http://localhost:8080`

## 自定义

### 修改主题色

编辑 `assets/css/style.css` 中的 CSS 变量：

```css
:root {
  --bg: #0a0a0a;           /* 背景 */
  --fg: #ffffff;           /* 文字 */
  --accent: #ff6b35;       /* 强调色 */
  --muted: #666666;        /* 次要文字 */
  --card: #1a1a1a;         /* 卡片背景 */
  --border: #2a2a2a;       /* 边框 */
}
```

### 修改字体

更换 `index.html` 中的 Google Fonts 链接：

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

## 导航方式

- **键盘**：← → 箭头键
- **鼠标**：点击底部圆点
- **手机**：左右滑动

## License

MIT
