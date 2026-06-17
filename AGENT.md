# SlideCraft — Agent Technical Reference

> 本文档面向 AI Agent，提供编写 `layout.yaml` 所需的全部规范信息，消除歧义，统一设计标准。

---

## 1. 系统概述

SlideCraft 将 YAML 文件编译为独立 HTML 演示文稿。

```
layout.yaml  →  compiler.js  →  renderer.js  →  components.js  →  index.html
                                     ↓
                               styles.js (主题 CSS/JS)
```

**关键路径约束**
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

## 3. 主题系统

### 3.1 三种主题对比

| 属性 | `dark` | `light` | `formal` |
|------|--------|---------|---------|
| 背景 | `#0d1117` | `#f8fafc` | `#ffffff` |
| 正文色 | `#e6edf3` | `#0f172a` | `#111827` |
| a1 蓝 | `#60a5fa` | `#2563eb` | `#1d4ed8` |
| a2 紫 | `#a78bfa` | `#7c3aed` | `#6d28d9` |
| a3 绿 | `#34d399` | `#059669` | `#065f46` |
| a4 橙 | `#fb923c` | `#ea580c` | `#b45309` |
| a5 红 | `#f87171` | `#dc2626` | `#b91c1c` |
| 适用场景 | 技术/学术报告、深色偏好 | 医疗/日常演示 | 正式学术/医院汇报 |

### 3.2 formal 主题的额外变化

`formal` 在上述基础上还叠加了以下 CSS 覆盖，Agent 在使用该主题时必须考虑其影响：

- **图标全部隐藏**：`.icon-circle`、`.title-icon`、`.icon-card-icon` 均 `display:none`
  → 使用 `icon-item`、`emoji`、`icon-card` 组件时，图标不可见，布局仍保留文字
- **字号微调**：`.text-heading` → `0.92rem`；`.body` → `0.8rem`；`.small` → `0.73rem`
- **Section label 去色**：`section-label` 变为 `color-text-muted`，失去彩色效果
- **全局 8px 圆角**（cards、formula、badge、nav）
- **Callout 改为左边框引用样式**（无背景填充，左侧 3px 实线）

### 3.3 在 YAML 中引用主题色

YAML 内部不能直接写主题名，颜色必须用**十六进制值**。按主题选择对应色值：

```yaml
# dark 主题下的蓝色
color: "#60a5fa"

# light/formal 主题下写同样效果用
color: "#2563eb"   # light
color: "#1d4ed8"   # formal
```

在 `extra_style` 中可以使用 CSS 变量：
```yaml
extra_style: "color:var(--color-accent-1);"  # 自动跟随主题
```

---

## 4. 幻灯片布局

### 4.1 `layout: title` — 标题页

居中全屏，适合首尾页。

```yaml
- layout: title
  # 背景
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
  # 粒子特效
  particles: interactive        # interactive | ambient | false
  # 图标（formal 主题下不可见）
  icon: "🪆"
  icon_animate: true            # 浮动动画，默认 true
  icon_size: "78px"             # 默认 78px
  # 顶部徽章
  badge:
    text: "会议名称"
    variant: b4                 # b1-b5
  # 标题
  title: "主标题文字"
  title_gradient: true          # 渐变文字，默认 true；false 则用纯色
  subtitle: "副标题 · 作者 · 日期"
  # 标签行
  tags:
    - text: "关键词一"
      variant: b1
    - text: "关键词二"
      variant: b2
  # 额外内容（标签行下方的附加组件）
  extra_content: []
```

**渲染顺序**：icon → badge → title → subtitle → tags → extra_content

### 4.2 `layout: content` — 内容页

标准演示内容页，含标题头部 + 正文区。

```yaml
- layout: content
  background:
    blobs: [...]
  particles: false              # 内容页通常 false，需要时用 ambient
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

**body 中包含 `image` 组件时**，系统自动切换为 flex-column 全高布局，使图片占满剩余空间。

---

## 5. 背景配置（blobs）

每张幻灯片可独立配置背景光晕。不配置时使用默认值（蓝色 top-right + 紫色 bottom-left）。

```yaml
background:
  blobs:
    - color: "#60a5fa"    # 十六进制颜色
      size: 380           # 直径（px），推荐 200–600
      opacity: 0.08       # 推荐 0.06–0.12；formal 主题适当降低
      anchor: top-right   # 使用预设锚点（推荐）
    - color: "#a78bfa"
      size: 290
      opacity: 0.07
      # 或使用精确坐标（不能与 anchor 混用）
      top: -80
      left: -60
