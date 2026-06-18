# Data Table

---

## 基础格式

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

---

## heatmap 参数

**列级 heatmap**：在 `columns` 中设置 `heatmap: true`

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `heatmap` | 启用列级 heatmap | `false` |
| `heatmap_color` | 颜色代号或 hex | `a1` |
| `heatmap_low` | 映射范围最小值 | 列最小值 |
| `heatmap_high` | 映射范围最大值 | 列最大值 |
| `heatmap_reverse` | 反转梯度 | `false` |

**行级 heatmap**：在行数据上设置属性，对该行所有数值列生效

```yaml
rows:
  - method: "AUC ↑"
    baseline: 0.72
    ours: 0.91
    competitor: 0.89
    _row_heatmap: true              # 行级 heatmap
    _row_heatmap_color: a3          # 可选，默认 a1
    _row_heatmap_reverse: false     # 可选
```

**heatmap_color 对应主题色**（`a1`–`a5`）：

| 代号 | dark | light | formal |
|------|------|-------|--------|
| `a1` | `#60a5fa` 蓝 | `#2563eb` | `#1d4ed8` |
| `a2` | `#a78bfa` 紫 | `#7c3aed` | `#6d28d9` |
| `a3` | `#34d399` 绿 | `#059669` | `#065f46` |
| `a4` | `#fb923c` 橙 | `#ea580c` | `#b45309` |
| `a5` | `#f87171` 红 | `#dc2626` | `#b91c1c` |

热力背景透明度范围：dark `[0.07, 0.38]`，light `[0.06, 0.30]`，formal `[0.05, 0.22]`。

---

## markings 自动标注

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

**行级 markings**：在行数据上设置属性

```yaml
rows:
  - method: "AUC ↑"
    baseline: 0.72
    ours: 0.91
    competitor: 0.89
    _row_markings: true             # 行级自动标注
    _row_markings_order: desc       # desc=越大越好 | asc=越小越好
```

**学术三线表标注规范**：

- **`bold`（加粗）**：该列/行**最优**值
- **`underline`（下划线）**：该列/行**次优**值
- **并列处理**：相同数值会获得相同标注（如 `[9.9, 9.9, 8.8, 8.8, 7.7]` → 前两个加粗，中间两个下划线）
- **不标注**：无明确方向性的指标不使用 markings
- **不使用 heatmap**：当同一列中不同指标方向混杂时，改用 bold/underline 标注

---

## 单元格对象格式

| 属性 | 类型 | 效果 |
|------|------|------|
| `v` | any | 显示值 |
| `bold` | boolean | 粗体 |
| `underline` | boolean | 点线下划线 |
| `accent` | boolean | 主题 a1 色 + 粗体 |
| `color` | string | 自定义颜色 |

> **注意**：所有单元格值（包括数值）均经过 `md()` 处理，因此支持 `$...$` 行内公式和 `**粗体**`。

---

## 使用决策

- 使用 `markings: true` + `markings_order` 代替手动 bold/underline
- 单方向指标列才使用 heatmap，混杂方向改用 markings
- 实验对比表格：`data-table` + `markings: true` + `markings_order`（自动标注最优/次优）

