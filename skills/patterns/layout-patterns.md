# Layout Patterns

---

## 内容类型索引

| 内容类型 | 推荐模式 |
|---------|---------|
| 并列概念（3项） | → 模式 1：三列卡片 |
| 前后对比 | → 模式 2：对比布局 |
| 方法流程（带公式）| → 模式 3：公式+说明两列 |
| 量化结果 | → 模式 6：进度条分组 |
| 数据展示 | → 模式 5：数据展示 |
| 主次内容 | → 模式 4：不等列 |
| 嵌套分类 | → 模式 7：嵌套网格 |

---

## 模式 1：三列卡片（信息并列）

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

---

## 模式 2：对比布局（带中间箭头）

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

---

## 模式 3：公式 + 说明（两列）

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

---

## 模式 4：不等列（主次内容）

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

---

## 模式 5：数据展示（表格 + 要点）

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

---

## 模式 6：进度条分组（KPI 展示）

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

---

## 模式 7：嵌套网格（card 内有 grid）

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