```

**预设锚点（anchor）**：

| 锚点名 | 位置 |
|--------|------|
| `top-right` | 右上角（最常用） |
| `top-left` | 左上角 |
| `bottom-right` | 右下角 |
| `bottom-left` | 左下角（第二常用） |
| `center-left` | 左侧居中 |
| `center-right` | 右侧居中 |
| `top-center` | 顶部居中 |
| `bottom-center` | 底部居中 |

**实践原则**
- 通常配置 2–3 个 blob，颜色互补（蓝+紫、绿+蓝、橙+紫等）
- 标题页可适当加大 size 和 opacity（强调氛围）
- 内容页保持克制，避免干扰阅读
- 同一演示文稿中 blob 颜色可与页面 accent 颜色呼应

---

## 6. 组件目录

### 6.1 原子组件

#### `text` — 段落文本

```yaml
- type: text
  text: "支持 **粗体** 和 *斜体*，也可以写 <sub>HTML</sub>"
  style: body         # body | small | heading | title | default
  color: "#60a5fa"    # 可选，覆盖默认颜色
  weight: "700"       # 可选，font-weight
  margin: "0 0 .5rem" # 可选，CSS margin
  extra_style: ""     # 可选，附加 CSS
```

**各 style 的默认样式**：

| style | 字号 | 颜色 | 用途 |
|-------|------|------|------|
| `body` | 0.75rem | `textSec` | 正文说明 |
| `small` | 0.68rem | `textMuted` | 辅助说明、注释 |
| `heading` | 0.78rem | `text` | 卡片内小标题，加粗 |
| `title` | clamp(1.45rem,3vw,2.15rem) | `text` | 大标题，Instrument Serif |
| `default` | 继承 | 继承 | 原样输出，由 extra_style 控制 |

> **注意**：`style: heading` 时，`color` 参数被忽略，颜色固定为 `var(--color-text)`。若需要彩色小标题，改用 `style: default` + `extra_style`，或用 `label` 组件。

#### `label` — 节标签

```yaml
- type: label
  text: "SECTION LABEL"   # 自动 uppercase
  color: "#60a5fa"         # 可选，accent 颜色
```

小号全大写标签，通常放在卡片顶部，作为内容分类标识。formal 主题下颜色会被覆盖为 muted 色。

> **注意**：`label` 的 `text` **不经过** `md()` 处理，不支持 `**粗体**`、`$...$` 行内公式等格式。如需数学符号，改用 `text` 组件（`style: heading`）或直接写 Unicode 字符。

#### `badge` — 徽章

```yaml
- type: badge
  text: "标签文字"
  variant: b1   # b1=蓝 b2=紫 b3=绿 b4=橙 b5=红
```

内联徽章，通常在 `tag-row` 中批量使用，或在 header 中单独使用。

#### `formula` — 数学公式（KaTeX）

```yaml
- type: formula
  text: "\\mathcal{M}^* = \\arg\\min_\\mathcal{M} \\mathcal{L}"
  note: "可选的公式说明文字"    # 显示在公式块下方
  margin: "0 0 .5rem"
  extra_style: ""
```

使用 KaTeX 渲染 LaTeX 数学公式（`displayMode: true`，即居中块级）。LaTeX 反斜杠在 YAML 中需双写：`\\frac`、`\\sum` 等。

#### 行内公式（`$...$` 语法）

在任何经过 `md()` 处理的 `text` 字段中，可以用 `$...$` 包裹 LaTeX 表达式作为行内公式（`displayMode: false`）。KaTeX CSS 在编译时自动注入 `<head>`，无需手动引入。

```yaml
- type: text
  text: "损失厌恶系数 $\\lambda > 1$ 控制回答门槛 $p > \\frac{\\lambda}{1+\\lambda}$"
```

**YAML 转义注意**：在双引号字符串中，`\\` 会被解析为单个 `\\`（LaTeX 需要的反斜杠）。但 `\\r`、`\\n`、`\\t` 等是 YAML 转义序列，会被解释为特殊字符。因此：
- **推荐**：含 LaTeX 的字符串使用 **单引号**（无转义），反斜杠只写一次：`'$\\hat{r}_i$'`
- 或使用双引号，但确保 `\\` 不紧邻 `r`/`n`/`t`/`a`/`b`/`f`/`v` 等字母（会被解释为转义序列）

```yaml
# ✅ 正确：单引号，单反斜杠
text: '$\\hat{r}_i$ 对齐目标 $t_i$'

