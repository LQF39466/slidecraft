# Card & Container Components

---

## `card` — 玻璃卡片

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

**reveal 行为**：
- `reveal: false`（默认）：每个子组件有 `.reveal` 类则各自动画
- `reveal: true`：整个网格作为一个单元动画进入
- grid 内的 card 默认 reveal，grid 外的 card 默认不 reveal

---

## `mini-card` — 小色块

```yaml
- type: mini-card
  color: "#60a5fa"   # 背景色（7% 透明）和文字色
  label: "类别标签"
  text: "说明文字"
  align: "left"      # left | center，默认 left
  padding: ".6rem"
```

比 card 更紧凑的彩色小块，适合在卡片内部作为子分类或标注。

---

## `level-bar` — 层级条

```yaml
- type: level-bar
  color: "#f87171"
  label: "快层（token 级）"
  text: "处理眼前信息，反应快，但不稳定。"
  padding: ".55rem .75rem"
```

带彩色左侧视觉重心的行条，适合展示层级结构、流程步骤或分类说明。背景为 `color` 的 7% 透明版本。

---

## `level-bars-stack` — 批量层级条

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

---

## `callout` — 底部要点框

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

**使用规则**：
- 每页 body 最多有一个 `callout`
- 放在 body 最后一个位置

---

## 布局组件：grid

```yaml
- type: grid
  columns: 2              # 数字 | 数组 | 字符串
  gap: "0.75rem"          # 默认 0.75rem
  align: stretch          # align-items：start | center | end | stretch
  margin_top: "0.8rem"    # 可选
  reveal: false           # true=整体动画 false=子项各自 reveal
  items:
    - type: card
      ...
```

**间距约定**：
- Grid gap: `0.75rem`（标准）、`0.5rem`（紧凑）、`1rem`（宽松）
- Card 内 text margin: `0 0 .5rem`（段落间）、`0 0 .3rem`（紧凑）
- 网格 margin_top: `0.6rem`–`0.8rem`

