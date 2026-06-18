# Formula & Code

---

## `formula` — 数学公式（KaTeX）

```yaml
- type: formula
  text: "\\mathcal{M}^* = \\arg\\min_\\mathcal{M} \\mathcal{L}"
  note: "可选的公式说明文字"    # 显示在公式块下方
  margin: "0 0 .5rem"
  extra_style: ""
```

使用 KaTeX 渲染 LaTeX 数学公式（`displayMode: true`，即居中块级）。LaTeX 反斜杠在 YAML 中需双写：`\\frac`、`\\sum` 等。

---

## `code` — 代码块

```yaml
- type: code
  text: "def hello():\n    return 'world'"
  note: "可选说明"
  margin: "0"
  extra_style: ""
```

使用 `<pre><code>` 渲染，自动 HTML 转义，样式与 `formula` 相同（monospace 字体，formula 样式容器）。

---

## 行内公式（`$...$` 语法）

在任何经过 `md()` 处理的 `text` 字段中，可以用 `$...$` 包裹 LaTeX 表达式作为行内公式（`displayMode: false`）。KaTeX CSS 在编译时自动注入 `<head>`，无需手动引入。

```yaml
- type: text
  text: "损失厌恶系数 $\\lambda > 1$ 控制回答门槛 $p > \\frac{\\lambda}{1+\\lambda}$"
```

### YAML 转义注意

在双引号字符串中，`\\` 会被解析为单个 `\\`（LaTeX 需要的反斜杠）。但 `\\r`、`\\n`、`\\t` 等是 YAML 转义序列，会被解释为特殊字符。因此：

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

### 适用范围

**支持行内公式的组件**：`text`、`callout.text`、`icon-item.title`/`body`、`icon-card.title`/`subtitle`、`mini-card.label`/`text`、`level-bar.label`、`data-table` 所有单元格值及 `columns.label`、`header.title`、标题页 `title`/`subtitle`。

**不支持行内公式的组件**：`label`（节标签）、`badge`、`tags[].text`、`tag-row.tags[].text`。

---

## LaTeX 公式（`formula` 组件）

使用标准 LaTeX 语法，YAML 中反斜杠必须双写：

```yaml
text: "\\frac{1}{n}\\sum_{i=1}^{n} x_i"
```

---

## 使用决策

- 需要居中显示的独立公式 → `formula` 组件
- 需要在文本中嵌入的数学符号 → `$...$` 行内公式
- 代码展示 → `code` 组件