# ✅ 正确：双引号，双反斜杠，且不触发 YAML 转义
text: "$\\frac{\\lambda}{1+\\lambda}"

# ❌ 错误：双引号中 \\r 被解释为回车符
text: "$\\hat{r}_i$"   # 实际得到 $hat<CR>i$
```

> **适用范围**：`text`、`callout.text`、`icon-item.title`/`body`、`icon-card.title`/`subtitle`、`mini-card.label`/`text`、`level-bar.label`、`data-table` 所有单元格值及 `columns.label`、`header.title`、标题页 `title`/`subtitle` 均支持行内公式。`label`（节标签）、`badge`、`tags[].text`、`tag-row.tags[].text` **不支持**。

#### `code` — 代码块

```yaml
- type: code
  text: "def hello():\n    return 'world'"
  note: "可选说明"
  margin: "0"
  extra_style: ""
```

使用 `<pre><code>` 渲染，自动 HTML 转义，样式与 `formula` 相同（monospace 字体，formula 样式容器）。

#### `image` — 图片

```yaml
- type: image
  src: "my-image.png"   # 相对于 fig/ 目录的文件名
  accent: "blue"         # blue|purple|green|orange|red
```

图片从 `fig/<src>` 加载，渲染在白色卡片容器中，`object-fit: contain`。当 body 中包含此组件时，整个 body 区域自动切换为全高 flex 布局。

#### `arrow` — 箭头

```yaml
- type: arrow
  text: "⟶"   # 默认值
```

居中显示，专为 `grid: columns: "1fr auto 1fr"` 的对比布局设计（占 `auto` 列）。

#### `bar` — 渐变记忆条

```yaml
- type: bar
  labels:
    - "极快"
    - "中速"
    - "极慢"
```

固定渐变（红→橙→紫→蓝→绿），无法自定义颜色。适合展示连续谱系。

#### `emoji` — 大号表情

```yaml
- type: emoji
  icon: "🎉"
  animate: true     # 浮动动画，默认 true
  size: "78px"
  margin: ".8rem"   # bottom margin
```

#### `spacer` / `divider`

```yaml
- type: spacer
  height: "0.8rem"   # 默认值

- type: divider      # 无属性，细横线
```

#### `raw` — 原始 HTML

```yaml
- type: raw
  html: "<div style='...'>任意 HTML</div>"
```

直接注入 HTML，用于无法用现有组件实现的特殊需求。

---

### 6.2 复合组件

#### `card` — 玻璃卡片

```yaml
- type: card
  accent: blue          # blue|purple|green|orange|red|none；左边框颜色
  reveal: true          # 是否有出现动画：grid 内默认 true，外部默认 false
  height: "100%"        # 可选
  margin_top: ".65rem"  # 可选
  extra_style: ""       # 可选
  children:
    - type: label
      text: "类别"
      color: "#60a5fa"
    - type: text
      text: "**标题**"
      style: heading
    - type: text
      text: "说明内容"
      style: body
```

卡片是最核心的容器组件，使用玻璃态背景（`glassBg`）和边框（`glassBorder`），带 hover 上浮动画。`children` 按垂直方向排列，`justify-content: center`。

**accent 颜色对照**（左侧 3px 边框）：

| accent | dark 主题色 | light 主题色 | formal 主题色 |
|--------|------------|-------------|--------------|
| `blue` | `#60a5fa` | `#2563eb` | `#1d4ed8` |
| `purple` | `#a78bfa` | `#7c3aed` | `#6d28d9` |
| `green` | `#34d399` | `#059669` | `#065f46` |
| `orange` | `#fb923c` | `#ea580c` | `#b45309` |
| `red` | `#f87171` | `#dc2626` | `#b91c1c` |

#### `mini-card` — 小色块

```yaml
- type: mini-card
  color: "#60a5fa"   # 背景色（7% 透明）和文字色
  label: "类别标签"
  text: "说明文字"
  align: "left"      # left | center，默认 left
  padding: ".6rem"
```

比 card 更紧凑的彩色小块，适合在卡片内部作为子分类或标注。

#### `level-bar` — 层级条

```yaml
- type: level-bar
  color: "#f87171"
  label: "快层（token 级）"
  text: "处理眼前信息，反应快，但不稳定。"
  padding: ".55rem .75rem"
```

带彩色左侧视觉重心的行条，适合展示层级结构、流程步骤或分类说明。背景为 `color` 的 7% 透明版本。

#### `icon-item` — 图标+文字行

```yaml
- type: icon-item
  icon: "🧠"
  title: "标题文字"
  body: "说明文字"
  body_size: small    # small | body，默认 small
  gap: ".6rem"
```

