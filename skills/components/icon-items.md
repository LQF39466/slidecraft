# Icon Item Components

---

## `icon-item` — 图标+文字行

```yaml
- type: icon-item
  icon: "🧠"
  title: "标题文字"
  body: "说明文字"
  body_size: small    # small | body，默认 small
  gap: ".6rem"
```

一行：左侧圆形图标容器 + 右侧标题/说明。formal 主题下图标隐藏，文字保留（布局会稍有变化）。

**属性说明**：
- `icon`: emoji 字符或图标
- `title`: 标题文字，支持 md() 格式
- `body`: 说明文字，支持 md() 格式
- `body_size`: `small`（0.68rem）或 `body`（0.75rem）
- `gap`: 图标与文字之间的间距

---

## `icon-card` — 居中图标卡片

```yaml
- type: icon-card
  icon: "👀"
  title: "卡片标题"
  subtitle: "副标题"
```

文字居中，图标在上，适合在网格中展示分类项目（如功能特性列表）。

**属性说明**：
- `icon`: emoji 字符或图标
- `title`: 卡片标题，支持 md() 格式
- `subtitle`: 副标题，支持 md() 格式

---

## `icon-items-stack` — 批量图标行

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

**属性说明**：
- `gap`: 各 icon-item 之间的间距
- `margin_top`: 与上方元素的间距
- `items`: icon-item 数组，每个元素包含 `icon`、`title`、`body`、`body_size`

---

## 使用场景

| 场景 | 推荐组件 |
|------|---------|
| 功能/特性列表 | `icon-items-stack` inside `card` |
| 展示分类项目 | `icon-card` in grid |
| 单行图标+说明 | `icon-item` |

