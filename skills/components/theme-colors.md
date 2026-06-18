# Theme Colors & Design System

---

## 三种主题对比

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

---

## formal 主题的额外变化

`formal` 在上述基础上还叠加了以下 CSS 覆盖，Agent 在使用该主题时必须考虑其影响：

- **图标全部隐藏**：`.icon-circle`、`.title-icon`、`.icon-card-icon` 均 `display:none`
  → 使用 `icon-item`、`emoji`、`icon-card` 组件时，图标不可见，布局仍保留文字
- **字号微调**：`.text-heading` → `0.92rem`；`.body` → `0.8rem`；`.small` → `0.73rem`
- **Section label 去色**：`section-label` 变为 `color-text-muted`，失去彩色效果
- **全局 8px 圆角**（cards、formula、badge、nav）
- **Callout 改为左边框引用样式**（无背景填充，左侧 3px 实线）

---

## 在 YAML 中引用主题色

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

## 颜色语义（CSS 变量）

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

**当必须写硬编码颜色时**（如 blob、label color、level-bar color），选择与主题匹配的 hex 值。

---

## Blob 配置

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

### 预设锚点（anchor）

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

### 实践原则

- 通常配置 2–3 个 blob，颜色互补（蓝+紫、绿+蓝、橙+紫等）
- 标题页可适当加大 size 和 opacity（强调氛围）
- 内容页保持克制，避免干扰阅读
- 同一演示文稿中 blob 颜色可与页面 accent 颜色呼应

---

## 字体系统

| 用途 | 字体 | 典型场景 |
|------|------|---------|
| 展示大标题 | Instrument Serif | title 页 h1，style:title |
| 正文 UI | Inter | 所有正文、说明、badge |
| 代码/公式 | JetBrains Mono | formula、code 组件 |

字体通过 CDN 加载（`fonts.font.im`），无需额外配置。

---

## 动画系统

- `.reveal` 类：透明度 0→1 + Y 轴 20px→0 的入场动画，延迟按元素顺序递增
- `card` 组件在 grid 内默认获得 `.reveal`（`reveal: true`）
- `grid` 内的 `card` 默认 reveal，`grid` 外的 `card` 默认不 reveal
- Blob 有持续浮动动画（`float-slow`/`float-drift`）
- 粒子系统：`interactive` 响应鼠标，`ambient` 自动漂浮

---

## 颜色分配原则

- 同一页面内多个 card 使用**不同 accent**，避免视觉单调
- badge `variant` 与 card `accent` 呼应：b1↔blue、b2↔purple、b3↔green、b4↔orange、b5↔red
- `label` 的 `color` 应与所在 `card` 的 `accent` 一致
- progress-bar 颜色可以在同系色内渐变（如蓝→靛→紫），反映数值梯度
- blob 颜色与该页主 accent 呼应