一行：左侧圆形图标容器 + 右侧标题/说明。formal 主题下图标隐藏，文字保留（布局会稍有变化）。

#### `icon-card` — 居中图标卡片

```yaml
- type: icon-card
  icon: "👀"
  title: "卡片标题"
  subtitle: "副标题"
```

文字居中，图标在上，适合在网格中展示分类项目（如功能特性列表）。

#### `callout` — 底部要点框

```yaml
- type: callout
  text: "**重点：** 说明文字。"
  icon: "💡"                # 可选，默认 💡
  # 或用 children 放置复杂内容：
  children:
    - type: text
      text: "..."
  extra_style: ""
```

通常作为 body 数组的**最后一个组件**，用于总结页面要点。带有左侧强调边框和图标指示器，字体比正文稍大以突出总结地位。在 dark/light 主题中为渐变玻璃态背景；formal 主题中变为左边框引用样式。

#### `tag-row` — 标签行

```yaml
- type: tag-row
  tags:
    - text: "标签一"
      variant: b1
    - text: "标签二"
      variant: b2
  justify: center     # start | center | end | flex-start，默认 center
  wrap: true
  gap: ".7rem"
  margin_top: ".5rem"
```

#### `progress-bar` — 进度条

```yaml
- type: progress-bar
  value: 0.8470       # 0–1，自动转为百分比宽度
  label: "术后输血相关事件"
  color: "#60a5fa"    # 条的颜色
```

左侧标签，右侧显示精确数值（`value.toFixed(4)`），下方为彩色进度条。

---

### 6.3 批量快捷组件（Stack）

以下三个组件是其单个版本的批量渲染快捷方式，减少 YAML 嵌套层级：

#### `icon-items-stack`

```yaml
- type: icon-items-stack
  gap: ".6rem"         # 默认 .6rem
  margin_top: ".5rem"   # 默认 .5rem；设为 "0" 可取消与上方元素的间距
  items:
    - icon: "⚡"
      title: "标题一"
      body: "说明一"
      body_size: small
    - icon: "🧩"
      title: "标题二"
      body: "说明二"
```

等价于在 flex-column 容器中放多个 `icon-item`。默认带 `margin-top`，与上方文本保持间距。

#### `level-bars-stack`

```yaml
- type: level-bars-stack
  gap: ".45rem"        # 默认 .45rem
  margin_top: ".4rem"   # 默认 .4rem
  items:
    - color: "#f87171"
      label: "快层"
      text: "说明"
    - color: "#a78bfa"
      label: "中层"
      text: "说明"
```

等价于在 flex-column 容器中放多个 `level-bar`。默认带 `margin-top`。

#### `progress-bars-stack`

```yaml
- type: progress-bars-stack
  gap: ".35rem"        # 默认 .35rem
  margin_top: ".4rem"   # 默认 .4rem
  items:
    - value: 0.8470
      label: "指标一"
      color: "#60a5fa"
    - value: 0.7921
      label: "指标二"
      color: "#818cf8"
```

等价于在 flex-column 容器中放多个 `progress-bar`。默认带 `margin-top`。

---

### 6.4 布局组件

#### `grid` — 网格布局

```yaml
- type: grid
  columns: 2              # 见下方规格说明
  gap: "0.75rem"          # 默认 0.75rem
  align: stretch          # align-items：start | center | end | stretch
  margin_top: "0.8rem"    # 可选
  reveal: false           # true=整体动画 false=子项各自 reveal
  items:
    - type: card
      ...
```

**columns 规格**：

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

**reveal 行为**：
- `reveal: false`（默认）：每个子组件有 `.reveal` 类则各自动画
- `reveal: true`：整个网格作为一个单元动画进入

#### `flex` — 弹性布局

```yaml
- type: flex
  direction: row         # row | column，默认 row
  gap: ".6rem"
  align: center          # align-items，默认 center
  justify: flex-start    # justify-content，默认 flex-start
  wrap: false
  margin_top: "0"
  children:
    - type: badge
      text: "Tag"
      variant: b1
```

---

### 6.5 `data-table` — 学术三线表

