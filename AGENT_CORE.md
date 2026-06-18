# SlideCraft

## 1. 系统概述

SlideCraft 将 YAML 文件编译为独立 HTML 演示文稿。

```
layout.yaml  →  compiler.js  →  renderer.js  →  components.js  →  index.html
                                     ↓
                               styles.js (主题 CSS/JS)
```

- 每个演示文稿是一个**目录**，包含 `layout.yaml`，图片放在子目录 `fig/`
- 编译命令：`node bin/slidecraft.js <目录路径> [--theme dark|light|formal]`
- 默认主题：`dark`；输出：`<目录>/index.html`

---

## 2. YAML 顶层结构

```yaml
meta:
  title: "演示标题"        # 浏览器标签页标题
  lang: "zh-CN"           # HTML lang 属性，英文用 "en"

slides:
  - layout: title         # 标题页
    ...
  - layout: content       # 内容页（默认）
    ...
```

`meta` 和 `slides` 是仅有的两个顶层键。`slides` 是数组，顺序即页面顺序。

---

## 3. 幻灯片布局

### 3.1 `layout: title` — 标题页

居中全屏，适合首尾页。

```yaml
- layout: title
  background:
    blobs:
      - color: "#60a5fa"
        size: 540
        opacity: 0.12
        anchor: top-right
      - color: "#a78bfa"
        size: 420
        opacity: 0.10
        anchor: bottom-left
  particles: interactive        # interactive | ambient | false
  icon: "🪆"
  icon_animate: true
  icon_size: "78px"
  badge:
    text: "会议名称"
    variant: b4
  title: "主标题文字"
  title_gradient: true
  subtitle: "副标题 · 作者 · 日期"
  tags:
    - text: "关键词一"
      variant: b1
    - text: "关键词二"
      variant: b2
  extra_content: []
```

**渲染顺序**：icon → badge → title → subtitle → tags → extra_content

### 3.2 `layout: content` — 内容页

```yaml
- layout: content
  background:
    blobs: [...]
  particles: false
  header:
    badge:
      text: "章节标签"
      variant: b1
    title: "幻灯片标题"
  body:
    - type: grid
      ...
    - type: callout
      ...
```

**渲染顺序**：header（badge + h2 title）→ body（组件列表）

**body 中包含 `image` 组件时**，系统自动切换为 flex-column 全高布局。

---

## 4. 组件索引表

| 组件名 | 描述 | Skill 文件 |
|--------|------|-----------|
| `text` | 段落文本，支持 md() | 见下方 md() 约束 |
| `label` | 节标签，**不支持** md() | `skills/components/text-badge.md` |
| `badge` | 徽章，**不支持** md() | `skills/components/text-badge.md` |
| `formula` | KaTeX 数学公式块 | `skills/components/formula-code.md` |
| `code` | 代码块 | `skills/components/formula-code.md` |
| `image` | 图片（从 fig/ 加载） | 见下方禁止事项 |
| `arrow` | 箭头（对比布局专用） | 无需查阅 |
| `bar` | 渐变记忆条 | 无需查阅 |
| `emoji` | 大号表情 | 无需查阅 |
| `spacer` / `divider` | 间距 / 分隔线 | 无需查阅 |
| `raw` | 原始 HTML | 无需查阅 |
| `card` | 玻璃卡片容器 | `skills/components/card-containers.md` |
| `mini-card` | 小色块 | `skills/components/card-containers.md` |
| `level-bar` | 层级条 | `skills/components/card-containers.md` |
| `callout` | 底部要点框 | `skills/components/card-containers.md` |
| `icon-item` | 图标+文字行 | `skills/components/icon-items.md` |
| `icon-card` | 居中图标卡片 | `skills/components/icon-items.md` |
| `icon-items-stack` | 批量图标行 | `skills/components/icon-items.md` |
| `data-table` | 学术三线表 | `skills/components/data-table.md` |
| `tag-row` | 标签行 | `skills/components/text-badge.md` |
| `progress-bar` | 进度条 | `skills/components/text-badge.md` |
| `progress-bars-stack` | 批量进度条 | `skills/components/text-badge.md` |
| `level-bars-stack` | 批量层级条 | `skills/components/card-containers.md` |
| `grid` | 网格布局 | 见下方 grid 语法 |
| `flex` | 弹性布局 | 无需查阅 |

