# SlideCraft ✨

> 写 YAML，出精美幻灯片。让 AI 帮你写，你负责喝咖啡。

SlideCraft 是一个轻量级的幻灯片编译器——你用 YAML 描述内容，它帮你生成带粒子动画、玻璃态卡片、学术三线表的 HTML 演示文稿。不需要拖拽，不需要调样式，甚至不需要自己写 YAML。

## 快速开始

```bash
# 安装
git clone https://github.com/LQF39466/slidecraft.git && cd slidecraft
npm install

# 看看 demo 长什么样
npm run demo
# 打开 demo/index.html，完事

# 编译你自己的演示
node bin/slidecraft.js my-slides/

# 导出 PPTX（可选）
npm install puppeteer pptxgenjs
node bin/slidecraft.js my-slides/ --pptx          # 截图模式
node bin/slidecraft.js my-slides/ --pptx-native   # 可编辑模式
```

## 真正的玩法：让 AI 帮你写

SlideCraft 的 YAML 格式是专门为人机协作设计的。你不需要记住任何组件名或属性——把 `AGENT.md` 扔给你的 AI 助手，它就知道怎么写了。

### 工作流

```
你："帮我做一个关于 XXX 的 5 页演示，包含标题页、三个要点卡片、一个数据表格"
         ↓
AI 读取 AGENT.md → 理解全部组件和布局规则 → 生成 layout.yaml
         ↓
你：node bin/slidecraft.js my-slides/
         ↓
浏览器打开，漂亮幻灯片就出来了 🎉
```

就这么简单。你负责说要什么，AI 负责怎么写。

### AGENT.md 与 Harness 机制

`AGENT.md` 是 SlideCraft 的"设计圣经"，一份给 AI 看的核心约束文档。SlideCraft 采用分层文档架构：

```
AGENT.md              # 核心约束（每次必须读取）
└── skills/           # 详细文档（按需检索）
    ├── components/   # 组件属性详情
    └── patterns/     # 布局模式模板
```

`AGENT.md` 包含：
- **全部 17 个组件**的用法和属性
- **3 套主题**（dark / light / formal）的选择指南
- **7 种布局模式**的模板（三列卡片、对比布局、数据展示……）
- **设计规范**（颜色分配、间距约定、禁止事项）
- **质量检查清单**
- **新组件开发规范**——如果现有组件不够用，AI 可以基于设计规范自行扩展

`skills/` 目录包含组件和布局的详细文档，AI 在需要时按需检索，减少 context 占用。

### 使用 Agent 工具

SlideCraft 可以与多种 AI Agent 工具配合使用：

| 工具 | 配置方式 |
|------|----------|
| **Claude Code** | `claude-code --project .` |
| **Codex** | `codex --project .` |
| **OpenCode** | `opencode --project .` |
| **Cursor / Windsurf** | 项目根目录放置 `AGENT.md`，IDE 自动识别 |

AI 会自动读取 `AGENT.md`，检索 `skills/` 目录，生成 `layout.yaml` 并运行编译。

### 一些好用的 prompt 模板

```
# 从零开始
"帮我创建一个关于 [主题] 的演示，用 dark 主题，5 页左右"

# 基于已有资料
"参考 materials/ 目录下的论文和数据，帮我做成 slides"

# 修改现有演示
"打开 my-slides/layout.yaml，把第三页的表格加上 heatmap"

# 换主题
"把我的演示换成 formal 主题，适合学术汇报用"
```

### 素材引用

不需要把内容粘贴到 prompt 里。把你的论文、数据、笔记放在项目目录下，告诉 AI 去读就好：

```
my-slides/
├── layout.yaml          # AI 生成的幻灯片
├── materials/            # 你的素材
│   ├── paper.pdf
│   ├── results.csv
│   └── notes.md
└── fig/                  # 图片（image 组件自动引用）
    └── architecture.png
```

AI 会自动读取这些文件，提取关键内容，编排成幻灯片。你甚至可以说"把 results.csv 里的数据做成表格"——它真的能做到。

### 自演进：AI 可以扩展组件

`AGENT.md` 不只是组件手册，它还包含**组件开发规范**。当现有组件满足不了你的需求时，AI 可以：

1. 读懂 `AGENT.md` 的扩展规范
2. 在 `src/components.js` 中注册新组件
3. 在 `src/styles.js` 中添加配套样式（兼容三套主题）
4. 自动更新 `AGENT.md` 补充文档

比如你可以说："我需要一个时间线组件，展示项目里程碑"——AI 会基于现有设计语言帮你从零实现。

### AI 会帮你处理的细节

你完全不需要关心这些，但如果你好奇：

- 🎨 **颜色分配**：不同卡片自动使用不同强调色
- 📊 **数据表格**：heatmap 渐变、最优值加粗、次优值下划线——全自动
- 📐 **布局适配**：grid 列宽、卡片间距、响应式排版
- ✨ **动画**：入场动画、粒子背景、浮动效果
- 📝 **文本格式**：Markdown 粗体/斜体、LaTeX 公式（`$...$`）

## 主题

SlideCraft 有三套主题，一个 `--theme` 参数切换：

| 主题 | 风格 | 适合场景 |
|------|------|---------|
| `dark` | 深色玻璃态 | 技术分享、日常演示 |
| `light` | 浅色清新 | 医疗、教育、明亮场景 |
| `formal` | 无衬线极简 | 学术汇报、正式场合 |

```bash
node bin/slidecraft.js my-slides/ --theme formal
```

## 项目结构

```
slidecraft/
├── bin/slidecraft.js     # CLI
├── src/
│   ├── compiler.js       # YAML → HTML 编译器
│   ├── components.js     # 组件渲染（含 data-table）
│   ├── styles.js         # 主题 & CSS
│   └── ...
├── demo/                 # 官方 demo（5 页综合展示）
├── AGENT.md              # AI 助手的核心约束文档
├── skills/               # 组件和布局的详细文档
│   ├── components/       # 组件属性详情
│   └── patterns/         # 布局模式模板
├── harness/              # 记忆系统（可选）
└── package.json
```