```yaml
- type: data-table
  caption: "Table 1: Test-set results. Bold = best."
  caption_side: top          # top（默认） | bottom
  font_size: ".72rem"        # 可选，覆盖表格字号
  margin_top: "0.4rem"
  columns:
    - label: "Method"
      key: method
      align: left            # left（首列默认）| center | right
    - label: "AUC ↑"
      key: auc
      decimals: 4            # 数值显示小数位数
      heatmap: true          # 列级 heatmap
      heatmap_color: a1      # a1–a5 或 "#rrggbb"
      heatmap_low: 0.7       # 映射范围最小值（默认列最小值）
      heatmap_high: 0.95     # 映射范围最大值（默认列最大值）
      heatmap_reverse: false # 反转梯度
      markings: true         # 列级自动标注（最优加粗，次优下划线）
      markings_order: desc   # desc=越大越好（默认） | asc=越小越好
  rows:
    - method: "Baseline"
      auc: 0.7203
    - method: "**Ours**"          # 支持 markdown
      auc: {v: 0.9124, bold: true}
      _highlight: true             # 整行高亮
    - method: "Competitor"
      auc: {v: 0.8982, underline: true}
```

**行级 heatmap / markings**：在行数据上设置以下属性，对该行所有数值列生效：

```yaml
rows:
  - method: "AUC ↑"
    baseline: 0.72
    ours: 0.91
    competitor: 0.89
    _row_heatmap: true              # 行级 heatmap
    _row_heatmap_color: a3          # 可选，默认 a1
    _row_heatmap_reverse: false     # 可选
    _row_markings: true             # 行级自动标注
    _row_markings_order: desc       # desc=越大越好 | asc=越小越好
```

**单元格对象格式**：

| 属性 | 类型 | 效果 |
|------|------|------|
| `v` | any | 显示值 |
| `bold` | boolean | 粗体 |
| `underline` | boolean | 点线下划线 |
| `accent` | boolean | 主题 a1 色 + 粗体 |
| `color` | string | 自定义颜色 |

**heatmap_color 对应主题色**（`a1`–`a5`）：

| 代号 | dark | light | formal |
|------|------|-------|--------|
| `a1` | `#60a5fa` 蓝 | `#2563eb` | `#1d4ed8` |
| `a2` | `#a78bfa` 紫 | `#7c3aed` | `#6d28d9` |
| `a3` | `#34d399` 绿 | `#059669` | `#065f46` |
| `a4` | `#fb923c` 橙 | `#ea580c` | `#b45309` |
| `a5` | `#f87171` 红 | `#dc2626` | `#b91c1c` |

热力背景透明度范围：dark `[0.07, 0.38]`，light `[0.06, 0.30]`，formal `[0.05, 0.22]`。

> **注意**：所有单元格值（包括数值）均经过 `md()` 处理，因此支持 `$...$` 行内公式和 `**粗体**`。例如 `role: "$x_f^{wrong}$，压低错误置信度"` 会正确渲染行内数学符号。

**学术三线表标注规范**：

- **`bold`（加粗）**：该列/行**最优**值
- **`underline`（下划线）**：该列/行**次优**值
- **并列处理**：相同数值会获得相同标注（如 `[9.9, 9.9, 8.8, 8.8, 7.7]` → 前两个加粗，中间两个下划线）
- **不标注**：无明确方向性的指标不使用 markings
- **不使用 heatmap**：当同一列中不同指标方向混杂时，改用 bold/underline 标注

**推荐用法**：使用 `markings: true` + `markings_order` 让系统自动标注，无需手动写 `{v: ..., bold: true}`：

```yaml
columns:
  - label: "AUC ↑"
    key: auc
    markings: true
    markings_order: desc      # 越大越好
  - label: "Loss ↓"
    key: loss
    markings: true
    markings_order: asc       # 越小越好
rows:
  - policy: "Baseline"
    auc: 0.7203
    loss: 0.50
  - policy: "**Ours**"        # 系统自动标注最优/次优
    auc: 0.9124
    loss: 0.30
    _highlight: true
  - policy: "Competitor"
    auc: 0.8982
    loss: 0.35
```

---

## 7. 文本格式化

所有 `text` 字段支持内联 Markdown（`md()` 函数处理）：

| 语法 | 渲染结果 |
|------|----------|
| `$...$` | 行内 KaTeX 数学公式 |
| `**粗体**` | `<strong>` |
| `*斜体*` | `<em>` |
| `<sub>下标</sub>` | 原样通过 |
| `<sup>上标</sup>` | 原样通过 |
| `<br>` | 换行 |
| 其他 HTML 标签 | 原样通过 |

处理顺序：`$...$` 行内公式 → `**粗体**` → `*斜体*`（先处理公式，避免 KaTeX 输出被 Markdown 正则误伤）。