---

## 5. md() 支持范围

**支持 `md()` 的组件**：`text`、`callout.text`、`icon-item.title`/`body`、`icon-card.title`/`subtitle`、`mini-card.label`/`text`、`level-bar.label`、`progress-bar.label`、`data-table` 所有单元格值及 `columns.label`、`header.title`、标题页 `title`/`subtitle`。

**不支持 `md()` 的组件**（违反时静默失败，无报错）：
- `label`（节标签，有 `text-transform: uppercase`）
- `badge`（徽章，纯文本显示）
- `tags[].text`（标题页标签行，badge 渲染）
- `tag-row.tags[].text`（内容页标签行，同样 badge 渲染）

---

## 6. grid columns 语法

| 写法 | 结果 | 适用场景 |
|------|------|---------|
| `2` | `repeat(2, 1fr)` | 等宽两列 |
| `3` | `repeat(3, 1fr)` | 等宽三列 |
| `[1.05, 0.95]` | `1.05fr .95fr` | 微调比例 |
| `[1.3, 0.7]` | `1.3fr .7fr` | 明显不等宽 |
| `[1.1, 0.9]` | `1.1fr .9fr` | 轻微偏重 |
| `"1fr auto 1fr"` | 原样 | 带箭头的对比布局 |
| `"1fr 1fr 1fr"` | 三等列 | 同 `3` |

> **重要**：`align` 在卡片等高场景用 `stretch`，内容高度差异大时用 `start`。

---

## 7. formal 主题图标隐藏警告

`formal` 主题下，`.icon-circle`、`.title-icon`、`.icon-card-icon` 均 `display:none`。

使用 `icon-item`、`emoji`、`icon-card` 组件时，图标不可见，布局仍保留文字。**不要依赖图标传达信息**。

---

## 8. 全部禁止事项

- **禁止**在 `columns` 为 `"1fr auto 1fr"` 的 grid 中除首尾之外的位置放 `arrow` 以外的独立组件
- **禁止**在 `formula` 组件中使用非 LaTeX 语法
- **禁止**在 `image` 组件的 `src` 中写完整路径，只写文件名（系统自动拼接 `fig/`）
- **禁止**在 card 的 `children` 中再嵌套 `card`（使用 `mini-card` 代替）
- **禁止**同时使用 `anchor` 和坐标属性（`top`/`right`/`bottom`/`left`）配置同一个 blob
- **禁止**使用不存在的组件类型（会渲染为注释）

---

## 9. 主题选择决策

- **学术论文/技术报告**（含深色偏好）→ `dark`
- **医疗/日常汇报**（白色背景需求）→ `light`
- **正式学术发表/医院汇报/纯文字场景** → `formal`

---

## 10. 质量检查清单

- [ ] `data-table` 的 column `key` 与 rows 中的字段名完全一致
- [ ] `$...$` 行内公式只用在支持 `md()` 的组件中，不在 `label` 或 `badge` 中使用
- [ ] `grid items` 数量与 `columns` 对应（避免错位）
- [ ] `formal` 主题下不依赖图标传达信息
- [ ] 每页 body 最多有一个 `callout`，且放在最后
- [ ] `image` 组件的 `src` 文件实际存在于 `fig/` 目录

---

## 11. 何时检索 Skill

- 使用任何组件前，如果对其**属性不确定**，检索对应 skill 文件
- 使用 `data-table` 时，**必须**检索 `skills/components/data-table.md`
- 使用 `formal` 主题时，**必须**检索 `skills/components/theme-colors.md`
- 需要布局参考时，检索 `skills/patterns/layout-patterns.md`


