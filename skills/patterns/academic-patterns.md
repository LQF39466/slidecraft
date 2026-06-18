# Academic Patterns

---

## 模式 A：消融实验表格 + 关键结论

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
            text: "ABLATION STUDY"
            color: "#60a5fa"
          - type: data-table
            margin_top: "0.4rem"
            columns:
              - label: "Method"
                key: method
                align: left
              - label: "AUC ↑"
                key: auc
                markings: true
                markings_order: desc
              - label: "Loss ↓"
                key: loss
                markings: true
                markings_order: asc
            rows:
              - method: "Baseline"
                auc: 0.7203
                loss: 0.50
              - method: "**Ours**"
                auc: 0.9124
                loss: 0.30
                _highlight: true
              - method: "w/o Module A"
                auc: 0.8521
                loss: 0.38
              - method: "w/o Module B"
                auc: 0.8891
                loss: 0.35
      - type: card
        accent: green
        children:
          - type: label
            text: "KEY FINDINGS"
            color: "#34d399"
          - type: icon-items-stack
            items:
              - icon: "🎯"
                title: "最优性能"
                body: "完整模型在所有指标上领先"
              - icon: "📊"
                title: "模块贡献"
                body: "Module A 贡献更大（+3.2% AUC）"
              - icon: "⚡"
                title: "效率"
                body: "推理速度保持 <50ms"
  - type: callout
    text: "**结论：** 两个模块均对最终性能有显著贡献，其中 Module A 的贡献更为关键。"
```

---

## 模式 B：方法对比（公式 + 表格 + 对比）

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
            text: "BASELINE METHOD"
            color: "#f87171"
          - type: text
            text: "**传统方法**"
            style: heading
          - type: formula
            text: "\\mathcal{L}_{base} = \\sum_{i} y_i \\log p_i"
          - type: text
            text: "使用交叉熵损失，未考虑样本难度。"
            style: body
      - type: arrow
      - type: card
        accent: blue
        children:
          - type: label
            text: "OUR METHOD"
            color: "#60a5fa"
          - type: text
            text: "**改进方法**"
            style: heading
          - type: formula
            text: "\\mathcal{L}_{ours} = \\sum_{i} w_i y_i \\log p_i"
          - type: text
            text: "引入自适应权重 $w_i$，关注难样本。"
            style: body
  - type: grid
    columns: 2
    gap: "0.75rem"
    margin_top: "0.6rem"
    items:
      - type: card
        accent: purple
        children:
          - type: label
            text: "ADVANTAGES"
            color: "#a78bfa"
          - type: icon-items-stack
            items:
              - icon: "📈"
                title: "性能提升"
                body: "AUC 提升 3.2%"
              - icon: "🎯"
                title: "收敛更快"
                body: "训练 epoch 减少 30%"
      - type: card
        accent: green
        children:
          - type: label
            text: "COMPLEXITY"
            color: "#34d399"
          - type: text
            text: "时间复杂度：$O(n \\log n)$"
            style: body
          - type: text
            text: "空间复杂度：$O(n)$"
            style: body
  - type: callout
    text: "**结论：** 改进方法在保持计算效率的同时，显著提升了模型性能。"
```

---

## 模式 C：多指标对比（带进度条可视化）

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
            text: "PERFORMANCE METRICS"
            color: "#60a5fa"
          - type: text
            text: "**模型性能对比**"
            style: heading
          - type: progress-bars-stack
            items:
              - value: 0.9124
                label: "AUC (Ours)"
                color: "#60a5fa"
              - value: 0.8521
                label: "AUC (Baseline)"
                color: "#818cf8"
              - value: 0.8891
                label: "AUC (Competitor)"
                color: "#a78bfa"
      - type: card
        accent: purple
        children:
          - type: label
            text: "EFFICIENCY"
            color: "#a78bfa"
          - type: text
            text: "**效率指标**"
            style: heading
          - type: progress-bars-stack
            items:
              - value: 0.95
                label: "Inference Speed"
                color: "#34d399"
              - value: 0.70
                label: "Memory Usage"
                color: "#fb923c"
              - value: 0.85
                label: "Training Time"
                color: "#60a5fa"
  - type: callout
    text: "**结论：** 模型在性能和效率之间取得了良好的平衡。"
```

---

## 模式 D：层级结构（模型架构展示）

```yaml
body:
  - type: card
    accent: blue
    children:
      - type: label
        text: "MODEL ARCHITECTURE"
        color: "#60a5fa"
      - type: text
        text: "**多层级处理流程**"
        style: heading
      - type: level-bars-stack
        margin_top: "0.6rem"
        items:
          - color: "#f87171"
            label: "输入层"
            text: "接收原始输入，进行预处理和特征提取"
          - color: "#fb923c"
            label: "编码层"
            text: "多头自注意力机制，捕获全局依赖"
          - color: "#a78bfa"
            label: "解码层"
            text: "交叉注意力，融合编码信息"
          - color: "#60a5fa"
            label: "输出层"
            text: "生成最终预测结果"
  - type: callout
    text: "**架构特点：** 采用 Transformer 结构，支持并行计算，训练效率高。"
```