**支持 `md()` 的组件**：`text`、`callout.text`、`icon-item.title`/`body`、`icon-card.title`/`subtitle`、`mini-card.label`/`text`、`level-bar.label`、`progress-bar.label`、`data-table.columns.label`/`caption`、`data-table` 所有单元格值（含数值和 `{v:...}` 对象）、`header.title`（内容页 h2）、标题页 `title`/`subtitle`。

**不支持 `md()` 的组件**：`label`（节标签，有 `text-transform: uppercase`）、`badge`（徽章，纯文本显示）、`tags[].text`（标题页标签行，badge 渲染）、`tag-row.tags[].text`（内容页标签行，同样 badge 渲染）。

**LaTeX 公式（`formula` 组件）**：使用标准 LaTeX 语法，YAML 中反斜杠必须双写：
```yaml
text: "\\frac{1}{n}\\sum_{i=1}^{n} x_i"
```

**行内公式**：在支持 `md()` 的文本字段中用 `$...$` 包裹，详见 §6.1 `formula` 组件的「行内公式」小节。

---

## 8. 设计系统

### 8.1 颜色语义

始终使用 CSS 变量引用语义色（在 `extra_style` 中），避免硬编码主题色：

```css
var(--color-text)           /* 主文字色 */
var(--color-text-secondary) /* 次要文字色 */
var(--color-text-muted)     /* 辅助/弱化文字色 */
var(--color-accent-1)       /* a1 主强调色（蓝） */
var(--color-accent-2)       /* a2 紫 */
var(--color-accent-3)       /* a3 绿 */
var(--color-accent-4)       /* a4 橙 */
var(--color-glass-bg)       /* 玻璃态背景 */
var(--color-glass-border)   /* 玻璃态边框 */
var(--color-bg)             /* 页面背景 */
```

**当必须写硬编码颜色时**（如 blob、label color、level-bar color），选择与主题匹配的 hex 值（见第 3 节）。

### 8.2 字体系统

| 用途 | 字体 | 典型场景 |
|------|------|---------|
| 展示大标题 | Instrument Serif | title 页 h1，style:title |
| 正文 UI | Inter | 所有正文、说明、badge |
| 代码/公式 | JetBrains Mono | formula、code 组件 |

字体通过 CDN 加载（`fonts.font.im`），无需额外配置。

### 8.3 间距约定

| 用途 | 推荐值 |
|------|--------|
| Grid gap | `0.75rem`（标准）、`0.5rem`（紧凑）、`1rem`（宽松） |
| Stack gap | icon-items: `.6rem`、level-bars: `.45rem`、progress-bars: `.35rem` |
| Card 内 text margin | `0 0 .5rem`（段落间）、`0 0 .3rem`（紧凑） |
| 网格 margin_top | `0.6rem`–`0.8rem` |
| Callout 前的 spacer | 通常无需显式添加，callout 自带视觉分隔 |

### 8.4 动画系统

- `.reveal` 类：透明度 0→1 + Y 轴 20px→0 的入场动画，延迟按元素顺序递增
- `card` 组件在 grid 内默认获得 `.reveal`（`reveal: true`）
- `grid` 内的 `card` 默认 reveal，`grid` 外的 `card` 默认不 reveal
- Blob 有持续浮动动画（`float-slow`/`float-drift`）
- 粒子系统：`interactive` 响应鼠标，`ambient` 自动漂浮

---

## 9. 布局模式手册

以下是经过验证的常用布局模式，直接复用。

### 9.1 三列卡片（信息并列）

```yaml
body:
  - type: grid
    columns: 3
    gap: "0.75rem"
    items:
      - type: card
        accent: blue
        children:
          - type: label
            text: "CATEGORY A"
            color: "#60a5fa"
          - type: text
            text: "**标题**"
            style: heading
          - type: icon-items-stack
            items:
              - icon: "🧩"
                title: "要点"
                body: "说明"
      - type: card
        accent: purple
        children: [...]
      - type: card
        accent: green
        children: [...]
  - type: callout
    text: "总结语。"
```

### 9.2 对比布局（带中间箭头）

```yaml
body:
  - type: grid
    columns: "1fr auto 1fr"
    gap: "0.7rem"
    align: stretch
    items:
      - type: card
        accent: red
        children:
          - type: label
            text: "BEFORE"
            color: "#f87171"
          - type: text
            text: "**传统方法**"
            style: heading
          - type: text
            text: "说明文字。"
            style: body
      - type: arrow
      - type: card
        accent: blue
        children:
          - type: label
            text: "AFTER"
            color: "#60a5fa"
          - type: text
            text: "**改进方法**"
            style: heading
          - type: text
            text: "说明文字。"
            style: body
  - type: callout
    text: "**结论：** 说明文字。"
```

