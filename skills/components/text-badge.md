# Text, Badge & Related Components

---

## `text` — 段落文本

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

---

## `label` — 节标签

```yaml
- type: label
  text: "SECTION LABEL"   # 自动 uppercase
  color: "#60a5fa"         # 可选，accent 颜色
```

小号全大写标签，通常放在卡片顶部，作为内容分类标识。formal 主题下颜色会被覆盖为 muted 色。

> **注意**：`label` 的 `text` **不经过** `md()` 处理，不支持 `**粗体**`、`$...$` 行内公式等格式。如需数学符号，改用 `text` 组件（`style: heading`）或直接写 Unicode 字符。

---

## `badge` — 徽章

```yaml
- type: badge
  text: "标签文字"
  variant: b1   # b1=蓝 b2=紫 b3=绿 b4=橙 b5=红
```

内联徽章，通常在 `tag-row` 中批量使用，或在 header 中单独使用。

> **注意**：`badge` 的 `text` **不支持** md() 格式。

---

## `tag-row` — 标签行

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

> **注意**：`tag-row.tags[].text` **不支持** md() 格式。

---

## `progress-bar` — 进度条

```yaml
- type: progress-bar
  value: 0.8470       # 0–1，自动转为百分比宽度
  label: "术后输血相关事件"
  color: "#60a5fa"    # 条的颜色
```

左侧标签，右侧显示精确数值（`value.toFixed(4)`），下方为彩色进度条。

---

## `progress-bars-stack` — 批量进度条

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

## 文本格式化（md() 函数）

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

---

## 内容到结构的映射原则

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