### 9.3 公式 + 说明（两列）

```yaml
body:
  - type: grid
    columns: 2
    gap: "1rem"
    items:
      - type: card
        accent: blue
        children:
          - type: label
            text: "定义"
            color: "#60a5fa"
          - type: text
            text: "**数学定义**"
            style: heading
          - type: text
            text: "说明文字。"
            style: body
            margin: "0 0 .5rem"
          - type: formula
            text: "f(x) = \\sum_{i} w_i x_i"
      - type: card
        accent: purple
        children:
          - type: label
            text: "解释"
            color: "#a78bfa"
          - type: text
            text: "**直觉理解**"
            style: heading
          - type: text
            text: "说明文字。"
            style: body
```

### 9.4 不等列（主次内容）

```yaml
- type: grid
  columns: [1.3, 0.7]   # 或 "1.1fr .9fr"
  gap: "0.75rem"
  align: stretch
  items:
    - type: card          # 主要内容（宽）
      accent: blue
      children: [...]
    - type: card          # 次要内容（窄）
      accent: green
      children: [...]
```

### 9.5 数据展示（表格 + 要点）

```yaml
body:
  - type: grid
    columns: [1.3, 0.7]
    gap: "0.75rem"
    align: stretch
    items:
      - type: card
        accent: blue
        children:
          - type: label
            text: "Results"
            color: "var(--color-accent-1)"
          - type: data-table
            margin_top: "0.4rem"
            columns: [...]
            rows: [...]
      - type: card
        accent: green
        children:
          - type: label
            text: "Key Takeaways"
            color: "var(--color-accent-3)"
          - type: icon-items-stack
            items: [...]
```

### 9.6 进度条分组（KPI 展示）

```yaml
body:
  - type: grid
    columns: 2
    gap: "0.75rem"
    items:
      - type: card
        accent: blue
        children:
          - type: label
            text: "HIGH PERFORMANCE"
            color: "#60a5fa"
          - type: text
            text: "**AUC > 0.75**"
            style: heading
          - type: progress-bars-stack
            items:
              - value: 0.8470
                label: "指标 A"
                color: "#60a5fa"
              - value: 0.7921
                label: "指标 B"
                color: "#818cf8"
      - type: card
        accent: purple
        children: [...]
  - type: callout
    text: "结论说明。"
```

### 9.7 嵌套网格（card 内有 grid）

```yaml
- type: card
  accent: red
  children:
    - type: label
      text: "对比"
      color: "#f87171"
    - type: text
      text: "**标题**"
      style: heading
    - type: text
      text: "说明。"
      style: body
      margin: "0 0 .5rem"
    - type: grid           # 卡片内嵌套网格
      columns: 2
      gap: "0.5rem"
      items:
        - type: mini-card
          color: "#f87171"
          label: "选项 A"
          text: "说明"
        - type: mini-card
          color: "#a78bfa"
          label: "选项 B"
          text: "说明"
```

---

## 10. Agent 工作规范

### 10.1 新建演示文稿流程

1. 创建目录（如 `examples/my-topic/`）
2. 若有图片，创建 `examples/my-topic/fig/` 并放入图片文件
3. 编写 `examples/my-topic/layout.yaml`
4. 编译：`node bin/slidecraft.js examples/my-topic/ [--theme ...]`

### 10.2 内容到结构的映射原则

| 内容类型 | 推荐组件组合 |
|---------|------------|
| 并列概念（3项） | `grid columns:3` + `card` + `icon-items-stack` |
| 前后对比 | `grid columns:"1fr auto 1fr"` + `card`+`arrow`+`card` |
| 方法流程（带公式） | `grid columns:2` + `card`+`formula` |
| 量化结果展示 | `progress-bars-stack` 或 `data-table` + `heatmap` |
| 实验对比表格 | `data-table` + `markings: true` + `markings_order`（自动标注最优/次优） |
| 层级结构 | `level-bars-stack` |
| 功能/特性列表 | `icon-items-stack` inside `card` |
| 关键词/标签 | `tag-row` 或 title page `tags` |
| 单页总结 | `callout` 作为 body 最后一个组件 |

### 10.3 颜色分配原则

- 同一页面内多个 card 使用**不同 accent**，避免视觉单调
- badge `variant` 与 card `accent` 呼应：b1↔blue、b2↔purple、b3↔green、b4↔orange、b5↔red
- `label` 的 `color` 应与所在 `card` 的 `accent` 一致
- progress-bar 颜色可以在同系色内渐变（如蓝→靛→紫），反映数值梯度
- blob 颜色与该页主 accent 呼应

### 10.4 主题选择决策

- **学术论文/技术报告**（含深色偏好）→ `dark`
- **医疗/日常汇报**（白色背景需求）→ `light`
- **正式学术发表/医院汇报/纯文字场景** → `formal`

在 `formal` 主题下：
- 不要依赖图标传达信息（图标不可见），用文字标签补充
- `callout` 左边框样式更适合用于引用/强调，语义上应为关键结论
- blob 颜色使用 formal 主题的 a1–a5 色值（更深沉）

### 10.5 禁止事项

- **禁止**在 `columns` 为 `"1fr auto 1fr"` 的 grid 中除首尾之外的位置放 `arrow` 以外的独立组件作为中间列（auto 宽度不适合宽内容）
- **禁止**在 `formula` 组件中使用非 LaTeX 语法（不是 KaTeX 支持的命令会降级显示）
- **禁止**在 `image` 组件的 `src` 中写完整路径，只写文件名（系统自动拼接 `fig/`）
- **禁止**在 card 的 `children` 中再嵌套 `card`（使用 `mini-card` 代替）
- **禁止**同时使用 `anchor` 和坐标属性（`top`/`right`/`bottom`/`left`）配置同一个 blob
- **禁止**使用不存在的组件类型（会渲染为注释）

### 10.6 质量检查清单

在提交 layout.yaml 前检查：

- [ ] 每个 card 的 `label` 颜色与 `accent` 匹配
- [ ] `data-table` 的 column `key` 与 rows 中的字段名完全一致
- [ ] `data-table` 使用 `markings: true` + `markings_order` 自动标注，而非手动 `{v:..., bold:true}`
- [ ] LaTeX 公式中的 `\\` 均已双写
- [ ] 行内公式 `$...$` 中的 LaTeX 不含 YAML 转义冲突（`\\r`、`\\n`、`\\t` 等）；有疑问时用单引号包裹
- [ ] `$...$` 行内公式只用在支持 `md()` 的组件中，不在 `label` 或 `badge` 中使用
- [ ] `data-table` 中 `bold` 只用于该列最优值，`underline` 只用于次优值，无方向性指标不标注
- [ ] `data-table` 中 `heatmap` 只用于单方向指标列，不用于混杂方向列
- [ ] `grid items` 数量与 `columns` 对应（避免错位）
- [ ] `formal` 主题下不依赖图标传达信息
- [ ] 每页 body 最多有一个 `callout`，且放在最后
- [ ] `image` 组件的 `src` 文件实际存在于 `fig/` 目录

---

## 11. 完整示例参考

官方演示位于 `demo/layout.yaml`，包含 5 页综合展示：

| 页码 | 内容 | 展示的组件/特性 |
|------|------|----------------|
| 1 | Title | title 布局、particles、icon、badge、tags |
| 2 | Cards & Stacks | grid、card、label、text、icon-items-stack、level-bars-stack、mini-card |
| 3 | Data Table | data-table、heatmap、markings、_highlight、callout |
| 4 | Comparison | grid（1fr auto 1fr）、arrow、formula |
| 5 | More Components | progress-bars-stack、bar、emoji、tag-row |

构建命令：`node bin/slidecraft.js demo`

> `examples/` 目录包含开发过程中的测试用例，已加入 `.gitignore`，不随发行版发布。

---

## 12. 扩展：新增组件规范

如需向 `src/components.js` 添加新组件：

```js
// 1. 在 components.js 中注册
register("my-component", (node, ctx = {}) => {
  const { prop1 = "default", prop2, extra_style = "" } = node;
  // 使用已有 CSS 类保持一致性
  // 使用 md(text) 处理文字
  // 使用 hexToRgba(color, alpha) 计算透明色
  // 使用 cssVal(v) 处理 rem 值
  return `<div class="card reveal" style="${extra_style}">...</div>`;
});
```

**设计要求**：
- 复用现有 CSS 类（`card`、`small`、`body`、`reveal` 等），不引入新的全局 CSS
- 若需要全局样式，在 `src/styles.js` 的 `buildCustomCss()` 函数中添加，并保证 dark/light/formal 三套主题均兼容
- 新组件的颜色应使用 CSS 变量或由调用方传入 hex，不硬编码主题色
- 在本文档的第 6 节补充新组件的文档

---

*文档版本：基于 SlideCraft v1.0.0 | 最后更新：2026-06-17*
